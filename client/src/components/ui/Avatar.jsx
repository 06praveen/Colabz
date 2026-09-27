import React from 'react';

export default function Avatar({
  name = 'User',
  src = null,
  size = 36,
  online = false,
  className = '',
}) {
  const getInitials = (str) => {
    if (!str) return 'U';
    const parts = str.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return str.substring(0, 2).toUpperCase();
  };

  return (
    <div
      className={`cz-avatar ${online ? 'cz-avatar-online' : ''} ${className}`}
      style={{ width: `${size}px`, height: `${size}px`, fontSize: `${size * 0.4}px` }}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
        />
      ) : (
        getInitials(name)
      )}
    </div>
  );
}
