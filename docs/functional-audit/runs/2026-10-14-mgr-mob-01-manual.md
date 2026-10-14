# Przebieg: 2026-10-14 — MGR-MOB-01, zadania menadżera na wąskim ekranie

- Data i wykonawca: 2026-10-14, użytkownik (test ręczny i potwierdzenie wyniku); Codex (zapis wyniku).
- Wersja FE (commit): `df5a56c39de39d0eb66511c2f4cca36f70d28306` (przed zapisem dokumentacji).
- Wersja BE (commit): `6548e35f5e47b385d37b4f887ba497c3b2d63cff`.
- Środowisko: lokalna aplikacja `http://localhost:3000`; instrukcja testu obejmowała widok telefonu o szerokości 375 i 390 px.
- Dane: konto demo menadżera `manager001@post.pl`, OSK Warszawa Demo 1 i kursant Kamil Kursant wskazane w instrukcji. Nie zapisano hasła.
- Zakres: mobilna nawigacja między szkołami, kursantami i harmonogramem, wybór szkoły, wyszukanie i otwarcie kursanta oraz przegląd formularza opłaty bez zapisu.

| Scenariusz | Ręcznie (wymagane) | Automatycznie (opcjonalne) | Dowód / uwagi |
| ---------- | ------------------ | -------------------------- | ------------ |
| `MGR-MOB-01` | zaliczony — użytkownik potwierdził 2026-10-14, że sprawdził scenariusz i działa | — | Potwierdzenie użytkownika w rozmowie. Osobnego zapisu obserwacji dla poszczególnych kroków i szerokości ekranu nie przekazano. W aktualnym interfejsie formularz opłaty jest osadzony w zakładce Płatności, nie w dialogu; dostosowano opis scenariusza do tej struktury. |

## Podsumowanie

- Ręcznie: 1 zaliczony, 0 niezaliczonych, 0 zablokowanych, 0 niewykonanych.
- Automatycznie: bez pełnego testu automatycznego scenariusza.
- Decyzja: `MGR-MOB-01` zaliczony na podstawie potwierdzenia użytkownika.
- Powtórzenie: przeglądanie widoków i wyjście z formularza bez zapisu nie wymagają resetu danych.
