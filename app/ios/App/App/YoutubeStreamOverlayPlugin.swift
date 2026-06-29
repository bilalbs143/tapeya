import Foundation
import Capacitor
import WebKit

/**
 * Loads the YouTube embed proxy URL in a native WKWebView overlay (top-level document).
 * iOS blocks video playback in nested cross-origin iframes inside Capacitor's WKWebView,
 * even when the same URL works in Mobile Safari.
 */
@objc(YoutubeStreamOverlayPlugin)
public class YoutubeStreamOverlayPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "YoutubeStreamOverlayPlugin"
    public let jsName = "YoutubeStreamOverlay"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "show", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "updateLayout", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "hide", returnType: CAPPluginReturnPromise),
    ]

    private var overlayWebView: WKWebView?

    @objc func show(_ call: CAPPluginCall) {
        guard let urlString = call.getString("url"), let url = URL(string: urlString) else {
            call.reject("Invalid url")
            return
        }

        let frame = frameFromCall(call)
        let reload = call.getBool("reload") ?? true

        DispatchQueue.main.async {
            guard let hostView = self.bridge?.viewController?.view else {
                call.reject("Host view unavailable")
                return
            }

            let webView = self.ensureWebView(on: hostView)
            webView.frame = frame
            // If the frame has no area, hide instead of loading into an invisible view.
            if frame.width <= 0 || frame.height <= 0 {
                webView.isHidden = true
                call.resolve(["shown": false, "reason": "zero-size-frame"])
                return
            }
            webView.isHidden = false

            if reload || webView.url == nil {
                webView.load(URLRequest(url: url))
            }

            call.resolve(["shown": true])
        }
    }

    @objc func updateLayout(_ call: CAPPluginCall) {
        let frame = frameFromCall(call)

        DispatchQueue.main.async {
            self.overlayWebView?.frame = frame
            call.resolve(["updated": true])
        }
    }

    @objc func hide(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            self.overlayWebView?.stopLoading()
            self.overlayWebView?.isHidden = true
            call.resolve(["hidden": true])
        }
    }

    private func frameFromCall(_ call: CAPPluginCall) -> CGRect {
        let x = CGFloat(call.getFloat("x") ?? 0)
        let y = CGFloat(call.getFloat("y") ?? 0)
        let width = max(CGFloat(call.getFloat("width") ?? 0), 0)
        let height = max(CGFloat(call.getFloat("height") ?? 0), 0)
        return CGRect(x: x, y: y, width: width, height: height)
    }

    private func ensureWebView(on hostView: UIView) -> WKWebView {
        if let existing = overlayWebView {
            if existing.superview !== hostView {
                existing.removeFromSuperview()
                hostView.addSubview(existing)
            }
            hostView.bringSubviewToFront(existing)
            return existing
        }

        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.isOpaque = true
        webView.backgroundColor = .black
        webView.scrollView.isScrollEnabled = false
        webView.scrollView.bounces = false
        if #available(iOS 16.4, *) {
            webView.isInspectable = true
        }

        hostView.addSubview(webView)
        overlayWebView = webView
        return webView
    }
}
