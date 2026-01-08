# <img src="https://joinmastodon.org/logos/logo-purple.svg" alt="Mastodon" height="32" /> Mastodon Next.js Client

<div align="center">

<img src="https://joinmastodon.org/logos/logo-purple.svg" alt="Mastodon Logo" width="120" />

**A beautiful, fast, and modern web client for Mastodon**

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Bun](https://img.shields.io/badge/Bun-Runtime-f9f1e1?logo=bun)](https://bun.sh/)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)

[Features](#-features) • [Quick Start](#-quick-start) • [Tech Stack](#-tech-stack) • [Contributing](#-contributing) • [Support](#-support)

</div>

---

## ✨ Features

### 🚀 **Performance First**
- **Virtualized Lists** — Smooth scrolling with large datasets using TanStack Virtual
- **React Compiler** — Automatic memoization for optimized re-renders
- **Optimistic Updates** — Instant UI feedback on all interactions
- **Smart Caching** — Efficient data management with TanStack Query

### ⚡ **Real-Time Experience**
- **WebSocket Streaming** — Live updates for notifications and conversations
- **Push Notifications** — Never miss a mention with PWA notifications
- **Notification Sounds** — Audio alerts for real-time updates

### 💬 **Modern Chat Interface**
- **Messenger-Style DMs** — Beautiful chat bubbles for direct messages
- **Real-Time Conversations** — Instant message delivery and updates
- **Quick Compose** — Start conversations with anyone

### 🎨 **Beautiful Design**
- **Dark Mode** — Easy on the eyes, any time of day
- **Open Props** — Modern design tokens for consistent styling
- **Responsive** — Optimized for mobile, tablet, and desktop
- **Skeleton Loaders** — Smooth loading states throughout

### 🌍 **Internationalization**
- **10 Languages** — English, German, Spanish, French, Japanese, Korean, Burmese, Thai, Vietnamese, Chinese

### 📊 **Wrapstodon**
- **Year in Review** — Discover your Mastodon personality and stats
- **Shareable Cards** — Show off your Mastodon journey

### 🔒 **Privacy & Safety**
- **Content Filters** — Customize what you see
- **Blocks & Mutes** — Control your experience
- **Report System** — Multi-step, category-based reporting

### 📱 **PWA Ready**
- **Installable** — Add to home screen on any device
- **Offline Support** — Cached emojis and data

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/channyeintun/mastodon-nextjs-client.git
cd mastodon-nextjs-client

# Install dependencies (using Bun for speed)
bun install

# Start development server
bun run dev

# Build for production
bun run build
```

The app will be available at `http://localhost:9003`

---

## 🛠 Tech Stack

| Category | Technologies |
|----------|-------------|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Runtime** | React 19 with React Compiler |
| **State Management** | TanStack Query + MobX |
| **Styling** | Emotion + Open Props |
| **Rich Text** | Tiptap with custom extensions |
| **Virtualization** | TanStack Virtual |
| **Forms** | React Hook Form + Zod |
| **Build** | Bun |

---

## 📁 Project Structure

```
src/
├── app/           # Next.js App Router pages
├── api/           # Mastodon API client & TanStack Query
├── components/    # Atomic Design (atoms → molecules → organisms)
├── hooks/         # Custom React hooks
├── stores/        # MobX global state
├── lib/           # Libraries (Tiptap extensions, IndexedDB)
├── types/         # TypeScript type definitions
└── utils/         # Utility functions
```

For detailed architecture documentation, see [CLAUDE.md](CLAUDE.md).

---

## 🤝 Contributing

We welcome contributions! Whether it's:

- 🐛 **Bug fixes** — Found something broken? Let's fix it!
- ✨ **Features** — Have an idea? Open an issue to discuss
- 📖 **Documentation** — Help others understand the project
- 🌍 **Translations** — Help us reach more users

Check out our [Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md) for guidelines.

---

## 📚 Documentation

- [**CLAUDE.md**](CLAUDE.md) — Architecture & technical docs
- [**Browser Requirements**](browser-requirements.md) — Browser compatibility info

---

## 💖 Support

If you find this project useful, consider:

<a href="https://www.buymeacoffee.com/">
  <img src="buy-me-coffee.png" alt="Buy Me A Coffee" width="200" />
</a>

**⭐ Star this repo** — It helps others discover the project!

---

## 📄 License

[MIT](LICENSE) © 2025 Chan Nyein Tun

---

<div align="center">

**Made with ❤️ for the Fediverse**

</div>
