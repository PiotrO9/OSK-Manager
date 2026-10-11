# Przebieg: 2026-10-11 — MGR-INS-04, odbiór ręczny

- Data i osoba wykonująca: 2026-10-11, użytkownik (potwierdzenie w rozmowie).
- Wersja FE (commit): bieżący stan po `72c7860` ze zmianami roboczymi; dokładna wersja uruchomiona podczas testu nie została niezależnie potwierdzona.
- Wersja BE (commit): `55ec23d`; dokładna wersja uruchomiona podczas testu nie została niezależnie potwierdzona.
- Środowisko / URL: lokalna aplikacja, szczegóły instruktora i widok `/manager/instructors/:id/availability`.
- Zestaw danych: istniejące konto menedżera z OSK i instruktorem; identyfikator instruktora i godziny użyte podczas testu nie zostały podane.
- Zakres: `MGR-INS-04` — ustawienie i usunięcie tygodniowej dostępności instruktora, zapis oraz podgląd wolnych terminów.

| Scenariusz | Ręcznie (wymagane) | Automatycznie (opcjonalne) | Dowód / uwagi |
| --- | --- | --- | --- |
| MGR-INS-04 | zaliczony | — | Użytkownik potwierdził w rozmowie, że funkcjonalność działa poprawnie i polecił oznaczyć test. Podczas odbioru zgłosił poprawki wyglądu i rozmieszczenia elementów widoku, które zostały wprowadzone przed końcowym potwierdzeniem. Nie przekazał osobnego zapisu wyników każdego kroku scenariusza ani dowodów po odświeżeniu i ponownym wyłączeniu dnia. Osobnego automatu nie uruchomiono. |

## Podsumowanie

- Ręcznie zaliczonych / niezaliczonych / zablokowanych / niewykonanych: 1 / 0 / 0 / 0.
- Automatycznie zaliczonych / niezaliczonych / bez wyniku / bez próby: 0 / 0 / 0 / 1.
- Decyzja o odbiorze: `MGR-INS-04` zaliczony zgodnie z wynikiem podanym przez osobę wykonującą test.
- Scenariusze wymagające powtórzenia: brak zgłoszonych dla `MGR-INS-04`.
