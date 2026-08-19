# Shared

`shared/` zawiera czyste kontrakty używane przez więcej niż jedną warstwę
aplikacji, na przykład przez frontend `app/` i serwer BFF `server/`.

## Kiedy używać

Dodaj plik do `shared/`, gdy dana wartość albo typ:

- opisuje stabilny kontrakt domenowy, a nie szczegół UI albo transportu;
- musi być identyczny w `app/` i `server/`;
- nie potrzebuje Nuxt runtime, Vue, composables, handlerów Nitro ani klienta HTTP;
- może być testowany i importowany bez uruchamiania aplikacji.

Przykład: `shared/contracts/courses.ts` trzyma `COURSE_KINDS`, `CourseKind` i
`isCourseKind`, bo lista typów kursu jest wspólna dla formularza frontendu,
normalizatorów danych i parserów request body w BFF.

## Czego tu nie trzymać

Nie dodawaj do `shared/`:

- komponentów Vue;
- composables;
- funkcji zależnych od `useRuntimeConfig`, `$fetch`, `useState`, `ref`,
  `computed` albo innych API Nuxt/Vue;
- handlerów `server/api` i adapterów BFF;
- labeli, copy, formatowania pod UI albo logiki widoku;
- kodu importującego z `app/` lub `server/`.

Jeżeli coś jest wspólne tylko dlatego, że kilka komponentów UI pokazuje ten sam
tekst, powinno zostać w warstwie UI, nie w `shared/`.

## Kierunek zależności

Dozwolone:

- `app/` -> `shared/`
- `server/` -> `shared/`

Niedozwolone:

- `shared/` -> `app/`
- `shared/` -> `server/`
- `shared/` -> Nuxt/Vue runtime

Ta zasada chroni BFF przed importowaniem typów z warstwy UI i chroni frontend
przed przypadkowym wciąganiem kodu serwerowego do bundla klienta.

## Contracts

`shared/contracts/` jest miejscem na najmniejsze wspólne kontrakty domenowe:

- listy wartości enum-like, np. `COURSE_KINDS`;
- typy wyprowadzone z tych list, np. `CourseKind`;
- proste guardy runtime, np. `isCourseKind`;
- małe DTO tylko wtedy, gdy ten sam kształt jest faktycznie publiczną umową
  między `app/` i `server/`.

Kontrakty w tym katalogu mają pozostać małe i dependency-free. Jeżeli plik
zaczyna potrzebować klienta API, store, route, komponentu albo formattera UI, to
znaczy, że powinien trafić do `app/` albo `server/`, a nie do `shared/`.
