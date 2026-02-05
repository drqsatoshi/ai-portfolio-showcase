# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## 🚀 BitChat - Decentralized P2P Mesh Chat

This portfolio includes **BitChat**, a fully functional decentralized peer-to-peer chat system with end-to-end encryption.

### Features

- 🔐 **End-to-End Encryption** using Web Crypto API (AES-256-GCM, ECDH, ECDSA)
- 🌐 **Mesh Networking** with message relay (up to 3 hops)
- 💬 **Real-time P2P Communication** via WebRTC data channels
- 🎭 **Privacy-First Design** - signaling server never sees message content
- 📱 **Responsive UI** with dark mode theme
- ⚡ **IRC-Style Commands** - `/nick`, `/join`, `/who`, `/clear`, `/help`

### Access BitChat

Once deployed, access BitChat at: **`/bitchat`**

For example: `https://your-domain.com/bitchat`

### Documentation

Comprehensive documentation is available in [`docs/BITCHAT.md`](docs/BITCHAT.md), including:
- Architecture overview
- Security implementation details
- User guide
- Development and deployment instructions

### Quick Start

1. Navigate to `/bitchat`
2. Enter a nickname and room name
3. Click "Join Chat"
4. Start chatting with other peers in the room

All messages are encrypted end-to-end - the signaling server only facilitates peer discovery and cannot read your messages.

---

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
