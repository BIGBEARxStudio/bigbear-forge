# Design Document: Avatar Framework

## Overview

The Avatar Framework integrates Three.js 3D rendering into the existing card game architecture to provide animated character visualization. The system renders 3D avatars in a dedicated canvas layer, responds to combat events from the XState machine, supports customization and persistence, and maintains 60fps performance. The architecture follows dependency injection patterns for testability and includes graceful degradation to 2D sprites when WebGL is unavailable.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Application                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Avatar UI    │  │   Combat     │  │ Customization│      │
│  │ Component    │  │   Scene      │  │ Panel        │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Zustand State Store                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Avatar State │  │ Combat State │  │ Customization│      │
│  │              │  │              │  │ State        │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Avatar System                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Avatar       │  │  Animation   │  │  Camera      │      │
│  │ Manager      │  │  Controller  │  │  Controller  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Three.js    │  │   Lighting   │  │  Fallback    │
│  Renderer    │  │   System     │  │  2D Sprites  │
└──────────────┘  └──────────────┘  └──────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            ▼
                  ┌──────────────────┐
                  │  Combat State    │
                  │  Machine (XState)│
                  └──────────────────┘
```

### Component Separation

1. **Avatar System Layer**: Three.js rendering, animation, camera control
2. **State Layer**: Zustand store for avatar state, customization data
3. **View Layer**: React components for UI controls and canvas mounting
4. **Integration Layer**: Event listeners for combat state machine transitions
5. **Fallback Layer**: 2D sprite rendering when WebGL unavailable


## Components and Interfaces

### 1. Avatar System Core

**Core Interface:**
```typescript
interface AvatarSystem {
  initialize(canvas: HTMLCanvasElement): Promise<void>
  createAvatar(preset: AvatarPreset): Avatar
  updateAvatar(avatarId: string, customization: CustomizationData): void
  playAnimation(avatarId: string, state: AnimationState): void
  dispose(): void
  isWebGLAvailable(): boolean
}

interface Avatar {
  id: string
  mesh: THREE.Group
  animationController: AnimationController
  customization: CustomizationData
}

interface CustomizationData {
  bodyParts: {
    head: string
    torso: string
    arms: string
    legs: string
  }
  colors: {
    skin: string
    hair: string
    clothing: string
  }
  accessories: {
    hat?: string
    weapon?: string
    shield?: string
  }
}

type AnimationState = 'idle' | 'attack' | 'defend' | 'victory' | 'defeat' | 'damaged'
```


**Implementation Strategy:**
- Use dependency injection for Three.js objects (Scene, Renderer, Camera)
- Create factory pattern for avatar mesh construction
- Implement observer pattern for combat event integration
- Use object pooling for frequently created geometries/materials
- Lazy load 3D assets on first avatar creation

**WebGL Detection:**
```typescript
function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    return !!context
  } catch {
    return false
  }
}
```

**Avatar System Initialization:**
```typescript
class AvatarSystemImpl implements AvatarSystem {
  private scene: THREE.Scene
  private renderer: THREE.WebGLRenderer
  private camera: THREE.PerspectiveCamera
  private avatars: Map<string, Avatar> = new Map()
  private animationFrameId: number | null = null
  
  async initialize(canvas: HTMLCanvasElement): Promise<void> {
    if (!this.isWebGLAvailable()) {
      throw new Error('WebGL not available')
    }
    
    // Initialize Three.js components
    this.scene = new THREE.Scene()
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true
    })
    
    this.camera = new THREE.PerspectiveCamera(
      45, // FOV
      canvas.width / canvas.height, // aspect
      0.1, // near
      1000 // far
    )
    this.camera.position.set(0, 1.6, 5)
    
    // Setup lighting
    this.setupLighting()
    
    // Start render loop
    this.startRenderLoop()
  }
  
  private startRenderLoop(): void {
    const render = () => {
      this.renderer.render(this.scene, this.camera)
      this.animationFrameId = requestAnimationFrame(render)
    }
    render()
  }
  
  dispose(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
    }
    
    this.avatars.forEach(avatar => {
      this.scene.remove(avatar.mesh)
      avatar.mesh.traverse(child => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose()
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose())
          } else {
            child.material.dispose()
          }
        }
      })
    })
    
    this.renderer.dispose()
  }
}
```


### 2. Avatar Mesh Construction

**Mesh Hierarchy:**
```typescript
interface AvatarMeshBuilder {
  buildHead(type: string, color: string): THREE.Mesh
  buildTorso(type: string, color: string): THREE.Mesh
  buildArms(type: string, color: string): THREE.Group
  buildLegs(type: string, color: string): THREE.Group
  buildAccessory(type: string, attachPoint: string): THREE.Mesh
  assembleAvatar(parts: AvatarParts): THREE.Group
}

interface AvatarParts {
  head: THREE.Mesh
  torso: THREE.Mesh
  arms: THREE.Group
  legs: THREE.Group
  accessories: THREE.Mesh[]
}
```

**Avatar Assembly:**
```typescript
class AvatarMeshBuilderImpl implements AvatarMeshBuilder {
  private geometryCache: Map<string, THREE.BufferGeometry> = new Map()
  private materialCache: Map<string, THREE.Material> = new Map()
  
  buildHead(type: string, color: string): THREE.Mesh {
    const geometry = this.getOrCreateGeometry(`head_${type}`, () => {
      // Simple sphere for head
      return new THREE.SphereGeometry(0.3, 16, 16)
    })
    
    const material = this.getOrCreateMaterial(`head_${color}`, () => {
      return new THREE.MeshStandardMaterial({ color })
    })
    
    const head = new THREE.Mesh(geometry, material)
    head.position.y = 1.5
    head.name = 'head'
    return head
  }
  
  buildTorso(type: string, color: string): THREE.Mesh {
    const geometry = this.getOrCreateGeometry(`torso_${type}`, () => {
      // Box for torso
      return new THREE.BoxGeometry(0.6, 0.8, 0.3)
    })
    
    const material = this.getOrCreateMaterial(`torso_${color}`, () => {
      return new THREE.MeshStandardMaterial({ color })
    })
    
    const torso = new THREE.Mesh(geometry, material)
    torso.position.y = 0.9
    torso.name = 'torso'
    return torso
  }
  
  assembleAvatar(parts: AvatarParts): THREE.Group {
    const avatarGroup = new THREE.Group()
    avatarGroup.name = 'avatar'
    
    avatarGroup.add(parts.head)
    avatarGroup.add(parts.torso)
    avatarGroup.add(parts.arms)
    avatarGroup.add(parts.legs)
    
    parts.accessories.forEach(accessory => {
      avatarGroup.add(accessory)
    })
    
    return avatarGroup
  }
  
  private getOrCreateGeometry(
    key: string,
    factory: () => THREE.BufferGeometry
  ): THREE.BufferGeometry {
    if (!this.geometryCache.has(key)) {
      this.geometryCache.set(key, factory())
    }
    return this.geometryCache.get(key)!
  }
  
  private getOrCreateMaterial(
    key: string,
    factory: () => THREE.Material
  ): THREE.Material {
    if (!this.materialCache.has(key)) {
      this.materialCache.set(key, factory())
    }
    return this.materialCache.get(key)!
  }
}
```


### 3. Animation Controller

**Animation Interface:**
```typescript
interface AnimationController {
  playAnimation(state: AnimationState): void
  getCurrentState(): AnimationState
  update(deltaTime: number): void
  onAnimationComplete(callback: () => void): void
}

interface AnimationClip {
  state: AnimationState
  duration: number
  loop: boolean
  keyframes: Keyframe[]
}

interface Keyframe {
  time: number
  position?: THREE.Vector3
  rotation?: THREE.Euler
  scale?: THREE.Vector3
}
```

**Animation Implementation:**
```typescript
class AnimationControllerImpl implements AnimationController {
  private currentState: AnimationState = 'idle'
  private currentTime: number = 0
  private currentClip: AnimationClip | null = null
  private mesh: THREE.Group
  private onCompleteCallback: (() => void) | null = null
  
  constructor(mesh: THREE.Group) {
    this.mesh = mesh
  }
  
  playAnimation(state: AnimationState): void {
    if (this.currentState === state) return
    
    this.currentState = state
    this.currentTime = 0
    this.currentClip = this.getAnimationClip(state)
  }
  
  update(deltaTime: number): void {
    if (!this.currentClip) return
    
    this.currentTime += deltaTime
    
    // Check if animation complete
    if (this.currentTime >= this.currentClip.duration) {
      if (this.currentClip.loop) {
        this.currentTime = 0
      } else {
        // Non-looping animations return to idle
        if (this.currentState !== 'idle' && 
            this.currentState !== 'victory' && 
            this.currentState !== 'defeat') {
          this.playAnimation('idle')
        }
        
        if (this.onCompleteCallback) {
          this.onCompleteCallback()
          this.onCompleteCallback = null
        }
        return
      }
    }
    
    // Apply keyframe interpolation
    this.applyKeyframes(this.currentTime)
  }
  
  private getAnimationClip(state: AnimationState): AnimationClip {
    switch (state) {
      case 'idle':
        return {
          state: 'idle',
          duration: 2.0,
          loop: true,
          keyframes: [
            { time: 0, position: new THREE.Vector3(0, 0, 0) },
            { time: 1.0, position: new THREE.Vector3(0, 0.1, 0) },
            { time: 2.0, position: new THREE.Vector3(0, 0, 0) }
          ]
        }
      
      case 'attack':
        return {
          state: 'attack',
          duration: 0.5,
          loop: false,
          keyframes: [
            { time: 0, position: new THREE.Vector3(0, 0, 0) },
            { time: 0.2, position: new THREE.Vector3(0.5, 0, 0.5) },
            { time: 0.5, position: new THREE.Vector3(0, 0, 0) }
          ]
        }
      
      case 'defend':
        return {
          state: 'defend',
          duration: 0.3,
          loop: false,
          keyframes: [
            { time: 0, scale: new THREE.Vector3(1, 1, 1) },
            { time: 0.15, scale: new THREE.Vector3(0.9, 1.1, 0.9) },
            { time: 0.3, scale: new THREE.Vector3(1, 1, 1) }
          ]
        }
      
      case 'damaged':
        return {
          state: 'damaged',
          duration: 0.4,
          loop: false,
          keyframes: [
            { time: 0, rotation: new THREE.Euler(0, 0, 0) },
            { time: 0.1, rotation: new THREE.Euler(0, 0, 0.2) },
            { time: 0.2, rotation: new THREE.Euler(0, 0, -0.2) },
            { time: 0.4, rotation: new THREE.Euler(0, 0, 0) }
          ]
        }
      
      case 'victory':
        return {
          state: 'victory',
          duration: 1.0,
          loop: false,
          keyframes: [
            { time: 0, position: new THREE.Vector3(0, 0, 0) },
            { time: 0.5, position: new THREE.Vector3(0, 0.5, 0) },
            { time: 1.0, position: new THREE.Vector3(0, 0.3, 0) }
          ]
        }
      
      case 'defeat':
        return {
          state: 'defeat',
          duration: 1.0,
          loop: false,
          keyframes: [
            { time: 0, rotation: new THREE.Euler(0, 0, 0) },
            { time: 1.0, rotation: new THREE.Euler(Math.PI / 2, 0, 0) }
          ]
        }
      
      default:
        return this.getAnimationClip('idle')
    }
  }
  
  private applyKeyframes(time: number): void {
    if (!this.currentClip) return
    
    // Find surrounding keyframes
    const keyframes = this.currentClip.keyframes
    let prevFrame = keyframes[0]
    let nextFrame = keyframes[keyframes.length - 1]
    
    for (let i = 0; i < keyframes.length - 1; i++) {
      if (time >= keyframes[i].time && time <= keyframes[i + 1].time) {
        prevFrame = keyframes[i]
        nextFrame = keyframes[i + 1]
        break
      }
    }
    
    // Interpolate between keyframes
    const t = (time - prevFrame.time) / (nextFrame.time - prevFrame.time)
    
    if (prevFrame.position && nextFrame.position) {
      this.mesh.position.lerpVectors(prevFrame.position, nextFrame.position, t)
    }
    
    if (prevFrame.rotation && nextFrame.rotation) {
      this.mesh.rotation.set(
        THREE.MathUtils.lerp(prevFrame.rotation.x, nextFrame.rotation.x, t),
        THREE.MathUtils.lerp(prevFrame.rotation.y, nextFrame.rotation.y, t),
        THREE.MathUtils.lerp(prevFrame.rotation.z, nextFrame.rotation.z, t)
      )
    }
    
    if (prevFrame.scale && nextFrame.scale) {
      this.mesh.scale.lerpVectors(prevFrame.scale, nextFrame.scale, t)
    }
  }
}
```


### 4. Camera Controller

**Camera Interface:**
```typescript
interface CameraController {
  setTarget(target: THREE.Vector3): void
  orbit(deltaX: number, deltaY: number): void
  zoom(delta: number): void
  update(deltaTime: number): void
  reset(): void
}

interface CameraConfig {
  minDistance: number
  maxDistance: number
  minPolarAngle: number
  maxPolarAngle: number
  dampingFactor: number
}
```

**Camera Implementation:**
```typescript
class CameraControllerImpl implements CameraController {
  private camera: THREE.PerspectiveCamera
  private target: THREE.Vector3 = new THREE.Vector3(0, 1, 0)
  private distance: number = 5
  private azimuthAngle: number = 0
  private polarAngle: number = Math.PI / 4
  private config: CameraConfig
  
  // Smooth damping
  private targetDistance: number = 5
  private targetAzimuth: number = 0
  private targetPolar: number = Math.PI / 4
  
  constructor(camera: THREE.PerspectiveCamera, config: CameraConfig) {
    this.camera = camera
    this.config = config
    this.targetDistance = this.distance
    this.targetAzimuth = this.azimuthAngle
    this.targetPolar = this.polarAngle
  }
  
  setTarget(target: THREE.Vector3): void {
    this.target.copy(target)
  }
  
  orbit(deltaX: number, deltaY: number): void {
    this.targetAzimuth += deltaX * 0.01
    this.targetPolar = THREE.MathUtils.clamp(
      this.targetPolar + deltaY * 0.01,
      this.config.minPolarAngle,
      this.config.maxPolarAngle
    )
  }
  
  zoom(delta: number): void {
    this.targetDistance = THREE.MathUtils.clamp(
      this.targetDistance + delta * 0.1,
      this.config.minDistance,
      this.config.maxDistance
    )
  }
  
  update(deltaTime: number): void {
    // Smooth damping
    const dampingFactor = 1 - Math.pow(this.config.dampingFactor, deltaTime)
    
    this.distance = THREE.MathUtils.lerp(
      this.distance,
      this.targetDistance,
      dampingFactor
    )
    
    this.azimuthAngle = THREE.MathUtils.lerp(
      this.azimuthAngle,
      this.targetAzimuth,
      dampingFactor
    )
    
    this.polarAngle = THREE.MathUtils.lerp(
      this.polarAngle,
      this.targetPolar,
      dampingFactor
    )
    
    // Calculate camera position from spherical coordinates
    const x = this.distance * Math.sin(this.polarAngle) * Math.cos(this.azimuthAngle)
    const y = this.distance * Math.cos(this.polarAngle)
    const z = this.distance * Math.sin(this.polarAngle) * Math.sin(this.azimuthAngle)
    
    this.camera.position.set(
      this.target.x + x,
      this.target.y + y,
      this.target.z + z
    )
    
    this.camera.lookAt(this.target)
  }
  
  reset(): void {
    this.targetDistance = 5
    this.targetAzimuth = 0
    this.targetPolar = Math.PI / 4
  }
}
```


### 5. Lighting System

**Lighting Interface:**
```typescript
interface LightingSystem {
  setupLights(scene: THREE.Scene): void
  updateLightIntensity(lightName: string, intensity: number): void
  updateLightPosition(lightName: string, position: THREE.Vector3): void
}

interface LightConfig {
  ambient: {
    color: number
    intensity: number
  }
  directional: {
    color: number
    intensity: number
    position: THREE.Vector3
  }
  point?: {
    color: number
    intensity: number
    position: THREE.Vector3
    distance: number
  }
}
```

**Lighting Implementation:**
```typescript
class LightingSystemImpl implements LightingSystem {
  private lights: Map<string, THREE.Light> = new Map()
  
  setupLights(scene: THREE.Scene): void {
    // Ambient light for base illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    ambientLight.name = 'ambient'
    scene.add(ambientLight)
    this.lights.set('ambient', ambientLight)
    
    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(5, 10, 5)
    directionalLight.castShadow = true
    directionalLight.name = 'directional'
    scene.add(directionalLight)
    this.lights.set('directional', directionalLight)
    
    // Optional point light for highlights
    const pointLight = new THREE.PointLight(0xffffff, 0.5, 10)
    pointLight.position.set(0, 3, 2)
    pointLight.name = 'point'
    scene.add(pointLight)
    this.lights.set('point', pointLight)
  }
  
  updateLightIntensity(lightName: string, intensity: number): void {
    const light = this.lights.get(lightName)
    if (light) {
      light.intensity = intensity
    }
  }
  
  updateLightPosition(lightName: string, position: THREE.Vector3): void {
    const light = this.lights.get(lightName)
    if (light) {
      light.position.copy(position)
    }
  }
}
```


### 6. Avatar Presets

**Preset Interface:**
```typescript
interface AvatarPreset {
  id: string
  name: string
  customization: CustomizationData
}

interface PresetManager {
  getPreset(id: string): AvatarPreset | null
  getAllPresets(): AvatarPreset[]
  createPreset(name: string, customization: CustomizationData): AvatarPreset
  savePreset(preset: AvatarPreset): void
}
```

**Preset Definitions:**
```typescript
const PLAYER_PRESET: AvatarPreset = {
  id: 'player_default',
  name: 'Player Default',
  customization: {
    bodyParts: {
      head: 'default',
      torso: 'default',
      arms: 'default',
      legs: 'default'
    },
    colors: {
      skin: '#ffdbac',
      hair: '#8b4513',
      clothing: '#4169e1'
    },
    accessories: {
      weapon: 'sword'
    }
  }
}

const AI_PRESET: AvatarPreset = {
  id: 'ai_default',
  name: 'AI Opponent',
  customization: {
    bodyParts: {
      head: 'default',
      torso: 'default',
      arms: 'default',
      legs: 'default'
    },
    colors: {
      skin: '#d4a574',
      hair: '#2c1810',
      clothing: '#dc143c'
    },
    accessories: {
      weapon: 'axe',
      shield: 'round'
    }
  }
}

class PresetManagerImpl implements PresetManager {
  private presets: Map<string, AvatarPreset> = new Map()
  
  constructor() {
    this.presets.set(PLAYER_PRESET.id, PLAYER_PRESET)
    this.presets.set(AI_PRESET.id, AI_PRESET)
  }
  
  getPreset(id: string): AvatarPreset | null {
    return this.presets.get(id) || null
  }
  
  getAllPresets(): AvatarPreset[] {
    return Array.from(this.presets.values())
  }
  
  createPreset(name: string, customization: CustomizationData): AvatarPreset {
    const preset: AvatarPreset = {
      id: `custom_${Date.now()}`,
      name,
      customization
    }
    this.presets.set(preset.id, preset)
    return preset
  }
  
  savePreset(preset: AvatarPreset): void {
    this.presets.set(preset.id, preset)
  }
}
```


### 7. Combat Integration

**Combat Event Listener:**
```typescript
interface CombatEventListener {
  onPlayerAttack(): void
  onAIAttack(): void
  onPlayerDamaged(damage: number): void
  onAIDamaged(damage: number): void
  onVictory(): void
  onDefeat(): void
}

class AvatarCombatIntegration implements CombatEventListener {
  private avatarSystem: AvatarSystem
  private playerAvatarId: string
  private aiAvatarId: string
  
  constructor(
    avatarSystem: AvatarSystem,
    playerAvatarId: string,
    aiAvatarId: string
  ) {
    this.avatarSystem = avatarSystem
    this.playerAvatarId = playerAvatarId
    this.aiAvatarId = aiAvatarId
  }
  
  onPlayerAttack(): void {
    this.avatarSystem.playAnimation(this.playerAvatarId, 'attack')
  }
  
  onAIAttack(): void {
    this.avatarSystem.playAnimation(this.aiAvatarId, 'attack')
  }
  
  onPlayerDamaged(damage: number): void {
    this.avatarSystem.playAnimation(this.playerAvatarId, 'damaged')
  }
  
  onAIDamaged(damage: number): void {
    this.avatarSystem.playAnimation(this.aiAvatarId, 'damaged')
  }
  
  onVictory(): void {
    this.avatarSystem.playAnimation(this.playerAvatarId, 'victory')
    this.avatarSystem.playAnimation(this.aiAvatarId, 'defeat')
  }
  
  onDefeat(): void {
    this.avatarSystem.playAnimation(this.playerAvatarId, 'defeat')
    this.avatarSystem.playAnimation(this.aiAvatarId, 'victory')
  }
}
```

**XState Integration:**
```typescript
// In combat scene setup
function setupAvatarIntegration(
  combatService: any,
  avatarIntegration: AvatarCombatIntegration
): void {
  combatService.subscribe((state: any) => {
    // Listen for state transitions
    if (state.matches('CARD_PLAY')) {
      const turn = state.context.currentTurn
      if (turn === 'player') {
        avatarIntegration.onPlayerAttack()
      } else {
        avatarIntegration.onAIAttack()
      }
    }
    
    if (state.matches('RESOLVE')) {
      const turn = state.context.currentTurn
      if (turn === 'player') {
        avatarIntegration.onAIDamaged(state.context.selectedCard?.stats.attack || 0)
      } else {
        avatarIntegration.onPlayerDamaged(state.context.selectedCard?.stats.attack || 0)
      }
    }
    
    if (state.matches('END')) {
      const winner = state.context.winner
      if (winner === 'player') {
        avatarIntegration.onVictory()
      } else if (winner === 'opponent') {
        avatarIntegration.onDefeat()
      }
    }
  })
}
```


### 8. State Persistence

**Persistence Interface:**
```typescript
interface AvatarPersistence {
  saveCustomization(avatarId: string, data: CustomizationData): void
  loadCustomization(avatarId: string): CustomizationData | null
  clearCustomization(avatarId: string): void
}

class LocalStoragePersistence implements AvatarPersistence {
  private readonly STORAGE_KEY_PREFIX = 'avatar_customization_'
  
  saveCustomization(avatarId: string, data: CustomizationData): void {
    try {
      const key = this.STORAGE_KEY_PREFIX + avatarId
      const serialized = JSON.stringify(data)
      localStorage.setItem(key, serialized)
    } catch (error) {
      console.warn('Failed to save avatar customization:', error)
    }
  }
  
  loadCustomization(avatarId: string): CustomizationData | null {
    try {
      const key = this.STORAGE_KEY_PREFIX + avatarId
      const serialized = localStorage.getItem(key)
      if (!serialized) return null
      return JSON.parse(serialized)
    } catch (error) {
      console.warn('Failed to load avatar customization:', error)
      return null
    }
  }
  
  clearCustomization(avatarId: string): void {
    try {
      const key = this.STORAGE_KEY_PREFIX + avatarId
      localStorage.removeItem(key)
    } catch (error) {
      console.warn('Failed to clear avatar customization:', error)
    }
  }
}
```

**Customization Validation:**
```typescript
function validateCustomizationData(data: any): data is CustomizationData {
  if (!data || typeof data !== 'object') return false
  
  // Check bodyParts
  if (!data.bodyParts || typeof data.bodyParts !== 'object') return false
  const requiredParts = ['head', 'torso', 'arms', 'legs']
  if (!requiredParts.every(part => typeof data.bodyParts[part] === 'string')) {
    return false
  }
  
  // Check colors
  if (!data.colors || typeof data.colors !== 'object') return false
  const requiredColors = ['skin', 'hair', 'clothing']
  if (!requiredColors.every(color => typeof data.colors[color] === 'string')) {
    return false
  }
  
  // Check accessories (optional)
  if (data.accessories && typeof data.accessories !== 'object') return false
  
  return true
}
```


### 9. Performance Optimization

**LOD System:**
```typescript
interface LODSystem {
  updateLOD(camera: THREE.Camera, avatars: Avatar[]): void
  setLODDistances(near: number, far: number): void
}

class LODSystemImpl implements LODSystem {
  private nearDistance: number = 5
  private farDistance: number = 15
  
  setLODDistances(near: number, far: number): void {
    this.nearDistance = near
    this.farDistance = far
  }
  
  updateLOD(camera: THREE.Camera, avatars: Avatar[]): void {
    avatars.forEach(avatar => {
      const distance = camera.position.distanceTo(avatar.mesh.position)
      
      if (distance < this.nearDistance) {
        this.setHighDetail(avatar)
      } else if (distance < this.farDistance) {
        this.setMediumDetail(avatar)
      } else {
        this.setLowDetail(avatar)
      }
    })
  }
  
  private setHighDetail(avatar: Avatar): void {
    avatar.mesh.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.visible = true
        // Use high-poly geometry
      }
    })
  }
  
  private setMediumDetail(avatar: Avatar): void {
    avatar.mesh.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.visible = true
        // Use medium-poly geometry
      }
    })
  }
  
  private setLowDetail(avatar: Avatar): void {
    avatar.mesh.traverse(child => {
      if (child instanceof THREE.Mesh) {
        // Hide accessories, simplify geometry
        if (child.name.includes('accessory')) {
          child.visible = false
        }
      }
    })
  }
}
```

**Performance Monitor:**
```typescript
interface PerformanceMonitor {
  recordFrameTime(frameTime: number): void
  getAverageFPS(): number
  shouldReduceQuality(): boolean
}

class PerformanceMonitorImpl implements PerformanceMonitor {
  private frameTimes: number[] = []
  private readonly MAX_SAMPLES = 60
  private readonly FPS_THRESHOLD = 55
  
  recordFrameTime(frameTime: number): void {
    this.frameTimes.push(frameTime)
    if (this.frameTimes.length > this.MAX_SAMPLES) {
      this.frameTimes.shift()
    }
  }
  
  getAverageFPS(): number {
    if (this.frameTimes.length === 0) return 60
    
    const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length
    return 1000 / avgFrameTime
  }
  
  shouldReduceQuality(): boolean {
    return this.getAverageFPS() < this.FPS_THRESHOLD
  }
}
```


### 10. 2D Sprite Fallback

**Fallback Interface:**
```typescript
interface SpriteFallback {
  initialize(canvas: HTMLCanvasElement): void
  renderAvatar(avatarId: string, state: AnimationState, position: { x: number; y: number }): void
  updateCustomization(avatarId: string, customization: CustomizationData): void
  dispose(): void
}

interface SpriteSheet {
  image: HTMLImageElement
  frameWidth: number
  frameHeight: number
  animations: Map<AnimationState, SpriteAnimation>
}

interface SpriteAnimation {
  frames: number[]
  frameDuration: number
  loop: boolean
}
```

**Sprite Fallback Implementation:**
```typescript
class SpriteFallbackImpl implements SpriteFallback {
  private ctx: CanvasRenderingContext2D | null = null
  private spriteSheets: Map<string, SpriteSheet> = new Map()
  private currentFrames: Map<string, number> = new Map()
  private frameTimers: Map<string, number> = new Map()
  
  async initialize(canvas: HTMLCanvasElement): Promise<void> {
    this.ctx = canvas.getContext('2d')
    if (!this.ctx) {
      throw new Error('Failed to get 2D context')
    }
    
    // Load sprite sheets
    await this.loadSpriteSheets()
  }
  
  private async loadSpriteSheets(): Promise<void> {
    const playerSheet = await this.loadSpriteSheet('/assets/sprites/player.png')
    this.spriteSheets.set('player', playerSheet)
    
    const aiSheet = await this.loadSpriteSheet('/assets/sprites/ai.png')
    this.spriteSheets.set('ai', aiSheet)
  }
  
  private async loadSpriteSheet(url: string): Promise<SpriteSheet> {
    const image = new Image()
    await new Promise((resolve, reject) => {
      image.onload = resolve
      image.onerror = reject
      image.src = url
    })
    
    return {
      image,
      frameWidth: 64,
      frameHeight: 64,
      animations: new Map([
        ['idle', { frames: [0, 1, 2, 3], frameDuration: 200, loop: true }],
        ['attack', { frames: [4, 5, 6], frameDuration: 100, loop: false }],
        ['defend', { frames: [7, 8], frameDuration: 150, loop: false }],
        ['damaged', { frames: [9, 10, 9], frameDuration: 100, loop: false }],
        ['victory', { frames: [11, 12, 13], frameDuration: 200, loop: false }],
        ['defeat', { frames: [14, 15], frameDuration: 300, loop: false }]
      ])
    }
  }
  
  renderAvatar(
    avatarId: string,
    state: AnimationState,
    position: { x: number; y: number }
  ): void {
    if (!this.ctx) return
    
    const spriteSheet = this.spriteSheets.get(avatarId)
    if (!spriteSheet) return
    
    const animation = spriteSheet.animations.get(state)
    if (!animation) return
    
    // Update frame
    const now = Date.now()
    const lastFrameTime = this.frameTimers.get(avatarId) || 0
    if (now - lastFrameTime > animation.frameDuration) {
      const currentFrame = this.currentFrames.get(avatarId) || 0
      const nextFrame = (currentFrame + 1) % animation.frames.length
      this.currentFrames.set(avatarId, nextFrame)
      this.frameTimers.set(avatarId, now)
    }
    
    // Draw sprite
    const frameIndex = this.currentFrames.get(avatarId) || 0
    const spriteIndex = animation.frames[frameIndex]
    const sx = (spriteIndex % 4) * spriteSheet.frameWidth
    const sy = Math.floor(spriteIndex / 4) * spriteSheet.frameHeight
    
    this.ctx.drawImage(
      spriteSheet.image,
      sx, sy,
      spriteSheet.frameWidth, spriteSheet.frameHeight,
      position.x, position.y,
      spriteSheet.frameWidth, spriteSheet.frameHeight
    )
  }
  
  updateCustomization(avatarId: string, customization: CustomizationData): void {
    // For 2D sprites, customization would require different sprite sheets
    // or color tinting via canvas operations
    console.log('Sprite customization not fully implemented')
  }
  
  dispose(): void {
    this.spriteSheets.clear()
    this.currentFrames.clear()
    this.frameTimers.clear()
  }
}
```


## Data Models

### Zustand Store Extension

```typescript
interface AvatarStore {
  // Avatar State
  avatars: {
    player: {
      id: string
      customization: CustomizationData
      currentAnimation: AnimationState
    }
    ai: {
      id: string
      customization: CustomizationData
      currentAnimation: AnimationState
    }
  }
  
  // Camera State
  camera: {
    distance: number
    azimuth: number
    polar: number
  }
  
  // System State
  system: {
    isWebGLAvailable: boolean
    useFallback: boolean
    performanceMode: 'high' | 'medium' | 'low'
  }
  
  // Actions
  actions: {
    initializeAvatarSystem: (canvas: HTMLCanvasElement) => Promise<void>
    updateAvatarCustomization: (avatarId: string, data: CustomizationData) => void
    playAvatarAnimation: (avatarId: string, state: AnimationState) => void
    orbitCamera: (deltaX: number, deltaY: number) => void
    zoomCamera: (delta: number) => void
    resetCamera: () => void
    saveCustomization: (avatarId: string) => void
    loadCustomization: (avatarId: string) => void
  }
}
```

### Customization Data Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "bodyParts": {
      "type": "object",
      "properties": {
        "head": { "type": "string" },
        "torso": { "type": "string" },
        "arms": { "type": "string" },
        "legs": { "type": "string" }
      },
      "required": ["head", "torso", "arms", "legs"]
    },
    "colors": {
      "type": "object",
      "properties": {
        "skin": { "type": "string", "pattern": "^#[0-9a-fA-F]{6}$" },
        "hair": { "type": "string", "pattern": "^#[0-9a-fA-F]{6}$" },
        "clothing": { "type": "string", "pattern": "^#[0-9a-fA-F]{6}$" }
      },
      "required": ["skin", "hair", "clothing"]
    },
    "accessories": {
      "type": "object",
      "properties": {
        "hat": { "type": "string" },
        "weapon": { "type": "string" },
        "shield": { "type": "string" }
      }
    }
  },
  "required": ["bodyParts", "colors"]
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, the following consolidations were made:

**Redundancies Eliminated:**
- Properties 3.2 and 2.3 both test customization application - consolidated into single property
- Properties 6.1-6.4 (combat event animations) can be consolidated into one comprehensive property
- Properties 7.3 and 7.4 (drag/scroll inputs) are specific examples of 7.1 and 7.2 (orbit/zoom)
- Properties 9.1, 9.2, 9.3 (serialization, storage, retrieval) are best tested as a single round-trip property

**Properties Combined:**
- Avatar mesh structure (2.1, 2.2, 2.5) combined into single structural invariant property
- Animation state behavior (5.4, 5.5) combined into single animation completion property
- LOD and frustum culling (10.1, 10.2) combined into single performance optimization property

**Unique Properties Retained:**
- Canvas resize handling (1.4)
- Customization validation (3.5)
- Preset loading (4.3)
- Preset serialization round-trip (4.5)
- Animation state transitions (5.2)
- Camera zoom constraints (7.2)
- Camera movement smoothing (7.5)
- Lighting updates (8.4)
- Customization persistence round-trip (9.3)
- Geometry/material reuse (10.3)
- Performance-based quality reduction (10.5)
- WebGL detection (11.1)
- Sprite animation mapping (11.3)
- State validation without rendering (12.4)


### Correctness Properties

Property 1: Frame rate consistency
*For any* 60-frame window during avatar rendering, the average FPS should be at least 60 (allowing for minor variance)
**Validates: Requirements 1.3**

Property 2: Canvas resize updates renderer and camera
*For any* canvas resize event with new dimensions, the renderer size and camera aspect ratio should be updated to match
**Validates: Requirements 1.4**

Property 3: Avatar mesh structural invariant
*For any* created avatar, the mesh should be a THREE.Group containing exactly four body part components (head, torso, arms, legs) with consistent scale and positioning
**Validates: Requirements 2.1, 2.2, 2.5**

Property 4: Customization application updates avatar
*For any* valid customization data applied to an avatar, the avatar's materials and geometries should reflect the new body parts, colors, and accessories
**Validates: Requirements 2.3, 3.2**

Property 5: Accessory attachment points exist
*For any* accessory type (hat, weapon, shield), there should be a valid attachment point in the avatar mesh hierarchy
**Validates: Requirements 2.4**

Property 6: Customization data validation
*For any* customization data, the system should accept it if valid and reject it if invalid (missing required fields or invalid format)
**Validates: Requirements 3.1, 3.5**

Property 7: Color customization updates materials
*For any* valid RGB color value applied to a body part, that body part's material color should be updated to match
**Validates: Requirements 3.3**


Property 8: Accessory attachment
*For any* accessory type and avatar, attaching the accessory should add it to the avatar's mesh hierarchy at the correct attachment point
**Validates: Requirements 3.4**

Property 9: Preset loading applies all settings
*For any* avatar preset, loading it should apply all customization settings (body parts, colors, accessories) to the avatar
**Validates: Requirements 4.3**

Property 10: Preset extension with modifications
*For any* preset and any valid customization modification, the system should allow combining them to create a new customization
**Validates: Requirements 4.4**

Property 11: Preset serialization round trip
*For any* valid avatar preset, serializing to JSON then deserializing should produce an equivalent preset
**Validates: Requirements 4.5**

Property 12: Animation state transitions are smooth
*For any* two animation states, transitioning from one to the other should interpolate smoothly without jarring position/rotation jumps
**Validates: Requirements 5.2**

Property 13: Non-looping animations return to idle
*For any* non-looping animation state (attack, defend, damaged), after the animation completes, the avatar should return to idle state
**Validates: Requirements 5.4**

Property 14: Terminal animations do not return to idle
*For any* terminal animation state (victory, defeat), the animation should hold without returning to idle
**Validates: Requirements 5.5**


Property 15: Combat events trigger avatar animations
*For any* combat state machine event (player attack, AI attack, player damaged, AI damaged), the corresponding avatar animation should play
**Validates: Requirements 6.1, 6.2, 6.3, 6.4**

Property 16: Camera orbit rotates around target
*For any* orbit input (deltaX, deltaY), the camera should rotate around the target avatar by the corresponding angles
**Validates: Requirements 7.1, 7.3**

Property 17: Camera zoom respects distance constraints
*For any* zoom input, the resulting camera distance should be clamped between minimum and maximum distance values
**Validates: Requirements 7.2, 7.4**

Property 18: Camera movements are smoothly interpolated
*For any* camera movement (orbit or zoom), the camera position should interpolate smoothly using easing rather than jumping instantly
**Validates: Requirements 7.5**

Property 19: Lighting configuration updates scene lights
*For any* light property change (intensity, position, color), the corresponding light in the scene should be updated
**Validates: Requirements 8.4**

Property 20: Customization persistence round trip
*For any* valid customization data, saving to localStorage then loading should produce equivalent customization data
**Validates: Requirements 9.1, 9.2, 9.3**

Property 21: localStorage errors are handled gracefully
*For any* localStorage error (quota exceeded, unavailable), the system should continue functioning without crashing
**Validates: Requirements 9.5**


Property 22: LOD adjusts detail based on camera distance
*For any* camera distance, avatars should use high detail when near, medium detail at mid-range, and low detail when far
**Validates: Requirements 10.1, 10.2**

Property 23: Geometry and material reuse across avatars
*For any* two avatars with the same body part type, they should share the same geometry and material instances (not create duplicates)
**Validates: Requirements 10.3**

Property 24: Draw call batching reduces render calls
*For any* scene with multiple avatars, the number of draw calls should be less than the sum of individual mesh counts (due to batching)
**Validates: Requirements 10.4**

Property 25: Performance-based quality reduction
*For any* 60-frame window where average FPS drops below 55, the system should automatically reduce rendering quality
**Validates: Requirements 10.5**

Property 26: WebGL availability detection
*For any* browser environment, the WebGL detection should correctly identify whether WebGL is available
**Validates: Requirements 11.1**

Property 27: Sprite animation state mapping
*For any* animation state, there should be a corresponding sprite animation with appropriate frames
**Validates: Requirements 11.3**

Property 28: Sprite positioning matches 3D avatar position
*For any* avatar position in 3D space, the 2D sprite fallback should render at the equivalent screen position
**Validates: Requirements 11.4**

Property 29: Customization works in both 3D and 2D modes
*For any* customization option, it should produce visual changes in both 3D rendering and 2D sprite fallback
**Validates: Requirements 11.5**

Property 30: State validation without rendering
*For any* avatar state transition, validation should succeed or fail correctly without requiring actual WebGL rendering
**Validates: Requirements 12.4**


## Error Handling

### Three.js Initialization Errors

**WebGL Context Creation Failure:**
- Detect: `getContext('webgl')` returns null
- Handle: Fall back to 2D sprite rendering
- Recovery: Display message to user about limited graphics

**Canvas Not Found:**
- Detect: Canvas element is null or undefined
- Handle: Throw initialization error
- Recovery: Prevent avatar system from starting, log error

**Renderer Creation Failure:**
- Detect: THREE.WebGLRenderer constructor throws
- Handle: Fall back to 2D sprite rendering
- Recovery: Continue with sprite-based avatars

### Animation Errors

**Invalid Animation State:**
- Detect: Animation state not in allowed set
- Handle: Default to 'idle' state
- Recovery: Log warning, continue with idle animation

**Animation Clip Not Found:**
- Detect: No animation clip defined for state
- Handle: Use idle animation as fallback
- Recovery: Continue gameplay with fallback animation

**Keyframe Interpolation Error:**
- Detect: Invalid keyframe data (missing time/values)
- Handle: Skip interpolation for that frame
- Recovery: Continue with last valid position/rotation

### Customization Errors

**Invalid Customization Data:**
- Detect: Validation fails (missing fields, wrong types)
- Handle: Reject customization, keep current state
- Recovery: Display error message to user

**Asset Loading Failure:**
- Detect: Geometry or texture load fails
- Handle: Use default/fallback asset
- Recovery: Continue with simplified avatar

**Color Parse Error:**
- Detect: Invalid color string format
- Handle: Use default color for that body part
- Recovery: Apply other valid customizations


### Camera Errors

**Invalid Camera Parameters:**
- Detect: NaN or Infinity in camera position/rotation
- Handle: Reset camera to default position
- Recovery: Continue with reset camera

**Orbit Calculation Error:**
- Detect: Math error in spherical coordinate conversion
- Handle: Keep camera at current position
- Recovery: Skip that frame's camera update

**Zoom Out of Bounds:**
- Detect: Distance exceeds min/max constraints
- Handle: Clamp to valid range
- Recovery: Continue with clamped value

### Performance Errors

**Frame Rate Drop:**
- Detect: FPS < 55 for sustained period
- Handle: Reduce LOD level, disable effects
- Recovery: Monitor FPS, restore quality when stable

**Memory Leak Detection:**
- Detect: Memory usage grows > 300MB
- Handle: Force dispose of unused resources
- Recovery: Log warning, attempt garbage collection

**Too Many Draw Calls:**
- Detect: Draw calls > 100 per frame
- Handle: Increase batching, reduce detail
- Recovery: Continue with optimized rendering

### Persistence Errors

**localStorage Unavailable:**
- Detect: localStorage is undefined or throws
- Handle: Continue without persistence
- Recovery: Use in-memory state only

**localStorage Quota Exceeded:**
- Detect: QuotaExceededError on setItem
- Handle: Clear old data, retry save
- Recovery: If retry fails, continue without saving

**Corrupted Save Data:**
- Detect: JSON.parse fails or validation fails
- Handle: Use default preset
- Recovery: Clear corrupted data, start fresh


### Combat Integration Errors

**Combat Event Listener Failure:**
- Detect: Event subscription throws error
- Handle: Log error, continue without avatar animations
- Recovery: Gameplay continues, avatars stay in idle

**State Machine Desync:**
- Detect: Combat state doesn't match expected state
- Handle: Reset avatar animations to idle
- Recovery: Re-sync on next valid state transition

**Animation Timing Mismatch:**
- Detect: Animation completes before/after expected time
- Handle: Force animation completion or skip
- Recovery: Continue with next animation in sequence

### Sprite Fallback Errors

**Sprite Sheet Load Failure:**
- Detect: Image load error
- Handle: Display placeholder colored rectangles
- Recovery: Continue with minimal visual representation

**Canvas 2D Context Unavailable:**
- Detect: getContext('2d') returns null
- Handle: Disable avatar rendering entirely
- Recovery: Game continues without avatar visuals

**Sprite Animation Frame Missing:**
- Detect: Frame index out of bounds
- Handle: Use first frame of animation
- Recovery: Continue with available frames


## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests for comprehensive coverage:

**Unit Tests** focus on:
- Specific examples of avatar creation and customization
- Edge cases (WebGL unavailable, invalid data, missing assets)
- Error conditions (localStorage failures, animation errors)
- Integration points with combat state machine
- Specific preset configurations

**Property-Based Tests** focus on:
- Universal properties across all customization data
- Animation state transitions for all state combinations
- Camera behavior across all input ranges
- Performance characteristics across varying loads
- Serialization round-trips for all data types

Both approaches are complementary and necessary. Unit tests catch concrete bugs in specific scenarios, while property tests verify general correctness across the input space.

### Property-Based Testing Configuration

**Library:** fast-check (TypeScript/JavaScript property-based testing library)

**Configuration:**
- Minimum 100 iterations per property test
- Each test tagged with feature name and property number
- Tag format: `Feature: avatar-framework, Property {N}: {property text}`

**Example Property Test:**
```typescript
import fc from 'fast-check'
import * as THREE from 'three'

// Feature: avatar-framework, Property 6: Customization data validation
test('system accepts valid customization data and rejects invalid data', () => {
  fc.assert(
    fc.property(
      customizationDataArbitrary(),
      (data) => {
        const isValid = validateCustomizationData(data)
        
        if (isValid) {
          // Should not throw
          expect(() => avatarSystem.updateAvatar('test', data)).not.toThrow()
        } else {
          // Should reject
          expect(() => avatarSystem.updateAvatar('test', data)).toThrow()
        }
      }
    ),
    { numRuns: 100 }
  )
})
```


### Unit Testing Strategy

**Test Organization:**
- One test file per system (AvatarSystem.test.ts, AnimationController.test.ts, etc.)
- Group related tests with describe blocks
- Use beforeEach for common setup with mocked Three.js objects

**Key Unit Tests:**

1. **Avatar System:**
   - WebGL detection (available/unavailable)
   - Initialization with canvas
   - Avatar creation from presets
   - Disposal and cleanup

2. **Avatar Mesh Builder:**
   - Individual body part creation
   - Avatar assembly
   - Accessory attachment
   - Geometry/material caching

3. **Animation Controller:**
   - Each animation state playback
   - State transitions
   - Animation completion callbacks
   - Looping vs non-looping behavior

4. **Camera Controller:**
   - Orbit rotation
   - Zoom with constraints
   - Smooth interpolation
   - Reset to default

5. **Lighting System:**
   - Light creation
   - Intensity updates
   - Position updates

6. **Customization:**
   - Data validation
   - Application to avatar
   - Preset loading
   - Persistence (save/load)

7. **Combat Integration:**
   - Event listener registration
   - Animation triggers on combat events
   - State machine synchronization

8. **Sprite Fallback:**
   - Sprite sheet loading
   - Animation frame mapping
   - Rendering at correct positions


### Mocking Strategy

**Three.js Mocking:**
```typescript
// Mock Three.js objects for testing
class MockWebGLRenderer {
  domElement = document.createElement('canvas')
  setSize = vi.fn()
  render = vi.fn()
  dispose = vi.fn()
}

class MockScene {
  children: any[] = []
  add = vi.fn((obj) => this.children.push(obj))
  remove = vi.fn((obj) => {
    const index = this.children.indexOf(obj)
    if (index > -1) this.children.splice(index, 1)
  })
}

class MockPerspectiveCamera {
  position = { x: 0, y: 0, z: 5, set: vi.fn() }
  aspect = 1
  updateProjectionMatrix = vi.fn()
  lookAt = vi.fn()
}

// Dependency injection for testing
const avatarSystem = new AvatarSystemImpl({
  rendererFactory: () => new MockWebGLRenderer(),
  sceneFactory: () => new MockScene(),
  cameraFactory: () => new MockPerspectiveCamera()
})
```

**Combat State Machine Mocking:**
```typescript
// Mock XState service for testing
const mockCombatService = {
  subscribe: vi.fn((callback) => {
    // Store callback for manual triggering in tests
    return { unsubscribe: vi.fn() }
  }),
  send: vi.fn()
}
```

### Integration Testing

**Critical Integration Points:**
1. Avatar System → Combat State Machine → Animation Triggers
2. Avatar System → Game Loop → Render Updates
3. Camera Controller → Input System → Camera Movement
4. Customization → Persistence → localStorage

**Integration Test Examples:**
- Complete combat flow with avatar animations
- Customization changes persisted across page reload
- Camera controls responding to user input
- Performance degradation triggering quality reduction


### Performance Testing

**Metrics to Track:**
- FPS during avatar rendering (target: 60fps)
- Memory usage with multiple avatars (target: <100MB)
- Avatar creation time (target: <100ms)
- Animation frame time (target: <1ms)
- Draw calls per frame (target: <50)
- Geometry/material cache hit rate (target: >80%)

**Performance Test Approach:**
- Use Performance API for timing measurements
- Monitor memory with performance.memory (Chrome)
- Run tests with varying avatar counts (1, 2, 5, 10)
- Test LOD system effectiveness
- Measure impact of customization changes

### Test Coverage Goals

- Line coverage: >80%
- Branch coverage: >75%
- Property test coverage: All 30 identified properties
- Integration test coverage: All critical integration points
- Error handling coverage: All error scenarios

### Continuous Integration

**CI Pipeline:**
1. Run unit tests
2. Run property-based tests (100 iterations each)
3. Run integration tests
4. Check performance budgets
5. Generate coverage report
6. Fail if any test fails or coverage drops

**Performance Budgets in CI:**
- Avatar system bundle size: <50KB
- Three.js bundle size: <150KB (tree-shaken)
- Sprite fallback bundle size: <20KB
- Total avatar framework: <220KB

### Test Utilities

**Arbitraries for Property Testing:**
```typescript
// Generate random customization data
const customizationDataArbitrary = () => fc.record({
  bodyParts: fc.record({
    head: fc.constantFrom('default', 'round', 'square'),
    torso: fc.constantFrom('default', 'slim', 'broad'),
    arms: fc.constantFrom('default', 'long', 'short'),
    legs: fc.constantFrom('default', 'long', 'short')
  }),
  colors: fc.record({
    skin: fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => '#' + s),
    hair: fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => '#' + s),
    clothing: fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => '#' + s)
  }),
  accessories: fc.record({
    hat: fc.option(fc.constantFrom('cap', 'helmet', 'crown')),
    weapon: fc.option(fc.constantFrom('sword', 'axe', 'staff')),
    shield: fc.option(fc.constantFrom('round', 'kite', 'tower'))
  })
})

// Generate random animation states
const animationStateArbitrary = () => 
  fc.constantFrom('idle', 'attack', 'defend', 'victory', 'defeat', 'damaged')

// Generate random camera inputs
const cameraOrbitArbitrary = () => fc.record({
  deltaX: fc.float({ min: -100, max: 100 }),
  deltaY: fc.float({ min: -100, max: 100 })
})

const cameraZoomArbitrary = () => 
  fc.float({ min: -10, max: 10 })
```
