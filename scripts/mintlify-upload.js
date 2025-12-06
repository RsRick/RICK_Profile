/**
 * Mintlify Documentation Upload Script
 * 
 * This script reads all markdown documentation files,
 * organizes them into categories, and prepares them for Mintlify.
 * 
 * Usage: node scripts/mintlify-upload.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Configuration
const CONFIG = {
  projectId: '69331c3d13a1142e3890331e',
  apiKey: 'mint_3ZGXoGeSLuadX1crfB1BJgsY',
  baseUrl: 'https://api.mintlify.com',
  docsOutputDir: path.join(rootDir, 'docs'),
};

// Category mappings based on file prefixes
const CATEGORY_MAP = {
  'BLOG': { name: 'Blog System', icon: 'newspaper', priority: 1 },
  'SHORTLINK': { name: 'Shortlink System', icon: 'link', priority: 2 },
  'APPWRITE': { name: 'Appwrite Setup', icon: 'database', priority: 3 },
  'FONT': { name: 'Font System', icon: 'font', priority: 4 },
  'PHOTO_GRID': { name: 'Photo Grid', icon: 'image', priority: 5 },
  'EMBED': { name: 'Embed Features', icon: 'code', priority: 6 },
  'TABLE': { name: 'Table Features', icon: 'table', priority: 7 },
  'VIDEO': { name: 'Video Features', icon: 'video', priority: 8 },
  'PROJECT': { name: 'Project System', icon: 'folder', priority: 9 },
  'SHOP': { name: 'Shop & Orders', icon: 'shopping-cart', priority: 10 },
  'FAQ': { name: 'FAQ System', icon: 'circle-help', priority: 11 },
  'QUOTE': { name: 'Quote System', icon: 'quote', priority: 12 },
  'SOCIAL': { name: 'Social Links', icon: 'share', priority: 13 },
  'AUTHOR': { name: 'Author Features', icon: 'user', priority: 14 },
  'ADMIN': { name: 'Admin Setup', icon: 'settings', priority: 15 },
  'SETUP': { name: 'Setup Guides', icon: 'rocket', priority: 16 },
  'OTHER': { name: 'Other Guides', icon: 'book', priority: 99 },
};

// Files to exclude
const EXCLUDE_FILES = [
  'README.md',
  'package.json',
  'package-lock.json',
];

function getMarkdownFiles() {
  const files = fs.readdirSync(rootDir).filter(file => {
    return file.endsWith('.md') && 
           !EXCLUDE_FILES.includes(file) &&
           !file.startsWith('.');
  });
  return files;
}

function getCategory(filename) {
  for (const [prefix, category] of Object.entries(CATEGORY_MAP)) {
    if (prefix !== 'OTHER' && filename.startsWith(prefix)) {
      return { key: prefix, ...category };
    }
  }
  return { key: 'OTHER', ...CATEGORY_MAP.OTHER };
}

function filenameToTitle(filename) {
  return filename
    .replace('.md', '')
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function filenameToSlug(filename) {
  return filename
    .replace('.md', '')
    .toLowerCase()
    .replace(/_/g, '-');
}

function processMarkdownFile(filename) {
  const content = fs.readFileSync(path.join(rootDir, filename), 'utf-8');
  const category = getCategory(filename);
  const title = filenameToTitle(filename);
  const slug = filenameToSlug(filename);
  
  const headingMatch = content.match(/^#\s+(.+)$/m);
  const extractedTitle = headingMatch ? headingMatch[1] : title;
  
  const descMatch = content.match(/^#.+\n\n(.+?)(?:\n\n|\n#)/s);
  const description = descMatch ? descMatch[1].substring(0, 150).replace(/\n/g, ' ') : '';
  
  return {
    filename,
    title: extractedTitle,
    slug,
    category,
    description,
    content,
  };
}

function groupByCategory(files) {
  const groups = {};
  
  for (const file of files) {
    const key = file.category.key;
    if (!groups[key]) {
      groups[key] = {
        ...file.category,
        files: [],
      };
    }
    groups[key].files.push(file);
  }
  
  return Object.values(groups).sort((a, b) => a.priority - b.priority);
}

function addFrontmatter(file) {
  const frontmatter = `---
title: "${file.title.replace(/"/g, '\\"')}"
description: "${file.description.replace(/"/g, '\\"')}"
---

`;
  return frontmatter + file.content;
}

function createDocsStructure(groups) {
  if (!fs.existsSync(CONFIG.docsOutputDir)) {
    fs.mkdirSync(CONFIG.docsOutputDir, { recursive: true });
  }
  
  for (const group of groups) {
    const categoryDir = path.join(CONFIG.docsOutputDir, group.key.toLowerCase());
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }
    
    for (const file of group.files) {
      const outputPath = path.join(categoryDir, `${file.slug}.mdx`);
      const contentWithFrontmatter = addFrontmatter(file);
      fs.writeFileSync(outputPath, contentWithFrontmatter);
      console.log(`  ✓ Created: ${group.key.toLowerCase()}/${file.slug}.mdx`);
    }
  }
  
  const readmePath = path.join(rootDir, 'README.md');
  if (fs.existsSync(readmePath)) {
    const readmeContent = fs.readFileSync(readmePath, 'utf-8');
    const introContent = `---
title: "Introduction"
description: "Portfolio Website Documentation - Built with React, Vite, and Tailwind CSS"
---

${readmeContent}`;
    fs.writeFileSync(path.join(CONFIG.docsOutputDir, 'introduction.mdx'), introContent);
    console.log(`  ✓ Created: introduction.mdx`);
  }
}

function generateMintConfig(groups) {
  const navigation = [
    {
      group: "Getting Started",
      pages: ["introduction"]
    }
  ];
  
  for (const group of groups) {
    navigation.push({
      group: group.name,
      pages: group.files.map(f => `${group.key.toLowerCase()}/${f.slug}`)
    });
  }
  
  const mintConfig = {
    "$schema": "https://mintlify.com/schema.json",
    "name": "Portfolio Documentation",
    "logo": {
      "dark": "/logo/dark.svg",
      "light": "/logo/light.svg"
    },
    "favicon": "/favicon.svg",
    "colors": {
      "primary": "#0D9373",
      "light": "#07C983",
      "dark": "#0D9373",
      "anchors": {
        "from": "#0D9373",
        "to": "#07C983"
      }
    },
    "topbarLinks": [
      {
        "name": "Support",
        "url": "mailto:support@example.com"
      }
    ],
    "topbarCtaButton": {
      "name": "Dashboard",
      "url": "https://portfolioofparvej.mintlify.app"
    },
    "anchors": [
      {
        "name": "Documentation",
        "icon": "book-open-cover",
        "url": "https://portfolioofparvej.mintlify.app"
      }
    ],
    "navigation": navigation,
    "footerSocials": {
      "github": "https://github.com",
      "linkedin": "https://linkedin.com"
    }
  };
  
  fs.writeFileSync(
    path.join(CONFIG.docsOutputDir, 'mint.json'),
    JSON.stringify(mintConfig, null, 2)
  );
  console.log(`  ✓ Created: mint.json`);
}

async function main() {
  console.log('\n🚀 Mintlify Documentation Generator\n');
  console.log('='.repeat(50));
  
  console.log('\n📁 Scanning for markdown files...');
  const markdownFiles = getMarkdownFiles();
  console.log(`   Found ${markdownFiles.length} documentation files`);
  
  console.log('\n📝 Processing files...');
  const processedFiles = markdownFiles.map(processMarkdownFile);
  
  console.log('\n📂 Organizing by category...');
  const groups = groupByCategory(processedFiles);
  
  for (const group of groups) {
    console.log(`   ${group.name}: ${group.files.length} files`);
  }
  
  console.log('\n📄 Creating documentation structure...');
  createDocsStructure(groups);
  
  console.log('\n⚙️  Generating mint.json configuration...');
  generateMintConfig(groups);
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Documentation generated successfully!\n');
  console.log('📁 Output directory: ./docs');
  console.log('📊 Total files:', processedFiles.length);
  console.log('📂 Categories:', groups.length);
  
  console.log('\n📋 Next Steps:');
  console.log('   1. Review the generated docs in ./docs folder');
  console.log('   2. Initialize Mintlify: cd docs && npx mintlify dev');
  console.log('   3. Or push ./docs to a GitHub repo connected to Mintlify\n');
}

main().catch(console.error);
