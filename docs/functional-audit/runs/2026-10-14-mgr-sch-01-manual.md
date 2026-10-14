# MGR-SCH-01 — tygodniowy harmonogram OSK i wybór szkoły

- Data: 2026-10-14.
- Środowisko: lokalne, odizolowana baza testowa.
- Scenariusz: [MGR-SCH-01](../scenarios/manager.md).
- Dane: menedżer `manager001@post.pl`, szkoły „OSK Warszawa Demo 1” i „OSK Audyt Opinie B”, tydzień 12–18.10.2026. Szczegóły wpisów są w [danych testowych](../test-data.md#przygotowane-dane-mgr-sch-01-2026-10-14).
- Zakres przekazanego planu: sprawdzenie jazdy i teorii pierwszej szkoły, przełączenie na drugą szkołę z odrębną teorią, odświeżenie strony z parametrem `schoolId` i ponowne przełączenie na pierwszą szkołę.

| Scenariusz | Ręcznie (wymagane) | Automatycznie (opcjonalne) | Dowód / uwagi |
| --- | --- | --- | --- |
| `MGR-SCH-01` | zaliczony — użytkownik potwierdził 2026-10-14, że test działa poprawnie | — | Potwierdzenie użytkownika w rozmowie. Przed przekazaniem planu sprawdzono dane szkoły B przez API; ręczny wynik pochodzi od użytkownika. |

## Podsumowanie

- Ręcznie: 1 zaliczony, 0 niezaliczonych, 0 zablokowanych.
- Wynik: `MGR-SCH-01` zaliczony na podstawie potwierdzenia użytkownika.
