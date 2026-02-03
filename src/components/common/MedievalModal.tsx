import React from 'react';

interface MedievalModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
}

const MedievalModal: React.FC<MedievalModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
}) => {
  if (!isOpen) return null;

  const maxWidthStyles = {
    small: '400px',
    medium: '500px',
    large: '700px',
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
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
          width: '90%',
          maxWidth: maxWidthStyles[size],
          margin: '16px',
        }}
      >
        {/* Decorative top bar */}
        <div
          style={{
            backgroundColor: '#6b4423',
            height: '12px',
            borderRadius: '4px 4px 0 0',
            marginTop: '-4px',
            marginLeft: '-4px',
            marginRight: '-4px',
          }}
        />
        
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '32px',
            height: '32px',
            backgroundColor: '#8b0000',
            border: '2px solid #4a0000',
            borderRadius: '4px',
            color: '#f5e6c8',
            fontFamily: "'Cinzel', serif",
            fontWeight: 'bold',
            fontSize: '16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          X
        </button>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {title && (
            <h2
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#5d2e0c',
                marginBottom: '16px',
                textAlign: 'center',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              {title}
            </h2>
          )}
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
      </div>
    </div>
  );
};

export default MedievalModal;
