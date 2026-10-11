# Przebieg: 2026-10-11 — MGR-CRS-01, odbiór ręczny

- Data i osoba wykonująca: 2026-10-11, użytkownik (potwierdzenie w rozmowie).
- Wersja FE (commit): bieżący stan po `b9cbfff` ze zmianami roboczymi; dokładna wersja uruchomiona podczas testu nie została niezależnie potwierdzona.
- Wersja BE (commit): `55ec23d`; dokładna wersja uruchomiona podczas testu nie została niezależnie potwierdzona.
- Środowisko / URL: lokalna aplikacja, formularz `/manager/courses/new` i lista `/manager/courses`.
- Zestaw danych: konto menedżera, szkoła `AUD MGR-OSK-01` z włączoną teorią i kategorią A; utworzony kurs `Test teoria cat. A`, 30 godzin, bez instruktora.
- Zakres: `MGR-CRS-01` — utworzenie kursu w wybranej OSK.

| Scenariusz | Ręcznie (wymagane) | Automatycznie (opcjonalne) | Dowód / uwagi |
| --- | --- | --- | --- |
| MGR-CRS-01 | zaliczony | — | Użytkownik potwierdził utworzenie kursu. Załączony zrzut pokazuje komunikat „Kurs został utworzony” i jeden kurs na liście właściwej OSK z kategorią A, typem „Teoria (grupa)” i 30 godzinami. Nie przekazano osobnego potwierdzenia widoku szczegółów ani stanu po odświeżeniu. Osobnego automatu nie uruchomiono. |

## Podsumowanie

- Ręcznie zaliczonych / niezaliczonych / zablokowanych / niewykonanych: 1 / 0 / 0 / 0.
- Automatycznie zaliczonych / niezaliczonych / bez wyniku / bez próby: 0 / 0 / 0 / 1.
- Decyzja o odbiorze: `MGR-CRS-01` zaliczony zgodnie z wynikiem podanym przez osobę wykonującą test.
- Scenariusze wymagające powtórzenia: brak zgłoszonych dla `MGR-CRS-01`.
