// src/app/admin/content/calendar/page.tsx - Editorial Content Calendar
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AdminRoute } from '@/components/auth/RouteGuard';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

interface CalendarEvent {
  id: string;
  title: string;
  type: 'article' | 'breaking' | 'feature' | 'opinion' | 'interview' | 'newsletter';
  status: 'scheduled' | 'in_progress' | 'review' | 'published' | 'draft';
  author: string;
  category: string;
  scheduledFor: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description?: string;
}

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function ContentCalendarContent() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  
  const categories = ['Politics', 'Technology', 'Business', 'Sports', 'Entertainment', 'Science', 'Health'];

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/articles?limit=50`);
      
      if (response.ok) {
        const data = await response.json();
        const articles = data.articles || [];
        
        // Transform articles to calendar events
        const calendarEvents: CalendarEvent[] = articles.map((article: any) => ({
          id: article.id,
          title: article.title,
          type: article.contentType === 'breaking' ? 'breaking' :
                article.contentType === 'opinion' ? 'opinion' :
                article.contentType === 'feature' ? 'feature' :
                article.contentType === 'interview' ? 'interview' : 'article',
          status: article.isPublished ? 'published' : 'draft',
          author: article.author?.fullName || article.author || 'Staff Writer',
          category: article.category?.name || 'Uncategorized',
          scheduledFor: new Date(article.publishedAt || article.createdAt),
          priority: article.priority || 'medium',
          description: article.excerpt || article.summary
        }));
        
        setEvents(calendarEvents);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const getTypeColor = (type: CalendarEvent['type']) => {
    const colors = {
      article: 'bg-blue-500',
      breaking: 'bg-red-500',
      feature: 'bg-purple-500',
      opinion: 'bg-yellow-500',
      interview: 'bg-green-500',
      newsletter: 'bg-indigo-500'
    };
    return colors[type];
  };

  const getStatusColor = (status: CalendarEvent['status']) => {
    const colors = {
      scheduled: 'border-l-blue-500',
      in_progress: 'border-l-yellow-500',
      review: 'border-l-orange-500',
      published: 'border-l-green-500',
      draft: 'border-l-gray-500'
    };
    return colors[status];
  };

  const getPriorityIcon = (priority: CalendarEvent['priority']) => {
    const icons = { low: '○', medium: '◐', high: '●', urgent: '🔥' };
    return icons[priority];
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay();
    
    return { daysInMonth, startDay };
  };

  const { daysInMonth, startDay } = getDaysInMonth(currentDate);

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.scheduledFor);
      const matches = eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear();
      
      const categoryMatch = filterCategory === 'all' || event.category === filterCategory;
      const typeMatch = filterType === 'all' || event.type === filterType;
      
      return matches && categoryMatch && typeMatch;
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const handleDragStart = (event: CalendarEvent) => {
    setDraggedEvent(event);
  };

  const handleDrop = (date: Date) => {
    if (!draggedEvent) return;
    
    const updatedEvents = events.map(e => {
      if (e.id === draggedEvent.id) {
        const newDate = new Date(date);
        const oldDate = new Date(e.scheduledFor);
        newDate.setHours(oldDate.getHours(), oldDate.getMinutes());
        return { ...e, scheduledFor: newDate };
      }
      return e;
    });
    
    setEvents(updatedEvents);
    setDraggedEvent(null);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const upcomingEvents = events
    .filter(e => new Date(e.scheduledFor) >= new Date())
    .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime())
    .slice(0, 5);

  const publishedToday = events.filter(e => {
    const today = new Date();
    const eventDate = new Date(e.scheduledFor);
    return eventDate.getDate() === today.getDate() &&
      eventDate.getMonth() === today.getMonth() &&
      e.status === 'published';
  }).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Content Calendar</h1>
          <p className="text-muted-foreground">Plan and schedule your editorial content</p>
        </div>
        <button
          onClick={() => {
            setSelectedEvent(null);
            setShowEventModal(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Schedule Content
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Scheduled This Week</p>
          <p className="text-2xl font-bold text-blue-600">{events.filter(e => e.status === 'scheduled').length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">In Progress</p>
          <p className="text-2xl font-bold text-yellow-600">{events.filter(e => e.status === 'in_progress').length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">In Review</p>
          <p className="text-2xl font-bold text-orange-600">{events.filter(e => e.status === 'review').length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Published Today</p>
          <p className="text-2xl font-bold text-green-600">{publishedToday}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Calendar */}
        <div className="lg:col-span-3 space-y-4">
          {/* Calendar Controls */}
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <button onClick={() => navigateMonth('prev')} className="p-2 hover:bg-muted rounded-lg">←</button>
                <h2 className="text-xl font-bold text-foreground">
                  {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h2>
                <button onClick={() => navigateMonth('next')} className="p-2 hover:bg-muted rounded-lg">→</button>
                <button 
                  onClick={() => setCurrentDate(new Date())}
                  className="px-3 py-1 text-sm bg-muted rounded-lg hover:bg-muted/80"
                >
                  Today
                </button>
              </div>
              <div className="flex gap-2">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="article">Article</option>
                  <option value="breaking">Breaking News</option>
                  <option value="feature">Feature</option>
                  <option value="opinion">Opinion</option>
                  <option value="interview">Interview</option>
                  <option value="newsletter">Newsletter</option>
                </select>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {/* Days Header */}
            <div className="grid grid-cols-7 border-b border-border bg-muted/30">
              {daysOfWeek.map(day => (
                <div key={day} className="px-2 py-3 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7">
              {/* Empty cells for days before month starts */}
              {Array.from({ length: startDay }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[120px] border-b border-r border-border bg-muted/10" />
              ))}
              
              {/* Days of the month */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1);
                const dayEvents = getEventsForDate(date);
                
                return (
                  <div
                    key={i + 1}
                    className={`min-h-[120px] border-b border-r border-border p-2 transition-colors ${
                      isToday(date) ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-muted/30'
                    }`}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(date)}
                  >
                    <div className={`text-sm font-medium mb-1 ${isToday(date) ? 'text-blue-600' : 'text-foreground'}`}>
                      {i + 1}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map(event => (
                        <div
                          key={event.id}
                          draggable
                          onDragStart={() => handleDragStart(event)}
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowEventModal(true);
                          }}
                          className={`text-xs p-1 rounded cursor-pointer border-l-2 ${getStatusColor(event.status)} bg-muted/50 hover:bg-muted truncate`}
                          title={event.title}
                        >
                          <span className={`inline-block w-2 h-2 rounded-full mr-1 ${getTypeColor(event.type)}`} />
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-muted-foreground text-center">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Upcoming Events */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="font-semibold text-foreground mb-4">📅 Upcoming</h3>
            <div className="space-y-3">
              {upcomingEvents.map(event => (
                <div
                  key={event.id}
                  onClick={() => {
                    setSelectedEvent(event);
                    setShowEventModal(true);
                  }}
                  className="p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${getTypeColor(event.type)}`} />
                    <span className="font-medium text-sm text-foreground truncate">{event.title}</span>
                  </div>
                  <div className="text-xs text-muted-foreground ml-4 mt-1">
                    {new Date(event.scheduledFor).toLocaleDateString()} at {new Date(event.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content Type Legend */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="font-semibold text-foreground mb-4">Content Types</h3>
            <div className="space-y-2">
              {[
                { type: 'article', label: 'Article' },
                { type: 'breaking', label: 'Breaking News' },
                { type: 'feature', label: 'Feature' },
                { type: 'opinion', label: 'Opinion' },
                { type: 'interview', label: 'Interview' },
                { type: 'newsletter', label: 'Newsletter' }
              ].map(item => (
                <div key={item.type} className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${getTypeColor(item.type as CalendarEvent['type'])}`} />
                  <span className="text-sm text-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Priority Legend */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="font-semibold text-foreground mb-4">Priority</h3>
            <div className="space-y-2">
              {[
                { priority: 'low', label: 'Low' },
                { priority: 'medium', label: 'Medium' },
                { priority: 'high', label: 'High' },
                { priority: 'urgent', label: 'Urgent' }
              ].map(item => (
                <div key={item.priority} className="flex items-center gap-2">
                  <span className="w-4">{getPriorityIcon(item.priority as CalendarEvent['priority'])}</span>
                  <span className="text-sm text-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-foreground mb-4">
              {selectedEvent ? 'Edit Event' : 'Schedule Content'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Title *</label>
                <input
                  type="text"
                  defaultValue={selectedEvent?.title || ''}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                  placeholder="Enter content title"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Type</label>
                  <select
                    defaultValue={selectedEvent?.type || 'article'}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                  >
                    <option value="article">Article</option>
                    <option value="breaking">Breaking News</option>
                    <option value="feature">Feature</option>
                    <option value="opinion">Opinion</option>
                    <option value="interview">Interview</option>
                    <option value="newsletter">Newsletter</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Category</label>
                  <select
                    defaultValue={selectedEvent?.category || 'Technology'}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Date</label>
                  <input
                    type="date"
                    defaultValue={selectedEvent ? new Date(selectedEvent.scheduledFor).toISOString().split('T')[0] : ''}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Time</label>
                  <input
                    type="time"
                    defaultValue={selectedEvent ? new Date(selectedEvent.scheduledFor).toTimeString().slice(0, 5) : ''}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Priority</label>
                  <select
                    defaultValue={selectedEvent?.priority || 'medium'}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Status</label>
                  <select
                    defaultValue={selectedEvent?.status || 'draft'}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                  >
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">In Review</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Author</label>
                <input
                  type="text"
                  defaultValue={selectedEvent?.author || ''}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                  placeholder="Assign to author"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                <textarea
                  rows={3}
                  defaultValue={selectedEvent?.description || ''}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background resize-none"
                  placeholder="Brief description or notes"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => {
                    setShowEventModal(false);
                    setSelectedEvent(null);
                  }}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted"
                >
                  Cancel
                </button>
                {selectedEvent && (
                  <button
                    onClick={() => {
                      setEvents(events.filter(e => e.id !== selectedEvent.id));
                      setShowEventModal(false);
                      setSelectedEvent(null);
                    }}
                    className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
                  >
                    Delete
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowEventModal(false);
                    setSelectedEvent(null);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {selectedEvent ? 'Update' : 'Schedule'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ContentCalendarPage() {
  return (
    <AdminRoute>
      <ContentCalendarContent />
    </AdminRoute>
  );
}

