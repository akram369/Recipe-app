import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info } from 'lucide-react';
import './index.css';

import Navbar from './components/Navbar';
import HeroInput from './components/HeroInput';
import { LoadingState } from './components/LoadingState';
import { OverviewCard, InstructionsCard, IngredientsCard, NutritionCard, SmartSuggestionsCard, IntelligentInsightCard } from './components/RecipeCards';
import { SavedRecipesGrid } from './components/SavedRecipesGrid';
import { MealPlannerPanel } from './components/MealPlannerPanel';

const mockExtracted = {
  title: 'Creamy Tuscan Garlic Chicken',
  cuisine: 'Italian',
  difficulty: 'Medium',
  prepTime: '15m',
  cookTime: '20m',
  servings: 4,
  ingredients: [
    { name: 'Chicken Breasts (boneless, skinless)', amount: '1.5 lbs' },
    { name: 'Heavy Cream', amount: '1 cup' },
    { name: 'Sun-dried Tomatoes', amount: '1/2 cup' },
    { name: 'Parmesan Cheese', amount: '1/2 cup' },
    { name: 'Spinach (fresh)', amount: '2 cups' },
    { name: 'Garlic', amount: '4 cloves' }
  ],
  instructions: [
    'Season chicken breasts with salt, pepper, and Italian seasoning.',
    'In a large skillet over medium-high heat, cook chicken until golden brown and cooked through (about 6-8 minutes per side). Remove and set aside.',
    'In the same skillet, add minced garlic and sun-dried tomatoes. Sauté for 1 minute.',
    'Reduce heat to medium. Stir in heavy cream and parmesan cheese until slightly thickened.',
    'Add spinach and simmer until wilted. Return chicken to the skillet, coat in sauce, and serve.'
  ],
  nutrition: { calories: 520, protein: 42, carbs: 12, fat: 34 },
  suggestions: [
    'Swap heavy cream for half-and-half for a lighter version.',
    'Use kale instead of spinach for more texture.'
  ],
  shopping: {
    Produce: ['Garlic', 'Spinach (fresh)'],
    Dairy: ['Heavy Cream', 'Parmesan Cheese'],
    Meat: ['Chicken Breasts']
  }
};

const adaptedRecipeTemplate = {
  ...mockExtracted,
  ingredients: [
    { name: 'Chicken Breasts (boneless, skinless)', amount: '1.5 lbs' },
    { name: 'Coconut Milk (Full Fat)', amount: '1 cup' },
    { name: 'Sun-dried Tomatoes', amount: '1/2 cup' },
    { name: 'Nutritional Yeast', amount: '1/4 cup' },
    { name: 'Spinach (fresh)', amount: '3 cups' },
    { name: 'Garlic', amount: '4 cloves' }
  ],
  nutrition: { calories: 410, protein: 40, carbs: 9, fat: 18 },
  suggestions: [
    'Try adding some crushed red pepper flakes for heat.'
  ]
};

const savedMock = [
  { id: 1, title: 'Spicy Dan Dan Noodles', cuisine: 'Chinese', diff: 'Hard', date: '2 days ago', time: '40m', image: '/dan_dan.png' },
  { id: 2, title: 'Avocado Toast with Egg', cuisine: 'American', diff: 'Easy', date: '5 days ago', time: '10m', image: '/avocado.png' },
  { id: 3, title: 'Matcha Pound Cake', cuisine: 'Japanese', diff: 'Medium', date: '1 week ago', time: '1h 10m', image: '/matcha.png' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('extract'); // "extract" | "saved"
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [recipe, setRecipe] = useState(null);
  const [userEmail, setUserEmail] = useState('chef@example.com');
  const [showSettings, setShowSettings] = useState(false);
  const [savedRecipes, setSavedRecipes] = useState(savedMock);
  const [mealPlan, setMealPlan] = useState(null);

  const [selectedRecipes, setSelectedRecipes] = useState(new Set());

  const handleExtract = async () => {
    if (!url) return;
    setStatus('loading');
    
    try {
      const res = await fetch('http://localhost:3001/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      if (!res.ok) throw new Error('Extraction failed');
      const data = await res.json();
      
      if (!data.ingredients || data.ingredients.length === 0 || !data.instructions || data.instructions.length === 0) {
        throw new Error('Not a recognizable recipe format');
      }
      
      const completeData = {
        ...data,
        id: Date.now(),
        shopping: data.shopping || { dairy: [], produce: [], pantry: [], protein: [], spices: [], others: [] },
        suggestions: data.suggestions || [],
        ingredients: data.ingredients || [],
        instructions: data.instructions || [],
        image: '/dan_dan.png' 
      };

      setRecipe(completeData);
      setStatus('success');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  const handleSaveToKnowledge = () => {
    if (!recipe) return;
    setSavedRecipes([recipe, ...savedRecipes]);
    alert('Recipe saved to your Knowledge Base!');
  };

  const handleGeneratePlan = async () => {
    const selectedList = savedRecipes.filter(r => selectedRecipes.has(r.id));
    if (selectedList.length === 0) return;

    setStatus('loading');
    try {
      const res = await fetch('http://localhost:3001/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipes: selectedList })
      });

      if (!res.ok) throw new Error('Planning failed');
      const data = await res.json();
      setMealPlan(data);
      setStatus('success');
      setActiveTab('saved'); // Stay or switch to saved to see result
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  const toggleSelect = (id) => {
    const next = new Set(selectedRecipes);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedRecipes(next);
  };

  return (
    <div className="app-container">
      <Navbar userEmail={userEmail} onAvatarClick={() => setShowSettings(true)} />

      <div className="tabs-container">
        <button
          className={`tab ${activeTab === 'extract' ? 'active' : ''}`}
          onClick={() => setActiveTab('extract')}
        >
          Extract Recipe
        </button>
        <button
          className={`tab ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          Saved Knowledge
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'extract' && (
          <motion.div key="extract" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>

            {status === 'idle' && (
              <HeroInput url={url} setUrl={setUrl} handleExtract={handleExtract} />
            )}

            {status === 'loading' && <LoadingState />}

            {status === 'error' && (
              <div className="hero-input-zone fade-in">
                <Info size={48} color="#ef4444" style={{ margin: '0 auto' }} />
                <h2>We couldn't extract this page</h2>
                <p>It seems there isn't a recognizable recipe format here. Make sure it's a direct link to a food blog or recipe page.</p>
                <button onClick={() => setStatus('idle')} className="submit-btn" style={{ margin: '0 auto', padding: '0.75rem 2rem' }}>Try Again</button>
              </div>
            )}

            {status === 'success' && recipe && (
              <div className="fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <button className="flex items-center gap-2" style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }} onClick={() => setStatus('idle')}>
                    ← Extract another
                  </button>
                  <button className="submit-btn" style={{ background: 'var(--accent-primary)' }} onClick={handleSaveToKnowledge}>
                    Save to Knowledge Base
                  </button>
                </div>

                <IntelligentInsightCard recipe={recipe} handleAdaptAction={() => alert('Adaptation feature coming soon in live mode!')} />

                <div className="result-grid">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <OverviewCard recipe={recipe} />
                    <InstructionsCard instructions={recipe.instructions} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <IngredientsCard ingredients={recipe.ingredients} />
                    <NutritionCard nutrition={recipe.nutrition} />
                    <SmartSuggestionsCard suggestions={recipe.suggestions} />
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'saved' && (
          <motion.div key="saved" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Your Knowledge Base</h2>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{selectedRecipes.size} selected</span>
                <button className="submit-btn" style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>+ Manual Add</button>
              </div>
            </div>

            <SavedRecipesGrid
              savedRecipes={savedRecipes}
              selectedRecipes={selectedRecipes}
              toggleSelect={toggleSelect}
            />

            {mealPlan && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card mt-4" style={{ border: '2px solid var(--accent-primary)' }}>
                <h3 className="card-title"><Sparkles size={20} className="text-accent"/> Your Intelligent Meal Plan</h3>
                
                <div className="result-grid" style={{ marginTop: '1.5rem' }}>
                   <div>
                      <h4 className="mb-2">Consolidated Shopping List</h4>
                      <div className="card" style={{ background: 'var(--bg-main)' }}>
                        {Object.entries(mealPlan.shopping_list || mealPlan.shopping || {}).map(([cat, items]) => (
                          <div key={cat} className="mb-4">
                            <strong style={{ textTransform: 'capitalize', color: 'var(--accent-primary)' }}>{cat}</strong>
                            <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem', fontSize: '0.875rem' }}>
                              {(Array.isArray(items) ? items : []).map((it, idx) => <li key={idx}>{it}</li>)}
                            </ul>
                          </div>
                        ))}
                      </div>
                   </div>
                   <div>
                      <h4 className="mb-2">Prep Strategy</h4>
                      <div className="card" style={{ background: 'var(--bg-main)', fontSize: '0.875rem' }}>
                        <ul className="instruction-list">
                          {(mealPlan.prep_strategy || mealPlan.strategy || []).map((s, idx) => <li key={idx} className="instruction-item">{s}</li>)}
                        </ul>
                      </div>
                   </div>
                </div>
                <button className="submit-btn" style={{ width: '100%', marginTop: '1rem' }} onClick={() => alert(`Full Meal Plan & Shopping List emailed to ${userEmail}!`)}>Send master copy to email</button>
              </motion.div>
            )}

            <MealPlannerPanel 
              selectedCount={selectedRecipes.size} 
              onGenerate={handleGeneratePlan}
            />

            <AnimatePresence>
              {showSettings && (
                <div className="modal-overlay" onClick={() => setShowSettings(false)}>
                  <motion.div 
                    className="modal-content" 
                    initial={{ scale: 0.9, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3>Delivery Settings</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Where should we send your intelligent meal plans?</p>
                    <div className="input-wrapper" style={{ boxShadow: 'none', marginBottom: '1rem' }}>
                      <input 
                        type="email" 
                        className="url-input" 
                        value={userEmail} 
                        onChange={(e) => setUserEmail(e.target.value)}
                        placeholder="your@email.com"
                      />
                    </div>
                    <button className="submit-btn" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setShowSettings(false)}>Save Settings</button>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
