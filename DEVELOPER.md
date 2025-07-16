# SP_Sim Developer Documentation

## Overview

SP_Sim is a single-player political economy simulation web game that allows players to experience the complexities of governing a nation. Players must balance economic policies, political decisions, manage scandals, and respond to global events while maintaining their political power and the welfare of their citizens.

## Game Concept

The game simulates the real-world challenges of political leadership by incorporating multiple interconnected systems:

- **Economic System**: GDP, unemployment, inflation, taxation, trade
- **Political System**: Approval ratings, elections, coalition building, policy implementation
- **Scandal System**: Media coverage, public opinion, crisis management
- **Global System**: International relations, trade agreements, global events

## Technology Stack

### Frontend
- **Framework**: Vanilla JavaScript with modern ES6+ features
- **UI Library**: Custom lightweight components with CSS3
- **Build Tool**: Vite for development and bundling
- **Styling**: SCSS/CSS3 with CSS Grid and Flexbox

### Backend (Optional - can be fully client-side)
- **Runtime**: Node.js (if server features needed)
- **Framework**: Express.js (for potential multiplayer or data persistence)
- **Database**: Local Storage / IndexedDB for single-player saves

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint with Airbnb config
- **Formatting**: Prettier
- **Testing**: Jest for unit tests, Playwright for E2E
- **Version Control**: Git with conventional commits

## Architecture

### Core Game Engine

```
SP_Sim/
├── src/
│   ├── core/
│   │   ├── GameEngine.js          # Main game loop and state management
│   │   ├── EventSystem.js         # Event handling and dispatching
│   │   └── SaveSystem.js          # Game save/load functionality
│   ├── simulation/
│   │   ├── EconomySimulation.js   # Economic calculations and logic
│   │   ├── PoliticalSimulation.js # Political mechanics and approval
│   │   ├── ScandalSimulation.js   # Media and scandal management
│   │   └── GlobalSimulation.js    # International events and relations
│   ├── ui/
│   │   ├── components/            # Reusable UI components
│   │   ├── screens/               # Game screens and layouts
│   │   └── charts/                # Data visualization components
│   ├── data/
│   │   ├── policies/              # Policy definitions and effects
│   │   ├── events/                # Random events and scenarios
│   │   └── countries/             # Country-specific data
│   └── utils/
│       ├── calculations.js        # Mathematical utilities
│       ├── random.js              # Random number generation
│       └── formatting.js          # Display formatting utilities
```

### State Management

The game uses a centralized state management pattern with the following structure:

```javascript
GameState = {
  player: {
    name: string,
    party: string,
    experience: number,
    skills: object
  },
  country: {
    name: string,
    population: number,
    gdp: number,
    debt: number,
    stability: number
  },
  economy: {
    unemployment: number,
    inflation: number,
    growth: number,
    sectors: object
  },
  politics: {
    approval: number,
    coalition: array,
    opposition: array,
    nextElection: date
  },
  global: {
    relations: object,
    trade: object,
    globalEvents: array
  },
  time: {
    currentDate: date,
    term: number,
    week: number
  }
}
```

### Event-Driven Architecture

The game operates on an event-driven architecture where:

1. **User Actions** trigger events (policy changes, decisions)
2. **Simulation Engines** process events and update state
3. **UI Components** listen for state changes and re-render
4. **Random Events** are injected based on time and conditions

## Development Principles

### 1. Modular Design
- Each simulation system is independent and communicates through events
- UI components are reusable and state-agnostic
- Clear separation between game logic and presentation

### 2. Performance
- Efficient calculation algorithms for real-time simulation
- Lazy loading of non-critical components
- Optimized rendering with minimal DOM manipulation

### 3. Extensibility
- Plugin architecture for adding new simulation modules
- Event system allows easy addition of new mechanics
- Data-driven design for easy content creation

### 4. User Experience
- Intuitive interface with clear feedback
- Progressive disclosure of complexity
- Mobile-responsive design

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm 8+
- Modern web browser with ES6+ support

### Development Setup

```bash
# Clone the repository
git clone https://github.com/McPolitics/SP_Sim.git
cd SP_Sim

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Project Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production bundle
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run lint` - Run ESLint
- `npm run format` - Run Prettier
- `npm run analyze` - Bundle size analysis

## Code Style Guidelines

### JavaScript
- Use ES6+ features (arrow functions, destructuring, modules)
- Prefer `const` over `let`, avoid `var`
- Use meaningful variable and function names
- Document complex algorithms with comments
- Follow functional programming principles where possible

### File Naming
- Use PascalCase for classes and components
- Use camelCase for functions and variables
- Use kebab-case for file names
- Use UPPER_CASE for constants

### Git Workflow
- Use conventional commits: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`
- Keep commits atomic and focused
- Write descriptive commit messages
- Use feature branches for development

## Testing Strategy

### Unit Tests
- Test all calculation functions in isolation
- Mock external dependencies
- Aim for 80%+ code coverage
- Focus on edge cases and error conditions

### Integration Tests
- Test simulation module interactions
- Verify state transitions
- Test event propagation

### End-to-End Tests
- Test complete user workflows
- Verify UI responsiveness
- Test save/load functionality

## Documentation Standards

- Use JSDoc comments for all public functions
- Maintain up-to-date README files in each module
- Document API contracts and data structures
- Include examples in documentation

## Docker Deployment

SP_Sim supports containerized deployment using Docker for both development and production environments.

### Prerequisites

- Docker 20.10+ and Docker Compose v2+
- For VPS deployment: SSH access and Docker installed on target server

### Development with Docker

Build and run the development environment:

```bash
# Build the full Docker image (includes Node.js build process)
docker compose -f docker-compose.dev.yml build

# Start the development container
docker compose -f docker-compose.dev.yml up -d

# Access the application at http://localhost:3000
```

### Production Deployment

#### Simple Single-Container Deployment

```bash
# Ensure you have built the project
npm run build

# Build and run production container
docker build -t sp_sim .
docker run -d --name sp_sim -p 80:80 sp_sim

# Check health
curl http://localhost/health
```

#### Production with Load Balancer

```bash
# Use production docker-compose with nginx reverse proxy
TAG=latest docker compose -f docker-compose.prod.yml up -d

# The application will be available on port 80
```

### VPS Deployment via CI/CD

The repository includes automated VPS deployment via GitHub Actions. Set up the following secrets:

- `VPS_HOST`: Your VPS hostname/IP
- `VPS_USERNAME`: SSH username  
- `VPS_SSH_KEY`: Private SSH key for authentication
- `VPS_DEPLOY_PATH`: Deployment directory (e.g., `/opt/sp_sim`)
- `VPS_SITE_URL`: Public URL for health checks

The deployment process:
1. Builds and pushes Docker image to GitHub Container Registry
2. Deploys to VPS using Docker Compose
3. Runs comprehensive health checks
4. Automatically rolls back on failure

### Docker Configuration Files

- `Dockerfile` - Optimized for CI/CD (uses pre-built assets)
- `Dockerfile.full` - Complete build process from source
- `docker-compose.yml` - Simple production deployment
- `docker-compose.prod.yml` - Production with nginx reverse proxy
- `docker-compose.dev.yml` - Development environment

### Deployment Scripts

Located in `scripts/`:

- `deploy-docker.sh` - Automated VPS deployment
- `health-check-docker.sh` - Comprehensive health verification  
- `rollback-docker.sh` - Emergency rollback capabilities

```bash
# Example manual deployment to VPS
export TAG=latest
export VPS_DEPLOY_PATH=/opt/sp_sim
export VPS_SITE_URL=https://your-domain.com

./scripts/deploy-docker.sh
```

### Container Health Monitoring

The containers include built-in health checks and the repository provides a comprehensive health check script:

```bash
# Run all health checks
./scripts/health-check-docker.sh all

# Check specific aspects
./scripts/health-check-docker.sh container  # Container status
./scripts/health-check-docker.sh http      # HTTP endpoints
./scripts/health-check-docker.sh content   # Content integrity
```

### Emergency Rollback

If a deployment fails, use the rollback script:

```bash
# Rollback to previous version
./scripts/rollback-docker.sh previous

# Rollback to specific version
./scripts/rollback-docker.sh version v1.2.3

# Interactive rollback mode
./scripts/rollback-docker.sh interactive
```

## Next Steps

1. Review the [Development Roadmap](./ROADMAP.md)
2. Read the simulation module documentation:
   - [Economy Simulation](./docs/economy-simulation.md)
   - [Political Simulation](./docs/political-simulation.md)
   - [Scandal Simulation](./docs/scandal-simulation.md)
   - [Global Simulation](./docs/global-simulation.md)
3. Set up your development environment
4. Review existing issues and contribute!

## Contributing

We welcome contributions! Please read our contributing guidelines and code of conduct before submitting pull requests.

For questions or discussions, please open an issue or join our development chat.