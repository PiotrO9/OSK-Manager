# Zaawansowane filtry listy kursantów — plan wdrożenia

Data: 2026-09-10

Status: wdrożony iteracyjnie, w trakcie oceny użytkownika.

Zakres: W07 `/manager/students`, frontend Nuxt, BFF Nuxt i backend Express/Prisma.

## 1. Cel i decyzja produktowa

Rozszerzamy obecną listę o opcjonalny kreator reguł `Pole → Warunek → Wartość`. Nie zastępuje on:

- wyszukiwarki tekstowej;
- szybkich widoków `Wszyscy`, `Bez PKK`, `Bez kursu`, `Z zaległościami`, `Bez zaplanowanej jazdy`;
- wyboru szkoły i kursu.

Wszystkie warstwy filtrów działają razem przez `AND`:

```text
wybrana szkoła
AND wybrany kurs
AND wyszukiwany tekst
AND szybki widok
AND każda reguła zaawansowana
```

Pierwsza wersja nie obsługuje grup `OR`, zagnieżdżeń ani zapisanych zestawów. Negację zapewniają operatory `nie jest`, `nie zawiera`, `jest pusty` i `nie ma`. To pokrywa oczekiwany przypadek `is NOT = wartość`, zachowując prostotę obecnego widoku. Maksymalnie można zastosować 8 reguł.

Inspiracją interakcji jest [Table Filters — Lemon Squeezy](https://dribbble.com/shots/15005862-Table-Filters): dodawanie jednej reguły w kompaktowym edytorze i pozostawianie aktywnych reguł jako chipów. Dobór operatorów do typu pola odpowiada wzorcom opisanym przez [Airtable](https://support.airtable.com/articles/9290731839-filtering-records-using-conditions) i [Linear](https://linear.app/docs/filters).

## 2. Docelowy układ

### Desktop

```text
[ Szukaj kursanta…                                      ] [ + Dodaj filtr (2) ]

[Wszyscy] [Bez PKK] [Bez kursu] [Z zaległościami] [Bez zaplanowanej jazdy]

[Status konta] [nie jest] [Nieaktywny] [×] [Kurs] [nie jest] [Kat. B] [×]
                                                        [Wyczyść wszystkie]
```

Kliknięcie `Dodaj filtr` otwiera popover szerokości około 560 px:

```text
Dodaj filtr

[ Pole                         v ]
[ Warunek                      v ]
[ Wartość / wybór / data         ]

[Anuluj]                              [Zastosuj filtr]
```

### Telefon

- wyszukiwarka pozostaje pełnej szerokości;
- przycisk `Dodaj filtr` ma wysokość co najmniej 44 px i znajduje się pod wyszukiwarką;
- edytor otwiera dolny `UiSheet`, żeby klawiatura i listy wyboru nie zasłaniały formularza;
- aktywne chipy są w jednej przewijanej poziomo linii; każdy można otworzyć do edycji lub usunąć osobnym przyciskiem;
- szybkie widoki zachowują obecny układ.

## 3. Zachowanie interakcji

1. Kliknięcie `Dodaj filtr` otwiera pusty szkic reguły.
2. Wybór pola ogranicza listę dostępnych operatorów i ustala typ kontrolki wartości.
3. Operatory `jest pusty`, `nie jest pusty`, `ma dowolny` i `nie ma` nie pokazują pola wartości.
4. `Zastosuj filtr` jest wyłączone do czasu uzupełnienia poprawnej reguły.
5. Zastosowanie, edycja lub usunięcie reguły wraca na stronę 1, unieważnia starsze żądanie i pobiera wyniki ponownie.
6. Aktywny filtr jest pokazany jako jeden chip z segmentami `Pole`, `Warunek` i opcjonalną `Wartość`. Segmenty nie mają znaków ani strzałek pomiędzy sobą; różnią się wizualnie tłem/obramowaniem, żeby wyglądały jak schematyczne, klikalne części reguły.
7. Kliknięcie treści chipa otwiera tę regułę do edycji. `×` usuwa ją bez otwierania edytora.
8. Przy edycji reguły zmiana warunku zachowuje wpisaną wartość, jeżeli nowy warunek nadal używa wartości tego samego typu. Przykłady: `zawiera` ↔ `nie zawiera` ↔ `jest` ↔ `nie jest`, `jest` ↔ `nie jest` dla statusu i kursu, `przed` ↔ `po` dla dat. Wartość jest czyszczona tylko po przejściu na warunek bez wartości, np. `jest pusty`, `nie jest pusty`, `ma dowolny kurs`, `nie ma kursu`, `ma`, `nie ma`.
9. Zamknięcie edytora przez `Esc`, kliknięcie poza nim lub `Anuluj` odrzuca szkic i nie zmienia wyników.
10. Identyczna reguła nie jest dodawana drugi raz. Powtarzanie tego samego pola z inną wartością jest dozwolone.
11. `Wszyscy` zeruje tylko szybki widok. Nie usuwa tekstu, kursu ani reguł zaawansowanych.
12. `Wyczyść wszystkie` usuwa tekst, wybrany kurs, szybki widok i reguły zaawansowane. Wybrana szkoła zostaje.
13. Zmiana szkoły usuwa główny filtr kursu oraz zaawansowane reguły odnoszące się do konkretnych kursów. Pozostałe reguły i tekst pozostają.
14. Sprzeczne warunki są dozwolone i prowadzą do pustego wyniku. Stan pusty pokazuje wszystkie aktywne chipy i akcję `Wyczyść wszystkie`.

## 4. Pola, operatory i semantyka

Etykiety są po polsku. Tokeny techniczne pozostają stabilne w API.

| Pole UI           | Token                | Operatory UI                                                     | Tokeny operatorów                                      | Wartość                    |
| ----------------- | -------------------- | ---------------------------------------------------------------- | ------------------------------------------------------ | -------------------------- |
| Imię              | `firstName`          | zawiera, nie zawiera, jest, nie jest                             | `contains`, `not_contains`, `eq`, `neq`                | tekst 1–80                 |
| Nazwisko          | `lastName`           | zawiera, nie zawiera, jest, nie jest                             | `contains`, `not_contains`, `eq`, `neq`                | tekst 1–80                 |
| E-mail            | `email`              | zawiera, nie zawiera, jest, nie jest                             | `contains`, `not_contains`, `eq`, `neq`                | tekst 1–120                |
| Telefon           | `phone`              | zawiera, nie zawiera, jest pusty, nie jest pusty                 | `contains`, `not_contains`, `is_empty`, `is_not_empty` | tekst albo brak            |
| Numer PKK         | `pkkNumber`          | zawiera, nie zawiera, jest, nie jest, jest pusty, nie jest pusty | operatory tekstowe + puste                             | tekst 1–20 albo brak       |
| Status konta      | `isActive`           | jest, nie jest                                                   | `eq`, `neq`                                            | `true` / `false`           |
| Kurs              | `courseId`           | jest, nie jest, ma dowolny kurs, nie ma kursu                    | `eq`, `neq`, `is_not_empty`, `is_empty`                | UUID kursu albo brak       |
| Zaległości        | `hasOverduePayments` | ma, nie ma                                                       | `eq`                                                   | boolean                    |
| Zaplanowana jazda | `hasUpcomingLesson`  | ma, nie ma                                                       | `eq`                                                   | boolean                    |
| Data dodania      | `createdAt`          | przed, po, pomiędzy                                              | `before`, `after`, `between`                           | `YYYY-MM-DD` albo para dat |

Reguły tekstowe ignorują wielkość liter i otaczające spacje. `nie jest` oraz `nie zawiera` uwzględniają rekordy z wartością `null`; do jawnego sprawdzania braków służą operatory pustej wartości.

Znaczenie relacji:

- `Kurs nie jest X` — kursant nie jest przypisany do kursu X; może należeć do innego kursu;
- `Kurs nie ma kursu` — brak przypisania do jakiegokolwiek nieusuniętego kursu w aktualnej OSK;
- `Zaległości ma` — co najmniej jedna nieopłacona płatność z terminem wcześniejszym niż początek dzisiejszego dnia, zgodnie z obecną definicją podsumowania płatności;
- `Zaplanowana jazda ma` — co najmniej jedna przyszła, nieusunięta lekcja `PRACTICE` ze statusem `SCHEDULED` w aktualnej OSK;
- `Data dodania po D` — od początku następnego dnia po D; `przed D` — przed początkiem D; `pomiędzy` obejmuje oba wybrane dni.

## 5. Kontrakt danych

Frontend przechowuje reguły jako dyskryminowaną unię TypeScript. Każda reguła ma trwałe `id` używane wyłącznie w UI.

```ts
type StudentAdvancedFilter =
    | {
          id: string;
          field: 'firstName' | 'lastName' | 'email' | 'phone' | 'pkkNumber';
          operator: TextOperator;
          value?: string;
      }
    | { id: string; field: 'isActive'; operator: 'eq' | 'neq'; value: boolean }
    | { id: string; field: 'courseId'; operator: 'eq' | 'neq'; value: string }
    | { id: string; field: 'courseId'; operator: 'is_empty' | 'is_not_empty' }
    | {
          id: string;
          field: 'hasOverduePayments' | 'hasUpcomingLesson';
          operator: 'eq';
          value: boolean;
      }
    | {
          id: string;
          field: 'createdAt';
          operator: 'before' | 'after';
          value: string;
      }
    | {
          id: string;
          field: 'createdAt';
          operator: 'between';
          value: [string, string];
      };
```

Do API wysyłany jest ten sam obiekt bez `id`. `GET /students` otrzymuje opcjonalny parametr `filters`, zawierający JSON kodowany przez `URLSearchParams`:

```json
[
    { "field": "isActive", "operator": "neq", "value": false },
    { "field": "courseId", "operator": "neq", "value": "COURSE_UUID" },
    { "field": "pkkNumber", "operator": "is_not_empty" }
]
```

Pozostają obecne parametry `schoolId`, `courseId`, `search`, `view`, `page` i `limit`. `filters` ma limity:

- najwyżej 8 reguł;
- najwyżej 4096 bajtów po odczytaniu z query;
- wyłącznie pola, operatory i rodzaje wartości z tabeli powyżej;
- brak nieznanych kluczy;
- daty w formacie `YYYY-MM-DD`, poprawna kolejność zakresu;
- UUID kursu musi wskazywać nieusunięty kurs w aktualnej OSK.

BFF parsuje i waliduje `filters`, po czym wysyła do backendu kanoniczny JSON. Backend ponownie waliduje dane na granicy zewnętrznej. Błędny filtr zwraca 400; filtr bez wyników zwraca poprawną pustą stronę.

## 6. Zmiany w kodzie

### Frontend i BFF — `FE/OSK-Manager-FE`

| Plik                                                                 | Zmiana                                                                                                                                                       |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `app/components/app/AppAdvancedFilters.vue`                          | Reużywalna powłoka zaawansowanych filtrów: trigger, licznik, czyszczenie, aktywne chipy, desktopowy popover, mobilny sheet i slot na edytor domenowy.        |
| `app/components/app/AppAdvancedFilterSegments.vue`                   | Reużywalna prezentacja segmentów aktywnej reguły `Pole`, `Warunek`, `Wartość` bez zależności od kursantów.                                                   |
| `shared/utils/advancedFilters.ts`                                    | Neutralne typy `AdvancedFilterChip` i `AdvancedFilterSegment` używane przez wspólną powłokę UI.                                                              |
| `shared/utils/studentAdvancedFilters.ts`                             | Typy, lista pól/operatorów, Zod, serializacja bez `id`, formatowanie etykiet chipów i sprawdzanie duplikatów.                                                |
| `app/components/manager/students/ManagerStudentsAdvancedFilters.vue` | Adapter kursantów: mapuje reguły kursantów na neutralne chipy i wkłada edytor kursantów w slot wspólnego komponentu.                                         |
| `app/components/manager/students/ManagerStudentFilterEditor.vue`     | Kontrolowany szkic `Pole → Warunek → Wartość`; odpowiednia kontrolka tekst/select/data. Bez pobierania danych i bez logiki API.                              |
| `app/components/manager/students/ManagerStudentsSearch.vue`          | Osadzenie triggera obok wyszukiwarki i chipów pod szybkimi widokami; nowe props/emits.                                                                       |
| `app/composables/students/useManagerStudentsAdvancedFilters.ts`      | Stan zastosowanych reguł i szkicu, add/edit/remove/reset, czyszczenie reguł kursu po zmianie OSK.                                                            |
| `app/composables/students/useManagerStudentsData.ts`                 | `advancedFilters`, dołączenie ich do pobrania listy i zachowanie mechanizmu unieważniania żądań.                                                             |
| `app/composables/students/useManagerStudentsPage.ts`                 | Połączenie composable z widokiem; reset strony i ładowanie po zmianie zastosowanych reguł.                                                                   |
| `app/pages/manager/students/index.vue`                               | Przekazanie filtrów oraz jedna funkcja `clearAllFilters`; stan pusty uwzględnia reguły zaawansowane.                                                         |
| `app/utils/students/studentApiRequests.ts`                           | Serializacja `filters` w `buildStudentsListPath`.                                                                                                            |
| `server/api/students.get.ts`                                         | Odczyt i walidacja `filters`, limit rozmiaru, zwrot polskiego błędu 400.                                                                                     |
| `server/utils/students/studentsBff.ts`                               | Przekazanie kanonicznego parametru do `/students`.                                                                                                           |
| `server/utils/students/mockStudentsList.ts`                          | Ten sam predykat dla mocka; deterministyczne dane kursu, zaległości i jazd per kursant. Obecny globalny skrót zaległości należy zastąpić danymi per kursant. |
| `server/utils/students/studentsMockBff.ts`                           | Przekazanie zwalidowanych reguł do mocka.                                                                                                                    |

Nie dodajemy nowej zależności. Wykorzystujemy istniejące `UiPopover`, `UiSheet`, `UiSelect`, `UiInput`, `UiButton` i obecny date picker.

### Backend — `BE`

| Plik                                   | Zmiana                                                                                                                       |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/validation/studentSchemas.ts` | Dyskryminowany schemat Zod reguł, parser parametru JSON i limity.                                                            |
| `src/services/students/listFilters.ts` | Tłumaczenie każdej dozwolonej reguły na `Prisma.StudentProfileWhereInput`; wszystkie warunki trafiają do istniejącego `AND`. |
| `src/services/students/list.ts`        | Walidacja wszystkich użytych UUID kursów w jednej kwerendzie i użycie rozszerzonego buildera przed `count`, `skip` i `take`. |
| `src/swagger/paths/students.paths.ts`  | Opis parametru `filters`, operatorów, limitów i przykład requestu.                                                           |

Migracja bazy nie jest potrzebna. Istniejące indeksy relacji wystarczą dla pierwszego wdrożenia. Wyszukiwanie `%tekst%` pozostaje potencjalnie najdroższą częścią; optymalizację indeksami trigramowymi rozważamy dopiero po pomiarze na danych produkcyjnych.

## 7. Tłumaczenie na Prisma

Najważniejsze reguły implementacji backendu:

- każdy filtr jest budowany przez jawny `switch(field)` i `switch(operator)`; klient nie przekazuje nazw kolumn ani fragmentów Prisma/SQL;
- filtry tekstowe używają `mode: 'insensitive'`;
- negacja pola opcjonalnego jawnie uwzględnia `null` zgodnie z semantyką z sekcji 4;
- filtry kursu, płatności i jazd zawsze zawierają `schoolId` oraz `deletedAt: null` odpowiednich obiektów;
- wszystkie reguły trafiają do tego samego `where`, które jest używane przez `findMany` i `count`;
- paginacja i stabilne sortowanie pozostają bez zmian;
- nie budujemy dynamicznego SQL i nie przyjmujemy dowolnych operatorów.

## 8. Dostępność i stany

- trigger ma `aria-expanded`, `aria-controls` oraz nazwę z liczbą reguł;
- grupa chipów ma etykietę `Aktywne filtry zaawansowane`;
- treść chipa ma dostępnościowo pełne zdanie, np. `Status konta nie jest Nieaktywny`, a wizualnie jest rozbita na segmenty `Status konta`, `nie jest`, `Nieaktywny`;
- osobny przycisk usuwania ma etykietę `Usuń filtr: …`;
- wszystkie pola edytora mają widoczne etykiety;
- fokus po otwarciu trafia do wyboru pola, a po zamknięciu wraca na trigger;
- `Esc` zamyka edytor bez zastosowania szkicu;
- zmiana wyników korzysta z istniejącego stanu ładowania i liczników; nie pokazujemy osobnego toastu przy każdym filtrze;
- błąd listy nie usuwa aktywnych reguł, dzięki czemu można je poprawić lub skasować;
- jasny i ciemny motyw używają istniejących tokenów, bez nowych kolorów domenowych.

## 9. Testy

### Frontend — Vitest

1. Serializacja wszystkich typów reguł bez `id` i poprawne kodowanie znaków.
2. Brak parametru przy pustej tablicy.
3. Odrzucenie nieznanego pola/operatora, złej wartości, odwróconego zakresu, 9. reguły i payloadu ponad limit.
4. Add/edit/remove/reset bez mutowania propsów; brak identycznego duplikatu.
5. Zmiana warunku zachowuje wartość dla kompatybilnych typów wartości i czyści ją tylko przy przejściu na operator bez wartości.
6. Zmiana filtra resetuje stronę, unieważnia starsze żądanie i pobiera listę tylko po zastosowaniu pełnej reguły.
7. `Wszyscy` zachowuje reguły zaawansowane; `Wyczyść wszystkie` usuwa wszystkie warstwy poza szkołą.
8. Zmiana OSK usuwa tylko reguły z konkretnym `courseId`.
9. Mock zwraca wyniki zgodne z produkcyjną semantyką relacji per kursant.

### Backend — Vitest

1. Każda dozwolona para pole/operator generuje oczekiwane `where`.
2. `eq`, `neq`, `not_contains` oraz puste wartości poprawnie traktują `null`.
3. Kurs `eq`, `neq`, dowolny i brak pozostają w zakresie aktualnej OSK.
4. Zaległości i przyszłe jazdy używają istniejących definicji domenowych i granic daty.
5. `before`, `after`, `between` obejmują uzgodnione lokalne dni.
6. Wszystkie warstwy są połączone przez `AND` przed `count` i paginacją.
7. Jeden odczyt weryfikuje wszystkie UUID kursów; obcy/usunięty kurs daje 404 lub 400 zgodnie z istniejącym kontraktem.
8. Brak dostępu do szkoły zatrzymuje zapytanie przed wyszukaniem danych.
9. OpenAPI przechodzi walidację i zawiera nowy parametr.

### Przeglądarka

- dodanie, edycja i usunięcie każdego rodzaju reguły;
- połączenie z wyszukiwarką, każdym szybkim widokiem i głównym filtrem kursu;
- kursant znaleziony spoza pierwszej strony; aktualizacja licznika i powrót na stronę 1;
- brak wyników i pełny reset;
- szybkie przełączanie reguł nie pokazuje odpowiedzi starszego requestu;
- desktop 1100/1280 px, szerokość pośrednia 960 px i telefon 390 px;
- jasny/ciemny motyw, klawiatura, focus, `Esc`, czytnikowe nazwy kontrolek;
- brak przepełnienia poziomego i minimalny cel dotykowy 44 px na telefonie;
- produkcyjny backend oraz tryb mock.

## 10. Checklista i kolejność implementacji

- [x] **Plan:** ustalić zakres, semantykę operatorów, kontrakt API i kryteria akceptacji.
- [x] **Kontrakt:** dodać typy, registry pól/operatorów, Zod i testy serializacji.
- [x] **Backend:** dodać parser, builder Prisma, walidację kursów, OpenAPI i testy serwisu.
- [x] **BFF i mock:** bezpiecznie przekazać parametr oraz dodać zgodny evaluator mocka.
- [x] **Stan frontendu:** dodać composable i integrację requestów, reset strony oraz anulowanie wyścigów.
- [x] **UI:** dodać edytor, trigger, chipy, popover desktop i sheet mobile.
- [x] **Integracja widoku:** obsłużyć pusty stan, `Wyczyść wszystkie` i zmianę szkoły.
- [ ] **Weryfikacja:** uruchomić testy FE/BE, typy, lint, OpenAPI i scenariusze przeglądarkowe. Częściowo wykonane: testy ukierunkowane FE/BE, lint dotkniętych plików, backend typecheck i Nuxt dev server. Pełny FE typecheck blokują istniejące błędy testów `avatarUrl`, a scenariusz przeglądarkowy wymaga sesji managera oraz zainstalowanej przeglądarki Playwright.
- [ ] **Dokumentacja:** dopisać wynik i decyzję użytkownika do `UI_REFRESH_PLAN.md`; W07 odhaczyć dopiero po akceptacji całości.

Każdy punkt wdrażamy i weryfikujemy przed rozpoczęciem następnego. Checkbox oznacza gotowy, sprawdzony etap, a nie samo rozpoczęcie pracy.

## 11. Kryteria akceptacji

- obecne filtry zachowują wygląd i działanie;
- użytkownik może dodać regułę `Status konta nie jest Nieaktywny` oraz `Kurs nie jest X`;
- lista, licznik i paginacja zawsze dotyczą całego zestawu warunków;
- aktywne warunki pozostają widoczne po zamknięciu edytora;
- regułę można edytować i usunąć bez odtwarzania całego zestawu;
- reset ma zachowanie opisane w sekcji 3;
- nie można wysłać dowolnego pola, operatora ani zapytania do Prisma;
- działanie jest równoważne w trybie mock i z backendem;
- interfejs działa na telefonie, klawiaturą oraz w obu motywach;
- wszystkie sprawdzenia z sekcji 9 przechodzą i nie ma nowych błędów konsoli.

## 12. Poza pierwszym wdrożeniem

- grupy `OR` i zagnieżdżone reguły;
- zapisywanie nazwanych widoków;
- współdzielenie filtrów przez URL strony;
- sugestie filtrów generowane z języka naturalnego;
- liczba dopasowań pokazywana przed zastosowaniem szkicu;
- własna kolejność chipów;
- zaawansowane filtry wspólne dla innych tabel.

Te funkcje warto rozważyć dopiero po sprawdzeniu, jak managerowie korzystają z prostych reguł na liście kursantów.
