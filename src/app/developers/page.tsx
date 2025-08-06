"use client";

import React, { useState } from 'react';
import Link from 'next/link';

const DevelopersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedEndpoint, setSelectedEndpoint] = useState('articles');

  const apiEndpoints = [
    {
      id: 'articles',
      name: 'Articles',
      method: 'GET',
      endpoint: '/api/v1/articles',
      description: 'Retrieve news articles with filtering and pagination',
      parameters: [
        { name: 'category', type: 'string', required: false, description: 'Filter by news category' },
        { name: 'limit', type: 'integer', required: false, description: 'Number of articles to return (max 100)' },
        { name: 'offset', type: 'integer', required: false, description: 'Pagination offset' },
        { name: 'search', type: 'string', required: false, description: 'Search query' },
        { name: 'sort', type: 'string', required: false, description: 'Sort order: newest, oldest, relevance' }
      ],
      example: `{
  "status": "success",
  "data": {
    "articles": [
      {
        "id": "12345",
        "title": "Breaking: Tech Innovation in AI",
        "content": "Article content...",
        "category": "technology",
        "publishedAt": "2024-01-15T10:30:00Z",
        "author": "John Doe",
        "url": "https://newsnerve.com/articles/12345",
        "summary": "AI breakthrough announcement...",
        "sentiment": "positive",
        "tags": ["AI", "technology", "innovation"]
      }
    ],
    "pagination": {
      "total": 1500,
      "limit": 20,
      "offset": 0,
      "hasNext": true
    }
  }
}`
    },
    {
      id: 'categories',
      name: 'Categories',
      method: 'GET',
      endpoint: '/api/v1/categories',
      description: 'Get all available news categories',
      parameters: [
        { name: 'include_count', type: 'boolean', required: false, description: 'Include article count for each category' }
      ],
      example: `{
  "status": "success",
  "data": {
    "categories": [
      {
        "id": "technology",
        "name": "Technology",
        "description": "Latest tech news and innovations",
        "articleCount": 1250
      },
      {
        "id": "politics",
        "name": "Politics",
        "description": "Political news and analysis",
        "articleCount": 890
      }
    ]
  }
}`
    },
    {
      id: 'search',
      name: 'Search',
      method: 'POST',
      endpoint: '/api/v1/search',
      description: 'Advanced article search with AI-powered relevance',
      parameters: [
        { name: 'query', type: 'string', required: true, description: 'Search query' },
        { name: 'filters', type: 'object', required: false, description: 'Advanced filtering options' },
        { name: 'ai_enhance', type: 'boolean', required: false, description: 'Use AI to enhance search results' }
      ],
      example: `{
  "status": "success",
  "data": {
    "results": [
      {
        "id": "67890",
        "title": "AI Revolution in Healthcare",
        "relevanceScore": 0.95,
        "highlights": ["AI", "healthcare", "innovation"],
        "summary": "Healthcare AI breakthrough...",
        "publishedAt": "2024-01-14T15:20:00Z"
      }
    ],
    "searchTime": 0.045,
    "totalResults": 127
  }
}`
    },
    {
      id: 'analytics',
      name: 'Analytics',
      method: 'GET',
      endpoint: '/api/v1/analytics/trends',
      description: 'Get trending topics and sentiment analysis',
      parameters: [
        { name: 'timeframe', type: 'string', required: false, description: 'Time period: 1h, 24h, 7d, 30d' },
        { name: 'category', type: 'string', required: false, description: 'Filter by category' }
      ],
      example: `{
  "status": "success",
  "data": {
    "trends": [
      {
        "topic": "Artificial Intelligence",
        "score": 95,
        "change": "+15%",
        "sentiment": "positive",
        "articles": 45
      }
    ],
    "sentiment": {
      "positive": 65,
      "neutral": 25,
      "negative": 10
    }
  }
}`
    }
  ];

  const sdks = [
    {
      name: 'JavaScript/Node.js',
      language: 'javascript',
      installation: 'npm install newsnerve-api',
      example: `const NewsNerve = require('newsnerve-api');

const client = new NewsNerve({
  apiKey: 'your-api-key'
});

// Get latest articles
const articles = await client.articles.getLatest({
  category: 'technology',
  limit: 10
});

console.log(articles);`
    },
    {
      name: 'Python',
      language: 'python',
      installation: 'pip install newsnerve-python',
      example: `from newsnerve import NewsNerveAPI

client = NewsNerveAPI(api_key='your-api-key')

# Get latest articles
articles = client.articles.get_latest(
    category='technology',
    limit=10
)

print(articles)`
    },
    {
      name: 'cURL',
      language: 'bash',
      installation: 'No installation required',
      example: `curl -X GET "https://api.newsnerve.com/v1/articles" \\
  -H "Authorization: Bearer your-api-key" \\
  -H "Content-Type: application/json" \\
  -G -d "category=technology" \\
     -d "limit=10"`
    }
  ];

  const pricingPlans = [
    {
      name: 'Developer',
      price: 'Free',
      requests: '1,000 requests/month',
      features: [
        'Basic article access',
        'Standard search',
        'Community support',
        'Rate limit: 10 req/min'
      ],
      popular: false
    },
    {
      name: 'Professional',
      price: '$99/month',
      requests: '50,000 requests/month',
      features: [
        'Full API access',
        'AI-enhanced search',
        'Real-time updates',
        'Priority support',
        'Rate limit: 100 req/min',
        'Custom webhooks'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      requests: 'Unlimited requests',
      features: [
        'All Professional features',
        'Dedicated support',
        'Custom integrations',
        'SLA guarantees',
        'Rate limit: 1000 req/min',
        'Advanced analytics'
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-b border-border">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-foreground mb-6">
              NewsNerve API
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Powerful REST API for news data, AI-powered search, and real-time analytics
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/api/register"
                className="bg-primary text-primary-foreground px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Get API Key
              </Link>
              <a
                href="#documentation"
                className="bg-background border border-border text-foreground px-8 py-3 rounded-lg hover:bg-muted/50 transition-colors font-medium"
              >
                View Documentation
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'endpoints', label: 'API Endpoints' },
              { id: 'sdks', label: 'SDKs & Examples' },
              { id: 'pricing', label: 'Pricing' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content Sections */}
      <div className="container mx-auto px-4 py-12">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-card rounded-lg p-6 border border-border">
                <div className="text-3xl mb-4">🚀</div>
                <h3 className="text-xl font-bold text-foreground mb-2">Fast & Reliable</h3>
                <p className="text-muted-foreground">
                  99.9% uptime with global CDN. Average response time under 100ms.
                </p>
              </div>
              
              <div className="bg-card rounded-lg p-6 border border-border">
                <div className="text-3xl mb-4">🤖</div>
                <h3 className="text-xl font-bold text-foreground mb-2">AI-Powered</h3>
                <p className="text-muted-foreground">
                  Advanced AI for content analysis, sentiment detection, and smart recommendations.
                </p>
              </div>
              
              <div className="bg-card rounded-lg p-6 border border-border">
                <div className="text-3xl mb-4">🔒</div>
                <h3 className="text-xl font-bold text-foreground mb-2">Secure</h3>
                <p className="text-muted-foreground">
                  Enterprise-grade security with API keys, rate limiting, and HTTPS encryption.
                </p>
              </div>
              
              <div className="bg-card rounded-lg p-6 border border-border">
                <div className="text-3xl mb-4">📊</div>
                <h3 className="text-xl font-bold text-foreground mb-2">Real-time</h3>
                <p className="text-muted-foreground">
                  Live news updates, trending topics, and instant notifications via webhooks.
                </p>
              </div>
            </div>

            <div className="bg-card rounded-lg p-8 border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">Quick Start</h2>
              <div className="bg-muted rounded-lg p-4 font-mono text-sm">
                <div className="text-muted-foreground mb-2"># Get your API key</div>
                <div className="text-foreground">curl -X POST "https://api.newsnerve.com/v1/auth/register" \</div>
                <div className="text-foreground ml-4">-H "Content-Type: application/json" \</div>
                <div className="text-foreground ml-4">-d {`'{"email": "your@email.com"}'`}</div>
                
                <div className="text-muted-foreground mt-4 mb-2"># Make your first request</div>
                <div className="text-foreground">curl -X GET "https://api.newsnerve.com/v1/articles" \</div>
                <div className="text-foreground ml-4">-H "Authorization: Bearer YOUR_API_KEY"</div>
              </div>
            </div>
          </div>
        )}

        {/* API Endpoints Tab */}
        {activeTab === 'endpoints' && (
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Endpoint List */}
              <div className="bg-card rounded-lg border border-border p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">Endpoints</h3>
                <div className="space-y-2">
                  {apiEndpoints.map((endpoint) => (
                    <button
                      key={endpoint.id}
                      onClick={() => setSelectedEndpoint(endpoint.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedEndpoint === endpoint.id
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'hover:bg-muted/50 text-foreground'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{endpoint.name}</span>
                        <span className={`px-2 py-1 rounded text-xs font-mono ${
                          endpoint.method === 'GET' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }`}>
                          {endpoint.method}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 font-mono">
                        {endpoint.endpoint}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Endpoint Details */}
              <div className="lg:col-span-2">
                {apiEndpoints.map((endpoint) => (
                  selectedEndpoint === endpoint.id && (
                    <div key={endpoint.id} className="bg-card rounded-lg border border-border p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <span className={`px-3 py-1 rounded font-mono text-sm ${
                          endpoint.method === 'GET' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }`}>
                          {endpoint.method}
                        </span>
                        <code className="text-foreground font-mono">{endpoint.endpoint}</code>
                      </div>
                      
                      <p className="text-muted-foreground mb-6">{endpoint.description}</p>
                      
                      <h4 className="text-lg font-semibold text-foreground mb-3">Parameters</h4>
                      <div className="overflow-x-auto mb-6">
                        <table className="w-full border border-border rounded-lg">
                          <thead>
                            <tr className="border-b border-border bg-muted/50">
                              <th className="text-left p-3 text-foreground font-medium">Name</th>
                              <th className="text-left p-3 text-foreground font-medium">Type</th>
                              <th className="text-left p-3 text-foreground font-medium">Required</th>
                              <th className="text-left p-3 text-foreground font-medium">Description</th>
                            </tr>
                          </thead>
                          <tbody>
                            {endpoint.parameters.map((param, index) => (
                              <tr key={index} className="border-b border-border last:border-b-0">
                                <td className="p-3 font-mono text-sm text-foreground">{param.name}</td>
                                <td className="p-3 text-sm text-muted-foreground">{param.type}</td>
                                <td className="p-3 text-sm">
                                  <span className={`px-2 py-1 rounded text-xs ${
                                    param.required 
                                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                                  }`}>
                                    {param.required ? 'Required' : 'Optional'}
                                  </span>
                                </td>
                                <td className="p-3 text-sm text-muted-foreground">{param.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      <h4 className="text-lg font-semibold text-foreground mb-3">Example Response</h4>
                      <div className="bg-muted rounded-lg p-4 overflow-x-auto">
                        <pre className="text-sm text-foreground font-mono whitespace-pre-wrap">
                          {endpoint.example}
                        </pre>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SDKs Tab */}
        {activeTab === 'sdks' && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-4">SDKs & Code Examples</h2>
              <p className="text-muted-foreground">
                Official SDKs and code examples to get you started quickly
              </p>
            </div>

            <div className="space-y-8">
              {sdks.map((sdk, index) => (
                <div key={index} className="bg-card rounded-lg border border-border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-foreground">{sdk.name}</h3>
                    <div className="text-sm text-muted-foreground">
                      Installation: <code className="bg-muted px-2 py-1 rounded text-foreground">{sdk.installation}</code>
                    </div>
                  </div>
                  
                  <div className="bg-muted rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm text-foreground font-mono whitespace-pre-wrap">
                      {sdk.example}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pricing Tab */}
        {activeTab === 'pricing' && (
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">API Pricing</h2>
              <p className="text-muted-foreground">
                Choose the plan that fits your needs. Start free and scale as you grow.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pricingPlans.map((plan, index) => (
                <div
                  key={index}
                  className={`bg-card rounded-lg border p-8 text-center relative ${
                    plan.popular 
                      ? 'border-primary ring-2 ring-primary/20' 
                      : 'border-border'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <h3 className="text-xl font-bold text-foreground mb-2">{plan.name}</h3>
                  <div className="text-3xl font-bold text-foreground mb-2">{plan.price}</div>
                  <p className="text-muted-foreground mb-6">{plan.requests}</p>
                  
                  <ul className="space-y-3 mb-8 text-left">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                        <span className="text-foreground text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link
                    href={plan.name === 'Enterprise' ? '/contact' : '/api/register'}
                    className={`block w-full py-3 rounded-lg font-medium transition-colors ${
                      plan.popular
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'border border-border text-foreground hover:bg-muted/50'
                    }`}
                  >
                    {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Build with NewsNerve API?
            </h2>
            <p className="text-xl mb-8 text-primary-foreground/80">
              Join thousands of developers building amazing news applications
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/api/register"
                className="bg-primary-foreground text-primary px-8 py-3 rounded-lg hover:bg-primary-foreground/90 transition-colors font-medium"
              >
                Get Free API Key
              </Link>
              <a
                href="mailto:developers@newsnerve.com"
                className="border-2 border-primary-foreground text-primary-foreground px-8 py-3 rounded-lg hover:bg-primary-foreground hover:text-primary transition-colors font-medium"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevelopersPage;
