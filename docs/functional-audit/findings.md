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

Brak otwartych ustaleń.

## Zamknięte ustalenia

### F-010 — Mylący komunikat przy logowaniu bez potwierdzonego e-maila

| Pole | Wartość |
| --- | --- |
| Typ / waga / status | błąd / średnia / zamknięty po ponownym teście ręcznym |
| Scenariusz i wymaganie | `MGR-INS-01`, `COM-01`; `REQ-MGR-INS-01`, `REQ-COM-01` |
| Przebieg | zgłoszenie użytkownika podczas testu `MGR-INS-01` 2026-10-11; [ponowny test F-010](runs/2026-10-16-f-010-retest.md) |
| Wersja FE / BE | FE `72c7860` i zmiany robocze przed poprawką; ponowny test na FE `1a1f34a`; BE bez zmian w tej poprawce |
| Środowisko i zestaw danych | `localhost:3000`, nowo utworzone konto instruktora z niepotwierdzonym adresem |
| Konto i rola | testowe konto instruktora |
| Dowód | zrzut ekranu w rozmowie 2026-10-11; odpowiedź logowania `401 Email not confirmed`, formularz pokazuje „Nieprawidłowy e-mail lub hasło” |
| Powiązane zadanie naprawcze | `app/composables/auth/useAuthSession.ts`, `app/composables/auth/useAuthSession.test.ts` |

**Oczekiwane zachowanie:** formularz informuje o konieczności potwierdzenia adresu e-mail. Błędne hasło nadal daje neutralny komunikat o niepoprawnych danych.

**Przyczyna i poprawka:** backend oraz BFF przekazywały „Email not confirmed”, ale klient zamieniał każdą odpowiedź `401` na błąd danych logowania. Klient rozpoznaje teraz ten konkretny komunikat i pokazuje „Potwierdź adres e-mail, aby się zalogować.” Test jednostkowy pokrywa oba warianty odpowiedzi `401`.

**Ponowny test:** testy jednostkowe FE przeszły. 2026-10-16 użytkownik polecił
oznaczyć punkt jako zaliczony; wynik zapisano w [przebiegu F-010](runs/2026-10-16-f-010-retest.md).
Nie przekazał osobnego zapisu obserwacji poszczególnych prób.

### F-009 — Natywne potwierdzenie przy opuszczaniu edycji profilu w aplikacji

| Pole | Wartość |
| --- | --- |
| Typ / waga / status | problem użyteczności / niska / zamknięte po teście ręcznym |
| Scenariusz i wymaganie | `COM-07`, `REQ-COM-07` |
| Przebieg | zgłoszenie i ponowny test użytkownika 2026-10-11; `COM-07` zaliczony ([przebieg](runs/2026-10-11-com-07-manual.md)) |
| Wersja FE / BE | FE `d963b61` przed poprawką; BE bez zmian |
| Środowisko i zestaw danych | `localhost:3000`, konto menedżera z edytowalnym profilem |
| Konto i rola | testowe konto menedżera |
| Dowód | zrzut ekranu przekazany w rozmowie 2026-10-11; widać natywne `window.confirm` |
| Powiązane zadanie naprawcze | `app/composables/account/useAccountInlineProfileEdit.ts`, `app/components/account/AccountDiscardChangesDialog.vue`, `app/pages/account/index.vue` |

**Obserwacja:** nawigacja z niezapisanym profilem otwierała natywne okno
`window.confirm`. Użytkownik potwierdził działanie ochrony danych, lecz oczekuje
spójnego z aplikacją modala.

**Oczekiwane zachowanie:** nawigacja wewnętrzna pokazuje projektowy modal
z opcjami „Zostań” oraz „Odrzuć zmiany”. „Anuluj” w formularzu od razu
odrzuca zmiany i zamyka edycję. F5 i zamknięcie karty nadal pokazują
natywne ostrzeżenie przeglądarki.

**Decyzja / poprawka:** zastąpiono `window.confirm` przez `UiDialog` i
asynchroniczne potwierdzenie w strażniku routingu. „Anuluj” przywraca wartości
bez dodatkowego pytania. Test jednostkowy potwierdził zachowanie szkicu przy
„Zostań” i odrzucenie zmian po kliknięciu „Anuluj”. Sprawdzenie
w przeglądarce na `localhost:3000` potwierdziło modal, nawigację i brak zapisu
testowej zmiany.

**Ponowny test:** użytkownik potwierdził w rozmowie, że scenariusz przechodzi
poprawnie po zmianie działania „Anuluj”. Szczegółowych obserwacji każdego
kroku nie podał.

### F-004 — Niepełny stan ładowania pulpitu menedżera po odświeżeniu

| Pole | Wartość |
| --- | --- |
| Typ / waga / status | problem użyteczności / niska / zamknięty po ponownym teście ręcznym |
| Scenariusz i wymaganie | obserwacja podczas `COM-01`; późniejszy wynik ręczny `COM-01`: zaliczony ([przebieg](runs/2026-10-10-com-01-manual.md)); osobny [ponowny test](runs/2026-10-16-f-004-retest.md) |
| Przebieg | zgłoszenie w trakcie ręcznego audytu; późniejszy wynik `COM-01` w [przebiegu 2026-10-10](runs/2026-10-10-com-01-manual.md); [ponowny test F-004](runs/2026-10-16-f-004-retest.md) |
| Wersja FE / BE | FE `4e60d51` przed lokalną poprawką; ponowny test na FE `3d76f30` z lokalną poprawką napisu; BE bez zmian w tej poprawce |
| Środowisko i zestaw danych | lokalna aplikacja `localhost:3000`, pulpit po F5 z wolniejszym połączeniem i na wąskim ekranie |
| Konto i rola | menedżer `manager001@post.pl` |
| Dowód | zrzut ekranu przekazany w rozmowie 2026-10-10; bez przechowywania danych konta w repozytorium |
| Powiązane zadanie naprawcze | `FE/OSK-Manager-FE/app/components/manager/dashboard/ManagerDashboardSkeleton.vue`, `FE/OSK-Manager-FE/app/composables/dashboard/useManagerDashboardPage.ts` |

**Obserwacja:** po F5 przez chwilę widoczny był nagłówek i cztery proste bloki
szkieletu, a dalsza część pulpitu pozostawała pusta. Stan nie komunikował
wyraźnie ładowania danych ani nie odpowiadał układowi docelowych sekcji.

**Oczekiwane zachowanie:** od pierwszego renderu użytkownik widzi szkielet
obejmujący kartę OSK, skróty, sprawy wymagające uwagi oraz wolne terminy.
Po pobraniu danych szkielet znika.

**Decyzja / poprawka:** stan ładowania domyślnej szkoły zaczyna się od `true`;
osobny komponent pokazuje kompletny szkielet. Test UI z opóźnioną
odpowiedzią potwierdził widoczność szkieletu i jego zniknięcie po odpowiedzi.
Po uwadze użytkownika usunięto widoczny napis „Ładowanie danych pulpitu…”;
zachowano dostępną nazwę stanu ładowania. To test z mockiem, bez BE.

**Ponowny test:** użytkownik potwierdził w rozmowie, że szkielet działa
poprawnie, a następnie poprosił o usunięcie widocznego napisu ładowania.
Po tej poprawce polecił zamknąć punkt. Zakres instrukcji i wynik zapisano
w [przebiegu F-004](runs/2026-10-16-f-004-retest.md); nie przekazano osobnego
zapisu obserwacji każdego kroku po zmianie napisu.

### F-007 — Zbędne sprawdzenie `/me` po wylogowaniu

| Pole | Wartość |
| --- | --- |
| Typ / waga / status | problem użyteczności / niska / zamknięty po ponownym teście ręcznym |
| Scenariusz i wymaganie | obserwacja podczas `COM-01` i `COM-04`; oba scenariusze zaliczone ręcznie ([COM-01](runs/2026-10-10-com-01-manual.md), [COM-04](runs/2026-10-10-com-04-manual.md)); osobny [ponowny test](runs/2026-10-16-f-007-retest.md) |
| Przebieg | zgłoszenie w trakcie ręcznego audytu; późniejszy wynik `COM-01` w [przebiegu 2026-10-10](runs/2026-10-10-com-01-manual.md); [ponowny test F-007](runs/2026-10-16-f-007-retest.md) |
| Wersja FE / BE | FE `4e60d51` przed lokalną poprawką; ponowny test na FE `85269f7`; BE bez zmian w tej poprawce |
| Środowisko i zestaw danych | lokalna aplikacja `localhost:3000`, karta Sieć w Chrome |
| Konto i rola | menedżer `manager001@post.pl` |
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

**Ponowny test:** 2026-10-16 użytkownik potwierdził, że test przeszedł
pomyślnie. Zakres instrukcji i wynik zapisano w [przebiegu F-007](runs/2026-10-16-f-007-retest.md).
Nie przekazano osobnego zapisu żądań ani obserwacji każdego kroku.

### F-006 — Karta aktywnej sesji widoczna na stronie logowania

| Pole | Wartość |
| --- | --- |
| Typ / waga / status | problem użyteczności / niska / zamknięty po ponownym teście ręcznym |
| Scenariusz i wymaganie | obserwacja podczas `COM-01`; późniejszy wynik ręczny `COM-01`: zaliczony ([przebieg](runs/2026-10-10-com-01-manual.md)); osobny [ponowny test](runs/2026-10-16-f-006-retest.md) |
| Przebieg | zgłoszenie w trakcie ręcznego audytu; późniejszy wynik `COM-01` w [przebiegu 2026-10-10](runs/2026-10-10-com-01-manual.md); [ponowny test F-006](runs/2026-10-16-f-006-retest.md) |
| Wersja FE / BE | FE `4e60d51` przed lokalną poprawką; ponowny test na FE `c15d423`; BE bez zmian w tej poprawce |
| Środowisko i zestaw danych | lokalna aplikacja `localhost:3000`; konta trzech ról wskazane w instrukcji testu |
| Konto i rola | `manager001@post.pl`, `instructor001@post.pl`, `student001@post.pl` |
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

**Ponowny test:** 2026-10-16 użytkownik potwierdził, że test przeszedł
pomyślnie. Zakres instrukcji i wynik zapisano w [przebiegu F-006](runs/2026-10-16-f-006-retest.md).
Nie przekazano osobnego zapisu obserwacji każdego kroku.

### F-005 — Przejściowy ekran bez roli podczas wylogowania

| Pole | Wartość |
| --- | --- |
| Typ / waga / status | problem użyteczności / niska / zamknięty po ponownym teście ręcznym |
| Scenariusz i wymaganie | obserwacja podczas `COM-01` i `COM-04`; oba scenariusze zaliczone ręcznie ([COM-01](runs/2026-10-10-com-01-manual.md), [COM-04](runs/2026-10-10-com-04-manual.md)); osobny [ponowny test](runs/2026-10-16-f-005-retest.md) |
| Przebieg | zgłoszenie w trakcie ręcznego audytu; późniejszy wynik `COM-01` w [przebiegu 2026-10-10](runs/2026-10-10-com-01-manual.md); [ponowny test F-005](runs/2026-10-16-f-005-retest.md) |
| Wersja FE / BE | FE `4e60d51` przed lokalną poprawką; ponowny test na FE `2983b84`; BE bez zmian w tej poprawce |
| Środowisko i zestaw danych | lokalna aplikacja `localhost:3000`; konta trzech ról wskazane w instrukcji testu |
| Konto i rola | `manager001@post.pl`, `instructor001@post.pl`, `student001@post.pl` |
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

**Ponowny test:** użytkownik potwierdził 2026-10-16 pomyślny wynik po
wylogowaniu kont menedżera, instruktora i kursanta, według przekazanej
instrukcji obejmującej brak przejściowego ekranu bez roli. Nie otrzymano
osobnego zapisu obserwacji każdej próby. Powrót w historii sprawdzono
wcześniej osobno w [F-008](runs/2026-10-15-f-008-retest.md).
[Przebieg F-005](runs/2026-10-16-f-005-retest.md).

### F-001 — Procent postępu użyty jako liczba wykorzystanych godzin

| Pole                       | Wartość                                                                                                                                                                                                                  |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Typ / waga / status        | historyczne podejrzenie błędu / wysoka / zamknięte po weryfikacji ręcznej                                                                                                                                                 |
| Scenariusz i wymaganie     | `STU-04`, `STU-06`, `STU-07`; `REQ-STU-BOOK-ELIGIBILITY`                                                                                                                                                                 |
| Przebieg                   | ustalenie z przeglądu starszej wersji kodu; [weryfikacja F-001](runs/2026-10-16-f-001-verification.md)                                                                                                                                                             |
| Wersja FE / BE             | pierwotne ustalenie: FE `581d56e`, BE `cf191dd`; weryfikacja: FE `a988599`, BE `374f453`                                                                                                                             |
| Środowisko i zestaw danych | lokalna aplikacja, konto `student001@post.pl`, kurs „Kategoria A - grupa 1/1”                                                                                                                                             |
| Dowód                      | `BE/src/services/course/progress.ts`, `BE/src/services/course/queries.ts`, `FE/OSK-Manager-FE/app/composables/lessons/useStudentLessonBookingPage.ts`, `FE/OSK-Manager-FE/app/utils/student/studentLessonBookingPage.ts` |

**Pierwotna obserwacja z przeglądu starszej wersji kodu:** backend liczył
`progress` jako procent ukończonych minut względem całego kursu (`0–100`).
Frontend obliczał pozostałe godziny jako
`totalHours - progress` i używa wyniku do ograniczania wyboru slotu. Dla kursu
30-godzinnego z 15 zakończonymi godzinami backend zwróci `progress=50`,
a frontend pokaże `0` pozostałych godzin. Backend sprawdza limit według minut
wszystkich nieanulowanych jazd. Te różne jednostki mogą dawać sprzeczny wynik.

**Oczekiwane zachowanie:** widoczna liczba pozostałych godzin i możliwość
rezerwacji są zgodne z regułą limitu kursu; jednostki postępu i godzin są
rozróżnione.

**Aktualny kontrakt i weryfikacja:** BE zwraca `progress` jako procent ukończonych
minut, a `remainingBookableMinutes` jako saldo pakietu po uwzględnieniu
wszystkich nieanulowanych jazd. FE przelicza na godziny to drugie pole.
Użytkownik potwierdził 2026-10-16 pomyślny test według instrukcji obejmującej
porównanie postępu i salda oraz rezerwację i anulowanie jazdy. Oddzielny odczyt
API po teście potwierdził stan 30 godz. programu, 210 min ukończonych, 450 min
zarezerwowanych, 1350 min pozostałych i 12% postępu. Nie otrzymano osobnego
zapisu wyników każdego kroku. [Przebieg](runs/2026-10-16-f-001-verification.md).

### F-008 — Krótki podgląd chronionej strony po powrocie w historii

| Pole | Wartość |
| --- | --- |
| Typ / waga / status | błąd / wysoka / zamknięty po ponownym teście ręcznym |
| Scenariusz i wymaganie | `COM-04`, `REQ-COM-04` |
| Przebieg | zgłoszenie użytkownika podczas ręcznego testu `COM-04`; późniejszy wynik ręczny `COM-04`: zaliczony ([przebieg](runs/2026-10-10-com-04-manual.md)); [ponowny test F-008](runs/2026-10-15-f-008-retest.md) |
| Wersja FE / BE | FE przed bieżącą poprawką; BE bez zmian |
| Środowisko i zestaw danych | lokalna aplikacja w Chrome; do ponownego testu wskazano `localhost:3000` i widok `/my-lessons` w dwóch kartach |
| Konto i rola | Jan Instruktor (`instructor001@post.pl`), konto wskazane do ponownego testu |
| Dowód | obserwacja użytkownika; test UI `auth-session.spec.ts` odtworzył brak osłony przy `pagehide` przed poprawką |
| Powiązane zadanie naprawcze | `FE/OSK-Manager-FE/app/app.vue`, `app/middleware/auth.global.ts`, `server/middleware/protectedHtmlCache.ts` |

**Obserwacja:** po wylogowaniu przycisk „Wstecz” pozwalał przez chwilę zobaczyć
wcześniej otwartą chronioną stronę, zanim aplikacja przekierowała na logowanie.

**Oczekiwane zachowanie:** poprzednia treść nie jest widoczna podczas powrotu
w historii ani w drugiej karcie po wylogowaniu.

**Decyzja / poprawka:** chroniony dokument dostaje `Cache-Control: private,
no-store`. Podczas żądania wylogowania przycisk pokazuje spinner i napis
„Wylogowywanie…”. Frontend zasłania prywatny widok przy opuszczeniu chronionego
dokumentu i powrocie do niego z historii. Zwykłe przejścia między trasami nie
pokazują tej osłony. Strona przywrócona z pamięci przeglądarki ładuje się
ponownie, aby serwer sprawdził aktualną sesję. Wylogowanie powiadamia inne
karty. Testy UI z atrapą backendu potwierdziły osłonę i przejście drugiej karty
na `/login`. Użytkownik uznał `COM-04` za zaliczony; wówczas nie przekazał
osobnego wyniku kryteriów ponownego testu F-008.

**Ponowny test F-008:** użytkownik potwierdził 2026-10-15, że przekazana
instrukcja obejmująca powrót przez „Wstecz”, odświeżenie strony i zachowanie
równocześnie otwartej drugiej karty przeszła poprawnie. Nie przekazał osobnego
zapisu wyników poszczególnych kroków. [Przebieg](runs/2026-10-15-f-008-retest.md).

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
