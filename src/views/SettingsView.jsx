import { Icons } from '../components/common/Icons'
import { ALGORITHM_DEFINITIONS } from '../constants/algorithmDefinitions'

const ROOM_TYPE_LABELS = ['2 Bedroom Deluxe', '3 Bedroom Deluxe']

export default function SettingsView({
  algoState,
  onToggleAlgo,
  onRiskChange,
  onOpenAlgoInfo,
  rateSettings,
  updateRateSetting,
}) {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Pricing Strategy Bounds — per room type */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4 mb-5">
          Pricing Strategy Bounds
        </h3>
        <div className="space-y-6">
          {ROOM_TYPE_LABELS.map((roomType) => {
            const cfg = rateSettings[roomType] || {}
            return (
              <div key={roomType} className="rounded-xl border border-slate-100 bg-slate-50/60 p-5">
                <p className="text-sm font-bold text-slate-800 mb-4">{roomType}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                      Min Rate (JPY)
                    </label>
                    <input
                      type="number"
                      value={cfg.minRate ?? ''}
                      onChange={(e) => updateRateSetting(roomType, 'minRate', parseInt(e.target.value, 10) || 0)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all bg-white"
                    />
                    <p className="mt-1 text-xs text-slate-400">Floor — never go below</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                      Max Rate (JPY)
                    </label>
                    <input
                      type="number"
                      value={cfg.maxRate ?? ''}
                      onChange={(e) => updateRateSetting(roomType, 'maxRate', parseInt(e.target.value, 10) || 0)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all bg-white"
                    />
                    <p className="mt-1 text-xs text-slate-400">Ceiling — never exceed</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                      Min LOS (nights)
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateRateSetting(roomType, 'minLos', Math.max(1, (cfg.minLos ?? 1) - 1))}
                        className="w-9 h-9 rounded border border-slate-300 bg-white text-slate-600 font-bold hover:bg-slate-100 flex items-center justify-center"
                      >−</button>
                      <span className="flex-1 text-center text-sm font-bold text-slate-800">
                        {cfg.minLos ?? 1} {cfg.minLos === 1 ? 'night' : 'nights'}
                      </span>
                      <button
                        onClick={() => updateRateSetting(roomType, 'minLos', (cfg.minLos ?? 1) + 1)}
                        className="w-9 h-9 rounded border border-slate-300 bg-white text-slate-600 font-bold hover:bg-slate-100 flex items-center justify-center"
                      >+</button>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">Lowest acceptable stay</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Risk Tolerance */}
        <div className="mt-10">
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Automation Risk Tolerance
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                value: 'conservative',
                label: 'Conservative',
                desc: 'Prioritizes high occupancy. Smaller rate increases, faster drops on slow pace.',
              },
              {
                value: 'balanced',
                label: 'Balanced (Recommended)',
                desc: 'Optimizes RevPAR natively. Standard elasticity curves applied accurately.',
              },
              {
                value: 'aggressive',
                label: 'Aggressive',
                desc: 'Prioritizes ADR. Pushes rates high aggressively during early demand spikes.',
              },
            ].map((option) => (
              <label
                key={option.value}
                className={`border rounded-xl p-5 cursor-pointer relative transition-all group ${
                  algoState.riskTolerance === option.value
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-slate-200 bg-slate-50 hover:border-blue-400'
                }`}
              >
                <input
                  type="radio"
                  name="strategy"
                  checked={algoState.riskTolerance === option.value}
                  onChange={() => onRiskChange(option.value)}
                  className="absolute top-5 right-5 w-4 h-4 text-blue-600"
                />
                <div
                  className={`font-bold mb-1 ${
                    algoState.riskTolerance === option.value
                      ? 'text-blue-900'
                      : 'text-slate-900 group-hover:text-blue-700'
                  }`}
                >
                  {option.label}
                </div>
                <div
                  className={`text-xs leading-relaxed ${
                    algoState.riskTolerance === option.value ? 'text-blue-700/70' : 'text-slate-500'
                  }`}
                >
                  {option.desc}
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Algorithm Toggles */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex justify-between items-end border-b border-slate-100 pb-4 mb-2">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Advanced Yield Configuration</h3>
            <p className="text-sm text-slate-500 mt-1">
              Toggle specific algorithm modules on or off for the overnight batch run.
            </p>
          </div>
        </div>
        <div className="space-y-1 mt-4">
          {Object.values(ALGORITHM_DEFINITIONS).map((algo) => (
            <div
              key={algo.id}
              className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 px-4 rounded-lg transition-colors -mx-4 group"
            >
              <div className="flex-1 pr-4">
                <div className="flex items-center space-x-2">
                  <div className="text-sm font-bold text-slate-900">{algo.name}</div>
                  <button
                    onClick={() => onOpenAlgoInfo(algo.id)}
                    className="text-slate-300 hover:text-blue-500 transition-colors p-1 rounded-full hover:bg-blue-50 focus:outline-none"
                    title="View algorithm details and math"
                  >
                    <Icons.Info />
                  </button>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{algo.desc}</div>
              </div>
              <div
                onClick={() => onToggleAlgo(algo.id)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  algoState[algo.id] ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                    algoState[algo.id] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
