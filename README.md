# Next.js Frontend For Mastodon

A minimal, performant social media frontend for Mastodon built with Next.js 16 and modern React patterns.

## Browser Requirements

**⚠️ Important:** This project uses modern CSS patterns with limited browser availability and recently established baseline features. For the best experience and to showcase all features properly, please use the **latest version of Chrome** or other Chromium-based browsers.

Other browsers may not fully support some of the cutting-edge CSS features used in this project.

**⚠️ cookieStore API:** This project uses the [cookieStore API](https://developer.mozilla.org/en-US/docs/Web/API/CookieStore) for cookie management, which is a newly available baseline feature (2025). Older browsers may not support this API.

## Performance Highlights

- **Virtualized Lists**: Optimized list rendering using [TanStack Virtual](https://tanstack.com/virtual) for smooth scrolling performance with large datasets
- **Data Fetching & Caching**: Efficient data management with [TanStack Query](https://tanstack.com/query) for smart caching, background refetching, and optimistic updates

## TanStack Virtual Patch (Temporary)

> **Note:** This project includes a patch for `@tanstack/react-virtual` to fix a React 19 compatibility issue ([#1094](https://github.com/TanStack/virtual/issues/1094)). The patch is automatically applied via `patch-package` during install. Once [PR #1098](https://github.com/TanStack/virtual/pull/1098) is merged and released, the patch can be removed.

## Project Information

For detailed project structure, architecture, and technical documentation, see [CLAUDE.md](CLAUDE.md).

## Support

<a href="https://www.buymeacoffee.com/">
  <img src="buy-me-coffee.png" alt="Buy Me A Coffee" width="200" />
</a>