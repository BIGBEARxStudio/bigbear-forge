import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PerformanceMonitorComponent } from './PerformanceMonitorComponent';

describe('PerformanceMonitorComponent', () => {
  it('should render performance monitor', () => {
    render(<PerformanceMonitorComponent fps={60} frameTime={16.67} />);

    expect(screen.getByTestId('performance-monitor')).toBeInTheDocument();
  });

  it('should display FPS value', () => {
    render(<PerformanceMonitorComponent fps={60} frameTime={16.67} />);

    expect(screen.getByText('60.0')).toBeInTheDocument();
  });

  it('should display frame time', () => {
    render(<PerformanceMonitorComponent fps={60} frameTime={16.67} />);

    const frameTexts = screen.getAllByText(/16\.67ms/);
    expect(frameTexts.length).toBeGreaterThan(0);
  });

  it('should display target frame time', () => {
    render(<PerformanceMonitorComponent fps={60} frameTime={16.67} />);

    expect(screen.getByText('Target:')).toBeInTheDocument();
  });

  it('should show warning when frame time exceeds threshold', () => {
    render(
      <PerformanceMonitorComponent
        fps={30}
        frameTime={33.33}
        showWarnings={true}
        warningThreshold={16.67}
      />
    );

    expect(screen.getByText('⚠️ Performance Warning')).toBeInTheDocument();
    expect(screen.getByText('Frame time exceeds target')).toBeInTheDocument();
  });

  it('should not show warning when frame time is below threshold', () => {
    render(
      <PerformanceMonitorComponent
        fps={60}
        frameTime={16.0}
        showWarnings={true}
        warningThreshold={16.67}
      />
    );

    expect(screen.queryByText('⚠️ Performance Warning')).not.toBeInTheDocument();
  });

  it('should not show warning when showWarnings is false', () => {
    render(
      <PerformanceMonitorComponent
        fps={30}
        frameTime={33.33}
        showWarnings={false}
        warningThreshold={16.67}
      />
    );

    expect(screen.queryByText('⚠️ Performance Warning')).not.toBeInTheDocument();
  });

  it('should use custom warning threshold', () => {
    render(
      <PerformanceMonitorComponent
        fps={45}
        frameTime={20}
        showWarnings={true}
        warningThreshold={25}
      />
    );

    expect(screen.queryByText('⚠️ Performance Warning')).not.toBeInTheDocument();
  });

  it('should render with custom className', () => {
    const { container } = render(
      <PerformanceMonitorComponent
        fps={60}
        frameTime={16.67}
        className="custom-monitor"
      />
    );

    const monitor = container.querySelector('.performance-monitor.custom-monitor');
    expect(monitor).toBeInTheDocument();
  });

  it('should display FPS label', () => {
    render(<PerformanceMonitorComponent fps={60} frameTime={16.67} />);

    expect(screen.getByText('FPS:')).toBeInTheDocument();
  });

  it('should display Frame label', () => {
    render(<PerformanceMonitorComponent fps={60} frameTime={16.67} />);

    expect(screen.getByText('Frame:')).toBeInTheDocument();
  });

  it('should display Target label', () => {
    render(<PerformanceMonitorComponent fps={60} frameTime={16.67} />);

    expect(screen.getByText('Target:')).toBeInTheDocument();
  });

  it('should handle low FPS', () => {
    render(<PerformanceMonitorComponent fps={15} frameTime={66.67} />);

    expect(screen.getByText('15.0')).toBeInTheDocument();
    expect(screen.getByText('66.67ms')).toBeInTheDocument();
  });

  it('should handle high FPS', () => {
    render(<PerformanceMonitorComponent fps={120} frameTime={8.33} />);

    expect(screen.getByText('120.0')).toBeInTheDocument();
    expect(screen.getByText('8.33ms')).toBeInTheDocument();
  });

  it('should format FPS to one decimal place', () => {
    render(<PerformanceMonitorComponent fps={59.876} frameTime={16.67} />);

    expect(screen.getByText('59.9')).toBeInTheDocument();
  });

  it('should format frame time to two decimal places', () => {
    render(<PerformanceMonitorComponent fps={60} frameTime={16.666666} />);

    const frameTexts = screen.getAllByText(/16\.67ms/);
    expect(frameTexts.length).toBeGreaterThan(0);
  });

  it('should handle zero FPS', () => {
    render(<PerformanceMonitorComponent fps={0} frameTime={0} />);

    expect(screen.getByText('0.0')).toBeInTheDocument();
    expect(screen.getByText('0.00ms')).toBeInTheDocument();
  });
});
