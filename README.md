# Interactive Scene Controller

A real-time interactive scene controller built with Next.js and Bun, featuring WebSocket communication between control and display interfaces.

## Tech Stack

### Frontend

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **p5.js** - Creative coding library for interactive scenes

### Backend

- **Bun** - JavaScript runtime and bundler
- **Hono** - Lightweight web framework
- **WebSocket** - Real-time bidirectional communication

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── index.ts          # Main server entry point
│   │   └── types/           # Shared type definitions
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── app/             # Next.js app router pages
    │   │   ├── control/     # Control interface
    │   │   └── display/     # Display interface
    │   ├── components/      # Reusable React components
    │   │   ├── ui/          # Shadcn UI components
    │   │   └── select-with-flag.tsx  # Country selector
    │   ├── scenes/          # Interactive scenes
    │   │   ├── space/       # Space scene with planets
    │   │   ├── flow-field/  # Flow field particles
    │   │   └── garden/      # Interactive garden
    │   └── types/          # Shared type definitions
    └── package.json
```

## Features

### Interactive Scenes

#### Space Scene

- Dynamic star field with parallax effect
- Procedurally generated planets with rings
- Camera panning and user interaction
- Real-time user details particles

#### Flow Field Scene

- Dynamic vector field visualization
- Interactive particle system
- Mouse force field interaction
- User details integration

#### Garden Scene

- Interactive plant growth system
- Dynamic wind effects
- Cloud system with parallax
- Particle effects (petals, leaves)
- User details integration

### Scene Architecture

Each scene follows a modular system-based architecture:

- Separate systems for different functionalities (particles, user details, etc.)
- Centralized constants and type definitions
- Consistent resize handling
- WebSocket integration for real-time updates

### Real-time Scene Control

- Multiple interactive scenes (Space, Flow Field, Garden)
- Real-time synchronization between control and display interfaces
- Lazy-loaded scene components for optimal performance
- Toast notifications for scene changes and sync events

### WebSocket Communication

- Bidirectional real-time updates
- Client type registration (control/display)
- Scene state persistence across page refreshes
- Connection status handling and error recovery

### UI Components

- Responsive tab-based scene switcher
- Loading states with layout shift prevention
- Smooth transitions between scenes
- Country selection with flag icons

## Getting Started

1. Clone the repository
2. Install dependencies:

   ```bash
   # Install frontend dependencies
   cd frontend
   pnpm install

   # Install backend dependencies
   cd backend
   bun install
   ```

3. Start the development servers:

   ```bash
   # Start backend server (from backend directory)
   bun dev

   # Start frontend server (from frontend directory)
   pnpm dev
   ```

4. Open your browser:
   - Control interface: [http://localhost:3000/control](http://localhost:3000/control)
   - Display interface: [http://localhost:3000/display](http://localhost:3000/display)

## Environment Setup

### Backend

```env
PORT=3001              # HTTP server port
WS_PORT=3002          # WebSocket server port
```

### Frontend

```env
NEXT_PUBLIC_WS_BACKEND_URL=ws://localhost:3002  # WebSocket server URL
NEXT_PUBLIC_DISPLAY_URL=http://localhost:3000/display  # Display page URL
```

## Contributing

Currently not accepting contributions.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
