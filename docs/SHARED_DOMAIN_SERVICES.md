# Shared rules and a single write path (user + admin)

**What this is about:** avoiding **duplicated rules** when the same action exists on **user** and **admin** routes. That is mostly **authorization**, **input validation**, and **domain rules** (what states are allowed), **plus** doing **one** set of DB writes / side-effects so those rules are not re-implemented in two controllers.

**What “business logic” meant before:** in §12 / older wording, that phrase lumped together **domain rules + persistence + side-effects**. This doc spells those pieces out so “rules / validation” is the headline.

**Scope:** Laravel API (`api/`). Apply **per use case**; no repo-wide rewrite. Complements **`BROADCASTER_ROLE.md` §12**.

---

## Admin permission slugs (Spatie, backoffice)

| What | Where |
|------|--------|
| **Canonical list** | **`api/database/seeders/PermissionSeeder.php`** — `firstOrCreate` for each admin-guard permission slug, then **`givePermissionTo`** the **same bundle** to **`AdminRoleEnum::BROADCASTER`** and **`AdminRoleEnum::SUPER_ADMIN`** when those roles exist. |
| **Readable mirror** | **`BROADCASTER_ROLE.md` §8** — keep the slug list aligned with the seeder. |
| **HTTP (today)** | Most admin routes use **`admin.only`** only; attach **`admin.permission:{slug}`** when you want slug-level gates to match the seeder. |

Do not maintain a third copy of the slug list in prose elsewhere; link or repeat §8 / the seeder only.

---

## Three rule layers (all must stay in sync across entry points)

| Layer | Examples | Single source |
|-------|----------|----------------|
| **1. Who** | Super admin vs organizer vs broadcaster | **Policy** / `Gate` |
| **2. Input** | Required fields, formats, enums | Shared **`FormRequest`**, static **`rules()`**, or **DTO** |
| **3. Domain** | “Tournament locked”, roster full, wrong status | **Service** (assertions / guards before write) |

Layer **2** is what people usually call **validation**. Layer **3** is still **rule enforcement**—it is not HTTP field rules, but it answers “is this action allowed *given current state*?”. Both **2** and **3** must not diverge between admin and user.

**Persistence** (Eloquent updates, transactions) lives with layer **3** so you do not copy the same writes in two places.

---

## 1. Decide the use case boundary

- Name one **command** (e.g. *attach team to tournament*).
- If two routes would repeat the **same** policy checks, **same** input rules, **same** domain checks, or **same** writes → follow the steps below. If behaviour must differ by channel, document *why* and still deduplicate the common slice.

---

## 2. Layer 1 — Authorization (one story)

1. One **Policy** / gate for “who may act on this aggregate”.
2. **`authorize(...)`** (or `Gate::forUser($user)->authorize(...)`) in **every** controller and job **before** the service.
3. Do not re-check “admin vs app user” **inside** the service for HTTP; the service may take `User $actor` only for **audit**, not role logic.

---

## 3. Layer 2 — Input validation (one story)

1. One definition of **request rules** for that payload (shared static `rules()`, shared `FormRequest`, or DTO built from both requests).
2. **Admin** and **user** handlers both use it so field-level validation cannot drift.

---

## 4. Layer 3 + writes — Service (one story)

1. **Namespace:** **`App\Services\…`**, **`App\Services\Tournament\…`** (see existing services). **`App\Domain\…`** only if the team explicitly adopts it.
2. **Domain rules** live here: invariants, state checks, “cannot attach when …” — same code path whether the caller was admin or user HTTP.
3. **Writes, transactions, events, notifications, cache bust** — here too, so every entry point triggers identical behaviour.
4. **No** `Request` inside the service; pass scalars / models / DTOs.

---

## 5. Wire HTTP (and jobs)

Admin and user: **middleware → authorize → validate (layer 2) → service (layer 3 + writes)** → response. Jobs: resolve actor, authorize if applicable, then **same** service method.

---

## 6. Consolidate entry points (when safe)

Prefer **one** handler per verb where product allows. If two URLs remain, both call the **identical** service method.

---

## 7. Tests (minimal)

- **Service:** domain rules + failure modes **once**.
- **Feature:** policy + route for each distinct actor you care about; trim tests that only duplicated controller rule checks.

---

## 8. Anti-patterns

| Anti-pattern | Instead |
|--------------|--------|
| Different `rules()` on admin vs user for the same body | Shared rules / DTO |
| Domain checks only in one controller | Service used by both |
| Policy duplicated as `if ($user->isAdmin())` in two places | One policy |
| Rules only in the front-end | Layers 2 and 3 on the server |

---

## 9. Checklist (per feature)

- [ ] **Policy** (layer 1) covers all actors.
- [ ] **Input validation** (layer 2) defined once.
- [ ] **Domain rules + writes + side-effects** (layer 3) in one service.
- [ ] Every HTTP/job path uses the same stack after `authorize`.
- [ ] Tests cover service rules + representative HTTP auth paths.

---

## 10. Order of operations

1. Name the command → 2. Policy → 3. Shared input validation → 4. Service (domain rules + transaction + writes + side-effects) → 5. Thin controllers / jobs → 6. Merge duplicate routes when possible → 7. Tests, remove duplication.
