# MGR-INS-05 — terminarz i wolne sloty instruktora

- Data: 2026-10-14.
- Środowisko: lokalne, odizolowana baza testowa.
- Scenariusz: [MGR-INS-05](../scenarios/manager.md).
- Dane: menedżer `manager001@post.pl`, OSK Warszawa Demo 1, Jan Instruktor, Kamil Kursant, kurs „Kategoria A - grupa 1/1” i pojazd „Pojazd 3 - Skoda Fabia”. [Przygotowany stan](../test-data.md#przygotowane-dane-mgr-ins-05-2026-10-14) obejmował tydzień 19–25.10.2026, blok jazdy oraz wolny slot 19.10 o 09:30–10:30.
- Zakres przekazanego planu: porównanie jazd, teorii i bloku w terminarzu Jana; sprawdzenie wolnych slotów; rezerwacja jazdy; ponowny odczyt slotów, terminarza instruktora i harmonogramu OSK.

| Scenariusz | Ręcznie (wymagane) | Automatycznie (opcjonalne) | Dowód / uwagi |
| --- | --- | --- | --- |
| `MGR-INS-05` | zaliczony — użytkownik potwierdził 2026-10-14, że cały test przeszedł poprawnie | — | Potwierdzenie użytkownika w rozmowie. Przed testem API potwierdziło wolny slot i dostępność zasobów; po teście w bazie jest jedna zaplanowana jazda `dbff25a6-d3ad-4f58-bfca-cf5d765cd139` 19.10 o 09:30–10:30. |

## Podsumowanie

- Ręcznie: 1 zaliczony, 0 niezaliczonych, 0 zablokowanych.
- Wynik: `MGR-INS-05` zaliczony na podstawie potwierdzenia użytkownika.
