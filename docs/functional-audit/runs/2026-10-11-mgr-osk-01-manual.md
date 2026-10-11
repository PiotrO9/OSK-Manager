# Przebieg: 2026-10-11 — MGR-OSK-01, odbiór ręczny

- Data i osoba wykonująca: 2026-10-11, użytkownik (potwierdzenie w rozmowie).
- Wersja FE (commit): bieżący stan repozytorium `d963b61`; dokładna wersja uruchomiona podczas testu nie została niezależnie potwierdzona.
- Wersja BE (commit): bieżący stan repozytorium `55ec23d`; dokładna wersja uruchomiona podczas testu nie została niezależnie potwierdzona.
- Środowisko / URL: `localhost:3000`, backend na `localhost:3001` połączony ze zdalnym Supabase DEV. Jest to odstępstwo od zalecenia użycia odizolowanej bazy audytowej.
- Zestaw danych: osobne aktywne konto `MANAGER` bez przypisanej i domyślnej OSK, utworzone na potrzeby `MGR-OSK-01`; istniejące konto menedżera i jego szkoła pozostały zachowane. Bez danych logowania w dokumentacji.
- Zakres: `MGR-OSK-01` — utworzenie pierwszej OSK przez menedżera bez szkoły.

| Scenariusz | Ręcznie (wymagane) | Automatycznie (opcjonalne) | Dowód / uwagi |
| --- | --- | --- | --- |
| MGR-OSK-01 | zaliczony | — | Użytkownik potwierdził w rozmowie, że utworzył OSK, i polecił oznaczyć test jako wykonany poprawnie. Nie podał osobnych obserwacji po F5 ani z widoków Kursy i Kursanci. Osobny automat nie był uruchamiany w tym przebiegu. Pomysł na zmianę formularza zapisano w `../../../../../docs/APP_CHANGE_NOTES.md`. |

## Podsumowanie

- Ręcznie zaliczonych / niezaliczonych / zablokowanych / niewykonanych: 1 / 0 / 0 / 0.
- Automatycznie zaliczonych / niezaliczonych / bez wyniku / bez próby: 0 / 0 / 0 / 1.
- Decyzja o odbiorze: `MGR-OSK-01` zaliczony zgodnie z wynikiem podanym przez osobę wykonującą test. Przy formalnym odbiorze na izolowanym środowisku warto utrwalić obserwacje po odświeżeniu oraz w Kursach i Kursantach.
- Uwaga UX: użytkownik woli tworzenie OSK na osobnej stronie zamiast w modalu. To propozycja zmiany interfejsu na później, nie błąd blokujący zaliczenie scenariusza.
