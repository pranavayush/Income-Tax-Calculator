import { inr } from './taxCalculator';

export function downloadPDF(values: any, results: any) {
  const p = values;
  const old = results.oldRegime, nw = results.newRegime;
  const months = ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"];
  const bestR = p.regime==="both"?(old&&nw?(old.totalAfterRelief<=nw.totalAfterRelief?old:nw):old||nw):(old||nw);
  const annualTax = bestR ? bestR.totalAfterRelief : 0;
  const monthlyBase = Math.floor(annualTax / 12);
  let tdsRows = "", cumTds = 0;
  const fy = "2025-26"; // hardcoded fallback

  for(let i=0; i<12; i++){
    const tds = i === 11 ? (annualTax-cumTds) : monthlyBase;
    cumTds += tds;
    const bal = Math.max(0, annualTax - cumTds);
    const yr = i < 9 ? fy.split("-")[0] : ("20" + fy.split("-")[1]);
    tdsRows += `<tr${i===11?' style="background:#e1f5ee;font-weight:600"':i%2===0?' style="background:#f7f9fc"':''}><td>${months[i]} ${yr}</td><td>₹${inr(Math.round((bestR?.grossSal||0)/12))}</td><td>₹${inr(tds)}</td><td>₹${inr(cumTds)}</td><td>${bal>0?"₹"+inr(bal):'<span style="color:#059669">Nil ✓</span>'}</td></tr>`;
  }

  const rectType = old && nw ? (old.totalAfterRelief <= nw.totalAfterRelief ? "Old Regime" : "New Regime") : (bestR?.type === "old" ? "Old Regime" : "New Regime");
  
  const tdsPaid = (values.iTDSPaid||0) + (values.iAdvTax||0) + (values.iTDSOth||0);
  const balanceTax = Math.max(0, (bestR?.totalAfterRelief||0) - tdsPaid);
  const refund = Math.max(0, tdsPaid - (bestR?.totalAfterRelief||0));

  function regSec(r: any){
    if(!r) return ""; 
    const lbl = r.type==="old"?"OLD REGIME":"NEW REGIME";
    const slabR = r.slabDetail.map((sl: any)=>{
        const toS=sl.to===Infinity?"above":inr(sl.to);
        return `<tr style="background:#f7f9fc"><td style="padding-left:20px">₹${inr(sl.from)} – ₹${toS} @ ${(sl.rate*100).toFixed(0)}%</td><td>₹${inr(sl.tax)}</td></tr>`;
    }).join("");
    const dedR = r.type==="old" ? Object.entries(r.dedBreak).filter(([,v]: any)=>v>0).map(([k,v]: any)=>`<tr><td style="padding-left:20px">${k}</td><td>₹${inr(v)}</td></tr>`).join("") : "";
    return `<tr><th colspan="2" style="background:#0A1628;color:#fff;padding:10px;font-size:13px">COMPUTATION — ${lbl}</th></tr>
    <tr><td>Gross Salary</td><td>₹${inr(r.grossSal)}</td></tr>
    ${r.hraEx>0?`<tr><td style="padding-left:20px">Less: HRA Exemption</td><td>(₹${inr(r.hraEx)})</td></tr>`:""}
    <tr><td style="padding-left:20px">Less: Standard Deduction</td><td>(₹${inr(r.stdDed)})</td></tr>
    ${r.type==="old"?`<tr><td>Less: Deductions VI-A (Total)</td><td>(₹${inr(r.dedTotal)})</td></tr>${dedR}`:`${r.dedTotal>0?`<tr><td style="padding-left:20px">Less: 80CCD(2) Employer NPS</td><td>(₹${inr(r.dedTotal)})</td></tr>`:""}`}
    ${r.netSTCG111A>0?`<tr><td>STCG u/s 111A @15%</td><td>₹${inr(r.netSTCG111A)}</td></tr>`:""}
    ${r.ltcg112AAfterSec54>0?`<tr><td>LTCG u/s 112A @10%</td><td>₹${inr(r.ltcg112AAfterSec54)}</td></tr>`:""}
    ${r.ltcgOthAfterSec54>0?`<tr><td>LTCG u/s 112 @20%</td><td>₹${inr(r.ltcgOthAfterSec54)}</td></tr>`:""}
    <tr style="background:#E8F1FD;font-weight:700"><td>Total Taxable Income</td><td>₹${inr(r.taxableInc)}</td></tr>
    ${slabR}
    ${r.stcgTax>0?`<tr style="background:#f7f9fc"><td style="padding-left:20px">STCG Tax @15%</td><td>₹${inr(r.stcgTax)}</td></tr>`:""}
    ${r.ltcgTax112A>0?`<tr style="background:#f7f9fc"><td style="padding-left:20px">LTCG Tax 112A @10%</td><td>₹${inr(r.ltcgTax112A)}</td></tr>`:""}
    ${r.ltcgOthTax>0?`<tr style="background:#f7f9fc"><td style="padding-left:20px">LTCG Tax @20%</td><td>₹${inr(r.ltcgOthTax)}</td></tr>`:""}
    ${r.lotteryTax>0?`<tr style="background:#f7f9fc"><td style="padding-left:20px">Lottery @30%</td><td>₹${inr(r.lotteryTax)}</td></tr>`:""}
    ${r.rebate>0?`<tr style="color:#059669"><td>Less: Rebate u/s 87A</td><td>(₹${inr(r.rebate)})</td></tr>`:""}
    <tr><td>Add: Cess @4%</td><td>₹${inr(r.cess)}</td></tr>
    <tr style="background:#0A1628;color:#fff;font-weight:700"><td>Total Tax Liability</td><td>₹${inr(r.total)}</td></tr>
    <tr style="background:#1A6FD8;color:#fff;font-weight:700;font-size:14px"><td>NET TAX PAYABLE</td><td>₹${inr(r.totalAfterRelief)}</td></tr><tr><td colspan="2" style="padding:6px"></td></tr>`;
  }

  const printHTML=`<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Tax Computation</title>
  <style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Segoe UI',Arial,sans-serif;font-size:12px;color:#0F172A;background:#fff;padding:20px}.page{max-width:800px;margin:0 auto}
  .hdr{background:linear-gradient(135deg,#0A1628,#1A6FD8);color:#fff;padding:20px 24px;border-radius:8px;margin-bottom:16px}.hdr h1{font-size:18px;font-weight:700}.hdr .sub{color:#93C5FD;font-size:11px;margin-top:4px}
  .info-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:14px}.info-box{background:#F1F5F9;border:1px solid #CBD5E1;border-radius:6px;padding:10px}.info-box .lbl{font-size:10px;color:#64748B;font-weight:600;text-transform:uppercase;margin-bottom:3px}.info-box .val{font-size:13px;font-weight:700;color:#0F172A}
  .sec-title{background:#E2E8F0;border-left:4px solid #1A6FD8;padding:8px 12px;font-weight:700;font-size:12px;color:#0A1628;margin:14px 0 8px;text-transform:uppercase;letter-spacing:.05em}
  table{width:100%;border-collapse:collapse;margin-bottom:14px;font-size:12px}th,td{padding:7px 10px;border:1px solid #CBD5E1;text-align:left}th{background:#0A1628;color:#fff;font-weight:600}td:last-child{text-align:right}th:last-child{text-align:right}
  .compare-box{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px}.cbox{border:2px solid #1A6FD8;border-radius:6px;padding:12px;text-align:center}.cbox.winner{border-color:#059669;background:#D1FAE5}.cbox .lbl{font-size:11px;font-weight:700;text-transform:uppercase;color:#64748B;margin-bottom:6px}.cbox .tax{font-size:22px;font-weight:700;color:#0A1628}.cbox.winner .tax{color:#059669}.tag{display:inline-block;margin-top:6px;padding:2px 10px;border-radius:10px;font-size:10px;font-weight:700;background:#059669;color:#fff}
  .disclaimer{background:#FEF3C7;border:1px solid #D97706;border-radius:6px;padding:8px 12px;font-size:10px;color:#92400E;margin-top:10px}
  .footer{margin-top:20px;padding-top:12px;border-top:2px solid #CBD5E1;font-size:10px;color:#64748B;text-align:center}
  @media print{body{padding:0}@page{margin:15mm}}</style></head>
  <body><div class="page">
  <div class="hdr"><h1>Income Tax Computation — ${values.tName||"Taxpayer"}</h1><div class="sub">AY ${values.tAY} · Income-tax Act, 1961 · React Engine</div></div>
  <div class="info-grid">
    <div class="info-box"><div class="lbl">Taxpayer</div><div class="val">${values.tName||"—"}</div></div>
    <div class="info-box"><div class="lbl">PAN</div><div class="val">${values.tPAN||"N/A"}</div></div>
    <div class="info-box"><div class="lbl">Employer</div><div class="val">${values.tEmployer||"—"}</div></div>
    <div class="info-box"><div class="lbl">Assessment Year</div><div class="val">${values.tAY}</div></div>
    <div class="info-box"><div class="lbl">Regime Selected</div><div class="val">${rectType}</div></div>
  </div>
  ${old&&nw?`<div class="sec-title">Regime Comparison</div><div class="compare-box">
    <div class="cbox${old.totalAfterRelief<=nw.totalAfterRelief?" winner":""}"><div class="lbl">Old Regime</div><div class="tax">₹${inr(old.totalAfterRelief)}</div>${old.totalAfterRelief<=nw.totalAfterRelief?'<div class="tag">✓ RECOMMENDED</div>':""}</div>
    <div class="cbox${nw.totalAfterRelief<old.totalAfterRelief?" winner":""}"><div class="lbl">New Regime</div><div class="tax">₹${inr(nw.totalAfterRelief)}</div>${nw.totalAfterRelief<old.totalAfterRelief?'<div class="tag">✓ RECOMMENDED</div>':""}</div>
  </div>`:""}
  <div class="sec-title">Tax Computation</div>
  <table><tr><th style="width:65%">Particulars</th><th>Amount (₹)</th></tr>${regSec(old)}${regSec(nw)}</table>
  <div class="sec-title">TDS & Tax Payments</div>
  <table><tr><th>Description</th><th>Amount (₹)</th></tr>
  <tr><td>Total Tax Liability</td><td>₹${inr(bestR?.totalAfterRelief||0)}</td></tr>
  <tr style="background:#f7f9fc"><td style="padding-left:20px">Less: TDS Paid</td><td>(₹${inr(tdsPaid)})</td></tr>
  ${balanceTax>0?`<tr style="background:#FEE2E2;font-weight:700;color:#DC2626"><td>Self-Assessment Tax Payable</td><td>₹${inr(balanceTax)}</td></tr>`:refund>0?`<tr style="background:#D1FAE5;font-weight:700;color:#059669"><td>Refund Due</td><td>₹${inr(refund)}</td></tr>`:`<tr style="background:#D1FAE5;font-weight:700;color:#059669"><td>Tax fully settled</td><td>Nil</td></tr>`}
  </table>
  <div class="sec-title">Monthly TDS Schedule</div>
  <table><tr><th>Month</th><th>Monthly Salary</th><th>TDS</th><th>Cumulative TDS</th><th>Balance</th></tr>${tdsRows}<tr style="background:#0A1628;color:#fff;font-weight:700"><td>TOTAL</td><td>₹${inr(bestR?.grossSal)}</td><td>₹${inr(annualTax)}</td><td>₹${inr(annualTax)}</td><td>—</td></tr></table>
  <div class="footer">Generated by React Tax Engine<br/>Printed: ${new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"long",year:"numeric"})}</div>
  </div><script>window.onload=function(){window.print();}</script></body></html>`;

  const win = window.open("","_blank");
  if(!win){alert("Pop-up blocked! Allow pop-ups and try again."); return;}
  win.document.write(printHTML);
  win.document.close();
}

export function downloadJSON(values: any, results: any) {
    const p = values;
    const r = p.regime==="both"?(results.oldRegime&&results.newRegime?(results.oldRegime.totalAfterRelief<=results.newRegime.totalAfterRelief?results.oldRegime:results.newRegime):results.oldRegime||results.newRegime):(results.oldRegime||results.newRegime);
    
    const itrJSON = {
      "ITR": {
        "ITR1": {
          "Form_ITR1": {
            "FormName": "ITR-1",
            "AssessmentYear": p.tAY?.replace("-", "") || "202627",
          },
          "PersonalInfo": {
            "AssesseeName": {
              "FirstName": p.tName?.split(" ")[0] || "ASSESSEE",
              "SurName": p.tName?.split(" ").slice(-1)[0] || "NAME"
            },
            "PAN": p.tPAN || "ABCDE1234F",
          },
          "ITR1_IncomeDeductions": {
            "GrossSalary": Math.round(r?.grossSal || 0),
            "TotalDeductions": Math.round(r?.dedTotal || 0),
            "TotalIncome": Math.round(r?.taxableInc || 0)
          },
          "ITR1_TaxComputed": {
            "TotalTaxPayable": Math.round(r?.total || 0),
            "NetTaxPayable": Math.round(r?.totalAfterRelief || 0)
          }
        }
      }
    };
  
    const jsonStr = JSON.stringify(itrJSON, null, 2);
    const blob = new Blob([jsonStr], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ITR_Computation_${p.tPAN||"USER"}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
