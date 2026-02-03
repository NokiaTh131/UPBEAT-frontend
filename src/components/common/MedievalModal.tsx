import React, { useState } from 'react';

interface MedievalModalProps {
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  closable?: boolean;
  foldable?: boolean;
  zIndex?: number;
  position?: 'center' | 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  showBackdrop?: boolean;
}

const MedievalModal: React.FC<MedievalModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  closable = true,
  foldable = false,
  zIndex = 9999,
  position = 'center',
  showBackdrop = true,
}) => {
  const [isFolded, setIsFolded] = useState(false);

  if (!isOpen) return null;

  const maxWidthStyles = {
    small: '400px',
    medium: '500px',
    large: '700px',
  };

  // Position styles based on position prop
  const getPositionStyles = (): React.CSSProperties => {
    if (isFolded || position !== 'center') {
      const positionMap: Record<string, React.CSSProperties> = {
        'center': { alignItems: 'center', justifyContent: 'center' },
        'bottom-left': { alignItems: 'flex-end', justifyContent: 'flex-start', padding: '20px' },
        'bottom-right': { alignItems: 'flex-end', justifyContent: 'flex-end', padding: '20px' },
        'top-left': { alignItems: 'flex-start', justifyContent: 'flex-start', padding: '20px' },
        'top-right': { alignItems: 'flex-start', justifyContent: 'flex-end', padding: '20px' },
      };
      return positionMap[isFolded ? 'bottom-left' : position] || positionMap['center'];
    }
    return { alignItems: 'center', justifyContent: 'center' };
  };

  const positionStyles = getPositionStyles();
  const shouldShowBackdrop = showBackdrop && !isFolded && position === 'center';

  return (
    <div
      onClick={closable && shouldShowBackdrop ? onClose : undefined}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: shouldShowBackdrop ? 'rgba(0, 0, 0, 0.7)' : 'transparent',
        display: 'flex',
        ...positionStyles,
        zIndex: zIndex,
        pointerEvents: shouldShowBackdrop ? 'auto' : 'none',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#e8d4a8',
          border: '4px solid #8b4513',
          borderRadius: '8px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          position: 'relative',
          width: isFolded ? 'auto' : (position === 'center' ? '90%' : 'auto'),
          maxWidth: isFolded ? '250px' : maxWidthStyles[size],
          margin: position === 'center' ? '16px' : '0',
          pointerEvents: 'auto',
        }}
      >
        {/* Header bar */}
        <div
          onClick={foldable ? () => setIsFolded(!isFolded) : undefined}
          style={{
            backgroundColor: '#6b4423',
            padding: '12px 16px',
            borderRadius: isFolded ? '4px' : '4px 4px 0 0',
            marginTop: '-4px',
            marginLeft: '-4px',
            marginRight: '-4px',
            cursor: foldable ? 'pointer' : 'default',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: '1rem',
              fontWeight: 700,
              color: '#f5e6c8',
            }}
          >
            {title || 'Notice'}
          </span>
          {foldable && (
            <span
              style={{
                color: '#f5e6c8',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                marginLeft: '16px',
              }}
            >
              {isFolded ? '+' : '-'}
            </span>
          )}
        </div>

        {/* Content - hidden when folded */}
        {!isFolded && (
          <>
            {/* Close button - only if closable */}
            {closable && onClose && (
              <button
                onClick={onClose}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  width: '28px',
                  height: '28px',
                  backgroundColor: '#8b0000',
                  border: '2px solid #4a0000',
                  borderRadius: '4px',
                  color: '#f5e6c8',
                  fontFamily: "'Cinzel', serif",
                  fontWeight: 'bold',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1,
                }}
              >
                X
              </button>
            )}

            {/* Content */}
            <div style={{ padding: '24px' }}>
              {children}
            </div>

            {/* Decorative bottom bar */}
            <div
              style={{
                backgroundColor: '#6b4423',
                height: '12px',
                borderRadius: '0 0 4px 4px',
                marginBottom: '-4px',
                marginLeft: '-4px',
                marginRight: '-4px',
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default MedievalModal;
