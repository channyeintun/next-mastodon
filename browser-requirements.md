# Browser Requirements & Compatibility

This document outlines browser compatibility requirements and known limitations for the Mastodon Next.js Client.

## Recommended Browsers

For the best experience, we recommend using the **latest version of Chrome** or other Chromium-based browsers (Edge, Brave, Arc, etc.).

## Modern Web APIs Used

This project leverages cutting-edge web technologies to provide the best possible experience:

### Cookie Store API

This project uses the [Cookie Store API](https://developer.mozilla.org/en-US/docs/Web/API/CookieStore) for modern, asynchronous cookie management. This is a baseline feature as of 2025.

**Compatibility**: Chrome 87+, Edge 87+, Opera 73+

### Scroll Anchoring

Native CSS scroll anchoring (`overflow-anchor`) is used for visual stability on chronological feeds and status pages. This prevents "jumps" when content loads above the current scroll position.

**Known Limitation**: [Not yet supported in Safari](https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-anchor#browser_compatibility). Safari users may experience scroll position shifts when content loads dynamically.

### Scroll-State Container Queries

Advanced CSS container queries with scroll-state are used for responsive UI elements based on scroll position.

**Compatibility**: Most modern Chromium-based browsers. Limited support in Safari and Firefox.

### Service Workers & Push Notifications

PWA features including push notifications require Service Worker support.

**Compatibility**: All modern browsers support Service Workers.

## CSS Features

This project uses modern CSS features including:

- CSS Custom Properties (CSS Variables)
- CSS Container Queries
- CSS Nesting
- View Transitions API
- Open Props design tokens

## Workarounds & Fallbacks

We've implemented fallbacks where possible, but some features may have reduced functionality in non-Chromium browsers. If you encounter issues, please [open an issue](https://github.com/channyeintun/next-mastodon/issues) with your browser details.
