import { useState, useEffect, useRef } from 'react'
import { Icons } from '../common/Icons'
import GlossaryTerm from '../common/GlossaryTerm'
import { formatJPY } from '../../utils/formatters'

export default function RecommendationCard({ rec, onAction, onOpenDetails, absoluteMinRate }) {
  const [adjustedPrice, setAdjustedPrice] = useState(rec.recommended_price)
  const [showAllDrivers, setShowAllDrivers] = useState(false)
  const [isEditingPrice, setIsEditingPrice] = useState(false)
  const [editPriceValue, setEditPriceValue] = useState('')
  const [isMinRateWarning, setIsMinRateWarning] = useState(false)
  const inputRef = useRef(null)

  const [restrictedChannels, setRestrictedChannels] = useState({
    'Booking.com': true,
    Agoda: true,
    Expedia: true,
  })

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
    if (isEditingPrice && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditingPrice])

  const toggleChannel = (name) => {
    setRestrictedChannels((prev) => ({ ...prev, [name]: !prev[name] }))
  }

  const diffAmount = adjustedPrice - rec.current_price
  const isIncrease = diffAmount > 0
  const diffFormatted =
    diffAmount === 0 ? 'No Change' : `${isIncrease ? '+' : ''}${formatJPY(diffAmount)}`

  // --- Build driver list ---
  const activeDrivers = []

  if (rec.type === 'equity') {
    activeDrivers.push({
      id: 'equity_imbalance',
      algoKey: 'equity',
      icon: <Icons.Scale />,
      title: 'Revenue Imbalance Detected',
      subtitle: `${rec.equity_action.unit_ahead} is pacing ${rec.equity_action.disparity} ahead of ${rec.equity_action.unit_behind}.`,
    })
    activeDrivers.push({
      id: 'equity_target',
      algoKey: 'equity',
      icon: <Icons.Activity />,
      title: 'Fair Share Target',
      subtitle: 'Distribute allocations evenly across individual owners.',
    })
  } else if (rec.type === 'los') {
    activeDrivers.push({
      id: 'shoulder_date',
      algoKey: 'los',
      icon: <Icons.Calendar />,
      title: 'Weekend Gap Detected',
      subtitle: 'High search volume for Saturday only.',
    })
    activeDrivers.push({
      id: 'los_protect',
      algoKey: 'los',
      icon: <Icons.Lock />,
      title: 'Protect Shoulder Dates',
      subtitle: 'Prevent 1-night bookings from ruining weekend revenue.',
    })
  } else if (rec.type === 'channel') {
    activeDrivers.push({
      id: 'displacement',
      algoKey: 'displacement',
      icon: <Icons.Shield />,
      title: (
        <>
          <GlossaryTerm
            term="Displacement"
            definition="Rejecting low-value business to save rooms for high-value business."
            align="left"
          />{' '}
          Protection
        </>
      ),
      subtitle: `Protecting last ${rec.metrics.physical_rooms - rec.metrics.current_booked} rooms for Corporate`,
    })
    activeDrivers.push({
      id: 'channel_yield',
      algoKey: 'channel',
      icon: <Icons.Globe />,
      title: (
        <>
          <GlossaryTerm
            term="Net Revenue"
            definition="Revenue after deducting OTA commissions (approx 18%)."
            align="left"
          />{' '}
          Optimized
        </>
      ),
      subtitle: 'Demand strong enough for 100% Direct bookings',
    })
  } else {
    if (rec.metrics.pace_vs_ly !== 'N/A') {
      activeDrivers.push({
        id: 'pace',
        algoKey: 'pace',
        icon: <Icons.TrendingUp />,
        title: (
          <>
            <GlossaryTerm term="Pace" definition="Booking speed vs historicals" align="left" /> is{' '}
            {rec.metrics.pace_vs_ly}
          </>
        ),
        subtitle: 'vs. same day LY',
      })
    }
    activeDrivers.push({
      id: 'occ',
      algoKey: 'overbooking',
      icon: <Icons.AlertCircle />,
      title: (
        <>
          {rec.metrics.occupancy_forecast}% Forecasted{' '}
          <GlossaryTerm
            term="Occupancy"
            definition="The percentage of total available rooms that are expected to be sold."
            align="left"
          />
        </>
      ),
      subtitle: rec.metrics.overbooking_active
        ? 'Capacity artificially expanded'
        : rec.metrics.occupancy_forecast > 80
        ? 'Sell-out risk high'
        : 'Pacing normally',
    })
    if (rec.metrics.elasticity_active) {
      activeDrivers.push({
        id: 'comp',
        algoKey: 'elasticity',
        icon: <Icons.Activity />,
        title: `Comp Avg: ${formatJPY(rec.metrics.competitor_avg)}`,
        subtitle:
          rec.recommended_price > rec.metrics.competitor_avg
            ? 'Testing market ceiling'
            : 'Highly competitive rate',
      })
    }
  }

  if (rec.event_tag && rec.type !== 'los' && rec.type !== 'equity') {
    activeDrivers.push({
      id: 'event',
      algoKey: 'anomaly',
      icon: <Icons.Star />,
      title: 'Event detected',
      subtitle: 'Local demand multiplier',
    })
  }

  const hasMoreDrivers = activeDrivers.length > 2
  const displayDrivers = showAllDrivers ? activeDrivers : activeDrivers.slice(0, 2)

  // --- Card styling by type ---
  let borderStyle = 'border-slate-200 shadow-sm'
  let headerBgStyle = 'bg-slate-50'
  let iconStyle =
    'bg-slate-50 text-slate-400 border-slate-100 group-hover/driver:text-blue-500 group-hover/driver:bg-blue-50'

  if (rec.type === 'channel') {
    borderStyle = 'border-indigo-200 shadow-md'
    headerBgStyle = 'bg-indigo-50/50'
    iconStyle =
      'bg-indigo-50 text-indigo-500 border-indigo-100 group-hover/driver:bg-indigo-100'
  } else if (rec.type === 'los') {
    borderStyle = 'border-amber-200 shadow-md'
    headerBgStyle = 'bg-amber-50/50'
    iconStyle =
      'bg-amber-50 text-amber-500 border-amber-100 group-hover/driver:bg-amber-100'
  } else if (rec.type === 'equity') {
    borderStyle = 'border-fuchsia-200 shadow-md'
    headerBgStyle = 'bg-fuchsia-50/50'
    iconStyle =
      'bg-fuchsia-50 text-fuchsia-500 border-fuchsia-100 group-hover/driver:bg-fuchsia-100'
  }

  const OTA_LIST = [
    { name: 'Booking.com', rate: '18%' },
    { name: 'Agoda', rate: '15%' },
    { name: 'Expedia', rate: '18%' },
  ]

  return (
    <div className={`bg-white rounded-xl border ${borderStyle} mb-5 relative z-10 hover:z-20 transition-all`}>
      {/* Card Header */}
      <div
        className={`p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 rounded-t-xl ${headerBgStyle}`}
      >
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              {new Date(rec.checkin_date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </span>
            <span className="text-xs sm:text-sm font-medium text-slate-500">{rec.room_type}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {rec.event_tag && rec.type !== 'los' && (
              <span className="px-2.5 py-1 rounded bg-pink-50 border border-pink-100 text-pink-700 text-xs font-bold flex items-center">
                <span className="mr-1.5 text-[10px]">✨</span> {rec.event_tag}
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

        <div
          className={`px-3 py-1.5 rounded-full border text-xs font-bold flex items-center whitespace-nowrap ${rec.confidence.color}`}
        >
          <div
            className={`w-1.5 h-1.5 rounded-full mr-2 ${
              rec.confidence.level === 'High'
                ? 'bg-emerald-500'
                : rec.confidence.level === 'Medium'
                ? 'bg-amber-500'
                : 'bg-rose-500'
            }`}
          />
          {rec.confidence.level} Confidence
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-col md:flex-row">
        {/* Left: Driver reasons */}
        <div className="flex-1 p-5 border-b md:border-b-0 md:border-r border-slate-100 bg-white md:rounded-bl-xl">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs uppercase tracking-widest text-slate-400 font-bold flex items-center">
              <Icons.Activity />
              <span className="ml-1.5">
                {rec.type === 'channel'
                  ? 'Why restrict channels?'
                  : rec.type === 'los'
                  ? 'Why restrict stay length?'
                  : rec.type === 'equity'
                  ? 'Why pause unit?'
                  : 'Why this price?'}
              </span>
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {displayDrivers.map((driver) => (
              <button
                key={driver.id}
                onClick={() => onOpenDetails({ algoId: driver.algoKey, rec })}
                className="flex items-start space-x-3 text-left p-2 -ml-2 rounded-lg hover:bg-slate-50 transition-colors w-full group/driver border border-transparent hover:border-slate-100 relative z-0 hover:z-50"
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded flex items-center justify-center border transition-colors ${iconStyle}`}
                >
                  {driver.icon}
                </div>
                <div className="pt-0.5 flex-1 pr-2 relative">
                  <p className="text-sm font-bold text-slate-800 leading-tight mb-0.5 relative z-10">
                    {driver.title}
                  </p>
                  <p className="text-xs text-slate-500 relative z-10">{driver.subtitle}</p>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover/driver:opacity-100 text-slate-300 transition-opacity">
                    <Icons.ArrowRight />
                  </div>
                </div>
              </button>
            ))}
          </div>

          {hasMoreDrivers && (
            <button
              onClick={() => setShowAllDrivers(!showAllDrivers)}
              className="mt-4 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors flex items-center"
            >
              {showAllDrivers ? '- View Less' : `+ ${activeDrivers.length - 2} More Factors`}
            </button>
          )}
        </div>

        {/* Right: Action panel (variant by type) */}
        {rec.type === 'equity' ? (
          <EquityActionPanel
            rec={rec}
            restrictedChannels={restrictedChannels}
            toggleChannel={toggleChannel}
            otaList={OTA_LIST}
            onAction={onAction}
          />
        ) : rec.type === 'los' ? (
          <LosActionPanel rec={rec} onAction={onAction} />
        ) : rec.type === 'channel' ? (
          <ChannelActionPanel
            rec={rec}
            restrictedChannels={restrictedChannels}
            toggleChannel={toggleChannel}
            otaList={OTA_LIST}
            onAction={onAction}
          />
        ) : (
          <PriceActionPanel
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
            onAction={onAction}
          />
        )}
      </div>
    </div>
  )
}

// --- Sub-panels ---

function PriceActionPanel({
  rec, adjustedPrice, diffAmount, isIncrease, diffFormatted,
  isEditingPrice, editPriceValue, isMinRateWarning, absoluteMinRate,
  inputRef, onAdjust, onStartEdit, onEditChange, onSubmit, onEscape, onAction,
}) {
  return (
    <div className="w-full md:w-80 lg:w-[400px] bg-slate-50 p-5 flex flex-col justify-center rounded-b-xl md:rounded-bl-none md:rounded-br-xl">
      <div className="flex justify-between items-end mb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Current</span>
          <span className="text-lg font-bold text-slate-400 line-through">{formatJPY(rec.current_price)}</span>
        </div>
        <div className="text-slate-300 pb-1 px-2 hidden sm:block">
          <Icons.ArrowRight />
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end space-x-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Proposed</span>
            {diffAmount !== 0 && !isEditingPrice && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-bold flex items-center ${
                  isIncrease ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                }`}
              >
                {isIncrease ? <Icons.TrendingUp /> : <Icons.TrendingDown />}
                <span className="ml-1">{diffFormatted}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {isMinRateWarning && (
        <p className="text-[10px] text-rose-500 font-bold mb-1 text-center animate-in slide-in-from-top-1">
          Below absolute minimum rate ({formatJPY(absoluteMinRate)})
        </p>
      )}

      <div
        className={`flex items-center justify-between bg-white border rounded-lg shadow-sm w-full overflow-hidden mb-4 transition-all ${
          isMinRateWarning
            ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-50'
            : 'border-slate-200 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400'
        }`}
      >
        <button
          onClick={() => onAdjust(-1000)}
          className="px-4 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-bold text-xl border-r border-slate-100 transition-colors outline-none focus:bg-slate-100"
        >
          -
        </button>

        <div className="flex-1 text-center cursor-text" onClick={onStartEdit}>
          {isEditingPrice ? (
            <input
              ref={inputRef}
              type="number"
              className="w-full text-center text-xl sm:text-2xl font-bold text-slate-900 px-2 tracking-tight outline-none bg-transparent"
              value={editPriceValue}
              onChange={(e) => onEditChange(e.target.value)}
              onBlur={onSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSubmit()
                if (e.key === 'Escape') onEscape()
              }}
            />
          ) : (
            <span className="block text-xl sm:text-2xl font-bold text-slate-900 px-2 tracking-tight hover:text-blue-600 transition-colors">
              {formatJPY(adjustedPrice)}
            </span>
          )}
        </div>

        <button
          onClick={() => onAdjust(1000)}
          className="px-4 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-bold text-xl border-l border-slate-100 transition-colors outline-none focus:bg-slate-100"
        >
          +
        </button>
      </div>

      <div className="flex space-x-3 mt-auto">
        <button
          onClick={() => onAction(rec.id, 'rejected', { price: rec.current_price })}
          className="flex-1 py-3 px-2 border border-slate-200 bg-white rounded-lg text-slate-600 text-sm sm:text-base font-bold hover:bg-slate-100 hover:text-slate-800 transition-colors flex justify-center items-center"
        >
          Reject
        </button>
        <button
          onClick={() => onAction(rec.id, 'accepted', { price: adjustedPrice })}
          className="flex-[2] py-3 px-2 bg-blue-600 text-white rounded-lg text-sm sm:text-base font-bold hover:bg-blue-700 shadow-sm transition-colors flex justify-center items-center"
        >
          <Icons.Check /> <span className="ml-1.5">Approve</span>
        </button>
      </div>
    </div>
  )
}

function ChannelActionPanel({ rec, restrictedChannels, toggleChannel, otaList, onAction }) {
  return (
    <div className="w-full md:w-80 lg:w-[400px] bg-indigo-50/30 p-5 flex flex-col justify-center rounded-b-xl md:rounded-bl-none md:rounded-br-xl">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-500 block">
            Restrict Channels
          </span>
          <span className="text-xs text-slate-500">Uncheck to override</span>
        </div>
        <div className="bg-white border border-indigo-200 rounded-lg p-3 shadow-sm space-y-2">
          {otaList.map((ota) => (
            <label
              key={ota.name}
              className="flex items-center space-x-3 text-sm text-slate-700 cursor-pointer p-1 hover:bg-slate-50 rounded"
            >
              <input
                type="checkbox"
                checked={restrictedChannels[ota.name]}
                onChange={() => toggleChannel(ota.name)}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
              />
              <span className="flex-1 font-medium">{ota.name}</span>
              <span className="text-xs text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded">
                Comm: {ota.rate}
              </span>
            </label>
          ))}
        </div>
      </div>

      <p className="text-xs text-slate-500 text-center font-medium mb-4">
        Saves approx{' '}
        <strong className="text-emerald-600">
          {formatJPY(rec.channel_action.commission_saved)}
        </strong>{' '}
        in OTA commissions on last {rec.channel_action.rooms_protected} rooms.
      </p>

      <div className="flex space-x-3 mt-auto">
        <button
          onClick={() => onAction(rec.id, 'rejected', { price: rec.current_price })}
          className="flex-1 py-3 px-2 border border-slate-200 bg-white rounded-lg text-slate-600 text-sm sm:text-base font-bold hover:bg-slate-100 hover:text-slate-800 transition-colors flex justify-center items-center"
        >
          Reject
        </button>
        <button
          onClick={() => onAction(rec.id, 'accepted', { price: rec.current_price, restrictedChannels })}
          className="flex-[2] py-3 px-2 bg-indigo-600 text-white rounded-lg text-sm sm:text-base font-bold hover:bg-indigo-700 shadow-sm transition-colors flex justify-center items-center"
        >
          <Icons.Globe /> <span className="ml-1.5">Apply Restrictions</span>
        </button>
      </div>
    </div>
  )
}

function LosActionPanel({ rec, onAction }) {
  return (
    <div className="w-full md:w-80 lg:w-[400px] bg-amber-50/30 p-5 flex flex-col justify-center rounded-b-xl md:rounded-bl-none md:rounded-br-xl">
      <div className="mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-600 block mb-2">
          Recommended Inventory Action
        </span>
        <div className="bg-white border border-amber-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-600">Current MNS:</span>
            <span className="text-sm font-bold text-slate-900">1 Night</span>
          </div>
          <div className="flex items-center justify-center py-2 text-amber-300">
            <Icons.ArrowRight />
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm font-semibold text-slate-600">Proposed:</span>
            <span className="text-sm font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
              {rec.los_action.target_mns} Nights (Min)
            </span>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-500 text-center font-medium mb-4">{rec.los_action.reason}</p>

      <div className="flex space-x-3 mt-auto">
        <button
          onClick={() => onAction(rec.id, 'rejected', { mns: 1 })}
          className="flex-1 py-3 px-2 border border-slate-200 bg-white rounded-lg text-slate-600 text-sm sm:text-base font-bold hover:bg-slate-100 hover:text-slate-800 transition-colors flex justify-center items-center"
        >
          Reject
        </button>
        <button
          onClick={() => onAction(rec.id, 'accepted', { mns: rec.los_action.target_mns })}
          className="flex-[2] py-3 px-2 bg-amber-600 text-white rounded-lg text-sm sm:text-base font-bold hover:bg-amber-700 shadow-sm transition-colors flex justify-center items-center"
        >
          <Icons.Lock /> <span className="ml-1.5">Apply MNS</span>
        </button>
      </div>
    </div>
  )
}

function EquityActionPanel({ rec, restrictedChannels, toggleChannel, otaList, onAction }) {
  return (
    <div className="w-full md:w-80 lg:w-[400px] bg-fuchsia-50/30 p-5 flex flex-col justify-center rounded-b-xl md:rounded-bl-none md:rounded-br-xl">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-fuchsia-500 block">
            Select Channels to Pause
          </span>
          <span className="text-xs text-slate-500">Uncheck to override</span>
        </div>
        <div className="bg-white border border-fuchsia-200 rounded-lg p-3 shadow-sm space-y-2">
          {otaList.map((ota) => (
            <label
              key={ota.name}
              className="flex items-center space-x-3 text-sm text-slate-700 cursor-pointer p-1 hover:bg-slate-50 rounded"
            >
              <input
                type="checkbox"
                checked={restrictedChannels[ota.name]}
                onChange={() => toggleChannel(ota.name)}
                className="rounded text-fuchsia-600 focus:ring-fuchsia-500 w-4 h-4 cursor-pointer"
              />
              <span className="flex-1 font-medium">{ota.name}</span>
              <span className="text-xs text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded">
                Comm: {ota.rate}
              </span>
            </label>
          ))}
        </div>
      </div>

      <p className="text-xs text-slate-500 text-center font-medium mb-4">
        Allows{' '}
        <strong className="text-fuchsia-600">{rec.equity_action.unit_behind}</strong> to capture
        incoming demand and balance monthly revenue share.
      </p>

      <div className="flex space-x-3 mt-auto">
        <button
          onClick={() => onAction(rec.id, 'dismissed', { action: 'None' })}
          className="flex-1 py-3 px-2 border border-slate-200 bg-white rounded-lg text-slate-600 text-sm sm:text-base font-bold hover:bg-slate-100 hover:text-slate-800 transition-colors flex justify-center items-center"
        >
          Dismiss
        </button>
        <button
          onClick={() => onAction(rec.id, 'accepted', { action: rec.equity_action.action, restrictedChannels })}
          className="flex-[2] py-3 px-2 bg-fuchsia-600 text-white rounded-lg text-sm sm:text-base font-bold hover:bg-fuchsia-700 shadow-sm transition-colors flex justify-center items-center"
        >
          <Icons.Scale /> <span className="ml-1.5">Apply Pause</span>
        </button>
      </div>
    </div>
  )
}
