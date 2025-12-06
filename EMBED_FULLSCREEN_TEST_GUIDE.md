# Embed Fullscreen Feature - Test Guide

## Quick Test Steps

### Test 1: Insert New Embed in Editor
1. Go to Admin Panel → Project Management
2. Open the rich text editor
3. Click the "Insert Embed" button (Share2 icon)
4. Paste an embed code (try Google Maps or YouTube):
   ```html
   <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.9064842312!2d90.39167931498!3d23.750891084588!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b8b087026b81%3A0x8fa563bbdd5904c2!2sDhaka!5e0!3m2!1sen!2sbd!4v1234567890" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>
   ```
5. Click "Insert Embed"
6. **Hover over the embed** - you should see a fullscreen icon appear in the top-right corner
7. **Click the fullscreen icon**
8. **Verify**:
   - Embed opens in fullscreen (fills entire screen)
   - Background is black
   - You can interact with the map (pan, zoom)
   - Close button appears in top-right corner
9. **Test closing**:
   - Press ESC key → should close
   - Click close button → should close
   - Click on black background → should close

### Test 2: Existing Embeds in Editor
1. Open a project that already has embeds
2. **Hover over existing embeds** - fullscreen icon should appear
3. Click fullscreen icon
4. Verify fullscreen works as expected

### Test 3: Embeds in Project Modal (Public View)
1. Go to the Projects page (public view)
2. Click on a project that contains embeds
3. In the project modal, **hover over the embed**
4. Click the fullscreen icon
5. **Verify**:
   - Fullscreen opens above the project modal
   - You can interact with the embed
   - Closing returns you to the project modal (not the projects page)

### Test 4: Multiple Embeds
1. Insert multiple embeds in a project
2. Test fullscreen on each embed
3. Verify each embed can be fullscreened independently

### Test 5: Different Embed Types
Test with various embed types:

**Google Maps:**
```html
<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.9064842312!2d90.39167931498!3d23.750891084588!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b8b087026b81%3A0x8fa563bbdd5904c2!2sDhaka!5e0!3m2!1sen!2sbd!4v1234567890" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>
```

**YouTube Video:**
```html
<iframe width="560" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
```

**CodePen:**
```html
<iframe height="300" style="width: 100%;" scrolling="no" title="Example" src="https://codepen.io/team/codepen/embed/preview/PNaGbb" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true"></iframe>
```

## Expected Behavior

### Fullscreen Icon
- ✅ Appears on hover
- ✅ Smooth fade-in animation
- ✅ Positioned in top-right corner
- ✅ Doesn't interfere with embed content
- ✅ Hover effect (darker background, slight scale)

### Fullscreen Modal
- ✅ Opens instantly
- ✅ Black background
- ✅ Embed fills entire viewport
- ✅ Close button visible and functional
- ✅ ESC key closes modal
- ✅ Background click closes modal
- ✅ Body scroll prevented when open

### Mouse Interaction
- ✅ Can interact with map (pan, zoom, click markers)
- ✅ Can play/pause videos
- ✅ Can click links in embedded content
- ✅ All interactive elements work normally

## Common Issues & Solutions

### Issue: Fullscreen icon doesn't appear
**Solution**: Check if the embed has `data-embed-code` attribute. Refresh the page.

### Issue: Can't interact with embed in fullscreen
**Solution**: Check if the embed code has proper `allowfullscreen` attribute. Some embeds may have interaction restrictions.

### Issue: Fullscreen doesn't close with ESC
**Solution**: Make sure the modal is focused. Click on the embed first, then press ESC.

### Issue: Embed is too small in fullscreen
**Solution**: The embed should automatically scale to 100% width and height. Check browser console for errors.

## Browser Testing Checklist
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

## Performance Notes
- Fullscreen modal uses fixed positioning with high z-index (99999)
- No performance impact when not in fullscreen
- Minimal DOM manipulation (only adds button elements)
- Event listeners are properly cleaned up

## Accessibility Notes
- Close button has proper title attribute
- ESC key support for keyboard users
- High contrast close button (white on dark background)
- Focus management could be improved in future updates
