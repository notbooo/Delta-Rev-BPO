import { useState } from 'react'
import GlossaryTerm from '../components/common/GlossaryTerm'
import { formatJPY } from '../utils/formatters'

const ROOM_TYPES = ['All Room Types', 'Standard Twin', 'Deluxe Double', 'Suite']

export default function PaceForecastView({ onNavigateBack }) {
  const [selectedRoomType, setSelectedRoomType] = useState('All Room Types')
  const dates = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i + 1)
    return d
  })

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col mb-12">
      <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 rounded-t-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateBack}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
            title="Back to Morning Briefing"
          >
            ← Back
          </button>
          <h3 className="font-bold text-slate-800">14-Day Demand Forecast &amp; Pace</h3>
        </div>
        <select
          value={selectedRoomType}
          onChange={(e) => setSelectedRoomType(e.target.value)}
          className="text-sm border border-slate-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white py-2 px-3 outline-none"
        >
          {ROOM_TYPES.map((room) => (
            <option key={room}>{room}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto pb-40">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-slate-500 shadow-sm">
            <tr>
              <th className="px-6 py-3 text-left font-semibold">Date</th>
              <th className="px-6 py-3 text-right font-semibold">
                <GlossaryTerm
                  term="Booked (OTB)"
                  definition="On The Books: The actual number of rooms currently reserved in the system."
                />
              </th>
              <th className="px-6 py-3 text-right font-semibold">Forecast Occ</th>
              <th className="px-6 py-3 text-right font-semibold">
                <GlossaryTerm
                  term="Pace vs LY"
                  definition="Booking Pace vs Last Year: Shows if we are filling up faster (+) or slower (-) than the exact same time last year."
                />
              </th>
              <th className="px-6 py-3 text-right font-semibold">Current Rate</th>
              <th className="px-6 py-3 text-left font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {dates.map((date, idx) => {
              const roomType = ROOM_TYPES[idx % ROOM_TYPES.length]
              const shouldShow = selectedRoomType === 'All Room Types' || roomType === selectedRoomType

              if (!shouldShow) return null

              const otb = 40 + Math.floor(Math.random() * 40)
              const forecast = Math.min(100, otb + Math.floor(Math.random() * 20))
              const pace = (Math.random() * 10 - 2).toFixed(1)
              const rate = 25000 + Math.floor(Math.random() * 15) * 1000
              const isWeekend = date.getDay() === 0 || date.getDay() === 6

              return (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`font-medium ${isWeekend ? 'text-blue-600' : 'text-slate-900'}`}>
                      {date.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end space-x-3">
                      <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-400" style={{ width: `${otb}%` }} />
                      </div>
                      <span className="font-semibold text-slate-900 w-8">{otb}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <span className="text-slate-600 font-medium">{forecast}%</span>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <span
                      className={`${pace >= 0 ? 'text-emerald-600' : 'text-rose-600'} font-medium`}
                    >
                      {pace > 0 ? '+' : ''}
                      {pace}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap font-medium text-slate-900">
                    {formatJPY(rate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {forecast > 90 ? (
                      <span className="px-2.5 py-1 text-xs rounded-md bg-rose-100 text-rose-700 font-bold border border-rose-200">
                        Sell Out Risk
                      </span>
                    ) : pace < -1 ? (
                      <span className="px-2.5 py-1 text-xs rounded-md bg-amber-100 text-amber-700 font-bold border border-amber-200">
                        Needs Attention
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 text-xs rounded-md bg-emerald-100 text-emerald-700 font-bold border border-emerald-200">
                        On Track
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
