import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';

// Image Preview Portal Component - Shows full original image
const ImagePreview = ({ imageUrl, position, productName }) => {
  if (!imageUrl || !position) return null;

  const windowHeight = window.innerHeight;
  const padding = 20; // Padding from screen edges
  const maxHeight = windowHeight - (padding * 2); // Max height with padding
  const maxWidth = Math.min(position.availableWidth - 20, 550);

  return createPortal(
    <div
      className="fixed pointer-events-none z-[9999] flex items-center"
      style={{
        left: position.side === 'left' ? padding : position.x,
        right: position.side === 'right' ? padding : 'auto',
        top: padding,
        bottom: padding,
        justifyContent: position.side === 'left' ? 'flex-start' : 'flex-start',
      }}
    >
      <div 
        className="relative"
        style={{
          marginLeft: position.side === 'right' ? 0 : 'auto',
          marginRight: position.side === 'left' ? 20 : 0,
          animation: 'previewFadeIn 0.3s ease-out forwards',
        }}
      >
        {/* Decorative glow */}
        <div 
          className="absolute -inset-4 rounded-3xl opacity-40"
          style={{
            background: 'linear-gradient(135deg, #105652, #1E8479, #105652)',
            filter: 'blur(25px)',
          }}
        />
        
        {/* Main preview container */}
        <div 
          className="relative bg-white rounded-2xl overflow-hidden flex flex-col"
          style={{
            maxHeight: maxHeight,
            maxWidth: maxWidth,
            boxShadow: '0 25px 80px rgba(16, 86, 82, 0.4), 0 10px 30px rgba(0,0,0,0.2)',
            border: '4px solid #105652',
          }}
        >
          {/* Top decorative bar - macOS style */}
          <div 
            className="h-10 flex items-center px-4 gap-2 flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #105652, #1E8479)' }}
          >
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <div className="w-3 h-3 rounded-full bg-[#28c840]" />
            </div>
            <span className="ml-3 text-white text-sm font-medium truncate flex-1">
              {productName}
            </span>
            <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </div>
          
          {/* Full Image */}
          <div className="bg-gray-50 p-2 overflow-hidden flex-1 flex items-center justify-center">
            <img
              src={imageUrl}
              alt={productName}
              className="w-auto h-auto object-contain rounded-lg"
              style={{ 
                maxHeight: maxHeight - 60,
                maxWidth: maxWidth - 20,
              }}
            />
          </div>
        </div>

        {/* Arrow pointer - positioned at card level */}
        <div
          className="absolute"
          style={{
            top: position.cardCenterY ? position.cardCenterY - padding : '50%',
            transform: 'translateY(-50%)',
            [position.side === 'left' ? 'right' : 'left']: '-14px',
            width: 0,
            height: 0,
            borderTop: '14px solid transparent',
            borderBottom: '14px solid transparent',
            [position.side === 'left' ? 'borderLeft' : 'borderRight']: '14px solid #105652',
          }}
        />
      </div>
    </div>,
    document.body
  );
};


const ProductCard = ({ product, onClick, onAddToCart }) => {
  const { name, price, discountedPrice, imageUrl, fullImageUrl, onSale } = product;
  const cardRef = useRef(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewPosition, setPreviewPosition] = useState(null);
  const hoverTimeoutRef = useRef(null);
  
  const hasDiscount = onSale && discountedPrice && discountedPrice < price;
  const displayPrice = hasDiscount ? discountedPrice : price;
  
  // Use fullImageUrl for preview, fallback to imageUrl
  const previewImageUrl = fullImageUrl || imageUrl;

  const handleCardClick = (e) => {
    // Prevent click if clicking on add button
    if (e.target.closest('.card__button')) return;
    onClick?.();
  };

  const handleAddClick = (e) => {
    e.stopPropagation();
    onAddToCart?.();
  };

  const handleMouseEnter = (e) => {
    if (!previewImageUrl) return;
    
    // Delay showing preview for smoother UX
    hoverTimeoutRef.current = setTimeout(() => {
      calculatePosition();
      setShowPreview(true);
    }, 400);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setShowPreview(false);
  };

  const calculatePosition = () => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    
    // Calculate space on each side
    const spaceLeft = rect.left;
    const spaceRight = windowWidth - rect.right;
    
    // Determine which side has more space
    const side = spaceLeft > spaceRight ? 'left' : 'right';
    
    // Calculate available width for the preview
    const availableWidth = side === 'left' ? spaceLeft - 40 : spaceRight - 40;
    
    // Calculate position
    let x;
    if (side === 'left') {
      x = rect.left - 20;
    } else {
      x = rect.right + 20;
    }
    
    // Card center Y for arrow positioning
    const cardCenterY = rect.top + rect.height / 2;
    
    setPreviewPosition({ 
      x, 
      side, 
      availableWidth: Math.min(availableWidth, 600),
      cardCenterY 
    });
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);
  
  return (
    <>
      <StyledWrapper onClick={handleCardClick} ref={cardRef}>
        <div 
          className="card-container"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="card-effect">
            <div className="card-inner">
              <div className="card__liquid" />
              <div className="card__shine" />
              <div className="card__glow" />
              <div className="card__content">
                {onSale && (
                  <div className="card__badge">SALE</div>
                )}
                <div 
                  className="card__image"
                  style={{ 
                    backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
                    backgroundColor: !imageUrl ? '#1E8479' : 'transparent'
                  }}
                >
                  {/* Hover indicator */}
                  {previewImageUrl && (
                    <div className="card__preview-hint">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <path d="M21 21l-4.35-4.35" />
                        <path d="M11 8v6M8 11h6" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="card__text">
                  <p className="card__title">{name || 'Product Name'}</p>
                </div>
                <div className="card__footer">
                  <div className="card__price-wrapper">
                    {hasDiscount && (
                      <span className="card__original-price">${price?.toFixed(2)}</span>
                    )}
                    <span className="card__price">${displayPrice?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="card__button" onClick={handleAddClick}>
                    <svg viewBox="0 0 24 24" width={16} height={16}>
                      <path fill="currentColor" d="M5 12H19M12 5V19" stroke="currentColor" strokeWidth={2} />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </StyledWrapper>

      {/* Image Preview Portal - Shows full original image */}
      {showPreview && previewImageUrl && (
        <ImagePreview 
          imageUrl={previewImageUrl} 
          position={previewPosition}
          productName={name}
        />
      )}
    </>
  );
};


const StyledWrapper = styled.div`
  /* Preview animation */
  @keyframes previewFadeIn {
    from {
      opacity: 0;
      transform: translateX(${props => props.side === 'left' ? 'calc(-100% + 20px)' : '-20px'}) scale(0.9);
    }
    to {
      opacity: 1;
      transform: translateX(${props => props.side === 'left' ? '-100%' : '0'}) scale(1);
    }
  }

  .card-effect {
    perspective: 1000px;
  }

  .card-inner {
    --card-bg: #ffffff;
    --card-accent: #1E8479;
    --card-accent-dark: #105652;
    --card-text: #263238;
    --card-shadow: 0 12px 24px rgba(16, 86, 82, 0.15);
    
    width: 260px;
    height: 360px;
    background: var(--card-bg);
    border-radius: 20px;
    position: relative;
    overflow: hidden;
    transition:
      transform 0.6s cubic-bezier(0.23, 1, 0.32, 1),
      box-shadow 0.6s cubic-bezier(0.23, 1, 0.32, 1);
    box-shadow: var(--card-shadow);
    border: 1px solid rgba(30, 132, 121, 0.2);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, sans-serif;
    transform-style: preserve-3d;
    cursor: pointer;
  }

  .card-inner:hover {
    transform: rotateY(8deg) rotateX(8deg) translateZ(10px);
    box-shadow: 0 30px 60px rgba(16, 86, 82, 0.25);
  }

  .card__liquid {
    position: absolute;
    top: -80px;
    left: 0;
    width: 300px;
    height: 200px;
    background: #1E8479;
    border-radius: 50%;
    transform: translateZ(-80px);
    filter: blur(80px);
    transition: transform 0.7s cubic-bezier(0.36, 0, 0.66, -0.56), opacity 0.3s ease-in-out;
    opacity: 0;
  }

  .card-inner:hover .card__liquid {
    transform: translateZ(-50px) translateY(30px) translateX(-20px) rotate(-20deg) scale(1.2);
    opacity: 0.7;
  }

  .card__shine {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 30%, rgba(255, 255, 255, 0.6) 50%, rgba(255, 255, 255, 0.1) 70%);
    opacity: 0;
    transition: opacity 0.4s ease-in-out;
  }

  .card-inner:hover .card__shine {
    opacity: 1;
    animation: shine-effect 2s infinite linear;
  }

  .card__glow {
    position: absolute;
    inset: -15px;
    background: radial-gradient(circle at 50% 0%, rgba(30, 132, 121, 0.4) 0%, rgba(30, 132, 121, 0) 60%);
    opacity: 0;
    transition: opacity 0.6s ease-in-out;
  }

  .card-inner:hover .card__glow {
    opacity: 1;
  }

  .card__content {
    padding: 1.25em;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 0;
    position: relative;
    z-index: 2;
  }

  .card__badge {
    position: absolute;
    top: 15px;
    right: 15px;
    background: #ef4444;
    color: white;
    padding: 0.35em 0.75em;
    border-radius: 999px;
    font-size: 0.75em;
    font-weight: 700;
    letter-spacing: 0.5px;
    transform: scale(0.7);
    opacity: 0;
    transition: all 0.5s ease 0.2s;
    z-index: 10;
  }

  .card-inner:hover .card__badge {
    transform: scale(1);
    opacity: 1;
  }

  .card__image {
    width: 100%;
    height: 180px;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    border-radius: 15px;
    transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1);
    position: relative;
    overflow: hidden;
    box-shadow: 0 8px 16px rgba(16, 86, 82, 0.2);
  }

  .card-inner:hover .card__image {
    transform: translateY(-8px) scale(1.03);
  }

  .card__image::after {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.15) 0%, transparent 40%),
      repeating-linear-gradient(-45deg, rgba(255, 255, 255, 0.05) 0px, rgba(255, 255, 255, 0.05) 3px, transparent 3px, transparent 6px);
    opacity: 0.6;
  }

  .card__preview-hint {
    position: absolute;
    bottom: 8px;
    right: 8px;
    width: 32px;
    height: 32px;
    background: rgba(16, 86, 82, 0.9);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    opacity: 0;
    transform: scale(0.8);
    transition: all 0.3s ease;
    z-index: 5;
  }

  .card-inner:hover .card__preview-hint {
    opacity: 1;
    transform: scale(1);
  }

  .card__text {
    display: flex;
    flex-direction: column;
    min-height: 3.9em; /* Fixed height for 3 lines */
    margin-top: 0.9em; /* Gap after image */
  }

  .card__title {
    color: var(--card-text);
    font-size: 0.95em;
    margin: 0;
    font-weight: 500;
    transition: color 0.4s ease-in-out, transform 0.4s ease-in-out;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    word-break: break-word;
  }

  .card-inner:hover .card__title {
    color: var(--card-accent-dark);
    transform: translateX(3px);
  }

  .card__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: auto;
    padding-top: 0.25em;
  }

  .card__price-wrapper {
    display: flex;
    align-items: center;
    gap: 0.5em;
  }

  .card__original-price {
    color: #9ca3af;
    font-size: 0.9em;
    text-decoration: line-through;
    font-weight: 500;
  }

  .card__price {
    color: var(--card-accent-dark);
    font-weight: 700;
    font-size: 1.2em;
    transition: color 0.4s ease-in-out, transform 0.4s ease-in-out;
  }

  .card-inner:hover .card__price {
    color: var(--card-accent);
    transform: translateX(3px);
  }

  .card__button {
    width: 36px;
    height: 36px;
    background: var(--card-accent);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    cursor: pointer;
    transition: transform 0.4s ease-in-out, box-shadow 0.4s ease-in-out, background 0.3s ease;
    transform: scale(0.85);
  }

  .card-inner:hover .card__button {
    transform: scale(1);
    box-shadow: 0 0 0 5px rgba(30, 132, 121, 0.3);
  }

  .card__button:hover {
    background: var(--card-accent-dark);
  }

  .card-inner:hover .card__button svg {
    animation: pulse-button 1.5s infinite;
  }

  @keyframes shine-effect {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(200%); }
  }

  @keyframes pulse-button {
    0% { transform: scale(1); }
    50% { transform: scale(1.15); }
    100% { transform: scale(1); }
  }

  @media (max-width: 640px) {
    .card-inner {
      width: 100%;
      max-width: 280px;
      height: 320px;
    }
    .card__image {
      height: 160px;
    }
    .card__preview-hint {
      display: none;
    }
  }
`;

export default ProductCard;
