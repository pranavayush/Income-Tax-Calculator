import React, { useState } from 'react';
import { useTax } from '../context/TaxContext';
import { inr } from '../lib/taxCalculator';
import { downloadPDF, downloadJSON } from '../lib/exportUtils';
import { Accordion } from './ui/Accordion';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart3, LineChart, FileSpreadsheet, CalendarDays, ArrowLeft, Download, FileJson, BadgeCheck, AlertCircle } from 'lucide-react';

export const Step4Results = () => {
    const { results, values, setStep } = useTax();
    const [tab, setTab] = useState('summary');
    
    if(!results.oldRegime && !results.newRegime) return null;

    const oldR = results.oldRegime;
    const nw= results.newRegime;
    const r = values.regime === "both" ? (oldR && nw ? (oldR.totalAfterRelief <= nw.totalAfterRelief ? oldR : nw) : oldR || nw) : (oldR || nw);
    
    if(!r) return null;

    const rectType = values.regime === "both" ? (oldR && nw ? (oldR.totalAfterRelief <= nw.totalAfterRelief ? "Old Regime" : "New Regime") : r.type === "old" ? "Old Regime" : "New Regime") : (r.type === "old" ? "Old Regime" : "New Regime");
    const diff = Math.abs((oldR?.totalAfterRelief||0) - (nw?.totalAfterRelief||0));
    const tdsPaid = results.tdsPaid + results.advTax + results.tdsOth;
    const balTax = Math.max(0, r.totalAfterRelief - tdsPaid);
    const refund = Math.max(0, tdsPaid - r.totalAfterRelief);
    const hasCG = results.cg.stcg111A > 0 || results.cg.stcgOth > 0 || results.cg.ltcg112A > 0 || results.cg.ltcgOth > 0 || results.cg.lottery > 0;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} id="s4">
            <div className="top-tabs">
                <button className={`top-tab ${tab === 'summary' ? 'active' : ''}`} onClick={() => setTab('summary')}><BarChart3 size={16} /> Summary</button>
                <button className={`top-tab ${tab === 'capital' ? 'active' : ''}`} onClick={() => setTab('capital')}><LineChart size={16} /> Capital Gains</button>
                <button className={`top-tab ${tab === 'computation' ? 'active' : ''}`} onClick={() => setTab('computation')}><FileSpreadsheet size={16} /> Computation</button>
                <button className={`top-tab ${tab === 'tds' ? 'active' : ''}`} onClick={() => setTab('tds')}><CalendarDays size={16} /> Monthly TDS</button>
            </div>

            <AnimatePresence mode="wait">
                <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                    {tab === 'summary' && (
                        <>
                            {values.regime === 'both' && oldR && nw && (
                                <div className="card">
                                    <div className="card-title">Regime Comparison — AY {values.tAY}</div>
                                    <div className="metrics">
                                        <div className="metric">
                                            <div className="metric-label">Old Regime Tax</div><div className="metric-value blue">₹{inr(oldR.totalAfterRelief)}</div>
                                        </div>
                                        <div className="metric">
                                            <div className="metric-label">New Regime Tax</div><div className="metric-value blue">₹{inr(nw.totalAfterRelief)}</div>
                                        </div>
                                        <div className="metric">
                                            <div className="metric-label">You Save ({rectType})</div><div className="metric-value green">₹{inr(diff)}</div>
                                        </div>
                                    </div>
                                    <div className="alert success" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <BadgeCheck size={20} />
                                        <div><strong>Recommended: {rectType}</strong> — saves ₹{inr(diff)} for AY {values.tAY}. <span className={`badge ${rectType.includes("New")?"new":"old"}`}>{rectType}</span></div>
                                    </div>
                                </div>
                            )}
                            
                            <div className="card">
                                <div className="card-title">Tax Summary — {r.type === 'old' ? 'Old Regime' : 'New Regime'}</div>
                                <div className="metrics">
                                    <div className="metric"><div className="metric-label">Gross Income</div><div className="metric-value blue">₹{inr(r.grossSal + r.taxableInc)}</div></div>
                                    <div className="metric"><div className="metric-label">Taxable Income</div><div className="metric-value blue">₹{inr(r.taxableInc)}</div></div>
                                    <div className="metric"><div className="metric-label">Total Deductions</div><div className="metric-value green">₹{inr(r.dedTotal)}</div></div>
                                    <div className="metric"><div className="metric-label">Total Tax Liability</div><div className="metric-value red" style={{ fontSize: '24px' }}>₹{inr(r.totalAfterRelief)}</div></div>
                                </div>
                                {balTax > 0 && <div className="alert warn" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <AlertCircle size={20} />
                                    <div><strong>Balance Tax Payable: ₹{inr(balTax)}</strong> — Pay via Challan 280.</div>
                                </div>}
                                {refund > 0 && <div className="alert success" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <BadgeCheck size={20} />
                                    <div><strong>Refund Due: ₹{inr(refund)}</strong></div>
                                </div>}
                                {balTax === 0 && refund === 0 && <div className="alert success" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <BadgeCheck size={20} />
                                    <div><strong>Tax fully settled.</strong></div>
                                </div>}
                            </div>
                        </>
                    )}

                    {tab === 'capital' && (
                        <div className="card">
                            <div className="card-title">Capital Gains Summary</div>
                            {!hasCG ? (
                                <div className="alert info">No capital gains entered.</div>
                            ) : (
                                <table className="ctable">
                                    <thead><tr><th>Type</th><th>Gain / Loss (₹)</th></tr></thead>
                                    <tbody>
                                        <tr><td>STCG u/s 111A (@15%)</td><td>₹{inr(results.cg.stcg111A)}</td></tr>
                                        <tr><td>Other STCG (Slab Rate)</td><td>₹{inr(results.cg.stcgOth)}</td></tr>
                                        <tr><td>LTCG u/s 112A (@10% after Rs.1L/1.25L limit)</td><td>₹{inr(results.cg.ltcg112A)}</td></tr>
                                        <tr><td>LTCG Other u/s 112 (@20% with indexation)</td><td>₹{inr(results.cg.ltcgOth)}</td></tr>
                                        <tr className="row-green"><td>Total Sec. 54 Exemption Claimed</td><td>(₹{inr(results.cg.totalSec54)})</td></tr>
                                        {results.cg.lottery > 0 && <tr><td>Winnings (Flat 30%)</td><td>₹{inr(results.cg.lottery)}</td></tr>}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {tab === 'computation' && (
                        <div className="card">
                            <div className="card-title">Detailed Tax Computation</div>
                            <table className="ctable">
                                <thead><tr><th style={{ width: '65%' }}>Particulars</th><th>Amount (₹)</th></tr></thead>
                                <tbody>
                                    <tr><td>Gross Taxable Salary</td><td>₹{inr(r.grossSal)}</td></tr>
                                    {r.hraEx > 0 && <tr className="row-sub"><td>Less: HRA Exemption</td><td>(₹{inr(r.hraEx)})</td></tr>}
                                    <tr className="row-sub"><td>Less: Standard Deduction</td><td>(₹{inr(r.stdDed)})</td></tr>
                                    {r.type==="old" && r.dedTotal > 0 && <tr><td>Less: Deductions (Chapter VI-A)</td><td>(₹{inr(r.dedTotal)})</td></tr>}
                                    {r.type==="new" && r.dedTotal > 0 && <tr><td>Less: 80CCD(2)</td><td>(₹{inr(r.dedTotal)})</td></tr>}
                                    <tr><td>Income from House Property</td><td>₹{inr(r.hpAllowed)}</td></tr>
                                    <tr><td>Income from PGBP</td><td>₹{inr(results.pgbp.val)}</td></tr>
                                    <tr><td>Income from Other Sources</td><td>₹{inr(r.othSlabInc)}</td></tr>
                                    <tr className="row-total"><td>Total Income</td><td>₹{inr(r.taxableInc)}</td></tr>
                                    <tr><td>Tax on Total Income</td><td>₹{inr(r.taxBefore - r.stcgTax - r.ltcgTax - r.lotteryTax)}</td></tr>
                                    {r.stcgTax > 0 && <tr className="row-sub"><td>Tax on STCG</td><td>₹{inr(r.stcgTax)}</td></tr>}
                                    {r.ltcgTax > 0 && <tr className="row-sub"><td>Tax on LTCG</td><td>₹{inr(r.ltcgTax)}</td></tr>}
                                    {r.rebate > 0 && <tr className="row-sub row-green"><td>Less: Rebate u/s 87A</td><td>(₹{inr(r.rebate)})</td></tr>}
                                    <tr className="row-sub"><td>Add: Surcharge + Cess</td><td>₹{inr(r.surcharge + r.cess)}</td></tr>
                                    <tr className="row-total"><td>Net Tax Payable</td><td>₹{inr(r.totalAfterRelief)}</td></tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                    
                    {tab === "tds" && (
                        <div className="card">
                            <div className="card-title">Monthly TDS Schedule Example</div>
                            <div className="alert info">Estimated equal deduction plan based on total tax liability of ₹{inr(r.totalAfterRelief)}.</div>
                            <table className="tds-table">
                                <thead><tr><th>Month</th><th>TDS</th></tr></thead>
                                <tbody>
                                    {["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"].map(m => (
                                        <tr key={m}><td>{m}</td><td>₹{inr(Math.round(r.totalAfterRelief / 12))}</td></tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card" style={{ marginTop: '8px' }}>
                <div className="btn-row" style={{ justifyContent: 'space-between', marginTop: 0 }}>
                    <button className="btn-secondary" onClick={() => setStep(3)}><ArrowLeft size={16} /> Edit Data</button>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-green" onClick={() => downloadPDF(values, results)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Download size={16} /> PDF</button>
                        <button onClick={() => downloadJSON(values, results)} style={{ background: '#5B21B6', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FileJson size={16} /> JSON
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};
