# shadcn-vue w tym projekcie

Nowe elementy interfejsu oparte na **gotowych wzorcach** mają pochodzić z ekosystemu **shadcn/vue**, a nie z ręcznego wymyślania kolejnych „ogólnych” komponentów UI.

**Skille AI (szczegółowe zasady kompozycji, stylów, CLI, MCP):** zobacz **[SHADCN_SKILLS.md](SHADCN_SKILLS.md)** — pakiet w `.agents/skills/shadcn/`; przy pracy nad shadcn warto łączyć ten plik z `@.agents/skills/shadcn/SKILL.md`.

## Zasady

1. **Nowe kontrolki i layouty (button, dialog, form field, tabela, itd.)**  
   Dodawaj przez **shadcn-vue** (`CLI` lub **MCP shadcn** w Cursorze), chyba że istnieje już odpowiednik w `app/components/shadcn/` albo świadomie rozszerzasz warstwę `app/components/ui/` (legacy startera).

2. **Źródło prawdy**
    - Konfiguracja projektu: [`components.json`](../components.json) w katalogu głównym.
    - Komponenty z rejestru trafiają do **`app/components/shadcn/`** (podfoldery z `index.ts`).
    - W szablonach używaj prefiksu **`Ui`** (np. `UiButton`, `UiDialog`), zgodnie z `nuxt.config.ts` → `shadcn.prefix`.

3. **Nie myl katalogów**
    - `app/components/shadcn/` — generowane przez shadcn-vue.
    - `app/components/ui/` — starsze, płaskie komponenty startera (Action, Card, …).  
      Przy migracji możesz stopniowo zastępować `ui/` wersjami shadcn.

4. **Pomocnicze**
    - `app/lib/utils.ts` — funkcja `cn()` dla klas Tailwind.
    - Style: `app/assets/css/tailwind.css` (tokeny shadcn + `@theme`).

## Dodawanie komponentu (CLI)

```bash
npx shadcn-vue@latest add nazwa-komponentu
```

Wiele naraz (przykład):

```bash
npx shadcn-vue@latest add button dialog select --yes
```

Inicjalizacja w pustym repo: [Installation (Nuxt) — shadcn/vue](https://www.shadcn-vue.com/docs/installation/nuxt).

## AI / Cursor: MCP shadcn

Aby asystent mógł **przeglądać rejestry i instalować** komponenty z promptów, włącz serwer MCP (konfiguracja w repozytorium: `.cursor/mcp.json`). Szczegóły: **[MCP_SHADCN.md](MCP_SHADCN.md)** oraz [MCP Server — dokumentacja shadcn/vue](https://www.shadcn-vue.com/docs/mcp).

## Linki

- [shadcn/vue — dokumentacja](https://www.shadcn-vue.com/docs/introduction)
- [components.json](https://www.shadcn-vue.com/docs/components-json)
- [CLI](https://www.shadcn-vue.com/docs/cli)
- [Theming / dark mode](https://www.shadcn-vue.com/docs/theming)
