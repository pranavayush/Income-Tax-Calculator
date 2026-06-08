import React, { useRef, useState } from 'react';
import { useTax } from '../context/TaxContext';
import { Field, SelectField } from './ui/Field';
import { extractForm16Data } from '../lib/pdfParser';
import { FileText, ClipboardList, FolderOpen, CheckCircle, AlertTriangle, Building, Scale, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Step1Profile = () => {
  const { values, handleChange, setStep, setValues } = useTax();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<{ status: React.ReactNode; progress: number; data?: any } | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadState({ status: `Reading ${file.name}...`, progress: 30 });
    try {
      setUploadState({ status: `Analyzing Form 16 content...`, progress: 60 });
      const data = await extractForm16Data(file);

      // Auto-fill values
      const patch: any = {};
      if (data.name) patch.tName = data.name;
      if (data.pan) patch.tPAN = data.pan;
      if (data.employer) patch.tEmployer = data.employer;
      if (data.basic) patch.iBasic = data.basic;
      if (data.hra) patch.iHRA = data.hra;
      if (data.gross_salary && !data.basic) patch.iBasic = data.gross_salary;
      if (data.tds_deducted) patch.iTDSPaid = data.tds_deducted;
      if (data.d80C > 0) patch.d80C_epf = data.d80C;

      setValues(prev => ({ ...prev, ...patch }));

      setUploadState({ status: <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={14} color="#059669" /> Form 16 data extracted successfully!</span>, progress: 100, data });
    } catch (err: any) {
      setUploadState({ status: <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#DC2626' }}><AlertTriangle size={14} /> Extraction failed: {err.message}. Please fill manually.</span>, progress: 0 });
    }
  };

  const entity = values.tEmpType || 'salaried';
  const showTrust = ['trust_charitable','trust_religious','trust_private','sec8','university','political','firm','llp','aop','boi','coop','local_auth','ajp'].includes(entity);
  const isAOP = ['aop','boi'].includes(entity);

  return (
    <div id="s1">
      <div className="card">
        <div className="card-title">
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FileText size={18} /> Form 16 Upload — Auto-Fill Details</span>
          <span style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'none', fontWeight: 400 }}>Upload PDF for extraction</span>
        </div>
        <div className="upload-zone" onClick={() => fileInputRef.current?.click()}>
          <div className="upload-icon"><ClipboardList size={32} color="#1A6FD8" /></div>
          <div className="upload-title">Upload Form 16 (Part A & B)</div>
          <div className="upload-sub">Supports PDF. Extracts salary, TDS, and employer details automatically.</div>
          <div className="upload-btn">
            <button className="btn-primary" type="button" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FolderOpen size={16} /> Choose File
            </button>
          </div>
        </div>
        <input type="file" ref={fileInputRef} accept=".pdf" style={{ display: 'none' }} onChange={handleUpload} />
        
        <AnimatePresence>
          {uploadState && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ marginTop: '12px', overflow: 'hidden' }}>
              <div style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '6px' }}>{uploadState.status}</div>
              <div className="upload-bar-bg"><div className="upload-bar" style={{ width: `${uploadState.progress}%` }}></div></div>
              {uploadState.data && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="extracted-preview">
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#059669', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={14} /> Extracted from Form 16:</div>
                  <div className="extracted-row"><span>Name</span><span>{uploadState.data.name || "—"}</span></div>
                  <div className="extracted-row"><span>PAN</span><span>{uploadState.data.pan || "—"}</span></div>
                  <div className="extracted-row"><span>Employer</span><span>{uploadState.data.employer || "—"}</span></div>
                  <div className="extracted-row"><span>Gross Salary</span><span>₹{uploadState.data.gross_salary || uploadState.data.basic || 0}</span></div>
                  <div className="extracted-row"><span>TDS Deducted</span><span>₹{uploadState.data.tds_deducted || 0}</span></div>
                  <div className="extracted-row"><span>80C Deductions</span><span>₹{uploadState.data.d80C || 0}</span></div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="card">
        <div className="card-title">Step 1 of 4 — Taxpayer Profile</div>
        <div className="g3" style={{ marginBottom: '12px' }}>
          <Field label="Full Name" name="tName" type="text" placeholder="e.g. Name of Assessee" />
          <Field label="PAN" name="tPAN" type="text" placeholder="ABCDE1234F" maxLength={10} onInputTransform={v => v.toUpperCase()} />
          <Field label="Employer / Company" name="tEmployer" type="text" placeholder="Employer name" />
        </div>
        <div className="g4" style={{ marginBottom: '12px' }}>
          <SelectField label="Assessment Year" name="tAY" options={[{ label: 'AY 2025-26 (FY 2024-25)', value: '2025-26' }, { label: 'AY 2026-27 (FY 2025-26)', value: '2026-27' }]} />
          <SelectField label="Age Category" name="tAge" options={[{ label: 'Below 60 years', value: 'below60' }, { label: '60–80 years (Senior)', value: '60to80' }, { label: 'Above 80 (Super Senior)', value: 'above80' }]} />
          <SelectField label="Residential Status" name="tStatus" options={[{ label: 'Resident Indian', value: 'resident' }, { label: 'NRI', value: 'nri' }]} />
          <SelectField label="Entity / Employment Type" name="tEmpType" options={[]} optgroups={[
            { label: '── Individuals ──', options: [ { label: 'Salaried Employee', value: 'salaried' }, { label: 'Pensioner', value: 'pensioner' }, { label: 'Self-Employed / Proprietor', value: 'self' }, { label: 'Professional (Doctor/CA/Lawyer)', value: 'professional' } ] },
            { label: '── Non-Individual Entities ──', options: [ { label: 'HUF (Hindu Undivided Family)', value: 'huf' }, { label: 'Partnership Firm', value: 'firm' }, { label: 'LLP', value: 'llp' }, { label: 'AOP (Association of Persons)', value: 'aop' }, { label: 'BOI (Body of Individuals)', value: 'boi' }, { label: 'Public Charitable Trust', value: 'trust_charitable' }, { label: 'Religious Trust / Wakf', value: 'trust_religious' }, { label: 'Private Trust', value: 'trust_private' }, { label: 'Company (Pvt/Public/OPC)', value: 'company' }, { label: 'Section 8 Company', value: 'sec8' }, { label: 'Co-operative Society', value: 'coop' }, { label: 'Local Authority', value: 'local_auth' }, { label: 'Political Party', value: 'political' }, { label: 'University / College / Hospital', value: 'university' }, { label: 'AJP', value: 'ajp' } ] }
          ]} />
        </div>

        {showTrust && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'linear-gradient(135deg,#EDE9FE,#DDD6FE)', border: '1.5px solid #A78BFA', borderRadius: '10px', padding: '14px', marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#4C1D95', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}><Building size={16} /> Trust / AOP / BOI — Registration & Compliance Details</div>
            <div className="g3" style={{ marginBottom: '8px' }}>
              <Field label="Registration Number (12A/12AB/80G)" name="tTrustReg" type="text" placeholder="e.g. DIT(E)/2023/..." />
              <Field label="Date of Registration" name="tTrustRegDate" type="date" />
              <SelectField label="Registration Type" name="tTrustRegType" options={[ { label: 'Sec 12AB — Provisional (3 yr)', value: '12AB_prov' }, { label: 'Sec 12AB — Final (5 yr)', value: '12AB_final' }, { label: '80G Approved', value: '80G' }, { label: 'Not Registered', value: 'none' } ]} />
            </div>
            <div className="alert warn" style={{ marginBottom: 0, fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={14} /> Trusts registered u/s 12AB must re-register every 5 years. Failure invalidates exemption claim for that year.
            </div>
          </motion.div>
        )}

        {isAOP && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'linear-gradient(135deg,#FEF3C7,#FDE68A)', border: '1.5px solid #FCD34D', borderRadius: '10px', padding: '14px', marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#92400E', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}><Scale size={16} /> AOP / BOI — Member Share Determination</div>
            <div className="g3">
              <Field label="Number of Members" name="aopMembers" type="number" min="2" placeholder="2" />
              <SelectField label="Shares of Members" name="tAOPShares" options={[{ label: 'Determinate (known % shares)', value: 'determinate' }, { label: 'Indeterminate (unknown shares)', value: 'indeterminate' }]} />
              <SelectField label="Tax Rate Applicable" name="aopTaxRate" options={[{ label: 'Slab Rates (if determinate)', value: 'slab' }, { label: 'MMR — 30% (if indeterminate)', value: 'mmr' }]} />
            </div>
          </motion.div>
        )}

        <div style={{ marginBottom: '10px' }}>
          <div className="section-label">Regime Selection</div>
          <div className="rtabs">
            <button className={`rtab ${values.regime === 'old' ? 'on' : ''}`} onClick={() => handleChange('regime', 'old')}>Old Regime</button>
            <button className={`rtab ${values.regime === 'new' ? 'on' : ''}`} onClick={() => handleChange('regime', 'new')}>New Regime</button>
            <button className={`rtab ${values.regime === 'both' ? 'on' : ''}`} onClick={() => handleChange('regime', 'both')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>Compare Both <Zap size={14} /></button>
          </div>
        </div>
        
        <div className="alert info">AY {values.tAY}: New Regime std. deduction Rs.{values.tAY === '2026-27' ? '75,000' : '50,000'} | 87A rebate up to Rs.{values.tAY === '2026-27' ? '60,000' : '25,000'}</div>

        <div className="btn-row">
          <button className="btn-primary" onClick={() => setStep(2)}>Next: Income Details →</button>
        </div>
      </div>
    </div>
  );
};
