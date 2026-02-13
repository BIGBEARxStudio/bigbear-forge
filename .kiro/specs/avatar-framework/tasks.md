# Implementation Plan: Avatar Framework

## Overview

This implementation plan breaks down the Avatar Framework into discrete coding tasks that build incrementally on the existing Sprint 2 architecture. The avatar system will integrate with the combat state machine, maintain 60fps performance, and follow the same testing patterns established in Sprint 2. All code will be written in TypeScript to match the existing codebase.

## Tasks

- [x] 1. Set up Three.js infrastructure and core types
  - Create TypeScript interfaces for Avatar, AvatarSystem, CustomizationData, AnimationState
  - Add Three.js and @types/three dependencies
  - Create WebGL detection utility function
  - Set up dependency injection interfaces for Three.js objects (Scene, Renderer, Camera)
  - _Requirements: 1.1, 1.2, 12.1_

- [ ]* 1.1 Write property test for WebGL detection
  - **Property 26: WebGL availability detection**
  - **Validates: Requirements 11.1**

- [ ] 2. Implement Avatar System core with renderer initialization
  - [ ] 2.1 Create AvatarSystemImpl class with Three.js initialization
    - Implement initialize() method with canvas, renderer, scene, camera setup
    - Add render loop synchronized with game loop
    - Implement dispose() method for cleanup
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [ ]* 2.2 Write property test for frame rate consistency
    - **Property 1: Frame rate consistency**
    - **Validates: Requirements 1.3**
  
  - [ ] 2.3 Implement canvas resize handling
    - Add resize event listener
    - Update renderer dimensions and camera aspect ratio on resize
    - _Requirements: 1.4_
  
  - [ ]* 2.4 Write property test for canvas resize
    - **Property 2: Canvas resize updates renderer and camera**
    - **Validates: Requirements 1.4**


- [ ] 3. Implement Avatar Mesh Builder with geometry caching
  - [x] 3.1 Create AvatarMeshBuilderImpl class
    - Implement buildHead(), buildTorso(), buildArms(), buildLegs() methods
    - Add geometry and material caching with Map structures
    - Implement assembleAvatar() to create THREE.Group hierarchy
    - _Requirements: 2.1, 2.2, 2.5_
  
  - [ ]* 3.2 Write property test for avatar mesh structure
    - **Property 3: Avatar mesh structural invariant**
    - **Validates: Requirements 2.1, 2.2, 2.5**
  
  - [x] 3.3 Add accessory attachment system
    - Implement buildAccessory() method
    - Define attachment points in avatar hierarchy
    - _Requirements: 2.4_
  
  - [ ]* 3.4 Write property test for accessory attachment
    - **Property 5: Accessory attachment points exist**
    - **Validates: Requirements 2.4**
  
  - [ ]* 3.5 Write property test for geometry/material reuse
    - **Property 23: Geometry and material reuse across avatars**
    - **Validates: Requirements 10.3**

- [ ] 4. Implement customization system with validation
  - [x] 4.1 Create customization validation function
    - Implement validateCustomizationData() with schema checking
    - Validate body parts, colors (RGB format), and accessories
    - _Requirements: 3.1, 3.5_
  
  - [ ]* 4.2 Write property test for customization validation
    - **Property 6: Customization data validation**
    - **Validates: Requirements 3.1, 3.5**
  
  - [x] 4.3 Implement customization application to avatars
    - Add updateAvatar() method to apply customization data
    - Update materials with new colors
    - Swap geometries for body part changes
    - Attach/detach accessories
    - _Requirements: 2.3, 3.2, 3.3, 3.4_
  
  - [ ]* 4.4 Write property test for customization application
    - **Property 4: Customization application updates avatar**
    - **Validates: Requirements 2.3, 3.2**
  
  - [ ]* 4.5 Write property test for color customization
    - **Property 7: Color customization updates materials**
    - **Validates: Requirements 3.3**
  
  - [ ]* 4.6 Write property test for accessory attachment
    - **Property 8: Accessory attachment**
    - **Validates: Requirements 3.4**


- [ ] 5. Implement avatar presets and preset manager
  - [x] 5.1 Define default presets for player and AI
    - Create PLAYER_PRESET and AI_PRESET constants
    - Define customization data for each preset
    - _Requirements: 4.1, 4.2_
  
  - [x] 5.2 Create PresetManagerImpl class
    - Implement getPreset(), getAllPresets(), createPreset(), savePreset()
    - Initialize with default presets
    - _Requirements: 4.1, 4.2_
  
  - [ ]* 5.3 Write property test for preset loading
    - **Property 9: Preset loading applies all settings**
    - **Validates: Requirements 4.3**
  
  - [ ]* 5.4 Write property test for preset extension
    - **Property 10: Preset extension with modifications**
    - **Validates: Requirements 4.4**
  
  - [ ]* 5.5 Write property test for preset serialization
    - **Property 11: Preset serialization round trip**
    - **Validates: Requirements 4.5**

- [x] 6. Checkpoint - Ensure avatar creation and customization tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement Animation Controller with keyframe system
  - [x] 7.1 Create AnimationControllerImpl class
    - Implement playAnimation(), update(), getCurrentState()
    - Define animation clips for all six states (idle, attack, defend, victory, defeat, damaged)
    - Implement keyframe interpolation (position, rotation, scale)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [ ]* 7.2 Write property test for animation transitions
    - **Property 12: Animation state transitions are smooth**
    - **Validates: Requirements 5.2**
  
  - [ ]* 7.3 Write property test for non-looping animations
    - **Property 13: Non-looping animations return to idle**
    - **Validates: Requirements 5.4**
  
  - [ ]* 7.4 Write property test for terminal animations
    - **Property 14: Terminal animations do not return to idle**
    - **Validates: Requirements 5.5**
  
  - [ ]* 7.5 Write unit tests for animation edge cases
    - Test invalid animation states
    - Test animation completion callbacks
    - Test looping vs non-looping behavior
    - _Requirements: 5.1, 5.3, 5.4, 5.5_


- [x] 8. Implement Camera Controller with orbit and zoom
  - [x] 8.1 Create CameraControllerImpl class
    - Implement setTarget(), orbit(), zoom(), update(), reset()
    - Add spherical coordinate calculations
    - Implement smooth damping/interpolation
    - Add min/max distance constraints
    - Add min/max polar angle constraints
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [ ]* 8.2 Write property test for camera orbit
    - **Property 16: Camera orbit rotates around target**
    - **Validates: Requirements 7.1, 7.3**
  
  - [ ]* 8.3 Write property test for camera zoom constraints
    - **Property 17: Camera zoom respects distance constraints**
    - **Validates: Requirements 7.2, 7.4**
  
  - [ ]* 8.4 Write property test for camera smoothing
    - **Property 18: Camera movements are smoothly interpolated**
    - **Validates: Requirements 7.5**
  
  - [ ]* 8.5 Write unit tests for camera edge cases
    - Test reset to default position
    - Test extreme orbit angles
    - Test zoom at boundaries
    - _Requirements: 7.1, 7.2, 7.5_

- [ ] 9. Implement Lighting System
  - [ ] 9.1 Create LightingSystemImpl class
    - Implement setupLights() to create ambient, directional, and point lights
    - Implement updateLightIntensity() and updateLightPosition()
    - Add lights to scene with appropriate positioning
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  
  - [ ]* 9.2 Write property test for lighting updates
    - **Property 19: Lighting configuration updates scene lights**
    - **Validates: Requirements 8.4**
  
  - [ ]* 9.3 Write unit tests for lighting setup
    - Test ambient light creation
    - Test directional light creation
    - Test point light addition
    - _Requirements: 8.1, 8.2, 8.3_


- [x] 10. Implement Combat Integration with XState
  - [x] 10.1 Create AvatarCombatIntegration class
    - Implement CombatEventListener interface
    - Add methods: onPlayerAttack(), onAIAttack(), onPlayerDamaged(), onAIDamaged(), onVictory(), onDefeat()
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  
  - [x] 10.2 Create setupAvatarIntegration() function
    - Subscribe to combat state machine transitions
    - Map state transitions to avatar animation triggers
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  
  - [ ]* 10.3 Write property test for combat event animations
    - **Property 15: Combat events trigger avatar animations**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4**
  
  - [ ]* 10.4 Write unit tests for combat integration
    - Test victory scenario (player wins)
    - Test defeat scenario (player loses)
    - Test animation triggers for each combat event
    - _Requirements: 6.5, 6.6_

- [x] 11. Checkpoint - Ensure animation and combat integration tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [-] 12. Implement State Persistence with localStorage
  - [ ] 12.1 Create LocalStoragePersistence class
    - Implement saveCustomization(), loadCustomization(), clearCustomization()
    - Add JSON serialization/deserialization
    - Add error handling for localStorage failures
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  
  - [ ]* 12.2 Write property test for persistence round trip
    - **Property 20: Customization persistence round trip**
    - **Validates: Requirements 9.1, 9.2, 9.3**
  
  - [ ]* 12.3 Write property test for localStorage error handling
    - **Property 21: localStorage errors are handled gracefully**
    - **Validates: Requirements 9.5**
  
  - [ ]* 12.4 Write unit tests for persistence edge cases
    - Test loading when no data exists (default preset)
    - Test corrupted data handling
    - Test quota exceeded scenario
    - _Requirements: 9.4, 9.5_


- [ ] 13. Implement Performance Optimization systems
  - [ ] 13.1 Create LODSystemImpl class
    - Implement updateLOD() to adjust detail based on camera distance
    - Implement setHighDetail(), setMediumDetail(), setLowDetail()
    - Add distance thresholds for LOD levels
    - _Requirements: 10.1, 10.2_
  
  - [ ]* 13.2 Write property test for LOD system
    - **Property 22: LOD adjusts detail based on camera distance**
    - **Validates: Requirements 10.1, 10.2**
  
  - [ ] 13.3 Create PerformanceMonitorImpl class
    - Implement recordFrameTime(), getAverageFPS(), shouldReduceQuality()
    - Track frame times with rolling window
    - _Requirements: 10.5_
  
  - [ ]* 13.4 Write property test for performance-based quality reduction
    - **Property 25: Performance-based quality reduction**
    - **Validates: Requirements 10.5**
  
  - [ ] 13.5 Implement draw call optimization
    - Add geometry batching where possible
    - Implement frustum culling
    - _Requirements: 10.4_
  
  - [ ]* 13.6 Write property test for draw call batching
    - **Property 24: Draw call batching reduces render calls**
    - **Validates: Requirements 10.4**

- [ ] 14. Implement 2D Sprite Fallback system
  - [ ] 14.1 Create SpriteFallbackImpl class
    - Implement initialize() with canvas 2D context
    - Add loadSpriteSheets() for player and AI sprites
    - Implement renderAvatar() with sprite frame selection
    - Add frame animation timing
    - _Requirements: 11.1, 11.2, 11.3, 11.4_
  
  - [ ]* 14.2 Write property test for sprite animation mapping
    - **Property 27: Sprite animation state mapping**
    - **Validates: Requirements 11.3**
  
  - [ ]* 14.3 Write property test for sprite positioning
    - **Property 28: Sprite positioning matches 3D avatar position**
    - **Validates: Requirements 11.4**
  
  - [ ]* 14.4 Write property test for customization in both modes
    - **Property 29: Customization works in both 3D and 2D modes**
    - **Validates: Requirements 11.5**
  
  - [ ]* 14.5 Write unit tests for sprite fallback
    - Test WebGL unavailable scenario
    - Test sprite sheet loading
    - Test fallback to colored rectangles on sprite load failure
    - _Requirements: 11.2_


- [x] 15. Implement Zustand store integration
  - [x] 15.1 Extend game store with avatar state
    - Add avatars state (player and AI with customization and animation)
    - Add camera state (distance, azimuth, polar)
    - Add system state (isWebGLAvailable, useFallback, performanceMode)
    - _Requirements: 1.1, 7.1, 10.5_
  
  - [x] 15.2 Add avatar actions to store
    - Implement initializeAvatarSystem()
    - Implement updateAvatarCustomization()
    - Implement playAvatarAnimation()
    - Implement camera actions (orbitCamera, zoomCamera, resetCamera)
    - Implement persistence actions (saveCustomization, loadCustomization)
    - _Requirements: 3.1, 5.1, 7.1, 9.1_
  
  - [x]* 15.3 Write integration tests for store actions
    - Test avatar initialization flow
    - Test customization update flow
    - Test animation trigger flow
    - Test camera control flow
    - _Requirements: 1.1, 3.1, 5.1, 7.1_

- [x] 16. Create React components for avatar UI
  - [x] 16.1 Create AvatarCanvas component
    - Mount Three.js canvas
    - Initialize avatar system on mount
    - Cleanup on unmount
    - Handle canvas resize
    - _Requirements: 1.1, 1.4_
  
  - [x] 16.2 Create AvatarCustomizationPanel component
    - Add UI controls for body part selection
    - Add color pickers for skin, hair, clothing
    - Add accessory selection dropdowns
    - Wire up to Zustand store actions
    - _Requirements: 3.1, 3.3, 3.4_
  
  - [x] 16.3 Create CameraControls component
    - Add mouse drag handlers for orbit
    - Add scroll handlers for zoom
    - Add reset button
    - Wire up to Zustand store actions
    - _Requirements: 7.3, 7.4_
  
  - [x]* 16.4 Write React component tests
    - Test AvatarCanvas mounting and cleanup
    - Test AvatarCustomizationPanel interactions
    - Test CameraControls input handling
    - _Requirements: 1.1, 3.1, 7.3_


- [x] 17. Integrate avatar system with Combat Scene
  - [x] 17.1 Update CombatScene to initialize avatars
    - Create player and AI avatars on scene enter
    - Load customization from persistence
    - Position avatars on battlefield
    - _Requirements: 1.1, 4.1, 4.2, 9.3_
  
  - [x] 17.2 Wire up combat state machine to avatar animations
    - Use setupAvatarIntegration() to connect combat events
    - Subscribe to state machine transitions
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  
  - [x] 17.3 Add avatar cleanup to scene exit
    - Dispose avatar system resources
    - Save customization to persistence
    - _Requirements: 9.1, 12.1_
  
  - [x]* 17.4 Write integration tests for combat scene with avatars
    - Test complete battle flow with avatar animations
    - Test avatar persistence across scene transitions
    - Test cleanup on scene exit
    - _Requirements: 6.1, 6.5, 6.6, 9.1_

- [x] 18. Checkpoint - Ensure all integration tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 19. Implement test utilities and mocks
  - [ ] 19.1 Create Three.js mock objects
    - MockWebGLRenderer, MockScene, MockPerspectiveCamera
    - MockMesh, MockGroup, MockMaterial, MockGeometry
    - _Requirements: 12.1, 12.2_
  
  - [ ] 19.2 Create test arbitraries for property tests
    - customizationDataArbitrary()
    - animationStateArbitrary()
    - cameraOrbitArbitrary()
    - cameraZoomArbitrary()
    - _Requirements: 12.1_
  
  - [ ] 19.3 Create test utilities for avatar creation
    - createMockAvatar()
    - createMockScene()
    - createMockAvatarSystem()
    - _Requirements: 12.5_
  
  - [ ]* 19.4 Write property test for state validation without rendering
    - **Property 30: State validation without rendering**
    - **Validates: Requirements 12.4**


- [ ] 20. Performance testing and optimization
  - [ ]* 20.1 Create performance test suite
    - Test FPS with 1, 2, 5, 10 avatars
    - Test memory usage over multiple battles
    - Test avatar creation time
    - Test draw call counts
    - Measure geometry/material cache hit rates
    - _Requirements: 10.1, 10.3, 10.4, 10.5_
  
  - [ ]* 20.2 Run performance tests and validate budgets
    - Ensure 60fps maintained with 2 avatars
    - Ensure memory usage < 100MB
    - Ensure avatar creation < 100ms
    - Ensure draw calls < 50 per frame
    - _Requirements: 1.3, 10.1, 10.4_
  
  - [ ] 20.3 Optimize based on performance test results
    - Adjust LOD thresholds if needed
    - Increase geometry/material caching if needed
    - Optimize animation keyframe interpolation if needed
    - _Requirements: 10.1, 10.3, 10.5_

- [ ] 21. Final integration and polish
  - [ ] 21.1 Add error boundaries for avatar system
    - Wrap avatar components in React error boundaries
    - Display fallback UI on avatar system errors
    - Log errors for debugging
    - _Requirements: 11.2_
  
  - [ ] 21.2 Add loading states for avatar initialization
    - Show loading indicator while Three.js initializes
    - Show loading indicator while sprite sheets load
    - _Requirements: 1.1, 11.2_
  
  - [ ] 21.3 Add CSS styling for avatar canvas overlay
    - Position canvas over battlefield
    - Add z-index layering
    - Ensure responsive sizing
    - _Requirements: 1.5_
  
  - [ ]* 21.4 Write end-to-end tests
    - Test complete user flow: customize avatar → play battle → see animations
    - Test fallback flow: WebGL unavailable → sprite rendering
    - Test persistence flow: customize → reload page → customization restored
    - _Requirements: 3.1, 6.1, 9.3, 11.2_

- [ ] 22. Final checkpoint - Ensure all tests pass and performance budgets met
  - Ensure all tests pass, ask the user if questions arise.


## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Integration tests validate system interactions
- Performance tests ensure 60fps target is maintained
- The avatar system follows the same architecture patterns as Sprint 2 (dependency injection, Zustand state, XState integration)
- Three.js objects are mocked in tests for fast, reliable testing without WebGL
- The 2D sprite fallback ensures the game works on all devices
