import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ShoppingBag } from 'lucide-react';

export function MealPlannerPanel({ selectedCount, onGenerate }) {
  return (
    <AnimatePresence>
      {selectedCount > 1 && (
        <motion.div
          className="meal-planner-panel"
          initial={{ y: 100, opacity: 0, x: '-50%' }}
          animate={{ y: 0, opacity: 1, x: '-50%' }}
          exit={{ y: 100, opacity: 0, x: '-50%' }}
        >
          <div className="meal-planner-stats">
            <div className="mp-stat">
              <ShoppingBag size={18} /> {selectedCount * 5} Ingredients
            </div>
            <div className="mp-stat">
              <Clock size={18} /> ~1h 45m Total Prep
            </div>
          </div>
          <button className="mp-btn" onClick={onGenerate}>Generate Meal Plan</button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
