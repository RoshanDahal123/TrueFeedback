'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { 
  ssr: false,
  loading: () => <div className="flex justify-center items-center h-screen">Loading API Documentation...</div>
});

export default function ApiDocsPage() {
  const [spec, setSpec] = useState(null);

  useEffect(() => {
    fetch('/api/docs')
      .then(res => res.json())
      .then(data => setSpec(data))
      .catch(err => console.error('Error loading API spec:', err));
  }, []);

  if (!spec) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Loading API Documentation...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">TrueFeedback API Documentation</h1>
          <p className="text-gray-600">Interactive API documentation for the TrueFeedback platform</p>
        </div>
        <SwaggerUI 
          spec={spec} 
          docExpansion="list"
          defaultModelsExpandDepth={1}
          defaultModelExpandDepth={1}
        />
      </div>
    </div>
  );
}