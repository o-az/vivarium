import type { ActorHandle, RegistryClient } from 'rivetkit/client'

export interface AppRegistry {
  creature: ActorHandle<{
    feed: (amount: number) => Promise<{ success: boolean; reason?: string; energy?: number }>
    train: (
      trait: string,
      amount: number
    ) => Promise<{ success: boolean; reason?: string; [key: string]: any }>
    work: () => Promise<{ success: boolean; reason?: string; earnings?: number; energy?: number }>
    revive: (amount: number) => Promise<{ success: boolean; reason?: string }>
    getState: () => Promise<import('./types').CreatureState>
  }>
  terrarium: ActorHandle<{
    addCreature: (name?: string) => Promise<{ id: string; name: string }>
    breedCreatures: (
      parent1Id: string,
      parent2Id: string
    ) => Promise<{ success: boolean; reason?: string; childId?: string; childName?: string }>
    getState: () => Promise<import('./types').TerrariumState>
  }>
}
