<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/56f52b82-93d0-4bbe-9b0f-09d11f165d98

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Build a debug Android APK

Prerequisites: Node.js 22 or newer, JDK 21, and Android SDK 36.

1. Install dependencies: `bun install`
2. Build the web app, sync it to Android, and create the APK:
   `bun run android:apk`

The APK is generated at `android/app/build/outputs/apk/debug/app-debug.apk`.
