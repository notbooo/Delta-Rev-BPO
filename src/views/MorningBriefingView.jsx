import { Icons } from '../components/common/Icons'
import RecommendationCard from '../components/recommendation/RecommendationCard'
import { formatJPY } from '../utils/formatters'

export default function MorningBriefingView({
  recommendations,
  toasts,
  onAction,
  onBatchApprove,
  onUndo,
  onDismissToast,
  onOpenDetails,
  rateSettings,
  onNavigateToCalendar,
  onResetQueue,
}) {
  const pendingRecs = recommendations.filter((r) => r.status === 'pending')
  const processedCount = recommendations.length - pendingRecs.length
  const progressPct =
    recommendations.length === 0 ? 0 : (processedCount / recommendations.length) * 100

  const approvedRecs = recommendations.filter((r) => r.status === 'accepted')
  const totalNetSaved = approvedRecs.reduce(
    (acc, r) =>
      acc + (r.type === 'channel' && r.channel_action ? r.channel_action.commission_saved : 0),
    0
  )
  const hasHighConfidence = pendingRecs.some((r) => r.confidence.level === 'High')

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Header */}
      <div className="mb-8 bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-800 text-lg">Daily Rate &amp; Inventory Review</h3>
          <p className="text-sm text-slate-500">
            Review recommendations to update the PMS channel manager.
          </p>
        </div>
        <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-4">
          <div className="w-full sm:w-64">
            <div className="flex justify-between text-xs font-medium text-slate-500 mb-1">
              <span>{processedCount} Processed</span>
              <span>{pendingRecs.length} Remaining</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 transition-all duration-500 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
          {hasHighConfidence && (
            <button
              onClick={onBatchApprove}
              className="w-full sm:w-auto px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 font-bold rounded-lg hover:bg-blue-100 transition-colors text-sm whitespace-nowrap flex items-center justify-center"
            >
              <Icons.Check /> <span className="ml-1">Approve High Confidence</span>
            </button>
          )}
        </div>
      </div>

      {/* Recommendation Queue */}
      {pendingRecs.length > 0 ? (
        <div className="space-y-2 pb-24">
          {pendingRecs.map((rec) => (
            <RecommendationCard
              key={rec.id}
              rec={rec}
              onAction={onAction}
              onOpenDetails={onOpenDetails}
              absoluteMinRate={rateSettings?.[rec.room_type]?.minRate ?? 25000}
              absoluteMaxRate={rateSettings?.[rec.room_type]?.maxRate ?? 200000}
              minLos={rateSettings?.[rec.room_type]?.minLos ?? 1}
            />
          ))}
        </div>
      ) : (
        <InboxZero
          processedCount={processedCount}
          approvedCount={approvedRecs.length}
          totalNetSaved={totalNetSaved}
          onNavigateToCalendar={onNavigateToCalendar}
          onResetQueue={onResetQueue}
        />
      )}

      {/* Toast Notifications */}
      <ToastStack toasts={toasts} onUndo={onUndo} onDismiss={onDismissToast} />
    </div>
  )
}

function InboxZero({ processedCount, approvedCount, totalNetSaved, onNavigateToCalendar, onResetQueue }) {
  return (
    <div className="text-center py-16 bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icons.Check />
      </div>
      <h3 className="text-2xl font-bold text-slate-800 mb-2">Inbox Zero!</h3>
      <p className="text-slate-500 mb-8 max-w-md mx-auto">
        You've successfully processed all automated recommendations for today. The channel manager
        has been updated.
      </p>

      <div className="bg-slate-50 border border-slate-100 rounded-lg p-6 max-w-md mx-auto mb-8 text-left">
        <h4 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">
          Today's Impact Summary
        </h4>
        <ul className="space-y-3 text-sm">
          <li className="flex justify-between items-center">
            <span className="text-slate-500">Recommendations Reviewed:</span>
            <span className="font-bold text-slate-900">{processedCount}</span>
          </li>
          <li className="flex justify-between items-center">
            <span className="text-slate-500">Actions Approved:</span>
            <span className="font-bold text-slate-900">{approvedCount}</span>
          </li>
          <li className="flex justify-between items-center pt-3 border-t border-slate-200">
            <span className="text-slate-500">Net Revenue Protected:</span>
            <span className="font-bold text-emerald-600">~{formatJPY(totalNetSaved)}</span>
          </li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button
          onClick={onNavigateToCalendar}
          className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center"
        >
          <Icons.Calendar /> <span className="ml-2">View 14-Day Pace</span>
        </button>
        <button
          onClick={onResetQueue}
          className="px-6 py-2.5 text-slate-600 font-bold bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Regenerate Queue
        </button>
      </div>
    </div>
  )
}

function ToastStack({ toasts, onUndo, onDismiss }) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-8 left-1/2 md:left-[calc(50%+8rem)] -translate-x-1/2 flex flex-col gap-3 z-[100] w-[90%] max-w-md pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center justify-between space-x-4 animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-auto"
        >
          <div className="flex items-center space-x-3 truncate">
            <div
              className={`w-2 h-2 rounded-full shrink-0 ${
                toast.status === 'accepted' ? 'bg-emerald-400' : 'bg-rose-400'
              }`}
            />
            <span className="text-sm font-medium truncate">
              {toast.isBatch ? (
                <>Approved {toast.count} high-confidence items</>
              ) : (() => {
                const altIds = toast.payload?.alternatives || []
                const primaryApplied = toast.payload?.primaryApplied || false
                const totalApplied = (primaryApplied ? 1 : 0) + altIds.length
                const altLabel =
                  totalApplied > 1
                    ? `${totalApplied} strategies applied`
                    : altIds.length === 1 && !primaryApplied
                    ? toast.rec.alternatives?.find((a) => a.id === altIds[0])?.toastLabel
                    : null
                return altLabel ? (
                  <>{altLabel} — {toast.rec.room_type}</>
                ) : (
                  <>
                    {toast.status === 'accepted'
                      ? 'Approved'
                      : toast.status === 'dismissed'
                      ? 'Dismissed'
                      : 'Rejected'}{' '}
                    {toast.rec.type === 'channel'
                      ? 'restrictions'
                      : toast.rec.type === 'los'
                      ? 'MNS'
                      : toast.rec.type === 'equity'
                      ? 'allocation pause'
                      : 'rate'}{' '}
                    for {toast.rec.room_type}
                  </>
                )
              })()}
            </span>
          </div>
          <div className="flex items-center space-x-3 border-l border-slate-700 pl-3 shrink-0">
            <button
              onClick={() => onUndo(toast.id)}
              className="text-blue-400 hover:text-blue-300 font-bold text-sm uppercase tracking-wider transition-colors"
            >
              Undo
            </button>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <Icons.X />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
