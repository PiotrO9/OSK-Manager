# Przebieg: 2026-10-11 — MGR-INS-02, odbiór ręczny

- Data i osoba wykonująca: 2026-10-11, użytkownik (potwierdzenie w rozmowie).
- Wersja FE (commit): bieżący stan po `72c7860`; dokładna wersja uruchomiona podczas testu nie została niezależnie potwierdzona.
- Wersja BE (commit): niepodana dla tego przebiegu.
- Środowisko / URL: lokalna aplikacja, formularz `/manager/instructors/new`; szczegóły środowiska niepodane.
- Zestaw danych: konto menedżera z istniejącą OSK; identyfikator szkoły niepodany.
- Zakres: `MGR-INS-02` — walidacja pustego i niepoprawnie wypełnionego formularza, blokada przyszłej daty urodzenia oraz ostrzeżenie o niezapisanych danych przy opuszczaniu strony.

| Scenariusz | Ręcznie (wymagane) | Automatycznie (opcjonalne) | Dowód / uwagi |
| --- | --- | --- | --- |
| MGR-INS-02 | zaliczony | — | Użytkownik potwierdził w rozmowie 2026-10-11, że test przeszedł pomyślnie. Nie przekazał osobnych obserwacji ani zrzutów ekranu dla poszczególnych kroków. Osobnego automatu nie uruchomiono. |

## Podsumowanie

- Ręcznie zaliczonych / niezaliczonych / zablokowanych / niewykonanych: 1 / 0 / 0 / 0.
- Automatycznie zaliczonych / niezaliczonych / bez wyniku / bez próby: 0 / 0 / 0 / 1.
- Decyzja o odbiorze: `MGR-INS-02` zaliczony zgodnie z wynikiem podanym przez osobę wykonującą test.
- Scenariusze wymagające powtórzenia: brak zgłoszonych dla `MGR-INS-02`.
