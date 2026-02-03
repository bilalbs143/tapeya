import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  "appId": "com.artchip.app.v64860646",
  "appName": "User13",
  "webDir": "out",
  "server": {
    "androidScheme": "https",
    "cleartext": true
  },
  "plugins": {
    "Browser": {
      "androidCustomTabsService": "com.android.chrome",
      "androidShowTitle": true,
      "androidShowURL": true,
      "androidToolbarColor": "#ffffff"
    },
    "StatusBar": {
      "style": "dark",
      "backgroundColor": "#141943",
      "overlaysWebView": false
    }
  }
};

export default config;
