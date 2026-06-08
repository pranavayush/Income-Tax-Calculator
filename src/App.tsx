import React from 'react';
import { TaxProvider, useTax } from './context/TaxContext';
import { Header } from './components/Header';
import { Step1Profile } from './components/Step1Profile';
import { Step2Income } from './components/Step2Income';
import { Step3Deductions } from './components/Step3Deductions';
import { Step4Results } from './components/Step4Results';
import { AnimatePresence, motion } from 'motion/react';

const AppContent = () => {
  const { step } = useTax();

  return (
    <>
      <div className="app">
        <Header />
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Step1Profile />
            </motion.div>
          )}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Step2Income />
            </motion.div>
          )}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Step3Deductions />
            </motion.div>
          )}
          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Step4Results />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default function App() {
  return (
    <TaxProvider>
      <AppContent />
    </TaxProvider>
  );
}
