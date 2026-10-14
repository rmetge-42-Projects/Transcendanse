export const publicApiDocs = {
  name: 'Transendanse Public API',
  authentication:
    'Send the API key with the x-api-key header, or as Authorization: Bearer <key>.',
  rateLimit:
    'Default limit is 60 requests per minute per API key and client. Responses include X-RateLimit-* headers.',
  endpoints: [
    {
      method: 'GET',
      path: '/api/public/docs',
      description: 'Returns this API documentation.',
    },
    {
      method: 'GET',
      path: '/api/public/users?limit=20&offset=0',
      description: 'Lists public user profiles.',
    },
    {
      method: 'GET',
      path: '/api/public/users/:id',
      description: 'Returns one public user profile.',
    },
    {
      method: 'POST',
      path: '/api/public/users',
      description: 'Creates a user with a hashed password.',
      body: {
        email: 'nova@example.com',
        password: 'minimum8chars',
        username: 'Nova',
        name: 'Nova',
      },
    },
    {
      method: 'PUT',
      path: '/api/public/users/:id',
      description: 'Updates public profile fields.',
    },
    {
      method: 'DELETE',
      path: '/api/public/users/:id',
      description: 'Deletes a user and dependent social data.',
    },
  ],
};
