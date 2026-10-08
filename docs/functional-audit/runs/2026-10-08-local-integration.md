# Przebieg: 2026-10-08 — lokalna integracja i test bazowy

- Data i wykonawca: 2026-10-08, Codex (testy automatyczne)
- Wersja FE: `581d56e` + niezacommitowane zmiany, w tym równoległa praca nad kontami
- Wersja BE: `cf191dd` + niezacommitowane zmiany, w tym równoległa praca nad kontami
- Środowisko: dedykowany lokalny Supabase CLI w `audit-local-stack`, PostgreSQL `127.0.0.1:54322`, Auth/API `127.0.0.1:54321`, BE `127.0.0.1:3002`, FE `127.0.0.1:3100`
- Zestaw danych: sześć presetów audytu w wersji 1 dla integracji API; `manager-only`, `school-operational`, `booking-ready` i `payment-ready` w wersji 1 dla testów przeglądarkowych
- Zakres: weryfikacja narzędzia danych oraz wskazanych przepływów logowania, OSK, rezerwacji, płatności i uprawnień; pełny audyt funkcjonalny pozostaje do wykonania
- Konfiguracja: migracje Prisma zastosowane tylko do lokalnej bazy; `E2E_ENVIRONMENT_NAME=osk-local-audit`, `E2E_CONFIRM_ISOLATED_ENVIRONMENT=true`; bez udostępniania sekretów

## Wyniki scenariuszy odbiorowych

Wynik `zaliczony` dotyczy wyłącznie kompletnych kroków danego scenariusza. Automatyczne testy pomocnicze nie zaliczają innych scenariuszy przez analogię.

| Scenariusz    | Wynik       | Dowód / F-ID                    | Uwagi                                                                        |
| ------------- | ----------- | ------------------------------- | ---------------------------------------------------------------------------- |
| `COM-01`      | zaliczony   | E2E full 3/3                    | Trzy role: panel, odświeżenie i wylogowanie na rzeczywistym BE/Auth/DB.      |
| `COM-02`      | zaliczony   | E2E full @audit 1/1             | Puste i błędne pola, odmowa logowania, poprawa hasła w tym samym formularzu. |
| `COM-03`      | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `COM-04`      | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `COM-05`      | zaliczony   | E2E full @audit 3/3             | Siedem zakazanych tras i siedem odmów 403 przez rzeczywiste API.             |
| `COM-06`      | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `COM-07`      | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `COM-08`      | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `COM-09`      | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `COM-10`      | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `COM-11`      | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `COM-12`      | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `COM-13`      | zaliczony   | E2E UI 1/1; E2E full 3/3; F-002 | Po naprawie brak natywnego GET z hasłem przed hydracją.                      |
| `MGR-OSK-01`  | zaliczony   | E2E full @audit 1/1             | Pierwsza OSK, trwałość po odświeżeniu i kontekst w kursach oraz kursantach.  |
| `MGR-OSK-02`  | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `MGR-OSK-03`  | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `MGR-INS-01`  | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `MGR-INS-02`  | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `MGR-INS-03`  | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `MGR-INS-04`  | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `MGR-INS-05`  | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `MGR-CRS-01`  | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `MGR-CRS-02`  | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `MGR-CRS-03`  | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `MGR-STU-01`  | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `MGR-STU-02`  | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `MGR-PAY-01`  | zaliczony   | E2E full @audit 1/1             | Pierwsza opłata, edycja, status i podsumowanie po odświeżeniu.               |
| `MGR-VEH-01`  | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `MGR-VEH-02`  | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `MGR-SCH-01`  | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `MGR-LES-01`  | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `MGR-LES-02`  | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `MGR-LES-03`  | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `MGR-LES-04`  | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `MGR-EVT-01`  | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `MGR-EVT-02`  | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `MGR-ACC-01`  | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `MGR-ACC-02`  | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `MGR-ACC-03`  | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `MGR-ACC-04`  | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `MGR-ACC-05`  | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `MGR-REV-01`  | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `MGR-DASH-01` | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `MGR-MOB-01`  | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `INS-01`      | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `INS-02`      | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `INS-03`      | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `INS-04`      | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `INS-05`      | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `INS-06`      | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `INS-07`      | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `INS-08`      | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `INS-09`      | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `INS-10`      | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `INS-11`      | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `STU-01`      | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `STU-02`      | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `STU-03`      | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `STU-04`      | zaliczony   | E2E full @audit 1/1             | Rezerwacja znanego slotu, widoczność jazdy i brak slotu po odświeżeniu.      |
| `STU-05`      | zaliczony   | E2E full @audit 1/1             | Zamknięcie dialogu bez POST i ten sam slot nadal dostępny.                   |
| `STU-06`      | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `STU-07`      | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `STU-08`      | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `STU-09`      | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `STU-10`      | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `STU-11`      | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `STU-12`      | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `STU-13`      | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `STU-14`      | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `STU-15`      | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `STU-16`      | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `STU-17`      | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `STU-18`      | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `STU-19`      | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `XR-01`       | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `XR-02`       | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `XR-03`       | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `XR-04`       | zaliczony   | E2E full @audit 1/1             | Ta sama opłata widoczna menadżerowi i kursantowi po odświeżeniu.             |
| `XR-05`       | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |
| `XR-06`       | niewykonany | —                               | Wymaga wykonania wszystkich kroków scenariusza.                              |

## Kontrole automatyczne poza tabelą scenariuszy

| Kontrola                                                                                         | Wynik                        | Zakres                                                                                                                                                              |
| ------------------------------------------------------------------------------------------------ | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Migracje Prisma                                                                                  | zaliczony                    | 37 migracji na lokalnym PostgreSQL                                                                                                                                  |
| Narzędzie danych                                                                                 | zaliczony                    | 6 presetów i 4 poziomy czyszczenia przez rzeczywiste API, Auth i PostgreSQL; po `full` ponowne logowanie administratora                                             |
| `BE: npm run check`                                                                              | zaliczony                    | formatowanie, lint, typy, 423 testy, build                                                                                                                          |
| `FE: npm run format:check`, `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` | zaliczony                    | 849 testów jednostkowych; produkcyjny build Nuxt                                                                                                                    |
| `FE: test:e2e:ui -- --workers=1`                                                                 | zaliczony po ponownym teście | 34/35 przy pierwszej próbie po zmianie kontraktu; test z niepełnym mockiem odpowiedzi płatności poprawiono i uruchomiono osobno 1/1. Nie zastępuje testów przez BE. |
| `FE: test:e2e:smoke` i `@audit`                                                                  | zaliczony                    | 3 testy bazowe, tworzenie OSK, rezerwacja, płatność, walidacja logowania i 3 testy ról przez rzeczywisty FE, BE, Auth i DB                                          |

## Podsumowanie

- Zaliczonych scenariuszy: 9/80 (`COM-01`, `COM-02`, `COM-05`, `COM-13`, `MGR-OSK-01`, `MGR-PAY-01`, `STU-04`, `STU-05`, `XR-04`).
- Niezaliczonych scenariuszy: 0 w końcowym przebiegu.
- Zablokowanych scenariuszy: 0 w tym wstępnym przebiegu; decyzje D-01, D-03–D-09, D-11 i D-12 ograniczą ocenę powiązanych przypadków przy pełnym audycie.
- Niewykonanych scenariuszy: 71/80.
- Ustalenia: `F-002` i `F-003` zamknięto po ponownych testach; `F-001` pozostaje podejrzeniem z przeglądu kodu bez testu manualnego.
- Decyzja o odbiorze: **brak podstaw do odbioru aplikacji**. Pełny audyt P0/P1/P2 i scenariusze między rolami nie zostały wykonane. Wynik automatyczny potwierdza środowisko, narzędzie danych i podstawową sesję trzech ról.
- Scenariusze wymagające wykonania: 71 pozycji oznaczonych `niewykonany` w tabeli. Po zmianie reguł produktu oraz kodu rozpocznij nowy przebieg, nie nadpisując tego zapisu.

Pierwsze uruchomienie UI z 10 workerami miało 10 porażek związanych z ładowaniem stron; powtórka tych przypadków i cały zestaw z jednym workerem przeszły przed zmianą kontraktu płatności. Po zmianie 34 testy przeszły, a jeden mock nie zawierał nowego pola `paymentPlans`; po poprawieniu mocka ten przypadek przeszedł osobno. Lokalny serwer Nuxt wypisywał błędy map źródłowych `unreachable`, które nie spowodowały porażki testów. Przy kolejnym przebiegu sprawdź stabilność przy ustawieniu używanym w CI.
