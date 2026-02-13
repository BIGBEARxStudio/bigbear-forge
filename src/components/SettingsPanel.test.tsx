import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsPanel } from './SettingsPanel';

// Mock useSettings hook
vi.mock('@/hooks/useSettings', () => ({
  useSettings: () => ({
    settings: {
      volume: 70,
      musicVolume: 50,
      sfxVolume: 70,
      showPerformanceMonitor: false,
      reducedMotion: false,
    },
    updateSetting: vi.fn(),
    saveSettings: vi.fn(),
    resetSettings: vi.fn(),
  }),
}));

describe('SettingsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render settings panel', () => {
      render(<SettingsPanel />);

      expect(screen.getByTestId('settings-panel')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('should have dialog role', () => {
      render(<SettingsPanel />);

      const panel = screen.getByTestId('settings-panel');
      expect(panel).toHaveAttribute('role', 'dialog');
    });

    it('should have aria-labelledby', () => {
      render(<SettingsPanel />);

      const panel = screen.getByTestId('settings-panel');
      expect(panel).toHaveAttribute('aria-labelledby', 'settings-title');
    });
  });

  describe('Volume Controls', () => {
    it('should render master volume slider', () => {
      render(<SettingsPanel />);

      expect(screen.getByTestId('volume-slider')).toBeInTheDocument();
      expect(screen.getByTestId('volume-value')).toHaveTextContent('70%');
    });

    it('should render music volume slider', () => {
      render(<SettingsPanel />);

      expect(screen.getByTestId('music-volume-slider')).toBeInTheDocument();
      expect(screen.getByTestId('music-volume-value')).toHaveTextContent('50%');
    });

    it('should render sfx volume slider', () => {
      render(<SettingsPanel />);

      expect(screen.getByTestId('sfx-volume-slider')).toBeInTheDocument();
      expect(screen.getByTestId('sfx-volume-value')).toHaveTextContent('70%');
    });

    it('should have aria-labels for volume sliders', () => {
      render(<SettingsPanel />);

      expect(screen.getByLabelText('Master volume')).toBeInTheDocument();
      expect(screen.getByLabelText('Music volume')).toBeInTheDocument();
      expect(screen.getByLabelText('Sound effects volume')).toBeInTheDocument();
    });
  });

  describe('Display Options', () => {
    it('should render performance monitor toggle', () => {
      render(<SettingsPanel />);

      expect(screen.getByTestId('performance-monitor-toggle')).toBeInTheDocument();
      expect(screen.getByText('Show Performance Monitor')).toBeInTheDocument();
    });

    it('should render reduced motion toggle', () => {
      render(<SettingsPanel />);

      expect(screen.getByTestId('reduced-motion-toggle')).toBeInTheDocument();
      expect(screen.getByText('Reduced Motion')).toBeInTheDocument();
    });

    it('should have aria-labels for toggles', () => {
      render(<SettingsPanel />);

      expect(screen.getByLabelText('Show performance monitor')).toBeInTheDocument();
      expect(screen.getByLabelText('Enable reduced motion')).toBeInTheDocument();
    });
  });

  describe('Reset Button', () => {
    it('should render reset button', () => {
      render(<SettingsPanel />);

      expect(screen.getByTestId('reset-button')).toBeInTheDocument();
      expect(screen.getByText('Reset to Defaults')).toBeInTheDocument();
    });

    it('should have aria-label', () => {
      render(<SettingsPanel />);

      expect(screen.getByLabelText('Reset settings to defaults')).toBeInTheDocument();
    });
  });

  describe('Close Button', () => {
    it('should render close button when onClose is provided', () => {
      const onClose = vi.fn();
      render(<SettingsPanel onClose={onClose} />);

      expect(screen.getByTestId('close-button')).toBeInTheDocument();
    });

    it('should not render close button when onClose is not provided', () => {
      render(<SettingsPanel />);

      expect(screen.queryByTestId('close-button')).not.toBeInTheDocument();
    });

    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<SettingsPanel onClose={onClose} />);

      await user.click(screen.getByTestId('close-button'));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should have aria-label', () => {
      const onClose = vi.fn();
      render(<SettingsPanel onClose={onClose} />);

      expect(screen.getByLabelText('Close settings')).toBeInTheDocument();
    });
  });

  describe('Sections', () => {
    it('should have Audio section', () => {
      render(<SettingsPanel />);

      expect(screen.getByText('Audio')).toBeInTheDocument();
    });

    it('should have Display section', () => {
      render(<SettingsPanel />);

      expect(screen.getByText('Display')).toBeInTheDocument();
    });
  });

  describe('Props', () => {
    it('should accept custom className', () => {
      render(<SettingsPanel className="custom-class" />);

      const panel = screen.getByTestId('settings-panel');
      expect(panel).toHaveClass('custom-class');
    });
  });
});
