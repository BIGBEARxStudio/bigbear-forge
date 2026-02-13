import React from 'react';
import { motion } from 'framer-motion';

export interface MenuLayoutProps {
  children: React.ReactNode;
  showBackground?: boolean;
  className?: string;
}

/**
 * MenuLayout - Centered container for menu screens
 * Provides background animations and responsive navigation
 */
export const MenuLayout: React.FC<MenuLayoutProps> = ({
  children,
  showBackground = true,
  className = '',
}) => {
  return (
    <div
      className={`menu-layout ${className}`}
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        color: '#fff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
      data-testid="menu-layout"
    >
      {/* Animated Background */}
      {showBackground && (
        <>
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{
              position: 'absolute',
              top: '10%',
              left: '10%',
              width: '300px',
              height: '300px',
              borderRadius: '50%',
              background:
                'radial-gradient(circle, rgba(102, 126, 234, 0.3) 0%, transparent 70%)',
              filter: 'blur(40px)',
              zIndex: 0,
            }}
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              rotate: [360, 180, 0],
              opacity: [0.1, 0.15, 0.1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{
              position: 'absolute',
              bottom: '10%',
              right: '10%',
              width: '400px',
              height: '400px',
              borderRadius: '50%',
              background:
                'radial-gradient(circle, rgba(118, 75, 162, 0.3) 0%, transparent 70%)',
              filter: 'blur(40px)',
              zIndex: 0,
            }}
          />
        </>
      )}

      {/* Content Container */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '1200px',
          padding: '2rem',
        }}
        data-testid="menu-content"
      >
        {children}
      </div>
    </div>
  );
};
