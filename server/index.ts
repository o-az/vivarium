import { Hono } from 'hono'
import { createClient } from 'rivetkit/client'

import { registry } from '#server/actors/registry.ts'

const ENDPOINT = process.env.RIVET_ENDPOINT || 'http://localhost:6420'

const app = new Hono()

// Serve built frontend in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', async (c, next) => {
    if (c.req.path.startsWith('/api')) return next()
    const url = new URL(c.req.url)
    // Try serving static assets first
    if (url.pathname.startsWith('/assets/')) {
      const file = Bun.file(`./dist${url.pathname}`)
      if (await file.exists()) {
        return new Response(file)
      }
    }
    // SPA fallback
    const html = await Bun.file('./dist/index.html').text()
    return c.html(html)
  })
}

// app.use('*', cors())

app
  .get('/health', context => context.redirect('/api/health'))
  .get('/api/health', context => context.json({ ok: true, service: 'vivarium' }))

app.post('/api/creature/feed/:id', async context => {
  const id = context.req.param('id')
  const body = await context.req.json().catch(() => ({}))
  const amount = body.amount ?? 0.01

  const client = createClient<typeof registry>({ endpoint: ENDPOINT })
  const handle = client.creature.getOrCreate([id])
  const result = await handle.feed(amount)
  return context.json(result)
})

app.post('/api/creature/poke/:id', async context => {
  const id = context.req.param('id')
  const body = await context.req.json().catch(() => ({}))
  const dx = body.dx ?? 0
  const dy = body.dy ?? 0

  if (typeof dx !== 'number' || typeof dy !== 'number')
    return context.json({ success: false, reason: 'invalid_direction' }, 400)

  const client = createClient<typeof registry>({ endpoint: ENDPOINT })
  const handle = client.creature.getOrCreate([id])
  const result = await handle.poke(dx, dy)
  return context.json(result)
})

app.post('/api/creature/train/:id', async context => {
  const id = context.req.param('id')
  const body = await context.req.json().catch(() => ({}))
  const trait = body.trait ?? 'strength'
  const amount = body.amount ?? 0.01

  if (!['strength', 'efficiency', 'creativity', 'resilience', 'speed'].includes(trait))
    return context.json({ success: false, reason: 'invalid_trait' }, 400)

  const client = createClient<typeof registry>({ endpoint: ENDPOINT })
  const handle = client.creature.getOrCreate([id])
  const result = await handle.train(trait, amount)
  return context.json(result)
})

app.post('/api/creature/work/:id', async context => {
  const id = context.req.param('id')
  const client = createClient<typeof registry>({ endpoint: ENDPOINT })
  const handle = client.creature.getOrCreate([id])
  const result = await handle.work()
  return context.json(result)
})

app.post('/api/creature/revive/:id', async context => {
  const id = context.req.param('id')
  const body = await context.req.json().catch(() => ({}))
  const amount = body.amount ?? 0.05

  const client = createClient<typeof registry>({ endpoint: ENDPOINT })
  const handle = client.creature.getOrCreate([id])
  const result = await handle.revive(amount)
  return context.json(result)
})

app.post('/api/terrarium/spawn', async context => {
  const body = await context.req.json().catch(() => ({}))
  const name = body.name ?? undefined

  const client = createClient<typeof registry>({ endpoint: ENDPOINT })
  const handle = client.terrarium.getOrCreate(['main'])
  const result = await handle.addCreature(name)
  return context.json(result)
})

app.post('/api/terrarium/breed', async context => {
  const body = await context.req.json().catch(() => ({}))
  const parent1Id = body.parent1Id
  const parent2Id = body.parent2Id

  if (!parent1Id || !parent2Id)
    return context.json({ success: false, reason: 'missing_parent_ids' }, 400)

  const client = createClient<typeof registry>({ endpoint: ENDPOINT })
  const handle = client.terrarium.getOrCreate(['main'])
  const result = await handle.breedCreatures(parent1Id, parent2Id)
  return context.json(result)
})

app.get('/api/terrarium/state', async context => {
  const client = createClient<typeof registry>({ endpoint: ENDPOINT })
  const handle = client.terrarium.getOrCreate(['main'])
  const state = await handle.getState()
  return context.json(state)
})

app.get('/api/creature/state/:id', async context => {
  const id = context.req.param('id')
  const client = createClient<typeof registry>({ endpoint: ENDPOINT })
  const handle = client.creature.getOrCreate([id])
  const state = await handle.getState()
  return context.json(state)
})

app.get('/api/creatures', async context => {
  const client = createClient<typeof registry>({ endpoint: ENDPOINT })
  const terrariumHandle = client.terrarium.getOrCreate(['main'])
  const terrariumState = await terrariumHandle.getState()

  if (!terrariumState.creatures?.length) return context.json([])

  const states = await Promise.all(
    terrariumState.creatures.map(async (id: string) => {
      try {
        const handle = client.creature.getOrCreate([id])
        return await handle.getState()
      } catch {
        return null
      }
    })
  )

  return context.json(states.filter(s => s !== null))
})

async function main() {
  await registry.start()

  const apiPort = Number(process.env.PORT || 3_000)
  Bun.serve({ fetch: app.fetch, port: apiPort })

  console.info(`\n🧬 Vivarium API running on http://localhost:${apiPort}`)
  console.info(`🧬 Rivet Actors running on http://localhost:6420`)
  console.info(`\n   Open http://localhost:${apiPort} for the vivarium dashboard\n`)
}

main().catch(console.error)
