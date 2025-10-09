# Mobile Optimization Quick Reference

## Quick Start

### Using Mobile Components

```tsx
// Touch-optimized button
import { TouchButton } from '@/components/ui/TouchButton'

<TouchButton variant="primary" size="lg" loading={isLoading}>
  Submit
</TouchButton>

// Responsive image with lazy loading
import { LazyImage } from '@/components/ui/ResponsiveImage'

<LazyImage 
  src="/path/to/image.jpg" 
  alt="Description"
  aspectRatio="16/9"
/>

// Loading states
import { LoadingSpinner, CardSkeleton } from '@/components/ui/LoadingSpinner'

{loading ? <CardSkeleton /> : <YourContent />}
```

### Using Mobile Hooks

```tsx
import { useMobile, useNetworkStatus } from '@/lib/hooks/useMobile'

function MyComponent() {
  const { isMobile, isTouch } = useMobile()
  const { isOnline, connectionType } = useNetworkStatus()
  
  return (
    <div>
      {isMobile && <MobileView />}
      {!isOnline && <OfflineMessage />}
    </div>
  )
}
```

### Image Optimization

```tsx
import { optimizeImage } from '@/lib/utils/imageOptimization'

async function handleImageUpload(file: File) {
  const optimized = await optimizeImage(file, {
    maxWidth: 1920,
    quality: 0.8,
    format: 'webp'
  })
  // Upload optimized blob
}
```

## Responsive Breakpoints

```css
/* Mobile First (default) */
.class { /* 0px - 639px */ }

/* Tablet */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }

/* Desktop */
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

## Touch Target Sizes

```tsx
// Minimum touch target: 44x44px
<button className="min-h-[44px] min-w-[44px] px-4 py-3">
  Click me
</button>

// Use TouchButton for automatic sizing
<TouchButton size="md"> {/* min-h-[44px] */ }
  Click me
</TouchButton>
```

## PWA Features

### Check if installed
```tsx
const isInstalled = window.matchMedia('(display-mode: standalone)').matches
```

### Register service worker
```tsx
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
}
```

### Check online status
```tsx
const isOnline = navigator.onLine
window.addEventListener('online', handleOnline)
window.addEventListener('offline', handleOffline)
```

## Performance Tips

### Lazy load images
```tsx
<img 
  loading="lazy" 
  decoding="async"
  src="/image.jpg" 
  alt="Description"
/>
```

### Optimize animations
```css
/* Use transform and opacity for 60fps */
.animate {
  transform: translateX(0);
  opacity: 1;
  transition: transform 0.2s, opacity 0.2s;
}

/* Avoid animating layout properties */
/* ❌ width, height, top, left */
/* ✅ transform, opacity */
```

### Reduce motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Common Patterns

### Mobile navigation
```tsx
<nav className="flex items-center gap-6">
  <Link href="/dashboard" className="flex items-center gap-2">
    <Icon className="w-4 h-4" />
    <span className="hidden sm:inline">Dashboard</span>
  </Link>
</nav>
```

### Responsive grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>
```

### Full-width on mobile
```tsx
<div className="w-full md:max-w-2xl mx-auto">
  <Form />
</div>
```

### Stack on mobile, row on desktop
```tsx
<div className="flex flex-col md:flex-row gap-4">
  <div>Left</div>
  <div>Right</div>
</div>
```

## Testing Commands

```bash
# Build for production
npm run build

# Check bundle size
npm run build -- --analyze

# Run Lighthouse audit
npx lighthouse http://localhost:3000 --view

# Test on mobile device
# Use ngrok or similar to expose localhost
npx ngrok http 3000
```

## Debugging

### Check service worker
```javascript
// In DevTools Console
navigator.serviceWorker.getRegistrations()
  .then(registrations => console.log(registrations))

// Check cache
caches.keys().then(keys => console.log(keys))
```

### Check PWA manifest
```javascript
// In DevTools Console
fetch('/manifest.json')
  .then(r => r.json())
  .then(manifest => console.log(manifest))
```

### Monitor performance
```javascript
// In DevTools Console
performance.getEntriesByType('navigation')
performance.getEntriesByType('paint')
```

## Checklist

Before deploying:
- [ ] Test on real mobile devices
- [ ] Run Lighthouse audit (score > 90)
- [ ] Check touch targets (min 44x44px)
- [ ] Verify PWA installable
- [ ] Test offline mode
- [ ] Check image optimization
- [ ] Verify no horizontal scroll
- [ ] Test with slow network (3G)
- [ ] Check accessibility (screen reader)
- [ ] Verify safe area insets (notched devices)

## Resources

- [Mobile Optimization Guide](./MOBILE_OPTIMIZATION_GUIDE.md)
- [Test Guide](./TASK_15_TEST_GUIDE.md)
- [Task Summary](./TASK_15_SUMMARY.md)
- [Tailwind Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Web.dev PWA](https://web.dev/progressive-web-apps/)
