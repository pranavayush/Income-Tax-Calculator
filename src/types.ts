export interface TaxValues {
  [key: string]: any;
}

export interface TaxResults {
  salary: any;
  hp: any;
  cg: any;
  os: any;
  pgbp: any;
  trust?: any;
  aop?: any;
  company?: any;
  oldRegime: any;
  newRegime: any;
  tdsPaid: number;
  advTax: number;
  tdsOth: number;
  finalPayload: any;
}
