# KAFConnect Setup Instructions

## 1. Web Push Notifications (VAPID)

To enable push notifications in the Next.js app, you need to generate VAPID keys and add them to your Vercel environment variables.

1. Generate VAPID keys:
   You can run `npx web-push generate-vapid-keys` in your terminal.
2. Go to your Vercel Project Dashboard > Settings > Environment Variables.
3. Add the following keys:
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY` = (the generated public key)
   - `VAPID_PRIVATE_KEY` = (the generated private key)
   - `VAPID_SUBJECT` = `mailto:admin@kafconnect.com` (or your email)
4. Redeploy your project on Vercel to apply the changes.

## 2. GitHub OAuth (Login / Signup)

To allow users to login via GitHub, you need to configure a GitHub OAuth app and add the credentials to Supabase.

1. Go to your GitHub account settings > Developer settings > OAuth Apps > New OAuth App.
2. Fill in the details:
   - **Application name**: KAFConnect
   - **Homepage URL**: `https://necsite-1.vercel.app` (or your actual production URL)
   - **Authorization callback URL**: `https://unoskdcuqdaaxiuymhcn.supabase.co/auth/v1/callback`
3. Click "Register application".
4. Copy the **Client ID** and generate a new **Client Secret**.
5. Go to your Supabase Project Dashboard (`unoskdcuqdaaxiuymhcn`) > Authentication > Providers > GitHub.
6. Enable the GitHub provider.
7. Paste the Client ID and Client Secret.
8. Save the configuration.

## 3. Flutter Mobile App Setup

A basic Flutter project has been initialized in the `mobile_app` folder within the project directory.

To build and run the app:
1. Ensure you have the [Flutter SDK installed](https://docs.flutter.dev/get-started/install/windows) and added to your PATH.
2. Open a terminal in the `mobile_app` directory:
   ```bash
   cd mobile_app
   flutter pub get
   ```
3. Run the app on an emulator or physical device:
   ```bash
   flutter run
   ```
The Flutter app is configured to load the production URL (`https://necsite-1.vercel.app`) using a Webview, giving your platform an immediate mobile presence.
