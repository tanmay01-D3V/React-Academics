import React from 'react';
import './Avatar.css';

const Avatar = ({ src, alt, size = 'medium', initials }) => {
  return (
    <div className={`avatar avatar--${size}`}>
      {src ? (
        <img src={src} alt={alt} className="avatar__image" />
      ) : (
        <span className="avatar__initials">{initials}</span>
      )}
    </div>
  );
};

export default Avatar;