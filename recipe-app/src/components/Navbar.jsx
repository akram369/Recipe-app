import React from 'react';
import { Sparkles, Utensils } from 'lucide-react';

export default function Navbar({ userEmail, onAvatarClick }) {
  return (
    <nav className="navbar">
      <div className="logo-area">
        <Utensils size={28} className="text-accent" strokeWidth={2.5} />
        <span className="logo-text">ClearCook</span>
        <span className="ai-tag ml-2">
          <Sparkles size={10} style={{ display: 'inline', marginRight: 2 }} /> AI-Powered
        </span>
      </div>
      <div
        className="user-avatar"
        onClick={onAvatarClick}
        style={{ 
          width: 36, 
          height: 36, 
          borderRadius: '50%', 
          background: 'var(--accent-primary)', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '0.875rem'
        }}
        title={userEmail}
      >
        {userEmail.charAt(0).toUpperCase()}
      </div>
    </nav>
  );
}
