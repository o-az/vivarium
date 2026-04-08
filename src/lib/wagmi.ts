import { http } from 'viem'
import { tempo } from 'viem/chains'
import { createConfig } from 'wagmi'
import { tempoWallet } from 'accounts/wagmi'

export const wagmiConfig = createConfig({
  chains: [tempo],
  connectors: [tempoWallet({ mpp: true })],
  transports: {
    [tempo.id]: http()
  }
})
