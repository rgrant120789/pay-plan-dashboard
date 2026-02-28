import { monthlyData } from '../data/payData';

/** Get all monthly rows for a specific tech name */
export function getMonthsForTech(name) {
  return monthlyData.filter((r) => r.name === name);
}

/**
 * For Residential Install & Commercial:
 * Goals: { billableHours, revenue, sales }
 * Bonus per goal hit: $1,000
 * salesField: 'sales' (install) or 'totalSales' (commercial)
 */
export function calcInstallOrCommercialBonuses(techName, goals, salesField = 'sales') {
  const months = getMonthsForTech(techName);
  let billableHits = 0, revenueHits = 0, salesHits = 0;
  const detail = months.map((m) => {
    const bHit = m.billableHours >= goals.billableHours;
    const rHit = m.revenue >= goals.revenue;
    const sHit = (m[salesField] ?? m.sales) >= goals.sales;
    if (bHit) billableHits++;
    if (rHit) revenueHits++;
    if (sHit) salesHits++;
    return { month: m.month, billableHours: m.billableHours, revenue: m.revenue, sales: m[salesField] ?? m.sales, bHit, rHit, sHit };
  });
  const totalBonus = (billableHits + revenueHits + salesHits) * 1000;
  return { billableHits, revenueHits, salesHits, totalBonus, detail };
}

/**
 * For Residential Service — commission-based (no monthly goal bonuses).
 * Returns per-month data for display purposes only.
 */
export function getServiceMonthlyDetail(techName) {
  return getMonthsForTech(techName).map((m) => ({
    month: m.month,
    revenue: m.revenue,
    sales: m.sales,
    billableHours: m.billableHours,
  }));
}

/**
 * Calculate proposed 2026 total pay for Install/Commercial tech given goals.
 * regHours, otHours from the original comparison data.
 * hourlyRate from roster.
 */
export function calcProposedTotalPay(hourlyRate, regHours, otHours, totalBonus) {
  const base = hourlyRate * (regHours + otHours * 1.5);
  return base + totalBonus;
}
