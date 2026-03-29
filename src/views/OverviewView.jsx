import { Icons } from '../components/common/Icons'
import GlossaryTerm from '../components/common/GlossaryTerm'
import { formatJPY } from '../utils/formatters'

const OWNER_UNITS = [
  { name: 'Unit 101', revenue: 420000, color: 'bg-indigo-500' },
  { name: 'Unit 102', revenue: 290000, color: 'bg-rose-500', alert: true },
  { name: 'Unit 103', revenue: 380000, color: 'bg-emerald-500' },
  { name: 'Unit 104', revenue: 400000, color: 'bg-blue-500' },
]

const CURRENT_REVENUE = 3150000
const TARGET_REVENUE = 4000000
const EXPECTED_PACE_PCT = 75

export default function OverviewView() {
  const revPacePct = (CURRENT_REVENUE / TARGET_REVENUE) * 100
  const maxRev = Math.max(...OWNER_UNITS.map((u) => u.revenue))

  const kpis = [
    {
      label: (
        <GlossaryTerm
          term="Occupancy (MTD)"
          definition="Month-To-Date Occupancy: The percentage of available rooms sold so far this month."
        />
      ),
      value: '84%',
      trend: '+4.2%',
      isPositive: true,
    },
    {
      label: (
        <GlossaryTerm
          term="ADR (MTD)"
          definition="Average Daily Rate: The average revenue earned for an occupied room per day."
        />
      ),
      value: formatJPY(28500),
      trend: '+¥1,200',
      isPositive: true,
    },
    {
      label: (
        <GlossaryTerm
          term="RevPAR (MTD)"
          definition="Revenue Per Available Room: Total room revenue divided by total rooms available. The ultimate measure of hotel performance."
        />
      ),
      value: formatJPY(23940),
      trend: '+¥1,850',
      isPositive: true,
    },
    {
      label: (
        <GlossaryTerm
          term="Net RevPAR (MTD)"
          definition="True profitability. Revenue remaining after deducting OTA commissions."
        />
      ),
      value: formatJPY(18840),
      trend: '+¥2,100',
      isPositive: true,
    },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Monthly Pacing Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Monthly Sales Target Pacing</h3>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded">
            Ahead of Pace
          </span>
        </div>
        <div className="p-6">
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-sm font-semibold text-slate-500">Current MTD Net Revenue</p>
              <p className="text-3xl font-black text-slate-900 tracking-tight">
                {formatJPY(CURRENT_REVENUE)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Target</p>
              <p className="text-xl font-bold text-slate-400">{formatJPY(TARGET_REVENUE)}</p>
            </div>
          </div>
          <div className="relative w-full h-6 bg-slate-100 rounded-full overflow-hidden mt-4 shadow-inner">
            <div
              className="absolute top-0 bottom-0 left-0 bg-blue-500 transition-all duration-1000"
              style={{ width: `${revPacePct}%` }}
            />
            <div
              className="absolute top-0 bottom-0 w-1 bg-slate-900 z-10"
              style={{ left: `${EXPECTED_PACE_PCT}%` }}
              title="Historical Pace Expectation"
            >
              <div className="absolute -top-6 -left-8 text-[10px] font-bold text-slate-500 w-16 text-center">
                Expected
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500 mb-1">{kpi.label}</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
              <span
                className={`text-sm font-semibold flex items-center ${
                  kpi.isPositive ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {kpi.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Owner Equity & Anomalies */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Owner Equity Chart */}
        <div className="col-span-1 lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center">
              <Icons.Scale /> <span className="ml-2">Owner Equity Health</span>
            </h3>
            <span className="text-xs font-bold text-slate-500">MTD Revenue Share</span>
          </div>
          <div className="p-5">
            <p className="text-sm text-slate-500 mb-6">
              Visualizing revenue distribution across individually owned units to ensure fair
              allocations.
            </p>
            <div className="space-y-4">
              {OWNER_UNITS.map((unit, i) => {
                const widthPct = (unit.revenue / maxRev) * 100
                return (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row sm:items-center text-sm gap-2 sm:gap-0"
                  >
                    <div className="w-24 font-bold text-slate-700 flex items-center">
                      {unit.alert && (
                        <span className="text-rose-500 mr-1" title="Requires attention">
                          <Icons.AlertCircle />
                        </span>
                      )}
                      {unit.name}
                    </div>
                    <div className="flex-1 sm:ml-4 flex items-center">
                      <div className="flex-1 h-6 bg-slate-100 rounded overflow-hidden relative">
                        <div
                          className={`absolute top-0 bottom-0 left-0 ${unit.color}`}
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>
                      <span className="w-24 text-right font-medium text-slate-600">
                        {formatJPY(unit.revenue)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-6 bg-rose-50 border border-rose-100 p-3 rounded-lg flex items-start space-x-3">
              <div className="text-rose-500 mt-0.5">
                <Icons.Info />
              </div>
              <p className="text-xs text-rose-800 leading-relaxed">
                <strong>Alert:</strong> Unit 102 is pacing significantly behind average. The daily
                optimizer has triggered an <em>Owner Distribution Alert</em> to throttle OTA
                availability for leading units to force bookings into Unit 102.
              </p>
            </div>
          </div>
        </div>

        {/* Anomaly Alerts */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="font-bold text-slate-800">System Anomalies Detected</h3>
          </div>
          <div className="p-0 divide-y divide-slate-100">
            <div className="p-5 flex items-start space-x-3 hover:bg-slate-50 transition-colors">
              <div className="text-amber-500 mt-0.5">
                <Icons.AlertCircle />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Unusual Cancellation Velocity
                </p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Deluxe Doubles for Oct 12th saw 4 cancellations in the last hour. Triggering
                  Overbooking Optimizer.
                </p>
              </div>
            </div>
            <div className="p-5 flex items-start space-x-3 hover:bg-slate-50 transition-colors">
              <div className="text-indigo-500 mt-0.5">
                <Icons.Globe />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">High OTA Dependency</p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Agoda share is 40% above normal for next weekend. Recommending channel yielding to
                  protect Net RevPAR.
                </p>
              </div>
            </div>
            <div className="p-5 flex items-start space-x-3 hover:bg-slate-50 transition-colors">
              <div className="text-emerald-500 mt-0.5">
                <Icons.Users />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Group{' '}
                  <GlossaryTerm
                    term="Block Wash"
                    definition="Rooms previously reserved for a group event that were not actually booked and have been returned to public inventory."
                  />{' '}
                  Released
                </p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  15 Standard Twins returned to transient inventory for next Tuesday. Rates softened.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
