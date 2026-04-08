import * as React from 'react'
import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi'
import { tempo } from 'viem/chains'

export function WalletButton() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: balance } = useBalance({ address, chainId: tempo.id })

  if (isConnected && address) {
    return (
      <div className='flex items-center gap-2'>
        {balance && (
          <span className='text-xs font-body text-biolum'>
            {(Number(balance.value) / 10 ** balance.decimals).toFixed(2)} {balance.symbol}
          </span>
        )}
        <span className='text-xs font-body text-white/30 truncate max-w-20'>
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <button
          onClick={() => disconnect()}
          className='text-xs font-body text-white/30 hover:text-white/60 transition-colors'>
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => {
        const connector = connectors[0]
        if (connector) connect({ connector })
      }}
      disabled={isPending}
      className='text-xs font-display font-medium px-3 py-1.5 rounded-sm transition-all hover:scale-[1.02] active:scale-[0.98]'
      style={{
        background: 'linear-gradient(135deg, rgba(0,255,213,0.15), rgba(0,255,213,0.05))',
        border: '1px solid rgba(0,255,213,0.2)',
        color: '#00ffd5'
      }}>
      {isPending ? 'Connecting...' : '🪙 Connect Wallet'}
    </button>
  )
}
