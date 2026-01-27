# Weight Tracker - API Specification

## Base URL

```
http://localhost:8080/api/v1
```

## Endpoints

### Weight Entries

#### Get All Weight Entries

```
GET /weights
```

**Query Parameters:**

- `start_date` (optional): ISO 8601 date string (YYYY-MM-DD) - filter entries from this date
- `end_date` (optional): ISO 8601 date string (YYYY-MM-DD) - filter entries until this date

**Response:** `200 OK`

```json
{
  "weights": [
    {
      "id": 1,
      "date": "2026-01-27",
      "pounds": 168.5,
      "created_at": "2026-01-27T10:30:00Z",
      "updated_at": "2026-01-27T10:30:00Z"
    },
    {
      "id": 2,
      "date": "2026-01-26",
      "pounds": 169.2,
      "created_at": "2026-01-26T09:15:00Z",
      "updated_at": "2026-01-26T09:15:00Z"
    }
  ]
}
```

#### Get Single Weight Entry

```
GET /weights/:id
```

**Response:** `200 OK`

```json
{
  "id": 1,
  "date": "2026-01-27",
  "pounds": 168.5,
  "created_at": "2026-01-27T10:30:00Z",
  "updated_at": "2026-01-27T10:30:00Z"
}
```

**Error:** `404 Not Found`

```json
{
  "error": "Weight entry not found"
}
```

#### Create Weight Entry

```
POST /weights
```

**Request Body:**

```json
{
  "date": "2026-01-27",
  "pounds": 168.5
}
```

**Validation Rules:**

- `date`: Required, valid date format (YYYY-MM-DD), not in future
- `pounds`: Required, positive number (> 0)

**Response:** `201 Created`

```json
{
  "id": 1,
  "date": "2026-01-27",
  "pounds": 168.5,
  "created_at": "2026-01-27T10:30:00Z",
  "updated_at": "2026-01-27T10:30:00Z"
}
```

**Error:** `400 Bad Request`

```json
{
  "error": "Invalid request",
  "details": {
    "pounds": "must be a positive number"
  }
}
```

**Error:** `409 Conflict`

```json
{
  "error": "Weight entry already exists for this date"
}
```

#### Update Weight Entry

```
PUT /weights/:id
```

**Request Body:**

```json
{
  "date": "2026-01-27",
  "pounds": 167.8
}
```

**Validation Rules:**

- `date`: Required, valid date format (YYYY-MM-DD), not in future
- `pounds`: Required, positive number (> 0)

**Response:** `200 OK`

```json
{
  "id": 1,
  "date": "2026-01-27",
  "pounds": 167.8,
  "created_at": "2026-01-27T10:30:00Z",
  "updated_at": "2026-01-27T11:45:00Z"
}
```

**Error:** `404 Not Found`

```json
{
  "error": "Weight entry not found"
}
```

#### Delete Weight Entry

```
DELETE /weights/:id
```

**Response:** `204 No Content`

**Error:** `404 Not Found`

```json
{
  "error": "Weight entry not found"
}
```

### Goal Weight

#### Get Goal Weight

```
GET /goal
```

**Response:** `200 OK`

```json
{
  "pounds": 154.0,
  "updated_at": "2026-01-20T08:00:00Z"
}
```

**Response:** `200 OK` (when no goal set)

```json
{
  "pounds": null,
  "updated_at": null
}
```

#### Set Goal Weight

```
PUT /goal
```

**Request Body:**

```json
{
  "pounds": 154.0
}
```

**Validation Rules:**

- `pounds`: Required, positive number (> 0), or null to clear goal

**Response:** `200 OK`

```json
{
  "pounds": 154.0,
  "updated_at": "2026-01-27T10:30:00Z"
}
```

**Error:** `400 Bad Request`

```json
{
  "error": "Invalid request",
  "details": {
    "pounds": "must be a positive number"
  }
}
```

### Health Check

#### Health Check

```
GET /health
```

**Response:** `200 OK`

```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2026-01-27T10:30:00Z"
}
```

## Error Response Format

All error responses follow this structure:

```json
{
  "error": "Human readable error message",
  "details": {
    "field_name": "specific validation error"
  }
}
```

## HTTP Status Codes

- `200 OK`: Successful GET or PUT request
- `201 Created`: Successful POST request
- `204 No Content`: Successful DELETE request
- `400 Bad Request`: Invalid request data
- `404 Not Found`: Resource not found
- `409 Conflict`: Duplicate entry (e.g., weight for same date already exists)
- `500 Internal Server Error`: Server-side error

## CORS Configuration

The API will be configured to accept requests from:

- `http://localhost:3000` (frontend development)
- Kubernetes service DNS names within cluster

Allowed methods: GET, POST, PUT, DELETE, OPTIONS

## Data Conversion Notes

### Frontend to Backend

- Frontend converts stones and pounds to total pounds before sending
- Formula: `total_pounds = (stones × 14) + pounds`
- Example: 12 stones 2 pounds = (12 × 14) + 2 = 170 pounds

### Backend to Frontend

- Backend stores and returns total pounds
- Frontend converts for display based on user's unit preference
- Stones/Pounds: `stones = floor(pounds / 14)`, `remaining_pounds = pounds % 14`
- Kilograms: `kg = pounds × 0.453592`

## Rate Limiting

Not implemented for initial version (personal use, single user).

## Authentication

Not implemented for initial version (local deployment, trusted network).
