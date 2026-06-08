import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { calculateTax } from '../lib/taxCalculator';
import { TaxValues, TaxResults } from '../types';

interface TaxContextType {
  values: TaxValues;
  handleChange: (name: string, val: any) => void;
  setValues: React.Dispatch<React.SetStateAction<TaxValues>>;
  results: TaxResults;
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
}

export const TaxContext = createContext<TaxContextType | null>(null);

export const useTax = () => {
  const ctx = useContext(TaxContext);
  if (!ctx) throw new Error("useTax must be used within TaxProvider");
  return ctx;
};

const defaultValues: TaxValues = {
  tAY: '2026-27',
  tAge: 'below60',
  tStatus: 'resident',
  tEmpType: 'salaried',
  regime: 'both',
  hpType: 'sop',
  pgbpScheme: '44AD',
  vehicles: []
};

export const TaxProvider = ({ children }: { children: ReactNode }) => {
  const [values, setValues] = useState<TaxValues>(defaultValues);
  const [step, setStep] = useState(1);

  const handleChange = (name: string, val: any) => {
    setValues(p => ({ ...p, [name]: val }));
  };

  const results = useMemo(() => calculateTax(values), [values]);

  return (
    <TaxContext.Provider value={{ values, handleChange, setValues, results, step, setStep }}>
      {children}
    </TaxContext.Provider>
  );
};
