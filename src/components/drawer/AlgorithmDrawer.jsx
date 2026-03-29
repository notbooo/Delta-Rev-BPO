import { useEffect } from 'react'
import { Icons } from '../common/Icons'
import { ALGORITHM_DEFINITIONS } from '../../constants/algorithmDefinitions'
import ContextualMath from '../recommendation/ContextualMath'
import MathVisualization from '../recommendation/MathVisualization'

export default function AlgorithmDrawer({ modalData, onClose }) {
  const isContextual = typeof modalData === 'object' && modalData !== null
  const algoId = isContextual ? modalData.algoId : modalData
  const rec = isContextual ? modalData.rec : null

  const algo = algoId ? ALGORITHM_DEFINITIONS[algoId] : null

  useEffect(() => {
    if (modalData) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [modalData])

  return (
    <>
      {modalData && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity animate-in fade-in duration-300"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-out ${
          modalData ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {algo && (
          <>
            <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <Icons.Activity />
                </div>
                <h2 className="text-xl font-bold text-slate-800">{algo.name}</h2>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors p-2 rounded-full"
              >
                <Icons.X />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <h3 className="text-sm uppercase tracking-wider font-bold text-slate-500 mb-2">
                How it works
              </h3>
              <p className="text-slate-700 leading-relaxed mb-8">{algo.longDesc}</p>

              <h3 className="text-sm uppercase tracking-wider font-bold text-slate-500 mb-2">
                {isContextual ? 'The math behind this recommendation' : 'Under the hood'}
              </h3>

              {isContextual ? (
                <ContextualMath algoId={algoId} rec={rec} />
              ) : (
                <MathVisualization type={algoId} />
              )}

              <div className="mt-8 bg-blue-50 border border-blue-100 rounded-lg p-5 flex items-start space-x-3">
                <div className="text-blue-500 mt-0.5">
                  <Icons.Info />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-blue-900 mb-1">When to toggle this off?</h4>
                  <p className="text-xs text-blue-800 leading-relaxed">{algo.whenToDisable}</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end shrink-0">
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-slate-800 text-white text-sm font-bold rounded-lg hover:bg-slate-900 transition-colors shadow-sm"
              >
                Got it
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
