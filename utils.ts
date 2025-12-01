import { Currency, SIPInputs, YearlyBreakdown, CalculationResult } from './types';

export const formatCurrency = (amount: number, currency: Currency): string => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });
  
  if (currency === Currency.INR) {
     return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  }
  
  return formatter.format(amount);
};

export const calculateSIP = (inputs: SIPInputs): CalculationResult => {
  const { 
    monthlyInvestment, expectedReturn, timePeriod, stepUpPercentage, 
    inflationRate, initialLumpsum, expenseRatio, taxRate, targetAmount 
  } = inputs;
  
  let currentMonthlyInv = monthlyInvestment;
  let totalInvested = initialLumpsum;
  let currentCorpus = initialLumpsum;
  
  // Adjust return for expense ratio
  const effectiveReturn = Math.max(0, expectedReturn - expenseRatio);
  const monthlyRate = effectiveReturn / 12 / 100;

  const breakdown: YearlyBreakdown[] = [];

  for (let year = 1; year <= timePeriod; year++) {
    // Process 12 months
    for (let month = 1; month <= 12; month++) {
      currentCorpus = (currentCorpus + currentMonthlyInv) * (1 + monthlyRate);
      totalInvested += currentMonthlyInv;
    }

    breakdown.push({
      year,
      investedAmount: Math.round(totalInvested),
      totalValue: Math.round(currentCorpus),
      interestEarned: Math.round(currentCorpus - totalInvested),
      monthlyInvestment: Math.round(currentMonthlyInv)
    });

    // Apply Step-up at end of year
    currentMonthlyInv = currentMonthlyInv * (1 + stepUpPercentage / 100);
  }

  // Final Calculations
  const totalValue = Math.round(currentCorpus);
  const totalReturns = Math.round(totalValue - totalInvested);
  
  // Tax Calculation (on gains only)
  const taxAmount = totalReturns * (taxRate / 100);
  const postTaxValue = Math.round(totalValue - taxAmount);

  // Inflation Adjusted Final Value (Purchasing Power)
  // We use the full timePeriod for discount factor
  const inflationFactor = Math.pow(1 + inflationRate / 100, timePeriod);
  const realValue = Math.round(postTaxValue / inflationFactor); // Using post-tax for real value is more realistic

  // Calculate Cost of Delay (1 year delay)
  const delayResult = calculateSimpleSIP(monthlyInvestment, effectiveReturn, timePeriod - 1, stepUpPercentage, initialLumpsum);
  const costOfDelay = Math.round(totalValue - delayResult.totalValue);

  // Milestones
  const milestones = [
    { target: 100000, label: '100k' },
    { target: 1000000, label: '1 Million' },
    { target: 5000000, label: '5 Million' },
    { target: 10000000, label: '10 Million' },
    { target: 100000000, label: '100 Million' },
  ].map(m => {
    const hit = breakdown.find(b => b.totalValue >= m.target);
    return { label: m.label, year: hit ? hit.year : null };
  });

  const absoluteReturnPercentage = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;
  const wealthMultiplier = totalInvested > 0 ? totalValue / totalInvested : 0;
  
  const goalAchievedPercentage = targetAmount > 0 ? Math.min(100, (postTaxValue / targetAmount) * 100) : 0;

  return {
    totalInvested: Math.round(totalInvested),
    totalReturns: Math.round(totalReturns),
    totalValue,
    postTaxValue,
    realValue,
    breakdown,
    costOfDelay,
    milestones,
    absoluteReturnPercentage,
    wealthMultiplier,
    goalAchievedPercentage
  };
};

// Helper for delay calculation
const calculateSimpleSIP = (p: number, r: number, t: number, s: number, l: number) => {
    let currentMonthly = p;
    let corpus = l;
    const monthlyRate = r / 12 / 100;
    for(let y=1; y<=t; y++) {
        for(let m=1; m<=12; m++) {
            corpus = (corpus + currentMonthly) * (1 + monthlyRate);
        }
        currentMonthly *= (1 + s / 100);
    }
    return { totalValue: corpus };
}

export const downloadCSV = (data: YearlyBreakdown[]) => {
    const headers = ['Year', 'Monthly Investment', 'Total Invested', 'Interest Earned', 'Total Value'];
    const csvContent = [
        headers.join(','),
        ...data.map(row => `${row.year},${row.monthlyInvestment},${row.investedAmount},${row.interestEarned},${row.totalValue}`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'sip_breakdown.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};