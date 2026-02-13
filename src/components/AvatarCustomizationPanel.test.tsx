import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AvatarCustomizationPanel } from './AvatarCustomizationPanel';
import { useGameStore } from '@/stores/gameStore';
import { PLAYER_PRESET, AI_PRESET } from '@/systems/AvatarPresets';

describe('AvatarCustomizationPanel', () => {
  beforeEach(() => {
    // Reset store state
    useGameStore.setState({
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
    });
  });

  describe('Rendering', () => {
    it('should render player customization panel', () => {
      render(<AvatarCustomizationPanel avatarId="player" />);
      
      const panel = screen.getByTestId('avatar-customization-panel');
      expect(panel).toBeDefined();
      expect(panel.textContent).toContain('Player Avatar');
    });

    it('should render AI customization panel', () => {
      render(<AvatarCustomizationPanel avatarId="ai" />);
      
      const panel = screen.getByTestId('avatar-customization-panel');
      expect(panel).toBeDefined();
      expect(panel.textContent).toContain('AI Avatar');
    });

    it('should apply custom className', () => {
      render(<AvatarCustomizationPanel avatarId="player" className="custom-class" />);
      
      const panel = screen.getByTestId('avatar-customization-panel');
      expect(panel.className).toContain('custom-class');
    });
  });

  describe('Body Part Controls', () => {
    it('should render head selection dropdown', () => {
      render(<AvatarCustomizationPanel avatarId="player" />);
      
      const headSelect = screen.getByTestId('head-select') as HTMLSelectElement;
      expect(headSelect).toBeDefined();
      expect(headSelect.value).toBe(PLAYER_PRESET.customization.bodyParts.head);
    });

    it('should render torso selection dropdown', () => {
      render(<AvatarCustomizationPanel avatarId="player" />);
      
      const torsoSelect = screen.getByTestId('torso-select') as HTMLSelectElement;
      expect(torsoSelect).toBeDefined();
      expect(torsoSelect.value).toBe(PLAYER_PRESET.customization.bodyParts.torso);
    });

    it('should render arms selection dropdown', () => {
      render(<AvatarCustomizationPanel avatarId="player" />);
      
      const armsSelect = screen.getByTestId('arms-select') as HTMLSelectElement;
      expect(armsSelect).toBeDefined();
      expect(armsSelect.value).toBe(PLAYER_PRESET.customization.bodyParts.arms);
    });

    it('should render legs selection dropdown', () => {
      render(<AvatarCustomizationPanel avatarId="player" />);
      
      const legsSelect = screen.getByTestId('legs-select') as HTMLSelectElement;
      expect(legsSelect).toBeDefined();
      expect(legsSelect.value).toBe(PLAYER_PRESET.customization.bodyParts.legs);
    });

    it('should update head when selection changes', () => {
      const updateSpy = vi.spyOn(useGameStore.getState(), 'updateAvatarCustomization');
      
      render(<AvatarCustomizationPanel avatarId="player" />);
      
      const headSelect = screen.getByTestId('head-select') as HTMLSelectElement;
      fireEvent.change(headSelect, { target: { value: 'round' } });
      
      expect(updateSpy).toHaveBeenCalledWith('player', expect.objectContaining({
        bodyParts: expect.objectContaining({
          head: 'round',
        }),
      }));
    });

    it('should update torso when selection changes', () => {
      const updateSpy = vi.spyOn(useGameStore.getState(), 'updateAvatarCustomization');
      
      render(<AvatarCustomizationPanel avatarId="player" />);
      
      const torsoSelect = screen.getByTestId('torso-select') as HTMLSelectElement;
      fireEvent.change(torsoSelect, { target: { value: 'athletic' } });
      
      expect(updateSpy).toHaveBeenCalledWith('player', expect.objectContaining({
        bodyParts: expect.objectContaining({
          torso: 'athletic',
        }),
      }));
    });
  });

  describe('Color Controls', () => {
    it('should render skin color picker', () => {
      render(<AvatarCustomizationPanel avatarId="player" />);
      
      const skinPicker = screen.getByTestId('skin-color-picker') as HTMLInputElement;
      expect(skinPicker).toBeDefined();
      expect(skinPicker.type).toBe('color');
      expect(skinPicker.value).toBe(PLAYER_PRESET.customization.colors.skin);
    });

    it('should render hair color picker', () => {
      render(<AvatarCustomizationPanel avatarId="player" />);
      
      const hairPicker = screen.getByTestId('hair-color-picker') as HTMLInputElement;
      expect(hairPicker).toBeDefined();
      expect(hairPicker.type).toBe('color');
      expect(hairPicker.value).toBe(PLAYER_PRESET.customization.colors.hair);
    });

    it('should render clothing color picker', () => {
      render(<AvatarCustomizationPanel avatarId="player" />);
      
      const clothingPicker = screen.getByTestId('clothing-color-picker') as HTMLInputElement;
      expect(clothingPicker).toBeDefined();
      expect(clothingPicker.type).toBe('color');
      expect(clothingPicker.value).toBe(PLAYER_PRESET.customization.colors.clothing);
    });

    it('should update skin color when changed', () => {
      const updateSpy = vi.spyOn(useGameStore.getState(), 'updateAvatarCustomization');
      
      render(<AvatarCustomizationPanel avatarId="player" />);
      
      const skinPicker = screen.getByTestId('skin-color-picker') as HTMLInputElement;
      fireEvent.change(skinPicker, { target: { value: '#ff0000' } });
      
      expect(updateSpy).toHaveBeenCalledWith('player', expect.objectContaining({
        colors: expect.objectContaining({
          skin: '#ff0000',
        }),
      }));
    });

    it('should update hair color when changed', () => {
      const updateSpy = vi.spyOn(useGameStore.getState(), 'updateAvatarCustomization');
      
      render(<AvatarCustomizationPanel avatarId="player" />);
      
      const hairPicker = screen.getByTestId('hair-color-picker') as HTMLInputElement;
      fireEvent.change(hairPicker, { target: { value: '#00ff00' } });
      
      expect(updateSpy).toHaveBeenCalledWith('player', expect.objectContaining({
        colors: expect.objectContaining({
          hair: '#00ff00',
        }),
      }));
    });

    it('should update clothing color when changed', () => {
      const updateSpy = vi.spyOn(useGameStore.getState(), 'updateAvatarCustomization');
      
      render(<AvatarCustomizationPanel avatarId="player" />);
      
      const clothingPicker = screen.getByTestId('clothing-color-picker') as HTMLInputElement;
      fireEvent.change(clothingPicker, { target: { value: '#0000ff' } });
      
      expect(updateSpy).toHaveBeenCalledWith('player', expect.objectContaining({
        colors: expect.objectContaining({
          clothing: '#0000ff',
        }),
      }));
    });
  });

  describe('Accessory Controls', () => {
    it('should render hat selection dropdown', () => {
      render(<AvatarCustomizationPanel avatarId="player" />);
      
      const hatSelect = screen.getByTestId('hat-select') as HTMLSelectElement;
      expect(hatSelect).toBeDefined();
    });

    it('should render weapon selection dropdown', () => {
      render(<AvatarCustomizationPanel avatarId="player" />);
      
      const weaponSelect = screen.getByTestId('weapon-select') as HTMLSelectElement;
      expect(weaponSelect).toBeDefined();
    });

    it('should render shield selection dropdown', () => {
      render(<AvatarCustomizationPanel avatarId="player" />);
      
      const shieldSelect = screen.getByTestId('shield-select') as HTMLSelectElement;
      expect(shieldSelect).toBeDefined();
    });

    it('should update hat when selection changes', () => {
      const updateSpy = vi.spyOn(useGameStore.getState(), 'updateAvatarCustomization');
      
      render(<AvatarCustomizationPanel avatarId="player" />);
      
      const hatSelect = screen.getByTestId('hat-select') as HTMLSelectElement;
      fireEvent.change(hatSelect, { target: { value: 'helmet' } });
      
      expect(updateSpy).toHaveBeenCalledWith('player', expect.objectContaining({
        accessories: expect.objectContaining({
          hat: 'helmet',
        }),
      }));
    });

    it('should update weapon when selection changes', () => {
      const updateSpy = vi.spyOn(useGameStore.getState(), 'updateAvatarCustomization');
      
      render(<AvatarCustomizationPanel avatarId="player" />);
      
      const weaponSelect = screen.getByTestId('weapon-select') as HTMLSelectElement;
      fireEvent.change(weaponSelect, { target: { value: 'sword' } });
      
      expect(updateSpy).toHaveBeenCalledWith('player', expect.objectContaining({
        accessories: expect.objectContaining({
          weapon: 'sword',
        }),
      }));
    });

    it('should remove accessory when set to empty', () => {
      const updateSpy = vi.spyOn(useGameStore.getState(), 'updateAvatarCustomization');
      
      render(<AvatarCustomizationPanel avatarId="player" />);
      
      const hatSelect = screen.getByTestId('hat-select') as HTMLSelectElement;
      fireEvent.change(hatSelect, { target: { value: '' } });
      
      expect(updateSpy).toHaveBeenCalledWith('player', expect.objectContaining({
        accessories: expect.objectContaining({
          hat: undefined,
        }),
      }));
    });
  });

  describe('Save Button', () => {
    it('should render save button', () => {
      render(<AvatarCustomizationPanel avatarId="player" />);
      
      const saveButton = screen.getByTestId('save-button');
      expect(saveButton).toBeDefined();
      expect(saveButton.textContent).toContain('Save');
    });

    it('should call saveCustomization when clicked', () => {
      const saveSpy = vi.spyOn(useGameStore.getState(), 'saveCustomization');
      
      render(<AvatarCustomizationPanel avatarId="player" />);
      
      const saveButton = screen.getByTestId('save-button');
      fireEvent.click(saveButton);
      
      expect(saveSpy).toHaveBeenCalledWith('player');
    });

    it('should save AI customization when AI panel', () => {
      const saveSpy = vi.spyOn(useGameStore.getState(), 'saveCustomization');
      
      render(<AvatarCustomizationPanel avatarId="ai" />);
      
      const saveButton = screen.getByTestId('save-button');
      fireEvent.click(saveButton);
      
      expect(saveSpy).toHaveBeenCalledWith('ai');
    });
  });

  describe('State Synchronization', () => {
    it('should reflect current avatar customization', () => {
      const customCustomization = {
        ...PLAYER_PRESET.customization,
        bodyParts: {
          ...PLAYER_PRESET.customization.bodyParts,
          head: 'round',
        },
      };
      
      useGameStore.setState({
        avatars: {
          player: {
            id: 'player',
            customization: customCustomization,
            currentAnimation: 'idle',
          },
          ai: {
            id: 'ai',
            customization: AI_PRESET.customization,
            currentAnimation: 'idle',
          },
        },
      });
      
      render(<AvatarCustomizationPanel avatarId="player" />);
      
      const headSelect = screen.getByTestId('head-select') as HTMLSelectElement;
      expect(headSelect.value).toBe('round');
    });

    it('should update when store changes', () => {
      const { rerender } = render(<AvatarCustomizationPanel avatarId="player" />);
      
      const headSelect = screen.getByTestId('head-select') as HTMLSelectElement;
      expect(headSelect.value).toBe('default');
      
      // Update store
      useGameStore.setState({
        avatars: {
          player: {
            id: 'player',
            customization: {
              ...PLAYER_PRESET.customization,
              bodyParts: {
                ...PLAYER_PRESET.customization.bodyParts,
                head: 'square',
              },
            },
            currentAnimation: 'idle',
          },
          ai: useGameStore.getState().avatars.ai,
        },
      });
      
      rerender(<AvatarCustomizationPanel avatarId="player" />);
      
      expect(headSelect.value).toBe('square');
    });
  });
});
