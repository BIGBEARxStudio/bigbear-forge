import React from 'react';
import { Link } from 'gatsby';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';

/**
 * 404 Page - Custom not found page
 */
const NotFoundPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>404 - Page Not Found | BigBear Portfolio Game</title>
        <meta name="robots" content="noindex, nofollow" />
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
          padding: '2rem',
        }}
      >
        {/* 404 Number */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
          style={{
            fontSize: 'clamp(4rem, 15vw, 8rem)',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '1rem',
          }}
        >
          404
        </motion.div>

        {/* Message */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
            fontWeight: 'bold',
            marginBottom: '1rem',
            textAlign: 'center',
          }}
        >
          Page Not Found
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{
            fontSize: 'clamp(1rem, 3vw, 1.2rem)',
            color: '#a0a0a0',
            marginBottom: '3rem',
            textAlign: 'center',
            maxWidth: '500px',
          }}
        >
          Looks like you've wandered into uncharted territory. The page you're
          looking for doesn't exist.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <Link
            to="/"
            style={{
              textDecoration: 'none',
            }}
          >
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: '0 0 30px rgba(102, 126, 234, 0.6)',
              }}
              whileTap={{ scale: 0.95 }}
              style={{
                fontSize: '1.2rem',
                padding: '0.8rem 2rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '50px',
                color: '#fff',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
              }}
            >
              Go Home
            </motion.button>
          </Link>

          <Link
            to="/game"
            style={{
              textDecoration: 'none',
            }}
          >
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: '0 0 30px rgba(102, 126, 234, 0.3)',
              }}
              whileTap={{ scale: 0.95 }}
              style={{
                fontSize: '1.2rem',
                padding: '0.8rem 2rem',
                background: 'transparent',
                border: '2px solid #667eea',
                borderRadius: '50px',
                color: '#667eea',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Play Game
            </motion.button>
          </Link>
        </motion.div>

        {/* Decorative Element */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 1, delay: 0.8 }}
          style={{
            position: 'absolute',
            fontSize: '20rem',
            color: '#667eea',
            opacity: 0.05,
            zIndex: -1,
            userSelect: 'none',
          }}
        >
          🃏
        </motion.div>
      </div>
    </>
  );
};

export default NotFoundPage;
