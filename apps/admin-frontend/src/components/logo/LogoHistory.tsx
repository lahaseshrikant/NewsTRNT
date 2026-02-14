'use client';

import { useState, useEffect } from 'react';

interface LogoHistory {
  id: string;
  name: string;
  timestamp: Date;
  config: LogoConfig;
  preview: string;
  dataUrl: string;
  format: string;
  code?: string;
  version?: string;
  description?: string;
  deployments?: number;
  lastDeployed?: Date;
}

interface LogoConfig {
  type: 'typography' | 'shape' | 'image' | 'code' | 'current';
  text: string;
  shape: string;
  clipPath?: string;
  background: string;
  textColor: string;
  size: 'small' | 'medium' | 'large';
  animation: 'none' | 'pulse' | 'glow' | 'bounce' | 'spin';
  customCSS: string;
  hasNeuralNetwork: boolean;
  neuralIntensity: number;
  borderRadius: number;
  borderWidth: number;
  borderColor: string;
  shadowIntensity: number;
  imageUrl?: string;
  imageFile?: File;
  customCode?: string;
  codeLanguage?: 'html' | 'css' | 'svg' | 'javascript' | 'jsx';
}

const LogoHistory = () => {
  const [logoHistory, setLogoHistory] = useState<LogoHistory[]>([]);
  const [editingHistoryId, setEditingHistoryId] = useState<string | null>(null);
  const [editingHistoryName, setEditingHistoryName] = useState<string>('');
  const [selectedVersion, setSelectedVersion] = useState<string>('');
  const [previewMode, setPreviewMode] = useState<'grid' | 'list'>('list');
  const [filterType, setFilterType] = useState<'all' | 'typography' | 'image' | 'code'>('all');

  const shapes = [
    { id: 'none', name: 'Rectangle', clipPath: 'none' },
    { id: 'rounded', name: 'Rounded Rectangle', clipPath: 'none' },
    { id: 'circle', name: 'Circle', clipPath: 'circle(50% at 50% 50%)' },
    { id: 'star', name: 'Star', clipPath: 'polygon(50% 0%, 60% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 40% 35%)' },
    { id: 'shield', name: 'Shield', clipPath: 'polygon(50% 0%, 80% 15%, 100% 35%, 85% 85%, 50% 100%, 15% 85%, 0% 35%, 20% 15%)' },
    { id: 'hexagon', name: 'Hexagon', clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' },
    { id: 'diamond', name: 'Diamond', clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' },
  ];

  useEffect(() => {
    loadLogoHistory();
  }, []);

  const loadLogoHistory = () => {
    const savedHistory = localStorage.getItem('NewsTRNT-logo-history');
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory);
        // Convert timestamp strings back to Date objects and add versioning
        const processedHistory = history.map((item: any, index: number) => ({
          ...item,
          timestamp: new Date(item.timestamp),
          lastDeployed: item.lastDeployed ? new Date(item.lastDeployed) : undefined,
          version: item.version || `v${history.length - index}.0`,
          deployments: item.deployments || 0,
          description: item.description || ''
        }));
        setLogoHistory(processedHistory);
      } catch (error) {
        console.error('Error loading logo history:', error);
        setLogoHistory([]);
      }
    }
  };

  const generateLogoVersion = (historyLength: number) => {
    const major = Math.floor(historyLength / 10) + 1;
    const minor = historyLength % 10;
    return `v${major}.${minor}`;
  };

  const renderLogoPreview = (logo: LogoHistory, size: 'small' | 'medium' | 'large' = 'medium') => {
    const selectedShape = shapes.find(s => s.id === logo.config.shape) || shapes[0];
    
    const sizeClasses = {
      small: 'w-8 h-8',
      medium: 'w-16 h-16',
      large: 'w-24 h-24'
    };

    const textSizeClasses = {
      small: 'text-xs',
      medium: 'text-sm',
      large: 'text-lg'
    };

    const animationClasses = {
      none: '',
      pulse: 'animate-pulse',
      glow: 'animate-pulse filter drop-shadow-lg',
      bounce: 'animate-bounce',
      spin: 'animate-spin'
    };

    // Handle new properties with defaults for backward compatibility
    const borderRadius = logo.config.borderRadius || 0;
    const borderWidth = logo.config.borderWidth || 0;
    const borderColor = logo.config.borderColor || '#ffffff';
    const shadowIntensity = logo.config.shadowIntensity || 2;

    const getBorderRadius = () => {
      if (logo.config.shape === 'rounded' || borderRadius > 0) {
        return `${borderRadius}px`;
      }
      return selectedShape?.clipPath === 'none' ? `${borderRadius}px` : '0';
    };

    const getShadowStyle = () => {
      if (shadowIntensity === 0) return '';
      const intensity = shadowIntensity;
      return `drop-shadow(0 ${intensity}px ${intensity * 2}px rgba(37, 99, 235, 0.${intensity > 5 ? '4' : '3'}))`;
    };

    // Handle image logos
    if (logo.config.type === 'image' && logo.config.imageUrl) {
      return (
        <div 
          className={`relative ${sizeClasses[size]} flex items-center justify-center group transition-all duration-500 hover:scale-105 overflow-hidden ${animationClasses[logo.config.animation]}`}
          style={{
            background: logo.config.background,
            clipPath: logo.config.clipPath || selectedShape?.clipPath || 'none',
            borderRadius: getBorderRadius(),
            border: borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : 'none',
            filter: getShadowStyle()
          }}
        >
          <img 
            src={logo.config.imageUrl} 
            alt="Logo Preview" 
            className="w-full h-full object-cover"
            style={{
              borderRadius: getBorderRadius()
            }}
          />
        </div>
      );
    }

    // Handle custom code logos
    if (logo.config.type === 'code' && logo.config.customCode) {
      return (
        <div 
          className={`relative ${sizeClasses[size]} flex items-center justify-center group transition-all duration-500 hover:scale-105 overflow-hidden ${animationClasses[logo.config.animation]}`}
          style={{
            background: logo.config.background,
            clipPath: logo.config.clipPath || selectedShape?.clipPath || 'none',
            borderRadius: getBorderRadius(),
            border: borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : 'none',
            filter: getShadowStyle()
          }}
          dangerouslySetInnerHTML={{ 
            __html: logo.config.customCode 
          }}
        />
      );
    }

    // Handle text/typography/shape logos (default) - enhanced version
    return (
      <div 
        className={`relative ${sizeClasses[size]} flex items-center justify-center group transition-all duration-500 hover:scale-105 overflow-hidden ${animationClasses[logo.config.animation]}`}
        style={{
          background: logo.config.background,
          clipPath: logo.config.clipPath || selectedShape?.clipPath || 'none',
          borderRadius: getBorderRadius(),
          border: borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : 'none',
          filter: getShadowStyle()
        }}
      >
        {/* Animated background particles for medium and large sizes */}
        {size !== 'small' && (
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1 left-1 w-1 h-1 bg-white rounded-full animate-ping" style={{animationDelay: '100ms'}}></div>
            <div className="absolute top-2 right-2 w-0.5 h-0.5 bg-cyan-300 rounded-full animate-pulse" style={{animationDelay: '300ms'}}></div>
            <div className="absolute bottom-2 left-2 w-0.5 h-0.5 bg-yellow-300 rounded-full animate-ping" style={{animationDelay: '500ms'}}></div>
            <div className="absolute bottom-1 right-1 w-1 h-1 bg-pink-300 rounded-full animate-pulse" style={{animationDelay: '700ms'}}></div>
          </div>
        )}
        
        {/* Main logo content */}
        <div className="relative z-10 flex items-center space-x-0.5">
          <span 
            className={`font-black ${textSizeClasses[size]} tracking-tighter transform group-hover:scale-110 transition-transform duration-300 drop-shadow-sm`}
            style={{ color: logo.config.textColor }}
          >
            {logo.config.text.charAt(0)}
          </span>
          
          {logo.config.text.length > 1 && size !== 'small' && (
            <>
              {/* Dynamic connecting element for medium and large sizes */}
              <div className="relative w-1 h-3 flex flex-col justify-center">
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-300 via-white to-purple-300 rounded-full animate-pulse"></div>
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 4 16">
                  <path 
                    d="M1 2 Q2.5 4, 1 6 Q-0.5 8, 1 10 Q2.5 12, 1 14" 
                    stroke="rgba(255,255,255,0.9)" 
                    strokeWidth="0.3" 
                    fill="none"
                    className="animate-pulse"
                  />
                  <path 
                    d="M3 2 Q1.5 4, 3 6 Q4.5 8, 3 10 Q1.5 12, 3 14" 
                    stroke="rgba(255,255,255,0.7)" 
                    strokeWidth="0.3" 
                    fill="none"
                    className="animate-pulse"
                    style={{animationDelay: '0.3s'}}
                  />
                </svg>
              </div>
              
              <span 
                className={`font-black ${textSizeClasses[size]} tracking-tighter transform group-hover:scale-110 transition-transform duration-300 drop-shadow-sm`}
                style={{ color: logo.config.textColor }}
              >
                {logo.config.text.charAt(1)}
              </span>
            </>
          )}
          
          {/* Show full text for small size */}
          {logo.config.text.length > 1 && size === 'small' && (
            <span 
              className={`font-black ${textSizeClasses[size]} tracking-tighter transform group-hover:scale-110 transition-transform duration-300 drop-shadow-sm`}
              style={{ color: logo.config.textColor }}
            >
              {logo.config.text.substring(1)}
            </span>
          )}
        </div>

        {/* Neural network visualization for medium and large sizes */}
        {logo.config.hasNeuralNetwork && size !== 'small' && (
          <svg 
            className={`absolute inset-0 w-full h-full opacity-${Math.round(logo.config.neuralIntensity / 4)} group-hover:opacity-${Math.round(logo.config.neuralIntensity / 2)} transition-opacity duration-500`} 
            viewBox="0 0 40 40"
          >
            <g className="animate-pulse" style={{animationDuration: '3s'}}>
              <path d="M8 8 Q20 15, 32 8" stroke="rgba(255,255,255,0.6)" strokeWidth="0.3" fill="none"/>
              <path d="M8 32 Q20 25, 32 32" stroke="rgba(255,255,255,0.6)" strokeWidth="0.3" fill="none"/>
              <path d="M8 20 L32 20" stroke="rgba(255,255,255,0.4)" strokeWidth="0.2" fill="none"/>
            </g>
            
            <g className="animate-pulse" style={{animationDuration: '2s', animationDelay: '0.5s'}}>
              <circle cx="8" cy="8" r="0.8" fill="rgba(255,255,255,0.8)"/>
              <circle cx="32" cy="8" r="0.8" fill="rgba(255,255,255,0.8)"/>
              <circle cx="8" cy="32" r="0.8" fill="rgba(255,255,255,0.8)"/>
              <circle cx="32" cy="32" r="0.8" fill="rgba(255,255,255,0.8)"/>
              <circle cx="20" cy="20" r="1" fill="rgba(255,255,255,0.9)"/>
            </g>
          </svg>
        )}

        {/* Live pulse indicators for medium and large sizes */}
        {size !== 'small' && (
          <div className="absolute -top-0.5 -right-0.5 flex space-x-0.5">
            <div className="w-1 h-1 bg-red-500 rounded-full animate-ping"></div>
            <div className="w-0.5 h-0.5 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        )}
      </div>
    );
  };

  const startEditingHistoryName = (logoId: string, currentName: string) => {
    setEditingHistoryId(logoId);
    setEditingHistoryName(currentName);
  };

  const cancelEditingHistoryName = () => {
    setEditingHistoryId(null);
    setEditingHistoryName('');
  };

  const saveHistoryNameEdit = (logoId: string) => {
    if (!editingHistoryName.trim()) return;

    const updatedHistory = logoHistory.map(logo => 
      logo.id === logoId 
        ? { ...logo, name: editingHistoryName.trim() }
        : logo
    );
    
    setLogoHistory(updatedHistory);
    localStorage.setItem('NewsTRNT-logo-history', JSON.stringify(updatedHistory));
    setEditingHistoryId(null);
    setEditingHistoryName('');
  };

  const deleteHistoryItem = (logoId: string) => {
    if (confirm('Are you sure you want to delete this logo from history?')) {
      const updatedHistory = logoHistory.filter(logo => logo.id !== logoId);
      setLogoHistory(updatedHistory);
      localStorage.setItem('NewsTRNT-logo-history', JSON.stringify(updatedHistory));
    }
  };

  const deployLogo = (logo: LogoHistory) => {
    // Update deployment count and last deployed date
    const updatedLogo = {
      ...logo,
      deployments: (logo.deployments || 0) + 1,
      lastDeployed: new Date()
    };
    
    // Update in history
    const updatedHistory = logoHistory.map(item => 
      item.id === logo.id ? updatedLogo : item
    );
    setLogoHistory(updatedHistory);
    localStorage.setItem('NewsTRNT-logo-history', JSON.stringify(updatedHistory));
    
    // Save as active logo
    localStorage.setItem('NewsTRNT-active-logo', JSON.stringify(logo.config));
    
    // Dispatch events to update the site
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('logoChanged', { 
        detail: { config: logo.config } 
      }));
    }, 50);
    
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'NewsTRNT-active-logo',
      newValue: JSON.stringify(logo.config),
      storageArea: localStorage
    }));
    
    alert(`🚀 Logo "${logo.name}" (${updatedLogo.version}) deployed across the site!`);
  };

  const filteredHistory = logoHistory.filter(logo => {
    if (filterType === 'all') return true;
    return logo.config.type === filterType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return '🖼️';
      case 'code': return '💻';
      case 'typography': return '🔤';
      case 'shape': return '🔷';
      default: return '📝';
    }
  };

  const getStatusColor = (logo: LogoHistory) => {
    const daysSinceCreated = Math.floor((new Date().getTime() - logo.timestamp.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceCreated === 0) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (daysSinceCreated <= 7) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    if (daysSinceCreated <= 30) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const downloadLogo = (logo: LogoHistory) => {
    if (logo.dataUrl) {
      const link = document.createElement('a');
      link.href = logo.dataUrl;
      
      let filename = `logo-${logo.id}`;
      let extension = '';
      
      switch (logo.format) {
        case 'html':
          extension = '.html';
          break;
        case 'png':
        case 'image':
          extension = '.png';
          break;
        case 'svg':
          extension = '.svg';
          break;
        case 'css':
          extension = '.css';
          break;
        case 'javascript':
        case 'jsx':
          extension = '.js';
          break;
        default:
          extension = '.txt';
      }
      
      link.download = filename + extension;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const exportHistory = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      totalLogos: logoHistory.length,
      logos: logoHistory
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `NewsTRNT-logo-history-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const clearHistory = () => {
    if (confirm('Are you sure you want to clear all logo history? This cannot be undone.')) {
      setLogoHistory([]);
      localStorage.removeItem('NewsTRNT-logo-history');
      alert('Logo history cleared successfully!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Logo History & Versions
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {filteredHistory.length} versions • Advanced versioning system • Complete logo evolution tracking
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setPreviewMode('list')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    previewMode === 'list' 
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  📋 List
                </button>
                <button
                  onClick={() => setPreviewMode('grid')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    previewMode === 'grid' 
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  ⊞ Grid
                </button>
              </div>

              {/* Filter Dropdown */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="all">All Types ({logoHistory.length})</option>
                <option value="typography">Typography ({logoHistory.filter(l => l.config.type === 'typography').length})</option>
                <option value="image">Images ({logoHistory.filter(l => l.config.type === 'image').length})</option>
                <option value="code">Code ({logoHistory.filter(l => l.config.type === 'code').length})</option>
              </select>

              <button
                onClick={exportHistory}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                disabled={logoHistory.length === 0}
              >
                📤 Export
              </button>
              <button
                onClick={clearHistory}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                disabled={logoHistory.length === 0}
              >
                🗑️ Clear
              </button>
            </div>
          </div>

          {logoHistory.length === 0 ? (
            <div className="text-center py-16 text-gray-500 dark:text-gray-400">
              <div className="text-8xl mb-6">📅</div>
              <h3 className="text-2xl font-semibold mb-4">No Logo History</h3>
              <p className="text-lg mb-6 max-w-md mx-auto">
                Create and save logos in the Logo Manager to see comprehensive version history here.
              </p>
              <a
                href="/logo-manager"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Go to Logo Manager
              </a>
            </div>
          ) : (
            <>
              {/* Enhanced Statistics Dashboard */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                    {logoHistory.length}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Total Versions</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                    {logoHistory.filter(logo => logo.config.type === 'image').length}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Image Logos</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                    {logoHistory.filter(logo => logo.config.type === 'code').length}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Code Logos</div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                    {logoHistory.reduce((sum, logo) => sum + (logo.deployments || 0), 0)}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Total Deployments</div>
                </div>
                <div className="bg-pink-50 dark:bg-pink-900/20 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-pink-600 dark:text-pink-400 mb-1">
                    {logoHistory.length > 0 ? logoHistory[0].timestamp.toLocaleDateString() : '-'}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Latest Version</div>
                </div>
              </div>

              {/* Logo History Display */}
              {previewMode === 'grid' ? (
                /* Grid View */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredHistory.map((logo, index) => (
                    <div key={logo.id} className="group bg-gray-50 dark:bg-gray-700 rounded-xl p-6 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600">
                      {/* Preview */}
                      <div className="flex justify-center mb-4">
                        {renderLogoPreview(logo, 'large')}
                      </div>
                      
                      {/* Info */}
                      <div className="text-center mb-4">
                        {editingHistoryId === logo.id ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={editingHistoryName}
                              onChange={(e) => setEditingHistoryName(e.target.value)}
                              className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') saveHistoryNameEdit(logo.id);
                                if (e.key === 'Escape') cancelEditingHistoryName();
                              }}
                              onBlur={() => saveHistoryNameEdit(logo.id)}
                              autoFocus
                            />
                            <button onClick={() => saveHistoryNameEdit(logo.id)} className="text-green-600">✓</button>
                            <button onClick={cancelEditingHistoryName} className="text-red-600">✕</button>
                          </div>
                        ) : (
                          <h3 
                            className="font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-2"
                            onClick={() => startEditingHistoryName(logo.id, logo.name)}
                            title="Click to edit name"
                          >
                            {logo.name}
                          </h3>
                        )}
                        
                        <div className="flex items-center justify-center space-x-2 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(logo)}`}>
                            {logo.version || `v${logoHistory.length - index}.0`}
                          </span>
                          {index === 0 && (
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full font-medium">
                              Latest
                            </span>
                          )}
                        </div>
                        
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          {getTypeIcon(logo.config.type)} {logo.config.type}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {logo.timestamp.toLocaleDateString()}
                        </div>
                        {logo.deployments && logo.deployments > 0 && (
                          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            🚀 Deployed {logo.deployments} times
                          </div>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => deployLogo(logo)}
                            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs font-medium"
                          >
                            🚀 Deploy
                          </button>
                          <button
                            onClick={() => downloadLogo(logo)}
                            className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs font-medium"
                          >
                            💾 Download
                          </button>
                        </div>
                        <button
                          onClick={() => deleteHistoryItem(logo.id)}
                          className="w-full px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs font-medium"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* List View */
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredHistory.map((logo, index) => (
                    <div key={logo.id}>
                      <div className="group flex items-center justify-between p-6 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <div className="flex items-center space-x-6">
                          {/* Enhanced Logo Preview */}
                          <div className="flex-shrink-0">
                            {renderLogoPreview(logo, 'medium')}
                          </div>
                          
                          {/* Logo Info */}
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              {editingHistoryId === logo.id ? (
                                <div className="flex items-center space-x-2 flex-1">
                                  <input
                                    type="text"
                                    value={editingHistoryName}
                                    onChange={(e) => setEditingHistoryName(e.target.value)}
                                    className="flex-1 px-3 py-2 text-lg border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') saveHistoryNameEdit(logo.id);
                                      if (e.key === 'Escape') cancelEditingHistoryName();
                                    }}
                                    onBlur={() => saveHistoryNameEdit(logo.id)}
                                    autoFocus
                                  />
                                  <button onClick={() => saveHistoryNameEdit(logo.id)} className="text-green-600 hover:text-green-700 text-lg">✓</button>
                                  <button onClick={cancelEditingHistoryName} className="text-red-600 hover:text-red-700 text-lg">✕</button>
                                </div>
                              ) : (
                                <>
                                  <h3 
                                    className="text-lg font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                    onClick={() => startEditingHistoryName(logo.id, logo.name)}
                                    title="Click to edit name"
                                  >
                                    {logo.name}
                                  </h3>
                                  <button
                                    onClick={() => startEditingHistoryName(logo.id, logo.name)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Edit name"
                                  >
                                    ✏️
                                  </button>
                                </>
                              )}
                              
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(logo)}`}>
                                {logo.version || `v${logoHistory.length - index}.0`}
                              </span>
                              
                              {index === 0 && (
                                <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm rounded-full font-medium">
                                  Latest
                                </span>
                              )}
                            </div>
                            
                            <div className="text-gray-600 dark:text-gray-400 mb-1 flex items-center space-x-4">
                              <span>{logo.timestamp.toLocaleString()}</span>
                              {logo.deployments && logo.deployments > 0 && (
                                <span className="text-blue-600 dark:text-blue-400 text-sm">
                                  🚀 Deployed {logo.deployments} times
                                </span>
                              )}
                              {logo.lastDeployed && (
                                <span className="text-green-600 dark:text-green-400 text-sm">
                                  Last deployed: {logo.lastDeployed.toLocaleString()}
                                </span>
                              )}
                            </div>
                            
                            <div className="text-sm text-gray-500 dark:text-gray-500 flex items-center space-x-4">
                              <span>{getTypeIcon(logo.config.type)} {logo.config.type}</span>
                              <span>Format: {logo.format?.toUpperCase() || 'Config'}</span>
                              {logo.config.type === 'typography' && <span>Text: "{logo.config.text}"</span>}
                              {logo.config.type === 'image' && <span>Custom Image</span>}
                              {logo.config.type === 'code' && <span>{logo.config.codeLanguage?.toUpperCase()} Code</span>}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => setSelectedVersion(selectedVersion === logo.id ? '' : logo.id)}
                            className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors text-sm font-medium"
                          >
                            {selectedVersion === logo.id ? '👁️ Hide Details' : '👁️ View Details'}
                          </button>
                          <button
                            onClick={() => deployLogo(logo)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                            title="Deploy this logo to site immediately"
                          >
                            🚀 Deploy
                          </button>
                          <button
                            onClick={() => downloadLogo(logo)}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                            title="Download logo file"
                          >
                            💾 Download
                          </button>
                          <button
                            onClick={() => deleteHistoryItem(logo.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                            title="Delete from history"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                      
                      {/* Expanded Details Panel */}
                      {selectedVersion === logo.id && (
                        <div className="mx-6 mb-4 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                          <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
                            📋 Version Details: {logo.version || `v${logoHistory.length - index}.0`}
                          </h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Preview */}
                            <div className="text-center">
                              <h5 className="font-medium text-gray-900 dark:text-white mb-3">Live Preview</h5>
                              <div className="flex justify-center">
                                {renderLogoPreview(logo, 'large')}
                              </div>
                            </div>
                            
                            {/* Technical Details */}
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-white mb-3">Technical Details</h5>
                              <div className="space-y-2 text-sm">
                                <div><strong>Type:</strong> {logo.config.type}</div>
                                <div><strong>Format:</strong> {logo.format}</div>
                                <div><strong>Size:</strong> {logo.config.size}</div>
                                <div><strong>Animation:</strong> {logo.config.animation}</div>
                                {logo.config.hasNeuralNetwork && <div><strong>Neural Network:</strong> {logo.config.neuralIntensity}% intensity</div>}
                                {logo.config.borderRadius > 0 && <div><strong>Border Radius:</strong> {logo.config.borderRadius}px</div>}
                                {logo.config.borderWidth > 0 && <div><strong>Border Width:</strong> {logo.config.borderWidth}px</div>}
                                {logo.config.shadowIntensity > 0 && <div><strong>Shadow:</strong> {logo.config.shadowIntensity}</div>}
                              </div>
                            </div>
                            
                            {/* Usage Statistics */}
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-white mb-3">Usage Statistics</h5>
                              <div className="space-y-2 text-sm">
                                <div><strong>Created:</strong> {logo.timestamp.toLocaleString()}</div>
                                <div><strong>Deployments:</strong> {logo.deployments || 0}</div>
                                {logo.lastDeployed && <div><strong>Last Deployed:</strong> {logo.lastDeployed.toLocaleString()}</div>}
                                <div><strong>Age:</strong> {Math.floor((new Date().getTime() - logo.timestamp.getTime()) / (1000 * 60 * 60 * 24))} days</div>
                                <div><strong>File Size:</strong> {logo.dataUrl ? Math.round(logo.dataUrl.length / 1024) : 0} KB</div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Code Preview for Code Logos */}
                          {logo.config.type === 'code' && logo.code && (
                            <div className="mt-6">
                              <h5 className="font-medium text-gray-900 dark:text-white mb-3">Source Code</h5>
                              <pre className="bg-gray-800 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                                {logo.code.substring(0, 500)}
                                {logo.code.length > 500 && '...'}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogoHistory;

