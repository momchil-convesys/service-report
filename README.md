# Service Report System

A comprehensive service report management system with device management capabilities, built with Angular 21, Node.js/Express backend, and PostgreSQL database.

## Project Structure

```
service-report/
├── frontend/          # Angular 21 application
├── backend/           # Node.js/Express API server
├── database/          # PostgreSQL scripts and migrations
├── docker-compose.yml # Docker configuration (optional)
├── DEVICE_MANAGEMENT.md    # Device system documentation
└── SETUP_DEVICE_MANAGEMENT.md # Device setup guide
```

## Key Features

### Device Management System ⭐
- **Inverter Management**: Track and manage solar inverters
- **Battery Systems**: Monitor lithium batteries and storage solutions
- **Solar Panels**: Maintain solar panel arrays and specifications
- **Charge Controllers**: Manage MPPT and other charge controllers
- **Generators**: Backup generator tracking and maintenance
- **Other Equipment**: Support for miscellaneous devices
- Device filtering and search
- Device status tracking (Active, Inactive, Maintenance, Retired)
- Power rating specifications
- Installation date tracking
- Location management
- Comprehensive notes and documentation

### Service Report Management
- Comprehensive service report tracking
- Link reports to specific devices
- Report status management (Pending, In Progress, Completed, Closed)
- Priority levels (Low, Medium, High, Critical)
- Assignment tracking
- Real-time report tracking
- Note and documentation support

### General Features
- User authentication and authorization (planned)
- Real-time data updates
- PostgreSQL data persistence
- RESTful API architecture
- Responsive Angular Material UI components
- Mobile-friendly design
- Docker support for easy deployment

## Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- PostgreSQL 14 or higher
- Angular CLI 21

## Installation & Setup

### Frontend Setup
```bash
cd frontend
npm install
ng serve
```
Frontend will run on `http://localhost:4200`

### Backend Setup
```bash
cd backend
npm install
npm start
```
Backend API will run on `http://localhost:3000`

### Database Setup
1. Create PostgreSQL database
2. Run migration scripts from `/database` folder
3. Configure database connection in backend `.env` file

## Environment Variables

Create `.env` files in frontend and backend directories:

### Backend `.env`
```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=service_report
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
NODE_ENV=development
PORT=3000
```

### Frontend `environment.ts`
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

## Development

### Quick Start Guide

1. **Clone and Install**
   ```bash
   cd service-report
   npm install --prefix backend
   npm install --prefix frontend
   ```

2. **Setup Database**
   ```bash
   # Create database
   createdb service_report
   
   # Run migrations
   psql -U postgres -d service_report -f database/migrations/001_init.sql
   ```

3. **Configure Environment**
   - Copy `.env.example` to `.env` in backend folder
   - Update database credentials

4. **Start Services**
   ```bash
   # Terminal 1: Backend
   cd backend && npm start
   
   # Terminal 2: Frontend
   cd frontend && ng serve
   ```

5. **Access Application**
   - Frontend: `http://localhost:4200`
   - Backend API: `http://localhost:3000/api`

### Device Management Usage

1. **Navigate to Devices**
   - Click "Devices" in the navigation menu
   - View all devices or use filters to search by type/status

2. **Add New Device**
   - Click "Add New Device" button
   - Fill in required fields:
     - Device Name
     - Device Type (Inverter, Battery, Solar Panel, etc.)
     - Manufacturer
     - Model
     - Serial Number
     - Installation Date
   - Add optional information (Power Rating, Location, Notes)
   - Click "Add Device"

3. **View Device Details**
   - Click "View" on any device card
   - See all device specifications and history
   - Access Edit and Delete actions

4. **Edit Device**
   - Click "Edit" on device card or details page
   - Modify any device information
   - Click "Update Device" to save changes

5. **Delete Device**
   - Click "Delete" with confirmation
   - Device is permanently removed from system

6. **Filter Devices**
   - Use Type filter to show specific device types
   - Use Status filter (Active, Inactive, Maintenance, Retired)
   - Combine multiple filters for precise search

### Frontend Development
- Run `ng serve` for a dev server
- Navigate to `http://localhost:4200/`
- The application will automatically reload on file changes

### Backend Development
- Run `npm start` or `npm run dev` for development mode
- API documentation available at `http://localhost:3000/api/docs`

### Database Management
- Use pgAdmin or command line to manage PostgreSQL
- Run migrations: `npm run migrate` from backend directory

## API Endpoints

### Device Management ⭐
- `GET /api/devices` - Get all devices (supports filters: type, status)
- `POST /api/devices` - Create new device
- `GET /api/devices/:id` - Get device by ID
- `PUT /api/devices/:id` - Update device
- `DELETE /api/devices/:id` - Delete device
- `GET /api/devices/statistics/all` - Get device statistics

### Service Reports
- `GET /api/reports` - Get all reports
- `POST /api/reports` - Create new report
- `GET /api/reports/:id` - Get report by ID
- `PUT /api/reports/:id` - Update report
- `DELETE /api/reports/:id` - Delete report

### Authentication (Future)
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

## Testing

```bash
# Frontend tests
cd frontend
ng test

# Backend tests
cd backend
npm test
```

## Deployment

### Docker Deployment
```bash
docker-compose up --build
```

### Production Build
```bash
# Frontend
cd frontend
ng build --configuration production

# Backend
cd backend
npm run build
npm start
```

## License

MIT

## Support

For issues and questions, please create an issue in the repository.
