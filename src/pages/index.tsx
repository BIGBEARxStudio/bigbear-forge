import React from 'react';
import { navigate } from 'gatsby';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';

/**
 * Index Page - Landing page with play button
 */
const IndexPage: React.FC = () => {
  const handlePlay = () => {
    navigate('/game');
  };

  return (
    <>
      <Helmet>
        <title>BigBear Portfolio Game - Premium Card Battle</title>
        <meta
          name="description"
          content="A premium browser-based portfolio card game showcasing elite game design and development skills."
        />
        <meta property="og:title" content="BigBear Portfolio Game" />
        <meta property="og:type" content="website" />
        <meta
          property="og:description"
          content="Premium card battle game built with React, TypeScript, and Three.js"
        />
      </Helmet>

      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          color: '#fff',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{
            fontSize: 'clamp(2rem, 8vw, 4rem)',
            fontWeight: 'bold',
            marginBottom: '1rem',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          BigBear Portfolio Game
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          style={{
            fontSize: 'clamp(1rem, 3vw, 1.5rem)',
            marginBottom: '3rem',
            textAlign: 'center',
            color: '#a0a0a0',
            maxWidth: '600px',
            padding: '0 1rem',
          }}
        >
          A premium card battle experience built with elite game design
          principles
        </motion.p>

        {/* Play Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.5,
            delay: 0.6,
            type: 'spring',
            stiffness: 200,
          }}
          whileHover={{
            scale: 1.05,
            boxShadow: '0 0 30px rgba(102, 126, 234, 0.6)',
          }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePlay}
          style={{
            fontSize: '1.5rem',
            padding: '1rem 3rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '50px',
            color: '#fff',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
          }}
        >
          Play Now
        </motion.button>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          style={{
            marginTop: '4rem',
            display: 'flex',
            gap: '2rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
            maxWidth: '800px',
            padding: '0 1rem',
          }}
        >
          {[
            { icon: '⚡', text: '60 FPS Gameplay' },
            { icon: '🎮', text: 'Smooth Animations' },
            { icon: '🎨', text: '3D Avatars' },
            { icon: '🃏', text: 'Strategic Combat' },
          ].map((feature, index) => (
            <motion.div
              key={feature.text}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <div style={{ fontSize: '2rem' }}>{feature.icon}</div>
              <div style={{ fontSize: '0.9rem', color: '#a0a0a0' }}>
                {feature.text}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          style={{
            position: 'absolute',
            bottom: '2rem',
            fontSize: '0.9rem',
            color: '#666',
          }}
        >
          Built with craft by Orlando
        </motion.div>
      </div>
    </>
  );
};

export default IndexPage;
