# Blog Card Visual Design Guide

## 📐 Exact Card Layout

Based on your requirements and the Material Tailwind inspiration, here's the exact card design:

```
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│         THUMBNAIL IMAGE                 │
│         (800 × 600px)                   │
│         [Category Badge]                │
│                                         │
│                                         │
├─────────────────────────────────────────┤
│  Padding: 24px                          │
│                                         │
│  Title (20px, Bold, 2 lines max)        │
│  Getting Started with GIS               │
│                                         │
│  Description (14px, Gray, 3 lines)      │
│  A comprehensive guide to Geographic    │
│  Information Systems and how to get     │
│  started with mapping...                │
│                                         │
├─────────────────────────────────────────┤
│  Border Top (Gray-100)                  │
│  Padding Top: 16px                      │
│                                         │
│  👤👤  Parvej Hossain    📅 Jan 10     │
│  (Avatars overlap)      (Date)          │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🎨 Detailed Specifications

### Card Container
```css
- Background: White
- Border Radius: 12px (rounded-xl)
- Shadow: Medium (shadow-md)
- Hover Shadow: Extra Large (shadow-2xl)
- Transition: 500ms all
- Hover Transform: translateY(-8px)
- Cursor: pointer
```

### Image Section
```css
- Height: 224px (h-56)
- Width: 100%
- Object Fit: cover
- Overflow: hidden
- Hover Scale: 110%
- Transition: 700ms transform
```

### Category Badge
```css
- Position: Absolute top-4 left-4
- Padding: 8px 12px (px-3 py-1)
- Border Radius: Full (rounded-full)
- Font Size: 12px (text-xs)
- Font Weight: Bold
- Color: White
- Background: Dynamic (from category color)
- Shadow: Large (shadow-lg)
```

### Content Section
```css
- Padding: 24px (p-6)
```

### Title
```css
- Font Size: 20px (text-xl)
- Font Weight: Bold
- Color: Default (black)
- Hover Color: #105652 (brand color)
- Margin Bottom: 12px (mb-3)
- Line Clamp: 2 lines
- Transition: 300ms color
```

### Description
```css
- Font Size: 14px (text-sm)
- Color: #4B5563 (gray-600)
- Line Height: Relaxed (leading-relaxed)
- Margin Bottom: 16px (mb-4)
- Line Clamp: 3 lines
```

### Footer Section
```css
- Display: Flex
- Justify: Space Between
- Align Items: Center
- Padding Top: 16px (pt-4)
- Border Top: 1px solid #F3F4F6 (gray-100)
```

### Author Avatars
```css
Container:
- Display: Flex
- Align Items: Center
- Negative Space: -12px (-space-x-3)

Each Avatar:
- Width: 40px (w-10)
- Height: 40px (h-10)
- Border Radius: Full (rounded-full)
- Border: 2px solid white
- Object Fit: cover
- Shadow: Medium (shadow-md)
- Hover Scale: 110%
- Hover Z-Index: 10
- Transition: 300ms transform

Tooltip:
- Position: Absolute bottom-full
- Background: #1F2937 (gray-900)
- Color: White
- Font Size: 12px (text-xs)
- Padding: 4px 8px (px-2 py-1)
- Border Radius: 4px (rounded)
- Opacity: 0 (default)
- Hover Opacity: 100
- Transition: 300ms opacity
- White Space: nowrap
```

### "+N" Badge (for >3 authors)
```css
- Width: 40px (w-10)
- Height: 40px (h-10)
- Border Radius: Full (rounded-full)
- Background: #D1D5DB (gray-300)
- Border: 2px solid white
- Display: Flex
- Align Items: Center
- Justify Content: Center
- Font Size: 12px (text-xs)
- Font Weight: Bold
- Color: #374151 (gray-700)
```

### Date Display
```css
Container:
- Display: Flex
- Align Items: Center
- Gap: 6px (gap-1.5)
- Color: #6B7280 (gray-500)
- Font Size: 14px (text-sm)

Icon:
- Width: 16px (w-4)
- Height: 16px (h-4)
- Color: Inherit
```

---

## 🎭 Animation Specifications

### Card Hover Animation
```css
Timeline:
0ms   → Hover starts
100ms → Shadow begins expanding
300ms → Card lifts up (-8px)
500ms → Image scales to 110%
700ms → Animation complete

Properties:
- Transform: translateY(-8px)
- Box Shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25)
- Image Scale: 1.1
- Timing: ease-out
```

### Category Filter Animation
```css
Timeline:
0ms   → Category clicked
100ms → Cards fade out (opacity: 0)
200ms → Cards scale down (scale: 0.95)
400ms → Category changes
450ms → New cards fade in (opacity: 1)
500ms → New cards scale up (scale: 1)

Properties:
- Opacity: 0 → 1
- Transform: scale(0.95) → scale(1)
- Timing: ease-out
```

### Avatar Hover Animation
```css
Timeline:
0ms   → Hover starts
150ms → Avatar scales to 110%
300ms → Tooltip fades in

Properties:
- Transform: scale(1.1)
- Z-Index: 10
- Tooltip Opacity: 0 → 1
- Timing: ease-out
```

---

## 📱 Responsive Behavior

### Mobile (< 768px)
```css
Grid:
- Columns: 1
- Gap: 16px (gap-4)

Card:
- Width: 100%
- Max Width: None

Image:
- Height: 200px (adjust if needed)

Content:
- Padding: 20px (p-5)

Footer:
- Flex Direction: column (if needed)
- Align Items: flex-start
- Gap: 12px
```

### Tablet (768px - 1024px)
```css
Grid:
- Columns: 2
- Gap: 24px (gap-6)

Card:
- Width: 100%
- Max Width: None

Image:
- Height: 224px (h-56)

Content:
- Padding: 24px (p-6)
```

### Desktop (> 1024px)
```css
Grid:
- Columns: 3
- Gap: 24px (gap-6)

Card:
- Width: 100%
- Max Width: 384px (max-w-sm)

Image:
- Height: 224px (h-56)

Content:
- Padding: 24px (p-6)
```

---

## 🎨 Color Palette

### Card Colors
```css
Background: #FFFFFF (white)
Border: #E5E7EB (gray-200) - optional
Shadow: rgba(0, 0, 0, 0.1)
```

### Text Colors
```css
Title: #000000 (default)
Title Hover: #105652 (brand)
Description: #4B5563 (gray-600)
Meta Text: #6B7280 (gray-500)
```

### Interactive Colors
```css
Category Badge: Dynamic (from database)
Author Border: #FFFFFF (white)
Tooltip Background: #1F2937 (gray-900)
Tooltip Text: #FFFFFF (white)
```

---

## 📊 Comparison: Your Design vs Material Tailwind

| Feature | Material Tailwind | Your Custom Design |
|---------|------------------|-------------------|
| **Card Size** | Fixed 384px | Responsive (100%) |
| **Image Height** | 256px | 224px |
| **Title Size** | 24px (h4) | 20px (xl) |
| **Description Lines** | Unlimited | 3 lines max |
| **Author Display** | Simple list | Overlapping avatars |
| **Author Tooltip** | Basic | Custom styled |
| **Multiple Authors** | Not shown | "+N" indicator |
| **Date Icon** | None | Calendar icon |
| **Hover Effect** | Simple shadow | Scale + shadow + lift |
| **Animation Speed** | 200ms | 500ms |
| **Category Badge** | Inside card | On image |
| **Border** | None | Optional |
| **Shadow** | Basic | Multi-level |

---

## 🔍 Example Implementations

### Single Author
```jsx
<BlogCard
  blog={{
    title: "Getting Started with GIS",
    description: "A comprehensive guide to Geographic Information Systems",
    thumbnailUrl: "https://example.com/image.jpg",
    category: "Technology",
    authorNames: ["Parvej Hossain"],
    authorImages: ["https://example.com/parvej.jpg"],
    publishDate: "2024-01-10"
  }}
/>
```

**Result**: One avatar with name tooltip

---

### Multiple Authors (2-3)
```jsx
<BlogCard
  blog={{
    title: "Collaborative Mapping Project",
    description: "How we built a mapping system together",
    thumbnailUrl: "https://example.com/image.jpg",
    category: "Technology",
    authorNames: ["John Doe", "Jane Smith", "Bob Wilson"],
    authorImages: [
      "https://example.com/john.jpg",
      "https://example.com/jane.jpg",
      "https://example.com/bob.jpg"
    ],
    publishDate: "2024-01-15"
  }}
/>
```

**Result**: Three overlapping avatars, each with tooltip

---

### Multiple Authors (>3)
```jsx
<BlogCard
  blog={{
    title: "Team Research Project",
    description: "A collaborative research effort",
    thumbnailUrl: "https://example.com/image.jpg",
    category: "Research",
    authorNames: ["Author 1", "Author 2", "Author 3", "Author 4", "Author 5"],
    authorImages: [
      "https://example.com/1.jpg",
      "https://example.com/2.jpg",
      "https://example.com/3.jpg",
      "https://example.com/4.jpg",
      "https://example.com/5.jpg"
    ],
    publishDate: "2024-01-20"
  }}
/>
```

**Result**: Three avatars + "+2" badge

---

## 🎯 Key Design Principles

### 1. Clarity
- Clear hierarchy (image → title → description → meta)
- Easy to scan
- Important info prominent

### 2. Consistency
- Matches project card style
- Uses same color palette
- Follows design system

### 3. Interactivity
- Hover feedback on all interactive elements
- Smooth transitions
- Clear clickable areas

### 4. Accessibility
- Sufficient color contrast
- Keyboard navigable
- Screen reader friendly
- Touch-friendly targets

### 5. Performance
- GPU-accelerated animations
- Optimized images
- Efficient rendering

---

## 🛠️ Customization Guide

### Change Card Size
```jsx
// In BlogCard.jsx
<div className="max-w-sm">  // Change to max-w-md or max-w-lg
```

### Change Image Height
```jsx
// In BlogCard.jsx
<div className="h-56">  // Change to h-48 or h-64
```

### Change Avatar Size
```jsx
// In BlogCard.jsx
<img className="w-10 h-10">  // Change to w-12 h-12 for larger
```

### Change Hover Lift Amount
```jsx
// In BlogCard.jsx
<div className="hover:-translate-y-2">  // Change to -translate-y-4 for more lift
```

### Change Animation Speed
```jsx
// In BlogCard.jsx
<div className="transition-all duration-500">  // Change to duration-300 for faster
```

---

## ✨ Final Notes

This card design:
- ✅ Matches your brand aesthetic
- ✅ Inspired by Material Tailwind
- ✅ Customized for blog content
- ✅ Supports multiple authors
- ✅ Has smooth animations
- ✅ Is fully responsive
- ✅ Follows accessibility standards
- ✅ Performs efficiently

**The design creates a modern, professional look that will make your blog content stand out!**

---

**Design Version**: 1.0.0  
**Last Updated**: November 29, 2025  
**Status**: Production Ready
