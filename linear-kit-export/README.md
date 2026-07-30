# Linear Kit — portable export

Foundation, Class Detail, Drafts, and Settings, plus every file they depend on,
copied out of `linear-astryx` so they can be dropped into another Next.js +
Astryx project.

## What's in here

```
components/patterns/
  foundation/          the app shell: FoundationLayout, CanvasHeader, LinearSidebar,
                        ViewTab(s), mixed-content/*, side-content/*, sidebar/*
  client-templates/    class-detail/, drafts/, settings/, shared/ — the four
                        page templates and the small pieces they share
                        (EmptyStateCard, OutlinedPanel, PropertyChip, RowClickCell,
                        ClassContentPage)
  grouped-table/       GroupedTable / NestedGroupedTable — used by Class Detail's
                        Students/Invoices sections and Drafts' full-width pages
  shared/              IconButton, Dropdown, render-nav-sections.tsx (Settings'
                        sidebar renderer)
data/mocks/            sample data each page renders (class-detail.ts, drafts.ts,
                        settings-nav.ts, nested-projects.ts, grouped-issues.ts) —
                        replace with real data, keep or adjust the shapes
theme/
  linearTokens.ts       raw Linear color/radius/shadow values
  linearTheme.ts        the actual Astryx theme (defineTheme) that reskins
                        Astryx's real components (Card, Grid, Badge, SideNav-family,
                        Button, …) to look like Linear — this is what makes Drafts'
                        and Settings' Astryx-native components match Foundation's
                        hand-built ones
lib/patterns/types.ts  PatternNavSection/PatternNavItem (Settings' nav data shape),
                        plus a few other shared types (IssueRow, etc.) some of the
                        mock data extends
```

Left out on purpose: `FoundationDemo.tsx` and `GroupedTableDemo.tsx` — gallery-only
preview wrappers that pull in this repo's pattern-gallery chrome, not part of the
actual components.

## What you bring over

Everything above is copied **preserving its relative path**. Copy the four top-level
folders (`components/`, `data/`, `theme/`, `lib/`) into your project's root,
merging with what's already there. All internal imports use the `@/…` alias
resolving to the project root — confirm your `tsconfig.json` has:

```json
{
  "compilerOptions": {
    "paths": { "@/*": ["./*"] }
  }
}
```

## Setup in the destination project

1. **Install packages**: `@astryxdesign/core`, `@astryxdesign/theme-neutral`, `lucide-react`
   (versions used here: core/theme-neutral `^0.1.8`, lucide-react `^1.27.0`).

2. **Load Inter and wrap the app in the theme.** In your root layout:

   ```tsx
   import { Inter } from "next/font/google";
   import { Theme } from "@astryxdesign/core/theme";
   import { linearTheme } from "@/theme/linearTheme";

   const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

   export default function RootLayout({ children }: { children: React.ReactNode }) {
     return (
       <html lang="en" className={inter.variable} data-theme="dark">
         <body>
           <Theme theme={linearTheme} mode="dark">{children}</Theme>
         </body>
       </html>
     );
   }
   ```

   `app/providers.tsx` in the source repo also wires up a light/dark toggle
   (`useState` + `data-theme` on `<html>`) and `LinkProvider` for Next's `<Link>` —
   worth copying that pattern too if you want the same toggle, but not required
   for the components to render.

3. **Render a page**, e.g.:

   ```tsx
   import { ClassDetailDemo } from "@/components/patterns/client-templates/class-detail";

   export default function Page() {
     return <ClassDetailDemo />;
   }
   ```

   Same for `DraftsDemo` (`.../client-templates/drafts`) and `SettingsDemo`
   (`.../client-templates/settings`) — each is a fully self-contained page
   (its own `FoundationLayout` + sidebar + mock data). `FoundationLayout` +
   `LinearSidebar` on their own are the reusable shell if you're building a new
   page rather than using one of the three demos as-is.

## Wiring in real data

Every page currently renders from `data/mocks/*.ts`. To wire up real data, replace
the `sample*` arrays/objects those files export with your own data of the same
shape (or change the shape and follow the type errors through the component that
consumes it — each page component takes the data as props, e.g. `ClassDetailPage`,
`StudentsPage`, `InvoicesPage`).
