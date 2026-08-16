# Composables API Reference

All composables are auto-imported.

---

## useAuthSession

Authentication state and actions.

**Returns:**

| Property                   | Type                                 | Description                                                                                                                                                                                                                                                                          |
| -------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `session`                  | `Ref<AuthSession \| null>`           | Profil z BFF: `userId`, `userName`, `email`, `role`, `avatarUrl`, opcjonalnie `firstName`, `lastName`, `phone`, `bio`, `profileUpdatedAt`, zawsze `drivingSchools` ( uproszczone OSK z `/auth/me` ) i `defaultOskId` (`null` poza sensownym kontekstem menedżera) — bez JWT w stanie |
| `isAuthenticated`          | `ComputedRef<boolean>`               | True if valid session                                                                                                                                                                                                                                                                |
| `isCheckingSession`        | `ComputedRef<boolean>`               | True while checking session                                                                                                                                                                                                                                                          |
| `login`                    | `(email, password) => Promise<void>` | Login via API                                                                                                                                                                                                                                                                        |
| `loginDemo`                | `(userName: string) => void`         | Demo mode (no backend)                                                                                                                                                                                                                                                               |
| `logout`                   | `() => Promise<void>`                | Logout, clear session                                                                                                                                                                                                                                                                |
| `refreshAccessToken`       | `() => Promise<boolean>`             | Refresh token                                                                                                                                                                                                                                                                        |
| `checkSession`             | `() => Promise<boolean>`             | `GET /api/auth/me` (przy 403/404 bez retry refresh — wylogowanie stanu)                                                                                                                                                                                                              |
| `refreshProfileFromServer` | `() => Promise<void>`                | Ponownie `GET /api/auth/me` do aktualizacji `session` (np. po uploadzie avatara); przy błędzie — throw                                                                                                                                                                               |

**API base:** `runtimeConfig.public.apiBase` or `/api`

---

## requestBffData

BFF helper for endpoints returning `{ success: true, data }`.

```ts
requestBffData<T>(method, path, { fallbackMessage, normalize? }) → Promise<T>
```

Use it inside domain composables for normal JSON BFF requests. It unwraps
`data`, maps transport errors and can run a local response normalizer.

---

## requestBffSuccess

BFF helper for endpoints returning only `{ success: true }`.

```ts
requestBffSuccess(method, path, { fallbackMessage }) → Promise<void>
```

Use it for success-only mutations such as selected `DELETE` / `PATCH`
endpoints. It validates the envelope and maps errors through the same transport
path as `requestBffData`.

---

## bffFetch

Low-level BFF helper for full-envelope or special-case responses.

```ts
bffFetch<T>(method, path, options?) → Promise<T>
```

Prefer `requestBffData` or `requestBffSuccess` unless the caller really needs
the raw BFF envelope.

---

## useAppToast

Globalne powiadomienia (stan `useState`, kontener [ToastStack](../app/components/app/ToastStack.vue) w `app.vue`).

**Returns:**

| Property      | Type                | Description           |
| ------------- | ------------------- | --------------------- |
| `toasts`      | `Ref<ToastItem[]>`  | Current toasts        |
| `addToast`    | `(input) => string` | Add toast, returns id |
| `removeToast` | `(id) => void`      | Remove by id          |

Typy: `ToastVariant`, `AddToastInput` w [useAppToast.ts](../app/composables/core/useAppToast.ts).

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

| Option        | Type                                 | Description                            |
| ------------- | ------------------------------------ | -------------------------------------- |
| `title`       | `Ref \| ComputedRef \| () => string` | Page title (appends ` \| OSK Manager`) |
| `description` | Same                                 | Meta description, og:description       |
| `image`       | `string`                             | Path or URL for og:image               |

---

## useLogout

Logout with redirect and optional toast.

**Returns:** `{ handleLogout }`

```ts
handleLogout(options?: { redirectTo?: string; showToast?: boolean })
```

- `redirectTo` — defaults to `/login`
- `showToast` — defaults to `true` (shows "Logged out" toast)

---

## useDrivingSchoolsApi

Operacje na szkołach jazdy (BFF `/api/driving-schools/...`). W BFF: [API_AND_BFF.md](./API_AND_BFF.md).

**Returns (wybrane):**

| Property / method                                         | Opis                                                                                                                 |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `fetchList`, `create`, `update`, `remove`, `setAsDefault` | CRUD + domyślna OSK                                                                                                  |
| `fetchDefaultDrivingSchool()`                             | `GET /api/driving-schools/default` → wynik dyskryminowany: `ok` / `empty_response` / `not_configured` / `unreadable` |
| `isDefaultLoading`, `isListLoading`, …                    | Stany ładowania                                                                                                      |

---

## useVehiclesApi

Lista, szczegóły, tworzenie, edycja, usuwanie pojazdów; `setVehicleAsDefault`; upload zdjęcia przez shared BFF client (`requestBffData` + `FormData`).

---

## useVehiclesListPage

Logika strony [vehicles/index](../app/pages/vehicles/index.vue): rozwiązanie `schoolId` (query / manager / domyślna OSK), ładowanie listy, usuwanie, ustawianie domyślnego pojazdu. Widok: [VehiclesListPanel.vue](../app/components/app/VehiclesListPanel.vue).

---

## useInstructorAvailabilityApi

Tygodniowa dostępność instruktora (BFF `/api/instructors/:id/availability/weekly`). Kontekst: [MANAGER_INSTRUCTORS.md](./MANAGER_INSTRUCTORS.md).

**Sygnatura:** `useInstructorAvailabilityApi(instructorId: MaybeRefOrGetter<string>)`

**Returns:**

| Property / method                        | Opis                                                                                      |
| ---------------------------------------- | ----------------------------------------------------------------------------------------- |
| `isLoading`                              | `Readonly<Ref<boolean>>` — trwa `fetchWeekly`                                             |
| `isSaving`                               | `Readonly<Ref<boolean>>` — trwa `saveDay` lub `deleteDay`                                 |
| `fetchWeekly()`                          | `Promise<WeeklyEntry[]>` — `requestBffData` → `data.weekly`                               |
| `saveDay(dayOfWeek, startTime, endTime)` | `Promise<WeeklyEntry>` — `PUT …/weekly/:day`, body `{ startTime, endTime }` (`HH:mm`)     |
| `deleteDay(dayOfWeek)`                   | `Promise<void>` — `DELETE …/weekly/:day`; odpowiedź BFF to `{ success: true }` bez `data` |

**Uwaga:** Żądania idą przez shared BFF client (`requestBffData` / `bffFetch`). Typ `WeeklyEntry`: [instructorAvailability.ts](../app/types/instructors/instructorAvailability.ts). Kontekst modułu: [MANAGER_INSTRUCTORS.md](./MANAGER_INSTRUCTORS.md).

---

## useInstructorSlotsApi

Sloty dostępności instruktora w zakresie dat (BFF `GET /api/instructors/:id/availability/slots`).

**Sygnatura:** `useInstructorSlotsApi(instructorId: MaybeRefOrGetter<string>)`

**Returns:**

| Property / method              | Opis                                                                                                   |
| ------------------------------ | ------------------------------------------------------------------------------------------------------ |
| `isLoading`                    | `Readonly<Ref<boolean>>` — trwa `fetchSlots`                                                           |
| `fetchSlots(dateFrom, dateTo)` | `Promise<AvailabilitySlot[]>` — `requestBffData` → `data.slots`; pusta tablica gdy brak `instructorId` |

Typ `AvailabilitySlot`: [instructorSlots.ts](../app/types/instructors/instructorSlots.ts). Kontekst: [MANAGER_INSTRUCTORS.md](./MANAGER_INSTRUCTORS.md).
