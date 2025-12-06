# Blog Card Design Reference

## Design Inspiration

The blog card design is inspired by Material Tailwind's BlogCard component but customized for your portfolio with unique styling and animations.

---

## Card Structure

```
┌─────────────────────────────────┐
│                                 │
│         THUMBNAIL IMAGE         │
│         (with category)         │
│                                 │
├─────────────────────────────────┤
│                                 │
│  TITLE (2 lines max)            │
│                                 │
│  Description text that can      │
│  span up to 3 lines with        │
│  ellipsis overflow...           │
│                                 │
├─────────────────────────────────┤
│  👤👤  Author Avatars  📅 Date  │
└─────────────────────────────────┘
```

---

## Key Differences from Material Tailwind

### Original Material Tailwind BlogCard:
- Fixed aspect ratio
- Simple hover effects
- Basic tooltip
- Standard Material Design colors

### Your Custom BlogCard:
- ✅ Dynamic image sizing (h-56)
- ✅ Advanced hover animations (scale + shadow)
- ✅ Custom tooltip with smooth transitions
- ✅ Brand color integration (#105652)
- ✅ Smooth category filter animations
- ✅ Multiple author support with overlap
- ✅ "+N" indicator for extra authors
- ✅ Calendar icon with formatted dates
- ✅ Click anywhere to open modal
- ✅ Responsive grid layout

---

## Visual Features

### 1. Image Section
- **Height**: 224px (h-56)
- **Hover Effect**: Scale 110% with smooth transition
- **Overlay**: Category badge in top-left
- **Transition**: 700ms transform

### 2. Category Badge
- **Position**: Absolute top-4 left-4
- **Style**: Rounded-full with shadow
- **Color**: Dynamic from category settings
- **Font**: Bold, xs size

### 3. Title
- **Size**: text-xl (20px)
- **Weight**: Bold (font-bold)
- **Lines**: Max 2 with ellipsis
- **Hover**: Changes to brand color (#105652)
- **Transition**: 300ms color change

### 4. Description
- **Size**: text-sm (14px)
- **Color**: Gray-600
- **Lines**: Max 3 with ellipsis
- **Spacing**: Leading-relaxed

### 5. Author Avatars
- **Size**: 40px × 40px (w-10 h-10)
- **Overlap**: -space-x-3 (12px overlap)
- **Border**: 2px white border
- **Hover**: Scale 110% + z-index increase
- **Tooltip**: Shows on hover with author name
- **Max Visible**: 3 avatars
- **Overflow**: "+N" badge for additional authors

### 6. Date Display
- **Icon**: Calendar (Lucide React)
- **Size**: w-4 h-4
- **Format**: "Month DD, YYYY"
- **Color**: Gray-500

---

## Animation Timeline

### Card Hover (500ms total)
```
0ms   → Start hover
100ms → Shadow expands
300ms → Card lifts (-translate-y-2)
500ms → Image scales to 110%
```

### Category Filter (400ms total)
```
0ms   → Click category
100ms → Cards fade out (opacity-0)
200ms → Cards scale down (scale-95)
400ms → New cards fade in + scale up
```

### Modal Open (400ms)
```
0ms   → Click card
100ms → Backdrop fades in
200ms → Modal slides up
400ms → Content fully visible
```

---

## Responsive Breakpoints

### Mobile (< 768px)
- 1 column grid
- Full width cards
- Stacked author info

### Tablet (768px - 1024px)
- 2 column grid
- Medium spacing (gap-6)
- Compact author display

### Desktop (> 1024px)
- 3 column grid
- Large spacing (gap-6)
- Full author display

---

## Color Palette

### Primary Colors
- **Brand**: #105652 (Dark teal)
- **Accent**: #1E8479 (Light teal)
- **Background**: White

### Text Colors
- **Heading**: #105652
- **Body**: #4B5563 (Gray-600)
- **Meta**: #6B7280 (Gray-500)

### Interactive States
- **Hover**: Scale + Shadow
- **Active**: Pressed effect
- **Focus**: Ring outline

---

## Typography

### Font Families
- **Headings**: System font stack (bold)
- **Body**: System font stack (regular)
- **Code**: Monospace

### Font Sizes
- **Title**: 20px (text-xl)
- **Description**: 14px (text-sm)
- **Meta**: 14px (text-sm)
- **Badge**: 12px (text-xs)

---

## Spacing System

### Card Padding
- **Content**: 24px (p-6)
- **Footer**: 16px top (pt-4)

### Grid Gaps
- **Mobile**: 16px (gap-4)
- **Desktop**: 24px (gap-6)

### Element Margins
- **Title**: 12px bottom (mb-3)
- **Description**: 16px bottom (mb-4)
- **Footer**: 16px top (pt-4)

---

## Shadow Hierarchy

### Default State
```css
shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1)
```

### Hover State
```css
shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25)
```

### Badge Shadow
```css
shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1)
```

---

## Accessibility Features

### Keyboard Navigation
- ✅ Tab through cards
- ✅ Enter to open modal
- ✅ Escape to close modal
- ✅ Arrow keys for navigation

### Screen Readers
- ✅ Alt text on images
- ✅ ARIA labels on buttons
- ✅ Semantic HTML structure
- ✅ Focus indicators

### Color Contrast
- ✅ WCAG AA compliant
- ✅ Readable text on all backgrounds
- ✅ Clear focus states

---

## Performance Optimizations

### Image Loading
- Lazy loading for off-screen images
- Optimized image sizes
- WebP format support

### Animations
- GPU-accelerated transforms
- Will-change hints
- Reduced motion support

### Rendering
- React.memo for cards
- Virtual scrolling for large lists
- Debounced filter changes

---

## Comparison: Project Card vs Blog Card

### Project Card
- Vertical layout
- Like button
- Project details grid
- View Project button
- Technical focus

### Blog Card
- Vertical layout
- Author avatars (NEW)
- Publication date (NEW)
- No like button
- Content focus
- Cleaner, more editorial design

---

## Future Enhancements

### Potential Additions
1. Reading time estimate
2. Tags/keywords display
3. View count
4. Comment count
5. Bookmark functionality
6. Social share buttons
7. Related posts
8. Author bio on hover

---

## Code Example

```jsx
<BlogCard
  blog={{
    id: '123',
    title: 'Getting Started with GIS',
    description: 'A comprehensive guide...',
    thumbnailUrl: 'https://...',
    category: 'Technology',
    authorNames: ['John Doe', 'Jane Smith'],
    authorImages: ['https://...', 'https://...'],
    publishDate: '2024-01-10',
  }}
  onClick={() => openModal(blog)}
  categoryColors={{ Technology: '#3b82f6' }}
/>
```

---

## Testing Checklist

- [ ] Card displays correctly on all screen sizes
- [ ] Hover animations work smoothly
- [ ] Author tooltips appear on hover
- [ ] Date formats correctly
- [ ] Category badge shows correct color
- [ ] Click opens modal
- [ ] Images load properly
- [ ] Text truncates with ellipsis
- [ ] Multiple authors display correctly
- [ ] "+N" badge shows for >3 authors

---

This design creates a modern, professional blog card that stands out while maintaining consistency with your portfolio's design language.
