import UIKit

/**
 * Cached splash brand (iOS).
 *
 * LaunchScreen alone often blanks large trait-aware logos. We decode light + dark
 * once, keep strong refs, and paint a window overlay until JS hides Cap splash.
 */
enum SplashBrandCache {
    private static var light: UIImage?
    private static var dark: UIImage?
    private static var warmed = false

    static func warm() {
        guard !warmed else { return }
        warmed = true

        guard let base = UIImage(named: "SplashLogo") else { return }
        if let asset = base.imageAsset {
            light = prepare(asset.image(with: UITraitCollection(userInterfaceStyle: .light)))
            dark = prepare(asset.image(with: UITraitCollection(userInterfaceStyle: .dark)))
        } else {
            light = prepare(base)
            dark = light
        }
    }

    static func logo(for style: UIUserInterfaceStyle) -> UIImage? {
        warm()
        return style == .dark ? (dark ?? light) : (light ?? dark)
    }

    private static func prepare(_ image: UIImage) -> UIImage {
        if #available(iOS 15.0, *) {
            return image.preparingForDisplay() ?? image
        }
        return image
    }
}

final class SplashBrandOverlay: UIView {
    private static weak var presented: SplashBrandOverlay?

    private let logoView = UIImageView()
    private let taglineLabel = UILabel()

    static func show(on window: UIWindow) {
        SplashBrandCache.warm()
        presented?.removeFromSuperview()

        let overlay = SplashBrandOverlay(frame: window.bounds)
        overlay.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        overlay.apply(style: window.traitCollection.userInterfaceStyle)
        window.addSubview(overlay)
        window.bringSubviewToFront(overlay)
        presented = overlay
    }

    static func hide() {
        presented?.removeFromSuperview()
        presented = nil
    }

    static func bringToFront() {
        guard let overlay = presented, let window = overlay.window else { return }
        window.bringSubviewToFront(overlay)
    }

    override init(frame: CGRect) {
        super.init(frame: frame)
        isUserInteractionEnabled = false
        backgroundColor = UIColor(named: "SplashBackground") ?? .systemBackground

        logoView.contentMode = .scaleAspectFit
        logoView.translatesAutoresizingMaskIntoConstraints = false

        taglineLabel.text = "Live Cricket & Instant Updates, Anytime!"
        taglineLabel.textAlignment = .center
        taglineLabel.numberOfLines = 1
        taglineLabel.adjustsFontSizeToFitWidth = true
        taglineLabel.minimumScaleFactor = 0.78
        taglineLabel.font = .systemFont(ofSize: 15, weight: .medium)
        taglineLabel.textColor = UIColor(named: "SplashTagline") ?? .secondaryLabel
        taglineLabel.translatesAutoresizingMaskIntoConstraints = false

        let stack = UIStackView(arrangedSubviews: [logoView, taglineLabel])
        stack.axis = .vertical
        stack.alignment = .center
        stack.spacing = 18
        stack.translatesAutoresizingMaskIntoConstraints = false
        addSubview(stack)

        NSLayoutConstraint.activate([
            stack.centerXAnchor.constraint(equalTo: centerXAnchor),
            stack.centerYAnchor.constraint(equalTo: centerYAnchor, constant: -8),
            stack.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 24),
            trailingAnchor.constraint(equalTo: stack.trailingAnchor, constant: 24),

            logoView.widthAnchor.constraint(equalToConstant: 276),
            logoView.heightAnchor.constraint(equalToConstant: 104),

            taglineLabel.widthAnchor.constraint(equalTo: stack.widthAnchor),
        ])
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    private func apply(style: UIUserInterfaceStyle) {
        logoView.image = SplashBrandCache.logo(for: style)
        backgroundColor = UIColor(named: "SplashBackground") ?? .systemBackground
        taglineLabel.textColor = UIColor(named: "SplashTagline") ?? .secondaryLabel
    }

    override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        if traitCollection.hasDifferentColorAppearance(comparedTo: previousTraitCollection) {
            apply(style: traitCollection.userInterfaceStyle)
        }
    }
}
