# Plan przebudowy design systemu OSK Manager

Status: propozycja do realizacji; bez implementacji.
Data: 2026-09-09.
Repozytorium: `FE/OSK-Manager-FE`. Wszystkie sciezki ponizej sa wzgledem tego repozytorium.

## 1. Cel i granice

Zmienic `/design-system` z katalogu biblioteki w dzialajacy warsztat interfejsu CRM dla OSK. Pokazac rzeczywiste komponenty, ich stany i kompozycje na syntetycznych danych szkoly jazdy.

Ustalone decyzje:

- Jedyny font interfejsu: lokalny Satoshi. Bez wyboru fontow i bez powrotu odrzuconych kandydatow.
- Paleta: Cobalt + Graphite + Orange, zgodna z aktualnym `/palette-test`.
- Jasny i ciemny motyw od pierwszego etapu.
- Zachowac delikatny wyglad zaakceptowanej etykiety Aktywne; nie zmieniac jej nasycenia bez powodu.
- Nuxt 4, Vue 3, TypeScript, Tailwind 4, istniejace shadcn-vue/Reka UI i Lucide.
- Rozwijac istniejace komponenty, zachowujac kompatybilnosc ich publicznych propsow, slotow i eventow.

Pierwszy zakres to design system i wspolne podstawy potrzebne jego przykladom. Migracja calego CRM jest osobnym, pozniejszym etapem. Nie zmieniac logowania, uprawnien, API/BFF, schematow danych ani procesow rezerwacji i platnosci.

Ten dokument uzupelnia `docs/UI_COMPONENT_PATTERNS.md` i `docs/UI_REDESIGN_IMPLEMENTATION_PLAN.md`, nie zastepuje ich zasad zachowania funkcjonalnosci. Nowe decyzje o Satoshi i palecie maja pierwszenstwo przed starszymi mockupami w zakresie fontu i kolorow. Syntetyczne dane sa dozwolone tylko w design systemie i testach, nigdy jako zastepstwo danych produkcyjnych.

## 2. Stan zastany

- `app/pages/design-system.vue`: sklada sekcje foundation i demo biblioteki.
- `app/layouts/design-system.vue`: wspolny naglowek i glowny kontener; korzysta z niego rowniez paleta.
- `app/components/app/design-system/`: istniejace sekcje z prawdziwymi kontrolkami.
- `app/components/app/ui/`: PageHeader, FilterBar, DataTableShell, StatusBadge, FormSection, ActionGroup, SummaryStrip oraz LoadingState, EmptyState i ErrorState.
- `app/components/shadcn/`: przyciski, pola, wybor, dialogi, sheet, tooltip, popover, kalendarz, sidebar i pozostale prymitywy.
- `app/pages/palette-test.vue` i `app/components/app/palette-test/PalettePreviewShowcase.vue`: zaakceptowany podglad kolorow i fontu. Przyklady formularzy w palecie nie sa automatycznie wzorcem implementacji wszystkich prymitywow.
- `app/assets/css/tailwind.css`: obecne globalne tokeny nadal roznia sie od wybranej palety.
- `app/composables/core/useDarkMode.ts`: obecny mechanizm klasy `.dark` i localStorage; paleta ma osobny cookie motywu. Wymaga ujednolicenia, nie dodania trzeciego mechanizmu.
- Nie wszystkie elementy domenowe sa czysto prezentacyjne. Np. ManagerLessonBookingDialog korzysta z composable pobierajacego i zapisujacego dane.
- `/design-system` jest chroniony przez `app/middleware/auth.global.ts`; `/palette-test` jest publiczny. Plan nie zmienia tej polityki.

Obecnosc pliku nie oznacza potwierdzenia wszystkich stanow. Kazdy ponizej wymieniony komponent trzeba uruchomic w docelowym przykladzie i zweryfikowac przed uznaniem go za gotowy.

## 3. Uklad strony: co gdzie bedzie

Adres pozostaje `/design-system`. Nie dodawac kolejnego osobnego katalogu UI ani strony marketingowej.

1. Naglowek: nazwa OSK Manager / Design system, powrot do aplikacji, kontrola jasny/ciemny.
2. Lewa nawigacja na desktopie: Fundamenty, Akcje, Formularze, Dane, Harmonogram, Komunikaty, Wzorce ekranow. Na mobile zwijana nawigacja oparta na UiSheet.
3. Glowna przestrzen: jedna wybrana sekcja, bez dlugiego zestawu kart wewnatrz kart. Wybor sekcji zapisany w `?section=...`, z obsluga odswiezenia i historii przegladarki.
4. W sekcji: tytul, rzeczywiste przyklady komponentow oraz, tam gdzie potrzebne, kontrola stanu lub gestosci. Bez dlugich opisow implementacyjnych w UI; kontrakty i zasady pozostaja w dokumentacji.
5. Przyklady z danymi: wybor standard/compact. Gestosc ma dotyczyc odstepow i wysokosci, nie automatycznego pomniejszania calego interfejsu.

Sekcje nie sa dekoracyjnymi kartami. Ramka jest uzasadniona dla faktycznego formularza, tabeli, panelu narzedzia lub powtarzalnego rekordu. Unikac stalego ukrywania overflow, ktore jedynie maskuje bledy szerokosci.

## 4. Mapa sekcji i istniejacych komponentow

| Sekcja         | Istniejaca baza do wykorzystania                                                                                                                                                                 | Przyklady i rozszerzenia                                                                                         |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| Fundamenty     | `app/components/app/design-system/Typography.vue`, `Colors.vue`; obecna paleta                                                                                                                   | Satoshi w malych tekstach i naglowkach, role kolorow light/dark, kontrast, spacing, geometria i gestosc          |
| Akcje          | `SectionActions.vue`, `ActionGroup`, `app/components/shadcn/button/`, `tooltip/`                                                                                                                 | Akcja glowna, outline, ghost, destructive, link; ikona/tekst; loading, disabled, focus                           |
| Formularze     | `SectionFormControls.vue`, `FormSection`, `input/`, `label/`, `textarea/`, `select/`, `native-select/`, `radio-group/`, `checkbox/`, `switch/`, `date-picker/`, `date-time-picker/`, `calendar/` | Dane kursanta, kwota, termin, wybor zasobu, walidacja i zapis; wyszukiwanie wyboru jako brak do uzupelnienia     |
| Dane           | `SectionData.vue`, `PageHeader`, `FilterBar`, `DataTableShell`, `SummaryStrip`, `StatusBadge`                                                                                                    | Lista kursantow, podsumowanie platnosci, rekord osoby, filtrowanie, paginacja i szczegoly                        |
| Harmonogram    | `app/components/manager/schedule/ManagerScheduleLessonBlock.vue`, `ManagerScheduleWeekToolbar.vue`, `ManagerScheduleLessonTable.vue`, `ManagerSchoolScheduleCalendarGrid.vue`                    | Ten sam zestaw zajec w siatce i liscie; jazda/teoria; stany rezerwacji, zaznaczenie, konflikt i brak dostepnosci |
| Komunikaty     | `SectionFoundationStates.vue`, `SectionToasts.vue`, `SectionDialog.vue`, `LoadingState`, `EmptyState`, `ErrorState`, `ToastStack`, `useAppToast`, `dialog/`, `sheet/`                            | Bledy lokalne i calego widoku, retry, puste dane/brak wynikow, toast, potwierdzenie i formularz w dialogu        |
| Wzorce ekranow | `SectionScreenPatterns.vue`, istniejace komponenty domenowe wskazane ponizej; `NavTree`, `sidebar/`                                                                                              | Lista kursantow, profil kursanta, rezerwacja jazdy, platnosci; wariant desktop/mobile                            |

Pelne sciezki krotkich nazw Section\* z tabeli zaczynaja sie od `app/components/app/design-system/`. Wspolne komponenty bez prefixu sa w `app/components/app/ui/`, a katalogi prymitywow w `app/components/shadcn/`.

Stare sekcje demonstracyjne niezwiązane z głównymi wzorcami CRM zostały usunięte po sprawdzeniu użyć. Slider/carousel i osobny loader nie są częścią aktualnego zakresu design systemu.

### Wzorce domenowe do osadzenia

| Wzorzec    | Istniejace pliki                                                                                                                                                                                         | Sposob podlaczenia                                                                                                        |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Kursanci   | `app/components/manager/students/ManagerStudentsList.vue`, `ManagerStudentsFilters.vue`, `ManagerStudentsPagination.vue`, `ManagerStudentFormFields.vue`                                                 | Fixture zgodne z typami; aktualizacje filtrow/paginacji lokalne; akcje otwieraja lokalny przyklad, nie prawdziwy rekord   |
| Profil     | `app/components/manager/students/ManagerStudentProfileCard.vue`, `ManagerStudentProcessStatus.vue`, `ManagerStudentCoursesSection.vue`                                                                   | Najpierw audyt zaleznosci. Renderowac czesci prezentacyjne; nie montowac kontenera uruchamiajacego API                    |
| Platnosci  | `app/components/manager/students/ManagerStudentPaymentCreateForm.vue`, `ManagerStudentPaymentsSummaryGrid.vue`; `app/components/student/payments/StudentPaymentsList.vue`                                | Kontrolowane modele formularza i syntetyczne dane; zapis tylko do pamieci przykladu; nie tworzyc nowych statusow backendu |
| Rezerwacja | `app/components/manager/lessons/ManagerLessonBookingSlotSummary.vue`, `ManagerLessonBookingStudentCourseSelect.vue`, `ManagerLessonBookingInstructorSelect.vue`, `ManagerLessonBookingVehicleSelect.vue` | Istniejace podkomponenty wewnatrz UiDialog z lokalnym stanem; zachowac zaleznosc kursant/kurs/termin/pojazd               |
| Dostepnosc | `app/components/manager/instructors/ManagerInstructorAvailabilityDayRow.vue`, `ManagerInstructorWeeklyAvailabilityPreview.vue`; `app/components/vehicles/VehicleAvailabilityControl.vue`                 | Audyt props/eventow, fixture tygodnia, blokada i wyjatek; bez zapisu zmian w prawdziwym grafiku                           |

Nie kopiowac HTML istniejacych komponentow do demonstracyjnych odpowiednikow. Jesli komponent miesza UI i I/O, wydzielic tylko potrzebna czesc prezentacyjna i uzyc jej zarowno w dotychczasowym komponencie, jak i w design systemie. Nie dodawac `demo` do kazdego komponentu ani nie rozbudowywac ogolnego mechanizmu wstrzykiwania API tylko dla prezentacji.

## 5. Kontrakty wariantow i stanow

### Fundamenty

- Satoshi 400: tresc; 500: etykiety i przyciski; 600: naglowki sekcji; 700: ograniczone wyroznienia.
- Punkty startowe typografii: 12/16 px pomocniczy, 14/20 UI, 16/24 dluzsza tresc, 18/24 i 20/28 sekcje, 24/32 oraz 28/36 tytuly. Zapisac w rem; nie skalowac font-size szerokoscia viewportu. Letter-spacing 0.
- Nie utrwalac obecnych 9-10 px w kalendarzu. Maly blok pokazuje godzine i glowna osobe; pozostale dane w dostepnym szczegole. Zachowac dostep do wszystkich informacji.
- Odstepy: 4, 8, 12, 16, 24, 32 px; zaokraglenia 4, 6, 8 px; pelne tylko dla odpowiednich elementow, np. avatarow.
- Kompaktowe kontrolki okolo 32 px, standardowe 36-40 px; dla dotyku przewidziec wygodny obszar aktywny okolo 44 px. To zalozenia projektu do sprawdzenia, nie deklaracja zgodnosci WCAG.
- Kolory bazowe light/dark przepisac z aktualnej palety, nie dobierac ponownie. Uzupelnic brakujace tokeny: surface, popover, border, input, focus, selected, disabled, sidebar, success/warning/danger/info z osobnymi parami foreground/background.
- Brand accent, ostrzezenie, rodzaj zajec i status to osobne role semantyczne. Nie utozsamiac ich tylko dlatego, ze maja podobna barwe.

### Kontrolki

| Rodzina      | Warianty                                                                                                                  | Stany i zachowanie                                                                                                                                    |
| ------------ | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Button       | Zachowac obecne `default`, `outline`, `secondary`, `ghost`, `destructive`, `link` i size; rekomendowac ograniczony zestaw | Hover, pressed, focus-visible, disabled, loading bez zmiany szerokosci; ikony z nazwa dostepna i tooltipem                                            |
| Pole         | Tekst, email, tel, haslo, search, textarea, liczba godzin, kwota PLN                                                      | Puste/wypelnione, opis, required, invalid, readonly, disabled; etykieta pozostaje widoczna; bledy powiazane przez aria-describedby                    |
| Wybor        | Select prosty, wybor z wyszukiwaniem, pojedynczy/wielokrotny; radio/checkbox/switch                                       | Loading opcji, brak opcji/brak wynikow, wybrany, disabled, blad; klawiatura; nie montowac wielowyboru tam, gdzie API przyjmuje pojedyncze ID          |
| Czas         | Data, data+godzina, zakres dat, przedzial godzin                                                                          | Brak daty, dostepny/niedostepny termin, niepoprawna kolejnosc, konflikt; format polski; strefa czasowa zgodna z obecna domena                         |
| StatusBadge  | Neutral/info/success/warning/danger; subtelny jako zalecany, mocniejszy opcjonalnie                                       | Tekst niezalezny od koloru; zachowac kompatybilnosc `tone` i `subtle`; nie tworzyc nowego modelu statusow biznesowych                                 |
| Lista/tabela | Standard/compact, tabela desktop/lista mobile                                                                             | Dane/loading/error/empty/no-results; sort i strony dzialaja lokalnie; zaznaczenie i bulk tylko jako jawny wzorzec, nie obietnica funkcji produkcyjnej |
| Dialog/sheet | Potwierdzenie, krotki formularz, szybkie szczegoly                                                                        | Focus trap, Escape, powrot focusu, pending, blad zapisu, dluga tresc; okreslic zachowanie niezapisanych zmian                                         |

Pola kwoty i godzin nie wymagaja osobnych globalnych komponentow, dopoki istnieje tylko jeden konsument. Uzyc UiInput, obecnej walidacji i formatera domenowego. Kwoty testowac z przecinkiem dziesietnym; nie zmieniac formatu API.

### Wzorce OSK

- Wydarzenia: istniejace `PLANNED`, `DONE`, `NO_SHOW`, `CANCELLED` z `app/utils/events/instructorEventStatusDisplay.ts`. Ikona/typ zajec osobno od statusu.
- Pojazdy: istniejace `ACTIVE`, `UNAVAILABLE`; nie wprowadzac automatycznie nowych stanow serwisowych.
- Kursy: wykorzystywac aktualne typy i etykiety, nie wymyslac etapow procesu na potrzeby estetyki.
- Platnosci: wyglad stanow wynika z istniejacej domeny; ewentualne warianty przyszle wyraznie oznaczyc w dokumentacji jako planowane.
- Rezerwacja: pokazac aktualny proces wyboru. Nie zamieniac go bez potrzeby w nowy kreator wieloetapowy.
- Kalendarz: widok normalny/skrocony bloku, selected/focus, nieinteraktywny, konflikt; siatka desktop i czytelna lista mobile.

## 6. Docelowa mapa plikow

Istniejace pliki do zmiany w przyszlej implementacji:

- `app/pages/design-system.vue`: tylko kompozycja, wybor sekcji i lokalne ustawienia prezentacji.
- `app/layouts/design-system.vue`: responsywna rama z miejscem na nawigacje; zachowac poprawny pelnoszeroki widok `/palette-test`.
- `app/components/app/design-system/Typography.vue`, `Colors.vue`, `DesignSystemNavigation.vue`, `SectionActions.vue`, `SectionFormControls.vue`, `SectionData.vue`, `SectionSchedule.vue`, `SectionFoundationStates.vue`, `SectionToasts.vue`, `SectionDialog.vue`, `SectionScreenPatterns.vue` i przykłady w `examples/`: rozwijać jako aktualny katalog showcase, bez równoległego starego katalogu.
- `app/components/app/ui/*`: zmiany wspolnych wzorcow tylko w uzasadnionym zakresie; domyslne zachowanie zgodne z istniejacymi konsumentami.
- `app/components/shadcn/*`: rozszerzenia bazowych kontrolek, jesli potrzebne; nie reinstalowac biblioteki i nie nadpisywac lokalnych modyfikacji generatorem.
- `app/assets/css/tailwind.css` i `app/assets/css/osk-design-tokens.css`: globalne tokeny aplikacji. Zmiana palety ma zaczynac sie tutaj, a nie w pojedynczych ekranach.
- `app/data/design-system/colors.ts`: dane palety pokazywane w `/design-system`. Warto utrzymywac je zgodnie z globalnymi tokenami CSS.
- `app/pages/palette-test.vue`, `app/components/app/palette-test/PalettePreviewShowcase.vue`: pozniej wspolne zrodlo kolorow/fontu; bez ponownego selektora fontow.
- `app/composables/core/useDarkMode.ts`: ujednolicenie stanu i SSR z zachowaniem obecnego API composable.

Zasada wdrozenia w aplikacji: `/design-system` pokazuje realne komponenty
`app/components/app/ui` oraz wybrane komponenty domenowe. Nowe wzorce trafiaja
najpierw do tych komponentow wspolnych albo do jawnie wydzielonego komponentu
domenowego, a dopiero potem do stron. Nie tworzyc osobnych, ladniejszych kopii
tylko na potrzeby showcase.

Planowane nowe pliki (nazwy docelowe, obecnie nieistniejace):

| Plik                                                                              | Odpowiedzialnosc                                                                   |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `app/components/app/design-system/DesignSystemNavigation.vue`                     | Nawigacja desktop/mobile; props aktywnej sekcji, event zmiany                      |
| `app/components/app/design-system/DesignSystemPreviewControls.vue`                | Kontrola scenariusza i gestosci, bez logiki biznesowej                             |
| `app/components/app/design-system/SectionSchedule.vue`                            | Izolowane przyklady istniejacych komponentow kalendarza                            |
| `app/components/app/design-system/SectionData.vue`                                | Kompozycja tabel, filtrow, paginacji i statusow                                    |
| `app/components/app/design-system/SectionScreenPatterns.vue`                      | Wybor czterech pelniejszych scenariuszy CRM                                        |
| `app/components/app/design-system/examples/DesignSystemStudentsExample.vue`       | Lokalny stan listy i filtrow + rzeczywiste komponenty kursantow                    |
| `app/components/app/design-system/examples/DesignSystemStudentProfileExample.vue` | Profil z czesci prezentacyjnych i fixture                                          |
| `app/components/app/design-system/examples/DesignSystemBookingExample.vue`        | Lokalny stan rezerwacji, walidacji i potwierdzenia                                 |
| `app/components/app/design-system/examples/DesignSystemPaymentsExample.vue`       | Lokalna lista i formularz platnosci                                                |
| `app/data/design-system/fixtures.ts`                                              | Jawnie syntetyczne, deterministyczne dane zgodne z typami domeny                   |
| `app/data/design-system/sections.ts`                                              | Id, etykiety i kolejnosc sekcji; bez nadmiernego dynamicznego rejestru komponentow |
| `app/assets/css/osk-design-tokens.css`                                            | Wspolne tokeny semantyczne, Satoshi, light/dark, gestosc i typografia              |

Nie tworzyc wszystkich plikow z gory jako pustych szkieletow. Dodawac wraz z dzialajacym etapem. Przy imporcie przykladow sprawdzic auto-importy w `nuxt.config.ts`; preferowac jawne importy, gdy nazwy moga sie zderzyc. Nowe wspolne komponenty, np. wyszukiwany wybor, tworzyc dopiero po analizie obecnego selektora uczestnikow wydarzenia i dostepnych prymitywow Reka UI (pakiet `reka-ui`).

## 7. Motyw, portale i brak regresji

Nowe tokeny najpierw wlaczyc przez jawny scope design systemu i palety, nie podmieniac od razu wszystkich globalnych wartosci.

- Scope musi obejmowac takze portale UiDialog, UiSelect, UiPopover, UiSheet i tooltip. Aktualny DialogContent uzywa DialogPortal do domyslnego miejsca poza komponentem.
- Preferowany kierunek: zarzadzany przez layout atrybut scope na korzeniu dokumentu, obejmujacy body i portale; aktywny tylko podczas wizyty w design systemie/palecie. Sprzatac po nawigacji, uwzglednic SSR i brak wycieku stylow na inne trasy.
- Motyw nadal ma jedno wspolne zrodlo w `useDarkMode`, z SSR-safe inicjalizacja i zgodnoscia z dotychczas zapisana preferencja. Nie zostawiac `.dark` oraz `data-theme` wskazujacych przeciwne tryby.
- Zachowac kompatybilnosc lokalnego cookie palety przez migracje/ustalona kolejnosc odczytu, nie przez dwa konkurujace watchery.
- Priorytet i cykl zycia scope trzeba sprawdzic na przejsciu paleta -> design system -> aplikacja oraz przy otwartym/zamykanym portalu.
- Nie zmieniac statusu publicznego zadnej trasy. Testy przegladarkowe design systemu wymagaja dostepnej sesji testowej; brak sesji raportowac zamiast omijac middleware.

## 8. Izolacja i interaktywnosc przykladow

- Przyklady musza renderowac rzeczywiste komponenty, a nie obrazki lub HTML podobny do komponentu.
- Dane w `fixtures.ts` bez prawdziwych nazwisk, telefonow i identyfikatorow pobranych z konta uzytkownika; uzyc jawnych danych testowych i adresow example.com.
- Nie uruchamiac prawdziwego zapisu, usuwania, rezerwacji, wysylki wiadomosci ani odczytu danych CRM. Zwykle sprawdzenie sesji przez middleware pozostaje dozwolone.
- Kazdy przyklad ma reset lokalnego stanu. Wyszukiwanie, sortowanie, paginacja, walidacja i otwieranie szczegolow faktycznie dzialaja.
- Loading/error/no-results/pending wybierane deterministycznie. Nie polegac na losowych odpowiedziach lub wiecznie krecacym sie spinnerze.
- Nie dodawac toastow dla kazdego klikniecia; uzyc ich tylko dla sensownego wyniku operacji.
- Jesli istniejacy link do rekordu wymaga parametryzacji, dodac opcjonalny hook/slot zgodny z dotychczasowym zachowaniem zamiast kierowac do fikcyjnego rekordu produkcyjnego.
- Stan domenowy i parsowanie pozostaja w domenie; komponent prezentacyjny otrzymuje propsy/emituje zdarzenia. Nie przenosic logiki API do katalogu design-system.

## 9. Etapy i wyniki

| Etap                 | Zakres                                                                                             | Warunek zakonczenia                                                                      |
| -------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 0. Audyt             | Porownac ten plan z aktualnym kodem; spis kontraktow i konsumentow; sprawdzic istniejace dokumenty | Potwierdzona mapa reuse/rozszerzenie/brak; brak zmian biznesowych                        |
| 1. Rama i fundamenty | Sekcje, nawigacja, Satoshi, tokeny scope, theme/portale                                            | Design system i paleta spojne; pozostale trasy bez niezamierzonego restylingu            |
| 2. Prymitywy i stany | Akcje, formularze, statusy, komunikaty                                                             | Warianty dzialaja z klawiatury w obu motywach; kompatybilne API                          |
| 3. Dane              | Tabela/lista kursantow, filtry, paginacja, empty/error/loading                                     | Pelny lokalny scenariusz na rzeczywistych komponentach, bez domenowego I/O               |
| 4. Harmonogram       | Siatka/lista, blok zajec, toolbar, termin i rezerwacja                                             | Godziny i dane czytelne; brak utraty informacji; konflikt i brak dostepnosci obslugiwane |
| 5. Wzorce ekranow    | Profil i platnosci; dopiecie scenariuszy kursantow i rezerwacji                                    | Cztery kompletne przyklady z resetem i poprawnym mobile                                  |
| 6. Weryfikacja       | Testy, kontrast, screenshoty, regresje, aktualizacja docs                                          | Checklista akceptacji spelniona lub konkretne blokery opisane                            |

Po tych etapach zatrzymac sie. Wdrozenie nowego wygladu na rzeczywistych trasach manager/student/instructor wymaga osobnego zakresu. Podobnie nie implementowac produkcyjnych akcji zbiorczych tylko dlatego, ze istnieje ich przyklad.

## 10. Testy i kryteria akceptacji

- Unit/component testy wedlug istniejacej konfiguracji Vitest: mapowanie tokenow/statusow, walidacja, filtry/paginacja, reset, przejscia stanow i zachowanie dotychczasowych propsow.
- Nie przedstawic zwyklego testu funkcji jako testu montowania komponentu; najpierw sprawdzic dostepny runner/narzedzia Vue. Browser testuje rzeczywista integracje.
- Browser: desktop 1440x900 i 1280x800, tablet 768x1024, mobile 390x844; light/dark. Screenshot kazdej sekcji oraz otwartego dialogu/selecta.
- Sprawdzic klawiature, nazwy dostepne, powrot focusu, brak nakladania tekstu, dlugie polskie etykiety, polskie znaki i kwoty.
- Sprawdzic widok przy 200% powiekszenia; poziomy scroll ograniczony do uzasadnionej tabeli/siatki, nie calej strony.
- Kontrast zwyklego tekstu minimum 4.5:1; nie polegac na samym kolorze statusu. Pary tokenow mierzyc osobno w obu motywach.
- Kontrolki loading nie zmieniaja wymiarow; disabled/readonly maja rozne znaczenie; puste dane i brak wynikow maja rozne akcje naprawcze.
- Brak requestow domenowych przy eksploracji i resetowaniu przykladow; sprawdzic Network, nie tylko kod.
- Brak bledow konsoli, brak fallbacku zamiast Satoshi, poprawny motyw w portalach i po nawigacji.
- Uruchomic `npm run lint`, `npm run typecheck`, `npm run test` oraz `npm run build`. Bledy zastane oddzielic od wprowadzonych i opisac; nie poprawiac niezaleznych modulow bez potrzeby.
- Testy regresji: logowanie, lista kursantow, platnosci, rezerwacja i motyw na zwyklych trasach z bezpieczna sesja/danymi testowymi; bez wykonywania prawdziwych operacji finansowych.
- Dokumentacja komponentow oraz decyzje po implementacji zaktualizowane w obecnych docs, bez utrzymywania sprzecznych wytycznych.

## 11. Zakres poza planem

- Brak zmiany backendu, autoryzacji i kontraktow API.
- Brak globalnego redesignu wszystkich ekranow w tym zadaniu.
- Brak nowego font pickera, nowych propozycji palet, ilustracji marketingowych i dekoracyjnych dashboardow.
- Brak nowego silnika kalendarza albo globalnej biblioteki tabel bez stwierdzonej potrzeby.
- Brak automatycznego usuwania nieuzywanych assetow/fontow i obcych zmian z worktree.
- Brak automatycznego commita, pushu lub deployu bez osobnego polecenia.

## 12. Materialy

- Prompt wykonawczy: `docs/DESIGN_SYSTEM_IMPLEMENTATION_PROMPT.md`.
- Istniejace zasady: `docs/UI_COMPONENT_PATTERNS.md`, `docs/UI_REDESIGN_IMPLEMENTATION_PLAN.md`, `docs/UI_REDESIGN_VIEW_SPECS.md`.
- Kontrast: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
- Cele interakcji: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
