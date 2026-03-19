# App Store & Play Store Submission Guide (Expo EAS)

Since your project uses **Expo**, the easiest way to publish is using **EAS (Expo Application Services)**.

## 1. Prerequisites (Developer Accounts)
You must have official developer accounts to publish:
- **Google Play Store**: [Google Play Console](https://play.google.com/console/signup) ($25 one-time fee).
- **Apple App Store**: [Apple Developer Program](https://developer.apple.com/programs/) ($99/year fee).

## 2. Prepare Your App
Ensure these are set in your `mobile/app.json`:
- **Icons**: 1024x1024px image.
- **Splash Screen**: Image displayed while the app loads.
- **Bundle Identifier**: Unique ID (e.g., `com.yourname.smartwaste`).

## 3. Install EAS CLI
In your `mobile` folder terminal:
```bash
npm install -g eas-cli
eas login
```

## 4. Submission Steps

### For Android (Google Play)
1. **Configure**: `eas build:configure`
2. **Build**: `eas build --platform android` (Select `apk` for testing or `app-bundle` for Store).
3. **Submit**: `eas submit --platform android`

### For iOS (App Store)
1. **Configure**: `eas build:configure`
2. **Build**: `eas build --platform ios` 
3. **Submit**: `eas submit --platform ios`

## 5. Important Tips
- **Environment Variables**: Use `eas.json` to store your `BASE_URL` (the Render URL) so it's baked into the final app.
- **Testing**: Use **TestFlight** (iOS) or **Internal Testing** (Android) to test the final version before it's public.
- **Review**: Both stores will review your app. Ensure you have a "Test Account" (username/password) ready for the reviewers to log in and see the dashboard.
