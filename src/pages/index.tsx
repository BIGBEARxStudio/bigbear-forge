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
          content="A premium browser-based portfolio card game showcasing elite game design and development skills. Built with React, TypeScript, Three.js, and modern web technologies."
        />
        <meta name="keywords" content="card game, browser game, portfolio, React, TypeScript, Three.js, game development" />
        <meta name="author" content="Orlando - BigBear Studio" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://bigbear-forge.com/" />
        <meta property="og:title" content="BigBear Portfolio Game - Premium Card Battle" />
        <meta
          property="og:description"
          content="Premium card battle game built with React, TypeScript, and Three.js. Experience 60 FPS gameplay with 3D avatars and strategic combat."
        />
        <meta property="og:image" content="https://bigbear-forge.com/og-image.jpg" />
        <meta property="og:site_name" content="BigBear Portfolio Game" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://bigbear-forge.com/" />
        <meta name="twitter:title" content="BigBear Portfolio Game - Premium Card Battle" />
        <meta
          name="twitter:description"
          content="Premium card battle game built with React, TypeScript, and Three.js. Experience 60 FPS gameplay with 3D avatars and strategic combat."
        />
        <meta name="twitter:image" content="https://bigbear-forge.com/twitter-image.jpg" />
        
        {/* Additional Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#667eea" />
        <link rel="canonical" href="https://bigbear-forge.com/" />
        
        {/* Structured Data - VideoGame Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'VideoGame',
            name: 'BigBear Portfolio Game',
            description: 'A premium browser-based card battle game showcasing elite game design and development skills.',
            genre: 'Card Battle',
            playMode: 'SinglePlayer',
            gamePlatform: 'Web Browser',
            author: {
              '@type': 'Person',
              name: 'Orlando',
              affiliation: {
                '@type': 'Organization',
                name: 'BigBear Studio',
              },
            },
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock',
            },
            applicationCategory: 'Game',
            operatingSystem: 'Any',
          })}
        </script>
        
        {/* Structured Data - Organization Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'BigBear Studio',
            url: 'https://bigbear-forge.com',
            logo: 'https://bigbear-forge.com/logo.png',
            description: 'Elite game development studio specializing in premium web-based gaming experiences.',
          })}
        </script>
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
