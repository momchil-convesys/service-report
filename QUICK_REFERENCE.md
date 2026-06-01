# Device Management System - Developer Quick Reference

## 🗂️ File Structure Quick Reference

### Backend Files
```
backend/
├── src/
│   ├── controllers/
│   │   └── device.controller.ts        ← Device request handlers
│   ├── models/
│   │   └── device.model.ts             ← Device data operations
│   ├── routes/
│   │   └── devices.routes.ts           ← Device API routes
│   └── index.ts                        ← Updated with device routes
├── package.json
├── tsconfig.json
└── .env.example                        ← Copy to .env
```

### Frontend Files
```
frontend/
├── src/
│   └── app/
│       ├── core/
│       │   ├── models/
│       │   │   └── device.model.ts     ← Device interfaces
│       │   └── services/
│       │       └── device.service.ts   ← Device API service
│       ├── features/
│       │   └── devices/
│       │       ├── devices-list/       ← List all devices
│       │       │   ├── devices-list.component.ts
│       │       │   ├── devices-list.component.html
│       │       │   └── devices-list.component.scss
│       │       ├── device-form/        ← Create/Edit device
│       │       │   ├── device-form.component.ts
│       │       │   ├── device-form.component.html
│       │       │   └── device-form.component.scss
│       │       └── device-detail/      ← View device details
│       │           ├── device-detail.component.ts
│       │           ├── device-detail.component.html
│       │           └── device-detail.component.scss
│       └── app.routes.ts               ← Updated with device routes
├── package.json
└── angular.json
```

### Database Files
```
database/
└── migrations/
    ├── 001_init.sql                   ← Creates devices table
    ├── 002_seed_data.sql              ← Original seed data
    └── 003_devices_seed.sql           ← Device seed data
```

### Documentation Files
```
project-root/
├── README.md                          ← Main documentation
├── DEVICE_MANAGEMENT.md               ← Device feature docs
├── SETUP_DEVICE_MANAGEMENT.md         ← Setup instructions
├── API_DOCUMENTATION.md               ← API reference
├── IMPLEMENTATION_SUMMARY.md          ← What was built
├── CHANGELOG.md                       ← Version history
└── QUICK_REFERENCE.md                 ← This file!
```

---

## 🚀 Quick Start Commands

### Terminal 1: PostgreSQL
```bash
# Ensure PostgreSQL is running
createdb service_report
psql -U postgres -d service_report -f database/migrations/001_init.sql
psql -U postgres -d service_report -f database/migrations/003_devices_seed.sql
```

### Terminal 2: Backend
```bash
cd backend
npm install
cp .env.example .env
npm start
# Server runs on http://localhost:3000
```

### Terminal 3: Frontend
```bash
cd frontend
npm install
ng serve
# Application runs on http://localhost:4200
```

---

## 🎯 API Quick Reference

### Create Device
```bash
curl -X POST http://localhost:3000/api/devices \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Inverter 1",
    "type": "inverter",
    "manufacturer": "Victron",
    "model": "MultiPlus",
    "serialNumber": "ABC123",
    "installationDate": "2023-01-15"
  }'
```

### Get All Devices
```bash
curl http://localhost:3000/api/devices
curl "http://localhost:3000/api/devices?type=inverter&status=active"
```

### Get Device by ID
```bash
curl http://localhost:3000/api/devices/550e8400-e29b-41d4-a716-446655440001
```

### Update Device
```bash
curl -X PUT http://localhost:3000/api/devices/550e8400-e29b-41d4-a716-446655440001 \
  -H "Content-Type: application/json" \
  -d '{"status": "maintenance"}'
```

### Delete Device
```bash
curl -X DELETE http://localhost:3000/api/devices/550e8400-e29b-41d4-a716-446655440001
```

### Get Statistics
```bash
curl http://localhost:3000/api/devices/statistics/all
```

---

## 📝 Component Quick Reference

### DevicesListComponent
**Path:** `frontend/src/app/features/devices/devices-list/`
**Route:** `/devices`
**Purpose:** Display all devices with filtering
**Key Methods:**
- `loadDevices()` - Fetch and filter devices
- `applyFilters()` - Apply filter criteria
- `deleteDevice(id)` - Delete device

**Key Properties:**
- `devices: Device[]` - All devices
- `filterType: DeviceType` - Filter by type
- `filterStatus: DeviceStatus` - Filter by status

---

### DeviceFormComponent
**Path:** `frontend/src/app/features/devices/device-form/`
**Route:** `/devices/add` or `/devices/:id/edit`
**Purpose:** Create or edit devices
**Key Methods:**
- `initForm()` - Initialize form
- `loadDevice(id)` - Load device for editing
- `onSubmit()` - Submit form

**Form Controls:**
- `name`, `type`, `manufacturer`, `model`, `serialNumber` (required)
- `status`, `powerRating`, `location`, `notes` (optional)
- `installationDate` (required)

---

### DeviceDetailComponent
**Path:** `frontend/src/app/features/devices/device-detail/`
**Route:** `/devices/:id`
**Purpose:** View device details
**Key Methods:**
- `loadDevice(id)` - Fetch device
- `editDevice()` - Navigate to edit
- `deleteDevice()` - Delete device

**Key Properties:**
- `device: Device` - Current device
- `loading: boolean` - Loading state
- `error: string` - Error messages

---

### DeviceService
**Path:** `frontend/src/app/core/services/device.service.ts`
**Dependency:** `HttpClient`
**Key Methods:**
- `createDevice(device)` - POST
- `getAllDevices(filter)` - GET
- `getDeviceById(id)` - GET by ID
- `updateDevice(id, device)` - PUT
- `deleteDevice(id)` - DELETE
- `getDeviceStatistics()` - GET stats

---

### DeviceModel
**Path:** `backend/src/models/device.model.ts`
**Purpose:** Database operations
**Static Methods:**
- `create(device)` - Insert device
- `findAll(filter)` - Select with filter
- `findById(id)` - Select by ID
- `update(id, device)` - Update device
- `delete(id)` - Delete device
- `getStatistics()` - Aggregated stats

---

### DeviceController
**Path:** `backend/src/controllers/device.controller.ts`
**Purpose:** Handle HTTP requests
**Static Methods:**
- `createDevice(req, res)` - POST handler
- `getAllDevices(req, res)` - GET handler
- `getDeviceById(req, res)` - GET :id handler
- `updateDevice(req, res)` - PUT handler
- `deleteDevice(req, res)` - DELETE handler
- `getDeviceStatistics(req, res)` - Stats handler

---

## 🗄️ Database Quick Reference

### Devices Table
```sql
SELECT * FROM devices;
SELECT * FROM devices WHERE type = 'inverter' AND status = 'active';
SELECT type, COUNT(*) FROM devices GROUP BY type;
```

### Device Types
- `'inverter'` - Inverter
- `'battery'` - Battery
- `'solar_panel'` - Solar Panel
- `'charge_controller'` - Charge Controller
- `'generator'` - Generator
- `'other'` - Other

### Device Status
- `'active'` - Active
- `'inactive'` - Inactive
- `'maintenance'` - Maintenance
- `'retired'` - Retired

---

## 🔍 Debugging Tips

### Frontend Issues
1. Check browser console for errors
2. Verify API URL in `environment.ts`
3. Check network tab for API calls
4. Look for validation errors on forms
5. Check component logs with `console.log()`

### Backend Issues
1. Check server is running on port 3000
2. Verify database connection in `.env`
3. Check database migrations ran successfully
4. Look for errors in server console
5. Use curl to test API endpoints directly

### Database Issues
1. Verify PostgreSQL is running
2. Check database exists: `psql -l`
3. Verify migrations ran: `psql -d service_report -c "SELECT * FROM devices;"`
4. Check connection string in `.env`

---

## 📚 Documentation Links

| Document | Purpose |
|----------|---------|
| README.md | Main project overview |
| DEVICE_MANAGEMENT.md | Feature documentation |
| SETUP_DEVICE_MANAGEMENT.md | Setup and installation |
| API_DOCUMENTATION.md | API reference |
| IMPLEMENTATION_SUMMARY.md | What was built |
| CHANGELOG.md | Version history |

---

## 🎨 Key Styling Classes

### Status Badges
- `.status-active` - Green badge
- `.status-inactive` - Red badge
- `.status-maintenance` - Yellow badge
- `.status-retired` - Gray badge

### Button Classes
- `.btn-primary` - Blue button
- `.btn-secondary` - Gray button
- `.btn-success` - Green button
- `.btn-danger` - Red button
- `.btn-warning` - Yellow button

### Form Classes
- `.form-control` - Input/select styling
- `.form-group` - Form group wrapper
- `.is-invalid` - Error state
- `.error-message` - Error text

---

## 🔐 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=service_report
DB_USER=postgres
DB_PASSWORD=postgres
CORS_ORIGIN=http://localhost:4200
```

### Frontend (environment.ts)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

---

## 🧪 Sample Data

### Create Device Example
```json
{
  "name": "Solar Inverter 1",
  "type": "inverter",
  "manufacturer": "Victron Energy",
  "model": "MultiPlus 24/3000",
  "serialNumber": "VIC-MP-001",
  "status": "active",
  "powerRating": 3.0,
  "installationDate": "2023-01-15",
  "location": "Main Building",
  "notes": "Primary inverter"
}
```

---

## 🔄 Common Workflows

### Adding a New Device
1. Navigate to `/devices`
2. Click "Add New Device"
3. Fill form fields
4. Click "Add Device"
5. View device at `/devices/:id`

### Editing a Device
1. Navigate to `/devices`
2. Click "Edit" on device card
3. Modify fields
4. Click "Update Device"
5. Redirects to device detail view

### Deleting a Device
1. Navigate to device detail or list
2. Click "Delete" button
3. Confirm deletion
4. Device removed from system

### Filtering Devices
1. Navigate to `/devices`
2. Select Type filter (optional)
3. Select Status filter (optional)
4. Click "Filter" button
5. Results update automatically

---

## 🛠️ Common Tasks

### Add a New Device Type
1. Add to `DeviceType` in `device.model.ts` (frontend)
2. Add to backend device type check in `001_init.sql`
3. Add to `DEVICE_TYPES` mapping in `device.model.ts`
4. Update form options if needed

### Change Database Connection
1. Edit `.env` file in backend
2. Update `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
3. Restart backend server
4. Run migrations if needed

### Add Form Validation
1. Edit `device-form.component.ts`
2. Add validators to `FormGroup`
3. Add validation messages in template
4. Test form submission

### Change API Base URL
1. Edit `frontend/src/environments/environment.ts`
2. Update `apiUrl` value
3. Restart frontend server

---

## 📊 Performance Optimization

### Database
- Indexes on: type, status, manufacturer, serial_number
- Use EXPLAIN to analyze queries
- Consider pagination for large datasets

### Frontend
- Components are standalone and lazy-loaded
- Use OnPush change detection strategy
- Implement virtual scrolling for large lists

### Backend
- Connection pooling configured
- Response filtering at database level
- Error handling prevents crashes

---

## ✅ Checklist for New Developers

- [ ] Read README.md
- [ ] Read DEVICE_MANAGEMENT.md
- [ ] Review SETUP_DEVICE_MANAGEMENT.md
- [ ] Setup backend and frontend
- [ ] Run database migrations
- [ ] Test API endpoints with curl
- [ ] Access frontend at localhost:4200
- [ ] Create sample device
- [ ] Test filtering
- [ ] Test edit/delete
- [ ] Review code structure
- [ ] Read API_DOCUMENTATION.md
- [ ] Understand component architecture

---

## 🆘 Troubleshooting Quick Guide

| Problem | Solution |
|---------|----------|
| Port 3000 in use | Kill process or change PORT in .env |
| Database connection error | Check .env, verify PostgreSQL running |
| CORS error | Verify CORS_ORIGIN in .env matches frontend URL |
| Module not found | Run npm install in backend/frontend |
| Migrations failed | Check PostgreSQL is running, verify database exists |
| Form not validating | Check Validators in form group |
| API returns 404 | Verify correct route, check device ID exists |
| Component not loading | Check route definition, verify import path |
| Styling not applied | Check SCSS compilation, verify class names |

---

## 📞 Getting Help

1. **Check Documentation**: Read relevant .md files
2. **Check Logs**: Review browser console or server output
3. **Check Code Comments**: Inline comments explain logic
4. **Review Examples**: API_DOCUMENTATION.md has examples
5. **Test Endpoints**: Use curl to isolate API issues

---

**Last Updated:** 2024-01-20
**Version:** 1.0.0
**Status:** Production Ready ✅
