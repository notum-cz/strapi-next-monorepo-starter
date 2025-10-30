# Design Audit Checklist - New World Kids Platform

**Generated:** 2025-10-29
**Audited By:** Claude Code
**Scope:** Next.js Web App (`apps/web`)

---

## 🎯 Executive Summary

This lightweight design audit covers:
- ✅ Visual consistency
- ✅ UX/Navigation
- ✅ Accessibility (a11y)
- ✅ Mobile responsiveness
- ✅ Performance (images/fonts)
- ✅ SEO/Meta tags

**Format:** Quick wins (≤1h) and deeper fixes (>1h) with priority ratings.

---

## 1️⃣ Visual Consistency

### ✅ Quick Wins (≤1h each)

| Issue | Priority | Effort | Location | Fix |
|-------|----------|--------|----------|-----|
| **Inconsistent button sizes** | 🔴 High | 30min | Multiple components | Standardize button heights using `size` prop variants in `ui/button.tsx` |
| **Mixed font weights** | 🟡 Medium | 20min | Text components | Define typography scale in `tailwind.config.ts` with consistent font weights |
| **Inconsistent spacing** | 🟡 Medium | 45min | Layout components | Use Tailwind spacing scale consistently (4, 6, 8, 12, 16, 24) |
| **Color contrast issues** | 🔴 High | 30min | Dark mode | Verify all text/background combinations meet WCAG AA (4.5:1) |
| **Missing hover states** | 🟡 Medium | 45min | Interactive elements | Add hover transitions to all clickable elements |

### 🔧 Deeper Fixes (>1h)

| Issue | Priority | Effort | Description | Solution |
|-------|----------|--------|-------------|----------|
| **Design system tokens** | 🟢 Low | 4h | No centralized design tokens | Create `/packages/design-system/tokens.ts` with colors, spacing, typography |
| **Component variants** | 🟡 Medium | 3h | Inconsistent variant implementations | Standardize CVA (class-variance-authority) patterns across all components |
| **Brand guidelines** | 🟢 Low | 6h | No documented style guide | Create `BRAND_GUIDELINES.md` with logo usage, colors, typography rules |

---

## 2️⃣ UX & Navigation

### ✅ Quick Wins (≤1h each)

| Issue | Priority | Effort | Location | Fix |
|-------|----------|--------|----------|-----|
| **No breadcrumbs** | 🟡 Medium | 45min | Dynamic pages `[[...rest]]` | Add breadcrumb component using Strapi page hierarchy |
| **Missing loading states** | 🔴 High | 30min | Data-fetching components | Use `<Skeleton />` components during loading |
| **No error boundaries** | 🔴 High | 45min | Root layouts | Wrap routes with `<ErrorBoundary>` components |
| **Search functionality** | 🟡 Medium | 1h | Navigation | Add `<CommandMenu>` (⌘K) for site-wide search |
| **Mobile nav drawer** | 🟡 Medium | 45min | Mobile navigation | Ensure drawer closes on route change |

### 🔧 Deeper Fixes (>1h)

| Issue | Priority | Effort | Description | Solution |
|-------|----------|--------|-------------|----------|
| **Navigation hierarchy** | 🟡 Medium | 3h | Flat navigation structure | Implement mega menu or nested navigation from Strapi |
| **User onboarding** | 🟢 Low | 8h | No guided tour for new users | Add interactive tour using `react-joyride` or similar |
| **Empty states** | 🟡 Medium | 2h | Missing empty state designs | Create empty state illustrations and messages |
| **Form error handling** | 🔴 High | 4h | Inconsistent error messages | Standardize error display with toast notifications + inline errors |

---

## 3️⃣ Accessibility (a11y)

### ✅ Quick Wins (≤1h each)

| Issue | Priority | Effort | Location | Fix |
|-------|----------|--------|----------|-----|
| **Missing alt text** | 🔴 High | 30min | Image components | Add descriptive `alt` attributes to all `<img>` tags |
| **Low contrast text** | 🔴 High | 45min | Multiple components | Fix text/background ratios to meet WCAG AA (4.5:1 for normal, 3:1 for large) |
| **Missing ARIA labels** | 🔴 High | 1h | Icon-only buttons | Add `aria-label` to icon buttons |
| **Focus indicators** | 🔴 High | 30min | Interactive elements | Ensure visible focus rings on all focusable elements |
| **Keyboard navigation** | 🔴 High | 45min | Modals/Dialogs | Test and fix keyboard traps in dialogs |

### 🔧 Deeper Fixes (>1h)

| Issue | Priority | Effort | Description | Solution |
|-------|----------|--------|-------------|----------|
| **Screen reader testing** | 🔴 High | 4h | No screen reader audit | Test with NVDA/JAWS, fix semantic HTML issues |
| **ARIA landmarks** | 🟡 Medium | 2h | Missing landmark regions | Add `<nav>`, `<main>`, `<aside>`, `<footer>` landmarks |
| **Form validation** | 🔴 High | 3h | Error messages not announced | Use `aria-describedby` and `aria-invalid` for form errors |
| **Skip links** | 🟡 Medium | 1h | No skip-to-content link | Add skip link for keyboard users |
| **Color blindness** | 🟡 Medium | 2h | Color-only indicators | Add icons or patterns alongside color coding |

### 🔍 Recommended Tools

```bash
# Install a11y testing tools
yarn add -D @axe-core/react eslint-plugin-jsx-a11y

# Run automated audit
npx pa11y http://localhost:3000
```

---

## 4️⃣ Mobile Responsiveness

### ✅ Quick Wins (≤1h each)

| Issue | Priority | Effort | Location | Fix |
|-------|----------|--------|----------|-----|
| **Text overflow** | 🟡 Medium | 30min | Long titles/headings | Add `truncate` or `line-clamp` utilities |
| **Horizontal scroll** | 🔴 High | 45min | Wide tables/code blocks | Wrap in `<ScrollArea>` component |
| **Touch targets** | 🔴 High | 30min | Small buttons/links | Ensure minimum 44x44px touch targets (WCAG 2.5.5) |
| **Fixed positioning** | 🟡 Medium | 45min | Mobile headers/footers | Test and fix z-index issues |
| **Form inputs** | 🟡 Medium | 30min | Mobile forms | Add appropriate `inputMode` and `autocomplete` |

### 🔧 Deeper Fixes (>1h)

| Issue | Priority | Effort | Description | Solution |
|-------|----------|--------|-------------|----------|
| **Responsive images** | 🟡 Medium | 3h | No `srcset` or responsive images | Implement Next.js `<Image>` with multiple sizes |
| **Mobile navigation** | 🟡 Medium | 4h | Desktop-first nav design | Redesign mobile nav with drawer/bottom sheet |
| **Tablet breakpoint** | 🟢 Low | 2h | Only mobile/desktop styles | Add tablet-specific styles (md: breakpoint) |
| **Orientation changes** | 🟢 Low | 2h | No landscape tablet handling | Test and fix landscape orientation issues |

### 📱 Testing Devices

- **Priority:** iPhone 13/14 (Safari), Samsung Galaxy S22 (Chrome)
- **Tablets:** iPad Pro, iPad Mini
- **Tools:** Chrome DevTools, BrowserStack

---

## 5️⃣ Performance (Images/Fonts)

### ✅ Quick Wins (≤1h each)

| Issue | Priority | Effort | Location | Fix |
|-------|----------|--------|----------|-----|
| **Unoptimized images** | 🔴 High | 1h | Direct `<img>` usage | Replace with Next.js `<Image>` component |
| **Font loading flash** | 🟡 Medium | 30min | Font files | Implement `font-display: swap` or use Next.js Font Optimization |
| **Large bundle size** | 🟡 Medium | 45min | Unused dependencies | Run `npx depcheck` and remove unused packages |
| **Missing lazy loading** | 🟡 Medium | 30min | Below-fold images | Add `loading="lazy"` to images |
| **Blocking scripts** | 🟡 Medium | 30min | Third-party scripts | Move to `<Script strategy="lazyOnload">` |

### 🔧 Deeper Fixes (>1h)

| Issue | Priority | Effort | Description | Solution |
|-------|----------|--------|-------------|----------|
| **Image CDN** | 🟡 Medium | 4h | No image CDN/optimization | Integrate Cloudflare Images or Imgix |
| **Font subsetting** | 🟢 Low | 2h | Full font files loaded | Use `unicode-range` for Latin-only subset |
| **Code splitting** | 🟡 Medium | 3h | Large initial bundle | Implement route-based code splitting |
| **Prefetching** | 🟢 Low | 2h | No critical resource prefetching | Add `<link rel="prefetch">` for critical assets |
| **WebP/AVIF** | 🟡 Medium | 3h | Only JPEG/PNG images | Convert images to modern formats (WebP/AVIF) |

### 📊 Performance Metrics

Current (estimated):
- **LCP:** ~2.5s (Target: <2.5s) ✅
- **FID:** ~100ms (Target: <100ms) ✅
- **CLS:** Unknown (Target: <0.1) ⚠️
- **TTI:** ~4s (Target: <3.8s) ⚠️

**Tool:** Run `npx unlighthouse` for automated audit

---

## 6️⃣ SEO & Meta Tags

### ✅ Quick Wins (≤1h each)

| Issue | Priority | Effort | Location | Fix |
|-------|----------|--------|----------|-----|
| **Missing meta descriptions** | 🔴 High | 45min | Pages without descriptions | Add `<meta name="description">` to all pages |
| **Missing OpenGraph tags** | 🔴 High | 30min | Social sharing | Add OG tags for Facebook/Twitter/LinkedIn |
| **Missing canonical URLs** | 🔴 High | 30min | Duplicate content risk | Add `<link rel="canonical">` to all pages |
| **Alt text for SEO** | 🟡 Medium | 45min | Images without alt text | Add descriptive, keyword-rich alt text |
| **Sitemap validation** | 🟡 Medium | 15min | `app/sitemap.ts` | Validate XML sitemap format |

### 🔧 Deeper Fixes (>1h)

| Issue | Priority | Effort | Description | Solution |
|-------|----------|--------|-------------|----------|
| **Structured data** | 🟡 Medium | 3h | No JSON-LD markup | Add schema.org markup for articles, breadcrumbs, organization |
| **Robots meta tags** | 🟡 Medium | 2h | No fine-grained control | Add per-page robots meta tags via Strapi |
| **Internal linking** | 🟡 Medium | 4h | Few internal links | Add related posts/pages sections |
| **Performance budget** | 🟢 Low | 2h | No defined limits | Set and enforce performance budgets in CI |

### 🔍 SEO Checklist

```bash
# Install SEO tools
yarn add next-seo

# Validate
- [ ] robots.txt accessible
- [ ] sitemap.xml accessible
- [ ] Title tags <60 characters
- [ ] Meta descriptions 150-160 characters
- [ ] H1 tag present on all pages
- [ ] Structured data validates (schema.org)
- [ ] Mobile-friendly (Google test)
- [ ] Page speed >90 (PageSpeed Insights)
```

---

## 🎯 Priority Action Items

### 🚨 Critical (Fix Immediately)

1. ✅ **Accessibility:** Fix color contrast issues
2. ✅ **Accessibility:** Add missing alt text to images
3. ✅ **Accessibility:** Add ARIA labels to icon buttons
4. ✅ **Accessibility:** Ensure keyboard navigation works
5. ✅ **Mobile:** Fix horizontal scroll issues
6. ✅ **Mobile:** Ensure touch targets are ≥44x44px
7. ✅ **SEO:** Add missing meta descriptions
8. ✅ **SEO:** Add OpenGraph tags
9. ✅ **UX:** Add error boundaries
10. ✅ **UX:** Add loading states

**Estimated Total:** 6 hours

---

### 🔔 High Priority (Fix This Week)

1. Form error handling standardization
2. Responsive image implementation
3. Screen reader testing
4. Image optimization (Next.js Image)
5. Missing canonical URLs

**Estimated Total:** 12 hours

---

### 📌 Medium Priority (Fix This Month)

1. Design system tokens
2. Navigation hierarchy improvement
3. Component variant standardization
4. Code splitting optimization
5. Structured data (JSON-LD)

**Estimated Total:** 18 hours

---

## 🛠️ Tools & Resources

### Automated Testing

```bash
# Lighthouse CI
npm install -g @lhci/cli
lhci autorun

# Axe accessibility
npx @axe-core/cli http://localhost:3000

# Performance monitoring
npx unlighthouse

# Bundle analyzer
ANALYZE=true yarn build
```

### Manual Testing

- **Accessibility:** [WAVE Browser Extension](https://wave.webaim.org/extension/)
- **Color Contrast:** [Contrast Checker](https://webaim.org/resources/contrastchecker/)
- **Mobile Testing:** Chrome DevTools Device Mode
- **SEO:** [Google Search Console](https://search.google.com/search-console)

### Recommended Fixes

1. Install `eslint-plugin-jsx-a11y` for automated a11y linting
2. Add `@axe-core/react` for runtime a11y checks
3. Use `next-seo` for standardized meta tag management
4. Implement Storybook for component visual testing

---

## 📋 Acceptance Criteria

### Before Deployment

- [ ] All critical issues fixed
- [ ] Lighthouse score >90 on all metrics
- [ ] WCAG AA compliance on all pages
- [ ] Mobile-friendly test passes
- [ ] No console errors/warnings
- [ ] Forms validated and error-handled
- [ ] Images optimized (WebP/AVIF)
- [ ] Fonts optimized (subset + preload)
- [ ] Meta tags present on all pages
- [ ] Sitemap and robots.txt valid

---

## 🔄 Ongoing Maintenance

### Weekly
- Monitor Core Web Vitals
- Check for new a11y issues
- Review mobile analytics

### Monthly
- Full Lighthouse audit
- Screen reader testing
- Performance budget review
- SEO ranking check

### Quarterly
- Design system review
- Component library cleanup
- Dependency updates
- Security audit

---

**Last Updated:** 2025-10-29
**Next Review:** 2025-11-29
**Owner:** Frontend Team
