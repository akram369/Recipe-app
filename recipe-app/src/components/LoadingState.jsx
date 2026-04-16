import React from 'react';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

export function LoadingState() {
  return (
    <div className="loading-wrapper fade-in">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}>
        <Search size={48} color="var(--accent-primary)" strokeWidth={1.5} />
      </motion.div>
      <h3>Reading unstructured data...</h3>
      <div className="loading-dots">
        <motion.div className="dot" animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 1 }} />
        <motion.div className="dot" animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} />
        <motion.div className="dot" animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} />
      </div>
    </div>
  );
}
