import { formatJPY } from '../../utils/formatters'

export default function MathVisualization({ type }) {
  if (type === 'displacement' || type === 'channel') {
    return (
      <div className="bg-slate-900 rounded-lg p-5 font-mono text-sm text-slate-300 shadow-inner my-4">
        <div className="flex justify-between border-b border-slate-700 pb-2 mb-2">
          <span className="text-indigo-400">Net Revenue Optimization</span>
        </div>
        <p className="text-slate-400 mb-3 text-xs">
          Standard Gross RevPAR models treat all channels equally. This algorithm calculates the
          true profitability (Net RevPAR).
        </p>
        <div className="space-y-3">
          <div className="flex justify-between border-b border-slate-800 pb-1">
            <span>Booking.com (18% Comm)</span>
            <span className="text-rose-400">Yield: 82%</span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-1">
            <span>Direct Website (0% Comm)</span>
            <span className="text-emerald-400 font-bold">Yield: 100%</span>
          </div>
        </div>
        <div className="mt-4 p-3 bg-slate-800 rounded border border-slate-700 text-xs text-slate-400">
          <p>
            If probability of a direct corporate booking &gt; probability of a room staying empty,
            the system will execute{' '}
            <span className="text-white font-bold">Displacement</span> by recommending an OTA
            closure.
          </p>
        </div>
      </div>
    )
  }

  if (type === 'los') {
    return (
      <div className="bg-slate-900 rounded-lg p-5 font-mono text-sm text-slate-300 shadow-inner my-4">
        <div className="flex justify-between border-b border-slate-700 pb-2 mb-3">
          <span className="text-amber-400">Shoulder Gap Financial Impact</span>
        </div>
        <div className="space-y-3">
          <div className="my-4 p-3 bg-slate-800 rounded border border-slate-700">
            <p className="text-xs uppercase tracking-wider text-slate-500 mb-2 font-bold">
              Accepting 1-Night Stay (Saturday):
            </p>
            <div className="flex justify-between text-slate-300">
              <span>Weekend Total Yield:</span>
              <span>{formatJPY(30000)}</span>
            </div>
          </div>
          <div className="my-4 p-3 bg-slate-800 rounded border border-slate-700">
            <p className="text-xs uppercase tracking-wider text-slate-500 mb-2 font-bold">
              Enforcing 2-Night MNS (Fri + Sat):
            </p>
            <div className="flex justify-between text-emerald-400 font-bold">
              <span>Weekend Total Yield:</span>
              <span>{formatJPY(55000)}</span>
            </div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-slate-800/50 rounded border border-slate-700 text-xs text-slate-400">
          <p>
            Saturday is pacing at <span className="text-white font-bold">95%</span>, while Friday
            is only at <span className="text-white font-bold">35%</span>. Rejecting the 1-night
            stay holds inventory for a guest booking the full weekend, maximizing total Revenue.
          </p>
        </div>
      </div>
    )
  }

  if (type === 'equity') {
    return (
      <div className="bg-slate-900 rounded-lg p-5 font-mono text-sm text-slate-300 shadow-inner my-4">
        <div className="flex justify-between border-b border-slate-700 pb-2 mb-3">
          <span className="text-fuchsia-400">Revenue Imbalance Detection</span>
        </div>
        <div className="space-y-3 text-slate-400">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span>Unit 101 (130% of target)</span>
            <span className="text-white font-bold">{formatJPY(420000)}</span>
          </div>
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span>Unit 102 (85% of target)</span>
            <span className="text-rose-400 font-bold">{formatJPY(290000)}</span>
          </div>
          <div className="flex justify-between items-center pt-1">
            <span>Current Gap:</span>
            <span className="text-amber-400 font-bold">{formatJPY(130000)}</span>
          </div>
        </div>
        <div className="mt-4 p-3 bg-slate-800 rounded border border-slate-700 text-xs text-slate-400">
          <p>
            The system calculates the gap and determines that{' '}
            <span className="text-white font-bold">
              Unit 101 must be paused for approximately 48 hours
            </span>{' '}
            to safely route the next ~3 organic bookings to Unit 102.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-100 rounded-lg p-5 text-sm text-slate-500 my-4 text-center border border-dashed border-slate-300">
      Mathematical visualization available in full documentation.
    </div>
  )
}
