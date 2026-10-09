# Przebieg: 2026-10-09 — konta zarządzane przez menadżera

- Data i wykonawca: 2026-10-09, Codex (automatyczny audyt przeglądarkowy)
- Wersja FE: `0faa7f1` + zmiany tego przebiegu w katalogach `e2e/`, `tools/`, `app/` i `docs/`
- Wersja BE: `37dab6f` + wariant danych `account-ready` w tej zmianie
- Środowisko: izolowany lokalny Supabase CLI; Auth/API `127.0.0.1:54321`, PostgreSQL `127.0.0.1:54322`, Mailpit `127.0.0.1:54324`, BE `127.0.0.1:3002`, FE `127.0.0.1:3100`
- Zestaw danych: `account-ready` v1, dwie OSK, konta kursantów i instruktorów w obu szkołach, konta z aktywnymi zobowiązaniami i bez nich
- Zakres: `MGR-ACC-01`–`MGR-ACC-05`; przebieg FE → BE → lokalny Supabase Auth/DB oraz skrzynka Mailpit
- Konfiguracja: `E2E_ENVIRONMENT_NAME=osk-local-audit`, `E2E_CONFIRM_ISOLATED_ENVIRONMENT=true`, adres powrotu resetu hasła `http://127.0.0.1:3100/reset-password`; bez sekretów

## Wyniki

| Scenariusz   | Wynik     | Dowód                                     | Uwagi                                                                                                                                                                                                                       |
| ------------ | --------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MGR-ACC-01` | zaliczony | `manager-accounts-audit.spec.ts`, E2E 1/5 | Lista, wyszukiwanie po imieniu, nazwisku i e-mailu, filtry, wzajemna izolacja dwóch OSK w UI i API, odmowa dla kursanta i instruktora.                                                                                      |
| `MGR-ACC-02` | zaliczony | E2E 2/5                                   | Trwała zmiana imienia, nazwiska, telefonu i e-maila, zgodność kartoteki, brak maila z linkiem po bezpośredniej zmianie, odmowa starego logowania i sesji, nowe logowanie działa.                                            |
| `MGR-ACC-03` | zaliczony | E2E 3/5                                   | Anulowanie i potwierdzenie blokady, odmowa starego tokenu i logowania, odblokowanie bez przywrócenia starej sesji, nowe logowanie działa.                                                                                   |
| `MGR-ACC-04` | zaliczony | E2E 4/5, Mailpit                          | Wiadomość z linkiem resetu dotarła, link otworzył formularz, nowe hasło działa, stare hasło i sesja zostały odrzucone; zablokowane konto nie może dostać resetu z panelu/API.                                               |
| `MGR-ACC-05` | zaliczony | E2E 5/5, kontrola Auth Admin              | Anulowanie nie archiwizuje; aktywne zobowiązania kursanta i instruktora dają odmowę; wolne konta obu ról zachowują rekordy, tracą dostęp, nie mają przywracania w panelu. Konto instruktora nadal istnieje w Supabase Auth. |

## Podsumowanie

- Zaliczonych: 5
- Niezaliczonych: 0
- Zablokowanych: 0
- Niewykonanych w wskazanym zakresie: 0
- Decyzja o odbiorze: lokalny odbiór funkcji zarządzania kontami zakończony pozytywnie. Regułę blokady i archiwizacji zapisano w D-05; temat homelab nie należy do tego przebiegu.
- Ograniczenia: dostarczenie linku sprawdzono w lokalnej skrzynce Mailpit; wcześniejszy test rzeczywistej skrzynki DEV udokumentowano osobno. Nie wymuszano awarii synchronizacji Auth ani wszystkich rodzajów aktywnych zobowiązań w tym przebiegu. Lokalny serwer Nuxt wypisywał błędy map źródłowych przy obsłudze odpowiedzi odmownych; testy zakończyły się wynikiem 5/5.
- Scenariusze wymagające powtórzenia: żaden z `MGR-ACC-01`–`MGR-ACC-05`.
