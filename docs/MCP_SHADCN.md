# MCP shadcn (shadcn-vue) w Cursorze

Ten projekt jest pod **Vue / Nuxt**; serwer MCP musi być z pakietu **`shadcn-vue`**, nie `shadcn` (wersja pod React).

## Konfiguracja w repozytorium

W katalogu głównym repozytorium jest plik **[`.cursor/mcp.json`](../.cursor/mcp.json)**:

```json
{
    "mcpServers": {
        "shadcn": {
            "command": "npx",
            "args": ["shadcn-vue@latest", "mcp"]
        }
    }
}
```

## Co zrobić w Cursorze

1. Otwórz **Settings → MCP** (lub **Features → MCP** — zależnie od wersji).
2. Upewnij się, że **MCP dla workspace / projektu** widzi ten plik (Cursor ładuje `.cursor/mcp.json` z otwartego folderu).
3. **Włącz** serwer **shadcn** na liście serwerów MCP.
4. Po udanej integracji przy serwerze pojawi się status połączenia (np. zielony wskaźnik) i dostępne narzędzia.

Oficjalny opis: [MCP Server — shadcn/vue](https://www.shadcn-vue.com/docs/mcp) oraz [Using MCP JSON — Cursor](https://docs.cursor.com/context/mcp#using-mcp-json).

## Opcjonalnie: jednorazowa inicjalizacja CLI

Z katalogu projektu (alternatywa do ręcznej edycji pliku):

```bash
pnpm dlx shadcn-vue@latest mcp init --client cursor
```

(Na Windowsie często używasz `npx` zamiast `pnpm dlx` — patrz dokumentacja powyżej.)

## Przykładowe prompty (po włączeniu MCP)

- Wyświetl komponenty dostępne w rejestrze shadcn.
- Dodaj do projektu komponenty `select`, `dropdown-menu` i `tabs`.
- Zbuduj formularz kontaktowy z komponentów shadcn-vue.

Rejestry dodatkowe (np. firmowe) konfiguruje się w [`components.json`](https://www.shadcn-vue.com/docs/registry) — pole `registries`.

## Rozwiązywanie problemów

- **Br narzędzi / „No tools”** — wyczyść cache `npx` (`npx clear-npx-cache`), przeładuj okno Cursora, wyłącz i włącz serwer MCP.
- **Błędy instalacji** — sprawdź, czy w katalogu głównym jest poprawny `components.json` i czy masz uprawnienia zapisu do `app/components/shadcn/`.
- Pełna lista: [Troubleshooting — MCP (shadcn/vue)](https://www.shadcn-vue.com/docs/mcp#troubleshooting).

## Powiązanie z konwencją projektu

Zasady używania shadcn w kodzie: **[SHADCN.md](SHADCN.md)**.  
Skille agenta (kompozycja, style, CLI — z adaptacją do Vue): **[SHADCN_SKILLS.md](SHADCN_SKILLS.md)**.
