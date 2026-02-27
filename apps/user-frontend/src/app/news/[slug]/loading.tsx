export default function ArticleLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 animate-pulse">
      {/* Category badge */}
      <div className="h-5 w-24 bg-muted rounded-sm mb-4" />
      {/* Headline */}
      <div className="h-10 bg-muted rounded-sm mb-3 w-5/6" />
      <div className="h-10 bg-muted rounded-sm mb-6 w-3/4" />
      {/* Byline */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-muted rounded-full" />
        <div className="space-y-2">
          <div className="h-4 w-32 bg-muted rounded-sm" />
          <div className="h-3 w-48 bg-muted rounded-sm" />
        </div>
      </div>
      {/* Hero image */}
      <div className="w-full aspect-[16/9] bg-muted rounded-sm mb-8" />
      {/* Body */}
      <div className="space-y-4">
        <div className="h-4 bg-muted rounded-sm w-full" />
        <div className="h-4 bg-muted rounded-sm w-11/12" />
        <div className="h-4 bg-muted rounded-sm w-full" />
        <div className="h-4 bg-muted rounded-sm w-4/5" />
        <div className="h-4 bg-muted rounded-sm w-full" />
        <div className="h-4 bg-muted rounded-sm w-3/4" />
      </div>
    </div>
  );
}
