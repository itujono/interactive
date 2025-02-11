# Interactive Scene Controller

A real-time interactive scene controller built with Next.js and Bun, featuring WebSocket communication between control and display interfaces.

## Tech Stack

### Frontend

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn UI** - Reusable UI components
- **Lucide Icons** - Beautiful and consistent icons
- **Sonner** - Toast notifications

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
    │   │   └── scenes/      # Scene components
    │   └── types/          # Shared type definitions
    └── package.json
```

## Features

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
- Loading states and error handling
- Smooth transitions between scenes
- Scrollable tab interface

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

## Architecture

### WebSocket Communication Flow

1. Control and Display clients connect to WebSocket server
2. Clients register their type (control/display)
3. Server maintains current scene state
4. Scene changes are broadcasted to all relevant clients
5. State is persisted on server for new connections

### Scene Management

- Scenes are lazy-loaded using Next.js dynamic imports
- Each scene is isolated in its own component
- Scene state is managed through WebSocket messages
- Controlled tabs ensure sync between all clients

## Development

### Adding New Scenes

1. Create new scene component in `src/components/scenes`
2. Add scene type to `src/types/scenes.ts`
3. Update `TabSwitcher` component with new scene option
4. Add lazy-loaded import in display page

### WebSocket Message Types

- `SCENE_CHANGE`: Broadcast scene changes
- `SCENE_STATUS`: Request/respond with current scene
- `CONTROL_INPUT`: Send control inputs to displays

## Environment Setup

### Backend

```env
PORT=3001              # HTTP server port
WS_PORT=3002          # WebSocket server port
```

### Frontend

```env
NEXT_PUBLIC_WS_URL=ws://localhost:3002  # WebSocket server URL
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
