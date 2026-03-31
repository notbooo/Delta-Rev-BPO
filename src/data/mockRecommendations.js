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

        const alternatives =
          recType === 'channel'
            ? [
                { id: 'channel_altB', label: 'Spike Price +40%', labelTemplate: 'Spike Price +{spike_pct}%', badge: 'ADR Focus', badgeColor: 'blue',
                  actionLabel: 'Spike Rate',
                  description: 'Leave OTAs open but raise rate aggressively to suppress demand',
                  inputs: [{ field: 'spike_pct', label: 'Rate Spike', unit: '%', min: 10, max: 100, step: 5, default: 40 }],
                  status: 'accepted', payload: { alternative: 'channel_altB', spike_pct: 40 },
                  toastLabel: 'Rate spiked to suppress OTA demand' },
                { id: 'channel_altC', label: 'Non-Refundable Policy', badge: 'Lock-in', badgeColor: 'violet',
                  actionLabel: 'Apply Policy',
                  description: 'Switch to strict NR cancellation to lock in committed revenue',
                  status: 'accepted', payload: { alternative: 'channel_altC', cancellation_policy: 'non_refundable' },
                  toastLabel: 'Non-refundable policy applied' },
              ]
            : recType === 'los'
            ? [
                { id: 'los_altB', label: 'Friday Discount -15%', labelTemplate: 'Friday Discount -{discount_pct}%', badge: 'Demand Pull', badgeColor: 'emerald',
                  actionLabel: 'Apply Discount',
                  description: 'Incentivise organic 2-night arrivals without restricting Saturday',
                  inputs: [{ field: 'discount_pct', label: 'Discount', unit: '%', min: 5, max: 40, step: 5, default: 15 }],
                  status: 'accepted', payload: { alternative: 'los_altB', discount_pct: 15, target_day: 'friday' },
                  toastLabel: 'Friday discount activated' },
                { id: 'los_altC', label: 'CTA Saturday', badge: 'Low Risk', badgeColor: 'amber',
                  actionLabel: 'Apply CTA',
                  description: 'Close to Arrival on Saturday — guests can only check in Friday',
                  status: 'accepted', payload: { alternative: 'los_altC', cta_day: 'saturday' },
                  toastLabel: 'Saturday Closed to Arrival (CTA) applied' },
              ]
            : [
                { id: 'price_altB', label: 'Opaque Channels', badge: 'Net Rev', badgeColor: 'violet',
                  actionLabel: 'Open Opaque',
                  description: 'Keep public rate high, push discounted inventory to HotelTonight / flash sales',
                  status: 'accepted', payload: { alternative: 'price_altB', channel: 'opaque' },
                  toastLabel: 'Pushed to opaque flash-sale channels' },
                { id: 'price_altC', label: 'Relax Restrictions', badge: 'Occ. Focus', badgeColor: 'emerald',
                  actionLabel: 'Relax',
                  description: 'Remove LOS minimum and switch to flexible cancellation to lower booking barrier',
                  status: 'accepted', payload: { alternative: 'price_altC', remove_los: true, cancellation_policy: 'flexible' },
                  toastLabel: 'Restrictions relaxed — LOS removed, flexible cancellation' },
              ]

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
          alternatives,
        })
      }
    })
  })

  // --- Equity recs ---
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
      alternatives: [
        { id: 'equity_altB', label: 'Boost OTA Commission +5%', labelTemplate: 'Boost OTA Commission +{commission_boost_pct}%', badge: 'Demand Pull', badgeColor: 'emerald',
          actionLabel: 'Boost Comm.',
          description: 'Increase OTA payout on Unit 102 to push it up search rankings',
          inputs: [{ field: 'commission_boost_pct', label: 'Commission Boost', unit: '%', min: 1, max: 15, step: 1, default: 5 }],
          status: 'accepted', payload: { alternative: 'equity_altB', unit: 'Unit 102', commission_boost_pct: 5 },
          toastLabel: 'OTA commission boosted on Unit 102' },
        { id: 'equity_altC', label: 'Hidden 10% Discount', labelTemplate: 'Hidden {opaque_discount_pct}% Discount', badge: 'Occ. Focus', badgeColor: 'blue',
          actionLabel: 'Apply Opaque',
          description: 'Apply opaque rate reduction to Unit 102 without affecting public BAR',
          inputs: [{ field: 'opaque_discount_pct', label: 'Opaque Discount', unit: '%', min: 5, max: 25, step: 5, default: 10 }],
          status: 'accepted', payload: { alternative: 'equity_altC', unit: 'Unit 102', opaque_discount_pct: 10 },
          toastLabel: 'Hidden discount applied to Unit 102' },
      ],
    })
  }

  // 2nd equity rec (always shown for guaranteed coverage)
  recommendations.push({
    id: 'rec_equity_alert_103',
    type: 'equity',
    booking_ts: today,
    checkin_date: dates[2],
    room_type: 'Deluxe Double',
    current_price: 35000,
    recommended_price: 35000,
    equity_action: {
      unit_ahead: 'Unit 103',
      unit_behind: 'Unit 104',
      disparity: '22%',
      action: 'Pause Unit 103 for 48h',
    },
    metrics: {
      occupancy_forecast: 55,
      pace_vs_ly: '+3%',
      competitor_avg: 34000,
      elasticity_active: false,
      overbooking_active: false,
      displacement_active: false,
    },
    confidence: { level: 'Medium', color: 'text-amber-600 bg-amber-50 border-amber-200' },
    status: 'pending',
    alternatives: [
      { id: 'equity_altB', label: 'Boost OTA Commission +5%', labelTemplate: 'Boost OTA Commission +{commission_boost_pct}%', badge: 'Demand Pull', badgeColor: 'emerald',
        actionLabel: 'Boost Comm.',
        description: 'Increase OTA payout on Unit 104 to push it up search rankings',
        inputs: [{ field: 'commission_boost_pct', label: 'Commission Boost', unit: '%', min: 1, max: 15, step: 1, default: 5 }],
        status: 'accepted', payload: { alternative: 'equity_altB', unit: 'Unit 104', commission_boost_pct: 5 },
        toastLabel: 'OTA commission boosted on Unit 104' },
      { id: 'equity_altC', label: 'Hidden 10% Discount', labelTemplate: 'Hidden {opaque_discount_pct}% Discount', badge: 'Occ. Focus', badgeColor: 'blue',
        actionLabel: 'Apply Opaque',
        description: 'Apply opaque rate reduction to Unit 104 without affecting public BAR',
        inputs: [{ field: 'opaque_discount_pct', label: 'Opaque Discount', unit: '%', min: 5, max: 25, step: 5, default: 10 }],
        status: 'accepted', payload: { alternative: 'equity_altC', unit: 'Unit 104', opaque_discount_pct: 10 },
        toastLabel: 'Hidden discount applied to Unit 104' },
    ],
  })

  // --- Guaranteed LOS recs (2) ---
  const losRecs = [
    { id: `rec_${dates[1]}_DeluxeDouble_los`, date: dates[1], room_type: 'Deluxe Double', current_price: 35000 },
    { id: `rec_${dates[3]}_StandardTwin_los`, date: dates[3], room_type: 'Standard Twin', current_price: 25000 },
  ]
  losRecs.forEach(({ id, date, room_type, current_price }) => {
    if (!recommendations.find((r) => r.id === id)) {
      recommendations.push({
        id,
        type: 'los',
        booking_ts: today,
        checkin_date: date,
        room_type,
        current_price,
        recommended_price: current_price,
        event_tag: null,
        channel_action: null,
        los_action: {
          action: 'Increase MNS',
          target_mns: 2,
          reason: 'Protect Friday/Sunday occupancy from single-night Saturday bookings.',
        },
        metrics: {
          occupancy_forecast: 68,
          pace_vs_ly: '+8%',
          competitor_avg: current_price - 1000,
          elasticity_active: false,
          overbooking_active: false,
          displacement_active: false,
          current_booked: current_price === 35000 ? 14 : 12,
          forecasted_demand: 18,
          physical_rooms: 20,
          effective_rooms: 20,
          event_mult: 1.2,
          base_price: current_price,
        },
        confidence: { level: 'High', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
        status: 'pending',
        alternatives: [
          { id: 'los_altB', label: 'Friday Discount -15%', labelTemplate: 'Friday Discount -{discount_pct}%', badge: 'Demand Pull', badgeColor: 'emerald',
            actionLabel: 'Apply Discount',
            description: 'Incentivise organic 2-night arrivals without restricting Saturday',
            inputs: [{ field: 'discount_pct', label: 'Discount', unit: '%', min: 5, max: 40, step: 5, default: 15 }],
            status: 'accepted', payload: { alternative: 'los_altB', discount_pct: 15, target_day: 'friday' },
            toastLabel: 'Friday discount activated' },
          { id: 'los_altC', label: 'CTA Saturday', badge: 'Low Risk', badgeColor: 'amber',
            actionLabel: 'Apply CTA',
            description: 'Close to Arrival on Saturday — guests can only check in Friday',
            status: 'accepted', payload: { alternative: 'los_altC', cta_day: 'saturday' },
            toastLabel: 'Saturday Closed to Arrival (CTA) applied' },
        ],
      })
    }
  })

  // --- Guaranteed slow-demand price recs (2) ---
  const slowPriceRecs = [
    { id: `rec_${dates[5]}_Suite_slow`, date: dates[5] },
    { id: `rec_${dates[6]}_Suite_slow`, date: dates[6] },
  ]
  slowPriceRecs.forEach(({ id, date }) => {
    if (!recommendations.find((r) => r.id === id)) {
      recommendations.push({
        id,
        type: 'price',
        booking_ts: today,
        checkin_date: date,
        room_type: 'Suite',
        current_price: 65000,
        recommended_price: 52000,
        event_tag: null,
        channel_action: null,
        los_action: null,
        metrics: {
          occupancy_forecast: 22,
          pace_vs_ly: '-15%',
          competitor_avg: 54000,
          elasticity_active: false,
          overbooking_active: false,
          displacement_active: false,
          current_booked: 1,
          forecasted_demand: 2,
          physical_rooms: 5,
          effective_rooms: 5,
          event_mult: 1.0,
          base_price: 65000,
        },
        confidence: { level: 'Medium', color: 'text-amber-600 bg-amber-50 border-amber-200' },
        status: 'pending',
        alternatives: [
          { id: 'price_altB', label: 'Opaque Channels', badge: 'Net Rev', badgeColor: 'violet',
            actionLabel: 'Open Opaque',
            description: 'Keep public rate high, push discounted inventory to HotelTonight / flash sales',
            status: 'accepted', payload: { alternative: 'price_altB', channel: 'opaque' },
            toastLabel: 'Pushed to opaque flash-sale channels' },
          { id: 'price_altC', label: 'Relax Restrictions', badge: 'Occ. Focus', badgeColor: 'emerald',
            actionLabel: 'Relax',
            description: 'Remove LOS minimum and switch to flexible cancellation to lower booking barrier',
            status: 'accepted', payload: { alternative: 'price_altC', remove_los: true, cancellation_policy: 'flexible' },
            toastLabel: 'Restrictions relaxed — LOS removed, flexible cancellation' },
        ],
      })
    }
  })

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
