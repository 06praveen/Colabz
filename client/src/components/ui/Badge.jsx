import React from 'react';

export default function Badge({
  children,
  variant = 'neutral', // success | warning | danger | primary | neutral
  icon: Icon = null,
  className = '',
  dot = false,
  ...props
}) {
  return (
    <span className={`clb-badge clb-badge-${variant} ${className}`} {...props}>
      {dot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: 'currentColor',
            display: 'inline-block'
          }}
        />
      )}
      {Icon && <Icon size={12} />}
      <span>{children}</span>
    </span>
  );
}
