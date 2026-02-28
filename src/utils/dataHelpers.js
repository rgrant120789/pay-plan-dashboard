import {
  resiServiceTechs as defaultResiServiceTechs,
  resiInstallTechs as defaultResiInstallTechs,
  commercialTechs as defaultCommercialTechs,
  resiServiceCommissions,
  resiInstallOptionA,
} from '../data/payPlanData'
import { techHoursByMonth, actualTotalPay2025, ALL_MONTHS } from '../data/hoursData'

// ── helpers ──────────────────────────────────────────────────────────────────

export const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

export const fmtDec = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)

export const pct = (n) => `${(n * 100).toFixed(1)}%`

// Match a roster name to the hours data (handles "Marisa" vs "Marissa" etc.)
function getHoursForTech(techName) {
  // exact match first
  if (techHoursByMonth[techName]) return techHoursByMonth[techName]
  // fuzzy: same first name + last initial
  const norm = techName.toLowerCase().replace(/\./g, '').trim()
  const parts = norm.split(/\s+/)
  const first = parts[0]
  const lastInit = parts[1]?.[0]
  for (const [key, val] of Object.entries(techHoursByMonth)) {
    const kn = key.toLowerCase().replace(/\./g, '').trim().split(/\s+/)
    if (kn[0] === first && kn[1]?.[0] === lastInit) return val
  }
  return {}
}

function getActualPay(techName) {
  if (actualTotalPay2025[techName] !== undefined) return actualTotalPay2025[techName]
  // fuzzy
  const norm = techName.toLowerCase().replace(/\./g, '').trim()
  const parts = norm.split(/\s+/)
  const first = parts[0]
  const lastInit = parts[1]?.[0]
  for (const [key, val] of Object.entries(actualTotalPay2025)) {
    const kn = key.toLowerCase().replace(/\./g, '').trim().split(/\s+/)
    if (kn[0] === first && kn[1]?.[0] === lastInit) return val
  }
  return 0
}

// ── RESI SERVICE ─────────────────────────────────────────────────────────────
// Current pay = actual 2025 total pay from ServiceTitan
// Proposed pay = hours × new hourly + commission on revenue (revenue TBD — shows hourly-only portion for now)

export function buildResiServiceAnalysis(roster) {
  const techs = roster?.resiService || defaultResiServiceTechs

  return techs.map(tech => {
    const monthlyHours = getHoursForTech(tech.name)
    const totHours = Object.values(monthlyHours).reduce((s, h) => s + h, 0)
    const currentPay = getActualPay(tech.name)

    // Proposed hourly base only (commission requires revenue data not yet available)
    const proposedBase = totHours * tech.newHourly

    // Monthly breakdown for sparkline / table
    const monthData = ALL_MONTHS.map(m => ({
      month: m,
      hours: monthlyHours[m] || 0,
      proposedBase: (monthlyHours[m] || 0) * tech.newHourly,
    }))

    const tier = resiServiceCommissions.find(c => c.level === tech.serviceLevel)

    return {
      tech,
      totHours,
      currentPay,
      proposedBase,
      tier,
      monthData,
      // delta is base-only until revenue data is added
      deltaBase: proposedBase - currentPay,
      deltaBasePercent: currentPay > 0 ? (proposedBase - currentPay) / currentPay : 0,
      hasRevenue: false,
    }
  })
}

// ── RESI INSTALL ─────────────────────────────────────────────────────────────

export function buildResiInstallAnalysis(roster) {
  const techs = roster?.resiInstall || defaultResiInstallTechs

  return techs.map(tech => {
    const monthlyHours = getHoursForTech(tech.name)
    const totHours = Object.values(monthlyHours).reduce((s, h) => s + h, 0)
    const currentPay = getActualPay(tech.name)

    const proposedBase = totHours * tech.newHourly
    const tierA = resiInstallOptionA.find(t => t.level === tech.installLevel)

    // Option B: billable hours bonus — count months >= 160 hrs (using total hours as proxy)
    let optionBBonus = 0
    for (const m of ALL_MONTHS) {
      const h = monthlyHours[m] || 0
      if (h >= 160) optionBBonus += 500
    }
    const optionBPay = proposedBase + optionBBonus

    const monthData = ALL_MONTHS.map(m => ({
      month: m,
      hours: monthlyHours[m] || 0,
      proposedBase: (monthlyHours[m] || 0) * tech.newHourly,
      hitsBillableGoal: (monthlyHours[m] || 0) >= 160,
    }))

    return {
      tech,
      totHours,
      currentPay,
      proposedBase,
      optionBPay,
      optionBBonus,
      tierA,
      monthData,
      deltaBase: proposedBase - currentPay,
      deltaOptionB: optionBPay - currentPay,
      deltaBasePercent: currentPay > 0 ? (proposedBase - currentPay) / currentPay : 0,
      deltaOptionBPercent: currentPay > 0 ? (optionBPay - currentPay) / currentPay : 0,
    }
  })
}

// ── COMMERCIAL ───────────────────────────────────────────────────────────────

export function calcProposedCommercialPay(hoursWorked, hourlyRate, focus, billableHours, revenue, sales, techLeadSales = 0) {
  const base = hoursWorked * hourlyRate;
  let bonus = 0;
  const revenueGoal = focus === 'Service' ? 55000 : focus === 'Install' ? 75000 : 65000;
  if (billableHours >= 160) bonus += 500;
  if (revenue >= revenueGoal) bonus += 500;
  if ((sales + techLeadSales) >= 35000) bonus += 500;
  return base + bonus;
}

export function buildCommercialAnalysis(roster, stDataByName = {}) {
  const techs = roster?.commercial || defaultCommercialTechs

  return techs.map(tech => {
    const monthlyHours = getHoursForTech(tech.name)
    const totHours = Object.values(monthlyHours).reduce((s, h) => s + h, 0)
    const currentPay = getActualPay(tech.name)
    const stMonths = stDataByName[tech.name] || []

    const proposedBase = totHours * tech.newHourly

    let totalBonus = 0
    const revenueGoal = tech.focus === 'Service' ? 55000 : tech.focus === 'Install' ? 75000 : 65000

    const monthData = ALL_MONTHS.map(m => {
      const hours = monthlyHours[m] || 0
      const st = stMonths.find(r => r.month === m) || {}
      const revenue = st.completedRevenue || 0
      const combinedSales = (st.totalSales || 0) + (st.totalTechLeadSales || 0)

      const hitsHours = hours >= 160
      const hitsRevenue = revenue >= revenueGoal
      const hitsSales = combinedSales >= 35000
      const monthBonus = (hitsHours ? 500 : 0) + (hitsRevenue ? 500 : 0) + (hitsSales ? 500 : 0)
      totalBonus += monthBonus

      return {
        month: m,
        hours,
        revenue,
        combinedSales,
        proposedBase: hours * tech.newHourly,
        monthBonus,
        hitsHours,
        hitsRevenue,
        hitsSales,
      }
    })

    const proposedTotal = proposedBase + totalBonus

    return {
      tech,
      totHours,
      currentPay,
      proposedBase,
      totalBonus,
      proposedTotal,
      monthData,
      deltaBase: proposedBase - currentPay,
      deltaTotal: proposedTotal - currentPay,
      deltaBasePercent: currentPay > 0 ? (proposedBase - currentPay) / currentPay : 0,
      deltaTotalPercent: currentPay > 0 ? (proposedTotal - currentPay) / currentPay : 0,
    }
  })
}

// ── SUMMARY ──────────────────────────────────────────────────────────────────

export function buildSummary(roster) {
  const resiService = buildResiServiceAnalysis(roster)
  const resiInstall = buildResiInstallAnalysis(roster)
  const commercial = buildCommercialAnalysis(roster)

  const totalCurrentPay =
    resiService.reduce((s, t) => s + t.currentPay, 0) +
    resiInstall.reduce((s, t) => s + t.currentPay, 0) +
    commercial.reduce((s, t) => s + t.currentPay, 0)

  const totalProposedBase =
    resiService.reduce((s, t) => s + t.proposedBase, 0) +
    resiInstall.reduce((s, t) => s + t.proposedBase, 0) +
    commercial.reduce((s, t) => s + t.proposedBase, 0)

  const totalProposedWithBonuses =
    resiService.reduce((s, t) => s + t.proposedBase, 0) +
    resiInstall.reduce((s, t) => s + t.optionBPay, 0) +
    commercial.reduce((s, t) => s + t.proposedTotal, 0)

  return {
    resiService,
    resiInstall,
    commercial,
    totalCurrentPay,
    totalProposedBase,
    totalProposedWithBonuses,
  }
}
