# Backoffice – Angular Template

**backoffice/** uses the Modernize minisidebar stack (Material, Tailwind v4, full deps) with a skeleton of auth + starter pages. Add your own routes and pages here.

---

## 1. NPM packages

Backoffice uses the full set: Material, CDK, @ng-matero/extensions, Tailwind v4, ngx-toastr, ngx-permissions, date-fns, apexcharts, ng-apexcharts, angular-calendar, ngx-editor, ngx-dropzone, ngx-pagination, angular-tabler-icons, ngx-scrollbar, translate, etc.

---

## 2. Backoffice: add your app

1. Add routes in **backoffice/src/app/app.routes.ts**.
2. Create pages under **backoffice/src/app/pages/** and lazy-load them.
3. Update **backoffice/src/app/layouts/full/vertical/sidebar/sidebar-data.ts** (or horizontal) for the menu.
