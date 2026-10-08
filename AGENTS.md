# Instrukcje dla AI: frontend OSK Manager

Przy dodawaniu lub zmianie nazw w kodzie stosuj
[`docs/NAMING_CONVENTIONS.md`](docs/NAMING_CONVENTIONS.md). Zachowuj klucze API,
parametry tras i inne publiczne kontrakty; nie przemianowuj ich mechanicznie.

Przy zmianach informacji o bieżącym ośrodku przeczytaj
[`docs/SCHOOL_CONTEXT.md`](docs/SCHOOL_CONTEXT.md) oraz
[`docs/COMPONENTS.md`](docs/COMPONENTS.md).

- Do prezentacji ośrodka używaj `SchoolContext`; do wyboru ośrodka używaj
  `SchoolContextSelect`. Zachowuj jeden kompaktowy wygląd tych komponentów.
- Wyszukiwarki i inne filtry pozostaw jako oddzielne kontrolki strony.
- Używaj istniejących tokenów kolorów i komponentów `Ui*`; nie wpisuj kolorów
  bezpośrednio w nowe widoki.
- Przekazuj dane z logiki widoku. Komponenty kontekstu nie pobierają danych i nie
  przechowują globalnego wyboru szkoły.
- Rozróżniaj ośrodek aktualnie wybrany, domyślny i przypisany użytkownikowi.
- Przy rozszerzeniu tego wzorca aktualizuj `docs/SCHOOL_CONTEXT.md`, opis w
  `docs/COMPONENTS.md` i przykład na `/design-system`.
