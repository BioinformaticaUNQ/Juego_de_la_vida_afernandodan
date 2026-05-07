import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import './ProteinViewer.css'

const HELIX_COLORS = [0xff6b6b, 0xffd54f, 0x2ec4ff, 0x00d7c5, 0x7bd88f, 0xc9a1ff, 0xff9a33]

const generateAlphaHelix = (turns = 3) => {
  const points = []
  const count = Math.max(turns * 16, 4) // Al menos 4 puntos
  const colorPalette = HELIX_COLORS

  for (let i = 0; i < count; i++) {
    const t = i / Math.max(count - 1, 1)
    const angle = t * Math.PI * 2 * turns
    const x = Math.cos(angle) * 7
    const y = t * 25 - 12.5
    const z = Math.sin(angle) * 7

    points.push(new THREE.Vector3(x, y, z))
  }

  const colors = []
  const colorPalette2 = HELIX_COLORS
  for (let i = 0; i < count; i++) {
    const color = new THREE.Color(colorPalette2[Math.floor((i / count) * colorPalette2.length)])
    colors.push(color.r, color.g, color.b)
  }

  return { points, colors, count }
}

const ProteinViewer = () => {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    const width = rect.width || 600
    const height = rect.height || 340

    let animationId = 0
    let disposed = false

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x080d1f)

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 2000)
      camera.position.set(0, 0, 35)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.setSize(width, height, false)
    
    container.innerHTML = ''
    container.appendChild(renderer.domElement)

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 1.05))
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4)
    keyLight.position.set(4, 8, 10)
    scene.add(keyLight)

    const root = new THREE.Group()
    scene.add(root)

    // Generate alpha helix structure
    const { points, colors, count } = generateAlphaHelix(2 + Math.random() * 2)

    // Crear geometría helicoidal directamente
    const helixGeometry = new THREE.BufferGeometry()
    const positions = []
    const colorsGeom = []

    // Generar cilindro alrededor de la curva helicoidal
    const tubeRadius = 1.2
    const segmentsPerPoint = 12

    for (let i = 0; i < count - 1; i++) {
      const p1 = points[i]
      const p2 = points[i + 1]
      const direction = new THREE.Vector3().subVectors(p2, p1).normalize()

      // Calcular normal perpendicular
      let normal = new THREE.Vector3(0, 1, 0)
      if (Math.abs(direction.dot(normal)) > 0.9) {
        normal = new THREE.Vector3(1, 0, 0)
      }
      normal.cross(direction).normalize()

      for (let j = 0; j < segmentsPerPoint; j++) {
        const angle = (j / segmentsPerPoint) * Math.PI * 2
        const axis = new THREE.Vector3().crossVectors(direction, normal).normalize()

        // Punto en el círculo del tubo
        const circlePoint = new THREE.Vector3()
          .copy(normal)
          .multiplyScalar(Math.cos(angle) * tubeRadius)
          .addScaledVector(axis, Math.sin(angle) * tubeRadius)

        // Punto en p1
        positions.push(p1.x + circlePoint.x, p1.y + circlePoint.y, p1.z + circlePoint.z)

        // Punto en p2
        positions.push(p2.x + circlePoint.x, p2.y + circlePoint.y, p2.z + circlePoint.z)

        // Color del punto actual
        const colorIdx = (i / count) * HELIX_COLORS.length
        const color = HELIX_COLORS[Math.floor(colorIdx)]
        const c = new THREE.Color(color)
        colorsGeom.push(c.r, c.g, c.b, c.r, c.g, c.b)
      }
    }

    helixGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3))
    helixGeometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colorsGeom), 3))

    const tubeMaterial = new THREE.MeshStandardMaterial({
      vertexColors: true,
      emissiveIntensity: 0.3,
      roughness: 0.3,
      metalness: 0.2,
    })
    const tubeMesh = new THREE.Mesh(helixGeometry, tubeMaterial)
    root.add(tubeMesh)

    // Agregar esferas en puntos clave
    const sphereGeom = new THREE.SphereGeometry(0.6, 12, 12)
    const step = Math.floor(count / 8)
    for (let i = 0; i < count; i += step) {
      const point = points[i]
      const colorIdx = (i / count) * HELIX_COLORS.length
      const color = HELIX_COLORS[Math.floor(colorIdx)]
      
      const sphereMat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.4,
        roughness: 0.2,
        metalness: 0.3,
      })
      const sphere = new THREE.Mesh(sphereGeom, sphereMat)
      sphere.position.copy(point)
      root.add(sphere)
    }

    // Animation loop
    const animate = () => {
      if (disposed) return
      animationId = requestAnimationFrame(animate)
      root.rotation.y += 0.004
      root.rotation.x = Math.sin(performance.now() * 0.0004) * 0.08
      renderer.render(scene, camera)
    }
    animate()

    // Cleanup
    return () => {
      disposed = true
      cancelAnimationFrame(animationId)
      helixGeometry.dispose()
      sphereGeom.dispose()
      tubeMaterial.dispose()
      renderer.dispose()
      container.innerHTML = ''
    }
  }, [])

  return <div ref={containerRef} className="protein-viewer__canvas" style={{ width: '100%', height: '100%', display: 'block' }} />
}

export default ProteinViewer
