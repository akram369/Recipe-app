import React, { useState } from 'react';
import { BookOpen, Layers, Flame, Sparkles, Activity, ShieldCheck, Zap } from 'lucide-react';

export function IntelligentInsightCard({ recipe, handleAdaptAction }) {
  const [adapted, setAdapted] = useState(false);

  return (
    <div className="card" style={{ background: adapted ? '#ecfdf5' : 'var(--bg-hover)', border: adapted ? '1px solid #10b981' : 'none', transition: 'all 0.3s ease', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 className="card-title" style={{ color: adapted ? '#065f46' : 'var(--text-primary)', marginBottom: '0.25rem' }}>
            <Activity size={20} color={adapted ? '#10b981' : "var(--accent-primary)"} /> 
            {adapted ? 'Recipe Adapted to Your Profile' : 'Personalization & Health Insights'}
          </h3>
          <p style={{ fontSize: '0.875rem', color: adapted ? '#064e3b' : 'var(--text-secondary)' }}>
            {adapted ? 'Macros updated for Keto. Ingredients swapped.' : 'We noticed this is high in saturated fat due to Heavy Cream. It conflicts with your "Heart Healthy" goal.'}
          </p>
        </div>
        {!adapted && (
          <button 
            onClick={() => {
              setAdapted(true);
              handleAdaptAction();
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--text-primary)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.2s' }}>
            <Zap size={14} /> Adapt Recipe
          </button>
        )}
        {adapted && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 600, fontSize: '0.875rem' }}>
            <ShieldCheck size={18} /> Optimized
          </div>
        )}
      </div>
      
      {!adapted && (
        <div style={{ marginTop: '1.25rem', display: 'flex', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', background: 'white', borderRadius: '0.5rem', flex: 1, boxShadow: 'var(--shadow-sm)' }}>
            <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Data</span>
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>34g Fat, 12g Carbs</span>
          </div>
          <div style={{ padding: '0.75rem', background: 'white', borderRadius: '0.5rem', flex: 1, boxShadow: 'var(--shadow-sm)' }}>
            <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Insight</span>
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Exceeds daily fat target</span>
          </div>
          <div style={{ padding: '0.75rem', background: 'white', borderRadius: '0.5rem', flex: 1, boxShadow: 'var(--shadow-sm)' }}>
            <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Action</span>
            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--accent-primary)' }}>Swap cream for low-fat milk</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function OverviewCard({ recipe }) {
  return (
    <div className="card">
      <div className="overview-header">
        <div>
          <h2 className="recipe-title">{recipe.title}</h2>
          <div className="badges mt-4">
            {recipe.cuisine && <span className="badge">{recipe.cuisine}</span>}
            {recipe.difficulty && (
              <span className={`badge difficulty-${recipe.difficulty.toLowerCase()}`}>
                {recipe.difficulty}
              </span>
            )}
          </div>
        </div>
        <button style={{ background: 'var(--bg-hover)', border: 'none', padding: '0.5rem 1rem', borderRadius: '9999px', fontWeight: 600, cursor: 'pointer' }}>
          Save Recipe
        </button>
      </div>

      <div className="stats-row">
        <div className="stat-item">
          <span className="stat-value">{recipe.prepTime}</span>
          <span className="stat-label">Prep</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{recipe.cookTime}</span>
          <span className="stat-label">Cook</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{recipe.servings}</span>
          <span className="stat-label">Servings</span>
        </div>
      </div>
    </div>
  );
}

export function InstructionsCard({ instructions }) {
  if (!instructions || !Array.isArray(instructions)) return null;
  return (
    <div className="card">
      <h3 className="card-title">
        <BookOpen size={20} /> Instructions
      </h3>
      <ol className="instruction-list">
        {instructions.map((step, i) => (
          <li key={i} className="instruction-item">{step}</li>
        ))}
      </ol>
    </div>
  );
}

export function IngredientsCard({ ingredients }) {
  if (!ingredients || !Array.isArray(ingredients)) return null;
  return (
    <div className="card">
      <h3 className="card-title">
        <Layers size={20} /> Ingredients
      </h3>
      <ul className="ingredient-list">
        {ingredients.map((ing, i) => (
          <li key={i} className="ingredient-item">
            <span className="ingredient-name">{ing.name}</span>
            <span className="ingredient-amount">{ing.amount}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function NutritionCard({ nutrition }) {
  if (!nutrition) return null;
  return (
    <div className="card">
      <h3 className="card-title">
        <Flame size={20} /> Nutrition
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Calories</span>
          <div style={{ fontWeight: 600, fontSize: '1.125rem' }}>{nutrition.calories}</div>
        </div>
        <div>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Protein</span>
          <div style={{ fontWeight: 600, fontSize: '1.125rem' }}>{nutrition.protein}g</div>
          <div className="nutr-bar-container">
            <div className="nutr-bar" style={{ width: '60%', background: '#3b82f6' }}></div>
          </div>
        </div>
        <div>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Carbs</span>
          <div style={{ fontWeight: 600, fontSize: '1.125rem' }}>{nutrition.carbs}g</div>
          <div className="nutr-bar-container">
            <div className="nutr-bar" style={{ width: '30%', background: '#10b981' }}></div>
          </div>
        </div>
        <div>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Fat</span>
          <div style={{ fontWeight: 600, fontSize: '1.125rem' }}>{nutrition.fat}g</div>
          <div className="nutr-bar-container">
            <div className="nutr-bar" style={{ width: '50%', background: '#f59e0b' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SmartSuggestionsCard({ suggestions }) {
  if (!suggestions || !Array.isArray(suggestions)) return null;
  return (
    <div className="card" style={{ background: 'var(--bg-hover)', border: 'none' }}>
      <h3 className="card-title">
        <Sparkles size={20} color="var(--accent-primary)" /> Smart Suggestions
      </h3>
      <ul style={{ paddingLeft: '1.25rem', fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {suggestions.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>
    </div>
  );
}
