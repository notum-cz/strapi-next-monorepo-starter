# Trail Mixx Design Audit

## Design System

### Color Palette

**Primary Colors:**
- Deep Green: `#16a34a` (primary action, play button)
- Dark Green: `#15803d` (hover state)
- Green 900: `#14532d` (dark backgrounds)

**Secondary Colors:**
- Salmon/Rose: `#fb7185` (accent, highlights, live indicator)
- Basalt Gray: `#374151` (secondary text, borders)
- Gray 900: `#1a1a1a` (dark backgrounds)
- Gray 800: `#2d2d2d` (card backgrounds)

**Semantic Colors:**
- Error: `#ef4444` (error messages, alerts)
- Success: `#10b981` (success states)
- Warning: `#f59e0b` (warnings)
- Info: `#3b82f6` (informational)

**Neutrals:**
- White: `#ffffff` (text on dark)
- Gray 300: `#d1d5db` (secondary text on dark)
- Gray 400: `#9ca3af` (disabled text)

### Typography

**Font Stack:**
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
             'Helvetica Neue', Arial, sans-serif;
```

**Type Scale:**
- Heading 1: 60px / 3.75rem (font-bold, tracking-tight)
- Heading 2: 48px / 3rem (font-bold)
- Heading 3: 36px / 2.25rem (font-semibold)
- Heading 4: 24px / 1.5rem (font-semibold)
- Body Large: 20px / 1.25rem (font-normal)
- Body: 16px / 1rem (font-normal)
- Body Small: 14px / 0.875rem (font-normal)
- Caption: 12px / 0.75rem (font-normal)

**Line Heights:**
- Tight: 1.25 (headings)
- Normal: 1.5 (body text)
- Relaxed: 1.75 (long-form content)

### Spacing Scale
- xs: 4px (0.25rem)
- sm: 8px (0.5rem)
- md: 16px (1rem)
- lg: 24px (1.5rem)
- xl: 32px (2rem)
- 2xl: 48px (3rem)
- 3xl: 64px (4rem)

### Border Radius
- sm: 4px (0.25rem) - small elements
- md: 8px (0.5rem) - cards
- lg: 12px (0.75rem) - modals
- xl: 24px (1.5rem) - buttons
- full: 9999px - pills, badges

### Shadows
- sm: `0 1px 2px 0 rgb(0 0 0 / 0.05)`
- md: `0 4px 6px -1px rgb(0 0 0 / 0.1)`
- lg: `0 10px 15px -3px rgb(0 0 0 / 0.1)`
- xl: `0 20px 25px -5px rgb(0 0 0 / 0.1)`

## Component Design Patterns

### Player Component
**Hero Style:** Full-screen centered layout with gradient background

**Structure:**
```
┌─────────────────────────────────────┐
│                                     │
│         Trail Mixx (60px)           │
│   Community Radio · Streaming Live  │
│              (20px)                 │
│                                     │
│        ┌───────────────┐            │
│        │  Play Button  │ (48px h)   │
│        └───────────────┘            │
│                                     │
│        🔴 Live (animated)           │
│                                     │
│    Supporting local artists...      │
│          (14px gray)                │
│                                     │
└─────────────────────────────────────┘
```

**Button Design:**
- Size: 48px height × 128px width
- Border Radius: 24px (pill shape)
- Background: Green gradient on hover
- Shadow: Medium elevation
- Text: 18px bold
- Transition: 0.2s ease-in-out

### Layout Patterns

**Hero Layout:**
- Full viewport height (min-h-screen)
- Centered content (flex items-center justify-center)
- Gradient background (diagonal)
- Max content width: 800px
- Padding: 32px mobile, 64px desktop

**Card Layout:**
- Background: Gray 800 with transparency
- Border Radius: 12px
- Padding: 24px
- Shadow: Medium elevation
- Border: 1px solid Gray 700 (optional)

## Accessibility Standards

### WCAG 2.1 AA Compliance

**Color Contrast:**
- All text meets 4.5:1 minimum contrast ratio
- Large text (24px+) meets 3:1 minimum
- UI components meet 3:1 against adjacent colors

**Focus Indicators:**
- Visible outline: 3px solid
- Color: Primary Green or White (depending on background)
- Offset: 2px from element

**Keyboard Navigation:**
- All interactive elements focusable
- Logical tab order
- Skip links for screen readers
- ARIA landmarks (main, nav, aside)

**Screen Reader Support:**
- All images have alt text
- All buttons have aria-labels
- State changes announced
- Dynamic content uses aria-live

## Responsive Design

### Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Mobile-First Approach
- Base styles for mobile
- Progressive enhancement for larger screens
- Touch targets: 44px × 44px minimum
- No hover-only interactions

### Hero Layout Responsive
- Mobile: Stack vertically, reduce font sizes
- Tablet: Maintain stack, increase spacing
- Desktop: Full hero, maximum impact

## Animation & Motion

### Principles
- Purpose-driven (not decorative)
- Smooth and natural (easing functions)
- Respect prefers-reduced-motion
- Quick (200-300ms) for UI feedback
- Slower (500-1000ms) for page transitions

### Common Animations
- Button Hover: Scale(1.02) + shadow increase
- Live Indicator: Pulse animation (2s infinite)
- Loading: Spinner or skeleton
- Page Transitions: Fade (300ms)

### Motion Preferences
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## UX Design Decisions

### Player UX
**One-Click Playback:**
- Single play button (no complex controls)
- State clearly visible (playing vs paused)
- Loading state with spinner
- Error messages user-friendly

**Minimal Friction:**
- No login required to listen
- No splash screen or modal
- Direct access to content
- Fast load time (<3s)

### Information Hierarchy
1. Station name and branding (most prominent)
2. Playback control (primary action)
3. Live indicator (status feedback)
4. Mission statement (supporting info)

## Icon System

Using Lucide React icons:
- Play: `PlayCircle` or custom SVG
- Pause: `PauseCircle`
- Live: Custom animated dot
- Error: `AlertCircle`
- Loading: `Loader2` with spin

## Dark Mode First

Trail Mixx uses dark mode as the default and only theme:
- Easier on eyes for long listening sessions
- Better for nighttime use
- Modern aesthetic
- Energy efficient (OLED screens)

### Dark Background Colors
- Primary: Gray 900 (#1a1a1a)
- Secondary: Gray 800 (#2d2d2d)
- Elevated: Gray 700 (#374151)

### Text on Dark
- Primary: White (#ffffff) at 90% opacity
- Secondary: Gray 300 (#d1d5db)
- Tertiary: Gray 400 (#9ca3af)

## Component Library

### Shadcn/ui Components Used
- Button (customized for player)
- Alert (for error messages)
- Card (for content blocks)
- Badge (for tags/labels)
- Tooltip (for help text)

### Custom Components
- Player (main audio player)
- LiveIndicator (animated status)
- HeroGradient (background pattern)

## Performance Considerations

### Image Optimization
- Next.js Image component for all images
- WebP with fallbacks
- Lazy loading below fold
- Responsive images (srcset)

### CSS Optimization
- Tailwind CSS purge in production
- Critical CSS inline
- Non-critical CSS deferred
- No unused styles

### Loading Strategy
- Above-fold content first
- Progressive enhancement
- Skeleton loaders for async content
- Optimistic UI updates

## Brand Identity

### Voice & Tone
- Welcoming and inclusive
- Community-focused
- Authentic and genuine
- Energetic but not overwhelming

### Visual Identity
- Clean and modern
- Music-forward design
- Community connection evident
- Professional yet approachable

### Inspiration
- Spotify: Clean player UI, dark mode
- SoundCloud: Community focus
- Apple Music: Typography and spacing
- Local radio: Warmth and personality

## Design Principles

1. **Simplicity First:** Remove unnecessary complexity
2. **Accessibility Always:** Design for all users
3. **Performance Matters:** Fast load, smooth interactions
4. **Mobile Priority:** Touch-friendly, responsive
5. **Community Centered:** Reflect Trail Mixx values

## Future Design Considerations

### Phase 2 Features
- Now playing metadata display
- Waveform visualization
- Social sharing cards
- Event calendar integration
- Artist profiles

### Potential Enhancements
- Light mode theme toggle
- Custom theme builder
- Advanced player controls (speed, eq)
- Playlist visualization
- Interactive schedule grid
