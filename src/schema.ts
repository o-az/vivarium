import * as z from 'zod/mini'

// ── Schemas ──────────────────────────────────────────────────────────

export const CreatureStateSchema = z.object({
  id: z.string(),
  name: z.string(),
  generation: z.number(),
  bornAt: z.number(),
  parentId1: z.nullable(z.string()),
  parentId2: z.nullable(z.string()),

  strength: z.number(),
  efficiency: z.number(),
  creativity: z.number(),
  resilience: z.number(),
  speed: z.number(),

  health: z.number(),
  energy: z.number(),
  hunger: z.number(),

  wallet: z.number(),
  totalEarned: z.number(),
  totalSpent: z.number(),

  hue: z.number(),
  saturation: z.number(),
  pattern: z.number(),
  size: z.number(),

  status: z.enum(['active', 'hibernating', 'dead']),
  lastFedAt: z.number(),
  lastActiveAt: z.number(),

  x: z.number(),
  y: z.number(),
  vx: z.number(),
  vy: z.number()
})

export const TerrariumEventSchema = z.object({
  id: z.string(),
  type: z.enum(['feed', 'breed', 'trade', 'birth', 'hibernate', 'wake', 'death', 'work']),
  creatureId: z.string(),
  creatureName: z.optional(z.prefault(z.string(), 'Unknown')),
  targetId: z.optional(z.string()),
  targetName: z.optional(z.string()),
  amount: z.optional(z.number()),
  timestamp: z.number(),
  description: z.string()
})

export const TerrariumStateSchema = z.object({
  creatures: z.array(z.string()),
  totalTransactions: z.number(),
  environmentHealth: z.number(),
  resourcePool: z.number(),
  maxGeneration: z.number(),
  createdAt: z.number(),
  events: z.array(TerrariumEventSchema)
})

export const BreedInputSchema = z.object({
  parent1Id: z.string(),
  parent2Id: z.string()
})

// ── Inferred types ───────────────────────────────────────────────────

export type CreatureState = z.infer<typeof CreatureStateSchema>
export type TerrariumEvent = z.infer<typeof TerrariumEventSchema>
export type TerrariumState = z.infer<typeof TerrariumStateSchema>
export type BreedInput = z.infer<typeof BreedInputSchema>

// ── Constants ────────────────────────────────────────────────────────

export const CREATURE_NAMES = [
  'Aurora',
  'Blaze',
  'Coral',
  'Drift',
  'Ember',
  'Flux',
  'Glow',
  'Haze',
  'Iris',
  'Jade',
  'Kelp',
  'Lumen',
  'Mist',
  'Nova',
  'Opal',
  'Pulse',
  'Quill',
  'Ripple',
  'Spark',
  'Tide',
  'Umbra',
  'Vortex',
  'Wisp',
  'Xenon',
  'Yara',
  'Zephyr',
  'Axiom',
  'Bloom',
  'Cipher',
  'Dusk',
  'Echo',
  'Fern',
  'Glimmer',
  'Helix',
  'Indigo',
  'Jasmine',
  'Koi',
  'Luna',
  'Moss',
  'Neon',
  'Orion',
  'Prism',
  'Quasar',
  'Rune',
  'Shimmer',
  'Thorn',
  'Unity',
  'Vine',
  'Wave',
  'Xenith'
]
