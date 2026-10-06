# Przegląd kodu po UI refresh — zakres i dowody

Data: 2026-10-06, Europe/Warsaw. Status: zakończona inwentaryzacja, przekrojowy audyt i szczegółowy przegląd wybranych przepływów. **Nie jest to deklaracja przeczytania całej aplikacji linia po linii.** Dokładne pokrycie i luki podano poniżej. Zakres zadania: analiza i propozycja planu, bez implementacji.

Rezultaty: [ustalenia](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/docs/POST_UI_CODE_REVIEW_FINDINGS.md), [plan małych partii](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/docs/POST_UI_REFACTOR_PLAN.md).

## Stan wyjściowy

| Repozytorium        | Branch   | HEAD                                       | Zmiany lokalne przed audytem |
| ------------------- | -------- | ------------------------------------------ | ---------------------------- |
| `FE/OSK-Manager-FE` | `master` | `8d094649a94188eb5f0ad8b28f8e5dc2e1949661` | brak                         |
| `BE`                | `main`   | `8355662a9da28655fc5dc7cca8ad5ab6bb92e75b` | brak                         |

Frontend zawiera 1115 śledzonych plików, backend 407. Te liczby obejmują dokumentację, konfigurację i zasoby; nie oznaczają liczby szczegółowo przeczytanych plików źródłowych.

Punkt porównania FE: `bc9b3769540dd9f1d8e2dfa76396beec9397d8eb`, rodzic commita dodającego plan `4d1e472`. Punkt porównania BE: `bc0af2e7c851bb9186c183d91830f6ae48a2437c`, stan po wcześniejszym refaktorze. Zakresy Git są filtrem do poszukiwania zmian, nie dowodem, że wszystkie zmiany należą do UI refresh. Wcześniejsze fundamenty palety i logowania są zależnościami istniejącymi przed tym zakresem.

Diff netto FE: **698 plików** (384 zmienione, 196 dodanych, 118 usuniętych), 43 659 dodanych / 16 975 usuniętych linii. BE: **150 plików** (96 zmienionych, 54 dodane), 9 984 dodane / 478 usuniętych linii. Obejmuje to dokumentację, testy i usunięte artefakty, więc nie jest miarą wielkości refaktoru. Historia, diffy i konsumenci służyły do rozdzielenia regresji UI od problemów wcześniejszych.

## Podział odpowiedzialności

| Wykonawca             | Zakres                                                                                               |
| --------------------- | ---------------------------------------------------------------------------------------------------- |
| `audit_schedule`      | Harmonogram, dostępność, wydarzenia, rezerwacje, lekcje; FE–BFF–BE                                   |
| `audit_registry`      | Kursanci, instruktorzy, kursy, szkoły, pojazdy; FE–BFF–BE                                            |
| `audit_auth_payments` | Sesja, konto, rejestracja, płatności, opinie, pulpity                                                |
| Główny agent          | Historia i mapa, wspólny UI, transport BFF, konfiguracja, kontrole, integracja i weryfikacja ustaleń |

## Metoda

Przegląd wstępny oznacza rozpoznanie odpowiedzialności i zależności. Szczegółowy oznacza przeczytanie implementacji oraz sprawdzenie istotnego kontekstu/konsumentów; nie oznacza uruchomienia każdego scenariusza. Statystyki i wyszukiwanie nazw nie są szczegółowym audytem.

Kod wygenerowany, zależności, pliki wynikowe, raporty, fonty i obrazy nie podlegają ręcznej ocenie logiki. Nie odczytujemy dumpów danych ani sekretów. Skrypty migracji i wdrożeń są rozpoznawane statycznie; nie są uruchamiane.

Wcześniejsze plany refaktorów są historią decyzji. Nie wznawiamy starych branchy ani automatycznie ich checklist.

Każdy subagent wykonał dwie partie: analizę swojej domeny i niezależną kontrolę ustaleń innego agenta wraz z uzupełnieniem ważnych luk. Registry sprawdził anulowane wydarzenia/UTC, auth sprawdził zdjęcie pojazdu/PATCH instruktora, schedule sprawdził opinie/płatności. Koordynator zweryfikował minimalny zakres refaktorów, kontrakt czasu lekcji i drugi wariant anulowania pojazdu. Raporty nie były automatycznie zamieniane w zadania; odrzucono propozycje bez konkretnej korzyści.

## Mapa UI refresh i jego zależności

Poniższa mapa wiąże wpisy planu z historią i ścieżkami. Nazwy katalogów są skrótami odpowiedzialności; dokładne pliki wraz z ostatnim commitem w przedziale znajdują się w inwentaryzacji. Wskazanie commita nie oznacza, że każdy jego plik lub każda wcześniejsza linia powstały dla UI. Szczególnie commit `b6cf2ae` ma tytuł „.”, więc powiązanie wynika z diffu W27, nie nazwy.

| Widoki / zakres      | Zmiany FE i zależności                                                               | Punkty historii do nawigacji                                                 | Wynik istotny dla jakości                                                 |
| -------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| W07/W08 kursanci     | manager/students, composables/students, students BFF; BE students i advanced filters | FE b29aaec, 01d4eb6, 2b80645; BE e3bc200, ca63f1a                            | REF-02, BUG-04; istniejące powiązania ról zachować                        |
| W09/W10 instruktorzy | manager/instructors, detail normalizers i mock; BE instructor                        | FE 2b80645, d898c04                                                          | BUG-02 i osobny BUG-09; starszy partial PATCH                             |
| W11/W12/W13          | availability/schedule/slots, pickery; BE instructor-availability                     | FE 86ec567, 6dea058, cdea385; BE d6b423f                                     | BUG-06/07 na zależnych ścieżkach; nie zmieniać globalnie UTC              |
| W14/W15/W16          | course list/detail/create, participants, courses BFF; BE course                      | FE 4e087b0, 0e37a5f, 6c30b8e                                                 | Lokalne granice już istnieją, bez kolejnego ogólnego CRUD                 |
| W06/W18/W19/W20      | events, school schedule, lesson/event edit, availability check/options               | FE 6360ec3, dad0dc1, b803f5b, bf4ea41, eee74e4; BE e01c997, d6b423f, 9b7b6c0 | REF-01, BUG-05/06/07/10; LATER-01                                         |
| W05/W24/W25/W26      | vehicle list/detail/edit/create, photo; BE vehicle                                   | FE c1b92fa, ec39dd6, 5dbc4ac, 427616e                                        | BUG-01; drugi wariant BUG-06                                              |
| W17/W23              | driving school list/dialog i przekierowanie; BE driving-school                       | FE 5c9e704; BE 7a90143 jako zmiana kontekstu członkostwa                     | Zachować znaczenie szkoły domyślnej i uprawnień                           |
| W21/W30              | manager/my reviews, API paginacji, ratings BFF; BE lesson-rating                     | FE c3dfb3a, 5499235; BE 9e91c0c, a7c3590                                     | BUG-03 u konsumenta pulpitu; LATER-03 mock                                |
| W04                  | my-courses, useMyCoursesPage, course API                                             | FE 9ef9b68                                                                   | Brak uzasadnienia dodatkowej przebudowy                                   |
| W27/W28              | booking, my-lessons, ratings, sloty/kalendarium                                      | FE b6cf2ae, ec4e6fc, 8d09464; BE 8355662                                     | BUG-05/06/07 i scenariusze anulowania                                     |
| W29                  | my-payments i współdzielona lista płatności                                          | FE 72418e9                                                                   | Zachować model; szkic tworzenia z W08 ma BUG-04                           |
| W01                  | role dashboard, kalendarze i podsumowania                                            | FE d7b1867                                                                   | BUG-03; BE alert BUG-08 jest wcześniejszy                                 |
| W02/W03              | account inline/avatar, login, auth/session, BFF                                      | FE 2f7a78d, 50cbbed, 5e7362b                                                 | Bez szerokiej przebudowy auth; opcjonalne LATER-02                        |
| W22                  | osobna strona tworzenia, formularz/dirty guard, data urodzenia                       | FE 3608030; BE 880013f                                                       | Przejrzano kod i testy; migracji w zdalnym środowisku nie weryfikowano    |
| T01/T02 i wspólne UI | design system, tokeny, shell, identity/avatar, filtry, pickery, toast                | FE 0c843dd, 44a4144, 33c3fc2, 3f303f3, d5c4797, 9591485                      | Mapa zmian; bez automatycznej przebudowy prymitywów i wizualnych poprawek |

Historyczne zależności objęte audytem, także poza diffem: shared BFF transport, auth guards, middleware BE, kontrakty płatności, reguły kursanta i kursów, vehicle queries, lesson-scheduling, Dockerfiles i skrypty jakości. BUG-02/04/06/08/09/10 oraz REF-02 pokazują, dlaczego audytu nie ograniczono do listy zmienionych plików.

Odhaczenie 31 aktywnych stron i usuniętego T02 w UI_REFRESH_PLAN jest deklaracją wykonania rundy UI, nie certyfikatem jakości kodu. Starsze tabele/obserwacje tego dokumentu są miejscami nieaktualne, np. ManagerLessonRatingsFilters jest dziś używany. Globalny ekran błędu i zdalne wdrożenia/migracje są odrębnymi kwestiami; audyt ich nie oznacza jako ukończonych.

## Kontrole stanu wyjściowego

Używany lokalny Node: `v24.19.0` z runtime Codex; lokalne CLI z node_modules, bez instalacji zależności. Shim Volta próbował pisać do swojego katalogu poza workspace i nie działał w sandboxie; użyto bezpośrednio istniejącego runtime. Poniższe komendy uruchomiono w odpowiednim repo; `node` w tabeli oznacza ten bezpośredni plik wykonywalny.

| Kontrola  | Faktyczna komenda                                                     | Wynik                                           |
| --------- | --------------------------------------------------------------------- | ----------------------------------------------- |
| FE unit   | `node node_modules/vitest/vitest.mjs run --reporter=dot`              | exit 0; 170 plików, 812 testów                  |
| FE typy   | `node node_modules/@nuxt/cli/bin/nuxi.mjs typecheck`                  | exit 0                                          |
| FE lint   | `node node_modules/eslint/bin/eslint.js .`                            | exit 1; 13 błędów prettier/prettier w 5 plikach |
| BE unit   | `node node_modules/vitest/vitest.mjs run --reporter=dot`              | exit 0; 51 plików, 328 testów                   |
| BE typy   | `node node_modules/typescript/bin/tsc -p tsconfig.json --noEmit`      | exit 0                                          |
| BE lint   | `node node_modules/eslint/bin/eslint.js src --max-warnings=0`         | exit 0                                          |
| BE format | node node\*modules/prettier/bin/prettier.cjs --check 'src/\*\*/\_.ts' | exit 1; 3 pliki                                 |

Razem **1140 testów** w 221 plikach. Log FE zawiera ostrzeżenia Vue o hookach poza effect scope w części testów; nie dowodzi to wycieku w aplikacji. Przy modyfikacji tych testów uruchamiać composable w prawidłowym scope i sprawdzić disposal; istnieje już celowany test cleanup. BE wypisał oczekiwany błąd auth z negatywnego testu.

Pliki FE wymagające wyłącznie formatowania według lint:

- app/components/manager/students/ManagerStudentsList.vue — 5 błędów.
- app/composables/schedule/useManagerSchoolScheduleCalendarData.ts — 5.
- app/composables/students/useManagerStudentDetailsPage.ts — 1.
- app/utils/instructors/managerInstructorSchedulePage.ts — 1.
- server/utils/students/studentsMockBff.ts — 1.

Pliki BE wskazane przez format check:

- src/**tests**/services/schedule.test.ts.
- src/controllers/students/read.handlers.ts.
- src/services/schedule/queries.ts.

Nie uruchamiano pełnego builda FE/BE, całego E2E, testów integracyjnych Prisma/Postgres ani Docker build. FE pełny format:check też nie został uruchomiony; wynik lint nie zastępuje tej kontroli. Testy integracyjne BE są wyłączone z zwykłego Vitest, a ich runner wykonuje migracje — nie uruchamiano go bez izolowanej testowej bazy. Wąska reprodukcja FileList w headless Chromium nie jest odbiorem całej aplikacji w przeglądarce.

## Pokrycie i ograniczenia

| Repo      | Inwentaryzacja | Szczegółowo S | Tylko wstępnie W |
| --------- | -------------: | ------------: | ---------------: |
| FE        |           1055 |           253 |              802 |
| BE        |            374 |           167 |              207 |
| **Razem** |       **1429** |       **420** |         **1009** |

S to unikalne pliki, nie suma raportów agentów; nakładające się cross-checki policzono raz. Szczegółowy przegląd wybrano według ryzyka i przepływów, a nie oczekiwanej liczby uwag. W nie zostało uznane za sprawdzone semantycznie.

Przejrzane szczegółowo ścieżki mają etykietę S z wykonawcą; W oznacza wyłącznie skan. Dla studentsMockBff i studentSchemas szczegółowy przegląd registry objął funkcje rejestru/PKK/notatek/przypisań/filtrów; część płatnicza tego konkretnego pliku była kontekstem, a domena płatności była sprawdzana oddzielnie przez auth. S nie oznacza wykonania wszystkich gałęzi ani wszystkich możliwych testów.

Poza dwoma repo aplikacji rozpoznano deploy-repo i migration/supabase-transfer. Szczegółowo statycznie przeczytano deploy-repo/compose.yaml i scripts/backup-postgres.sh; README migracji jako kontekst. Pozostałe skrypty transferu, restore/sanitize/storage-copy oraz instrukcje operacyjne pozostają do odrębnego audytu. Nie czytano dumpów ani sekretów i nie wykonywano migracji, backupów, uploadów lub deployów.

Pozostające luki, nie będące automatycznymi zadaniami refaktoru:

- Pozostałe komponenty prezentacyjne i szablony ekranów, część composables event-create/participants i instructor resources, pozostałe BFF parsery/mapowania — dokładna lista W w tabeli.
- Uruchomiono całe skonfigurowane zestawy testów jednostkowych, lecz nie każdy ich plik przeczytano szczegółowo; np. auth-me i pełny lesson-rating pozostają W. Testy integracyjne i E2E nie wchodzą do podanej liczby.
- Brak rzeczywistej integracji DB/Supabase/upstream oraz odbioru zdalnego wdrożenia W22, migracji i zachowania na rzeczywistych danych.
- Brak pomiarów wydajności, obciążenia i współbieżności; brak podstaw do rekomendowania cache, indeksów lub przebudowy transakcji poza konkretnym BUG-09.
- Statyczne sprawdzenie zabezpieczeń i kontraktów w przeczytanych przepływach nie stanowi pełnego audytu bezpieczeństwa.

## Punkt kontynuacji

Wykonanie zaczynać od planu i dowodów, po odrębnym poleceniu użytkownika uruchamiającym implementację. W razie dalszego audytu przydzielać agentom pozostałe W według domen, z identycznym progiem zasadności. Nie uznawać samych metryk, większych plików ani nieprzeczytanego obszaru za powód do zmiany kodu.

<!-- INVENTORY START -->

## Inwentaryzacja plików

Tabela obejmuje pliki śledzone w Git, po jawnych wyłączeniach. Każdy plik został odczytany przez skan strukturalny (ścieżka, typ, liczba linii, przynależność do katalogu i historii). Nie oznacza to oceny jego poprawności.

**Pochodzenie:** `H` = plik zmieniony w przedziale porównania, status Git i ostatni commit w tym przedziale; powiązanie konkretnego fragmentu z UI refresh wymaga dowodu z mapy lub ustalenia. `P` = plik poza diffem netto, nie dowodzi braku zmian w historii. Dodatkowe `U` oznacza potwierdzony związek przejrzanego pliku z wdrażaniem UI; `Z` — sprawdzoną zależność/konsumenta. Te oznaczenia są celowo selektywne; nie przypisują UI każdej linii danego pliku. Daty i tytuły commitów nie służą samodzielnie do przypisania przyczyny problemu.

**Głębokość:** `W` = wstępny skan strukturalny, `S` = szczegółowy przegląd implementacji i kontekstu przez wskazanego wykonawcę. Zapis `W` nie uprawnia do uznania pliku za poprawny.

Zakres tabeli: `FE/OSK-Manager-FE`: **1055** plików, `BE`: **374** plików.

| Wyłączenie                                                 | Repo                | Liczba |
| ---------------------------------------------------------- | ------------------- | -----: |
| dokumentacja (czytana jako kontekst, poza licznikiem kodu) | `BE`                |     30 |
| konfiguracja edytora / dostarczone skills                  | `BE`                |      2 |
| lockfile                                                   | `BE`                |      1 |
| dokumentacja (czytana jako kontekst, poza licznikiem kodu) | `FE/OSK-Manager-FE` |     35 |
| kod generowany                                             | `FE/OSK-Manager-FE` |      1 |
| konfiguracja edytora / dostarczone skills                  | `FE/OSK-Manager-FE` |     17 |
| lockfile                                                   | `FE/OSK-Manager-FE` |      1 |
| zasoby binarne/wektorowe                                   | `FE/OSK-Manager-FE` |      5 |
| zasoby statyczne                                           | `FE/OSK-Manager-FE` |      1 |

### Bieżące pliki

| Ścieżka względem workspace                                                                              | Odpowiedzialność/grupa            | Pochodzenie     | Głębokość                           | Linie |
| ------------------------------------------------------------------------------------------------------- | --------------------------------- | --------------- | ----------------------------------- | ----: |
| `FE/OSK-Manager-FE/.dockerignore`                                                                       | config                            | P               | W                                   |    17 |
| `FE/OSK-Manager-FE/.env.example`                                                                        | config                            | P               | W                                   |    17 |
| `FE/OSK-Manager-FE/.gitattributes`                                                                      | config                            | P               | W                                   |     3 |
| `FE/OSK-Manager-FE/.github/workflows/ci.yml`                                                            | .github/workflows                 | P               | S (koordynator)                     |    41 |
| `FE/OSK-Manager-FE/.github/workflows/docker-image.yml`                                                  | .github/workflows                 | P               | S (koordynator)                     |    44 |
| `FE/OSK-Manager-FE/.github/workflows/trigger-homelab-deploy.yml`                                        | .github/workflows                 | P               | W                                   |    24 |
| `FE/OSK-Manager-FE/.gitignore`                                                                          | config                            | H M @5d8a19f    | W                                   |    22 |
| `FE/OSK-Manager-FE/.nuxtrc`                                                                             | config                            | P               | W                                   |     1 |
| `FE/OSK-Manager-FE/.nvmrc`                                                                              | config                            | P               | W                                   |     1 |
| `FE/OSK-Manager-FE/.prettierignore`                                                                     | config                            | P               | W                                   |     7 |
| `FE/OSK-Manager-FE/Dockerfile`                                                                          | config                            | P               | S (koordynator)                     |    24 |
| `FE/OSK-Manager-FE/app/app.vue`                                                                         | app/app.vue                       | P               | S (koordynator)                     |    30 |
| `FE/OSK-Manager-FE/app/assets/css/osk-design-tokens.css`                                                | app/assets                        | H M @d5c4797    | W                                   |   170 |
| `FE/OSK-Manager-FE/app/assets/css/tailwind.css`                                                         | app/assets                        | H M @d5c4797    | W                                   |   195 |
| `FE/OSK-Manager-FE/app/components/account/AccountBioSection.vue`                                        | app/components                    | H A @2f7a78d    | S (auth)                            |    84 |
| `FE/OSK-Manager-FE/app/components/account/AccountContactSection.vue`                                    | app/components                    | H A @2f7a78d    | S (auth)                            |    57 |
| `FE/OSK-Manager-FE/app/components/account/AccountIdentityCard.vue`                                      | app/components                    | H A @2f7a78d    | W                                   |    56 |
| `FE/OSK-Manager-FE/app/components/account/AccountPageHeader.vue`                                        | app/components                    | H M @2f7a78d    | W                                   |    39 |
| `FE/OSK-Manager-FE/app/components/account/AccountPersonalDataSection.vue`                               | app/components                    | H A @2f7a78d    | S (auth)                            |   115 |
| `FE/OSK-Manager-FE/app/components/account/AccountProfileAvatarSection.vue`                              | app/components                    | H M @2f7a78d    | W                                   |   105 |
| `FE/OSK-Manager-FE/app/components/account/AccountProfileCard.vue`                                       | app/components                    | H M @2f7a78d    | S (auth)                            |   158 |
| `FE/OSK-Manager-FE/app/components/account/AccountStudentDataSection.vue`                                | app/components                    | H A @2f7a78d    | W                                   |    37 |
| `FE/OSK-Manager-FE/app/components/app/AccountProfileContactFormDialog.vue`                              | app/components                    | P               | W                                   |   134 |
| `FE/OSK-Manager-FE/app/components/app/AccountProfileNamesFormDialog.vue`                                | app/components                    | P               | W                                   |   129 |
| `FE/OSK-Manager-FE/app/components/app/AppAdvancedFilterSegments.vue`                                    | app/components                    | H A @01d4eb6    | W                                   |    36 |
| `FE/OSK-Manager-FE/app/components/app/AppAdvancedFilters.vue`                                           | app/components                    | H A @01d4eb6    | W                                   |   223 |
| `FE/OSK-Manager-FE/app/components/app/AppCopyableValue.vue`                                             | app/components                    | H A @ec39dd6    | S (koordynator)                     |    57 |
| `FE/OSK-Manager-FE/app/components/app/AppCourseTypeBadges.vue`                                          | app/components                    | H A @5c9e704    | W                                   |    81 |
| `FE/OSK-Manager-FE/app/components/app/AppDemoMenubarContent.vue`                                        | app/components                    | P               | W                                   |    33 |
| `FE/OSK-Manager-FE/app/components/app/AppDemoNavigationMenubar.vue`                                     | app/components                    | P               | W                                   |    49 |
| `FE/OSK-Manager-FE/app/components/app/AppFooter.vue`                                                    | app/components                    | P               | W                                   |    22 |
| `FE/OSK-Manager-FE/app/components/app/AppHeader.vue`                                                    | app/components                    | P               | W                                   |    84 |
| `FE/OSK-Manager-FE/app/components/app/AppListAvatar.vue`                                                | app/components                    | H A @2b80645    | W                                   |    26 |
| `FE/OSK-Manager-FE/app/components/app/AppShellSidebar.vue`                                              | app/components                    | H M @33c3fc2    | W                                   |   176 |
| `FE/OSK-Manager-FE/app/components/app/AppUserIdentity.vue`                                              | app/components                    | U; H A @33c3fc2 | S (koordynator)                     |    95 |
| `FE/OSK-Manager-FE/app/components/app/LanguageSwitch.vue`                                               | app/components                    | P               | W                                   |   196 |
| `FE/OSK-Manager-FE/app/components/app/NavTree.vue`                                                      | app/components                    | P               | S (koordynator)                     |    65 |
| `FE/OSK-Manager-FE/app/components/app/NavTreeBranch.vue`                                                | app/components                    | H M @0c843dd    | S (koordynator)                     |    96 |
| `FE/OSK-Manager-FE/app/components/app/ProfileAvatar.vue`                                                | app/components                    | U; H A @44a4144 | S (koordynator)                     |   112 |
| `FE/OSK-Manager-FE/app/components/app/ThemeToggle.vue`                                                  | app/components                    | H A @c684ffa    | S (koordynator)                     |    48 |
| `FE/OSK-Manager-FE/app/components/app/ToastStack.vue`                                                   | app/components                    | H M @3f303f3    | S (koordynator)                     |   169 |
| `FE/OSK-Manager-FE/app/components/app/design-system/Colors.vue`                                         | app/components                    | H M @d5c4797    | W                                   |   232 |
| `FE/OSK-Manager-FE/app/components/app/design-system/DesignSystemNavigation.vue`                         | app/components                    | U; H M @d5c4797 | S (koordynator)                     |   113 |
| `FE/OSK-Manager-FE/app/components/app/design-system/DesignSystemScenarioControls.vue`                   | app/components                    | H A @d5c4797    | S (koordynator)                     |    40 |
| `FE/OSK-Manager-FE/app/components/app/design-system/SectionActions.vue`                                 | app/components                    | P               | W                                   |    59 |
| `FE/OSK-Manager-FE/app/components/app/design-system/SectionData.vue`                                    | app/components                    | H M @d5c4797    | W                                   |   167 |
| `FE/OSK-Manager-FE/app/components/app/design-system/SectionDialog.vue`                                  | app/components                    | P               | W                                   |    37 |
| `FE/OSK-Manager-FE/app/components/app/design-system/SectionFormControls.vue`                            | app/components                    | H M @d5c4797    | W                                   |   550 |
| `FE/OSK-Manager-FE/app/components/app/design-system/SectionFoundationStates.vue`                        | app/components                    | P               | W                                   |    71 |
| `FE/OSK-Manager-FE/app/components/app/design-system/SectionSchedule.vue`                                | app/components                    | H M @d5c4797    | W                                   |   100 |
| `FE/OSK-Manager-FE/app/components/app/design-system/SectionScreenPatterns.vue`                          | app/components                    | H M @d5c4797    | S (koordynator)                     |    45 |
| `FE/OSK-Manager-FE/app/components/app/design-system/SectionSpacing.vue`                                 | app/components                    | H A @d5c4797    | W                                   |    56 |
| `FE/OSK-Manager-FE/app/components/app/design-system/SectionToasts.vue`                                  | app/components                    | H M @3f303f3    | W                                   |    69 |
| `FE/OSK-Manager-FE/app/components/app/design-system/Typography.vue`                                     | app/components                    | P               | W                                   |    77 |
| `FE/OSK-Manager-FE/app/components/app/design-system/examples/DesignSystemBookingExample.vue`            | app/components                    | P               | W                                   |    85 |
| `FE/OSK-Manager-FE/app/components/app/design-system/examples/DesignSystemPaymentsExample.vue`           | app/components                    | H M @d5c4797    | W                                   |    87 |
| `FE/OSK-Manager-FE/app/components/app/design-system/examples/DesignSystemStudentBookingExample.vue`     | app/components                    | H A @d5c4797    | W                                   |   138 |
| `FE/OSK-Manager-FE/app/components/app/design-system/examples/DesignSystemStudentProfileExample.vue`     | app/components                    | H M @d5c4797    | W                                   |   102 |
| `FE/OSK-Manager-FE/app/components/app/design-system/examples/DesignSystemStudentsExample.vue`           | app/components                    | H M @d5c4797    | W                                   |   136 |
| `FE/OSK-Manager-FE/app/components/app/ui/ActionGroup.vue`                                               | app/components                    | P               | W                                   |    27 |
| `FE/OSK-Manager-FE/app/components/app/ui/DataTableShell.vue`                                            | app/components                    | H M @0c843dd    | S (koordynator)                     |   104 |
| `FE/OSK-Manager-FE/app/components/app/ui/EmptyState.vue`                                                | app/components                    | H M @0c843dd    | W                                   |    43 |
| `FE/OSK-Manager-FE/app/components/app/ui/ErrorState.vue`                                                | app/components                    | H M @0c843dd    | W                                   |    56 |
| `FE/OSK-Manager-FE/app/components/app/ui/FilterBar.vue`                                                 | app/components                    | H M @0c843dd    | W                                   |    38 |
| `FE/OSK-Manager-FE/app/components/app/ui/FormSection.vue`                                               | app/components                    | H M @b803f5b    | W                                   |    43 |
| `FE/OSK-Manager-FE/app/components/app/ui/LoadingState.vue`                                              | app/components                    | H M @b29aaec    | W                                   |    52 |
| `FE/OSK-Manager-FE/app/components/app/ui/PageHeader.vue`                                                | app/components                    | P               | W                                   |    66 |
| `FE/OSK-Manager-FE/app/components/app/ui/StatusBadge.vue`                                               | app/components                    | H M @0c843dd    | S (koordynator)                     |    47 |
| `FE/OSK-Manager-FE/app/components/app/ui/SummaryStrip.vue`                                              | app/components                    | H M @0c843dd    | W                                   |    44 |
| `FE/OSK-Manager-FE/app/components/app/ui/WeekCalendarDayHeader.vue`                                     | app/components                    | H A @cdea385    | W                                   |    32 |
| `FE/OSK-Manager-FE/app/components/app/ui/WeekCalendarHourGutter.vue`                                    | app/components                    | H A @cdea385    | W                                   |    36 |
| `FE/OSK-Manager-FE/app/components/app/ui/WeekCalendarPanel.vue`                                         | app/components                    | H A @cdea385    | W                                   |    61 |
| `FE/OSK-Manager-FE/app/components/app/ui/WeekCalendarRangeNavigation.vue`                               | app/components                    | H A @8d09464    | W                                   |    73 |
| `FE/OSK-Manager-FE/app/components/app/ui/WeekCalendarToolbar.vue`                                       | app/components                    | H A @8d09464    | W                                   |    86 |
| `FE/OSK-Manager-FE/app/components/app/ui/types.ts`                                                      | app/components                    | P               | W                                   |    14 |
| `FE/OSK-Manager-FE/app/components/auth/LoginForm.vue`                                                   | app/components                    | H M @50cbbed    | W                                   |   453 |
| `FE/OSK-Manager-FE/app/components/auth/LoginLayout.vue`                                                 | app/components                    | H M @50cbbed    | W                                   |   319 |
| `FE/OSK-Manager-FE/app/components/auth/LoginPanel.vue`                                                  | app/components                    | H M @50cbbed    | W                                   |   184 |
| `FE/OSK-Manager-FE/app/components/auth/LoginPosterArt.vue`                                              | app/components                    | H M @50cbbed    | W                                   |   180 |
| `FE/OSK-Manager-FE/app/components/courses/MyCoursesFilters.vue`                                         | app/components                    | H A @9ef9b68    | W                                   |    85 |
| `FE/OSK-Manager-FE/app/components/courses/MyCoursesList.vue`                                            | app/components                    | H M @9ef9b68    | W                                   |   141 |
| `FE/OSK-Manager-FE/app/components/courses/MyCoursesProgressBar.vue`                                     | app/components                    | H M @9ef9b68    | W                                   |    34 |
| `FE/OSK-Manager-FE/app/components/dashboard/DashboardNextLessonCard.vue`                                | app/components                    | H A @d7b1867    | W                                   |   137 |
| `FE/OSK-Manager-FE/app/components/dashboard/InstructorDashboardContent.vue`                             | app/components                    | H A @d7b1867    | S (auth, schedule)                  |   155 |
| `FE/OSK-Manager-FE/app/components/dashboard/RoleDashboardContent.vue`                                   | app/components                    | U; H A @d7b1867 | S (auth, schedule)                  |    39 |
| `FE/OSK-Manager-FE/app/components/dashboard/StudentDashboardContent.vue`                                | app/components                    | H A @d7b1867    | S (auth)                            |   179 |
| `FE/OSK-Manager-FE/app/components/dashboard/UserDrivingSchoolsSection.vue`                              | app/components                    | P               | W                                   |    75 |
| `FE/OSK-Manager-FE/app/components/events/EventsDayNavigation.vue`                                       | app/components                    | H M @6360ec3    | W                                   |    70 |
| `FE/OSK-Manager-FE/app/components/events/EventsDayScheduleGrid.vue`                                     | app/components                    | H M @b803f5b    | W                                   |   241 |
| `FE/OSK-Manager-FE/app/components/events/EventsDaySchedulePanel.vue`                                    | app/components                    | H M @b803f5b    | W                                   |   231 |
| `FE/OSK-Manager-FE/app/components/events/EventsDaySummary.vue`                                          | app/components                    | H M @6360ec3    | W                                   |    90 |
| `FE/OSK-Manager-FE/app/components/events/EventsStatusFilter.vue`                                        | app/components                    | H M @6360ec3    | W                                   |    36 |
| `FE/OSK-Manager-FE/app/components/events/EventsViewModeToggle.vue`                                      | app/components                    | H M @6360ec3    | W                                   |    45 |
| `FE/OSK-Manager-FE/app/components/instructor/reviews/MyReviewsList.vue`                                 | app/components                    | H A @5499235    | W                                   |   231 |
| `FE/OSK-Manager-FE/app/components/instructor/reviews/MyReviewsSummary.vue`                              | app/components                    | H A @5499235    | W                                   |    94 |
| `FE/OSK-Manager-FE/app/components/manager/courses/CourseCreateBasicFields.vue`                          | app/components                    | P               | W                                   |   188 |
| `FE/OSK-Manager-FE/app/components/manager/courses/CourseCreateForm.vue`                                 | app/components                    | H M @6c30b8e    | W                                   |   221 |
| `FE/OSK-Manager-FE/app/components/manager/courses/CourseCreateFormActions.vue`                          | app/components                    | H M @6c30b8e    | W                                   |    36 |
| `FE/OSK-Manager-FE/app/components/manager/courses/CourseCreateInstructorField.vue`                      | app/components                    | H M @6c30b8e    | W                                   |   102 |
| `FE/OSK-Manager-FE/app/components/manager/courses/CourseCreateTheoryFields.vue`                         | app/components                    | H M @6c30b8e    | W                                   |   118 |
| `FE/OSK-Manager-FE/app/components/manager/courses/ManagerCourseCapacityPanel.vue`                       | app/components                    | H A @0e37a5f    | W                                   |   177 |
| `FE/OSK-Manager-FE/app/components/manager/courses/ManagerCourseDetailContainer.vue`                     | app/components                    | H M @0e37a5f    | W                                   |   258 |
| `FE/OSK-Manager-FE/app/components/manager/courses/ManagerCourseDetailHeader.vue`                        | app/components                    | H M @0e37a5f    | W                                   |    40 |
| `FE/OSK-Manager-FE/app/components/manager/courses/ManagerCourseFilterEditor.vue`                        | app/components                    | H A @4e087b0    | W                                   |   161 |
| `FE/OSK-Manager-FE/app/components/manager/courses/ManagerCourseInstructorAssignmentCard.vue`            | app/components                    | H M @33c3fc2    | W                                   |   217 |
| `FE/OSK-Manager-FE/app/components/manager/courses/ManagerCourseOverviewCard.vue`                        | app/components                    | H M @0e37a5f    | W                                   |    37 |
| `FE/OSK-Manager-FE/app/components/manager/courses/ManagerCourseProfileCard.vue`                         | app/components                    | H M @0e37a5f    | W                                   |   116 |
| `FE/OSK-Manager-FE/app/components/manager/courses/ManagerCourseProgressPanel.vue`                       | app/components                    | H A @33c3fc2    | W                                   |   175 |
| `FE/OSK-Manager-FE/app/components/manager/courses/ManagerCoursesAdvancedFilters.vue`                    | app/components                    | H A @4e087b0    | W                                   |    57 |
| `FE/OSK-Manager-FE/app/components/manager/courses/ManagerCoursesDesktopTable.vue`                       | app/components                    | H M @33c3fc2    | W                                   |   133 |
| `FE/OSK-Manager-FE/app/components/manager/courses/ManagerCoursesFilters.vue`                            | app/components                    | H A @4e087b0    | W                                   |   103 |
| `FE/OSK-Manager-FE/app/components/manager/courses/ManagerCoursesListPanel.vue`                          | app/components                    | H M @0e37a5f    | W                                   |   301 |
| `FE/OSK-Manager-FE/app/components/manager/courses/ManagerCoursesMobileCards.vue`                        | app/components                    | H M @33c3fc2    | W                                   |    76 |
| `FE/OSK-Manager-FE/app/components/manager/courses/ManagerCoursesStats.vue`                              | app/components                    | H M @4e087b0    | W                                   |    40 |
| `FE/OSK-Manager-FE/app/components/manager/dashboard/ManagerAttentionItemsPanel.vue`                     | app/components                    | H M @d7b1867    | W                                   |   223 |
| `FE/OSK-Manager-FE/app/components/manager/dashboard/ManagerDashboardAvailabilitySection.vue`            | app/components                    | H M @d7b1867    | W                                   |    50 |
| `FE/OSK-Manager-FE/app/components/manager/dashboard/ManagerDashboardContent.vue`                        | app/components                    | H A @d7b1867    | W                                   |    92 |
| `FE/OSK-Manager-FE/app/components/manager/dashboard/ManagerDashboardQuickActions.vue`                   | app/components                    | H A @d7b1867    | W                                   |    58 |
| `FE/OSK-Manager-FE/app/components/manager/dashboard/ManagerDefaultSchoolCard.vue`                       | app/components                    | H M @d7b1867    | W                                   |    64 |
| `FE/OSK-Manager-FE/app/components/manager/events/ManagerAvailabilitySlotChoiceDialog.vue`               | app/components                    | H M @d7b1867    | W                                   |    99 |
| `FE/OSK-Manager-FE/app/components/manager/events/ManagerEventDeleteAction.vue`                          | app/components                    | P               | W                                   |    31 |
| `FE/OSK-Manager-FE/app/components/manager/events/ManagerEventEditActions.vue`                           | app/components                    | H M @b803f5b    | W                                   |    38 |
| `FE/OSK-Manager-FE/app/components/manager/events/ManagerEventEditBackLink.vue`                          | app/components                    | H M @b803f5b    | W                                   |    19 |
| `FE/OSK-Manager-FE/app/components/manager/events/ManagerEventEditContainer.vue`                         | app/components                    | H M @b803f5b    | W                                   |   299 |
| `FE/OSK-Manager-FE/app/components/manager/events/ManagerEventEditFormSection.vue`                       | app/components                    | H M @b803f5b    | W                                   |   173 |
| `FE/OSK-Manager-FE/app/components/manager/events/ManagerEventEditHeader.vue`                            | app/components                    | H M @b803f5b    | W                                   |    34 |
| `FE/OSK-Manager-FE/app/components/manager/events/ManagerEventEditMissingSchoolNotice.vue`               | app/components                    | H M @b803f5b    | W                                   |    33 |
| `FE/OSK-Manager-FE/app/components/manager/events/ManagerEventEditReturnErrorState.vue`                  | app/components                    | P               | W                                   |    18 |
| `FE/OSK-Manager-FE/app/components/manager/events/ManagerEventResourceFields.vue`                        | app/components                    | H M @b803f5b    | W                                   |   149 |
| `FE/OSK-Manager-FE/app/components/manager/events/ManagerEventStatusSelect.vue`                          | app/components                    | H M @b803f5b    | W                                   |   168 |
| `FE/OSK-Manager-FE/app/components/manager/events/ManagerEventStudentPickerCapacitySummary.vue`          | app/components                    | P               | W                                   |    32 |
| `FE/OSK-Manager-FE/app/components/manager/events/ManagerEventStudentPickerDialog.vue`                   | app/components                    | P               | W                                   |   289 |
| `FE/OSK-Manager-FE/app/components/manager/events/ManagerEventStudentPickerFooter.vue`                   | app/components                    | P               | W                                   |    32 |
| `FE/OSK-Manager-FE/app/components/manager/events/ManagerEventStudentPickerHeader.vue`                   | app/components                    | P               | W                                   |    17 |
| `FE/OSK-Manager-FE/app/components/manager/events/ManagerEventStudentPickerList.vue`                     | app/components                    | H M @33c3fc2    | W                                   |   115 |
| `FE/OSK-Manager-FE/app/components/manager/events/ManagerEventStudentPickerSearch.vue`                   | app/components                    | P               | W                                   |    31 |
| `FE/OSK-Manager-FE/app/components/manager/events/ManagerEventTheoryStudentsSection.vue`                 | app/components                    | H M @33c3fc2    | W                                   |   283 |
| `FE/OSK-Manager-FE/app/components/manager/events/ManagerEventTimeFields.vue`                            | app/components                    | H M @b803f5b    | W                                   |    90 |
| `FE/OSK-Manager-FE/app/components/manager/events/ManagerInstructorEventDeleteDialog.vue`                | app/components                    | H M @b803f5b    | W                                   |   108 |
| `FE/OSK-Manager-FE/app/components/manager/events/ManagerTheoryEventCreateDialog.vue`                    | app/components                    | H M @d7b1867    | W                                   |   249 |
| `FE/OSK-Manager-FE/app/components/manager/instructors/ManagerInstructorAvailabilityContent.vue`         | app/components                    | H A @d898c04    | W                                   |   238 |
| `FE/OSK-Manager-FE/app/components/manager/instructors/ManagerInstructorAvailabilityDayRow.vue`          | app/components                    | H M @86ec567    | W                                   |   129 |
| `FE/OSK-Manager-FE/app/components/manager/instructors/ManagerInstructorAvailabilityEditor.vue`          | app/components                    | H M @86ec567    | W                                   |    82 |
| `FE/OSK-Manager-FE/app/components/manager/instructors/ManagerInstructorContactQualificationsCard.vue`   | app/components                    | H M @d898c04    | W                                   |   111 |
| `FE/OSK-Manager-FE/app/components/manager/instructors/ManagerInstructorDeleteDialog.vue`                | app/components                    | P               | W                                   |    56 |
| `FE/OSK-Manager-FE/app/components/manager/instructors/ManagerInstructorDetailsContent.vue`              | app/components                    | H M @d898c04    | W                                   |   378 |
| `FE/OSK-Manager-FE/app/components/manager/instructors/ManagerInstructorDiscardDialog.vue`               | app/components                    | H A @3608030    | W                                   |    35 |
| `FE/OSK-Manager-FE/app/components/manager/instructors/ManagerInstructorEditDialog.vue`                  | app/components                    | P               | S (registry)                        |    66 |
| `FE/OSK-Manager-FE/app/components/manager/instructors/ManagerInstructorEditForm.vue`                    | app/components                    | P               | W                                   |   292 |
| `FE/OSK-Manager-FE/app/components/manager/instructors/ManagerInstructorEventFormSection.vue`            | app/components                    | H M @eee74e4    | W                                   |   510 |
| `FE/OSK-Manager-FE/app/components/manager/instructors/ManagerInstructorFilterEditor.vue`                | app/components                    | H A @2b80645    | W                                   |   225 |
| `FE/OSK-Manager-FE/app/components/manager/instructors/ManagerInstructorFormFields.vue`                  | app/components                    | H M @3608030    | W                                   |   248 |
| `FE/OSK-Manager-FE/app/components/manager/instructors/ManagerInstructorMobileSlotsList.vue`             | app/components                    | H A @cdea385    | W                                   |   129 |
| `FE/OSK-Manager-FE/app/components/manager/instructors/ManagerInstructorProfileCard.vue`                 | app/components                    | H M @33c3fc2    | W                                   |    99 |
| `FE/OSK-Manager-FE/app/components/manager/instructors/ManagerInstructorQualificationBadges.vue`         | app/components                    | H A @5c9e704    | W                                   |    16 |
| `FE/OSK-Manager-FE/app/components/manager/instructors/ManagerInstructorRelatedDataCard.vue`             | app/components                    | H M @d898c04    | W                                   |    95 |
| `FE/OSK-Manager-FE/app/components/manager/instructors/ManagerInstructorScheduleContextCard.vue`         | app/components                    | H M @2b80645    | W                                   |    72 |
| `FE/OSK-Manager-FE/app/components/manager/instructors/ManagerInstructorScheduleWeekSection.vue`         | app/components                    | H M @b803f5b    | W                                   |   304 |
| `FE/OSK-Manager-FE/app/components/manager/instructors/ManagerInstructorSlotRun.vue`                     | app/components                    | H A @cdea385    | W                                   |    58 |
| `FE/OSK-Manager-FE/app/components/manager/instructors/ManagerInstructorWeeklyAvailabilityPreview.vue`   | app/components                    | P               | W                                   |   195 |
| `FE/OSK-Manager-FE/app/components/manager/instructors/ManagerInstructorWeeklyCalendar.vue`              | app/components                    | H M @cdea385    | W                                   |   347 |
| `FE/OSK-Manager-FE/app/components/manager/instructors/ManagerInstructorWeeklyCalendarHeader.vue`        | app/components                    | H M @cdea385    | W                                   |    97 |
| `FE/OSK-Manager-FE/app/components/manager/instructors/ManagerInstructorWeeklyCalendarOverview.vue`      | app/components                    | P               | W                                   |    60 |
| `FE/OSK-Manager-FE/app/components/manager/instructors/ManagerInstructorsAdvancedFilters.vue`            | app/components                    | H A @2b80645    | W                                   |    76 |
| `FE/OSK-Manager-FE/app/components/manager/instructors/ManagerInstructorsDesktopTable.vue`               | app/components                    | H M @33c3fc2    | W                                   |   106 |
| `FE/OSK-Manager-FE/app/components/manager/instructors/ManagerInstructorsListCard.vue`                   | app/components                    | H M @2b80645    | W                                   |   304 |
| `FE/OSK-Manager-FE/app/components/manager/instructors/ManagerInstructorsMobileCards.vue`                | app/components                    | H M @33c3fc2    | W                                   |    74 |
| `FE/OSK-Manager-FE/app/components/manager/instructors/ManagerInstructorsSearch.vue`                     | app/components                    | H A @2b80645    | W                                   |   127 |
| `FE/OSK-Manager-FE/app/components/manager/instructors/ManagerInstructorsStatsGrid.vue`                  | app/components                    | H M @2b80645    | W                                   |    65 |
| `FE/OSK-Manager-FE/app/components/manager/instructors/ManagerSchoolAvailabilityWeekToolbar.vue`         | app/components                    | H M @d7b1867    | W                                   |    40 |
| `FE/OSK-Manager-FE/app/components/manager/instructors/ManagerSchoolWeeklyAvailabilityCalendar.vue`      | app/components                    | H M @d7b1867    | W                                   |   411 |
| `FE/OSK-Manager-FE/app/components/manager/lessons/ManagerLessonBookingDialog.vue`                       | app/components                    | H M @d7b1867    | W                                   |   184 |
| `FE/OSK-Manager-FE/app/components/manager/lessons/ManagerLessonBookingInstructorSelect.vue`             | app/components                    | P               | W                                   |    43 |
| `FE/OSK-Manager-FE/app/components/manager/lessons/ManagerLessonBookingSlotSummary.vue`                  | app/components                    | P               | W                                   |    35 |
| `FE/OSK-Manager-FE/app/components/manager/lessons/ManagerLessonBookingStudentCourseSelect.vue`          | app/components                    | P               | W                                   |   111 |
| `FE/OSK-Manager-FE/app/components/manager/lessons/ManagerLessonBookingVehicleSelect.vue`                | app/components                    | H M @eee74e4    | S (registry)                        |    76 |
| `FE/OSK-Manager-FE/app/components/manager/lessons/ManagerLessonEditActions.vue`                         | app/components                    | H M @bf4ea41    | W                                   |    43 |
| `FE/OSK-Manager-FE/app/components/manager/lessons/ManagerLessonEditContainer.vue`                       | app/components                    | H M @bf4ea41    | W                                   |   171 |
| `FE/OSK-Manager-FE/app/components/manager/lessons/ManagerLessonEditForm.vue`                            | app/components                    | H M @bf4ea41    | W                                   |   544 |
| `FE/OSK-Manager-FE/app/components/manager/lessons/ManagerLessonEditHeader.vue`                          | app/components                    | H M @bf4ea41    | W                                   |    42 |
| `FE/OSK-Manager-FE/app/components/manager/osk/ManagerOskDeleteDialog.vue`                               | app/components                    | H M @5c9e704    | W                                   |    97 |
| `FE/OSK-Manager-FE/app/components/manager/osk/ManagerOskListGrid.vue`                                   | app/components                    | H M @5c9e704    | W                                   |   280 |
| `FE/OSK-Manager-FE/app/components/manager/osk/ManagerOskListPanel.vue`                                  | app/components                    | H A @5c9e704    | W                                   |   126 |
| `FE/OSK-Manager-FE/app/components/manager/osk/ManagerOskSchoolFormDialog.vue`                           | app/components                    | H M @5c9e704    | W                                   |   254 |
| `FE/OSK-Manager-FE/app/components/manager/reviews/LessonRatingsSummary.vue`                             | app/components                    | H M @c3dfb3a    | W                                   |    65 |
| `FE/OSK-Manager-FE/app/components/manager/reviews/ManagerLessonRatingItem.vue`                          | app/components                    | H A @c3dfb3a    | W                                   |   311 |
| `FE/OSK-Manager-FE/app/components/manager/reviews/ManagerLessonRatingsFilters.vue`                      | app/components                    | H M @c3dfb3a    | W                                   |   184 |
| `FE/OSK-Manager-FE/app/components/manager/reviews/ManagerLessonRatingsList.vue`                         | app/components                    | H A @c3dfb3a    | W                                   |   171 |
| `FE/OSK-Manager-FE/app/components/manager/schedule/ManagerScheduleLessonBlock.vue`                      | app/components                    | H M @dad0dc1    | W                                   |   151 |
| `FE/OSK-Manager-FE/app/components/manager/schedule/ManagerScheduleLessonTable.vue`                      | app/components                    | H M @33c3fc2    | W                                   |   315 |
| `FE/OSK-Manager-FE/app/components/manager/schedule/ManagerScheduleMetaBar.vue`                          | app/components                    | H M @eee74e4    | W                                   |    14 |
| `FE/OSK-Manager-FE/app/components/manager/schedule/ManagerScheduleSameStartBlock.vue`                   | app/components                    | H A @dad0dc1    | W                                   |    62 |
| `FE/OSK-Manager-FE/app/components/manager/schedule/ManagerScheduleSameStartDialog.vue`                  | app/components                    | H A @dad0dc1    | W                                   |   112 |
| `FE/OSK-Manager-FE/app/components/manager/schedule/ManagerScheduleVehicleIcon.vue`                      | app/components                    | H A @eee74e4    | W                                   |    46 |
| `FE/OSK-Manager-FE/app/components/manager/schedule/ManagerSchoolScheduleCalendar.vue`                   | app/components                    | H M @8d09464    | W                                   |   189 |
| `FE/OSK-Manager-FE/app/components/manager/schedule/ManagerSchoolScheduleCalendarDayColumn.vue`          | app/components                    | H M @dad0dc1    | W                                   |   129 |
| `FE/OSK-Manager-FE/app/components/manager/schedule/ManagerSchoolScheduleCalendarGrid.vue`               | app/components                    | H M @dad0dc1    | W                                   |   143 |
| `FE/OSK-Manager-FE/app/components/manager/students/ManagerStudentAssignCourseDialog.vue`                | app/components                    | P               | S (registry)                        |   158 |
| `FE/OSK-Manager-FE/app/components/manager/students/ManagerStudentCoursesSection.vue`                    | app/components                    | H M @2b80645    | W                                   |    84 |
| `FE/OSK-Manager-FE/app/components/manager/students/ManagerStudentDetailsContent.vue`                    | app/components                    | H A @d5c4797    | W                                   |   264 |
| `FE/OSK-Manager-FE/app/components/manager/students/ManagerStudentFilterEditor.vue`                      | app/components                    | H A @01d4eb6    | W                                   |   294 |
| `FE/OSK-Manager-FE/app/components/manager/students/ManagerStudentFormDialog.vue`                        | app/components                    | H M @b29aaec    | S (registry)                        |   179 |
| `FE/OSK-Manager-FE/app/components/manager/students/ManagerStudentFormFields.vue`                        | app/components                    | P               | W                                   |   180 |
| `FE/OSK-Manager-FE/app/components/manager/students/ManagerStudentNotes.vue`                             | app/components                    | H M @d5c4797    | S (registry)                        |   112 |
| `FE/OSK-Manager-FE/app/components/manager/students/ManagerStudentNotesContent.vue`                      | app/components                    | H A @d5c4797    | W                                   |   116 |
| `FE/OSK-Manager-FE/app/components/manager/students/ManagerStudentOverviewTab.vue`                       | app/components                    | H A @2b80645    | W                                   |   335 |
| `FE/OSK-Manager-FE/app/components/manager/students/ManagerStudentPaymentCreateForm.vue`                 | app/components                    | P               | S (auth, schedule)                  |    70 |
| `FE/OSK-Manager-FE/app/components/manager/students/ManagerStudentPaymentsSection.vue`                   | app/components                    | Z; H M @d5c4797 | S (auth, schedule)                  |   255 |
| `FE/OSK-Manager-FE/app/components/manager/students/ManagerStudentPaymentsSummaryGrid.vue`               | app/components                    | P               | W                                   |    55 |
| `FE/OSK-Manager-FE/app/components/manager/students/ManagerStudentPkkCopy.vue`                           | app/components                    | H A @ec39dd6    | W                                   |    13 |
| `FE/OSK-Manager-FE/app/components/manager/students/ManagerStudentProcessStatus.vue`                     | app/components                    | H M @2b80645    | W                                   |   137 |
| `FE/OSK-Manager-FE/app/components/manager/students/ManagerStudentProfileCard.vue`                       | app/components                    | H M @2b80645    | W                                   |   154 |
| `FE/OSK-Manager-FE/app/components/manager/students/ManagerStudentScheduleSection.vue`                   | app/components                    | H M @2b80645    | W                                   |   211 |
| `FE/OSK-Manager-FE/app/components/manager/students/ManagerStudentsAdvancedFilters.vue`                  | app/components                    | H A @01d4eb6    | W                                   |    70 |
| `FE/OSK-Manager-FE/app/components/manager/students/ManagerStudentsDesktopTable.vue`                     | app/components                    | H A @33c3fc2    | W                                   |   125 |
| `FE/OSK-Manager-FE/app/components/manager/students/ManagerStudentsFilters.vue`                          | app/components                    | H M @e12b01c    | W                                   |   159 |
| `FE/OSK-Manager-FE/app/components/manager/students/ManagerStudentsList.vue`                             | app/components                    | H M @2b80645    | W                                   |    62 |
| `FE/OSK-Manager-FE/app/components/manager/students/ManagerStudentsMobileCards.vue`                      | app/components                    | H A @33c3fc2    | W                                   |   103 |
| `FE/OSK-Manager-FE/app/components/manager/students/ManagerStudentsPageHeader.vue`                       | app/components                    | H M @b29aaec    | W                                   |    26 |
| `FE/OSK-Manager-FE/app/components/manager/students/ManagerStudentsPagination.vue`                       | app/components                    | H M @e12b01c    | W                                   |    85 |
| `FE/OSK-Manager-FE/app/components/manager/students/ManagerStudentsSearch.vue`                           | app/components                    | H A @01d4eb6    | W                                   |   108 |
| `FE/OSK-Manager-FE/app/components/manager/students/ManagerStudentsStats.vue`                            | app/components                    | H M @b29aaec    | W                                   |    55 |
| `FE/OSK-Manager-FE/app/components/shadcn/badge/Badge.vue`                                               | UI primitives                     | P               | W                                   |    28 |
| `FE/OSK-Manager-FE/app/components/shadcn/badge/index.ts`                                                | UI primitives                     | P               | W                                   |    26 |
| `FE/OSK-Manager-FE/app/components/shadcn/breadcrumb/Breadcrumb.vue`                                     | UI primitives                     | P               | W                                   |    13 |
| `FE/OSK-Manager-FE/app/components/shadcn/breadcrumb/BreadcrumbEllipsis.vue`                             | UI primitives                     | P               | W                                   |    23 |
| `FE/OSK-Manager-FE/app/components/shadcn/breadcrumb/BreadcrumbItem.vue`                                 | UI primitives                     | P               | W                                   |    17 |
| `FE/OSK-Manager-FE/app/components/shadcn/breadcrumb/BreadcrumbLink.vue`                                 | UI primitives                     | P               | W                                   |    25 |
| `FE/OSK-Manager-FE/app/components/shadcn/breadcrumb/BreadcrumbList.vue`                                 | UI primitives                     | P               | W                                   |    22 |
| `FE/OSK-Manager-FE/app/components/shadcn/breadcrumb/BreadcrumbPage.vue`                                 | UI primitives                     | P               | W                                   |    20 |
| `FE/OSK-Manager-FE/app/components/shadcn/breadcrumb/BreadcrumbSeparator.vue`                            | UI primitives                     | P               | W                                   |    22 |
| `FE/OSK-Manager-FE/app/components/shadcn/breadcrumb/index.ts`                                           | UI primitives                     | P               | W                                   |     7 |
| `FE/OSK-Manager-FE/app/components/shadcn/button/Button.vue`                                             | UI primitives                     | P               | W                                   |    34 |
| `FE/OSK-Manager-FE/app/components/shadcn/button/index.ts`                                               | UI primitives                     | H M @c1b92fa    | W                                   |    37 |
| `FE/OSK-Manager-FE/app/components/shadcn/calendar/Calendar.vue`                                         | UI primitives                     | H M @427616e    | W                                   |   234 |
| `FE/OSK-Manager-FE/app/components/shadcn/calendar/CalendarCell.vue`                                     | UI primitives                     | P               | W                                   |    30 |
| `FE/OSK-Manager-FE/app/components/shadcn/calendar/CalendarCellTrigger.vue`                              | UI primitives                     | P               | W                                   |    47 |
| `FE/OSK-Manager-FE/app/components/shadcn/calendar/CalendarGrid.vue`                                     | UI primitives                     | P               | W                                   |    25 |
| `FE/OSK-Manager-FE/app/components/shadcn/calendar/CalendarGridBody.vue`                                 | UI primitives                     | P               | W                                   |    12 |
| `FE/OSK-Manager-FE/app/components/shadcn/calendar/CalendarGridHead.vue`                                 | UI primitives                     | P               | W                                   |    15 |
| `FE/OSK-Manager-FE/app/components/shadcn/calendar/CalendarGridRow.vue`                                  | UI primitives                     | P               | W                                   |    25 |
| `FE/OSK-Manager-FE/app/components/shadcn/calendar/CalendarHeadCell.vue`                                 | UI primitives                     | P               | W                                   |    30 |
| `FE/OSK-Manager-FE/app/components/shadcn/calendar/CalendarHeader.vue`                                   | UI primitives                     | P               | W                                   |    30 |
| `FE/OSK-Manager-FE/app/components/shadcn/calendar/CalendarHeading.vue`                                  | UI primitives                     | P               | W                                   |    35 |
| `FE/OSK-Manager-FE/app/components/shadcn/calendar/CalendarNextButton.vue`                               | UI primitives                     | P               | W                                   |    35 |
| `FE/OSK-Manager-FE/app/components/shadcn/calendar/CalendarPrevButton.vue`                               | UI primitives                     | P               | W                                   |    35 |
| `FE/OSK-Manager-FE/app/components/shadcn/calendar/index.ts`                                             | UI primitives                     | P               | W                                   |    18 |
| `FE/OSK-Manager-FE/app/components/shadcn/card/Card.vue`                                                 | UI primitives                     | P               | W                                   |    22 |
| `FE/OSK-Manager-FE/app/components/shadcn/card/CardAction.vue`                                           | UI primitives                     | P               | W                                   |    22 |
| `FE/OSK-Manager-FE/app/components/shadcn/card/CardContent.vue`                                          | UI primitives                     | P               | W                                   |    14 |
| `FE/OSK-Manager-FE/app/components/shadcn/card/CardDescription.vue`                                      | UI primitives                     | P               | W                                   |    17 |
| `FE/OSK-Manager-FE/app/components/shadcn/card/CardFooter.vue`                                           | UI primitives                     | P               | W                                   |    17 |
| `FE/OSK-Manager-FE/app/components/shadcn/card/CardHeader.vue`                                           | UI primitives                     | P               | W                                   |    22 |
| `FE/OSK-Manager-FE/app/components/shadcn/card/CardTitle.vue`                                            | UI primitives                     | P               | W                                   |    17 |
| `FE/OSK-Manager-FE/app/components/shadcn/card/index.ts`                                                 | UI primitives                     | P               | W                                   |     7 |
| `FE/OSK-Manager-FE/app/components/shadcn/checkbox/Checkbox.vue`                                         | UI primitives                     | H M @0c843dd    | W                                   |   122 |
| `FE/OSK-Manager-FE/app/components/shadcn/checkbox/index.ts`                                             | UI primitives                     | P               | W                                   |     1 |
| `FE/OSK-Manager-FE/app/components/shadcn/date-picker/DatePicker.vue`                                    | UI primitives                     | H M @427616e    | S (koordynator)                     |   327 |
| `FE/OSK-Manager-FE/app/components/shadcn/date-picker/index.ts`                                          | UI primitives                     | H M @427616e    | W                                   |     5 |
| `FE/OSK-Manager-FE/app/components/shadcn/date-range-picker/DateRangePicker.vue`                         | UI primitives                     | H A @86ec567    | W                                   |   516 |
| `FE/OSK-Manager-FE/app/components/shadcn/date-range-picker/index.ts`                                    | UI primitives                     | H A @86ec567    | W                                   |     4 |
| `FE/OSK-Manager-FE/app/components/shadcn/date-time-picker/DateTimePicker.vue`                           | UI primitives                     | H M @427616e    | W                                   |   195 |
| `FE/OSK-Manager-FE/app/components/shadcn/date-time-picker/index.ts`                                     | UI primitives                     | P               | W                                   |     1 |
| `FE/OSK-Manager-FE/app/components/shadcn/dialog/Dialog.vue`                                             | UI primitives                     | P               | W                                   |    15 |
| `FE/OSK-Manager-FE/app/components/shadcn/dialog/DialogClose.vue`                                        | UI primitives                     | P               | W                                   |    12 |
| `FE/OSK-Manager-FE/app/components/shadcn/dialog/DialogContent.vue`                                      | UI primitives                     | H M @ec4e6fc    | W                                   |    78 |
| `FE/OSK-Manager-FE/app/components/shadcn/dialog/DialogDescription.vue`                                  | UI primitives                     | P               | W                                   |    25 |
| `FE/OSK-Manager-FE/app/components/shadcn/dialog/DialogFooter.vue`                                       | UI primitives                     | P               | W                                   |    34 |
| `FE/OSK-Manager-FE/app/components/shadcn/dialog/DialogHeader.vue`                                       | UI primitives                     | P               | W                                   |    17 |
| `FE/OSK-Manager-FE/app/components/shadcn/dialog/DialogOverlay.vue`                                      | UI primitives                     | H M @725041d    | W                                   |    25 |
| `FE/OSK-Manager-FE/app/components/shadcn/dialog/DialogScrollContent.vue`                                | UI primitives                     | H M @725041d    | W                                   |    68 |
| `FE/OSK-Manager-FE/app/components/shadcn/dialog/DialogTitle.vue`                                        | UI primitives                     | P               | W                                   |    25 |
| `FE/OSK-Manager-FE/app/components/shadcn/dialog/DialogTrigger.vue`                                      | UI primitives                     | P               | W                                   |    12 |
| `FE/OSK-Manager-FE/app/components/shadcn/dialog/index.ts`                                               | UI primitives                     | P               | W                                   |    10 |
| `FE/OSK-Manager-FE/app/components/shadcn/input/Input.vue`                                               | UI primitives                     | H M @0c843dd    | W                                   |    35 |
| `FE/OSK-Manager-FE/app/components/shadcn/input/index.ts`                                                | UI primitives                     | P               | W                                   |     1 |
| `FE/OSK-Manager-FE/app/components/shadcn/label/Label.vue`                                               | UI primitives                     | P               | W                                   |    26 |
| `FE/OSK-Manager-FE/app/components/shadcn/label/index.ts`                                                | UI primitives                     | P               | W                                   |     1 |
| `FE/OSK-Manager-FE/app/components/shadcn/menubar/Menubar.vue`                                           | UI primitives                     | P               | W                                   |    32 |
| `FE/OSK-Manager-FE/app/components/shadcn/menubar/MenubarCheckboxItem.vue`                               | UI primitives                     | P               | W                                   |    48 |
| `FE/OSK-Manager-FE/app/components/shadcn/menubar/MenubarContent.vue`                                    | UI primitives                     | P               | W                                   |    42 |
| `FE/OSK-Manager-FE/app/components/shadcn/menubar/MenubarGroup.vue`                                      | UI primitives                     | P               | W                                   |    12 |
| `FE/OSK-Manager-FE/app/components/shadcn/menubar/MenubarItem.vue`                                       | UI primitives                     | P               | W                                   |    37 |
| `FE/OSK-Manager-FE/app/components/shadcn/menubar/MenubarLabel.vue`                                      | UI primitives                     | P               | W                                   |    24 |
| `FE/OSK-Manager-FE/app/components/shadcn/menubar/MenubarMenu.vue`                                       | UI primitives                     | P               | W                                   |    12 |
| `FE/OSK-Manager-FE/app/components/shadcn/menubar/MenubarRadioGroup.vue`                                 | UI primitives                     | P               | W                                   |    15 |
| `FE/OSK-Manager-FE/app/components/shadcn/menubar/MenubarRadioItem.vue`                                  | UI primitives                     | P               | W                                   |    45 |
| `FE/OSK-Manager-FE/app/components/shadcn/menubar/MenubarSeparator.vue`                                  | UI primitives                     | P               | W                                   |    23 |
| `FE/OSK-Manager-FE/app/components/shadcn/menubar/MenubarShortcut.vue`                                   | UI primitives                     | P               | W                                   |    22 |
| `FE/OSK-Manager-FE/app/components/shadcn/menubar/MenubarSub.vue`                                        | UI primitives                     | P               | W                                   |    20 |
| `FE/OSK-Manager-FE/app/components/shadcn/menubar/MenubarSubContent.vue`                                 | UI primitives                     | P               | W                                   |    41 |
| `FE/OSK-Manager-FE/app/components/shadcn/menubar/MenubarSubTrigger.vue`                                 | UI primitives                     | P               | W                                   |    35 |
| `FE/OSK-Manager-FE/app/components/shadcn/menubar/MenubarTrigger.vue`                                    | UI primitives                     | P               | W                                   |    30 |
| `FE/OSK-Manager-FE/app/components/shadcn/menubar/index.ts`                                              | UI primitives                     | P               | W                                   |    15 |
| `FE/OSK-Manager-FE/app/components/shadcn/native-select/NativeSelect.vue`                                | UI primitives                     | H M @0c843dd    | W                                   |    55 |
| `FE/OSK-Manager-FE/app/components/shadcn/native-select/NativeSelectOptGroup.vue`                        | UI primitives                     | P               | W                                   |    15 |
| `FE/OSK-Manager-FE/app/components/shadcn/native-select/NativeSelectOption.vue`                          | UI primitives                     | P               | W                                   |    15 |
| `FE/OSK-Manager-FE/app/components/shadcn/native-select/index.ts`                                        | UI primitives                     | P               | W                                   |     3 |
| `FE/OSK-Manager-FE/app/components/shadcn/popover/Popover.vue`                                           | UI primitives                     | P               | W                                   |    15 |
| `FE/OSK-Manager-FE/app/components/shadcn/popover/PopoverAnchor.vue`                                     | UI primitives                     | P               | W                                   |    12 |
| `FE/OSK-Manager-FE/app/components/shadcn/popover/PopoverContent.vue`                                    | UI primitives                     | P               | W                                   |    42 |
| `FE/OSK-Manager-FE/app/components/shadcn/popover/PopoverTrigger.vue`                                    | UI primitives                     | P               | W                                   |    12 |
| `FE/OSK-Manager-FE/app/components/shadcn/popover/index.ts`                                              | UI primitives                     | P               | W                                   |     4 |
| `FE/OSK-Manager-FE/app/components/shadcn/radio-group/RadioGroup.vue`                                    | UI primitives                     | P               | W                                   |    27 |
| `FE/OSK-Manager-FE/app/components/shadcn/radio-group/RadioGroupItem.vue`                                | UI primitives                     | H M @0c843dd    | W                                   |    89 |
| `FE/OSK-Manager-FE/app/components/shadcn/radio-group/index.ts`                                          | UI primitives                     | P               | W                                   |     2 |
| `FE/OSK-Manager-FE/app/components/shadcn/select/Select.vue`                                             | UI primitives                     | P               | W                                   |    15 |
| `FE/OSK-Manager-FE/app/components/shadcn/select/SelectContent.vue`                                      | UI primitives                     | P               | W                                   |    61 |
| `FE/OSK-Manager-FE/app/components/shadcn/select/SelectGroup.vue`                                        | UI primitives                     | P               | W                                   |    12 |
| `FE/OSK-Manager-FE/app/components/shadcn/select/SelectItem.vue`                                         | UI primitives                     | H M @0c843dd    | W                                   |    48 |
| `FE/OSK-Manager-FE/app/components/shadcn/select/SelectItemText.vue`                                     | UI primitives                     | P               | W                                   |    12 |
| `FE/OSK-Manager-FE/app/components/shadcn/select/SelectLabel.vue`                                        | UI primitives                     | P               | W                                   |    19 |
| `FE/OSK-Manager-FE/app/components/shadcn/select/SelectScrollDownButton.vue`                             | UI primitives                     | P               | W                                   |    33 |
| `FE/OSK-Manager-FE/app/components/shadcn/select/SelectScrollUpButton.vue`                               | UI primitives                     | P               | W                                   |    33 |
| `FE/OSK-Manager-FE/app/components/shadcn/select/SelectSeparator.vue`                                    | UI primitives                     | P               | W                                   |    23 |
| `FE/OSK-Manager-FE/app/components/shadcn/select/SelectTrigger.vue`                                      | UI primitives                     | H M @b803f5b    | W                                   |    43 |
| `FE/OSK-Manager-FE/app/components/shadcn/select/SelectValue.vue`                                        | UI primitives                     | P               | W                                   |    12 |
| `FE/OSK-Manager-FE/app/components/shadcn/select/index.ts`                                               | UI primitives                     | P               | W                                   |    11 |
| `FE/OSK-Manager-FE/app/components/shadcn/separator/Separator.vue`                                       | UI primitives                     | P               | W                                   |    31 |
| `FE/OSK-Manager-FE/app/components/shadcn/separator/index.ts`                                            | UI primitives                     | P               | W                                   |     1 |
| `FE/OSK-Manager-FE/app/components/shadcn/sheet/Sheet.vue`                                               | UI primitives                     | P               | W                                   |    15 |
| `FE/OSK-Manager-FE/app/components/shadcn/sheet/SheetClose.vue`                                          | UI primitives                     | P               | W                                   |    12 |
| `FE/OSK-Manager-FE/app/components/shadcn/sheet/SheetContent.vue`                                        | UI primitives                     | H M @6dea058    | W                                   |    66 |
| `FE/OSK-Manager-FE/app/components/shadcn/sheet/SheetDescription.vue`                                    | UI primitives                     | P               | W                                   |    23 |
| `FE/OSK-Manager-FE/app/components/shadcn/sheet/SheetFooter.vue`                                         | UI primitives                     | P               | W                                   |    15 |
| `FE/OSK-Manager-FE/app/components/shadcn/sheet/SheetHeader.vue`                                         | UI primitives                     | P               | W                                   |    15 |
| `FE/OSK-Manager-FE/app/components/shadcn/sheet/SheetOverlay.vue`                                        | UI primitives                     | P               | W                                   |    28 |
| `FE/OSK-Manager-FE/app/components/shadcn/sheet/SheetTitle.vue`                                          | UI primitives                     | P               | W                                   |    23 |
| `FE/OSK-Manager-FE/app/components/shadcn/sheet/SheetTrigger.vue`                                        | UI primitives                     | P               | W                                   |    12 |
| `FE/OSK-Manager-FE/app/components/shadcn/sheet/index.ts`                                                | UI primitives                     | P               | W                                   |     8 |
| `FE/OSK-Manager-FE/app/components/shadcn/sidebar/Sidebar.vue`                                           | UI primitives                     | P               | W                                   |   112 |
| `FE/OSK-Manager-FE/app/components/shadcn/sidebar/SidebarContent.vue`                                    | UI primitives                     | P               | W                                   |    23 |
| `FE/OSK-Manager-FE/app/components/shadcn/sidebar/SidebarFooter.vue`                                     | UI primitives                     | P               | W                                   |    18 |
| `FE/OSK-Manager-FE/app/components/shadcn/sidebar/SidebarGroup.vue`                                      | UI primitives                     | P               | W                                   |    18 |
| `FE/OSK-Manager-FE/app/components/shadcn/sidebar/SidebarGroupAction.vue`                                | UI primitives                     | P               | W                                   |    31 |
| `FE/OSK-Manager-FE/app/components/shadcn/sidebar/SidebarGroupContent.vue`                               | UI primitives                     | P               | W                                   |    18 |
| `FE/OSK-Manager-FE/app/components/shadcn/sidebar/SidebarGroupLabel.vue`                                 | UI primitives                     | P               | W                                   |    30 |
| `FE/OSK-Manager-FE/app/components/shadcn/sidebar/SidebarHeader.vue`                                     | UI primitives                     | P               | W                                   |    18 |
| `FE/OSK-Manager-FE/app/components/shadcn/sidebar/SidebarInput.vue`                                      | UI primitives                     | P               | W                                   |    19 |
| `FE/OSK-Manager-FE/app/components/shadcn/sidebar/SidebarInset.vue`                                      | UI primitives                     | H M @ec4e6fc    | W                                   |    23 |
| `FE/OSK-Manager-FE/app/components/shadcn/sidebar/SidebarMenu.vue`                                       | UI primitives                     | P               | W                                   |    18 |
| `FE/OSK-Manager-FE/app/components/shadcn/sidebar/SidebarMenuAction.vue`                                 | UI primitives                     | P               | W                                   |    44 |
| `FE/OSK-Manager-FE/app/components/shadcn/sidebar/SidebarMenuBadge.vue`                                  | UI primitives                     | P               | W                                   |    28 |
| `FE/OSK-Manager-FE/app/components/shadcn/sidebar/SidebarMenuButton.vue`                                 | UI primitives                     | P               | W                                   |    61 |
| `FE/OSK-Manager-FE/app/components/shadcn/sidebar/SidebarMenuButtonChild.vue`                            | UI primitives                     | P               | W                                   |    38 |
| `FE/OSK-Manager-FE/app/components/shadcn/sidebar/SidebarMenuItem.vue`                                   | UI primitives                     | P               | W                                   |    18 |
| `FE/OSK-Manager-FE/app/components/shadcn/sidebar/SidebarMenuSkeleton.vue`                               | UI primitives                     | P               | W                                   |    35 |
| `FE/OSK-Manager-FE/app/components/shadcn/sidebar/SidebarMenuSub.vue`                                    | UI primitives                     | P               | W                                   |    24 |
| `FE/OSK-Manager-FE/app/components/shadcn/sidebar/SidebarMenuSubButton.vue`                              | UI primitives                     | P               | W                                   |    45 |
| `FE/OSK-Manager-FE/app/components/shadcn/sidebar/SidebarMenuSubItem.vue`                                | UI primitives                     | P               | W                                   |    18 |
| `FE/OSK-Manager-FE/app/components/shadcn/sidebar/SidebarProvider.vue`                                   | UI primitives                     | P               | S (koordynator)                     |   110 |
| `FE/OSK-Manager-FE/app/components/shadcn/sidebar/SidebarRail.vue`                                       | UI primitives                     | P               | W                                   |    35 |
| `FE/OSK-Manager-FE/app/components/shadcn/sidebar/SidebarSeparator.vue`                                  | UI primitives                     | P               | W                                   |    19 |
| `FE/OSK-Manager-FE/app/components/shadcn/sidebar/SidebarTrigger.vue`                                    | UI primitives                     | P               | W                                   |    27 |
| `FE/OSK-Manager-FE/app/components/shadcn/sidebar/index.ts`                                              | UI primitives                     | P               | W                                   |    63 |
| `FE/OSK-Manager-FE/app/components/shadcn/sidebar/utils.ts`                                              | UI primitives                     | P               | W                                   |    19 |
| `FE/OSK-Manager-FE/app/components/shadcn/skeleton/Skeleton.vue`                                         | UI primitives                     | P               | W                                   |    17 |
| `FE/OSK-Manager-FE/app/components/shadcn/skeleton/index.ts`                                             | UI primitives                     | P               | W                                   |     1 |
| `FE/OSK-Manager-FE/app/components/shadcn/slider/Slider.vue`                                             | UI primitives                     | P               | W                                   |    53 |
| `FE/OSK-Manager-FE/app/components/shadcn/slider/index.ts`                                               | UI primitives                     | P               | W                                   |     1 |
| `FE/OSK-Manager-FE/app/components/shadcn/switch/Switch.vue`                                             | UI primitives                     | P               | W                                   |    42 |
| `FE/OSK-Manager-FE/app/components/shadcn/switch/index.ts`                                               | UI primitives                     | P               | W                                   |     1 |
| `FE/OSK-Manager-FE/app/components/shadcn/textarea/Textarea.vue`                                         | UI primitives                     | P               | W                                   |    33 |
| `FE/OSK-Manager-FE/app/components/shadcn/textarea/index.ts`                                             | UI primitives                     | P               | W                                   |     1 |
| `FE/OSK-Manager-FE/app/components/shadcn/time-picker/TimePicker.vue`                                    | UI primitives                     | H A @b803f5b    | W                                   |   828 |
| `FE/OSK-Manager-FE/app/components/shadcn/time-picker/index.ts`                                          | UI primitives                     | H A @64b5640    | W                                   |     1 |
| `FE/OSK-Manager-FE/app/components/shadcn/tooltip/Tooltip.vue`                                           | UI primitives                     | P               | W                                   |    15 |
| `FE/OSK-Manager-FE/app/components/shadcn/tooltip/TooltipContent.vue`                                    | UI primitives                     | P               | W                                   |    50 |
| `FE/OSK-Manager-FE/app/components/shadcn/tooltip/TooltipProvider.vue`                                   | UI primitives                     | P               | W                                   |    14 |
| `FE/OSK-Manager-FE/app/components/shadcn/tooltip/TooltipTrigger.vue`                                    | UI primitives                     | P               | W                                   |    12 |
| `FE/OSK-Manager-FE/app/components/shadcn/tooltip/index.ts`                                              | UI primitives                     | P               | W                                   |     4 |
| `FE/OSK-Manager-FE/app/components/shadcn/week-picker/WeekPicker.vue`                                    | UI primitives                     | H A @86ec567    | W                                   |   163 |
| `FE/OSK-Manager-FE/app/components/shadcn/week-picker/index.ts`                                          | UI primitives                     | H A @86ec567    | W                                   |     1 |
| `FE/OSK-Manager-FE/app/components/student/lesson-booking/StudentLessonBookingConfirmDialog.vue`         | app/components                    | H A @ec4e6fc    | W                                   |   136 |
| `FE/OSK-Manager-FE/app/components/student/lesson-booking/StudentLessonBookingCourseSelect.vue`          | app/components                    | H M @ec4e6fc    | W                                   |    63 |
| `FE/OSK-Manager-FE/app/components/student/lesson-booking/StudentLessonBookingFeedbackBanner.vue`        | app/components                    | H A @d5c4797    | W                                   |    48 |
| `FE/OSK-Manager-FE/app/components/student/lesson-booking/StudentLessonBookingSchedulePanel.vue`         | app/components                    | H A @ec4e6fc    | W                                   |   554 |
| `FE/OSK-Manager-FE/app/components/student/lesson-booking/StudentLessonBookingSelectedCourseSummary.vue` | app/components                    | H M @ec4e6fc    | W                                   |   101 |
| `FE/OSK-Manager-FE/app/components/student/lesson-ratings/StudentLessonRatingForm.vue`                   | app/components                    | P               | W                                   |    98 |
| `FE/OSK-Manager-FE/app/components/student/lesson-ratings/StudentLessonRatingsPanel.vue`                 | app/components                    | P               | W                                   |   212 |
| `FE/OSK-Manager-FE/app/components/student/payments/MyPaymentsFilters.vue`                               | app/components                    | H A @d5c4797    | W                                   |    98 |
| `FE/OSK-Manager-FE/app/components/student/payments/StudentPaymentsList.vue`                             | app/components                    | H M @d5c4797    | S (auth)                            |   340 |
| `FE/OSK-Manager-FE/app/components/student/schedule/InstructorScheduleGroupedList.vue`                   | app/components                    | H A @8d09464    | W                                   |   154 |
| `FE/OSK-Manager-FE/app/components/student/schedule/MyLessonsSchedulePanel.vue`                          | app/components                    | H M @8d09464    | W                                   |   156 |
| `FE/OSK-Manager-FE/app/components/student/schedule/StudentCancelLessonDialog.vue`                       | app/components                    | P               | W                                   |    58 |
| `FE/OSK-Manager-FE/app/components/student/schedule/StudentScheduleGroupedList.vue`                      | app/components                    | H M @8d09464    | W                                   |   172 |
| `FE/OSK-Manager-FE/app/components/vehicles/VehicleAvailabilityControl.vue`                              | app/components                    | H M @86ec567    | W                                   |   230 |
| `FE/OSK-Manager-FE/app/components/vehicles/VehicleDeleteDialog.vue`                                     | app/components                    | H M @c1b92fa    | W                                   |    66 |
| `FE/OSK-Manager-FE/app/components/vehicles/VehicleDetailsContent.vue`                                   | app/components                    | H M @ec39dd6    | W                                   |   180 |
| `FE/OSK-Manager-FE/app/components/vehicles/VehicleDocumentsTab.vue`                                     | app/components                    | H A @ec39dd6    | W                                   |    84 |
| `FE/OSK-Manager-FE/app/components/vehicles/VehicleEditPhotoSection.vue`                                 | app/components                    | U; H M @5dbc4ac | S (auth, registry)                  |   196 |
| `FE/OSK-Manager-FE/app/components/vehicles/VehicleForm.vue`                                             | app/components                    | H M @5dbc4ac    | S (registry)                        |   229 |
| `FE/OSK-Manager-FE/app/components/vehicles/VehicleFormFields.vue`                                       | app/components                    | H M @427616e    | W                                   |   201 |
| `FE/OSK-Manager-FE/app/components/vehicles/VehicleManagerStatusGrid.vue`                                | app/components                    | H M @c1b92fa    | W                                   |    60 |
| `FE/OSK-Manager-FE/app/components/vehicles/VehicleOverviewTab.vue`                                      | app/components                    | H A @ec39dd6    | W                                   |    49 |
| `FE/OSK-Manager-FE/app/components/vehicles/VehicleProfileCard.vue`                                      | app/components                    | H A @ec39dd6    | W                                   |   134 |
| `FE/OSK-Manager-FE/app/components/vehicles/VehicleStatusControl.vue`                                    | app/components                    | H M @c1b92fa    | W                                   |    83 |
| `FE/OSK-Manager-FE/app/components/vehicles/VehicleTechnicalDetailsCard.vue`                             | app/components                    | H A @ec39dd6    | W                                   |    63 |
| `FE/OSK-Manager-FE/app/components/vehicles/VehiclesListDesktopTable.vue`                                | app/components                    | H M @ec39dd6    | W                                   |   174 |
| `FE/OSK-Manager-FE/app/components/vehicles/VehiclesListMobileCards.vue`                                 | app/components                    | H M @ec39dd6    | W                                   |   161 |
| `FE/OSK-Manager-FE/app/components/vehicles/VehiclesListModeTabs.vue`                                    | app/components                    | H M @c1b92fa    | W                                   |    91 |
| `FE/OSK-Manager-FE/app/components/vehicles/VehiclesListPanel.vue`                                       | app/components                    | H M @427616e    | W                                   |   212 |
| `FE/OSK-Manager-FE/app/components/vehicles/VehiclesListToolbar.vue`                                     | app/components                    | H A @c1b92fa    | W                                   |   173 |
| `FE/OSK-Manager-FE/app/composables/account/useAccountAvatarUpload.test.ts`                              | app/composables                   | H M @2f7a78d    | W                                   |   194 |
| `FE/OSK-Manager-FE/app/composables/account/useAccountAvatarUpload.ts`                                   | app/composables                   | H M @2f7a78d    | S (auth)                            |   127 |
| `FE/OSK-Manager-FE/app/composables/account/useAccountInlineProfileEdit.test.ts`                         | app/composables                   | H M @2f7a78d    | S (auth)                            |   206 |
| `FE/OSK-Manager-FE/app/composables/account/useAccountInlineProfileEdit.ts`                              | app/composables                   | U; H M @2f7a78d | S (auth)                            |   256 |
| `FE/OSK-Manager-FE/app/composables/account/useAccountPage.ts`                                           | app/composables                   | H M @2f7a78d    | S (auth)                            |   124 |
| `FE/OSK-Manager-FE/app/composables/auth/useAuthReturnTo.test.ts`                                        | app/composables                   | H M @50cbbed    | W                                   |    73 |
| `FE/OSK-Manager-FE/app/composables/auth/useAuthReturnTo.ts`                                             | app/composables                   | P               | W                                   |    37 |
| `FE/OSK-Manager-FE/app/composables/auth/useAuthSession.test.ts`                                         | app/composables                   | H M @50cbbed    | W                                   |   256 |
| `FE/OSK-Manager-FE/app/composables/auth/useAuthSession.ts`                                              | app/composables                   | H M @50cbbed    | S (auth)                            |   260 |
| `FE/OSK-Manager-FE/app/composables/auth/useLoginPage.test.ts`                                           | app/composables                   | H M @50cbbed    | W                                   |   243 |
| `FE/OSK-Manager-FE/app/composables/auth/useLoginPage.ts`                                                | app/composables                   | U; H M @50cbbed | S (auth)                            |   268 |
| `FE/OSK-Manager-FE/app/composables/auth/useLogout.ts`                                                   | app/composables                   | P               | W                                   |    19 |
| `FE/OSK-Manager-FE/app/composables/core/useApi.test.ts`                                                 | app/composables                   | P               | W                                   |   245 |
| `FE/OSK-Manager-FE/app/composables/core/useApi.ts`                                                      | app/composables                   | P               | S (koordynator)                     |   184 |
| `FE/OSK-Manager-FE/app/composables/core/useAppToast.ts`                                                 | app/composables                   | P               | S (koordynator)                     |    44 |
| `FE/OSK-Manager-FE/app/composables/core/useBffClient.ts`                                                | app/composables                   | P               | S (koordynator)                     |     7 |
| `FE/OSK-Manager-FE/app/composables/core/useDarkMode.ts`                                                 | app/composables                   | P               | S (koordynator)                     |    73 |
| `FE/OSK-Manager-FE/app/composables/core/useFormValidation.ts`                                           | app/composables                   | P               | S (koordynator)                     |   109 |
| `FE/OSK-Manager-FE/app/composables/core/useKeyboardShortcut.ts`                                         | app/composables                   | P               | W                                   |    37 |
| `FE/OSK-Manager-FE/app/composables/core/usePageMeta.ts`                                                 | app/composables                   | P               | W                                   |    68 |
| `FE/OSK-Manager-FE/app/composables/courses/useCourseCreateForm.test.ts`                                 | app/composables                   | H M @6c30b8e    | S (registry)                        |   174 |
| `FE/OSK-Manager-FE/app/composables/courses/useCourseCreateForm.ts`                                      | app/composables                   | H M @6c30b8e    | S (registry)                        |   279 |
| `FE/OSK-Manager-FE/app/composables/courses/useCourseTypesApi.ts`                                        | app/composables                   | P               | W                                   |    30 |
| `FE/OSK-Manager-FE/app/composables/courses/useCoursesApi.ts`                                            | app/composables                   | P               | S (registry)                        |   123 |
| `FE/OSK-Manager-FE/app/composables/courses/useManagerCourseDetailData.test.ts`                          | app/composables                   | P               | W                                   |   115 |
| `FE/OSK-Manager-FE/app/composables/courses/useManagerCourseDetailData.ts`                               | app/composables                   | P               | S (registry)                        |    64 |
| `FE/OSK-Manager-FE/app/composables/courses/useManagerCourseDetailPage.ts`                               | app/composables                   | H M @0e37a5f    | S (registry)                        |   154 |
| `FE/OSK-Manager-FE/app/composables/courses/useManagerCourseDetailPresentation.test.ts`                  | app/composables                   | H M @0e37a5f    | W                                   |   140 |
| `FE/OSK-Manager-FE/app/composables/courses/useManagerCourseDetailPresentation.ts`                       | app/composables                   | H M @0e37a5f    | W                                   |    94 |
| `FE/OSK-Manager-FE/app/composables/courses/useManagerCourseInstructorAssignment.test.ts`                | app/composables                   | H M @0e37a5f    | W                                   |   299 |
| `FE/OSK-Manager-FE/app/composables/courses/useManagerCourseInstructorAssignment.ts`                     | app/composables                   | H M @0e37a5f    | S (registry)                        |   219 |
| `FE/OSK-Manager-FE/app/composables/courses/useManagerCourseParticipants.test.ts`                        | app/composables                   | H A @0e37a5f    | S (registry)                        |   259 |
| `FE/OSK-Manager-FE/app/composables/courses/useManagerCourseParticipants.ts`                             | app/composables                   | H A @0e37a5f    | S (registry)                        |   140 |
| `FE/OSK-Manager-FE/app/composables/courses/useManagerCoursesFilters.test.ts`                            | app/composables                   | H A @4e087b0    | W                                   |    88 |
| `FE/OSK-Manager-FE/app/composables/courses/useManagerCoursesFilters.ts`                                 | app/composables                   | H A @4e087b0    | S (registry)                        |   191 |
| `FE/OSK-Manager-FE/app/composables/courses/useManagerCoursesPage.test.ts`                               | app/composables                   | H A @4e087b0    | W                                   |    62 |
| `FE/OSK-Manager-FE/app/composables/courses/useManagerCoursesPage.ts`                                    | app/composables                   | H A @4e087b0    | S (registry)                        |   153 |
| `FE/OSK-Manager-FE/app/composables/courses/useMyCoursesPage.test.ts`                                    | app/composables                   | H A @9ef9b68    | S (registry)                        |   139 |
| `FE/OSK-Manager-FE/app/composables/courses/useMyCoursesPage.ts`                                         | app/composables                   | U; H A @9ef9b68 | S (registry)                        |   130 |
| `FE/OSK-Manager-FE/app/composables/dashboard/useManagerDashboardPage.ts`                                | app/composables                   | H A @d7b1867    | S (auth)                            |    91 |
| `FE/OSK-Manager-FE/app/composables/dashboard/useRoleDashboardPage.ts`                                   | app/composables                   | U; H A @9ef9b68 | S (auth, schedule)                  |   176 |
| `FE/OSK-Manager-FE/app/composables/events/managerEventEditErrors.ts`                                    | app/composables                   | P               | W                                   |    27 |
| `FE/OSK-Manager-FE/app/composables/events/useEventApi.ts`                                               | app/composables                   | H M @eee74e4    | W                                   |   236 |
| `FE/OSK-Manager-FE/app/composables/events/useEventStudentPickerCapacityState.test.ts`                   | app/composables                   | P               | W                                   |    29 |
| `FE/OSK-Manager-FE/app/composables/events/useEventStudentPickerCapacityState.ts`                        | app/composables                   | P               | W                                   |    32 |
| `FE/OSK-Manager-FE/app/composables/events/useEventsDayDateSelection.test.ts`                            | app/composables                   | P               | W                                   |    36 |
| `FE/OSK-Manager-FE/app/composables/events/useEventsDayDateSelection.ts`                                 | app/composables                   | H M @6360ec3    | W                                   |   109 |
| `FE/OSK-Manager-FE/app/composables/events/useEventsDayPage.test.ts`                                     | app/composables                   | H M @6360ec3    | W                                   |   220 |
| `FE/OSK-Manager-FE/app/composables/events/useEventsDayPage.ts`                                          | app/composables                   | H M @6360ec3    | S (schedule)                        |   335 |
| `FE/OSK-Manager-FE/app/composables/events/useInstructorEventsApi.test.ts`                               | app/composables                   | P               | W                                   |    90 |
| `FE/OSK-Manager-FE/app/composables/events/useInstructorEventsApi.ts`                                    | app/composables                   | P               | W                                   |   263 |
| `FE/OSK-Manager-FE/app/composables/events/useManagerEventEditActionLabels.test.ts`                      | app/composables                   | H M @b803f5b    | W                                   |   104 |
| `FE/OSK-Manager-FE/app/composables/events/useManagerEventEditActionLabels.ts`                           | app/composables                   | H M @b803f5b    | W                                   |    76 |
| `FE/OSK-Manager-FE/app/composables/events/useManagerEventEditActions.test.ts`                           | app/composables                   | H M @6360ec3    | W                                   |   205 |
| `FE/OSK-Manager-FE/app/composables/events/useManagerEventEditActions.ts`                                | app/composables                   | H M @b803f5b    | S (schedule)                        |   217 |
| `FE/OSK-Manager-FE/app/composables/events/useManagerEventEditData.ts`                                   | app/composables                   | H M @eee74e4    | S (schedule)                        |   302 |
| `FE/OSK-Manager-FE/app/composables/events/useManagerEventEditDeleteAction.test.ts`                      | app/composables                   | P               | W                                   |   124 |
| `FE/OSK-Manager-FE/app/composables/events/useManagerEventEditDeleteAction.ts`                           | app/composables                   | P               | W                                   |    79 |
| `FE/OSK-Manager-FE/app/composables/events/useManagerEventEditFieldSave.test.ts`                         | app/composables                   | H M @eee74e4    | W                                   |   217 |
| `FE/OSK-Manager-FE/app/composables/events/useManagerEventEditFieldSave.ts`                              | app/composables                   | H M @b803f5b    | S (schedule)                        |   137 |
| `FE/OSK-Manager-FE/app/composables/events/useManagerEventEditForm.test.ts`                              | app/composables                   | H M @eee74e4    | S (schedule)                        |    50 |
| `FE/OSK-Manager-FE/app/composables/events/useManagerEventEditForm.ts`                                   | app/composables                   | U; H M @b803f5b | S (schedule)                        |   357 |
| `FE/OSK-Manager-FE/app/composables/events/useManagerEventEditPage.ts`                                   | app/composables                   | H M @b803f5b    | S (schedule)                        |    43 |
| `FE/OSK-Manager-FE/app/composables/events/useManagerEventEditParticipantsSave.test.ts`                  | app/composables                   | H M @eee74e4    | W                                   |   174 |
| `FE/OSK-Manager-FE/app/composables/events/useManagerEventEditParticipantsSave.ts`                       | app/composables                   | H M @eee74e4    | S (schedule)                        |    97 |
| `FE/OSK-Manager-FE/app/composables/events/useManagerEventEditTimePicker.test.ts`                        | app/composables                   | P               | S (schedule)                        |    64 |
| `FE/OSK-Manager-FE/app/composables/events/useManagerEventEditTimePicker.ts`                             | app/composables                   | U; H M @b803f5b | S (schedule)                        |   214 |
| `FE/OSK-Manager-FE/app/composables/events/useManagerEventEditTimeSplit.test.ts`                         | app/composables                   | H M @b803f5b    | S (schedule)                        |   101 |
| `FE/OSK-Manager-FE/app/composables/events/useManagerEventEditTimeSplit.ts`                              | app/composables                   | U; H M @b803f5b | S (schedule)                        |   256 |
| `FE/OSK-Manager-FE/app/composables/events/useManagerEventParticipants.ts`                               | app/composables                   | H M @b803f5b    | W                                   |   352 |
| `FE/OSK-Manager-FE/app/composables/events/useManagerEventSlots.test.ts`                                 | app/composables                   | P               | W                                   |    93 |
| `FE/OSK-Manager-FE/app/composables/events/useManagerEventSlots.ts`                                      | app/composables                   | P               | S (schedule)                        |    88 |
| `FE/OSK-Manager-FE/app/composables/events/useManagerTheoryEventCreateDialog.test.ts`                    | app/composables                   | H M @eee74e4    | W                                   |   356 |
| `FE/OSK-Manager-FE/app/composables/events/useManagerTheoryEventCreateDialog.ts`                         | app/composables                   | H M @eee74e4    | W                                   |   341 |
| `FE/OSK-Manager-FE/app/composables/instructors/manager/useManagerInstructorAvailabilityPage.ts`         | app/composables                   | H A @d898c04    | S (schedule)                        |   273 |
| `FE/OSK-Manager-FE/app/composables/instructors/manager/useManagerInstructorCreatePage.test.ts`          | app/composables                   | H A @3608030    | S (registry)                        |   218 |
| `FE/OSK-Manager-FE/app/composables/instructors/manager/useManagerInstructorCreatePage.ts`               | app/composables                   | U; H A @3608030 | S (registry)                        |   260 |
| `FE/OSK-Manager-FE/app/composables/instructors/manager/useManagerInstructorDetailsContent.ts`           | app/composables                   | H M @6dea058    | W                                   |   135 |
| `FE/OSK-Manager-FE/app/composables/instructors/manager/useManagerInstructorForm.test.ts`                | app/composables                   | H A @3608030    | W                                   |   208 |
| `FE/OSK-Manager-FE/app/composables/instructors/manager/useManagerInstructorForm.ts`                     | app/composables                   | H A @3608030    | S (registry)                        |   300 |
| `FE/OSK-Manager-FE/app/composables/instructors/manager/useManagerInstructorScheduleData.test.ts`        | app/composables                   | P               | W                                   |   132 |
| `FE/OSK-Manager-FE/app/composables/instructors/manager/useManagerInstructorScheduleData.ts`             | app/composables                   | P               | S (schedule)                        |    74 |
| `FE/OSK-Manager-FE/app/composables/instructors/manager/useManagerInstructorScheduleDelete.test.ts`      | app/composables                   | P               | W                                   |   143 |
| `FE/OSK-Manager-FE/app/composables/instructors/manager/useManagerInstructorScheduleDelete.ts`           | app/composables                   | P               | W                                   |    84 |
| `FE/OSK-Manager-FE/app/composables/instructors/manager/useManagerInstructorScheduleEventForm.test.ts`   | app/composables                   | H M @eee74e4    | W                                   |   461 |
| `FE/OSK-Manager-FE/app/composables/instructors/manager/useManagerInstructorScheduleEventForm.ts`        | app/composables                   | H M @eee74e4    | W                                   |   355 |
| `FE/OSK-Manager-FE/app/composables/instructors/manager/useManagerInstructorSchedulePage.ts`             | app/composables                   | H M @eee74e4    | S (schedule)                        |   173 |
| `FE/OSK-Manager-FE/app/composables/instructors/manager/useManagerInstructorScheduleReadModel.test.ts`   | app/composables                   | P               | W                                   |   146 |
| `FE/OSK-Manager-FE/app/composables/instructors/manager/useManagerInstructorScheduleReadModel.ts`        | app/composables                   | P               | W                                   |    87 |
| `FE/OSK-Manager-FE/app/composables/instructors/manager/useManagerInstructorScheduleResources.test.ts`   | app/composables                   | H M @eee74e4    | W                                   |   248 |
| `FE/OSK-Manager-FE/app/composables/instructors/manager/useManagerInstructorScheduleResources.ts`        | app/composables                   | H M @eee74e4    | W                                   |   140 |
| `FE/OSK-Manager-FE/app/composables/instructors/manager/useManagerInstructorSchoolContext.ts`            | app/composables                   | H A @cdea385    | W                                   |    82 |
| `FE/OSK-Manager-FE/app/composables/instructors/manager/useManagerInstructorSchoolSelection.ts`          | app/composables                   | H A @3608030    | W                                   |     8 |
| `FE/OSK-Manager-FE/app/composables/instructors/manager/useManagerInstructorWeeklyCalendar.ts`           | app/composables                   | H M @d898c04    | W                                   |   221 |
| `FE/OSK-Manager-FE/app/composables/instructors/manager/useManagerInstructorsAdvancedFilters.ts`         | app/composables                   | H A @2b80645    | W                                   |   127 |
| `FE/OSK-Manager-FE/app/composables/instructors/manager/useManagerInstructorsPage.test.ts`               | app/composables                   | H M @3608030    | W                                   |   232 |
| `FE/OSK-Manager-FE/app/composables/instructors/manager/useManagerInstructorsPage.ts`                    | app/composables                   | H M @3608030    | S (registry)                        |   238 |
| `FE/OSK-Manager-FE/app/composables/instructors/manager/useManagerSchoolAvailabilityWeekPicker.ts`       | app/composables                   | P               | W                                   |    81 |
| `FE/OSK-Manager-FE/app/composables/instructors/manager/useManagerSchoolWeeklyAvailabilityCalendar.ts`   | app/composables                   | H M @d7b1867    | S (schedule)                        |   315 |
| `FE/OSK-Manager-FE/app/composables/instructors/useInstructorAvailabilityApi.ts`                         | app/composables                   | P               | W                                   |   111 |
| `FE/OSK-Manager-FE/app/composables/instructors/useInstructorSlotsApi.ts`                                | app/composables                   | P               | W                                   |    64 |
| `FE/OSK-Manager-FE/app/composables/instructors/useInstructorsApi.ts`                                    | app/composables                   | P               | S (registry)                        |    40 |
| `FE/OSK-Manager-FE/app/composables/instructors/useManagerInstructorDetailsCourseTypes.test.ts`          | app/composables                   | P               | W                                   |    65 |
| `FE/OSK-Manager-FE/app/composables/instructors/useManagerInstructorDetailsCourseTypes.ts`               | app/composables                   | P               | S (registry)                        |    34 |
| `FE/OSK-Manager-FE/app/composables/instructors/useManagerInstructorDetailsData.test.ts`                 | app/composables                   | H M @2b80645    | W                                   |   112 |
| `FE/OSK-Manager-FE/app/composables/instructors/useManagerInstructorDetailsData.ts`                      | app/composables                   | P               | S (auth, registry)                  |   104 |
| `FE/OSK-Manager-FE/app/composables/instructors/useManagerInstructorDetailsDelete.test.ts`               | app/composables                   | P               | W                                   |   113 |
| `FE/OSK-Manager-FE/app/composables/instructors/useManagerInstructorDetailsDelete.ts`                    | app/composables                   | P               | W                                   |    94 |
| `FE/OSK-Manager-FE/app/composables/instructors/useManagerInstructorDetailsEdit.test.ts`                 | app/composables                   | H M @d898c04    | S (auth, registry)                  |   222 |
| `FE/OSK-Manager-FE/app/composables/instructors/useManagerInstructorDetailsEdit.ts`                      | app/composables                   | Z; H M @d898c04 | S (auth, registry)                  |   152 |
| `FE/OSK-Manager-FE/app/composables/instructors/useManagerInstructorDetailsPage.test.ts`                 | app/composables                   | P               | W                                   |    54 |
| `FE/OSK-Manager-FE/app/composables/instructors/useManagerInstructorDetailsPage.ts`                      | app/composables                   | H M @d898c04    | W                                   |   107 |
| `FE/OSK-Manager-FE/app/composables/instructors/useManagerInstructorDetailsRatingSummary.test.ts`        | app/composables                   | H M @2b80645    | S (auth)                            |    92 |
| `FE/OSK-Manager-FE/app/composables/instructors/useManagerInstructorDetailsRatingSummary.ts`             | app/composables                   | H M @2b80645    | S (auth)                            |    52 |
| `FE/OSK-Manager-FE/app/composables/lessons/useLessonBookingApi.test.ts`                                 | app/composables                   | H M @eee74e4    | W                                   |    78 |
| `FE/OSK-Manager-FE/app/composables/lessons/useLessonBookingApi.ts`                                      | app/composables                   | H M @eee74e4    | S (registry)                        |   173 |
| `FE/OSK-Manager-FE/app/composables/lessons/useLessonRatingsApi.ts`                                      | app/composables                   | P               | S (auth)                            |    66 |
| `FE/OSK-Manager-FE/app/composables/lessons/useLessonRatingsListApi.test.ts`                             | app/composables                   | H A @c3dfb3a    | S (auth)                            |    59 |
| `FE/OSK-Manager-FE/app/composables/lessons/useLessonRatingsListApi.ts`                                  | app/composables                   | U; H M @c3dfb3a | S (auth, schedule)                  |   112 |
| `FE/OSK-Manager-FE/app/composables/lessons/useManagerLessonBookingDialog.test.ts`                       | app/composables                   | H M @eee74e4    | W                                   |   260 |
| `FE/OSK-Manager-FE/app/composables/lessons/useManagerLessonBookingDialog.ts`                            | app/composables                   | H M @eee74e4    | S (schedule)                        |   329 |
| `FE/OSK-Manager-FE/app/composables/lessons/useManagerLessonEditForm.availability.test.ts`               | app/composables                   | H A @bf4ea41    | W                                   |   230 |
| `FE/OSK-Manager-FE/app/composables/lessons/useManagerLessonEditForm.test.ts`                            | app/composables                   | H M @eee74e4    | S (schedule)                        |    89 |
| `FE/OSK-Manager-FE/app/composables/lessons/useManagerLessonEditForm.ts`                                 | app/composables                   | U; H M @bf4ea41 | S (koordynator, schedule)           |   475 |
| `FE/OSK-Manager-FE/app/composables/lessons/useManagerLessonEditPage.ts`                                 | app/composables                   | H M @6360ec3    | S (schedule)                        |   432 |
| `FE/OSK-Manager-FE/app/composables/lessons/useManagerLessonEditReferences.ts`                           | app/composables                   | H M @bf4ea41    | S (schedule)                        |   367 |
| `FE/OSK-Manager-FE/app/composables/lessons/useManagerLessonsApi.ts`                                     | app/composables                   | P               | S (schedule)                        |    84 |
| `FE/OSK-Manager-FE/app/composables/lessons/useManagerReviewsPage.test.ts`                               | app/composables                   | H A @c3dfb3a    | W                                   |   181 |
| `FE/OSK-Manager-FE/app/composables/lessons/useManagerReviewsPage.ts`                                    | app/composables                   | U; H A @c3dfb3a | S (auth)                            |   276 |
| `FE/OSK-Manager-FE/app/composables/lessons/useMyLessonsCancellation.test.ts`                            | app/composables                   | H M @8d09464    | W                                   |   146 |
| `FE/OSK-Manager-FE/app/composables/lessons/useMyLessonsCancellation.ts`                                 | app/composables                   | H M @8d09464    | W                                   |   121 |
| `FE/OSK-Manager-FE/app/composables/lessons/useMyLessonsEventStatus.test.ts`                             | app/composables                   | H A @8d09464    | W                                   |    78 |
| `FE/OSK-Manager-FE/app/composables/lessons/useMyLessonsEventStatus.ts`                                  | app/composables                   | H A @8d09464    | W                                   |    67 |
| `FE/OSK-Manager-FE/app/composables/lessons/useMyLessonsPage.ts`                                         | app/composables                   | U; H M @8d09464 | S (schedule)                        |   188 |
| `FE/OSK-Manager-FE/app/composables/lessons/useMyLessonsRatings.test.ts`                                 | app/composables                   | P               | S (auth)                            |   157 |
| `FE/OSK-Manager-FE/app/composables/lessons/useMyLessonsRatings.ts`                                      | app/composables                   | P               | S (auth)                            |   123 |
| `FE/OSK-Manager-FE/app/composables/lessons/useMyReviewsPage.test.ts`                                    | app/composables                   | H A @5499235    | W                                   |   128 |
| `FE/OSK-Manager-FE/app/composables/lessons/useMyReviewsPage.ts`                                         | app/composables                   | U; H A @5499235 | S (auth)                            |   108 |
| `FE/OSK-Manager-FE/app/composables/lessons/useStudentLessonBookingApi.ts`                               | app/composables                   | P               | W                                   |    42 |
| `FE/OSK-Manager-FE/app/composables/lessons/useStudentLessonBookingPage.test.ts`                         | app/composables                   | H A @ec4e6fc    | S (schedule)                        |   137 |
| `FE/OSK-Manager-FE/app/composables/lessons/useStudentLessonBookingPage.ts`                              | app/composables                   | U; H M @ec4e6fc | S (schedule)                        |   557 |
| `FE/OSK-Manager-FE/app/composables/lessons/useStudentLessonCancellationApi.ts`                          | app/composables                   | P               | W                                   |    44 |
| `FE/OSK-Manager-FE/app/composables/manager/useManagerAttentionItemsApi.ts`                              | app/composables                   | P               | W                                   |    42 |
| `FE/OSK-Manager-FE/app/composables/navigation/navTreeControllerContext.ts`                              | app/composables                   | P               | W                                   |    17 |
| `FE/OSK-Manager-FE/app/composables/navigation/useNavTreeController.ts`                                  | app/composables                   | P               | W                                   |   291 |
| `FE/OSK-Manager-FE/app/composables/payments/useMyPaymentsPage.test.ts`                                  | app/composables                   | H A @72418e9    | W                                   |    99 |
| `FE/OSK-Manager-FE/app/composables/payments/useMyPaymentsPage.ts`                                       | app/composables                   | U; H A @d5c4797 | S (auth)                            |   114 |
| `FE/OSK-Manager-FE/app/composables/payments/usePaymentsApi.test.ts`                                     | app/composables                   | H M @72418e9    | W                                   |   111 |
| `FE/OSK-Manager-FE/app/composables/payments/usePaymentsApi.ts`                                          | app/composables                   | H M @72418e9    | W                                   |   142 |
| `FE/OSK-Manager-FE/app/composables/schedule/useDebouncedAbortableRequest.ts`                            | app/composables                   | U; H A @eee74e4 | S (schedule)                        |   120 |
| `FE/OSK-Manager-FE/app/composables/schedule/useManagerSchoolScheduleCalendar.test.ts`                   | app/composables                   | H M @6dea058    | S (koordynator)                     |   185 |
| `FE/OSK-Manager-FE/app/composables/schedule/useManagerSchoolScheduleCalendar.ts`                        | app/composables                   | H M @b803f5b    | W                                   |   254 |
| `FE/OSK-Manager-FE/app/composables/schedule/useManagerSchoolScheduleCalendarData.test.ts`               | app/composables                   | H M @64b5640    | W                                   |   145 |
| `FE/OSK-Manager-FE/app/composables/schedule/useManagerSchoolScheduleCalendarData.ts`                    | app/composables                   | H M @64b5640    | W                                   |   103 |
| `FE/OSK-Manager-FE/app/composables/schedule/useManagerSchoolScheduleWeekPicker.ts`                      | app/composables                   | P               | W                                   |   114 |
| `FE/OSK-Manager-FE/app/composables/schedule/useScheduleApi.test.ts`                                     | app/composables                   | P               | W                                   |   119 |
| `FE/OSK-Manager-FE/app/composables/schedule/useScheduleApi.ts`                                          | app/composables                   | P               | W                                   |   122 |
| `FE/OSK-Manager-FE/app/composables/schedule/useScheduleAvailabilityCheck.test.ts`                       | app/composables                   | H A @eee74e4    | S (schedule)                        |   234 |
| `FE/OSK-Manager-FE/app/composables/schedule/useScheduleAvailabilityCheck.ts`                            | app/composables                   | H A @eee74e4    | S (schedule)                        |    88 |
| `FE/OSK-Manager-FE/app/composables/schedule/useScheduleAvailabilityOptions.test.ts`                     | app/composables                   | H A @eee74e4    | S (koordynator)                     |   138 |
| `FE/OSK-Manager-FE/app/composables/schedule/useScheduleAvailabilityOptions.ts`                          | app/composables                   | U; H A @eee74e4 | S (schedule)                        |    51 |
| `FE/OSK-Manager-FE/app/composables/schools/useDrivingSchoolsApi.ts`                                     | app/composables                   | P               | S (registry)                        |   166 |
| `FE/OSK-Manager-FE/app/composables/schools/useManagerOskFormDialogState.test.ts`                        | app/composables                   | H A @5c9e704    | W                                   |    90 |
| `FE/OSK-Manager-FE/app/composables/schools/useManagerOskFormDialogState.ts`                             | app/composables                   | H M @5c9e704    | S (registry)                        |   158 |
| `FE/OSK-Manager-FE/app/composables/schools/useManagerOskPage.test.ts`                                   | app/composables                   | H A @5c9e704    | W                                   |   163 |
| `FE/OSK-Manager-FE/app/composables/schools/useManagerOskPage.ts`                                        | app/composables                   | H M @5c9e704    | S (registry)                        |   393 |
| `FE/OSK-Manager-FE/app/composables/schools/useSchoolAvailabilitySlotsApi.ts`                            | app/composables                   | P               | W                                   |   142 |
| `FE/OSK-Manager-FE/app/composables/schools/useSchoolScheduleApi.ts`                                     | app/composables                   | P               | W                                   |    52 |
| `FE/OSK-Manager-FE/app/composables/student/lesson-booking/useStudentLessonBookingSlotList.test.ts`      | app/composables                   | H M @b6cf2ae    | W                                   |   151 |
| `FE/OSK-Manager-FE/app/composables/student/lesson-booking/useStudentLessonBookingSlotList.ts`           | app/composables                   | H M @b6cf2ae    | W                                   |   266 |
| `FE/OSK-Manager-FE/app/composables/students/useManagerStudentCourseAssignment.test.ts`                  | app/composables                   | H M @44a4144    | W                                   |   215 |
| `FE/OSK-Manager-FE/app/composables/students/useManagerStudentCourseAssignment.ts`                       | app/composables                   | P               | S (registry)                        |   111 |
| `FE/OSK-Manager-FE/app/composables/students/useManagerStudentCreate.test.ts`                            | app/composables                   | P               | W                                   |    47 |
| `FE/OSK-Manager-FE/app/composables/students/useManagerStudentCreate.ts`                                 | app/composables                   | P               | W                                   |    71 |
| `FE/OSK-Manager-FE/app/composables/students/useManagerStudentDetailsPage.test.ts`                       | app/composables                   | H M @2b80645    | W                                   |    95 |
| `FE/OSK-Manager-FE/app/composables/students/useManagerStudentDetailsPage.ts`                            | app/composables                   | H M @2b80645    | S (registry)                        |   258 |
| `FE/OSK-Manager-FE/app/composables/students/useManagerStudentDetailsTabs.test.ts`                       | app/composables                   | H A @2b80645    | W                                   |    56 |
| `FE/OSK-Manager-FE/app/composables/students/useManagerStudentDetailsTabs.ts`                            | app/composables                   | H A @2b80645    | W                                   |    40 |
| `FE/OSK-Manager-FE/app/composables/students/useManagerStudentPayments.test.ts`                          | app/composables                   | P               | S (auth)                            |    86 |
| `FE/OSK-Manager-FE/app/composables/students/useManagerStudentPayments.ts`                               | app/composables                   | Z; P            | S (auth, schedule)                  |   185 |
| `FE/OSK-Manager-FE/app/composables/students/useManagerStudentProcessStatus.test.ts`                     | app/composables                   | P               | W                                   |    57 |
| `FE/OSK-Manager-FE/app/composables/students/useManagerStudentProcessStatus.ts`                          | app/composables                   | P               | W                                   |    85 |
| `FE/OSK-Manager-FE/app/composables/students/useManagerStudentRegistration.test.ts`                      | app/composables                   | P               | W                                   |   230 |
| `FE/OSK-Manager-FE/app/composables/students/useManagerStudentRegistration.ts`                           | app/composables                   | P               | S (registry)                        |   107 |
| `FE/OSK-Manager-FE/app/composables/students/useManagerStudentSchedule.test.ts`                          | app/composables                   | H M @2b80645    | W                                   |    76 |
| `FE/OSK-Manager-FE/app/composables/students/useManagerStudentSchedule.ts`                               | app/composables                   | P               | W                                   |   105 |
| `FE/OSK-Manager-FE/app/composables/students/useManagerStudentsAdvancedFilters.ts`                       | app/composables                   | H A @01d4eb6    | S (registry)                        |   135 |
| `FE/OSK-Manager-FE/app/composables/students/useManagerStudentsData.test.ts`                             | app/composables                   | H M @01d4eb6    | W                                   |   360 |
| `FE/OSK-Manager-FE/app/composables/students/useManagerStudentsData.ts`                                  | app/composables                   | H M @01d4eb6    | S (registry)                        |   224 |
| `FE/OSK-Manager-FE/app/composables/students/useManagerStudentsListActions.test.ts`                      | app/composables                   | P               | W                                   |   125 |
| `FE/OSK-Manager-FE/app/composables/students/useManagerStudentsListActions.ts`                           | app/composables                   | P               | S (registry)                        |    62 |
| `FE/OSK-Manager-FE/app/composables/students/useManagerStudentsPage.ts`                                  | app/composables                   | H M @01d4eb6    | S (registry)                        |   188 |
| `FE/OSK-Manager-FE/app/composables/students/useManagerStudentsPageInit.test.ts`                         | app/composables                   | P               | W                                   |   139 |
| `FE/OSK-Manager-FE/app/composables/students/useManagerStudentsPageInit.ts`                              | app/composables                   | P               | W                                   |    65 |
| `FE/OSK-Manager-FE/app/composables/students/useStudentEventsApi.ts`                                     | app/composables                   | P               | W                                   |    45 |
| `FE/OSK-Manager-FE/app/composables/students/useStudentsApi.test.ts`                                     | app/composables                   | P               | W                                   |    63 |
| `FE/OSK-Manager-FE/app/composables/students/useStudentsApi.ts`                                          | app/composables                   | P               | S (registry)                        |   126 |
| `FE/OSK-Manager-FE/app/composables/vehicles/useVehicleCreatePage.test.ts`                               | app/composables                   | H A @427616e    | W                                   |   175 |
| `FE/OSK-Manager-FE/app/composables/vehicles/useVehicleCreatePage.ts`                                    | app/composables                   | U; H A @427616e | S (registry)                        |   128 |
| `FE/OSK-Manager-FE/app/composables/vehicles/useVehicleDetailsPresentation.test.ts`                      | app/composables                   | H M @ec39dd6    | W                                   |   104 |
| `FE/OSK-Manager-FE/app/composables/vehicles/useVehicleDetailsPresentation.ts`                           | app/composables                   | H M @ec39dd6    | W                                   |   193 |
| `FE/OSK-Manager-FE/app/composables/vehicles/useVehicleEditPage.test.ts`                                 | app/composables                   | H M @5dbc4ac    | S (auth, registry)                  |   181 |
| `FE/OSK-Manager-FE/app/composables/vehicles/useVehicleEditPage.ts`                                      | app/composables                   | U; H M @427616e | S (auth, registry)                  |   321 |
| `FE/OSK-Manager-FE/app/composables/vehicles/useVehiclesApi.test.ts`                                     | app/composables                   | P               | W                                   |    64 |
| `FE/OSK-Manager-FE/app/composables/vehicles/useVehiclesApi.ts`                                          | app/composables                   | P               | S (registry)                        |   207 |
| `FE/OSK-Manager-FE/app/composables/vehicles/useVehiclesListPage.ts`                                     | app/composables                   | U; H M @c1b92fa | S (registry)                        |   429 |
| `FE/OSK-Manager-FE/app/data/design-system/colors.ts`                                                    | app/data                          | H A @d5c4797    | W                                   |   107 |
| `FE/OSK-Manager-FE/app/data/design-system/fixtures.test.ts`                                             | app/data                          | H A @d5c4797    | W                                   |    60 |
| `FE/OSK-Manager-FE/app/data/design-system/fixtures.ts`                                                  | app/data                          | H M @d5c4797    | W                                   |   291 |
| `FE/OSK-Manager-FE/app/data/design-system/scenarios.ts`                                                 | app/data                          | H A @d5c4797    | W                                   |    10 |
| `FE/OSK-Manager-FE/app/data/design-system/scheduleDemo.test.ts`                                         | app/data                          | H A @dad0dc1    | W                                   |    41 |
| `FE/OSK-Manager-FE/app/data/design-system/scheduleDemo.ts`                                              | app/data                          | H A @dad0dc1    | W                                   |   134 |
| `FE/OSK-Manager-FE/app/data/design-system/sections.test.ts`                                             | app/data                          | P               | W                                   |    20 |
| `FE/OSK-Manager-FE/app/data/design-system/sections.ts`                                                  | app/data                          | P               | S (koordynator)                     |    64 |
| `FE/OSK-Manager-FE/app/error.vue`                                                                       | app/error.vue                     | P               | S (koordynator)                     |    83 |
| `FE/OSK-Manager-FE/app/layouts/app-shell.vue`                                                           | app/layouts                       | H M @ec4e6fc    | W                                   |    99 |
| `FE/OSK-Manager-FE/app/layouts/default.vue`                                                             | app/layouts                       | P               | S (koordynator)                     |    10 |
| `FE/OSK-Manager-FE/app/layouts/design-system.vue`                                                       | app/layouts                       | H M @d5c4797    | S (koordynator)                     |    71 |
| `FE/OSK-Manager-FE/app/lib/utils.ts`                                                                    | app/lib                           | P               | W                                   |     7 |
| `FE/OSK-Manager-FE/app/middleware/auth.global.test.ts`                                                  | app/middleware                    | H A @9591485    | W                                   |    65 |
| `FE/OSK-Manager-FE/app/middleware/auth.global.ts`                                                       | app/middleware                    | H M @9591485    | S (auth)                            |    25 |
| `FE/OSK-Manager-FE/app/middleware/instructor.ts`                                                        | app/middleware                    | P               | W                                   |     7 |
| `FE/OSK-Manager-FE/app/middleware/manager-or-instructor.ts`                                             | app/middleware                    | P               | W                                   |     7 |
| `FE/OSK-Manager-FE/app/middleware/manager.ts`                                                           | app/middleware                    | P               | W                                   |     7 |
| `FE/OSK-Manager-FE/app/middleware/student-or-instructor.ts`                                             | app/middleware                    | P               | W                                   |     9 |
| `FE/OSK-Manager-FE/app/middleware/student.ts`                                                           | app/middleware                    | P               | W                                   |     9 |
| `FE/OSK-Manager-FE/app/pages/account/index.vue`                                                         | app/pages                         | U; H M @2f7a78d | S (auth)                            |    88 |
| `FE/OSK-Manager-FE/app/pages/book-lesson.vue`                                                           | app/pages                         | H M @ec4e6fc    | W                                   |   115 |
| `FE/OSK-Manager-FE/app/pages/design-system.vue`                                                         | app/pages                         | H M @d5c4797    | W                                   |   242 |
| `FE/OSK-Manager-FE/app/pages/events/index.vue`                                                          | app/pages                         | H M @6360ec3    | W                                   |    92 |
| `FE/OSK-Manager-FE/app/pages/index.vue`                                                                 | app/pages                         | H M @d7b1867    | W                                   |    91 |
| `FE/OSK-Manager-FE/app/pages/login.vue`                                                                 | app/pages                         | U; H M @0c843dd | S (auth)                            |    23 |
| `FE/OSK-Manager-FE/app/pages/manager/courses/[id].vue`                                                  | app/pages                         | P               | W                                   |    10 |
| `FE/OSK-Manager-FE/app/pages/manager/courses/index.vue`                                                 | app/pages                         | H M @4e087b0    | W                                   |    35 |
| `FE/OSK-Manager-FE/app/pages/manager/courses/new.vue`                                                   | app/pages                         | U; H M @6c30b8e | S (registry)                        |   293 |
| `FE/OSK-Manager-FE/app/pages/manager/events/[id]/edit.vue`                                              | app/pages                         | P               | W                                   |    10 |
| `FE/OSK-Manager-FE/app/pages/manager/instructors/[id]/availability.vue`                                 | app/pages                         | H M @d898c04    | W                                   |    70 |
| `FE/OSK-Manager-FE/app/pages/manager/instructors/[id]/index.vue`                                        | app/pages                         | P               | W                                   |    86 |
| `FE/OSK-Manager-FE/app/pages/manager/instructors/[id]/schedule.vue`                                     | app/pages                         | H M @eee74e4    | W                                   |   224 |
| `FE/OSK-Manager-FE/app/pages/manager/instructors/[id]/slots.vue`                                        | app/pages                         | H M @cdea385    | W                                   |   173 |
| `FE/OSK-Manager-FE/app/pages/manager/instructors/index.vue`                                             | app/pages                         | H M @3608030    | W                                   |   109 |
| `FE/OSK-Manager-FE/app/pages/manager/instructors/new.vue`                                               | app/pages                         | U; H M @3608030 | S (registry)                        |   174 |
| `FE/OSK-Manager-FE/app/pages/manager/lessons/[id]/edit.vue`                                             | app/pages                         | H M @bf4ea41    | W                                   |    24 |
| `FE/OSK-Manager-FE/app/pages/manager/osk/index.vue`                                                     | app/pages                         | H M @5c9e704    | W                                   |   112 |
| `FE/OSK-Manager-FE/app/pages/manager/osk/new.vue`                                                       | app/pages                         | H M @5c9e704    | W                                   |    87 |
| `FE/OSK-Manager-FE/app/pages/manager/reviews/index.vue`                                                 | app/pages                         | U; H M @c3dfb3a | S (auth)                            |   122 |
| `FE/OSK-Manager-FE/app/pages/manager/schedule/index.vue`                                                | app/pages                         | H M @dad0dc1    | W                                   |   177 |
| `FE/OSK-Manager-FE/app/pages/manager/students/[userId].vue`                                             | app/pages                         | H M @2b80645    | W                                   |    87 |
| `FE/OSK-Manager-FE/app/pages/manager/students/index.vue`                                                | app/pages                         | H M @01d4eb6    | W                                   |   242 |
| `FE/OSK-Manager-FE/app/pages/my-courses.vue`                                                            | app/pages                         | U; H M @9ef9b68 | S (registry)                        |    59 |
| `FE/OSK-Manager-FE/app/pages/my-lessons.vue`                                                            | app/pages                         | H M @8d09464    | W                                   |    79 |
| `FE/OSK-Manager-FE/app/pages/my-payments.vue`                                                           | app/pages                         | U; H M @72418e9 | S (auth)                            |    40 |
| `FE/OSK-Manager-FE/app/pages/my-reviews.vue`                                                            | app/pages                         | U; H M @5499235 | S (auth)                            |    44 |
| `FE/OSK-Manager-FE/app/pages/vehicles/[id]/edit.vue`                                                    | app/pages                         | H M @5dbc4ac    | S (registry)                        |   195 |
| `FE/OSK-Manager-FE/app/pages/vehicles/[id]/index.vue`                                                   | app/pages                         | H M @ec39dd6    | W                                   |   129 |
| `FE/OSK-Manager-FE/app/pages/vehicles/index.vue`                                                        | app/pages                         | H M @c1b92fa    | W                                   |    95 |
| `FE/OSK-Manager-FE/app/pages/vehicles/new.vue`                                                          | app/pages                         | H M @427616e    | W                                   |   163 |
| `FE/OSK-Manager-FE/app/plugins/app-ready.client.ts`                                                     | app/plugins                       | H A @5e7362b    | S (koordynator)                     |     7 |
| `FE/OSK-Manager-FE/app/plugins/bff-client.ts`                                                           | app/plugins                       | H M @5e7362b    | S (koordynator)                     |   109 |
| `FE/OSK-Manager-FE/app/types/courses/course.test.ts`                                                    | app/types                         | H M @44a4144    | W                                   |   138 |
| `FE/OSK-Manager-FE/app/types/courses/course.ts`                                                         | app/types                         | P               | W                                   |    20 |
| `FE/OSK-Manager-FE/app/types/courses/courseFormatting.ts`                                               | app/types                         | P               | W                                   |    25 |
| `FE/OSK-Manager-FE/app/types/courses/courseListNormalizers.ts`                                          | app/types                         | P               | W                                   |   138 |
| `FE/OSK-Manager-FE/app/types/courses/courseModels.ts`                                                   | app/types                         | H M @44a4144    | W                                   |    57 |
| `FE/OSK-Manager-FE/app/types/courses/courseNormalizeShared.ts`                                          | app/types                         | H M @44a4144    | W                                   |   124 |
| `FE/OSK-Manager-FE/app/types/courses/courseType.ts`                                                     | app/types                         | P               | S (registry)                        |    79 |
| `FE/OSK-Manager-FE/app/types/courses/managerCourseDetail.ts`                                            | app/types                         | H M @0e37a5f    | W                                   |    21 |
| `FE/OSK-Manager-FE/app/types/courses/myCourseNormalizers.ts`                                            | app/types                         | P               | W                                   |    82 |
| `FE/OSK-Manager-FE/app/types/demo/demoMenubar.ts`                                                       | app/types                         | P               | W                                   |     5 |
| `FE/OSK-Manager-FE/app/types/events/event.ts`                                                           | app/types                         | H M @eee74e4    | W                                   |    41 |
| `FE/OSK-Manager-FE/app/types/events/instructorEvent.ts`                                                 | app/types                         | H M @44a4144    | W                                   |   121 |
| `FE/OSK-Manager-FE/app/types/events/instructorEventApi.ts`                                              | app/types                         | P               | W                                   |    16 |
| `FE/OSK-Manager-FE/app/types/instructors/instructor.test.ts`                                            | app/types                         | H M @d898c04    | W                                   |    83 |
| `FE/OSK-Manager-FE/app/types/instructors/instructor.ts`                                                 | app/types                         | P               | S (auth)                            |    15 |
| `FE/OSK-Manager-FE/app/types/instructors/instructorAvailability.ts`                                     | app/types                         | P               | W                                   |    89 |
| `FE/OSK-Manager-FE/app/types/instructors/instructorDetailNormalizers.ts`                                | app/types                         | H M @d898c04    | S (auth, registry)                  |   180 |
| `FE/OSK-Manager-FE/app/types/instructors/instructorFormatting.ts`                                       | app/types                         | P               | W                                   |    64 |
| `FE/OSK-Manager-FE/app/types/instructors/instructorListNormalizers.ts`                                  | app/types                         | H M @44a4144    | S (registry)                        |    86 |
| `FE/OSK-Manager-FE/app/types/instructors/instructorModels.ts`                                           | app/types                         | H M @d898c04    | W                                   |    38 |
| `FE/OSK-Manager-FE/app/types/instructors/instructorNormalizeShared.ts`                                  | app/types                         | P               | S (registry)                        |    53 |
| `FE/OSK-Manager-FE/app/types/instructors/instructorSlots.ts`                                            | app/types                         | P               | W                                   |    11 |
| `FE/OSK-Manager-FE/app/types/instructors/managerInstructorSchedule.ts`                                  | app/types                         | P               | W                                   |     1 |
| `FE/OSK-Manager-FE/app/types/lessons/lessonBooking.ts`                                                  | app/types                         | P               | W                                   |    81 |
| `FE/OSK-Manager-FE/app/types/lessons/lessonRating.test.ts`                                              | app/types                         | H A @c3dfb3a    | W                                   |   115 |
| `FE/OSK-Manager-FE/app/types/lessons/lessonRating.ts`                                                   | app/types                         | H M @c3dfb3a    | W                                   |   375 |
| `FE/OSK-Manager-FE/app/types/lessons/managerLesson.ts`                                                  | app/types                         | H M @bf4ea41    | W                                   |    44 |
| `FE/OSK-Manager-FE/app/types/manager/attentionItem.ts`                                                  | app/types                         | P               | W                                   |   128 |
| `FE/OSK-Manager-FE/app/types/payments/payment.ts`                                                       | app/types                         | P               | S (auth)                            |   183 |
| `FE/OSK-Manager-FE/app/types/profileAvatar.test.ts`                                                     | app/types                         | H A @44a4144    | W                                   |    26 |
| `FE/OSK-Manager-FE/app/types/profileAvatar.ts`                                                          | app/types                         | H A @44a4144    | S (registry)                        |    19 |
| `FE/OSK-Manager-FE/app/types/schedule/managerSchoolScheduleCalendarComponents.ts`                       | app/types                         | H M @6dea058    | W                                   |    33 |
| `FE/OSK-Manager-FE/app/types/schedule/managerSchoolScheduleCalendarWeek.ts`                             | app/types                         | P               | W                                   |     8 |
| `FE/OSK-Manager-FE/app/types/schedule/schedule.ts`                                                      | app/types                         | H M @eee74e4    | W                                   |    43 |
| `FE/OSK-Manager-FE/app/types/schedule/scheduleAvailability.ts`                                          | app/types                         | H A @bf4ea41    | W                                   |   175 |
| `FE/OSK-Manager-FE/app/types/schools/drivingSchool.ts`                                                  | app/types                         | P               | W                                   |   240 |
| `FE/OSK-Manager-FE/app/types/schools/schoolAvailabilityFilters.ts`                                      | app/types                         | P               | W                                   |    25 |
| `FE/OSK-Manager-FE/app/types/schools/schoolAvailabilitySlots.ts`                                        | app/types                         | P               | W                                   |    14 |
| `FE/OSK-Manager-FE/app/types/students/student.test.ts`                                                  | app/types                         | H M @2b80645    | W                                   |    91 |
| `FE/OSK-Manager-FE/app/types/students/student.ts`                                                       | app/types                         | P               | W                                   |    21 |
| `FE/OSK-Manager-FE/app/types/students/studentDetailNormalizers.ts`                                      | app/types                         | H M @2b80645    | W                                   |   116 |
| `FE/OSK-Manager-FE/app/types/students/studentFormatting.ts`                                             | app/types                         | P               | W                                   |    42 |
| `FE/OSK-Manager-FE/app/types/students/studentListNormalizers.ts`                                        | app/types                         | H M @44a4144    | W                                   |   158 |
| `FE/OSK-Manager-FE/app/types/students/studentListView.ts`                                               | app/types                         | H A @b29aaec    | W                                   |    11 |
| `FE/OSK-Manager-FE/app/types/students/studentModels.ts`                                                 | app/types                         | H M @2b80645    | W                                   |    62 |
| `FE/OSK-Manager-FE/app/types/students/studentNormalizeShared.ts`                                        | app/types                         | P               | W                                   |    35 |
| `FE/OSK-Manager-FE/app/types/students/studentNormalizers.ts`                                            | app/types                         | P               | W                                   |     6 |
| `FE/OSK-Manager-FE/app/types/students/studentProcessNormalizers.ts`                                     | app/types                         | P               | W                                   |    49 |
| `FE/OSK-Manager-FE/app/types/toast.ts`                                                                  | app/types                         | P               | W                                   |    16 |
| `FE/OSK-Manager-FE/app/types/ui.ts`                                                                     | app/types                         | P               | W                                   |    14 |
| `FE/OSK-Manager-FE/app/types/vehicles/vehicle.test.ts`                                                  | app/types                         | P               | W                                   |    38 |
| `FE/OSK-Manager-FE/app/types/vehicles/vehicle.ts`                                                       | app/types                         | P               | W                                   |   251 |
| `FE/OSK-Manager-FE/app/utils/account/accountProfileEdit.ts`                                             | app/utils                         | P               | S (auth)                            |     2 |
| `FE/OSK-Manager-FE/app/utils/account/accountProfilePresentation.test.ts`                                | app/utils                         | H A @2f7a78d    | W                                   |    42 |
| `FE/OSK-Manager-FE/app/utils/account/accountProfilePresentation.ts`                                     | app/utils                         | H A @2f7a78d    | W                                   |    58 |
| `FE/OSK-Manager-FE/app/utils/api/apiEnvelope.ts`                                                        | app/utils                         | P               | W                                   |    53 |
| `FE/OSK-Manager-FE/app/utils/api/apiFetchErrorMessage.ts`                                               | app/utils                         | P               | W                                   |    29 |
| `FE/OSK-Manager-FE/app/utils/api/bffClient.test.ts`                                                     | app/utils                         | P               | W                                   |   203 |
| `FE/OSK-Manager-FE/app/utils/api/bffClient.ts`                                                          | app/utils                         | Z; P            | S (koordynator)                     |   210 |
| `FE/OSK-Manager-FE/app/utils/api/bffEndpoint.ts`                                                        | app/utils                         | P               | W                                   |    19 |
| `FE/OSK-Manager-FE/app/utils/api/bffPhotoUpload.ts`                                                     | app/utils                         | P               | W                                   |    15 |
| `FE/OSK-Manager-FE/app/utils/auth/authReturnPath.ts`                                                    | app/utils                         | H M @50cbbed    | W                                   |    50 |
| `FE/OSK-Manager-FE/app/utils/auth/authRole.test.ts`                                                     | app/utils                         | P               | W                                   |   116 |
| `FE/OSK-Manager-FE/app/utils/auth/authRole.ts`                                                          | app/utils                         | P               | S (auth)                            |    57 |
| `FE/OSK-Manager-FE/app/utils/auth/authSessionApi.test.ts`                                               | app/utils                         | P               | W                                   |   106 |
| `FE/OSK-Manager-FE/app/utils/auth/authSessionApi.ts`                                                    | app/utils                         | P               | S (auth)                            |    84 |
| `FE/OSK-Manager-FE/app/utils/auth/authSessionMapper.test.ts`                                            | app/utils                         | P               | W                                   |    72 |
| `FE/OSK-Manager-FE/app/utils/auth/authSessionMapper.ts`                                                 | app/utils                         | P               | W                                   |   229 |
| `FE/OSK-Manager-FE/app/utils/auth/demoAuthSession.test.ts`                                              | app/utils                         | P               | W                                   |    18 |
| `FE/OSK-Manager-FE/app/utils/auth/demoAuthSession.ts`                                                   | app/utils                         | P               | W                                   |    17 |
| `FE/OSK-Manager-FE/app/utils/auth/jwt.ts`                                                               | app/utils                         | P               | W                                   |    59 |
| `FE/OSK-Manager-FE/app/utils/browser/copyToClipboard.ts`                                                | app/utils                         | P               | W                                   |    34 |
| `FE/OSK-Manager-FE/app/utils/courses/courseCreateFormMessages.ts`                                       | app/utils                         | P               | W                                   |    12 |
| `FE/OSK-Manager-FE/app/utils/courses/courseFilters.test.ts`                                             | app/utils                         | H A @4e087b0    | W                                   |   164 |
| `FE/OSK-Manager-FE/app/utils/courses/courseFilters.ts`                                                  | app/utils                         | H A @4e087b0    | W                                   |   245 |
| `FE/OSK-Manager-FE/app/utils/courses/managerCourseDetailPage.test.ts`                                   | app/utils                         | H M @0e37a5f    | W                                   |   152 |
| `FE/OSK-Manager-FE/app/utils/courses/managerCourseDetailPage.ts`                                        | app/utils                         | H M @0e37a5f    | W                                   |   179 |
| `FE/OSK-Manager-FE/app/utils/courses/managerCoursesList.test.ts`                                        | app/utils                         | H M @44a4144    | W                                   |   110 |
| `FE/OSK-Manager-FE/app/utils/courses/managerCoursesList.ts`                                             | app/utils                         | H M @44a4144    | W                                   |    68 |
| `FE/OSK-Manager-FE/app/utils/courses/myCoursesPage.test.ts`                                             | app/utils                         | H A @9ef9b68    | W                                   |   123 |
| `FE/OSK-Manager-FE/app/utils/courses/myCoursesPage.ts`                                                  | app/utils                         | H A @9ef9b68    | W                                   |    71 |
| `FE/OSK-Manager-FE/app/utils/date/date.ts`                                                              | app/utils                         | P               | W                                   |    46 |
| `FE/OSK-Manager-FE/app/utils/date/datePickerNavigation.test.ts`                                         | app/utils                         | H A @427616e    | W                                   |    50 |
| `FE/OSK-Manager-FE/app/utils/date/datePickerNavigation.ts`                                              | app/utils                         | H A @427616e    | S (koordynator)                     |    77 |
| `FE/OSK-Manager-FE/app/utils/date/polishScheduleTime.test.ts`                                           | app/utils                         | H A @eee74e4    | W                                   |    40 |
| `FE/OSK-Manager-FE/app/utils/date/polishScheduleTime.ts`                                                | app/utils                         | H A @eee74e4    | S (schedule)                        |    54 |
| `FE/OSK-Manager-FE/app/utils/date/timePickerValue.test.ts`                                              | app/utils                         | H A @64b5640    | W                                   |    88 |
| `FE/OSK-Manager-FE/app/utils/date/timePickerValue.ts`                                                   | app/utils                         | H A @64b5640    | W                                   |   180 |
| `FE/OSK-Manager-FE/app/utils/date/weeklyCalendarDates.test.ts`                                          | app/utils                         | P               | W                                   |    69 |
| `FE/OSK-Manager-FE/app/utils/date/weeklyCalendarDates.ts`                                               | app/utils                         | H M @eee74e4    | S (schedule)                        |   187 |
| `FE/OSK-Manager-FE/app/utils/events/eventStudentPickerCapacity.test.ts`                                 | app/utils                         | P               | W                                   |    73 |
| `FE/OSK-Manager-FE/app/utils/events/eventStudentPickerCapacity.ts`                                      | app/utils                         | P               | W                                   |    73 |
| `FE/OSK-Manager-FE/app/utils/events/eventStudentPickerStudents.test.ts`                                 | app/utils                         | H M @44a4144    | W                                   |   109 |
| `FE/OSK-Manager-FE/app/utils/events/eventStudentPickerStudents.ts`                                      | app/utils                         | P               | W                                   |    67 |
| `FE/OSK-Manager-FE/app/utils/events/eventStudentPickerSubmit.test.ts`                                   | app/utils                         | P               | W                                   |    71 |
| `FE/OSK-Manager-FE/app/utils/events/eventStudentPickerSubmit.ts`                                        | app/utils                         | P               | W                                   |    39 |
| `FE/OSK-Manager-FE/app/utils/events/eventsDayNavigation.test.ts`                                        | app/utils                         | H A @b803f5b    | W                                   |    66 |
| `FE/OSK-Manager-FE/app/utils/events/eventsDayNavigation.ts`                                             | app/utils                         | H A @b803f5b    | W                                   |    65 |
| `FE/OSK-Manager-FE/app/utils/events/eventsDayPage.test.ts`                                              | app/utils                         | H M @6360ec3    | W                                   |    82 |
| `FE/OSK-Manager-FE/app/utils/events/eventsDayPage.ts`                                                   | app/utils                         | H M @6360ec3    | W                                   |   159 |
| `FE/OSK-Manager-FE/app/utils/events/eventsDayScheduleGrid.test.ts`                                      | app/utils                         | H M @6360ec3    | W                                   |   260 |
| `FE/OSK-Manager-FE/app/utils/events/eventsDayScheduleGrid.ts`                                           | app/utils                         | H M @6360ec3    | W                                   |   359 |
| `FE/OSK-Manager-FE/app/utils/events/instructorEventNestedReaders.ts`                                    | app/utils                         | H M @44a4144    | W                                   |   178 |
| `FE/OSK-Manager-FE/app/utils/events/instructorEventNormalize.test.ts`                                   | app/utils                         | H M @44a4144    | W                                   |   113 |
| `FE/OSK-Manager-FE/app/utils/events/instructorEventNormalize.ts`                                        | app/utils                         | P               | W                                   |   141 |
| `FE/OSK-Manager-FE/app/utils/events/instructorEventStatusDisplay.ts`                                    | app/utils                         | P               | W                                   |    57 |
| `FE/OSK-Manager-FE/app/utils/events/instructorEventStudents.ts`                                         | app/utils                         | P               | W                                   |   174 |
| `FE/OSK-Manager-FE/app/utils/events/instructorEventsApiRequests.test.ts`                                | app/utils                         | P               | W                                   |    88 |
| `FE/OSK-Manager-FE/app/utils/events/instructorEventsApiRequests.ts`                                     | app/utils                         | P               | W                                   |   124 |
| `FE/OSK-Manager-FE/app/utils/events/managerEventEditForm.test.ts`                                       | app/utils                         | P               | W                                   |    62 |
| `FE/OSK-Manager-FE/app/utils/events/managerEventEditForm.ts`                                            | app/utils                         | H M @eee74e4    | W                                   |   122 |
| `FE/OSK-Manager-FE/app/utils/events/managerEventParticipants.test.ts`                                   | app/utils                         | H M @b803f5b    | W                                   |   253 |
| `FE/OSK-Manager-FE/app/utils/events/managerEventParticipants.ts`                                        | app/utils                         | H M @b803f5b    | W                                   |   201 |
| `FE/OSK-Manager-FE/app/utils/events/theoryEventEligibleStudents.ts`                                     | app/utils                         | H M @44a4144    | W                                   |   190 |
| `FE/OSK-Manager-FE/app/utils/forms/formToast.ts`                                                        | app/utils                         | P               | W                                   |    16 |
| `FE/OSK-Manager-FE/app/utils/forms/oskFormSchema.ts`                                                    | app/utils                         | P               | W                                   |     9 |
| `FE/OSK-Manager-FE/app/utils/instructors/managerInstructorAvailabilityEditor.test.ts`                   | app/utils                         | H M @d898c04    | W                                   |   126 |
| `FE/OSK-Manager-FE/app/utils/instructors/managerInstructorAvailabilityEditor.ts`                        | app/utils                         | H M @d898c04    | W                                   |   184 |
| `FE/OSK-Manager-FE/app/utils/instructors/managerInstructorDetailsPage.ts`                               | app/utils                         | P               | S (registry)                        |   193 |
| `FE/OSK-Manager-FE/app/utils/instructors/managerInstructorEditDialog.test.ts`                           | app/utils                         | P               | W                                   |    75 |
| `FE/OSK-Manager-FE/app/utils/instructors/managerInstructorEditDialog.ts`                                | app/utils                         | P               | W                                   |    72 |
| `FE/OSK-Manager-FE/app/utils/instructors/managerInstructorSchedulePage.test.ts`                         | app/utils                         | H M @2b80645    | W                                   |    55 |
| `FE/OSK-Manager-FE/app/utils/instructors/managerInstructorSchedulePage.ts`                              | app/utils                         | H M @2b80645    | W                                   |    81 |
| `FE/OSK-Manager-FE/app/utils/instructors/managerInstructorWeeklyCalendar.test.ts`                       | app/utils                         | H M @cdea385    | W                                   |   191 |
| `FE/OSK-Manager-FE/app/utils/instructors/managerInstructorWeeklyCalendar.ts`                            | app/utils                         | H M @cdea385    | W                                   |   290 |
| `FE/OSK-Manager-FE/app/utils/instructors/managerInstructorsPage.test.ts`                                | app/utils                         | H M @d898c04    | W                                   |   220 |
| `FE/OSK-Manager-FE/app/utils/instructors/managerInstructorsPage.ts`                                     | app/utils                         | H M @3608030    | W                                   |   330 |
| `FE/OSK-Manager-FE/app/utils/lessons/managerLessonAvailabilityMessage.test.ts`                          | app/utils                         | H A @bf4ea41    | W                                   |    20 |
| `FE/OSK-Manager-FE/app/utils/lessons/managerLessonAvailabilityMessage.ts`                               | app/utils                         | H A @bf4ea41    | W                                   |    22 |
| `FE/OSK-Manager-FE/app/utils/lessons/managerLessonBookingDialog.test.ts`                                | app/utils                         | H M @44a4144    | W                                   |   109 |
| `FE/OSK-Manager-FE/app/utils/lessons/managerLessonBookingDialog.ts`                                     | app/utils                         | P               | W                                   |   154 |
| `FE/OSK-Manager-FE/app/utils/lessons/managerLessonDatePolicy.test.ts`                                   | app/utils                         | H A @bf4ea41    | W                                   |    53 |
| `FE/OSK-Manager-FE/app/utils/lessons/managerLessonDatePolicy.ts`                                        | app/utils                         | H A @bf4ea41    | W                                   |    30 |
| `FE/OSK-Manager-FE/app/utils/lessons/managerLessonEditPresentation.test.ts`                             | app/utils                         | H M @bf4ea41    | W                                   |    26 |
| `FE/OSK-Manager-FE/app/utils/lessons/managerLessonEditPresentation.ts`                                  | app/utils                         | H M @bf4ea41    | W                                   |    33 |
| `FE/OSK-Manager-FE/app/utils/lessons/managerLessonEditReferences.test.ts`                               | app/utils                         | H M @bf4ea41    | W                                   |   133 |
| `FE/OSK-Manager-FE/app/utils/lessons/managerLessonEditReferences.ts`                                    | app/utils                         | H M @bf4ea41    | W                                   |   157 |
| `FE/OSK-Manager-FE/app/utils/lessons/managerLessonEditability.ts`                                       | app/utils                         | H A @bf4ea41    | W                                   |    13 |
| `FE/OSK-Manager-FE/app/utils/lessons/managerLessonsApi.test.ts`                                         | app/utils                         | H M @bf4ea41    | W                                   |   189 |
| `FE/OSK-Manager-FE/app/utils/lessons/managerLessonsApi.ts`                                              | app/utils                         | H M @bf4ea41    | W                                   |   275 |
| `FE/OSK-Manager-FE/app/utils/lessons/managerReviews.ts`                                                 | app/utils                         | H A @c3dfb3a    | W                                   |    34 |
| `FE/OSK-Manager-FE/app/utils/lessons/myReviews.test.ts`                                                 | app/utils                         | H A @5499235    | W                                   |    14 |
| `FE/OSK-Manager-FE/app/utils/lessons/myReviews.ts`                                                      | app/utils                         | H A @5499235    | W                                   |    33 |
| `FE/OSK-Manager-FE/app/utils/navigation/appShellSidebarNav.test.ts`                                     | app/utils                         | H M @9ef9b68    | W                                   |    90 |
| `FE/OSK-Manager-FE/app/utils/navigation/appShellSidebarNav.ts`                                          | app/utils                         | H M @ec4e6fc    | W                                   |   196 |
| `FE/OSK-Manager-FE/app/utils/navigation/navTree.test.ts`                                                | app/utils                         | P               | W                                   |    87 |
| `FE/OSK-Manager-FE/app/utils/navigation/navTree.ts`                                                     | app/utils                         | P               | W                                   |    78 |
| `FE/OSK-Manager-FE/app/utils/payments/myPaymentsPage.test.ts`                                           | app/utils                         | H A @9ef9b68    | W                                   |   118 |
| `FE/OSK-Manager-FE/app/utils/payments/myPaymentsPage.ts`                                                | app/utils                         | H A @d5c4797    | S (auth)                            |   231 |
| `FE/OSK-Manager-FE/app/utils/schedule/availabilityTimeline.ts`                                          | app/utils                         | P               | W                                   |    79 |
| `FE/OSK-Manager-FE/app/utils/schedule/eventEditFreeWindowIntervals.test.ts`                             | app/utils                         | P               | W                                   |   112 |
| `FE/OSK-Manager-FE/app/utils/schedule/eventEditFreeWindowIntervals.ts`                                  | app/utils                         | P               | W                                   |   153 |
| `FE/OSK-Manager-FE/app/utils/schedule/eventEditFreeWindowsPicker.ts`                                    | app/utils                         | P               | S (schedule)                        |   231 |
| `FE/OSK-Manager-FE/app/utils/schedule/freeWindows.ts`                                                   | app/utils                         | P               | W                                   |    79 |
| `FE/OSK-Manager-FE/app/utils/schedule/managerScheduleCalendarUtils.test.ts`                             | app/utils                         | H A @6dea058    | W                                   |    55 |
| `FE/OSK-Manager-FE/app/utils/schedule/managerScheduleCalendarUtils.ts`                                  | app/utils                         | H M @6dea058    | W                                   |   241 |
| `FE/OSK-Manager-FE/app/utils/schedule/managerScheduleLessonTable.test.ts`                               | app/utils                         | P               | W                                   |   104 |
| `FE/OSK-Manager-FE/app/utils/schedule/managerScheduleLessonTable.ts`                                    | app/utils                         | P               | W                                   |    93 |
| `FE/OSK-Manager-FE/app/utils/schedule/managerScheduleSameStartGroups.test.ts`                           | app/utils                         | H A @dad0dc1    | W                                   |   108 |
| `FE/OSK-Manager-FE/app/utils/schedule/managerScheduleSameStartGroups.ts`                                | app/utils                         | H A @dad0dc1    | W                                   |   104 |
| `FE/OSK-Manager-FE/app/utils/schedule/managerSchoolScheduleCalendarInteractions.test.ts`                | app/utils                         | H M @bf4ea41    | W                                   |   175 |
| `FE/OSK-Manager-FE/app/utils/schedule/managerSchoolScheduleCalendarInteractions.ts`                     | app/utils                         | H M @bf4ea41    | W                                   |   105 |
| `FE/OSK-Manager-FE/app/utils/schedule/managerSchoolScheduleCalendarLayout.test.ts`                      | app/utils                         | P               | W                                   |   115 |
| `FE/OSK-Manager-FE/app/utils/schedule/managerSchoolScheduleCalendarLayout.ts`                           | app/utils                         | P               | W                                   |   149 |
| `FE/OSK-Manager-FE/app/utils/schedule/managerSchoolScheduleCalendarWeek.test.ts`                        | app/utils                         | P               | W                                   |    87 |
| `FE/OSK-Manager-FE/app/utils/schedule/managerSchoolScheduleCalendarWeek.ts`                             | app/utils                         | P               | W                                   |   113 |
| `FE/OSK-Manager-FE/app/utils/schedule/scheduleBookedPracticalLesson.ts`                                 | app/utils                         | P               | W                                   |    30 |
| `FE/OSK-Manager-FE/app/utils/schedule/scheduleInstructorEvent.ts`                                       | app/utils                         | P               | W                                   |     7 |
| `FE/OSK-Manager-FE/app/utils/schedule/scheduleManagerEditNavigation.test.ts`                            | app/utils                         | H A @b803f5b    | W                                   |    47 |
| `FE/OSK-Manager-FE/app/utils/schedule/scheduleManagerEditNavigation.ts`                                 | app/utils                         | H M @b803f5b    | W                                   |    40 |
| `FE/OSK-Manager-FE/app/utils/schedule/studentEventsToScheduleItems.ts`                                  | app/utils                         | P               | W                                   |   171 |
| `FE/OSK-Manager-FE/app/utils/schedule/studentScheduleGroupedList.test.ts`                               | app/utils                         | H M @8d09464    | W                                   |   130 |
| `FE/OSK-Manager-FE/app/utils/schedule/studentScheduleGroupedList.ts`                                    | app/utils                         | H M @8d09464    | W                                   |   208 |
| `FE/OSK-Manager-FE/app/utils/schools/drivingSchoolRules.ts`                                             | app/utils                         | H M @5c9e704    | W                                   |    16 |
| `FE/OSK-Manager-FE/app/utils/schools/managerOskPage.test.ts`                                            | app/utils                         | H M @5c9e704    | W                                   |    81 |
| `FE/OSK-Manager-FE/app/utils/schools/managerOskPage.ts`                                                 | app/utils                         | H M @5c9e704    | W                                   |    69 |
| `FE/OSK-Manager-FE/app/utils/schools/managerSchoolWeeklyAvailabilityCalendar.test.ts`                   | app/utils                         | H M @d7b1867    | W                                   |   223 |
| `FE/OSK-Manager-FE/app/utils/schools/managerSchoolWeeklyAvailabilityCalendar.ts`                        | app/utils                         | H M @d7b1867    | W                                   |   314 |
| `FE/OSK-Manager-FE/app/utils/student/studentLessonBookingPage.test.ts`                                  | app/utils                         | H A @ec4e6fc    | W                                   |   113 |
| `FE/OSK-Manager-FE/app/utils/student/studentLessonBookingPage.ts`                                       | app/utils                         | H A @ec4e6fc    | W                                   |   328 |
| `FE/OSK-Manager-FE/app/utils/students/managerStudentFormDialog.test.ts`                                 | app/utils                         | P               | W                                   |   114 |
| `FE/OSK-Manager-FE/app/utils/students/managerStudentFormDialog.ts`                                      | app/utils                         | P               | W                                   |   110 |
| `FE/OSK-Manager-FE/app/utils/students/managerStudentPaymentsSection.test.ts`                            | app/utils                         | P               | W                                   |   116 |
| `FE/OSK-Manager-FE/app/utils/students/managerStudentPaymentsSection.ts`                                 | app/utils                         | P               | S (auth)                            |   119 |
| `FE/OSK-Manager-FE/app/utils/students/managerStudentsPage.test.ts`                                      | app/utils                         | P               | W                                   |    79 |
| `FE/OSK-Manager-FE/app/utils/students/managerStudentsPage.ts`                                           | app/utils                         | P               | W                                   |    98 |
| `FE/OSK-Manager-FE/app/utils/students/studentApiRequests.ts`                                            | app/utils                         | H M @01d4eb6    | W                                   |   143 |
| `FE/OSK-Manager-FE/app/utils/students/studentDetailsPage.test.ts`                                       | app/utils                         | H M @2b80645    | W                                   |    79 |
| `FE/OSK-Manager-FE/app/utils/students/studentDetailsPage.ts`                                            | app/utils                         | P               | W                                   |    99 |
| `FE/OSK-Manager-FE/app/utils/students/studentListSearch.test.ts`                                        | app/utils                         | H A @01d4eb6    | W                                   |   340 |
| `FE/OSK-Manager-FE/app/utils/text/polishPlural.ts`                                                      | app/utils                         | H A @9ef9b68    | W                                   |    18 |
| `FE/OSK-Manager-FE/app/utils/ui/keyboard.ts`                                                            | app/utils                         | P               | W                                   |     7 |
| `FE/OSK-Manager-FE/app/utils/vehicles/availability.test.ts`                                             | app/utils                         | P               | W                                   |    63 |
| `FE/OSK-Manager-FE/app/utils/vehicles/availability.ts`                                                  | app/utils                         | P               | W                                   |   109 |
| `FE/OSK-Manager-FE/app/utils/vehicles/display.test.ts`                                                  | app/utils                         | H M @c1b92fa    | W                                   |    87 |
| `FE/OSK-Manager-FE/app/utils/vehicles/display.ts`                                                       | app/utils                         | H M @c1b92fa    | W                                   |    93 |
| `FE/OSK-Manager-FE/app/utils/vehicles/filters.test.ts`                                                  | app/utils                         | H A @c1b92fa    | W                                   |    70 |
| `FE/OSK-Manager-FE/app/utils/vehicles/filters.ts`                                                       | app/utils                         | H A @c1b92fa    | W                                   |    56 |
| `FE/OSK-Manager-FE/app/utils/vehicles/vehicleApiRequests.ts`                                            | app/utils                         | P               | W                                   |    45 |
| `FE/OSK-Manager-FE/app/utils/vehicles/vehicleForm.test.ts`                                              | app/utils                         | H M @427616e    | W                                   |   181 |
| `FE/OSK-Manager-FE/app/utils/vehicles/vehicleForm.ts`                                                   | app/utils                         | H M @427616e    | S (registry)                        |   182 |
| `FE/OSK-Manager-FE/components.json`                                                                     | config                            | P               | W                                   |    20 |
| `FE/OSK-Manager-FE/e2e/specs/full/auth.spec.ts`                                                         | e2e/specs                         | H A @5e7362b    | W                                   |    31 |
| `FE/OSK-Manager-FE/e2e/specs/ui/auth-session.spec.ts`                                                   | e2e/specs                         | H A @5e7362b    | W                                   |   157 |
| `FE/OSK-Manager-FE/e2e/specs/ui/dashboard.spec.ts`                                                      | e2e/specs                         | H A @d7b1867    | S (auth)                            |   178 |
| `FE/OSK-Manager-FE/e2e/specs/ui/design-system.spec.ts`                                                  | e2e/specs                         | H A @d5c4797    | W                                   |   374 |
| `FE/OSK-Manager-FE/e2e/specs/ui/manager-instructor-create.spec.ts`                                      | e2e/specs                         | H A @3608030    | W                                   |   179 |
| `FE/OSK-Manager-FE/e2e/support/mockAuth.ts`                                                             | e2e/support                       | H A @5e7362b    | W                                   |   142 |
| `FE/OSK-Manager-FE/eslint.config.mjs`                                                                   | config                            | P               | S (koordynator)                     |   148 |
| `FE/OSK-Manager-FE/i18n/locales/en.json`                                                                | i18n/locales                      | P               | W                                   |    98 |
| `FE/OSK-Manager-FE/i18n/locales/pl.json`                                                                | i18n/locales                      | P               | W                                   |    98 |
| `FE/OSK-Manager-FE/nuxt.config.ts`                                                                      | config                            | H M @d5c4797    | S (koordynator, schedule)           |    78 |
| `FE/OSK-Manager-FE/package.json`                                                                        | config                            | H M @5e7362b    | S (koordynator, schedule)           |    81 |
| `FE/OSK-Manager-FE/playwright.config.ts`                                                                | config                            | H A @5e7362b    | S (koordynator)                     |    77 |
| `FE/OSK-Manager-FE/prettier.config.mjs`                                                                 | config                            | P               | W                                   |     8 |
| `FE/OSK-Manager-FE/scripts/run-e2e.mjs`                                                                 | scripts/run-e2e.mjs               | H A @5e7362b    | S (koordynator)                     |    76 |
| `FE/OSK-Manager-FE/scripts/stage5-smoke.mjs`                                                            | scripts/stage5-smoke.mjs          | P               | W                                   |    66 |
| `FE/OSK-Manager-FE/server/__tests__/bffAdapter.test.ts`                                                 | server/**tests**                  | P               | W                                   |    71 |
| `FE/OSK-Manager-FE/server/api/auth/login.post.ts`                                                       | server/api                        | P               | S (auth)                            |    24 |
| `FE/OSK-Manager-FE/server/api/auth/logout.post.ts`                                                      | server/api                        | P               | S (auth)                            |    15 |
| `FE/OSK-Manager-FE/server/api/auth/me.get.ts`                                                           | server/api                        | H M @5e7362b    | S (auth)                            |    26 |
| `FE/OSK-Manager-FE/server/api/auth/profile/avatar.post.ts`                                              | server/api                        | P               | S (auth)                            |    54 |
| `FE/OSK-Manager-FE/server/api/auth/profile/index.patch.ts`                                              | server/api                        | P               | S (auth)                            |   272 |
| `FE/OSK-Manager-FE/server/api/auth/refresh.post.ts`                                                     | server/api                        | H M @5e7362b    | S (auth)                            |    19 |
| `FE/OSK-Manager-FE/server/api/auth/register.post.ts`                                                    | server/api                        | P               | S (auth)                            |    36 |
| `FE/OSK-Manager-FE/server/api/course-types.get.ts`                                                      | server/api                        | P               | W                                   |    28 |
| `FE/OSK-Manager-FE/server/api/courses.get.ts`                                                           | server/api                        | P               | W                                   |    21 |
| `FE/OSK-Manager-FE/server/api/courses.post.ts`                                                          | server/api                        | P               | W                                   |    35 |
| `FE/OSK-Manager-FE/server/api/courses/[id].get.ts`                                                      | server/api                        | P               | W                                   |    21 |
| `FE/OSK-Manager-FE/server/api/courses/[id].patch.ts`                                                    | server/api                        | P               | W                                   |    33 |
| `FE/OSK-Manager-FE/server/api/driving-schools.get.ts`                                                   | server/api                        | P               | W                                   |    15 |
| `FE/OSK-Manager-FE/server/api/driving-schools.post.ts`                                                  | server/api                        | P               | W                                   |    45 |
| `FE/OSK-Manager-FE/server/api/driving-schools/[id].delete.ts`                                           | server/api                        | P               | W                                   |    21 |
| `FE/OSK-Manager-FE/server/api/driving-schools/[id].patch.ts`                                            | server/api                        | P               | W                                   |    49 |
| `FE/OSK-Manager-FE/server/api/driving-schools/[id]/availability/slots.get.ts`                           | server/api                        | P               | W                                   |    69 |
| `FE/OSK-Manager-FE/server/api/driving-schools/[id]/default-vehicle.patch.ts`                            | server/api                        | P               | W                                   |    45 |
| `FE/OSK-Manager-FE/server/api/driving-schools/[id]/schedule.get.ts`                                     | server/api                        | P               | W                                   |    53 |
| `FE/OSK-Manager-FE/server/api/driving-schools/[id]/set-default.patch.ts`                                | server/api                        | P               | W                                   |    21 |
| `FE/OSK-Manager-FE/server/api/driving-schools/default.get.ts`                                           | server/api                        | P               | W                                   |    15 |
| `FE/OSK-Manager-FE/server/api/events/[eventId]/eligible-students.get.ts`                                | server/api                        | P               | W                                   |    23 |
| `FE/OSK-Manager-FE/server/api/events/[eventId]/index.delete.ts`                                         | server/api                        | P               | W                                   |    22 |
| `FE/OSK-Manager-FE/server/api/events/[eventId]/index.get.ts`                                            | server/api                        | P               | W                                   |    21 |
| `FE/OSK-Manager-FE/server/api/events/[eventId]/index.patch.ts`                                          | server/api                        | P               | W                                   |    67 |
| `FE/OSK-Manager-FE/server/api/events/[eventId]/students.get.ts`                                         | server/api                        | P               | W                                   |    31 |
| `FE/OSK-Manager-FE/server/api/events/[eventId]/students.post.ts`                                        | server/api                        | P               | W                                   |    99 |
| `FE/OSK-Manager-FE/server/api/events/[eventId]/students.put.ts`                                         | server/api                        | H M @eee74e4    | W                                   |    40 |
| `FE/OSK-Manager-FE/server/api/events/[eventId]/students/[studentUserId].delete.ts`                      | server/api                        | P               | W                                   |    34 |
| `FE/OSK-Manager-FE/server/api/events/[eventId]/students/availability-check.post.ts`                     | server/api                        | H A @eee74e4    | W                                   |    38 |
| `FE/OSK-Manager-FE/server/api/events/bulk-status.patch.ts`                                              | server/api                        | H A @8d09464    | W                                   |    55 |
| `FE/OSK-Manager-FE/server/api/events/index.post.ts`                                                     | server/api                        | P               | W                                   |   207 |
| `FE/OSK-Manager-FE/server/api/instructors.get.ts`                                                       | server/api                        | P               | W                                   |    21 |
| `FE/OSK-Manager-FE/server/api/instructors/[id].delete.ts`                                               | server/api                        | P               | W                                   |    21 |
| `FE/OSK-Manager-FE/server/api/instructors/[id].get.ts`                                                  | server/api                        | P               | W                                   |    21 |
| `FE/OSK-Manager-FE/server/api/instructors/[id].patch.ts`                                                | server/api                        | P               | W                                   |    25 |
| `FE/OSK-Manager-FE/server/api/instructors/[id]/availability/exceptions.get.ts`                          | server/api                        | H A @bf4ea41    | W                                   |    40 |
| `FE/OSK-Manager-FE/server/api/instructors/[id]/availability/slots.get.ts`                               | server/api                        | P               | W                                   |    30 |
| `FE/OSK-Manager-FE/server/api/instructors/[id]/availability/weekly.get.ts`                              | server/api                        | P               | W                                   |    25 |
| `FE/OSK-Manager-FE/server/api/instructors/[id]/availability/weekly/[day].delete.ts`                     | server/api                        | P               | W                                   |    43 |
| `FE/OSK-Manager-FE/server/api/instructors/[id]/availability/weekly/[day].put.ts`                        | server/api                        | P               | W                                   |    92 |
| `FE/OSK-Manager-FE/server/api/instructors/[id]/ratings.get.ts`                                          | server/api                        | H M @c3dfb3a    | S (auth)                            |    31 |
| `FE/OSK-Manager-FE/server/api/lessons.post.ts`                                                          | server/api                        | P               | W                                   |    36 |
| `FE/OSK-Manager-FE/server/api/lessons/[id].get.ts`                                                      | server/api                        | P               | W                                   |    21 |
| `FE/OSK-Manager-FE/server/api/lessons/[id].patch.ts`                                                    | server/api                        | P               | S (schedule)                        |    55 |
| `FE/OSK-Manager-FE/server/api/lessons/[lessonId]/cancel.patch.ts`                                       | server/api                        | P               | W                                   |    48 |
| `FE/OSK-Manager-FE/server/api/lessons/[lessonId]/rating.get.ts`                                         | server/api                        | P               | S (auth)                            |    34 |
| `FE/OSK-Manager-FE/server/api/lessons/[lessonId]/rating.post.ts`                                        | server/api                        | P               | S (auth)                            |   108 |
| `FE/OSK-Manager-FE/server/api/lessons/me.post.ts`                                                       | server/api                        | P               | W                                   |    64 |
| `FE/OSK-Manager-FE/server/api/manager/attention-items.get.ts`                                           | server/api                        | P               | S (auth)                            |    34 |
| `FE/OSK-Manager-FE/server/api/me/courses.get.ts`                                                        | server/api                        | P               | S (registry)                        |    76 |
| `FE/OSK-Manager-FE/server/api/me/payments.get.ts`                                                       | server/api                        | H M @72418e9    | S (auth)                            |   102 |
| `FE/OSK-Manager-FE/server/api/ratings.get.ts`                                                           | server/api                        | H M @c3dfb3a    | S (auth)                            |    56 |
| `FE/OSK-Manager-FE/server/api/ratings/me.get.test.ts`                                                   | server/api                        | H M @5499235    | S (auth)                            |    96 |
| `FE/OSK-Manager-FE/server/api/ratings/me.get.ts`                                                        | server/api                        | H M @5499235    | S (auth)                            |    15 |
| `FE/OSK-Manager-FE/server/api/schedule/availability-check.post.ts`                                      | server/api                        | H A @eee74e4    | S (schedule)                        |    27 |
| `FE/OSK-Manager-FE/server/api/schedule/availability-options.post.ts`                                    | server/api                        | H A @eee74e4    | S (schedule)                        |    26 |
| `FE/OSK-Manager-FE/server/api/schedule/index.get.ts`                                                    | server/api                        | P               | W                                   |    41 |
| `FE/OSK-Manager-FE/server/api/schedule/me.get.ts`                                                       | server/api                        | P               | W                                   |    34 |
| `FE/OSK-Manager-FE/server/api/students.get.ts`                                                          | server/api                        | H M @01d4eb6    | S (registry)                        |   103 |
| `FE/OSK-Manager-FE/server/api/students/[userId]/courses.post.ts`                                        | server/api                        | P               | W                                   |    64 |
| `FE/OSK-Manager-FE/server/api/students/[userId]/events.get.ts`                                          | server/api                        | P               | W                                   |   127 |
| `FE/OSK-Manager-FE/server/api/students/[userId]/index.get.ts`                                           | server/api                        | H M @2b80645    | W                                   |    20 |
| `FE/OSK-Manager-FE/server/api/students/[userId]/index.patch.ts`                                         | server/api                        | P               | W                                   |    78 |
| `FE/OSK-Manager-FE/server/api/students/[userId]/payments.get.ts`                                        | server/api                        | P               | S (auth)                            |    34 |
| `FE/OSK-Manager-FE/server/api/students/[userId]/payments.post.ts`                                       | server/api                        | P               | S (auth)                            |    78 |
| `FE/OSK-Manager-FE/server/api/students/[userId]/payments/[paymentId].patch.ts`                          | server/api                        | P               | S (auth)                            |    75 |
| `FE/OSK-Manager-FE/server/api/students/[userId]/payments/[paymentId]/mark-paid.patch.ts`                | server/api                        | P               | S (auth)                            |    44 |
| `FE/OSK-Manager-FE/server/api/students/[userId]/payments/[paymentId]/mark-unpaid.patch.ts`              | server/api                        | P               | S (auth)                            |    44 |
| `FE/OSK-Manager-FE/server/api/students/[userId]/process-status.get.ts`                                  | server/api                        | P               | W                                   |    34 |
| `FE/OSK-Manager-FE/server/api/vehicles.get.ts`                                                          | server/api                        | P               | S (registry)                        |    39 |
| `FE/OSK-Manager-FE/server/api/vehicles.post.ts`                                                         | server/api                        | P               | W                                   |    63 |
| `FE/OSK-Manager-FE/server/api/vehicles/[id].delete.ts`                                                  | server/api                        | P               | W                                   |    21 |
| `FE/OSK-Manager-FE/server/api/vehicles/[id].get.ts`                                                     | server/api                        | P               | W                                   |    20 |
| `FE/OSK-Manager-FE/server/api/vehicles/[id].patch.ts`                                                   | server/api                        | P               | W                                   |    59 |
| `FE/OSK-Manager-FE/server/api/vehicles/[id]/photo.post.ts`                                              | server/api                        | P               | S (registry)                        |    51 |
| `FE/OSK-Manager-FE/server/api/vehicles/[id]/status.patch.ts`                                            | server/api                        | P               | W                                   |    81 |
| `FE/OSK-Manager-FE/server/utils/auth/authBffAdapter.ts`                                                 | server/utils                      | P               | S (auth)                            |    86 |
| `FE/OSK-Manager-FE/server/utils/auth/authTypes.ts`                                                      | server/utils                      | P               | S (auth)                            |    21 |
| `FE/OSK-Manager-FE/server/utils/auth/authUpstreamProfile.ts`                                            | server/utils                      | P               | S (auth)                            |    73 |
| `FE/OSK-Manager-FE/server/utils/auth/authUpstreamRegister.test.ts`                                      | server/utils                      | H A @3608030    | S (auth)                            |    45 |
| `FE/OSK-Manager-FE/server/utils/auth/authUpstreamRegister.ts`                                           | server/utils                      | P               | S (auth)                            |    24 |
| `FE/OSK-Manager-FE/server/utils/auth/authUpstreamSession.ts`                                            | server/utils                      | H M @5e7362b    | S (auth)                            |   188 |
| `FE/OSK-Manager-FE/server/utils/auth/mockAuthSession.ts`                                                | server/utils                      | H A @5e7362b    | S (auth)                            |   165 |
| `FE/OSK-Manager-FE/server/utils/auth/mockUserAvatarStore.ts`                                            | server/utils                      | P               | S (auth)                            |    12 |
| `FE/OSK-Manager-FE/server/utils/auth/requireAuthFromCookie.ts`                                          | server/utils                      | P               | S (auth)                            |    50 |
| `FE/OSK-Manager-FE/server/utils/auth/requireAuthenticatedFromCookie.ts`                                 | server/utils                      | P               | S (auth)                            |    32 |
| `FE/OSK-Manager-FE/server/utils/auth/requireInstructorFromCookie.ts`                                    | server/utils                      | P               | S (auth)                            |    47 |
| `FE/OSK-Manager-FE/server/utils/auth/requireManagerFromCookie.ts`                                       | server/utils                      | P               | S (auth)                            |    48 |
| `FE/OSK-Manager-FE/server/utils/auth/requireStudentFromCookie.ts`                                       | server/utils                      | P               | S (auth)                            |    45 |
| `FE/OSK-Manager-FE/server/utils/auth/requireStudentOrInstructorFromCookie.ts`                           | server/utils                      | P               | S (auth)                            |    50 |
| `FE/OSK-Manager-FE/server/utils/bff/bffAdapterExecutor.test.ts`                                         | server/utils                      | P               | W                                   |   124 |
| `FE/OSK-Manager-FE/server/utils/bff/bffAdapterExecutor.ts`                                              | server/utils                      | P               | S (koordynator)                     |    38 |
| `FE/OSK-Manager-FE/server/utils/courses/courseTypesBff.ts`                                              | server/utils                      | P               | W                                   |    30 |
| `FE/OSK-Manager-FE/server/utils/courses/coursesBff.ts`                                                  | server/utils                      | P               | S (registry)                        |   108 |
| `FE/OSK-Manager-FE/server/utils/courses/coursesMockBff.ts`                                              | server/utils                      | P               | S (registry)                        |   130 |
| `FE/OSK-Manager-FE/server/utils/courses/mockCoursesList.ts`                                             | server/utils                      | H M @44a4144    | S (registry)                        |   357 |
| `FE/OSK-Manager-FE/server/utils/courses/parseCourseBody.test.ts`                                        | server/utils                      | H M @6c30b8e    | W                                   |   136 |
| `FE/OSK-Manager-FE/server/utils/courses/parseCourseCreateBody.ts`                                       | server/utils                      | H M @6c30b8e    | S (registry)                        |   277 |
| `FE/OSK-Manager-FE/server/utils/courses/parseCoursePatchBody.ts`                                        | server/utils                      | P               | W                                   |    50 |
| `FE/OSK-Manager-FE/server/utils/events/eventStudentsBff.ts`                                             | server/utils                      | H M @eee74e4    | W                                   |   183 |
| `FE/OSK-Manager-FE/server/utils/events/eventStudentsBody.test.ts`                                       | server/utils                      | H A @eee74e4    | W                                   |    55 |
| `FE/OSK-Manager-FE/server/utils/events/eventStudentsBody.ts`                                            | server/utils                      | H A @eee74e4    | W                                   |    98 |
| `FE/OSK-Manager-FE/server/utils/events/eventsCrudBff.ts`                                                | server/utils                      | P               | S (schedule)                        |   107 |
| `FE/OSK-Manager-FE/server/utils/events/eventsMockBff.ts`                                                | server/utils                      | P               | S (schedule)                        |    61 |
| `FE/OSK-Manager-FE/server/utils/events/eventsPayload.ts`                                                | server/utils                      | P               | W                                   |    31 |
| `FE/OSK-Manager-FE/server/utils/events/eventsRequest.ts`                                                | server/utils                      | P               | W                                   |    24 |
| `FE/OSK-Manager-FE/server/utils/events/eventsTypes.ts`                                                  | server/utils                      | H M @eee74e4    | W                                   |    30 |
| `FE/OSK-Manager-FE/server/utils/events/parseEventPatchBody.test.ts`                                     | server/utils                      | P               | W                                   |    79 |
| `FE/OSK-Manager-FE/server/utils/events/parseEventPatchBody.ts`                                          | server/utils                      | P               | S (schedule)                        |   184 |
| `FE/OSK-Manager-FE/server/utils/instructors/availabilityBff.ts`                                         | server/utils                      | H M @bf4ea41    | W                                   |   182 |
| `FE/OSK-Manager-FE/server/utils/instructors/instructorsBff.ts`                                          | server/utils                      | P               | S (registry)                        |    74 |
| `FE/OSK-Manager-FE/server/utils/instructors/instructorsMockBff.ts`                                      | server/utils                      | P               | S (registry)                        |    63 |
| `FE/OSK-Manager-FE/server/utils/instructors/mockAvailabilityStore.ts`                                   | server/utils                      | P               | W                                   |    93 |
| `FE/OSK-Manager-FE/server/utils/instructors/mockInstructorsList.ts`                                     | server/utils                      | U; H M @2b80645 | S (registry)                        |   323 |
| `FE/OSK-Manager-FE/server/utils/instructors/mockSlots.ts`                                               | server/utils                      | P               | W                                   |   195 |
| `FE/OSK-Manager-FE/server/utils/instructors/parseInstructorPatchBody.test.ts`                           | server/utils                      | P               | W                                   |    44 |
| `FE/OSK-Manager-FE/server/utils/instructors/parseInstructorPatchBody.ts`                                | server/utils                      | P               | S (registry)                        |    87 |
| `FE/OSK-Manager-FE/server/utils/instructors/slotsDateRangeValidation.ts`                                | server/utils                      | P               | W                                   |   132 |
| `FE/OSK-Manager-FE/server/utils/lessons/lessonsBff.ts`                                                  | server/utils                      | P               | S (schedule)                        |   243 |
| `FE/OSK-Manager-FE/server/utils/lessons/lessonsMockBff.ts`                                              | server/utils                      | P               | S (schedule)                        |    47 |
| `FE/OSK-Manager-FE/server/utils/lessons/parseLessonCreateBody.test.ts`                                  | server/utils                      | P               | W                                   |    60 |
| `FE/OSK-Manager-FE/server/utils/lessons/parseLessonCreateBody.ts`                                       | server/utils                      | P               | S (schedule)                        |    99 |
| `FE/OSK-Manager-FE/server/utils/lessons/parseLessonPatchBody.test.ts`                                   | server/utils                      | P               | W                                   |    61 |
| `FE/OSK-Manager-FE/server/utils/lessons/parseLessonPatchBody.ts`                                        | server/utils                      | P               | S (schedule)                        |    90 |
| `FE/OSK-Manager-FE/server/utils/lessons/parseOwnLessonBody.test.ts`                                     | server/utils                      | P               | W                                   |    73 |
| `FE/OSK-Manager-FE/server/utils/lessons/parseOwnLessonBody.ts`                                          | server/utils                      | P               | S (schedule)                        |    93 |
| `FE/OSK-Manager-FE/server/utils/manager/attentionItemsBff.ts`                                           | server/utils                      | P               | S (auth)                            |    55 |
| `FE/OSK-Manager-FE/server/utils/payments/paymentsBff.test.ts`                                           | server/utils                      | H A @72418e9    | S (auth)                            |    52 |
| `FE/OSK-Manager-FE/server/utils/payments/paymentsBff.ts`                                                | server/utils                      | H M @72418e9    | S (auth)                            |   158 |
| `FE/OSK-Manager-FE/server/utils/ratings/lessonRatingsBff.test.ts`                                       | server/utils                      | H A @c3dfb3a    | S (auth)                            |    69 |
| `FE/OSK-Manager-FE/server/utils/ratings/lessonRatingsBff.ts`                                            | server/utils                      | U; H M @c3dfb3a | S (auth)                            |   249 |
| `FE/OSK-Manager-FE/server/utils/ratings/ratingsMockBff.ts`                                              | server/utils                      | H M @c3dfb3a    | S (auth)                            |    50 |
| `FE/OSK-Manager-FE/server/utils/schedule/mockSchoolSlotFilters.ts`                                      | server/utils                      | P               | W                                   |   263 |
| `FE/OSK-Manager-FE/server/utils/schedule/parseScheduleAvailabilityCheck.test.ts`                        | server/utils                      | H A @eee74e4    | W                                   |   204 |
| `FE/OSK-Manager-FE/server/utils/schedule/parseScheduleAvailabilityCheck.ts`                             | server/utils                      | H A @eee74e4    | W                                   |   265 |
| `FE/OSK-Manager-FE/server/utils/schedule/parseScheduleAvailabilityOptions.test.ts`                      | server/utils                      | H A @eee74e4    | W                                   |   129 |
| `FE/OSK-Manager-FE/server/utils/schedule/parseScheduleAvailabilityOptions.ts`                           | server/utils                      | H A @eee74e4    | W                                   |   117 |
| `FE/OSK-Manager-FE/server/utils/schedule/scheduleAvailabilityBff.test.ts`                               | server/utils                      | H A @eee74e4    | W                                   |    94 |
| `FE/OSK-Manager-FE/server/utils/schedule/scheduleAvailabilityBff.ts`                                    | server/utils                      | H A @eee74e4    | S (schedule)                        |    28 |
| `FE/OSK-Manager-FE/server/utils/schedule/scheduleBff.ts`                                                | server/utils                      | H M @eee74e4    | S (schedule)                        |    66 |
| `FE/OSK-Manager-FE/server/utils/schedule/scheduleQueryValidation.test.ts`                               | server/utils                      | P               | W                                   |   115 |
| `FE/OSK-Manager-FE/server/utils/schedule/scheduleQueryValidation.ts`                                    | server/utils                      | P               | S (schedule)                        |   127 |
| `FE/OSK-Manager-FE/server/utils/schedule/schoolScheduleBff.ts`                                          | server/utils                      | P               | W                                   |   101 |
| `FE/OSK-Manager-FE/server/utils/schools/drivingSchoolsBff.ts`                                           | server/utils                      | P               | S (registry)                        |   140 |
| `FE/OSK-Manager-FE/server/utils/schools/drivingSchoolsMockBff.ts`                                       | server/utils                      | P               | S (registry)                        |   104 |
| `FE/OSK-Manager-FE/server/utils/schools/mockDrivingSchoolsStore.ts`                                     | server/utils                      | P               | S (registry)                        |   175 |
| `FE/OSK-Manager-FE/server/utils/students/mockStudentsList.ts`                                           | server/utils                      | H M @2b80645    | S (registry)                        |   738 |
| `FE/OSK-Manager-FE/server/utils/students/studentsBff.ts`                                                | server/utils                      | H M @2b80645    | S (registry)                        |   134 |
| `FE/OSK-Manager-FE/server/utils/students/studentsMockBff.ts`                                            | server/utils                      | H M @2b80645    | S (registry)                        |   372 |
| `FE/OSK-Manager-FE/server/utils/tests/mockBffAdapters.test.ts`                                          | server/utils                      | P               | S (registry)                        |    94 |
| `FE/OSK-Manager-FE/server/utils/upstream/upstreamBody.ts`                                               | server/utils                      | P               | W                                   |    23 |
| `FE/OSK-Manager-FE/server/utils/upstream/upstreamCookies.ts`                                            | server/utils                      | P               | W                                   |   146 |
| `FE/OSK-Manager-FE/server/utils/upstream/upstreamEnvelope.ts`                                           | server/utils                      | P               | S (koordynator)                     |    53 |
| `FE/OSK-Manager-FE/server/utils/upstream/upstreamRequest.test.ts`                                       | server/utils                      | H M @5e7362b    | W                                   |   347 |
| `FE/OSK-Manager-FE/server/utils/upstream/upstreamRequest.ts`                                            | server/utils                      | Z; H M @5e7362b | S (koordynator)                     |    99 |
| `FE/OSK-Manager-FE/server/utils/upstream/upstreamTypes.ts`                                              | server/utils                      | H M @5e7362b    | W                                   |    33 |
| `FE/OSK-Manager-FE/server/utils/upstream/upstreamUrl.ts`                                                | server/utils                      | P               | W                                   |    23 |
| `FE/OSK-Manager-FE/server/utils/validation/requestValidation.test.ts`                                   | server/utils                      | P               | W                                   |   165 |
| `FE/OSK-Manager-FE/server/utils/validation/requestValidation.ts`                                        | server/utils                      | P               | S (koordynator)                     |   189 |
| `FE/OSK-Manager-FE/server/utils/vehicles/mockVehiclesList.ts`                                           | server/utils                      | P               | W                                   |     7 |
| `FE/OSK-Manager-FE/server/utils/vehicles/mockVehiclesStore.ts`                                          | server/utils                      | P               | S (registry)                        |   276 |
| `FE/OSK-Manager-FE/server/utils/vehicles/parseVehicleRequestBody.ts`                                    | server/utils                      | P               | S (registry)                        |   101 |
| `FE/OSK-Manager-FE/server/utils/vehicles/vehiclesBff.ts`                                                | server/utils                      | P               | S (registry)                        |   150 |
| `FE/OSK-Manager-FE/server/utils/vehicles/vehiclesMockBff.ts`                                            | server/utils                      | P               | S (registry)                        |   163 |
| `FE/OSK-Manager-FE/shared/contracts/courses.ts`                                                         | shared/contracts                  | P               | W                                   |     9 |
| `FE/OSK-Manager-FE/shared/utils/advancedFilters.ts`                                                     | shared/utils                      | H A @01d4eb6    | W                                   |    12 |
| `FE/OSK-Manager-FE/shared/utils/instructorAdvancedFilters.test.ts`                                      | shared/utils                      | H A @2b80645    | W                                   |   145 |
| `FE/OSK-Manager-FE/shared/utils/instructorAdvancedFilters.ts`                                           | shared/utils                      | H A @2b80645    | W                                   |   408 |
| `FE/OSK-Manager-FE/shared/utils/studentAdvancedFilters.ts`                                              | shared/utils                      | H A @01d4eb6    | W                                   |   803 |
| `FE/OSK-Manager-FE/shared/utils/studentListFilters.ts`                                                  | shared/utils                      | H A @b29aaec    | W                                   |    12 |
| `FE/OSK-Manager-FE/skills-lock.json`                                                                    | config                            | P               | W                                   |    10 |
| `FE/OSK-Manager-FE/tailwind.config.ts`                                                                  | config                            | H M @c684ffa    | W                                   |    17 |
| `FE/OSK-Manager-FE/tsconfig.json`                                                                       | config                            | P               | W                                   |    18 |
| `FE/OSK-Manager-FE/vitest.config.ts`                                                                    | config                            | H M @5e7362b    | S (koordynator)                     |    19 |
| `BE/.dockerignore`                                                                                      | config                            | P               | W                                   |    11 |
| `BE/.editorconfig`                                                                                      | config                            | P               | W                                   |    11 |
| `BE/.env.example`                                                                                       | config                            | H M @880013f    | W                                   |    41 |
| `BE/.gitattributes`                                                                                     | config                            | P               | W                                   |    11 |
| `BE/.github/workflows/ci.yml`                                                                           | .github/workflows                 | H M @d6b423f    | S (koordynator)                     |    56 |
| `BE/.github/workflows/docker-image.yml`                                                                 | .github/workflows                 | P               | W                                   |    44 |
| `BE/.github/workflows/trigger-homelab-deploy.yml`                                                       | .github/workflows                 | P               | W                                   |    24 |
| `BE/.gitignore`                                                                                         | config                            | H M @d6b423f    | W                                   |    27 |
| `BE/.prettierrc`                                                                                        | config                            | P               | W                                   |     7 |
| `BE/Dockerfile`                                                                                         | config                            | P               | S (koordynator)                     |    33 |
| `BE/eslint.config.mjs`                                                                                  | config                            | P               | S (koordynator)                     |    34 |
| `BE/package.json`                                                                                       | config                            | H M @d6b423f    | S (koordynator, schedule)           |    65 |
| `BE/prisma.config.ts`                                                                                   | config                            | P               | W                                   |    12 |
| `BE/prisma/_diff_full.sql`                                                                              | prisma/\_diff_full.sql            | P               | W                                   |   475 |
| `BE/prisma/migrations/20260322145814_init/migration.sql`                                                | prisma/migrations                 | P               | W                                   |    16 |
| `BE/prisma/migrations/20260322154054_init_models/migration.sql`                                         | prisma/migrations                 | P               | W                                   |   449 |
| `BE/prisma/migrations/20260403055606_add_default_osk_to_user/migration.sql`                             | prisma/migrations                 | P               | W                                   |    21 |
| `BE/prisma/migrations/20260403120000_add_driving_school_soft_delete/migration.sql`                      | prisma/migrations                 | P               | W                                   |     2 |
| `BE/prisma/migrations/20260403190356_add_driving_school_deleted_at/migration.sql`                       | prisma/migrations                 | P               | W                                   |     3 |
| `BE/prisma/migrations/20260404120000_vehicle_name_registration_dates/migration.sql`                     | prisma/migrations                 | P               | W                                   |    33 |
| `BE/prisma/migrations/20260406120000_vehicle_is_active/migration.sql`                                   | prisma/migrations                 | P               | W                                   |     2 |
| `BE/prisma/migrations/20260406130000_driving_school_default_vehicle/migration.sql`                      | prisma/migrations                 | P               | W                                   |     5 |
| `BE/prisma/migrations/20260407093151_user_profile_updated_at/migration.sql`                             | prisma/migrations                 | P               | W                                   |    15 |
| `BE/prisma/migrations/20260407120000_vehicle_photo_details/migration.sql`                               | prisma/migrations                 | P               | W                                   |     5 |
| `BE/prisma/migrations/20260408120000_instructor_qualifications/migration.sql`                           | prisma/migrations                 | P               | W                                   |     2 |
| `BE/prisma/migrations/20260408175910_school_settings_enabled_course_kinds/migration.sql`                | prisma/migrations                 | P               | W                                   |    46 |
| `BE/prisma/migrations/20260408180000_course_option_a/migration.sql`                                     | prisma/migrations                 | P               | W                                   |    65 |
| `BE/prisma/migrations/20260408200000_course_theory_dates/migration.sql`                                 | prisma/migrations                 | P               | W                                   |     3 |
| `BE/prisma/migrations/20260408210000_school_settings_offered_course_types/migration.sql`                | prisma/migrations                 | P               | W                                   |    42 |
| `BE/prisma/migrations/20260408210100_rename_offered_course_types_junction/migration.sql`                | prisma/migrations                 | P               | W                                   |    27 |
| `BE/prisma/migrations/20260410120000_student_profile_pkk_number/migration.sql`                          | prisma/migrations                 | P               | W                                   |     5 |
| `BE/prisma/migrations/20260410131500_add_course_participant_status/migration.sql`                       | prisma/migrations                 | P               | W                                   |     2 |
| `BE/prisma/migrations/20260410140000_add_course_participant_status_enum/migration.sql`                  | prisma/migrations                 | P               | W                                   |     7 |
| `BE/prisma/migrations/20260410160000_add_student_notes/migration.sql`                                   | prisma/migrations                 | P               | W                                   |     2 |
| `BE/prisma/migrations/20260410180000_add_availability_unique_and_timeblock_enum/migration.sql`          | prisma/migrations                 | P               | W                                   |    10 |
| `BE/prisma/migrations/20260411120000_add_instructor_events/migration.sql`                               | prisma/migrations                 | P               | W                                   |    39 |
| `BE/prisma/migrations/20260411140000_add_event_participants/migration.sql`                              | prisma/migrations                 | P               | W                                   |    31 |
| `BE/prisma/migrations/20260413000000_add_instructor_event_is_active/migration.sql`                      | prisma/migrations                 | P               | W                                   |     2 |
| `BE/prisma/migrations/20260413120000_instructor_event_course_id/migration.sql`                          | prisma/migrations                 | P               | W                                   |     8 |
| `BE/prisma/migrations/20260423135324_add_event_status/migration.sql`                                    | prisma/migrations                 | P               | W                                   |     5 |
| `BE/prisma/migrations/20260612120000_add_vehicle_availability_status/migration.sql`                     | prisma/migrations                 | P               | W                                   |     4 |
| `BE/prisma/migrations/20260612130000_add_instructor_qualified_course_types/migration.sql`               | prisma/migrations                 | P               | W                                   |    16 |
| `BE/prisma/migrations/20260612143000_add_course_course_type/migration.sql`                              | prisma/migrations                 | P               | W                                   |    28 |
| `BE/prisma/migrations/20260617120000_add_lesson_rating_lookup_indexes/migration.sql`                    | prisma/migrations                 | P               | W                                   |     5 |
| `BE/prisma/migrations/20260703164500_add_vehicle_unavailable_until/migration.sql`                       | prisma/migrations                 | P               | W                                   |     2 |
| `BE/prisma/migrations/20260911120000_single_school_memberships_and_event_school/migration.sql`          | prisma/migrations                 | H A @7a90143    | W                                   |    60 |
| `BE/prisma/migrations/20260925120000_schedule_availability_lookup_indexes/migration.sql`                | prisma/migrations                 | H A @d6b423f    | W                                   |     5 |
| `BE/prisma/migrations/20261005120000_add_instructor_birth_date/migration.sql`                           | prisma/migrations                 | H A @880013f    | W                                   |     1 |
| `BE/prisma/migrations/migration_lock.toml`                                                              | prisma/migrations                 | P               | W                                   |     3 |
| `BE/prisma/schema.prisma`                                                                               | prisma/schema.prisma              | H M @880013f    | W                                   |   498 |
| `BE/scripts/audit-schedule-times.mjs`                                                                   | scripts/audit-schedule-times.mjs  | H A @d6b423f    | S (koordynator)                     |    72 |
| `BE/scripts/run-integration-tests.mjs`                                                                  | scripts/run-integration-tests.mjs | H A @d6b423f    | S (koordynator)                     |    35 |
| `BE/src/__tests__/controllers/auth-me.test.ts`                                                          | src/**tests**                     | P               | W                                   |    70 |
| `BE/src/__tests__/controllers/auth-register-persistence.test.ts`                                        | src/**tests**                     | H A @880013f    | S (auth)                            |    93 |
| `BE/src/__tests__/controllers/auth-register-profiles.test.ts`                                           | src/**tests**                     | H A @880013f    | S (auth)                            |   103 |
| `BE/src/__tests__/controllers/auth-register.test.ts`                                                    | src/**tests**                     | H A @880013f    | S (auth)                            |   105 |
| `BE/src/__tests__/integration/scheduleHardening.integration.test.ts`                                    | src/**tests**                     | H A @d6b423f    | W                                   |   852 |
| `BE/src/__tests__/integration/scheduleHttpBoundary.integration.test.ts`                                 | src/**tests**                     | H A @d6b423f    | W                                   |   118 |
| `BE/src/__tests__/integration/setup.ts`                                                                 | src/**tests**                     | H A @d6b423f    | S (koordynator)                     |    10 |
| `BE/src/__tests__/integration/vehicleAvailability.integration.test.ts`                                  | src/**tests**                     | H A @d6b423f    | W                                   |   289 |
| `BE/src/__tests__/lib/instructorAdminPatch.test.ts`                                                     | src/**tests**                     | P               | W                                   |   139 |
| `BE/src/__tests__/lib/instructorBirthDate.test.ts`                                                      | src/**tests**                     | H A @880013f    | W                                   |    47 |
| `BE/src/__tests__/lib/instructorCourseQualification.test.ts`                                            | src/**tests**                     | P               | W                                   |    93 |
| `BE/src/__tests__/lib/instructorDefaultWorkingHours.test.ts`                                            | src/**tests**                     | P               | W                                   |    94 |
| `BE/src/__tests__/lib/logger.test.ts`                                                                   | src/**tests**                     | P               | W                                   |    35 |
| `BE/src/__tests__/lib/polishScheduleTime.test.ts`                                                       | src/**tests**                     | H A @d6b423f    | W                                   |    98 |
| `BE/src/__tests__/lib/registerRolePolicy.test.ts`                                                       | src/**tests**                     | P               | W                                   |    39 |
| `BE/src/__tests__/lib/supabaseSignUpErrors.test.ts`                                                     | src/**tests**                     | P               | W                                   |    81 |
| `BE/src/__tests__/lib/supabaseStorage.test.ts`                                                          | src/**tests**                     | P               | W                                   |    56 |
| `BE/src/__tests__/lib/uuid.test.ts`                                                                     | src/**tests**                     | P               | W                                   |   102 |
| `BE/src/__tests__/middleware/auth.middleware.test.ts`                                                   | src/**tests**                     | H A @d6b423f    | W                                   |    90 |
| `BE/src/__tests__/middleware/requestId.middleware.test.ts`                                              | src/**tests**                     | P               | W                                   |    61 |
| `BE/src/__tests__/routes/dev-routes.test.ts`                                                            | src/**tests**                     | H M @d6b423f    | W                                   |    54 |
| `BE/src/__tests__/routes/endpoint-baseline.test.ts`                                                     | src/**tests**                     | P               | S (koordynator)                     |   114 |
| `BE/src/__tests__/schemas/dev-reset-and-seed.test.ts`                                                   | src/**tests**                     | H A @d6b423f    | W                                   |    46 |
| `BE/src/__tests__/schemas/schedule-availability.test.ts`                                                | src/**tests**                     | H A @d6b423f    | W                                   |   141 |
| `BE/src/__tests__/schemas/vehicle-status.test.ts`                                                       | src/**tests**                     | P               | W                                   |    64 |
| `BE/src/__tests__/services/course-management.test.ts`                                                   | src/**tests**                     | P               | S (registry)                        |   251 |
| `BE/src/__tests__/services/dev-reset-seed-config.test.ts`                                               | src/**tests**                     | H A @d6b423f    | W                                   |   129 |
| `BE/src/__tests__/services/dev-reset-seed-date-helpers.test.ts`                                         | src/**tests**                     | H A @d6b423f    | W                                   |    68 |
| `BE/src/__tests__/services/dev-reset-seed-plan.test.ts`                                                 | src/**tests**                     | H A @d6b423f    | W                                   |    74 |
| `BE/src/__tests__/services/dev-reset-seed-schedule-integrity.test.ts`                                   | src/**tests**                     | H A @d6b423f    | W                                   |   116 |
| `BE/src/__tests__/services/dev-reset-seed-schedule-planner.test.ts`                                     | src/**tests**                     | H A @d6b423f    | W                                   |   137 |
| `BE/src/__tests__/services/event-schedule-conflicts.test.ts`                                            | src/**tests**                     | H M @d6b423f    | S (schedule)                        |   148 |
| `BE/src/__tests__/services/instructor-qualified-course-types.test.ts`                                   | src/**tests**                     | P               | S (registry)                        |   191 |
| `BE/src/__tests__/services/lesson-cancellation.test.ts`                                                 | src/**tests**                     | H M @8355662    | W                                   |   224 |
| `BE/src/__tests__/services/lesson-detail-course-instructor.test.ts`                                     | src/**tests**                     | H A @9b7b6c0    | W                                   |    82 |
| `BE/src/__tests__/services/lesson-editability.test.ts`                                                  | src/**tests**                     | H A @9b7b6c0    | W                                   |    30 |
| `BE/src/__tests__/services/lesson-rating-date-filters.test.ts`                                          | src/**tests**                     | H A @9e91c0c    | S (auth)                            |    18 |
| `BE/src/__tests__/services/lesson-rating.test.ts`                                                       | src/**tests**                     | H M @9e91c0c    | W                                   |   695 |
| `BE/src/__tests__/services/lesson-school-working-days.test.ts`                                          | src/**tests**                     | H A @9b7b6c0    | W                                   |    47 |
| `BE/src/__tests__/services/lesson-self-booking.test.ts`                                                 | src/**tests**                     | H M @9b7b6c0    | W                                   |   315 |
| `BE/src/__tests__/services/manager-attention.test.ts`                                                   | src/**tests**                     | P               | S (auth)                            |   290 |
| `BE/src/__tests__/services/me-courses.test.ts`                                                          | src/**tests**                     | P               | W                                   |   285 |
| `BE/src/__tests__/services/schedule-availability-check.test.ts`                                         | src/**tests**                     | H A @9b7b6c0    | W                                   |   520 |
| `BE/src/__tests__/services/schedule-availability-options.test.ts`                                       | src/**tests**                     | H A @d6b423f    | W                                   |    44 |
| `BE/src/__tests__/services/schedule-duration-policy.test.ts`                                            | src/**tests**                     | H A @d6b423f    | W                                   |   154 |
| `BE/src/__tests__/services/schedule-write-transaction.test.ts`                                          | src/**tests**                     | H A @d6b423f    | W                                   |    70 |
| `BE/src/__tests__/services/schedule.test.ts`                                                            | src/**tests**                     | H M @e01c997    | W                                   |   282 |
| `BE/src/__tests__/services/student-payments.test.ts`                                                    | src/**tests**                     | P               | S (auth)                            |   323 |
| `BE/src/__tests__/services/student-process-status.test.ts`                                              | src/**tests**                     | H M @7a90143    | W                                   |   235 |
| `BE/src/__tests__/services/students-list.test.ts`                                                       | src/**tests**                     | H A @e3bc200    | W                                   |   297 |
| `BE/src/__tests__/services/vehicle-availability-refresh.test.ts`                                        | src/**tests**                     | P               | S (registry)                        |   172 |
| `BE/src/__tests__/services/vehicle-status.test.ts`                                                      | src/**tests**                     | P               | W                                   |   195 |
| `BE/src/__tests__/swagger/openapi-contracts.test.ts`                                                    | src/**tests**                     | H M @880013f    | W                                   |   110 |
| `BE/src/__tests__/swagger/openapi-route-coverage.test.ts`                                               | src/**tests**                     | P               | S (koordynator)                     |    69 |
| `BE/src/__tests__/swagger/openapiSpec.test.ts`                                                          | src/**tests**                     | H M @d6b423f    | W                                   |   134 |
| `BE/src/app.ts`                                                                                         | src/app.ts                        | H A @d6b423f    | S (koordynator)                     |    76 |
| `BE/src/controllers/auth.controller.ts`                                                                 | src/controllers                   | P               | W                                   |     3 |
| `BE/src/controllers/auth/cookies.ts`                                                                    | src/controllers                   | P               | S (auth)                            |    22 |
| `BE/src/controllers/auth/implementation.ts`                                                             | src/controllers                   | P               | W                                   |     4 |
| `BE/src/controllers/auth/me.handlers.ts`                                                                | src/controllers                   | P               | S (auth)                            |    56 |
| `BE/src/controllers/auth/profile.handlers.ts`                                                           | src/controllers                   | P               | S (auth)                            |    62 |
| `BE/src/controllers/auth/profile.ts`                                                                    | src/controllers                   | P               | W                                   |     6 |
| `BE/src/controllers/auth/register.handler.ts`                                                           | src/controllers                   | H M @880013f    | S (auth)                            |   147 |
| `BE/src/controllers/auth/register.helpers.ts`                                                           | src/controllers                   | H M @880013f    | S (auth)                            |   205 |
| `BE/src/controllers/auth/register.persistence.ts`                                                       | src/controllers                   | U; H M @880013f | S (auth)                            |   182 |
| `BE/src/controllers/auth/register.school.ts`                                                            | src/controllers                   | H M @7a90143    | S (auth)                            |   150 |
| `BE/src/controllers/auth/register.ts`                                                                   | src/controllers                   | P               | W                                   |     1 |
| `BE/src/controllers/auth/session.handlers.ts`                                                           | src/controllers                   | P               | S (auth)                            |   158 |
| `BE/src/controllers/auth/session.ts`                                                                    | src/controllers                   | P               | W                                   |     1 |
| `BE/src/controllers/auth/types.ts`                                                                      | src/controllers                   | H M @880013f    | W                                   |    24 |
| `BE/src/controllers/course-types.controller.ts`                                                         | src/controllers                   | P               | W                                   |    17 |
| `BE/src/controllers/courses.controller.ts`                                                              | src/controllers                   | P               | S (registry)                        |    58 |
| `BE/src/controllers/driving-schools.controller.ts`                                                      | src/controllers                   | P               | W                                   |     1 |
| `BE/src/controllers/driving-schools/implementation.ts`                                                  | src/controllers                   | P               | S (registry)                        |   139 |
| `BE/src/controllers/event.controller.ts`                                                                | src/controllers                   | H M @d6b423f    | S (schedule)                        |   178 |
| `BE/src/controllers/instructor-availability.controller.ts`                                              | src/controllers                   | P               | S (schedule)                        |   178 |
| `BE/src/controllers/instructors.controller.ts`                                                          | src/controllers                   | H M @7a90143    | S (registry)                        |   115 |
| `BE/src/controllers/lesson-rating.controller.ts`                                                        | src/controllers                   | H M @a7c3590    | W                                   |    65 |
| `BE/src/controllers/lesson.controller.ts`                                                               | src/controllers                   | P               | S (schedule)                        |   114 |
| `BE/src/controllers/manager-attention.controller.ts`                                                    | src/controllers                   | P               | W                                   |    25 |
| `BE/src/controllers/me.controller.ts`                                                                   | src/controllers                   | P               | S (registry)                        |    22 |
| `BE/src/controllers/requestParsing.ts`                                                                  | src/controllers                   | P               | S (koordynator)                     |    33 |
| `BE/src/controllers/schedule.controller.ts`                                                             | src/controllers                   | H M @d6b423f    | S (schedule)                        |    69 |
| `BE/src/controllers/students.controller.ts`                                                             | src/controllers                   | P               | W                                   |     1 |
| `BE/src/controllers/students/course.handlers.ts`                                                        | src/controllers                   | P               | S (registry)                        |    65 |
| `BE/src/controllers/students/implementation.ts`                                                         | src/controllers                   | P               | W                                   |    22 |
| `BE/src/controllers/students/payment.handlers.ts`                                                       | src/controllers                   | P               | S (auth)                            |   143 |
| `BE/src/controllers/students/profile.handlers.ts`                                                       | src/controllers                   | P               | S (registry)                        |    72 |
| `BE/src/controllers/students/read.handlers.ts`                                                          | src/controllers                   | H M @7a90143    | S (registry)                        |    95 |
| `BE/src/controllers/vehicles.controller.ts`                                                             | src/controllers                   | P               | S (registry)                        |   129 |
| `BE/src/lib/apiResponse.ts`                                                                             | src/lib                           | P               | W                                   |    33 |
| `BE/src/lib/http/AppError.ts`                                                                           | src/lib                           | P               | S (koordynator, registry, schedule) |    41 |
| `BE/src/lib/http/asyncHandler.ts`                                                                       | src/lib                           | P               | W                                   |    13 |
| `BE/src/lib/http/errorMiddleware.ts`                                                                    | src/lib                           | P               | S (koordynator)                     |    34 |
| `BE/src/lib/http/requireUser.ts`                                                                        | src/lib                           | P               | W                                   |     9 |
| `BE/src/lib/instructor-event-date-filter.ts`                                                            | src/lib                           | P               | W                                   |    15 |
| `BE/src/lib/instructorCourseQualification.ts`                                                           | src/lib                           | P               | W                                   |    86 |
| `BE/src/lib/instructorDefaultWorkingHours.ts`                                                           | src/lib                           | P               | W                                   |    69 |
| `BE/src/lib/instructorSchoolRegistration.ts`                                                            | src/lib                           | H M @7a90143    | W                                   |   121 |
| `BE/src/lib/lesson-scheduling.ts`                                                                       | src/lib                           | Z; P            | S (registry, schedule)              |   122 |
| `BE/src/lib/logger.ts`                                                                                  | src/lib                           | P               | S (koordynator)                     |    83 |
| `BE/src/lib/polishScheduleTime.ts`                                                                      | src/lib                           | H A @d6b423f    | S (registry, schedule)              |   100 |
| `BE/src/lib/prisma.ts`                                                                                  | src/lib                           | P               | W                                   |    31 |
| `BE/src/lib/registerRolePolicy.ts`                                                                      | src/lib                           | P               | S (auth)                            |    30 |
| `BE/src/lib/studentSchoolRegistration.ts`                                                               | src/lib                           | P               | W                                   |    95 |
| `BE/src/lib/supabase.ts`                                                                                | src/lib                           | P               | S (auth)                            |    14 |
| `BE/src/lib/supabaseAdmin.ts`                                                                           | src/lib                           | P               | W                                   |    14 |
| `BE/src/lib/supabaseSignUpErrors.ts`                                                                    | src/lib                           | P               | W                                   |    49 |
| `BE/src/lib/supabaseStorage.ts`                                                                         | src/lib                           | P               | W                                   |   101 |
| `BE/src/lib/validation/instructorAdminPatch.ts`                                                         | src/lib                           | P               | S (registry)                        |    36 |
| `BE/src/lib/validation/instructorBirthDate.ts`                                                          | src/lib                           | U; H A @880013f | S (auth)                            |    35 |
| `BE/src/lib/validation/studentSchemas.ts`                                                               | src/lib                           | H M @7a90143    | S (registry)                        |   422 |
| `BE/src/lib/validation/uuid.ts`                                                                         | src/lib                           | P               | S (registry, schedule)              |     3 |
| `BE/src/lib/validation/uuidCore.ts`                                                                     | src/lib                           | P               | S (registry, schedule)              |    54 |
| `BE/src/lib/validation/uuidParams.ts`                                                                   | src/lib                           | P               | S (registry)                        |    47 |
| `BE/src/lib/vehicle.helpers.ts`                                                                         | src/lib                           | H M @d6b423f    | W                                   |    63 |
| `BE/src/middleware/auth.middleware.ts`                                                                  | src/middleware                    | H M @d6b423f    | S (auth)                            |   123 |
| `BE/src/middleware/requestId.middleware.ts`                                                             | src/middleware                    | P               | S (koordynator)                     |    30 |
| `BE/src/routes/auth.routes.ts`                                                                          | src/routes                        | P               | S (auth)                            |    56 |
| `BE/src/routes/course-types.routes.ts`                                                                  | src/routes                        | P               | W                                   |    19 |
| `BE/src/routes/courses.routes.ts`                                                                       | src/routes                        | P               | S (registry)                        |    45 |
| `BE/src/routes/dev.routes.ts`                                                                           | src/routes                        | H M @d6b423f    | S (koordynator)                     |    59 |
| `BE/src/routes/driving-schools.routes.ts`                                                               | src/routes                        | P               | S (registry)                        |    68 |
| `BE/src/routes/events.routes.ts`                                                                        | src/routes                        | H M @d6b423f    | S (schedule)                        |   109 |
| `BE/src/routes/instructor-availability.routes.ts`                                                       | src/routes                        | P               | S (schedule)                        |    77 |
| `BE/src/routes/instructors.routes.ts`                                                                   | src/routes                        | H M @7a90143    | S (registry)                        |    68 |
| `BE/src/routes/lesson-ratings.routes.ts`                                                                | src/routes                        | P               | W                                   |    33 |
| `BE/src/routes/lessons.routes.ts`                                                                       | src/routes                        | P               | S (schedule)                        |    73 |
| `BE/src/routes/manager-attention.routes.ts`                                                             | src/routes                        | P               | W                                   |    19 |
| `BE/src/routes/me.routes.ts`                                                                            | src/routes                        | P               | S (registry)                        |    15 |
| `BE/src/routes/schedule.routes.ts`                                                                      | src/routes                        | H M @d6b423f    | S (schedule)                        |    39 |
| `BE/src/routes/students.routes.ts`                                                                      | src/routes                        | P               | S (registry)                        |   125 |
| `BE/src/routes/vehicles.routes.ts`                                                                      | src/routes                        | P               | S (registry)                        |    84 |
| `BE/src/schemas/course.schemas.ts`                                                                      | src/schemas                       | P               | S (registry)                        |   122 |
| `BE/src/schemas/dev.schemas.ts`                                                                         | src/schemas                       | H A @d6b423f    | W                                   |    21 |
| `BE/src/schemas/driving-school.schemas.ts`                                                              | src/schemas                       | P               | W                                   |     3 |
| `BE/src/schemas/drivingSchoolAction.schemas.ts`                                                         | src/schemas                       | P               | S (registry)                        |    24 |
| `BE/src/schemas/drivingSchoolCourseFields.schemas.ts`                                                   | src/schemas                       | P               | S (registry)                        |    19 |
| `BE/src/schemas/drivingSchoolWrite.schemas.ts`                                                          | src/schemas                       | P               | S (registry)                        |   182 |
| `BE/src/schemas/event.schemas.ts`                                                                       | src/schemas                       | P               | S (schedule)                        |     3 |
| `BE/src/schemas/eventParticipants.schemas.ts`                                                           | src/schemas                       | H M @d6b423f    | S (schedule)                        |    85 |
| `BE/src/schemas/eventQueries.schemas.ts`                                                                | src/schemas                       | P               | S (schedule)                        |    88 |
| `BE/src/schemas/eventWrite.schemas.ts`                                                                  | src/schemas                       | P               | S (schedule)                        |   148 |
| `BE/src/schemas/instructor-availability.openapi.ts`                                                     | src/schemas                       | P               | W                                   |    13 |
| `BE/src/schemas/instructor-availability.schemas.ts`                                                     | src/schemas                       | P               | S (schedule)                        |   199 |
| `BE/src/schemas/lesson-rating.schemas.ts`                                                               | src/schemas                       | H M @9e91c0c    | W                                   |   107 |
| `BE/src/schemas/lesson.schemas.ts`                                                                      | src/schemas                       | Z; P            | S (schedule)                        |   186 |
| `BE/src/schemas/manager-attention.schemas.ts`                                                           | src/schemas                       | P               | W                                   |    14 |
| `BE/src/schemas/schedule.schemas.ts`                                                                    | src/schemas                       | H M @d6b423f    | S (schedule)                        |   286 |
| `BE/src/schemas/school-availability.schemas.ts`                                                         | src/schemas                       | P               | W                                   |   178 |
| `BE/src/schemas/vehicle.schemas.ts`                                                                     | src/schemas                       | P               | W                                   |     2 |
| `BE/src/schemas/vehicleRead.schemas.ts`                                                                 | src/schemas                       | P               | S (registry)                        |    81 |
| `BE/src/schemas/vehicleWrite.schemas.ts`                                                                | src/schemas                       | P               | S (registry)                        |   198 |
| `BE/src/server.ts`                                                                                      | src/server.ts                     | H M @d6b423f    | W                                   |    16 |
| `BE/src/services/course.service.ts`                                                                     | src/services                      | P               | W                                   |    12 |
| `BE/src/services/course/access.ts`                                                                      | src/services                      | P               | S (registry)                        |    17 |
| `BE/src/services/course/commands.ts`                                                                    | src/services                      | P               | S (registry)                        |   195 |
| `BE/src/services/course/implementation.ts`                                                              | src/services                      | P               | W                                   |    14 |
| `BE/src/services/course/mappers.ts`                                                                     | src/services                      | P               | S (registry)                        |    30 |
| `BE/src/services/course/progress.ts`                                                                    | src/services                      | P               | S (registry)                        |    57 |
| `BE/src/services/course/queries.ts`                                                                     | src/services                      | H M @6700373    | S (registry)                        |   201 |
| `BE/src/services/course/types.ts`                                                                       | src/services                      | H M @6700373    | W                                   |    88 |
| `BE/src/services/devResetSeed.service.ts`                                                               | src/services                      | H M @d6b423f    | S (koordynator)                     |    99 |
| `BE/src/services/devResetSeed/authUsers.ts`                                                             | src/services                      | H M @d6b423f    | W                                   |   148 |
| `BE/src/services/devResetSeed/config.ts`                                                                | src/services                      | H A @d6b423f    | W                                   |   176 |
| `BE/src/services/devResetSeed/constants.ts`                                                             | src/services                      | P               | W                                   |    92 |
| `BE/src/services/devResetSeed/database.ts`                                                              | src/services                      | H M @d6b423f    | W                                   |    33 |
| `BE/src/services/devResetSeed/dateHelpers.ts`                                                           | src/services                      | H M @d6b423f    | W                                   |    81 |
| `BE/src/services/devResetSeed/operationalData.ts`                                                       | src/services                      | H M @d6b423f    | W                                   |   620 |
| `BE/src/services/devResetSeed/referenceData.ts`                                                         | src/services                      | H M @d6b423f    | W                                   |   249 |
| `BE/src/services/devResetSeed/scheduleIntegrity.ts`                                                     | src/services                      | H A @d6b423f    | W                                   |   113 |
| `BE/src/services/devResetSeed/schedulePlanner.ts`                                                       | src/services                      | H A @d6b423f    | W                                   |   184 |
| `BE/src/services/devResetSeed/seedPlan.ts`                                                              | src/services                      | H A @d6b423f    | W                                   |    44 |
| `BE/src/services/devResetSeed/types.ts`                                                                 | src/services                      | H M @d6b423f    | W                                   |    40 |
| `BE/src/services/devResetSeed/users.ts`                                                                 | src/services                      | H M @d6b423f    | W                                   |   117 |
| `BE/src/services/driving-school/access.ts`                                                              | src/services                      | P               | W                                   |    23 |
| `BE/src/services/driving-school/commands.ts`                                                            | src/services                      | P               | S (registry)                        |   211 |
| `BE/src/services/driving-school/management.ts`                                                          | src/services                      | P               | S (registry)                        |    11 |
| `BE/src/services/driving-school/queries.ts`                                                             | src/services                      | P               | W                                   |   106 |
| `BE/src/services/driving-school/settingsCommands.ts`                                                    | src/services                      | P               | S (registry)                        |    99 |
| `BE/src/services/driving-school/shared.ts`                                                              | src/services                      | P               | W                                   |    26 |
| `BE/src/services/event.service.ts`                                                                      | src/services                      | H M @d6b423f    | W                                   |    32 |
| `BE/src/services/event/bulkStatus.ts`                                                                   | src/services                      | P               | S (registry, schedule)              |    70 |
| `BE/src/services/event/conflicts.ts`                                                                    | src/services                      | H M @d6b423f    | S (registry, schedule)              |    85 |
| `BE/src/services/event/courseEligibility.ts`                                                            | src/services                      | P               | S (schedule)                        |    31 |
| `BE/src/services/event/deleteEvent.ts`                                                                  | src/services                      | P               | S (registry, schedule)              |    30 |
| `BE/src/services/event/detailReadModel.ts`                                                              | src/services                      | H M @7a90143    | W                                   |   119 |
| `BE/src/services/event/eligibility.ts`                                                                  | src/services                      | H M @6700373    | W                                   |   145 |
| `BE/src/services/event/listReadModel.ts`                                                                | src/services                      | H M @7a90143    | W                                   |   143 |
| `BE/src/services/event/mappers.ts`                                                                      | src/services                      | H M @d6b423f    | W                                   |   103 |
| `BE/src/services/event/participantQueries.ts`                                                           | src/services                      | P               | S (schedule)                        |    39 |
| `BE/src/services/event/participantValidation.ts`                                                        | src/services                      | P               | S (schedule)                        |    97 |
| `BE/src/services/event/participantWriteHelpers.ts`                                                      | src/services                      | H M @d6b423f    | S (schedule)                        |   231 |
| `BE/src/services/event/participants.ts`                                                                 | src/services                      | H M @d6b423f    | S (schedule)                        |   203 |
| `BE/src/services/event/readModel.ts`                                                                    | src/services                      | P               | W                                   |     2 |
| `BE/src/services/event/readModelDate.ts`                                                                | src/services                      | P               | W                                   |    32 |
| `BE/src/services/event/writeConflicts.ts`                                                               | src/services                      | H M @d6b423f    | S (schedule)                        |   149 |
| `BE/src/services/event/writeModel.ts`                                                                   | src/services                      | H M @d6b423f    | S (schedule)                        |   317 |
| `BE/src/services/event/writeModelMappers.ts`                                                            | src/services                      | H M @7a90143    | W                                   |    47 |
| `BE/src/services/instructor-availability.service.ts`                                                    | src/services                      | P               | W                                   |    22 |
| `BE/src/services/instructor-availability/access.ts`                                                     | src/services                      | P               | S (schedule)                        |    39 |
| `BE/src/services/instructor-availability/exceptions.ts`                                                 | src/services                      | P               | S (schedule)                        |   136 |
| `BE/src/services/instructor-availability/implementation.ts`                                             | src/services                      | P               | W                                   |    25 |
| `BE/src/services/instructor-availability/slots.ts`                                                      | src/services                      | P               | S (registry, schedule)              |    67 |
| `BE/src/services/instructor-availability/time.ts`                                                       | src/services                      | H M @d6b423f    | S (registry, schedule)              |   116 |
| `BE/src/services/instructor-availability/types.ts`                                                      | src/services                      | P               | W                                   |    32 |
| `BE/src/services/instructor-availability/weekly.ts`                                                     | src/services                      | P               | S (schedule)                        |    80 |
| `BE/src/services/instructor-availability/windows.ts`                                                    | src/services                      | U; H M @d6b423f | S (registry, schedule)              |   224 |
| `BE/src/services/instructor.service.ts`                                                                 | src/services                      | P               | W                                   |    13 |
| `BE/src/services/instructor/access.ts`                                                                  | src/services                      | P               | W                                   |    37 |
| `BE/src/services/instructor/commandHelpers.ts`                                                          | src/services                      | Z; P            | S (registry)                        |   136 |
| `BE/src/services/instructor/commands.ts`                                                                | src/services                      | Z; H M @7a90143 | S (auth, registry)                  |   322 |
| `BE/src/services/instructor/implementation.ts`                                                          | src/services                      | P               | W                                   |    17 |
| `BE/src/services/instructor/mappers.ts`                                                                 | src/services                      | P               | S (auth, registry)                  |    16 |
| `BE/src/services/instructor/queries.ts`                                                                 | src/services                      | H M @7a90143    | S (auth, registry)                  |   163 |
| `BE/src/services/instructor/schoolResolver.ts`                                                          | src/services                      | H A @7a90143    | W                                   |    45 |
| `BE/src/services/instructor/types.ts`                                                                   | src/services                      | H M @7a90143    | W                                   |    52 |
| `BE/src/services/lesson-rating.service.ts`                                                              | src/services                      | P               | W                                   |    13 |
| `BE/src/services/lesson-rating/access.ts`                                                               | src/services                      | P               | S (auth)                            |    54 |
| `BE/src/services/lesson-rating/dateFilters.ts`                                                          | src/services                      | H M @9e91c0c    | S (auth)                            |    47 |
| `BE/src/services/lesson-rating/implementation.ts`                                                       | src/services                      | P               | W                                   |    17 |
| `BE/src/services/lesson-rating/mappers.ts`                                                              | src/services                      | H M @9e91c0c    | S (auth, schedule)                  |    68 |
| `BE/src/services/lesson-rating/queries.ts`                                                              | src/services                      | U; H M @9e91c0c | S (auth, schedule)                  |   352 |
| `BE/src/services/lesson-rating/studentRatings.ts`                                                       | src/services                      | P               | S (auth)                            |   117 |
| `BE/src/services/lesson-rating/types.ts`                                                                | src/services                      | H M @9e91c0c    | W                                   |   121 |
| `BE/src/services/lesson.service.ts`                                                                     | src/services                      | P               | W                                   |    15 |
| `BE/src/services/lesson/bookingAccess.ts`                                                               | src/services                      | P               | S (schedule)                        |   145 |
| `BE/src/services/lesson/bookingRules.ts`                                                                | src/services                      | H M @9b7b6c0    | S (schedule)                        |   217 |
| `BE/src/services/lesson/cancelLessons.ts`                                                               | src/services                      | U; H M @8355662 | S (schedule)                        |   145 |
| `BE/src/services/lesson/dateUtils.ts`                                                                   | src/services                      | H M @d6b423f    | S (schedule)                        |    33 |
| `BE/src/services/lesson/dtoMappers.ts`                                                                  | src/services                      | H M @9b7b6c0    | W                                   |   141 |
| `BE/src/services/lesson/editability.ts`                                                                 | src/services                      | H A @9b7b6c0    | S (schedule)                        |    16 |
| `BE/src/services/lesson/readModel.ts`                                                                   | src/services                      | H M @9b7b6c0    | W                                   |   139 |
| `BE/src/services/lesson/scheduleConflicts.ts`                                                           | src/services                      | H M @d6b423f    | S (registry, schedule)              |    83 |
| `BE/src/services/lesson/vehicleAvailability.ts`                                                         | src/services                      | H M @d6b423f    | S (registry, schedule)              |   137 |
| `BE/src/services/lesson/writeModel.ts`                                                                  | src/services                      | H M @9b7b6c0    | S (schedule)                        |   210 |
| `BE/src/services/manager-attention.service.ts`                                                          | src/services                      | P               | W                                   |     7 |
| `BE/src/services/manager-attention/access.ts`                                                           | src/services                      | P               | S (auth)                            |    24 |
| `BE/src/services/manager-attention/dateUtils.ts`                                                        | src/services                      | P               | S (auth)                            |    35 |
| `BE/src/services/manager-attention/implementation.ts`                                                   | src/services                      | P               | S (auth)                            |    44 |
| `BE/src/services/manager-attention/itemFactory.ts`                                                      | src/services                      | P               | S (auth)                            |    43 |
| `BE/src/services/manager-attention/items.ts`                                                            | src/services                      | Z; P            | S (auth)                            |   371 |
| `BE/src/services/manager-attention/sort.ts`                                                             | src/services                      | P               | S (auth)                            |    58 |
| `BE/src/services/manager-attention/types.ts`                                                            | src/services                      | P               | W                                   |    34 |
| `BE/src/services/meContext.service.ts`                                                                  | src/services                      | P               | S (auth)                            |   123 |
| `BE/src/services/oskContext.ts`                                                                         | src/services                      | P               | W                                   |    72 |
| `BE/src/services/schedule-validation/check.ts`                                                          | src/services                      | U; H A @9b7b6c0 | S (schedule)                        |   713 |
| `BE/src/services/schedule-validation/conflicts.ts`                                                      | src/services                      | H A @d6b423f    | S (schedule)                        |    61 |
| `BE/src/services/schedule-validation/options.ts`                                                        | src/services                      | U; H A @9b7b6c0 | S (schedule)                        |   465 |
| `BE/src/services/schedule-validation/optionsMatrix.ts`                                                  | src/services                      | H A @d6b423f    | S (schedule)                        |    53 |
| `BE/src/services/schedule-validation/policy.ts`                                                         | src/services                      | H A @d6b423f    | S (schedule)                        |   113 |
| `BE/src/services/schedule-validation/transaction.ts`                                                    | src/services                      | H A @d6b423f    | S (schedule)                        |    39 |
| `BE/src/services/schedule-validation/vehicleWindows.ts`                                                 | src/services                      | H A @d6b423f    | S (schedule)                        |   102 |
| `BE/src/services/schedule.service.ts`                                                                   | src/services                      | P               | W                                   |     8 |
| `BE/src/services/schedule/access.ts`                                                                    | src/services                      | P               | W                                   |    24 |
| `BE/src/services/schedule/dateRange.ts`                                                                 | src/services                      | P               | W                                   |    21 |
| `BE/src/services/schedule/implementation.ts`                                                            | src/services                      | P               | S (schedule)                        |     7 |
| `BE/src/services/schedule/includes.ts`                                                                  | src/services                      | H M @d6b423f    | W                                   |    78 |
| `BE/src/services/schedule/mappers.ts`                                                                   | src/services                      | H M @d6b423f    | W                                   |   138 |
| `BE/src/services/schedule/queries.ts`                                                                   | src/services                      | H M @e01c997    | S (schedule)                        |   225 |
| `BE/src/services/schedule/types.ts`                                                                     | src/services                      | H M @d6b423f    | W                                   |   137 |
| `BE/src/services/school-availability.service.ts`                                                        | src/services                      | P               | W                                   |     6 |
| `BE/src/services/school-availability/access.ts`                                                         | src/services                      | P               | S (schedule)                        |    76 |
| `BE/src/services/school-availability/busyLessons.ts`                                                    | src/services                      | Z; P            | S (registry, schedule)              |    44 |
| `BE/src/services/school-availability/dateHelpers.ts`                                                    | src/services                      | P               | S (registry, schedule)              |    50 |
| `BE/src/services/school-availability/implementation.ts`                                                 | src/services                      | P               | S (schedule)                        |     2 |
| `BE/src/services/school-availability/instructors.ts`                                                    | src/services                      | P               | S (schedule)                        |    62 |
| `BE/src/services/school-availability/queries.ts`                                                        | src/services                      | P               | S (registry, schedule)              |   215 |
| `BE/src/services/school-availability/types.ts`                                                          | src/services                      | P               | W                                   |    34 |
| `BE/src/services/students.service.ts`                                                                   | src/services                      | P               | W                                   |    41 |
| `BE/src/services/students/access.ts`                                                                    | src/services                      | P               | S (registry)                        |    92 |
| `BE/src/services/students/courseParticipants.ts`                                                        | src/services                      | Z; P            | S (registry)                        |   163 |
| `BE/src/services/students/detail.ts`                                                                    | src/services                      | H M @7a90143    | S (registry)                        |    83 |
| `BE/src/services/students/events.ts`                                                                    | src/services                      | H M @7a90143    | W                                   |   168 |
| `BE/src/services/students/list.ts`                                                                      | src/services                      | H M @e3bc200    | S (registry)                        |   107 |
| `BE/src/services/students/listFilters.ts`                                                               | src/services                      | H A @ca63f1a    | S (registry)                        |   334 |
| `BE/src/services/students/payments.ts`                                                                  | src/services                      | P               | W                                   |    10 |
| `BE/src/services/students/paymentsAccess.ts`                                                            | src/services                      | P               | S (auth)                            |    93 |
| `BE/src/services/students/paymentsCommands.ts`                                                          | src/services                      | P               | S (auth)                            |   155 |
| `BE/src/services/students/paymentsMappers.ts`                                                           | src/services                      | P               | S (auth)                            |    91 |
| `BE/src/services/students/paymentsQueries.ts`                                                           | src/services                      | P               | S (auth)                            |   132 |
| `BE/src/services/students/processStatus.ts`                                                             | src/services                      | P               | W                                   |    77 |
| `BE/src/services/students/profileMutations.ts`                                                          | src/services                      | Z; P            | S (registry)                        |   167 |
| `BE/src/services/students/schoolResolver.ts`                                                            | src/services                      | H A @7a90143    | W                                   |    28 |
| `BE/src/services/students/types.ts`                                                                     | src/services                      | H M @7a90143    | W                                   |   130 |
| `BE/src/services/students/utils.ts`                                                                     | src/services                      | H M @7a90143    | W                                   |    56 |
| `BE/src/services/userProfile.service.ts`                                                                | src/services                      | P               | S (auth)                            |   212 |
| `BE/src/services/vehicle.service.ts`                                                                    | src/services                      | P               | W                                   |     4 |
| `BE/src/services/vehicle/access.ts`                                                                     | src/services                      | P               | S (registry)                        |    83 |
| `BE/src/services/vehicle/availabilityRefresh.ts`                                                        | src/services                      | P               | S (registry)                        |    86 |
| `BE/src/services/vehicle/commandHelpers.ts`                                                             | src/services                      | P               | S (registry)                        |   108 |
| `BE/src/services/vehicle/commands.ts`                                                                   | src/services                      | P               | S (registry)                        |   187 |
| `BE/src/services/vehicle/implementation.ts`                                                             | src/services                      | P               | W                                   |    20 |
| `BE/src/services/vehicle/mappers.ts`                                                                    | src/services                      | P               | S (registry)                        |    26 |
| `BE/src/services/vehicle/photoUpload.ts`                                                                | src/services                      | P               | S (registry)                        |   106 |
| `BE/src/services/vehicle/queries.ts`                                                                    | src/services                      | Z; P            | S (registry)                        |   119 |
| `BE/src/services/vehicle/types.ts`                                                                      | src/services                      | P               | W                                   |    34 |
| `BE/src/swagger/openapiSpec.ts`                                                                         | src/swagger                       | P               | W                                   |    49 |
| `BE/src/swagger/paths/auth.paths.ts`                                                                    | src/swagger                       | P               | W                                   |   165 |
| `BE/src/swagger/paths/courseTypes.paths.ts`                                                             | src/swagger                       | P               | W                                   |    16 |
| `BE/src/swagger/paths/courses.paths.ts`                                                                 | src/swagger                       | P               | W                                   |    75 |
| `BE/src/swagger/paths/dev.paths.ts`                                                                     | src/swagger                       | H M @d6b423f    | W                                   |    31 |
| `BE/src/swagger/paths/drivingSchools.paths.ts`                                                          | src/swagger                       | P               | W                                   |   139 |
| `BE/src/swagger/paths/events.paths.ts`                                                                  | src/swagger                       | H M @d6b423f    | W                                   |   296 |
| `BE/src/swagger/paths/health.paths.ts`                                                                  | src/swagger                       | P               | W                                   |    48 |
| `BE/src/swagger/paths/implementation.ts`                                                                | src/swagger                       | P               | W                                   |    38 |
| `BE/src/swagger/paths/index.ts`                                                                         | src/swagger                       | P               | W                                   |     1 |
| `BE/src/swagger/paths/instructors.paths.ts`                                                             | src/swagger                       | H M @7a90143    | W                                   |   259 |
| `BE/src/swagger/paths/lessons.paths.ts`                                                                 | src/swagger                       | H M @a7c3590    | W                                   |   236 |
| `BE/src/swagger/paths/managerAttention.paths.ts`                                                        | src/swagger                       | P               | W                                   |    20 |
| `BE/src/swagger/paths/schedule.paths.ts`                                                                | src/swagger                       | H M @d6b423f    | W                                   |    75 |
| `BE/src/swagger/paths/shared.ts`                                                                        | src/swagger                       | H M @880013f    | W                                   |   317 |
| `BE/src/swagger/paths/students.paths.ts`                                                                | src/swagger                       | H M @e3bc200    | W                                   |   291 |
| `BE/src/swagger/paths/vehicles.paths.ts`                                                                | src/swagger                       | P               | W                                   |   136 |
| `BE/src/swagger/registerOpenApiPaths.ts`                                                                | src/swagger                       | P               | S (koordynator)                     |     1 |
| `BE/src/swagger/setupSwagger.ts`                                                                        | src/swagger                       | P               | W                                   |    20 |
| `BE/src/swagger/zodOpenApiInit.ts`                                                                      | src/swagger                       | P               | W                                   |     8 |
| `BE/src/types/express.d.ts`                                                                             | src/types                         | P               | W                                   |    16 |
| `BE/tsconfig.build.json`                                                                                | config                            | P               | W                                   |     4 |
| `BE/tsconfig.json`                                                                                      | config                            | P               | W                                   |    15 |
| `BE/vitest.config.ts`                                                                                   | config                            | H M @d6b423f    | S (koordynator)                     |    13 |
| `BE/vitest.integration.config.ts`                                                                       | config                            | H A @d6b423f    | S (koordynator)                     |    10 |

### Usunięcia w przedziale porównania

Usunięte pliki nie są bieżącym kodem. Poniższa lista zachowuje ślad mapowania (w tym historyczne artefakty); nie zalicza się ich do szczegółowo przejrzanych implementacji.

- `FE/OSK-Manager-FE/.playwright-cli/page-2026-09-09T05-28-21-422Z.yml`
- `FE/OSK-Manager-FE/.playwright-cli/page-2026-09-09T05-37-21-758Z.yml`
- `FE/OSK-Manager-FE/.playwright-cli/page-2026-09-09T05-42-14-964Z.yml`
- `FE/OSK-Manager-FE/.playwright-cli/page-2026-09-09T05-42-37-386Z.yml`
- `FE/OSK-Manager-FE/.playwright-cli/page-2026-09-09T05-48-41-777Z.yml`
- `FE/OSK-Manager-FE/.playwright-cli/page-2026-09-09T06-00-08-878Z.yml`
- `FE/OSK-Manager-FE/.playwright-cli/page-2026-09-09T06-40-12-895Z.yml`
- `FE/OSK-Manager-FE/.playwright-cli/page-2026-09-09T06-42-18-367Z.yml`
- `FE/OSK-Manager-FE/.playwright-cli/page-2026-09-09T07-34-26-384Z.yml`
- `FE/OSK-Manager-FE/.playwright-cli/page-2026-09-09T07-53-06-793Z.yml`
- `FE/OSK-Manager-FE/.playwright-cli/page-2026-09-09T07-59-48-327Z.yml`
- `FE/OSK-Manager-FE/.playwright-cli/page-2026-09-09T08-03-23-429Z.yml`
- `FE/OSK-Manager-FE/app/components/app/palette-test/PalettePreviewShowcase.vue`
- `FE/OSK-Manager-FE/app/components/manager/courses/ManagerCourseRelatedDataCard.vue`
- `FE/OSK-Manager-FE/app/components/manager/instructors/ManagerInstructorFormDialog.vue`
- `FE/OSK-Manager-FE/app/components/manager/reviews/LessonRatingsTable.vue`
- `FE/OSK-Manager-FE/app/components/manager/schedule/ManagerScheduleHourGutter.vue`
- `FE/OSK-Manager-FE/app/components/manager/schedule/ManagerScheduleWeekToolbar.vue`
- `FE/OSK-Manager-FE/app/components/manager/students/ManagerStudentOverviewCard.vue`
- `FE/OSK-Manager-FE/app/components/student/lesson-booking/StudentLessonBookingSlotList.vue`
- `FE/OSK-Manager-FE/app/components/student/lesson-booking/StudentLessonBookingWeekNav.vue`
- `FE/OSK-Manager-FE/app/components/student/schedule/MyLessonsSummaryPanel.vue`
- `FE/OSK-Manager-FE/app/composables/courses/useMyCoursesPresentation.test.ts`
- `FE/OSK-Manager-FE/app/composables/courses/useMyCoursesPresentation.ts`
- `FE/OSK-Manager-FE/app/composables/instructors/manager/useManagerInstructorFormDialog.test.ts`
- `FE/OSK-Manager-FE/app/composables/instructors/manager/useManagerInstructorFormDialog.ts`
- `FE/OSK-Manager-FE/app/composables/schools/useManagerOskStats.ts`
- `FE/OSK-Manager-FE/app/composables/vehicles/useVehiclesListPanelSummary.test.ts`
- `FE/OSK-Manager-FE/app/composables/vehicles/useVehiclesListPanelSummary.ts`
- `FE/OSK-Manager-FE/app/pages/palette-test.vue`
- `FE/OSK-Manager-FE/docs/UI_REDESIGN_GUIDELINES.md`
- `FE/OSK-Manager-FE/docs/UI_REDESIGN_IMPLEMENTATION_PLAN.md`
- `FE/OSK-Manager-FE/docs/UI_REDESIGN_IMPLEMENTATION_TODO.md`
- `FE/OSK-Manager-FE/docs/UI_REDESIGN_VIEW_BACKLOG.md`
- `FE/OSK-Manager-FE/docs/UI_REDESIGN_VIEW_SPECS.md`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/01-dashboard-desktop.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/01-dashboard-mobile.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/02-account-desktop.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/02-account-mobile.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/03-login-desktop.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/03-login-mobile.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/04-design-system-desktop.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/04-design-system-mobile.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/05-events-index-desktop.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/05-events-index-mobile.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/06-book-lesson-desktop.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/06-book-lesson-mobile.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/07-manager-students-list-desktop.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/07-manager-students-list-mobile.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/08-manager-student-details-desktop.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/08-manager-student-details-mobile.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/09-manager-instructors-list-desktop.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/09-manager-instructors-list-mobile.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/10-manager-instructor-details-desktop.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/10-manager-instructor-details-mobile.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/11-manager-schedule-desktop.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/11-manager-schedule-mobile.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/12-manager-courses-list-desktop.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/12-manager-courses-list-mobile.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/13-manager-course-details-desktop.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/13-manager-course-details-mobile.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/14-manager-course-new-desktop.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/14-manager-course-new-mobile.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/15-vehicles-list-desktop.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/15-vehicles-list-mobile.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/16-vehicle-details-desktop.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/16-vehicle-details-mobile.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/17-vehicle-edit-desktop.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/17-vehicle-edit-mobile.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/18-vehicle-new-desktop.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/18-vehicle-new-mobile.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/19-manager-osk-list-desktop.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/19-manager-osk-list-mobile.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/20-manager-osk-new-redirect-desktop.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/20-manager-osk-new-redirect-mobile.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/21-manager-reviews-desktop.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/21-manager-reviews-mobile.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/22-manager-event-edit-desktop.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/22-manager-event-edit-mobile.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/23-manager-lesson-edit-desktop.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/23-manager-lesson-edit-mobile.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/24-instructor-availability-desktop.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/24-instructor-availability-mobile.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/25-instructor-schedule-desktop.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/25-instructor-schedule-mobile.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/26-instructor-slots-desktop.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/26-instructor-slots-mobile.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/27-manager-instructor-new-redirect-desktop.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/27-manager-instructor-new-redirect-mobile.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/28-my-lessons-desktop.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/28-my-lessons-mobile.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/29-my-courses-desktop.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/29-my-courses-mobile.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/30-my-payments-desktop.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/30-my-payments-mobile.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/31-my-reviews-desktop.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/31-my-reviews-mobile.png`
- `FE/OSK-Manager-FE/docs/ui-redesign-mockups/README.md`
- `FE/OSK-Manager-FE/output/playwright/login-compact-desktop.png`
- `FE/OSK-Manager-FE/output/playwright/login-dark.png`
- `FE/OSK-Manager-FE/output/playwright/login-default-poster-mobile.png`
- `FE/OSK-Manager-FE/output/playwright/login-default-poster.png`
- `FE/OSK-Manager-FE/output/playwright/login-design-poster-mobile.png`
- `FE/OSK-Manager-FE/output/playwright/login-design-poster.png`
- `FE/OSK-Manager-FE/output/playwright/login-desktop.png`
- `FE/OSK-Manager-FE/output/playwright/login-headline-spacing-mobile.png`
- `FE/OSK-Manager-FE/output/playwright/login-headline-spacing.png`
- `FE/OSK-Manager-FE/output/playwright/login-mobile.png`
- `FE/OSK-Manager-FE/output/playwright/login-new-headline-mobile.png`
- `FE/OSK-Manager-FE/output/playwright/login-new-headline.png`
- `FE/OSK-Manager-FE/output/playwright/login-product-story-desktop.png`
- `FE/OSK-Manager-FE/output/playwright/login-session.png`
- `FE/OSK-Manager-FE/output/playwright/poster-refined-390.png`
- `FE/OSK-Manager-FE/output/playwright/poster-refined-901.png`
- `FE/OSK-Manager-FE/output/playwright/poster-refined-desktop.png`
- `FE/OSK-Manager-FE/output/playwright/poster-refined-selected.png`
- `FE/OSK-Manager-FE/public/fonts/manrope/Manrope-Variable.ttf`
- `FE/OSK-Manager-FE/public/fonts/manrope/OFL.txt`
