# OSK Manager — plan refaktoru i napraw po UI refresh

Data przygotowania: 2026-10-06. Status: plan roboczy do wykonywania punkt po punkcie. Na starcie wszystkie punkty są otwarte; przygotowanie dokumentu nie oznacza wykonania zmian w aplikacji.

Źródła: [mapa i zakres audytu](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/docs/POST_UI_CODE_REVIEW_SCOPE.md), [dowody i ustalenia audytu](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/docs/POST_UI_CODE_REVIEW_FINDINGS.md).

## Checklista zadań — bieżący postęp

To główne źródło postępu, analogicznie do checklisty widoków w UI_REFRESH_PLAN. **Jeden punkt oznacza jedną zmianę do samodzielnego wykonania i odbioru.** Część zmian obejmuje kilka ekranów albo backend, dlatego jednostką pracy jest problem, a widoki wskazano w kartach. Zachowano identyfikatory z raportu.

Kolejność poniżej jest domyślną trasą pracy od góry. Zakres obejmuje **14 punktów zmian**, **5 odbiorów QA** i **3 odłożone punkty opcjonalne**. QA nie zwiększa zakresu refaktoru: sprawdza współdziałanie ukończonych zmian. Checkboxy wewnątrz kart są kryteriami, nie osobnymi zadaniami.

### Grupa 1. Przygotowanie

- [x] **[QUAL-01 — Formatowanie i punkt startowy](#task-qual-01)** — wykonano 2026-10-06; lint FE i format/lint BE przechodzą, pełny format FE ma dwa niezależne odchylenia w dokumentacji.

### Grupa 2. Lokalne formularze i prezentacja danych

- [x] **[BUG-01 — Zdjęcie pojazdu — ponowny wybór](#task-bug-01)** — wykonano 2026-10-06; drugi wybór i ponowny wybór tego samego pliku działają.
- [ ] **[BUG-02 — Szczegóły instruktora po zapisie](#task-bug-02)** — do wykonania.
- [ ] **[BUG-03 — Pulpit — podsumowanie wszystkich opinii](#task-bug-03)** — do wykonania.
- [ ] **[BUG-04 — Płatności — zachowanie szkicu po błędzie](#task-bug-04)** — do wykonania.
- [ ] **[QA-01 — Odbiór formularzy i danych](#task-qa-01)** — odbiór po punktach grupy.

### Grupa 3. Dostępność i cały proces rezerwacji

- [ ] **[BUG-06 — Anulowane wydarzenia — kursant i samochód](#task-bug-06)** — do wykonania.
- [ ] **[BUG-07 — Dostępność — UTC i czas polski](#task-bug-07)** — do wykonania.
- [ ] **[BUG-05 — Rezerwacja — ręczne sprawdzenie dostępności](#task-bug-05)** — do wykonania.
- [ ] **[BUG-10 — Edycja jazdy — zmiana jednej godziny](#task-bug-10)** — do wykonania.
- [ ] **[BUG-08 — Pulpit managera — alert dostępności](#task-bug-08)** — do wykonania.
- [ ] **[QA-02 — Odbiór procesu rezerwacji i dostępności](#task-qa-02)** — odbiór po punktach grupy.

### Grupa 4. Spójność zapisu danych

- [ ] **[BUG-09 — Edycja instruktora — spójność zapisu w bazie](#task-bug-09)** — do wykonania.
- [ ] **[QA-03 — Odbiór zapisu instruktora i odczytu szczegółów](#task-qa-03)** — odbiór po punktach grupy.

### Grupa 5. Refaktory na ustabilizowanym zachowaniu

- [ ] **[REF-01 — Edycja wydarzenia — usunięcie starego freeWindows](#task-ref-01)** — do wykonania.
- [ ] **[REF-02 — Wspólna walidacja aktywnego kursanta](#task-ref-02)** — do wykonania.
- [ ] **[QA-04 — Odbiór zachowania po refaktorach](#task-qa-04)** — odbiór po punktach grupy.

### Grupa 6. Runtime i odbiór końcowy

- [ ] **[QUAL-02 — Node — zgodność CI i kontenerów](#task-qual-02)** — do wykonania.
- [ ] **[QA-05 — Odbiór końcowy całego zakresu](#task-qa-05)** — odbiór po punktach grupy.

### Opcjonalne — poza domyślną kolejką

- [ ] **[LATER-01 — Typowane powody błędów harmonogramu](#task-later-01)** — odłożone; tylko po wskazaniu tego punktu.
- [ ] **[LATER-02 — Nieaktywne dialogi konta](#task-later-02)** — odłożone; tylko po wskazaniu tego punktu.
- [ ] **[LATER-03 — Mock opinii — zgodne filtry dat](#task-later-03)** — odłożone; tylko po wskazaniu tego punktu.

## Jak rozumieć kolejność i zależności

- **Wymaga technicznie** oznacza rzeczywisty warunek implementacji lub wiarygodnego testu, np. kontrakt API lub izolowaną bazę. Sam numer wcześniejszego punktu nie tworzy takiej zależności.
- **Zalecana kolejność** opisuje organizację pracy. Najpierw poprawiamy reguły i zachowanie, następnie upraszczamy kod; niezależne zadania można przestawić po sprawdzeniu zakresu.
- **Nie wykonywać równolegle** wskazuje konflikt plików lub wspólnych kontraktów. To nie oznacza, że jeden algorytm wymaga drugiego.
- **QA wymaga ukończenia wskazanych punktów.** W domyślnym trybie sekwencyjnym odbiór zamyka grupę przed przejściem dalej. Grupa 5 zaczyna się po sprawdzeniu zachowania harmonogramu w QA-02.
- Jeśli odbiór jest zablokowany środowiskiem, zapisujemy konkretny brak. Nie uznajemy grupy za ukończoną i nie omijamy po cichu bramki. Niezależna grupa może być realizowana wcześniej, jeśli użytkownik ją wskaże; warunki jej własnego odbioru nadal obowiązują.

## Jak pracować z jednym punktem

1. Wskaż identyfikator, np. „Wykonaj BUG-01 z POST_UI_REFACTOR_PLAN.md”. Domyślnie wykonujemy tylko wskazany punkt, nie całą kolejkę.
2. Agent czyta jego kartę i wspólne zasady, sprawdza aktualny kod, lokalne zmiany oraz zależności. Lista plików rozróżnia się podczas pracy na edytowane i czytane jako kontrakt; nie trzeba zmieniać każdego wymienionego pliku.
3. Agent wykonuje minimalną poprawkę/refaktor i właściwe kontrole. Może użyć subagentów do analizy, niezależnych fragmentów i przeglądu. Przy jednym małym punkcie nie dzieli implementacji sztucznie; jeden plik ma jednego właściciela.
4. Po odbiorze aktualizuje checkbox główny, dopisuje datę i krótki rezultat oraz uzupełnia dziennik w karcie: rzeczywiste pliki, komendy/wyniki i pozostające ograniczenia. To ten dokument prowadzi postęp; raport ustaleń pozostaje zapisem dowodów z audytu.
5. Przy częściowym wykonaniu zostawia checkbox otwarty, wpisuje „w toku” albo „zablokowane” i konkretny następny krok. Nie kończy zadania na podstawie samych deklaracji wykonawcy. Jeżeli problem już usunięto inną zmianą lub założenie było nietrafne, zapisuje „zamknięte bez zmiany” z aktualnym dowodem zamiast wykonywać zbędny refaktor.
6. Po zakończeniu wskazanego punktu zatrzymuje pracę. Polecenie „wykonaj następny punkt” wybiera pierwszy otwarty punkt głównej checklisty, wliczając QA. Nie pomija zablokowanego odbioru bez poinformowania użytkownika i nie przechodzi automatycznie do opcjonalnych. Praca nad całą grupą obejmuje jej punkty oraz przypisany QA, po czym się zatrzymuje.

Gotowe polecenie do skopiowania:

> Wykonaj punkt BUG-01 z FE/OSK-Manager-FE/docs/POST_UI_REFACTOR_PLAN.md. Zweryfikuj go na aktualnym kodzie, zastosuj minimalną zmianę, wykorzystaj subagentów tam, gdzie przyspieszą pracę, i sprawdź kryteria odbioru. Uzupełnij wynik oraz status w tym planie. Zakończ po tym punkcie, bez rozpoczynania następnego.

Numerację zachowujemy także przy zmianie kolejności. Dopisanie nowego problemu wymaga dowodu i osobnej karty; nie dopisujemy przy okazji szerokich porządków do już wybranego punktu.

## Karty wykonania

Karty są ułożone dokładnie tak jak główna checklista. Dowody opisują stan audytu z 2026-10-06; przed zmianą potwierdzić je na bieżącym kodzie.

<a id="task-qual-01"></a>

### QUAL-01 — Formatowanie i punkt startowy

**Rodzaj:** Narzędzia.

**Wymaga technicznie:** Brak wcześniejszej implementacji.

**Zalecana kolejność:** Pierwszy punkt.

**Nie wykonywać równolegle:** Z edycją tych samych ośmiu plików przez inne zadania.

**Główne pliki do zmiany lub sprawdzenia kontraktu:**

- [app/components/manager/students/ManagerStudentsList.vue](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/app/components/manager/students/ManagerStudentsList.vue)
- [app/composables/schedule/useManagerSchoolScheduleCalendarData.ts](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/app/composables/schedule/useManagerSchoolScheduleCalendarData.ts)
- [app/composables/students/useManagerStudentDetailsPage.ts](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/app/composables/students/useManagerStudentDetailsPage.ts)
- [app/utils/instructors/managerInstructorSchedulePage.ts](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/app/utils/instructors/managerInstructorSchedulePage.ts)
- [server/utils/students/studentsMockBff.ts](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/server/utils/students/studentsMockBff.ts)
- [BE/src/**tests**/services/schedule.test.ts](D:/CODE/OSK-Manager/BE/src/__tests__/services/schedule.test.ts)
- [BE/src/controllers/students/read.handlers.ts](D:/CODE/OSK-Manager/BE/src/controllers/students/read.handlers.ts)
- [BE/src/services/schedule/queries.ts](D:/CODE/OSK-Manager/BE/src/services/schedule/queries.ts)

**Problem, dowód i granice zmiany:**

**Przed implementacją. Koszt mały, ryzyko niskie.** Zastany FE lint ma 13 błędów Prettier w pięciu plikach; BE format check wskazuje trzy pliki. Dokładna lista jest w mapie audytu. Sformatować tylko te pliki i sprawdzić diff, bez zmian całego repo i bez testów kosmetyki. Błędy istniały przed dokumentami audytu.

**Kroki wykonania:**

1. Sprawdzić bieżące HEAD, lokalne zmiany i wyniki lint/format; lista pochodzi ze stanu audytu, więc potwierdzić jej aktualność.
2. Sformatować tylko potwierdzone pliki. Zapisać nowy punkt odniesienia kontroli jakości.

**Kryteria odbioru:**

- [x] Diff aplikacji zawiera wyłącznie formatowanie wskazanych plików.
- [x] Lint FE oraz format/lint BE przechodzą; dwa odchylenia pełnego formatowania FE w dokumentacji wydzielono poniżej.
- [x] Sprawdzono diff, wykonano odpowiednie kontrole z zasad wspólnych i zapisano rzeczywiste wyniki poniżej.

**Dziennik wykonania — uzupełnić przy pracy:**

- Data i rezultat: 2026-10-06; sformatowano pięć plików FE i trzy BE. Diff kodu nie zmienia zachowania; przywrócono lint FE i format BE.
- Faktycznie zmienione pliki: FE `app/components/manager/students/ManagerStudentsList.vue`, `app/composables/schedule/useManagerSchoolScheduleCalendarData.ts`, `app/composables/students/useManagerStudentDetailsPage.ts`, `app/utils/instructors/managerInstructorSchedulePage.ts`, `server/utils/students/studentsMockBff.ts`; BE `src/__tests__/services/schedule.test.ts`, `src/controllers/students/read.handlers.ts`, `src/services/schedule/queries.ts`; ponadto ten plan (status i dziennik).
- Kontrole / komendy / wyniki: Node `v24.19.0`; FE `node node_modules/eslint/bin/eslint.js .` — exit 0; Prettier `--check` pięciu plików FE — exit 0; BE `node node_modules/prettier/bin/prettier.cjs --check 'src/**/*.ts'` — exit 0; `node node_modules/eslint/bin/eslint.js src --max-warnings=0` — exit 0; Prettier `--debug-check` ośmiu plików — exit 0; `git diff --check` FE i BE — exit 0. Diffy przejrzano ręcznie.
- Ograniczenia lub następny krok: pełny FE `node node_modules/prettier/bin/prettier.cjs . --check` — exit 1 wyłącznie dla `docs/DATE_TIME_PICKERS.md` i `docs/MANAGER_INSTRUCTORS.md`; te pliki są poza zakresem QUAL-01. Nie deklarujemy przechodzącego pełnego `format:check` FE. Testów funkcjonalnych nie uruchamiano dla zmian samego formatowania.

<a id="task-bug-01"></a>

### BUG-01 — Zdjęcie pojazdu — ponowny wybór

**Rodzaj:** Naprawa; W25.

**Wymaga technicznie:** Aktualny scenariusz wyboru pliku; brak zależności implementacyjnej od innych BUG.

**Zalecana kolejność:** Po QUAL-01.

**Nie wykonywać równolegle:** Z innymi zmianami useVehicleEditPage i jego testów.

**Główne pliki do zmiany lub sprawdzenia kontraktu:**

- [app/composables/vehicles/useVehicleEditPage.ts](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/app/composables/vehicles/useVehicleEditPage.ts)
- [app/composables/vehicles/useVehicleEditPage.test.ts](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/app/composables/vehicles/useVehicleEditPage.test.ts)
- [app/components/vehicles/VehicleEditPhotoSection.vue](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/app/components/vehicles/VehicleEditPhotoSection.vue)

**Problem, dowód i granice zmiany:**

**Warto teraz. Koszt mały, ryzyko niskie. Potwierdzenie: kod, headless Chromium z natywnym inputem i niezależna kontrola.**

[useVehicleEditPage.ts:152](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/app/composables/vehicles/useVehicleEditPage.ts:152) resetuje zapamiętany input przed odczytaniem jego `files[0]`. Drugi wybór na tym samym elemencie kasuje nowy FileList. Reprodukcja: pierwszy plik → pending=true; drugi → pending=false, files=0 i „Nie wybrano pliku”. API zastąpiono atrapą.

Odczytać File przed resetem albo oddzielić sprzątanie preview od resetu kontrolki. Zachować revokeObjectURL, MIME, limit 5 MB, clear i retry. Testować drugi wybór, invalid→valid, ten sam plik i ponowienie uploadu. Obiekt testowy z niezależnymi `value`/`files` ukrywa usterkę. W25; regresja w FE `5dbc4ac`.

**Kroki wykonania:**

1. Odtworzyć drugi wybór na tym samym natywnym input file.
2. Odczytać File przed cleanup albo oddzielić reset kontrolki od sprzątania podglądu.

**Kryteria odbioru:**

- [x] Drugi poprawny wybór pozostaje wybrany i można go wysłać.
- [x] Invalid→valid, wybór tego samego pliku, clear, MIME/limit rozmiaru i retry działają; object URL są zwalniane.
- [x] Sprawdzono diff, wykonano odpowiednie kontrole z zasad wspólnych i zapisano rzeczywiste wyniki poniżej.

**Dziennik wykonania — uzupełnić przy pracy:**

- Data i rezultat: 2026-10-06; handler zachowuje nowy `File` przed resetem inputu, a input jest czyszczony po każdym wyborze, aby można było wybrać ten sam plik ponownie. Podgląd poprzedniego pliku jest zwalniany.
- Faktycznie zmienione pliki: `app/composables/vehicles/useVehicleEditPage.ts`, `app/composables/vehicles/useVehicleEditPage.test.ts`, `e2e/specs/ui/vehicle-edit-photo.spec.ts` oraz ten plan (status i dziennik). Sprawdzono konsumentów `VehicleEditPhotoSection.vue`, stronę edycji i kontrakt `useVehiclesApi.ts`; nie wymagały zmiany.
- Kontrole / komendy / wyniki: test regresji przed poprawką — exit 1 na drugim wyborze; po poprawce FE `vitest run --reporter=dot` — 170 plików, 816 testów, exit 0; `eslint .` — exit 0; `nuxi typecheck` — exit 0; `nuxt build` — exit 0; Prettier `--check` trzech zmienionych plików kodu — exit 0; Playwright UI Chromium z atrapą API — 3/3 scenariusze, desktop 1440 px i mobile 390 px, exit 0; `git diff --check` — exit 0. Zweryfikowano diff.
- Ograniczenia lub następny krok: testy przeglądarkowe używają atrap odpowiedzi API; nie weryfikują rzeczywistego storage BE. Pierwszy start Chromium trafił na przygotowanie zależności Vite; po rozgrzaniu serwera scenariusze przeszły. Build wymagał uruchomienia poza ograniczeniem zapisu sandboxa do wygenerowanego cache Nuxta. Pełny FE `format:check` nadal ma dwa odchylenia dokumentacji odnotowane w QUAL-01; pliki nie należą do BUG-01.

<a id="task-bug-02"></a>

### BUG-02 — Szczegóły instruktora po zapisie

**Rodzaj:** Naprawa; W10 + mock.

**Wymaga technicznie:** Rzeczywisty kontrakt PATCH; brak wymogu ukończenia BUG-09.

**Zalecana kolejność:** Po QUAL-01; przed wspólnym odbiorem danych instruktora QA-03.

**Nie wykonywać równolegle:** Z edycją tego samego adaptera, normalizera i mock store. BUG-09 ma osobne pliki BE, ale kontrakt PATCH musi pozostać stabilny.

**Główne pliki do zmiany lub sprawdzenia kontraktu:**

- [app/composables/instructors/useManagerInstructorDetailsEdit.ts](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/app/composables/instructors/useManagerInstructorDetailsEdit.ts)
- [app/composables/instructors/useManagerInstructorDetailsEdit.test.ts](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/app/composables/instructors/useManagerInstructorDetailsEdit.test.ts)
- [app/types/instructors/instructorDetailNormalizers.ts](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/app/types/instructors/instructorDetailNormalizers.ts)
- [server/utils/instructors/mockInstructorsList.ts](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/server/utils/instructors/mockInstructorsList.ts)
- [BE/src/services/instructor/commandHelpers.ts](D:/CODE/OSK-Manager/BE/src/services/instructor/commandHelpers.ts)

**Problem, dowód i granice zmiany:**

**Warto teraz. Koszt mały, ryzyko niskie/średnie. Potwierdzenie: wykonanie normalizera na rzeczywistym kształcie kontraktu i niezależna kontrola.**

[useManagerInstructorDetailsEdit.ts:108](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/app/composables/instructors/useManagerInstructorDetailsEdit.ts:108) zachowuje po zapisie tylko schoolId/avatarUrl. [commandHelpers.ts:122](D:/CODE/OSK-Manager/BE/src/services/instructor/commandHelpers.ts:122) nie zwraca phone/licenseNumber obecnych w GET. Normalizer zmienia je na „—”; nie oznacza to utraty danych w bazie. Fixture sukcesu zwraca bogatszy payload niż backend.

Jawnie adaptować PATCH i zachować pola dostępne tylko w GET albo odświeżyć detail. Nie scalać bezmyślnie `{...oldDetail,...patch}`: stary `name`/`experience` ma pierwszeństwo w normalizerze i może ukryć nowe dane. Testować rzeczywisty payload, zmianę imienia/doświadczenia, zachowanie telefonu/licencji, null i nieudany zapis. W10; historyczny FE `123c8d4`, późniejsze poprawki schoolId/avatar nie domknęły kontraktu.

W tym samym zadaniu poprawić wąski mock kontraktu: [mockInstructorsList.ts:157](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/server/utils/instructors/mockInstructorsList.ts:157) zwraca kopię wiersza, którą mutuje PATCH, po czym ponownie odczytuje niezmieniony oryginał. Lokalna reprodukcja: zmienione imię/nazwisko pozostają stare w odpowiedzi i kolejnym GET. Mock dodatkowo zwraca pełny detail zamiast produkcyjnego partial PATCH. Regresja kopii pochodzi z UI/kontekstu szkoły FE `2b80645`. Naprawić zapis do store i fixture kontraktową, bez przebudowy wszystkich mocków.

Przed mutacją store zweryfikować wszystkie pola. Samo zastąpienie kopii referencją wprowadziłoby częściowy zapis: obecny kod zmienia nazwę przed sprawdzeniem qualifiedCourseTypeId. Test mieszanego PATCH z nowym nazwiskiem i nieznanym qualifiedCourseTypeId musi potwierdzić odrzucenie całej operacji bez zmiany store.

**Kroki wykonania:**

1. Użyć w teście rzeczywistego, częściowego payloadu PATCH. Zachować detail-only fields przez jawny adapter albo odświeżenie GET.
2. Naprawić zapis imienia/nazwiska w mock store i jego kształt odpowiedzi. Zweryfikować cały PATCH przed mutacją.

**Kryteria odbioru:**

- [ ] Telefon/licencja pozostają widoczne, a nowe imię i doświadczenie są aktualizowane; null i błąd zapisu mają zachowaną semantykę.
- [ ] Mock utrwala poprawną zmianę; nieznany qualifiedCourseTypeId odrzuca mieszany PATCH bez jakiejkolwiek zmiany store.
- [ ] Sprawdzono diff, wykonano odpowiednie kontrole z zasad wspólnych i zapisano rzeczywiste wyniki poniżej.

**Dziennik wykonania — uzupełnić przy pracy:**

- Data i rezultat: jeszcze nie wykonywano.
- Faktycznie zmienione pliki: —.
- Kontrole / komendy / wyniki: —.
- Ograniczenia lub następny krok: —.

<a id="task-bug-03"></a>

### BUG-03 — Pulpit — podsumowanie wszystkich opinii

**Rodzaj:** Naprawa; W01, konsument W30.

**Wymaga technicznie:** Istniejące summary API; brak zależności od innych napraw.

**Zalecana kolejność:** W grupie 2, po QUAL-01.

**Nie wykonywać równolegle:** Z inną edycją dashboardu i testów statystyk.

**Główne pliki do zmiany lub sprawdzenia kontraktu:**

- [app/composables/dashboard/useRoleDashboardPage.ts](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/app/composables/dashboard/useRoleDashboardPage.ts)
- [app/components/dashboard/RoleDashboardContent.vue](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/app/components/dashboard/RoleDashboardContent.vue)
- [app/components/dashboard/InstructorDashboardContent.vue](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/app/components/dashboard/InstructorDashboardContent.vue)
- [app/composables/lessons/useLessonRatingsListApi.ts](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/app/composables/lessons/useLessonRatingsListApi.ts)
- [BE/src/services/lesson-rating/queries.ts](D:/CODE/OSK-Manager/BE/src/services/lesson-rating/queries.ts)

**Problem, dowód i granice zmiany:**

**Warto teraz. Koszt mały, ryzyko niskie. Potwierdzenie: kontrolowane wykonanie i niezależna kontrola.**

[useRoleDashboardPage.ts:69](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/app/composables/dashboard/useRoleDashboardPage.ts:69) liczy średnią z ratings, pomijając summary odpowiedzi. [RoleDashboardContent.vue:34](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/app/components/dashboard/RoleDashboardContent.vue:34) bierze długość tej strony. API domyślnie pobiera 20 rekordów, a BE już zwraca podsumowanie całości. Reprodukcja: 20 ocen po 5, summary average=3.2 i total=60 → dashboard pokazuje 5 i 20.

Użyć summary, bez pobierania wszystkich stron/nowego endpointu. Test: >20 opinii, różna średnia strony/całości, brak ocen, błąd/retry. W01/W30; styk FE `d7b1867` i paginacji `5499235`, powiązany z aktualizacjami UI.

**Kroki wykonania:**

1. Zabezpieczyć testem odpowiedź: 20 opinii na stronie i inne globalne summary.
2. Wykorzystać już zwracane summary w statystykach pulpitu.

**Kryteria odbioru:**

- [ ] Licznik i średnia odpowiadają całemu zbiorowi, nawet jeśli lista ma 20 rekordów.
- [ ] Zero opinii oraz loading/error/retry są obsłużone bez nowego endpointu i bez pobierania wszystkich stron.
- [ ] Sprawdzono diff, wykonano odpowiednie kontrole z zasad wspólnych i zapisano rzeczywiste wyniki poniżej.

**Dziennik wykonania — uzupełnić przy pracy:**

- Data i rezultat: jeszcze nie wykonywano.
- Faktycznie zmienione pliki: —.
- Kontrole / komendy / wyniki: —.
- Ograniczenia lub następny krok: —.

<a id="task-bug-04"></a>

### BUG-04 — Płatności — zachowanie szkicu po błędzie

**Rodzaj:** Naprawa; W08/T01.

**Wymaga technicznie:** Jawny wynik zapisu i test błędu; brak zależności od innych napraw.

**Zalecana kolejność:** W grupie 2, po QUAL-01.

**Nie wykonywać równolegle:** Z inną edycją sekcji płatności i jej powiązania create/success.

**Główne pliki do zmiany lub sprawdzenia kontraktu:**

- [app/components/manager/students/ManagerStudentPaymentsSection.vue](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/app/components/manager/students/ManagerStudentPaymentsSection.vue)
- [app/components/manager/students/ManagerStudentPaymentCreateForm.vue](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/app/components/manager/students/ManagerStudentPaymentCreateForm.vue)
- [app/composables/students/useManagerStudentPayments.ts](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/app/composables/students/useManagerStudentPayments.ts)
- [app/composables/students/useManagerStudentPayments.test.ts](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/app/composables/students/useManagerStudentPayments.test.ts)

**Problem, dowód i granice zmiany:**

**Warto teraz. Koszt mały, ryzyko średnie. Potwierdzenie: wykonanie setup SFC i niezależna kontrola.**

[ManagerStudentPaymentsSection.vue:97](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/app/components/manager/students/ManagerStudentPaymentsSection.vue:97) zeruje kwotę, termin i metodę zaraz po emit. [useManagerStudentPayments.ts:138](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/app/composables/students/useManagerStudentPayments.ts:138) obsługuje request asynchronicznie. Nie ma potwierdzenia sukcesu dla komponentu; przy błędzie formularz zostaje pusty.

Reset dopiero po jawnym sukcesie, prostym mechanizmem dopasowanym do obecnej kompozycji. Test błędu zachowującego dane, pojedynczego resetu po sukcesie i retry; sprawdzić W08 i T01. Historyczny FE `ef674933`, przed UI refresh.

**Kroki wykonania:**

1. Prześledzić emit create do wyniku asynchronicznego zapisu i dodać test nieudanego żądania.
2. Czyścić szkic dopiero po jawnym sukcesie; dostosować wszystkich konsumentów zmienionego powiązania.

**Kryteria odbioru:**

- [ ] Nieudany zapis zachowuje kwotę, termin i metodę; ponowienie używa danych użytkownika.
- [ ] Udany zapis czyści formularz dokładnie raz; działają W08 i przykład T01.
- [ ] Sprawdzono diff, wykonano odpowiednie kontrole z zasad wspólnych i zapisano rzeczywiste wyniki poniżej.

**Dziennik wykonania — uzupełnić przy pracy:**

- Data i rezultat: jeszcze nie wykonywano.
- Faktycznie zmienione pliki: —.
- Kontrole / komendy / wyniki: —.
- Ograniczenia lub następny krok: —.

<a id="task-qa-01"></a>

### QA-01 — Odbiór formularzy i danych

**Rodzaj:** Odbiór grupy, nie nowa zmiana funkcjonalna.

**Wymaga ukończenia:** BUG-01, BUG-02, BUG-03, BUG-04.

**Zakres sprawdzenia:**

- [ ] Sprawdzić ponowny wybór zdjęcia i retry uploadu, zapis danych instruktora i ich ponowny odczyt, summary opinii większego zbioru oraz płatność z błędem i ponowieniem.
- [ ] Przy instruktorze użyć kontraktu zgodnego z backendem, a nie wyłącznie bogatszego mocka. Dla formularzy objąć loading/error/success.
- [ ] Uruchomić odpowiednie testy FE, typecheck/lint i przejrzeć łączny diff tej grupy.

**Dziennik odbioru:**

- Data i stan kodu: jeszcze nie wykonano.
- Scenariusze / komendy / wyniki: —.
- Środowisko i ograniczenia: —.
- Wniosek i ewentualne punkty do ponownego otwarcia: —.

<a id="task-bug-06"></a>

### BUG-06 — Anulowane wydarzenia — kursant i samochód

**Rodzaj:** Naprawa; dostępność/rezerwacje.

**Wymaga technicznie:** Testy obu wariantów anulowanego wydarzenia; brak wymogu zmian BUG-07.

**Zalecana kolejność:** Na początku grupy 3: najpierw poprawność blokad backendu.

**Nie wykonywać równolegle:** Z edycją lesson-scheduling, vehicle/queries lub tych samych testów konfliktów.

**Główne pliki do zmiany lub sprawdzenia kontraktu:**

- [BE/src/lib/lesson-scheduling.ts](D:/CODE/OSK-Manager/BE/src/lib/lesson-scheduling.ts)
- [BE/src/services/vehicle/queries.ts](D:/CODE/OSK-Manager/BE/src/services/vehicle/queries.ts)
- [BE/src/services/lesson/vehicleAvailability.ts](D:/CODE/OSK-Manager/BE/src/services/lesson/vehicleAvailability.ts)
- [BE/src/services/event/conflicts.ts](D:/CODE/OSK-Manager/BE/src/services/event/conflicts.ts)
- [app/composables/lessons/useLessonBookingApi.ts](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/app/composables/lessons/useLessonBookingApi.ts)

**Problem, dowód i granice zmiany:**

**Warto teraz. Koszt mały/średni, ryzyko średnie. Potwierdzenie ścieżki kursanta: kod i dwa niezależne wykonania z query stubem; bez DB.**

[lesson-scheduling.ts:59](D:/CODE/OSK-Manager/BE/src/lib/lesson-scheduling.ts:59) szuka eventParticipant z nakładającym się eventem bez filtrów isActive/status. Usunięcie ustawia isActive=false, anulowanie status=CANCELLED; participants pozostają dla historii. Oba warianty nadal powodują 409. Inne walidatory wydarzeń prawidłowo filtrują te pola.

Drugi potwierdzony wariant: [vehicle/queries.ts:60](D:/CODE/OSK-Manager/BE/src/services/vehicle/queries.ts:60) uwzględnia isActive, lecz pomija status. Anulowany DRIVE usuwa auto z listy wolnych, chociaż właściwy zapis rezerwacji w vehicleAvailability prawidłowo ignoruje CANCELLED. Konsument useLessonBookingApi przekazuje availableVehicleIds do selektora, który blokuje wybór. Reprodukcja aktualnych funkcji z atrapą DB: pusta lista wolnych aut, a vehicleHasBookingConflict=false dla tego samego anulowanego wydarzenia; koordynator sprawdził oba zapytania i konsumenta. Historyczne BE `dbbecaed`.

Uzgodnić warunki „blokujące wydarzenie” z istniejącą regułą i dodać brakujące filtry w obu ścieżkach. Zachować historię uczestników. Test z uczestnikiem teorii i osobny test samochodu dla PLANNED / isActive=false / CANCELLED oraz stykających się przedziałów. Wcześniejsze testy DRIVE bez participant nie zabezpieczają ścieżki kursanta (historyczny BE `fc8936d`). Nie budować ogólnego silnika konfliktów przy okazji dwóch brakujących predykatów.

**Kroki wykonania:**

1. Zabezpieczyć dwa scenariusze: zachowane uczestnictwo po anulowaniu teorii oraz pojazd po anulowaniu DRIVE.
2. Dodać brakujące warunki aktywności/statusu zgodnie z istniejącymi walidatorami.

**Kryteria odbioru:**

- [ ] Anulowana/nieaktywna teoria nie blokuje kursanta; aktywna zaplanowana nadal blokuje.
- [ ] Anulowany DRIVE nie ukrywa wolnego auta; PLANNED, isActive=false i stykające się przedziały są poprawnie rozróżniane. Historia pozostaje zachowana.
- [ ] Sprawdzono diff, wykonano odpowiednie kontrole z zasad wspólnych i zapisano rzeczywiste wyniki poniżej.

**Dziennik wykonania — uzupełnić przy pracy:**

- Data i rezultat: jeszcze nie wykonywano.
- Faktycznie zmienione pliki: —.
- Kontrole / komendy / wyniki: —.
- Ograniczenia lub następny krok: —.

<a id="task-bug-07"></a>

### BUG-07 — Dostępność — UTC i czas polski

**Rodzaj:** Naprawa; sloty kursanta.

**Wymaga technicznie:** Jednoznaczna reprezentacja czasu w tej ścieżce; brak wymogu ukończenia BUG-06.

**Zalecana kolejność:** Po BUG-06 w trybie sekwencyjnym; oba punkty mogą być realizowane równolegle w rozłącznych plikach.

**Nie wykonywać równolegle:** Ze zmianą wspólnych helperów czasu lub tych samych testów harmonogramu.

**Główne pliki do zmiany lub sprawdzenia kontraktu:**

- [BE/src/services/school-availability/busyLessons.ts](D:/CODE/OSK-Manager/BE/src/services/school-availability/busyLessons.ts)
- [BE/src/services/school-availability/dateHelpers.ts](D:/CODE/OSK-Manager/BE/src/services/school-availability/dateHelpers.ts)
- [BE/src/services/school-availability/queries.ts](D:/CODE/OSK-Manager/BE/src/services/school-availability/queries.ts)
- [BE/src/lib/polishScheduleTime.ts](D:/CODE/OSK-Manager/BE/src/lib/polishScheduleTime.ts)

**Problem, dowód i granice zmiany:**

**Warto teraz. Koszt średni, ryzyko średnie. Potwierdzenie: aktualne funkcje z atrapą DB i niezależna kontrola.**

[busyLessons.ts:41](D:/CODE/OSK-Manager/BE/src/services/school-availability/busyLessons.ts:41) używa UTCHours, sloty windows są w czasie polskim. Lekcja 2026-10-06 08:00–09:00Z daje 480–540, a odpowiada slotowi 10:00–11:00, czyli 600–660. Porównanie nie wyklucza tego slotu, szczególnie u innego instruktora. Zakres pobierania lekcji także używa granic dnia UTC.

W tej ścieżce użyć istniejących konwersji polishScheduleTime i granic polskiego dnia. Testy: lato/zima, północ, DST, stykające się przedziały, drugi instruktor. Nie zastępować wszystkich operacji UTC — SQL DATE/TIME mają odrębną semantykę. Stary busyLessons BE `dbbecae`; luka w połączeniu z migracją windows w `d6b423f`.

**Kroki wykonania:**

1. Zabezpieczyć przykład lekcji 08:00Z pokrywającej slot 10:00 czasu polskiego latem i scenariusz drugiego instruktora.
2. W tej ścieżce ujednolicić reprezentację minut i granic dnia, używając istniejących konwersji.

**Kryteria odbioru:**

- [ ] Zajętość usuwa właściwy lokalny slot także u innego instruktora.
- [ ] Lato, zima, północ, DST i stykające się przedziały mają testy; semantyka SQL DATE/TIME w innych modułach pozostaje bez zmian.
- [ ] Sprawdzono diff, wykonano odpowiednie kontrole z zasad wspólnych i zapisano rzeczywiste wyniki poniżej.

**Dziennik wykonania — uzupełnić przy pracy:**

- Data i rezultat: jeszcze nie wykonywano.
- Faktycznie zmienione pliki: —.
- Kontrole / komendy / wyniki: —.
- Ograniczenia lub następny krok: —.

<a id="task-bug-05"></a>

### BUG-05 — Rezerwacja — ręczne sprawdzenie dostępności

**Rodzaj:** Naprawa; W27 + wspólny helper.

**Wymaga technicznie:** Reprodukcja candidate+recheck na rzeczywistym helperze; backendowe BUG-06/07 nie są warunkiem samej poprawki FE.

**Zalecana kolejność:** Po BUG-06/07, aby późniejszy odbiór sprawdzał już poprawione reguły backendu.

**Nie wykonywać równolegle:** Z BUG-10, jeśli rozwiązanie dotknie formularza W20, oraz z REF-01 przy zmianach wspólnej obsługi dostępności.

**Główne pliki do zmiany lub sprawdzenia kontraktu:**

- [app/composables/schedule/useDebouncedAbortableRequest.ts](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/app/composables/schedule/useDebouncedAbortableRequest.ts)
- [app/composables/schedule/useScheduleAvailabilityCheck.ts](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/app/composables/schedule/useScheduleAvailabilityCheck.ts)
- [app/composables/schedule/useScheduleAvailabilityCheck.test.ts](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/app/composables/schedule/useScheduleAvailabilityCheck.test.ts)
- [app/composables/lessons/useStudentLessonBookingPage.ts](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/app/composables/lessons/useStudentLessonBookingPage.ts)
- [app/composables/lessons/useStudentLessonBookingPage.test.ts](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/app/composables/lessons/useStudentLessonBookingPage.test.ts)

**Problem, dowód i granice zmiany:**

**Warto teraz. Koszt średni, ryzyko średnie. Potwierdzenie: rzeczywisty helper, reaktywność Vue i fetcher obsługujący abort.**

[useStudentLessonBookingPage.ts:413](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/app/composables/lessons/useStudentLessonBookingPage.ts:413) ustawia candidate i natychmiast wywołuje recheck. Watcher w [useDebouncedAbortableRequest.ts:84](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/app/composables/schedule/useDebouncedAbortableRequest.ts:84) anuluje ręczne execute. Zwracany jest loading/checking zamiast rozstrzygnięcia; POST blokuje tylko unavailable. **Backend nadal waliduje rezerwację; nie wykazano podwójnej rezerwacji.**

Ustalić pierwszeństwo ręcznego execute albo skoordynować zmianę candidate w konsumencie. Samo auto:false nie usuwa anulowania. Test candidate+recheck w jednym ticku na prawdziwym helperze, unavailable bez POST, zmiany candidate, abort/cleanup. Zachować przyjęty fallback przy rzeczywistej niedostępności preflight. W27 i pozostali konsumenci helpera; FE `eee74e4`, W27 `b6cf2ae`/`ec4e6fc`.

**Kroki wykonania:**

1. Odtworzyć zmianę candidate i execute/recheck w jednym ticku na rzeczywistym helperze Vue.
2. Ustalić kolejność ręcznej i automatycznej operacji najmniejszą zmianą; sprawdzić pozostałych konsumentów.

**Kryteria odbioru:**

- [ ] Ręczne sprawdzenie nie kończy się pozornym loading/checking przez oczekującego watchera; unavailable blokuje POST.
- [ ] Zmiana candidate, spóźnione odpowiedzi, abort/cleanup i auto:false działają; zachowany uzgodniony fallback po rzeczywistym błędzie preflight.
- [ ] Sprawdzono diff, wykonano odpowiednie kontrole z zasad wspólnych i zapisano rzeczywiste wyniki poniżej.

**Dziennik wykonania — uzupełnić przy pracy:**

- Data i rezultat: jeszcze nie wykonywano.
- Faktycznie zmienione pliki: —.
- Kontrole / komendy / wyniki: —.
- Ograniczenia lub następny krok: —.

<a id="task-bug-10"></a>

### BUG-10 — Edycja jazdy — zmiana jednej godziny

**Rodzaj:** Naprawa; W20.

**Wymaga technicznie:** Aktualny kontrakt pary start/end; brak twardej zależności od BUG-05.

**Zalecana kolejność:** Po BUG-05, następnie wspólny odbiór rezerwacji/edycji.

**Nie wykonywać równolegle:** Z BUG-05, jeżeli oba zadania dotykają useManagerLessonEditForm lub tych samych testów.

**Główne pliki do zmiany lub sprawdzenia kontraktu:**

- [app/composables/lessons/useManagerLessonEditForm.ts](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/app/composables/lessons/useManagerLessonEditForm.ts)
- [app/composables/lessons/useManagerLessonEditForm.test.ts](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/app/composables/lessons/useManagerLessonEditForm.test.ts)
- [server/utils/lessons/parseLessonPatchBody.ts](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/server/utils/lessons/parseLessonPatchBody.ts)
- [BE/src/schemas/lesson.schemas.ts](D:/CODE/OSK-Manager/BE/src/schemas/lesson.schemas.ts)

**Problem, dowód i granice zmiany:**

**Warto teraz. Koszt mały, ryzyko niskie. Potwierdzenie: oryginalny builder FE + oryginalny Zod BE w pamięci oraz kontrola koordynatora.**

[useManagerLessonEditForm.ts:130](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/app/composables/lessons/useManagerLessonEditForm.ts:130) niezależnie dodaje zmienione startTime/endTime. BFF przekazuje je, ale [lesson.schemas.ts:148](D:/CODE/OSK-Manager/BE/src/schemas/lesson.schemas.ts:148) wymaga pary. Wydłużenie 10:00–11:00 do 10:00–11:30 daje tylko endTime i błąd walidacji. Preflight używa pełnego okna i może wcześniej zaakceptować termin.

Przy zmianie dowolnej granicy wysłać obie. Zachować minimalny payload przy zmianie pojazdu/instruktora i brak zmian. Test każdej granicy osobno, obu i braku zmiany czasu oraz zgodności kontraktu BE. Bez nowego pakietu współdzielonego. W20; historyczne FE `3d466277` i BE `2d52f52a`.

**Kroki wykonania:**

1. Odtworzyć błąd zmiany tylko początku i tylko końca na aktualnym kontrakcie.
2. Wysyłać obie granice, gdy zmienia się którakolwiek.

**Kryteria odbioru:**

- [ ] Payload dla każdej pojedynczej granicy przechodzi kontrakt backendu; niepoprawne okno nadal jest odrzucane.
- [ ] Zmiana tylko pojazdu/instruktora nadal daje minimalny payload, brak zmian nie dodaje czasu.
- [ ] Sprawdzono diff, wykonano odpowiednie kontrole z zasad wspólnych i zapisano rzeczywiste wyniki poniżej.

**Dziennik wykonania — uzupełnić przy pracy:**

- Data i rezultat: jeszcze nie wykonywano.
- Faktycznie zmienione pliki: —.
- Kontrole / komendy / wyniki: —.
- Ograniczenia lub następny krok: —.

<a id="task-bug-08"></a>

### BUG-08 — Pulpit managera — alert dostępności

**Rodzaj:** Naprawa; W01, dowód statyczny.

**Wymaga technicznie:** Test potwierdzający statyczne ustalenie; nie wymaga przebudowy generatora slotów.

**Zalecana kolejność:** Na końcu grupy 3, przed QA-02.

**Nie wykonywać równolegle:** Z inną edycją manager-attention/items i jego testów.

**Główne pliki do zmiany lub sprawdzenia kontraktu:**

- [BE/src/services/manager-attention/items.ts](D:/CODE/OSK-Manager/BE/src/services/manager-attention/items.ts)
- [BE/src/services/instructor-availability/windows.ts](D:/CODE/OSK-Manager/BE/src/services/instructor-availability/windows.ts)
- [BE/src/**tests**/services/manager-attention.test.ts](D:/CODE/OSK-Manager/BE/src/__tests__/services/manager-attention.test.ts)

**Problem, dowód i granice zmiany:**

**Kolejna partia napraw. Koszt mały/średni, ryzyko średnie. Potwierdzenie statyczne; bez DB/E2E.**

[manager-attention/items.ts:278](D:/CODE/OSK-Manager/BE/src/services/manager-attention/items.ts:278) ocenia brak datowanych workingHours. [windows.ts:95](D:/CODE/OSK-Manager/BE/src/services/instructor-availability/windows.ts:95) stosuje fallback do instructorWorkingHoursDefault. Instruktor z samym domyślnym tygodniem może dostać fałszywy alert.

Uwzględnić oba źródła konfiguracji. Nie zmieniać znaczenia na „wszystkie terminy zajęte” ani uruchamiać generatora slotów dla wszystkich. Test: defaults only, datowane only, brak obu, urlop, sortowanie/limit10/hiddenCount. Historyczne, m.in. BE `058a423`/`17062a0`.

**Kroki wykonania:**

1. Potwierdzić alert dla instruktora z samą konfiguracją domyślnego tygodnia.
2. Uwzględnić oba źródła konfiguracji bez zmiany alertu na brak wolnych slotów.

**Kryteria odbioru:**

- [ ] Defaults only, datowane godziny only, brak obu i urlop dają właściwy wynik.
- [ ] Sortowanie, limit 10 i hiddenCount pozostają poprawne; nie uruchamiać generatora slotów dla każdego instruktora.
- [ ] Sprawdzono diff, wykonano odpowiednie kontrole z zasad wspólnych i zapisano rzeczywiste wyniki poniżej.

**Dziennik wykonania — uzupełnić przy pracy:**

- Data i rezultat: jeszcze nie wykonywano.
- Faktycznie zmienione pliki: —.
- Kontrole / komendy / wyniki: —.
- Ograniczenia lub następny krok: —.

<a id="task-qa-02"></a>

### QA-02 — Odbiór procesu rezerwacji i dostępności

**Rodzaj:** Odbiór grupy, nie nowa zmiana funkcjonalna.

**Wymaga ukończenia:** BUG-06, BUG-07, BUG-05, BUG-10, BUG-08.

**Zakres sprawdzenia:**

- [ ] Przejść wybór terminu → sprawdzenie dostępności → rezerwację → zmianę tylko jednej granicy czasu → anulowanie → ponowny odczyt dostępności. Po anulowaniu lekcji sprawdzić zwolnienie terminu; osobno anulowaną teorię z uczestnikiem i anulowany DRIVE z pojazdem.
- [ ] Sprawdzić właściwy slot przy istniejącej lekcji u innego instruktora, lato/zima/DST i granice dnia. Backend musi odrzucać rzeczywisty konflikt mimo ewentualnego fallbacku preflight.
- [ ] Sprawdzić alert managera dla defaults/daty/braku konfiguracji. Uruchomić testy dotkniętych obszarów FE i BE, kontrolę kontraktów oraz odpowiednie typy/lint.
- [ ] Odbiór obejmuje ścieżkę FE–BFF–BE na izolowanych danych testowych, nie tylko unit mocki. Brak środowiska zapisać jako nieukończony odbiór, nie potwierdzenie działania.

**Dziennik odbioru:**

- Data i stan kodu: jeszcze nie wykonano.
- Scenariusze / komendy / wyniki: —.
- Środowisko i ograniczenia: —.
- Wniosek i ewentualne punkty do ponownego otwarcia: —.

<a id="task-bug-09"></a>

### BUG-09 — Edycja instruktora — spójność zapisu w bazie

**Rodzaj:** Naprawa niezawodności; backend.

**Wymaga technicznie:** Test wymuszonej awarii i izolowana baza do potwierdzenia rollbacku. BUG-02 nie jest zależnością implementacyjną.

**Zalecana kolejność:** Po grupie 3 i BUG-02, żeby w QA-03 sprawdzić razem widok i zapis.

**Nie wykonywać równolegle:** Ze zmianami instructor/commands, powiązanych zapisów lub wspólnego kontraktu PATCH.

**Główne pliki do zmiany lub sprawdzenia kontraktu:**

- [BE/src/services/instructor/commands.ts](D:/CODE/OSK-Manager/BE/src/services/instructor/commands.ts)
- [BE/src/services/instructor/commandHelpers.ts](D:/CODE/OSK-Manager/BE/src/services/instructor/commandHelpers.ts)
- [BE/src/**tests**/services/instructor-qualified-course-types.test.ts](D:/CODE/OSK-Manager/BE/src/__tests__/services/instructor-qualified-course-types.test.ts)
- [BE/scripts/run-integration-tests.mjs](D:/CODE/OSK-Manager/BE/scripts/run-integration-tests.mjs)

**Problem, dowód i granice zmiany:**

**Naprawa niezawodności po teście awarii. Koszt średni, ryzyko średnie. Konstrukcja potwierdzona kodem; nie odtwarzano częściowego zapisu na DB.**

[instructor/commands.ts:87](D:/CODE/OSK-Manager/BE/src/services/instructor/commands.ts:87) zapisuje profil, użytkownika i kwalifikacje poza wspólną transakcją. Awaria późniejszego kroku może pozostawić wcześniejszy zapis mimo błędu endpointu.

Najpierw test wymuszonej awarii; potem objąć powiązane zapisy i odczyt wyniku transakcją. Zachować ownership, whitelistę, pustą aktualizację i kontrakt PATCH. Odbiór rollbacku wymaga izolowanej bazy; mock nie dowodzi atomowości. Historyczny BE `dbbecae`. Osobne zadanie od frontendowego BUG-02.

**Kroki wykonania:**

1. Odtworzyć awarię po pierwszym kroku zapisu profilu/użytkownika/kwalifikacji.
2. Objąć powiązane zapisy i odczyt wyniku transakcją, zachowując wcześniejszą walidację i kontrakt.

**Kryteria odbioru:**

- [ ] Awaria późniejszego kroku wycofuje wcześniejsze zapisy — potwierdzone na izolowanej DB, nie samym mockiem.
- [ ] Sukces, ownership, whitelist, pusty PATCH i odpowiedź pozostają poprawne. Bez testowej bazy pozostawić odbiór jako nieukończony.
- [ ] Sprawdzono diff, wykonano odpowiednie kontrole z zasad wspólnych i zapisano rzeczywiste wyniki poniżej.

**Dziennik wykonania — uzupełnić przy pracy:**

- Data i rezultat: jeszcze nie wykonywano.
- Faktycznie zmienione pliki: —.
- Kontrole / komendy / wyniki: —.
- Ograniczenia lub następny krok: —.

<a id="task-qa-03"></a>

### QA-03 — Odbiór zapisu instruktora i odczytu szczegółów

**Rodzaj:** Odbiór grupy, nie nowa zmiana funkcjonalna.

**Wymaga ukończenia:** BUG-02 i BUG-09.

**Zakres sprawdzenia:**

- [ ] Na izolowanej DB wymusić awarię późniejszego kroku PATCH i potwierdzić brak częściowego zapisu.
- [ ] Sprawdzić poprawny zapis oraz ponowny GET: imię/doświadczenie/kwalifikacje się aktualizują, a telefon/licencja pozostają; frontend poprawnie obsługuje błąd.
- [ ] Zachować uprawnienia, whitelistę i kontrakt PATCH. Jeżeli nie ma izolowanej DB, zostawić odbiór otwarty; nie uruchamiać migracji runnera na nieustalonej bazie.

**Dziennik odbioru:**

- Data i stan kodu: jeszcze nie wykonano.
- Scenariusze / komendy / wyniki: —.
- Środowisko i ograniczenia: —.
- Wniosek i ewentualne punkty do ponownego otwarcia: —.

<a id="task-ref-01"></a>

### REF-01 — Edycja wydarzenia — usunięcie starego freeWindows

**Rodzaj:** Refaktor; W19.

**Wymaga technicznie:** Testy charakteryzujące bieżący W19. BUG-05 nie jest bezwzględną zależnością kodu.

**Zalecana kolejność:** Po QA-02 — bramka procesu, żeby upraszczać już sprawdzone zachowanie dostępności.

**Nie wykonywać równolegle:** Z BUG-05 i innymi zmianami formularza wydarzenia/helperów dostępności.

**Główne pliki do zmiany lub sprawdzenia kontraktu:**

- [app/composables/events/useManagerEventEditForm.ts](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/app/composables/events/useManagerEventEditForm.ts)
- [app/composables/events/useManagerEventEditTimePicker.ts](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/app/composables/events/useManagerEventEditTimePicker.ts)
- [app/composables/events/useManagerEventEditTimeSplit.ts](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/app/composables/events/useManagerEventEditTimeSplit.ts)
- [app/composables/events/useManagerEventSlots.ts](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/app/composables/events/useManagerEventSlots.ts)
- [app/utils/schedule/eventEditFreeWindowsPicker.ts](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/app/utils/schedule/eventEditFreeWindowsPicker.ts)
- [app/composables/events/useManagerEventEditForm.test.ts](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/app/composables/events/useManagerEventEditForm.test.ts)

**Problem, dowód i granice zmiany:**

**Warto teraz. Koszt mały/średni, ryzyko średnie.**

Dowód: [useManagerEventEditForm.ts:43](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/app/composables/events/useManagerEventEditForm.ts:43) ustawia prywatne `freeWindows=[]` i `freeWindowsUnavailable=false`, których nie aktualizuje. Przekazuje je do time picker/split, zawierających nieaktywne ograniczanie godzin. [useManagerEventEditTimeSplit.ts:38](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/app/composables/events/useManagerEventEditTimeSplit.ts:38) uzależnia te gałęzie od niepustych windows. `useManagerEventSlots` nie ma odnalezionego konsumenta produkcyjnego, również po uwzględnieniu autoimportów Nuxt.

Koszt obecnego stanu: trzeba rozumieć dwa mechanizmy ograniczeń, choć działa availability-options. Część testów utrwala porzucony wariant. Minimalna zmiana: usunąć martwy tor i composable, uprościć argumenty pomocników. Zachować podział daty/godziny, hydratację, domyślny koniec, options, fallback i PATCH. Nie usuwać używanej funkcji domyślnego końca wyłącznie z powodu jej lokalizacji w starym utility.

Odbiór: najpierw testy charakteryzujące formularz dla options success/empty/error, zmiany daty/godziny, zachowania istniejącego terminu i zapisu. Dopiero potem usunięcie testów nieaktywnego wariantu. Konsument W19; pochodzenie FE `eee74e4`, dalsze zmiany `b803f5b` — powiązanie z wdrażaniem UI i nowej dostępności potwierdzone kodem.

**Kroki wykonania:**

1. Najpierw zabezpieczyć aktualne zachowanie formularza opartego na availability-options.
2. Usunąć nieaktywny tor freeWindows, nieużywany composable i zbędne argumenty; zachować nadal używane pomocniki.

**Kryteria odbioru:**

- [ ] Options success/empty/error, hydratacja, zmiana daty/godzin, domyślny koniec i zapis zachowują działanie.
- [ ] Znikają martwe gałęzie, nie pojawia się nowy framework pickerów; testy opisują aktywny formularz.
- [ ] Sprawdzono diff, wykonano odpowiednie kontrole z zasad wspólnych i zapisano rzeczywiste wyniki poniżej.

**Dziennik wykonania — uzupełnić przy pracy:**

- Data i rezultat: jeszcze nie wykonywano.
- Faktycznie zmienione pliki: —.
- Kontrole / komendy / wyniki: —.
- Ograniczenia lub następny krok: —.

<a id="task-ref-02"></a>

### REF-02 — Wspólna walidacja aktywnego kursanta

**Rodzaj:** Refaktor; backend kursantów.

**Wymaga technicznie:** Testy ról, identyfikatorów i kolejności błędów pięciu operacji.

**Zalecana kolejność:** Po naprawach funkcjonalnych; kolejność względem REF-01 nie jest technicznie wymagana.

**Nie wykonywać równolegle:** Z innymi zmianami students/profileMutations, courseParticipants lub wspólnych testów autoryzacji.

**Główne pliki do zmiany lub sprawdzenia kontraktu:**

- [BE/src/services/students/profileMutations.ts](D:/CODE/OSK-Manager/BE/src/services/students/profileMutations.ts)
- [BE/src/services/students/courseParticipants.ts](D:/CODE/OSK-Manager/BE/src/services/students/courseParticipants.ts)
- [BE/src/services/students/access.ts](D:/CODE/OSK-Manager/BE/src/services/students/access.ts)

**Problem, dowód i granice zmiany:**

**Warto teraz po zabezpieczeniu kontraktów. Koszt mały, ryzyko średnie.**

Dowód: [profileMutations.ts:27](D:/CODE/OSK-Manager/BE/src/services/students/profileMutations.ts:27), ponownie przy PKK i notatkach, powiela projekcję i sekwencję walidacji z [courseParticipants.ts:9](D:/CODE/OSK-Manager/BE/src/services/students/courseParticipants.ts:9). Reguła jest utrzymywana w czterech miejscach używanych przez pięć operacji.

Minimalna zmiana: wydzielić istniejący `loadActiveStudentProfileId` do lokalnego modułu domeny. Zachować kolejność: brak/usunięty użytkownik → 404, nieaktywny → 403, zła rola/brak profilu → 400. Nie łączyć autoryzacji: ADMIN jest celowo dopuszczony tylko do części operacji. Nie mylić userId i studentProfileId.

Odbiór: błędy, identyfikacja i role dla notatek, PKK, przypisania OSK, przypisania kursu i statusu uczestnika; niezmienione komunikaty/odpowiedzi. Historyczne, m.in. BE `7df69de1`, bez bezpośredniej przyczyny w UI. Zakres to mały helper, bez ogólnego repozytorium CRUD.

**Kroki wykonania:**

1. Zabezpieczyć statusy, kolejność błędów, role i identyfikatory dla pięciu operacji.
2. Wydzielić istniejący odczyt aktywnego studentProfileId do małego helpera w domenie students i podłączyć konsumentów.

**Kryteria odbioru:**

- [ ] Notatki, PKK, przypisanie OSK, przypisanie kursu i status uczestnika zachowują odpowiedzi i kolejność błędów.
- [ ] Różnice uprawnień ADMIN/MANAGER/INSTRUCTOR pozostają; userId nie zastępuje profileId.
- [ ] Sprawdzono diff, wykonano odpowiednie kontrole z zasad wspólnych i zapisano rzeczywiste wyniki poniżej.

**Dziennik wykonania — uzupełnić przy pracy:**

- Data i rezultat: jeszcze nie wykonywano.
- Faktycznie zmienione pliki: —.
- Kontrole / komendy / wyniki: —.
- Ograniczenia lub następny krok: —.

<a id="task-qa-04"></a>

### QA-04 — Odbiór zachowania po refaktorach

**Rodzaj:** Odbiór grupy, nie nowa zmiana funkcjonalna.

**Wymaga ukończenia:** REF-01 i REF-02; wcześniej QA-02.

**Zakres sprawdzenia:**

- [ ] Ponownie sprawdzić W19: hydratację, zmianę daty/godzin, options success/empty/error, domyślny koniec i zapis oraz dotknięte wspólne scenariusze dostępności. Nie trzeba mechanicznie powtarzać całego QA-02 bez związku ze zmianami.
- [ ] Sprawdzić pięć operacji kursanta, kolejność/statusy błędów i różnice ról oraz userId/studentProfileId.
- [ ] Porównać zachowanie przed/po, przejrzeć wspólny diff i wykonać odpowiednie testy/typy/lint FE oraz BE.

**Dziennik odbioru:**

- Data i stan kodu: jeszcze nie wykonano.
- Scenariusze / komendy / wyniki: —.
- Środowisko i ograniczenia: —.
- Wniosek i ewentualne punkty do ponownego otwarcia: —.

<a id="task-qual-02"></a>

### QUAL-02 — Node — zgodność CI i kontenerów

**Rodzaj:** Narzędzia.

**Wymaga technicznie:** Lokalny Docker do pełnego odbioru build/start obrazów; brak technicznej zależności od napraw aplikacji.

**Zalecana kolejność:** Po zmianach kodu, przed QA-05; można wcześniej, jeśli runtime blokuje testy.

**Nie wykonywać równolegle:** Ze zmianami tych samych Dockerfiles, CI i deklaracji runtime.

**Główne pliki do zmiany lub sprawdzenia kontraktu:**

- [Dockerfile](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/Dockerfile)
- [BE/Dockerfile](D:/CODE/OSK-Manager/BE/Dockerfile)
- [package.json](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/package.json)
- [BE/package.json](D:/CODE/OSK-Manager/BE/package.json)
- [.github/workflows/ci.yml](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/.github/workflows/ci.yml)
- [BE/.github/workflows/ci.yml](D:/CODE/OSK-Manager/BE/.github/workflows/ci.yml)

**Problem, dowód i granice zmiany:**

**Oddzielne zadanie narzędziowe. Koszt mały/średni, ryzyko średnie.** [FE package.json](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/package.json) wymaga Node >=24 <25; CI używa Node24, ale [FE Dockerfile](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/Dockerfile) i [BE Dockerfile](D:/CODE/OSK-Manager/BE/Dockerfile) używają 22.23. Wynik testów na24 nie potwierdza działania obrazu22. To niespójność konfiguracji, bez dowodu awarii produkcji.

Uzgodnić wersję zgodną z wymaganiami repo i sprawdzić oba buildy/start obrazów lokalnie. Bez publikacji, wdrożenia i zbiorczej aktualizacji zależności. FE Dockerfile sprzed bieżącego porównania (`ac14020`).

**Kroki wykonania:**

1. Potwierdzić deklarowane wymagania Node, wersję CI i wersje obu etapów Dockerfiles.
2. Uzgodnić runtime i zweryfikować budowanie oraz start obu obrazów.

**Kryteria odbioru:**

- [ ] Deklaracje, CI i runtime obrazu są zgodne; lokalne build/start FE i BE przeszły.
- [ ] Brak publikacji/deployu i niezwiązanych upgrade; jeśli brak Dockera, punkt pozostaje częściowo zweryfikowany.
- [ ] Sprawdzono diff, wykonano odpowiednie kontrole z zasad wspólnych i zapisano rzeczywiste wyniki poniżej.

**Dziennik wykonania — uzupełnić przy pracy:**

- Data i rezultat: jeszcze nie wykonywano.
- Faktycznie zmienione pliki: —.
- Kontrole / komendy / wyniki: —.
- Ograniczenia lub następny krok: —.

<a id="task-qa-05"></a>

### QA-05 — Odbiór końcowy całego zakresu

**Rodzaj:** Odbiór grupy, nie nowa zmiana funkcjonalna.

**Wymaga ukończenia:** Wszystkie 14 punktów zmian oraz QA-01–04.

**Zakres sprawdzenia:**

- [ ] Na końcowym stanie kodu wykonać kontrole FE: testy, typy, lint i build; BE: testy, typy, lint/format i build, zgodnie z aktualnymi skryptami.
- [ ] Potwierdzić wymagane wyniki integracji DB, celowanych E2E i build/start obu obrazów. Starszy wynik nadal jest dowodem tylko dla niezmienionego zakresu; ponowić kontrole dotknięte późniejszymi zmianami.
- [ ] Wykonać niezależny przegląd łącznego diffu i zapisać końcowy stan kodu oraz ograniczenia. Nie publikować obrazów i nie wdrażać aplikacji w ramach odbioru.

**Dziennik odbioru:**

- Data i stan kodu: jeszcze nie wykonano.
- Scenariusze / komendy / wyniki: —.
- Środowisko i ograniczenia: —.
- Wniosek i ewentualne punkty do ponownego otwarcia: —.

<a id="task-later-01"></a>

### LATER-01 — Typowane powody błędów harmonogramu

**Rodzaj:** Opcjonalny refaktor.

**Wymaga technicznie:** Wybranie tego opcjonalnego punktu i testy mapowań błędów.

**Zalecana kolejność:** Po ustabilizowaniu grupy 3 i jej odbiorze QA-02.

**Nie wykonywać równolegle:** Ze zmianami tych samych producentów/konsumentów błędów harmonogramu.

**Główne pliki do zmiany lub sprawdzenia kontraktu:**

- [BE/src/services/schedule-validation/check.ts](D:/CODE/OSK-Manager/BE/src/services/schedule-validation/check.ts)
- [BE/src/services/schedule-validation/options.ts](D:/CODE/OSK-Manager/BE/src/services/schedule-validation/options.ts)
- [BE/src/lib/http/AppError.ts](D:/CODE/OSK-Manager/BE/src/lib/http/AppError.ts)

**Problem, dowód i granice zmiany:**

**Po stabilizacji harmonogramu. Koszt średni, ryzyko średnie.** [check.ts:67](D:/CODE/OSK-Manager/BE/src/services/schedule-validation/check.ts:67) i dalsze mapowania opierają się na message/includes, m.in. „already in use”, „Student”, „package limit”. `options.ts` podobnie rozpoznaje zamknięty dzień szkoły. Zmiana tekstu może zmienić klasyfikację issue.

Jeśli realizowane: mały typ wewnętrznych powodów w tej domenie i mapper do istniejącego ScheduleAvailabilityIssue; zachowane status/payload/komunikaty HTTP. Najpierw testy każdego mapowania i błędów infrastruktury. Bez globalnego frameworka błędów. BE `d6b423f`; mniejszy priorytet niż odtworzone błędy.

**Kroki wykonania:**

1. Zebrać aktualnych producentów i konsumentów rozpoznawanych komunikatów oraz zabezpieczyć mapowanie testami.
2. Wprowadzić lokalne powody domenowe i mapper do istniejącego issue; zakres producentów doprecyzować przed edycją.

**Kryteria odbioru:**

- [ ] Każdy dotychczasowy powód mapuje się niezależnie od tekstu, a nieoczekiwany błąd infrastruktury nie udaje konfliktu.
- [ ] HTTP status, payload i komunikaty pozostają zgodne; bez globalnego frameworka błędów.
- [ ] Sprawdzono diff, wykonano odpowiednie kontrole z zasad wspólnych i zapisano rzeczywiste wyniki poniżej.

**Dziennik wykonania — uzupełnić przy pracy:**

- Data i rezultat: jeszcze nie wykonywano.
- Faktycznie zmienione pliki: —.
- Kontrole / komendy / wyniki: —.
- Ograniczenia lub następny krok: —.

<a id="task-later-02"></a>

### LATER-02 — Nieaktywne dialogi konta

**Rodzaj:** Opcjonalne porządki; W02.

**Wymaga technicznie:** Wybranie punktu i ponowna kontrola autoimportów/dynamicznych użyć.

**Zalecana kolejność:** Przy okazji pracy w koncie; poza domyślną kolejką.

**Nie wykonywać równolegle:** Ze zmianami usuwanych dialogów i strony konta.

**Główne pliki do zmiany lub sprawdzenia kontraktu:**

- [app/components/app/AccountProfileNamesFormDialog.vue](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/app/components/app/AccountProfileNamesFormDialog.vue)
- [app/components/app/AccountProfileContactFormDialog.vue](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/app/components/app/AccountProfileContactFormDialog.vue)
- [app/pages/account/index.vue](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/app/pages/account/index.vue)

**Problem, dowód i granice zmiany:**

**Opcjonalne; mała korzyść. Koszt mały, ryzyko niskie.** AccountProfileNamesFormDialog i AccountProfileContactFormDialog nie mają odnalezionych konsumentów; konto korzysta z edycji inline. Przed usunięciem powtórzyć kontrolę autoimportów/dynamicznych odwołań. Wystarczy typecheck/build; bez testu „plik nie istnieje”.

Nie usuwać ManagerLessonRatingsFilters: wbrew starej notatce UI_REFRESH_PLAN jest obecnie używany przez manager/reviews. Historyczna lista nie jest aktualnym dowodem martwego kodu.

**Kroki wykonania:**

1. Sprawdzić importy, autoimporty i dynamiczne użycia obu dialogów.
2. Usunąć tylko potwierdzony martwy kod i powiązane odwołania dokumentacyjne.

**Kryteria odbioru:**

- [ ] Edycja inline konta działa, typecheck/build przechodzą.
- [ ] ManagerLessonRatingsFilters pozostaje — ma konsumenta. Bez testu sprawdzającego samo nieistnienie pliku.
- [ ] Sprawdzono diff, wykonano odpowiednie kontrole z zasad wspólnych i zapisano rzeczywiste wyniki poniżej.

**Dziennik wykonania — uzupełnić przy pracy:**

- Data i rezultat: jeszcze nie wykonywano.
- Faktycznie zmienione pliki: —.
- Kontrole / komendy / wyniki: —.
- Ograniczenia lub następny krok: —.

<a id="task-later-03"></a>

### LATER-03 — Mock opinii — zgodne filtry dat

**Rodzaj:** Opcjonalna jakość testów; W21/W30.

**Wymaga technicznie:** Wybranie punktu i deterministyczny czas w testach; BUG-03 nie jest zależnością.

**Zalecana kolejność:** Przy kolejnej pracy nad testami opinii.

**Nie wykonywać równolegle:** Ze zmianami tych samych mocków ratings i ich testów.

**Główne pliki do zmiany lub sprawdzenia kontraktu:**

- [server/utils/ratings/ratingsMockBff.ts](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/server/utils/ratings/ratingsMockBff.ts)
- [server/utils/ratings/lessonRatingsBff.ts](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/server/utils/ratings/lessonRatingsBff.ts)
- [server/utils/ratings/lessonRatingsBff.test.ts](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/server/utils/ratings/lessonRatingsBff.test.ts)
- [BE/src/services/lesson-rating/dateFilters.ts](D:/CODE/OSK-Manager/BE/src/services/lesson-rating/dateFilters.ts)

**Problem, dowód i granice zmiany:**

**Przy następnym zadaniu testowym opinii. Koszt mały/średni, ryzyko niskie dla produkcji.** [ratingsMockBff.ts](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/server/utils/ratings/ratingsMockBff.ts) pomija period/dateFrom/dateTo managera. Własny mock dla last7days używa today-7 i tylko dolnej granicy; [BE dateFilters.ts](D:/CODE/OSK-Manager/BE/src/services/lesson-rating/dateFilters.ts) używa today-6 i <tomorrow. Reprodukcja managera: all i last7days zwracają te same czerwcowe rekordy w dniu audytu w październiku.

Deterministyczny czas/fixtures, zgodne granice i testy manager/own. Nie zmieniać przy okazji semantyki produkcyjnego last30days ani tworzyć wspólnego pakietu. To luka wiarygodności testów, nie wykazany błąd produkcyjnego filtrowania. Pochodzenie mieszane: dawny mock, W21 `c3dfb3a`, własne okresy W30 `5499235`. Mock instruktora jest częścią BUG-02.

**Kroki wykonania:**

1. Użyć deterministycznego czasu i fixtures oraz porównać granice filtrów manager/own z backendem.
2. Obsłużyć okres i jawne daty w mocku managera, wyrównać last7days własnych opinii.

**Kryteria odbioru:**

- [ ] All/last7days i zakres jawnych dat zwracają właściwe różne zbiory; granice i paginacja mają testy.
- [ ] Nie zmienia się produkcyjna semantyka last30days ani architektura współdzielenia kodu FE–BE.
- [ ] Sprawdzono diff, wykonano odpowiednie kontrole z zasad wspólnych i zapisano rzeczywiste wyniki poniżej.

**Dziennik wykonania — uzupełnić przy pracy:**

- Data i rezultat: jeszcze nie wykonywano.
- Faktycznie zmienione pliki: —.
- Kontrole / komendy / wyniki: —.
- Ograniczenia lub następny krok: —.

## Wspólne zasady wykonania

- Osobne polecenie użytkownika uruchamia implementację.
- Małe partie; najwyżej trzech subagentów równolegle, zgodnie z dostępnym limitem.
- Jeden aktywny właściciel edycji każdego pliku. Zmiany wspólnych kontraktów poprzedzają zależne zadania.
- Główny agent kontroluje diffy, integrację i końcowe kontrole. Raport wykonawcy nie zastępuje odbioru.
- Zachowujemy publiczne kontrakty i zaakceptowane zachowanie; naprawy błędów mają osobny zakres.
- Bez commitów, pushów, migracji i wdrożeń wynikających tylko z tego dokumentu.

## Przygotowanie i bramka wejścia

1. Sprawdzić HEAD i lokalne zmiany względem mapy audytu. Przy zmianie kodu ponownie zweryfikować dowody w dotkniętej domenie; nie powtarzać automatycznie całego audytu.
2. QUAL-01: osobny mały diff formatowania pięciu plików FE i trzech BE. Sprawdzić, że nie zmienia semantyki. Zrobić to przed przydzieleniem tych plików innym agentom.
3. Ustalić rzeczywiste skrypty package.json i runtime. W tym środowisku shim Volta był niedostępny; lokalne CLI uruchomiono bezpośrednio Node24. Nie instalować nowego toolchainu tylko dlatego, że shim nie działa.
4. Zapisać aktualne wyniki kontroli. Jeżeli test reprodukujący domniemany problem przechodzi na niezmienionym kodzie, sprawdzić jego wiarygodność i założenia przed implementacją.

## Równoległość wewnątrz grup

Praca od góry po jednym punkcie jest domyślna. Przy poleceniu wykonania całej grupy koordynator może wykorzystać maksymalnie trzech subagentów. Odbioru QA nie wykonujemy przed zakończeniem wymaganych zmian.

| Grupa | Co można rozdzielić                                | Co musi zostać skoordynowane                                                                                                                            |
| ----- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | Odczyt wyników FE i BE                             | Jedna ograniczona zmiana formatowania przed edycją tych plików przez innych                                                                             |
| 2     | BUG-01, BUG-02, BUG-03; BUG-04 po zwolnieniu slotu | Rozłączne pliki; QA-01 po wszystkich czterech                                                                                                           |
| 3     | BUG-06 i BUG-07 w BE oraz BUG-05 w FE              | BUG-10 po ustaleniu zakresu BUG-05, jeśli dotyka W20; BUG-08 w osobnym module; wspólne helpery/testy mają jednego właściciela; QA-02 po pięciu punktach |
| 4     | Analiza testu awarii i niezależny przegląd BUG-09  | Jedna implementacja transakcji; QA-03 używa też rezultatu BUG-02                                                                                        |
| 5     | REF-01 w FE i REF-02 w BE                          | Start po bramce QA-02; QA-04 po obu refaktorach                                                                                                         |
| 6     | Analiza obu obrazów i niezależny przegląd          | Jedna uzgodniona wersja runtime; globalne buildy/testy planuje koordynator; QA-05 odbiera cały zakres                                                   |

Nie uruchamiać kilku pełnych buildów/E2E jednocześnie. Przy pojedynczym małym zadaniu dodatkowy agent może przejrzeć diff zamiast równolegle zmieniać kod.

## Granice zadań i właściciele plików

| Zadanie | Główna powierzchnia zmiany                                                           | Konsumenci do sprawdzenia / poza zakresem                                                 |
| ------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| BUG-01  | useVehicleEditPage + istniejący test; ewentualnie scenariusz browser                 | W25 i sekcja zdjęcia; bez przebudowy uploadu BE                                           |
| BUG-02  | useManagerInstructorDetailsEdit, jego test, mockInstructorsList i test mocka         | W10, normalizer name/experience, kształt PATCH; bez zmiany kontraktu backendu             |
| BUG-03  | useRoleDashboardPage, RoleDashboardContent i test                                    | Pulpit instruktora i brak opinii; bez pobierania wszystkich stron                         |
| BUG-04  | ManagerStudentPaymentsSection, powiązanie create/success i test                      | W08 i T01; nie zmieniać modelu płatności                                                  |
| BUG-05  | useDebouncedAbortableRequest lub lokalna koordynacja W27; test prawdziwego helpera   | Recheck i auto:false w edycji lekcji/wydarzeń; nie zmieniać fallbacku produktu bez dowodu |
| BUG-06  | BE lib/lesson-scheduling, vehicle/queries i scenariusze testowe                      | Uczestnik teorii, selektor pojazdu, validator zapisu; zachować historię                   |
| BUG-07  | BE school-availability/busyLessons, dateHelpers/queries tylko w niezbędnym zakresie  | Ponownie użyć polishScheduleTime; bez globalnego zastępowania UTC                         |
| BUG-08  | BE manager-attention/items i istniejące testy                                        | Defaults/daty/urlopy, sort/limit/hiddenCount; bez generatora slotów dla wszystkich        |
| BUG-09  | BE instructor/commands i testy zapisu                                                | Powiązane profile/user/qualifications; bez redefiniowania PATCH                           |
| BUG-10  | useManagerLessonEditForm + istniejący test i kontrola kontraktu                      | Granice czasu razem, pozostały payload nadal minimalny                                    |
| REF-01  | useManagerEventEditForm, TimePicker, TimeSplit, nieużywane slots/utility i ich testy | W19 options success/empty/error, hydratacja i domyślny koniec                             |
| REF-02  | BE students/profileMutations, courseParticipants, mały helper domeny i testy         | Pięć operacji, kolejność błędów, różnice ADMIN/MANAGER/INSTRUCTOR                         |
| QUAL-02 | Oba Dockerfiles, uzgodniona konfiguracja runtime jeśli konieczna                     | Build/start FE i BE; bez push/deploy i masowych upgrade'ów                                |

Nazwy oznaczają pliki wskazane pełnymi ścieżkami w mapie i ustaleniach. To granica początkowa: przed dołączeniem nowego pliku agent zgłasza koordynatorowi potrzebę zmiany zakresu; nie wymaga to osobnego pytania użytkownika o każdą rutynową decyzję implementacyjną.

## Instrukcja dla wykonującego subagenta

Przekaż agentowi konkretny identyfikator zadania, dowód, zarezerwowane pliki, konsumentów i poniższe wymagania:

> Zweryfikuj problem na bieżącym kodzie. Wykonaj najmniejszą zmianę realizującą wskazany rezultat. Zachowaj zaakceptowane zachowanie poza opisaną naprawą, kontrakty API, role, kontekst szkoły i wygląd. Dla naprawy najpierw pokaż test lub powtarzalny scenariusz odtwarzający błąd; dla refaktoru zabezpiecz istotne obecne zachowanie. Nie dodawaj abstrakcji lub formatowania poza zakresem. Nie edytuj plików innych właścicieli i nie cofaj cudzych zmian. Zwróć: zmienione pliki, rezultat, wykonane komendy i wyniki, ryzyka oraz niewykonane sprawdzenia. Jeśli dowód okaże się nieaktualny, zgłoś to i nie wymuszaj zmiany.

Koordynator utrzymuje jedną kolejkę plików, rozdziela zadania według domen, kontroluje wspólne kontrakty oraz wykonuje odbiór integracji. Dla szczególnie istotnych zmian harmonogramu i autoryzacji drugi agent przegląda gotowy diff niezależnie od autora. Liczba agentów dostosowuje się do limitu narzędzia; brak slotu nie uzasadnia tworzenia nowych rozmów użytkownika.

## Weryfikacja i definicja ukończenia

- Na zadanie: celowane testy wskazanego scenariusza, kontrola konsumentów i diff bez niepowiązanych zmian. Testy mają wykrywać błąd lub chronić zachowanie, nie kopiować implementację.
- Po integracji istotnej partii: odpowiedni zestaw unit/typecheck/lint; pełne suite uruchamia koordynator raz na stabilnym stanie. Powtórka po nowych zmianach lub nowych błędach, nie automatycznie bez powodu.
- Przed finalnym odbiorem zmian aplikacji: FE test/typecheck/lint/build; BE test/tsc/lint/format/build według aktualnych skryptów. Mock E2E dla dotkniętych ekranów i wąskie testy kontraktu rzeczywistego BFF/BE. Przechodzący mock nie zastępuje kontraktu backendu.
- Harmonogram: anulowana teoria z uczestnikiem, anulowany DRIVE z autem, preflight i końcowy zapis, jedna zmieniona granica, lato/zima/DST. Nie wystarczy test pojedynczego utility.
- Dane/autoryzacja: REF-02 zachowuje kolejność i statusy błędów oraz uprawnienia. BUG-09 wymaga rollbacku na izolowanej DB. Runner integracyjny wykonuje migracje, więc użyć wyłącznie jawnie testowej bazy.
- Dla wizualnie niezmiennego refaktoru sprawdzić dotknięty formularz/kalendarz w desktop i mobile, także error/empty/loading. Nie przerabiać layoutu przy okazji.
- Raport końcowy zawiera wyniki, ograniczenia, brakujące sprawdzenia i link do diffu/planu; nie stwierdza „brak regresji” wyłącznie dlatego, że unit tests są zielone.

Każda partia powinna nadawać się do oddzielnego wycofania. Przy regresji wycofać konkretną zmianę danego zadania, zachowując niezależne prace i dane użytkownika. Nie planujemy migracji schematu dla wymienionych refaktorów.

## Odłożone i dalszy przegląd

LATER-01 typowane powody błędów rozważyć po ustabilizowaniu domeny harmonogramu. LATER-02 dialogi konta usunąć tylko przy okazji uzasadnionych porządków. LATER-03 poprawić mock filtrów przy następnych testach opinii. Nie są zależnościami wdrożenia pozostałych zadań.

Mapa zawiera również pliki tylko wstępnie przeskanowane. Dalszy audyt może obejmować pozostałe szablony UI, event-create/participants, pozostałe BFF i testy integracyjne. Sama etykieta W nie tworzy zadania refaktoru. Awans do planu wymaga konkretnego dowodu, korzyści i sposobu ochrony zachowania.

## Zamknięcie planu

Jedynym końcowym wpisem odbioru jest karta QA-05 i jej checkbox na początku dokumentu. Plan jest ukończony po zamknięciu 14 punktów zmian oraz QA-01–05; LATER-01–03 pozostają poza tym warunkiem. Nie dublować statusu w drugiej tabeli.

Ta aktualizacja zmieniła kolejność, grupowanie i opis zależności. Nie wdrożono żadnej poprawki aplikacji i nie odhaczono żadnego punktu.
