# BigBear Portfolio Game

A premium browser-based portfolio card game built with Gatsby, React, TypeScript, and elite game design principles.

## Tech Stack

- **Framework**: Gatsby 5 + React 18
- **Language**: TypeScript (strict mode)
- **State Management**: Zustand + XState
- **Animation**: GSAP + Framer Motion
- **3D**: Three.js + React Three Fiber
- **Testing**: Vitest + fast-check (property-based testing)

## Architecture

This game follows AAA game development principles:
- 60fps RAF-based game loop (independent of React)
- GPU-accelerated animations (transform/opacity only)
- State machines for combat flow (XState)
- Reactive state management (Zustand)
- Property-based testing for correctness

## Performance Targets

- 60fps during combat
- <100ms input latency
- <200KB initial bundle
- <3s combat scene load
- Lighthouse score 90+

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run develop

# Run tests
npm test

# Run tests with UI
npm test:ui

# Type check
npm run type-check

# Build for production
npm run build
```

## Project Structure

```
src/
├── systems/       # Game systems (GameLoop, AI, etc.)
├── components/    # React components
├── stores/        # Zustand stores
├── types/         # TypeScript definitions
└── test/          # Test utilities
```

## Sprint Progress

- [x] Sprint 1: Foundation (Architecture locked)
- [ ] Sprint 2: Core Game Loop (In Progress)
  - [x] Task 1: Project structure ✓
  - [ ] Task 2: Game Loop System
  - [ ] Task 3: Zustand Store
  - [ ] Task 4: Combat State Machine
  - [ ] ...20 tasks total

## Design Philosophy

- **Performance is a feature** - Never sacrifice speed
- **Anti-generic protocol** - No corporate patterns
- **Creator authority** - Skills as discoverable cards
- **Elite tier motion** - Every interaction has weight
- **Mythic storytelling** - Portfolio as game world

---

Built with craft by Orlando.
