import Foundation
import Capacitor
import WebKit

private let playerReadyFallbackSeconds: TimeInterval = 15
/** Retries after reveal — YouTube often ignores playVideo while the WKWebView is still hidden. */
private let playbackKickDelays: [TimeInterval] = [0, 0.35, 1.2]

/**
 * Native YouTube player for iOS Capacitor.
 *
 * Underlay (live): below Cap — badges/chat tappable.
 * Interactive (VOD): above Cap — YouTube controls tappable.
 * Full: immersiveFullscreen + embed `rotate=1&cover=1`, plus a native Exit
 * button (same parent as the overlay, always on top — Cap HTML Exit can't sit
 * above an interactive overlay).
 */
@objc(YoutubeStreamOverlayPlugin)
public class YoutubeStreamOverlayPlugin: CAPPlugin, CAPBridgedPlugin, WKScriptMessageHandler {
    public let identifier = "YoutubeStreamOverlayPlugin"
    public let jsName = "YoutubeStreamOverlay"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "show", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "updateLayout", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "hide", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getReadyState", returnType: CAPPluginReturnPromise),
    ]

    private var overlayWebView: WKWebView?
    private var exitButton: UIButton?
    private var pendingPlayerReady = false
    private var playerIsReady = false
    private var readyFallbackWorkItem: DispatchWorkItem?
    private var playbackKickWorkItems: [DispatchWorkItem] = []
    private var lastLoadedOverlayUrl: String?

    @objc func show(_ call: CAPPluginCall) {
        guard let urlString = call.getString("url"), let url = URL(string: urlString) else {
            call.reject("Invalid url")
            return
        }

        let frame = frameFromCall(call)
        let reload = call.getBool("reload") ?? true
        let userInteractionEnabled = call.getBool("userInteractionEnabled") ?? true
        let underlay = call.getBool("underlay") ?? false
        let immersiveFullscreen = call.getBool("immersiveFullscreen") ?? false

        DispatchQueue.main.async {
            guard let hostView = self.bridge?.viewController?.view else {
                call.reject("Host view unavailable")
                return
            }

            hostView.backgroundColor = .black

            let webView = self.ensureWebView(on: hostView)
            let sameUrl = self.lastLoadedOverlayUrl == urlString
            let needsLoad = webView.url == nil || (reload && !sameUrl)

            if needsLoad {
                self.cancelReadyFallback()
                self.cancelPlaybackKicks()
                self.playerIsReady = false
                self.pendingPlayerReady = false
            }

            self.attachOverlay(webView, on: hostView, underlay: underlay)

            let applied = self.applyLayout(
                to: webView,
                frame: frame,
                userInteractionEnabled: userInteractionEnabled,
                visible: !needsLoad,
                immersiveFullscreen: immersiveFullscreen,
                hostView: hostView
            )

            if !applied {
                call.resolve(["shown": false, "reason": "zero-size-frame"])
                return
            }

            if needsLoad {
                self.beginPendingPlayerReady(for: webView)
                self.loadOverlayContent(webView: webView, url: url)
            } else {
                self.playerIsReady = true
                webView.isHidden = false
                self.syncEmbedToMode(immersiveFullscreen, targetUrl: url)
                if self.isYoutubeEmbedProxy(webView.url) {
                    self.schedulePlaybackKicks()
                }
            }

            self.applyCapacitorWebViewTransparency(underlay)
            self.applyCapacitorWebViewInteraction(underlay: underlay)
            self.syncExitButton(visible: immersiveFullscreen, underlay: underlay, webView: webView)
            call.resolve(["shown": true])
        }
    }

    @objc func getReadyState(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            guard let webView = self.overlayWebView else {
                call.resolve(["ready": false])
                return
            }

            let ready = self.playerIsReady && !self.pendingPlayerReady && !webView.isHidden
            call.resolve(["ready": ready])
        }
    }

    @objc func updateLayout(_ call: CAPPluginCall) {
        let frame = frameFromCall(call)
        let userInteractionEnabled = call.getBool("userInteractionEnabled") ?? true
        let underlay = call.getBool("underlay") ?? false
        let immersiveFullscreen = call.getBool("immersiveFullscreen") ?? false
        let updateFrame = call.getBool("updateFrame") ?? true
        let targetUrl = urlFromCall(call)

        DispatchQueue.main.async {
            guard let webView = self.overlayWebView else {
                call.resolve(["updated": false, "reason": "no-webview"])
                return
            }

            guard let hostView = self.bridge?.viewController?.view else {
                call.resolve(["updated": false, "reason": "no-host"])
                return
            }

            hostView.backgroundColor = .black
            self.attachOverlay(webView, on: hostView, underlay: underlay)

            if updateFrame {
                _ = self.applyLayout(
                    to: webView,
                    frame: frame,
                    userInteractionEnabled: userInteractionEnabled,
                    visible: !self.pendingPlayerReady,
                    immersiveFullscreen: immersiveFullscreen,
                    hostView: hostView
                )
            }

            if self.playerIsReady && !self.pendingPlayerReady {
                webView.isHidden = false
            }

            self.syncEmbedToMode(immersiveFullscreen, targetUrl: targetUrl)
            self.applyCapacitorWebViewTransparency(underlay)
            self.applyCapacitorWebViewInteraction(underlay: underlay)
            self.syncExitButton(visible: immersiveFullscreen, underlay: underlay, webView: webView)
            call.resolve(["updated": true])
        }
    }

    @objc func hide(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            self.cancelReadyFallback()
            self.cancelPlaybackKicks()
            self.pendingPlayerReady = false
            self.playerIsReady = false
            self.lastLoadedOverlayUrl = nil
            self.applyCapacitorWebViewTransparency(false)
            self.applyCapacitorWebViewInteraction(underlay: true)
            self.exitButton?.removeFromSuperview()
            self.exitButton = nil
            self.overlayWebView?.isHidden = true
            self.overlayWebView?.load(URLRequest(url: URL(string: "about:blank")!))
            call.resolve(["hidden": true])
        }
    }

    public func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.name == "tapeyaStream", let event = message.body as? String else { return }

        DispatchQueue.main.async {
            switch event {
            case "ready":
                self.revealWebView()
            case "playing":
                self.cancelPlaybackKicks()
                self.notifyListeners("playerPlaying", data: [:])
            case "error":
                self.cancelPlaybackKicks()
                self.notifyListeners("playerError", data: [:])
            default:
                break
            }
        }
    }

    private func immersiveHostBounds(for hostView: UIView) -> CGRect {
        if let window = hostView.window {
            return window.bounds
        }
        return hostView.bounds
    }

    private func frameFromCall(_ call: CAPPluginCall) -> CGRect {
        let x = CGFloat(call.getFloat("x") ?? 0)
        let y = CGFloat(call.getFloat("y") ?? 0)
        let width = max(CGFloat(call.getFloat("width") ?? 0), 0)
        let height = max(CGFloat(call.getFloat("height") ?? 0), 0)
        return CGRect(x: x, y: y, width: width, height: height)
    }

    private func urlFromCall(_ call: CAPPluginCall) -> URL? {
        guard let urlString = call.getString("url") else { return nil }
        return URL(string: urlString)
    }

    private func embedHasLandscapeParams(_ url: URL?) -> Bool {
        guard let url, let components = URLComponents(url: url, resolvingAgainstBaseURL: false) else {
            return false
        }
        let query = components.queryItems ?? []
        let cover = query.first(where: { $0.name == "cover" })?.value == "1"
        let rotate = query.first(where: { $0.name == "rotate" })?.value == "1"
        return cover && rotate
    }

    private func loadOverlayContent(webView: WKWebView, url: URL) {
        lastLoadedOverlayUrl = url.absoluteString
        webView.load(URLRequest(url: url))
    }

    private func isYoutubeEmbedProxy(_ url: URL?) -> Bool {
        guard let url else { return false }
        return url.path.contains("/embed/youtube")
    }

    /** Reload when portrait/landscape URL params differ; otherwise refresh embed layout in-place. */
    private func syncEmbedToMode(_ landscape: Bool, targetUrl: URL?) {
        guard let webView = overlayWebView else { return }

        let loadedLandscape = embedHasLandscapeParams(webView.url)
        if loadedLandscape != landscape, let targetUrl {
            beginPendingPlayerReady(for: webView)
            loadOverlayContent(webView: webView, url: targetUrl)
            return
        }

        refreshEmbedLayout()
    }

    private func refreshEmbedLayout() {
        overlayWebView?.evaluateJavaScript(
            "typeof applyRotateLayout==='function'&&applyRotateLayout();typeof fitPlayerCover==='function'&&fitPlayerCover();typeof fitPlayerToViewport==='function'&&fitPlayerToViewport();"
        ) { _, _ in }
    }

    private func applyCapacitorWebViewTransparency(_ underlay: Bool) {
        guard let webView = bridge?.webView else { return }

        if underlay {
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

    private func applyCapacitorWebViewInteraction(underlay: Bool) {
        guard let capWebView = bridge?.webView else { return }

        let scrollView = capWebView.scrollView
        scrollView.isScrollEnabled = underlay
        scrollView.panGestureRecognizer.isEnabled = underlay
    }

    /** Exit above Cap (live underlay) or above YouTube (VOD interactive). */
    private func syncExitButton(visible: Bool, underlay: Bool, webView: WKWebView) {
        guard visible, let parent = webView.superview else {
            exitButton?.removeFromSuperview()
            return
        }

        let button = exitButton ?? makeExitButton()
        exitButton = button
        let size: CGFloat = 28
        button.frame = CGRect(
            x: parent.bounds.width - 48 - size,
            y: parent.bounds.height - 20 - size,
            width: size,
            height: size
        )
        button.isHidden = false
        if underlay, let cap = bridge?.webView, cap.superview === parent {
            parent.insertSubview(button, aboveSubview: cap)
        } else {
            parent.insertSubview(button, aboveSubview: webView)
        }
    }

    private func makeExitButton() -> UIButton {
        let button = UIButton(type: .system)
        button.accessibilityLabel = "Exit"
        button.backgroundColor = UIColor(white: 0.27, alpha: 0.9)
        button.layer.cornerRadius = 14
        button.layer.borderWidth = 1
        button.layer.borderColor = UIColor.white.withAlphaComponent(0.2).cgColor
        button.tintColor = .white
        button.setImage(UIImage(systemName: "arrow.2.circlepath"), for: .normal)
        button.addTarget(self, action: #selector(exitImmersiveTapped), for: .touchUpInside)
        return button
    }

    @objc private func exitImmersiveTapped() {
        notifyListeners("exitImmersive", data: [:])
    }

    private func attachOverlay(_ webView: WKWebView, on hostView: UIView, underlay: Bool) {
        if underlay, let capWebView = bridge?.webView {
            let targetParent = capWebView.superview ?? hostView
            if webView.superview !== targetParent {
                webView.removeFromSuperview()
            }
            targetParent.insertSubview(webView, belowSubview: capWebView)
            return
        }

        if let capWebView = bridge?.webView {
            let targetParent = capWebView.superview ?? hostView
            if webView.superview !== targetParent {
                webView.removeFromSuperview()
            }
            targetParent.insertSubview(webView, aboveSubview: capWebView)
            return
        }

        if webView.superview !== hostView {
            webView.removeFromSuperview()
            hostView.addSubview(webView)
        }
        hostView.bringSubviewToFront(webView)
    }

    @discardableResult
    private func applyLayout(
        to webView: WKWebView,
        frame: CGRect,
        userInteractionEnabled: Bool,
        visible: Bool = true,
        immersiveFullscreen: Bool = false,
        hostView: UIView? = nil
    ) -> Bool {
        webView.isUserInteractionEnabled = userInteractionEnabled
        webView.scrollView.isUserInteractionEnabled = userInteractionEnabled
        webView.isExclusiveTouch = userInteractionEnabled
        if userInteractionEnabled {
            webView.scrollView.delaysContentTouches = false
            webView.scrollView.canCancelContentTouches = false
        }

        if immersiveFullscreen, let host = hostView {
            let bounds = immersiveHostBounds(for: host)
            if bounds.width <= 0 || bounds.height <= 0 {
                webView.isHidden = true
                return false
            }

            webView.isHidden = !visible
            webView.transform = .identity
            webView.frame = bounds
            return true
        }

        if frame.width <= 0 || frame.height <= 0 {
            webView.isHidden = true
            return false
        }

        webView.isHidden = !visible
        webView.transform = .identity
        webView.bounds = CGRect(origin: .zero, size: frame.size)
        webView.center = CGPoint(x: frame.midX, y: frame.midY)
        return true
    }

    private func beginPendingPlayerReady(for webView: WKWebView) {
        cancelReadyFallback()
        cancelPlaybackKicks()
        pendingPlayerReady = true
        playerIsReady = false
        webView.isHidden = true

        let workItem = DispatchWorkItem { [weak self] in
            self?.revealWebView()
        }
        readyFallbackWorkItem = workItem
        DispatchQueue.main.asyncAfter(deadline: .now() + playerReadyFallbackSeconds, execute: workItem)
    }

    private func revealWebView() {
        guard pendingPlayerReady else { return }

        cancelReadyFallback()
        pendingPlayerReady = false
        playerIsReady = true
        overlayWebView?.isHidden = false
        refreshEmbedLayout()
        if let button = exitButton, let parent = button.superview {
            parent.bringSubviewToFront(button)
        }
        notifyListeners("playerReady", data: [:])
        if isYoutubeEmbedProxy(overlayWebView?.url) {
            schedulePlaybackKicks()
        }
    }

    private func schedulePlaybackKicks() {
        cancelPlaybackKicks()

        for delay in playbackKickDelays {
            let workItem = DispatchWorkItem { [weak self] in
                self?.kickPlayback()
            }
            playbackKickWorkItems.append(workItem)
            DispatchQueue.main.asyncAfter(deadline: .now() + delay, execute: workItem)
        }
    }

    private func kickPlayback() {
        guard playerIsReady, overlayWebView?.isHidden == false else { return }

        overlayWebView?.evaluateJavaScript(
            "typeof tapeyaStartPlayback==='function'&&tapeyaStartPlayback();"
        ) { _, _ in }
    }

    private func cancelPlaybackKicks() {
        playbackKickWorkItems.forEach { $0.cancel() }
        playbackKickWorkItems.removeAll()
    }

    private func cancelReadyFallback() {
        readyFallbackWorkItem?.cancel()
        readyFallbackWorkItem = nil
    }

    private func ensureWebView(on hostView: UIView) -> WKWebView {
        if let existing = overlayWebView {
            return existing
        }

        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []
        config.allowsPictureInPictureMediaPlayback = false
        config.userContentController.add(self, name: "tapeyaStream")

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = self
        webView.isOpaque = true
        webView.backgroundColor = .black
        webView.scrollView.isOpaque = true
        webView.scrollView.backgroundColor = .black
        webView.scrollView.isScrollEnabled = false
        webView.scrollView.bounces = false
        if #available(iOS 15.0, *) {
            webView.underPageBackgroundColor = .black
        }

        overlayWebView = webView
        return webView
    }
}

extension YoutubeStreamOverlayPlugin: WKNavigationDelegate {
    public func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        DispatchQueue.main.async {
            webView.scrollView.backgroundColor = .black
            webView.backgroundColor = .black
            if #available(iOS 15.0, *) {
                webView.underPageBackgroundColor = .black
            }
            if self.pendingPlayerReady, !self.isYoutubeEmbedProxy(webView.url) {
                self.revealWebView()
            }
            self.refreshEmbedLayout()
        }
    }

    public func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        DispatchQueue.main.async {
            if self.pendingPlayerReady {
                self.revealWebView()
            }
        }
    }

    public func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        DispatchQueue.main.async {
            if self.pendingPlayerReady {
                self.revealWebView()
            }
        }
    }
}
