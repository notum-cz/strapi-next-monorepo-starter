# Trail Mixx Mobile

Capacitor wrapper for Trail Mixx web app with native media session support.

## Features

- iOS and Android native apps
- Media session integration for Bluetooth controls
- Background audio playback
- Lock screen controls

## Setup

1. Build the web app first:
```bash
cd ../web
yarn build
```

2. Sync Capacitor:
```bash
cd ../mobile
yarn sync
```

3. Open in native IDE:
```bash
# For iOS (requires macOS and Xcode)
yarn ios

# For Android (requires Android Studio)
yarn android
```

## Media Session

The app uses `capacitor-media-session` plugin to provide:
- Play/Pause controls on lock screen
- Bluetooth device controls
- Now playing information
- Background audio playback

See the web app's Player component for media session integration.

## Development

For development, you can point the app to your local dev server:
1. Update `capacitor.config.json` server URL to your local machine's IP
2. Run `yarn sync`
3. Run the app in native IDE

## Build for Production

1. Set production URL in `capacitor.config.json`
2. Build the web app: `cd ../web && yarn build`
3. Sync: `yarn sync`
4. Open native IDE and build for distribution
