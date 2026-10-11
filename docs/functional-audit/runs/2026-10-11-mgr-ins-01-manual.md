# Przebieg: 2026-10-11 — MGR-INS-01, odbiór ręczny

- Data i osoba wykonująca: 2026-10-11, użytkownik (potwierdzenie w rozmowie).
- Wersja FE (commit): bieżący stan po `72c7860` ze zmianami roboczymi; dokładna wersja uruchomiona podczas testu nie została niezależnie potwierdzona.
- Wersja BE (commit): niepodana dla tego przebiegu.
- Środowisko / URL: lokalna aplikacja, formularz `/manager/instructors/new`; szczegóły środowiska niepodane.
- Zestaw danych: testowe konto menedżera z OSK utworzoną w `MGR-OSK-01`; nowo utworzone konto instruktora. Dane logowania nie są przechowywane w dokumentacji.
- Zakres: `MGR-INS-01` — utworzenie instruktora z pozycji menedżera oraz sprawdzenie zapisu w OSK.

| Scenariusz | Ręcznie (wymagane) | Automatycznie (opcjonalne) | Dowód / uwagi |
| --- | --- | --- | --- |
| MGR-INS-01 | zaliczony | — | Użytkownik potwierdził, że utworzenie konta instruktora działa poprawnie, a następnie polecił oznaczyć test jako gotowy. Nie przekazał osobnych obserwacji z listy, szczegółów i odświeżenia. Próba zalogowania na niepotwierdzony adres ujawniła osobny błąd komunikatu logowania opisany w `F-010`; logowanie nie jest kryterium tego scenariusza. Osobnego automatu nie uruchomiono. |

## Podsumowanie

- Ręcznie zaliczonych / niezaliczonych / zablokowanych / niewykonanych: 1 / 0 / 0 / 0.
- Automatycznie zaliczonych / niezaliczonych / bez wyniku / bez próby: 0 / 0 / 0 / 1.
- Decyzja o odbiorze: `MGR-INS-01` zaliczony zgodnie z wynikiem podanym przez osobę wykonującą test.
- Scenariusze wymagające powtórzenia: brak zgłoszonych dla `MGR-INS-01`; poprawka komunikatu logowania `F-010` czeka na osobny ponowny test ręczny.
