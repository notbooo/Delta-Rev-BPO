import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'

export default function GlossaryTerm({ term, definition, align = 'center' }) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef(null)

  const getPosition = () => {
    if (!ref.current) return { top: 0, left: 0 }
    const rect = ref.current.getBoundingClientRect()
    const tooltipWidth = 224
    let top = rect.bottom + 8
    let left = rect.left + (rect.width - tooltipWidth) / 2

    // Clamp to viewport with 8px margin
    if (left < 8) left = 8
    if (left + tooltipWidth > window.innerWidth - 8) left = window.innerWidth - tooltipWidth - 8
    // If too close to bottom, show above
    if (top > window.innerHeight - 150) top = rect.top - 150

    return { top: Math.round(top), left: Math.round(left) }
  }

  const pos = isOpen ? getPosition() : { top: 0, left: 0 }

  return (
    <>
      <span
        ref={ref}
        tabIndex={0}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={(e) => { e.preventDefault(); setIsOpen(!isOpen) }}
        onBlur={() => setIsOpen(false)}
        className="border-b-2 border-dotted border-blue-300 cursor-help inline-block transition-colors hover:text-blue-700 focus:text-blue-700 hover:border-blue-500 focus:border-blue-500 outline-none"
      >
        {term}
      </span>
      {isOpen && createPortal(
        <div
          className="fixed w-56 p-3 bg-slate-800 text-white text-xs leading-relaxed rounded-lg shadow-xl pointer-events-none text-left font-normal normal-case tracking-normal z-[9999]"
          style={{ top: `${pos.top}px`, left: `${pos.left}px`, display: pos.top === 0 && pos.left === 0 ? 'none' : 'block' }}
        >
          <span className="block font-bold text-blue-300 mb-1">{term}</span>
          {definition}
        </div>,
        document.body
      )}
    </>
  )
}
