import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';

export interface GameErrorBoundaryProps {
  children: ReactNode;
  onRetry?: () => void;
  onReturnToMenu?: () => void;
}

interface GameErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * GameErrorBoundary - Catches React errors and displays fallback UI
 * Provides retry and return to menu options
 */
export class GameErrorBoundary extends Component<
  GameErrorBoundaryProps,
  GameErrorBoundaryState
> {
  constructor(props: GameErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<GameErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('GameErrorBoundary caught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  handleReturnToMenu = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    if (this.props.onReturnToMenu) {
      this.props.onReturnToMenu();
    } else {
      // Default: navigate to home
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            minHeight: '100vh',
            backgroundColor: '#1a1a2e',
            color: '#fff',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            padding: '2rem',
          }}
          data-testid="error-boundary-fallback"
        >
          {/* Error Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            style={{
              fontSize: '6rem',
              marginBottom: '2rem',
            }}
          >
            ⚠️
          </motion.div>

          {/* Error Title */}
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              fontSize: 'clamp(2rem, 8vw, 4rem)',
              fontWeight: 'bold',
              marginBottom: '1rem',
              textAlign: 'center',
            }}
            data-testid="error-title"
          >
            Oops! Something went wrong
          </motion.h1>

          {/* Error Message */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            style={{
              fontSize: '1.2rem',
              color: '#a0a0a0',
              marginBottom: '2rem',
              textAlign: 'center',
              maxWidth: '600px',
            }}
            data-testid="error-message"
          >
            {this.state.error?.message || 'An unexpected error occurred'}
          </motion.p>

          {/* Error Details (Development only) */}
          {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
            <motion.details
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              style={{
                marginBottom: '2rem',
                padding: '1rem',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                maxWidth: '800px',
                width: '100%',
                overflow: 'auto',
              }}
              data-testid="error-details"
            >
              <summary
                style={{
                  cursor: 'pointer',
                  marginBottom: '1rem',
                  fontSize: '1rem',
                  color: '#667eea',
                }}
              >
                Error Details (Development)
              </summary>
              <pre
                style={{
                  fontSize: '0.875rem',
                  color: '#e0e0e0',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {this.state.errorInfo.componentStack}
              </pre>
            </motion.details>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              width: '100%',
              maxWidth: '300px',
            }}
          >
            {/* Retry Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={this.handleRetry}
              style={{
                padding: '1rem 2rem',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                color: '#fff',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                transition: 'box-shadow 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
              }}
              data-testid="retry-button"
            >
              Try Again
            </motion.button>

            {/* Return to Menu Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={this.handleReturnToMenu}
              style={{
                padding: '1rem 2rem',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                color: '#fff',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              }}
              data-testid="return-to-menu-button"
            >
              Return to Menu
            </motion.button>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
