# API Documentation — Smart Leads Dashboard

Base URL (local): `http://localhost:5000/api`

All protected routes require the header:

```
Authorization: Bearer <jwt_token>
```

All responses follow this format:

// Success
{ "success": true, "data": {} }

// Error
{ "success": false, "message": "Error description" }

---

## Authentication

### POST /auth/register
Register a new user.

Request Body:

```json
{
  "name": "Pranav Gupta",
  "email": "pranav@example.com",
  "password": "password123",
  "role": "admin"
}
```

Validation:

- name: required
- email: required, valid email format
- password: required, minimum 6 characters
- role: optional, enum ["admin", "sales"], defaults to "sales"

Success Response — 201:

```json
{
  "success": true,
  "data": {
    "token": "<jwt>",
    "user": { "_id": "..", "name": "Pranav Gupta", "email": "pranav@example.com", "role": "admin", "createdAt": "..." }
  }
}
```

Error Responses:

- 400: Validation failed
- 409: Email already registered


### POST /auth/login
Login with email and password.

Request Body:

```json
{
  "email": "pranav@example.com",
  "password": "password123"
}
```

Success Response — 200:

```json
{
  "success": true,
  "data": {
    "token": "<jwt>",
    "user": { "_id": "..", "name": "Pranav Gupta", "email": "pranav@example.com", "role": "admin", "createdAt": "..." }
  }
}
```

Error Responses:

- 400: Validation failed
- 401: Invalid email or password


### GET /auth/me
Get currently authenticated user. Requires auth token.

Success Response — 200:

```json
{
  "success": true,
  "data": { "_id": "..", "name": "Pranav Gupta", "email": "pranav@example.com", "role": "admin", "createdAt": "..." }
}
```

Error Responses:

- 401: Not authorized, no token
- 404: User not found

---

## Leads
All lead endpoints require authentication.

### GET /leads
Get paginated list of leads with optional filters.

Query Parameters:

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| page  | number | No | Page number (default: 1) |
| status | string | No | Filter: New, Contacted, Qualified, Lost |
| source | string | No | Filter: Website, Instagram, Referral |
| search | string | No | Search in name or email (case-insensitive) |
| sort | string | No | latest (default) or oldest |

Example Request:

```
GET /leads?status=Qualified&source=Website&search=rahul&sort=latest&page=1
```

Success Response — 200:

```json
{
  "success": true,
  "data": [ /* leads array */ ],
  "pagination": { "total": 42, "page": 1, "limit": 10, "totalPages": 5, "hasNextPage": true, "hasPrevPage": false }
}
```

RBAC:

- Admin: sees all leads
- Sales: sees only their own leads (filtered by createdBy)


### GET /leads/:id
Get a single lead by ID.

Success Response — 200:

```json
{
  "success": true,
  "data": { /* lead object */ }
}
```

Error Responses:

- 400: Invalid lead ID format
- 403: Not authorized to view this lead (sales user accessing another's lead)
- 404: Lead not found


### POST /leads
Create a new lead.

Request Body:

```json
{
  "name": "Priya Mehta",
  "email": "priya@example.com",
  "status": "New",
  "source": "Instagram"
}
```

Validation:

- name: required, non-empty string
- email: required, valid email format
- status: required, enum ["New", "Contacted", "Qualified", "Lost"]
- source: required, enum ["Website", "Instagram", "Referral"]

Success Response — 201:

```json
{
  "success": true,
  "data": { /* created lead */ }
}
```

Error Responses:

- 400: Validation failed


### PUT /leads/:id
Update an existing lead. All fields are optional.

Request Body (all optional):

```json
{
  "name": "Priya Mehta Updated",
  "status": "Contacted",
  "source": "Referral"
}
```

Success Response — 200:

```json
{
  "success": true,
  "data": { /* updated lead */ }
}
```

Error Responses:

- 400: Invalid ID or validation failed
- 403: Not authorized to update this lead
- 404: Lead not found


### DELETE /leads/:id
Delete a lead by ID.

Success Response — 200:

```json
{
  "success": true,
  "data": { "message": "Lead deleted successfully" }
}
```

Error Responses:

- 400: Invalid lead ID format
- 403: Not authorized to delete this lead
- 404: Lead not found


### GET /leads/export
Export leads as CSV. Admin only.

Query Parameters: Same as GET /leads except no page param.
All matching leads are exported without pagination.

Success Response — 200:

Response Headers:

```
Content-Type: text/csv
Content-Disposition: attachment; filename="leads-export-<timestamp>.csv"
```

CSV columns: Name, Email, Status, Source, Created At

Error Responses:

- 401: Not authorized
- 403: Admin access required

---

## HTTP Status Code Reference

| Code | Meaning |
|------|---------|
| 200  | Success |
| 201  | Created |
| 400  | Bad Request / Validation Error |
| 401  | Unauthorized — missing or invalid token |
| 403  | Forbidden — insufficient role permissions |
| 404  | Resource Not Found |
| 409  | Conflict — resource already exists |
| 500  | Internal Server Error |
