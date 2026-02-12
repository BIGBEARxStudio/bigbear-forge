# Implementation Plan: Core Game Loop

## Overview

This implementation plan builds the foundational gameplay system for a premium browser-based card game using TypeScript, React, Zustand, XState, GSAP, and Framer Motion. The approach prioritizes the core game loop first, then the combat state machine, followed by card systems, and finally polish layers (animations, audio, scenes). Each major system includes property-based tests to validate correctness.

## Tasks

- [x] 1. Set up project structure and core dependencies
  - Create TypeScript configuration with strict mode
  - Install and configure Zustand, XState, GSAP, Framer Motion, fast-check
  - Set up testing framework (Jest/Vitest) with fast-check integration
  - Create directory structure: `/src/systems`, `/src/components`, `/src/stores`, `/src/types`
  - _Requirements: 12.3, 12.6_

- [x] 2. Implement Game Loop System
  - [x] 2.1 Create GameLoop class with RAF-based tick system
    - Implement `start()`, `stop()`, `pause()`, `resume()` methods
    - Calculate delta time for frame-independent physics
    - Track FPS using rolling average over 60 frames
    - Emit performance warnings when frame time exceeds 16.67ms
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_
  
  - [x]* 2.2 Write property test for delta time calculation
    - **Property 1: Delta time is always positive and reasonable**
    - **Validates: Requirements 1.2**
  
  - [x]* 2.3 Write property test for pause/resume behavior
    - **Property 2: Pause-resume is idempotent**
    - **Property 3: Pause-resume round trip**
    - **Validates: Requirements 1.3, 1.4**
  
  - [x]* 2.4 Write property test for performance metrics
    - **Property 4: Performance metrics are non-negative**
    - **Validates: Requirements 1.5**
  
  - [x]* 2.5 Write unit tests for game loop edge cases
    - Test RAF fallback to setTimeout
    - Test frame time spike handling
    - Test tab switch scenario (large delta time)
    - _Requirements: 1.1, 1.2, 1.6_

- [x] 3. Create Zustand store for game state
  - Define GameStore interface with game loop, combat, cards, battlefield, and UI state
  - Implement actions for game loop control (start, stop, pause, resume)
  - Implement actions for combat flow (playCard, drawCard, etc.)
  - Integrate game loop with store (call store actions in onTick)
  - _Requirements: 1.7, 2.8_

- [x] 4. Implement Combat State Machine
  - [x] 4.1 Create XState combat machine with all states
    - Define states: IDLE, PLAYER_TURN, CARD_PLAY, RESOLVE, AI_TURN, CHECK_WIN, END
    - Define events and transitions between states
    - Implement guards for win/loss/draw conditions
    - Add state persistence to sessionStorage
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_
  
  - [x]* 4.2 Write property test for state machine transitions
    - **Property 5: Combat state machine transitions are valid**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7**
  
  - [x]* 4.3 Write property test for state serialization
    - **Property 6: Combat state serialization round trip**
    - **Validates: Requirements 2.8**
  
  - [x]* 4.4 Write unit tests for state machine
    - Test each state transition path
    - Test win/loss/draw condition detection
    - Test state persistence and restoration
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

- [x] 5. Checkpoint - Ensure core systems work
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement Card Data System
  - [x] 6.1 Create Card and CardDatabase TypeScript interfaces
    - Define Card schema with id, name, type, rarity, stats, artwork
    - Define CardDatabase schema with version and cards array
    - Create JSON schema validator
    - _Requirements: 6.1, 6.3, 6.6_
  
  - [x] 6.2 Create starter card database JSON file
    - Define 10 starter cards with simple stats
    - Include card artwork paths
    - Validate against schema
    - _Requirements: 6.4_
  
  - [x] 6.3 Implement card loading and deck generation
    - Load card database from JSON at game start
    - Implement `createDeck()` function (20 cards, shuffled)
    - Implement `shuffleDeck()` function
    - _Requirements: 6.2, 6.5_
  
  - [ ]* 6.4 Write property test for card serialization
    - **Property 14: Card data serialization round trip**
    - **Validates: Requirements 6.1**
  
  - [ ]* 6.5 Write property test for card schema validation
    - **Property 15: Card schema validation**
    - **Validates: Requirements 6.3, 6.6**
  
  - [ ]* 6.6 Write property test for deck generation
    - **Property 16: Deck generation produces valid deck**
    - **Validates: Requirements 6.5**
  
  - [ ]* 6.7 Write unit tests for card system
    - Test card loading from JSON
    - Test invalid card rejection
    - Test deck shuffling randomness
    - _Requirements: 6.2, 6.5, 6.6_

- [x] 7. Implement Card Hand System
  - [x] 7.1 Create CardHand state management in Zustand store
    - Add hand state (cards, selectedIndex, isDragging, dragPosition)
    - Implement `drawCard()` action
    - Implement `playCard()` action
    - Implement `selectCard()` action
    - _Requirements: 3.1, 3.3, 3.6, 3.7, 3.8_
  
  - [ ]* 7.2 Write property test for hand size invariant
    - **Property 7: Card hand size invariant with refill**
    - **Validates: Requirements 3.1, 3.7**
  
  - [ ]* 7.3 Write property test for card selection
    - **Property 8: Card selection toggles state**
    - **Validates: Requirements 3.3**
  
  - [ ]* 7.4 Write property test for card play
    - **Property 9: Playing a card removes it from hand**
    - **Validates: Requirements 3.6**
  
  - [ ]* 7.5 Write unit tests for card hand
    - Test card selection and deselection
    - Test empty deck edge case
    - Test hand overflow handling
    - _Requirements: 3.1, 3.3, 3.6, 3.7, 3.8_

- [ ] 8. Implement Battlefield System
  - [ ] 8.1 Create Battlefield state in Zustand store
    - Define BattlefieldState interface (playerSide, opponentSide)
    - Implement damage calculation function
    - Implement card placement logic
    - _Requirements: 4.1, 4.2_
  
  - [ ]* 8.2 Write property test for card placement
    - **Property 10: Battlefield card placement is side-correct**
    - **Validates: Requirements 4.2**
  
  - [ ]* 8.3 Write unit tests for battlefield
    - Test damage calculation
    - Test card placement on correct side
    - Test HP updates
    - _Requirements: 4.2_

- [ ] 9. Implement AI Opponent System
  - [ ] 9.1 Create EasyAI class
    - Implement `selectCard()` method with random selection
    - Implement `getPlayDelay()` method (1-2 second random delay)
    - Implement `shouldMakeSuboptimalMove()` method (30% chance)
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  
  - [ ]* 9.2 Write property test for AI card selection validity
    - **Property 11: AI selects valid cards**
    - **Validates: Requirements 5.1**
  
  - [ ]* 9.3 Write property test for AI selection distribution
    - **Property 12: AI selection is eventually uniform**
    - **Validates: Requirements 5.2**
  
  - [ ]* 9.4 Write property test for AI play delay
    - **Property 13: AI play delay is within bounds**
    - **Validates: Requirements 5.3**
  
  - [ ]* 9.5 Write unit tests for AI opponent
    - Test card selection from hand
    - Test play delay timing
    - Test suboptimal move frequency
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 10. Checkpoint - Ensure game logic is complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Implement Win/Loss Condition System
  - [ ] 11.1 Add win condition checks to combat state machine
    - Implement CHECK_WIN state logic
    - Check player HP for loss condition
    - Check opponent HP for win condition
    - Check both HP for draw condition
    - _Requirements: 7.1, 7.2, 7.3_
  
  - [ ]* 11.2 Write unit tests for win/loss conditions
    - **Property 17: Win condition triggers on opponent HP zero**
    - **Property 18: Loss condition triggers on player HP zero**
    - **Property 19: Draw condition triggers on simultaneous zero HP**
    - **Validates: Requirements 7.1, 7.2, 7.3**

- [ ] 12. Implement Animation System
  - [ ] 12.1 Create AnimationTimeline class with GSAP
    - Implement `cardDraw()` timeline (slide in with overshoot)
    - Implement `cardPlay()` timeline (arc motion)
    - Implement `cardAttack()` timeline (lunge forward)
    - Implement `screenShake()` timeline
    - Implement `damageNumber()` timeline (pop up and fade)
    - Implement `victory()` timeline (confetti)
    - Implement `defeat()` timeline (desaturate)
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_
  
  - [ ]* 12.2 Write property test for animation performance
    - **Property 26: Frame rate maintains 60fps**
    - **Validates: Requirements 8.9, 12.1**
  
  - [ ]* 12.3 Write unit tests for animations
    - Test timeline creation
    - Test GPU-only transforms
    - Test WebGL fallback
    - _Requirements: 8.1, 8.2, 8.3, 8.8, 12.7_

- [ ] 13. Implement Audio System
  - [ ] 13.1 Create WebAudioManager class
    - Implement `loadSound()` method
    - Implement `playSound()` method
    - Implement `playMusic()` method
    - Implement `setVolume()` and `mute()` methods
    - Load all sound assets from manifest
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8_
  
  - [ ]* 13.2 Write property test for audio events
    - **Property 20: Audio events trigger correct sounds**
    - **Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7**
  
  - [ ]* 13.3 Write property test for volume control
    - **Property 21: Audio volume control affects playback**
    - **Validates: Requirements 9.8**
  
  - [ ]* 13.4 Write unit tests for audio system
    - Test sound loading
    - Test audio context suspended handling
    - Test sound load failure recovery
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8_

- [ ] 14. Implement Input System
  - [ ] 14.1 Create UnifiedInputHandler class
    - Implement mouse input handling (click, drag, hover)
    - Implement keyboard input handling (arrow keys, Enter, Esc)
    - Implement touch input handling (tap, drag)
    - Implement gamepad input handling (D-pad, A button, Start)
    - Add input latency tracking
    - Add input conflict prevention
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_
  
  - [ ]* 14.2 Write property test for input latency
    - **Property 22: Input latency is within threshold**
    - **Validates: Requirements 10.5, 12.2**
  
  - [ ]* 14.3 Write property test for input conflict prevention
    - **Property 23: Input conflicts are prevented**
    - **Validates: Requirements 10.6**
  
  - [ ]* 14.4 Write unit tests for input system
    - Test mouse event handling
    - Test keyboard event handling
    - Test touch event handling
    - Test gamepad event handling
    - Test input flood throttling
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

- [ ] 15. Checkpoint - Ensure all systems integrated
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 16. Implement Scene Management System
  - [ ] 16.1 Create Scene interface and SceneManager class
    - Define Scene interface (load, enter, exit, update, cleanup)
    - Implement SceneManager with scene registration and transitions
    - Implement fade/wipe transition animations
    - _Requirements: 11.1, 11.2, 11.3, 11.5_
  
  - [ ] 16.2 Implement MainMenuScene
    - Create React component for main menu
    - Implement lazy loading
    - Implement scene lifecycle methods
    - _Requirements: 11.1, 11.4_
  
  - [ ] 16.3 Implement CombatScene
    - Create React component for combat
    - Integrate with combat state machine
    - Implement lazy loading
    - Implement scene lifecycle methods
    - _Requirements: 11.1, 11.4_
  
  - [ ] 16.4 Implement VictoryDefeatScene
    - Create React components for victory and defeat screens
    - Add "Play Again" button
    - Implement lazy loading
    - Implement scene lifecycle methods
    - _Requirements: 7.4, 7.5, 7.6, 7.7, 11.1, 11.4_
  
  - [ ]* 16.5 Write property test for scene cleanup
    - **Property 24: Scene cleanup releases resources**
    - **Validates: Requirements 11.3**
  
  - [ ]* 16.6 Write property test for scene transition timing
    - **Property 25: Scene transitions complete within threshold**
    - **Validates: Requirements 11.5**
  
  - [ ]* 16.7 Write unit tests for scene management
    - Test scene registration
    - Test scene transitions
    - Test resource cleanup
    - Test lazy loading
    - Test scene load failure recovery
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 17. Build React UI Components
  - [ ] 17.1 Create CardComponent with Framer Motion
    - Display card with stats (attack, defense, speed)
    - Implement hover glow effect
    - Implement selection outline
    - Implement drag preview
    - _Requirements: 3.2, 3.3, 3.4, 3.5_
  
  - [ ] 17.2 Create CardHandComponent
    - Display 3-5 cards in hand
    - Wire up card selection and drag events
    - Integrate with Zustand store
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [ ] 17.3 Create BattlefieldComponent
    - Display player and opponent sides
    - Display health bars
    - Display active cards
    - Animate damage numbers
    - _Requirements: 4.1, 4.3, 4.4, 4.5, 4.6_
  
  - [ ] 17.4 Create PerformanceMonitorComponent
    - Display FPS counter
    - Display frame time
    - Show performance warnings
    - _Requirements: 1.5, 1.6_

- [ ] 18. Implement Performance Optimization
  - [ ] 18.1 Add code splitting and lazy loading
    - Split scenes into separate bundles
    - Lazy load card assets
    - Lazy load audio assets
    - _Requirements: 11.4, 12.3_
  
  - [ ] 18.2 Optimize animations for GPU
    - Ensure all animations use transform/opacity only
    - Add will-change hints
    - Implement animation cleanup on unmount
    - _Requirements: 8.8, 8.9_
  
  - [ ]* 18.3 Write property test for memory stability
    - **Property 28: Memory usage is stable over multiple battles**
    - **Validates: Requirements 12.5**
  
  - [ ]* 18.4 Write property test for scene load performance
    - **Property 27: Combat scene loads within threshold**
    - **Validates: Requirements 12.4**

- [ ] 19. Integration and End-to-End Testing
  - [ ]* 19.1 Write integration test for complete battle flow
    - Test start to win scenario
    - Test start to loss scenario
    - Test start to draw scenario
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 7.1, 7.2, 7.3_
  
  - [ ]* 19.2 Write integration test for scene transitions
    - Test Main Menu → Combat → Victory
    - Test Main Menu → Combat → Defeat
    - Test state preservation across transitions
    - _Requirements: 11.1, 11.2, 11.3, 11.5, 2.8_
  
  - [ ]* 19.3 Write integration test for input → animation → audio flow
    - Test card play triggers animation and sound
    - Test attack triggers animation, sound, and screen shake
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 9.1, 9.2, 9.3, 10.1_

- [ ] 20. Final checkpoint - Complete system validation
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at major milestones
- Property tests validate universal correctness properties (100 iterations each)
- Unit tests validate specific examples and edge cases
- Integration tests validate end-to-end flows
- All animations must use GPU-only transforms (transform/opacity)
- Performance budgets: 60fps, <100ms input latency, <200KB bundle, <3s load time
