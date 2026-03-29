import { formatJPY } from '../../utils/formatters'
import MathVisualization from './MathVisualization'

export default function ContextualMath({ algoId, rec }) {
  const m = rec.metrics || {}

  if (algoId === 'displacement' || algoId === 'channel') {
    return (
      <div className="bg-slate-900 rounded-lg p-5 font-mono text-sm text-slate-300 shadow-inner my-4">
        <div className="flex justify-between border-b border-slate-700 pb-2 mb-3">
          <span className="text-indigo-400">Channel Economics (Net RevPAR)</span>
          <span className="text-slate-500">{new Date(rec.checkin_date).toLocaleDateString()}</span>
        </div>
        <div className="space-y-2 text-slate-400">
          <div className="flex justify-between">
            <span>Rooms Remaining:</span>
            <span className="text-white font-bold">{m.physical_rooms - m.current_booked}</span>
          </div>
          <div className="flex justify-between">
            <span>Current Target Rate:</span>
            <span className="text-white">{formatJPY(rec.recommended_price)}</span>
          </div>
          <div className="my-4 p-3 bg-slate-800 rounded border border-slate-700">
            <p className="text-xs uppercase tracking-wider text-slate-500 mb-2 font-bold">
              If sold on OTA (18% Comm):
            </p>
            <div className="flex justify-between text-rose-300">
              <span>Net Revenue per room:</span>
              <span>{formatJPY(rec.recommended_price * 0.82)}</span>
            </div>
          </div>
          <div className="my-4 p-3 bg-slate-800 rounded border border-slate-700">
            <p className="text-xs uppercase tracking-wider text-slate-500 mb-2 font-bold">
              If held for Direct / Corporate:
            </p>
            <div className="flex justify-between text-emerald-400 font-bold">
              <span>Net Revenue per room:</span>
              <span>{formatJPY(rec.recommended_price)}</span>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-3 mt-4 text-xs">
            <p>
              Because occupancy is forecasted at{' '}
              <span className="text-white font-bold">{m.occupancy_forecast}%</span>, demand is
              sufficient to capture these rooms directly. Closing OTAs now saves{' '}
              <span className="text-emerald-400 font-bold">
                {formatJPY(rec.recommended_price * 0.18 * (m.physical_rooms - m.current_booked))}
              </span>{' '}
              in pure profit margin.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (algoId === 'los') {
    const weekendPrice = rec.recommended_price
    const shoulderPrice = Math.round(rec.recommended_price * 0.85)
    const twoNightYield = weekendPrice + shoulderPrice
    const mns = rec.los_action?.target_mns || 2

    return (
      <div className="bg-slate-900 rounded-lg p-5 font-mono text-sm text-slate-300 shadow-inner my-4">
        <div className="flex justify-between border-b border-slate-700 pb-2 mb-3">
          <span className="text-amber-400">Shoulder Gap Financial Impact</span>
          <span className="text-slate-500">{new Date(rec.checkin_date).toLocaleDateString()}</span>
        </div>
        <div className="space-y-3">
          <div className="my-4 p-3 bg-slate-800 rounded border border-slate-700">
            <p className="text-xs uppercase tracking-wider text-slate-500 mb-2 font-bold">
              Accepting 1-Night Stay (Peak Only):
            </p>
            <div className="flex justify-between text-slate-300">
              <span>Weekend Total Yield:</span>
              <span>{formatJPY(weekendPrice)}</span>
            </div>
          </div>
          <div className="my-4 p-3 bg-slate-800 rounded border border-slate-700">
            <p className="text-xs uppercase tracking-wider text-slate-500 mb-2 font-bold">
              Enforcing {mns}-Night MNS:
            </p>
            <div className="flex justify-between text-emerald-400 font-bold">
              <span>Weekend Total Yield:</span>
              <span>{formatJPY(twoNightYield)}</span>
            </div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-slate-800/50 rounded border border-slate-700 text-xs text-slate-400">
          <p>
            Because Saturday demand multiplier is{' '}
            <span className="text-white font-bold">{m.event_mult}x</span>, rejecting the single
            night stay preserves inventory for a highly-probable multi-night booking, yielding an
            extra <span className="text-emerald-400 font-bold">{formatJPY(shoulderPrice)}</span>.
          </p>
        </div>
      </div>
    )
  }

  if (algoId === 'equity') {
    const unitAhead = rec.equity_action?.unit_ahead || 'Unit 101'
    const unitBehind = rec.equity_action?.unit_behind || 'Unit 102'
    const disparity = rec.equity_action?.disparity || '30%'
    const actionText = rec.equity_action?.action || 'Pause Unit 101 for 48h'

    return (
      <div className="bg-slate-900 rounded-lg p-5 font-mono text-sm text-slate-300 shadow-inner my-4">
        <div className="flex justify-between border-b border-slate-700 pb-2 mb-3">
          <span className="text-fuchsia-400">Revenue Imbalance Detection</span>
          <span className="text-slate-500">{new Date(rec.checkin_date).toLocaleDateString()}</span>
        </div>
        <div className="space-y-3 text-slate-400">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span>{unitAhead} Status:</span>
            <span className="text-white font-bold">Ahead of Pace</span>
          </div>
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span>{unitBehind} Status:</span>
            <span className="text-rose-400 font-bold">Behind Pace</span>
          </div>
          <div className="flex justify-between items-center pt-1">
            <span>Calculated Disparity:</span>
            <span className="text-amber-400 font-bold">{disparity} Gap</span>
          </div>
        </div>
        <div className="mt-4 p-3 bg-slate-800 rounded border border-slate-700 text-xs text-slate-400">
          <p>
            To safely route upcoming organic bookings to the under-performing unit, the system
            recommends: <span className="text-white font-bold">{actionText}</span>.
          </p>
        </div>
      </div>
    )
  }

  if (algoId === 'pace') {
    return (
      <div className="bg-slate-900 rounded-lg p-5 font-mono text-sm text-slate-300 shadow-inner my-4">
        <div className="flex justify-between border-b border-slate-700 pb-2 mb-3">
          <span className="text-emerald-400">Real-time Pace Math</span>
          <span className="text-slate-500">{new Date(rec.checkin_date).toLocaleDateString()}</span>
        </div>
        <div className="space-y-2 text-slate-400">
          <div className="flex justify-between">
            <span>Current Booked (OTB):</span>
            <span className="text-white font-bold">{m.current_booked} rooms</span>
          </div>
          <div className="flex justify-between">
            <span>Pace vs Last Year:</span>
            <span className="text-emerald-400 font-bold">{m.pace_vs_ly}</span>
          </div>
          <div className="mt-4 p-3 bg-slate-800 rounded border border-slate-700">
            <p className="text-xs text-slate-300">
              Because pace is <span className="text-white">{m.pace_vs_ly}</span>, the algorithm
              anticipates anomalous pickup velocity. The forecasted remaining demand has been
              adjusted to{' '}
              <span className="text-white font-bold">{m.forecasted_demand} rooms</span> to drive
              pricing.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return <MathVisualization type={algoId} />
}
