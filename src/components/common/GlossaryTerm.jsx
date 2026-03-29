import { useState } from 'react'

export default function GlossaryTerm({ term, definition, align = 'center' }) {
  const [isOpen, setIsOpen] = useState(false)

  const alignmentClasses =
    align === 'right'
      ? 'right-0 translate-x-0'
      : align === 'left'
      ? 'left-0 translate-x-0'
      : 'left-1/2 -translate-x-1/2'

  const arrowClasses =
    align === 'right'
      ? 'right-4 translate-x-0'
      : align === 'left'
      ? 'left-4 translate-x-0'
      : 'left-1/2 -translate-x-1/2'

  return (
    <span
      tabIndex={0}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onClick={(e) => { e.preventDefault(); setIsOpen(!isOpen) }}
      onBlur={() => setIsOpen(false)}
      className="border-b-2 border-dotted border-blue-300 cursor-help relative inline-block transition-colors hover:text-blue-700 focus:text-blue-700 hover:border-blue-500 focus:border-blue-500 z-10 outline-none"
    >
      {term}
      <span
        className={`absolute top-full ${alignmentClasses} mt-2 w-56 p-3 bg-slate-800 text-white text-xs leading-relaxed rounded-lg shadow-xl transition-all duration-200 pointer-events-none text-left font-normal normal-case tracking-normal block z-[70] ${
          isOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-1'
        }`}
      >
        <span className="block font-bold text-blue-300 mb-1">{term}</span>
        {definition}
        <span
          className={`absolute bottom-full ${arrowClasses} border-4 border-transparent border-b-slate-800 block`}
        />
      </span>
    </span>
  )
}
