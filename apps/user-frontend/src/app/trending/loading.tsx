export default function TrendingLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 animate-pulse">
      {/* Header */}
      <div className="mb-8">
        <div className="h-8 w-48 bg-muted rounded-sm mb-3" />
        <div className="h-4 w-72 bg-muted rounded-sm" />
      </div>
      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border border-border rounded-sm overflow-hidden">
            <div className="w-full aspect-[16/10] bg-muted" />
            <div className="p-5 space-y-3">
              <div className="h-3 w-20 bg-muted rounded-sm" />
              <div className="h-5 w-full bg-muted rounded-sm" />
              <div className="h-5 w-4/5 bg-muted rounded-sm" />
              <div className="h-3 w-32 bg-muted rounded-sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
