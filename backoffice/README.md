# Tapeya Backoffice

Skeleton theme: full packages + structure, minimal pages (auth + starter). Add your own routes and pages.

## Setup

```bash
npm install
npm start
```

- **Dev:** http://localhost:4200
- **Build:** `npm run build` → `dist/backoffice/`

## Add your app

1. Add routes in `src/app/app.routes.ts`.
2. Create pages under `src/app/pages/` and lazy-load them.
3. Update `src/app/layouts/full/vertical/sidebar/sidebar-data.ts` (or horizontal) for the menu.

All feature packages are installed (Material, ApexCharts, ngx-toastr, ngx-permissions, date-fns, angular-calendar, ngx-editor, ngx-dropzone, etc.).
