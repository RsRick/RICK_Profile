# Embed Code Feature - Rich Text Editor

## Overview
The Rich Text Editor now includes a powerful **Embed Code** feature that allows users to insert custom HTML/iframe code directly into their project descriptions. This feature supports embedding videos, maps, interactive widgets, and any other HTML-based content.

## How to Use

### 1. Insert Embed Code

1. **Click the Embed Button** in the toolbar (FileCode icon)
2. A panel will open with two viewing options:
   - **Code View**: Paste your embed code here
   - **Preview**: See how the embedded content will look

### 2. Code View
- Paste your embed code (iframe, video embed, map, etc.)
- The code can include width and height attributes
- Example:
  ```html
  <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" width="560" height="315"></iframe>
  ```

### 3. Preview Mode
- Switch to Preview to see how your embed will render
- The preview shows the actual embedded content
- You can switch back to Code View to make edits

### 4. Insert the Embed
- Click **"Insert Embed"** to add it to your editor
- The embed will be inserted at your cursor position

## Working with Embedded Content

### Selecting Embeds
- Click on any embedded content to select it
- A blue border with resize handles will appear
- Selection tools will appear above the embed

### Resizing Embeds
- **Drag corner handles**: Resize while maintaining aspect ratio
- **Drag edge handles**: Resize width or height independently
- Minimum size: 50x50 pixels
- The embed will scale its content to fit the new dimensions

### Viewing/Editing Code
1. Select the embed
2. Click the **"Code"** button above the embed
3. Two tabs will appear:
   - **Code**: View and edit the raw HTML
   - **Preview**: See the rendered content
4. Make changes and click **"Update Embed"**

### Border Settings
1. Select the embed
2. Click the **"Border"** button
3. Customize:
   - **Border Style**: Solid, Dashed, Dotted, or None
   - **Border Width**: 1-20 pixels (slider)
   - **Border Color**: Use color picker or enter hex code
4. Click **"Apply Border"** to save changes

### Aligning Embeds
1. Click on the embed to select it (blue border appears)
2. Click an alignment button in the toolbar:
   - **Left**: Aligns embed to left edge
   - **Center**: Centers embed horizontally
   - **Right**: Aligns embed to right edge
3. The embed repositions immediately
4. Alignment is saved with your project

**Note**: Justify alignment is for text only and doesn't apply to embeds.

### Deleting Embeds
- **Method 1**: Select the embed and press `Delete` or `Backspace`
- **Method 2**: Select the embed and click the red delete button (trash icon)

## Size Behavior

### Automatic Sizing
The embed size is determined by the dimensions specified in your code:
- If your code includes `width="560"` and `height="315"`, the embed will be 560x315 pixels
- If no dimensions are specified, defaults to 560x315 pixels

### Consistent Display
The embed will display at the **exact size** you set across all views:
- In the editor preview
- In project card popups
- In homepage popups
- In any other location where the content is rendered

### Responsive Scaling
- The iframe content scales to fill the embed container
- When you resize the embed, the content scales proportionally
- The aspect ratio is maintained when using corner handles

## Supported Embed Types

### YouTube Videos
```html
<iframe width="560" height="315" src="https://www.youtube.com/embed/VIDEO_ID" frameborder="0" allowfullscreen></iframe>
```

### Google Maps
```html
<iframe src="https://www.google.com/maps/embed?pb=..." width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>
```

### Vimeo Videos
```html
<iframe src="https://player.vimeo.com/video/VIDEO_ID" width="640" height="360" frameborder="0" allowfullscreen></iframe>
```

### CodePen
```html
<iframe height="300" style="width: 100%;" scrolling="no" src="https://codepen.io/..." frameborder="no"></iframe>
```

### Custom HTML
```html
<div style="width: 400px; height: 300px; background: linear-gradient(45deg, #105652, #1E8479); display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; border-radius: 10px;">
  Custom Content
</div>
```

## Tips & Best Practices

### 1. Size Considerations
- Choose appropriate dimensions for your content
- Common video size: 560x315 (16:9 aspect ratio)
- Common map size: 600x450
- Consider the layout where the embed will appear

### 2. Security
- Only embed content from trusted sources
- The editor uses `dangerouslySetInnerHTML` for rendering
- Avoid embedding untrusted or malicious code

### 3. Performance
- Large embeds may slow down page loading
- Consider using smaller dimensions when possible
- Limit the number of embeds per project

### 4. Accessibility
- Include appropriate `title` attributes in iframes
- Ensure embedded content is accessible
- Test with screen readers when possible

### 5. Styling
- Use the border settings to match your design
- The default border color (#105652) matches the theme
- Set border to "None" for seamless integration

## Interaction Modes

### Editor Mode
- Click on the embed edges to select it
- Click in the center shows interaction hint (content is NOT interactive in editor)
- Use resize handles to adjust size
- Use toolbar buttons for code/border editing
- Embeds are disabled for interaction (videos won't play, maps won't respond)
- This allows you to select and edit the embed without accidentally triggering it

### Preview Mode (Project Display)
- Embeds are fully interactive in homepage and project popups
- Users can:
  - **Play videos** by clicking the play button
  - **Zoom in/out** on maps using mouse wheel or controls
  - **Pan and drag** maps by clicking and dragging
  - **Interact with widgets** normally
- The size remains exactly as specified
- No editing controls are shown
- All mouse interactions work perfectly

## Technical Details

### Data Storage
- Embed code is stored in the `data-embed-code` attribute
- Original dimensions are stored in `data-original-width` and `data-original-height`
- Border settings are applied as inline styles

### CSS Classes
- `.editor-embed-wrapper`: Main container for the embed
- `.embed-content`: Inner container for the iframe/content

### Pointer Events
- **Editor mode**: `pointer-events: none` on embed content (allows selection without triggering)
- **Display mode**: `pointer-events: auto` enabled (full interaction - videos play, maps zoom/pan)

## Troubleshooting

### Embed Not Showing
- Check if the code is valid HTML
- Verify the source URL is accessible
- Check browser console for errors

### Size Issues
- Ensure width/height are specified in the code
- Check if the iframe has conflicting styles
- Try resizing manually using the handles

### Border Not Applying
- Make sure the embed is selected
- Click "Apply Border" after making changes
- Check if border style is set to "None"

### Can't Edit Code
- Select the embed first
- Click the "Code" button above the embed
- Make sure you're in Code View tab

## Future Enhancements
- Preset embed templates (YouTube, Maps, etc.)
- Embed library for frequently used embeds
- Responsive sizing options
- Embed validation and sanitization
- Preview mode toggle in editor
