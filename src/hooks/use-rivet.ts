import * as z from 'zod/mini'
import * as React from 'react'

import {
  CreatureStateSchema,
  TerrariumStateSchema,
  type CreatureState,
  type TerrariumEvent,
  type TerrariumState
} from '#schema.ts'

const API_BASE = __BASE_URL__ + '/api'

export function useTerrariumState() {
  const [state, setState] = React.useState<TerrariumState | null>(null)
  const [events, setEvents] = React.useState<TerrariumEvent[]>([])
  const [loading, setLoading] = React.useState(true)
  const [connected, setConnected] = React.useState(false)
  const pollRef = React.useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchState = React.useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/terrarium/state`)
      if (res.ok) {
        const data = TerrariumStateSchema.parse(await res.json())
        setState(data)
        setEvents(data.events)
        setConnected(true)
      } else {
        setConnected(false)
      }
    } catch {
      setConnected(false)
    }
  }, [])

  React.useEffect(() => {
    void fetchState().then(() => setLoading(false))
    pollRef.current = setInterval(fetchState, 2000)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [fetchState])

  const spawnCreature = React.useCallback(async (name?: string) => {
    const res = await fetch(`${API_BASE}/terrarium/spawn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    })
    return res.json()
  }, [])

  const breedCreatures = React.useCallback(async (parent1Id: string, parent2Id: string) => {
    const res = await fetch(`${API_BASE}/terrarium/breed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parent1Id, parent2Id })
    })
    return res.json()
  }, [])

  const feedCreature = React.useCallback(async (id: string, amount = 0.01) => {
    const res = await fetch(`${API_BASE}/creature/feed/${encodeURIComponent(id)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount })
    })
    return res.json()
  }, [])

  const trainCreature = React.useCallback(async (id: string, trait: string, amount = 0.01) => {
    const res = await fetch(`${API_BASE}/creature/train/${encodeURIComponent(id)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trait, amount })
    })
    return res.json()
  }, [])

  const workCreature = React.useCallback(async (id: string) => {
    const res = await fetch(`${API_BASE}/creature/work/${encodeURIComponent(id)}`, {
      method: 'POST'
    })
    return res.json()
  }, [])

  const reviveCreature = React.useCallback(async (id: string, amount = 0.05) => {
    const res = await fetch(`${API_BASE}/creature/revive/${encodeURIComponent(id)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount })
    })
    return res.json()
  }, [])

  const pokeCreature = React.useCallback(async (id: string, dx: number, dy: number) => {
    try {
      const res = await fetch(`${API_BASE}/creature/poke/${encodeURIComponent(id)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dx, dy })
      })
      return res.json()
    } catch {}
  }, [])

  const fetchCreatureStates = React.useCallback(async (): Promise<CreatureState[]> => {
    try {
      const res = await fetch(`${API_BASE}/creatures`)
      if (res.ok) return z.array(CreatureStateSchema).parse(await res.json())
    } catch {}
    return []
  }, [])

  return {
    state,
    events,
    loading,
    connected,
    spawnCreature,
    breedCreatures,
    feedCreature,
    trainCreature,
    workCreature,
    reviveCreature,
    pokeCreature,
    fetchCreatureStates
  }
}
