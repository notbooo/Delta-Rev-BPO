import { useState } from 'react'
import { Icons } from './components/common/Icons'
import GlossaryTerm from './components/common/GlossaryTerm'
import Sidebar from './components/layout/Sidebar'
import AlgorithmDrawer from './components/drawer/AlgorithmDrawer'
import MorningBriefingView from './views/MorningBriefingView'
import OverviewView from './views/OverviewView'
import PaceForecastView from './views/PaceForecastView'
import SettingsView from './views/SettingsView'
import GlossaryView from './views/GlossaryView'
import { useRecommendations } from './hooks/useRecommendations'
import { formatJPY } from './utils/formatters'

const INITIAL_ALGO_STATE = {
  pace: true,
  elasticity: true,
  overbooking: false,
  los: true,
  anomaly: true,
  displacement: true,
  channel: true,
  equity: true,
  riskTolerance: 'balanced',
}

const TAB_TITLES = {
  briefing: 'Morning Briefing',
  overview: 'Property Overview',
  calendar: 'Pace & Forecast',
  settings: 'Advanced Yield Settings',
  glossary: 'Metrics Glossary',
}

export default function App() {
  const [activeTab, setActiveTab] = useState('briefing')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [modalData, setModalData] = useState(null)
  const [absoluteMinRate, setAbsoluteMinRate] = useState(15000)

  const [algoState, setAlgoState] = useState(INITIAL_ALGO_STATE)

  const {
    recommendations,
    loading,
    toasts,
    handleAction,
    handleBatchApprove,
    handleUndo,
    dismissToast,
    resetQueue,
  } = useRecommendations(algoState)

  const handleToggleAlgo = (algoId) => {
    setAlgoState((prev) => ({ ...prev, [algoId]: !prev[algoId] }))
  }

  const handleRiskChange = (level) => {
    setAlgoState((prev) => ({ ...prev, riskTolerance: level }))
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans selection:bg-blue-200">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <main className="md:ml-64 flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-6 sm:px-8 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 z-10 shrink-0">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden text-slate-500 hover:text-slate-800 p-1 -ml-1"
            >
              <Icons.Menu />
            </button>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                {TAB_TITLES[activeTab]}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* RevPAR summary strip */}
          <div className="flex flex-wrap sm:flex-nowrap gap-4 sm:space-x-8 text-sm bg-slate-50 p-3 rounded-xl border border-slate-100 w-full md:w-auto">
            <div className="text-right relative flex-1 sm:flex-none">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                <GlossaryTerm
                  term="Gross RevPAR"
                  definition="Total room revenue divided by available rooms. (Includes commissions)"
                  align="right"
                />
              </p>
              <p className="font-medium text-slate-500 line-through decoration-slate-300">
                {formatJPY(22450)}
              </p>
            </div>
            <div className="text-right relative pl-4 sm:pl-6 border-l border-slate-200 flex-1 sm:flex-none">
              <p className="text-indigo-600 text-xs font-bold uppercase tracking-wider flex items-center justify-end mb-1">
                <Icons.Shield />
                <span className="ml-1">
                  <GlossaryTerm
                    term="Net RevPAR"
                    definition="True profitability. Revenue remaining after deducting OTA commissions and distribution costs."
                    align="right"
                  />{' '}
                  (MTD)
                </span>
              </p>
              <p className="font-bold text-indigo-900 text-xl">{formatJPY(18840)}</p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 relative">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p>Recalculating Pricing &amp; Channel Matrix based on constraints...</p>
            </div>
          ) : activeTab === 'briefing' ? (
            <MorningBriefingView
              recommendations={recommendations}
              toasts={toasts}
              onAction={handleAction}
              onBatchApprove={handleBatchApprove}
              onUndo={handleUndo}
              onDismissToast={dismissToast}
              onOpenDetails={setModalData}
              absoluteMinRate={absoluteMinRate}
              onNavigateToCalendar={() => setActiveTab('calendar')}
              onResetQueue={resetQueue}
            />
          ) : activeTab === 'settings' ? (
            <SettingsView
              algoState={algoState}
              onToggleAlgo={handleToggleAlgo}
              onRiskChange={handleRiskChange}
              onOpenAlgoInfo={setModalData}
              absoluteMinRate={absoluteMinRate}
              setAbsoluteMinRate={setAbsoluteMinRate}
            />
          ) : activeTab === 'overview' ? (
            <OverviewView />
          ) : activeTab === 'calendar' ? (
            <PaceForecastView />
          ) : activeTab === 'glossary' ? (
            <GlossaryView />
          ) : null}
        </div>
      </main>

      <AlgorithmDrawer modalData={modalData} onClose={() => setModalData(null)} />
    </div>
  )
}
