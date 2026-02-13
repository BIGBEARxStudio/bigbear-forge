import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import type { CustomizationData } from '@/types';

export interface AvatarCustomizationPanelProps {
  avatarId: 'player' | 'ai';
  className?: string;
  style?: React.CSSProperties;
}

/**
 * AvatarCustomizationPanel - UI controls for avatar customization
 * Provides body part selection, color pickers, and accessory options
 */
export const AvatarCustomizationPanel: React.FC<AvatarCustomizationPanelProps> = ({
  avatarId,
  className = '',
  style = {},
}) => {
  const avatar = useGameStore((state) => state.avatars[avatarId]);
  const updateAvatarCustomization = useGameStore((state) => state.updateAvatarCustomization);
  const saveCustomization = useGameStore((state) => state.saveCustomization);

  const handleBodyPartChange = (part: keyof CustomizationData['bodyParts'], value: string) => {
    const newCustomization: CustomizationData = {
      ...avatar.customization,
      bodyParts: {
        ...avatar.customization.bodyParts,
        [part]: value,
      },
    };
    updateAvatarCustomization(avatarId, newCustomization);
  };

  const handleColorChange = (colorType: keyof CustomizationData['colors'], value: string) => {
    const newCustomization: CustomizationData = {
      ...avatar.customization,
      colors: {
        ...avatar.customization.colors,
        [colorType]: value,
      },
    };
    updateAvatarCustomization(avatarId, newCustomization);
  };

  const handleAccessoryChange = (accessory: keyof CustomizationData['accessories'], value: string) => {
    const newCustomization: CustomizationData = {
      ...avatar.customization,
      accessories: {
        ...avatar.customization.accessories,
        [accessory]: value || undefined,
      },
    };
    updateAvatarCustomization(avatarId, newCustomization);
  };

  const handleSave = () => {
    saveCustomization(avatarId);
  };

  return (
    <motion.div
      className={`avatar-customization-panel ${className}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: '20px',
        borderRadius: '8px',
        color: '#fff',
        minWidth: '280px',
        ...style,
      }}
      data-testid="avatar-customization-panel"
    >
      <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px' }}>
        {avatarId === 'player' ? 'Player' : 'AI'} Avatar
      </h3>

      {/* Body Parts Section */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ fontSize: '14px', marginBottom: '12px', color: '#aaa' }}>
          Body Parts
        </h4>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
            Head
          </label>
          <select
            value={avatar.customization.bodyParts.head}
            onChange={(e) => handleBodyPartChange('head', e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #444',
              backgroundColor: '#222',
              color: '#fff',
            }}
            data-testid="head-select"
          >
            <option value="default">Default</option>
            <option value="round">Round</option>
            <option value="square">Square</option>
          </select>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
            Torso
          </label>
          <select
            value={avatar.customization.bodyParts.torso}
            onChange={(e) => handleBodyPartChange('torso', e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #444',
              backgroundColor: '#222',
              color: '#fff',
            }}
            data-testid="torso-select"
          >
            <option value="default">Default</option>
            <option value="athletic">Athletic</option>
            <option value="bulky">Bulky</option>
          </select>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
            Arms
          </label>
          <select
            value={avatar.customization.bodyParts.arms}
            onChange={(e) => handleBodyPartChange('arms', e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #444',
              backgroundColor: '#222',
              color: '#fff',
            }}
            data-testid="arms-select"
          >
            <option value="default">Default</option>
            <option value="long">Long</option>
            <option value="short">Short</option>
          </select>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
            Legs
          </label>
          <select
            value={avatar.customization.bodyParts.legs}
            onChange={(e) => handleBodyPartChange('legs', e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #444',
              backgroundColor: '#222',
              color: '#fff',
            }}
            data-testid="legs-select"
          >
            <option value="default">Default</option>
            <option value="long">Long</option>
            <option value="short">Short</option>
          </select>
        </div>
      </div>

      {/* Colors Section */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ fontSize: '14px', marginBottom: '12px', color: '#aaa' }}>
          Colors
        </h4>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
            Skin
          </label>
          <input
            type="color"
            value={avatar.customization.colors.skin}
            onChange={(e) => handleColorChange('skin', e.target.value)}
            style={{
              width: '100%',
              height: '40px',
              borderRadius: '4px',
              border: '1px solid #444',
              cursor: 'pointer',
            }}
            data-testid="skin-color-picker"
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
            Hair
          </label>
          <input
            type="color"
            value={avatar.customization.colors.hair}
            onChange={(e) => handleColorChange('hair', e.target.value)}
            style={{
              width: '100%',
              height: '40px',
              borderRadius: '4px',
              border: '1px solid #444',
              cursor: 'pointer',
            }}
            data-testid="hair-color-picker"
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
            Clothing
          </label>
          <input
            type="color"
            value={avatar.customization.colors.clothing}
            onChange={(e) => handleColorChange('clothing', e.target.value)}
            style={{
              width: '100%',
              height: '40px',
              borderRadius: '4px',
              border: '1px solid #444',
              cursor: 'pointer',
            }}
            data-testid="clothing-color-picker"
          />
        </div>
      </div>

      {/* Accessories Section */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ fontSize: '14px', marginBottom: '12px', color: '#aaa' }}>
          Accessories
        </h4>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
            Hat
          </label>
          <select
            value={avatar.customization.accessories.hat || ''}
            onChange={(e) => handleAccessoryChange('hat', e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #444',
              backgroundColor: '#222',
              color: '#fff',
            }}
            data-testid="hat-select"
          >
            <option value="">None</option>
            <option value="cap">Cap</option>
            <option value="helmet">Helmet</option>
            <option value="crown">Crown</option>
          </select>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
            Weapon
          </label>
          <select
            value={avatar.customization.accessories.weapon || ''}
            onChange={(e) => handleAccessoryChange('weapon', e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #444',
              backgroundColor: '#222',
              color: '#fff',
            }}
            data-testid="weapon-select"
          >
            <option value="">None</option>
            <option value="sword">Sword</option>
            <option value="axe">Axe</option>
            <option value="staff">Staff</option>
          </select>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
            Shield
          </label>
          <select
            value={avatar.customization.accessories.shield || ''}
            onChange={(e) => handleAccessoryChange('shield', e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #444',
              backgroundColor: '#222',
              color: '#fff',
            }}
            data-testid="shield-select"
          >
            <option value="">None</option>
            <option value="round">Round Shield</option>
            <option value="kite">Kite Shield</option>
            <option value="tower">Tower Shield</option>
          </select>
        </div>
      </div>

      {/* Save Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleSave}
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: '4px',
          border: 'none',
          backgroundColor: '#4CAF50',
          color: '#fff',
          fontSize: '14px',
          fontWeight: 'bold',
          cursor: 'pointer',
        }}
        data-testid="save-button"
      >
        Save Customization
      </motion.button>
    </motion.div>
  );
};
