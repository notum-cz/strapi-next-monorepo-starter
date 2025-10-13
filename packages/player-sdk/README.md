# Trail Mixx Player SDK

React player component and embeddable widget for Trail Mixx radio streaming.

## Features

- React component with TypeScript support
- Embeddable widget for any website
- HLS streaming with hls.js fallback
- Accessible controls (WCAG compliant)
- Bilingual support (EN/ES)
- Theme customization via CSS variables

## Installation

```bash
yarn add @repo/player-sdk
```

## React Component Usage

```tsx
import { Player } from '@repo/player-sdk';

function App() {
  return (
    <Player
      src="https://stream.trailmixx.com/live/index.m3u8"
      locale="en"
      onAdStart={() => console.log('Ad started')}
      onAdEnd={() => console.log('Ad ended')}
      className="my-player"
    />
  );
}
```

### Props

- `src` (required): HLS stream URL
- `locale`: 'en' or 'es' (default: 'en')
- `onAdStart`: Callback when ad starts
- `onAdEnd`: Callback when ad ends
- `className`: Additional CSS classes
- `autoPlay`: Auto-play on load (default: false)

## Embeddable Widget

Add to any website:

```html
<!-- Player container -->
<div id="trail-mixx-player" 
     data-hls="https://stream.trailmixx.com/live/index.m3u8"
     data-locale="en">
</div>

<!-- Load widget -->
<script src="https://your-domain.com/player.js"></script>
```

### Widget Customization

Use CSS variables to customize the theme:

```css
:root {
  --player-primary: #16a34a;        /* Deep green */
  --player-primary-hover: #15803d;   /* Darker green */
  --player-accent: #fb7185;          /* Salmon */
  --player-gray: #374151;            /* Basalt gray */
}
```

### Manual Widget Initialization

```html
<div id="my-player"></div>

<script src="player.js"></script>
<script>
  TrailMixxPlayer.init(
    document.getElementById('my-player'),
    'https://stream.trailmixx.com/live/index.m3u8',
    'en'
  );
</script>
```

## Development

```bash
# Build the package
yarn build

# Watch for changes
yarn dev

# Lint
yarn lint
```

## Browser Support

- Native HLS: Safari on iOS and macOS
- HLS.js: Chrome, Firefox, Edge, and other modern browsers
- Fallback: MP3 stream for legacy browsers

## Accessibility

- ARIA labels for all controls
- Keyboard navigation support
- Screen reader compatible
- Focus indicators
