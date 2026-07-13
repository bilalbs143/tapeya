import Foundation
import Capacitor
import WebKit

private let playerReadyFallbackSeconds: TimeInterval = 15

/**
 * Native YouTube player for iOS Capacitor.
 *
 * Always underlay (WKWebView below transparent Capacitor) so React chrome composites on top.
 * Portrait: sized to the web placeholder. Landscape: immersive fullscreen; embed proxy handles rotate/cover.
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
    private var pendingPlayerReady = false
    private var playerIsReady = false
    private var readyFallbackWorkItem: DispatchWorkItem?
    private var immersiveLandscapeMode = false

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
            let needsLoad = reload || webView.url == nil

            if needsLoad {
                self.cancelReadyFallback()
                self.playerIsReady = false
                self.pendingPlayerReady = false
            }

            self.immersiveLandscapeMode = immersiveFullscreen
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
                webView.load(URLRequest(url: url))
            } else {
                self.playerIsReady = true
                webView.isHidden = false
                self.syncEmbedToMode(immersiveFullscreen, targetUrl: url)
            }

            self.applyCapacitorWebViewTransparency(underlay)
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
            self.immersiveLandscapeMode = immersiveFullscreen
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
            call.resolve(["updated": true])
        }
    }

    @objc func hide(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            self.cancelReadyFallback()
            self.pendingPlayerReady = false
            self.playerIsReady = false
            self.applyCapacitorWebViewTransparency(false)
            self.overlayWebView?.isHidden = true
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
                self.notifyListeners("playerPlaying", data: [:])
            case "error":
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

    /** Reload when portrait/landscape URL params differ; otherwise refresh embed layout in-place. */
    private func syncEmbedToMode(_ landscape: Bool, targetUrl: URL?) {
        guard let webView = overlayWebView else { return }

        let loadedLandscape = embedHasLandscapeParams(webView.url)
        if loadedLandscape != landscape, let targetUrl {
            webView.load(URLRequest(url: targetUrl))
            return
        }

        refreshEmbedLayout()
    }

    private func refreshEmbedLayout() {
        overlayWebView?.evaluateJavaScript(
            "typeof applyRotateLayout==='function'&&applyRotateLayout();typeof fitPlayerCover==='function'&&fitPlayerCover();"
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

    private func attachOverlay(_ webView: WKWebView, on hostView: UIView, underlay: Bool) {
        if underlay, let capWebView = bridge?.webView {
            let targetParent = capWebView.superview ?? hostView
            if webView.superview !== targetParent {
                webView.removeFromSuperview()
                targetParent.insertSubview(webView, belowSubview: capWebView)
            } else {
                targetParent.insertSubview(webView, belowSubview: capWebView)
            }
        } else {
            if webView.superview !== hostView {
                webView.removeFromSuperview()
                hostView.addSubview(webView)
            }
            hostView.bringSubviewToFront(webView)
        }
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
        notifyListeners("playerReady", data: [:])
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
