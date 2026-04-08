import { motion, AnimatePresence } from 'framer-motion'

import { timeAgo } from '#lib/utilities.ts'
import type { TerrariumEvent } from '#schema.ts'

interface TransactionFeedProps {
  events: TerrariumEvent[]
}

const EVENT_ICONS: Record<string, string> = {
  feed: '🍃',
  breed: '🧬',
  trade: '💰',
  birth: '✨',
  hibernate: '❄',
  wake: '🔥',
  death: '💀',
  work: '⚡',
  revive: '💫'
}

const EVENT_COLORS: Record<string, string> = {
  feed: '#00ffd5',
  breed: '#c084fc',
  trade: '#ffb347',
  birth: '#4ade80',
  hibernate: '#88aaff',
  wake: '#ff8844',
  death: '#ff6b6b',
  work: '#fbbf24',
  revive: '#88ddff'
}

export function TransactionFeed({ events }: TransactionFeedProps) {
  const recent = events.slice(-8).reverse()

  return (
    <div className='glass rounded-xl p-3 h-full flex flex-col'>
      <h3 className='text-white/40 text-xs font-display uppercase tracking-wider mb-2 shrink-0'>
        Live Feed
      </h3>
      <div className='flex-1 overflow-y-auto space-y-1.5 min-h-0'>
        <AnimatePresence initial={false}>
          {recent.map((evt, i) => (
            <motion.div
              key={evt.id}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className='flex items-start gap-2 py-1'>
              <span className='text-sm shrink-0 mt-0.5'>{EVENT_ICONS[evt.type] || '•'}</span>
              <div className='flex-1 min-w-0'>
                <p className='text-xs text-white/70 font-body leading-tight truncate'>
                  {evt.description}
                </p>
                <p
                  className='text-[10px] font-body mt-0.5'
                  style={{ color: EVENT_COLORS[evt.type] || '#666' }}>
                  {evt.type.toUpperCase()} · {timeAgo(evt.timestamp)}
                </p>
              </div>
              {evt.amount !== undefined && (
                <span className='text-xs text-biolum font-display shrink-0'>
                  ${evt.amount.toFixed(4)}
                </span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {recent.length === 0 && (
          <p className='text-white/20 text-xs font-body text-center py-4'>
            Waiting for activity...
          </p>
        )}
      </div>
    </div>
  )
}
