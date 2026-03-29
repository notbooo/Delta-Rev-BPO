import { Icons } from '../common/Icons'

const NAV_ITEMS = [
  { id: 'briefing', label: 'Morning Briefing', icon: Icons.Inbox },
  { id: 'overview', label: 'Overview', icon: Icons.Activity },
  { id: 'calendar', label: 'Pace & Forecast', icon: Icons.Calendar },
  { id: 'settings', label: 'Algorithm Settings', icon: Icons.Settings },
  { id: 'glossary', label: 'Metrics Glossary', icon: Icons.BookOpen },
]

export default function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen }) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-[70] md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`w-64 bg-slate-900 text-slate-300 flex flex-col h-screen fixed inset-y-0 left-0 z-[80] transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h1 className="text-white font-bold text-xl tracking-tight">Tokyo Sakura RMS</h1>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">
              GM Prototype v3.5
            </p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden text-slate-400 hover:text-white"
          >
            <Icons.X />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setIsOpen(false) }}
              className={`w-full flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === item.id
                  ? 'bg-blue-600/10 text-blue-400 border-r-2 border-blue-500'
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="mr-3">
                <item.icon />
              </span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-6 border-t border-slate-800">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-sm">
              GM
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">Kenji Sato</p>
              <p className="text-xs text-slate-500">Property Manager</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
