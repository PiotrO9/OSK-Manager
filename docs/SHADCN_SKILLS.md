# Skille shadcn w repozytorium (`.agents/skills/shadcn`)

W projekcie leży **pakiet instrukcji dla agentów AI** (kompatybilny z ekosystemem shadcn/ui). Ma być **czytany przy każdej pracy** nad komponentami shadcn, rejestrem, MCP i CLI — obok **[SHADCN.md](SHADCN.md)** (konkretnie ten stack: Nuxt + Vue + **shadcn-vue**).

## Jak tego używać w Cursorze / agencie

1. Przy zadaniach typu: _dodaj komponent_, _popover z rejestru_, _napraw dialog_, _styling shadcn_, _MCP_ — **otwórz lub załącz**:
    - [`.agents/skills/shadcn/SKILL.md`](../.agents/skills/shadcn/SKILL.md) — główne zasady, workflow, linki do reguł szczegółowych.
2. Zejdź w głąb według potrzeb:
    - `rules/styling.md`, `rules/forms.md`, `rules/composition.md`, `rules/icons.md`, `rules/base-vs-radix.md`
    - `cli.md` — referencja poleceń CLI (uwaga: domyślnie opisuje `shadcn@latest` dla Reacta)
    - `mcp.md` — narzędzia serwera MCP
    - `customization.md` — motywy, zmienne CSS, rozszerzanie komponentów

**Szybka ścieżka z czatu:** `@.agents/skills/shadcn/SKILL.md` (lub folder `.agents/skills/shadcn`).

## Struktura plików

| Ścieżka                                        | Zawartość                                                                        |
| ---------------------------------------------- | -------------------------------------------------------------------------------- |
| `.agents/skills/shadcn/SKILL.md`               | Główny skill: zasady, wzorce, workflow, tabela wyboru komponentów                |
| `.agents/skills/shadcn/cli.md`                 | Dokumentacja poleceń `shadcn` CLI (init, add, search, docs, info, …)             |
| `.agents/skills/shadcn/mcp.md`                 | MCP: konfiguracja edytora, lista narzędzi (`list_items`, install, …)             |
| `.agents/skills/shadcn/customization.md`       | Dostosowywanie wyglądu i zachowania                                              |
| `.agents/skills/shadcn/rules/styling.md`       | Tailwind, `cn()`, semantyka kolorów, odstępy (`gap` zamiast `space-y`), `size-*` |
| `.agents/skills/shadcn/rules/forms.md`         | Układ formularzy, grupy pól, walidacja (`aria-invalid`, stany)                   |
| `.agents/skills/shadcn/rules/composition.md`   | Kompozycja (Card, Dialog z tytułem, grupy w menu/select, itd.)                   |
| `.agents/skills/shadcn/rules/icons.md`         | Ikony w przyciskach, rozmiary, przekazywanie ikon                                |
| `.agents/skills/shadcn/rules/base-vs-radix.md` | `asChild` / prymitywy, różnice API                                               |
| `.agents/skills/shadcn/agents/openai.yml`      | Metadane interfejsu agenta (nazwa, opis)                                         |
| `.agents/skills/shadcn/evals/evals.json`       | Plik ewaluacji (testy / bench — opcjonalnie)                                     |

## Obowiązkowa adaptacja: ten projekt = **Vue**, nie React

Skill w `SKILL.md` jest pisany pod **shadcn/ui (React)** — przykłady używają `className`, `tsx`, czasem `FieldGroup` / `lucide-react`. W **tym** repozytorium stosuj:

| W skillu (React)                           | W projekcie (Vue / shadcn-vue)                                                                                                                   |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npx shadcn@latest` w przykładach          | **`npx shadcn-vue@latest`** (add, init, docs — patrz [SHADCN.md](SHADCN.md))                                                                     |
| `className`                                | **`class`** (Vue)                                                                                                                                |
| Importy `@/components/ui/...` z docs React | Alias **`@/components/shadcn/...`** i tagi **`UiButton`**, `UiDialog`, … (`shadcn.prefix: 'Ui'`)                                                 |
| `lucide-react`                             | **`lucide-vue-next`**                                                                                                                            |
| Komponenty React (Field, itd.)             | Odpowiedniki **vue** z rejestru; część wzorców z skills nie ma 1:1 — wtedy reguły **stylistyczne** (gap, semantic colors, `cn`) nadal obowiązują |

**MCP w Cursorze:** skonfigurowany pod **shadcn-vue**: [MCP_SHADCN.md](MCP_SHADCN.md), plik `.cursor/mcp.json`.

## Zgodność z dokumentacją projektu

- Konwencje katalogów i prefiks `Ui`: [SHADCN.md](SHADCN.md)
- MCP: [MCP_SHADCN.md](MCP_SHADCN.md)
- Indeks docs: [README.md](README.md)

## Podsumowanie

- **Skille** = głębokie wytyczne kompozycji, stylów i workflowu shadcn (wartość dla jakości kodu).
- **docs/SHADCN.md** = „jak w **tym** repo” (Nuxt, ścieżki, `shadcn-vue`).  
  Obie rzeczy **łącz** przy każdej zmianie UI opartego na shadcn.
