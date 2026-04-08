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
  const [zoom, setZoom] = React.useState(1)
  const [pan, setPan] = React.useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = React.useState(false)
  const panStart = React.useRef({ x: 0, y: 0, panX: 0, panY: 0 })

  const handleWheel = React.useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    setZoom(prev => {
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      return Math.min(5, Math.max(0.3, prev * delta))
    })
  }, [])

  const handleMouseDown = React.useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return
      setIsPanning(true)
      panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y }
    },
    [pan]
  )

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent) => {
      if (!isPanning) return
      const dx = e.clientX - panStart.current.x
      const dy = e.clientY - panStart.current.y
      setPan({ x: panStart.current.panX + dx, y: panStart.current.panY + dy })
    },
    [isPanning]
  )

  const handleMouseUp = React.useCallback(() => {
    setIsPanning(false)
  }, [])

  const handleBackgroundClick = React.useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current || !selectedId) return
      const rect = containerRef.current.getBoundingClientRect()
      const cx = rect.width / 2 + pan.x
      const cy = rect.height / 2 + pan.y
      const clickX = (e.clientX - cx) / zoom / (rect.width / zoom) + 0.5
      const clickY = (e.clientY - cy) / zoom / (rect.height / zoom) + 0.5

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
    [selectedId, creatures, onPoke, zoom, pan]
  )

  const resetView = React.useCallback(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [])

  return (
    <div
      ref={containerRef}
      className='terrarium-container relative w-full h-full terrarium-bg rounded-sm overflow-hidden border border-white/5'
      style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={isPanning ? undefined : handleBackgroundClick}>
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

      {/* Zoomable/pannable layer */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          transition: isPanning ? 'none' : 'transform 0.15s ease-out'
        }}>
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
      </div>

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

      <div className='absolute top-3 left-3 glass rounded-sm px-3 py-1.5 pointer-events-none'>
        <span className='text-white/30 text-xs font-display'>
          VIVARIUM <span className='text-biolum/50'>v0.1</span>
        </span>
      </div>

      {/* Zoom controls */}
      <div className='absolute top-3 right-3 flex items-center gap-1'>
        <button
          onClick={() => setZoom(z => Math.min(5, z * 1.2))}
          className='glass rounded-sm w-7 h-7 flex items-center justify-center text-white/40 hover:text-white/70 text-sm transition-colors'>
          +
        </button>
        <button
          onClick={() => setZoom(z => Math.max(0.3, z / 1.2))}
          className='glass rounded-sm w-7 h-7 flex items-center justify-center text-white/40 hover:text-white/70 text-sm transition-colors'>
          −
        </button>
        <button
          onClick={resetView}
          className='glass rounded-sm px-2 h-7 flex items-center justify-center text-white/40 hover:text-white/70 text-[10px] font-body transition-colors'>
          {Math.round(zoom * 100)}%
        </button>
      </div>

      <div className='absolute bottom-3 left-3 right-3 flex gap-2 pointer-events-none'>
        {creatures
          .filter(c => c.status === 'hibernating')
          .map(c => (
            <div
              key={c.id}
              className='glass rounded-sm px-2 py-1 flex items-center gap-1 cursor-pointer hover:bg-white/5 transition-colors pointer-events-auto'
              onClick={() => onSelect(c.id)}>
              <span className='text-xs'>❄</span>
              <span className='text-blue-300/70 text-xs font-body'>{c.name}</span>
            </div>
          ))}
      </div>

      {selectedId && (
        <div className='absolute bottom-3 right-3 glass rounded-sm px-2.5 py-1 pointer-events-none'>
          <span className='text-white/20 text-[10px] font-body'>
            Click to poke · Scroll to zoom · Drag to pan
          </span>
        </div>
      )}
    </div>
  )
}
