import { useState, useEffect, useRef } from 'react'
import { Icons } from '../common/Icons'
import GlossaryTerm from '../common/GlossaryTerm'
import { formatJPY } from '../../utils/formatters'

export default function RecommendationCard({ rec, onAction, onOpenDetails, absoluteMinRate, absoluteMaxRate, minLos }) {
  const [adjustedPrice, setAdjustedPrice] = useState(rec.recommended_price)
  const [showAllDrivers, setShowAllDrivers] = useState(false)
  const [isEditingPrice, setIsEditingPrice] = useState(false)
  const [editPriceValue, setEditPriceValue] = useState('')
  const [isMinRateWarning, setIsMinRateWarning] = useState(false)
  const inputRef = useRef(null)

  const [showComps, setShowComps] = useState(false)

  const [restrictedChannels, setRestrictedChannels] = useState({
    'Booking.com': true,
    Airbnb: true,
  })
  const [targetMns, setTargetMns] = useState(rec.los_action?.target_mns ?? (minLos ?? 2))

  const handleAdjust = (amount) => setAdjustedPrice((prev) => prev + amount)

  const handlePriceSubmit = () => {
    setIsEditingPrice(false)
    let val = parseInt(editPriceValue, 10)
    if (isNaN(val)) {
      val = rec.current_price
    } else if (val < absoluteMinRate) {
      val = absoluteMinRate
      setIsMinRateWarning(true)
      setTimeout(() => setIsMinRateWarning(false), 2500)
    }
    setAdjustedPrice(val)
  }

  useEffect(() => {
    if (isEditingPrice && inputRef.current) inputRef.current.focus()
  }, [isEditingPrice])

  const toggleChannel = (name) =>
    setRestrictedChannels((prev) => ({ ...prev, [name]: !prev[name] }))

  const diffAmount = adjustedPrice - rec.current_price
  const isIncrease = diffAmount > 0
  const diffFormatted =
    diffAmount === 0 ? 'No Change' : `${isIncrease ? '+' : ''}${formatJPY(diffAmount)}`

  // --- Build driver list ---
  const activeDrivers = []

  if (rec.type === 'equity') {
    activeDrivers.push({
      id: 'equity_imbalance', algoKey: 'equity', icon: <Icons.Scale />,
      title: 'Revenue Imbalance Detected',
      subtitle: `${rec.equity_action.unit_ahead} is pacing ${rec.equity_action.disparity} ahead of ${rec.equity_action.unit_behind}.`,
    })
    activeDrivers.push({
      id: 'equity_target', algoKey: 'equity', icon: <Icons.Activity />,
      title: 'Fair Share Target',
      subtitle: 'Distribute allocations evenly across individual owners.',
    })
  } else if (rec.type === 'los') {
    activeDrivers.push({
      id: 'shoulder_date', algoKey: 'los', icon: <Icons.Calendar />,
      title: 'Weekend Gap Detected',
      subtitle: 'High search volume for Saturday only.',
    })
    activeDrivers.push({
      id: 'los_protect', algoKey: 'los', icon: <Icons.Lock />,
      title: 'Protect Shoulder Dates',
      subtitle: 'Prevent 1-night bookings from ruining weekend revenue.',
    })
  } else if (rec.type === 'channel') {
    activeDrivers.push({
      id: 'displacement', algoKey: 'displacement', icon: <Icons.Shield />,
      title: (<><GlossaryTerm term="Displacement" definition="Rejecting low-value business to save rooms for high-value business." align="left" />{' '}Protection</>),
      subtitle: `Protecting last ${rec.metrics.physical_rooms - rec.metrics.current_booked} rooms for Corporate`,
    })
    activeDrivers.push({
      id: 'channel_yield', algoKey: 'channel', icon: <Icons.Globe />,
      title: (<><GlossaryTerm term="Net Revenue" definition="Revenue after deducting OTA commissions (approx 18%)." align="left" />{' '}Optimized</>),
      subtitle: 'Demand strong enough for 100% Direct bookings',
    })
  } else {
    if (rec.metrics.pace_vs_ly !== 'N/A') {
      activeDrivers.push({
        id: 'pace', algoKey: 'pace', icon: <Icons.TrendingUp />,
        title: (<><GlossaryTerm term="Pace" definition="Booking speed vs historicals" align="left" /> is {rec.metrics.pace_vs_ly}</>),
        subtitle: 'vs. same day LY',
      })
    }
    activeDrivers.push({
      id: 'occ', algoKey: 'overbooking', icon: <Icons.AlertCircle />,
      title: (<>{rec.metrics.occupancy_forecast}% Forecasted{' '}<GlossaryTerm term="Occupancy" definition="The percentage of total available rooms that are expected to be sold." align="left" /></>),
      subtitle: rec.metrics.overbooking_active
        ? 'Capacity artificially expanded'
        : rec.metrics.occupancy_forecast > 80 ? 'Sell-out risk high' : 'Pacing normally',
    })
    if (rec.metrics.elasticity_active) {
      activeDrivers.push({
        id: 'comp', algoKey: 'elasticity', icon: <Icons.Activity />,
        title: `Comp Avg: ${formatJPY(rec.metrics.competitor_avg)}`,
        subtitle: rec.recommended_price > rec.metrics.competitor_avg ? 'Testing market ceiling' : 'Highly competitive rate',
      })
    }
  }

  if (rec.event_tag && rec.type !== 'los' && rec.type !== 'equity') {
    activeDrivers.push({
      id: 'event', algoKey: 'anomaly', icon: <Icons.Star />,
      title: 'Event detected', subtitle: 'Local demand multiplier',
    })
  }

  const hasMoreDrivers = activeDrivers.length > 2
  const displayDrivers = showAllDrivers ? activeDrivers : activeDrivers.slice(0, 2)

  // --- Card styling ---
  let borderStyle = 'border-slate-200 shadow-sm'
  let headerBgStyle = 'bg-slate-50'
  let iconStyle = 'bg-slate-50 text-slate-400 border-slate-100 group-hover/driver:text-blue-500 group-hover/driver:bg-blue-50'

  if (rec.type === 'channel') {
    borderStyle = 'border-indigo-200 shadow-md'
    headerBgStyle = 'bg-indigo-50/50'
    iconStyle = 'bg-indigo-50 text-indigo-500 border-indigo-100 group-hover/driver:bg-indigo-100'
  } else if (rec.type === 'los') {
    borderStyle = 'border-amber-200 shadow-md'
    headerBgStyle = 'bg-amber-50/50'
    iconStyle = 'bg-amber-50 text-amber-500 border-amber-100 group-hover/driver:bg-amber-100'
  } else if (rec.type === 'equity') {
    borderStyle = 'border-fuchsia-200 shadow-md'
    headerBgStyle = 'bg-fuchsia-50/50'
    iconStyle = 'bg-fuchsia-50 text-fuchsia-500 border-fuchsia-100 group-hover/driver:bg-fuchsia-100'
  }

  const OTA_LIST = [
    { name: 'Booking.com', rate: '18%' },
    { name: 'Airbnb', rate: '15%' },
  ]

  return (
    <div className={`bg-white rounded-xl border ${borderStyle} mb-5 relative z-10 hover:z-20 transition-all overflow-visible`}>
      {/* Card Header */}
      <div className={`p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 rounded-t-xl ${headerBgStyle}`}>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              {new Date(rec.checkin_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
            <span className="text-xs sm:text-sm font-medium text-slate-500">{rec.room_type}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {rec.event_tag && rec.type !== 'los' && (
              <span className="px-2.5 py-1 rounded bg-pink-50 border border-pink-100 text-pink-700 text-xs font-bold flex items-center">
                <span className="mr-1.5 text-[10px]">✨</span> {rec.event_tag}
              </span>
            )}
            {rec.type === 'price' && (
              <span className="px-2.5 py-1 rounded bg-blue-100 border border-blue-200 text-blue-800 text-xs font-bold flex items-center shadow-sm">
                <Icons.TrendingUp /> <span className="ml-1.5">Rate Optimization</span>
              </span>
            )}
            {rec.type === 'channel' && (
              <span className="px-2.5 py-1 rounded bg-indigo-100 border border-indigo-200 text-indigo-800 text-xs font-bold flex items-center shadow-sm">
                <Icons.Globe /> <span className="ml-1.5">Channel Yielding</span>
              </span>
            )}
            {rec.type === 'los' && (
              <span className="px-2.5 py-1 rounded bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold flex items-center shadow-sm">
                <Icons.Calendar /> <span className="ml-1.5">Shoulder Date Protection</span>
              </span>
            )}
            {rec.type === 'equity' && (
              <span className="px-2.5 py-1 rounded bg-fuchsia-100 border border-fuchsia-200 text-fuchsia-800 text-xs font-bold flex items-center shadow-sm">
                <Icons.Scale /> <span className="ml-1.5">Owner Distribution Alert</span>
              </span>
            )}
          </div>
        </div>
        <div className={`px-3 py-1.5 rounded-full border text-xs font-bold flex items-center whitespace-nowrap ${rec.confidence.color}`}>
          <div className={`w-1.5 h-1.5 rounded-full mr-2 ${rec.confidence.level === 'High' ? 'bg-emerald-500' : rec.confidence.level === 'Medium' ? 'bg-amber-500' : 'bg-rose-500'}`} />
          {rec.confidence.level} Confidence
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-col md:flex-row overflow-hidden md:overflow-visible">
        {/* Left: Driver reasons */}
        <div className="flex-1 p-5 border-b md:border-b-0 md:border-r border-slate-100 bg-white md:rounded-bl-xl">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs uppercase tracking-widest text-slate-400 font-bold flex items-center">
              <Icons.Activity />
              <span className="ml-1.5">
                {rec.type === 'channel' ? 'Why restrict channels?' : rec.type === 'los' ? 'Why restrict stay length?' : rec.type === 'equity' ? 'Why pause unit?' : 'Why this price?'}
              </span>
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {displayDrivers.map((driver) => (
              <button
                key={driver.id}
                onClick={() => onOpenDetails({ algoId: driver.algoKey, rec })}
                className="flex items-start space-x-3 text-left p-2 -ml-2 hover:bg-slate-50 transition-colors w-full group/driver border border-transparent hover:border-slate-100 hover:rounded-lg relative z-0 hover:z-50"
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded flex items-center justify-center border transition-colors ${iconStyle}`}>
                  {driver.icon}
                </div>
                <div className="pt-0.5 flex-1 pr-2 relative">
                  <p className="text-sm font-bold text-slate-800 leading-tight mb-0.5 relative z-10">{driver.title}</p>
                  <p className="text-xs text-slate-500 relative z-10">{driver.subtitle}</p>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-30 group-hover/driver:opacity-100 text-slate-300 transition-opacity">
                    <Icons.ArrowRight />
                  </div>
                </div>
              </button>
            ))}
          </div>
          {hasMoreDrivers && (
            <button onClick={() => setShowAllDrivers(!showAllDrivers)} className="mt-4 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors flex items-center">
              {showAllDrivers ? '- View Less' : `+ ${activeDrivers.length - 2} More Factors`}
            </button>
          )}
          {/* Competitor market context strip */}
          {(rec.type === 'price' || rec.type === 'channel') && rec.metrics.competitor_min && rec.metrics.competitor_max && (
            <div className="mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowComps((p) => !p)}
                className="w-full flex items-center gap-2 text-xs text-slate-500 hover:text-slate-700 transition-colors group"
              >
                <Icons.TrendingUp />
                <span>Market range: <span className="font-semibold text-slate-700">{formatJPY(rec.metrics.competitor_min)} – {formatJPY(rec.metrics.competitor_max)}</span></span>
                <span className="ml-auto text-slate-400">Your rate: <span className="font-semibold text-slate-600">{formatJPY(rec.current_price)}</span></span>
                <span className={`text-slate-300 group-hover:text-slate-500 transition-all ${showComps ? 'rotate-180' : ''}`}>
                  <Icons.ChevronDown />
                </span>
              </button>
              {showComps && rec.metrics.competitor_list?.length > 0 && (
                <div className="mt-2 rounded-lg border border-slate-100 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 uppercase tracking-wider">
                        <th className="px-3 py-1.5 text-left font-semibold">Comp Set</th>
                        <th className="px-3 py-1.5 text-left font-semibold hidden sm:table-cell">Room</th>
                        <th className="px-3 py-1.5 text-right font-semibold">Rate</th>
                        <th className="px-3 py-1.5 text-right font-semibold">vs You</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 bg-white">
                      {rec.metrics.competitor_list.map((comp, i) => {
                        const delta = comp.rate - rec.current_price
                        return (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="px-3 py-2">
                              <div className="font-medium text-slate-700 leading-tight">{comp.name}</div>
                              <div className="text-slate-400">{'★'.repeat(comp.stars)}{'☆'.repeat(5 - comp.stars)}</div>
                            </td>
                            <td className="px-3 py-2 text-slate-500 hidden sm:table-cell">{comp.room}</td>
                            <td className="px-3 py-2 text-right font-semibold text-slate-700">{formatJPY(comp.rate)}</td>
                            <td className={`px-3 py-2 text-right font-bold ${delta > 0 ? 'text-emerald-600' : delta < 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                              {delta === 0 ? '—' : `${delta > 0 ? '+' : ''}${formatJPY(delta)}`}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Strategy Picker (unified for all card types) */}
        {rec.type === 'equity' ? (
          <StrategyPicker
            initialPrimaryChecked={rec.confidence.level !== 'Low'}
            primary={{
              label: `Pause ${rec.equity_action.unit_ahead} on OTAs`,
              description: `Lets ${rec.equity_action.unit_behind} capture demand and close the revenue gap`,
              applyLabel: 'Apply Pause', applyIcon: <Icons.Scale />,
              content: (
                <EquityPrimaryContent
                  rec={rec}
                  restrictedChannels={restrictedChannels}
                  toggleChannel={toggleChannel}
                  otaList={OTA_LIST}
                />
              ),
            }}
            alternatives={rec.alternatives}
            accentColor="fuchsia"
            bgStyle="bg-fuchsia-50/30"
            rejectLabel="Dismiss"
            onApply={(primaryChecked, alts, buildPayload) => {
              const payload = {}
              if (primaryChecked) { Object.assign(payload, { action: rec.equity_action.action, restrictedChannels }); payload.primaryApplied = true }
              alts.forEach((a) => Object.assign(payload, buildPayload(a)))
              if (alts.length > 0) payload.alternatives = alts.map((a) => a.id)
              onAction(rec.id, 'accepted', payload)
            }}
            onReject={() => onAction(rec.id, 'dismissed', { action: 'None' })}
          />
        ) : rec.type === 'los' ? (
          <StrategyPicker
            initialPrimaryChecked={rec.confidence.level !== 'Low'}
            primary={{
              label: `Set Min Stay to ${targetMns} Night${targetMns > 1 ? 's' : ''}`,
              description: 'Close shoulder dates to 1-night arrivals',
              applyLabel: 'Apply Min Stay', applyIcon: <Icons.Lock />,
              content: (
                <LosPrimaryContent
                  rec={rec}
                  targetMns={targetMns}
                  minLos={rec.los_action.min_mns ?? 1}
                  onChangeMns={setTargetMns}
                />
              ),
            }}
            alternatives={rec.alternatives}
            accentColor="amber"
            bgStyle="bg-amber-50/30"
            rejectLabel="Skip for Now"
            onApply={(primaryChecked, alts, buildPayload) => {
              const payload = {}
              if (primaryChecked) { payload.mns = targetMns; payload.primaryApplied = true }
              alts.forEach((a) => Object.assign(payload, buildPayload(a)))
              if (alts.length > 0) payload.alternatives = alts.map((a) => a.id)
              onAction(rec.id, 'accepted', payload)
            }}
            onReject={() => onAction(rec.id, 'rejected', { mns: 1 })}
          />
        ) : rec.type === 'channel' ? (
          <StrategyPicker
            initialPrimaryChecked={rec.confidence.level !== 'Low'}
            primary={{
              label: 'Close OTA Channels',
              description: `Save ${formatJPY(rec.channel_action.commission_saved)} in commissions on last ${rec.channel_action.rooms_protected} rooms`,
              applyLabel: 'Apply Restrictions', applyIcon: <Icons.Globe />,
              content: (
                <ChannelPrimaryContent
                  rec={rec}
                  restrictedChannels={restrictedChannels}
                  toggleChannel={toggleChannel}
                  otaList={OTA_LIST}
                />
              ),
            }}
            alternatives={rec.alternatives}
            accentColor="indigo"
            bgStyle="bg-indigo-50/30"
            rejectLabel="Reject"
            onApply={(primaryChecked, alts, buildPayload) => {
              const payload = {}
              if (primaryChecked) { Object.assign(payload, { price: rec.current_price, restrictedChannels }); payload.primaryApplied = true }
              alts.forEach((a) => Object.assign(payload, buildPayload(a)))
              if (alts.length > 0) payload.alternatives = alts.map((a) => a.id)
              onAction(rec.id, 'accepted', payload)
            }}
            onReject={() => onAction(rec.id, 'rejected', { price: rec.current_price })}
          />
        ) : (
          <StrategyPicker
            initialPrimaryChecked={rec.confidence.level !== 'Low'}
            primary={{
              label: `Set Rate to ${formatJPY(adjustedPrice)}`,
              description: diffAmount === 0 ? 'No change from current rate' : `${diffFormatted} from current ${formatJPY(rec.current_price)}`,
              applyLabel: 'Set Rate', applyIcon: <Icons.Check />,
              content: (
                <PricePrimaryContent
                  rec={rec}
                  adjustedPrice={adjustedPrice}
                  diffAmount={diffAmount}
                  isIncrease={isIncrease}
                  diffFormatted={diffFormatted}
                  isEditingPrice={isEditingPrice}
                  editPriceValue={editPriceValue}
                  isMinRateWarning={isMinRateWarning}
                  absoluteMinRate={absoluteMinRate}
                  inputRef={inputRef}
                  onAdjust={handleAdjust}
                  onStartEdit={() => { setIsEditingPrice(true); setEditPriceValue(adjustedPrice.toString()) }}
                  onEditChange={(v) => setEditPriceValue(v)}
                  onSubmit={handlePriceSubmit}
                  onEscape={() => { setIsEditingPrice(false); setEditPriceValue(adjustedPrice.toString()) }}
                />
              ),
            }}
            alternatives={rec.alternatives}
            accentColor="blue"
            bgStyle="bg-slate-50"
            rejectLabel="Reject"
            onApply={(primaryChecked, alts, buildPayload) => {
              const payload = {}
              if (primaryChecked) { payload.price = adjustedPrice; payload.primaryApplied = true }
              alts.forEach((a) => Object.assign(payload, buildPayload(a)))
              if (alts.length > 0) payload.alternatives = alts.map((a) => a.id)
              onAction(rec.id, 'accepted', payload)
            }}
            onReject={() => onAction(rec.id, 'rejected', { price: rec.current_price })}
          />
        )}
      </div>
    </div>
  )
}

// --- Primary content sub-components ---

function PricePrimaryContent({ rec, adjustedPrice, isMinRateWarning, absoluteMinRate, inputRef, onAdjust, onStartEdit, onEditChange, onSubmit, onEscape, isEditingPrice, editPriceValue }) {
  return (
    <div>
      {isMinRateWarning && (
        <p className="text-[10px] text-rose-500 font-bold mb-1 text-center animate-in slide-in-from-top-1">
          Below absolute minimum ({formatJPY(absoluteMinRate)})
        </p>
      )}
      <div className={`flex items-center justify-between bg-white border rounded-lg shadow-sm w-full overflow-hidden transition-all ${isMinRateWarning ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-50' : 'border-slate-200 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400'}`}>
        <button onClick={() => onAdjust(-2000)} className="px-4 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-bold text-xl border-r border-slate-100 transition-colors outline-none focus:bg-slate-100">-</button>
        <div className="flex-1 text-center cursor-text" onClick={onStartEdit}>
          {isEditingPrice ? (
            <input
              ref={inputRef} type="number"
              className="w-full text-center text-xl sm:text-2xl font-bold text-slate-900 px-2 tracking-tight outline-none bg-transparent"
              value={editPriceValue} onChange={(e) => onEditChange(e.target.value)}
              onBlur={onSubmit}
              onKeyDown={(e) => { if (e.key === 'Enter') onSubmit(); if (e.key === 'Escape') onEscape() }}
            />
          ) : (
            <span className="block text-xl sm:text-2xl font-bold text-slate-900 px-2 tracking-tight hover:text-blue-600 transition-colors">
              {formatJPY(adjustedPrice)}
            </span>
          )}
        </div>
        <button onClick={() => onAdjust(2000)} className="px-4 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-bold text-xl border-l border-slate-100 transition-colors outline-none focus:bg-slate-100">+</button>
      </div>
      <p className="text-xs text-slate-400 text-center mt-1.5">Tap price to type a custom value</p>
    </div>
  )
}

function ChannelPrimaryContent({ rec, restrictedChannels, toggleChannel, otaList }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">Channels to Restrict</span>
        <span className="text-xs text-slate-500">Uncheck to keep open</span>
      </div>
      <div className="bg-white border border-indigo-200 rounded-lg p-3 shadow-sm space-y-2">
        {otaList.map((ota) => (
          <label key={ota.name} className="flex items-center space-x-3 text-sm text-slate-700 cursor-pointer p-1 hover:bg-slate-50 rounded">
            <input type="checkbox" checked={restrictedChannels[ota.name]} onChange={() => toggleChannel(ota.name)} className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer" />
            <span className="flex-1 font-medium">{ota.name}</span>
            <span className="text-xs text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded">Comm: {ota.rate}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

function LosPrimaryContent({ rec, targetMns, minLos, onChangeMns }) {
  const currentMns = rec.los_action.current_mns ?? 1
  return (
    <div className="bg-white border border-amber-200 rounded-lg p-3 shadow-sm space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Current min stay</span>
        <span className="font-bold text-slate-700">{currentMns} Night{currentMns !== 1 ? 's' : ''}</span>
      </div>
      <div className="flex items-center justify-between bg-amber-50 rounded-lg px-3 py-2 border border-amber-200">
        <span className="text-xs font-semibold text-amber-700">Proposed min stay</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onChangeMns(Math.max(minLos, targetMns - 1))}
            className="w-7 h-7 rounded border border-amber-300 bg-white text-amber-700 font-bold hover:bg-amber-100 flex items-center justify-center leading-none"
          >−</button>
          <span className="w-16 text-center text-sm font-bold text-amber-900">
            {targetMns} Night{targetMns !== 1 ? 's' : ''}
          </span>
          <button
            onClick={() => onChangeMns(targetMns + 1)}
            className="w-7 h-7 rounded border border-amber-300 bg-white text-amber-700 font-bold hover:bg-amber-100 flex items-center justify-center leading-none"
          >+</button>
        </div>
      </div>
      {rec.los_action.reason && (
        <p className="text-xs text-slate-400 text-center pt-0.5">{rec.los_action.reason}</p>
      )}
    </div>
  )
}

function EquityPrimaryContent({ rec, restrictedChannels, toggleChannel, otaList }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-fuchsia-500">Channels to Pause</span>
        <span className="text-xs text-slate-500">Uncheck to keep active</span>
      </div>
      <div className="bg-white border border-fuchsia-200 rounded-lg p-3 shadow-sm space-y-2">
        {otaList.map((ota) => (
          <label key={ota.name} className="flex items-center space-x-3 text-sm text-slate-700 cursor-pointer p-1 hover:bg-slate-50 rounded">
            <input type="checkbox" checked={restrictedChannels[ota.name]} onChange={() => toggleChannel(ota.name)} className="rounded text-fuchsia-600 focus:ring-fuchsia-500 w-4 h-4 cursor-pointer" />
            <span className="flex-1 font-medium">{ota.name}</span>
            <span className="text-xs text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded">Comm: {ota.rate}</span>
          </label>
        ))}
      </div>
      <p className="text-xs text-slate-400 text-center pt-1">Unit pauses for 48h then auto-resumes</p>
    </div>
  )
}

// --- Badge / button class maps ---

const BADGE_CLASSES = {
  blue:    'bg-blue-100 text-blue-700 border-blue-200',
  amber:   'bg-amber-100 text-amber-700 border-amber-200',
  emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  rose:    'bg-rose-100 text-rose-700 border-rose-200',
  violet:  'bg-violet-100 text-violet-700 border-violet-200',
}

const APPLY_BTN = {
  blue:    'bg-blue-600 text-white hover:bg-blue-700',
  indigo:  'bg-indigo-600 text-white hover:bg-indigo-700',
  amber:   'bg-amber-600 text-white hover:bg-amber-700',
  fuchsia: 'bg-fuchsia-600 text-white hover:bg-fuchsia-700',
}

// --- Checkmark SVG ---
const Checkmark = () => (
  <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
    <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

// --- StrategyPicker: unified checklist for primary + alternatives ---

function StrategyPicker({ primary, alternatives, accentColor, bgStyle, rejectLabel, onApply, onReject, initialPrimaryChecked = true }) {
  const [primaryChecked, setPrimaryChecked] = useState(initialPrimaryChecked)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [overrides, setOverrides] = useState({})

  // Split: exclusive alts compete with primary (radio behavior); additive alts stack freely
  const exclusiveAlts = alternatives?.filter((a) => a.exclusiveWith?.includes('primary')) || []
  const additiveAlts = alternatives?.filter((a) => !a.exclusiveWith?.includes('primary')) || []

  const handlePrimaryClick = () => {
    const willCheck = !primaryChecked
    if (willCheck) {
      // Re-selecting primary: deselect any exclusive alt that was chosen instead
      setSelectedIds((prev) => {
        const next = new Set(prev)
        exclusiveAlts.forEach((a) => next.delete(a.id))
        return next
      })
    }
    setPrimaryChecked(willCheck)
  }

  const toggleAlt = (id) => {
    const alt = alternatives?.find((a) => a.id === id)
    const willSelect = !selectedIds.has(id)
    if (willSelect && alt?.exclusiveWith?.includes('primary')) {
      // Selecting an exclusive alt: deselect primary
      setPrimaryChecked(false)
    }
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const effectiveLabel = (alt) => {
    if (!alt.labelTemplate) return alt.label
    return alt.labelTemplate.replace(/\{(\w+)\}/g, (_, field) => {
      const inp = alt.inputs?.find((i) => i.field === field)
      return overrides[alt.id]?.[field] ?? inp?.default ?? ''
    })
  }

  const buildPayload = (alt) => {
    const base = { ...alt.payload }
    const altOverrides = overrides[alt.id] || {}
    alt.inputs?.forEach((inp) => {
      if (altOverrides[inp.field] !== undefined) base[inp.field] = altOverrides[inp.field]
    })
    return base
  }

  const setFieldVal = (altId, inp, v) =>
    setOverrides((prev) => ({
      ...prev,
      [altId]: { ...(prev[altId] || {}), [inp.field]: Math.min(inp.max, Math.max(inp.min, v)) },
    }))

  const selectedAlts = alternatives?.filter((a) => selectedIds.has(a.id)) || []
  const totalSelected = (primaryChecked ? 1 : 0) + selectedIds.size
  const canApply = primaryChecked || selectedIds.size > 0

  const applyBtnLabel =
    totalSelected > 1
      ? `Apply ${totalSelected} Selected`
      : primaryChecked
      ? primary.applyLabel
      : selectedAlts[0]?.actionLabel || 'Apply Selected'

  // Renders a single alt row (shared by exclusive and additive zones)
  const renderAlt = (alt, isExclusive = false) => {
    const isSel = selectedIds.has(alt.id)
    return (
      <div key={alt.id} className={`rounded-xl border transition-all ${isSel ? 'bg-white border-slate-200 shadow-sm' : 'border-slate-200/60 bg-white/40'}`}>
        <div
          className="flex items-start gap-3 cursor-pointer p-3 select-none"
          onClick={() => toggleAlt(alt.id)}
        >
          {/* Circle for exclusive (radio feel), square for additive (checkbox feel) */}
          <span className={`mt-0.5 w-4 h-4 border-2 flex items-center justify-center shrink-0 transition-colors ${isExclusive ? 'rounded-full' : 'rounded'} ${isSel ? 'bg-slate-800 border-slate-800' : 'border-slate-300'}`}>
            {isSel && (isExclusive
              ? <span className="w-1.5 h-1.5 rounded-full bg-white block" />
              : <Checkmark />
            )}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span className="text-sm font-bold text-slate-800 leading-tight">{effectiveLabel(alt)}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border shrink-0 ${BADGE_CLASSES[alt.badgeColor]}`}>{alt.badge}</span>
            </div>
            <span className="text-xs text-slate-500">{alt.description}</span>
          </div>
        </div>
        {isSel && alt.inputs?.map((inp) => {
          const val = overrides[alt.id]?.[inp.field] ?? inp.default
          return (
            <div key={inp.field} onClick={(e) => e.stopPropagation()} className="mx-3 mb-3 flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
              <span className="text-xs text-slate-500 flex-1">{inp.label}</span>
              <button onClick={() => setFieldVal(alt.id, inp, val - inp.step)} className="w-7 h-7 rounded border border-slate-200 bg-white text-slate-600 font-bold hover:bg-slate-100 flex items-center justify-center leading-none">−</button>
              <span className="w-12 text-center text-sm font-bold text-slate-800">{val}{inp.unit}</span>
              <button onClick={() => setFieldVal(alt.id, inp, val + inp.step)} className="w-7 h-7 rounded border border-slate-200 bg-white text-slate-600 font-bold hover:bg-slate-100 flex items-center justify-center leading-none">+</button>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className={`w-full md:w-80 lg:w-[400px] ${bgStyle} p-4 flex flex-col rounded-b-xl md:rounded-bl-none md:rounded-br-xl`}>

      {/* Strategy zone: primary + exclusive alts (radio group) */}
      <div className="mb-2">
        {/* Primary row */}
        <div className={`rounded-xl border transition-all ${primaryChecked ? 'bg-white border-slate-200 shadow-sm' : 'border-slate-200/60 bg-white/40'}`}>
          <div className="flex items-start gap-3 cursor-pointer p-3 select-none" onClick={handlePrimaryClick}>
            <span className={`mt-0.5 w-4 h-4 border-2 flex items-center justify-center shrink-0 transition-colors ${exclusiveAlts.length > 0 ? 'rounded-full' : 'rounded'} ${primaryChecked ? 'bg-slate-800 border-slate-800' : 'border-slate-300'}`}>
              {primaryChecked && (exclusiveAlts.length > 0
                ? <span className="w-1.5 h-1.5 rounded-full bg-white block" />
                : <Checkmark />
              )}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <span className="text-sm font-bold text-slate-800 leading-tight">{primary.label}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full border bg-emerald-100 text-emerald-700 border-emerald-200 shrink-0">
                  Recommended
                </span>
              </div>
              <span className="text-xs text-slate-500">{primary.description}</span>
            </div>
          </div>
          {primaryChecked && primary.content && (
            <div className="px-3 pb-3" onClick={(e) => e.stopPropagation()}>
              {primary.content}
            </div>
          )}
        </div>

        {/* Exclusive alts with "— or —" divider */}
        {exclusiveAlts.map((alt) => (
          <div key={alt.id}>
            <div className="flex items-center gap-2 my-1.5 px-1">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">or</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
            {renderAlt(alt, true)}
          </div>
        ))}
      </div>

      {/* Additive alts zone */}
      {additiveAlts.length > 0 && (
        <div className="space-y-1.5 mb-3">
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold px-1 block mt-1">Also apply</span>
          {additiveAlts.map((alt) => renderAlt(alt, false))}
        </div>
      )}

      {/* Actions */}
      <div className="mt-auto flex space-x-3">
        <button
          onClick={onReject}
          className="flex-1 py-3 px-2 border border-slate-200 bg-white rounded-lg text-slate-600 text-sm font-bold hover:bg-slate-100 hover:text-slate-800 transition-colors"
        >
          {rejectLabel}
        </button>
        <button
          onClick={() => canApply && onApply(primaryChecked, selectedAlts, buildPayload)}
          disabled={!canApply}
          className={`flex-[2] py-3 px-2 rounded-lg text-sm font-bold shadow-sm transition-colors flex justify-center items-center gap-1.5 ${canApply ? APPLY_BTN[accentColor] : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
        >
          {canApply && primary.applyIcon && totalSelected === 1 && primaryChecked && primary.applyIcon}
          {applyBtnLabel}
        </button>
      </div>
    </div>
  )
}
