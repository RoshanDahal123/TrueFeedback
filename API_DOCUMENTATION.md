# TrueFeedback API Documentation

This project now includes comprehensive Swagger/OpenAPI documentation for all backend API endpoints.

## Accessing the API Documentation

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to the API documentation page:
   ```
   http://localhost:3000/api-docs
   ```

## Available API Endpoints

### Authentication
- `POST /api/sign-up` - Register a new user
- `POST /api/verify-code` - Verify user account with verification code

### Messages
- `GET /api/get-messages` - Get user's messages (requires authentication)
- `POST /api/send-message` - Send a message to a user
- `DELETE /api/delete-message/{messageId}` - Delete a specific message (requires authentication)
- `POST /api/accept-messages` - Update message acceptance status (requires authentication)
- `GET /api/accept-messages` - Get message acceptance status (requires authentication)

### Utility
- `GET /api/check-username-unique` - Check username availability
- `POST /api/suggest-messages` - Generate AI-powered message suggestions

## Authentication

The API uses NextAuth.js session-based authentication. For endpoints that require authentication, you need to be logged in through the web application. The session is managed via HTTP-only cookies.

## Testing the API

1. **Using Swagger UI**: Visit `/api-docs` to test endpoints interactively
2. **Authentication Required**: For protected endpoints, first log in through the web application
3. **Request/Response Examples**: All endpoints include detailed request/response examples in the Swagger documentation

## API Response Format

All API responses follow a consistent format:

```json
{
  "success": boolean,
  "message": string,
  "data": object (optional)
}
```

## Error Handling

The API returns appropriate HTTP status codes:
- `200` - Success
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Development Notes

- The Swagger configuration is located in `src/lib/swagger.ts`
- API documentation is served from `src/app/api/docs/route.ts`
- The Swagger UI page is at `src/app/api-docs/page.tsx`
- All route files include JSDoc comments with Swagger annotations

## Dependencies Added

```json
{
  "swagger-ui-react": "^5.29.0",
  "swagger-jsdoc": "^6.2.8",
  "js-yaml": "^4.1.0",
  "@types/swagger-jsdoc": "^6.0.4",
  "@types/swagger-ui-react": "^4.18.3"
}
```