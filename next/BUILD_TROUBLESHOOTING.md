# Build Troubleshooting Guide

## Windows File Locking Issues

If you encounter `EBUSY: resource busy or locked` errors when building:

### Quick Fixes

1. **Stop Gradle Daemon** (automatically done in build script):

   ```powershell
   cd android
   .\gradlew.bat --stop
   ```

2. **Close Android Studio** if it's open - it may have files locked

3. **Kill Java/Gradle processes** (if needed):

   ```powershell
   # Find Java processes
   Get-Process | Where-Object {$_.ProcessName -like "*java*"}

   # Kill Gradle daemon
   Stop-Process -Name "java" -Force -ErrorAction SilentlyContinue
   ```

4. **Manual cleanup** (if automated cleanup fails):
   ```powershell
   # Wait a few seconds, then try again
   Start-Sleep -Seconds 3
   npm run build:apk
   ```

### Alternative: Build Without Clean

If cleaning keeps failing, you can skip the clean step:

```powershell
npm run export
npm run config:generate
npm run clean:dev
npx cap sync
cd android
.\gradlew.bat clean
.\gradlew.bat assembleRelease -x lint
```

### Prevention

- Always close Android Studio before building
- Let the build script handle cleanup (it stops Gradle daemon automatically)
- If issues persist, restart your terminal/PowerShell session
