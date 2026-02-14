'use client';

import { useState, useEffect } from 'react';

interface CurrencyPairConfig {
  id: string;
  pair: string;
  name: string;
  base: string;
  quote: string;
  type: string;
  isActive: boolean;
  sortOrder: number;
}

const PAIR_TYPES = ['major', 'cross', 'emerging'];

const TYPE_BADGE_STYLES: Record<string, string> = {
  major: 'bg-primary/10 text-primary',
  cross: 'bg-amber-500/10 text-amber-500',
  emerging: 'bg-purple-500/10 text-purple-500',
};

export default function CurrencyPairsConfigPage() {
  const [pairs, setPairs] = useState<CurrencyPairConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<CurrencyPairConfig>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterType, setFilterType] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchPairs();
  }, []);

  const fetchPairs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/market-config/currencies?includeInactive=true');
      const data = await response.json();
      setPairs(data.pairs || []);
    } catch (error) {
      console.error('Failed to fetch currency pairs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (id?: string) => {
    if (!formData.base || !formData.quote || !formData.name) {
      setFormError('Base, Quote, and Name are required.');
      return;
    }

    try {
      setSaving(true);
      setFormError(null);

      const url = id 
        ? `/api/admin/market-config/currencies/${id}` 
        : '/api/admin/market-config/currencies';
      
      const method = id ? 'PUT' : 'POST';
      
      const base = formData.base.toUpperCase().trim();
      const quote = formData.quote.toUpperCase().trim();
      const pair = `${base}/${quote}`;

      const pairData = {
        pair,
        base,
        quote,
        name: formData.name.trim(),
        type: formData.type || 'major',
        isActive: formData.isActive ?? true,
        sortOrder:
          formData.sortOrder !== undefined && formData.sortOrder !== null && !Number.isNaN(Number(formData.sortOrder))
            ? Number(formData.sortOrder)
            : undefined,
      };
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pairData),
      });

      if (response.ok) {
        await fetchPairs();
        setEditingId(null);
        setShowAddForm(false);
        setFormData({});
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error || 'Failed to save currency pair.');
      }
    } catch (error) {
      console.error('Failed to save currency pair:', error);
      setFormError(error instanceof Error ? error.message : 'Failed to save currency pair.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this currency pair?')) return;

    try {
      const response = await fetch(`/api/admin/market-config/currencies/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchPairs();
      }
    } catch (error) {
      console.error('Failed to delete currency pair:', error);
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/admin/market-config/currencies/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });
      await fetchPairs();
    } catch (error) {
      console.error('Failed to toggle active status:', error);
    }
  };

  const startEdit = (pair: CurrencyPairConfig) => {
    setEditingId(pair.id);
    setFormData(pair);
    setShowAddForm(false);
    setFormError(null);
  };

  const startAdd = () => {
    setShowAddForm(true);
    setEditingId(null);
    setFormData({
      isActive: true,
      sortOrder: pairs.length + 1,
      type: 'major',
    });
    setFormError(null);
  };

  const cancelForm = () => {
    setShowAddForm(false);
    setEditingId(null);
    setFormData({});
    setFormError(null);
  };

  const isEditing = Boolean(editingId);
  const isFormVisible = showAddForm || isEditing;

  const filteredPairs = filterType
    ? pairs.filter(p => p.type === filterType)
    : pairs;

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
            <h1 className="text-3xl font-bold">Currency Pairs Configuration</h1>
            <p className="mt-2 text-muted-foreground">Manage currency pairs tracked by the platform</p>
          </div>
          <button
            onClick={startAdd}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition"
          >
            + Add Currency Pair
          </button>
        </div>

        {/* Filter */}
        <div className="mb-4 flex gap-2 items-center">
          <label className="text-sm font-medium text-muted-foreground">Filter by Type:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-border rounded px-3 py-1 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          >
            <option value="">All Types</option>
            {PAIR_TYPES.map(type => (
              <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
            ))}
          </select>
          {filterType && (
            <button
              onClick={() => setFilterType('')}
              className="text-sm text-primary hover:text-primary/80"
            >
              Clear Filter
            </button>
          )}
        </div>

        {/* Add Form */}
        {isFormVisible && (
          <div className="bg-card rounded-lg shadow-md p-6 mb-6 border border-border">
            <h3 className="text-xl font-semibold mb-4">{isEditing ? 'Edit Currency Pair' : 'Add New Currency Pair'}</h3>
            {formError && (
              <div className="mb-4 rounded border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {formError}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Base Currency (e.g., EUR)"
                value={formData.base || ''}
                onChange={(e) => setFormData({ ...formData, base: e.target.value.toUpperCase() })}
                className="border border-border rounded px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground/80 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                required
              />
              <input
                type="text"
                placeholder="Quote Currency (e.g., USD)"
                value={formData.quote || ''}
                onChange={(e) => setFormData({ ...formData, quote: e.target.value.toUpperCase() })}
                className="border border-border rounded px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground/80 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                required
              />
              <input
                type="text"
                placeholder="Pair (auto-generated)"
                value={formData.base && formData.quote ? `${formData.base.toUpperCase()}/${formData.quote.toUpperCase()}` : ''}
                disabled
                className="border border-border rounded px-3 py-2 bg-muted/60 text-muted-foreground"
              />
              <input
                type="text"
                placeholder="Name (e.g., Euro vs US Dollar)"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border border-border rounded px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground/80 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                required
              />
              <select
                value={formData.type || ''}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="border border-border rounded px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              >
                <option value="">Select Type</option>
                {PAIR_TYPES.map(type => (
                  <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                ))}
              </select>
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
                onClick={() => handleSave(editingId || undefined)}
                disabled={saving}
                className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button
                onClick={cancelForm}
                className="bg-slate-600 text-white px-4 py-2 rounded hover:bg-slate-500 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Currency Pairs Table */}
        <div className="bg-card rounded-lg shadow-md overflow-hidden border border-border">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/60">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Pair</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Base</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Quote</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {filteredPairs.map((pair) => (
                <tr key={pair.id} className={`${!pair.isActive ? 'opacity-50' : ''} hover:bg-muted/60`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono font-bold text-primary">{pair.pair}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{pair.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">{pair.base}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">{pair.quote}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        TYPE_BADGE_STYLES[pair.type] ?? 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      {pair.type.charAt(0).toUpperCase() + pair.type.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{pair.sortOrder}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleActive(pair.id, pair.isActive)}
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        pair.isActive
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-rose-500/10 text-rose-500'
                      }`}
                    >
                      {pair.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => startEdit(pair)}
                      className="text-primary hover:text-primary/80 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(pair.id)}
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

        {filteredPairs.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            {filterType 
              ? `No currency pairs found of type "${filterType}"`
              : 'No currency pairs configured yet. Click "Add Currency Pair" to get started.'}
          </div>
        )}
      </div>
    </div>
  );
}
