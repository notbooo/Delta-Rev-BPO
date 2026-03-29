export const rmsAlgorithms = {
  calculatePace: (basePace, eventMultiplier) =>
    Math.round(basePace * eventMultiplier * (1 + (Math.random() * 0.2 - 0.1))),

  calculateRemainingCapacity: (totalRooms, currentBooked) =>
    totalRooms - currentBooked,

  forecastDemand: (pace, capacity, isWeekend) =>
    Math.min(capacity, pace * (isWeekend ? 1.4 : 1.0)),

  optimizePrice: (currentPrice, demand, capacity, eventMultiplier, applyElasticity, riskTolerance) => {
    const occPct = (50 - capacity + demand) / 50
    let suggested = currentPrice

    let surgeCap = applyElasticity ? 5000 : 12000
    let standardIncrease = 2000
    let standardDrop = 3000

    if (riskTolerance === 'conservative') {
      surgeCap = applyElasticity ? 2000 : 5000
      standardIncrease = 1000
      standardDrop = 4000
    } else if (riskTolerance === 'aggressive') {
      surgeCap = applyElasticity ? 8000 : 15000
      standardIncrease = 4000
      standardDrop = 1000
    }

    if (occPct > 0.8 || eventMultiplier > 1.2) suggested += surgeCap
    else if (occPct > 0.6) suggested += standardIncrease
    else if (occPct < 0.3) suggested -= standardDrop

    return Math.round(suggested / 1000) * 1000
  },

  calculateConfidence: (mape) => {
    if (mape < 0.05) return { level: 'High', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' }
    if (mape < 0.12) return { level: 'Medium', color: 'text-amber-600 bg-amber-50 border-amber-200' }
    return { level: 'Low', color: 'text-rose-600 bg-rose-50 border-rose-200' }
  },
}
