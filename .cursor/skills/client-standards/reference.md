# client standards — reference

## Source split (remember)

| Need | Open |
|---|---|
| How it should look / feel | `tapeya-ui/src/screens/*`, `tapeya-ui/src/components/*`, `DESIGN_SYSTEM.md` |
| How data / auth / API works | `app/src/store/api/*`, `app/src/lib/validations/*`, `api/routes`, controllers |
| What ships | `client/` only |

**Do not** use `app/src/pages/*` or `app` CSS as a UI template.

## Breakpoint map (from tapeya-ui)

| Width | Token | Shell behaviour |
|---|---|---|
| &lt; 640 | default / phone | BottomNav |
| 640–899 | `sm:` | SideNav icon rail appears; still phone-density dialogs until `tab` |
| 900–1199 | `tab:` | Overlay sheet→card; content chrome |
| 1200–1439 | `desk:` | Right rail column |
| ≥ 1440 | `wide:` | SideNav labels expand |

## Import patterns

```ts
// Features / pages
import { Button, Input, Tabs, EmptyState } from '@/shared/ui';
import { HomeGlyph } from '@/shared/ui/icons';
import { toast } from '@/shared/ui/toast';

// Inside shared/ui/* — prefer subpath to avoid barrel cycles
import { cn } from '@/shared/lib/cn';
import { FieldLabel } from '@/shared/ui/Field';
```

## exactOptionalPropertyTypes

```ts
// ✅ Call sites like error={errors.name} (string | undefined) typecheck
error?: string | undefined;

// ❌ Rejects error={errors.name} under exactOptionalPropertyTypes
error?: string;
```

## AuthShell contract

```tsx
<AuthShell
  back={{ to } | { onClick }}
  title="…"
  description="…"
  action={<Button type="submit" form="…">Continue</Button>}
  footer={<AuthSwitch … />}
>
  <form id="…">…</form>
</AuthShell>
```

Primary CTA lives in `action`, not buried only inside children (except when the form owns submit via `form=` id).

## Primitive port checklist

When copying from `tapeya-ui/src/components/ui/X.jsx`:

1. Convert to `.tsx` with typed props
2. Replace `@/lib/cn` → `@/shared/lib/cn`
3. Replace icon imports with `@/shared/ui/icons`
4. Use `cva` if there are variants
5. Export from `shared/ui/index.ts`
6. Run typecheck + existing tests
