import { motion, AnimatePresence } from 'framer-motion'

import type { CreatureState } from '#schema.ts'
import { hslStr, hslStrA, energyColor, statusLabel, formatAmount } from '#lib/utilities.ts'

interface CreatureDetailProps {
  creature: CreatureState | null
  onFeed: () => void
  onTrain: (trait: string) => void
  onWork: () => void
  onRevive: () => void
  onClose: () => void
}

function StatBar({
  label,
  value,
  max = 1,
  color
}: {
  label: string
  value: number
  max?: number
  color: string
}) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div className='mb-2'>
      <div className='flex justify-between text-xs mb-0.5'>
        <span className='text-white/50 font-body'>{label}</span>
        <span className='text-white/70 font-body'>{(value * 100).toFixed(0)}%</span>
      </div>
      <div className='h-1.5 rounded-sm bg-white/5 overflow-hidden'>
        <motion.div
          className='h-full rounded-sm'
          style={{ background: color, boxShadow: `0 0 6px ${color}40` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

export function CreatureDetail({
  creature,
  onFeed,
  onTrain,
  onWork,
  onRevive,
  onClose
}: CreatureDetailProps) {
  if (!creature) return null

  const hue = creature.hue
  const sat = creature.saturation
  const isHibernating = creature.status === 'hibernating'
  const isDead = creature.status === 'dead'
  const isActive = creature.status === 'active'

  return (
    <div
      className='h-full rounded-sm overflow-hidden flex flex-col'
      style={{ background: 'rgba(8, 12, 18, 0.95)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <div
        className='p-5 pb-3'
        style={{
          background: `linear-gradient(135deg, ${hslStrA(hue, sat, 20, 0.3)}, transparent)`
        }}>
        <div className='flex items-start justify-between'>
          <div>
            <h2
              className='font-display font-bold text-xl'
              style={{ color: hslStr(hue, sat, 75) }}>
              {creature.name}
            </h2>
            <div className='flex items-center gap-2 mt-1'>
              <span
                className='text-xs font-body px-2 py-0.5 rounded-sm'
                style={{
                  background: isDead
                    ? 'rgba(255,107,107,0.15)'
                    : isHibernating
                      ? 'rgba(100,150,255,0.15)'
                      : 'rgba(0,255,213,0.15)',
                  color: isDead ? '#ff6b6b' : isHibernating ? '#88aaff' : '#00ffd5'
                }}>
                {statusLabel(creature.status)}
              </span>
              <span className='text-white/30 text-xs font-body'>Gen {creature.generation}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className='text-white/30 hover:text-white/60 transition-colors text-lg'>
            ✕
          </button>
        </div>
      </div>

      <div className='flex-1 overflow-y-auto p-5 pt-2 space-y-5'>
        <div>
          <h3 className='text-white/40 text-xs font-display uppercase tracking-wider mb-2'>
            Vitals
          </h3>
          <div className='space-y-1'>
            <div>
              <div className='flex justify-between text-xs mb-0.5'>
                <span className='text-white/50'>Energy</span>
                <span style={{ color: energyColor(creature.energy) }}>
                  {creature.energy.toFixed(0)}
                </span>
              </div>
              <div className='h-2 rounded-sm bg-white/5 overflow-hidden'>
                <motion.div
                  className='h-full rounded-sm energy-bar'
                  initial={{ width: 0 }}
                  animate={{ width: `${creature.energy}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
            <div>
              <div className='flex justify-between text-xs mb-0.5'>
                <span className='text-white/50'>Health</span>
                <span className='text-emerald-400'>{creature.health.toFixed(0)}</span>
              </div>
              <div className='h-2 rounded-sm bg-white/5 overflow-hidden'>
                <motion.div
                  className='h-full rounded-sm health-bar'
                  initial={{ width: 0 }}
                  animate={{ width: `${creature.health}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
            <div>
              <div className='flex justify-between text-xs mb-0.5'>
                <span className='text-white/50'>Hunger</span>
                <span className={creature.hunger > 70 ? 'text-red-400' : 'text-white/60'}>
                  {creature.hunger.toFixed(0)}
                </span>
              </div>
              <div className='h-2 rounded-sm bg-white/5 overflow-hidden'>
                <motion.div
                  className='h-full rounded-sm'
                  style={{
                    background:
                      creature.hunger > 70
                        ? 'linear-gradient(90deg, #cc4444, #ff6b6b)'
                        : 'linear-gradient(90deg, #cc8a2e, #ffb347)',
                    boxShadow: creature.hunger > 70 ? '0 0 6px rgba(255,107,107,0.3)' : 'none'
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${creature.hunger}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className='text-white/40 text-xs font-display uppercase tracking-wider mb-2'>
            Traits
          </h3>
          <StatBar
            label='Strength'
            value={creature.strength}
            color={hslStr(0, 70, 55)}
          />
          <StatBar
            label='Efficiency'
            value={creature.efficiency}
            color={hslStr(120, 70, 55)}
          />
          <StatBar
            label='Creativity'
            value={creature.creativity}
            color={hslStr(280, 70, 55)}
          />
          <StatBar
            label='Resilience'
            value={creature.resilience}
            color={hslStr(200, 70, 55)}
          />
          <StatBar
            label='Speed'
            value={creature.speed}
            color={hslStr(50, 70, 55)}
          />
        </div>

        <div>
          <h3 className='text-white/40 text-xs font-display uppercase tracking-wider mb-2'>
            Economy
          </h3>
          <div className='grid grid-cols-3 gap-2'>
            <div
              className='bg-white/[0.03] rounded-sm p-2 text-center'
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className='text-biolum font-display font-bold text-sm'>
                {formatAmount(creature.wallet)}
              </div>
              <div className='text-white/30 text-[10px] font-body'>Wallet</div>
            </div>
            <div
              className='bg-white/[0.03] rounded-sm p-2 text-center'
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className='text-success font-display font-bold text-sm'>
                {formatAmount(creature.totalEarned)}
              </div>
              <div className='text-white/30 text-[10px] font-body'>Earned</div>
            </div>
            <div
              className='bg-white/[0.03] rounded-sm p-2 text-center'
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className='text-amber font-display font-bold text-sm'>
                {formatAmount(creature.totalSpent)}
              </div>
              <div className='text-white/30 text-[10px] font-body'>Spent</div>
            </div>
          </div>
        </div>

        <div>
          <h3 className='text-white/40 text-xs font-display uppercase tracking-wider mb-2'>
            Actions
          </h3>
          <div className='space-y-2'>
            {isActive && (
              <>
                <button
                  onClick={onFeed}
                  className='w-full py-2 px-4 rounded-sm bg-white/[0.03] text-sm font-display font-medium transition-all hover:bg-white/[0.06] active:scale-[0.98]'
                  style={{
                    border: `1px solid ${hslStrA(hue, sat, 50, 0.3)}`,
                    color: hslStr(hue, sat, 75)
                  }}>
                  🍃 Feed — $0.01
                </button>
                <button
                  onClick={onWork}
                  className='w-full py-2 px-4 rounded-sm bg-white/[0.03] text-sm font-display font-medium text-amber transition-all hover:bg-white/[0.06] active:scale-[0.98]'
                  style={{ border: '1px solid rgba(255,179,71,0.2)' }}>
                  ⚡ Work — Earn tokens
                </button>
                <div className='grid grid-cols-2 gap-2'>
                  {(['strength', 'efficiency', 'creativity', 'resilience', 'speed'] as const)
                    .slice(0, 4)
                    .map(trait => (
                      <button
                        key={trait}
                        onClick={() => onTrain(trait)}
                        className='py-1.5 px-2 rounded-sm bg-white/[0.03] text-xs font-body text-white/60 hover:text-white/90 hover:bg-white/[0.06] transition-all active:scale-[0.98]'
                        style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                        {trait.charAt(0).toUpperCase() + trait.slice(1)}
                      </button>
                    ))}
                </div>
              </>
            )}
            {isHibernating && (
              <button
                onClick={onRevive}
                className='w-full py-2 px-4 rounded-sm bg-white/[0.03] text-sm font-display font-medium text-blue-300 transition-all hover:bg-white/[0.06] active:scale-[0.98]'
                style={{ border: '1px solid rgba(100,150,255,0.3)' }}>
                🔥 Revive — $0.05
              </button>
            )}
            {isDead && (
              <div className='text-center text-white/30 text-sm py-4 font-body'>
                This creature has perished.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
