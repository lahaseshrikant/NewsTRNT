"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { DivergenceMark } from '@/components/ui/DivergenceMark';

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
        "url": "https://NewsTRNT.com/articles/12345",
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
      description: 'Advanced article search with intelligent relevance ranking',
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
      name: 'JavaScript / Node.js',
      language: 'javascript',
      installation: 'npm install NewsTRNT-api',
      example: `const NewsTRNT = require('NewsTRNT-api');

const client = new NewsTRNT({
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
      installation: 'pip install NewsTRNT-python',
      example: `from NewsTRNT import NewsTRNTAPI

client = NewsTRNTAPI(api_key='your-api-key')

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
      example: `curl -X GET "https://api.NewsTRNT.com/v1/articles" \\
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
      features: ['Basic article access', 'Standard search', 'Community support', 'Rate limit: 10 req/min'],
      popular: false
    },
    {
      name: 'Professional',
      price: '$99/mo',
      requests: '50,000 requests/month',
      features: ['Full API access', 'AI-enhanced search', 'Real-time updates', 'Priority support', 'Rate limit: 100 req/min', 'Custom webhooks'],
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      requests: 'Unlimited requests',
      features: ['All Professional features', 'Dedicated support', 'Custom integrations', 'SLA guarantees', 'Rate limit: 1000 req/min', 'Advanced analytics'],
      popular: false
    }
  ];

  const overviewFeatures = [
    { title: 'Fast & Reliable', description: '99.9% uptime with global CDN. Average response time under 100ms.' },
    { title: 'Smart Technology', description: 'Advanced technology for content analysis, sentiment detection, and smart recommendations.' },
    { title: 'Secure', description: 'Enterprise-grade security with API keys, rate limiting, and HTTPS encryption.' },
    { title: 'Real-time', description: 'Live news updates, trending topics, and instant notifications via webhooks.' },
  ];

  const currentEndpoint = apiEndpoints.find(e => e.id === selectedEndpoint);

  return (
    <div className="min-h-screen bg-paper dark:bg-ink">
      {/* Hero */}
      <div className="bg-ink dark:bg-ivory/5 border-b-2 border-vermillion">
        <div className="container mx-auto py-16">
          <div className="max-w-4xl mx-auto text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-vermillion mb-3">For Developers</p>
            <h1 className="font-serif text-5xl font-bold text-ivory mb-6">NewsTRNT API</h1>
            <p className="text-xl text-ivory/60 mb-8">
              Powerful REST API for news data, intelligent search, and real-time analytics
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/api/register" className="hover-magnetic bg-vermillion text-white px-8 py-3 font-mono text-xs tracking-wider uppercase">
                Get API Key
              </Link>
              <a href="#documentation" className="border border-ivory/20 text-ivory px-8 py-3 font-mono text-xs tracking-wider uppercase hover:bg-ivory/10 transition-colors">
                View Documentation
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-ash dark:border-ash/20 bg-ivory dark:bg-ash/5">
        <div className="container mx-auto">
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
                className={`py-4 px-2 border-b-2 font-mono text-xs tracking-wider uppercase transition-colors ${
                  activeTab === tab.id
                    ? 'border-vermillion text-vermillion'
                    : 'border-transparent text-stone hover:text-ink dark:hover:text-ivory hover:border-ash'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div id="documentation" className="container mx-auto py-12">

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {overviewFeatures.map((feature, index) => (
                <div key={index} className="border border-ash dark:border-ash/20 p-6">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">0{index + 1}</span>
                  <h3 className="font-serif text-xl font-bold text-ink dark:text-ivory mt-2 mb-2">{feature.title}</h3>
                  <p className="text-stone">{feature.description}</p>
                </div>
              ))}
            </div>

            <div className="bg-ink dark:bg-ivory/5 border border-ash dark:border-ash/20 p-8">
              <h2 className="font-serif text-2xl font-bold text-ivory mb-4">Quick Start</h2>
              <div className="font-mono text-sm space-y-1">
                <div className="text-ivory/40"># Get your API key</div>
                <div className="text-ivory/80">curl -X POST &quot;https://api.NewsTRNT.com/v1/auth/register&quot; \</div>
                <div className="text-ivory/80 ml-4">-H &quot;Content-Type: application/json&quot; \</div>
                <div className="text-ivory/80 ml-4">-d {`'{"email": "your@email.com"}'`}</div>
                
                <div className="text-ivory/40 mt-4"># Make your first request</div>
                <div className="text-ivory/80">curl -X GET &quot;https://api.NewsTRNT.com/v1/articles&quot; \</div>
                <div className="text-ivory/80 ml-4">-H &quot;Authorization: Bearer YOUR_API_KEY&quot;</div>
              </div>
            </div>
          </div>
        )}

        {/* API Endpoints Tab */}
        {activeTab === 'endpoints' && (
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Endpoint List */}
              <div className="border border-ash dark:border-ash/20 p-6">
                <h3 className="font-mono text-xs uppercase tracking-wider text-stone mb-4">Endpoints</h3>
                <div className="space-y-1">
                  {apiEndpoints.map((endpoint) => (
                    <button
                      key={endpoint.id}
                      onClick={() => setSelectedEndpoint(endpoint.id)}
                      className={`w-full text-left p-3 transition-colors ${
                        selectedEndpoint === endpoint.id
                          ? 'bg-vermillion/5 border-l-2 border-vermillion'
                          : 'hover:bg-ivory dark:hover:bg-ash/10 border-l-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-serif font-semibold text-ink dark:text-ivory text-sm">{endpoint.name}</span>
                        <span className={`px-2 py-0.5 font-mono text-[10px] tracking-wider ${
                          endpoint.method === 'GET' 
                            ? 'bg-gold/10 text-gold'
                            : 'bg-vermillion/10 text-vermillion'
                        }`}>
                          {endpoint.method}
                        </span>
                      </div>
                      <div className="text-xs text-stone mt-1 font-mono">{endpoint.endpoint}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Endpoint Details */}
              <div className="lg:col-span-2">
                {currentEndpoint && (
                  <div className="border border-ash dark:border-ash/20 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`px-3 py-1 font-mono text-xs tracking-wider ${
                        currentEndpoint.method === 'GET' 
                          ? 'bg-gold/10 text-gold'
                          : 'bg-vermillion/10 text-vermillion'
                      }`}>
                        {currentEndpoint.method}
                      </span>
                      <code className="text-ink dark:text-ivory font-mono text-sm">{currentEndpoint.endpoint}</code>
                    </div>
                    
                    <p className="text-stone mb-6">{currentEndpoint.description}</p>
                    
                    <h4 className="font-mono text-xs uppercase tracking-wider text-stone mb-3">Parameters</h4>
                    <div className="overflow-x-auto mb-6">
                      <table className="w-full border border-ash dark:border-ash/20">
                        <thead>
                          <tr className="border-b border-ash dark:border-ash/20 bg-ivory dark:bg-ash/5">
                            <th className="text-left p-3 font-mono text-[10px] uppercase tracking-wider text-stone">Name</th>
                            <th className="text-left p-3 font-mono text-[10px] uppercase tracking-wider text-stone">Type</th>
                            <th className="text-left p-3 font-mono text-[10px] uppercase tracking-wider text-stone">Required</th>
                            <th className="text-left p-3 font-mono text-[10px] uppercase tracking-wider text-stone">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentEndpoint.parameters.map((param, index) => (
                            <tr key={index} className="border-b border-ash dark:border-ash/20 last:border-b-0">
                              <td className="p-3 font-mono text-sm text-ink dark:text-ivory">{param.name}</td>
                              <td className="p-3 text-sm text-stone font-mono">{param.type}</td>
                              <td className="p-3 text-sm">
                                <span className={`px-2 py-0.5 font-mono text-[10px] tracking-wider ${
                                  param.required 
                                    ? 'bg-vermillion/10 text-vermillion'
                                    : 'bg-ash/30 text-stone'
                                }`}>
                                  {param.required ? 'Required' : 'Optional'}
                                </span>
                              </td>
                              <td className="p-3 text-sm text-stone">{param.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    <h4 className="font-mono text-xs uppercase tracking-wider text-stone mb-3">Example Response</h4>
                    <div className="bg-ink dark:bg-ivory/5 p-4 overflow-x-auto">
                      <pre className="text-sm text-ivory/80 font-mono whitespace-pre-wrap">
                        {currentEndpoint.example}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SDKs Tab */}
        {activeTab === 'sdks' && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-vermillion mb-2">Integration</p>
              <h2 className="font-serif text-3xl font-bold text-ink dark:text-ivory">SDKs &amp; Code Examples</h2>
            </div>

            <div className="space-y-6">
              {sdks.map((sdk, index) => (
                <div key={index} className="border border-ash dark:border-ash/20 p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                    <h3 className="font-serif text-xl font-bold text-ink dark:text-ivory">{sdk.name}</h3>
                    <code className="bg-ink dark:bg-ivory/10 text-ivory dark:text-ivory/80 px-3 py-1 font-mono text-xs">
                      {sdk.installation}
                    </code>
                  </div>
                  
                  <div className="bg-ink dark:bg-ivory/5 p-4 overflow-x-auto">
                    <pre className="text-sm text-ivory/80 font-mono whitespace-pre-wrap">
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
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-vermillion mb-2">Plans</p>
              <h2 className="font-serif text-3xl font-bold text-ink dark:text-ivory">API Pricing</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {pricingPlans.map((plan, index) => (
                <div
                  key={index}
                  className={`border p-8 text-center relative ${
                    plan.popular 
                      ? 'border-vermillion bg-vermillion/5' 
                      : 'border-ash dark:border-ash/20'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-vermillion text-white px-3 py-1 font-mono text-[9px] tracking-wider uppercase">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <h3 className="font-mono text-xs uppercase tracking-wider text-stone mb-2">{plan.name}</h3>
                  <div className="font-serif text-4xl font-bold text-ink dark:text-ivory mb-2">{plan.price}</div>
                  <p className="text-stone text-sm mb-6">{plan.requests}</p>
                  
                  <ul className="space-y-3 mb-8 text-left">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                        <span className="text-ink dark:text-ivory/80 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link
                    href={plan.name === 'Enterprise' ? '/contact' : '/api/register'}
                    className={`block w-full py-3 font-mono text-xs tracking-wider uppercase transition-colors ${
                      plan.popular
                        ? 'hover-magnetic bg-vermillion text-white'
                        : 'border border-ash dark:border-ash/20 text-ink dark:text-ivory hover:bg-ivory dark:hover:bg-ash/10'
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

      {/* CTA */}
      <div className="bg-ink dark:bg-ivory/5 border-t-2 border-vermillion py-16">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <DivergenceMark size={32} className="mx-auto mb-6" color="var(--color-vermillion, #C62828)" />
            <h2 className="font-serif text-3xl font-bold text-ivory mb-4">
              Ready to Build with NewsTRNT API?
            </h2>
            <p className="text-xl mb-8 text-ivory/60">
              Join thousands of developers building amazing news applications
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/api/register" className="hover-magnetic bg-vermillion text-white px-8 py-3 font-mono text-xs tracking-wider uppercase">
                Get Free API Key
              </Link>
              <a href="mailto:developers@NewsTRNT.com" className="border border-ivory/20 text-ivory px-8 py-3 font-mono text-xs tracking-wider uppercase hover:bg-ivory/10 transition-colors">
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
