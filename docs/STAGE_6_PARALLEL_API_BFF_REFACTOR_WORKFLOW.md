# Stage 6 — równoległy workflow refaktoru API/BFF

## Cel Stage 6

Stage 6 porządkuje warstwę komunikacji aplikacji:

- frontendowe API composables w `app/composables/**/use*Api.ts`,
- klienta BFF po stronie FE w `app/utils/api/*`,
- warstwę Nuxt/Nitro server BFF w `server/utils/**`,
- adaptery między mockami a prawdziwym upstream API.

Ten etap nie powinien zmieniać zachowania biznesowego aplikacji. Celem jest rozdzielenie odpowiedzialności, zmniejszenie dużych plików i ujednolicenie sposobu wykonywania requestów.

## Zasada główna pracy równoległej

Praca może iść równolegle, ale tylko wtedy, gdy każdy agent ma wyraźnego właściciela obszaru plików.

Nie wolno dopuścić do sytuacji, w której kilku agentów jednocześnie edytuje ten sam plik lub ten sam centralny kontrakt API.

Bezpieczny model:

1. Agenci robią równoległą analizę osobnych obszarów.
2. Implementacja idzie falami.
3. Każda fala ma osobną walidację.
4. Agent główny integruje zmiany, rozwiązuje zależności i robi merge do `develop`.

## Gałąź robocza

Startujemy zawsze z aktualnego `develop`.

```bash
git checkout develop
git pull
git checkout -b refactor/fe-stage6-api-bff-cleanup
```

Jeżeli praca ma być dzielona na mniejsze branche, rekomendowane nazwy:

- `refactor/fe-stage6-upstream-request`
- `refactor/fe-stage6-auth-bff`
- `refactor/fe-stage6-events-bff`
- `refactor/fe-stage6-api-composables`

Preferowany tryb dla pracy z wieloma agentami: jedna główna gałąź Stage 6 i kontrolowana integracja przez agenta głównego.

## Role agentów

### Agent główny — integracja i decyzje architektoniczne

Zakres:

- tworzy branch,
- pilnuje właścicielstwa plików,
- scala wyniki pracy agentów,
- sprawdza eksporty i importy,
- uruchamia walidację,
- robi commity,
- merguje do `develop`,
- sprząta branche po zakończeniu.

Agent główny jako jedyny powinien edytować centralne kontrakty, jeżeli dotykają więcej niż jednego obszaru.

### Agent A — upstream request

Obszar:

- `server/utils/upstream/*`

Główne zadanie:

- rozbić `server/utils/upstream/upstreamRequest.ts`.

Docelowy podział:

- `upstreamUrl.ts` — budowanie URL do upstream API,
- `upstreamCookies.ts` — cookies, access token, refresh token, czyszczenie sesji,
- `upstreamEnvelope.ts` — typ i parsowanie envelope odpowiedzi backendu,
- `upstreamBody.ts` — budowanie body i headers requestu,
- `upstreamRequest.ts` — cienki orkiestrator i kompatybilne eksporty.

Reguły:

- zachować publiczne eksporty używane przez inne moduły,
- nie zmieniać semantyki `upstreamRequest`,
- nie zmieniać zachowania refresh/cookie bez osobnej decyzji,
- nie dotykać `server/utils/auth/*` poza importami, jeśli jest to absolutnie konieczne.

Walidacja minimalna:

```bash
npx vitest run server/utils/upstream/upstreamRequest.test.ts server/utils/bff/bffAdapterExecutor.test.ts server/__tests__/bffAdapter.test.ts
npm run typecheck
```

### Agent B — auth BFF

Obszar:

- `server/utils/auth/*`

Główne zadanie:

- rozbić `server/utils/auth/authUpstreamBff.ts`.

Docelowy podział:

- `authBffAdapter.ts` — wybór adaptera `mock/upstream`,
- `authUpstreamSession.ts` — login, refresh, me, logout,
- `authUpstreamProfile.ts` — patch profilu i upload avatara,
- `authUpstreamRegister.ts` — rejestracja,
- `authUpstreamBff.ts` — kompatybilny barrel eksportów.

Reguły:

- zachować kompatybilność importów z obecnych testów,
- nie zmieniać kontraktów endpointów auth,
- nie przepisywać logiki walidacji profilu, jeśli nie jest to potrzebne do podziału pliku,
- nie dotykać `server/utils/upstream/*` w tej samej fali co Agent A, chyba że agent główny już zakończył integrację upstream.

Walidacja minimalna:

```bash
npx vitest run server/__tests__/bffAdapter.test.ts app/composables/auth/useAuthSession.test.ts app/composables/auth/useLoginPage.test.ts
npm run typecheck
```

### Agent C — events BFF

Obszar:

- `server/utils/events/*`
- testy bezpośrednio związane z events, jeżeli istnieją.

Główne zadanie:

- uporządkować `server/utils/events/eventsBff.ts`.

Możliwy podział:

- parsowanie/normalizacja danych eventów,
- operacje list/create/update/delete,
- helpery mapujące request/response,
- główny eksport BFF.

Reguły:

- nie zmieniać publicznego kontraktu eventów,
- nie zmieniać nazw endpointów,
- nie mieszać w frontendowych composables eventów w tej samej fali, jeśli nie jest to konieczne,
- poczekać na zakończenie podziału upstream/auth, jeśli events zależy od ich eksportów.

Walidacja minimalna:

```bash
npx vitest run app/composables/events/useInstructorEventsApi.test.ts
npm run typecheck
```

Jeżeli są testy server-side dla eventów, należy je dodać do tej walidacji.

### Agent D — FE API composables

Obszar:

- `app/composables/events/useInstructorEventsApi.ts`
- `app/composables/vehicles/useVehiclesApi.ts`
- `app/composables/students/useStudentsApi.ts`
- opcjonalnie mniejsze `app/composables/**/use*Api.ts`, jeśli korzystają z tych samych wzorców.

Główne zadanie:

- ujednolicić użycie `requestBffData`, `requestBffSuccess` i `bffFetch`,
- wyciągnąć powtarzalne normalizatory,
- uporządkować budowanie endpointów/query params,
- zmniejszyć lokalną duplikację.

Reguły:

- nie zmieniać publicznego API composables, jeśli nie jest to konieczne,
- nie zmieniać nazw metod używanych przez komponenty,
- nie przepisywać całych composables na nowy wzorzec bez wartości praktycznej,
- nie dotykać design systemu ani `DateTimePicker.vue` w tym etapie.

Walidacja minimalna:

```bash
npm run test:stage5
npm run typecheck
```

## Kolejność fal implementacji

### Fala 1 — upstream request

Najpierw rozbijamy `server/utils/upstream/upstreamRequest.ts`.

Powód:

- to najbardziej centralny punkt Stage 6,
- inne obszary mogą zależeć od jego eksportów,
- istnieją testy jednostkowe, więc ryzyko regresji jest kontrolowalne.

Po tej fali wymagany jest commit.

Przykład:

```bash
git add server/utils/upstream
git commit -m "refactor(fe): split upstream request helpers"
```

### Fala 2 — auth BFF

Po ustabilizowaniu upstream można rozbić `authUpstreamBff.ts`.

Powód:

- auth korzysta z upstream helpers,
- łatwiej utrzymać kompatybilność, gdy upstream ma już docelowy kształt.

Po tej fali wymagany jest commit.

Przykład:

```bash
git add server/utils/auth
git commit -m "refactor(fe): split auth upstream bff"
```

### Fala 3 — events BFF

Następnie porządkujemy `eventsBff.ts`.

Powód:

- events jest duże, ale mniej centralne niż upstream/auth,
- po wcześniejszych falach ma stabilniejsze zależności.

Po tej fali wymagany jest commit.

Przykład:

```bash
git add server/utils/events
git commit -m "refactor(fe): split events bff helpers"
```

### Fala 4 — frontend API composables

Na końcu porządkujemy największe FE composables.

Powód:

- po stronie FE można już opierać się na ustabilizowanej warstwie BFF,
- łatwiej wykryć, czy jakiś helper po stronie server wymaga korekty.

Po tej fali wymagany jest commit.

Przykład:

```bash
git add app/composables app/utils/api
git commit -m "refactor(fe): normalize api composable request patterns"
```

## Czego nie robić w Stage 6

W tym etapie nie ruszamy:

- design systemu,
- `DateTimePicker.vue`,
- dużych refaktorów widoków,
- zmian UI,
- zmiany kontraktu API,
- rozszerzania CI na `develop`,
- przepisywania mocków tylko dlatego, że są długie.

Duże mocki można uporządkować później, ale nie są pierwszym priorytetem Stage 6.

## Kryteria zakończenia Stage 6

Stage 6 można uznać za zamknięty, gdy:

- `upstreamRequest.ts` nie jest już dużym plikiem łączącym wiele odpowiedzialności,
- `authUpstreamBff.ts` jest podzielony na czytelne moduły,
- `eventsBff.ts` jest mniejszy i łatwiejszy do testowania,
- największe `use*Api.ts` mają mniej powtarzalnych endpointów, normalizacji i wrapperów,
- publiczne API composables i server utils pozostało kompatybilne,
- testy Stage 5 nadal przechodzą,
- pełna walidacja przechodzi lokalnie.

## Pełna walidacja przed merge do develop

Przed merge do `develop` należy uruchomić:

```bash
npm run format:check
npm run lint
npm run test:stage5
npm run test
npm run typecheck
```

Jeżeli build był wcześniej badany jako osobny temat wydajnościowy, nie jest wymagany po każdej małej fali. Wystarczy uruchomić go przed końcowym merge, jeżeli zmiany dotykały konfiguracji Nuxt/Nitro albo bundlingu.

## Merge i sprzątanie

Po zakończeniu Stage 6:

```bash
git checkout develop
git pull
git merge --no-ff refactor/fe-stage6-api-bff-cleanup
git push origin develop
git branch -d refactor/fe-stage6-api-bff-cleanup
git push origin --delete refactor/fe-stage6-api-bff-cleanup
```

Jeżeli praca była podzielona na mniejsze branche, każdy branch należy najpierw zmergować do gałęzi Stage 6 albo bezpośrednio do `develop`, a potem usunąć po pozytywnej walidacji.

## Rekomendowany prompt dla równoległych agentów

```text
Pracujemy nad Stage 6 refaktoru API/BFF w Nuxt app.

Nie zmieniaj zachowania biznesowego. Nie zmieniaj publicznych kontraktów endpointów ani composables.
Pracuj tylko w przypisanym obszarze plików. Jeśli potrzebujesz zmiany poza obszarem, zgłoś to agentowi głównemu zamiast edytować samodzielnie.

Twoje zadanie:
[TU WPISAĆ OBSZAR: upstream/auth/events/api-composables]

Wynik pracy:
1. Krótko opisz obecny problem.
2. Zaproponuj docelowy podział plików.
3. Wprowadź małe, kompatybilne zmiany.
4. Uruchom minimalną walidację dla swojego obszaru.
5. Zgłoś agentowi głównemu listę zmienionych plików, wynik testów i ryzyka.

Nie rób merge. Nie usuwaj branchy. Nie uruchamiaj zmian w CI.
```

## Rekomendacja startowa

Start Stage 6 powinien zacząć się od Fali 1:

```text
Rozbij server/utils/upstream/upstreamRequest.ts na mniejsze helpery, zachowując kompatybilne eksporty i obecne zachowanie testów.
```

To daje największy efekt porządkowy przy najłatwiejszej kontroli regresji.
