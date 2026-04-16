import React from 'react';
import { Clock } from 'lucide-react';

export function SavedRecipesGrid({ savedRecipes, selectedRecipes, toggleSelect }) {
  return (
    <div className="saved-grid">
      {savedRecipes.map((item) => (
        <div
          key={item.id}
          className="card recipe-mini-card"
          onClick={(e) => {
            if (e.target.tagName !== 'INPUT') toggleSelect(item.id);
          }}
        >
          <input
            type="checkbox"
            className="select-checkbox"
            checked={selectedRecipes.has(item.id)}
            onChange={() => toggleSelect(item.id)}
          />
          <div className="recipe-image-plceholder" style={{ overflow: 'hidden', position: 'relative' }}>
            <img 
              src={item.image} 
              alt="" 
              style={{ objectFit: 'cover', width: '100%', height: '100%', display: 'block' }} 
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', zIndex: -1 }}>
              Image Loading...
            </div>
          </div>
          <h4 className="recipe-mini-title">{item.title}</h4>
          <div className="recipe-meta mb-2">
            <span>{item.cuisine}</span> •{' '}
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Clock size={14} /> {item.time}
            </span>
          </div>
          <span className={`badge difficulty-${item.diff.toLowerCase()}`} style={{ width: 'fit-content' }}>
            {item.diff}
          </span>
        </div>
      ))}
    </div>
  );
}
