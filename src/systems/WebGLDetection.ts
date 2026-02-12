/**
 * WebGL Detection Utility
 * Detects whether WebGL is available in the current browser environment
 */

export function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!context;
  } catch {
    return false;
  }
}
