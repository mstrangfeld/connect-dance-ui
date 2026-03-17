export function Footer() {
  return (
    <footer className="border-t border-border/50 pb-16 md:pb-0">
      <div className="mx-auto max-w-6xl px-6 py-4 flex flex-col items-center gap-3 text-[13px] text-muted-foreground md:flex-row md:justify-between md:gap-6">
        <div className="flex flex-wrap justify-center gap-6">
          <a href="#" className="transition-colors hover:text-foreground">About</a>
          <a href="#" className="transition-colors hover:text-foreground">Contact</a>
          <a href="#" className="transition-colors hover:text-foreground">Impressum</a>
          <a href="#" className="transition-colors hover:text-foreground">Privacy</a>
        </div>
        <p>&copy; 2026 connect.dance</p>
      </div>
    </footer>
  )
}
