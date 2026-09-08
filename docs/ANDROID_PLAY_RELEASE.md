# Android Play release (upload key + new machine)

How to sign a Play Store App Bundle for `com.tapbytapeya.app`, and how to move that signing setup to another computer.

Play App Signing is already enabled. Google holds the **app signing key**. Build machines only need the **upload key**.

**Do not create a new keystore for Play uploads.** A new key will be rejected.

## Expected upload-key fingerprint

Play Console → App integrity → App signing → **Upload key certificate**.

| Field | Value |
| ----- | ----- |
| SHA1 | `89:0C:3A:F0:89:01:67:AC:9E:37:B8:8D:21:92:EE:34:0B:C6:3D:AE` |
| Alias | `upload` |
| Keystore | `app/android/keystores/upload-keystore.jks` |

If a built AAB does not match this SHA1, do not upload it.

For App Links / `assetlinks.json`, use Play’s **app signing** SHA-256, not this upload SHA1. See [`PLAY_APP_SIGNING_SHA256.md`](./PLAY_APP_SIGNING_SHA256.md).

## Files that are not in git

These are gitignored. Copy them by hand; never commit them.

| File | Purpose |
| ---- | ------- |
| `app/android/keystores/upload-keystore.jks` | Play upload key |
| `app/android/keystore.properties` | Store password, key password, alias |

Template (no secrets): [`app/android/keystore.properties.example`](../app/android/keystore.properties.example).

`keystore.properties` must stay relative to `app/android/`:

```
storeFile=keystores/upload-keystore.jks
storePassword=…
keyPassword=…
keyAlias=upload
```

`google-services.json` is in the repo (`app/android/app/google-services.json`). It comes with `git clone`.

## What not to copy

- `~/.android/debug.keystore` — debug only; Play will reject it
- Android SDK / Gradle caches — reinstall on the new machine
- Play’s **app signing key** — Google already has it; you cannot and should not export it
- Any other `.jks` created in Android Studio’s Generate Signed Bundle wizard

## Move to another system

### 1. Backup on the current machine (once)

Keep an encrypted copy of:

- `upload-keystore.jks`
- store password
- key password
- alias `upload`

Store it in two places (password manager + offline USB). Do not email the `.jks` in the clear.

Losing this key blocks Play uploads until you request an **upload-key reset** in Play Console (slow). You cannot recover Google’s app signing key, and you do not need to.

### 2. Install on the new machine

- Git + access to this repo
- Node.js (same major version as this machine)
- JDK **17** (see `app/android/app/build.gradle`)
- Android Studio with SDK matching `compileSdk` in `app/android/variables.gradle` (currently 36)
- Play Console access for Tapeya

### 3. Place the secrets

```bash
git clone <repo>
# then copy:
#   app/android/keystores/upload-keystore.jks
#   app/android/keystore.properties
```

Paths must match `keystore.properties` (`storeFile=keystores/upload-keystore.jks`).

### 4. Verify the key before building

```bash
keytool -list -v \
  -keystore app/android/keystores/upload-keystore.jks \
  -alias upload
```

SHA1 must be `89:0C:3A:F0:89:01:67:AC:9E:37:B8:8D:21:92:EE:34:0B:C6:3D:AE`. If it is not, stop — you copied the wrong file.

### 5. Build a signed release AAB

From `app/`:

```bash
npm install
npm run cap:android          # production (api.tapeya.com)
# npm run cap:android:staging
```

That builds web assets, syncs Capacitor, and opens Android Studio. **Do not use Generate Signed Bundle unless the wizard points at `upload-keystore.jks` / alias `upload`.** That wizard ignores `keystore.properties` and is how a wrong key gets used.

Preferred: close the wizard and sign with Gradle from `app/android/`:

```bash
./gradlew :app:bundleRelease
```

Output:

```
app/android/app/build/outputs/bundle/release/app-release.aab
```

Confirm the AAB before Play upload:

```bash
keytool -printcert -jarfile app/android/app/build/outputs/bundle/release/app-release.aab | grep SHA1
```

Upload **only** that file. Ignore `app-debug.aab` and any AAB under `app/build/outputs/release/` produced by the Studio wizard with a different keystore.

### Android Studio wizard (if you must)

1. Keystore: `app/android/keystores/upload-keystore.jks`
2. Alias: `upload`
3. Build type: **release**
4. Destination: `app/android/app/build/outputs` (not the repo root)

On Linux, Locate may open the wrong folder (`<repo>/release/app-release.aab`). The real Gradle AAB is still under `app/android/app/build/outputs/bundle/release/`.

## Troubleshooting

| Play / Studio error | Cause | Fix |
| ------------------- | ----- | --- |
| Wrong signing key; expected SHA1 `89:0C:3A:F0:…` | AAB signed with a different `.jks` (Studio wizard) | Rebuild with `./gradlew :app:bundleRelease` |
| Locate: file not found at `<repo>/release/app-release.aab` | Wizard destination set to the repo root | Open `app/android/app/build/outputs/bundle/release/app-release.aab` |
| AAB lands in `bundle/debug/` | Active variant is debug, or you used Build Bundle(s) instead of a signed release | Use `bundleRelease` or set Build Variant to **release** |
| Unsigned / missing `signingConfig` | `keystore.properties` missing on that machine | Copy the properties file next to `app/android/` |

## Rule

One upload keystore for every machine. Copy it; never generate a new one for Play. Always verify SHA1, then upload `bundle/release/app-release.aab`.
