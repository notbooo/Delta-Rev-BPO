import { generateDates } from '../utils/formatters'
import { rmsAlgorithms } from '../utils/rmsAlgorithms'

const COMPS_2BR = [
  { name: 'Shinjuku Granbell Hotel', stars: 4, room: '2BR City View (52m²)' },
  { name: 'APA Hotel Shinjuku', stars: 3, room: '2BR Standard (44m²)' },
  { name: 'Hyatt Regency Tokyo', stars: 5, room: 'Deluxe Suite (62m²)' },
  { name: 'Sotetsu Fresa Inn', stars: 3, room: '2BR Plus (48m²)' },
]
const COMPS_3BR = [
  { name: 'Shinjuku Premium Residence', stars: 4, room: '3BR Suite (85m²)' },
  { name: 'Palace Hotel Annex', stars: 5, room: '3BR Deluxe (92m²)' },
  { name: 'Cerulean Tower Tokyo', stars: 5, room: '3BR Family (78m²)' },
  { name: 'Citadines Grand Suite', stars: 4, room: '3BR Apartment (80m²)' },
]

const buildCompetitorList = (optimizedPrice, roomType) => {
  const base = roomType === '3 Bedroom Deluxe' ? COMPS_3BR : COMPS_2BR
  const multipliers = [0.85, 0.92, 1.08, 1.20]
  return base.map((c, i) => ({ ...c, rate: Math.round(optimizedPrice * multipliers[i] / 1000) * 1000 }))
}

export const generateMockRecommendations = (algoState) => {
  const today = new Date().toISOString().split('T')[0]
  const dates = generateDates(new Date(new Date().setDate(new Date().getDate() + 14)), 7)

  const roomTypes = ['2 Bedroom Deluxe', '3 Bedroom Deluxe']
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
      const basePrice = room === '3 Bedroom Deluxe' ? 65000 : 35000
      const physicalRooms = room === '3 Bedroom Deluxe' ? 6 : 10

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
          current_mns: 1,
          min_mns: 1,
          target_mns: 2,
          reason: 'Protect Friday/Sunday occupancy from single-night Saturday bookings.',
        }
      }

      if (optimizedPrice !== basePrice || recType === 'channel' || recType === 'los') {
        const mapeRaw = Math.random() * 0.15

        const isRateIncrease = optimizedPrice > basePrice

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
            : isRateIncrease
            ? [
                { id: 'price_altA', label: 'Push Rate +10% Higher', labelTemplate: 'Push Rate +{extra_pct}% Higher', badge: 'ADR Ceiling', badgeColor: 'blue',
                  actionLabel: 'Push Higher',
                  description: 'Test the rate ceiling — demand signal is strong enough to probe further',
                  inputs: [{ field: 'extra_pct', label: 'Extra Increase', unit: '%', min: 5, max: 30, step: 5, default: 10 }],
                  status: 'accepted', payload: { alternative: 'price_altA', extra_pct: 10 },
                  toastLabel: 'Rate pushed to ceiling probe' },
                { id: 'price_altD', label: 'Non-Refundable at -5%', labelTemplate: 'Non-Refundable -{nr_discount_pct}% Discount', badge: 'Lock-in', badgeColor: 'violet',
                  actionLabel: 'Apply NR Policy',
                  description: 'Lock in committed bookings at a slight discount from raised rate — reduces cancellation risk',
                  inputs: [{ field: 'nr_discount_pct', label: 'NR Discount', unit: '%', min: 3, max: 15, step: 1, default: 5 }],
                  status: 'accepted', payload: { alternative: 'price_altD', nr_discount_pct: 5, cancellation_policy: 'non_refundable' },
                  toastLabel: 'Non-refundable rate applied with discount' },
              ]
            : [
                { id: 'price_altB', label: 'Opaque Flash Sale', badge: 'Net Rev', badgeColor: 'violet',
                  actionLabel: 'Open Opaque',
                  description: 'Push discounted inventory to HotelTonight / flash sales without lowering public BAR',
                  status: 'accepted', payload: { alternative: 'price_altB', channel: 'opaque' },
                  toastLabel: 'Pushed to opaque flash-sale channels' },
                { id: 'price_altC', label: 'Relax Restrictions', badge: 'Occ. Focus', badgeColor: 'emerald',
                  actionLabel: 'Relax',
                  description: 'Remove min stay and switch to flexible cancellation to lower booking barrier',
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
            competitor_min: Math.round(optimizedPrice * 0.82),
            competitor_max: Math.round(optimizedPrice * 1.25),
            competitor_list: buildCompetitorList(optimizedPrice, room),
            elasticity_active: algoState.elasticity,
            overbooking_active: algoState.overbooking,
            displacement_active: algoState.displacement,
            current_booked: currentBooked,
            forecasted_demand: Math.round(demand),
            physical_rooms: physicalRooms,
            effective_rooms: effectiveTotalRooms,
            event_mult: eventMult,
            base_price: basePrice,
            current_los: 1,
            min_los: 1,
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
      room_type: '2 Bedroom Deluxe',
      current_price: 35000,
      recommended_price: 35000,
      equity_action: {
        unit_ahead: 'Unit 101',
        unit_behind: 'Unit 102',
        disparity: '30%',
        action: 'Pause Unit 101 for 48h',
      },
      metrics: {
        occupancy_forecast: 60,
        pace_vs_ly: '+5%',
        competitor_avg: 34000,
        competitor_min: 28000,
        competitor_max: 42000,
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
    room_type: '3 Bedroom Deluxe',
    current_price: 65000,
    recommended_price: 65000,
    equity_action: {
      unit_ahead: 'Unit 103',
      unit_behind: 'Unit 104',
      disparity: '22%',
      action: 'Pause Unit 103 for 48h',
    },
    metrics: {
      occupancy_forecast: 55,
      pace_vs_ly: '+3%',
      competitor_avg: 63000,
      competitor_min: 52000,
      competitor_max: 78000,
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
    { id: `rec_${dates[1]}_2BRDeluxe_los`, date: dates[1], room_type: '2 Bedroom Deluxe', current_price: 35000 },
    { id: `rec_${dates[3]}_3BRDeluxe_los`, date: dates[3], room_type: '3 Bedroom Deluxe', current_price: 65000 },
  ]
  losRecs.forEach(({ id, date, room_type, current_price }) => {
    const is3BR = room_type === '3 Bedroom Deluxe'
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
          current_mns: 1,
          min_mns: 1,
          target_mns: is3BR ? 3 : 2,
          reason: 'Protect Friday/Sunday occupancy from single-night Saturday bookings.',
        },
        metrics: {
          occupancy_forecast: 68,
          pace_vs_ly: '+8%',
          competitor_avg: current_price - 2000,
          competitor_min: Math.round(current_price * 0.80),
          competitor_max: Math.round(current_price * 1.22),
          elasticity_active: false,
          overbooking_active: false,
          displacement_active: false,
          current_booked: is3BR ? 4 : 7,
          forecasted_demand: is3BR ? 5 : 9,
          physical_rooms: is3BR ? 6 : 10,
          effective_rooms: is3BR ? 6 : 10,
          event_mult: 1.2,
          base_price: current_price,
          current_los: 1,
          min_los: 1,
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
    { id: `rec_${dates[5]}_3BRDeluxe_slow`, date: dates[5] },
    { id: `rec_${dates[6]}_3BRDeluxe_slow`, date: dates[6] },
  ]
  slowPriceRecs.forEach(({ id, date }) => {
    if (!recommendations.find((r) => r.id === id)) {
      recommendations.push({
        id,
        type: 'price',
        booking_ts: today,
        checkin_date: date,
        room_type: '3 Bedroom Deluxe',
        current_price: 65000,
        recommended_price: 52000,
        event_tag: null,
        channel_action: null,
        los_action: null,
        metrics: {
          occupancy_forecast: 22,
          pace_vs_ly: '-15%',
          competitor_avg: 54000,
          competitor_min: 44000,
          competitor_max: 68000,
          competitor_list: buildCompetitorList(52000, '3 Bedroom Deluxe'),
          elasticity_active: false,
          overbooking_active: false,
          displacement_active: false,
          current_booked: 1,
          forecasted_demand: 2,
          physical_rooms: 6,
          effective_rooms: 6,
          event_mult: 1.0,
          base_price: 65000,
          current_los: 1,
          min_los: 1,
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
