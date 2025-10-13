# Trail Mixx Stream Service

HLS proxy service with fallback MP3 and analytics logging.

## Features

- **HLS Proxy**: Proxies `/live/index.m3u8` and media segments to the HLS origin
- **Fallback**: Serves fallback MP3 when origin is unreachable
- **Analytics**: Logs plays and ads to CSV files in `out/` directory
- **Health Check**: `/healthz` endpoint for monitoring
- **Metrics**: `/metrics` endpoint for analytics

## Environment Variables

See `.env.example` for required configuration:

- `PORT`: Service port (default: 3001)
- `HLS_ORIGIN`: Origin URL for HLS streams
- `FALLBACK_MP3`: URL for fallback MP3 when origin is down
- `NODE_ENV`: Environment (development/production)

## Development

```bash
# Install dependencies
yarn install

# Run in dev mode
yarn dev

# Build
yarn build

# Run tests
yarn test
```

## API Endpoints

- `GET /live/*` - Proxy HLS manifest and segments
- `GET /healthz` - Health check
- `GET /metrics` - Get play/ad counts
- `POST /log/play` - Log a play event (body: `{trackId, metadata}`)
- `POST /log/ad` - Log an ad event (body: `{adId, event, metadata}`)

## CSV Format

### plays.csv
```
timestamp,event,trackId,metadata
2024-01-01T12:00:00.000Z,play,track-123,"metadata"
```

### ads.csv
```
timestamp,event,adId,metadata
2024-01-01T12:00:00.000Z,start,ad-456,"metadata"
```
