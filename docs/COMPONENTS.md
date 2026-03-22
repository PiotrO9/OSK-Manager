# UI Components Reference

All components are auto-imported. Use them without path prefix.

## App Components (`components/app/`)

### AppHeader

Main header with navigation, dark mode toggle, language switch, and login/logout.

- **Navigation:** Home, Design system, API Demo, Protected
- **Dark mode:** Switch component (heroicons:sun / heroicons:moon)
- **LanguageSwitch:** Locale dropdown
- **Auth:** Log in / Log out button based on `useAuthSession().isAuthenticated`

### AppFooter

Footer with tagline and "Last updated" date (formatted via `formatDate`).

### LanguageSwitch

Locale switcher dropdown.

- **Props:** None (uses `useI18n()`)
- **Locales:** From `nuxt.config` i18n config
- **Flags:** `/images/us.webp`, `/images/pl.webp` for en/pl

---

## UI Components (`components/ui/`)

### Action

Button/link component.

| Prop         | Type                                              | Default     | Description              |
| ------------ | ------------------------------------------------- | ----------- | ------------------------ |
| `tag`        | `'button' \| 'a'`                                 | `'button'`  | Render as button or link |
| `variant`    | `'primary' \| 'secondary' \| 'ghost' \| 'danger'` | `'primary'` | Visual style             |
| `buttonType` | `'button' \| 'submit' \| 'reset'`                 | `'button'`  | Native type              |
| `isLoading`  | `boolean`                                         | `false`     | Shows loading state      |
| `isDisabled` | `boolean`                                         | `false`     | Disabled state           |
| `href`       | `string`                                          | —           | For link mode            |
| `circle`     | `boolean`                                         | `false`     | Circular shape           |
| `ariaLabel`  | `string`                                          | `'Action'`  | Accessibility label      |

**Slots:** `default` (content), `left-icon`, `right-icon` (Icon name as slot content)

**Events:** `@click`

### Badge

Badge/pill for labels and status.

### Card

Content card with optional header and footer.

| Prop        | Type     | Default   | Description         |
| ----------- | -------- | --------- | ------------------- |
| `ariaLabel` | `string` | `'Karta'` | Accessibility label |

**Slots:** `default` (body), `header`, `footer`

### Dialog

Modal dialog using `<dialog>`.

| Prop          | Type      | Default     | Description           |
| ------------- | --------- | ----------- | --------------------- |
| `open`        | `boolean` | —           | Controlled open state |
| `title`       | `string`  | `''`        | Dialog title          |
| `message`     | `string`  | `''`        | Simple message        |
| `confirmText` | `string`  | `'Confirm'` | Confirm button text   |
| `cancelText`  | `string`  | `'Cancel'`  | Cancel button text    |

**Slots:** `header`, `default`, `footer` (override default buttons)

**Events:** `@update:open`, `@confirm`, `@cancel`

### Input

Text input with v-model.

| Prop          | Type                                     | Default  | Description           |
| ------------- | ---------------------------------------- | -------- | --------------------- |
| `modelValue`  | `string \| number`                       | —        | v-model value         |
| `type`        | `'text' \| 'email' \| 'password' \| ...` | `'text'` | Input type            |
| `id`          | `string`                                 | —        | For label association |
| `placeholder` | `string`                                 | `''`     | Placeholder           |
| `ariaLabel`   | `string`                                 | `''`     | Accessibility label   |
| `isDisabled`  | `boolean`                                | `false`  | Disabled              |
| `isRequired`  | `boolean`                                | `false`  | Required              |

**Events:** `@update:modelValue`, `@keydown`

### Loader

Loading indicator.

### Skeleton

Skeleton placeholder for loading states.

### Spinner

Spinning loading indicator.

### Switch

Toggle switch with optional icons.

| Prop             | Type      | Description                    |
| ---------------- | --------- | ------------------------------ |
| `checked`        | `boolean` | Toggle state                   |
| `ariaLabel`      | `string`  | Accessibility label            |
| `leftIcon`       | `string`  | Icon name (e.g. heroicons:sun) |
| `rightIcon`      | `string`  | Icon name                      |
| `leftIconClass`  | `string`  | Icon classes                   |
| `rightIconClass` | `string`  | Icon classes                   |

**Events:** `@update:checked`

### ToastStack

Global toast container. Rendered in `app.vue`. Use `useToast().addToast()` to show toasts.

**Variants:** `success`, `info`, `warning`, `error`

### Radio, RadioGroup

Radio button and group.

### Slider

Range slider input.

### Breadcrumbs

Breadcrumb navigation.

### NavTree, NavigationMenubar, NavigationMenubarPopup

Navigation tree and menubar components.
