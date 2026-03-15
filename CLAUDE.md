# connect.dance

West Coast Swing event discovery platform at https://connect.dance

## Tech Stack

- Vite + React 19 + TypeScript
- shadcn/ui (radix-maia style) + Tailwind CSS v4
- Font: Figtree Variable
- Icons: Hugeicons

## Design Context

### Users

Two primary audiences with distinct needs:

1. **Dancers** — Active WCS dancers (beginner through advanced) looking for socials, workshops, conventions, and competitions. They visit when planning their weekend, traveling to a new city, or looking for their next event. Speed and scannability matter — they want to find what's happening, where, and when.

2. **Organizers** — Event hosts who list and promote their events. They need clear paths to create listings, track interest, and reach dancers. The platform's value to them is audience reach and professional presentation.

### Brand Personality

**Elegant · Refined · Sophisticated**

connect.dance reflects the artistry of West Coast Swing itself — smooth, intentional, and understated. The interface should feel like the dance: confident without being flashy, precise without being rigid. Think the quiet confidence of a great lead, not the spectacle of a competition routine.

### Aesthetic Direction

- **Visual tone**: Clean canvas with curated color pops — minimalistic and elegant, not tinted or themed. The base is nearly white/neutral, and personality comes from intentional accent colors. Think gallery: clean walls, distinctive art.
- **Reference**: Strava for dancers — community-first, activity-oriented, social features that build connection. Clean data presentation, personal dashboards, and a sense of belonging.
- **Anti-references**: Generic event marketplaces (Eventbrite corporate feel), overly playful/cartoonish UIs, anything that looks like a Facebook group. No neon, no gratuitous gradients. Also avoid: everything tinted one hue (warm gold wash, cool blue wash), boring corporate gray-on-gray.
- **Theme**: Both light and dark mode supported; light mode as primary.
- **Feeling**: Welcoming community home. Dancers should feel safe here — a contrast to the toxicity of Instagram and Facebook. This is just for dancers and the love of dance.

### Design Principles

1. **Scannable first** — Dancers make quick decisions. Event information (date, location, type, price) must be instantly graspable without reading paragraphs. Prioritize visual hierarchy and information density over white space.

2. **Community over commerce** — The platform exists to connect people, not sell tickets. Design should foreground who's going, who's organizing, and the social fabric of the scene. Transactional elements (pricing, registration) are present but secondary.

3. **Quiet confidence** — Sophistication through restraint. No unnecessary decoration, no competing visual elements. Let typography, spacing, and a refined palette do the work. Every element earns its place.

4. **Two-sided clarity** — Dancers and organizers have different goals. Navigation, CTAs, and information architecture should make both paths obvious without cluttering either experience.

5. **Accessible by default** — WCAG AA compliance. Good contrast ratios, keyboard navigable, screen reader friendly. No information conveyed by color alone.

### Color Direction

Clean neutral canvas with curated accent pops:

- **Base**: Near-white, barely cool neutrals (hue ~250 in oklch, very low chroma). Clean like good paper — not tinted warm or cold.
- **Primary**: `#5A9CB5` — a calm blue-teal for trust, buttons, and navigation. Conventions use this as their type color.
- **Accent palette** — four curated pops, each mapped to an event type:
  - `#5A9CB5` (blue-teal) → Conventions — trustworthy, premium
  - `#FACE68` (yellow) → Workshops — bright, learning energy
  - `#FAAC68` (orange) → Intensives — focused heat
  - `#FA6868` (red/coral) → Competitions — fire, excitement
  - Social Dances use neutral gray — the everyday, quiet backdrop
- **Neutrals**: Custom slate scale (slate-50 through slate-900) with minimal chroma, very slightly cool.
- **Avoid**: Tinting the entire UI one hue, pure black, neon/high-saturation colors, gratuitous gradients.
