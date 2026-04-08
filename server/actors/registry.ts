import { setup } from 'rivetkit'

import { creature } from '#server/actors/creature.ts'
import { terrarium } from '#server/actors/terrarium.ts'

export const registry = setup({
  use: { creature, terrarium }
})
