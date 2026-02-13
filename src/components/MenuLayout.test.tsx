import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MenuLayout } from './MenuLayout';

describe('MenuLayout', () => {
  describe('Rendering', () => {
    it('should render layout container', () => {
      render(
        <MenuLayout>
          <div>Test Content</div>
        </MenuLayout>
      );

      expect(screen.getByTestId('menu-layout')).toBeInTheDocument();
    });

    it('should render children in content container', () => {
      render(
        <MenuLayout>
          <div data-testid="test-child">Test Content</div>
        </MenuLayout>
      );

      const contentContainer = screen.getByTestId('menu-content');
      const child = screen.getByTestId('test-child');
      expect(contentContainer).toContainElement(child);
    });

    it('should apply custom className', () => {
      render(
        <MenuLayout className="custom-class">
          <div>Test Content</div>
        </MenuLayout>
      );

      const layout = screen.getByTestId('menu-layout');
      expect(layout.className).toContain('custom-class');
    });
  });

  describe('Background', () => {
    it('should show background animations by default', () => {
      const { container } = render(
        <MenuLayout>
          <div>Test Content</div>
        </MenuLayout>
      );

      const layout = screen.getByTestId('menu-layout');
      // Background animations are motion.div elements
      const motionDivs = layout.querySelectorAll('[style*="position: absolute"]');
      expect(motionDivs.length).toBeGreaterThan(0);
    });

    it('should hide background when disabled', () => {
      const { container } = render(
        <MenuLayout showBackground={false}>
          <div>Test Content</div>
        </MenuLayout>
      );

      const layout = screen.getByTestId('menu-layout');
      // Should only have the content container
      const absoluteElements = layout.querySelectorAll(
        '[style*="position: absolute"]'
      );
      // Content container is also absolute, so we check for animated backgrounds
      const animatedBackgrounds = layout.querySelectorAll(
        '[style*="border-radius: 50%"]'
      );
      expect(animatedBackgrounds).toHaveLength(0);
    });
  });

  describe('Layout Structure', () => {
    it('should have centered flex layout', () => {
      render(
        <MenuLayout>
          <div>Test Content</div>
        </MenuLayout>
      );

      const layout = screen.getByTestId('menu-layout');
      expect(layout).toHaveStyle({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      });
    });

    it('should have minimum viewport height', () => {
      render(
        <MenuLayout>
          <div>Test Content</div>
        </MenuLayout>
      );

      const layout = screen.getByTestId('menu-layout');
      const style = layout.getAttribute('style');
      expect(style).toContain('min-height: 100vh');
    });

    it('should have content container with max width', () => {
      render(
        <MenuLayout>
          <div>Test Content</div>
        </MenuLayout>
      );

      const content = screen.getByTestId('menu-content');
      expect(content).toHaveStyle({
        maxWidth: '1200px',
        width: '100%',
      });
    });

    it('should have relative positioning for content', () => {
      render(
        <MenuLayout>
          <div>Test Content</div>
        </MenuLayout>
      );

      const content = screen.getByTestId('menu-content');
      expect(content).toHaveStyle({ position: 'relative' });
    });
  });

  describe('Responsive Design', () => {
    it('should have padding for content', () => {
      render(
        <MenuLayout>
          <div>Test Content</div>
        </MenuLayout>
      );

      const content = screen.getByTestId('menu-content');
      const style = content.getAttribute('style');
      expect(style).toContain('padding: 2rem');
    });

    it('should prevent overflow', () => {
      render(
        <MenuLayout>
          <div>Test Content</div>
        </MenuLayout>
      );

      const layout = screen.getByTestId('menu-layout');
      expect(layout).toHaveStyle({ overflow: 'hidden' });
    });
  });
});
