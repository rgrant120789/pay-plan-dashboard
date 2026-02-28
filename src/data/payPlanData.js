// ============================================================
// TECH ROSTERS — current hourly rates (first name + last initial)
// ============================================================

export const resiServiceTechs = [
  { id: 'adam_d', name: 'Adam D.', belt: 'Green', serviceLevel: 3, currentHourly: 28.00, newHourly: 28.00 },
  { id: 'adam_e', name: 'Adam E.', belt: 'Black', serviceLevel: 3, currentHourly: 35.00, newHourly: 35.00 },
  { id: 'cannan_b', name: 'Cannan B.', belt: 'Green', serviceLevel: 2, currentHourly: 29.00, newHourly: 29.00 },
  { id: 'jj_l', name: 'JJ L.', belt: 'Green', serviceLevel: 2, currentHourly: 29.00, newHourly: 29.00 },
  { id: 'kaleb_g', name: 'Kaleb G.', belt: 'Green', serviceLevel: 3, currentHourly: 28.00, newHourly: 28.00 },
  { id: 'marissa_h', name: 'Marissa H.', belt: 'Green', serviceLevel: 2, currentHourly: 28.00, newHourly: 28.00 },
  { id: 'tim_w', name: 'Tim W.', belt: 'Black', serviceLevel: 3, currentHourly: 35.00, newHourly: 35.00 },
];

export const resiInstallTechs = [
  { id: 'bubba_b', name: 'Bubba B.', belt: 'Black', installLevel: 4, currentHourly: 35.00, newHourly: 35.00 },
  { id: 'greg_c', name: 'Greg C.', belt: 'Brown', installLevel: 3, currentHourly: 30.00, newHourly: 30.00 },
  { id: 'josh_s', name: 'Josh S.', belt: 'Brown', installLevel: 3, currentHourly: 30.00, newHourly: 30.00 },
  { id: 'josiah_b', name: 'Josiah B.', belt: 'Brown', installLevel: 3, currentHourly: 34.00, newHourly: 34.00 },
  { id: 'mike_n', name: 'Mike N.', belt: 'Black', installLevel: 4, currentHourly: 35.00, newHourly: 35.00 },
  { id: 'steve_g', name: 'Steve G.', belt: 'Black', installLevel: 4, currentHourly: 35.00, newHourly: 35.00 },
];

export const commercialTechs = [
  { id: 'alex_t', name: 'Alex T.', belt: 'Brown', focus: 'Install', currentHourly: 41.00, newHourly: 41.00 },
  { id: 'brandon_g', name: 'Brandon G.', belt: 'Green', focus: 'Install', currentHourly: 32.00, newHourly: 32.00 },
  { id: 'dorie_l', name: 'Dorie L.', belt: 'Black', focus: 'Service', currentHourly: 46.00, newHourly: 46.00 },
  { id: 'ethan_h', name: 'Ethan H.', belt: 'Brown', focus: 'Install', currentHourly: 39.00, newHourly: 39.00 },
  { id: 'grady_t', name: 'Grady T.', belt: 'Black', focus: 'Service', currentHourly: 43.00, newHourly: 43.00 },
  { id: 'jack_d', name: 'Jack D.', belt: 'Brown', focus: 'Service', currentHourly: 37.00, newHourly: 37.00 },
  { id: 'ronnie_s', name: 'Ronnie S.', belt: 'Brown', focus: 'Entry', currentHourly: 36.00, newHourly: 36.00 },
];

// ============================================================
// BELT LEVEL STRUCTURES
// ============================================================

export const beltLevels = [
  { title: 'Apprentice', belt: 'Gray', basePay: '$18–$21', tenure: '0–1' },
  { title: 'Junior Tech', belt: 'Blue', basePay: '$22–$25', tenure: '1–3' },
  { title: 'Lead Tech', belt: 'Green', basePay: '$26–$29', tenure: '3–5' },
  { title: 'Senior Tech', belt: 'Brown', basePay: '$30–$34', tenure: '5–10' },
  { title: 'Master Tech', belt: 'Black', basePay: '$35+', tenure: '10+' },
];

// ============================================================
// RESI SERVICE PLAN — Hourly + Commission tiers
// Service Level 1–4 with % Work Done + % Sold By = Total %
// Requirements: Min Avg Ticket & Min Close Rate (quarterly)
// ============================================================

export const resiServiceCommissions = [
  { level: 1, workDonePct: 0.05, soldByPct: 0.05, totalPct: 0.10 },
  { level: 2, workDonePct: 0.07, soldByPct: 0.05, totalPct: 0.12 },
  { level: 3, workDonePct: 0.10, soldByPct: 0.05, totalPct: 0.15 },
  { level: 4, workDonePct: 0.12, soldByPct: 0.05, totalPct: 0.17 },
];

export const resiServiceLevelRequirements = {
  minAvgTicket: { 1: 650, 2: 800, 3: 1000, 4: 1200 },
  minCloseRate: { 1: 0.65, 2: 0.70, 3: 0.75, 4: 0.80 },
  advanceAvgTicket: { 1: 750, 2: 900, 3: 1200, 4: null },
  advanceCloseRate: { 1: 0.75, 2: 0.75, 3: 0.80, 4: null },
};

// ============================================================
// RESI INSTALL PLAN
// Option A: Hourly + Revenue % (by install level)
// Option B: Hourly + Monthly Goal Bonuses
// ============================================================

export const resiInstallOptionA = [
  { level: 1, workDone: 'Hourly only', soldByPct: 0.05 },
  { level: 2, workDone: 'Hourly + 1%', workDonePct: 0.01, soldByPct: 0.05 },
  { level: 3, workDone: 'Hourly + 2%', workDonePct: 0.02, soldByPct: 0.05 },
  { level: 4, workDone: 'Hourly + 3%', workDonePct: 0.03, soldByPct: 0.05 },
];

export const resiInstallOptionB = [
  { bonus: 'Billable Hour', goal: 160, goalUnit: 'hours', monthlyBonus: 500 },
  { bonus: 'Revenue', goal: 80000, goalUnit: 'dollars', monthlyBonus: 500 },
  { bonus: 'Sales', goal: 10000, goalUnit: 'dollars', monthlyBonus: 500 },
];

// ============================================================
// COMMERCIAL PLAN — Hourly + Monthly Goal Bonuses by focus
// ============================================================

export const commercialBeltLevels = [
  { title: 'Apprentice', belt: 'Gray', basePay: '$20–$25', tenure: '0–2' },
  { title: 'Junior Tech', belt: 'Blue', basePay: '$25–$29', tenure: '2–3' },
  { title: 'Lead Tech', belt: 'Green', basePay: '$30–$35', tenure: '3–5' },
  { title: 'Senior Tech', belt: 'Brown', basePay: '$36–$41', tenure: '5–10' },
  { title: 'Master Tech', belt: 'Black', basePay: '$42+', tenure: '10+' },
];

export const commercialServiceFocusBonuses = [
  { bonus: 'Billable Hour', goal: 160, goalUnit: 'hours', monthlyBonus: 500 },
  { bonus: 'Revenue', goal: 55000, goalUnit: 'dollars', monthlyBonus: 500 },
  { bonus: 'Sales + TGL Sales', goal: 35000, goalUnit: 'dollars', monthlyBonus: 500 },
];

export const commercialInstallFocusBonuses = [
  { bonus: 'Billable Hour', goal: 160, goalUnit: 'hours', monthlyBonus: 500 },
  { bonus: 'Revenue', goal: 75000, goalUnit: 'dollars', monthlyBonus: 500 },
  { bonus: 'Sales + TGL Sales', goal: 35000, goalUnit: 'dollars', monthlyBonus: 500 },
];

export const commercialEntryFocusBonuses = [
  { bonus: 'Billable Hour', goal: 160, goalUnit: 'hours', monthlyBonus: 500 },
  { bonus: 'Revenue', goal: 65000, goalUnit: 'dollars', monthlyBonus: 500 },
  { bonus: 'Sales + TGL Sales', goal: 35000, goalUnit: 'dollars', monthlyBonus: 500 },
];

// ============================================================
// PAY CALCULATION HELPERS
// ============================================================

/**
 * Calculate current pay for a resi service tech (hourly only)
 * @param {number} hoursWorked
 * @param {number} hourlyRate
 */
export function calcCurrentResiServicePay(hoursWorked, hourlyRate) {
  return hoursWorked * hourlyRate;
}

/**
 * Calculate proposed resi service pay (hourly + commission on revenue)
 * commission = workDonePct * revenue + soldByPct * soldRevenue
 * If tech has a serviceLevel assigned, use that level's commission rates.
 * workDoneRevenue = revenue generated on jobs tech performed
 * soldRevenue = revenue on jobs tech sold (may overlap)
 */
export function calcProposedResiServicePay(hoursWorked, hourlyRate, serviceLevel, workDoneRevenue, soldRevenue) {
  const tier = resiServiceCommissions.find(c => c.level === serviceLevel);
  if (!tier) return hoursWorked * hourlyRate;
  const base = hoursWorked * hourlyRate;
  const commission = (tier.workDonePct * workDoneRevenue) + (tier.soldByPct * soldRevenue);
  return base + commission;
}

/**
 * Calculate proposed resi install pay - Option A
 * installLevel determines the revenue % on work done; soldByPct always 5%
 */
export function calcProposedResiInstallOptionA(hoursWorked, hourlyRate, installLevel, workDoneRevenue, soldRevenue) {
  const tier = resiInstallOptionA.find(t => t.level === installLevel);
  if (!tier) return hoursWorked * hourlyRate;
  const base = hoursWorked * hourlyRate;
  const workDoneBonus = (tier.workDonePct || 0) * workDoneRevenue;
  const soldBonus = tier.soldByPct * soldRevenue;
  return base + workDoneBonus + soldBonus;
}

/**
 * Calculate proposed resi install pay - Option B
 * Each of 3 bonus categories pays $500/mo if goal is met (evaluated monthly)
 * We approximate from job-level data by checking monthly totals.
 */
export function calcProposedResiInstallOptionB(hoursWorked, hourlyRate, billableHours, revenue, sales) {
  const base = hoursWorked * hourlyRate;
  let bonus = 0;
  if (billableHours >= 160) bonus += 500;
  if (revenue >= 80000) bonus += 500;
  if (sales >= 10000) bonus += 500;
  return base + bonus;
}

/**
 * Calculate proposed commercial pay (hourly + monthly bonuses by focus)
 */
export function calcProposedCommercialPay(hoursWorked, hourlyRate, focus, billableHours, revenue, sales) {
  const base = hoursWorked * hourlyRate;
  let bonus = 0;
  const revenueGoal = focus === 'Service' ? 55000 : focus === 'Install' ? 75000 : 65000;
  if (billableHours >= 160) bonus += 500;
  if (revenue >= revenueGoal) bonus += 500;
  if (sales >= 35000) bonus += 500;
  return base + bonus;
}
