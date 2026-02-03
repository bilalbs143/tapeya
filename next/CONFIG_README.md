# Centralized App Configuration

This project now uses a centralized configuration system for managing app metadata across all platforms (Android, Web, Capacitor).

## 📁 Configuration Files

### Primary Configuration

- **`src/config/appConfig.js`** - Single source of truth for all app metadata

### Generated Files (DO NOT EDIT MANUALLY)

- `capacitor.config.ts` - Capacitor TypeScript configuration
- `capacitor.config.json` - Capacitor JSON configuration
- `public/manifest.json` - Web app manifest
- `assets.config.json` - Capacitor assets configuration
- `android/app/src/main/res/values/strings.xml` - Android string resources
- `android/app/build.gradle` - Android build configuration (partially updated)

## 🚀 Usage

### Updating App Configuration

1. **Edit the centralized config**: Update `src/config/appConfig.js` with your desired changes
2. **Generate all configurations**: Run `npm run config:generate`

### Available Scripts

```bash
# Generate all configuration files from centralized config
npm run config:generate

# Build APK with updated configuration
npm run build:apk
```

**Note**: The `config:generate` script now automatically generates Android icons from your centralized configuration, ensuring the APK uses the correct logo.

## ⚙️ Configuration Options

### Basic App Information

```javascript
appName: 'Your App Name',           // Display name
appShortName: 'YourApp',            // Short name for web manifest
appDescription: 'App description',  // App description
```

### App Identifiers

```javascript
appId: 'com.yourcompany.app',       // Package ID
packageName: 'com.yourcompany.app', // Android package name
customUrlScheme: 'com.yourcompany.app', // Custom URL scheme
```

### Version Information

```javascript
versionName: '1.0.0',               // Version string
versionCode: 1,                     // Version number (Android)
```

### Visual Configuration

```javascript
icon: {
  source: 'assets/your-icon.png',   // Local icon path
  backgroundColor: '#FFFFFF',        // Icon background color
  webUrl: 'https://your-cdn.com/icon.png' // Web icon URL
}
```

### Theme Colors

```javascript
theme: {
  primary: '#5343b1',               // Primary theme color
  background: '#1c1d40',            // Background color
  statusBarBackground: '#141943'    // Status bar color
}
```

## 🔄 How It Works

1. **Single Source**: All app metadata is defined in `src/config/appConfig.js`
2. **Auto-Generation**: The `generate-config.js` script reads the centralized config and generates all platform-specific files
3. **Consistency**: Ensures all platforms use the same app name, icon, and metadata
4. **Version Control**: Only the centralized config needs to be committed; generated files can be ignored

## 📱 Platform Support

- ✅ **Android APK**: App name, icon, package ID, version (automatically generates all mipmap resolutions)
- ✅ **Web PWA**: Manifest, icons, theme colors
- ✅ **Capacitor**: All plugin configurations
- ✅ **Assets**: Icon generation for all resolutions

## 🛠️ Troubleshooting

### Configuration Not Updating

1. Make sure you ran `npm run config:generate` after editing `appConfig.js`
2. Clean and rebuild: `npm run clean && npm run build:apk`

### Icon Issues

1. Ensure your icon file exists at the specified path in `appConfig.js`
2. Run `npx cap assets` to regenerate Android icons
3. Check that the web URL in `icon.webUrl` is accessible

### Build Errors

1. Verify all required fields are set in `appConfig.js`
2. Check that the app ID follows Android package naming conventions
3. Ensure version codes are incrementing properly

## 📝 Migration Notes

This centralized configuration replaces the previous scattered approach where app metadata was defined in multiple files. The old files are now generated automatically and should not be edited manually.

If you need to make changes, always update `src/config/appConfig.js` and run `npm run config:generate`.
