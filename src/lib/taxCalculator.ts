// Core configurations and utility calculations ported from original JS

export const AY_CONFIG: Record<string, any> = {
  "2025-26":{
    fy:"2024-25",newStd:50000,oldStd:50000,
    newRebLim:700000,newRebAmt:25000,oldRebLim:500000,oldRebAmt:12500,
    newSlabs:[{mn:0,mx:300000,r:0},{mn:300000,mx:600000,r:.05},{mn:600000,mx:900000,r:.10},{mn:900000,mx:1200000,r:.15},{mn:1200000,mx:1500000,r:.20},{mn:1500000,mx:Infinity,r:.30}],
    oldSlabs:{below60:[{mn:0,mx:250000,r:0},{mn:250000,mx:500000,r:.05},{mn:500000,mx:1000000,r:.20},{mn:1000000,mx:Infinity,r:.30}],"60to80":[{mn:0,mx:300000,r:0},{mn:300000,mx:500000,r:.05},{mn:500000,mx:1000000,r:.20},{mn:1000000,mx:Infinity,r:.30}],above80:[{mn:0,mx:500000,r:0},{mn:500000,mx:1000000,r:.20},{mn:1000000,mx:Infinity,r:.30}]},
    cess:.04,ltcgLimit:100000,
    note:"AY 2025-26: New Regime std. deduction Rs.50,000 | 87A rebate up to Rs.25,000 if income ≤ Rs.7,00,000 | LTCG 112A exempt: Rs.1,00,000"
  },
  "2026-27":{
    fy:"2025-26",newStd:75000,oldStd:50000,
    newRebLim:1200000,newRebAmt:60000,oldRebLim:500000,oldRebAmt:12500,
    newSlabs:[{mn:0,mx:400000,r:0},{mn:400000,mx:800000,r:.05},{mn:800000,mx:1200000,r:.10},{mn:1200000,mx:1600000,r:.15},{mn:1600000,mx:2000000,r:.20},{mn:2000000,mx:2400000,r:.25},{mn:2400000,mx:Infinity,r:.30}],
    oldSlabs:{below60:[{mn:0,mx:250000,r:0},{mn:250000,mx:500000,r:.05},{mn:500000,mx:1000000,r:.20},{mn:1000000,mx:Infinity,r:.30}],"60to80":[{mn:0,mx:300000,r:0},{mn:300000,mx:500000,r:.05},{mn:500000,mx:1000000,r:.20},{mn:1000000,mx:Infinity,r:.30}],above80:[{mn:0,mx:500000,r:0},{mn:500000,mx:1000000,r:.20},{mn:1000000,mx:Infinity,r:.30}]},
    cess:.04,ltcgLimit:125000,
    note:"AY 2026-27: New Regime std. deduction Rs.75,000 | 87A rebate up to Rs.60,000 if income ≤ Rs.12,00,000 | LTCG 112A exempt: Rs.1,25,000"
  }
};

export function inr(v: number | string | null | undefined): string {
  if (v === null || v === undefined || isNaN(Number(v))) return "0";
  let num = Math.round(Number(v));
  if (num === 0) return "0";
  const neg = num < 0;
  num = Math.abs(num);
  let str = num.toString();
  let result = str.length <= 3 ? str : str.slice(-3);
  let rest = str.length > 3 ? str.slice(0, -3) : "";
  while (rest.length > 2) {
    result = rest.slice(-2) + "," + result;
    rest = rest.slice(0, -2);
  }
  if (rest) result = rest + "," + result;
  return (neg ? "(" : "") + result + (neg ? ")" : "");
}

export function inrFull(v: number | string | null | undefined): string {
  if (!v || Number(v) === 0) return "₹0";
  return "₹" + inr(v);
}

export function calcHRA(basic: number, da: number, hra: number, rent: number, city: string) {
  const sal = basic + da;
  const pct = city === "metro" ? 0.5 : 0.4;
  const a = hra;
  const b = Math.max(0, rent - 0.1 * sal);
  const c = pct * sal;
  return { exempt: Math.max(0, Math.min(a, b, c)), a, b, c };
}

export function calcSlab(inc: number, slabs: any[]) {
  let tax = 0, detail: any[] = [];
  for (const sl of slabs) {
    if (inc <= sl.mn) break;
    const amt = Math.min(inc, sl.mx) - sl.mn;
    const t = amt * sl.r;
    if (sl.r > 0) detail.push({ from: sl.mn, to: Math.min(inc, sl.mx), rate: sl.r, tax: t });
    tax += t;
  }
  return { tax, detail };
}

export function calculateTax(values: Record<string, any>) {
  const n = (id: string) => Number(values[id]) || 0;
  const s = (id: string) => values[id] || "";

  const ay = s("tAY") || "2026-27";
  const cfg = AY_CONFIG[ay] || AY_CONFIG["2026-27"];
  const age = s("tAge") || "below60";

  // --- SALARY HEAD ---
  const basic = n("iBasic"), da = n("iDA"), hra = n("iHRA");
  const spl = n("iSpl"), bonus = n("iBonus"), othAllow = n("iOthAllow"), overtime = n("iOvertime"), deputation = n("iDeputation");
  const transport = n("iTransport"), cea = n("iCEA");
  const ceaKids = Math.min(n("iCEAKids") || 2, 2);
  const hostel = n("iHostel"), uniform = n("iUniform"), research = n("iResearch"), helper = n("iHelper"), mine = n("iMine"), da2 = n("iDA2");
  const rfa = n("iRFA"), carPerq = n("iCarPerq"), esopTax = n("iESOPTax"), loanPerq = n("iLoanPerq"), clubPerq = n("iClubPerq"), perqOth = n("iPerq");
  const ltaRec = n("iLTAReceived"), ltaExempt = n("iLTAExempt");
  const ltaTax = Math.max(0, ltaRec - ltaExempt);
  const gratRec = n("iGratuityRec"), gratExempt = n("iGratuityExempt");
  const gratTax = Math.max(0, gratRec - gratExempt);
  const leaveExempt = n("iLeaveEnExempt");
  const pension = n("iPension"), vrs = n("iVRS");

  const ceaExemptCalc = Math.min(cea, 100 * 12 * ceaKids);
  const hostelExemptCalc = Math.min(hostel, 300 * 12 * ceaKids);
  const manualExempt = n("iExemptAllow10_14");
  const total10_14Exempt = manualExempt > 0 ? manualExempt : (ceaExemptCalc + hostelExemptCalc);

  const grossSal = basic + da + hra + spl + bonus + othAllow + overtime + deputation
    + transport + cea + hostel + uniform + research + helper + mine + da2
    + rfa + carPerq + esopTax + loanPerq + clubPerq + perqOth
    + ltaTax + gratTax + pension + n("iArrears") + vrs;

  const hraCalc = calcHRA(basic, da, hra, n("iRent"), s("iCity"));

  // --- HOUSE PROPERTY HEAD ---
  let hpOld = 0, hpNew = 0;
  let hpType = values.hpType || 'sop';
  const hpManualStr = s("iHP");
  if (hpManualStr.trim() !== "") {
    hpOld = n("iHP"); hpNew = hpOld;
  } else {
    if (hpType === "sop" || hpType === "both") {
      const intSOP = n("iHP_SOPInt") + n("iHP_PreConInt");
      hpOld += Math.max(-intSOP, -200000); hpNew += 0;
    }
    if (hpType === "lo" || hpType === "both") {
      const expRent = n("iHP_ExpRent"), stdRent = n("iHP_StdRent"), actRent = n("iHP_ActRent");
      const vacant = n("iHP_Vacant"), unrealised = n("iHP_UnrealisedRent"), munTax = n("iHP_MunTax");
      const loInt = n("iHP_LOInt") + n("iHP_LOPreInt");
      const rer = stdRent > 0 ? Math.min(expRent, stdRent) : expRent;
      const actAdj = Math.max(0, actRent - unrealised - (actRent * vacant / 12));
      const gav = Math.max(rer, actAdj);
      const nav = Math.max(0, gav - munTax);
      const loIncome = nav - Math.round(nav * 0.30) - loInt;
      hpOld += loIncome; hpNew += loIncome;
    }
    if (hpType === "both" && n("iHP_BothSOPInt") > 0) {
      const bothSOPInt = Math.min(n("iHP_BothSOPInt"), 200000);
      const bothLONAV = n("iHP_BothLONAV"), bothLOInt = n("iHP_BothLOInt");
      const loNet = bothLONAV - Math.round(bothLONAV * 0.30) - bothLOInt;
      hpOld = -bothSOPInt + loNet; hpNew = loNet;
    }
  }

  // --- BUSINESS / PGBP ---
  let finalPgbpIncome = 0;
  const pgbpScheme = values.pgbpScheme || '44AD';
  if (pgbpScheme === '44AD') {
    const turnover = n("i44AD_turnover");
    const cash = Math.min(n("i44AD_cash"), turnover);
    const digital = Math.max(0, turnover - cash);
    const rateMode = s("i44AD_rate") || "8";
    let presumptive = 0;
    if (rateMode === 'mixed') { presumptive = Math.round(cash * 0.08) + Math.round(digital * 0.06); }
    else if (rateMode === '6') { presumptive = Math.round(turnover * 0.06); }
    else { presumptive = Math.round(turnover * 0.08); }
    const actual = n("i44AD_actual");
    finalPgbpIncome = actual > presumptive ? actual : presumptive;
  } else if (pgbpScheme === '44ADA') {
    const receipts = n("i44ADA_receipts");
    const presumptive = Math.round(receipts * 0.50);
    const actual = n("i44ADA_actual");
    finalPgbpIncome = actual > presumptive ? actual : presumptive;
  } else if (pgbpScheme === '44AE') {
    const vehicles = Array.isArray(values.vehicles) ? values.vehicles : [];
    let tot = 0;
    vehicles.forEach(v => {
      const gvw = Number(v.gvw) || 0;
      const months = Number(v.months) || 12;
      tot += v.type === 'heavy' ? (gvw * 1000 * months) : (7500 * months);
    });
    finalPgbpIncome = tot;
  } else {
    const rev = n("iPGBP_turnover") + n("iPGBP_othInc") + n("iPGBP_assetSale");
    const exp = n("iPGBP_cogs") + n("iPGBP_salary") + n("iPGBP_rent") + n("iPGBP_int") + n("iPGBP_repair") + n("iPGBP_adv") + n("iPGBP_baddebt") + n("iPGBP_othExp");
    const dep = n("iPGBP_dep") + n("iPGBP_unabsDep");
    finalPgbpIncome = rev - exp - dep + n("iPGBP_disallow") - n("iPGBP_bfLoss");
  }

  // --- OTHER SOURCES ---
  const famPenRaw = n("iFamPen");
  const famPenExempt = Math.min(famPenRaw / 3, 15000);
  const famPenTaxable = Math.max(0, famPenRaw - famPenExempt);
  const osInterest = n("iOthFD") + n("iOthSB") + n("iPostOfficeInt") + n("iP2PInt") + n("iITRefundInt") + n("iNSCInt");
  const osDiv = n("iOthDiv") + n("iMFDiv") + n("iDeemedDiv");
  const osRent = n("iSubletting") + n("iMachineRent") + n("iCompositeRent");
  const osGifts = n("iGifts") + n("iGiftProp") + n("iGiftMovable");
  const osMisc = n("iRoyalty") + n("iCompInt") + n("iKeyman") + n("iOthMisc");
  const osDeductions = n("iOSExpenses") + n("iOSBorrowInt") + n("iMachineRepair") + Math.round(n("iMachineRent") * 0.30);
  const othSlabInc = osInterest + osDiv + osRent + osGifts + famPenTaxable + osMisc - osDeductions + n("iOth");
  const lottery = n("iLotteryOS") + n("iOnlineGames") + n("iGambling") + n("iLottery");
  const horse = n("iHorse");

  // --- CAPITAL GAINS ---
  const stcg111A = Math.max(0, n("iSTCG_sale") - n("iSTCG_cost") - n("iSTCG_exp"));
  const stcgOth = Math.max(0, n("iSTCGOth_sale") - n("iSTCGOth_cost") - n("iSTCGOth_exp"));
  const ltcg112A = Math.max(0, n("iLTCG_sale") - n("iLTCG_cost") - n("iLTCG_exp"));

  const ciiP = n("iCIIPurchase"), ciiS = n("iCIISale"), origCost = n("iLTCGOth_cost");
  const indexedCost = (ciiP > 0 && ciiS > 0) ? Math.round(origCost * (ciiS / ciiP)) : origCost;
  const ltcgOth = Math.max(0, n("iLTCGOth_sale") - indexedCost - n("iLTCGOth_exp"));

  const ex54EC = Math.min(n("ex54EC"), 5000000);
  const totalSec54 = n("ex54") + n("ex54B") + n("ex54D") + ex54EC + n("ex54F") + n("ex54G");

  // --- DEDUCTIONS ---
  const d80CItems = n("d80C_epf") + n("d80C_ppf") + n("d80C_elss") + n("d80C_lic") + n("d80C_nsc") + n("d80C_po") + n("d80C_hl") + n("d80C_tf") + n("d80C_fd");
  const d80C = Math.min(d80CItems, 150000);
  const self_lim = age === "below60" ? 25000 : 50000;
  const self_med = age === "above80" ? n("d80D_med") : 0;
  const d80D = Math.min(n("d80D_self") + n("d80D_phc"), self_lim) + self_med + Math.min(n("d80D_par"), 25000) + Math.min(n("d80D_parSr"), 50000);
  
  const inpVars = {
    grossSal, hp: hpOld, hpNew, biz: finalPgbpIncome, othSlabInc, lottery, horse,
    stcg111A, stcgOth, ltcg112A, ltcgOth, totalSec54,
    d80C, d1B: Math.min(n("d1B"), 50000), d2: n("d2"), d80D, d80E: n("d80E"),
    d80G100: n("d80G100"), d80G50: n("d80G50"), d80GGA: n("d80GGA"), d80GGC: n("d80GGC"),
    d80TTA: n("d80TTA"), d80TTB: n("d80TTB"), d80U: n("d80U"), d80DD: n("d80DD"), d80DDB: n("d80DDB"),
    d80EE: n("d80EE"), d80EEA: n("d80EEA"), d80EEB: n("d80EEB"), d80GG: n("d80GG"),
    d80RRB: n("d80RRB"), d80QQB: n("d80QQB"), d80JJAA: n("d80JJAA"), d80IAC: n("d80IAC"),
    dOth: n("dOth"), d89: n("d89"), age, ay, basic, da, hra, rent: n("iRent"), city: s("iCity")
  };

  const calcRegime = (type: string) => {
    const ltcgFreeLimit = cfg.ltcgLimit || 125000;
    let hraEx = 0, stdDed = 0, dedTotal = 0, dedBreak: any = {};

    if (type === "old") {
      hraEx = hraCalc.exempt; stdDed = cfg.oldStd;
      const isSr = age === "60to80" || age === "above80";
      const c80TTA = isSr ? 0 : Math.min(inpVars.d80TTA, 10000);
      const c80TTB = isSr ? Math.min(inpVars.d80TTB, 50000) : 0;
      const c80G50 = Math.min(inpVars.d80G50, grossSal * 0.1);
      dedBreak = {
        "80C (PF/PPF/ELSS/LIC etc.)": inpVars.d80C, "80CCD(1B) — Own NPS": inpVars.d1B, "80CCD(2) — Employer NPS": inpVars.d2,
        "80D — Health Insurance": inpVars.d80D, "80DD — Disabled Dependent": Math.min(inpVars.d80DD, 125000),
        "80DDB — Specified Disease": Math.min(inpVars.d80DDB, 100000), "80E — Education Loan": inpVars.d80E,
        "80EE — First Home Loan": Math.min(inpVars.d80EE, 50000), "80EEA — Affordable Housing": Math.min(inpVars.d80EEA, 150000),
        "80EEB — EV Loan": Math.min(inpVars.d80EEB, 150000), "80G — Donations (100%)": inpVars.d80G100,
        "80G — Donations (50%)": c80G50, "80GGA — Scientific Research": inpVars.d80GGA, "80GGC — Political Party": inpVars.d80GGC,
        "80GG — Rent Paid": inpVars.d80GG, "80RRB — Patent Royalty": Math.min(inpVars.d80RRB, 300000),
        "80QQB — Author Royalty": Math.min(inpVars.d80QQB, 300000), "80JJAA — New Employment": inpVars.d80JJAA,
        "80IAC — Startup Holiday": inpVars.d80IAC, "80TTA — SB Interest": c80TTA, "80TTB — FD/SB (Sr.)": c80TTB,
        "80U — Own Disability": Math.min(inpVars.d80U, 125000), "Others": inpVars.dOth
      };
      dedTotal = Object.values(dedBreak).reduce((acc: any, val: any) => acc + val, 0) as number;
    } else {
      stdDed = cfg.newStd; dedBreak = { "80CCD(2) — Employer NPS (New Regime)": inpVars.d2 }; dedTotal = inpVars.d2; hraEx = 0;
    }

    const hpAllowed = type === "old" ? Math.max(inpVars.hp, -200000) : (inpVars.hpNew || 0);
    const netSTCG111A = Math.max(0, stcg111A);
    const ltcg112AAfterSec54 = Math.max(0, ltcg112A - Math.min(totalSec54, ltcg112A));
    const ltcgTax112A = ltcg112AAfterSec54 > ltcgFreeLimit ? (ltcg112AAfterSec54 - ltcgFreeLimit) * 0.10 : 0;
    const ltcgOthAfterSec54 = Math.max(0, ltcgOth - (Math.max(0, totalSec54 - ltcg112A)));
    const ltcgOthTax = ltcgOthAfterSec54 * 0.20;
    const lotteryTax = (lottery + horse) * 0.30;
    
    let taxableInc = Math.max(0, grossSal - hraEx - stdDed - dedTotal + hpAllowed + finalPgbpIncome + othSlabInc + stcgOth);

    // Entity taxation overrides
    const entity = s("tEmpType");
    let baseTax = 0, slabDetail: any[] = [];
    if (["firm", "llp", "aop", "boi", "local_auth", "coop", "ajp"].includes(entity)) {
      // 30% flat approx (simplification matching original logic for firms without explicit determinate sharing)
      baseTax = taxableInc * 0.30;
    } else if (entity === "company" || entity === "sec8") {
      baseTax = taxableInc * 0.30; // 30% simplification
    } else if (["trust_charitable", "trust_religious"].includes(entity)) {
      baseTax = taxableInc * 0.30; // Taxed at MMR if exempt fails, logic simplified
    } else {
       const slabs = type === "old" ? cfg.oldSlabs[age] : cfg.newSlabs;
       const slabRes = calcSlab(taxableInc, slabs);
       baseTax = slabRes.tax;
       slabDetail = slabRes.detail;
    }

    const stcgTax = netSTCG111A * 0.15;
    const ltcgTax = ltcgTax112A + ltcgOthTax;
    const taxBefore = baseTax + stcgTax + ltcgTax + lotteryTax;

    const rebLim = type === "old" ? cfg.oldRebLim : cfg.newRebLim;
    const rebAmt = type === "old" ? cfg.oldRebAmt : cfg.newRebAmt;
    let rebate = 0, margRelief = 0;
    if (taxableInc <= rebLim) {
      if (['firm', 'company', 'trust_charitable', 'trust_religious', 'aop'].includes(entity)) {
        rebate = 0; // No 87A rebate for entities
      } else {
        rebate = Math.min(baseTax, rebAmt);
      }
    } else {
      const excess = taxableInc - rebLim;
      if (baseTax > excess && !['firm', 'company', 'trust_charitable', 'trust_religious', 'aop'].includes(entity)) {
        margRelief = baseTax - excess;
      }
    }

    const afterRebate = Math.max(0, taxBefore - rebate - margRelief);
    let surcharge = 0;
    const totalGrossInc = taxableInc + netSTCG111A + ltcg112AAfterSec54 + ltcgOthAfterSec54 + lottery + horse;
    const surSlabs = [{ mn: 50000000, r: .30 }, { mn: 20000000, r: .25 }, { mn: 10000000, r: .15 }, { mn: 5000000, r: .10 }];
    for (const sl of surSlabs) {
      if (totalGrossInc > sl.mn) { surcharge = afterRebate * sl.r; break; }
    }
    const cess = (afterRebate + surcharge) * cfg.cess;
    const total = Math.round(afterRebate + surcharge + cess);
    const sec89 = inpVars.d89 || 0;
    const totalAfterRelief = Math.max(0, total - sec89);

    return { type, grossSal, hraEx, stdDed, dedTotal, dedBreak, hpAllowed, taxableInc, slabDetail,
      stcgTax, ltcgTax, lotteryTax, netSTCG111A, ltcg112AAfterSec54, ltcgOthAfterSec54, ltcgFreeLimit,
      totalSec54, lottery, horse, othSlabInc, stcg111A, ltcg112A, ltcgOth, stcgOth,
      taxBefore, rebate, margRelief, surcharge, cess, total, totalAfterRelief, rebLim, rebAmt, sec89, ltcgTax112A, ltcgOthTax };
  };

  const oldRegime = (s("regime") === "old" || s("regime") === "both") ? calcRegime("old") : null;
  const newRegime = (s("regime") === "new" || s("regime") === "both") ? calcRegime("new") : null;

  return {
    salary: { grossSal, hraCalc, total10_14Exempt, ltaExempt, gratExempt, leaveExempt, netTaxable: oldRegime?.taxableInc },
    hp: { type: hpType, old: hpOld, new: hpNew, sopInt: n("iHP_SOPInt") + n("iHP_PreConInt") },
    pgbp: { val: finalPgbpIncome },
    os: { interest: osInterest, div: osDiv, rent: osRent, gifts: osGifts, famPen: famPenTaxable, misc: osMisc, ded: osDeductions, total: othSlabInc },
    cg: { stcg111A, stcgOth, ltcg112A, ltcgOth, totalSec54, origCost, ciiP, ciiS, indexedCost, lottery: lottery + horse },
    oldRegime,
    newRegime,
    tdsPaid: n("iTDSPaid"),
    advTax: n("iAdvTax"),
    tdsOth: n("iTDSOth"),
    finalPayload: inpVars
  };
}
