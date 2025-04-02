# 🐳 ghcr-badge: Generate GitHub Container Registry Status Badges

![GitHub license](https://img.shields.io/github/license/yuchanns/ghcr-badge-worker?style=flat-square)
![Cloudflare Worker](https://img.shields.io/badge/Cloudflare-Worker-orange?style=flat-square&logo=cloudflare)

A lightweight Cloudflare Worker implementation that generates beautiful status badges for your GitHub Container Registry images. Based on [eggplants/ghcr-badge](https://github.com/eggplants/ghcr-badge).

## ✨ Features

- 📊 Display container tags in a clean badge
- 🏷️ Show latest tag information
- 📦 Show container image size
- 🎨 Customizable badge colors and labels
- ⚡ Fast and reliable with Cloudflare's global network

## 🤔 Motivation

The original site for eggplants/ghcr-badge is ~~no longer available~~ often stops working at the end of the month due to the free quota [#195 (comment)](https://github.com/eggplants/ghcr-badge/issues/195#issuecomment-2566003093), creating a need for a self-hosted solution. Cloudflare Workers provide an ideal serverless platform for this service, offering reliability and global distribution.

## 🛠️ Deployment

### Prerequisites
- A Cloudflare account
- Node.js and pnpm installed

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/yuchanns/ghcr-badge-worker
   cd ghcr-badge-worker
   ```

2. Install dependencies and deploy:
   ```bash
   pnpm install
   pnpm run deploy  # You'll be prompted to log in to Cloudflare
   ```

3. Your badge service will be available at `https://your-worker-url.workers.dev`

## 📚 Usage Guide

### Available Endpoints

#### 1️⃣ Display Multiple Tags
```
/:owner/:repo/tags?color=...&ignore=...&n=...&label=...&trim=...
```

**Parameters:**
- `color`: Badge color (default: `#44cc11`)
- `ignore`: Tag to ignore (default: `latest`)
- `n`: Number of tags to display (default: `3`)
- `label`: Badge label (default: `image tags`)
- `trim`: Tag trimming option

**Example:**  
![Tag Example](https://ghcr-badge.yuchanns.xyz/containerd/nerdctl/tags?ignore=latest)
```
https://ghcr-badge.yuchanns.xyz/containerd/nerdctl/tags?ignore=latest
```

#### 2️⃣ Display Latest Tag
```
/:owner/:repo/latest_tag?color=...&ignore=...&label=...&trim=...
```

**Parameters:**
- `color`: Badge color (default: `#44cc11`)
- `ignore`: Tag to ignore (default: `latest`)
- `label`: Badge label (default: `version`)
- `trim`: Tag trimming option

**Example:**  
![Latest Tag Example](https://ghcr-badge.yuchanns.xyz/containerd/nerdctl/latest_tag?label=latest)
```
https://ghcr-badge.yuchanns.xyz/containerd/nerdctl/latest_tag?label=latest
```

#### 3️⃣ Display Image Size
```
/:owner/:repo/size?color=...&tag=...&label=...&trim=...
```

**Parameters:**
- `color`: Badge color (default: `#44cc11`)
- `tag`: Tag to check size for (default: `latest`)
- `label`: Badge label (default: `image size`)
- `trim`: Tag trimming option

**Example:**  
![Size Example](https://ghcr-badge.yuchanns.xyz/containerd/nerdctl/size)
```
https://ghcr-badge.yuchanns.xyz/containerd/nerdctl/size
```

## 📝 Add to Your README

```markdown
![Container Tags](https://your-worker-url.workers.dev/username/repo/tags)
![Latest Version](https://your-worker-url.workers.dev/username/repo/latest_tag)
![Image Size](https://your-worker-url.workers.dev/username/repo/size)
```

## 📄 License

This project is licensed under the Apache License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/yuchanns">yuchanns</a>
</p>
