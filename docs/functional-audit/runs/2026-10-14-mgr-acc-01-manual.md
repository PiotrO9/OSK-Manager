# Przebieg: 2026-10-14 — MGR-ACC-01, potwierdzenie ręczne

- Data i wykonawca: 2026-10-14, użytkownik (ręczne wykonanie i potwierdzenie wyniku); Codex (zapis).
- Wersja FE (commit): `321fe6e6825cb542c8155a3bfabae8b600f11de6` oraz zmiany robocze.
- Wersja BE (commit): `6548e35f5e47b385d37b4f887ba497c3b2d63cff`.
- Środowisko: lokalna aplikacja `http://localhost:3000` połączona z bazą DEV; nie jest to odizolowane środowisko wymagane dla formalnego odbioru.
- Dane: [przygotowane dane MGR-ACC-01](../test-data.md#przygotowane-dane-mgr-acc-01-2026-10-14).
- Zakres: [MGR-ACC-01](../scenarios/manager.md), lista kont i granica szkoły.

| Scenariusz | Ręcznie (wymagane) | Automatycznie (opcjonalne) | Dowód / uwagi |
| --- | --- | --- | --- |
| `MGR-ACC-01` | zaliczony — użytkownik polecił oznaczyć test jako wykonany ręcznie 2026-10-14 | [API 20/20](2026-10-14-mgr-acc-01-api.md) | Potwierdzenie użytkownika w rozmowie. Osobnego opisu obserwacji dla wyszukiwania, filtrów, szczegółów konta i odświeżenia listy nie przekazano. Wynik API jest zapisany oddzielnie i nie zastępuje deklaracji ręcznej. |

## Podsumowanie

- Ręcznie: 1 zaliczony na podstawie potwierdzenia użytkownika.
- Automatycznie: sprawdzony zakres API 20/20 asercji; szczegóły w osobnym przebiegu.
- Scenariusz nie przewiduje zmian danych; osobnego zapisu stanu po ręcznych krokach nie przekazano.
- Do formalnego odbioru według [zasad audytu](../README.md) potrzebny jest ponowny przebieg na odizolowanym środowisku.
