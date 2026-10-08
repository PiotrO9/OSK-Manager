# Rejestr ustaleń audytu

Ten plik zbiera problemy wykryte podczas wykonywania scenariuszy. Wynik konkretnego
przebiegu zapisuje się osobno w `runs/` i odsyła do identyfikatora ustalenia.
Ponowne wystąpienie tego samego problemu dopisuje się do istniejącego wpisu.
Nowe pomysły funkcjonalne zapisuje się w `../../../../docs/APP_CHANGE_NOTES.md`.

## Zasady

- ID: `F-001`, `F-002` itd.; ID pozostaje stałe także po zamknięciu problemu.
- Typ: `podejrzenie błędu`, `błąd`, `niejasna reguła`, `problem użyteczności`
  albo `blokada środowiska`.
- Waga: `blokująca` (podstawowy proces niemożliwy lub naruszenie dostępu/danych),
  `wysoka` (istotna funkcja nie działa), `średnia` (istnieje obejście) albo
  `niska` (drobna usterka bez wpływu na wykonanie zadania).
- Status: `do weryfikacji`, `nowy`, `do decyzji`, `w naprawie`, `do ponownego testu`, `zamknięty`
  albo `odłożony` z uzasadnieniem.
- Przed otwarciem nowego wpisu sprawdź, czy ten sam objaw i przyczyna nie są już
  opisane. Nie umieszczaj haseł, tokenów ani danych osobowych w dowodach.
- Jeśli oczekiwane zachowanie jest nierozstrzygnięte, użyj typu `niejasna reguła`.
  Nie oznaczaj scenariusza jako zaliczonego lub niezaliczonego przed decyzją.

## Wzór wpisu

### F-XXX — Krótki opis objawu

| Pole                        | Wartość                                     |
| --------------------------- | ------------------------------------------- |
| Typ / waga / status         | błąd / wysoka / nowy                        |
| Scenariusz i wymaganie      | `STU-...`, `REQ-STU-...`                    |
| Przebieg                    | `runs/YYYY-MM-DD-...md`                     |
| Wersja FE / BE              | commit lub identyfikator wydania            |
| Środowisko i zestaw danych  | identyfikator środowiska / `booking-ready`  |
| Konto i rola                | identyfikator konta testowego / kursant     |
| Dowód                       | link do zrzutu, trace lub logu bez sekretów |
| Powiązane zadanie naprawcze | link lub identyfikator, jeśli istnieje      |

**Warunki początkowe:**

1. Opisz stan konieczny do odtworzenia.

**Kroki odtworzenia:**

1. Wykonaj konkretną czynność w aplikacji.
2. Wykonaj następną czynność.

**Oczekiwane zachowanie:** Opisz wynik możliwy do zaobserwowania.

**Rzeczywisty wynik:** Opisz dokładny objaw, komunikat i wpływ na zadanie.

**Wystąpienia:** Data i identyfikatory kolejnych przebiegów.

**Decyzja / naprawa:** Co ustalono lub zmieniono, z odnośnikiem.

**Ponowny test:** Data, wersja, scenariusz, wynik i dowód. Zamknij wpis dopiero
po powtórzeniu scenariusza oraz istotnych procesów powiązanych.

---

## Otwarte ustalenia

### F-001 — Procent postępu użyty jako liczba wykorzystanych godzin

| Pole                       | Wartość                                                                                                                                                                                                                  |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Typ / waga / status        | podejrzenie błędu / wysoka / do weryfikacji                                                                                                                                                                              |
| Scenariusz i wymaganie     | `STU-04`, `STU-06`, `STU-07`; `REQ-STU-BOOK-ELIGIBILITY`                                                                                                                                                                 |
| Przebieg                   | brak — ustalenie z przeglądu kodu, test manualny niewykonany                                                                                                                                                             |
| Wersja FE / BE             | FE `581d56e24d1f21e594605e9d4aa22dc02fba2999`; BE `cf191dda8f1529fc996edfd20b63b0e1d37c2de6`                                                                                                                             |
| Środowisko i zestaw danych | planowany `booking-hours-low`                                                                                                                                                                                            |
| Dowód                      | `BE/src/services/course/progress.ts`, `BE/src/services/course/queries.ts`, `FE/OSK-Manager-FE/app/composables/lessons/useStudentLessonBookingPage.ts`, `FE/OSK-Manager-FE/app/utils/student/studentLessonBookingPage.ts` |

**Obserwacja:** backend liczy `progress` jako procent ukończonych minut względem
całego kursu (`0–100`). Frontend oblicza pozostałe godziny jako
`totalHours - progress` i używa wyniku do ograniczania wyboru slotu. Dla kursu
30-godzinnego z 15 zakończonymi godzinami backend zwróci `progress=50`,
a frontend pokaże `0` pozostałych godzin. Backend sprawdza limit według minut
wszystkich nieanulowanych jazd. Te różne jednostki mogą dawać sprzeczny wynik.

**Oczekiwane zachowanie:** widoczna liczba pozostałych godzin i możliwość
rezerwacji są zgodne z regułą limitu kursu; jednostki postępu i godzin są
rozróżnione.

**Do wykonania:** przygotuj kurs z kontrolowaną liczbą godzin zakończonych
i zaplanowanych, wykonaj wskazane scenariusze, zapisz rzeczywisty wynik i
rozstrzygnij kontrakt postępu. Nie oznaczaj tego wpisu jako potwierdzonego
błędu z testu manualnego przed wykonaniem przebiegu.

## Zamknięte ustalenia

### F-002 — Hasło w adresie URL po wysłaniu formularza przed hydracją

| Pole                        | Wartość                                                                                                                         |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Typ / waga / status         | błąd / blokująca / zamknięty                                                                                                    |
| Scenariusz i wymaganie      | `COM-13`, `REQ-COM-13`                                                                                                          |
| Przebieg                    | `runs/2026-10-08-local-integration.md`                                                                                          |
| Wersja FE / BE              | FE `581d56e` + zmiany robocze; BE `cf191dd` + zmiany robocze                                                                    |
| Środowisko i zestaw danych  | lokalny Supabase + `school-operational` v1                                                                                      |
| Konto i rola                | testowe konto menadżera                                                                                                         |
| Dowód                       | pierwsza próba E2E full: przekierowanie na `/login` z parametrami formularza; powtórka E2E full 3/3 i E2E UI 1/1 bez parametrów |
| Powiązane zadanie naprawcze | `FE/OSK-Manager-FE/app/components/auth/LoginForm.vue`                                                                           |

**Warunki początkowe:** strona logowania otwarta, formularz widoczny, kod klienta
nie przejął jeszcze wysłania formularza.

**Kroki odtworzenia:** wypełnij testowe dane i wyślij formularz przed hydracją.

**Oczekiwane zachowanie:** hasło nie pojawia się w URL ani w historii przeglądarki.

**Rzeczywisty wynik przed naprawą:** przeglądarka wykonała natywny GET z polami
`email` i `password` w adresie. Wartości nie zostały zapisane w rejestrze.

**Wystąpienia:** 2026-10-08, pierwsza próba lokalnego testu E2E full.

**Decyzja / naprawa:** formularz ma metodę POST, a przycisk wysyłania jest
nieaktywny do czasu hydracji. Kod klienta nadal przejmuje poprawne wysłanie.

**Ponowny test:** 2026-10-08, test bez skryptów potwierdził metodę POST,
nieaktywny przycisk i czysty URL; test z prawdziwym BE/Auth/DB potwierdził
logowanie i wylogowanie każdej z trzech ról. Wynik zaliczony.

### F-003 — Brak możliwości dodania pierwszej opłaty do planu

| Pole                        | Wartość                                                                                                                  |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Typ / waga / status         | błąd / wysoka / zamknięty                                                                                                |
| Scenariusz i wymaganie      | `MGR-PAY-01`, `XR-04`; `REQ-MGR-PAY-01`, `REQ-XR-04`                                                                     |
| Przebieg                    | `runs/2026-10-08-local-integration.md`                                                                                   |
| Wersja FE / BE              | FE `581d56e` + zmiany robocze; BE `cf191dd` + zmiany robocze                                                             |
| Środowisko i zestaw danych  | lokalny Supabase, `payment-ready` v1                                                                                     |
| Konto i rola                | testowe konto menadżera i kursanta                                                                                       |
| Dowód                       | przegląd `ManagerStudentPaymentsSection.vue` i `paymentsQueries.ts`; po naprawie E2E full @audit płatności 1/1           |
| Powiązane zadanie naprawcze | `BE/src/services/students/paymentsQueries.ts`, `FE/OSK-Manager-FE/app/composables/students/useManagerStudentPayments.ts` |

**Warunki początkowe:** kursant jest zapisany do kursu z planem płatności, ale
plan nie ma żadnej opłaty.

**Kroki odtworzenia:** otwórz kartę płatności kursanta i spróbuj dodać pierwszą
opłatę do istniejącego planu.

**Oczekiwane zachowanie:** plan jest dostępny w formularzu, a menadżer może
dodać pierwszą opłatę.

**Rzeczywisty wynik przed naprawą:** lista planów w UI była budowana wyłącznie
z istniejących opłat. Przy pustej liście opłat brakowało opcji planu i formularz
nie pozwalał zapisać nowego wpisu. Ustalenie pochodzi z analizy kodu; nie było
osobnego przebiegu przeglądarkowego przed naprawą.

**Wystąpienia:** 2026-10-08, przygotowanie `payment-ready` i testu E2E.

**Decyzja / naprawa:** API zwraca `paymentPlans` niezależnie od opłat, ograniczone
do kursów kursanta w wybranym OSK. FE korzysta z tej listy w formularzu.

**Ponowny test:** 2026-10-08, lokalne `payment-ready`, test rzeczywistego FE,
BE, Auth i DB: dodanie pierwszej opłaty, edycja, zmiana statusu oraz widok
kursanta po odświeżeniu — 1/1 zaliczony.
