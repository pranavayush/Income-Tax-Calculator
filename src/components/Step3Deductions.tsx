import React from 'react';
import { useTax } from '../context/TaxContext';
import { Field } from './ui/Field';
import { inr } from '../lib/taxCalculator';
import { Accordion } from './ui/Accordion';

export const Step3Deductions = () => {
    const { results, setStep, values } = useTax();
    const d80C = results.finalPayload?.d80C || 0;
    const isNew = values.regime === 'new';

    return (
        <div id="s3">
            <div className="card">
                <div className="card-title">
                    <span>Step 3 of 4 — Deductions (Chapter VI-A)</span>
                    <span style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: 400, textTransform: 'none' }}>Old Regime: All apply. New: Only 80CCD(2)</span>
                </div>

                <Accordion 
                    defaultOpen 
                    title="📦 80C Group — Investments (Max Rs.1,50,000)" 
                    badge={<span className={`acc-badge ${d80C > 0 ? 'claimed' : 'unclaimed'}`}>₹{inr(d80C)} / ₹1,50,000</span>}
                >
                    <div className="g3" style={{ marginBottom: '8px' }}>
                        <Field label="EPF / VPF Contribution" name="d80C_epf" />
                        <Field label="PPF Contribution" name="d80C_ppf" />
                        <Field label="ELSS Mutual Fund" name="d80C_elss" />
                    </div>
                    <div className="g3" style={{ marginBottom: '8px' }}>
                        <Field label="LIC Premium" name="d80C_lic" />
                        <Field label="NSC" name="d80C_nsc" />
                        <Field label="Home Loan Principal" name="d80C_hl" />
                    </div>
                    <div className="g3" style={{ marginBottom: '8px' }}>
                        <Field label="Children's Tuition Fees" name="d80C_tf" />
                        <Field label="5-Year Tax-Saving FD" name="d80C_fd" />
                    </div>
                </Accordion>

                <Accordion 
                    title="🏦 NPS — National Pension System" 
                    badge={<span className={`acc-badge unclaimed`}>₹{inr((values.d1B||0) + (values.d2||0))}</span>}
                >
                    <div className="g3" style={{ marginBottom: '8px' }}>
                        <Field label="80CCD(1B) — Own NPS" name="d1B" max={50000} hint="Max Rs.50,000. Old Regime only." />
                        <Field label="80CCD(2) — Employer NPS" name="d2" hint="Allowed in New Regime too." />
                    </div>
                </Accordion>

                <Accordion title="🏥 80D — Health Insurance & Medical">
                    <div className="g3" style={{ marginBottom: '8px' }}>
                        <Field label="Self/Spouse/Children Premium" name="d80D_self" />
                        <Field label="Parents Premium" name="d80D_par" />
                        <Field label="Senior Parents Premium" name="d80D_parSr" />
                    </div>
                </Accordion>

                <Accordion title="🏠 Housing & Education Loans (24b, 80EE/A, 80E)">
                    <div className="g3">
                        <Field label="80EE — First Home Addl." name="d80EE" />
                        <Field label="80EEA — Affordable Housing" name="d80EEA" />
                        <Field label="80E — Education Loan Int." name="d80E" />
                    </div>
                </Accordion>

                <Accordion title="🙏 80G — Donations & Relief Funds">
                    <div className="g3">
                        <Field label="80G — 100% Deduction" name="d80G100" />
                        <Field label="80G — 50% Deduction" name="d80G50" />
                        <Field label="80GGC — Political Party" name="d80GGC" />
                    </div>
                </Accordion>

                <Accordion title="💰 80TTA/TTB — Savings/FD Interest">
                    <div className="g2">
                        <Field label="80TTA — Savings Interest (Below 60)" name="d80TTA" />
                        <Field label="80TTB — Deposits Interest (Senior 60+)" name="d80TTB" />
                    </div>
                </Accordion>

                {isNew && (
                    <div className="alert warn">Many of the entered deductions above will automatically be ignored under the New Regime selection.</div>
                )}

                <div className="btn-row">
                    <button className="btn-secondary" onClick={() => setStep(2)}>← Back</button>
                    <button className="btn-green" onClick={() => setStep(4)}>⚡ Calculate Tax </button>
                </div>
            </div>
        </div>
    );
};
