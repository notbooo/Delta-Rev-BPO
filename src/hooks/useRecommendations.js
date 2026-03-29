import { useState, useEffect } from 'react'
import { generateMockRecommendations } from '../data/mockRecommendations'

export function useRecommendations(algoState) {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => {
      setRecommendations(generateMockRecommendations(algoState))
      setLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [algoState])

  const handleAction = (id, status, payload) => {
    const targetRec = recommendations.find((r) => r.id === id)

    setRecommendations((prev) =>
      prev.map((rec) => (rec.id === id ? { ...rec, status, action_payload: payload } : rec))
    )

    const toastId = Date.now() + Math.random()
    setToasts((prev) => [
      ...prev,
      { id: toastId, rec: targetRec, status, payload, isBatch: false },
    ])
    setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== toastId))
    }, 6000)
  }

  const handleBatchApprove = () => {
    const highConfPending = recommendations.filter(
      (r) => r.status === 'pending' && r.confidence.level === 'High'
    )
    if (highConfPending.length === 0) return

    setRecommendations((prev) =>
      prev.map((rec) => {
        if (rec.status === 'pending' && rec.confidence.level === 'High') {
          return { ...rec, status: 'accepted', action_payload: { batch: true } }
        }
        return rec
      })
    )

    const toastId = Date.now() + Math.random()
    setToasts((prev) => [
      ...prev,
      { id: toastId, isBatch: true, count: highConfPending.length, status: 'accepted', recs: highConfPending },
    ])
    setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== toastId))
    }, 6000)
  }

  const handleUndo = (toastId) => {
    const targetToast = toasts.find((t) => t.id === toastId)
    if (!targetToast) return

    if (targetToast.isBatch) {
      const idsToUndo = targetToast.recs.map((r) => r.id)
      setRecommendations((prev) =>
        prev.map((r) =>
          idsToUndo.includes(r.id) ? { ...r, status: 'pending', action_payload: undefined } : r
        )
      )
    } else {
      setRecommendations((prev) =>
        prev.map((r) =>
          r.id === targetToast.rec.id ? { ...r, status: 'pending', action_payload: undefined } : r
        )
      )
    }

    setToasts((prev) => prev.filter((t) => t.id !== toastId))
  }

  const dismissToast = (toastId) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId))
  }

  const resetQueue = () => {
    setRecommendations(generateMockRecommendations(algoState))
  }

  return {
    recommendations,
    loading,
    toasts,
    handleAction,
    handleBatchApprove,
    handleUndo,
    dismissToast,
    resetQueue,
  }
}
