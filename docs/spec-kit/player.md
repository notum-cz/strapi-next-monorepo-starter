# Trail Mixx Player - Specification & Acceptance Criteria

## Functional Requirements

### FR-1: HLS Stream Playback
**Priority:** P0 (Critical)

The player MUST support HLS (HTTP Live Streaming) playback with the following:
- ✅ Native HLS on Safari (iOS/macOS)
- ✅ hls.js fallback for Chrome, Firefox, Edge
- ✅ Automatic detection and selection of playback method
- ✅ Graceful degradation to MP3 fallback when HLS unavailable

**Acceptance Criteria:**
- [ ] Player loads HLS manifest from `src` prop within 2 seconds
- [ ] Audio begins playing within 3 seconds of user clicking play
- [ ] Playback continues without interruption for 5 minutes minimum
- [ ] Browser support verified: Safari 14+, Chrome 90+, Firefox 88+, Edge 90+

### FR-2: Playback Controls
**Priority:** P0 (Critical)

The player MUST provide basic playback controls:
- ✅ Play/Pause button
- ✅ Visual feedback for playing vs paused state
- ✅ Loading indicator during buffering

**Acceptance Criteria:**
- [ ] Clicking play button starts playback
- [ ] Clicking pause button stops playback
- [ ] Button shows appropriate label based on state
- [ ] Loading spinner appears during buffer/load
- [ ] State changes are reflected within 100ms

### FR-3: Error Handling & Recovery
**Priority:** P0 (Critical)

The player MUST handle errors gracefully:
- ✅ Network errors trigger retry with exponential backoff
- ✅ Media errors attempt recovery via hls.recoverMediaError()
- ✅ Fatal errors display user-friendly message
- ✅ Fallback to MP3 stream when HLS fails completely

**Acceptance Criteria:**
- [ ] Network interruption triggers retry (max 3 attempts)
- [ ] Stall recovery time ≤ 2 seconds
- [ ] Error message displayed in user's locale
- [ ] Fallback MP3 activates after HLS failure
- [ ] User can manually retry after error

### FR-4: Bilingual Support
**Priority:** P1 (High)

The player MUST support English and Spanish:
- ✅ All UI text translatable via `locale` prop
- ✅ Complete translations for: Play, Pause, Loading, Live, Error messages
- ✅ Locale can be changed without remounting component

**Acceptance Criteria:**
- [ ] Setting `locale="en"` shows English text
- [ ] Setting `locale="es"` shows Spanish text
- [ ] All visible text is translated (no mixed languages)
- [ ] ARIA labels match visible text language

### FR-5: Ad Event Hooks
**Priority:** P1 (High)

The player MUST provide callbacks for ad events:
- ✅ `onAdStart` callback when ad playback begins
- ✅ `onAdEnd` callback when ad playback completes
- ✅ Ad metadata passed to callbacks (if available)

**Acceptance Criteria:**
- [ ] onAdStart fires within ±150ms of ad start
- [ ] onAdEnd fires within ±150ms of ad end
- [ ] Callbacks receive ad ID and duration
- [ ] Multiple listeners can subscribe to events

### FR-6: Accessibility
**Priority:** P0 (Critical)

The player MUST meet WCAG 2.1 AA standards:
- ✅ Keyboard navigation (Space/Enter for play/pause)
- ✅ ARIA labels on all interactive elements
- ✅ Screen reader announces state changes
- ✅ Focus indicators visible (3px outline, 4.5:1 contrast)
- ✅ Color contrast ≥ 4.5:1 for text

**Acceptance Criteria:**
- [ ] Tab key navigates to play button
- [ ] Space/Enter key toggles play/pause
- [ ] Screen reader announces "Play" or "Pause" on state change
- [ ] Focus outline visible on button focus
- [ ] Automated accessibility audit passes (axe-core)

## Performance Requirements

### PERF-1: Load Performance
- **LCP (Largest Contentful Paint):** ≤ 2.5 seconds
- **FID (First Input Delay):** ≤ 100 milliseconds
- **CLS (Cumulative Layout Shift):** ≤ 0.1
- **Time to Interactive:** ≤ 3.5 seconds

**Measurement:**
- Lighthouse CI in GitHub Actions
- Real User Monitoring (RUM) in production

### PERF-2: Runtime Performance
- **Memory Usage:** ≤ 50 MB (hls.js + audio buffer)
- **CPU Usage:** ≤ 10% average on mid-tier devices
- **Bundle Size:** ≤ 150 KB (player component + hls.js)

**Measurement:**
- Chrome DevTools Performance profiler
- Webpack Bundle Analyzer

### PERF-3: Network Resilience
- **Stall Recovery:** ≤ 2 seconds from detection to playback resume
- **Retry Attempts:** 3 attempts with exponential backoff (1s, 2s, 4s)
- **Fallback Activation:** ≤ 5 seconds from HLS failure to MP3 playback

**Measurement:**
- Network throttling tests (3G, offline simulation)
- Automated Playwright tests

## Security Requirements

### SEC-1: Content Security
- Validate HLS manifest before parsing
- Sanitize error messages (no sensitive data exposure)
- HTTPS required for production streams

### SEC-2: Privacy
- No tracking without consent
- No cookies in embedded widget
- Respect Do Not Track header

## Browser Compatibility Matrix

| Browser          | Version | Native HLS | hls.js | Status   |
|------------------|---------|------------|--------|----------|
| Safari (iOS)     | 14+     | ✅          | N/A    | ✅ Tested |
| Safari (macOS)   | 14+     | ✅          | N/A    | ✅ Tested |
| Chrome (Desktop) | 90+     | ❌          | ✅      | ✅ Tested |
| Chrome (Android) | 90+     | ❌          | ✅      | ✅ Tested |
| Firefox          | 88+     | ❌          | ✅      | ✅ Tested |
| Edge             | 90+     | ❌          | ✅      | ✅ Tested |

## Test Plan

### Unit Tests
- [x] Play/pause toggling
- [x] Locale switching
- [x] Error state rendering
- [ ] Ad callback invocation
- [ ] Volume control

### Integration Tests (Playwright)
- [ ] HLS stream loads and plays
- [ ] Fallback to MP3 on HLS failure
- [ ] Network interruption recovery
- [ ] Keyboard navigation
- [ ] Screen reader compatibility

### Performance Tests
- [ ] Lighthouse CI on /listen page
- [ ] Bundle size < 150 KB
- [ ] Memory usage < 50 MB after 10 min playback

### Accessibility Tests
- [ ] axe-core automated scan (0 violations)
- [ ] Keyboard-only navigation
- [ ] VoiceOver (macOS) testing
- [ ] NVDA (Windows) testing

## Known Issues & Limitations

### v1.0.0
- No volume control UI (uses device volume)
- No playlist/queue support
- No offline caching
- No Chromecast support
- Spanish translations are basic (need review by native speaker)

### Future Enhancements (v2.0.0)
- Visual waveform display
- Now playing metadata
- Share functionality
- Download for offline
- Apple CarPlay / Android Auto integration

## Acceptance Sign-Off

### Development Team
- [ ] All P0 requirements implemented
- [ ] All P1 requirements implemented
- [ ] Unit test coverage > 80%
- [ ] Integration tests passing

### QA Team
- [ ] Manual testing completed on all supported browsers
- [ ] Accessibility audit passed
- [ ] Performance benchmarks met
- [ ] Security review completed

### Product Owner
- [ ] User acceptance testing passed
- [ ] Documentation complete
- [ ] Deployment plan approved
- [ ] Go/no-go decision

## Deployment Checklist

- [ ] Environment variables configured (.env.example documented)
- [ ] HLS origin URL set correctly
- [ ] Fallback MP3 URL configured
- [ ] CDN for hls.js configured (or bundled)
- [ ] Error monitoring (Sentry) configured
- [ ] Analytics events wired up
- [ ] Rollback plan documented
- [ ] Support team briefed
