// Global FAQ interaction handler
// This enables FAQ toggle functionality everywhere (editor, project modals, homepage, etc.)

export const initializeFaqInteractions = (container) => {
  if (!container) return;

  const handleFaqClick = (e) => {
    const faqWrapper = e.target.closest('.editor-faq-wrapper');
    if (!faqWrapper) return;

    // Check if clicking on buttons (they have their own handlers in editor)
    if (e.target.closest('button')) {
      return;
    }

    // If clicking on title area - toggle content
    const titleDiv = e.target.closest('.faq-title');
    if (titleDiv) {
      e.preventDefault();
      e.stopPropagation();

      // Toggle content visibility
      let contentDiv = faqWrapper.querySelector('.faq-content');
      const chevron = faqWrapper.querySelector('.faq-chevron');
      const icon = faqWrapper.querySelector('.faq-icon');
      const isOpen = contentDiv !== null;

      if (isOpen) {
        // Close: remove content
        contentDiv.remove();
        faqWrapper.setAttribute('data-is-open', 'false');

        // Update chevron
        if (chevron) {
          chevron.innerHTML =
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
        }

        // Update plus/minus icon
        if (icon) {
          icon.innerHTML =
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>';
        }
      } else {
        // Open: add content
        const content = faqWrapper.getAttribute('data-content');
        const titleDiv = faqWrapper.querySelector('.faq-title');
        const borderColor = faqWrapper.style.borderColor;
        const padding = titleDiv.style.padding;

        // Get stored content styles from data attributes or use defaults
        const contentFontFamily =
          faqWrapper.getAttribute('data-content-font-family') ||
          "'Inter', sans-serif";
        const contentFontSize =
          faqWrapper.getAttribute('data-content-font-size') || '16px';
        const contentColor =
          faqWrapper.getAttribute('data-content-color') || '#4a5568';
        const contentBgColor =
          faqWrapper.getAttribute('data-content-bg-color') || '#ffffff';

        contentDiv = document.createElement('div');
        contentDiv.className = 'faq-content';
        contentDiv.style.cssText = `
          font-family: ${contentFontFamily};
          font-size: ${contentFontSize};
          color: ${contentColor};
          background-color: ${contentBgColor};
          padding: ${padding};
          border-top: 1px solid ${borderColor};
          white-space: pre-wrap;
          line-height: 1.6;
          display: block;
        `;
        contentDiv.textContent = content;
        faqWrapper.appendChild(contentDiv);
        faqWrapper.setAttribute('data-is-open', 'true');

        // Update chevron
        if (chevron) {
          chevron.innerHTML =
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>';
        }

        // Update plus/minus icon
        if (icon) {
          icon.innerHTML =
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg>';
        }
      }

      return;
    }
  };

  container.addEventListener('click', handleFaqClick);

  // Return cleanup function
  return () => {
    container.removeEventListener('click', handleFaqClick);
  };
};
