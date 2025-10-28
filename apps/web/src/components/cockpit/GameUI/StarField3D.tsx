'use client'

/**
 * StarField3D - Futuristic 3D star field background
 * Video game-style space environment with animated stars
 */

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

function Stars() {
  const ref = useRef<THREE.Points>(null!)

  // Generate random star positions
  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(5000 * 3)
    const colors = new Float32Array(5000 * 3)

    for (let i = 0; i < 5000; i++) {
      // Spread stars in a sphere
      positions[i * 3] = (Math.random() - 0.5) * 50
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50

      // Purple/blue/cyan color palette
      const colorChoice = Math.random()
      if (colorChoice > 0.7) {
        colors[i * 3] = 0.6 // Purple
        colors[i * 3 + 1] = 0.3
        colors[i * 3 + 2] = 1
      } else if (colorChoice > 0.4) {
        colors[i * 3] = 0.3 // Cyan
        colors[i * 3 + 1] = 0.8
        colors[i * 3 + 2] = 1
      } else {
        colors[i * 3] = 1 // White
        colors[i * 3 + 1] = 1
        colors[i * 3 + 2] = 1
      }
    }

    return [positions, colors]
  }, [])

  // Slow rotation animation
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 10
      ref.current.rotation.y -= delta / 15
    }
  })

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          vertexColors
          size={0.15}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  )
}

export function StarField3D() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 1] }}>
        <color attach="background" args={['#0a0a1f']} />
        <Stars />
      </Canvas>
    </div>
  )
}
