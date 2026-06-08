import React, { useState } from 'react';
import { useTax } from '../context/TaxContext';
import { inr } from '../lib/taxCalculator';
import { downloadPDF, downloadJSON } from '../lib/exportUtils';
import { Accordion } from './ui/Accordion';

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
        <div id="s4">
            <div className="top-tabs">
                <button className={`top-tab ${tab === 'summary' ? 'active' : ''}`} onClick={() => setTab('summary')}>📊 Summary</button>
                <button className={`top-tab ${tab === 'capital' ? 'active' : ''}`} onClick={() => setTab('capital')}>📈 Capital Gains</button>
                <button className={`top-tab ${tab === 'computation' ? 'active' : ''}`} onClick={() => setTab('computation')}>📋 Computation</button>
                <button className={`top-tab ${tab === 'tds' ? 'active' : ''}`} onClick={() => setTab('tds')}>📅 Monthly TDS</button>
            </div>

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
                            <div className="alert success"><strong>✓ Recommended: {rectType}</strong> — saves ₹{inr(diff)} for AY {values.tAY}. <span className={`badge ${rectType.includes("New")?"new":"old"}`}>{rectType}</span></div>
                        </div>
                    )}
                    
                    <div className="card">
                        <div className="card-title">Tax Summary — {r.type === 'old' ? 'Old Regime' : 'New Regime'}</div>
                        <div className="metrics">
                            <div className="metric"><div className="metric-label">Gross Income</div><div className="metric-value blue">₹{inr(r.grossSal + r.taxableInc)} {/* approximation for view */}</div></div>
                            <div className="metric"><div className="metric-label">Taxable Income</div><div className="metric-value blue">₹{inr(r.taxableInc)}</div></div>
                            <div className="metric"><div className="metric-label">Total Deductions</div><div className="metric-value green">₹{inr(r.dedTotal)}</div></div>
                            <div className="metric"><div className="metric-label">Total Tax Liability</div><div className="metric-value red">₹{inr(r.totalAfterRelief)}</div></div>
                        </div>
                        {balTax > 0 && <div className="alert warn"><strong>⚠ Balance Tax Payable: ₹{inr(balTax)}</strong> — Pay via Challan 280.</div>}
                        {refund > 0 && <div className="alert success"><strong>✓ Refund Due: ₹{inr(refund)}</strong></div>}
                        {balTax === 0 && refund === 0 && <div className="alert success"><strong>✓ Tax fully settled.</strong></div>}
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
                            <tr><th>Type</th><th>Gain / Loss (₹)</th></tr>
                            <tr><td>STCG u/s 111A (@15%)</td><td>₹{inr(results.cg.stcg111A)}</td></tr>
                            <tr><td>Other STCG (Slab Rate)</td><td>₹{inr(results.cg.stcgOth)}</td></tr>
                            <tr><td>LTCG u/s 112A (@10% after Rs.1L/1.25L limit)</td><td>₹{inr(results.cg.ltcg112A)}</td></tr>
                            <tr><td>LTCG Other u/s 112 (@20% with indexation)</td><td>₹{inr(results.cg.ltcgOth)}</td></tr>
                            <tr className="row-green"><td>Total Sec. 54 Exemption Claimed</td><td>(₹{inr(results.cg.totalSec54)})</td></tr>
                            {results.cg.lottery > 0 && <tr><td>Winnings (Flat 30%)</td><td>₹{inr(results.cg.lottery)}</td></tr>}
                        </table>
                    )}
                </div>
            )}

            {tab === 'computation' && (
                <div className="card">
                    <div className="card-title">Detailed Tax Computation</div>
                    <table className="ctable">
                        <tr><th style={{ width: '65%' }}>Particulars</th><th>Amount (₹)</th></tr>
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
                    </table>
                </div>
            )}
            
            {tab === "tds" && (
                <div className="card">
                    <div className="card-title">Monthly TDS Schedule Example</div>
                    <div className="alert info">Estimated equal deduction plan based on total tax liability of ₹{inr(r.totalAfterRelief)}.</div>
                    <table className="tds-table">
                        <tr><th>Month</th><th>TDS</th></tr>
                        {["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"].map(m => (
                            <tr key={m}><td>{m}</td><td>₹{inr(Math.round(r.totalAfterRelief / 12))}</td></tr>
                        ))}
                    </table>
                </div>
            )}

            <div className="card" style={{ marginTop: '8px' }}>
                <div className="btn-row" style={{ justifyContent: 'space-between', marginTop: 0 }}>
                    <button className="btn-secondary" onClick={() => setStep(3)}>← Edit Detail</button>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-green" onClick={() => downloadPDF(values, results)}>⬇ Download PDF</button>
                        <button onClick={() => downloadJSON(values, results)} style={{ background: '#5B21B6', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>
                            📥 Export JSON
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
