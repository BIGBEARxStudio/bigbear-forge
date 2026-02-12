/**
 * Unified Input Handler
 * 
 * Handles all input types: mouse, keyboard, touch, and gamepad.
 * Tracks input latency and prevents input conflicts.
 */

export type InputType = 'mouse' | 'keyboard' | 'touch' | 'gamepad';

export interface InputEvent {
  type: InputType;
  action: string;
  timestamp: number;
  data?: any;
}

export interface InputConfig {
  latencyThreshold?: number; // milliseconds
  throttleDelay?: number; // milliseconds
}

/**
 * UnifiedInputHandler - Manages all game input
 */
export class UnifiedInputHandler {
  private config: Required<InputConfig>;
  private lastInputTime: number = 0;
  private lastInputType: InputType | null = null;
  private inputLatencies: number[] = [];
  private maxLatencySamples: number = 60;
  private isEnabled: boolean = true;
  private throttleTimeout: number | null = null;
  
  // Event listeners
  private listeners: Map<string, Set<(event: InputEvent) => void>> = new Map();
  
  // Gamepad state
  private gamepadIndex: number | null = null;
  private gamepadPollInterval: number | null = null;
  
  constructor(config?: InputConfig) {
    this.config = {
      latencyThreshold: 100,
      throttleDelay: 16, // ~60fps
      ...config,
    };
  }
  
  /**
   * Initialize input handlers
   */
  initialize(): void {
    this.setupMouseHandlers();
    this.setupKeyboardHandlers();
    this.setupTouchHandlers();
    this.setupGamepadHandlers();
  }
  
  /**
   * Setup mouse input handlers
   */
  private setupMouseHandlers(): void {
    document.addEventListener('click', this.handleMouseClick);
    document.addEventListener('mousedown', this.handleMouseDown);
    document.addEventListener('mouseup', this.handleMouseUp);
    document.addEventListener('mousemove', this.handleMouseMove);
  }
  
  /**
   * Setup keyboard input handlers
   */
  private setupKeyboardHandlers(): void {
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
  }
  
  /**
   * Setup touch input handlers
   */
  private setupTouchHandlers(): void {
    document.addEventListener('touchstart', this.handleTouchStart);
    document.addEventListener('touchend', this.handleTouchEnd);
    document.addEventListener('touchmove', this.handleTouchMove);
  }
  
  /**
   * Setup gamepad input handlers
   */
  private setupGamepadHandlers(): void {
    window.addEventListener('gamepadconnected', this.handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', this.handleGamepadDisconnected);
    
    // Start polling for gamepad input
    this.startGamepadPolling();
  }
  
  /**
   * Handle mouse click
   */
  private handleMouseClick = (e: MouseEvent): void => {
    if (!this.isEnabled) return;
    
    const event: InputEvent = {
      type: 'mouse',
      action: 'click',
      timestamp: performance.now(),
      data: { x: e.clientX, y: e.clientY, button: e.button },
    };
    
    this.processInput(event);
  };
  
  /**
   * Handle mouse down
   */
  private handleMouseDown = (e: MouseEvent): void => {
    if (!this.isEnabled) return;
    
    const event: InputEvent = {
      type: 'mouse',
      action: 'mousedown',
      timestamp: performance.now(),
      data: { x: e.clientX, y: e.clientY, button: e.button },
    };
    
    this.processInput(event);
  };
  
  /**
   * Handle mouse up
   */
  private handleMouseUp = (e: MouseEvent): void => {
    if (!this.isEnabled) return;
    
    const event: InputEvent = {
      type: 'mouse',
      action: 'mouseup',
      timestamp: performance.now(),
      data: { x: e.clientX, y: e.clientY, button: e.button },
    };
    
    this.processInput(event);
  };
  
  /**
   * Handle mouse move
   */
  private handleMouseMove = (e: MouseEvent): void => {
    if (!this.isEnabled) return;
    
    const event: InputEvent = {
      type: 'mouse',
      action: 'mousemove',
      timestamp: performance.now(),
      data: { x: e.clientX, y: e.clientY },
    };
    
    this.processInput(event);
  };
  
  /**
   * Handle key down
   */
  private handleKeyDown = (e: KeyboardEvent): void => {
    if (!this.isEnabled) return;
    
    const event: InputEvent = {
      type: 'keyboard',
      action: 'keydown',
      timestamp: performance.now(),
      data: { key: e.key, code: e.code },
    };
    
    this.processInput(event);
  };
  
  /**
   * Handle key up
   */
  private handleKeyUp = (e: KeyboardEvent): void => {
    if (!this.isEnabled) return;
    
    const event: InputEvent = {
      type: 'keyboard',
      action: 'keyup',
      timestamp: performance.now(),
      data: { key: e.key, code: e.code },
    };
    
    this.processInput(event);
  };
  
  /**
   * Handle touch start
   */
  private handleTouchStart = (e: TouchEvent): void => {
    if (!this.isEnabled) return;
    
    const touch = e.touches[0];
    const event: InputEvent = {
      type: 'touch',
      action: 'touchstart',
      timestamp: performance.now(),
      data: { x: touch.clientX, y: touch.clientY },
    };
    
    this.processInput(event);
  };
  
  /**
   * Handle touch end
   */
  private handleTouchEnd = (e: TouchEvent): void => {
    if (!this.isEnabled) return;
    
    const event: InputEvent = {
      type: 'touch',
      action: 'touchend',
      timestamp: performance.now(),
    };
    
    this.processInput(event);
  };
  
  /**
   * Handle touch move
   */
  private handleTouchMove = (e: TouchEvent): void => {
    if (!this.isEnabled) return;
    
    const touch = e.touches[0];
    const event: InputEvent = {
      type: 'touch',
      action: 'touchmove',
      timestamp: performance.now(),
      data: { x: touch.clientX, y: touch.clientY },
    };
    
    this.processInput(event);
  };
  
  /**
   * Handle gamepad connected
   */
  private handleGamepadConnected = (e: GamepadEvent): void => {
    this.gamepadIndex = e.gamepad.index;
  };
  
  /**
   * Handle gamepad disconnected
   */
  private handleGamepadDisconnected = (): void => {
    this.gamepadIndex = null;
  };
  
  /**
   * Start polling for gamepad input
   */
  private startGamepadPolling(): void {
    this.gamepadPollInterval = window.setInterval(() => {
      this.pollGamepad();
    }, this.config.throttleDelay);
  }
  
  /**
   * Poll gamepad state
   */
  private pollGamepad(): void {
    if (!this.isEnabled || this.gamepadIndex === null) return;
    
    const gamepads = navigator.getGamepads();
    const gamepad = gamepads[this.gamepadIndex];
    
    if (!gamepad) return;
    
    // Check buttons
    gamepad.buttons.forEach((button, index) => {
      if (button.pressed) {
        const event: InputEvent = {
          type: 'gamepad',
          action: 'button',
          timestamp: performance.now(),
          data: { button: index, value: button.value },
        };
        
        this.processInput(event);
      }
    });
    
    // Check axes (analog sticks)
    gamepad.axes.forEach((value, index) => {
      if (Math.abs(value) > 0.1) { // Deadzone
        const event: InputEvent = {
          type: 'gamepad',
          action: 'axis',
          timestamp: performance.now(),
          data: { axis: index, value },
        };
        
        this.processInput(event);
      }
    });
  }
  
  /**
   * Process input event
   */
  private processInput(event: InputEvent): void {
    // Check for input conflicts (different input types too close together)
    if (this.lastInputType && this.lastInputType !== event.type) {
      const timeSinceLastInput = event.timestamp - this.lastInputTime;
      if (timeSinceLastInput < this.config.throttleDelay) {
        // Ignore conflicting input
        return;
      }
    }
    
    // Track latency
    const latency = performance.now() - event.timestamp;
    this.inputLatencies.push(latency);
    
    if (this.inputLatencies.length > this.maxLatencySamples) {
      this.inputLatencies.shift();
    }
    
    // Update last input tracking
    this.lastInputTime = event.timestamp;
    this.lastInputType = event.type;
    
    // Emit event to listeners
    this.emit(event.action, event);
  }
  
  /**
   * Add event listener
   */
  on(action: string, callback: (event: InputEvent) => void): void {
    if (!this.listeners.has(action)) {
      this.listeners.set(action, new Set());
    }
    
    this.listeners.get(action)!.add(callback);
  }
  
  /**
   * Remove event listener
   */
  off(action: string, callback: (event: InputEvent) => void): void {
    const listeners = this.listeners.get(action);
    if (listeners) {
      listeners.delete(callback);
    }
  }
  
  /**
   * Emit event to listeners
   */
  private emit(action: string, event: InputEvent): void {
    const listeners = this.listeners.get(action);
    if (listeners) {
      listeners.forEach(callback => callback(event));
    }
  }
  
  /**
   * Get average input latency
   */
  getAverageLatency(): number {
    if (this.inputLatencies.length === 0) return 0;
    
    const sum = this.inputLatencies.reduce((a, b) => a + b, 0);
    return sum / this.inputLatencies.length;
  }
  
  /**
   * Get maximum input latency
   */
  getMaxLatency(): number {
    if (this.inputLatencies.length === 0) return 0;
    
    return Math.max(...this.inputLatencies);
  }
  
  /**
   * Check if latency is within threshold
   */
  isLatencyWithinThreshold(): boolean {
    return this.getAverageLatency() <= this.config.latencyThreshold;
  }
  
  /**
   * Enable input handling
   */
  enable(): void {
    this.isEnabled = true;
  }
  
  /**
   * Disable input handling
   */
  disable(): void {
    this.isEnabled = false;
  }
  
  /**
   * Check if input is enabled
   */
  isInputEnabled(): boolean {
    return this.isEnabled;
  }
  
  /**
   * Cleanup and remove event listeners
   */
  dispose(): void {
    // Remove mouse listeners
    document.removeEventListener('click', this.handleMouseClick);
    document.removeEventListener('mousedown', this.handleMouseDown);
    document.removeEventListener('mouseup', this.handleMouseUp);
    document.removeEventListener('mousemove', this.handleMouseMove);
    
    // Remove keyboard listeners
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
    
    // Remove touch listeners
    document.removeEventListener('touchstart', this.handleTouchStart);
    document.removeEventListener('touchend', this.handleTouchEnd);
    document.removeEventListener('touchmove', this.handleTouchMove);
    
    // Remove gamepad listeners
    window.removeEventListener('gamepadconnected', this.handleGamepadConnected);
    window.removeEventListener('gamepaddisconnected', this.handleGamepadDisconnected);
    
    // Stop gamepad polling
    if (this.gamepadPollInterval !== null) {
      clearInterval(this.gamepadPollInterval);
      this.gamepadPollInterval = null;
    }
    
    // Clear listeners
    this.listeners.clear();
  }
}
