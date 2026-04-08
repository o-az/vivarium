import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import type { CreatureState } from '#schema.ts'

interface ControlPanelProps {
  creatures: CreatureState[]
  onSpawn: (name?: string) => void
  onBreed: (parent1: string, parent2: string) => void
  selectedId: string | null
}

export function ControlPanel({ creatures, onSpawn, onBreed, selectedId }: ControlPanelProps) {
  const [showBreed, setShowBreed] = React.useState(false)
  const [parent1, setParent1] = React.useState<string | null>(null)
  const [parent2, setParent2] = React.useState<string | null>(null)
  const [spawnName, setSpawnName] = React.useState('')

  const activeCreatures = creatures.filter(c => c.status === 'active')

  return (
    <div
      className='bg-white/[0.03] rounded-sm p-4'
      style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
      <h3 className='text-white/40 text-xs font-display uppercase tracking-wider mb-3'>Controls</h3>

      <div className='space-y-2'>
        <div className='flex gap-2 items-stretch'>
          <input
            type='text'
            value={spawnName}
            onChange={e => setSpawnName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                onSpawn(spawnName || undefined)
                setSpawnName('')
              }
            }}
            placeholder='Name (optional)'
            className='flex-1 min-w-0 bg-white/5 border border-white/10 rounded-sm px-3 py-2 text-sm text-white placeholder-white/20 font-body focus:outline-none focus:border-biolum/40 transition-colors'
          />
          <button
            onClick={() => {
              onSpawn(spawnName || undefined)
              setSpawnName('')
            }}
            className='shrink-0 px-5 py-2 rounded-sm text-sm font-display font-semibold whitespace-nowrap transition-all hover:scale-[1.02] active:scale-[0.98]'
            style={{
              background: 'linear-gradient(135deg, rgba(0,255,213,0.15), rgba(0,255,213,0.05))',
              border: '1px solid rgba(0,255,213,0.2)',
              color: '#00ffd5'
            }}>
            + Spawn
          </button>
        </div>

        <button
          onClick={() => setShowBreed(!showBreed)}
          className='w-full py-2 px-3 rounded-sm text-sm font-display text-purple-300 transition-all hover:scale-[1.01] active:scale-[0.99]'
          style={{
            background: 'rgba(192,132,252,0.06)',
            border: '1px solid rgba(192,132,252,0.15)'
          }}>
          🧬 Breed Creatures
        </button>

        <AnimatePresence>
          {showBreed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className='overflow-hidden'>
              <div className='space-y-2 pt-1'>
                <div>
                  <label className='text-white/30 text-xs font-body'>Parent 1</label>
                  <select
                    value={parent1 || ''}
                    onChange={e => setParent1(e.target.value || null)}
                    className='w-full mt-0.5 bg-void-light border border-white/10 rounded-sm px-2 py-1.5 text-sm text-white font-body focus:outline-none focus:border-purple-400/40'>
                    <option value=''>Select...</option>
                    {activeCreatures.map(c => (
                      <option
                        key={c.id}
                        value={c.id}>
                        {c.name} (Gen {c.generation})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className='text-white/30 text-xs font-body'>Parent 2</label>
                  <select
                    value={parent2 || ''}
                    onChange={e => setParent2(e.target.value || null)}
                    className='w-full mt-0.5 bg-void-light border border-white/10 rounded-sm px-2 py-1.5 text-sm text-white font-body focus:outline-none focus:border-purple-400/40'>
                    <option value=''>Select...</option>
                    {activeCreatures
                      .filter(c => c.id !== parent1)
                      .map(c => (
                        <option
                          key={c.id}
                          value={c.id}>
                          {c.name} (Gen {c.generation})
                        </option>
                      ))}
                  </select>
                </div>
                <button
                  onClick={() => {
                    if (parent1 && parent2) {
                      onBreed(parent1, parent2)
                      setParent1(null)
                      setParent2(null)
                      setShowBreed(false)
                    }
                  }}
                  disabled={!parent1 || !parent2}
                  className='w-full py-1.5 rounded-sm text-sm font-display font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed'
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(192,132,252,0.15), rgba(192,132,252,0.05))',
                    border: '1px solid rgba(192,132,252,0.2)',
                    color: '#c084fc'
                  }}>
                  Breed 💰 $0.01 split
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {selectedId && (
        <div className='mt-3 pt-3 border-t border-white/5'>
          <p className='text-white/30 text-xs font-body'>
            Selected: <span className='text-white/50'>{selectedId}</span>
          </p>
        </div>
      )}
    </div>
  )
}
