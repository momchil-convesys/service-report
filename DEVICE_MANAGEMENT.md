# Device Management System Documentation

## Overview
The Service Report System now includes comprehensive device management capabilities for tracking inverters, batteries, solar panels, charge controllers, generators, and other equipment in your plants.

## Device Types Supported
- **Inverter**: Converts DC to AC power
- **Battery**: Energy storage system
- **Solar Panel**: Photovoltaic power generation
- **Charge Controller**: Regulates charging process
- **Generator**: Backup power generation
- **Other**: Miscellaneous equipment

## Device Status
- **Active**: Device is operational
- **Inactive**: Device is not currently in use
- **Maintenance**: Device requires or is undergoing maintenance
- **Retired**: Device is no longer in use

## Features

### 1. Device List View
- View all devices with filtering options
- Filter by device type or status
- Search and sort capabilities
- Quick actions (View, Edit, Delete)
- Device statistics dashboard

### 2. Add New Device
- Create new devices with comprehensive information
- Required fields:
  - Device Name
  - Device Type
  - Manufacturer
  - Model
  - Serial Number
  - Installation Date
  - Status
- Optional fields:
  - Power Rating (in kW)
  - Location
  - Notes

### 3. Device Details View
- Complete device information display
- Device specifications and history
- Creation and update timestamps
- Edit and delete options
- Related service reports (future feature)

### 4. Edit Device
- Update device information
- Change device status
- Modify specifications
- Update location or notes

### 5. Delete Device
- Remove devices from the system
- Confirmation dialog to prevent accidental deletion
- Cascade handling of related records

## API Endpoints

### Create Device
```
POST /api/devices
Content-Type: application/json

{
  "name": "Solar Inverter 1",
  "type": "inverter",
  "manufacturer": "Victron Energy",
  "model": "MultiPlus 24/3000",
  "serial_number": "ABC123XYZ789",
  "status": "active",
  "power_rating": 3.0,
  "installation_date": "2023-01-15T00:00:00Z",
  "location": "Main Plant Building A",
  "notes": "Primary inverter for solar system"
}
```

### Get All Devices
```
GET /api/devices
Query Parameters:
  - type: 'inverter' | 'battery' | 'solar_panel' | 'charge_controller' | 'generator' | 'other'
  - status: 'active' | 'inactive' | 'maintenance' | 'retired'
```

### Get Device by ID
```
GET /api/devices/:id
```

### Update Device
```
PUT /api/devices/:id
Content-Type: application/json

{
  "name": "Solar Inverter 1 - Updated",
  "status": "maintenance",
  "notes": "Updated notes"
}
```

### Delete Device
```
DELETE /api/devices/:id
```

### Get Device Statistics
```
GET /api/devices/statistics/all
```

Returns:
```json
{
  "success": true,
  "data": [
    {
      "type": "inverter",
      "count": 5,
      "active_count": 4
    },
    {
      "type": "battery",
      "count": 8,
      "active_count": 7
    }
  ]
}
```

## Database Schema

### Devices Table
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

## Frontend Components

### DevicesListComponent
- Location: `frontend/src/app/features/devices/devices-list/`
- Displays list of all devices
- Provides filtering and search
- Standalone component

### DeviceFormComponent
- Location: `frontend/src/app/features/devices/device-form/`
- Used for both creating and editing devices
- Form validation
- Reactive Forms implementation
- Standalone component

### DeviceDetailComponent
- Location: `frontend/src/app/features/devices/device-detail/`
- Shows complete device information
- Action buttons for edit/delete
- Standalone component

### DeviceService
- Location: `frontend/src/app/core/services/device.service.ts`
- Handles all API communication
- Methods:
  - `createDevice(device)`
  - `getAllDevices(filter)`
  - `getDeviceById(id)`
  - `updateDevice(id, device)`
  - `deleteDevice(id)`
  - `getDeviceStatistics()`

## Backend Controllers & Models

### DeviceController
- Location: `backend/src/controllers/device.controller.ts`
- Methods:
  - `createDevice()` - POST
  - `getAllDevices()` - GET with filters
  - `getDeviceById()` - GET :id
  - `updateDevice()` - PUT :id
  - `deleteDevice()` - DELETE :id
  - `getDeviceStatistics()` - GET statistics

### DeviceModel
- Location: `backend/src/models/device.model.ts`
- Database operations
- Methods:
  - `create()` - Create new device
  - `findAll()` - Find devices with filters
  - `findById()` - Get specific device
  - `update()` - Update device
  - `delete()` - Remove device
  - `getStatistics()` - Device statistics

### DeviceRoutes
- Location: `backend/src/routes/devices.routes.ts`
- Express router setup
- Route definitions

## Styling

All components use SCSS with:
- Responsive design
- Mobile-friendly layouts
- Modern styling patterns
- Consistent color scheme

Color scheme:
- Primary: `#007bff` (Blue)
- Success: `#28a745` (Green)
- Warning: `#ffc107` (Yellow)
- Danger: `#dc3545` (Red)
- Light: `#f9f9f9` (Off-white)

## Integration with Service Reports

Devices can be linked to service reports for maintenance tracking:
- Reports can reference specific devices
- Track maintenance history per device
- Generate device-specific reports

## Future Enhancements

1. **Device History**: Track changes to device information
2. **Maintenance Scheduling**: Schedule maintenance tasks
3. **Performance Metrics**: Track device performance over time
4. **Warranty Management**: Track device warranties
5. **Export/Import**: Bulk device import/export functionality
6. **QR Codes**: Generate QR codes for devices
7. **Alerts & Notifications**: Alert on device status changes
8. **Attachment Support**: Attach documents/images to devices

## Error Handling

All endpoints return consistent response format:

Success:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

Error:
```json
{
  "success": false,
  "error": "Error message"
}
```

## Security Considerations

- Validate all input on both frontend and backend
- Use HTTPS in production
- Implement authentication/authorization
- Audit device modifications
- Secure database connections
- Input sanitization to prevent SQL injection

## Performance Optimization

- Database indexes on frequently queried columns
- Pagination for large device lists
- Caching strategies for device data
- Lazy loading of components

## Testing

### Unit Tests
- Test device service methods
- Test controller endpoints
- Test form validation

### Integration Tests
- End-to-end device CRUD operations
- Filter and search functionality
- Error handling

## Troubleshooting

### Device Not Showing in List
- Check device status filter
- Verify device is created in database
- Check browser console for errors

### Cannot Add Device
- Verify all required fields are filled
- Check serial number uniqueness
- Verify date format

### API Errors
- Check backend server is running on port 3000
- Verify PostgreSQL connection
- Check CORS settings

## Support & Maintenance

For issues or feature requests, contact the development team.
