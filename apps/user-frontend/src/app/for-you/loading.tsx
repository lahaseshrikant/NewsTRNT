export default function ForYouLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 animate-pulse">
      {/* Header */}
      <div className="mb-8">
        <div className="h-8 w-40 bg-muted rounded-sm mb-3" />
        <div className="h-4 w-56 bg-muted rounded-sm" />
      </div>
      {/* List */}
      <div className="space-y-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-5 border-b border-border pb-6">
            <div className="flex-1 space-y-3">
              <div className="h-3 w-20 bg-muted rounded-sm" />
              <div className="h-6 w-full bg-muted rounded-sm" />
              <div className="h-4 w-5/6 bg-muted rounded-sm" />
              <div className="h-3 w-32 bg-muted rounded-sm" />
            </div>
            <div className="w-32 h-24 bg-muted rounded-sm flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
