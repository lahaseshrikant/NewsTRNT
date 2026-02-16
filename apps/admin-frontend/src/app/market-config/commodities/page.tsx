'use client';

import { useState, useEffect } from 'react';
import adminAuth from '@/lib/admin-auth';

interface CommodityConfig {
  id: string;
  symbol: string;
  name: string;
  category: string;
  unit: string;
  currency: string;
  isActive: boolean;
  sortOrder: number;
}

const CATEGORIES = ['Energy', 'Precious Metals', 'Industrial Metals', 'Agriculture', 'Livestock'];

export default function CommoditiesConfigPage() {
  const [commodities, setCommodities] = useState<CommodityConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<CommodityConfig>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('');

  useEffect(() => {
    fetchCommodities();
  }, []);

  const fetchCommodities = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/market-config/commodities?includeInactive=true', { headers: { ...adminAuth.getAuthHeaders() } });
      const data = await response.json();
      setCommodities(data.commodities || []);
    } catch (error) {
      console.error('Failed to fetch commodities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (id?: string) => {
    try {
      const url = id 
        ? `/api/admin/market-config/commodities/${id}` 
        : '/api/admin/market-config/commodities';
      
      const method = id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { ...adminAuth.getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchCommodities();
        setEditingId(null);
        setShowAddForm(false);
        setFormData({});
      }
    } catch (error) {
      console.error('Failed to save commodity:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this commodity?')) return;

    try {
      const response = await fetch(`/api/admin/market-config/commodities/${id}`, {
        method: 'DELETE',
        headers: { ...adminAuth.getAuthHeaders() }
      });

      if (response.ok) {
        await fetchCommodities();
      }
    } catch (error) {
      console.error('Failed to delete commodity:', error);
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/admin/market-config/commodities/${id}`, {
        method: 'PUT',
        headers: { ...adminAuth.getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });
      await fetchCommodities();
    } catch (error) {
      console.error('Failed to toggle active status:', error);
    }
  };

  const startEdit = (commodity: CommodityConfig) => {
    setEditingId(commodity.id);
    setFormData(commodity);
    setShowAddForm(false);
  };

  const startAdd = () => {
    setShowAddForm(true);
    setEditingId(null);
    setFormData({
      isActive: true,
      sortOrder: commodities.length + 1,
      currency: 'USD',
      category: 'Energy',
    });
  };

  const filteredCommodities = filterCategory
    ? commodities.filter(c => c.category === filterCategory)
    : commodities;

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Commodities Configuration</h1>
            <p className="mt-2 text-muted-foreground">Manage commodities tracked by the platform</p>
          </div>
          <button
            onClick={startAdd}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition"
          >
            + Add Commodity
          </button>
        </div>

        {/* Filter */}
        <div className="mb-4 flex gap-2 items-center">
          <label className="text-sm font-medium text-muted-foreground">Filter by Category:</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border border-border rounded px-3 py-1 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {filterCategory && (
            <button
              onClick={() => setFilterCategory('')}
              className="text-sm text-primary hover:text-primary/80"
            >
              Clear Filter
            </button>
          )}
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="bg-card rounded-lg shadow-md p-6 mb-6 border border-border">
            <h3 className="text-xl font-semibold mb-4">Add New Commodity</h3>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Symbol (e.g., GC, CL)"
                value={formData.symbol || ''}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                className="border border-border rounded px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground/80 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
              <input
                type="text"
                placeholder="Name (e.g., Gold, Crude Oil)"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border border-border rounded px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground/80 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
              <select
                value={formData.category || ''}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="border border-border rounded px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              >
                <option value="">Select Category</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Unit (e.g., barrel, oz, lb)"
                value={formData.unit || ''}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="border border-border rounded px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground/80 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
              <input
                type="text"
                placeholder="Currency (default: USD)"
                value={formData.currency || 'USD'}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value.toUpperCase() })}
                className="border border-border rounded px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground/80 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
              <input
                type="number"
                placeholder="Sort Order"
                value={formData.sortOrder || ''}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                className="border border-border rounded px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground/80 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
              <div className="flex items-center col-span-2">
                <label className="flex items-center text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={formData.isActive || false}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-foreground">Active (enable tracking)</span>
                </label>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => handleSave()}
                className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({});
                }}
                className="bg-muted text-foreground px-4 py-2 rounded hover:bg-muted/80"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Commodities Table */}
        <div className="bg-card rounded-lg shadow-md overflow-hidden border border-border">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/60">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Symbol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Unit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Currency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {filteredCommodities.map((commodity) => (
                <tr key={commodity.id} className={`${!commodity.isActive ? 'opacity-50' : ''} hover:bg-muted/60`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono font-bold text-primary">{commodity.symbol}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{commodity.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-accent text-accent-foreground">
                      {commodity.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{commodity.unit}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{commodity.currency}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{commodity.sortOrder}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleActive(commodity.id, commodity.isActive)}
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        commodity.isActive
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-rose-500/10 text-rose-500'
                      }`}
                    >
                      {commodity.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => startEdit(commodity)}
                      className="text-primary hover:text-primary/80 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(commodity.id)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCommodities.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            {filterCategory 
              ? `No commodities found in category "${filterCategory}"`
              : 'No commodities configured yet. Click "Add Commodity" to get started.'}
          </div>
        )}
      </div>
    </div>
  );
}

