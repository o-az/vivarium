import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import type { CreatureState } from '#schema.ts'
import { Terrarium } from '#components/terrarium.tsx'
import { useTerrariumState } from '#hooks/use-rivet.ts'
import { ControlPanel } from '#components/control-panel.tsx'
import { EcosystemStats } from '#components/ecosystem-stats.tsx'
import { CreatureDetail } from '#components/creature-detail.tsx'
import { TransactionFeed } from '#components/transaction-feed.tsx'
import { ParticleBackground } from '#components/particle-background.tsx'

function useCreatureUrl() {
  const readCreatureId = React.useCallback(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('creature')
  }, [])

  const setCreatureId = React.useCallback((id: string | null) => {
    const url = new URL(window.location.href)
    if (id) {
      url.searchParams.set('creature', id)
    } else {
      url.searchParams.delete('creature')
    }
    window.history.replaceState(null, '', url.toString())
  }, [])

  const shareUrl = React.useCallback((id: string) => {
    const url = new URL(window.location.href)
    url.searchParams.set('creature', id)
    return url.toString()
  }, [])

  return { readCreatureId, setCreatureId, shareUrl }
}

export default function App() {
  const {
    state: terrariumState,
    events,
    connected,
    spawnCreature,
    breedCreatures,
    feedCreature,
    trainCreature,
    workCreature,
    reviveCreature,
    pokeCreature,
    fetchCreatureStates
  } = useTerrariumState()

  const [creatures, setCreatures] = React.useState<CreatureState[]>([])
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [selectedCreature, setSelectedCreature] = React.useState<CreatureState | null>(null)
  const { readCreatureId, setCreatureId, shareUrl } = useCreatureUrl()
  const initialUrlRef = React.useRef(false)

  const refreshCreatures = React.useCallback(async () => {
    const states = await fetchCreatureStates()
    setCreatures(states)
    if (selectedId) {
      const updated = states.find(c => c.id === selectedId)
      if (updated) setSelectedCreature(updated)
    }
  }, [fetchCreatureStates, selectedId])

  React.useEffect(() => {
    if (terrariumState?.creatures?.length) {
      void refreshCreatures()
    }
  }, [terrariumState?.creatures?.length, terrariumState?.totalTransactions, refreshCreatures])

  React.useEffect(() => {
    const interval = setInterval(refreshCreatures, 3000)
    return () => clearInterval(interval)
  }, [refreshCreatures])

  React.useEffect(() => {
    if (selectedId) {
      const creature = creatures.find(c => c.id === selectedId)
      if (creature) setSelectedCreature(creature)
    }
  }, [creatures, selectedId])

  // Auto-select creature from URL on first load
  React.useEffect(() => {
    if (initialUrlRef.current || creatures.length === 0) return
    initialUrlRef.current = true
    const urlId = readCreatureId()
    if (urlId && creatures.some(c => c.id === urlId)) {
      setSelectedId(urlId)
      setSelectedCreature(creatures.find(c => c.id === urlId) ?? null)
    }
  }, [creatures, readCreatureId])

  // Sync URL when selection changes (skip initial mount before URL read)
  React.useEffect(() => {
    if (!initialUrlRef.current) return
    setCreatureId(selectedId)
  }, [selectedId, setCreatureId])

  const handleSelect = (id: string) => {
    if (selectedId === id) {
      setSelectedId(null)
      setSelectedCreature(null)
    } else {
      setSelectedId(id)
      const creature = creatures.find(c => c.id === id)
      setSelectedCreature(creature ?? null)
    }
  }

  const handleFeed = async () => {
    if (selectedId) {
      await feedCreature(selectedId)
      setTimeout(refreshCreatures, 500)
    }
  }

  const handleTrain = async (trait: string) => {
    if (selectedId) {
      await trainCreature(selectedId, trait)
      setTimeout(refreshCreatures, 500)
    }
  }

  const handleWork = async () => {
    if (selectedId) {
      await workCreature(selectedId)
      setTimeout(refreshCreatures, 500)
    }
  }

  const handleRevive = async () => {
    if (selectedId) {
      await reviveCreature(selectedId)
      setTimeout(refreshCreatures, 500)
    }
  }

  const handleSpawn = async (name?: string) => {
    await spawnCreature(name)
    setTimeout(refreshCreatures, 1000)
  }

  const handleBreed = async (p1: string, p2: string) => {
    await breedCreatures(p1, p2)
    setTimeout(refreshCreatures, 2000)
  }

  const handlePoke = async (id: string, dx: number, dy: number) => {
    await pokeCreature(id, dx, dy)
    setCreatures(prev =>
      prev.map(c =>
        c.id === id
          ? {
              ...c,
              vx: c.vx + dx * 0.025 * c.size,
              vy: c.vy + dy * 0.025 * c.size,
              x: Math.max(0.05, Math.min(0.95, c.x + dx * 0.06)),
              y: Math.max(0.05, Math.min(0.95, c.y + dy * 0.06))
            }
          : c
      )
    )
    if (id === selectedId) {
      setSelectedCreature(prev =>
        prev
          ? {
              ...prev,
              x: Math.max(0.05, Math.min(0.95, prev.x + dx * 0.06)),
              y: Math.max(0.05, Math.min(0.95, prev.y + dy * 0.06))
            }
          : null
      )
    }
  }

  const handleCloseDetail = () => {
    setSelectedId(null)
    setSelectedCreature(null)
  }

  return (
    <div className='h-screen w-screen flex overflow-hidden'>
      <ParticleBackground />

      <div className='relative z-10 flex w-full h-full'>
        {/* Left sidebar — creature detail */}
        <AnimatePresence initial={false}>
          {selectedCreature && (
            <motion.div
              key='left-sidebar'
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 288, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className='shrink-0 overflow-hidden'
              style={{ width: 288 }}>
              <div className='w-72 h-full p-4 pr-0'>
                <CreatureDetail
                  creature={selectedCreature}
                  onFeed={handleFeed}
                  onTrain={handleTrain}
                  onWork={handleWork}
                  onRevive={handleRevive}
                  onClose={handleCloseDetail}
                  shareUrl={selectedId ? shareUrl(selectedId) : undefined}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center — terrarium */}
        <div className='flex-1 p-4 flex flex-col min-w-0'>
          <div className='flex items-center justify-between mb-3'>
            <div>
              <h1 className='font-display font-bold text-2xl tracking-tight'>
                <span className='text-biolum'>Vivarium</span>
              </h1>
              <p className='text-white/25 text-xs font-body mt-0.5'>
                Living Digital Ecosystem — Powered by Rivet Actors + MPP
              </p>
            </div>
            <motion.div
              className='flex items-center gap-1.5'
              animate={connected ? { opacity: 1 } : { opacity: [0.5, 1, 0.5] }}
              transition={connected ? { duration: 0 } : { duration: 2, repeat: Infinity }}>
              <div className={`w-2 h-2 rounded-full ${!connected ? 'bg-amber' : 'bg-biolum'}`} />
              <span className='text-xs font-body text-white/30'>
                {!connected ? 'Connecting...' : 'Live'}
              </span>
            </motion.div>
          </div>

          <div className='flex-1 min-h-0 select-none'>
            <Terrarium
              creatures={creatures}
              selectedId={selectedId}
              onSelect={handleSelect}
              onPoke={handlePoke}
            />
          </div>
        </div>

        {/* Right sidebar — ecosystem, controls, feed */}
        <div className='w-72 shrink-0 p-4 pl-0 flex flex-col gap-3 overflow-y-auto'>
          <EcosystemStats
            terrarium={terrariumState}
            creatures={creatures}
          />
          <ControlPanel
            creatures={creatures}
            onSpawn={handleSpawn}
            onBreed={handleBreed}
            selectedId={selectedId}
          />
          <div className='flex-1 min-h-0'>
            <TransactionFeed events={events} />
          </div>
        </div>
      </div>
    </div>
  )
}
