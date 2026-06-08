import * as pdfjsLib from 'pdfjs-dist';

// Define the worker script appropriately (works nicely in Vite via CDN for no config pain)
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export async function extractForm16Data(file: File) {
  if (file.type !== "application/pdf") {
    throw new Error("Direct extraction only supported for PDF. For images, please use a scanner.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    fullText += content.items.map((item: any) => item.str).join(" ") + "\n";
  }

  const parse = (regex: RegExp, text: string) => { const m = text.match(regex); return m ? m[1].trim() : null; };
  const parseNum = (regex: RegExp, text: string) => { 
    const m = text.match(regex); 
    if(!m) return 0;
    return parseFloat(m[1].replace(/,/g, "")) || 0;
  };

  return {
    name: parse(/Name of the Assessee\s*[:\-]?\s*([A-Z\s]+)(?=\s|PAN)/i, fullText) || parse(/([A-Z\s]{5,})(?=\s*PAN)/, fullText),
    pan: parse(/PAN\s*of\s*the\s*Assessee\s*[:\-]?\s*([A-Z]{5}[0-9]{4}[A-Z]{1})/i, fullText) || parse(/([A-Z]{5}[0-9]{4}[A-Z]{1})/, fullText),
    employer: parse(/Name\s*of\s*the\s*Employer\s*[:\-]?\s*([A-Z0-9\s,\.]+)(?=\s|TAN)/i, fullText),
    gross_salary: parseNum(/Gross\s*Salary\s*.*?([0-9,]+\.[0-9]{2}|[0-9,]{4,})/i, fullText),
    tds_deducted: parseNum(/Total\s*amount\s*of\s*tax\s*deducted\s*.*?([0-9,]+\.[0-9]{2}|[0-9,]{4,})/i, fullText),
    d80C: parseNum(/Section\s*80C\s*.*?([0-9,]+\.[0-9]{2}|[0-9,]{4,})/i, fullText),
    basic: parseNum(/Basic\s*Salary\s*.*?([0-9,]+\.[0-9]{2}|[0-9,]{4,})/i, fullText),
    hra: parseNum(/House\s*Rent\s*Allowance\s*.*?([0-9,]+\.[0-9]{2}|[0-9,]{4,})/i, fullText)
  };
}
