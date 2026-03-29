import { generateDates } from '../utils/formatters'
import { rmsAlgorithms } from '../utils/rmsAlgorithms'

export const generateMockRecommendations = (algoState) => {
  const today = new Date().toISOString().split('T')[0]
  const dates = generateDates(new Date(new Date().setDate(new Date().getDate() + 14)), 7)

  const roomTypes = ['Deluxe Double', 'Standard Twin', 'Suite']
  const events = [
    { date: dates[2], name: '🌸 Cherry Blossom Peak', mult: 1.8, type: 'surge' },
    { date: dates[3], name: '🌸 Cherry Blossom Peak', mult: 1.8, type: 'surge' },
    { date: dates[6], name: '🏮 Local Festival', mult: 1.4, type: 'surge' },
  ]

  const recommendations = []

  dates.forEach((date) => {
    const isWeekend = new Date(date).getDay() === 0 || new Date(date).getDay() === 6
    const event = events.find((e) => e.date === date)
    const eventMult = algoState.anomaly && event ? event.mult : isWeekend ? 1.2 : 1.0

    roomTypes.forEach((room) => {
      const basePrice = room === 'Suite' ? 65000 : room === 'Deluxe Double' ? 35000 : 25000
      const physicalRooms = room === 'Suite' ? 5 : 20

      const baseBooked =
        eventMult > 1.2
          ? Math.floor(physicalRooms * 0.7)
          : Math.floor(Math.random() * (physicalRooms * 0.5))
      const currentBooked = baseBooked

      const effectiveTotalRooms = algoState.overbooking
        ? Math.ceil(physicalRooms * 1.1)
        : physicalRooms
      const pace = algoState.pace ? rmsAlgorithms.calculatePace(5, eventMult) : 5
      const capacity = rmsAlgorithms.calculateRemainingCapacity(effectiveTotalRooms, currentBooked)
      const demand = rmsAlgorithms.forecastDemand(pace, capacity, isWeekend)

      const forecastedOcc = Math.round(((currentBooked + demand) / effectiveTotalRooms) * 100)
      const optimizedPrice = rmsAlgorithms.optimizePrice(
        basePrice,
        demand,
        capacity,
        eventMult,
        algoState.elasticity,
        algoState.riskTolerance
      )

      let recType = 'price'
      let channelAction = null
      let losAction = null

      if (
        forecastedOcc > 85 &&
        algoState.displacement &&
        algoState.channel &&
        capacity <= 4
      ) {
        recType = 'channel'
        channelAction = {
          action: 'Close OTAs',
          target_channel: 'Direct Only',
          commission_saved: Math.round(optimizedPrice * capacity * 0.18),
          rooms_protected: capacity,
        }
      } else if (algoState.los && eventMult > 1.3 && isWeekend && capacity > 2) {
        recType = 'los'
        losAction = {
          action: 'Increase MNS',
          target_mns: 2,
          reason: 'Protect Friday/Sunday occupancy from single-night Saturday bookings.',
        }
      }

      if (optimizedPrice !== basePrice || recType === 'channel' || recType === 'los') {
        const mapeRaw = Math.random() * 0.15

        recommendations.push({
          id: `rec_${date}_${room.replace(' ', '')}`,
          type: recType,
          channel_action: channelAction,
          los_action: losAction,
          booking_ts: today,
          checkin_date: date,
          room_type: room,
          current_price: basePrice,
          recommended_price: optimizedPrice,
          event_tag: algoState.anomaly && event ? event.name : null,
          metrics: {
            occupancy_forecast: forecastedOcc,
            pace_vs_ly: algoState.pace ? `+${Math.round(pace * 2.5)}%` : 'N/A',
            competitor_avg: optimizedPrice + (Math.random() > 0.5 ? 2000 : -1000),
            elasticity_active: algoState.elasticity,
            overbooking_active: algoState.overbooking,
            displacement_active: algoState.displacement,
            current_booked: currentBooked,
            forecasted_demand: Math.round(demand),
            physical_rooms: physicalRooms,
            effective_rooms: effectiveTotalRooms,
            event_mult: eventMult,
            base_price: basePrice,
          },
          confidence: rmsAlgorithms.calculateConfidence(mapeRaw),
          status: 'pending',
        })
      }
    })
  })

  if (algoState.equity) {
    recommendations.push({
      id: 'rec_equity_alert_101',
      type: 'equity',
      booking_ts: today,
      checkin_date: dates[1],
      room_type: 'Standard Twin',
      current_price: 25000,
      recommended_price: 25000,
      equity_action: {
        unit_ahead: 'Unit 101',
        unit_behind: 'Unit 102',
        disparity: '30%',
        action: 'Pause Unit 101 for 48h',
      },
      metrics: {
        occupancy_forecast: 60,
        pace_vs_ly: '+5%',
        competitor_avg: 24000,
        elasticity_active: false,
        overbooking_active: false,
        displacement_active: false,
      },
      confidence: { level: 'High', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
      status: 'pending',
    })
  }

  return recommendations.sort((a, b) => {
    if (a.type === 'equity' && b.type !== 'equity') return -1
    if (b.type === 'equity' && a.type !== 'equity') return 1
    if (a.type === 'channel' && b.type !== 'channel') return -1
    if (b.type === 'channel' && a.type !== 'channel') return 1
    if (a.type === 'los' && b.type !== 'los') return -1
    if (b.type === 'los' && a.type !== 'los') return 1
    return b.recommended_price - b.current_price - (a.recommended_price - a.current_price)
  })
}
