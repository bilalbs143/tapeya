# Backoffice – Angular Template

- **angular-theme/** (root) – Full Modernize minisidebar theme. Use as reference or copy from it in the future (all demo pages, layouts, apps, tables, forms, charts).
- **backoffice/** – Skeleton setup: same npm packages and structure, minimal pages (auth + starter). Add your own routes and pages.

---

## 1. Theme and backoffice

| Location        | Purpose |
|----------------|--------|
| **angular-theme/** | Full minisidebar theme at project root. All demo pages, full deps. For future use or to copy pages/layouts from. |
| **backoffice/**    | Your app. Skeleton: full deps + structure, only auth + starter. Build your own routes and pages here. |

**Need the full demo app (tables, charts, apps)?** Copy structure or specific pages from **angular-theme/** into backoffice.

---

## 2. NPM packages (backoffice already has them)

Backoffice uses the full set: Material, CDK, @ng-matero/extensions, Tailwind v4, ngx-toastr, ngx-permissions, date-fns, apexcharts, ng-apexcharts, angular-calendar, ngx-editor, ngx-dropzone, ngx-pagination, angular-tabler-icons, ngx-scrollbar, translate, etc.

---

## 3. Template features (in angular-theme)

Use **angular-theme/** when you need to copy:

- **Layouts** – full (vertical/horizontal), blank, sidebar, header, breadcrumb, customizer
- **Authentication** – side/boxed login, register, forgot password, error, maintenance
- **Apps** – e-commerce, email, invoice, kanban, todo, calendar, tickets, notes, etc.
- **Tables** – basic, sortable, filterable, pagination, HTTP, etc.
- **Datatable** – kitchen sink with add/edit/dialog
- **Forms** – controls, layouts, validation
- **Charts** – ApexCharts (line, area, column, doughnut, etc.)
- **UI components** – badge, chips, dialog, list, menu, paginator, progress, tabs, tooltips
- **Theme pages** – account-setting, FAQ, pricing, treeview

---

## 4. Backoffice: add your app

1. Add routes in **backoffice/src/app/app.routes.ts**.
2. Create pages under **backoffice/src/app/pages/** and lazy-load them.
3. Update **backoffice/src/app/layouts/full/vertical/sidebar/sidebar-data.ts** (or horizontal) for the menu.

---

## 5. Summary

| What | Where |
|------|--------|
| **Full theme (reference)** | **angular-theme/** |
| **Your backoffice app** | **backoffice/** (skeleton: full deps, minimal pages) |
| **Copy full demo pages** | From **angular-theme/** into backoffice as needed |
