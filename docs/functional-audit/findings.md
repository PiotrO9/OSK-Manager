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

### F-004 — Niepełny stan ładowania pulpitu menedżera po odświeżeniu

| Pole | Wartość |
| --- | --- |
| Typ / waga / status | problem użyteczności / niska / do ponownego testu |
| Scenariusz i wymaganie | obserwacja podczas `COM-01`; wynik ręczny scenariusza pozostaje niewykonany |
| Przebieg | zgłoszenie w trakcie ręcznego audytu; zapis przebiegu po zakończeniu `COM-01` |
| Wersja FE / BE | FE `4e60d51` przed lokalną poprawką; BE bez zmian w tej poprawce |
| Środowisko i zestaw danych | ekran użytkownika po F5; szczegóły środowiska do uzupełnienia przy ponownym teście |
| Konto i rola | testowe konto menedżera |
| Dowód | zrzut ekranu przekazany w rozmowie 2026-10-10; bez przechowywania danych konta w repozytorium |
| Powiązane zadanie naprawcze | `FE/OSK-Manager-FE/app/components/manager/dashboard/ManagerDashboardSkeleton.vue`, `FE/OSK-Manager-FE/app/composables/dashboard/useManagerDashboardPage.ts` |

**Obserwacja:** po F5 przez chwilę widoczny był nagłówek i cztery proste bloki
szkieletu, a dalsza część pulpitu pozostawała pusta. Stan nie komunikował
wyraźnie ładowania danych ani nie odpowiadał układowi docelowych sekcji.

**Oczekiwane zachowanie:** od pierwszego renderu użytkownik widzi informację
o ładowaniu i szkielet obejmujący kartę OSK, skróty, sprawy wymagające uwagi
oraz wolne terminy. Po pobraniu danych szkielet znika.

**Decyzja / poprawka:** stan ładowania domyślnej szkoły zaczyna się od `true`;
osobny komponent pokazuje kompletny szkielet i komunikat. Test UI z opóźnioną
odpowiedzią potwierdził obecność komunikatu w początkowym HTML, widoczność
szkieletu i jego zniknięcie po odpowiedzi. To test z mockiem, bez BE.

**Ponowny test:** potrzebne ręczne odświeżenie pulpitu na docelowym środowisku
testowym, także przy wolniejszym połączeniu i na wąskim ekranie. Dopiero po
obserwacji użytkownika zamknij wpis.

### F-005 — Przejściowy ekran bez roli podczas wylogowania

| Pole | Wartość |
| --- | --- |
| Typ / waga / status | problem użyteczności / niska / do ponownego testu |
| Scenariusz i wymaganie | obserwacja podczas `COM-01` i `COM-04`; wynik ręczny pozostaje niewykonany |
| Przebieg | zgłoszenie w trakcie ręcznego audytu; zapis przebiegu po zakończeniu scenariusza |
| Wersja FE / BE | FE `4e60d51` przed lokalną poprawką; BE bez zmian |
| Środowisko i zestaw danych | pulpit menedżera na `localhost:3000`; szczegóły do uzupełnienia |
| Konto i rola | testowe konto menedżera |
| Dowód | zrzut ekranu przekazany w rozmowie 2026-10-10; test UI odtwarzający chwilowy widok |
| Powiązane zadanie naprawcze | `FE/OSK-Manager-FE/app/composables/auth/useLogout.ts`, `FE/OSK-Manager-FE/app/composables/auth/useAuthSession.ts` |

**Obserwacja:** po kliknięciu „Wyloguj” sesja w pamięci była czyszczona przed
przejściem na `/login`. Pulpit i pasek boczny renderowały się ponownie bez roli,
pokazując „Brak dostępnego pulpitu” oraz ogólnego „Użytkownika”.

**Oczekiwane zachowanie:** po wylogowaniu otwiera się `/login`, bez pośredniego
widoku sugerującego błąd lub brak uprawnień.

**Decyzja / poprawka:** sesja w pamięci pozostaje do chwili opuszczenia strony;
po zakończeniu żądania wylogowania przeglądarka zastępuje bieżący dokument
stroną logowania. Test UI z obserwatorem zmian DOM odtworzył problem przed
zmianą i potwierdził brak pośredniego widoku po zmianie.

**Ponowny test:** ręcznie wyloguj każdą z trzech ról na docelowym środowisku;
sprawdź brak błędnego ekranu, widoczność formularza logowania i brak dostępu
do poprzedniej strony po powrocie w historii.

### F-006 — Karta aktywnej sesji widoczna na stronie logowania

| Pole | Wartość |
| --- | --- |
| Typ / waga / status | problem użyteczności / niska / do ponownego testu |
| Scenariusz i wymaganie | obserwacja podczas `COM-01`; wynik ręczny pozostaje niewykonany |
| Przebieg | zgłoszenie w trakcie ręcznego audytu; zapis przebiegu po zakończeniu scenariusza |
| Wersja FE / BE | FE `4e60d51` przed lokalną poprawką; BE bez zmian |
| Środowisko i zestaw danych | logowanie na `localhost:3000`; szczegóły do uzupełnienia |
| Konto i rola | testowe konto menedżera; poprawka dotyczy wszystkich ról |
| Dowód | zrzut ekranu przekazany w rozmowie 2026-10-10; testy UI i jednostkowe |
| Powiązane zadanie naprawcze | `FE/OSK-Manager-FE/app/components/auth/LoginPanel.vue`, `FE/OSK-Manager-FE/app/composables/auth/useLoginPage.ts`, `FE/OSK-Manager-FE/app/middleware/auth.global.ts` |

**Obserwacja:** po udanym logowaniu sesja była już aktywna, lecz przed
zakończeniem nawigacji formularz zmieniał się w kartę „Zalogowany jako” z
przyciskiem powrotu do aplikacji. Dodatkowo pojawiał się toast „Zalogowano”.
Wejście na `/login` z aktywną sesją pozostawiało użytkownika na tej karcie.

**Oczekiwane zachowanie:** udane logowanie prowadzi do widoku właściwego dla
roli; przy braku domyślnej OSK menedżer trafia do konfiguracji szkoły. Strona
logowania nie pokazuje karty konta ani toasta potwierdzającego zalogowanie.

**Decyzja / poprawka:** strona logowania nie renderuje już karty sesji.
Przekierowanie po logowaniu jest oczekiwane przez obsługę formularza, a
wejście na `/login` z aktywną sesją przekierowuje z middleware. Test UI
potwierdził przejście do widoku menedżera bez karty i toasta w trybie mock.

**Uzupełnienie 2026-10-10:** po pierwszej poprawce karta została zastąpiona
osobnym stanem „Otwieramy pulpit…”, widocznym podczas pobierania domyślnej
szkoły przed nawigacją. Formularz pozostaje teraz na ekranie, a jego przycisk
pokazuje „Logowanie…” aż do przejścia do widoku roli. Test UI z opóźnionym
żądaniem domyślnej szkoły potwierdził ciągłość loadera formularza i brak
pośredniego widoku.

**Ponowny test:** zaloguj ręcznie menedżera, instruktora i kursanta na docelowym
środowisku. Sprawdź właściwe strony startowe, brak karty i toasta oraz zachowanie
po ponownym wejściu na `/login` przy aktywnej sesji.

### F-007 — Zbędne sprawdzenie `/me` po wylogowaniu

| Pole | Wartość |
| --- | --- |
| Typ / waga / status | problem użyteczności / niska / do ponownego testu |
| Scenariusz i wymaganie | obserwacja podczas `COM-01` i `COM-04`; wynik ręczny pozostaje niewykonany |
| Przebieg | zgłoszenie w trakcie ręcznego audytu; zapis przebiegu po zakończeniu scenariusza |
| Wersja FE / BE | FE `4e60d51` przed lokalną poprawką; BE bez zmian |
| Środowisko i zestaw danych | `localhost:3000`, zakładka Network w Chrome |
| Konto i rola | testowe konto menedżera |
| Dowód | zrzut ekranu przekazany w rozmowie 2026-10-10; test UI wykrył `GET /api/auth/me` po `logout` przed poprawką |
| Powiązane zadanie naprawcze | `FE/OSK-Manager-FE/app/middleware/auth.global.ts` |

**Obserwacja:** po `POST /api/auth/logout` strona logowania ponownie wywoływała
`GET /api/auth/me`. Ponieważ ciasteczka sesji były już usunięte, odpowiedź
była `401` i pojawiała się jako nieudane żądanie w narzędziach przeglądarki.

**Oczekiwane zachowanie:** po wylogowaniu formularz logowania otwiera się bez
żądania `/me`. Wejście na `/login` z istniejącą sesją nadal weryfikuje ją i
przekierowuje do widoku roli.

**Decyzja / poprawka:** middleware pomija sprawdzanie sesji na publicznych
stronach uwierzytelniania, jeśli żądanie nie ma ciasteczek sesji. Po stronie
klienta pomija ponowne sprawdzenie, jeśli stan sesji z SSR jest pusty. Test
przeglądarkowy odtworzył zbędne żądanie przed zmianą i potwierdził jego brak
po zmianie.

**Ponowny test:** wyloguj się na docelowym środowisku z otwartą zakładką Network.
Sprawdź brak `/api/auth/me` po `logout` oraz poprawne przekierowanie z `/login`
do widoku roli, gdy sesja jest aktywna.

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
