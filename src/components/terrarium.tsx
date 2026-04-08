import * as React from 'react'
import { motion } from 'framer-motion'

import type { CreatureState } from '#schema.ts'
import { Creature } from '#components/creature.tsx'

interface TerrariumProps {
  creatures: CreatureState[]
  selectedId: string | null
  onSelect: (id: string) => void
  onPoke: (id: string, dx: number, dy: number) => void
}

export function Terrarium({ creatures, selectedId, onSelect, onPoke }: TerrariumProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)

  const handleBackgroundClick = React.useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current || !selectedId) return
      const rect = containerRef.current.getBoundingClientRect()
      const clickX = (e.clientX - rect.left) / rect.width
      const clickY = (e.clientY - rect.top) / rect.height

      const creature = creatures.find(c => c.id === selectedId)
      if (!creature || creature.status === 'dead') return

      const dx = clickX - creature.x
      const dy = clickY - creature.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 0.01) return

      const ndx = dx / dist
      const ndy = dy / dist
      onPoke(creature.id, ndx, ndy)
    },
    [selectedId, creatures, onPoke]
  )

  return (
    <div
      ref={containerRef}
      className='terrarium-container relative w-full h-full terrarium-bg rounded-2xl overflow-hidden border border-white/5'
      onClick={handleBackgroundClick}>
      <div
        className='absolute inset-0 opacity-20 pointer-events-none'
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}
      />

      <div
        className='absolute inset-0 pointer-events-none'
        style={{
          background:
            'radial-gradient(ellipse at 50% 100%, rgba(0,255,213,0.03) 0%, transparent 60%)'
        }}
      />

      {creatures.map(creature => (
        <Creature
          key={creature.id}
          creature={creature}
          selected={creature.id === selectedId}
          onClick={() => onSelect(creature.id)}
          onPoke={onPoke}
          containerRef={containerRef}
        />
      ))}

      {creatures.length === 0 && (
        <div className='absolute inset-0 flex items-center justify-center'>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className='text-center'>
            <div className='text-4xl mb-2 opacity-30'>🧬</div>
            <p className='text-white/20 font-display text-sm'>Ecosystem initializing...</p>
          </motion.div>
        </div>
      )}

      <div className='absolute top-3 left-3 glass rounded-lg px-3 py-1.5 pointer-events-none'>
        <span className='text-white/30 text-xs font-display'>
          VIVARIUM <span className='text-biolum/50'>v0.1</span>
        </span>
      </div>

      <div className='absolute bottom-3 left-3 right-3 flex gap-2 pointer-events-none'>
        {creatures
          .filter(c => c.status === 'hibernating')
          .map(c => (
            <div
              key={c.id}
              className='glass rounded-lg px-2 py-1 flex items-center gap-1 cursor-pointer hover:bg-white/5 transition-colors pointer-events-auto'
              onClick={() => onSelect(c.id)}>
              <span className='text-xs'>❄</span>
              <span className='text-blue-300/70 text-xs font-body'>{c.name}</span>
            </div>
          ))}
      </div>

      {selectedId && (
        <div className='absolute bottom-3 right-3 glass rounded-lg px-2.5 py-1 pointer-events-none'>
          <span className='text-white/20 text-[10px] font-body'>
            Click to poke · Double-click creature to nudge
          </span>
        </div>
      )}
    </div>
  )
}
