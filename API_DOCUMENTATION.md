# Device Management API Documentation

## Base URL
```
http://localhost:3000/api/devices
```

## Device Object

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "Solar Inverter 1",
  "type": "inverter",
  "manufacturer": "Victron Energy",
  "model": "MultiPlus 24/3000",
  "serialNumber": "VIC-MP-001",
  "status": "active",
  "powerRating": 3.0,
  "installationDate": "2023-01-15T00:00:00Z",
  "location": "Main Plant Building A",
  "notes": "Primary inverter for solar system",
  "createdAt": "2024-01-20T10:30:00Z",
  "updatedAt": "2024-01-20T10:30:00Z"
}
```

## Device Types
- `inverter` - Solar inverter
- `battery` - Battery storage system
- `solar_panel` - Solar panel array
- `charge_controller` - Charge controller (MPPT, PWM, etc.)
- `generator` - Backup generator
- `other` - Other equipment

## Device Status
- `active` - Device is operational
- `inactive` - Device is not in use
- `maintenance` - Device is under maintenance
- `retired` - Device is no longer in use

## Endpoints

### Create Device
Create a new device in the system.

**Request**
```
POST /api/devices
Content-Type: application/json
```

**Request Body**
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
  "location": "Main Plant Building A",
  "notes": "Primary inverter for solar system"
}
```

**Required Fields**
- `name` (string, 1-255 characters)
- `type` (string, one of device types)
- `manufacturer` (string, 1-255 characters)
- `model` (string, 1-255 characters)
- `serialNumber` (string, unique, 1-255 characters)
- `installationDate` (ISO 8601 date string or Date object)

**Optional Fields**
- `status` (string, default: "active")
- `powerRating` (number, in kW)
- `location` (string)
- `notes` (string)

**Response (201 Created)**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Solar Inverter 1",
    "type": "inverter",
    "manufacturer": "Victron Energy",
    "model": "MultiPlus 24/3000",
    "serialNumber": "VIC-MP-001",
    "status": "active",
    "powerRating": 3.0,
    "installationDate": "2023-01-15T00:00:00Z",
    "location": "Main Plant Building A",
    "notes": "Primary inverter for solar system",
    "createdAt": "2024-01-20T10:30:00Z",
    "updatedAt": "2024-01-20T10:30:00Z"
  },
  "message": "Device created successfully"
}
```

**Error Response (400 Bad Request)**
```json
{
  "success": false,
  "error": "Missing required fields: name, type, manufacturer, model, serialNumber"
}
```

---

### Get All Devices
Retrieve all devices with optional filtering.

**Request**
```
GET /api/devices
GET /api/devices?type=inverter
GET /api/devices?status=active
GET /api/devices?type=battery&status=active
```

**Query Parameters**
- `type` (optional): Filter by device type
- `status` (optional): Filter by device status

**Response (200 OK)**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Solar Inverter 1",
      "type": "inverter",
      "manufacturer": "Victron Energy",
      "model": "MultiPlus 24/3000",
      "serialNumber": "VIC-MP-001",
      "status": "active",
      "powerRating": 3.0,
      "installationDate": "2023-01-15T00:00:00Z",
      "location": "Main Plant Building A",
      "notes": "Primary inverter for solar system",
      "createdAt": "2024-01-20T10:30:00Z",
      "updatedAt": "2024-01-20T10:30:00Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "name": "Lithium Battery Bank 1",
      "type": "battery",
      "manufacturer": "LG Chem",
      "model": "RESU10H",
      "serialNumber": "LG-BAT-001",
      "status": "active",
      "powerRating": null,
      "installationDate": "2023-02-20T00:00:00Z",
      "location": "Main Plant Building A",
      "notes": "48V battery system with 10kWh capacity",
      "createdAt": "2024-01-20T10:35:00Z",
      "updatedAt": "2024-01-20T10:35:00Z"
    }
  ]
}
```

---

### Get Device by ID
Retrieve a specific device by its ID.

**Request**
```
GET /api/devices/:id
```

**Path Parameters**
- `id` (string, UUID): The device ID

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Solar Inverter 1",
    "type": "inverter",
    "manufacturer": "Victron Energy",
    "model": "MultiPlus 24/3000",
    "serialNumber": "VIC-MP-001",
    "status": "active",
    "powerRating": 3.0,
    "installationDate": "2023-01-15T00:00:00Z",
    "location": "Main Plant Building A",
    "notes": "Primary inverter for solar system",
    "createdAt": "2024-01-20T10:30:00Z",
    "updatedAt": "2024-01-20T10:30:00Z"
  }
}
```

**Error Response (404 Not Found)**
```json
{
  "success": false,
  "error": "Device not found"
}
```

---

### Update Device
Update an existing device.

**Request**
```
PUT /api/devices/:id
Content-Type: application/json
```

**Path Parameters**
- `id` (string, UUID): The device ID

**Request Body** (any or all fields can be updated)
```json
{
  "name": "Solar Inverter 1 - Updated",
  "status": "maintenance",
  "location": "Main Plant Building A - New Location",
  "notes": "Updated notes about the device"
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Solar Inverter 1 - Updated",
    "type": "inverter",
    "manufacturer": "Victron Energy",
    "model": "MultiPlus 24/3000",
    "serialNumber": "VIC-MP-001",
    "status": "maintenance",
    "powerRating": 3.0,
    "installationDate": "2023-01-15T00:00:00Z",
    "location": "Main Plant Building A - New Location",
    "notes": "Updated notes about the device",
    "createdAt": "2024-01-20T10:30:00Z",
    "updatedAt": "2024-01-20T11:45:00Z"
  },
  "message": "Device updated successfully"
}
```

**Error Response (404 Not Found)**
```json
{
  "success": false,
  "error": "Device not found"
}
```

---

### Delete Device
Delete a device from the system.

**Request**
```
DELETE /api/devices/:id
```

**Path Parameters**
- `id` (string, UUID): The device ID

**Response (200 OK)**
```json
{
  "success": true,
  "message": "Device deleted successfully"
}
```

**Error Response (404 Not Found)**
```json
{
  "success": false,
  "error": "Device not found"
}
```

---

### Get Device Statistics
Get statistics about devices grouped by type.

**Request**
```
GET /api/devices/statistics/all
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": [
    {
      "type": "inverter",
      "count": 5,
      "activeCount": 4
    },
    {
      "type": "battery",
      "count": 8,
      "activeCount": 7
    },
    {
      "type": "solar_panel",
      "count": 3,
      "activeCount": 3
    },
    {
      "type": "charge_controller",
      "count": 2,
      "activeCount": 2
    },
    {
      "type": "generator",
      "count": 1,
      "activeCount": 0
    }
  ]
}
```

---

## Error Handling

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes

| Status | Meaning | Example |
|--------|---------|---------|
| 200 | OK | Successful GET, PUT request |
| 201 | Created | Device successfully created |
| 400 | Bad Request | Missing required fields or invalid data |
| 404 | Not Found | Device doesn't exist |
| 500 | Internal Server Error | Server error |

---

## Rate Limiting

Currently, there is no rate limiting. In production, implement rate limiting to prevent abuse.

## Authentication

Currently, authentication is not implemented. Add JWT authentication in production for secure access.

## CORS

CORS is enabled for all origins in development. Configure appropriately for production.

## Examples Using cURL

### Create a Device
```bash
curl -X POST http://localhost:3000/api/devices \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Battery System 1",
    "type": "battery",
    "manufacturer": "Tesla",
    "model": "Powerwall",
    "serialNumber": "TSLA-123456",
    "installationDate": "2023-06-01"
  }'
```

### Get All Devices
```bash
curl http://localhost:3000/api/devices
```

### Get Active Inverters
```bash
curl "http://localhost:3000/api/devices?type=inverter&status=active"
```

### Update Device Status
```bash
curl -X PUT http://localhost:3000/api/devices/550e8400-e29b-41d4-a716-446655440001 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "maintenance"
  }'
```

### Delete Device
```bash
curl -X DELETE http://localhost:3000/api/devices/550e8400-e29b-41d4-a716-446655440001
```

---

## Examples Using Python Requests

```python
import requests
import json

BASE_URL = "http://localhost:3000/api/devices"

# Create device
device = {
    "name": "Solar Panel Array 1",
    "type": "solar_panel",
    "manufacturer": "Sunwatts",
    "model": "SW400XL",
    "serialNumber": "SW-12345",
    "powerRating": 10.0,
    "installationDate": "2023-01-10"
}
response = requests.post(BASE_URL, json=device)
print(response.json())

# Get all devices
response = requests.get(BASE_URL)
devices = response.json()['data']
for device in devices:
    print(device['name'])

# Get specific device
device_id = devices[0]['id']
response = requests.get(f"{BASE_URL}/{device_id}")
device = response.json()['data']
print(device)

# Update device
update_data = {"status": "maintenance"}
response = requests.put(f"{BASE_URL}/{device_id}", json=update_data)
print(response.json())

# Delete device
response = requests.delete(f"{BASE_URL}/{device_id}")
print(response.json())
```

---

## Webhooks & Real-time Updates

Currently not implemented. Consider adding:
- Device status change notifications
- Maintenance reminders
- Device health alerts
- Real-time device updates via WebSockets

---

## Data Validation

### Serial Number
- Must be unique across all devices
- Cannot be changed after creation
- Recommended format: Manufacturer prefix + unique identifier

### Installation Date
- Must be in ISO 8601 format
- Cannot be in the future
- Recommended to be before or equal to current date

### Power Rating
- Optional field
- Must be positive number
- Units: Kilowatts (kW)

### Device Name
- Required, 1-255 characters
- Should be descriptive and unique within location

---

## Best Practices

1. **Serial Numbers**: Use manufacturer-provided serial numbers for accurate identification
2. **Location Tracking**: Keep location information updated for easy device identification
3. **Notes**: Document important information like:
   - Warranty details
   - Supplier information
   - Installation technician
   - Maintenance schedule
4. **Status Management**: Update status regularly to maintain accurate inventory
5. **Regular Audits**: Periodically verify all devices are accounted for

---

## Version History

- v1.0 (2024-01-20): Initial API release with CRUD operations
- Future: Batch operations, advanced filtering, export/import functionality
