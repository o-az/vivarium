import * as React from 'react'
import { motion } from 'framer-motion'

import type { CreatureState } from '#schema.ts'
import { generateBlobPath, hslStr, hslStrA } from '#lib/utilities.ts'

interface CreatureProps {
  creature: CreatureState
  selected: boolean
  onClick: () => void
  onPoke: (id: string, dx: number, dy: number) => void
  containerRef?: React.RefObject<HTMLDivElement | null>
}

export function Creature({ creature, selected, onClick, onPoke, containerRef }: CreatureProps) {
  const seed = creature.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const blobPath = generateBlobPath(seed, creature.size, creature.creativity)
  const innerPath = generateBlobPath(seed + 100, creature.size * 0.5, creature.creativity * 0.5)

  const hue = creature.hue
  const sat = creature.saturation
  const isHibernating = creature.status === 'hibernating'
  const isDead = creature.status === 'dead'

  const baseLightness = isHibernating ? 25 : isDead ? 15 : 50
  const glowOpacity = isHibernating ? 0.2 : isDead ? 0.05 : 0.6

  const [squish, setSquish] = React.useState({ scale: 1, rotate: 0 })

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (isDead || !containerRef?.current) return
    e.stopPropagation()

    const rect = containerRef.current.getBoundingClientRect()
    const clickX = (e.clientX - rect.left) / rect.width
    const clickY = (e.clientY - rect.top) / rect.height

    const dx = clickX - creature.x
    const dy = clickY - creature.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < 0.01) return

    const ndx = dx / dist
    const ndy = dy / dist

    setSquish({ scale: 1.2, rotate: ndx * 10 })
    setTimeout(() => setSquish({ scale: 1, rotate: 0 }), 180)

    onPoke(creature.id, ndx, ndy)
  }

  return (
    <motion.div
      className='absolute cursor-pointer select-none'
      animate={{
        left: `${creature.x * 100}%`,
        top: `${creature.y * 100}%`,
        scale: squish.scale,
        rotate: squish.rotate
      }}
      style={{
        x: '-50%',
        y: '-50%',
        zIndex: selected ? 20 : 10
      }}
      transition={{
        left: { type: 'spring', stiffness: 80, damping: 18, mass: 0.6 },
        top: { type: 'spring', stiffness: 80, damping: 18, mass: 0.6 },
        scale: { type: 'spring', stiffness: 500, damping: 12 },
        rotate: { type: 'spring', stiffness: 500, damping: 12 }
      }}
      onClick={e => {
        e.stopPropagation()
        onClick()
      }}
      onDoubleClick={handleDoubleClick}>
      <motion.div
        className={isHibernating ? 'animate-frost' : isDead ? '' : 'animate-breathe'}
        style={{ animationDuration: `${2 + creature.efficiency * 3}s` }}>
        <motion.div
          className={isDead ? '' : 'animate-drift'}
          style={{
            animationDuration: `${5 + (1 - creature.speed) * 5}s`,
            animationDelay: `${seed % 3}s`
          }}>
          <svg
            viewBox='0 0 100 100'
            className='drop-shadow-lg'
            style={{
              width: `${60 + creature.size * 30}px`,
              height: `${60 + creature.size * 30}px`,
              filter: isDead
                ? 'grayscale(1) brightness(0.3)'
                : isHibernating
                  ? 'brightness(0.5) saturate(0.3)'
                  : `drop-shadow(0 0 ${selected ? 20 : 12}px ${hslStrA(hue, sat, 50, glowOpacity)})`,
              transition: 'filter 0.3s ease'
            }}>
            <defs>
              <radialGradient id={`glow-${creature.id}`}>
                <stop
                  offset='0%'
                  stopColor={hslStr(hue, sat, 70)}
                  stopOpacity='0.8'
                />
                <stop
                  offset='100%'
                  stopColor={hslStr(hue, sat, 30)}
                  stopOpacity='0'
                />
              </radialGradient>
              <radialGradient id={`body-${creature.id}`}>
                <stop
                  offset='0%'
                  stopColor={hslStr(hue, sat, baseLightness + 20)}
                />
                <stop
                  offset='60%'
                  stopColor={hslStr(hue, sat, baseLightness)}
                />
                <stop
                  offset='100%'
                  stopColor={hslStr(hue, sat, baseLightness - 15)}
                />
              </radialGradient>
              <radialGradient id={`core-${creature.id}`}>
                <stop
                  offset='0%'
                  stopColor={hslStr(hue, sat, 85)}
                  stopOpacity='0.9'
                />
                <stop
                  offset='100%'
                  stopColor={hslStr(hue, sat, 60)}
                  stopOpacity='0.3'
                />
              </radialGradient>
              <filter id={`blur-${creature.id}`}>
                <feGaussianBlur stdDeviation='3' />
              </filter>
            </defs>

            {!isDead && (
              <path
                d={blobPath}
                fill={`url(#glow-${creature.id})`}
                filter={`url(#blur-${creature.id})`}
                opacity={glowOpacity * 0.5}
                style={{ transform: 'scale(1.4)', transformOrigin: '50% 50%' }}
              />
            )}

            <path
              d={blobPath}
              fill={`url(#body-${creature.id})`}
              stroke={hslStrA(hue, sat, 60, 0.3)}
              strokeWidth='0.5'
            />

            {!isDead && !isHibernating && (
              <path
                d={innerPath}
                fill={`url(#core-${creature.id})`}
                opacity={0.6}
              />
            )}

            {!isDead && (
              <>
                <circle
                  cx={40 + (seed % 5)}
                  cy={42}
                  r={3 + creature.creativity * 2}
                  fill={hslStr(hue, 20, 90)}
                  opacity={0.9}
                />
                <circle
                  cx={60 + (seed % 3)}
                  cy={42}
                  r={3 + creature.creativity * 2}
                  fill={hslStr(hue, 20, 90)}
                  opacity={0.9}
                />
                <circle
                  cx={40 + (seed % 5) + 1}
                  cy={41}
                  r={1.5 + creature.creativity}
                  fill='#111'
                />
                <circle
                  cx={61 + (seed % 3)}
                  cy={41}
                  r={1.5 + creature.creativity}
                  fill='#111'
                />
              </>
            )}

            {!isDead && creature.energy > 20 && (
              <ellipse
                cx={50}
                cy={58 + creature.size * 3}
                rx={6 + creature.strength * 4}
                ry={2 + creature.strength * 2}
                fill={hslStrA(hue, sat, 60, 0.5)}
              />
            )}
          </svg>
        </motion.div>
      </motion.div>

      <div
        className='text-center mt-1 text-xs font-display font-medium truncate max-w-24 select-none'
        style={{
          color: isDead ? '#555' : hslStr(hue, sat, 70),
          textShadow: isDead ? 'none' : `0 0 10px ${hslStrA(hue, sat, 50, 0.5)}`
        }}>
        {creature.name}
      </div>

      {!isDead && (
        <div className='flex justify-center gap-0.5 mt-0.5'>
          <div
            className='h-0.5 rounded-full transition-all duration-500'
            style={{
              width: `${creature.energy * 0.3}px`,
              background:
                creature.energy > 60 ? '#00ffd5' : creature.energy > 30 ? '#ffb347' : '#ff6b6b',
              boxShadow: `0 0 4px ${creature.energy > 60 ? 'rgba(0,255,213,0.5)' : creature.energy > 30 ? 'rgba(255,179,71,0.5)' : 'rgba(255,107,107,0.5)'}`
            }}
          />
        </div>
      )}
    </motion.div>
  )
}
