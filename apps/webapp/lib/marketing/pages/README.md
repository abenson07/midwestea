# Page content modules

Each migrated page stores its section list and verbatim Webflow props in a dedicated module under `lib/pages/`.

## Convention

- **File name:** `<slug>-content.ts` (match the Webflow HTML filename without `.html`)
- **Export:** a `sections` array typed with `as const` on each section
- **Registration:** import the export in [`lib/site-config.ts`](../site-config.ts) and assign it to the page's `sections` field

## Reference implementation

See [`basic-life-support-content.ts`](./basic-life-support-content.ts) — the first fully migrated page.

```typescript
// lib/pages/basic-life-support-content.ts
export const basicLifeSupportSections = [
  {
    type: "component" as const,
    component: "Product Header 6" as const,
    props: {
      heading: "Basic Life Support",
      // ... verbatim copy from docs/migration/basic-life-support.md
    },
  },
  // ...
];
```

```typescript
// lib/site-config.ts
import { basicLifeSupportSections } from "@/lib/pages/basic-life-support-content";

{
  title: "Basic Life Support",
  route: "/basic-life-support",
  sections: basicLifeSupportSections,
},
```

## Rules

1. Copy text, links, and image paths from the migration doc — do not invent content.
2. Use `/images/...` and `/videos/...` for local assets in `public/`.
3. Keep `site-config.ts` thin: route metadata + section imports only, no large inline prop blobs.
4. `PageRenderer` spreads `section.props` onto the registered Relume component; components merge with their `*Defaults`.

## Type safety

`props` is typed as `Record<string, unknown>` at the config layer. Each Relume component exports its own props type (e.g. `Layout520Props`). Optional stricter typing can be added per page if needed.
