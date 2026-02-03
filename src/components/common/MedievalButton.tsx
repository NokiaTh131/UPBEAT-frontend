import React from 'react';

interface MedievalButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const MedievalButton: React.FC<MedievalButtonProps> = ({
  children,
  onClick,
  variant = 'secondary',
  size = 'medium',
  disabled = false,
  className = '',
  type = 'button',
}) => {
  const baseStyles = `
    font-family: 'Cinzel', serif
    font-weight: 600
    border-radius: 4px
    cursor: pointer
    transition: all 0.2s ease
    text-transform: uppercase
    letter-spacing: 0.05em
    display: inline-flex
    align-items: center
    justify-content: center
    gap: 8px
  `.replace(/\s+/g, ' ');

  const sizeStyles = {
    small: 'px-3 py-2 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg',
  };

  const variantStyles = {
    primary: `
      bg-gold text-leather-dark border-3 border-leather-dark
      hover:bg-gold-light
      shadow-[0_4px_0_#5d2e0c,0_6px_8px_rgba(0,0,0,0.3)]
      hover:shadow-[0_6px_0_#5d2e0c,0_8px_12px_rgba(0,0,0,0.3)]
      hover:-translate-y-0.5
      active:translate-y-0.5
      active:shadow-[0_2px_0_#5d2e0c,0_3px_4px_rgba(0,0,0,0.3)]
    `,
    secondary: `
      bg-parchment text-leather-dark border-3 border-leather
      hover:bg-parchment-light
      shadow-[0_4px_0_#5d2e0c,0_6px_8px_rgba(0,0,0,0.3)]
      hover:shadow-[0_6px_0_#5d2e0c,0_8px_12px_rgba(0,0,0,0.3)]
      hover:-translate-y-0.5
      active:translate-y-0.5
      active:shadow-[0_2px_0_#5d2e0c,0_3px_4px_rgba(0,0,0,0.3)]
    `,
    danger: `
      bg-blood text-parchment-light border-3 border-blood-dark
      hover:bg-blood-light
      shadow-[0_4px_0_#4a0000,0_6px_8px_rgba(0,0,0,0.3)]
      hover:shadow-[0_6px_0_#4a0000,0_8px_12px_rgba(0,0,0,0.3)]
      hover:-translate-y-0.5
      active:translate-y-0.5
      active:shadow-[0_2px_0_#4a0000,0_3px_4px_rgba(0,0,0,0.3)]
    `,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${disabled ? 'opacity-60 cursor-not-allowed transform-none' : ''}
        ${className}
      `}
      style={{
        fontFamily: "'Cinzel', serif",
        fontWeight: 600,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
      }}
    >
      {children}
    </button>
  );
};

export default MedievalButton;
