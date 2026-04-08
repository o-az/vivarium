import { actor, event } from 'rivetkit'

import {
  CREATURE_NAMES,
  type CreatureState,
  type TerrariumState,
  type TerrariumEvent
} from '#schema.ts'

let evtCounter = 0
function uniqueId(): string {
  return `evt-${Date.now()}-${++evtCounter}`
}

export const terrarium = actor({
  events: {
    ecosystemUpdate: event<TerrariumState>(),
    newEvent: event<TerrariumEvent>()
  },

  createState: (_): TerrariumState => {
    return {
      creatures: [],
      totalTransactions: 0,
      environmentHealth: 100,
      resourcePool: 100,
      maxGeneration: 1,
      createdAt: Date.now(),
      events: []
    }
  },

  onCreate: c => {
    const client = c.client<typeof import('./registry.js').registry>()
    const promises: Promise<unknown>[] = CREATURE_NAMES.slice(0, 5).map((name, index) =>
      client.creature.create([`creature-${index + 1}`], { input: { name } })
    )
    void Promise.all(promises).then(handles => {
      const _ids = handles.map((h: any) => (h.resolve ? h : h))
      c.state.creatures = promises.map((_, i) => `creature-${i + 1}`)
      c.state.events = handles.map((_: any, i: number) => ({
        id: `evt-birth-${i}`,
        type: 'birth' as const,
        creatureId: `creature-${i + 1}`,
        creatureName: CREATURE_NAMES[i],
        timestamp: Date.now(),
        description: `${CREATURE_NAMES[i]} was born into the ecosystem`
      }))
      c.broadcast('ecosystemUpdate', c.state)
    })
  },

  actions: {
    addCreature: (c, name?: string) => {
      const creatureName = name || CREATURE_NAMES[Math.floor(Math.random() * CREATURE_NAMES.length)]
      const id = `creature-${Date.now()}`
      const client = c.client<typeof import('./registry.js').registry>()

      void client.creature.create([id], { input: { name: creatureName } }).then(() => {
        c.state.creatures.push(id)
        c.state.resourcePool = Math.max(0, c.state.resourcePool - 10)

        const evt: TerrariumEvent = {
          id: uniqueId(),
          type: 'birth',
          creatureId: id,
          creatureName,
          timestamp: Date.now(),
          description: `${creatureName} was born into the ecosystem`
        }
        c.state.events = [...c.state.events.slice(-49), evt]
        c.state.totalTransactions++
        c.broadcast('newEvent', evt)
        c.broadcast('ecosystemUpdate', c.state)
      })

      return { id, name }
    },

    breedCreatures: (c, parent1Id: string, parent2Id: string) => {
      if (!c.state.creatures.includes(parent1Id) || !c.state.creatures.includes(parent2Id)) {
        return { success: false, reason: 'parents_not_found' }
      }

      const client = c.client<typeof import('./registry.js').registry>()
      const childId = `creature-${Date.now()}`

      const childName = CREATURE_NAMES[Math.floor(Math.random() * CREATURE_NAMES.length)]

      void client.creature
        .getOrCreate([parent1Id])
        .getState()
        .then(async (p1: CreatureState) => {
          const p2: CreatureState = await client.creature.getOrCreate([parent2Id]).getState()

          await client.creature.create([childId], {
            input: { name: childName, parent1: p1, parent2: p2 }
          })

          c.state.creatures.push(childId)
          c.state.maxGeneration = Math.max(c.state.maxGeneration, p1.generation, p2.generation) + 1
          c.state.totalTransactions++

          const evt: TerrariumEvent = {
            id: uniqueId(),
            type: 'breed',
            creatureId: childId,
            creatureName: childName,
            targetId: parent1Id,
            targetName: p1.name,
            timestamp: Date.now(),
            description: `${childName} was born to ${p1.name} and ${p2.name}`
          }
          c.state.events = [...c.state.events.slice(-49), evt]
          c.broadcast('newEvent', evt)
          c.broadcast('ecosystemUpdate', c.state)
        })

      return { success: true, childId, childName }
    },

    removeCreature: (c, creatureId: string) => {
      c.state.creatures = c.state.creatures.filter(id => id !== creatureId)

      const evt: TerrariumEvent = {
        id: uniqueId(),
        type: 'death',
        creatureId,
        creatureName: creatureId,
        timestamp: Date.now(),
        description: `A creature has left the ecosystem`
      }
      c.state.events = [...c.state.events.slice(-49), evt]
      c.broadcast('newEvent', evt)
      c.broadcast('ecosystemUpdate', c.state)
    },

    recordEvent: (c, evt: Omit<TerrariumEvent, 'id' | 'timestamp'>) => {
      const fullEvt: TerrariumEvent = {
        ...evt,
        id: uniqueId(),
        timestamp: Date.now()
      }
      c.state.events = [...c.state.events.slice(-49), fullEvt]
      c.state.totalTransactions++
      c.broadcast('newEvent', fullEvt)
      c.broadcast('ecosystemUpdate', c.state)
      return fullEvt
    },

    getState: c => {
      return c.state
    },

    tick: c => {
      const activeCount = c.state.creatures.length
      c.state.environmentHealth = Math.min(100, 50 + (100 - activeCount * 5))
      c.state.resourcePool = Math.min(200, c.state.resourcePool + 2)
      c.broadcast('ecosystemUpdate', c.state)
      void c.schedule.after(5000, 'tick')
    }
  },

  onWake: c => {
    void c.schedule.after(5000, 'tick')
  },

  options: {
    name: 'Terrarium',
    icon: '🌿'
  }
})
