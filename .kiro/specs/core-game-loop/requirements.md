# Requirements Document: Core Game Loop

## Introduction

The Core Game Loop is the foundational gameplay system for a premium browser-based portfolio card game. This system provides the minimum playable core - a 60fps game loop, turn-based combat state machine, card hand management, battlefield visualization, basic AI opponent, and win/loss conditions. The game is built with Gatsby, React, TypeScript, GSAP, Framer Motion, and Three.js, with strict performance constraints (16.67ms per frame, 90+ Lighthouse score).

## Glossary

- **Game_Loop**: The RequestAnimationFrame-based tick system that runs at 60fps and drives all game logic
- **Combat_State_Machine**: The XState-based state machine managing turn-based combat flow
- **Card_Hand**: The collection of 3-5 cards displayed to the player for selection and play
- **Battlefield**: The visual play area where cards are placed during combat
- **AI_Opponent**: The computer-controlled opponent that plays cards against the player
- **Card_Data_System**: The JSON-based storage and loading system for card definitions
- **Animation_System**: The GSAP and Framer Motion-based system for all visual transitions
- **Audio_System**: The sound effect and music playback system
- **Input_System**: The unified handler for mouse, keyboard, touch, and gamepad inputs
- **Scene_Manager**: The system managing transitions between Main Menu, Combat, and Victory/Defeat scenes
- **Performance_Monitor**: The FPS counter and frame time tracking system

## Requirements

### Requirement 1: Game Loop System

**User Story:** As a player, I want the game to run smoothly at 60fps, so that all interactions feel responsive and fluid.

#### Acceptance Criteria

1. THE Game_Loop SHALL execute using requestAnimationFrame at 60fps
2. WHEN each frame executes, THE Game_Loop SHALL calculate delta time for frame-independent physics
3. WHEN the game is paused, THE Game_Loop SHALL stop executing frame updates
4. WHEN the game is resumed, THE Game_Loop SHALL continue executing frame updates from the paused state
5. THE Performance_Monitor SHALL track current FPS and frame time
6. WHEN frame time exceeds 16.67ms, THE Performance_Monitor SHALL log a performance warning
7. THE Game_Loop SHALL integrate with React render cycle to trigger UI updates when game state changes

### Requirement 2: Combat State Machine

**User Story:** As a player, I want clear turn-based combat flow, so that I always know when it's my turn and what actions are available.

#### Acceptance Criteria

1. THE Combat_State_Machine SHALL implement states: IDLE, PLAYER_TURN, CARD_PLAY, RESOLVE, AI_TURN, CHECK_WIN, END
2. WHEN combat begins, THE Combat_State_Machine SHALL transition from IDLE to PLAYER_TURN
3. WHEN the player plays a card, THE Combat_State_Machine SHALL transition from PLAYER_TURN to CARD_PLAY to RESOLVE
4. WHEN player action resolves, THE Combat_State_Machine SHALL transition from RESOLVE to AI_TURN
5. WHEN AI action completes, THE Combat_State_Machine SHALL transition from AI_TURN to CHECK_WIN
6. WHEN no win condition is met, THE Combat_State_Machine SHALL transition from CHECK_WIN to PLAYER_TURN
7. WHEN a win condition is met, THE Combat_State_Machine SHALL transition from CHECK_WIN to END
8. THE Combat_State_Machine SHALL persist state across scene transitions

### Requirement 3: Card Hand Management

**User Story:** As a player, I want to see and interact with cards in my hand, so that I can choose which card to play each turn.

#### Acceptance Criteria

1. THE Card_Hand SHALL display between 3 and 5 cards to the player
2. WHEN the player hovers over a card, THE Card_Hand SHALL highlight that card with a glow effect
3. WHEN the player clicks a card, THE Card_Hand SHALL mark that card as selected with an outline
4. WHEN a card is selected, THE Card_Hand SHALL allow the player to drag the card to the play area
5. WHEN a card is being dragged, THE Card_Hand SHALL display a drag preview
6. WHEN a card is played, THE Card_Hand SHALL remove that card from the hand
7. WHEN a card is played, THE Card_Hand SHALL draw a new card from the deck to refill the hand
8. WHEN the deck is empty, THE Card_Hand SHALL not draw additional cards

### Requirement 4: Battlefield Visualization

**User Story:** As a player, I want to see the battlefield clearly, so that I understand the current game state and card positions.

#### Acceptance Criteria

1. THE Battlefield SHALL display a visual play area with player side and AI opponent side
2. WHEN a card is played, THE Battlefield SHALL place the card on the appropriate side
3. THE Battlefield SHALL display card stats including attack, defense, and speed
4. THE Battlefield SHALL display health bars for both player and opponent
5. WHEN damage is dealt, THE Battlefield SHALL animate damage numbers on the affected entity
6. THE Battlefield SHALL maintain visual distinction between player and opponent areas

### Requirement 5: AI Opponent Behavior

**User Story:** As a player, I want to face an AI opponent that feels human-like, so that the game is engaging even in single-player mode.

#### Acceptance Criteria

1. WHEN it is the AI's turn, THE AI_Opponent SHALL select a valid card from its hand
2. THE AI_Opponent SHALL use random selection for card choice
3. WHEN the AI selects a card, THE AI_Opponent SHALL wait 1-2 seconds before playing
4. THE AI_Opponent SHALL occasionally make suboptimal moves to simulate easy difficulty
5. THE Battlefield SHALL display a visual representation of the AI_Opponent

### Requirement 6: Card Data Management

**User Story:** As a developer, I want cards defined in a structured format, so that I can easily add and modify cards without changing code.

#### Acceptance Criteria

1. THE Card_Data_System SHALL store card definitions in JSON format
2. THE Card_Data_System SHALL load all card data at game start
3. WHEN a card is defined, THE Card_Data_System SHALL include id, name, type, rarity, stats (attack, defense, speed), and artwork
4. THE Card_Data_System SHALL provide 10 starter cards with simple stats
5. WHEN a game begins, THE Card_Data_System SHALL create a deck of 20 cards by shuffling available cards
6. THE Card_Data_System SHALL validate card schema on load

### Requirement 7: Win and Loss Conditions

**User Story:** As a player, I want clear win and loss conditions, so that I know when the game ends and who won.

#### Acceptance Criteria

1. WHEN player HP reaches 0, THE Combat_State_Machine SHALL trigger a loss condition
2. WHEN opponent HP reaches 0, THE Combat_State_Machine SHALL trigger a win condition
3. WHEN both player and opponent HP reach 0 simultaneously, THE Combat_State_Machine SHALL trigger a draw condition
4. WHEN a win condition is triggered, THE Scene_Manager SHALL transition to the victory screen
5. WHEN a loss condition is triggered, THE Scene_Manager SHALL transition to the defeat screen
6. THE victory screen SHALL display a "Play Again" option
7. THE defeat screen SHALL display a "Play Again" option

### Requirement 8: Animation System

**User Story:** As a player, I want satisfying animations for all game actions, so that the game feels polished and responsive.

#### Acceptance Criteria

1. WHEN a card is drawn, THE Animation_System SHALL animate the card sliding in from the deck with overshoot
2. WHEN a card is played, THE Animation_System SHALL animate the card flying to the battlefield with arc motion
3. WHEN a card attacks, THE Animation_System SHALL animate the card lunging forward
4. WHEN damage is dealt, THE Animation_System SHALL animate screen shake on impact
5. WHEN damage is dealt, THE Animation_System SHALL animate damage numbers popping up and fading out
6. WHEN victory occurs, THE Animation_System SHALL display confetti particles
7. WHEN defeat occurs, THE Animation_System SHALL desaturate the screen
8. THE Animation_System SHALL use GPU-only transforms (transform and opacity only)
9. THE Animation_System SHALL complete all animations within the 16.67ms frame budget

### Requirement 9: Audio System

**User Story:** As a player, I want audio feedback for all actions, so that the game feels alive and responsive.

#### Acceptance Criteria

1. WHEN a card is drawn, THE Audio_System SHALL play a whoosh sound
2. WHEN a card is played, THE Audio_System SHALL play a thump sound
3. WHEN an attack hits, THE Audio_System SHALL play a hit sound
4. WHEN damage is taken, THE Audio_System SHALL play a hurt sound
5. WHEN victory occurs, THE Audio_System SHALL play triumphant music
6. WHEN defeat occurs, THE Audio_System SHALL play somber music
7. WHILE in combat, THE Audio_System SHALL play adaptive background music
8. THE Audio_System SHALL support volume control and muting

### Requirement 10: Input System

**User Story:** As a player, I want to control the game with my preferred input method, so that I can play comfortably.

#### Acceptance Criteria

1. WHEN using a mouse, THE Input_System SHALL support click to select, drag to play, and hover for preview
2. WHEN using a keyboard, THE Input_System SHALL support arrow keys to navigate hand, Enter to play, and Esc to pause
3. WHEN using touch, THE Input_System SHALL support tap to select and drag to play
4. WHEN using a gamepad, THE Input_System SHALL support D-pad to navigate, A button to select/play, and Start to pause
5. THE Input_System SHALL respond to input within 100ms
6. THE Input_System SHALL prevent conflicting inputs from multiple devices

### Requirement 11: Scene Management

**User Story:** As a player, I want smooth transitions between game screens, so that the experience feels cohesive.

#### Acceptance Criteria

1. THE Scene_Manager SHALL implement Main Menu, Combat, and Victory/Defeat scenes
2. WHEN transitioning between scenes, THE Scene_Manager SHALL animate a fade or wipe transition
3. WHEN exiting a scene, THE Scene_Manager SHALL clean up scene state to prevent memory leaks
4. THE Scene_Manager SHALL lazy load scene assets to minimize initial bundle size
5. THE Scene_Manager SHALL complete scene transitions within 500ms

### Requirement 12: Performance Requirements

**User Story:** As a player, I want the game to load quickly and run smoothly, so that I can start playing immediately without lag.

#### Acceptance Criteria

1. THE Game_Loop SHALL maintain 60fps during combat with no dropped frames
2. THE Input_System SHALL respond to input within 100ms
3. THE Scene_Manager SHALL keep initial bundle size below 200KB
4. THE Scene_Manager SHALL load the combat scene in under 3 seconds
5. WHEN 10 consecutive battles are completed, THE Game_Loop SHALL maintain stable memory usage
6. THE Scene_Manager SHALL achieve a Lighthouse score of 90 or higher
7. WHEN WebGL is unavailable, THE Animation_System SHALL fallback to 2D canvas rendering
