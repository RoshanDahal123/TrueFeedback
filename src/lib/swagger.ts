import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TrueFeedback API',
      version: '1.0.0',
      description: 'Anonymous feedback and messaging platform API',
      contact: {
        name: 'TrueFeedback Team',
        email: 'support@truefeedback.com',
      },
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://your-domain.com' 
          : 'http://localhost:3000',
        description: process.env.NODE_ENV === 'production' 
          ? 'Production server' 
          : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'next-auth.session-token',
          description: 'NextAuth session cookie',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'User ID',
            },
            username: {
              type: 'string',
              description: 'Unique username',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            isVerified: {
              type: 'boolean',
              description: 'Whether user is verified',
            },
            isAcceptingMessage: {
              type: 'boolean',
              description: 'Whether user accepts messages',
            },
            messages: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Message',
              },
            },
          },
        },
        Message: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Message ID',
            },
            content: {
              type: 'string',
              description: 'Message content',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Message creation timestamp',
            },
          },
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Operation success status',
            },
            message: {
              type: 'string',
              description: 'Response message',
            },
          },
        },
        ValidationError: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                  },
                  message: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and verification endpoints',
      },
      {
        name: 'Messages',
        description: 'Message management endpoints',
      },
      {
        name: 'User',
        description: 'User management endpoints',
      },
      {
        name: 'Utility',
        description: 'Utility endpoints',
      },
    ],
  },
  apis: ['./src/app/api/**/route.ts'], // Path to the API docs
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;