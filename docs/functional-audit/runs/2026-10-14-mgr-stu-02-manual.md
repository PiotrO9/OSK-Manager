# MGR-STU-02 — wyszukiwanie, filtrowanie i szczegóły kursanta

- Data: 2026-10-14.
- Środowisko: lokalne, odizolowana baza testowa.
- Scenariusz: [MGR-STU-02](../scenarios/manager.md).
- Dane: konto menedżera `manager001@post.pl`; szkoły „OSK Warszawa Demo 1” i „OSK Audyt Opinie B”; kursant Kamil Kursant z PKK, kursami i historią lekcji oraz kursant Audyt SzkolaB w drugiej szkole.
- Zakres przekazanego planu: wyszukanie kursanta, filtr kursu i szybki filtr, wyczyszczenie filtrów, zmiana szkoły oraz zakładki profilu Przegląd, Lekcje, Płatności i Kursy.
- Podczas testu poprawiono szybkie filtry kursantów: dodano liczniki dla całej wybranej szkoły, usunięto zbędne podsumowanie bieżącej strony i dodano przycisk przywracający początkowy stan filtrów.

| Scenariusz | Ręcznie (wymagane) | Automatycznie (opcjonalne) | Dowód / uwagi |
| --- | --- | --- | --- |
| `MGR-STU-02` | zaliczony — użytkownik potwierdził 2026-10-14, że test przeszedł pomyślnie | — | Potwierdzenie użytkownika w rozmowie. Sprawdzenia kodu i API dotyczą wdrożonych usprawnień; nie zastępują potwierdzenia ręcznego. |

## Podsumowanie

- Ręcznie: 1 zaliczony, 0 niezaliczonych, 0 zablokowanych.
- Wynik: `MGR-STU-02` zaliczony na podstawie potwierdzenia użytkownika.
