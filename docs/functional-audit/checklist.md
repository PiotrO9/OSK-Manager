# Checklista audytu funkcjonalnego

To lista kontrolna wszystkich 81 scenariuszy. **Każdy punkt sprawdź ręcznie**
w aplikacji na odizolowanym środowisku. Automat jest dodatkowy i opcjonalny.
Ponowny przebieg automatyczny z 2026-10-16, obejmujący status każdego ID,
zapisano w [osobnym raporcie](runs/2026-10-16-automatic-recheck.md).
Nowszy przebieg z 2026-10-18 obejmuje także pełny stos i wykazał siedem
niezaliczonych automatów ([raport](runs/2026-10-18-all-automatic-recheck.md)).
Kolumna ręczna zaczyna się od `☐` (niewykonany), a automatyczna od `—` (bez próby).
Po udanym teście ręcznym zmień `☐` na `☑ zaliczony` i dodaj odnośnik do
istniejącego pliku przebiegu w `runs/`. Przy innym wyniku wpisz jego nazwę
oraz odnośnik bez zaznaczania pola jako zaliczonego.

**Scalenie dwóch checklist (2026-10-11):** wszystkie 81 ID zachowano. Użytkownik
[potwierdził dziewięć wcześniej spornych wyników](runs/2026-10-11-reconfirmed-manual-results.md):
`COM-01`–`COM-08` oraz `STU-05` są zaliczone. Potwierdził również
[późniejsze wykonanie `COM-13`](runs/2026-10-11-com-13-confirmation.md),
wcześniej błędnie oznaczonego jako wykonany. Następnie
[potwierdził cztery pozostałe sporne wyniki](runs/2026-10-11-reconfirmed-mgr-stu-ins-stu.md):
`MGR-STU-01`, `INS-03`, `STU-03` i `STU-16` są zaliczone. Historyczne pliki
przebiegów zachowano.

Wynik ręczny: `zaliczony`, `niezaliczony`, `zablokowany` albo `niewykonany`.
`Do potwierdzenia` jest stanem porządkowym dla zakwestionowanego wpisu,
a nie zaliczonym wynikiem ręcznym.
Wynik automatyczny: `zaliczony`, `niezaliczony`, `nie udało się`, `pominięty`
albo `—`. Przy `nie udało się` i `pominięty` dodaj w tej samej komórce
**konkretny powód**, np. `nie udało się — środowisko nie uruchomiło FE` lub
`pominięty — ocena czytelności wymaga obserwacji człowieka`. Nie myl awarii
aplikacji z nieudaną próbą uruchomienia automatu. Szczegóły i dowody zapisuj w
`runs/`, a błędy aplikacji w `findings.md`. Kolumna ręczna pozostaje niewykonana,
jeśli istnieje tylko wynik automatyczny. Wyniki z przebiegu 2026-10-08 są
historycznym dowodem automatycznym i nie oznaczają wykonania ręcznego.

## Szybki start — proponowana pierwsza kolejka

1. `COM-02` — walidacja i błędne logowanie.
2. `COM-01` — logowanie trzech ról.
3. `COM-04` — wylogowanie.
4. `COM-03` — powrót na żądaną stronę po zalogowaniu.
5. `STU-05` — zamknięcie dialogu rezerwacji bez zapisu; świeży `booking-ready`.
6. `MGR-OSK-01` — utworzenie pierwszej szkoły; świeży `manager-only`.

Pierwsze cztery testy dotyczą sesji i nie zmieniają danych biznesowych. Dwa
ostatnie wykonuj na osobno przygotowanych zestawach. Ta kolejność pomaga zacząć
od krótkich scenariuszy; nie zastępuje wymaganych danych i kroków w plikach
`scenarios/`.

Podczas wspólnego testowania podaj ID scenariusza. Przed wykonaniem sprawdzamy
środowisko, stan początkowy i oczekiwane wyniki. Następnie wykonujemy kroki
po kolei, zapisujemy obserwacje oraz dowody i dopiero po sprawdzeniu wszystkich
warunków nadajemy wynik ręczny w nowym pliku `runs/` oraz w poniższej tabeli.

## Wspólne — [kroki](scenarios/common.md)

| ID     | Scenariusz                                              | Ręcznie (wymagane)                                                                                                                                                                                     | Automatycznie (opcjonalne) |
| ------ | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------- |
| COM-01 | Logowanie każdej roli i właściwa strona startowa        | ☑ zaliczony ([potwierdzenie 2026-10-11](runs/2026-10-11-reconfirmed-manual-results.md); [przebieg](runs/2026-10-10-com-01-manual.md))                                                                  | —                          |
| COM-02 | Walidacja formularza i błędne dane logowania            | ☑ zaliczony ([potwierdzenie 2026-10-11](runs/2026-10-11-reconfirmed-manual-results.md); [przebieg](runs/2026-10-10-com-02-manual.md))                                                                  | —                          |
| COM-03 | Powrót do żądanej strony po zalogowaniu                 | ☑ zaliczony ([potwierdzenie 2026-10-11](runs/2026-10-11-reconfirmed-manual-results.md); [przebieg FE](runs/2026-10-10-com-03-manual.md), [przebieg z kopii głównej](runs/2026-10-11-com-03-manual.md)) | nie udało się — Docker Engine niedostępny ([przebieg](runs/2026-10-16-automation-start.md)) |
| COM-04 | Wylogowanie kończy dostęp do danych                     | ☑ zaliczony ([potwierdzenie 2026-10-11](runs/2026-10-11-reconfirmed-manual-results.md); [przebieg FE](runs/2026-10-10-com-04-manual.md), [przebieg z kopii głównej](runs/2026-10-11-com-04-manual.md)) | nie udało się — Docker Engine niedostępny ([przebieg](runs/2026-10-16-automation-start.md)) |
| COM-05 | Dostęp według roli, również przez bezpośredni URL       | ☑ zaliczony ([potwierdzenie 2026-10-11](runs/2026-10-11-reconfirmed-manual-results.md); [przebieg](runs/2026-10-11-com-05-manual.md))                                                                  | —                          |
| COM-06 | Własny profil i edycja pól dostępnych dla roli          | ☑ zaliczony ([potwierdzenie 2026-10-11](runs/2026-10-11-reconfirmed-manual-results.md); [przebieg](runs/2026-10-11-com-06-manual.md))                                                                  | —                          |
| COM-07 | Niezapisane zmiany profilu                              | ☑ zaliczony ([potwierdzenie 2026-10-11](runs/2026-10-11-reconfirmed-manual-results.md); [przebieg](runs/2026-10-11-com-07-manual.md))                                                                  | —                          |
| COM-08 | Zdjęcie profilowe i walidacja pliku                     | ☑ zaliczony ([potwierdzenie 2026-10-11](runs/2026-10-11-reconfirmed-manual-results.md); [przebieg](runs/2026-10-11-com-08-manual.md))                                                                  | —                          |
| COM-09 | Wygasła sesja                                           | ☑ zaliczony — potwierdzone przez użytkownika 2026-10-14 ([przebieg](runs/2026-10-14-com-09-manual.md))                                                                                                 | zaliczony w sprawdzonym zakresie ([przebieg 2026-10-14](runs/2026-10-14-com-09-automatic.md)) |
| COM-10 | Izolacja danych kont i OSK                              | ☑ zaliczony ([potwierdzenie 2026-10-14](runs/2026-10-14-com-10-manual.md))                                                                                                                                                                                                      | —                          |
| COM-11 | Samodzielne odzyskanie hasła                            | ☑ zaliczony — potwierdzone przez użytkownika 2026-10-14 ([przebieg ręczny](runs/2026-10-14-com-11-manual.md)) | zaliczony w sprawdzonym zakresie — bez dostarczenia e-maila ([przebieg automatyczny](runs/2026-10-14-com-11-automatic.md)) |
| COM-12 | Brak dostępu dla konta zablokowanego i zarchiwizowanego | ☑ zaliczony — potwierdzone przez użytkownika 2026-10-15 ([przebieg](runs/2026-10-15-com-12-manual.md)) | —                          |
| COM-13 | Dane logowania przed uruchomieniem JavaScript           | ☑ zaliczony ([potwierdzenie](runs/2026-10-11-com-13-confirmation.md); [wcześniejszy wpis](runs/2026-10-11-com-13-manual.md))                                                                           | zaliczony w zakresie UI 1/1; pełny stos: nie udało się — Docker Engine niedostępny ([przebieg](runs/2026-10-16-automation-start.md)) |

## Menedżer OSK — [kroki](scenarios/manager.md)

| ID          | Scenariusz                                      | Ręcznie (wymagane)                                                                                                                                      | Automatycznie (opcjonalne) |
| ----------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| MGR-OSK-01  | Utworzenie pierwszej szkoły                     | ☑ zaliczony ([przebieg 2026-10-11](runs/2026-10-11-mgr-osk-01-manual.md))                                                                               | —                          |
| MGR-OSK-02  | Edycja i wybór szkoły domyślnej                 | ☑ zaliczony ([przebieg 2026-10-11](runs/2026-10-11-mgr-osk-02-manual.md))                                                                               | —                          |
| MGR-OSK-03  | Odrzucenie i potwierdzenie usunięcia OSK        | ☑ zaliczony ([przebieg 2026-10-11](runs/2026-10-11-mgr-osk-03-manual.md))                                                                               | —                          |
| MGR-INS-01  | Rejestracja instruktora                         | ☑ zaliczony ([przebieg 2026-10-11](runs/2026-10-11-mgr-ins-01-manual.md))                                                                               | —                          |
| MGR-INS-02  | Walidacja i niezapisany formularz instruktora   | ☑ zaliczony ([przebieg 2026-10-11](runs/2026-10-11-mgr-ins-02-manual.md))                                                                               | —                          |
| MGR-INS-03  | Edycja profilu i blokada instruktora            | ☑ zaliczony — potwierdzone przez użytkownika 2026-10-14 ([przebieg](runs/2026-10-14-mgr-ins-03-manual.md))                                               | —                          |
| MGR-INS-04  | Tygodniowa dostępność instruktora               | ☑ zaliczony ([przebieg 2026-10-11](runs/2026-10-11-mgr-ins-04-manual.md))                                                                               | —                          |
| MGR-INS-05  | Terminarz i wolne sloty instruktora             | ☑ zaliczony — potwierdzone przez użytkownika 2026-10-14 ([przebieg](runs/2026-10-14-mgr-ins-05-manual.md)) | — |
| MGR-CRS-01  | Utworzenie kursu                                | ☑ zaliczony ([przebieg 2026-10-11](runs/2026-10-11-mgr-crs-01-manual.md))                                                                               | —                          |
| MGR-CRS-02  | Walidacja kursu i ograniczenie instruktora      | ☑ zaliczony ([przebieg 2026-10-11](runs/2026-10-11-mgr-crs-02-manual.md))                                                                               | —                          |
| MGR-CRS-03  | Zmiana instruktora i przegląd uczestników kursu | ☑ zaliczony ([przebieg 2026-10-11](runs/2026-10-11-mgr-crs-03-manual.md))                                                                               | —                          |
| MGR-CRS-04  | Usunięcie pustego kursu i ochrona historii      | ☑ zaliczony ([przebieg 2026-10-11](runs/2026-10-11-mgr-crs-04-manual.md))                                                                               | —                          |
| MGR-STU-01  | Rejestracja kursanta i przypisanie do kursu     | ☑ zaliczony ([potwierdzenie 2026-10-11](runs/2026-10-11-reconfirmed-mgr-stu-ins-stu.md); [wcześniejszy przebieg](runs/2026-10-11-mgr-stu-01-manual.md)) | —                          |
| MGR-STU-02  | Wyszukiwanie, filtrowanie i szczegóły kursanta  | ☑ zaliczony — potwierdzone przez użytkownika 2026-10-14 ([przebieg](runs/2026-10-14-mgr-stu-02-manual.md)) | — |
| MGR-PAY-01  | Dodanie, edycja i rozliczenie płatności         | ☑ zaliczony — potwierdzone przez użytkownika 2026-10-14 ([przebieg](runs/2026-10-14-mgr-pay-01-manual.md)) | zaliczony w zakresie UI na mocku, 2/2 ([ponowny przebieg](runs/2026-10-18-mgr-pay-01-ui-retest.md)); test płatności ponowiony 1/1 ([potwierdzenie](runs/2026-10-18-mgr-pay-01-ui-confirmation.md)) |
| MGR-VEH-01  | Dodanie i edycja pojazdu                        | ☑ zaliczony ([przebieg 2026-10-11](runs/2026-10-11-mgr-veh-01-manual.md))                                                                               | —                          |
| MGR-VEH-02  | Status, domyślny pojazd i usunięcie             | ☑ zaliczony ([przebieg 2026-10-11](runs/2026-10-11-mgr-veh-02-manual.md))                                                                               | —                          |
| MGR-SCH-01  | Tygodniowy harmonogram OSK i wybór szkoły       | ☑ zaliczony — potwierdzone przez użytkownika 2026-10-14 ([przebieg](runs/2026-10-14-mgr-sch-01-manual.md)) | — |
| MGR-LES-01  | Rezerwacja jazdy przez menedżera                | ☑ zaliczony ([przebieg 2026-10-11](runs/2026-10-11-mgr-les-01-manual.md))                                                                               | —                          |
| MGR-LES-02  | Konflikt rezerwacji i niedostępny pojazd        | ☑ zaliczony — potwierdzone przez użytkownika 2026-10-15 ([przebieg](runs/2026-10-15-mgr-les-02-manual.md)) | — |
| MGR-LES-03  | Edycja jazdy i zmiana instruktora               | ☑ zaliczony — potwierdzone przez użytkownika 2026-10-15 ([przebieg](runs/2026-10-15-mgr-les-03-manual.md)) | zaliczony w zakresie UI na mocku, 2/2 ([ponowny przebieg](runs/2026-10-18-mgr-les-03-ui-retest.md)) |
| MGR-LES-04  | Anulowanie jazdy                                | ☑ zaliczony — potwierdzone przez użytkownika 2026-10-15 ([przebieg](runs/2026-10-15-mgr-les-04-manual.md)) | — |
| MGR-EVT-01  | Blok teorii i uczestnicy                        | ☑ zaliczony — potwierdzone przez użytkownika 2026-10-15 ([przebieg](runs/2026-10-15-mgr-evt-01-manual.md)) | —                          |
| MGR-EVT-02  | Zmiana statusu, edycja i usunięcie bloku        | ☑ zaliczony — potwierdzone przez użytkownika 2026-10-15 ([przebieg](runs/2026-10-15-mgr-evt-02-manual.md)) | — |
| MGR-ACC-01  | Lista kont i granica szkoły                     | ☑ zaliczony — potwierdzone przez użytkownika 2026-10-14 ([przebieg](runs/2026-10-14-mgr-acc-01-manual.md)) | API 20/20 — zaliczony sprawdzony zakres ([przebieg](runs/2026-10-14-mgr-acc-01-api.md)) |
| MGR-ACC-02  | Dane podstawowe i zmiana e-maila                | ☑ zaliczony — potwierdzone przez użytkownika 2026-10-15 ([przebieg](runs/2026-10-15-mgr-acc-02-manual.md)) | —                          |
| MGR-ACC-03  | Blokada i odblokowanie konta                    | ☑ zaliczony — potwierdzone przez użytkownika 2026-10-14 ([przebieg](runs/2026-10-14-mgr-acc-03-manual.md)) | —                          |
| MGR-ACC-04  | Wysłanie resetu hasła                           | ☑ zaliczony — potwierdzone przez użytkownika 2026-10-15 ([przebieg](runs/2026-10-15-mgr-acc-04-manual.md)) | —                          |
| MGR-ACC-05  | Archiwizacja konta i aktywne zobowiązania       | ☑ zaliczony — potwierdzone przez użytkownika 2026-10-15 ([przebieg](runs/2026-10-15-mgr-acc-05-manual.md)) | —                          |
| MGR-REV-01  | Opinie o zakończonych jazdach                   | ☑ zaliczony — potwierdzone przez użytkownika 2026-10-14 ([przebieg](runs/2026-10-14-mgr-rev-01-manual.md)) | — |
| MGR-DASH-01 | Pulpit i elementy wymagające uwagi              | ☑ zaliczony — potwierdzone przez użytkownika 2026-10-14 ([przebieg](runs/2026-10-14-mgr-dash-01-manual.md)) | — |
| MGR-MOB-01  | Podstawowe zadania menadżera na wąskim ekranie  | ☑ zaliczony — potwierdzone przez użytkownika 2026-10-14 ([przebieg](runs/2026-10-14-mgr-mob-01-manual.md)) | — |

## Instruktor — [kroki](scenarios/instructor.md)

| ID     | Scenariusz                                          | Ręcznie (wymagane)                                                                                                                                  | Automatycznie (opcjonalne) |
| ------ | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| INS-01 | Panel instruktora i skróty                          | ☑ zaliczony — potwierdzone przez użytkownika 2026-10-14 ([przebieg](runs/2026-10-14-ins-01-manual.md))                                              | —                          |
| INS-02 | Tygodniowy terminarz: lista, kalendarz i nawigacja  | ☑ zaliczony — potwierdzone przez użytkownika 2026-10-14 ([przebieg](runs/2026-10-14-ins-02-manual.md))                                              | —                          |
| INS-03 | Pusty tydzień w terminarzu                          | ☑ zaliczony ([potwierdzenie 2026-10-11](runs/2026-10-11-reconfirmed-mgr-stu-ins-stu.md); [wcześniejszy przebieg](runs/2026-10-11-ins-03-manual.md)) | —                          |
| INS-04 | Zmiana statusu własnego wydarzenia                  | ☑ zaliczony — potwierdzone przez użytkownika 2026-10-14 ([przebieg](runs/2026-10-14-ins-04-manual.md))                                              | —                          |
| INS-05 | Wydarzenia dnia, daty i filtr statusu               | ☑ zaliczony — potwierdzone przez użytkownika 2026-10-14 ([przebieg](runs/2026-10-14-ins-05-manual.md))                                              | —                          |
| INS-06 | Opinie o własnych lekcjach, filtr i anonimowość     | ☑ zaliczony — potwierdzone przez użytkownika 2026-10-14 ([przebieg](runs/2026-10-14-ins-06-manual.md))                                              | —                          |
| INS-07 | Stronicowanie opinii                                | ☑ zaliczony — potwierdzone przez użytkownika 2026-10-14 ([przebieg](runs/2026-10-14-ins-07-manual.md))                                              | —                          |
| INS-08 | Błąd odczytu i ponowienie                           | ☑ zaliczony — potwierdzone przez użytkownika 2026-10-14 ([przebieg](runs/2026-10-14-ins-08-manual.md)) | — |
| INS-09 | Własność danych i uprawnienia do operacji menedżera | ☑ zaliczony — użytkownik potwierdził ręczny test 2026-10-14 ([przebieg](runs/2026-10-14-ins-09-manual.md)) | ☑ sprawdzone przez Codex 2026-10-14 ([przebieg](runs/2026-10-14-ins-09-manual.md)) |
| INS-10 | Nieudany zapis statusu wydarzenia                   | ☑ zaliczony — potwierdzone przez użytkownika 2026-10-14 ([przebieg](runs/2026-10-14-ins-10-manual.md)) | — |
| INS-11 | Praca instruktora na wąskim ekranie                 | ☑ zaliczony — potwierdzone przez użytkownika 2026-10-14 ([przebieg](runs/2026-10-14-ins-11-manual.md))                                              | —                          |

## Kursant — [kroki](scenarios/student.md)

| ID     | Scenariusz                                          | Ręcznie (wymagane)                                                                                                                                                                                     | Automatycznie (opcjonalne)                                |
| ------ | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------- |
| STU-01 | Pulpit kursanta pokazuje jego najważniejsze dane    | ☑ zaliczony — potwierdzone przez użytkownika 2026-10-14 ([przebieg](runs/2026-10-14-stu-01-manual.md))                                                                                                 | —                                                         |
| STU-02 | Kursy, postęp i filtry                              | ☑ zaliczony — potwierdzone przez użytkownika 2026-10-11 ([przebieg](runs/2026-10-11-stu-02-browser.md))                                                                                                | zaliczony ([przebieg](runs/2026-10-11-stu-02-browser.md)) |
| STU-03 | Brak kursów oraz pusty wynik filtra                 | ☑ zaliczony ([potwierdzenie 2026-10-11](runs/2026-10-11-reconfirmed-mgr-stu-ins-stu.md); [wcześniejszy przebieg](runs/2026-10-11-stu-03-manual.md))                                                    | —                                                         |
| STU-04 | Rezerwacja dostępnego terminu                       | ☑ zaliczony — potwierdzone przez użytkownika 2026-10-14 ([przebieg](runs/2026-10-14-stu-04-stu-11-manual.md)) | —                                                         |
| STU-05 | Rezygnacja w dialogu potwierdzenia                  | ☑ zaliczony ([potwierdzenie 2026-10-11](runs/2026-10-11-reconfirmed-manual-results.md); [przebieg FE](runs/2026-10-10-stu-05-manual.md), [przebieg z kopii głównej](runs/2026-10-11-stu-05-manual.md)) | —                                                         |
| STU-06 | Kurs nieuprawniony do rezerwacji | ☑ zaliczony — potwierdzone przez użytkownika 2026-10-14 ([przebieg](runs/2026-10-14-stu-06-manual.md)) | — |
| STU-07 | Slot dłuższy niż pozostały pakiet                   | ☑ zaliczony — potwierdzone przez użytkownika 2026-10-14 ([przebieg](runs/2026-10-14-stu-07-manual.md)) | —                                                         |
| STU-08 | Nawigacja tygodni, brak slotów i granice rezerwacji | ☑ zaliczony — potwierdzone przez użytkownika 2026-10-14 ([przebieg](runs/2026-10-14-stu-08-manual.md)) | —                                                         |
| STU-09 | Termin zajęty między wyświetleniem a potwierdzeniem | ☑ zaliczony — potwierdzone przez użytkownika 2026-10-14 ([przebieg](runs/2026-10-14-stu-09-manual.md)) | — |
| STU-10 | Własny harmonogram w kalendarzu i na liście         | ☑ zaliczony — potwierdzone przez użytkownika 2026-10-11 ([przebieg](runs/2026-10-11-stu-10-browser.md))                                                                                                | zaliczony ([przebieg](runs/2026-10-11-stu-10-browser.md)) |
| STU-11 | Anulowanie przyszłej jazdy                          | ☑ zaliczony — potwierdzone przez użytkownika 2026-10-14 ([przebieg](runs/2026-10-14-stu-04-stu-11-manual.md)) | —                                                         |
| STU-12 | Wyjście z dialogu anulowania i lekcje nieanulowalne | ☑ zaliczony — potwierdzone przez użytkownika 2026-10-11 ([przebieg](runs/2026-10-11-stu-12-manual.md))                                                                                                 | —                                                         |
| STU-13 | Ocena zakończonej jazdy                             | ☑ zaliczony — potwierdzone przez użytkownika 2026-10-14 ([przebieg](runs/2026-10-14-stu-13-manual.md))                                                                                                 | —                                                         |
| STU-14 | Walidacja i niedostępność ponownej oceny            | ☑ zaliczony — potwierdzone przez użytkownika 2026-10-14 ([przebieg](runs/2026-10-14-stu-14-manual.md))                                                                                                 | —                                                         |
| STU-15 | Własne opłaty, statusy i filtry                     | ☑ zaliczony — potwierdzone przez użytkownika 2026-10-14 ([przebieg](runs/2026-10-14-stu-15-manual.md))                                                                                                 | —                                                         |
| STU-16 | Brak opłat                                          | ☑ zaliczony ([potwierdzenie 2026-10-11](runs/2026-10-11-reconfirmed-mgr-stu-ins-stu.md); [wcześniejszy przebieg](runs/2026-10-11-stu-16-manual.md))                                                    | —                                                         |
| STU-17 | Numer PKK na koncie                                 | ☑ zaliczony — potwierdzone przez użytkownika 2026-10-11 ([przebieg](runs/2026-10-11-stu-17-manual.md))                                                                                                 | —                                                         |
| STU-18 | Błąd pobierania danych i ponowienie                 | ☑ zaliczony — potwierdzone przez użytkownika 2026-10-14 ([przebieg](runs/2026-10-14-stu-18-manual.md)) | —                                                         |
| STU-19 | Rezerwacja i opłaty na wąskim ekranie               | ☑ zaliczony — potwierdzone przez użytkownika 2026-10-14 ([przebieg](runs/2026-10-14-stu-19-manual.md)) | — |

## Między rolami — [kroki](scenarios/cross-role.md)

| ID    | Scenariusz                                                   | Ręcznie (wymagane)                                                                                    | Automatycznie (opcjonalne) |
| ----- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- | -------------------------- |
| XR-01 | Od nowego OSK do kursu widocznego dla kursanta               | ☑ zaliczony — potwierdzone przez użytkownika 2026-10-14 ([przebieg](runs/2026-10-14-xr-01-manual.md)) | —                          |
| XR-02 | Rezerwacja jazdy widoczna w trzech rolach                    | ☑ zaliczony — potwierdzone przez użytkownika 2026-10-14 ([przebieg](runs/2026-10-14-xr-02-manual.md)) | —                          |
| XR-03 | Zmiana lub anulowanie jazdy aktualizuje wszystkie widoki     | ☑ zaliczony — potwierdzone przez użytkownika 2026-10-14 ([przebieg](runs/2026-10-14-xr-03-manual.md)) | —                          |
| XR-04 | Opłata menadżera widoczna dla kursanta                       | ☑ zaliczony — potwierdzone przez użytkownika 2026-10-14 ([przebieg](runs/2026-10-14-xr-04-manual.md)) | —                          |
| XR-05 | Ocena zakończonej jazdy widoczna dla instruktora i menadżera | ☑ zaliczony — potwierdzone przez użytkownika 2026-10-14 ([przebieg](runs/2026-10-14-xr-05-manual.md)) | —                          |
| XR-06 | Izolacja danych między szkołami                              | ☑ zaliczony ([potwierdzenie 2026-10-14](runs/2026-10-14-xr-06-manual.md))                                                                                                     | —                          |
