import * as React from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  hue: number
  life: number
  maxLife: number
}

export function ParticleBackground() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')!
    let animId: number
    const particles: Particle[] = []
    const MAX_PARTICLES = 60

    function resize() {
      canvas!.width = window.innerWidth
      canvas!.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    function spawnParticle(): Particle {
      return {
        x: Math.random() * canvas!.width,
        y: canvas!.height + 10,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -(0.2 + Math.random() * 0.5),
        size: 1 + Math.random() * 2,
        opacity: 0,
        hue: 160 + Math.random() * 40,
        life: 0,
        maxLife: 200 + Math.random() * 300
      }
    }

    for (let i = 0; i < 30; i++) {
      const p = spawnParticle()
      p.y = Math.random() * canvas!.height
      p.life = Math.random() * p.maxLife
      particles.push(p)
    }

    function animate() {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height)

      while (particles.length < MAX_PARTICLES) {
        particles.push(spawnParticle())
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        p.life++

        const lifeRatio = p.life / p.maxLife
        if (lifeRatio < 0.1) {
          p.opacity = lifeRatio / 0.1
        } else if (lifeRatio > 0.8) {
          p.opacity = (1 - lifeRatio) / 0.2
        } else {
          p.opacity = 0.6 + Math.sin(p.life * 0.05) * 0.2
        }

        if (p.life >= p.maxLife) {
          particles[i] = spawnParticle()
          continue
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${p.opacity * 0.4})`
        ctx.fill()

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${p.opacity * 0.08})`
        ctx.fill()
      }

      animId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className='fixed inset-0 pointer-events-none'
      style={{ zIndex: 0 }}
    />
  )
}
