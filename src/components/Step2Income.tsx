import React from 'react';
import { useTax } from '../context/TaxContext';
import { Field, SelectField } from './ui/Field';
import { inr, inrFull } from '../lib/taxCalculator';
import { Accordion } from './ui/Accordion';

export const Step2Income = () => {
  const { values, results, setStep, handleChange } = useTax();
  const sal = results.salary;
  const raw = results.finalPayload;
  
  return (
    <div id="s2">
      <div className="card">
        <div className="card-title">Step 2 of 4 — Income Details</div>

        {/* SALARY HEAD */}
        <Accordion 
          theme="default" 
          defaultOpen 
          badge={<><span className="acc-badge unclaimed" style={{background: 'rgba(255,255,255,.18)', color: '#fff'}}>Gross: ₹{inr(raw.grossSal)}</span>
                 <span className="acc-badge claimed" style={{background: 'rgba(5,150,105,.35)', color: '#6EE7B7'}}>Net: ₹{inr(sal.netTaxable)}</span></>}
          title={<span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}><span style={{ fontSize: '16px' }}>💼</span>SALARY HEAD</span>}
        >
          <div style={{background:'linear-gradient(135deg,#0A1628,#1A6FD8)', margin: '-16px -20px 16px -20px', padding: '16px 20px', color: '#fff'}}>
              <span style={{ fontSize: '12px', fontWeight: 600 }}>Comprehensive Computation (u/s 15–17)</span>
          </div>

          <div className="section-label" style={{marginTop:0}}>A — Fixed Components</div>
          <div className="g3" style={{ marginBottom: '10px' }}>
            <Field label="Basic Salary" name="iBasic" />
            <Field label="Dearness Allowance (DA)" name="iDA" hint="DA forming part of salary for HRA" />
            <Field label="Special / Personal Allowance" name="iSpl" />
          </div>

          <div className="section-label">B — House Rent Allowance u/s 10(13A)</div>
          <div className="g3" style={{ marginBottom: '6px' }}>
            <Field label="HRA Received (from employer)" name="iHRA" />
            <Field label="Annual Rent Actually Paid" name="iRent" />
            <SelectField label="City Type" name="iCity" options={[{ label: 'Metro (Delhi/Mumbai/Chennai/Kolkata)', value: 'metro' }, { label: 'Non-Metro', value: 'nonmetro' }]} />
          </div>
          <div className="g2" style={{ marginBottom: '10px' }}>
            <Field label="Landlord PAN (if rent > ₹1L/yr)" name="iLandlordPAN" type="text" maxLength={10} onInputTransform={v => v.toUpperCase()} />
            <div style={{ background: 'var(--blue-light)', borderRadius: '8px', padding: '10px 14px', fontSize: '11px', color: 'var(--blue-dark)' }}>
              <strong>HRA Exempt (Old Regime) = Min of:</strong><br />
              (a) HRA Received: <strong>₹{inr(sal.hraCalc.a)}</strong><br />
              (b) Rent − 10% of Basic+DA: <strong>₹{inr(Math.max(0, sal.hraCalc.b))}</strong><br />
              (c) 50%/40% of Basic+DA: <strong>₹{inr(sal.hraCalc.c)}</strong><br />
              <span style={{ color: 'var(--green-dark)', fontWeight: 700 }}>✓ Exempt: <span>₹{inr(sal.hraCalc.exempt)}</span></span>
            </div>
          </div>

          <div className="section-label">C — Other Taxable Allowances</div>
          <div className="g4" style={{ marginBottom: '10px' }}>
            <Field label="Bonus / Ex-Gratia" name="iBonus" />
            <Field label="Other Allowances (Taxable)" name="iOthAllow" />
            <Field label="Overtime Allowance" name="iOvertime" />
            <Field label="Project / Deputation Allowance" name="iDeputation" />
          </div>

          <div className="section-label">D — Partially Exempt Allowances u/s 10(14)</div>
          <div className="g3" style={{ marginBottom: '8px' }}>
            <Field label="Transport Allowance" name="iTransport" hint="Exempt for disabled: Rs.3,200/mo" />
            <Field label="Children Education Allowance" name="iCEA" hint="Exempt: Rs.100/mo per child" />
            <Field label="No. of Children (CEA)" name="iCEAKids" min={0} max={2} />
          </div>
          <div className="g3" style={{ marginBottom: '8px' }}>
            <Field label="Hostel Allowance" name="iHostel" />
            <Field label="Uniform Allowance" name="iUniform" />
            <Field label="Research Allowance" name="iResearch" />
          </div>

          <div className="section-label">E — Perquisites & Retirement</div>
          <div className="g3" style={{ marginBottom: '8px' }}>
            <Field label="Rent-Free Acc. (RFA)" name="iRFA" />
            <Field label="Motor Car / Vehicle" name="iCarPerq" />
            <Field label="ESOP / Sweat Equity" name="iESOPTax" />
          </div>
          <div className="g3" style={{ marginBottom: '8px' }}>
            <Field label="LTA Received" name="iLTAReceived" />
            <Field label="LTA Exempt" name="iLTAExempt" />
            <Field label="Gratuity Received" name="iGratuityRec" />
            <Field label="Gratuity Exempt" name="iGratuityExempt" />
            <Field label="Leave Encash. Rec." name="iLeaveEnRec" />
            <Field label="Leave Encash. Ex." name="iLeaveEnExempt" />
          </div>

          <div style={{ background: 'linear-gradient(135deg,#0A1628,#0F2044)', borderRadius: '10px', padding: '16px', marginTop: '4px' }}>
            <div style={{ color: '#93C5FD', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: '10px' }}>📊 Live Salary Computation</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '4px', fontSize: '12px' }}>
              <span style={{ color: '#CBD5E1' }}>Gross Salary (all components)</span>
              <span style={{ color: '#fff', fontFamily: 'var(--mono)', fontWeight: 700 }}>₹{inr(raw.grossSal)}</span>
              <span style={{ color: '#CBD5E1' }}>Less: HRA Exemption</span><span style={{ color: '#6EE7B7', fontFamily: 'var(--mono)' }}>(₹{inr(sal.hraCalc.exempt)})</span>
              <span style={{ color: '#CBD5E1' }}>Less: Standard Deduction</span><span style={{ color: '#6EE7B7', fontFamily: 'var(--mono)' }}>(₹{inr(results.oldRegime?.stdDed || 50000)})</span>
              <div style={{ gridColumn: '1/-1', borderTop: '1px solid rgba(255,255,255,.1)', margin: '6px 0' }}></div>
              <span style={{ color: '#FCD34D', fontWeight: 700 }}>Net Taxable Salary (Old)</span>
              <span style={{ color: '#FCD34D', fontFamily: 'var(--mono)', fontWeight: 800, fontSize: '15px' }}>₹{inr(sal.netTaxable)}</span>
            </div>
          </div>
        </Accordion>

        {/* HOUSE PROPERTY HEAD */}
        <Accordion theme="default"
          badge={<><span className="acc-badge claimed" style={{background: 'rgba(255,255,255,.18)', color: '#fff'}}>Net HP: ₹{inr(results.hp.old)}</span></>}
          title={<span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}><span style={{ fontSize: '16px' }}>🏠</span> HOUSE PROPERTY HEAD</span>}
        >
          <div style={{background:'linear-gradient(135deg,#065F46,#059669)', margin: '-16px -20px 16px -20px', padding: '16px 20px', color: '#fff'}}>
              <span style={{ fontSize: '12px', fontWeight: 600 }}>Detailed Computation (u/s 22–27)</span>
          </div>
          
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
            <button className={`rtab ${values.hpType === 'sop' ? 'on' : ''}`} onClick={() => handleChange('hpType', 'sop')}>Self-Occupied</button>
            <button className={`rtab ${values.hpType === 'lo' ? 'on' : ''}`} onClick={() => handleChange('hpType', 'lo')}>Let-Out / Deemed Let-Out</button>
            <button className={`rtab ${values.hpType === 'both' ? 'on' : ''}`} onClick={() => handleChange('hpType', 'both')}>Both (Multiple Properties)</button>
          </div>

          {(values.hpType === 'sop' || values.hpType === 'both') && (
            <div style={{ background: 'var(--blue-light)', border: '1.5px solid var(--blue-mid)', borderRadius: '9px', padding: '14px', marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--blue-dark)', marginBottom: '10px' }}>🏡 Self-Occupied Property (SOP)</div>
              <div className="g3">
                <Field label="Annual Value" name="hp_dummy" type="text" readOnly placeholder="NIL" value="NIL" />
                <Field label="Home Loan Interest (u/s 24(b))" name="iHP_SOPInt" hint="Max: Rs.2,00,000 (Old Regime)" />
                <Field label="Pre-Construction Interest" name="iHP_PreConInt" />
              </div>
            </div>
          )}

          {(values.hpType === 'lo' || values.hpType === 'both') && (
            <div style={{ background: 'var(--green-light)', border: '1.5px solid #A7F3D0', borderRadius: '9px', padding: '14px', marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--green-dark)', marginBottom: '10px' }}>🏢 Let-Out Property (LOP)</div>
              <div className="g3">
                <Field label="Expected Rent (ER)" name="iHP_ExpRent" />
                <Field label="Standard Rent (SR)" name="iHP_StdRent" />
                <Field label="Actual Rent Received" name="iHP_ActRent" />
                <Field label="Municipal Taxes Paid" name="iHP_MunTax" />
                <Field label="Home Loan Interest" name="iHP_LOInt" />
              </div>
            </div>
          )}
          
          <div className="g2">
            <Field label="HP Override (if known, overrides calculator)" name="iHP" hint="Leave blank to use calculator" />
          </div>
        </Accordion>

        {/* CAPITAL GAINS */}
        <Accordion theme="default"
          badge={<><span className="acc-badge unclaimed" style={{background: 'rgba(255,255,255,.2)', color: '#fff'}}>Total CG: ₹{inr(results.cg.stcg111A + results.cg.stcgOth + results.cg.ltcg112A + results.cg.ltcgOth)}</span></>}
          title={<span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}><span style={{ fontSize: '16px' }}>📈</span> CAPITAL GAINS</span>}
        >
          <div style={{background:'linear-gradient(135deg,#1e3a5f,#1D4ED8)', margin: '-16px -20px 16px -20px', padding: '16px 20px', color: '#fff'}}>
              <span style={{ fontSize: '12px', fontWeight: 600 }}>Detailed Computation (All Types)</span>
          </div>

          <div className="cg-type-grid">
            <div className="cg-type-card stcg111a">
              <div className="cg-type-badge">📊 STCG u/s 111A</div>
              <div className="cg-type-title">Listed Equity / Equity MF</div>
              <div className="cg-input-row">
                <Field label="Sale Consideration" name="iSTCG_sale" />
                <Field label="Cost of Acquisition" name="iSTCG_cost" />
                <Field label="Transfer Expenses" name="iSTCG_exp" />
              </div>
            </div>

            <div className="cg-type-card stcg-other">
              <div className="cg-type-badge">📉 Other STCG</div>
              <div className="cg-type-title">Other Assets (Slab Rate)</div>
              <div className="cg-input-row">
                <Field label="Sale Consideration" name="iSTCGOth_sale" />
                <Field label="Cost of Acquisition" name="iSTCGOth_cost" />
                <Field label="Transfer Expenses" name="iSTCGOth_exp" />
              </div>
            </div>

            <div className="cg-type-card ltcg112a">
              <div className="cg-type-badge">📈 LTCG u/s 112A</div>
              <div className="cg-type-title">Listed Equity / MF</div>
              <div className="cg-input-row">
                <Field label="Sale Consideration" name="iLTCG_sale" />
                <Field label="Cost of Acquisition" name="iLTCG_cost" />
                <Field label="Transfer Expenses" name="iLTCG_exp" />
              </div>
            </div>

            <div className="cg-type-card ltcg-other">
              <div className="cg-type-badge">🏠 LTCG Other u/s 112</div>
              <div className="cg-type-title">Property / Bonds / Gold</div>
              <div className="cg-input-row">
                <Field label="Sale Consideration" name="iLTCGOth_sale" />
                <Field label="Original Cost" name="iLTCGOth_cost" />
                <Field label="CII Purchase (FY)" name="iCIIPurchase" />
                <Field label="CII Sale (FY)" name="iCIISale" />
                <Field label="Transfer Expenses" name="iLTCGOth_exp" />
              </div>
            </div>
          </div>
          
          <div style={{ background: 'var(--green-light)', border: '1.5px solid #A7F3D0', borderRadius: '11px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--green-dark)', marginBottom: '12px' }}>🏡 Section 54 Exemption Family</div>
              <div className="g3">
                <Field label="Sec 54 (Res. House from HP)" name="ex54" />
                <Field label="Sec 54EC (NHAI / REC Bonds)" name="ex54EC" max={5000000} />
                <Field label="Sec 54F (House from any LTCG)" name="ex54F" />
              </div>
          </div>
        </Accordion>

        {/* OTHER SOURCES */}
        <Accordion theme="default"
          badge={<><span className="acc-badge claimed" style={{background: 'rgba(255,255,255,.18)', color: '#fff'}}>Total: ₹{inr(results.os.total)}</span></>}
          title={<span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}><span style={{ fontSize: '16px' }}>💰</span> OTHER SOURCES</span>}
        >
          <div style={{background:'linear-gradient(135deg,#0891B2,#0E7490)', margin: '-16px -20px 16px -20px', padding: '16px 20px', color: '#fff'}}>
              <span style={{ fontSize: '12px', fontWeight: 600 }}>Comprehensive (u/s 56)</span>
          </div>

          <div className="g3">
            <Field label="FD / RD Interest" name="iOthFD" />
            <Field label="Savings Bank Interest" name="iOthSB" />
            <Field label="Dividends (Equity)" name="iOthDiv" />
            <Field label="Lottery / Games (u/s 115BB)" name="iLotteryOS" />
            <Field label="Family Pension (Gross)" name="iFamPen" />
            <Field label="Misc. Other Income" name="iOth" />
          </div>
        </Accordion>

        {/* PGBP */}
        <Accordion theme="default"
          badge={<><span className="acc-badge claimed" style={{background: 'rgba(255,255,255,.18)', color: '#fff'}}>Net: ₹{inr(results.pgbp.val)}</span></>}
          title={<span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}><span style={{ fontSize: '16px' }}>🏭</span> BUSINESS / PROFESSION</span>}
        >
          <div style={{background:'linear-gradient(135deg,#7C2D12,#EA580C)', margin: '-16px -20px 16px -20px', padding: '16px 20px', color: '#fff'}}>
              <span style={{ fontSize: '12px', fontWeight: 600 }}>PGBP (u/s 28–44)</span>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
            <button className={`rtab ${values.pgbpScheme === '44AD' ? 'on' : ''}`} onClick={() => handleChange('pgbpScheme', '44AD')}>44AD (Business)</button>
            <button className={`rtab ${values.pgbpScheme === '44ADA' ? 'on' : ''}`} onClick={() => handleChange('pgbpScheme', '44ADA')}>44ADA (Profession)</button>
            <button className={`rtab ${values.pgbpScheme === 'regular' ? 'on' : ''}`} onClick={() => handleChange('pgbpScheme', 'regular')}>Regular (Books)</button>
          </div>

          {values.pgbpScheme === '44AD' && (
            <div className="g3">
              <Field label="Total Gross Turnover" name="i44AD_turnover" />
              <Field label="Cash Receipts (of above)" name="i44AD_cash" hint="Cash @8%, Digital @6%" />
              <SelectField label="Presumptive Rate" name="i44AD_rate" options={[{label: '8%', value: '8'}, {label: '6%', value: '6'}, {label: 'Mixed', value: 'mixed'}]} />
            </div>
          )}

          {values.pgbpScheme === '44ADA' && (
            <div className="g2">
              <Field label="Gross Professional Receipts" name="i44ADA_receipts" />
              <Field label="Actual Income Declared (if > 50%)" name="i44ADA_actual" />
            </div>
          )}

          {values.pgbpScheme === 'regular' && (
            <div className="g3">
              <Field label="Gross Turnover" name="iPGBP_turnover" />
              <Field label="Cost of Goods / Expenses" name="iPGBP_cogs" />
              <Field label="Depreciation" name="iPGBP_dep" />
            </div>
          )}
        </Accordion>

        <div className="section-label">TDS / Advance Tax Already Paid</div>
        <div className="g3">
          <Field label="TDS Details (Form 16)" name="iTDSPaid" />
          <Field label="Advance Tax" name="iAdvTax" />
          <Field label="TDS from Others (26AS)" name="iTDSOth" />
        </div>

        <div className="btn-row">
          <button className="btn-secondary" onClick={() => setStep(1)}>← Back</button>
          <button className="btn-primary" onClick={() => setStep(3)}>Next: Deductions →</button>
        </div>
      </div>
    </div>
  );
};
