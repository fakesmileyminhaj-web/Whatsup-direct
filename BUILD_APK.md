# WhatsApp Direct - Android APK Build Instructions

This document provides step-by-step instructions to compile the **WhatsApp Direct** Android APK using Capacitor.

## Project Details
- **App Name**: `WhatsApp Direct`
- **Application ID / Package**: `com.smileyminhaj.whatsappdirect`
- **Capacitor Version**: `^8.5.2`
- **Target Android SDK**: `35` (Android 15)
- **Minimum Android SDK**: `24` (Android 7.0 Nougat)

---

## Method 1: Automatic Build via GitHub Actions (Recommended)

A pre-configured GitHub Actions workflow is included at `.github/workflows/build-apk.yml`.
When you export or push this repository to GitHub:
1. Go to the **Actions** tab in your GitHub repository.
2. Select **Build Android APK** and click **Run workflow**.
3. Once the workflow finishes (approx. 2 minutes), download the ready-to-install **`WhatsApp-Direct-Debug-APK`** artifact (`app-debug.apk`).

---

## Method 2: Build Locally via Command Line (Terminal)

### Prerequisites
1. **Node.js** (v18 or v20+)
2. **JDK 21** (Temurin or OpenJDK 21)
3. **Android SDK** with build-tools 35.0.0 and platform 35 installed, and `ANDROID_HOME` environment variable set.

### Steps
1. Build web production assets and sync to Android:
   ```bash
   npm run cap:build
   ```
2. Navigate to the `android/` directory:
   ```bash
   cd android
   ```
3. Grant execute permissions to the Gradle wrapper (macOS/Linux):
   ```bash
   chmod +x gradlew
   ```
4. Build the Debug APK:
   ```bash
   ./gradlew assembleDebug
   ```
   On Windows PowerShell / CMD:
   ```cmd
   gradlew.bat assembleDebug
   ```
5. The generated APK will be located at:
   ```
   android/app/build/outputs/apk/debug/app-debug.apk
   ```

---

## Method 3: Open and Run in Android Studio

1. Run:
   ```bash
   npx cap open android
   ```
   or open the `android/` folder directly in Android Studio.
2. Allow Android Studio to complete Gradle sync.
3. Click **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
4. Android Studio will generate the APK and provide a pop-up link to view the file in your file explorer.
