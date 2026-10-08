# Scenariusze manualne — menedżer OSK

Stan dokumentu: scenariusze audytu opracowane z aktualnego kodu FE/BE. `P0` oznacza proces konieczny do odbioru, `P1` ważny, `P2` uzupełniający. Identyfikatory `REQ-MGR-*` mają wpisy w rejestrze wymagań. Ten plik opisuje oczekiwane zachowanie do sprawdzenia; nie jest zapisem wykonanego testu.

## Zasady wykonania

- Testuj na środowisku z podłączonym backendem i bazą, na koncie `MANAGER` przypisanym do testowej szkoły. Tryb mock BFF nie potwierdza trwałości danych. Po zapisie odśwież widok, a przy procesach kluczowych zaloguj się ponownie.
- Nazwy danych poniżej oznaczają **stany docelowe**, jeszcze nie gotowe presety seeda: `manager-only` (konto bez OSK), `school-empty`, `school-staffed`, `course-ready`, `student-enrolled`, `booking-ready`, `booking-conflict`, `payment-ready`, `rated-lesson`. Wybieraj unikalne e-maile, rejestracje i nazwy z prefiksem przebiegu, np. `AUD-2026-10-08`.
- Dla każdego przypadku zapisz `OK / błąd / zablokowane`, wersję aplikacji, środowisko, czas, dane identyfikujące rekord oraz dowód. Błąd opisz w `../findings.md`, a w wyniku przebiegu odwołaj się do jego ID.
- Gdy zachowanie nie jest określone przez produkt lub aktualny kod, oznaczono je jako **do decyzji**. Nie zaliczaj takiego wymagania na podstawie przypuszczenia.

## Szkoły jazdy

### MGR-OSK-01 — Utworzenie pierwszej szkoły [P0]

**Wymaganie:** `REQ-MGR-OSK-01` — menedżer może utworzyć szkołę i rozpocząć pracę w jej kontekście. **Dane:** `manager-only`; unikalna nazwa, miasto i adres. **Warunek:** konto ma rolę `MANAGER`, brak przypisanej OSK.

1. Otwórz **Szkoły jazdy** (`/manager/osk`) i sprawdź stan pusty.
2. Wybierz **Dodaj OSK**, wpisz nazwę, miasto i adres; wyślij formularz.
3. Odśwież listę i otwórz **Kursy** oraz **Kursanci**.

**Oczekiwane:** szkoła występuje raz na liście po odświeżeniu, a widoki zależne od szkoły pozwalają ją wybrać. Jeśli jest jedyną OSK, jej domyślny kontekst powinien być czytelny; dokładną regułę automatycznego ustawienia domyślnej OSK potwierdzić z właścicielem produktu. **Powtórzenie:** usuń utworzoną testową szkołę, o ile nie ma danych zależnych, lub przywróć `manager-only`. **Źródła:** [strona OSK](../../../app/pages/manager/osk/index.vue), [formularz](../../../app/components/manager/osk/ManagerOskSchoolFormDialog.vue), [trasa BE](../../../../../BE/src/routes/driving-schools.routes.ts).

### MGR-OSK-02 — Edycja i wybór szkoły domyślnej [P1]

**Wymaganie:** `REQ-MGR-OSK-02` — zmiany danych i domyślnego kontekstu OSK utrzymują się. **Dane:** dwie testowe OSK przypisane menedżerowi.

1. Na liście szkół edytuj nazwę lub adres pierwszej OSK; zapisz i odśwież.
2. Ustaw drugą OSK jako domyślną.
3. Otwórz **Harmonogram OSK**, **Kursy** i **Instruktorzy**; sprawdź wskazaną szkołę. Wyloguj się i zaloguj ponownie.

**Oczekiwane:** nowe dane widnieją na liście; tylko jedna OSK jest oznaczona jako domyślna; po ponownym logowaniu domyślny kontekst jest spójny. **Uwaga:** część widoków może zachowywać własny bieżący wybór szkoły, a harmonogram może mieć `schoolId` w URL — sprawdzaj osobno „wybrana” i „domyślna”. **Powtórzenie:** przywróć pierwotne dane i domyślną OSK. **Źródła:** [strona OSK](../../../app/pages/manager/osk/index.vue), [harmonogram](../../../app/pages/manager/schedule/index.vue), [kontekst szkoły](../../../docs/SCHOOL_CONTEXT.md).

### MGR-OSK-03 — Odrzucenie i potwierdzenie usunięcia OSK [P1]

**Wymaganie:** `REQ-MGR-OSK-03` — usunięcie szkoły wymaga świadomego potwierdzenia. **Dane:** druga, zbędna testowa OSK bez krytycznych danych; nie używaj jedynej lub głównej szkoły przebiegu.

1. Na liście szkół wybierz **Usuń** dla testowej OSK i anuluj dialog.
2. Odśwież: szkoła nadal istnieje.
3. Ponownie wybierz **Usuń** i potwierdź.

**Oczekiwane:** anulowanie nie zmienia danych; po potwierdzeniu szkoła znika albo UI pokazuje konkretny błąd zależności i zachowuje rekord. **Do decyzji:** biznesowa polityka usuwania szkoły z instruktorami, kursami i historią; osobny test po jej ustaleniu. **Powtórzenie:** odtwórz drugą OSK. **Źródła:** [dialog](../../../app/components/manager/osk/ManagerOskDeleteDialog.vue), [strona OSK](../../../app/pages/manager/osk/index.vue).

## Kadra i dostępność

### MGR-INS-01 — Rejestracja instruktora [P0]

**Wymaganie:** `REQ-MGR-INS-01` — menedżer może założyć konto instruktora w OSK. **Dane:** `school-empty`, unikalny adres e-mail, dane osobowe, numer uprawnień, kategorie.

1. Otwórz **Instruktorzy → Dodaj instruktora** (`/manager/instructors/new`).
2. Wybierz OSK i uzupełnij wymagane pola, w tym datę urodzenia i kwalifikacje; wyślij formularz.
3. Otwórz listę i szczegóły nowego instruktora; odśwież.

**Oczekiwane:** instruktor jest widoczny raz we właściwej szkole; szczegóły pokazują zapisane dane. Dane konta logowania sprawdź w scenariuszu między rolami. **Powtórzenie:** usuń instruktora testowego i konto Auth zgodnie z przyszłym resetem albo użyj nowego e-maila. **Źródła:** [formularz rejestracji](../../../app/pages/manager/instructors/new.vue), [opis modułu](../../../docs/MANAGER_INSTRUCTORS.md), [trasa BE](../../../../../BE/src/routes/instructors.routes.ts).

### MGR-INS-02 — Walidacja i niezapisany formularz instruktora [P1]

**Wymaganie:** `REQ-MGR-INS-02` — błędne dane nie tworzą konta, a niezapisany formularz ostrzega przed wyjściem. **Dane:** `school-empty`.

1. Otwórz formularz dodawania instruktora i wyślij go pusty.
2. Wpisz przyszłą datę urodzenia oraz popraw część pól; wyślij ponownie.
3. Zmień dowolne pole i spróbuj przejść do innego widoku; wybierz **Zostań**, a potem ponów i wybierz odrzucenie.

**Oczekiwane:** pola błędne są oznaczone, fokus prowadzi do pierwszego błędu; konto nie powstaje; pozostanie zachowuje draft, odrzucenie opuszcza stronę. **Powtórzenie:** brak zmian danych. **Źródła:** [formularz](../../../app/pages/manager/instructors/new.vue), [opis walidacji](../../../docs/MANAGER_INSTRUCTORS.md).

### MGR-INS-03 — Edycja profilu i usunięcie instruktora [P1]

**Wymaganie:** `REQ-MGR-INS-03` — menedżer może zmienić edytowalne dane profilu; usuwanie ma dialog. **Dane:** `school-staffed`, instruktor bez krytycznych przyszłych lekcji do usunięcia.

1. Otwórz szczegóły instruktora i **Edytuj**; zmień np. doświadczenie lub kwalifikację, zapisz.
2. Odśwież szczegóły i listę.
3. Otwórz dialog usunięcia, anuluj, odśwież; następnie potwierdź dla tego samego testowego instruktora.

**Oczekiwane:** edycja jest trwała; e-mail z tego formularza pozostaje tylko do odczytu (osobną zmianę ma panel kont). Anulowanie nie zmienia konta. Obecny backend po potwierdzeniu akcji „Usuń instruktora” przez menadżera blokuje konto i unieważnia jego sesje; nie kasuje konta Auth ani historii. Jeśli ma miejsce odmowa, zapisz dokładny powód. **Do decyzji:** czy nazwa i skutki tej akcji odpowiadają docelowej polityce produktu; archiwizacja w panelu kont jest osobnym procesem. **Powtórzenie:** odblokuj konto w panelu kont lub odtwórz instruktora. **Źródła:** [szczegóły](../../../app/pages/manager/instructors/[id]/index.vue), [dialog edycji](../../../app/components/manager/instructors/ManagerInstructorEditDialog.vue), [dialog usunięcia](../../../app/components/manager/instructors/ManagerInstructorDeleteDialog.vue), [usługa BE](../../../../../BE/src/services/instructor/commands.ts).

### MGR-INS-04 — Tygodniowa dostępność instruktora [P0]

**Wymaganie:** `REQ-MGR-INS-04` — menedżer ustawia i usuwa przedział dostępności na dzień tygodnia. **Dane:** `school-staffed`, instruktor bez lekcji w wybranym dniu.

1. W szczegółach instruktora wejdź w **Dostępność**.
2. Włącz dzień, ustaw np. `09:00–14:00`, zapisz ten dzień; odśwież stronę i podgląd w szczegółach.
3. Spróbuj ustawić koniec przed początkiem; następnie wyłącz dzień i zapisz.

**Oczekiwane:** poprawny przedział jest widoczny po odświeżeniu; błędny zakres nie zostaje zapisany; po wyłączeniu wpis dnia znika. **Powtórzenie:** przywróć pierwotny przedział. **Źródła:** [strona dostępności](../../../app/pages/manager/instructors/[id]/availability.vue), [opis modelu tygodniowego](../../../docs/MANAGER_INSTRUCTORS.md), [trasa BE](../../../../../BE/src/routes/instructor-availability.routes.ts).

### MGR-INS-05 — Terminarz i wolne sloty instruktora [P1]

**Wymaganie:** `REQ-MGR-INS-05` — menadżer może obejrzeć harmonogram konkretnego instruktora i jego wolne sloty, a rezerwacja wybranego slotu aktualizuje oba widoki. **Dane:** `instructor-schedule` z wolnym slotem w przyszłości, kursantem uprawnionym do kursu praktycznego i dostępnym pojazdem.

1. Otwórz szczegóły instruktora, następnie **Terminarz** i przejdź do tygodnia z przygotowanymi pozycjami.
2. Porównaj jazdy, teorię i bloki z zestawem; przejdź do **Wolnych slotów** tego samego instruktora.
3. Wybierz przygotowany wolny slot i zarezerwuj jazdę dla uprawnionego kursanta.
4. Odśwież oba widoki oraz Harmonogram OSK.

**Oczekiwane:** terminarz pokazuje wyłącznie pozycje wybranego instruktora; wolny slot jest dostępny przed rezerwacją; po zapisie jazda pojawia się dokładnie raz we właściwym tygodniu w terminarzu instruktora i OSK, a zajęty slot nie jest już oferowany jako wolny. **Powtórzenie:** odtwórz `instructor-schedule` i powiązane dane rezerwacji. **Źródła:** [terminarz instruktora](../../../app/pages/manager/instructors/[id]/schedule.vue), [wolne sloty](../../../app/pages/manager/instructors/[id]/slots.vue), [trasa dostępności](../../../../../BE/src/routes/instructor-availability.routes.ts).

## Oferta, kursanci i opłaty

### MGR-CRS-01 — Utworzenie kursu [P0]

**Wymaganie:** `REQ-MGR-CRS-01` — menedżer tworzy kurs w wybranej OSK. **Dane:** `school-staffed`, kategoria z oferty OSK lub jawny kod kategorii, poprawna liczba godzin.

1. Otwórz **Kursy → Dodaj kurs** (`/manager/courses/new`).
2. Uzupełnij nazwę, kategorię, rodzaj kursu, liczbę godzin i pola właściwe dla wybranego rodzaju; wybierz instruktora, jeśli jest kwalifikowany.
3. Zapisz, otwórz szczegóły i odśwież listę.

**Oczekiwane:** kurs występuje raz we właściwej szkole, a szczegóły pokazują wybrane parametry i instruktora. **Powtórzenie:** użyj nowej nazwy w nowym przebiegu lub resetuj dane kursów. **Źródła:** [strona dodawania](../../../app/pages/manager/courses/new.vue), [pola podstawowe](../../../app/components/manager/courses/CourseCreateBasicFields.vue), [trasa BE](../../../../../BE/src/routes/courses.routes.ts).

### MGR-CRS-02 — Walidacja kursu i ograniczenie instruktora [P1]

**Wymaganie:** `REQ-MGR-CRS-02` — formularz odrzuca brak pól i niepasujące przypisanie. **Dane:** `school-staffed` z instruktorem kwalifikowanym i niekwalifikowanym dla wybranej kategorii.

1. Wyślij pusty formularz nowego kursu.
2. Wprowadź niepoprawną liczbę godzin i popraw pozostałe pola.
3. Sprawdź listę instruktorów po wyborze kategorii; spróbuj zapisać z niekwalifikowanym, jeśli UI go pokazuje.

**Oczekiwane:** formularz pokazuje błędy i nie tworzy kursu; wybór instruktora jest zgodny z kwalifikacjami. **Do decyzji:** dokładna polityka kategorii, gdy OSK nie ma skonfigurowanej oferty. **Powtórzenie:** brak danych do czyszczenia. **Źródła:** [formularz](../../../app/components/manager/courses/CourseCreateForm.vue), [pole instruktora](../../../app/components/manager/courses/CourseCreateInstructorField.vue), [test usługi BE](../../../../../BE/src/__tests__/services/instructor-qualified-course-types.test.ts).

### MGR-CRS-03 — Zmiana instruktora i przegląd uczestników kursu [P1]

**Wymaganie:** `REQ-MGR-CRS-03` — menedżer widzi zapełnienie i może zmienić przypisanie instruktora. **Dane:** `course-ready`, dwóch kwalifikowanych instruktorów, co najmniej jeden zapisany kursant.

1. Otwórz szczegóły kursu i zakładki **Przegląd**, **Uczestnicy**, **Instruktor**.
2. Sprawdź liczbę uczestników; wybierz drugiego instruktora i zapisz przypisanie.
3. Odśwież szczegóły.

**Oczekiwane:** uczestnik jest na liście, zapełnienie odpowiada liczbie zapisanych; nowy instruktor jest widoczny po odświeżeniu. **Do decyzji:** wpływ zmiany instruktora kursu na istniejące rezerwacje. **Powtórzenie:** przywróć pierwotne przypisanie. **Źródła:** [szczegóły kursu](../../../app/components/manager/courses/ManagerCourseDetailContainer.vue), [przypisanie](../../../app/components/manager/courses/ManagerCourseInstructorAssignmentCard.vue).

### MGR-STU-01 — Rejestracja kursanta i przypisanie do kursu [P0]

**Wymaganie:** `REQ-MGR-STU-01` — menedżer dodaje kursanta do OSK i przypisuje do kursu. **Dane:** `course-ready`, unikalny e-mail kursanta.

1. Otwórz **Kursanci** (`/manager/students`), wybierz szkołę i **Dodaj kursanta**; uzupełnij wymagane pola, zapisz.
2. Znajdź nowego kursanta na liście, użyj **Przypisz kurs** i wybierz kurs.
3. Otwórz szczegóły kursanta, zakładkę **Kursy**, a potem szczegóły kursu, zakładkę **Uczestnicy**; odśwież oba widoki.

**Oczekiwane:** kursant jest widoczny raz w odpowiedniej OSK, a przypisanie jest spójne w obydwu kartotekach. **Powtórzenie:** reset kursantów i zapisów albo nowy e-mail; uwzględnij konto Auth. **Źródła:** [lista kursantów](../../../app/pages/manager/students/index.vue), [formularz](../../../app/components/manager/students/ManagerStudentFormDialog.vue), [dialog przypisania](../../../app/components/manager/students/ManagerStudentAssignCourseDialog.vue), [trasa BE](../../../../../BE/src/routes/students.routes.ts).

### MGR-STU-02 — Wyszukiwanie, filtrowanie i szczegóły kursanta [P1]

**Wymaganie:** `REQ-MGR-STU-02` — menedżer odnajduje kursanta bez mieszania szkół i przegląda jego postęp. **Dane:** dwie OSK, kilku kursantów, jeden kursant z PKK i historią lekcji.

1. Na liście **Kursanci** wybierz pierwszą OSK, wpisz fragment nazwiska, wybierz filtr kursu i szybki lub zaawansowany filtr.
2. Wyczyść filtry, przełącz na drugą OSK i sprawdź listę.
3. Otwórz profil kursanta i przejdź przez **Przegląd**, **Lekcje**, **Płatności**, **Kursy**.

**Oczekiwane:** wyniki i licznik odpowiadają wybranej szkole i filtrom; wyczyszczenie przywraca listę; szczegóły zawierają właściwego kursanta, jego status procesu, lekcje i kursy. **Powtórzenie:** bez zmian danych. **Źródła:** [lista](../../../app/pages/manager/students/index.vue), [zakładki profilu](../../../app/components/manager/students/ManagerStudentDetailsContent.vue), [test usługi BE](../../../../../BE/src/__tests__/services/students-list.test.ts).

### MGR-PAY-01 — Dodanie, edycja i rozliczenie płatności [P0]

**Wymaganie:** `REQ-MGR-PAY-01` — menedżer zarządza płatnościami kursanta. **Dane:** `payment-ready`: kursant z przypisanym kursem i planem płatności, bez płatności o testowej kwocie.

1. Otwórz profil kursanta → **Płatności**. Wybierz plan, wpisz kwotę, termin i metodę; kliknij **Dodaj**.
2. Odśwież; zmień edytowalne pole nowego wpisu i zapisz.
3. Oznacz płatność jako zapłaconą, odśwież; następnie oznacz jako niezapłaconą.

**Oczekiwane:** wpis powstaje dokładnie raz; kwota, termin, metoda i status utrzymują się po odświeżeniu; podsumowanie płatności aktualizuje się zgodnie z wpisem. **Powtórzenie:** usuń testową płatność przez reset danych, ponieważ w widoku nie potwierdzono osobnej akcji kasowania. **Źródła:** [sekcja płatności](../../../app/components/manager/students/ManagerStudentPaymentsSection.vue), [formularz płatności](../../../app/components/manager/students/ManagerStudentPaymentCreateForm.vue), [test usługi BE](../../../../../BE/src/__tests__/services/student-payments.test.ts).

## Pojazdy

### MGR-VEH-01 — Dodanie i edycja pojazdu [P0]

**Wymaganie:** `REQ-MGR-VEH-01` — menedżer zarządza flotą swojej OSK. **Dane:** `school-empty`, unikalny numer rejestracyjny i dane techniczne pojazdu.

1. Otwórz **Pojazdy → Dodaj pojazd**, wypełnij wymagane pola i zapisz.
2. Znajdź pojazd na liście, otwórz szczegóły, następnie **Edytuj** i zmień jedno pole.
3. Odśwież listę i szczegóły.

**Oczekiwane:** pojazd występuje raz w wybranej OSK, ma właściwą rejestrację i edycja utrzymuje się. **Powtórzenie:** usuń testowy pojazd lub resetuj flotę. **Źródła:** [strona listy](../../../app/pages/vehicles/index.vue), [tworzenie](../../../app/pages/vehicles/new.vue), [edycja](../../../app/pages/vehicles/[id]/edit.vue), [trasa BE](../../../../../BE/src/routes/vehicles.routes.ts).

### MGR-VEH-02 — Status, domyślny pojazd i usunięcie [P1]

**Wymaganie:** `REQ-MGR-VEH-02` — menedżer zmienia operacyjny status i domyślny pojazd, a usunięcie potwierdza. **Dane:** dwa testowe pojazdy w jednej OSK, bez przyszłych rezerwacji na pojeździe do usunięcia.

1. Na liście floty zmień status jednego pojazdu na niedostępny; odśwież i sprawdź filtr statusu.
2. Ustaw drugi pojazd jako domyślny; odśwież.
3. Otwórz usuwanie pierwszego pojazdu, anuluj, potem potwierdź.

**Oczekiwane:** status i domyślny pojazd są trwałe; anulowanie nie usuwa; potwierdzenie usuwa albo zwraca zrozumiały błąd zależności. **Do decyzji:** zasady usuwania pojazdu z historią lub przyszłymi jazdami. **Powtórzenie:** odtwórz pierwszy pojazd i status domyślny. **Źródła:** [lista](../../../app/components/vehicles/VehiclesListPanel.vue), [dialog](../../../app/components/vehicles/VehicleDeleteDialog.vue), [test statusu BE](../../../../../BE/src/__tests__/services/vehicle-status.test.ts).

## Harmonogram i lekcje

### MGR-SCH-01 — Tygodniowy harmonogram OSK i wybór szkoły [P0]

**Wymaganie:** `REQ-MGR-SCH-01` — menedżer widzi właściwy plan jazd i wydarzeń swojej OSK. **Dane:** dwie OSK, w pierwszej jazda i blok teorii w znanym tygodniu, w drugiej odrębny wpis.

1. Otwórz **Harmonogram OSK** (`/manager/schedule`), wybierz pierwszą szkołę i przejdź do tygodnia danych.
2. Sprawdź jazdę i teorię w odpowiednich dniach/godzinach; przełącz na drugą szkołę.
3. Odśwież stronę i wróć do pierwszego tygodnia.

**Oczekiwane:** widoczne są właściwe wpisy i daty bez przesunięcia strefy; dane szkół nie mieszają się; wybór z URL `schoolId` działa po odświeżeniu. **Powtórzenie:** bez zmian danych. **Źródła:** [strona harmonogramu](../../../app/pages/manager/schedule/index.vue), [kalendarz](../../../app/components/manager/schedule/ManagerSchoolScheduleCalendar.vue), [trasa BE](../../../../../BE/src/routes/schedule.routes.ts).

### MGR-LES-01 — Rezerwacja jazdy przez menedżera [P0]

**Wymaganie:** `REQ-MGR-LES-01` — menedżer rezerwuje wolny termin instruktora dla kursanta. **Dane:** `booking-ready`: aktywny kursant z kursem, kwalifikowany instruktor z wolnym slotem, dostępny pojazd.

1. Otwórz **Instruktorzy → [instruktor] → Sloty**; przejdź do tygodnia z wolnym terminem.
2. Wybierz slot, kursanta, jego kurs i pojazd; potwierdź rezerwację.
3. Sprawdź ten termin w harmonogramie OSK oraz w profilu kursanta → **Lekcje**; odśwież.

**Oczekiwane:** jedna jazda ma wskazanego kursanta, instruktora, pojazd i właściwą godzinę; wolny slot nie jest ponownie dostępny w konflikcie. **Powtórzenie:** anuluj testową jazdę lub resetuj lekcje. **Źródła:** [sloty](../../../app/pages/manager/instructors/[id]/slots.vue), [dialog rezerwacji](../../../app/components/manager/lessons/ManagerLessonBookingDialog.vue), [trasa BE](../../../../../BE/src/routes/lessons.routes.ts).

### MGR-LES-02 — Konflikt rezerwacji i niedostępny pojazd [P0]

**Wymaganie:** `REQ-MGR-LES-02` — aplikacja nie zapisuje kolidującej jazdy. **Dane:** `booking-conflict`: slot już zajęty oraz drugi pojazd oznaczony niedostępnym.

1. Spróbuj ponownie zarezerwować zajęty termin przez sloty instruktora (jeśli jest widoczny) albo otwarty wcześniej formularz.
2. W formularzu sprawdź, czy niedostępny pojazd można wybrać.
3. Spróbuj potwierdzić konflikt i odśwież harmonogram.

**Oczekiwane:** druga jazda nie powstaje; komunikat wyjaśnia odmowę; niedostępny pojazd jest zablokowany w wyborze; pierwotna jazda pozostaje bez zmian. **Powtórzenie:** bez zmian danych. **Źródła:** [wybór pojazdu](../../../app/components/manager/lessons/ManagerLessonBookingVehicleSelect.vue), [test konfliktu BE](../../../../../BE/src/__tests__/services/schedule-write-transaction.test.ts), [test dostępności BE](../../../../../BE/src/__tests__/services/schedule-availability-check.test.ts).

### MGR-LES-03 — Edycja jazdy i zmiana instruktora [P1]

**Wymaganie:** `REQ-MGR-LES-03` — menedżer edytuje przyszłą jazdę zgodnie z dostępnością zasobów. **Dane:** `booking-ready` z już utworzoną przyszłą jazdą oraz drugim kwalifikowanym instruktorem.

1. W harmonogramie wybierz jazdę → **Edytuj**.
2. Zmień instruktora, pojazd lub datę na dostępne wartości; zapisz.
3. Odśwież harmonogram i profil kursanta.

**Oczekiwane:** nowy termin/zasób widnieje w obu widokach, stary wpis nie pozostaje jako duplikat. Zakończona albo nieedytowalna jazda pokazuje osobny stan bez możliwości zapisu. **Powtórzenie:** przywróć poprzednie dane jazdy lub resetuj lekcje. **Źródła:** [strona edycji](../../../app/pages/manager/lessons/[id]/edit.vue), [kontener edycji](../../../app/components/manager/lessons/ManagerLessonEditContainer.vue), [test zmiany instruktora BE](../../../../../BE/src/__tests__/services/lesson-instructor-change.test.ts).

### MGR-LES-04 — Anulowanie jazdy [P1]

**Wymaganie:** `REQ-MGR-LES-04` — menedżer może anulować rezerwację, jeśli reguły na to pozwalają. **Dane:** przyszła testowa jazda w harmonogramie.

1. Otwórz tydzień jazdy i wybierz akcję **Anuluj rezerwację**.
2. Jeśli pojawia się potwierdzenie, anuluj je i sprawdź brak zmiany; następnie potwierdź anulowanie.
3. Odśwież harmonogram oraz profil kursanta.

**Oczekiwane:** brak działania po odrzuceniu; po potwierdzeniu status i dostępność slotu odpowiadają regule anulowania, a oba widoki są spójne. **Do decyzji:** czy anulowana jazda pozostaje widoczna jako historia i kiedy slot wraca do puli. **Powtórzenie:** utwórz nową jazdę. **Źródła:** [tabela harmonogramu](../../../app/components/manager/schedule/ManagerScheduleLessonTable.vue), [test anulowania BE](../../../../../BE/src/__tests__/services/lesson-cancellation.test.ts).

### MGR-EVT-01 — Blok teorii i uczestnicy [P1]

**Wymaganie:** `REQ-MGR-EVT-01` — menedżer tworzy wydarzenie teorii i przypisuje kwalifikowanych uczestników. **Dane:** `student-enrolled`, instruktor, kurs teorii i kilku kursantów, w tym osoba spoza kursu.

1. W terminarzu instruktora uruchom tworzenie wydarzenia i wybierz blok teorii.
2. Podaj datę, godziny, instruktora, kurs i limit miejsc; zapisz.
3. Otwórz edycję wydarzenia i zakładkę/listę kursantów; zapisz kwalifikowanego uczestnika.
4. Odśwież wydarzenie i harmonogram OSK.

**Oczekiwane:** blok widnieje we właściwym terminie; przypisany uczestnik utrzymuje się, osoba spoza kursu nie pojawia się jako uprawniona. **Do decyzji:** dokładna polityka uczestników dla teorii bez powiązania z kursem. **Powtórzenie:** usuń testowy blok. **Źródła:** [terminarz instruktora](../../../app/pages/manager/instructors/[id]/schedule.vue), [dialog teorii](../../../app/components/manager/events/ManagerTheoryEventCreateDialog.vue), [edycja wydarzenia](../../../app/components/manager/events/ManagerEventEditContainer.vue).

### MGR-EVT-02 — Zmiana statusu, edycja i usunięcie bloku [P1]

**Wymaganie:** `REQ-MGR-EVT-02` — menedżer zarządza blokiem czasu w harmonogramie. **Dane:** przyszły testowy blok instruktora bez uczestników.

1. Otwórz blok z harmonogramu i zmień datę/godziny lub pojazd, jeśli pole dotyczy tego rodzaju bloku; zapisz.
2. Zmień status przez dostępny selektor; odśwież.
3. Otwórz usuwanie, anuluj, odśwież; ponów i potwierdź.

**Oczekiwane:** edycja i status są trwałe; odrzucenie usuwania zachowuje blok; potwierdzenie usuwa go z harmonogramu. **Powtórzenie:** odtwórz blok. **Źródła:** [edycja](../../../app/components/manager/events/ManagerEventEditContainer.vue), [status](../../../app/components/manager/events/ManagerEventStatusSelect.vue), [dialog usuwania](../../../app/components/manager/events/ManagerInstructorEventDeleteDialog.vue), [trasa BE](../../../../../BE/src/routes/events.routes.ts).

## Konta i dostęp

### MGR-ACC-01 — Lista kont i granica szkoły [P0]

**Wymaganie:** `REQ-MGR-ACC-01` — menadżer widzi konta kursantów i instruktorów swojej OSK. **Dane:** dwie niezależne OSK A/B, konta obu ról w każdej, `manager-A` i `manager-B`.

1. Jako `manager-A` otwórz **Konta użytkowników** (`/manager/accounts`), wybierz szkołę A i sprawdź wyszukiwanie imienia, nazwiska, e-maila oraz filtry **Kursanci/Instruktorzy**.
2. Otwórz szczegóły osoby. Sprawdź jej rolę i status; odśwież listę.
3. Podmień `schoolId` i `userId` w żądaniach odczytu oraz zapisu na identyfikatory B. Powtórz próbę jako instruktor i kursant.

**Oczekiwane:** listy i filtry są zgodne z danymi A; konto B nie jest ujawniane ani modyfikowane przez `manager-A`; role inne niż `MANAGER` dostają odmowę API. **Powtórzenie:** bez zmian danych. **Źródła:** [panel](../../../app/pages/manager/accounts/index.vue), [trasy BE](../../../../../BE/src/routes/manager-accounts.routes.ts), [zakres usługi](../../../../../BE/src/services/managerAccounts.service.ts).

### MGR-ACC-02 — Dane podstawowe i zmiana e-maila [P1]

**Wymaganie:** `REQ-MGR-ACC-02` — edycja konta i adresu e-mail jest trwała oraz spójna z Auth. **Dane:** aktywne testowe konto bez rzeczywistych danych osobowych, dwa kontrolowane adresy e-mail i zalogowana sesja tego konta.

1. W panelu kont zmień imię, nazwisko i telefon; zapisz, odśwież oraz porównaj z kartoteką osoby.
2. Zmień e-mail na drugi adres, potwierdź dialog i odśwież. Sprawdź nowy adres w panelu oraz możliwość logowania nim; stary adres nie powinien już służyć do logowania.
3. W poprzednio otwartej sesji spróbuj pobrać chronione dane. Sprawdź, czy stara sesja straciła dostęp.
4. Jeśli panel pokaże stan wymagający synchronizacji, użyj **Ponów synchronizację e-maila** i zapisz wynik; nie powtarzaj ślepo zmiany na trzeci adres.

**Oczekiwane:** dane podstawowe są trwałe; Auth i aplikacja pokazują ten sam e-mail, a poprzednie sesje nie działają. Przy częściowym niepowodzeniu jest widoczny stan naprawy, bez cichej niespójności. **Powtórzenie:** przywróć pierwotne wartości przez panel. **Źródła:** [edytor](../../../app/components/manager/accounts/ManagerAccountEditor.vue), [usługa BE](../../../../../BE/src/services/managerAccounts.service.ts).

### MGR-ACC-03 — Blokada i odblokowanie konta [P0]

**Wymaganie:** `REQ-MGR-ACC-03` — blokada natychmiast odbiera dostęp; odblokowanie pozwala na nową sesję. **Dane:** aktywny `student-A` lub `instructor-A`, otwarta sesja tego konta i sesja `manager-A`.

1. W panelu kont wybierz konto, kliknij **Zablokuj konto** i anuluj potwierdzenie; odśwież.
2. Potwierdź blokadę; sprawdź status na liście. W drugiej sesji odśwież chronioną stronę i spróbuj ponownego logowania.
3. W panelu kliknij **Odblokuj konto**. Sprawdź, że stara sesja nadal nie działa, a nowe logowanie działa.

**Oczekiwane:** anulowanie nic nie zmienia; blokada uniemożliwia dostęp przez aktywny token i nowe logowanie; odblokowanie wymaga nowego logowania. **Powtórzenie:** konto odblokowane. **Źródła:** [edytor](../../../app/components/manager/accounts/ManagerAccountEditor.vue), [usługa](../../../../../BE/src/services/managerAccounts.service.ts), [middleware](../../../../../BE/src/middleware/auth.middleware.ts).

### MGR-ACC-04 — Wysłanie resetu hasła [P1]

**Wymaganie:** `REQ-MGR-ACC-04` — menadżer może zainicjować odzyskiwanie hasła aktywnego konta. **Dane:** aktywne testowe konto z kontrolowaną skrzynką e-mail i skonfigurowanym `FRONTEND_URL`.

1. W panelu kont kliknij **Wyślij reset hasła** i sprawdź komunikat.
2. Odbierz wiadomość i wykonaj `COM-11`; po zmianie hasła sprawdź nowe logowanie i utratę poprzedniej sesji.
3. Dla konta zablokowanego sprawdź niedostępność akcji w UI i odmowę żądania API.

**Oczekiwane:** link jest wysłany na zapisany adres aktywnego konta; zablokowane konto nie dostaje resetu z panelu. **Powtórzenie:** przywróć hasło testowe, odblokuj konto. **Źródła:** [panel](../../../app/pages/manager/accounts/index.vue), [usługa](../../../../../BE/src/services/managerAccounts.service.ts).

### MGR-ACC-05 — Archiwizacja konta i aktywne zobowiązania [P1]

**Wymaganie:** `REQ-MGR-ACC-05`, `REQ-MGR-ACC-04` — menadżer archiwizuje konto bez aktywnych zobowiązań; operacja nie usuwa historii. **Dane:** konto kursanta z aktywnym kursem lub przyszłą jazdą oraz osobne konto bez aktywnego kursu, przyszłej jazdy, wydarzeń ani oczekującej płatności. Dla instruktora osobno uwzględnij aktywny kurs, przyszłą jazdę, wydarzenie lub blok.

1. Dla konta z aktywnym zobowiązaniem kliknij **Archiwizuj**; anuluj dialog, potem potwierdź. Zapisz odmowę.
2. Dla konta bez takich zobowiązań potwierdź archiwizację; odśwież listę i profil.
3. Spróbuj zalogować się zarchiwizowanym kontem i odświeżyć jego dawną sesję. Sprawdź, że panel pokazuje status archiwalny bez akcji przywrócenia.

**Oczekiwane:** anulowanie i odmowa z powodu zobowiązań zachowują konto; konto kwalifikujące się do archiwizacji traci dostęp i pozostaje jako rekord historyczny. **Do decyzji:** czy te warunki i brak przywracania odpowiadają docelowej polityce produktu; konto Auth pozostaje istniejące. **Powtórzenie:** użyj nowego konta testowego do kolejnego przebiegu. **Źródła:** [edytor](../../../app/components/manager/accounts/ManagerAccountEditor.vue), [kontrola zobowiązań](../../../../../BE/src/services/managerAccounts.service.ts).

## Nadzór

### MGR-REV-01 — Opinie o zakończonych jazdach [P2]

**Wymaganie:** `REQ-MGR-REV-01` — menedżer przegląda oceny jazd w wybranej OSK. **Dane:** `rated-lesson`: zakończona, oceniona jazda i druga jazda bez oceny.

1. Otwórz **Opinie** (`/manager/reviews`), wybierz szkołę i okres zawierający ocenę.
2. Ustaw filtr instruktora, jeśli jest dostępny; otwórz kolejny zakres dat i przywróć wszystkie opinie.
3. Odśwież listę.

**Oczekiwane:** oceniona jazda ma właściwą ocenę, komentarz i instruktora; nieoceniona jazda nie pojawia się jako opinia; filtry nie mieszają szkół. **Powtórzenie:** bez zmian danych. **Źródła:** [strona opinii](../../../app/pages/manager/reviews/index.vue), [lista](../../../app/components/manager/reviews/ManagerLessonRatingsList.vue), [trasa BE](../../../../../BE/src/routes/lesson-ratings.routes.ts).

### MGR-DASH-01 — Pulpit i elementy wymagające uwagi [P2]

**Wymaganie:** `REQ-MGR-DASH-01` — pulpit pokazuje informacje właściwe dla menedżera i prowadzi do odpowiednich zadań. **Dane:** OSK z kursem, instruktorem, kursantem oraz co najmniej jednym elementem wymagającym uwagi.

1. Otwórz **Pulpit** po zalogowaniu jako menedżer.
2. Porównaj kartę domyślnej OSK, skróty i listę spraw wymagających uwagi z odpowiednimi widokami źródłowymi.
3. Kliknij jeden element listy oraz jeden skrót.

**Oczekiwane:** dane odnoszą się do właściwej OSK, linki prowadzą do powiązanych ekranów, po rozwiązaniu testowej sprawy i odświeżeniu lista reaguje zgodnie z jej stanem. **Do decyzji:** pełna definicja typów spraw wymagających uwagi i progi ich pokazywania. **Powtórzenie:** zależy od wybranej sprawy. **Źródła:** [pulpit](../../../app/pages/index.vue), [treść pulpitowa](../../../app/components/manager/dashboard/ManagerDashboardContent.vue), [trasa BE](../../../../../BE/src/routes/manager-attention.routes.ts).

### MGR-MOB-01 — Podstawowe zadania menadżera na wąskim ekranie [P2]

**Wymaganie:** `REQ-MGR-MOB-01` — menadżer może wykonać podstawowe zadania na telefonie. **Dane:** `school-operational`, przeglądarka o szerokości 375–390 px.

1. Otwórz na wąskim ekranie menu, listę OSK, kursantów i harmonogram; przejdź między tymi widokami.
2. Wybierz szkołę, wyszukaj kursanta i otwórz jego szczegóły.
3. Otwórz dialog dodawania opłaty, przewiń formularz do przycisków i zamknij go bez zapisu.

**Oczekiwane:** nawigacja i istotne akcje są dostępne bez poziomego przewijania całej strony; tekst, pola, kalendarz i przyciski pozostają czytelne, a dialog da się zamknąć. **Powtórzenie:** bez zmian danych. **Źródła:** [lista kursantów](../../../app/pages/manager/students/index.vue), [harmonogram](../../../app/pages/manager/schedule/index.vue), [płatności](../../../app/components/manager/students/ManagerStudentPaymentsSection.vue).

## Otwarte decyzje przed zaliczeniem odbioru

1. Reguły ustawienia pierwszej lub domyślnej OSK i zachowania wybranego kontekstu po ponownym logowaniu (`MGR-OSK-01/02`).
2. Usuwanie szkoły i pojazdu z danymi zależnymi; nazwa i skutki „Usuń instruktora” wobec blokady konta oraz polityka Auth/historii po archiwizacji (`MGR-OSK-03`, `MGR-INS-03`, `MGR-VEH-02`, `MGR-ACC-05`).
3. Polityka oferty kategorii i zmiany instruktora kursu przy istniejących jazdach (`MGR-CRS-02/03`).
4. Historia i ponowne udostępnianie slotu po anulowaniu oraz uczestnictwo w teorii bez kursu (`MGR-LES-04`, `MGR-EVT-01`).
5. Zakres i priorytet spraw na pulpicie (`MGR-DASH-01`).
