import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';

export const Accordion: React.FC<{
  title: React.ReactNode;
  badge?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  theme?: 'default' | 'cg' | 'hp' | 'os' | 'pgbp';
}> = ({ title, badge, children, defaultOpen = false, theme = 'default' }) => {
  const [open, setOpen] = useState(defaultOpen);

  let headerStyle = {};
  if (theme === 'cg') headerStyle = { background: 'linear-gradient(135deg,#1e3a5f,#1D4ED8)', color: '#fff' };
  if (theme === 'hp') headerStyle = { background: 'linear-gradient(135deg,#065F46,#059669)', color: '#fff' };
  if (theme === 'os') headerStyle = { background: 'linear-gradient(135deg,#0891B2,#0E7490)', color: '#fff' };
  if (theme === 'pgbp') headerStyle = { background: 'linear-gradient(135deg,#7C2D12,#EA580C)', color: '#fff' };
  if (theme === 'default') headerStyle = { background: 'var(--bg)', color: 'var(--text)' };

  return (
    <div className={`section-accordion ${theme === 'cg' ? 'cg-section-accordion' : ''}`} style={theme !== 'default' ? { borderColor: 'var(--border2)', marginBottom: '14px'} : {}}>
      <div 
        className={`section-acc-header ${open ? 'open' : ''}`} 
        onClick={() => setOpen(!open)}
        style={headerStyle}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {badge}
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={16} strokeWidth={2.5} color={theme === 'default' ? 'inherit' : '#fff'} />
          </motion.div>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="section-acc-body" style={theme !== 'default' ? { padding: '16px 20px' } : {}}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
