# Network Switch Temperature Monitoring Dashboard

## Overview

This application is a comprehensive temperature monitoring dashboard for network switches. It provides real-time visualization of temperature data across different types of network infrastructure devices (access, distribution, and core switches) located at various sites. The system helps network administrators monitor thermal conditions and identify potential hardware issues before they cause failures.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **API Pattern**: RESTful API design
- **Data Storage**: In-memory storage with interface for future database integration
- **Development**: Hot reloading with Vite integration in development mode

### Data Storage Solutions
- **Current**: In-memory storage using Maps for development/testing
- **Planned**: PostgreSQL with Drizzle ORM (configuration already in place)
- **Schema**: Two main entities - switches and temperature readings with relationships

## Key Components

### Dashboard Features
1. **Temperature Cards**: Quick overview of critical switches with visual status indicators
2. **Temperature Charts**: Real-time trend visualization and distribution analysis using Recharts
3. **Switch Table**: Comprehensive listing with filtering, searching, and pagination
4. **Sidebar Filters**: Site, switch type, and temperature status filtering
5. **Header Stats**: System-wide metrics and manual refresh capability

### API Endpoints
- `GET /api/switches` - Retrieve all switches
- `GET /api/switches/:id` - Get specific switch details
- `POST /api/switches` - Create new switch
- `PATCH /api/switches/:id/temperature` - Update switch temperature
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/temperature-distribution` - Temperature distribution data
- `GET /api/dashboard/temperature-trends` - Historical trend data

### Temperature Classification
- **Normal**: 20-45°C (green indicators)
- **Warning**: 45-60°C (yellow indicators)  
- **Critical**: >60°C (red indicators)

## Data Flow

1. **Data Input**: Temperature readings are collected and stored with timestamps
2. **Real-time Updates**: Frontend polls backend APIs for latest data
3. **Visualization**: Charts and cards update automatically based on filter selections
4. **User Interaction**: Filters and search modify displayed data without full page reloads
5. **State Management**: React Query handles caching, background updates, and optimistic updates

## External Dependencies

### Frontend Libraries
- **@radix-ui/***: Accessible UI primitives for complex components
- **@tanstack/react-query**: Server state management and caching
- **recharts**: Chart visualization library
- **wouter**: Lightweight routing
- **tailwindcss**: Utility-first CSS framework
- **react-hook-form**: Form handling with validation

### Backend Libraries
- **express**: Web server framework
- **drizzle-orm**: Type-safe SQL ORM
- **@neondatabase/serverless**: PostgreSQL database connector
- **zod**: Runtime type validation

### Development Tools
- **typescript**: Type safety across the stack
- **vite**: Fast build tool and dev server
- **drizzle-kit**: Database migration and introspection tool

## Deployment Strategy

### Build Process
1. **Frontend**: Vite builds React app to `dist/public`
2. **Backend**: esbuild bundles server code to `dist/index.js`
3. **Production**: Single Node.js process serves both API and static files

### Environment Configuration
- **Development**: Uses tsx for TypeScript execution and Vite dev server
- **Production**: Compiled JavaScript with static file serving
- **Database**: PostgreSQL connection via DATABASE_URL environment variable

### Key Scripts
- `npm run dev`: Development with hot reloading
- `npm run build`: Production build
- `npm run start`: Production server
- `npm run db:push`: Apply database schema changes

The application is designed with a clear separation between frontend and backend concerns, making it easy to scale and maintain. The modular component structure and type-safe API design ensure reliability and developer productivity.

## Recent Changes

### July 30, 2025 - Cisco Catalyst Center Integration
- ✓ Added full Catalyst Center API integration with authentication
- ✓ Implemented real-time device health data fetching from `/dna/intent/api/v1/device-health`
- ✓ Enhanced temperature data extraction from device health responses
- ✓ Added connection status indicator showing Catalyst Center vs mock data mode
- ✓ Improved PDF report generation with enhanced temperature statistics:
  - Detailed temperature analysis (min/max/average with switch names)
  - Historical temperature readings in detailed reports
  - Professional formatting with connection status indicators
- ✓ Added fallback mechanism: uses mock data when Catalyst Center is unavailable
- ✓ Environment variables configured: CATALYST_CENTER_BASE_URL, USERNAME, PASSWORD

### Current Status
- Application running with enhanced temperature monitoring capabilities
- PDF reports generate with actual temperature data points extracted from switches
- System automatically detects and uses Catalyst Center when properly configured
- Ready for production use with real Catalyst Center endpoint (requires correct base URL configuration)