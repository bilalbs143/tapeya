import Foundation
import Capacitor
import HaishinKit
import AVFoundation

/**
 * Self-serve mobile broadcast — camera capture + RTMP publish via HaishinKit.
 * See LIVE_STREAM_MOBILE_BROADCAST.md's "iOS — Swift, HaishinKit-based" section.
 *
 * Targets the stable `HaishinKit ~> 2.0` CocoaPod (verified against the 2.0.0 tag's API
 * reference at docs.haishinkit.com/swift/2.0.0/ — not the unreleased multi-module `main`
 * branch, which restructures RTMP support into a separate `RTMPHaishinKit` target).
 * If the installed pod version has drifted, the compiler errors here should be small and
 * mechanical (renamed methods/properties), not architectural.
 *
 * Compositing: MTHKView is inserted below the Capacitor webview so floating JS controls
 * stay visible on top of full-bleed camera preview.
 */
@objc(TapeyaBroadcastPlugin)
public class TapeyaBroadcastPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "TapeyaBroadcastPlugin"
    public let jsName = "TapeyaBroadcast"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "requestPermissions", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "startPreview", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "updatePreviewLayout", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stopPreview", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "switchCamera", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "toggleMute", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "startBroadcast", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stopBroadcast", returnType: CAPPluginReturnPromise),
    ]

    /** Reconnect contract from the doc: 2s → 4s → 8s → 16s → 30s, 5 attempts before `error`. */
    private static let reconnectDelaysSeconds: [TimeInterval] = [2, 4, 8, 16, 30]

    private static weak var sharedInstance: TapeyaBroadcastPlugin?

    private let mixer = MediaMixer()
    private var connection: RTMPConnection?
    private var stream: RTMPStream?
    private var previewView: MTHKView?
    private var currentPosition: AVCaptureDevice.Position = .front
    /** True once `startPreview` has run for this go-live session — see `startPreview`. */
    private var hasStartedPreviewOnce = false
    private var isMuted = false

    private var connectionStatusTask: Task<Void, Never>?
    private var streamStatusTask: Task<Void, Never>?
    private var reconnectTask: Task<Void, Never>?
    private var maxDurationTimer: Timer?

    private var reconnectAttempt = 0
    private var isEnding = false
    private var lastRtmpUrl: String?
    private var lastStreamKey: String?
    private var bitrateStrategy: TapeyaBroadcastBitRateStrategy?

    public override func load() {
        TapeyaBroadcastPlugin.sharedInstance = self
    }

    // MARK: - Permissions

    // CAPPlugin already declares requestPermissions(_:) as part of Capacitor's standard
    // permissions pattern — override it rather than redeclaring a colliding selector.
    @objc override public func requestPermissions(_ call: CAPPluginCall) {
        AVCaptureDevice.requestAccess(for: .video) { cameraGranted in
            AVCaptureDevice.requestAccess(for: .audio) { micGranted in
                call.resolve([
                    "camera": cameraGranted ? "granted" : "denied",
                    "microphone": micGranted ? "granted" : "denied",
                ])
            }
        }
    }

    // MARK: - Preview

    @objc func startPreview(_ call: CAPPluginCall) {
        let frame = frameFromCall(call)
        // Go-live opens on the front camera only the *first* time this session — flip is
        // opt-in via switchCamera. A later startPreview call in the same session (e.g. a
        // layout-resync fallback racing with go-live) must not undo the user's chosen camera.
        if !hasStartedPreviewOnce {
            currentPosition = .front
        }
        hasStartedPreviewOnce = true
        let targetPosition = currentPosition

        Task {
            do {
                try await self.ensureCameraPosition(targetPosition)
                guard let microphone = AVCaptureDevice.default(for: .audio) else {
                    call.reject("Microphone unavailable")
                    return
                }
                try await self.mixer.attachAudio(microphone)
            } catch {
                call.reject("Failed to attach camera/microphone: \(error.localizedDescription)")
                return
            }

            await MainActor.run {
                self.attachPreviewView(frame: frame)
                self.setIdleTimerDisabled(true)
            }

            if let view = self.previewView {
                await self.mixer.addOutput(view)
            }
            await self.mixer.startRunning()

            call.resolve(["started": true])
        }
    }

    /** Reposition an existing preview without re-attaching camera/microphone. */
    @objc func updatePreviewLayout(_ call: CAPPluginCall) {
        let frame = frameFromCall(call)
        Task { @MainActor in
            guard self.previewView != nil else {
                call.reject("Preview not started")
                return
            }
            self.attachPreviewView(frame: frame)
            call.resolve(["updated": true])
        }
    }

    @objc func stopPreview(_ call: CAPPluginCall) {
        hasStartedPreviewOnce = false
        Task {
            await self.mixer.stopRunning()
            if let view = self.previewView {
                await self.mixer.removeOutput(view)
            }
            await MainActor.run {
                self.previewView?.removeFromSuperview()
                self.setWebViewTransparent(false)
                if self.stream == nil {
                    self.setIdleTimerDisabled(false)
                }
            }
            call.resolve(["stopped": true])
        }
    }

    @objc func switchCamera(_ call: CAPPluginCall) {
        let nextPosition: AVCaptureDevice.Position = currentPosition == .back ? .front : .back

        guard let camera = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: nextPosition) else {
            // Simulator / single-camera devices: no opposite camera — resolve as no-op.
            call.resolve(["switched": false, "reason": "unavailable"])
            return
        }

        Task {
            do {
                try await self.mixer.attachVideo(camera, track: 0) { unit in
                    unit.isVideoMirrored = nextPosition == .front
                }
                self.currentPosition = nextPosition
                call.resolve(["switched": true])
            } catch {
                call.reject("Failed to switch camera: \(error.localizedDescription)")
            }
        }
    }

    @objc func toggleMute(_ call: CAPPluginCall) {
        let muted = call.getBool("muted") ?? !isMuted
        isMuted = muted

        Task {
            var settings = await self.mixer.audioMixerSettings
            var track = settings.tracks[0] ?? .init()
            track.isMuted = muted
            settings.tracks[0] = track
            await self.mixer.setAudioMixerSettings(settings)
            call.resolve(["muted": muted])
        }
    }

    // MARK: - Broadcast

    @objc func startBroadcast(_ call: CAPPluginCall) {
        guard let rtmpUrl = call.getString("rtmpUrl"), let streamKey = call.getString("streamKey") else {
            call.reject("rtmpUrl and streamKey are required")
            return
        }
        let maxDurationSeconds = call.getDouble("maxDurationSeconds") ?? 7200

        lastRtmpUrl = rtmpUrl
        lastStreamKey = streamKey
        isEnding = false
        reconnectAttempt = 0

        Task {
            do {
                try await self.connectAndPublish(rtmpUrl: rtmpUrl, streamKey: streamKey)
                await MainActor.run { self.setIdleTimerDisabled(true) }
                self.scheduleMaxDurationTimer(seconds: maxDurationSeconds)
                call.resolve()
            } catch {
                self.notifyListeners("broadcastStateChanged", data: ["state": "error", "message": error.localizedDescription])
                call.reject("Failed to start broadcast: \(error.localizedDescription)")
            }
        }
    }

    @objc func stopBroadcast(_ call: CAPPluginCall) {
        isEnding = true
        cancelMaxDurationTimer()
        cancelReconnect()

        Task {
            await self.teardownConnection()
            await MainActor.run { self.setIdleTimerDisabled(false) }
            self.notifyListeners("broadcastStateChanged", data: ["state": "ended"])
            call.resolve(["stopped": true])
        }
    }

    /**
     * (Re)connects and publishes. `RTMPConnection` instances are not reusable once closed
     * (see HaishinKit/HaishinKit.swift#785), so every attempt — including retries — gets a
     * fresh connection and stream.
     */
    private func connectAndPublish(rtmpUrl: String, streamKey: String) async throws {
        if let oldStream = stream {
            await mixer.removeOutput(oldStream)
        }
        connectionStatusTask?.cancel()
        streamStatusTask?.cancel()
        try? await connection?.close()

        let connection = RTMPConnection()
        self.connection = connection

        let stream = RTMPStream(connection: connection)
        self.stream = stream

        // Re-assert the camera the user selected right before publishing, as a safety net.
        try await ensureCameraPosition(currentPosition)

        await mixer.addOutput(stream)

        let strategy = TapeyaBroadcastBitRateStrategy { [weak self] bitrateKbps, fps, droppedFrames, networkQuality in
            self?.notifyListeners("broadcastStats", data: [
                "bitrateKbps": bitrateKbps,
                "fps": fps,
                "droppedFrames": droppedFrames,
                "networkQuality": networkQuality,
            ])
        }
        bitrateStrategy = strategy
        await stream.setBitrateStorategy(strategy)
        await stream.setVideoSettings(Self.initialVideoSettings())

        observeConnectionStatus(connection)
        observeStreamStatus(stream)

        if reconnectAttempt == 0 {
            notifyListeners("broadcastStateChanged", data: ["state": "connecting"])
        }

        _ = try await connection.connect(rtmpUrl)
        _ = try await stream.publish(streamKey)
    }

    private func teardownConnection() async {
        connectionStatusTask?.cancel()
        streamStatusTask?.cancel()

        if let stream = self.stream {
            await stream.setBitrateStorategy(Optional<TapeyaBroadcastBitRateStrategy>.none)
            _ = try? await stream.close()
            await mixer.removeOutput(stream)
        }
        try? await connection?.close()

        bitrateStrategy = nil

        stream = nil
        connection = nil
    }

    private static func initialVideoSettings() -> VideoCodecSettings {
        // Portrait encode to match full-bleed go-live UI (Android uses 1080×1920).
        VideoCodecSettings(
            videoSize: CGSize(width: 1080, height: 1920),
            bitRate: 2_500_000
        )
    }

    // MARK: - Status observation

    private func observeConnectionStatus(_ connection: RTMPConnection) {
        connectionStatusTask = Task { [weak self] in
            for await status in await connection.status {
                guard let self, !Task.isCancelled else { break }
                self.handleConnectionStatus(status)
            }
        }
    }

    private func observeStreamStatus(_ stream: RTMPStream) {
        streamStatusTask = Task { [weak self] in
            for await status in await stream.status {
                guard let self, !Task.isCancelled else { break }
                self.handleStreamStatus(status)
            }
        }
    }

    private func handleConnectionStatus(_ status: RTMPStatus) {
        switch status.code {
        case RTMPConnection.Code.connectClosed.rawValue,
             RTMPConnection.Code.connectFailed.rawValue,
             RTMPConnection.Code.connectRejected.rawValue,
             RTMPConnection.Code.connectAppshutdown.rawValue,
             RTMPConnection.Code.connectNetworkChange.rawValue,
             RTMPConnection.Code.connectIdleTimeOut.rawValue:
            handleUnexpectedDisconnect()
        default:
            break
        }
    }

    private func handleStreamStatus(_ status: RTMPStatus) {
        switch status.code {
        case RTMPStream.Code.publishStart.rawValue:
            reconnectAttempt = 0
            cancelReconnect()
            notifyListeners("broadcastStateChanged", data: ["state": "live"])
        case RTMPStream.Code.publishBadName.rawValue:
            notifyListeners("broadcastStateChanged", data: ["state": "error", "reason": "bad_name"])
        case RTMPStream.Code.unpublishSuccess.rawValue:
            break // expected on our own stopBroadcast()/teardownConnection()
        case RTMPStream.Code.connectClosed.rawValue,
             RTMPStream.Code.connectFailed.rawValue,
             RTMPStream.Code.failed.rawValue:
            handleUnexpectedDisconnect()
        default:
            break
        }
    }

    private func handleUnexpectedDisconnect() {
        guard !isEnding else { return }
        guard let rtmpUrl = lastRtmpUrl, let streamKey = lastStreamKey else { return }

        guard reconnectAttempt < TapeyaBroadcastPlugin.reconnectDelaysSeconds.count else {
            notifyListeners("broadcastStateChanged", data: ["state": "error", "reason": "reconnect_exhausted"])
            return
        }

        notifyListeners("broadcastStateChanged", data: ["state": "reconnecting"])
        let delay = TapeyaBroadcastPlugin.reconnectDelaysSeconds[reconnectAttempt]
        reconnectAttempt += 1

        reconnectTask?.cancel()
        reconnectTask = Task { [weak self] in
            try? await Task.sleep(nanoseconds: UInt64(delay * 1_000_000_000))
            guard let self, !Task.isCancelled, !self.isEnding else { return }

            do {
                try await self.connectAndPublish(rtmpUrl: rtmpUrl, streamKey: streamKey)
            } catch {
                self.handleUnexpectedDisconnect()
            }
        }
    }

    private func cancelReconnect() {
        reconnectTask?.cancel()
        reconnectTask = nil
    }

    // MARK: - Max duration enforcement (client-side; server-side backstop is
    // EndExpiredBroadcasts — see LiveStreamService::SELF_SERVE_MAX_DURATION_SECONDS)

    private func scheduleMaxDurationTimer(seconds: Double) {
        cancelMaxDurationTimer()
        maxDurationTimer = Timer.scheduledTimer(withTimeInterval: seconds, repeats: false) { [weak self] _ in
            guard let self else { return }
            self.isEnding = true
            self.cancelReconnect()
            Task {
                await self.teardownConnection()
                self.notifyListeners("broadcastStateChanged", data: ["state": "ended", "reason": "max_duration"])
            }
        }
    }

    private func cancelMaxDurationTimer() {
        maxDurationTimer?.invalidate()
        maxDurationTimer = nil
    }

    // MARK: - Backgrounding (called from AppDelegate.applicationDidEnterBackground)

    /**
     * iOS suspends camera capture when the app backgrounds — no special broadcast
     * entitlement pursued in v1. Gracefully end and let the app show the "you left" modal.
     */
    @objc static func handleAppDidEnterBackground() {
        guard let instance = sharedInstance, instance.stream != nil else { return }

        instance.isEnding = true
        instance.cancelMaxDurationTimer()
        instance.cancelReconnect()

        Task {
            await instance.teardownConnection()
            await MainActor.run { instance.setIdleTimerDisabled(false) }
            instance.notifyListeners("broadcastStateChanged", data: ["state": "ended", "reason": "backgrounded"])
        }
    }

    // MARK: - Preview view compositing (mirrors YoutubeStreamOverlayPlugin's attach/applyLayout)

    /** Keep the screen on for the whole preview/broadcast session — no tap-to-wake. */
    @MainActor
    private func setIdleTimerDisabled(_ disabled: Bool) {
        UIApplication.shared.isIdleTimerDisabled = disabled
    }

    /** Re-bind video capture to the requested facing (no silent back-camera fallback). */
    private func ensureCameraPosition(_ position: AVCaptureDevice.Position) async throws {
        guard let camera = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: position) else {
            throw NSError(domain: "TapeyaBroadcast", code: 1, userInfo: [NSLocalizedDescriptionKey: "Camera unavailable"])
        }

        try await mixer.attachVideo(camera, track: 0) { unit in
            unit.isVideoMirrored = camera.position == .front
        }
        currentPosition = camera.position
    }

    private func attachPreviewView(frame: CGRect) {
        guard let hostView = bridge?.viewController?.view else { return }

        let view = previewView ?? MTHKView(frame: .zero)
        view.videoGravity = .resizeAspectFill
        view.isUserInteractionEnabled = false
        previewView = view

        if let capWebView = bridge?.webView {
            let targetParent = capWebView.superview ?? hostView
            if view.superview !== targetParent {
                view.removeFromSuperview()
                targetParent.insertSubview(view, belowSubview: capWebView)
            } else {
                targetParent.insertSubview(view, belowSubview: capWebView)
            }
            setWebViewTransparent(true)
        } else if view.superview !== hostView {
            view.removeFromSuperview()
            hostView.addSubview(view)
        }

        guard frame.width > 0, frame.height > 0 else { return }
        view.transform = .identity
        view.bounds = CGRect(origin: .zero, size: frame.size)
        view.center = CGPoint(x: frame.midX, y: frame.midY)
    }

    private func setWebViewTransparent(_ transparent: Bool) {
        guard let webView = bridge?.webView else { return }

        if transparent {
            webView.isOpaque = false
            webView.backgroundColor = .clear
            webView.scrollView.isOpaque = false
            webView.scrollView.backgroundColor = .clear
            webView.layer.backgroundColor = UIColor.clear.cgColor
            webView.scrollView.layer.backgroundColor = UIColor.clear.cgColor
            if #available(iOS 15.0, *) {
                webView.underPageBackgroundColor = .clear
            }
            return
        }

        webView.isOpaque = true
        webView.backgroundColor = .black
        webView.scrollView.isOpaque = true
        webView.scrollView.backgroundColor = .black
        webView.layer.backgroundColor = UIColor.black.cgColor
        webView.scrollView.layer.backgroundColor = UIColor.black.cgColor
        if #available(iOS 15.0, *) {
            webView.underPageBackgroundColor = .black
        }
    }

    private func frameFromCall(_ call: CAPPluginCall) -> CGRect {
        let x = CGFloat(call.getFloat("x") ?? 0)
        let y = CGFloat(call.getFloat("y") ?? 0)
        let width = max(CGFloat(call.getFloat("width") ?? 0), 0)
        let height = max(CGFloat(call.getFloat("height") ?? 0), 0)
        return CGRect(x: x, y: y, width: width, height: height)
    }
}

// MARK: - Stats emission + resolution step-down (1080p → 720p → 480p)

/**
 * HaishinKit's built-in `HKStreamVideoAdaptiveBitRateStrategy` only lowers bitRate/frameInterval —
 * the spec wants resolution step-down after ~10s of poor network. This strategy listens to
 * `NetworkMonitorEvent` (fired ~1 Hz while publishing) and emits `broadcastStats` to JS.
 */
private final actor TapeyaBroadcastBitRateStrategy: HKStreamBitRateStrategy {
    private struct Tier: Sendable {
        let width: Double
        let height: Double
        let bitRate: Int
    }

    private static let tiers: [Tier] = [
        .init(width: 1080, height: 1920, bitRate: 2_500_000),
        .init(width: 720, height: 1280, bitRate: 1_500_000),
        .init(width: 480, height: 854, bitRate: 640_000),
    ]

    private static let poorWindowSeconds: TimeInterval = 10
    private static let queuePoorThreshold = 64 * 1024

    let mamimumVideoBitRate: Int
    let mamimumAudioBitRate: Int

    private var tierIndex = 0
    private var poorSince: Date?
    private var lastQuality = "good"
    private var insufficientBWEvents = 0

    private let onStats: @Sendable (Int, Int, Int, String) -> Void

    init(
        maxVideoBitRate: Int = 2_500_000,
        maxAudioBitRate: Int = 128_000,
        onStats: @escaping @Sendable (Int, Int, Int, String) -> Void
    ) {
        self.mamimumVideoBitRate = maxVideoBitRate
        self.mamimumAudioBitRate = maxAudioBitRate
        self.onStats = onStats
    }

    func adjustBitrate(_ event: NetworkMonitorEvent, stream: some HKStream) async {
        switch event {
        case .status(let report):
            updateQuality(report: report, insufficient: false)
            await evaluatePoorWindow(stream: stream)
            await emitStats(stream: stream, report: report)
        case .publishInsufficientBWOccured(let report):
            insufficientBWEvents += 1
            updateQuality(report: report, insufficient: true)
            await evaluatePoorWindow(stream: stream)
            await emitStats(stream: stream, report: report)
        case .reset:
            tierIndex = 0
            poorSince = nil
            lastQuality = "good"
            insufficientBWEvents = 0
            await applyTier(Self.tiers[0], to: stream)
        }
    }

    private func updateQuality(report: NetworkMonitorReport, insufficient: Bool) {
        let target = Self.tiers[tierIndex].bitRate
        let actual = report.currentBytesOutPerSecond * 8

        if insufficient || report.currentQueueBytesOut > Self.queuePoorThreshold {
            lastQuality = "poor"
        } else if actual >= Int(Double(target) * 0.85) {
            lastQuality = "good"
            insufficientBWEvents = 0
        } else if actual >= Int(Double(target) * 0.5) {
            lastQuality = "fair"
        } else {
            lastQuality = "poor"
        }
    }

    private func evaluatePoorWindow(stream: some HKStream) async {
        if lastQuality == "poor" {
            if poorSince == nil {
                poorSince = Date()
            }
        } else {
            poorSince = nil
        }

        guard let since = poorSince, Date().timeIntervalSince(since) >= Self.poorWindowSeconds else { return }
        guard tierIndex < Self.tiers.count - 1 else { return }

        tierIndex += 1
        poorSince = nil
        insufficientBWEvents = 0
        await applyTier(Self.tiers[tierIndex], to: stream)
    }

    private func applyTier(_ tier: Tier, to stream: some HKStream) async {
        var settings = await stream.videoSettings
        settings.videoSize = CGSize(width: tier.width, height: tier.height)
        settings.bitRate = tier.bitRate
        settings.frameInterval = 0.0
        await stream.setVideoSettings(settings)
    }

    private func emitStats(stream: some HKStream, report: NetworkMonitorReport) async {
        let fps: Int
        if let rtmpStream = stream as? RTMPStream {
            fps = Int(await rtmpStream.currentFPS)
        } else {
            fps = 0
        }

        let bitrateKbps = max(report.currentBytesOutPerSecond * 8 / 1000, 0)
        onStats(bitrateKbps, fps, insufficientBWEvents, lastQuality)
    }
}
