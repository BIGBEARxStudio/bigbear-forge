import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isWebGLAvailable } from './WebGLDetection';

describe('WebGLDetection', () => {
  let originalCreateElement: typeof document.createElement;

  beforeEach(() => {
    originalCreateElement = document.createElement;
  });

  afterEach(() => {
    document.createElement = originalCreateElement;
  });

  it('should return true when WebGL is available', () => {
    // Mock canvas with WebGL context
    const mockCanvas = {
      getContext: vi.fn((type: string) => {
        if (type === 'webgl' || type === 'experimental-webgl') {
          return {}; // Mock WebGL context
        }
        return null;
      }),
    };

    document.createElement = vi.fn((tagName: string) => {
      if (tagName === 'canvas') {
        return mockCanvas as any;
      }
      return originalCreateElement.call(document, tagName);
    });

    expect(isWebGLAvailable()).toBe(true);
  });

  it('should return false when WebGL is not available', () => {
    // Mock canvas without WebGL context
    const mockCanvas = {
      getContext: vi.fn(() => null),
    };

    document.createElement = vi.fn((tagName: string) => {
      if (tagName === 'canvas') {
        return mockCanvas as any;
      }
      return originalCreateElement.call(document, tagName);
    });

    expect(isWebGLAvailable()).toBe(false);
  });

  it('should return false when getContext throws an error', () => {
    // Mock canvas that throws error
    const mockCanvas = {
      getContext: vi.fn(() => {
        throw new Error('WebGL not supported');
      }),
    };

    document.createElement = vi.fn((tagName: string) => {
      if (tagName === 'canvas') {
        return mockCanvas as any;
      }
      return originalCreateElement.call(document, tagName);
    });

    expect(isWebGLAvailable()).toBe(false);
  });

  it('should check both webgl and experimental-webgl contexts', () => {
    // Mock canvas that only supports experimental-webgl
    const mockCanvas = {
      getContext: vi.fn((type: string) => {
        if (type === 'experimental-webgl') {
          return {}; // Mock WebGL context
        }
        return null;
      }),
    };

    document.createElement = vi.fn((tagName: string) => {
      if (tagName === 'canvas') {
        return mockCanvas as any;
      }
      return originalCreateElement.call(document, tagName);
    });

    expect(isWebGLAvailable()).toBe(true);
    expect(mockCanvas.getContext).toHaveBeenCalledWith('webgl');
    expect(mockCanvas.getContext).toHaveBeenCalledWith('experimental-webgl');
  });
});
