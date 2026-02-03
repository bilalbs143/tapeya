#!/usr/bin/env node

/**
 * Configuration Generator Script
 * This script generates all platform-specific configuration files from the centralized appConfig
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import appConfig from '../src/config/appConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

console.log('🚀 Generating configuration files from centralized config...');

// Generate a unique App ID for each build
function generateUniqueAppId(baseAppId) {
  // Extract base package name (e.g., "com.artchip.app")
  const basePackage = baseAppId.replace(/\.v\d+$/, ''); // Remove any existing versioned suffix

  // Generate unique identifier based on timestamp
  const timestamp = Date.now();
  const uniqueSuffix = 'v' + timestamp.toString().slice(-8); // Prepend 'v' to make it a valid Java identifier

  // Create unique app ID
  const uniqueAppId = `${basePackage}.${uniqueSuffix}`;

  console.log(`📱 Generated unique App ID: ${uniqueAppId}`);

  return uniqueAppId;
}

// Create a modified config with unique appId
const originalAppId = appConfig.appId;
const uniqueAppId = generateUniqueAppId(originalAppId);

// Clone appConfig and update with unique identifiers
const buildConfig = {
  ...appConfig,
  appId: uniqueAppId,
  packageName: uniqueAppId,
  customUrlScheme: uniqueAppId,
};

console.log(`🔄 Original App ID: ${originalAppId}`);
console.log(`✨ Build App ID: ${uniqueAppId}`);

// Generate Capacitor Configuration
function generateCapacitorConfig() {
  const capacitorConfig = {
    appId: buildConfig.appId,
    appName: buildConfig.appName,
    webDir: 'out',
    server: {
      androidScheme: buildConfig.platforms.android.androidScheme,
      cleartext: buildConfig.platforms.android.cleartext,
    },
    plugins: buildConfig.plugins,
  };

  // Write capacitor.config.ts
  const capacitorTsContent = `import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = ${JSON.stringify(capacitorConfig, null, 2)};

export default config;
`;

  fs.writeFileSync(
    path.join(projectRoot, 'capacitor.config.ts'),
    capacitorTsContent,
  );

  // Write capacitor.config.json
  const capacitorJsonConfig = {
    appId: buildConfig.appId,
    appName: buildConfig.appName,
    webDir: 'out',
    bundledWebRuntime: false,
    android: {
      webContentsDebuggingEnabled:
        buildConfig.platforms.android.webContentsDebuggingEnabled,
    },
  };

  fs.writeFileSync(
    path.join(projectRoot, 'capacitor.config.json'),
    JSON.stringify(capacitorJsonConfig, null, 2),
  );

  console.log('✅ Generated Capacitor configuration files');
}

// Generate Web Manifest
function generateWebManifest() {
  const webManifest = {
    name: buildConfig.appName,
    short_name: buildConfig.appShortName,
    description: buildConfig.appDescription,
    start_url: '/',
    display: buildConfig.platforms.web.display,
    background_color: buildConfig.theme.background,
    theme_color: buildConfig.theme.primary,
    orientation: buildConfig.platforms.web.orientation,
    scope: buildConfig.platforms.web.scope,
    categories: buildConfig.platforms.web.categories,
    dir: buildConfig.platforms.web.dir,
    icons: [
      {
        src: buildConfig.icon.webUrl,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: buildConfig.icon.webUrl,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: buildConfig.icon.webUrl,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    related_applications: [],
    prefer_related_applications: false,
    edge_side_panel: {
      preferred_width: 400,
    },
  };

  fs.writeFileSync(
    path.join(projectRoot, 'public', 'manifest.json'),
    JSON.stringify(webManifest, null, 2),
  );

  console.log('✅ Generated Web manifest');
}

// Generate Assets Configuration
function generateAssetsConfig() {
  const assetsConfig = {
    platforms: {
      android: {
        icon: {
          source: buildConfig.icon.source,
          backgroundColor: buildConfig.icon.backgroundColor,
        },
      },
    },
  };

  fs.writeFileSync(
    path.join(projectRoot, 'assets.config.json'),
    JSON.stringify(assetsConfig, null, 2),
  );

  console.log('✅ Generated Assets configuration');
}

// Generate Android Strings
function generateAndroidStrings() {
  const stringsXml = `<?xml version='1.0' encoding='utf-8'?>
<resources>
    <string name="app_name">${buildConfig.appName}</string>
    <string name="title_activity_main">${buildConfig.appName}</string>
    <string name="package_name">${buildConfig.packageName}</string>
    <string name="custom_url_scheme">${buildConfig.customUrlScheme}</string>
</resources>`;

  fs.writeFileSync(
    path.join(
      projectRoot,
      'android',
      'app',
      'src',
      'main',
      'res',
      'values',
      'strings.xml',
    ),
    stringsXml,
  );

  console.log('✅ Generated Android strings');
}

// Generate Android Build Configuration
function generateAndroidBuildConfig() {
  const buildGradlePath = path.join(
    projectRoot,
    'android',
    'app',
    'build.gradle',
  );

  if (fs.existsSync(buildGradlePath)) {
    let buildGradleContent = fs.readFileSync(buildGradlePath, 'utf8');

    // Update applicationId (this is what makes the app unique)
    buildGradleContent = buildGradleContent.replace(
      /applicationId\s+"[^"]+"/,
      `applicationId "${buildConfig.appId}"`,
    );

    // Keep namespace as the original appId (must match Java package structure)
    // DO NOT change namespace - it must stay as com.artchip.app
    buildGradleContent = buildGradleContent.replace(
      /namespace\s+"[^"]+"/,
      `namespace "${appConfig.appId}"`,
    );

    // Update versionName
    buildGradleContent = buildGradleContent.replace(
      /versionName\s+"[^"]+"/,
      `versionName "${buildConfig.versionName}"`,
    );

    // Update versionCode
    buildGradleContent = buildGradleContent.replace(
      /versionCode\s+\d+/,
      `versionCode ${buildConfig.versionCode}`,
    );

    fs.writeFileSync(buildGradlePath, buildGradleContent);
    console.log('✅ Updated Android build configuration');
  }
}

// Generate Android Icons
function generateAndroidIcons() {
  const sourceIconPath = path.join(projectRoot, buildConfig.icon.source);

  if (!fs.existsSync(sourceIconPath)) {
    console.error(`❌ Source icon not found: ${sourceIconPath}`);
    return;
  }

  // Android mipmap directories
  const mipmapDirs = [
    'mipmap-hdpi',
    'mipmap-ldpi',
    'mipmap-mdpi',
    'mipmap-xhdpi',
    'mipmap-xxhdpi',
    'mipmap-xxxhdpi',
  ];

  // Icon file names to replace
  const iconFiles = [
    'ic_launcher.png',
    'ic_launcher_round.png',
    'ic_launcher_background.png',
    'ic_launcher_foreground.png',
  ];

  // Copy icon to each mipmap directory
  mipmapDirs.forEach((dir) => {
    const targetDir = path.join(
      projectRoot,
      'android',
      'app',
      'src',
      'main',
      'res',
      dir,
    );

    if (fs.existsSync(targetDir)) {
      // Copy the main icon files
      iconFiles.forEach((iconFile) => {
        const targetPath = path.join(targetDir, iconFile);
        try {
          fs.copyFileSync(sourceIconPath, targetPath);
        } catch (error) {
          console.error(
            `❌ Failed to copy icon to ${targetPath}:`,
            error.message,
          );
        }
      });
    }
  });

  console.log('✅ Generated Android icons');
}

// Generate Package.json updates
function generatePackageJsonUpdates() {
  const packageJsonPath = path.join(projectRoot, 'package.json');

  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    // Update package name if needed
    if (
      packageJson.name !==
      buildConfig.appName.toLowerCase().replace(/\s+/g, '-')
    ) {
      packageJson.name = buildConfig.appName.toLowerCase().replace(/\s+/g, '-');
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log('✅ Updated package.json name');
    }
  }
}

// Main execution
try {
  generateCapacitorConfig();
  generateWebManifest();
  generateAssetsConfig();
  generateAndroidStrings();
  generateAndroidBuildConfig();
  generateAndroidIcons();
  generatePackageJsonUpdates();

  console.log('🎉 All configuration files generated successfully!');
  console.log('📝 To apply changes, run: npx cap sync');
} catch (error) {
  console.error('❌ Error generating configuration files:', error);
  process.exit(1);
}
