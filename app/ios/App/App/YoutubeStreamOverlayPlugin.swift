import Foundation
import Capacitor
import WebKit

private let playerReadyFallbackSeconds: TimeInterval = 15

/**
 * Loads the YouTube embed proxy URL in a native WKWebView overlay (top-level document).
 * iOS blocks video playback in nested cross-origin iframes inside Capacitor's WKWebView,
 * even when the same URL works in Mobile Safari.
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

    @objc func show(_ call: CAPPluginCall) {
        guard let urlString = call.getString("url"), let url = URL(string: urlString) else {
            call.reject("Invalid url")
            return
        }

        let frame = frameFromCall(call)
        let reload = call.getBool("reload") ?? true
        let rotationDegrees = CGFloat(call.getFloat("rotation") ?? 0)
        let userInteractionEnabled = call.getBool("userInteractionEnabled") ?? true

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

            let applied = self.applyLayout(
                to: webView,
                frame: frame,
                rotationDegrees: rotationDegrees,
                userInteractionEnabled: userInteractionEnabled,
                visible: !needsLoad
            )
            self.attachOverlayBelowCapacitorWebView(webView, on: hostView)
            if !applied {
                call.resolve(["shown": false, "reason": "zero-size-frame"])
                return
            }

            if needsLoad {
                self.beginPendingPlayerReady(for: webView)
                webView.load(URLRequest(url: url))
            } else {
                self.playerIsReady = true
            }

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
        let rotationDegrees = CGFloat(call.getFloat("rotation") ?? 0)
        let userInteractionEnabled = call.getBool("userInteractionEnabled") ?? true

        DispatchQueue.main.async {
            guard let webView = self.overlayWebView else {
                call.resolve(["updated": false, "reason": "no-webview"])
                return
            }

            _ = self.applyLayout(
                to: webView,
                frame: frame,
                rotationDegrees: rotationDegrees,
                userInteractionEnabled: userInteractionEnabled,
                visible: !self.pendingPlayerReady
            )
            if let hostView = self.bridge?.viewController?.view {
                self.attachOverlayBelowCapacitorWebView(webView, on: hostView)
            }
            call.resolve(["updated": true])
        }
    }

    @objc func hide(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            self.cancelReadyFallback()
            self.pendingPlayerReady = false
            self.playerIsReady = false
            self.overlayWebView?.stopLoading()
            self.overlayWebView?.isHidden = true
            call.resolve(["hidden": true])
        }
    }

    public func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.name == "tapeyaStream" else { return }

        DispatchQueue.main.async {
            self.revealWebView()
        }
    }

    private func frameFromCall(_ call: CAPPluginCall) -> CGRect {
        let x = CGFloat(call.getFloat("x") ?? 0)
        let y = CGFloat(call.getFloat("y") ?? 0)
        let width = max(CGFloat(call.getFloat("width") ?? 0), 0)
        let height = max(CGFloat(call.getFloat("height") ?? 0), 0)
        return CGRect(x: x, y: y, width: width, height: height)
    }

    private func attachOverlayBelowCapacitorWebView(_ webView: WKWebView, on hostView: UIView) {
        if webView.superview !== hostView {
            webView.removeFromSuperview()
        }

        if let capWebView = self.bridge?.webView {
            hostView.insertSubview(webView, belowSubview: capWebView)
        } else if webView.superview !== hostView {
            hostView.addSubview(webView)
        }
    }

    @discardableResult
    private func applyLayout(
        to webView: WKWebView,
        frame: CGRect,
        rotationDegrees: CGFloat,
        userInteractionEnabled: Bool,
        visible: Bool = true
    ) -> Bool {
        webView.isUserInteractionEnabled = userInteractionEnabled

        if frame.width <= 0 || frame.height <= 0 {
            webView.isHidden = true
            return false
        }

        webView.isHidden = !visible
        webView.transform = .identity
        webView.bounds = CGRect(origin: .zero, size: frame.size)
        webView.center = CGPoint(x: frame.midX, y: frame.midY)

        if rotationDegrees != 0 {
            webView.transform = CGAffineTransform(rotationAngle: rotationDegrees * .pi / 180.0)
        }

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
        notifyListeners("playerReady", data: [:])
    }

    private func cancelReadyFallback() {
        readyFallbackWorkItem?.cancel()
        readyFallbackWorkItem = nil
    }

    private func ensureWebView(on hostView: UIView) -> WKWebView {
        if let existing = overlayWebView {
            attachOverlayBelowCapacitorWebView(existing, on: hostView)
            return existing
        }

        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []
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

        attachOverlayBelowCapacitorWebView(webView, on: hostView)
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
