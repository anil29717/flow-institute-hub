export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <h1 className="text-2xl font-display font-bold text-foreground mb-2">{title}</h1>
        <p className="text-muted-foreground">This module is coming soon.</p>
      </div>
    </div>
  );
}
