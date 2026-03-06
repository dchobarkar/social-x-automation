# Icons (Lucide React)

This project uses **[Lucide React](https://lucide.dev)** for icons. Lucide provides outline-style icons with consistent stroke width, matching the brand guide.

## Installation

Already installed as a dependency:

```bash
pnpm add lucide-react
```

## Usage

Import only the icons you need (tree-shaking friendly):

```tsx
import { Reply, Trash2, ExternalLink, Sparkles } from "lucide-react";

<Reply className="w-4 h-4" />
<Trash2 className="w-4 h-4" />
<ExternalLink className="w-3.5 h-3.5" />
<Sparkles className="w-8 h-8 text-primary" />
```

Use `className` for size and color (e.g. `w-4 h-4`, `text-primary`, `text-muted`). Add `aria-hidden` when the icon is decorative.

## Brand-recommended icons (brand-theme.md)

| Icon              | Use case             |
| ----------------- | -------------------- |
| **Bot**           | Automation / AI      |
| **MessageCircle** | Replies, chat        |
| **Send**          | Post / submit        |
| **Sparkles**      | AI / magic           |
| **Clock**         | Time, schedule       |
| **Trash2**        | Delete               |
| **Check**         | Success, done        |
| **Reply**         | Reply to tweet       |
| **ExternalLink**  | Open in X / external |

Browse all icons: [lucide.dev/icons](https://lucide.dev/icons)
