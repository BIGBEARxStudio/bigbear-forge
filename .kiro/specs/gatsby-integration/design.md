# Gatsby Integration Design

## Architecture Overview

```
Gatsby Pages
├── index.tsx (Landing)
├── game.tsx (Game Container)
└── 404.tsx (Not Found)

Layouts
├── GameLayout.tsx (Full-screen game container)
└── MenuLayout.tsx (Centered menu container)

Integration Layer
├── GameController.tsx (Orchestrates scenes and systems)
└── SceneRenderer.tsx (Renders active scene)
```

## Page Flow

```
Index Page (/)
    ↓ [Play Button]
Game Page (/game)
    ↓ [Load MainMenuScene]
Main Menu Scene
    ↓ [Start Battle]
Combat Scene
    ↓ [Battle Complete]
Victory/Defeat Scene
    ↓ [Play Again] → Combat Scene
    ↓ [Main Menu] → Main Menu Scene
```

## Component Hierarchy

### Game Page Structure
```tsx
<GameLayout>
  <GameController>
    <SceneRenderer scene={currentScene}>
      {/* Scene-specific content */}
      <MainMenuScene />
      <CombatScene>
        <AvatarCanvas />
        <BattlefieldComponent />
        <CardHandComponent />
      </CombatScene>
      <VictoryDefeatScene />
    </SceneRenderer>
    <PerformanceMonitorComponent />
  </GameController>
</GameLayout>
```

## State Management

### Global State (Zustand)
- Game state (current scene, game loop status)
- Combat state (HP, cards, turn)
- Avatar state (customizations, animations)
- Settings (volume, performance monitor)

### Local State (React)
- UI interactions (hover, focus)
- Loading states
- Error states

## Scene Lifecycle

### Scene Mounting
1. Call `scene.load()` - Load assets
2. Show loading indicator
3. Call `scene.enter()` - Initialize scene
4. Start game loop if needed
5. Render scene content

### Scene Unmounting
1. Call `scene.exit()` - Pause/stop systems
2. Save state if needed
3. Call `scene.cleanup()` - Release resources
4. Transition to next scene

## Asset Loading Strategy

### Critical Assets (Preload)
- Card database JSON
- UI sound effects
- Main menu background

### Scene Assets (Lazy Load)
- Combat scene: Card images, combat sounds
- Avatar scene: 3D models, textures
- Victory scene: Victory/defeat sounds

### Loading Screen
- Progress bar showing asset load progress
- Animated loading indicator
- Minimum display time to avoid flashing

## Performance Optimizations

### Code Splitting
```tsx
// Lazy load scenes
const MainMenuScene = lazy(() => import('../scenes/MainMenuScene'));
const CombatScene = lazy(() => import('../scenes/CombatScene'));
const VictoryDefeatScene = lazy(() => import('../scenes/VictoryDefeatScene'));
```

### Asset Optimization
- Use WebP for images with PNG fallback
- Compress audio to OGG/MP3
- Sprite sheets for card artwork
- Texture atlasing for 3D assets

### Render Optimization
- React.memo for expensive components
- useMemo for computed values
- useCallback for event handlers
- Zustand selective subscriptions

## Error Boundaries

### Game Error Boundary
```tsx
<GameErrorBoundary>
  <GameController />
</GameErrorBoundary>
```

Catches:
- Scene loading errors
- Runtime game errors
- Asset loading failures

Fallback:
- Error message with retry button
- Return to main menu option
- Error reporting (console)

## Responsive Design

### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Mobile Adaptations
- Touch-optimized card interactions
- Simplified UI for small screens
- Portrait/landscape support
- Virtual joystick for camera control

## Accessibility Features

### Keyboard Controls
- Tab: Navigate UI elements
- Enter/Space: Activate buttons
- Arrow keys: Navigate cards
- Escape: Pause/menu
- 1-5: Select card by number

### Screen Reader
- Announce game state changes
- Describe card stats
- Announce turn changes
- Describe combat results

### Visual Accessibility
- High contrast mode option
- Colorblind-friendly palette
- Adjustable text size
- Reduced motion option

## SEO Strategy

### Meta Tags
```tsx
<Helmet>
  <title>BigBear Portfolio Game - Premium Card Battle</title>
  <meta name="description" content="..." />
  <meta property="og:title" content="..." />
  <meta property="og:image" content="..." />
</Helmet>
```

### Structured Data
```json
{
  "@context": "https://schema.org",
  "@type": "VideoGame",
  "name": "BigBear Portfolio Game",
  "genre": "Card Battle",
  "playMode": "SinglePlayer"
}
```

## Browser Compatibility

### Feature Detection
```tsx
const hasWebGL = detectWebGL();
const hasWebAudio = detectWebAudio();
const hasGamepad = 'getGamepads' in navigator;
```

### Fallbacks
- WebGL → 2D Canvas sprites
- Web Audio → HTML5 Audio
- Gamepad → Keyboard/mouse only

## Testing Strategy

### Unit Tests
- Page components render correctly
- Scene transitions work
- State management functions

### Integration Tests
- Full game flow (menu → combat → victory)
- Asset loading and caching
- Error handling and recovery

### E2E Tests (Manual)
- Play through complete game
- Test on multiple browsers
- Test on mobile devices
- Test with screen reader
