import { create } from 'zustand';
import { GameLoop } from '@/systems/GameLoop';
import type { Card, BattlefieldState, CustomizationData, AnimationState } from '@/types';
import { AvatarSystemImpl } from '@/systems/AvatarSystem';
import { AnimationControllerImpl } from '@/systems/AnimationController';
import { CameraControllerImpl } from '@/systems/CameraController';
import { LocalStoragePersistence } from '@/systems/AvatarPersistence';
import { PLAYER_PRESET, AI_PRESET } from '@/systems/AvatarPresets';
import * as THREE from 'three';

interface GameLoopState {
  isRunning: boolean;
  isPaused: boolean;
  fps: number;
  frameTime: number;
}

interface CombatState {
  state: string; // XState machine state
  playerHP: number;
  opponentHP: number;
  currentTurn: 'player' | 'opponent';
}

interface CardState {
  playerHand: Card[];
  opponentHand: Card[];
  playerDeck: Card[];
  opponentDeck: Card[];
  selectedCardIndex: number | null;
  isDragging: boolean;
  dragPosition: { x: number; y: number } | null;
}

interface UIState {
  currentScene: string;
  isTransitioning: boolean;
  showPauseMenu: boolean;
}

interface AvatarState {
  player: {
    id: string;
    customization: CustomizationData;
    currentAnimation: AnimationState;
  };
  ai: {
    id: string;
    customization: CustomizationData;
    currentAnimation: AnimationState;
  };
}

interface CameraState {
  distance: number;
  azimuthAngle: number;
  polarAngle: number;
}

interface SystemState {
  isWebGLAvailable: boolean;
  useFallback: boolean;
  performanceMode: 'high' | 'medium' | 'low';
}

interface GameStore {
  // State
  gameLoop: GameLoopState;
  combat: CombatState;
  cards: CardState;
  battlefield: BattlefieldState;
  ui: UIState;
  avatars: AvatarState;
  camera: CameraState;
  system: SystemState;
  
  // Game Loop instance
  gameLoopInstance: GameLoop | null;
  
  // Avatar system instances
  avatarSystem: AvatarSystemImpl | null;
  cameraController: CameraControllerImpl | null;
  persistence: LocalStoragePersistence;
  
  // Actions
  startGameLoop: () => void;
  stopGameLoop: () => void;
  pauseGameLoop: () => void;
  resumeGameLoop: () => void;
  updateGameLoopMetrics: (fps: number, frameTime: number) => void;
  
  // Combat actions
  setCombatState: (state: string) => void;
  setPlayerHP: (hp: number) => void;
  setOpponentHP: (hp: number) => void;
  setCurrentTurn: (turn: 'player' | 'opponent') => void;
  
  // Card actions
  setPlayerHand: (hand: Card[]) => void;
  setOpponentHand: (hand: Card[]) => void;
  setPlayerDeck: (deck: Card[]) => void;
  setOpponentDeck: (deck: Card[]) => void;
  selectCard: (index: number | null) => void;
  playCard: (cardIndex: number) => void;
  drawCard: () => void;
  setIsDragging: (isDragging: boolean) => void;
  setDragPosition: (position: { x: number; y: number } | null) => void;
  
  // Battlefield actions
  setBattlefield: (battlefield: BattlefieldState) => void;
  
  // UI actions
  setCurrentScene: (scene: string) => void;
  setIsTransitioning: (isTransitioning: boolean) => void;
  setShowPauseMenu: (show: boolean) => void;
  
  // Scene transition
  transitionScene: (sceneName: string) => Promise<void>;
  
  // Avatar actions
  initializeAvatarSystem: (canvas: HTMLCanvasElement) => Promise<void>;
  updateAvatarCustomization: (avatarId: 'player' | 'ai', customization: CustomizationData) => void;
  playAvatarAnimation: (avatarId: 'player' | 'ai', state: AnimationState) => void;
  
  // Camera actions
  orbitCamera: (deltaX: number, deltaY: number) => void;
  zoomCamera: (delta: number) => void;
  resetCamera: () => void;
  
  // Persistence actions
  saveCustomization: (avatarId: 'player' | 'ai') => void;
  loadCustomization: (avatarId: 'player' | 'ai') => void;
  
  // Cleanup
  disposeAvatarSystem: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  gameLoop: {
    isRunning: false,
    isPaused: false,
    fps: 0,
    frameTime: 0,
  },
  
  avatars: {
    player: {
      id: 'player',
      customization: PLAYER_PRESET.customization,
      currentAnimation: 'idle',
    },
    ai: {
      id: 'ai',
      customization: AI_PRESET.customization,
      currentAnimation: 'idle',
    },
  },
  
  camera: {
    distance: 5,
    azimuthAngle: 0,
    polarAngle: Math.PI / 4,
  },
  
  system: {
    isWebGLAvailable: true,
    useFallback: false,
    performanceMode: 'high',
  },
  
  combat: {
    state: 'IDLE',
    playerHP: 100,
    opponentHP: 100,
    currentTurn: 'player',
  },
  
  cards: {
    playerHand: [],
    opponentHand: [],
    playerDeck: [],
    opponentDeck: [],
    selectedCardIndex: null,
    isDragging: false,
    dragPosition: null,
  },
  
  battlefield: {
    playerSide: {
      activeCard: null,
      hp: 100,
      maxHP: 100,
    },
    opponentSide: {
      activeCard: null,
      hp: 100,
      maxHP: 100,
    },
  },
  
  ui: {
    currentScene: 'mainMenu',
    isTransitioning: false,
    showPauseMenu: false,
  },
  
  gameLoopInstance: null,
  avatarSystem: null,
  cameraController: null,
  persistence: new LocalStoragePersistence(),
  
  // Game Loop Actions
  startGameLoop: () => {
    const { gameLoopInstance } = get();
    
    if (!gameLoopInstance) {
      // Create game loop instance
      const loop = new GameLoop({
        targetFPS: 60,
        performanceWarningThreshold: 16.67,
        onTick: (deltaTime) => {
          // Update metrics
          const fps = loop.getFPS();
          const frameTime = loop.getFrameTime();
          get().updateGameLoopMetrics(fps, frameTime);
          
          // Update camera controller
          const { cameraController, avatarSystem } = get();
          if (cameraController) {
            cameraController.update(deltaTime);
          }
          
          // Update avatar animations
          if (avatarSystem) {
            const playerAvatar = avatarSystem.getAvatar('player');
            const aiAvatar = avatarSystem.getAvatar('ai');
            
            if (playerAvatar?.animationController) {
              playerAvatar.animationController.update(deltaTime);
            }
            if (aiAvatar?.animationController) {
              aiAvatar.animationController.update(deltaTime);
            }
          }
        },
        onPerformanceWarning: (frameTime) => {
          console.warn(`Performance warning: Frame time ${frameTime.toFixed(2)}ms exceeds 16.67ms`);
        },
      });
      
      set({ gameLoopInstance: loop });
      loop.start();
    } else {
      gameLoopInstance.start();
    }
    
    set((state) => ({
      gameLoop: { ...state.gameLoop, isRunning: true, isPaused: false },
    }));
  },
  
  stopGameLoop: () => {
    const { gameLoopInstance } = get();
    if (gameLoopInstance) {
      gameLoopInstance.stop();
    }
    
    set((state) => ({
      gameLoop: { ...state.gameLoop, isRunning: false, isPaused: false, fps: 0, frameTime: 0 },
    }));
  },
  
  pauseGameLoop: () => {
    const { gameLoopInstance } = get();
    if (gameLoopInstance) {
      gameLoopInstance.pause();
    }
    
    set((state) => ({
      gameLoop: { ...state.gameLoop, isPaused: true },
    }));
  },
  
  resumeGameLoop: () => {
    const { gameLoopInstance } = get();
    if (gameLoopInstance) {
      gameLoopInstance.resume();
    }
    
    set((state) => ({
      gameLoop: { ...state.gameLoop, isPaused: false },
    }));
  },
  
  updateGameLoopMetrics: (fps, frameTime) => {
    set((state) => ({
      gameLoop: { ...state.gameLoop, fps, frameTime },
    }));
  },
  
  // Combat Actions
  setCombatState: (state) => {
    set((prev) => ({
      combat: { ...prev.combat, state },
    }));
  },
  
  setPlayerHP: (hp) => {
    set((state) => ({
      combat: { ...state.combat, playerHP: hp },
      battlefield: {
        ...state.battlefield,
        playerSide: { ...state.battlefield.playerSide, hp },
      },
    }));
  },
  
  setOpponentHP: (hp) => {
    set((state) => ({
      combat: { ...state.combat, opponentHP: hp },
      battlefield: {
        ...state.battlefield,
        opponentSide: { ...state.battlefield.opponentSide, hp },
      },
    }));
  },
  
  setCurrentTurn: (turn) => {
    set((state) => ({
      combat: { ...state.combat, currentTurn: turn },
    }));
  },
  
  // Card Actions
  setPlayerHand: (hand) => {
    set((state) => ({
      cards: { ...state.cards, playerHand: hand },
    }));
  },
  
  setOpponentHand: (hand) => {
    set((state) => ({
      cards: { ...state.cards, opponentHand: hand },
    }));
  },
  
  setPlayerDeck: (deck) => {
    set((state) => ({
      cards: { ...state.cards, playerDeck: deck },
    }));
  },
  
  setOpponentDeck: (deck) => {
    set((state) => ({
      cards: { ...state.cards, opponentDeck: deck },
    }));
  },
  
  selectCard: (index) => {
    set((state) => ({
      cards: { ...state.cards, selectedCardIndex: index },
    }));
  },
  
  playCard: (cardIndex) => {
    const { cards } = get();
    const card = cards.playerHand[cardIndex];
    
    if (!card) return;
    
    // Remove card from hand
    const newHand = cards.playerHand.filter((_, i) => i !== cardIndex);
    
    set((state) => ({
      cards: {
        ...state.cards,
        playerHand: newHand,
        selectedCardIndex: null,
      },
    }));
    
    // Draw a new card to refill hand
    get().drawCard();
  },
  
  drawCard: () => {
    const { cards } = get();
    
    // Don't draw if hand is full or deck is empty
    if (cards.playerHand.length >= 5 || cards.playerDeck.length === 0) {
      return;
    }
    
    const [drawnCard, ...remainingDeck] = cards.playerDeck;
    
    set((state) => ({
      cards: {
        ...state.cards,
        playerHand: [...state.cards.playerHand, drawnCard],
        playerDeck: remainingDeck,
      },
    }));
  },
  
  setIsDragging: (isDragging) => {
    set((state) => ({
      cards: { ...state.cards, isDragging },
    }));
  },
  
  setDragPosition: (position) => {
    set((state) => ({
      cards: { ...state.cards, dragPosition: position },
    }));
  },
  
  // Battlefield Actions
  setBattlefield: (battlefield) => {
    set({ battlefield });
  },
  
  // UI Actions
  setCurrentScene: (scene) => {
    set((state) => ({
      ui: { ...state.ui, currentScene: scene },
    }));
  },
  
  setIsTransitioning: (isTransitioning) => {
    set((state) => ({
      ui: { ...state.ui, isTransitioning },
    }));
  },
  
  setShowPauseMenu: (show) => {
    set((state) => ({
      ui: { ...state.ui, showPauseMenu: show },
    }));
  },
  
  // Scene Transition
  transitionScene: async (sceneName) => {
    set((state) => ({
      ui: { ...state.ui, isTransitioning: true },
    }));
    
    // Transition logic will be implemented in Scene Manager
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    set((state) => ({
      ui: { ...state.ui, currentScene: sceneName, isTransitioning: false },
    }));
  },
  
  // Avatar Actions
  initializeAvatarSystem: async (canvas) => {
    const avatarSystem = new AvatarSystemImpl();
    
    // Check WebGL availability
    const isWebGLAvailable = avatarSystem.isWebGLAvailable();
    
    set((state) => ({
      system: { ...state.system, isWebGLAvailable },
    }));
    
    if (!isWebGLAvailable) {
      console.warn('WebGL not available, avatar system not initialized');
      set((state) => ({
        system: { ...state.system, useFallback: true },
      }));
      return;
    }
    
    try {
      // Initialize avatar system
      await avatarSystem.initialize(canvas);
      
      // Load saved customizations or use defaults
      const { persistence, avatars } = get();
      const playerCustomization = persistence.loadCustomization('player') || PLAYER_PRESET.customization;
      const aiCustomization = persistence.loadCustomization('ai') || AI_PRESET.customization;
      
      // Create avatars
      const playerAvatar = avatarSystem.createAvatar({
        id: 'player',
        name: 'Player',
        customization: playerCustomization,
      });
      
      const aiAvatar = avatarSystem.createAvatar({
        id: 'ai',
        name: 'AI',
        customization: aiCustomization,
      });
      
      // Position avatars
      playerAvatar.mesh.position.set(-2, 0, 0);
      aiAvatar.mesh.position.set(2, 0, 0);
      
      // Create animation controllers
      const playerAnimController = new AnimationControllerImpl(playerAvatar.mesh);
      const aiAnimController = new AnimationControllerImpl(aiAvatar.mesh);
      
      playerAvatar.animationController = playerAnimController;
      aiAvatar.animationController = aiAnimController;
      
      // Create camera controller
      const camera = avatarSystem.getCamera();
      if (camera) {
        const cameraController = new CameraControllerImpl(camera);
        cameraController.setTarget(new THREE.Vector3(0, 1, 0));
        
        set({
          avatarSystem,
          cameraController,
          avatars: {
            player: {
              ...avatars.player,
              customization: playerCustomization,
            },
            ai: {
              ...avatars.ai,
              customization: aiCustomization,
            },
          },
        });
      } else {
        set({ avatarSystem });
      }
    } catch (error) {
      console.error('Failed to initialize avatar system:', error);
      set((state) => ({
        system: { ...state.system, useFallback: true },
      }));
    }
  },
  
  updateAvatarCustomization: (avatarId, customization) => {
    const { avatarSystem } = get();
    
    if (!avatarSystem) {
      console.warn('Avatar system not initialized');
      return;
    }
    
    try {
      avatarSystem.updateAvatar(avatarId, customization);
      
      set((state) => ({
        avatars: {
          ...state.avatars,
          [avatarId]: {
            ...state.avatars[avatarId],
            customization,
          },
        },
      }));
    } catch (error) {
      console.error(`Failed to update avatar ${avatarId}:`, error);
    }
  },
  
  playAvatarAnimation: (avatarId, state) => {
    const { avatarSystem } = get();
    
    if (!avatarSystem) {
      console.warn('Avatar system not initialized');
      return;
    }
    
    try {
      const avatar = avatarSystem.getAvatar(avatarId);
      if (avatar && avatar.animationController) {
        avatar.animationController.playAnimation(state);
        
        set((prev) => ({
          avatars: {
            ...prev.avatars,
            [avatarId]: {
              ...prev.avatars[avatarId],
              currentAnimation: state,
            },
          },
        }));
      }
    } catch (error) {
      console.error(`Failed to play animation for ${avatarId}:`, error);
    }
  },
  
  // Camera Actions
  orbitCamera: (deltaX, deltaY) => {
    const { cameraController } = get();
    
    if (!cameraController) {
      console.warn('Camera controller not initialized');
      return;
    }
    
    cameraController.orbit(deltaX, deltaY);
  },
  
  zoomCamera: (delta) => {
    const { cameraController } = get();
    
    if (!cameraController) {
      console.warn('Camera controller not initialized');
      return;
    }
    
    cameraController.zoom(delta);
  },
  
  resetCamera: () => {
    const { cameraController } = get();
    
    if (cameraController) {
      cameraController.reset();
    }
    
    // Always reset camera state in store
    set({
      camera: {
        distance: 5,
        azimuthAngle: 0,
        polarAngle: Math.PI / 4,
      },
    });
  },
  
  // Persistence Actions
  saveCustomization: (avatarId) => {
    const { persistence, avatars } = get();
    const customization = avatars[avatarId].customization;
    persistence.saveCustomization(avatarId, customization);
  },
  
  loadCustomization: (avatarId) => {
    const { persistence } = get();
    const customization = persistence.loadCustomization(avatarId);
    
    if (customization) {
      get().updateAvatarCustomization(avatarId, customization);
    }
  },
  
  // Cleanup
  disposeAvatarSystem: () => {
    const { avatarSystem } = get();
    
    if (avatarSystem) {
      avatarSystem.dispose();
      set({
        avatarSystem: null,
        cameraController: null,
      });
    }
  },
}));
