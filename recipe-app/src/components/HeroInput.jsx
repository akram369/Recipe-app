import React from 'react';
import { Link2 } from 'lucide-react';

export default function HeroInput({ url, setUrl, handleExtract }) {
  return (
    <div className="hero-input-zone fade-in">
      <h1 className="hero-title">Untangle any recipe instantly.</h1>
      <p className="hero-subtitle">
        Paste a messy food blog link, and we'll extract the core instructions, ingredients, and intelligence.
      </p>

      <div className="input-wrapper mt-4">
        <Link2 size={24} style={{ position: 'absolute', left: 20, top: 20, color: 'var(--text-muted)' }} />
        <input
          type="url"
          className="url-input"
          placeholder="https://example.com/recipe-blog-post..."
          style={{ paddingLeft: 56 }}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleExtract()}
        />
        <button className="submit-btn" disabled={!url} onClick={handleExtract}>
          Extract
        </button>
      </div>
    </div>
  );
}
