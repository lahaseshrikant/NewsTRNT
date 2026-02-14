"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Breadcrumb from '@/components/Breadcrumb';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document';
  size: string;
  url: string;
  uploadDate: string;
  dimensions?: string;
  duration?: string;
  usedIn: string[];
}

const MediaLibrary: React.FC = () => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video' | 'audio' | 'document'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin/media`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMediaFiles(data.files || []);
      } else {
        setMediaFiles([]);
      }
    } catch (err) {
      console.error('Error fetching media:', err);
      setError('Failed to load media files');
      setMediaFiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const filteredFiles = mediaFiles.filter(file => {
    const typeMatch = filterType === 'all' || file.type === filterType;
    const searchMatch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    return typeMatch && searchMatch;
  });

  const getFileIcon = (type: string) => {
    const icons = {
      image: '🖼️',
      video: '🎥',
      audio: '🎵',
      document: '📄'
    };
    return icons[type as keyof typeof icons] || '📄';
  };

  const getFileTypeColor = (type: string) => {
    const colors = {
      image: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      video: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      audio: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      document: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
    };
    return colors[type as keyof typeof colors] || colors.document;
  };

  const totalSize = mediaFiles.reduce((sum, file) => {
    const size = parseFloat(file.size.split(' ')[0]);
    const unit = file.size.split(' ')[1];
    const sizeInMB = unit === 'GB' ? size * 1024 : size;
    return sum + sizeInMB;
  }, 0);

  const fileTypeCounts = mediaFiles.reduce((counts, file) => {
    counts[file.type] = (counts[file.type] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  const handleFileSelect = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === filteredFiles.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(filteredFiles.map(file => file.id));
    }
  };

  return (
    <div className="min-h-screen bg-background">
  <div className="container mx-auto py-8">
        <Breadcrumb 
          items={[
            { label: 'Admin Dashboard', href: '/admin' },
            { label: 'Media Library' }
          ]} 
          className="mb-6" 
        />

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Media Library</h1>
            <p className="text-muted-foreground">Upload, organize, and manage images, videos, and other media files</p>
          </div>
          <div className="flex space-x-3">
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
              📤 Upload Files
            </button>
            <button className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors">
              📁 Create Folder
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-2xl font-bold text-foreground">{mediaFiles.length}</div>
            <div className="text-sm text-muted-foreground">Total Files</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-2xl font-bold text-foreground">{fileTypeCounts.image || 0}</div>
            <div className="text-sm text-muted-foreground">Images</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-2xl font-bold text-foreground">{fileTypeCounts.video || 0}</div>
            <div className="text-sm text-muted-foreground">Videos</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-2xl font-bold text-foreground">{fileTypeCounts.audio || 0}</div>
            <div className="text-sm text-muted-foreground">Audio</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-2xl font-bold text-foreground">{totalSize.toFixed(1)} MB</div>
            <div className="text-sm text-muted-foreground">Total Size</div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-64">
              <input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground"
              />
            </div>

            {/* Filter */}
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="bg-background border border-border rounded-lg px-3 py-2 text-foreground"
            >
              <option value="all">All Files</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="audio">Audio</option>
              <option value="document">Documents</option>
            </select>

            {/* View Mode */}
            <div className="flex border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 text-sm ${
                  viewMode === 'grid' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-background text-foreground hover:bg-muted'
                }`}
              >
                🔲 Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm border-l border-border ${
                  viewMode === 'list' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-background text-foreground hover:bg-muted'
                }`}
              >
                📋 List
              </button>
            </div>

            {/* Bulk Actions */}
            {selectedFiles.length > 0 && (
              <div className="flex space-x-2">
                <button className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition-colors">
                  🗑️ Delete ({selectedFiles.length})
                </button>
                <button className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition-colors">
                  📁 Move
                </button>
              </div>
            )}
          </div>
        </div>

        {/* File Selection Controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleSelectAll}
              className="text-sm text-primary hover:text-primary/80"
            >
              {selectedFiles.length === filteredFiles.length ? 'Deselect All' : 'Select All'}
            </button>
            <span className="text-sm text-muted-foreground">
              {filteredFiles.length} files found
              {selectedFiles.length > 0 && ` • ${selectedFiles.length} selected`}
            </span>
          </div>
        </div>

        {/* Files Display */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 p-6">
              {filteredFiles.map((file) => (
                <div 
                  key={file.id} 
                  className={`relative border border-border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer ${
                    selectedFiles.includes(file.id) ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                  onClick={() => handleFileSelect(file.id)}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2">{getFileIcon(file.type)}</div>
                    <div className="text-sm font-medium text-foreground truncate" title={file.name}>
                      {file.name}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{file.size}</div>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium mt-2 ${getFileTypeColor(file.type)}`}>
                      {file.type.toUpperCase()}
                    </span>
                  </div>
                  
                  {selectedFiles.includes(file.id) && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground text-xs">✓</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 w-12">
                      <input
                        type="checkbox"
                        checked={selectedFiles.length === filteredFiles.length && filteredFiles.length > 0}
                        onChange={handleSelectAll}
                        className="rounded"
                      />
                    </th>
                    <th className="text-left p-4 font-medium text-foreground">File</th>
                    <th className="text-left p-4 font-medium text-foreground">Type</th>
                    <th className="text-left p-4 font-medium text-foreground">Size</th>
                    <th className="text-left p-4 font-medium text-foreground">Dimensions/Duration</th>
                    <th className="text-left p-4 font-medium text-foreground">Upload Date</th>
                    <th className="text-left p-4 font-medium text-foreground">Used In</th>
                    <th className="text-left p-4 font-medium text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFiles.map((file, index) => (
                    <tr key={file.id} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedFiles.includes(file.id)}
                          onChange={() => handleFileSelect(file.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{getFileIcon(file.type)}</span>
                          <div>
                            <div className="font-medium text-foreground">{file.name}</div>
                            <div className="text-sm text-muted-foreground">ID: {file.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getFileTypeColor(file.type)}`}>
                          {file.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-foreground">{file.size}</td>
                      <td className="p-4 text-foreground">
                        {file.dimensions && <div>{file.dimensions}</div>}
                        {file.duration && <div>{file.duration}</div>}
                      </td>
                      <td className="p-4 text-foreground">{file.uploadDate}</td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {file.usedIn.slice(0, 2).map((usage, i) => (
                            <span
                              key={i}
                              className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 px-2 py-1 rounded text-xs"
                            >
                              {usage}
                            </span>
                          ))}
                          {file.usedIn.length > 2 && (
                            <span className="text-xs text-muted-foreground">
                              +{file.usedIn.length - 2} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400" title="Edit">
                            ✏️
                          </button>
                          <button className="text-green-600 hover:text-green-800 dark:text-green-400" title="View">
                            👁️
                          </button>
                          <button className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400" title="Download">
                            📥
                          </button>
                          <button className="text-red-600 hover:text-red-800 dark:text-red-400" title="Delete">
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Upload Zone */}
        <div className="mt-8 bg-card border border-border rounded-lg p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">📤</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Upload New Files</h3>
            <p className="text-muted-foreground mb-4">Drag and drop files here or click to browse</p>
            <div className="border-2 border-dashed border-border rounded-lg p-8 hover:border-primary transition-colors">
              <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors">
                Choose Files
              </button>
              <p className="text-sm text-muted-foreground mt-2">
                Supported formats: JPG, PNG, GIF, MP4, MP3, PDF (Max 100MB per file)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaLibrary;

