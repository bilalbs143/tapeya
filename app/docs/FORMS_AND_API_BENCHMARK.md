# Forms & API integration benchmark

This document describes the patterns used in the **auth flow** (Login, Register, OTP). Use them as the reference for future forms and API integration across the app.

---

## 1. API layer (RTK Query)

- **Location**: `src/store/api/` — one file per domain (e.g. `authApi.js`).
- **Base**: All APIs inject into `baseApi`; `baseUrl` and `Authorization` are set in `baseApi`.
- **Endpoints**: Use `builder.mutation` for POST/PATCH/DELETE and `builder.query` for GET. Set `invalidatesTags` / `providesTags` for cache behaviour.
- **Response shape**: Backend returns success as `{ data?, message?, type }` and errors as `{ message?, type?, errors? }`. Do not assume a global `transformResponse`; read `result.data` (or `result?.data ?? result`) after `.unwrap()` where needed.

**Example (auth):**

```js
verifyOtp: builder.mutation({
  query: (body) => ({
    url: '/auth/verify-otp',
    method: 'POST',
    body: { phone: body.phone, code: body.code },
  }),
  invalidatesTags: ['Auth', 'User'],
}),
```

---

## 2. Validation (Zod)

- **Location**: `src/lib/validations/` — one file per domain (e.g. `auth.js`).
- **Usage**: Export schemas and use with `@hookform/resolvers/zod` and `resolver: zodResolver(schema)` in `useForm`.
- **Alignment**: Validation rules must match backend (e.g. optional vs required, regex, max length). Keep shared rules in reusable schemas (e.g. `phoneSchema`, `emailSchema`).

**Example:**

```js
export const registerSchema = z.object({
  phone: phoneSchema,
  name: nameSchema,
  email: emailSchema.optional(), // backend: nullable
});
```

---

## 3. Form handling (React Hook Form)

- **Library**: `react-hook-form` + `@hookform/resolvers/zod`.
- **Config**: `defaultValues`, `mode: 'onChange'` (or `'onSubmit'` for OTP-style forms), `resolver: zodResolver(schema)`.
- **Fields**: Use `register('fieldName')` for simple inputs; use `Controller` for custom components (e.g. `PhoneInput`) so `value`/`onChange` are controlled.
- **Submit**: Always use `handleSubmit(onSubmit)`. In `onSubmit`, only validated data is passed; call the mutation and `.unwrap()` for success/error handling.

**Example:**

```jsx
const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
  resolver: zodResolver(loginSchema),
  defaultValues: { phone: '+92' },
  mode: 'onChange',
});

const onSubmit = async (data) => {
  try {
    const result = await requestOtp({ phone: data.phone }).unwrap();
    // navigate / update state from result
  } catch (err) {
    // error handled by mutation `error` or local state
  }
};

<form onSubmit={handleSubmit(onSubmit)}>
```

---

## 4. Error handling

### 4.1 API error message (server / network)

- **Helper**: `getApiErrorMessage(error, fallback)` from `@/lib/apiErrors`.
- **Behaviour**: Reads `error.data.message`, then `error.error`, then `error.message`; returns a string for UI. Use a clear fallback per screen (e.g. “Could not send OTP. Please try again.”).
- **Where**: Use for RTK Query mutation `error` (and for any local `catch` that stores the mutation error).

**Example:**

```jsx
import { getApiErrorMessage } from '@/lib/apiErrors';

{
  error && (
    <p className="..." role="alert">
      {getApiErrorMessage(error, 'Could not send OTP. Please try again.')}
    </p>
  );
}
```

### 4.2 Validation errors (client-side)

- **Source**: `formState.errors` from React Hook Form; messages come from Zod schema.
- **Display**: Per-field, e.g. `errors.phone?.message` passed to the input/field component. Optionally a single summary block for `errors.root` or key errors.

### 4.3 Clearing server error on retry

- **Mutation error**: Call `reset()` from the mutation hook (e.g. on form `onFocus`) so the banner clears when the user edits the form and tries again.
- **Local server error**: For flows that use local state (e.g. OTP), set that state to `null` at the start of submit.

---

## 5. Loading and disabled state

- **Derive busy**: `const busy = isLoading || isSubmitting` (mutation loading + RHF submitting).
- **Submit button**: `disabled={busy}` and label like `busy ? 'Signing in...' : 'Login'` so the user cannot double-submit and sees clear feedback.

---

## 6. Success flow (auth example)

1. **Login**: `requestOtp(phone)` → success → `navigate('/otp', { state: { phone, otp } })`.
2. **Register**: `register({ name, phone, email })` → success → same `navigate('/otp', { state: { phone, otp } })`.
3. **OTP**: `verifyOtp({ phone, code })` → success → read `result.data` for `user` and `auth.access_token` → `dispatch(setCredentials({ user, accessToken }))` → `navigate('/home')`.

Phone for verify must be the same value passed to the previous step (e.g. from `location.state`); do not re-format for the request if the backend normalizes it.

---

## 7. Checklist for new forms

- [ ] Zod schema in `src/lib/validations/` aligned with backend rules.
- [ ] RTK Query endpoint in the right API slice; correct URL and body.
- [ ] `useForm` with `zodResolver(schema)`, `defaultValues`, and appropriate `mode`.
- [ ] Server errors shown via `getApiErrorMessage(error, fallback)` and `role="alert"`.
- [ ] Validation errors shown per field from `formState.errors`.
- [ ] Submit button disabled when `isLoading || isSubmitting`; loading label on button.
- [ ] Mutation `reset()` (or equivalent) so server error clears when user tries again.
- [ ] Success path: update Redux/state and navigate or show success feedback.

Auth pages (Login, Register, Otp) are the reference implementation for these patterns.
