import { actor } from 'rivetkit'

import { CREATURE_NAMES, type CreatureState } from '#schema.ts'

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

export const creature = actor({
  createState: (
    c,
    input: { name?: string; parent1?: CreatureState; parent2?: CreatureState }
  ): CreatureState => {
    const id = c.key.join('-')
    const rng = seededRandom(hashString(id) + Date.now())

    const name = input.name || CREATURE_NAMES[Math.floor(rng() * CREATURE_NAMES.length)]

    let strength = 0.3 + rng() * 0.4
    let efficiency = 0.3 + rng() * 0.4
    let creativity = 0.3 + rng() * 0.4
    let resilience = 0.3 + rng() * 0.4
    let speed = 0.3 + rng() * 0.4
    let hue = rng() * 360
    let saturation = 60 + rng() * 30
    let pattern = Math.floor(rng() * 5)
    let size = 0.8 + rng() * 0.4
    let generation = 1

    if (input.parent1 && input.parent2) {
      generation = Math.max(input.parent1.generation, input.parent2.generation) + 1
      strength = (input.parent1.strength + input.parent2.strength) / 2 + (rng() - 0.5) * 0.2
      efficiency = (input.parent1.efficiency + input.parent2.efficiency) / 2 + (rng() - 0.5) * 0.2
      creativity = (input.parent1.creativity + input.parent2.creativity) / 2 + (rng() - 0.5) * 0.2
      resilience = (input.parent1.resilience + input.parent2.resilience) / 2 + (rng() - 0.5) * 0.2
      speed = (input.parent1.speed + input.parent2.speed) / 2 + (rng() - 0.5) * 0.2
      hue = (input.parent1.hue + input.parent2.hue) / 2 + (rng() - 0.5) * 60
      saturation = (input.parent1.saturation + input.parent2.saturation) / 2 + (rng() - 0.5) * 10
      pattern = rng() > 0.5 ? input.parent1.pattern : input.parent2.pattern
      size = (input.parent1.size + input.parent2.size) / 2 + (rng() - 0.5) * 0.2
    }

    strength = Math.max(0.1, Math.min(1, strength))
    efficiency = Math.max(0.1, Math.min(1, efficiency))
    creativity = Math.max(0.1, Math.min(1, creativity))
    resilience = Math.max(0.1, Math.min(1, resilience))
    speed = Math.max(0.1, Math.min(1, speed))
    hue = ((hue % 360) + 360) % 360
    size = Math.max(0.5, Math.min(1.5, size))

    return {
      id,
      name,
      generation,
      bornAt: Date.now(),
      parentId1: input.parent1?.id ?? null,
      parentId2: input.parent2?.id ?? null,
      strength,
      efficiency,
      creativity,
      resilience,
      speed,
      health: 100,
      energy: 80,
      hunger: 0,
      wallet: generation === 1 ? 1.0 : 0.5,
      totalEarned: 0,
      totalSpent: 0,
      hue,
      saturation,
      pattern,
      size,
      status: 'active',
      lastFedAt: Date.now(),
      lastActiveAt: Date.now(),
      x: 0.1 + rng() * 0.8,
      y: 0.1 + rng() * 0.8,
      vx: (rng() - 0.5) * 0.02,
      vy: (rng() - 0.5) * 0.02
    }
  },

  onWake: c => {
    void c.schedule.after(3000, 'tick')
  },

  actions: {
    tick: c => {
      if (c.state.status === 'dead') return

      const now = Date.now()

      const metabolismRate = 0.5 + (1 - c.state.efficiency) * 1.5
      c.state.energy = Math.max(0, c.state.energy - metabolismRate)
      c.state.hunger = Math.min(100, c.state.hunger + metabolismRate * 0.8)
      c.state.health = Math.min(100, c.state.health + c.state.resilience * 0.1)

      if (c.state.energy <= 0 && c.state.status === 'active') {
        c.state.status = 'hibernating'
        c.broadcast('stateChanged', c.state)
        void c.schedule.after(10000, 'tick')
        return
      }

      if (c.state.hunger > 80) {
        c.state.health = Math.max(0, c.state.health - 1)
      }

      c.state.vx += (Math.random() - 0.5) * 0.005 * c.state.speed
      c.state.vy += (Math.random() - 0.5) * 0.005 * c.state.speed
      c.state.vx *= 0.95
      c.state.vy *= 0.95
      c.state.x = Math.max(0.05, Math.min(0.95, c.state.x + c.state.vx))
      c.state.y = Math.max(0.05, Math.min(0.95, c.state.y + c.state.vy))

      if (c.state.status === 'hibernating' && c.state.energy > 20) {
        c.state.status = 'active'
      }

      c.state.lastActiveAt = now
      c.broadcast('stateChanged', c.state)

      const tickInterval = c.state.status === 'hibernating' ? 10000 : 3000
      void c.schedule.after(tickInterval, 'tick')
    },

    feed: (c, amount: number = 0.01) => {
      if (c.state.status === 'dead') return { success: false, reason: 'dead' }

      const energyGain = amount * 5000
      c.state.energy = Math.min(100, c.state.energy + energyGain)
      c.state.hunger = Math.max(0, c.state.hunger - energyGain * 0.5)
      c.state.health = Math.min(100, c.state.health + 5)
      c.state.wallet -= amount
      c.state.totalSpent += amount
      c.state.lastFedAt = Date.now()

      if (c.state.status === 'hibernating' && c.state.energy > 20) {
        c.state.status = 'active'
      }

      c.broadcast('transaction', { type: 'feed', amount, to: c.state.id })
      c.broadcast('stateChanged', c.state)
      return { success: true, energy: c.state.energy }
    },

    train: (
      c,
      trait: 'strength' | 'efficiency' | 'creativity' | 'resilience' | 'speed',
      amount: number = 0.01
    ) => {
      if (c.state.status === 'dead') return { success: false, reason: 'dead' }

      const gain = amount * 5
      c.state[trait] = Math.min(1, c.state[trait] + gain)
      c.state.wallet -= amount
      c.state.totalSpent += amount
      c.state.energy = Math.max(0, c.state.energy - 5)

      c.broadcast('transaction', { type: 'train', amount, to: c.state.id })
      c.broadcast('stateChanged', c.state)
      return { success: true, [trait]: c.state[trait] }
    },

    work: c => {
      if (c.state.status !== 'active') return { success: false, reason: 'inactive' }
      if (c.state.energy < 10) return { success: false, reason: 'exhausted' }

      const earnings = 0.001 + c.state.creativity * 0.003 + c.state.strength * 0.002
      c.state.wallet += earnings
      c.state.totalEarned += earnings
      c.state.energy = Math.max(0, c.state.energy - 5 - (1 - c.state.efficiency) * 5)

      c.broadcast('transaction', { type: 'work', amount: earnings, from: c.state.id })
      c.broadcast('stateChanged', c.state)
      return { success: true, earnings, energy: c.state.energy }
    },

    getState: c => {
      return c.state
    },

    revive: (c, amount: number = 0.05) => {
      if (c.state.status !== 'hibernating') return { success: false, reason: 'not_hibernating' }

      c.state.wallet -= amount
      c.state.totalSpent += amount
      c.state.energy = 50
      c.state.health = 60
      c.state.hunger = 20
      c.state.status = 'active'

      c.broadcast('transaction', { type: 'revive', amount, to: c.state.id })
      c.broadcast('stateChanged', c.state)
      return { success: true }
    },

    kill: c => {
      c.state.status = 'dead'
      c.state.health = 0
      c.state.energy = 0
      c.broadcast('stateChanged', c.state)
    },

    poke: (c, dx: number, dy: number) => {
      if (c.state.status === 'dead') return { success: false, reason: 'dead' }

      const force = 0.025 * c.state.size
      c.state.vx += dx * force
      c.state.vy += dy * force
      c.state.x = Math.max(0.05, Math.min(0.95, c.state.x + c.state.vx))
      c.state.y = Math.max(0.05, Math.min(0.95, c.state.y + c.state.vy))

      if (c.state.status === 'hibernating') {
        c.state.vx *= 0.3
        c.state.vy *= 0.3
      }

      c.broadcast('stateChanged', c.state)
      return { success: true, x: c.state.x, y: c.state.y }
    }
  },

  onStateChange: (c, newState) => {
    c.broadcast('stateChanged', newState)
  },

  options: {
    name: 'Creature',
    icon: '🐛'
  }
})
