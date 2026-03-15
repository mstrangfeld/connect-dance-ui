export function Footer() {
  return (
    <footer className="border-t border-border/50">
      <div className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between text-[13px] text-muted-foreground">
        <p>&copy; 2026 connect.dance</p>
        <div className="flex gap-6">
          <a href="#" className="transition-colors hover:text-foreground">About</a>
          <a href="#" className="transition-colors hover:text-foreground">Contact</a>
          <a href="#" className="transition-colors hover:text-foreground">Impressum</a>
          <a href="#" className="transition-colors hover:text-foreground">Privacy</a>
        </div>
      </div>
    </footer>
  )
}
