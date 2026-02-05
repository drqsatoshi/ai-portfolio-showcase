# AI Research Portfolio Showcase

## Project info

A modern portfolio website showcasing AI research publications, built as a CS50 2025 final project by Josef Kurk Edwards.

**Repository**: https://github.com/drqsatoshi/ai-portfolio-showcase

**Live Site**: https://drqsatoshin.com

## About the Project

This portfolio website features:
- Research publications on PMLL, Recursive Transformers, and computational complexity
- Interactive search functionality for filtering research papers
- Skills and expertise showcase
- Web3 token integration (Ethereum & Solana)
- AI-powered chatbot for visitor interaction
- Responsive design with dark/light theme support

## How to edit this code

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository
git clone https://github.com/drqsatoshi/ai-portfolio-showcase.git

# Step 2: Navigate to the project directory
cd ai-portfolio-showcase

# Step 3: Install the necessary dependencies
npm install

# Step 4: Start the development server with auto-reloading and an instant preview
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

## Technologies Used

This project is built with modern web technologies:

- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful UI components
- **Radix UI** - Accessible component primitives
- **React Router** - Client-side routing
- **Supabase** - Backend services
- **TanStack Query** - Data fetching and caching
- **Lucide React** - Icon library

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run lint` - Run ESLint for code quality
- `npm run preview` - Preview the production build locally

## Deployment

This project is configured for deployment on Netlify. The `netlify.toml` file contains the deployment configuration.

To deploy:
1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting provider
3. Configure environment variables if using Supabase features

## Author

**Josef Kurk Edwards**
- Twitter: [@DrQSatoshin](https://twitter.com/DrQSatoshin)
- Website: [drqsatoshin.com](https://drqsatoshin.com)

## License

This is a CS50 2025 final project.
