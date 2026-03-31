import { formatJPY } from '../../utils/formatters'

// Simple SVG charts for algorithm visualization
function PaceChart() {
  // Line chart: Booking velocity (LY vs YTD)
  const points_ly = [
    { x: 10, y: 70, label: 'Day 1' },
    { x: 50, y: 65, label: 'Day 3' },
    { x: 90, y: 58, label: 'Day 5' },
    { x: 130, y: 48, label: 'Day 7' },
    { x: 170, y: 42, label: 'Day 9' },
    { x: 210, y: 35, label: 'Day 11' },
    { x: 250, y: 28, label: 'Day 14' },
  ]
  const points_ytd = [
    { x: 10, y: 75, label: 'Day 1' },
    { x: 50, y: 68, label: 'Day 3' },
    { x: 90, y: 52, label: 'Day 5' },
    { x: 130, y: 40, label: 'Day 7' },
    { x: 170, y: 28, label: 'Day 9' },
    { x: 210, y: 18, label: 'Day 11' },
    { x: 250, y: 8, label: 'Day 14' },
  ]
  const pathLY = `M ${points_ly.map(p => `${p.x},${p.y}`).join(' L ')}`
  const pathYTD = `M ${points_ytd.map(p => `${p.x},${p.y}`).join(' L ')}`

  return (
    <div className="bg-slate-900 rounded-lg p-5 font-mono text-sm text-slate-300 shadow-inner my-4">
      <div className="flex justify-between border-b border-slate-700 pb-2 mb-4">
        <span className="text-blue-400">Booking Velocity Trend</span>
        <span className="text-slate-500 text-xs">Rooms/Day</span>
      </div>
      <svg viewBox="0 0 280 110" className="w-full mb-4 border border-slate-700 rounded p-2 bg-slate-800">
        {/* Grid */}
        {[0, 40, 80, 120, 160, 200, 240].map((x) => (
          <line key={x} x1={x} y1="5" x2={x} y2="85" stroke="#334155" strokeWidth="0.5" />
        ))}
        {[20, 40, 60, 80].map((y) => (
          <line key={y} x1="0" y1={y} x2="260" y2={y} stroke="#334155" strokeWidth="0.5" />
        ))}
        {/* Axes */}
        <line x1="0" y1="85" x2="260" y2="85" stroke="#64748b" strokeWidth="1" />
        <line x1="0" y1="5" x2="0" y2="85" stroke="#64748b" strokeWidth="1" />
        {/* Lines */}
        <path d={pathLY} stroke="#ef4444" strokeWidth="2" fill="none" />
        <path d={pathYTD} stroke="#22c55e" strokeWidth="2" fill="none" />
        {/* Dots */}
        {points_ly.map((p, i) => (
          <circle key={`ly${i}`} cx={p.x} cy={p.y} r="2" fill="#ef4444" />
        ))}
        {points_ytd.map((p, i) => (
          <circle key={`ytd${i}`} cx={p.x} cy={p.y} r="2" fill="#22c55e" />
        ))}
      </svg>
      <div className="flex justify-between text-xs mb-3">
        <span className="text-red-400">━ Last Year Velocity</span>
        <span className="text-green-400">━ Current Year Velocity (+32%)</span>
      </div>
      <div className="p-3 bg-slate-800 rounded border border-slate-700 text-xs text-slate-400">
        <p>
          Current pace is <span className="text-green-400 font-bold">+32% ahead</span> of last
          year at this point in the booking window. System automatically increases rate multiplier
          by <span className="text-white font-bold">1.12x</span> to capture upside.
        </p>
      </div>
    </div>
  )
}

function ElasticityChart() {
  // Elasticity curve showing conversion drop-off at price thresholds
  const points = [
    { price: 25, conversion: 92 },
    { price: 35, conversion: 88 },
    { price: 45, conversion: 82 },
    { price: 55, conversion: 72 },
    { price: 65, conversion: 58 },
    { price: 75, conversion: 35 },
    { price: 85, conversion: 12 },
  ]
  const path = `M ${points.map((p, i) => `${25 + i * 30},${95 - p.conversion}`).join(' L ')}`

  return (
    <div className="bg-slate-900 rounded-lg p-5 font-mono text-sm text-slate-300 shadow-inner my-4">
      <div className="flex justify-between border-b border-slate-700 pb-2 mb-4">
        <span className="text-violet-400">Price Elasticity Curve</span>
        <span className="text-slate-500 text-xs">Conversion %</span>
      </div>
      <svg viewBox="0 0 220 110" className="w-full mb-4 border border-slate-700 rounded p-2 bg-slate-800">
        {/* Grid */}
        {[0, 30, 60, 90, 120, 150, 180].map((x) => (
          <line key={x} x1={x} y1="5" x2={x} y2="95" stroke="#334155" strokeWidth="0.5" />
        ))}
        {[20, 40, 60, 80].map((y) => (
          <line key={y} x1="0" y1={y} x2="200" y2={y} stroke="#334155" strokeWidth="0.5" />
        ))}
        {/* Axes */}
        <line x1="0" y1="95" x2="200" y2="95" stroke="#64748b" strokeWidth="1" />
        <line x1="0" y1="5" x2="0" y2="95" stroke="#64748b" strokeWidth="1" />
        {/* Curve */}
        <path d={path} stroke="#a78bfa" strokeWidth="2.5" fill="none" />
        {/* Threshold markers */}
        <line x1="150" y1="5" x2="150" y2="95" stroke="#f87171" strokeWidth="1" strokeDasharray="3,3" />
        <text x="155" y="15" fontSize="8" fill="#f87171" fontWeight="bold">
          Ceiling
        </text>
        {/* Dots */}
        {points.map((p, i) => (
          <circle key={i} cx={25 + i * 30} cy={95 - p.conversion} r="2" fill="#a78bfa" />
        ))}
      </svg>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span>Price threshold detected:</span>
          <span className="text-amber-400 font-bold">{formatJPY(75000)}</span>
        </div>
        <p className="text-slate-400">
          Above this price, conversion drops sharply. System caps rate recommendations to{' '}
          <span className="text-white font-bold">{formatJPY(72000)}</span> to avoid the cliff.
        </p>
      </div>
    </div>
  )
}

function OverbookingChart() {
  // Distribution curve showing cancellation probability
  const points = [
    { cancellation: 0, probability: 2 },
    { cancellation: 5, probability: 8 },
    { cancellation: 10, probability: 18 },
    { cancellation: 15, probability: 25 },
    { cancellation: 20, probability: 22 },
    { cancellation: 25, probability: 15 },
    { cancellation: 30, probability: 7 },
    { cancellation: 35, probability: 3 },
  ]
  const path = `M ${points.map((p, i) => `${20 + i * 25},${80 - p.probability}`).join(' L ')}`

  return (
    <div className="bg-slate-900 rounded-lg p-5 font-mono text-sm text-slate-300 shadow-inner my-4">
      <div className="flex justify-between border-b border-slate-700 pb-2 mb-4">
        <span className="text-cyan-400">Cancellation Distribution</span>
        <span className="text-slate-500 text-xs">Probability %</span>
      </div>
      <svg viewBox="0 0 220 110" className="w-full mb-4 border border-slate-700 rounded p-2 bg-slate-800">
        {/* Grid */}
        {[0, 30, 60, 90, 120, 150, 180].map((x) => (
          <line key={x} x1={x} y1="5" x2={x} y2="90" stroke="#334155" strokeWidth="0.5" />
        ))}
        {[20, 40, 60, 80].map((y) => (
          <line key={y} x1="0" y1={y} x2="200" y2={y} stroke="#334155" strokeWidth="0.5" />
        ))}
        {/* Axes */}
        <line x1="0" y1="90" x2="200" y2="90" stroke="#64748b" strokeWidth="1" />
        <line x1="0" y1="5" x2="0" y2="90" stroke="#64748b" strokeWidth="1" />
        {/* Curve */}
        <path d={path} stroke="#06b6d4" strokeWidth="2.5" fill="none" />
        {/* Safe zone fill */}
        <path d={path} stroke="none" fill="#06b6d4" fillOpacity="0.1" />
        {/* Peak marker */}
        <circle cx="95" cy="30" r="3" fill="#fbbf24" />
        <text x="100" y="25" fontSize="8" fill="#fbbf24" fontWeight="bold">
          Mean: 15%
        </text>
        {/* Dots */}
        {points.map((p, i) => (
          <circle key={i} cx={20 + i * 25} cy={80 - p.probability} r="1.5" fill="#06b6d4" />
        ))}
      </svg>
      <div className="space-y-2 text-xs">
        <p className="text-slate-400">
          Based on <span className="text-white font-bold">2,847 bookings</span>, expected
          cancellation rate is <span className="text-cyan-400 font-bold">15%</span>.
        </p>
        <p className="text-slate-400">
          System oversells by <span className="text-white font-bold">+2.2 rooms</span> to
          statistically guarantee <span className="text-emerald-400 font-bold">100% occupancy</span>.
        </p>
      </div>
    </div>
  )
}

function DisplacementChart() {
  // Stacked bar showing segment demand allocation
  return (
    <div className="bg-slate-900 rounded-lg p-5 font-mono text-sm text-slate-300 shadow-inner my-4">
      <div className="flex justify-between border-b border-slate-700 pb-2 mb-4">
        <span className="text-teal-400">Segment Demand Allocation</span>
        <span className="text-slate-500 text-xs">Rooms</span>
      </div>
      <svg viewBox="0 0 200 80" className="w-full mb-4 border border-slate-700 rounded p-2 bg-slate-800">
        {/* Bars */}
        {/* Corporate */}
        <rect x="10" y="30" width="25" height="40" fill="#10b981" opacity="0.8" />
        <text x="12" y="72" fontSize="8" fill="#10b981">
          Corp
        </text>
        {/* Leisure */}
        <rect x="40" y="25" width="25" height="45" fill="#3b82f6" opacity="0.8" />
        <text x="42" y="72" fontSize="8" fill="#3b82f6">
          Leisure
        </text>
        {/* OTA */}
        <rect x="70" y="20" width="25" height="50" fill="#f59e0b" opacity="0.8" />
        <text x="72" y="72" fontSize="8" fill="#f59e0b">
          OTA
        </text>
        {/* Groups */}
        <rect x="100" y="40" width="25" height="30" fill="#8b5cf6" opacity="0.8" />
        <text x="102" y="72" fontSize="8" fill="#8b5cf6">
          Groups
        </text>
        {/* Capacity line */}
        <line x1="0" y1="20" x2="200" y2="20" stroke="#ec4899" strokeWidth="2" strokeDasharray="2,2" />
        <text x="135" y="15" fontSize="7" fill="#ec4899">
          Capacity (12 rooms)
        </text>
      </svg>
      <div className="space-y-2 text-xs">
        <p className="text-slate-400">
          Corporate demand detected: <span className="text-emerald-400 font-bold">4 rooms</span>
          (high-yield, late-booking). System recommends{' '}
          <span className="text-white font-bold">closing OTA channels</span> to preserve last 3
          rooms.
        </p>
      </div>
    </div>
  )
}

function ChannelChart() {
  // Net RevPAR comparison by channel
  return (
    <div className="bg-slate-900 rounded-lg p-5 font-mono text-sm text-slate-300 shadow-inner my-4">
      <div className="flex justify-between border-b border-slate-700 pb-2 mb-4">
        <span className="text-indigo-400">Net RevPAR by Channel</span>
        <span className="text-slate-500 text-xs">Net Yield %</span>
      </div>
      <svg viewBox="0 0 200 90" className="w-full mb-4 border border-slate-700 rounded p-2 bg-slate-800">
        {/* Grid */}
        {[0, 50, 100, 150].map((y) => (
          <line key={y} x1="0" y1={y} x2="200" y2={y} stroke="#334155" strokeWidth="0.5" />
        ))}
        {/* Bars */}
        <rect x="20" y="30" width="30" height="50" fill="#ef4444" opacity="0.8" /> {/* Booking.com */}
        <text x="22" y="85" fontSize="8" fill="#ef4444">
          Book.com
        </text>
        <text x="25" y="25" fontSize="8" fill="#ef4444" fontWeight="bold">
          82%
        </text>
        <rect x="60" y="20" width="30" height="60" fill="#f97316" opacity="0.8" /> {/* Expedia */}
        <text x="62" y="85" fontSize="8" fill="#f97316">
          Expedia
        </text>
        <text x="65" y="15" fontSize="8" fill="#f97316" fontWeight="bold">
          85%
        </text>
        <rect x="100" y="10" width="30" height="70" fill="#22c55e" opacity="0.8" /> {/* Direct */}
        <text x="102" y="85" fontSize="8" fill="#22c55e">
          Direct
        </text>
        <text x="105" y="5" fontSize="8" fill="#22c55e" fontWeight="bold">
          100%
        </text>
      </svg>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span>Closure recommended:</span>
          <span className="text-red-400 font-bold">Booking.com (18% commission)</span>
        </div>
        <p className="text-slate-400">
          Direct bookings provide <span className="text-emerald-400 font-bold">+18% more yield</span>
          . With strong demand, close OTAs and push to direct channels.
        </p>
      </div>
    </div>
  )
}

function AnomalyChart() {
  // Time series with anomaly spike
  const basePoints = [
    { day: 1, volume: 45 },
    { day: 2, volume: 48 },
    { day: 3, volume: 42 },
    { day: 4, volume: 46 },
    { day: 5, volume: 44 },
    { day: 6, volume: 49 }, // Anomaly
    { day: 7, volume: 51 }, // Sustained
  ]
  const path = basePoints.map((p, i) => `${30 + i * 20},${70 - p.volume * 0.7}`).join(' L ')

  return (
    <div className="bg-slate-900 rounded-lg p-5 font-mono text-sm text-slate-300 shadow-inner my-4">
      <div className="flex justify-between border-b border-slate-700 pb-2 mb-4">
        <span className="text-rose-400">Anomaly Detection</span>
        <span className="text-slate-500 text-xs">Search Volume</span>
      </div>
      <svg viewBox="0 0 200 100" className="w-full mb-4 border border-slate-700 rounded p-2 bg-slate-800">
        {/* Baseline band */}
        <rect x="0" y="25" width="200" height="20" fill="#475569" opacity="0.2" />
        <text x="5" y="35" fontSize="7" fill="#64748b">
          Expected Range
        </text>
        {/* Grid */}
        {[0, 50, 100, 150].map((x) => (
          <line key={x} x1={x} y1="10" x2={x} y2="85" stroke="#334155" strokeWidth="0.5" />
        ))}
        {/* Axes */}
        <line x1="0" y1="85" x2="200" y2="85" stroke="#64748b" strokeWidth="1" />
        <line x1="0" y1="10" x2="0" y2="85" stroke="#64748b" strokeWidth="1" />
        {/* Line */}
        <path d={`M ${path}`} stroke="#f97316" strokeWidth="2" fill="none" />
        {/* Anomaly marker */}
        <circle cx="130" cy="35" r="3" fill="#fbbf24" stroke="#fbbf24" strokeWidth="1" />
        <line x1="130" y1="35" x2="130" y2="90" stroke="#fbbf24" strokeWidth="1" strokeDasharray="2,2" />
        <text x="132" y="95" fontSize="8" fill="#fbbf24" fontWeight="bold">
          +18% spike
        </text>
        {/* Dots */}
        {basePoints.map((p, i) => (
          <circle
            key={i}
            cx={30 + i * 20}
            cy={70 - p.volume * 0.7}
            r="2"
            fill={i >= 5 ? '#fbbf24' : '#f97316'}
          />
        ))}
      </svg>
      <div className="space-y-2 text-xs">
        <p className="text-slate-400">
          Search volume spiked <span className="text-amber-400 font-bold">+18% on Day 6</span>,
          sustained on Day 7.
        </p>
        <p className="text-slate-400">
          Likely cause: <span className="text-white font-bold">Flight cancellation alert</span> or{' '}
          <span className="text-white font-bold">OTA feature placement</span>. System increases
          forecast and rate multiplier by <span className="text-white font-bold">1.15x</span>.
        </p>
      </div>
    </div>
  )
}

export default function MathVisualization({ type }) {
  if (type === 'pace') {
    return <PaceChart />
  }

  if (type === 'elasticity') {
    return <ElasticityChart />
  }

  if (type === 'overbooking') {
    return <OverbookingChart />
  }

  if (type === 'displacement') {
    return <DisplacementChart />
  }

  if (type === 'channel') {
    return (
      <div className="bg-slate-900 rounded-lg p-5 font-mono text-sm text-slate-300 shadow-inner my-4">
        <div className="flex justify-between border-b border-slate-700 pb-2 mb-3">
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

  if (type === 'anomaly') {
    return <AnomalyChart />
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
