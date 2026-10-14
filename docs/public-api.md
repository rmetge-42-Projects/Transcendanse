# Public API

The public API is mounted under `/api/public` from the browser and is protected by an API key.

## Authentication

Send the key with one of these headers:

```http
x-api-key: <PUBLIC_API_KEY>
```

or:

```http
Authorization: Bearer <PUBLIC_API_KEY>
```

The key is stored in Vault as `public_api_key` and exposed to the backend as `PUBLIC_API_KEY`.

## Rate Limiting

Default limit: 60 requests per minute per API key and client.

Responses include:

- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

## Endpoints

| Method | Route | Description |
| --- | --- | --- |
| GET | `/api/public/docs` | Returns API documentation as JSON |
| GET | `/api/public/users?limit=20&offset=0` | Lists public user profiles |
| GET | `/api/public/users/:id` | Returns one public user profile |
| POST | `/api/public/users` | Creates a user with a hashed password |
| PUT | `/api/public/users/:id` | Updates public profile fields |
| DELETE | `/api/public/users/:id` | Deletes a user and dependent social data |

## Example

```bash
curl -k https://localhost:8443/api/public/users \
  -H "x-api-key: dev-public-api-key-change-me"
```
