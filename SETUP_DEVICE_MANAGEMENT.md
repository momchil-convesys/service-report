# Setup Instructions - Device Management System

## Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Angular 21
- npm or yarn

## Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Configuration
Create `.env` file in backend directory:
```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=service_report
CORS_ORIGIN=http://localhost:4200
```

### 3. Database Setup
```bash
# Create database
createdb service_report

# Run migrations
psql -U postgres -d service_report -f ../database/migrations/001_init.sql

# Optional: Seed data
psql -U postgres -d service_report -f ../database/migrations/002_seed_data.sql
```

### 4. Start Backend Server
```bash
npm start
```

Server runs on `http://localhost:3000`

## Frontend Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Environment Configuration
Update `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

### 3. Start Angular Development Server
```bash
ng serve
```

Application runs on `http://localhost:4200`

## Database Migration - Device Table

The devices table is automatically created when running the migration:

```sql
CREATE TABLE devices (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  manufacturer VARCHAR(255) NOT NULL,
  model VARCHAR(255) NOT NULL,
  serial_number VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  power_rating DECIMAL(10, 2),
  installation_date TIMESTAMP NOT NULL,
  location VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);
```

## Testing the Device API

### Using cURL

#### Create Device
```bash
curl -X POST http://localhost:3000/api/devices \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Solar Inverter 1",
    "type": "inverter",
    "manufacturer": "Victron Energy",
    "model": "MultiPlus 24/3000",
    "serial_number": "ABC123XYZ789",
    "status": "active",
    "power_rating": 3.0,
    "installation_date": "2023-01-15",
    "location": "Main Building"
  }'
```

#### Get All Devices
```bash
curl http://localhost:3000/api/devices
```

#### Get Device by ID
```bash
curl http://localhost:3000/api/devices/{id}
```

#### Update Device
```bash
curl -X PUT http://localhost:3000/api/devices/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "status": "maintenance",
    "notes": "Under maintenance"
  }'
```

#### Delete Device
```bash
curl -X DELETE http://localhost:3000/api/devices/{id}
```

### Using Postman
1. Import the API collection (if available)
2. Set base URL: `http://localhost:3000/api`
3. Use the provided endpoints

## Docker Setup (Optional)

### Build and Run with Docker Compose
```bash
docker-compose up -d
```

This starts:
- PostgreSQL on port 5432
- Backend API on port 3000
- Frontend on port 4200

### Individual Docker Commands

#### Build Backend Image
```bash
cd backend
docker build -t service-report-backend .
docker run -p 3000:3000 --env-file .env service-report-backend
```

#### Build Frontend Image
```bash
cd frontend
docker build -t service-report-frontend .
docker run -p 4200:4200 service-report-frontend
```

## Troubleshooting

### Connection Refused on Port 3000
- Ensure backend server is running: `npm start` in backend directory
- Check if port 3000 is in use: `lsof -i :3000`
- Change PORT in .env file if needed

### Database Connection Error
- Verify PostgreSQL is running
- Check .env file has correct DB credentials
- Verify database exists: `psql -l`
- Run migrations: `psql -U postgres -d service_report -f migrations/001_init.sql`

### CORS Errors
- Update CORS_ORIGIN in backend .env
- Ensure frontend URL matches CORS configuration
- Clear browser cache

### Module Not Found Errors
- Run `npm install` in both frontend and backend
- Delete node_modules and package-lock.json, then `npm install`
- Ensure Node.js version is 18+

### Port Already in Use
- Find process: `lsof -i :PORT_NUMBER`
- Kill process: `kill -9 PID`
- Or change port in .env/environment files

## Development Workflow

### 1. Start All Services
```bash
# Terminal 1 - PostgreSQL (if not running as service)
# Terminal 2 - Backend
cd backend && npm start

# Terminal 3 - Frontend
cd frontend && ng serve
```

### 2. Access Applications
- Frontend: `http://localhost:4200`
- Backend API: `http://localhost:3000/api`
- Database: `localhost:5432`

### 3. Device Management Flow
1. Navigate to "Devices" in the app
2. View all devices or filter by type/status
3. Click "Add New Device" to create
4. Fill in device details (required fields marked with *)
5. Click "Add Device" to save
6. View device details by clicking "View"
7. Edit by clicking "Edit"
8. Delete by clicking "Delete" (with confirmation)

## Production Deployment

### Backend Deployment
1. Build: `npm run build`
2. Deploy compiled JavaScript
3. Set environment variables
4. Run migrations on production database
5. Start with: `npm start`

### Frontend Deployment
1. Build: `ng build --configuration production`
2. Deploy dist folder to web server
3. Configure environment for production API

### Database Deployment
1. Create production PostgreSQL instance
2. Run migrations
3. Set up backups
4. Configure connection pooling for performance

## Performance Optimization

### Backend
- Use database connection pooling
- Add caching layer (Redis)
- Implement pagination for large datasets
- Optimize database queries with indexes

### Frontend
- Enable production mode
- Minimize bundle size
- Use lazy loading for components
- Implement virtual scrolling for large lists

## Monitoring & Logging

### Backend Logging
- Use Winston or similar logging library
- Log all API requests
- Track errors and exceptions
- Monitor database performance

### Frontend Logging
- Use Angular's built-in logging
- Track user interactions
- Monitor component performance
- Send error reports to backend

## Backup & Recovery

### Database Backup
```bash
pg_dump -U postgres service_report > backup.sql
```

### Database Restore
```bash
psql -U postgres -d service_report < backup.sql
```

## Version Control

Recommended .gitignore:
```
node_modules/
dist/
build/
.env
.env.local
*.log
.DS_Store
```

## Next Steps

1. ✅ Device Management System Complete
2. Link devices to service reports
3. Add device history tracking
4. Implement authentication
5. Add device performance metrics
6. Create reporting dashboard
