import React from 'react';
import { useTax } from '../context/TaxContext';
import { ShieldCheck, Calculator, FileText, SplitSquareHorizontal, FileInput, CheckCircle2 } from 'lucide-react';

export const Header = () => {
  const { step } = useTax();

  return (
    <>
      <div className="header">
        <div className="header-title">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#fff" strokeWidth="2">
            <rect x="3" y="3" width="22" height="22" rx="4"></rect>
            <path d="M9 10h10M9 14h10M9 18h6"></path>
            <circle cx="21" cy="21" r="5" fill="#1A6FD8" stroke="#fff"></circle>
            <path d="M19 21l1.5 1.5L23 19" strokeWidth="1.5"></path>
          </svg>
          Income Tax Return (As per Income Tax Act)
        </div>
        <div className="header-credit">Designed by Pranav Ayush (Non-Practicing Software Engineer)</div>
        <div className="header-badges">
          <span className="hbadge green" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><ShieldCheck size={14} /> Upload Form 16</span>
          <span className="hbadge gold" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calculator size={14} /> Instant Computation Generator</span>
          <span className="hbadge blue" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FileText size={14} /> Generate PDF</span>
          <span className="hbadge blue" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><SplitSquareHorizontal size={14} /> Bifurcation of Old vs New Regime</span>
          <span className="hbadge blue" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FileInput size={14} /> Form 16 Auto-Fill</span>
          <span className="hbadge blue" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={14} /> 30+ Deduction Sections</span>
        </div>
      </div>

      {/* Progress */}
      <div className="prog-wrap">
        <div className="prog-steps">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`prog-step ${step > i ? 'done' : step === i ? 'on' : ''}`}>
              <div className="prog-circle">{step > i ? <CheckCircle2 size={16} /> : i}</div>
              <div className="prog-label">{['Profile', 'Income', 'Deductions', 'Results'][i-1]}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
