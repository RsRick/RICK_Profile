# Portfolio Website - React Version

A modern, fast, and smooth portfolio website built with React, Vite, and Tailwind CSS.

## Features

- ⚡ **Lightning Fast** - Built with Vite for instant HMR and optimized builds
- 🎨 **Modern Design** - Beautiful UI with smooth animations
- 📱 **Responsive** - Works perfectly on all devices
- 🚀 **Performance Optimized** - Code splitting, lazy loading, and optimized assets
- 🎯 **Smooth Scrolling** - Native smooth scroll with optimized animations

## Tech Stack

- React 18
- Vite 5
- Tailwind CSS 3
- Lucide React (Icons)
- Appwrite (Backend & Database)

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── Header/       # Navigation header
│   ├── Hero/         # Hero section
│   ├── About/        # About section
│   ├── Projects/     # Projects section
│   ├── Research/     # Research section
│   └── Contact/      # Contact section
├── lib/
│   └── appwrite.js   # Appwrite configuration & helpers
├── App.jsx           # Main app component
├── main.jsx          # Entry point
└── index.css         # Global styles
```

## Appwrite Setup

This project is configured to use Appwrite for backend and database operations.

### Local Configuration

1. Create a `.env` file in the root directory:
```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id_here
VITE_APPWRITE_DATABASE_ID=your_database_id_here
VITE_APPWRITE_STORAGE_ID=your_storage_id_here
```

2. Get your Appwrite credentials from your [Appwrite Console](https://cloud.appwrite.io)

3. The Appwrite client is configured in `src/lib/appwrite.js` with helper functions for:
   - Database operations (create, read, update, delete documents)
   - Storage operations (upload, delete files)
   - Account management

### Vercel Deployment

**⚠️ Important:** If your database is not loading in production, you need to add environment variables in Vercel.

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed instructions on:
- Adding environment variables in Vercel
- Troubleshooting deployment issues
- Common problems and solutions

### Usage Example

```javascript
import { databaseService } from './lib/appwrite';

// Create a document
const result = await databaseService.createDocument(
  'collectionId',
  { title: 'My Project', description: '...' }
);

// List documents
const projects = await databaseService.listDocuments('collectionId');
```

## Performance Optimizations

- Code splitting with React.lazy()
- Manual chunk splitting for vendor libraries
- Optimized dependencies
- CSS optimizations with Tailwind
- Smooth scroll behavior
- Passive event listeners

## Customization

Update the colors in `tailwind.config.js` and component files to match your brand.

