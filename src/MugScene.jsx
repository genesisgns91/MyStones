import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useThree, useLoader } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, useTexture } from '@react-three/drei'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import * as THREE from 'three'
import { useDecalTexture } from '../hooks/useDecalTexture.js'

function SceneBackground({ background }) {
  const { scene } = useThree()

  useEffect(() => {
    if (background.type === 'color') {
      scene.background = new THREE.Color(background.color)
      return () => {
        scene.background = null
      }
    }
  }, [background.type, background.color, scene])

  if (background.type === 'image' && background.image) {
    return <BackgroundImage url={background.image} />
  }
  return null
}

function BackgroundImage({ url }) {
  const { scene } = useThree()
  const texture = useTexture(url)
  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace
    scene.background = texture
    return () => {
      scene.background = null
    }
  }, [texture, scene])
  return null
}

const TARGET_HEIGHT = 1.7 // world units the mug should visually occupy

function Mug({ art, mugColor, onMeasured }) {
  const obj = useLoader(OBJLoader, '/model.obj')
  const group = useMemo(() => obj.clone(true), [obj])
  const [measurements, setMeasurements] = useState(null)
  const groupRef = useRef(null)

  const decalGeomRef = useRef(null)

  // Auto-fit: scale the model to a consistent on-screen size and place its
  // base on the ground plane (y = 0), regardless of the model's native units.
  useEffect(() => {
    const box = new THREE.Box3().setFromObject(group)
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(center)
    const scale = TARGET_HEIGHT / size.y
    group.scale.setScalar(scale)
    group.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale)
  }, [group])

  useEffect(() => {
    // Ceramic body material shared by the parts that are NOT the printed decal
    const bodyMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(mugColor),
      roughness: 0.22,
      metalness: 0.0,
      clearcoat: 1,
      clearcoatRoughness: 0.15,
      envMapIntensity: 1.1,
    })

    const insideMaterial = bodyMaterial.clone()
    insideMaterial.roughness = 0.28

    let decalMesh = null

    group.traverse((child) => {
      if (!child.isMesh) return
      child.castShadow = true
      child.receiveShadow = true

      switch (child.name) {
        case 'inside':
          child.material = insideMaterial
          break
        case 'decal': {
          decalMesh = child
          decalGeomRef.current = child.geometry
          // Compute real radius/height of the decal wall for correct UV wrap scaling
          const pos = child.geometry.attributes.position
          let minY = Infinity
          let maxY = -Infinity
          let rSum = 0
          for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i)
            const y = pos.getY(i)
            const z = pos.getZ(i)
            if (y < minY) minY = y
            if (y > maxY) maxY = y
            rSum += Math.hypot(x, z)
          }
          const radiusUnits = rSum / pos.count
          const heightUnits = maxY - minY
          setMeasurements({ radiusUnits, heightUnits })
          break
        }
        case 'print':
        case 'other':
        case 'bottom':
        case 'handle':
          child.material = bodyMaterial
          break
        default:
          child.material = bodyMaterial
      }
    })

    if (decalMesh) {
      // Push the decal slightly forward in the depth buffer so it doesn't
      // z-fight with the underlying "print" wall mesh (near-identical geometry).
      decalMesh.renderOrder = 1
    }

    return () => {
      bodyMaterial.dispose()
      insideMaterial.dispose()
    }
  }, [group, mugColor])

  useEffect(() => {
    if (measurements) onMeasured(measurements)
  }, [measurements, onMeasured])

  const { texture, warning } = useDecalTexture({
    artImage: art.image,
    artWidthMM: art.widthMM,
    artHeightMM: art.heightMM,
    offsetXMM: art.offsetXMM,
    offsetYMM: art.offsetYMM,
    mugRadiusUnits: measurements?.radiusUnits,
    mugHeightUnits: measurements?.heightUnits,
    mugRealHeightMM: art.mugRealHeightMM,
  })

  useEffect(() => {
    art.onWarning?.(warning)
  }, [warning, art])

  useEffect(() => {
    group.traverse((child) => {
      if (child.isMesh && child.name === 'decal') {
        child.material = new THREE.MeshPhysicalMaterial({
          map: texture,
          transparent: true,
          roughness: 0.35,
          clearcoat: 0.8,
          clearcoatRoughness: 0.2,
          polygonOffset: true,
          polygonOffsetFactor: -4,
          polygonOffsetUnits: -4,
          depthWrite: true,
        })
        child.material.needsUpdate = true
      }
    })
  }, [group, texture])

  return <primitive ref={groupRef} object={group} />
}

export default function MugScene({ art, background, mugColor, onMeasured }) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [1.9, 1.35, 2.1], fov: 32 }}
      gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
    >
      <SceneBackground background={background} />
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[3, 5, 2]}
        intensity={1.4}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-1.5}
        shadow-camera-right={1.5}
        shadow-camera-top={1.5}
        shadow-camera-bottom={-1.5}
      />
      <directionalLight position={[-3, 2, -2]} intensity={0.4} />
      <Environment preset="apartment" />
      <Mug art={art} mugColor={mugColor} onMeasured={onMeasured} />
      <ContactShadows position={[0, 0, 0]} opacity={0.55} scale={4} blur={2.4} far={1.2} />
      <OrbitControls
        enablePan={false}
        target={[0, TARGET_HEIGHT * 0.5, 0]}
        minDistance={1.3}
        maxDistance={4}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 1.7}
      />
    </Canvas>
  )
}
