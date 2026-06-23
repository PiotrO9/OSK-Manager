# OSK Manager UI Redesign Implementation Plan

Ten dokument opisuje sposob prowadzenia redesignu UI w OSK Managerze. Jest instrukcja operacyjna dla AI i developera. Nalezy go stosowac razem z:

- `docs/UI_REDESIGN_GUIDELINES.md`
- `docs/UI_COMPONENT_PATTERNS.md`
- `docs/UI_REDESIGN_VIEW_BACKLOG.md`
- `docs/UI_REDESIGN_VIEW_SPECS.md`

## Cel

Redesign ma byc wdrazany iteracyjnie, widok po widoku. Nie przebudowujemy calej aplikacji naraz i nie zmieniamy logiki produktu pod pretekstem poprawy UI.

Kazde zadanie redesignu powinno konczyc sie widokiem, ktory:

- zachowuje obecna funkcjonalnosc;
- zachowuje wszystkie dane, akcje i stany;
- uzywa wspolnych wzorcow komponentow tam, gdzie to ma sens;
- jest spojny ze stylem referencji School management Students/Teachers;
- jest gotowy do dalszego rozszerzania bez lokalnego, jednorazowego stylowania.

## Kolejnosc pracy

### 1. Analiza widoku

Przed edycja kodu:

1. Otworz plik widoku i powiazane komponenty.
2. Ustal role uzytkownika: manager, student, instructor, shared/public.
3. Ustal typ widoku: dashboard, lista, szczegoly, formularz, harmonogram, konto, auth.
4. Wypisz glowne akcje uzytkownika.
5. Wypisz dane, ktore musza pozostac widoczne.
6. Wypisz stany: loading, empty, error, disabled, success, confirm/delete.
7. Sprawdz w backlogu, jakie wzorce komponentow sa przypisane do widoku.
8. Sprawdz w `UI_REDESIGN_VIEW_SPECS.md`, czego nie wolno zgubic w danym widoku.

Nie zaczynaj od przepisywania template. Najpierw zrozum, co widok robi.

### 2. Komponenty wspolne

Przed przerobieniem konkretnego widoku sprawdz, czy mozna uzyc lub dodac komponent globalny.

Priorytetowe komponenty foundation:

1. `PageHeader`
2. `StatusBadge`
3. `EmptyState`
4. `LoadingState`
5. `ErrorState`
6. `FilterBar`
7. `DataTableShell`
8. `ActionGroup`

Zasady:

- komponent globalny tworz tylko wtedy, gdy wzorzec bedzie uzywany wielokrotnie;
- komponent nie moze ukrywac logiki domenowej;
- komponent powinien miec proste propsy i jasna odpowiedzialnosc;
- jesli widok wymaga tylko jednorazowego ukladu, zostaw lokalny markup.

### 3. Redesign widoku

Podczas zmiany UI:

- nie zmieniaj routingu;
- nie zmieniaj middleware;
- nie zmieniaj kontraktow API ani BFF;
- nie zmieniaj nazw pol formularzy, jesli sa powiazane z walidacja albo backendem;
- nie zmieniaj flow biznesowego;
- nie usuwaj akcji ani stanow;
- nie przenos logiki do komponentu UI, jesli jest specyficzna dla widoku.

Dozwolone sa zmiany:

- layoutu;
- hierarchii informacji;
- grupowania danych;
- wygladu tabel, kart, formularzy i dialogow;
- klas Tailwind;
- uzycia wspolnych komponentow;
- responsywnosci desktop/mobile;
- tekstow pomocniczych, jesli nie zmieniaja sensu funkcji.

### 4. Weryfikacja

Po zmianie widoku:

1. Sprawdz, czy zachowano wszystkie dane i akcje.
2. Sprawdz loading, empty, error i disabled state, jesli widok je ma.
3. Sprawdz desktop i mobile.
4. Uruchom `npm run lint`.
5. Przy wiekszych zmianach uruchom `npm run build`.
6. Jesli zmiana dotyczy istniejacych testow albo logiki pomocniczej, uruchom `npm run test`.

Dla zmian czysto dokumentacyjnych wystarczy sprawdzic linki, spojnosc dokumentow i pokrycie listy widokow.

## Kolejnosc wdrazania calego redesignu

### Etap 1: Foundation

Cel: stworzyc minimalny zestaw wspolnych komponentow, ktore od razu beda potrzebne w widokach list i szczegolow.

Zakres:

- `PageHeader`
- `StatusBadge`
- `EmptyState`
- `LoadingState`
- `ErrorState`
- `FilterBar`
- `DataTableShell`
- `ActionGroup`

Nie przerabiaj wszystkich ekranow w tym etapie. Komponenty powinny powstawac przy pierwszym realnym widoku, ktory ich potrzebuje.

### Etap 2: Manager Core

Cel: przerobic najwazniejsze widoki operacyjne managera.

Kolejnosc:

1. `app/pages/manager/students/index.vue`
2. `app/pages/manager/students/[userId].vue`
3. `app/pages/manager/instructors/index.vue`
4. `app/pages/manager/instructors/[id]/index.vue`
5. `app/pages/manager/schedule/index.vue`

Pierwszy realny widok redesignu to `app/pages/manager/students/index.vue`, bo wymusza najwiecej wspolnych wzorcow: `PageHeader`, `FilterBar`, `DataTableShell`, `StatusBadge`, `ActionGroup`, `EmptyState`.

### Etap 3: Operational Views

Cel: przeniesc wspolny styl na pozostale widoki managera.

Zakres:

- kursy;
- pojazdy;
- OSK;
- opinie;
- wydarzenia;
- edycja lekcji i blokow czasu;
- dostepnosc instruktorow.

### Etap 4: Student/Instructor Views

Cel: ujednolicic widoki codziennej pracy kursanta i instruktora.

Zakres:

- `my-lessons`;
- `book-lesson`;
- `my-courses`;
- `my-payments`;
- `my-reviews`;
- `events`.

### Etap 5: Shared/Polish

Cel: domknac wspolne obszary i sprzatnac design-system po wdrozeniu nowych wzorcow.

Zakres:

- `account`;
- `login`;
- `design-system`;
- layout `app-shell`;
- wspolne elementy nawigacji i shell aplikacji.

## Format raportu po kazdym widoku

Po wdrozeniu redesignu widoku raport powinien zawierac:

- zmieniony widok;
- dodane lub uzyte komponenty globalne;
- zastosowane wzorce;
- zachowane akcje i stany;
- uruchomione komendy weryfikacyjne;
- ograniczenia albo ryzyka.

Przyklad:

```text
Zmieniono app/pages/manager/students/index.vue.
Uzyto PageHeader, FilterBar, DataTableShell, EmptyState i ActionGroup.
Zachowano dodawanie kursanta, przypisanie do kursu, filtrowanie po OSK/kursie, paginacje oraz stany loading/empty/error.
Weryfikacja: npm run lint, npm run build.
```

## Zalecany prompt startowy

```text
Przerob widok [SCIEZKA] zgodnie z:
- docs/UI_REDESIGN_GUIDELINES.md
- docs/UI_COMPONENT_PATTERNS.md
- docs/UI_REDESIGN_IMPLEMENTATION_PLAN.md
- docs/UI_REDESIGN_VIEW_BACKLOG.md
- docs/UI_REDESIGN_VIEW_SPECS.md

Nie zmieniaj logiki biznesowej, routingu, middleware, kontraktow API/BFF ani flow uzytkownika.
Najpierw przeanalizuj widok i powiazane komponenty.
Sprawdz specyfikacje widoku i sekcje "Do not lose".
Jesli potrzebny jest komponent globalny z foundation, dodaj go w pierwszej kolejnosci.
Zachowaj wszystkie dane, akcje i stany widoku.
Po zmianie uruchom sensowna weryfikacje i podaj raport wedlug dokumentacji.
```

## Granice etapu dokumentacyjnego

Ten etap dodaje tylko dokumenty sterujace praca AI:

- `docs/UI_REDESIGN_IMPLEMENTATION_PLAN.md`
- `docs/UI_REDESIGN_VIEW_BACKLOG.md`
- linki w `docs/README.md`

Nie nalezy w tym etapie zmieniac UI, komponentow Vue, styli aplikacji, routingu ani testow.
