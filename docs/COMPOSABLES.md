# Composables API Reference

All composables are auto-imported.

---

## useAuthSession

Authentication state and actions.

**Returns:**

| Property             | Type                                 | Description                                                 |
| -------------------- | ------------------------------------ | ----------------------------------------------------------- |
| `session`            | `Ref<AuthSession \| null>`           | Current session (token, userName, userId, email, expiresAt) |
| `isAuthenticated`    | `ComputedRef<boolean>`               | True if valid session                                       |
| `isCheckingSession`  | `ComputedRef<boolean>`               | True while checking session                                 |
| `login`              | `(email, password) => Promise<void>` | Login via API                                               |
| `loginDemo`          | `(userName: string) => void`         | Demo mode (no backend)                                      |
| `logout`             | `() => Promise<void>`                | Logout, clear session                                       |
| `refreshAccessToken` | `() => Promise<boolean>`             | Refresh token                                               |
| `checkSession`       | `() => Promise<boolean>`             | Check session via `/auth/me`                                |

**API base:** `runtimeConfig.public.apiBase` or `/api`

---

## useApi

HTTP client with auth retry on 401.

```ts
useApi<T>(method, url, options?) → { data, error, isLoading, execute }
```

| Param     | Type                                              | Description                              |
| --------- | ------------------------------------------------- | ---------------------------------------- |
| `method`  | `'GET' \| 'POST' \| 'PUT' \| 'DELETE' \| 'PATCH'` | HTTP method                              |
| `url`     | `string \| () => string`                          | Path or full URL (relative uses apiBase) |
| `options` | `{ body?, headers?, skipAuth? }`                  | Optional                                 |

**Returns:** `{ data, error, isLoading, execute }` — all reactive. Call `execute()` to run.

**Behavior:** On 401, tries `refreshAccessToken`, retries request, or redirects to `/login`.

---

## useApiLazy

Same as `useApi` but calls `execute()` on `onMounted`.

---

## useToast

Toast notifications.

**Returns:**

| Property      | Type                | Description           |
| ------------- | ------------------- | --------------------- |
| `toasts`      | `Ref<ToastItem[]>`  | Current toasts        |
| `addToast`    | `(input) => string` | Add toast, returns id |
| `removeToast` | `(id) => void`      | Remove by id          |

**addToast input:**

| Field         | Type                                          | Default  | Description                |
| ------------- | --------------------------------------------- | -------- | -------------------------- |
| `title`       | `string`                                      | —        | Required                   |
| `description` | `string`                                      | —        | Optional                   |
| `variant`     | `'success' \| 'info' \| 'warning' \| 'error'` | `'info'` | Toast style                |
| `durationMs`  | `number`                                      | `3500`   | Auto-dismiss (0 = no auto) |

---

## useDarkMode

Dark/light theme toggle.

**Returns:**

| Property         | Type                       | Description        |
| ---------------- | -------------------------- | ------------------ |
| `isDark`         | `ReadonlyRef<boolean>`     | Current dark state |
| `toggleDarkMode` | `() => void`               | Toggle             |
| `setDarkMode`    | `(value: boolean) => void` | Set explicitly     |

**Storage:** `localStorage.dark-mode` (`'true'` / `'false'`)

---

## useKeyboardShortcut

Keyboard handler for Enter, Space, Escape.

```ts
useKeyboardShortcut(key, handler) → { handleKeyDown }
```

| Param     | Type                                                  | Description          |
| --------- | ----------------------------------------------------- | -------------------- |
| `key`     | `'Enter' \| ' ' \| 'Escape' \| KeyboardShortcutKey[]` | Key(s) to listen for |
| `handler` | `(event: KeyboardEvent) => void`                      | Callback             |

**Returns:** `{ handleKeyDown }` — bind to `@keydown="handleKeyDown"`

---

## useFormValidation

Form validation with Zod.

```ts
useFormValidation<T>({ schema, getFormData }) → { errors, isValid, validate, handleSubmit, ... }
```

| Option        | Type           | Description               |
| ------------- | -------------- | ------------------------- |
| `schema`      | `z.ZodType<T>` | Zod schema                |
| `getFormData` | `() => T`      | Returns current form data |

**Returns:**

| Property          | Type                                     | Description        |
| ----------------- | ---------------------------------------- | ------------------ |
| `errors`          | `Ref<Partial<Record<keyof T, string>>>`  | Field errors       |
| `isValid`         | `ComputedRef<boolean>`                   | Schema valid       |
| `validate`        | `() => FormValidationResult<T>`          | Run validation     |
| `handleSubmit`    | `(onValid) => (event?) => Promise<void>` | Submit handler     |
| `resetErrors`     | `() => void`                             | Clear errors       |
| `setErrors`       | `(errors) => void`                       | Set errors         |
| `setFieldError`   | `(field, message) => void`               | Set single error   |
| `clearFieldError` | `(field) => void`                        | Clear single error |

---

## usePageMeta

SEO meta (title, description, og:image).

```ts
usePageMeta({ title, description?, image? })
```

| Option        | Type                                 | Description                                 |
| ------------- | ------------------------------------ | ------------------------------------------- |
| `title`       | `Ref \| ComputedRef \| () => string` | Page title (appends ` \| Frontend Starter`) |
| `description` | Same                                 | Meta description, og:description            |
| `image`       | `string`                             | Path or URL for og:image                    |

---

## useLogout

Logout with redirect and optional toast.

**Returns:** `{ handleLogout }`

```ts
handleLogout(options?: { redirectTo?: string; showToast?: boolean })
```

- `redirectTo` — defaults to `/login`
- `showToast` — defaults to `true` (shows "Logged out" toast)
