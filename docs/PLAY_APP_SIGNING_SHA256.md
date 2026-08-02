# Copy Play App Signing SHA-256 into assetlinks.json

Source of truth (preferred):

- Play Console → Your app → **Protected with Play** (App integrity moved here)
- Open **App signing**
- App signing key certificate → SHA-256 certificate fingerprint

Paste as colon-separated uppercase hex, e.g. `AB:CD:12:…`

Then:

1. Put it in [`app/public/.well-known/assetlinks.json`](../app/public/.well-known/assetlinks.json)
2. Deploy mobile web + nginx so `https://tapeya.com/.well-known/assetlinks.json` is live
3. Install a release build signed by Play, then:
   ```bash
   adb shell pm get-app-links com.tapbytapeya.app
   ```

Optional local check against an installed Play build:

```bash
adb shell pm path com.tapbytapeya.app
# pull base.apk and:
keytool -printcert -jarfile base.apk | grep SHA256
```
