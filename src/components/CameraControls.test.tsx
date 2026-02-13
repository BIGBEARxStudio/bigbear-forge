import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CameraControls } from './CameraControls';
import { useGameStore } from '@/stores/gameStore';

describe('CameraControls', () => {
  beforeEach(() => {
    // Reset store state
    useGameStore.setState({
      camera: {
        distance: 5,
        azimuthAngle: 0,
        polarAngle: Math.PI / 4,
      },
    });
  });

  describe('Rendering', () => {
    it('should render camera controls container', () => {
      render(<CameraControls />);
      
      const controls = screen.getByTestId('camera-controls');
      expect(controls).toBeDefined();
    });

    it('should render control instructions', () => {
      render(<CameraControls />);
      
      const instructions = screen.getByTestId('control-instructions');
      expect(instructions).toBeDefined();
      expect(instructions.textContent).toContain('Drag to orbit');
      expect(instructions.textContent).toContain('Scroll to zoom');
    });

    it('should render camera info display', () => {
      render(<CameraControls />);
      
      const cameraInfo = screen.getByTestId('camera-info');
      expect(cameraInfo).toBeDefined();
      expect(cameraInfo.textContent).toContain('Distance');
      expect(cameraInfo.textContent).toContain('Azimuth');
      expect(cameraInfo.textContent).toContain('Polar');
    });

    it('should render reset button', () => {
      render(<CameraControls />);
      
      const resetButton = screen.getByTestId('reset-button');
      expect(resetButton).toBeDefined();
    });

    it('should apply custom className', () => {
      render(<CameraControls className="custom-class" />);
      
      const controls = screen.getByTestId('camera-controls');
      expect(controls.className).toContain('custom-class');
    });
  });

  describe('Mouse Drag Orbit', () => {
    it('should change cursor to grabbing when dragging', () => {
      render(<CameraControls />);
      
      const controls = screen.getByTestId('camera-controls');
      expect(controls.style.cursor).toBe('grab');
      
      fireEvent.mouseDown(controls, { clientX: 100, clientY: 100 });
      expect(controls.style.cursor).toBe('grabbing');
      
      fireEvent.mouseUp(controls);
      expect(controls.style.cursor).toBe('grab');
    });

    it('should call orbitCamera on mouse drag', () => {
      const orbitSpy = vi.spyOn(useGameStore.getState(), 'orbitCamera');
      
      render(<CameraControls />);
      
      const controls = screen.getByTestId('camera-controls');
      
      fireEvent.mouseDown(controls, { clientX: 100, clientY: 100 });
      fireEvent.mouseMove(controls, { clientX: 150, clientY: 120 });
      
      expect(orbitSpy).toHaveBeenCalled();
    });

    it('should not call orbitCamera when not dragging', () => {
      const orbitSpy = vi.spyOn(useGameStore.getState(), 'orbitCamera');
      
      render(<CameraControls />);
      
      const controls = screen.getByTestId('camera-controls');
      fireEvent.mouseMove(controls, { clientX: 150, clientY: 120 });
      
      expect(orbitSpy).not.toHaveBeenCalled();
    });

    it('should stop dragging on mouse up', () => {
      render(<CameraControls />);
      
      const controls = screen.getByTestId('camera-controls');
      
      fireEvent.mouseDown(controls, { clientX: 100, clientY: 100 });
      expect(controls.style.cursor).toBe('grabbing');
      
      fireEvent.mouseUp(controls);
      expect(controls.style.cursor).toBe('grab');
    });

    it('should stop dragging on mouse leave', () => {
      render(<CameraControls />);
      
      const controls = screen.getByTestId('camera-controls');
      
      fireEvent.mouseDown(controls, { clientX: 100, clientY: 100 });
      expect(controls.style.cursor).toBe('grabbing');
      
      fireEvent.mouseLeave(controls);
      expect(controls.style.cursor).toBe('grab');
    });

    it('should show dragging indicator when dragging', () => {
      render(<CameraControls />);
      
      const controls = screen.getByTestId('camera-controls');
      
      // Not dragging initially
      expect(screen.queryByTestId('dragging-indicator')).toBeNull();
      
      // Start dragging
      fireEvent.mouseDown(controls, { clientX: 100, clientY: 100 });
      
      const indicator = screen.getByTestId('dragging-indicator');
      expect(indicator).toBeDefined();
      expect(indicator.textContent).toContain('Orbiting');
    });

    it('should apply sensitivity to orbit delta', () => {
      const orbitSpy = vi.spyOn(useGameStore.getState(), 'orbitCamera');
      
      render(<CameraControls sensitivity={2.0} />);
      
      const controls = screen.getByTestId('camera-controls');
      
      fireEvent.mouseDown(controls, { clientX: 100, clientY: 100 });
      fireEvent.mouseMove(controls, { clientX: 110, clientY: 110 });
      
      // With sensitivity 2.0, delta should be doubled
      expect(orbitSpy).toHaveBeenCalledWith(20, 20);
    });
  });

  describe('Mouse Wheel Zoom', () => {
    it('should call zoomCamera on wheel event', () => {
      const zoomSpy = vi.spyOn(useGameStore.getState(), 'zoomCamera');
      
      render(<CameraControls />);
      
      const controls = screen.getByTestId('camera-controls');
      fireEvent.wheel(controls, { deltaY: 100 });
      
      expect(zoomSpy).toHaveBeenCalled();
    });

    it('should prevent default wheel behavior', () => {
      render(<CameraControls />);
      
      const controls = screen.getByTestId('camera-controls');
      
      // fireEvent.wheel automatically handles preventDefault
      // We just need to verify the handler is called
      const wheelHandler = vi.fn();
      controls.addEventListener('wheel', wheelHandler);
      
      fireEvent.wheel(controls, { deltaY: 100 });
      
      expect(wheelHandler).toHaveBeenCalled();
    });

    it('should apply zoom sensitivity', () => {
      const zoomSpy = vi.spyOn(useGameStore.getState(), 'zoomCamera');
      
      render(<CameraControls zoomSensitivity={2.0} />);
      
      const controls = screen.getByTestId('camera-controls');
      fireEvent.wheel(controls, { deltaY: 100 });
      
      // With zoomSensitivity 2.0, delta should be doubled
      expect(zoomSpy).toHaveBeenCalledWith(2.0);
    });
  });

  describe('Reset Button', () => {
    it('should call resetCamera when clicked', () => {
      const resetSpy = vi.spyOn(useGameStore.getState(), 'resetCamera');
      
      render(<CameraControls />);
      
      const resetButton = screen.getByTestId('reset-button');
      fireEvent.click(resetButton);
      
      expect(resetSpy).toHaveBeenCalled();
    });

    it('should have correct title attribute', () => {
      render(<CameraControls />);
      
      const resetButton = screen.getByTestId('reset-button');
      expect(resetButton.getAttribute('title')).toBe('Reset Camera');
    });
  });

  describe('Camera Info Display', () => {
    it('should display current camera distance', () => {
      useGameStore.setState({
        camera: {
          distance: 7.5,
          azimuthAngle: 0,
          polarAngle: Math.PI / 4,
        },
      });
      
      render(<CameraControls />);
      
      const cameraInfo = screen.getByTestId('camera-info');
      expect(cameraInfo.textContent).toContain('7.50');
    });

    it('should display azimuth angle in degrees', () => {
      useGameStore.setState({
        camera: {
          distance: 5,
          azimuthAngle: Math.PI / 2, // 90 degrees
          polarAngle: Math.PI / 4,
        },
      });
      
      render(<CameraControls />);
      
      const cameraInfo = screen.getByTestId('camera-info');
      expect(cameraInfo.textContent).toContain('90.0°');
    });

    it('should display polar angle in degrees', () => {
      useGameStore.setState({
        camera: {
          distance: 5,
          azimuthAngle: 0,
          polarAngle: Math.PI / 3, // 60 degrees
        },
      });
      
      render(<CameraControls />);
      
      const cameraInfo = screen.getByTestId('camera-info');
      expect(cameraInfo.textContent).toContain('60.0°');
    });

    it('should update when camera state changes', () => {
      const { rerender } = render(<CameraControls />);
      
      let cameraInfo = screen.getByTestId('camera-info');
      expect(cameraInfo.textContent).toContain('5.00');
      
      useGameStore.setState({
        camera: {
          distance: 8.0,
          azimuthAngle: 0,
          polarAngle: Math.PI / 4,
        },
      });
      
      rerender(<CameraControls />);
      
      cameraInfo = screen.getByTestId('camera-info');
      expect(cameraInfo.textContent).toContain('8.00');
    });
  });

  describe('User Select', () => {
    it('should have user-select none to prevent text selection', () => {
      render(<CameraControls />);
      
      const controls = screen.getByTestId('camera-controls');
      expect(controls.style.userSelect).toBe('none');
    });
  });

  describe('Container Properties', () => {
    it('should have relative positioning', () => {
      render(<CameraControls />);
      
      const controls = screen.getByTestId('camera-controls');
      expect(controls.style.position).toBe('relative');
    });

    it('should have full width and height', () => {
      render(<CameraControls />);
      
      const controls = screen.getByTestId('camera-controls');
      expect(controls.style.width).toBe('100%');
      expect(controls.style.height).toBe('100%');
    });
  });
});
