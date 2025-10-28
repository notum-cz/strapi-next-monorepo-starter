'use client'

import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Text3D, Environment, OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { motion } from 'framer-motion'
import * as THREE from 'three'

function Floating3DText() {
  const textRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t / 4) / 8
      groupRef.current.rotation.x = Math.cos(t / 4) / 8
      groupRef.current.position.y = Math.sin(t / 2) / 10
    }
  })

  return (
    <group ref={groupRef}>
      <Float
        speed={2}
        rotationIntensity={0.5}
        floatIntensity={0.5}
      >
        <Text3D
          ref={textRef}
          font="/fonts/helvetiker_bold.typeface.json"
          size={1.5}
          height={0.3}
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.02}
          bevelSize={0.02}
          bevelOffset={0}
          bevelSegments={5}
        >
          NEW WORLD
          <meshStandardMaterial
            color="#00ff88"
            emissive="#00ff88"
            emissiveIntensity={0.5}
            metalness={0.8}
            roughness={0.2}
          />
        </Text3D>
      </Float>

      <Float
        speed={1.5}
        rotationIntensity={0.3}
        floatIntensity={0.3}
      >
        <Text3D
          font="/fonts/helvetiker_bold.typeface.json"
          size={1.2}
          height={0.2}
          position={[0, -2, 0]}
        >
          KIDS
          <meshStandardMaterial
            color="#00ccff"
            emissive="#00ccff"
            emissiveIntensity={0.4}
            metalness={0.7}
            roughness={0.3}
          />
        </Text3D>
      </Float>

      {/* Particle rings */}
      <Particles />
    </group>
  )
}

function Particles() {
  const particlesRef = useRef<THREE.Points>(null)
  const count = 1000
  const positions = new Float32Array(count * 3)

  for (let i = 0; i < count; i++) {
    const i3 = i * 3
    const radius = Math.random() * 10 + 5
    const angle = Math.random() * Math.PI * 2
    const y = (Math.random() - 0.5) * 10

    positions[i3] = Math.cos(angle) * radius
    positions[i3 + 1] = y
    positions[i3 + 2] = Math.sin(angle) * radius
  }

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.getElapsedTime() * 0.1
    }
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#00ff88"
        sizeAttenuation
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

function Scene() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 10]} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.5}
      />

      <ambientLight intensity={0.5} />
      <spotLight
        position={[10, 10, 10]}
        angle={0.15}
        penumbra={1}
        intensity={1}
        castShadow
      />
      <pointLight position={[-10, -10, -10]} color="#00ccff" intensity={0.5} />

      <Floating3DText />

      <Environment preset="city" />
    </>
  )
}

export function Hero3D() {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950">
      {/* 3D Canvas */}
      <div className="absolute inset-0">
        <Suspense fallback={
          <div className="flex items-center justify-center h-full">
            <div className="text-white text-2xl animate-pulse">Loading 3D Experience...</div>
          </div>
        }>
          <Canvas>
            <Scene />
          </Canvas>
        </Suspense>
      </div>

      {/* Overlay gradient for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-end pb-20">
        <motion.div
          className="text-center space-y-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 1 }}
        >
          <p className="text-gray-300 text-xl md:text-2xl max-w-2xl mx-auto px-4">
            Empowering the next generation through education, wildlife conservation, and blockchain technology
          </p>

          <div className="flex gap-4 justify-center">
            <motion.button
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold rounded-full text-lg hover:shadow-2xl hover:shadow-emerald-500/50 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Donating
            </motion.button>

            <motion.button
              className="px-8 py-4 border-2 border-white/20 text-white font-bold rounded-full text-lg hover:bg-white/10 backdrop-blur-sm transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Learn More
            </motion.button>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="mt-12"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
            <motion.div
              className="w-1.5 h-1.5 bg-white rounded-full"
              animate={{ y: [0, 16, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
