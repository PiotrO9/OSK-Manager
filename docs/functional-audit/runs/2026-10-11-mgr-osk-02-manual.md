# Przebieg: 2026-10-11 — MGR-OSK-02, odbiór ręczny

- Data i osoba wykonująca: 2026-10-11, użytkownik (potwierdzenie w rozmowie).
- Wersja FE (commit): bieżący stan po `72c7860`; dokładna wersja uruchomiona podczas testu nie została niezależnie potwierdzona.
- Wersja BE (commit): niepodana dla tego przebiegu.
- Środowisko / URL: lokalna aplikacja, widok `/manager/osk`; szczegóły środowiska niepodane.
- Zestaw danych: testowe konto menedżera użyte wcześniej w `MGR-OSK-01`, po utworzeniu pierwszej OSK; plan tego przebiegu wymagał drugiej testowej OSK przypisanej temu samemu kontu. Nazwy szkół i końcowy stan danych nie zostały podane.
- Zakres: `MGR-OSK-02` — edycja danych pierwszej szkoły, wybór drugiej jako domyślnej, trwałość po odświeżeniu i ponownym logowaniu oraz kontrola kontekstu w Harmonogramie OSK, Kursach i Instruktorach.

| Scenariusz | Ręcznie (wymagane) | Automatycznie (opcjonalne) | Dowód / uwagi                                                                                                                                                                                                 |
| ---------- | ------------------ | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MGR-OSK-02 | zaliczony          | —                          | Użytkownik potwierdził w rozmowie 2026-10-11, że test działał poprawnie. Nie podał osobnych obserwacji z każdego widoku ani informacji o przywróceniu danych początkowych. Osobnego automatu nie uruchomiono. |

## Podsumowanie

- Ręcznie zaliczonych / niezaliczonych / zablokowanych / niewykonanych: 1 / 0 / 0 / 0.
- Automatycznie zaliczonych / niezaliczonych / bez wyniku / bez próby: 0 / 0 / 0 / 1.
- Decyzja o odbiorze: `MGR-OSK-02` zaliczony zgodnie z wynikiem podanym przez osobę wykonującą test.
- Scenariusze wymagające powtórzenia: brak zgłoszonych dla `MGR-OSK-02`.
