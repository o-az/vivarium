import type { TerrariumState, CreatureState } from '#schema.ts'

interface EcosystemStatsProps {
  terrarium: TerrariumState | null
  creatures: CreatureState[]
}

export function EcosystemStats({ terrarium, creatures }: EcosystemStatsProps) {
  const activeCount = creatures.filter(c => c.status === 'active').length
  const hibernatingCount = creatures.filter(c => c.status === 'hibernating').length
  const _deadCount = creatures.filter(c => c.status === 'dead').length
  const totalWealth = creatures.reduce((sum, c) => sum + c.wallet, 0)
  const avgEnergy =
    creatures.length > 0
      ? creatures.filter(c => c.status !== 'dead').reduce((sum, c) => sum + c.energy, 0) /
        Math.max(1, creatures.filter(c => c.status !== 'dead').length)
      : 0

  return (
    <div className='glass rounded-xl p-4'>
      <h3 className='text-white/40 text-xs font-display uppercase tracking-wider mb-3'>
        Ecosystem
      </h3>
      <div className='grid grid-cols-2 gap-2'>
        <div className='glass rounded-lg p-2.5'>
          <div className='text-biolum font-display font-bold text-lg'>{activeCount}</div>
          <div className='text-white/30 text-[10px] font-body'>Active</div>
        </div>
        <div className='glass rounded-lg p-2.5'>
          <div className='text-blue-300 font-display font-bold text-lg'>{hibernatingCount}</div>
          <div className='text-white/30 text-[10px] font-body'>Hibernating</div>
        </div>
        <div className='glass rounded-lg p-2.5'>
          <div className='text-amber font-display font-bold text-lg'>{totalWealth.toFixed(2)}</div>
          <div className='text-white/30 text-[10px] font-body'>Total Wealth</div>
        </div>
        <div className='glass rounded-lg p-2.5'>
          <div className='text-success font-display font-bold text-lg'>{avgEnergy.toFixed(0)}</div>
          <div className='text-white/30 text-[10px] font-body'>Avg Energy</div>
        </div>
      </div>
      {terrarium && (
        <div className='mt-2 pt-2 border-t border-white/5'>
          <div className='flex justify-between text-xs'>
            <span className='text-white/30 font-body'>Transactions</span>
            <span className='text-white/50 font-body'>{terrarium.totalTransactions}</span>
          </div>
          <div className='flex justify-between text-xs mt-0.5'>
            <span className='text-white/30 font-body'>Max Generation</span>
            <span className='text-purple-300 font-body'>Gen {terrarium.maxGeneration}</span>
          </div>
          <div className='flex justify-between text-xs mt-0.5'>
            <span className='text-white/30 font-body'>Environment</span>
            <span
              className='font-body'
              style={{
                color:
                  terrarium.environmentHealth > 70
                    ? '#4ade80'
                    : terrarium.environmentHealth > 40
                      ? '#ffb347'
                      : '#ff6b6b'
              }}>
              {terrarium.environmentHealth.toFixed(0)}%
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
