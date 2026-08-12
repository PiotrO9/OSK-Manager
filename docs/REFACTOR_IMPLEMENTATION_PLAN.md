# OSK Manager - plan wdrozenia refaktoru

Status: w trakcie realizacji

Zakres: backend Express/Prisma/Supabase oraz frontend Nuxt/Vue/Nitro BFF

Ten dokument jest operacyjnym planem wdrozenia pieciu uzgodnionych obszarow
refaktoru. Ma pozwolic prowadzic prace malymi krokami, bez zmiany zachowania
produktu i bez jednego duzego PR-a obejmujacego cala aplikacje.

Plan obejmuje:

1. Domkniecie poprzedniego refaktoru backendu i przywrocenie czystego linta.
2. Jeden klient HTTP/BFF oraz jedna strategia odswiezania sesji na frontendzie.
3. OpenAPI jako rzeczywiste zrodlo typow transportowych.
4. Rozbicie najwiekszych composables i komponentow Vue.
5. Ujednolicenie wyboru adaptera mock/upstream w Nitro BFF.

## Zasady prowadzenia refaktoru

- Nie zmieniamy logiki biznesowej pod pretekstem porzadkowania kodu.
- Nie zmieniamy publicznych endpointow, statusow HTTP ani ksztaltu odpowiedzi bez
  osobnej, jawnej decyzji kontraktowej.
- Kazdy etap musi miec testy charakteryzujace obecne zachowanie przed zmiana.
- Kazdy PR powinien byc mozliwy do wdrozenia i wycofania niezaleznie.
- Najpierw stabilizujemy transport i kontrakty, pozniej rozbijamy logike widokow.
- Zachowujemy pliki-fasady i kompatybilne eksporty, dopoki wszystkie wywolania
  nie zostana przepiete.
- Nie tworzymy abstrakcji tylko dlatego, ze dwa fragmenty wygladaja podobnie.
  Wspolna abstrakcja musi miec ten sam kontrakt i co najmniej dwa realne uzycia.
- Stan Nuxt SSR pozostaje izolowany per request. Nie przechowujemy sesji ani
  obietnicy refreshu w globalnym stanie modulu.
- Tokeny pozostaja w ciasteczkach httpOnly. Frontend nie zaczyna przechowywac JWT.
- Zmiany zwiazane z Supabase Auth wymagaja sprawdzenia aktualnego changelogu i
  dokumentacji Supabase przed implementacja.

## Poza zakresem

- redesign wizualny aplikacji;
- zmiana frameworkow lub dodanie nowego globalnego store bez potrzeby;
- zmiana modelu danych Prisma albo migracje bazy;
- zmiana dostawcy uwierzytelniania;
- przebudowa regul biznesowych lekcji, platnosci i harmonogramu;
- laczenie repozytoriow FE i BE w monorepo;
- optymalizacja wydajnosci bez pomiaru i bez zwiazku z refaktorem.

## Stan bazowy

Stan z audytu przed rozpoczeciem prac:

- backend: 23 pliki testowe, 166 testow przechodzi;
- frontend: 11 plikow testowych, 61 testow przechodzi;
- backend build przechodzi;
- backend lint: 669 problemow, w tym 653 ostrzezenia;
- frontend lint: 23 bledy formatowania;
- frontend build nie zakonczyl sie w czasie audytu i wymaga osobnej diagnozy;
- 71 z 71 handlerow Nitro BFF recznie wybiera mock albo upstream;
- `requestBffData` jest uzywane w 28 plikach;
- wygenerowane typy OpenAPI sa uzywane bezposrednio tylko w obszarze events;
- FE i BE sa dwoma niezaleznymi repozytoriami Git.

Przed pierwszym PR-em nalezy zapisac aktualne wyniki polecen w opisie PR-a.
Nie commitujemy logow z narzedzi.

## Mini-checklista calego programu

- [x] Wykonano audyt struktury FE i BE.
- [x] Ustalono glowne hotspoty i kolejnosc zaleznosci.
- [ ] Utworzono osobne branche robocze w FE i BE.
- [ ] Etap 0: zamrozono baseline i dodano testy charakteryzujace.
- [x] Etap 1: backend ma czysty lint, testy i build.
- [ ] Etap 2: wszystkie wywolania FE korzystaja z jednego klienta BFF/session.
- [ ] Etap 3: OpenAPI jest generowane deterministycznie i kontrolowane w CI.
- [ ] Etap 5: trasy Nitro korzystaja ze wspolnego wykonawcy adapterow.
- [ ] Etap 4A: rozbito szczegoly kursanta.
- [ ] Etap 4B: rozbito formularz edycji wydarzenia.
- [ ] Etap 4C: wydzielono wspolne elementy kalendarzy tygodniowych.
- [ ] Etap 4D: rozbito `VehiclesListPanel.vue`.
- [ ] Wykonano pelny test regresji manager/student/instructor.
- [ ] Zaktualizowano dokumentacje architektury i mapy kodu.
- [ ] Usunieto tymczasowe fasady dopiero po zakonczeniu migracji wywolan.

## Kolejnosc wdrozenia

Kolejnosc realizacji rozni sie od numeracji tematow, poniewaz wynika z
zaleznosci technicznych:

```text
Etap 0: baseline i testy
    |
    v
Etap 1: porzadki backendu
    |
    v
Etap 2: wspolny klient HTTP/session
    |
    v
Etap 3: kontrakt OpenAPI i typy
    |
    v
Etap 5: adaptery Nitro BFF
    |
    v
Etap 4: composables i komponenty Vue
    |
    v
Etap 6: regresja, dokumentacja, usuniecie fasad
```

Etap 4 jest ostatni, poniewaz duze composables powinny byc rozbijane dopiero na
stabilnym kliencie HTTP i po ustaleniu typow transportowych. Inaczej te same
pliki bylyby zmieniane kilkukrotnie.

## Strategia branchy i PR-ow

FE i BE sa osobnymi repozytoriami. Nie laczymy ich zmian w jeden commit.

Proponowane branche:

- BE: `refactor/01-backend-cleanup`
- FE: `refactor/02-bff-client`
- BE: `refactor/03-openapi-contract`
- FE: `refactor/03-openapi-types`
- FE: `refactor/05-bff-adapters`
- FE: `refactor/04-student-details`
- FE: `refactor/04-event-edit-form`
- FE: `refactor/04-weekly-calendars`
- FE: `refactor/04-vehicles-list-panel`

Kazdy PR powinien zawierac:

- zakres i jawne elementy poza zakresem;
- liste zachowan zabezpieczonych testami;
- wynik lint/test/build;
- informacje o kompatybilnosci API;
- plan wycofania;
- zrzuty ekranu tylko wtedy, gdy zmieniono strukture komponentow UI.

## Etap 0 - baseline i siatka bezpieczenstwa

### Cel

Zapisac aktualne zachowanie krytycznych granic przed przenoszeniem kodu.

### Zadania

- [ ] Uruchomic w BE: `npm run test`, `npm run lint`, `npm run build`.
- [ ] Uruchomic w FE: `npm run test`, `npm run lint`, `npm run build`.
- [ ] Zdiagnozowac osobno wiszacy lub bardzo wolny build FE.
- [ ] Sprawdzic, czy build nie czeka na siec, SEO crawler albo zasob runtime.
- [ ] Zapisac liste aktualnych endpointow BFF i publicznych metod composables.
- [ ] Dodac testy charakteryzujace obecna obsluge 401 i refreshu.
- [ ] Dodac testy charakteryzujace wybor mock/upstream dla reprezentatywnych tras.
- [ ] Dodac test kontraktu odpowiedzi auth: login, me, refresh, logout.
- [ ] Potwierdzic brak modyfikacji schematu bazy i RLS w tym programie prac.

### Minimalne przypadki auth do zamrozenia

- poprawne logowanie ustawia profil sesji;
- `GET /me` odtwarza sesje po SSR i po odswiezeniu strony;
- pierwszy 401 uruchamia maksymalnie jeden refresh;
- udany refresh ponawia pierwotne zadanie dokladnie raz;
- nieudany refresh czysci sesje;
- endpoint refresh nie probuje odswiezac samego siebie;
- 403 i 404 nie sa automatycznie traktowane jak wygasla sesja;
- request SSR przekazuje cookies przy uzyciu request-scoped fetch;
- rownolegle 401 nie uruchamiaja wielu requestow refresh.

### Kryterium wyjscia

Istnieja testy, ktore nie wymagaja nowej architektury, ale opisuja obecne i
oczekiwane zachowanie krytycznych sciezek. Wyniki bazowe sa znane.

## Etap 1 - domkniecie refaktoru backendu

### Cel

Przywrocic zaufanie do statycznej analizy backendu i usunac artefakty
mechanicznego dzielenia plikow.

### Glowne obszary

- `BE/src/services/event/*`
- `BE/src/services/lesson/*`
- `BE/src/swagger/paths/*.paths.ts`
- pliki-fasady `BE/src/services/*.service.ts`
- `BE/src/controllers/*.controller.ts`
- konfiguracja ESLint, Prettier, EditorConfig i Git attributes
- duplikaty konfiguracji Vitest
- nieuzywane zaleznosci npm

### Kolejnosc prac

#### 1.1 Naprawa linta bez zmiany zachowania

- [ ] Usunac nieuzywane importy w `services/event/*`.
- [ ] Usunac nieuzywane importy w `services/lesson/*`.
- [ ] Zawezic importy w kazdym `swagger/paths/*.paths.ts`.
- [ ] Poprawic bledy indentacji i `prefer-const`.
- [ ] Ujednolicic zakonczenia linii.
- [ ] Nie uzywac globalnego `eslint-disable` do wyciszenia problemu.
- [ ] Uruchamiac lint po kazdej domenie, nie dopiero na koncu.

Docelowo kazdy plik Swaggera importuje tylko schematy potrzebne do
rejestrowanych w nim sciezek. `shared.ts` moze pozostac zbiorem eksportow, ale
nie moze wymuszac importowania calego kontraktu do kazdego modulu.

#### 1.2 Weryfikacja granic modulow

- [ ] Sprawdzic, czy kazdy plik domenowy ma jedna odpowiedzialnosc.
- [ ] Usunac stale `prisma`, jezeli modul nie wykonuje zapytan.
- [ ] Nie przenosic logiki z serwisu do kontrolera.
- [ ] Zachowac cienkie pliki-fasady z re-eksportami.
- [ ] Sprawdzic cykle importow pomiedzy event, lesson i availability.
- [ ] Sprawdzic, czy typy nie sa importowane przez publiczne fasady bez potrzeby.

#### 1.3 Porzadki konfiguracyjne

- [ ] Wybrac jeden plik Vitest: `vitest.config.ts`.
- [ ] Potwierdzic, ze starszy `vitest.config.js` nie jest uzywany.
- [ ] Usunac starsza konfiguracje w osobnym, malym commicie.
- [ ] Sprawdzic, czy `jsonwebtoken` i `@types/jsonwebtoken` sa nieuzywane.
- [ ] Usunac nieuzywane zaleznosci dopiero po buildzie i testach.
- [ ] Dodac lub poprawic `.gitattributes` z polityka `text=auto eol=lf` dla kodu.
- [ ] Uzgodnic `.editorconfig` z ESLint i Prettier.

#### 1.4 Zaostrzenie bramki jakosci

- [ ] Ustawic lint CI jako wymagany.
- [ ] Ustalic `--max-warnings=0` po wyczyszczeniu obecnych ostrzezen.
- [ ] Nie wlaczac tej bramki przed usunieciem calego zastanego backlogu.
- [ ] Dodac `git diff --check` do checklisty PR.

### Podzial PR-ow

1. Event i lesson imports.
2. Swagger imports.
3. EOL, formatowanie i pojedyncze bledy lint.
4. Konfiguracje oraz nieuzywane zaleznosci.
5. Wlaczenie `--max-warnings=0` w CI.

### Kryterium wyjscia

- `npm run lint` zwraca 0 bledow i 0 ostrzezen;
- `npm run test` przechodzi;
- `npm run build` przechodzi;
- publiczne eksporty serwisow pozostaja kompatybilne;
- OpenAPI contract tests nadal przechodza;
- nie zmieniono odpowiedzi endpointow.

## Etap 2 - jeden klient HTTP/BFF i jedna strategia sesji

### Problem

Obecnie `requestBffData` korzysta bezposrednio z transportu, natomiast obsluga
401 znajduje sie w reaktywnym `useBffApi`. `useAuthSession` ma dodatkowa,
niezalezna implementacje refresh/retry. Zachowanie zalezy wiec od tego, ktorego
helpera uzywa dany ekran.

### Docelowa architektura

Klient powinien byc tworzony per instancja aplikacji Nuxt, czyli per request SSR
i per aplikacja kliencka. Pozwala to przechowywac `refreshPromise` bez ryzyka
wycieku stanu miedzy uzytkownikami.

Proponowane elementy:

```text
app/
  plugins/
    bff-client.ts                  # instancja klienta per Nuxt app/request
  utils/api/
    bffClient.ts                   # czysta fabryka klienta i single-flight refresh
    apiError.ts                    # normalizacja statusu i komunikatu
    apiEnvelope.ts                 # istniejace rozpakowanie envelope
  composables/core/
    useBffClient.ts                # typowany dostep do klienta
    useBffRequest.ts               # reaktywny loading/data/error
  composables/auth/
    useAuthSession.ts              # stan profilu i operacje auth, bez wlasnego transportu
```

Fabryka klienta nie moze importowac `useAuthSession`, jezeli `useAuthSession`
korzysta z klienta. Zapobiegamy cyklowi przez callbacki konfiguracyjne klienta:

- `fetch`: request-scoped fetch z Nuxt;
- `onAuthFailure`: czyszczenie stanu sesji;
- `onAuthRecovered`: opcjonalna synchronizacja profilu;
- `navigateToLogin`: wykonywane tylko po stronie klienta i tylko dla wywolan,
  ktore tego wymagaja.

### Kontrakt klienta

Planowany interfejs koncepcyjny:

```ts
type BffAuthMode = 'required' | 'optional' | 'none';

interface BffRequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: unknown;
    headers?: Record<string, string>;
    auth?: BffAuthMode;
    retryUnauthorized?: boolean;
    signal?: AbortSignal;
}

interface BffClient {
    request<T>(path: string, options?: BffRequestOptions): Promise<T>;
    requestData<T>(path: string, options?: BffRequestOptions): Promise<T>;
}
```

`auth: 'none'` oraz `retryUnauthorized: false` musza byc uzyte dla loginu,
refreshu i innych publicznych endpointow. Zapobiega to rekurencyjnemu refreshowi.

### Kroki wdrozenia

#### 2.1 Testowana fabryka klienta

- [ ] Wydzielic typ `ApiError` i parser bledow.
- [ ] Stworzyc czysta fabryke `createBffClient` z wstrzykiwanym fetch.
- [ ] Dodac single-flight refresh oparty o lokalne `refreshPromise`.
- [ ] Dodac limit jednego retry po 401.
- [ ] Zachowac status, payload i komunikat pierwotnego bledu.
- [ ] Dodac testy bez Nuxt runtime dla fabryki klienta.

#### 2.2 Integracja z Nuxt i SSR

- [ ] Utworzyc plugin `bff-client.ts`.
- [ ] Na serwerze uzyc `useRequestFetch`, aby przekazywac cookies requestu.
- [ ] Na kliencie uzyc `$fetch` dla tego samego originu.
- [ ] Potwierdzic brak module-level state.
- [ ] Dodac deklaracje typow dla `$bff` w Nuxt app.
- [ ] Sprawdzic zachowanie podczas hydration i client-side navigation.

#### 2.3 Migracja auth

- [ ] Przepiac login na nowego klienta z `auth: 'none'`.
- [ ] Przepiac `/me` na nowego klienta.
- [ ] Przepiac patch profilu.
- [ ] Przepiac logout.
- [ ] Usunac reczne parsery bledu, ktore duplikuja `apiError.ts`.
- [ ] Pozostawic `useState('auth_session')` jako jedno zrodlo profilu.
- [ ] Zachowac demo login jako jawny tryb lokalny, poza klientem produkcyjnym.

Przed zmiana Supabase Auth:

- [ ] Sprawdzic aktualny Supabase changelog pod katem breaking changes.
- [ ] Potwierdzic aktualne zasady revoke session i wygasania JWT.
- [ ] Nie uzywac `user_metadata` do decyzji autoryzacyjnych.
- [ ] Potwierdzic, ze service role nie trafia do runtime config public.

#### 2.4 Migracja pozostalych API

- [ ] Przepinac composables domenami, nie wyszukiwaniem i masowa zamiana.
- [ ] Kolejnosc: students, payments, vehicles, courses, instructors, lessons,
      events, schedule, ratings, schools.
- [ ] Po kazdej domenie uruchomic jej testy i smoke test widoku.
- [ ] Zachowac tymczasowy wrapper `useApi` do czasu migracji wszystkich wywolan.
- [ ] Usunac wrapper dopiero, gdy wyszukiwanie nie pokazuje konsumentow.

### Testy wymagane

- [ ] 200 zwraca dane bez refreshu.
- [ ] 400/403/404 zachowuja status i nie uruchamiaja refreshu.
- [ ] 401 uruchamia refresh i jedno ponowienie.
- [ ] Dwa lub wiecej rownoleglych 401 korzysta z jednego refreshPromise.
- [ ] Nieudany refresh czysci sesje jeden raz.
- [ ] Blad retry jest zwracany zamiast bledu pierwszego requestu.
- [ ] Logout nie wywoluje petli refresh/logout.
- [ ] SSR przekazuje cookies.
- [ ] Request abort zachowuje `AbortSignal`.
- [ ] `requestData` poprawnie waliduje envelope.

### Kryterium wyjscia

- wszystkie requesty aplikacji przechodza przez jeden klient;
- istnieje jedna implementacja retry po 401;
- `useAuthSession` odpowiada za stan profilu, nie transport;
- brak cyklu importow klient-auth;
- testy wspolbieznosci refreshu przechodza;
- login, refresh, logout i SSR zachowuja dotychczasowe cookies oraz statusy.

## Etap 3 - OpenAPI jako zrodlo typow transportowych

### Cel

Backend jest wlascicielem kontraktu HTTP, a frontend generuje z niego typy.
Reczne typy frontendu pozostaja tylko modelami domeny UI lub modelami widoku.

### Docelowy przeplyw

```text
Zod schemas w BE
    -> rejestr OpenAPI
    -> deterministyczny openapi.json
    -> openapi-typescript
    -> app/types/generated/api.ts
    -> male aliasy domenowe w app/types/api/*
    -> composables API
    -> modele widoku
```

### Backend - generowanie specyfikacji

- [ ] Dodac skrypt eksportujacy OpenAPI bez uruchamiania serwera HTTP.
- [ ] Zapisywac deterministyczny `openapi/openapi.json`.
- [ ] Posortowac lub stabilizowac output, aby unikac losowych diffow.
- [ ] Dodac `npm run api:spec`.
- [ ] Dodac CI: generacja oraz sprawdzenie `git diff --exit-code`.
- [ ] Zachowac istniejace testy kontraktu OpenAPI.
- [ ] Dodac testy dla endpointow dotychczas opisanych jako `unknown`.

### Frontend - generowanie typow

- [ ] Zmienic `api:types`, aby przyjmowal jawne zrodlo specyfikacji.
- [ ] Lokalnie domyslnie uzyc specyfikacji z sasiedniego repo BE.
- [ ] W CI dostarczac spec jako artefakt konkretnej wersji backendu.
- [ ] Nie generowac z przypadkowo uruchomionego `localhost:3001` w CI.
- [ ] Dodac `npm run api:types:check` porownujacy wygenerowany plik.
- [ ] Oznaczyc `app/types/generated/api.ts` jako plik tylko do generacji.

Poniewaz FE i BE sa osobnymi repozytoriami, kazda zmiana kontraktu powinna miec
jawna kolejnosc:

1. BE dodaje kompatybilny kontrakt i publikuje spec.
2. FE aktualizuje snapshot/spec artifact i generuje typy.
3. FE migruje konsumentow.
4. Dopiero osobny etap BE usuwa stary kontrakt, jezeli jest to konieczne.

### Warstwa aliasow

Nie uzywamy dlugich typow `paths['/...']['get']...` w kazdym komponencie.
Tworzymy male aliasy transportowe:

```text
app/types/api/
  auth.ts
  students.ts
  payments.ts
  vehicles.ts
  courses.ts
  instructors.ts
  lessons.ts
  events.ts
  schedule.ts
```

Alias moze wskazywac na wygenerowany request lub response. Nie kopiuje recznie
ksztaltu DTO.

### Kolejnosc migracji domen

- [ ] Events - uporzadkowac istniejace wykorzystanie generated types.
- [ ] Auth/session - usunac lokalny `BackendUserResponse` po pokryciu kontraktu.
- [ ] Students i payments.
- [ ] Vehicles.
- [ ] Courses i instructors.
- [ ] Lessons i ratings.
- [ ] Schedule i availability.
- [ ] Schools.

Dla kazdej domeny:

- [ ] wskazac typ requestu z OpenAPI;
- [ ] wskazac typ odpowiedzi z OpenAPI;
- [ ] pozostawic osobny model widoku, jezeli UI potrzebuje innego ksztaltu;
- [ ] mapowanie transport -> model widoku trzymac w czystej funkcji;
- [ ] usunac reczne DTO dopiero po migracji wszystkich importow;
- [ ] dodac test mapowania dla danych opcjonalnych i nullable.

### Kryterium wyjscia

- OpenAPI jest generowane deterministycznie przez BE;
- CI wykrywa nieodswiezona specyfikacje i typy;
- wszystkie composables API korzystaja z typow wygenerowanych lub ich aliasow;
- reczne typy nie duplikuja kontraktu HTTP;
- modele widoku sa wyraznie oddzielone od DTO;
- zmiana kontraktu ma udokumentowana sekwencje miedzy dwoma repozytoriami.

## Etap 5 - wspolny wykonawca adapterow Nitro BFF

### Problem

Kazdy handler BFF osobno:

1. waliduje request;
2. pobiera konfiguracje adaptera;
3. sprawdza upstream;
4. wywoluje adapter upstream albo mock;
5. czasami osobno sprawdza role dla mocka.

Rozgalezienie jest powtorzone w 71 handlerach i moze sie rozjechac miedzy
domenami.

### Granica abstrakcji

Nie ukrywamy walidacji requestu ani logiki domenowej. Handler nadal ma byc
czytelny i pokazywac:

- jakie params/query/body przyjmuje;
- jakie walidatory uruchamia;
- jakie dane przekazuje do operacji domenowej.

Wspolny helper odpowiada tylko za wybor adaptera i wspolne zachowanie techniczne.

### Docelowa struktura

```text
server/utils/bff/
  adapter.ts              # typ adaptera i resolve config
  executeAdapter.ts       # wybor upstream/mock
  adapterError.ts         # wspolne bledy konfiguracji
  executeAdapter.test.ts

server/utils/<domain>/
  <domain>Bff.ts          # operacje upstream
  <domain>MockBff.ts      # operacje mock
  types.ts                # kontrakt wewnetrzny adaptera, jezeli potrzebny
```

Koncepcyjny interfejs:

```ts
interface AdapterExecution<T> {
    upstream: (upstreamBase: string) => Promise<T>
    mock: () => Promise<T> | T
    beforeMock?: () => Promise<void> | void
}

executeBffAdapter<T>(event, execution): Promise<T>
```

`beforeMock` zachowuje jawna autoryzacje lokalnego mocka. Nie przenosimy regul
RBAC do ogolnego helpera.

### Kroki wdrozenia

#### 5.1 Fundament

- [ ] Przeniesc lub opakowac `resolveBffAdapterFromConfig` w `server/utils/bff`.
- [ ] Zachowac dotychczasowe reguly produkcyjnego upstreamu.
- [ ] Dodac `executeBffAdapter`.
- [ ] Dodac testy trybow mock/upstream i blednej konfiguracji.
- [ ] Dodac test, ze callback nieaktywnego adaptera nie jest wykonywany.

#### 5.2 Migracja pilotazowa

- [ ] Wybrac prosta domene read-only, np. ratings albo vehicles GET.
- [ ] Przepisac 2-3 trasy bez zmiany walidacji.
- [ ] Porownac envelope, status HTTP i bledy przed/po zmianie.
- [ ] Sprawdzic auto-importy Nitro i jawne typy H3Event.

#### 5.3 Migracja domenowa

Proponowana kolejnosc:

- [ ] ratings i manager attention;
- [ ] vehicles;
- [ ] schools;
- [ ] courses i instructors;
- [ ] students i payments;
- [ ] lessons i events;
- [ ] schedule i availability;
- [ ] auth na koncu, ze wzgledu na cookies i refresh.

Po kazdej domenie:

- [ ] wszystkie trasy domeny korzystaja z wykonawcy;
- [ ] test mock adaptera przechodzi;
- [ ] test upstream adaptera przechodzi;
- [ ] zachowano statusy HTTP;
- [ ] nie pozostawiono mieszanego wzorca w tej samej domenie.

#### 5.4 Zakonczenie migracji

- [ ] Wyszukiwanie w `server/api` nie znajduje bezposredniego wyboru upstream.
- [ ] Usunac stary helper dopiero po migracji auth.
- [ ] Zaktualizowac `server/utils/README.md` i `docs/API_AND_BFF.md`.
- [ ] Dodac wzorzec przykladowego handlera do dokumentacji.

### Kryterium wyjscia

- handler zawiera walidacje i jedno wywolanie wykonawcy adaptera;
- wybor mock/upstream jest zaimplementowany raz;
- autoryzacja mocka pozostaje jawna i testowalna;
- statusy, cookies i envelope sa zgodne z poprzednim zachowaniem;
- brak bezposredniego `resolveUpstreamBase` w trasach po zakonczeniu migracji.

## Etap 4 - rozbicie composables i komponentow Vue

Etap jest podzielony na cztery niezalezne strumienie. Kazdy zachowuje publiczna
fasade do czasu migracji widoku i testow.

### Wspolne zasady Vue

- route-level page pozostaje cienka powierzchnia kompozycji;
- stan zrodlowy jest minimalny, wartosci pochodne sa `computed`;
- watcher sluzy do efektow ubocznych, nie do obliczania stanu pochodnego;
- czyste konwersje i geometria trafiaja do `utils`, nie do composables;
- stan zwracany bez publicznej mutacji jest `readonly`;
- kontrakty komponentow sa typowane przez props/emits;
- `v-model` jest uzywany tylko jako prawdziwy kontrakt dwukierunkowy;
- nie dodajemy Pinia tylko w celu zmniejszenia liczby linii;
- nie przenosimy stanu do module-level refs ze wzgledu na SSR.

### Etap 4A - szczegoly kursanta

Plik startowy:

- `app/composables/students/useManagerStudentDetailsPage.ts`

Obecne odpowiedzialnosci:

- identyfikacja kursanta i szkoly z route/session;
- profil i notatki;
- status procesu;
- platnosci oraz komendy platnosci;
- harmonogram tygodniowy;
- teksty podsumowan i stany loading/error.

Docelowa mapa:

```text
app/composables/students/details/
  useManagerStudentProfile.ts
  useManagerStudentProcessStatus.ts
  useManagerStudentPayments.ts
  useManagerStudentSchedule.ts
  useManagerStudentDetailsSummary.ts

app/composables/students/useManagerStudentDetailsPage.ts
  # cienka fasada skladajaca powyzsze composables
```

Odpowiedzialnosci:

- `useManagerStudentProfile`: load profilu i aktualizacja notatek;
- `useManagerStudentProcessStatus`: load statusu procesu i kroki;
- `useManagerStudentPayments`: lista, summary, create/update/paid/unpaid;
- `useManagerStudentSchedule`: zakres tygodnia, load i nawigacja;
- `useManagerStudentDetailsSummary`: czyste computed dla naglowka i podsumowan;
- fasada: route wiring i zachowanie dotychczasowego publicznego API.

Checklist:

- [ ] Dodac testy obecnej fasady przed podzialem.
- [ ] Wydzielic platnosci jako pierwszy, najbardziej niezalezny obszar.
- [ ] Wydzielic harmonogram.
- [ ] Wydzielic process status.
- [ ] Wydzielic profil i notatki.
- [ ] Wydzielic computed podsumowan.
- [ ] Zachowac nazwy zwracanych pol fasady.
- [ ] Po migracji uproscic strone do kompozycji sekcji.

### Etap 4B - formularz edycji wydarzenia

Plik startowy:

- `app/composables/events/useManagerEventEditForm.ts`

Docelowa mapa:

```text
app/utils/events/
  eventDateTimeForm.ts       # ISO/local, walidacja i clamp
  eventFormSnapshot.ts       # baseline/current/dirty

app/composables/events/edit/
  useManagerEventEditState.ts
  useManagerEventEditDateTime.ts
  useManagerEventEditValidation.ts

app/composables/events/useManagerEventEditForm.ts
  # kompatybilna fasada
```

Podzial odpowiedzialnosci:

- czyste konwersje dat i listy opcji godzinowych trafiaja do utils;
- stan formularza, hydrate i reset trafia do state composable;
- walidacja slotu/instruktora pozostaje efektem async;
- dirty checking uzywa czystego snapshotu;
- istniejace `useManagerEventEditActions` nie powinno dublowac walidacji formy.

Checklist:

- [ ] Dodac testy konwersji timezone i granic dnia.
- [ ] Dodac testy clamp start/end.
- [ ] Dodac test dirty state po hydrate/reset/edit.
- [ ] Wydzielic czyste funkcje bez zmiany ich wyniku.
- [ ] Wydzielic stan formularza.
- [ ] Ujednolicic odpowiedzialnosc z `useManagerEventEditActions`.
- [ ] Zachowac publiczne pola fasady podczas migracji komponentow.

### Etap 4C - kalendarze tygodniowe

Pliki startowe:

- `useManagerSchoolScheduleCalendar.ts`
- `useManagerSchoolWeeklyAvailabilityCalendar.ts`
- `useManagerInstructorWeeklyCalendar.ts`
- `useManagerInstructorSchedulePage.ts`

Elementy wspolne do potwierdzenia przed ekstrakcja:

- poczatek tygodnia i zakres dat;
- prev/next week;
- wybor daty w popover calendar;
- obsluga klawiatury;
- etykiety tygodnia;
- grupowanie elementow per dzien;
- geometria osi czasu.

Docelowa mapa:

```text
app/composables/schedule/calendar/
  useWeeklyCalendarNavigation.ts
  useWeeklyCalendarSelection.ts       # tylko jesli dwa widoki maja ten sam kontrakt

app/utils/schedule/calendar/
  weeklyCalendarRange.ts
  timelineGeometry.ts
  groupScheduleItems.ts
```

Nie laczymy w jeden composable pobierania lessons, availability slots i school
slots. Dane domenowe pozostaja w dotychczasowych composables.

Checklist:

- [ ] Spisac porownanie kontraktow czterech kalendarzy.
- [ ] Dodac testy nawigacji na granicy miesiaca i roku.
- [ ] Dodac testy DST i lokalnych dat.
- [ ] Wydzielic czyste range/label helpers.
- [ ] Wydzielic geometrie timeline.
- [ ] Wydzielic nawigacje tylko po potwierdzeniu identycznego zachowania.
- [ ] Pozostawic domain-specific loading i actions w domenach.
- [ ] Wykonac wizualny smoke test desktop/mobile.

### Etap 4D - VehiclesListPanel

Plik startowy:

- `app/components/app/VehiclesListPanel.vue`

Docelowa mapa komponentow:

```text
app/components/vehicles/list/
  VehiclesListPanel.vue              # kontener i kompozycja
  VehiclesListHeader.vue             # tytul, licznik, create action
  VehiclesListFilters.vue            # filtry i sortowanie
  VehiclesListContent.vue            # wybor table/mobile list
  VehiclesListRow.vue                # pojedynczy pojazd desktop
  VehiclesListItem.vue               # pojedynczy pojazd mobile, jesli kontrakt rozny
  VehicleDeleteDialog.vue            # potwierdzenie usuniecia
  VehicleDefaultAction.vue           # tylko jezeli ma niezalezny stan
```

Przed utworzeniem kazdego komponentu trzeba potwierdzic, ze reprezentuje osobna
sekcje lub powtarzalny element. Nie tworzymy wrapperow skladajacych sie z kilku
linijek bez wlasnej odpowiedzialnosci.

Kontrakty:

- dane schodza przez typowane props;
- akcje wracaja przez emits;
- wiersz nie wykonuje sam requestow API;
- kontener zachowuje loading/error/empty i koordynuje akcje;
- dialog emituje confirm/cancel i nie zna API vehicles.

Checklist:

- [ ] Spisac wszystkie obecne akcje i stany panelu.
- [ ] Dodac test zachowania default/delete przed podzialem.
- [ ] Wydzielic row/item.
- [ ] Wydzielic header i filters.
- [ ] Wydzielic dialog usuniecia.
- [ ] Zachowac stabilne `key`, focus i dostepnosc klawiatury.
- [ ] Zweryfikowac desktop i mobile.
- [ ] Nie zmieniac wygladu poza roznicami koniecznymi do zachowania struktury.

### Kryterium wyjscia etapu 4

- fasady stron sa cienkie i skladaja wyspecjalizowane composables;
- czyste funkcje domenowe maja testy jednostkowe;
- efekty uboczne sa oddzielone od computed i mapowania;
- komponenty maja jawne, typowane props/emits;
- nie pogorszono SSR ani hydration;
- wszystkie loading/error/empty/success/confirm states pozostaly dostepne;
- publiczne zachowanie widokow jest zgodne z baseline.

## Etap 6 - pelna weryfikacja i zakonczenie

### Automatyczna weryfikacja

Backend:

```bash
npm run lint
npm run test
npm run build
git diff --check
```

Frontend:

```bash
npm run lint
npm run format:check
npm run test
npm run build
git diff --check
```

Dodatkowo:

- [ ] `api:spec` nie generuje diffu w BE.
- [ ] `api:types:check` nie generuje diffu w FE.
- [ ] wyszukiwanie nie znajduje starego transportu poza fasada kompatybilnosci;
- [ ] wyszukiwanie nie znajduje bezposredniego wyboru adaptera w trasach;
- [ ] wyszukiwanie nie znajduje recznych DTO, ktore duplikuja OpenAPI;
- [ ] brak nowych `eslint-disable`, `@ts-ignore` i nieuzasadnionego `any`.

### Smoke test rol

Manager:

- [ ] login/logout/refresh;
- [ ] dashboard i attention items;
- [ ] lista oraz szczegoly kursanta;
- [ ] platnosci kursanta;
- [ ] wydarzenia i edycja wydarzenia;
- [ ] harmonogram szkoly i instruktora;
- [ ] vehicles: lista, default, status, delete;
- [ ] tryb mock i tryb upstream.

Student:

- [ ] login i odtworzenie sesji;
- [ ] moje kursy, lekcje i platnosci;
- [ ] rezerwacja oraz anulowanie lekcji;
- [ ] ocena lekcji;
- [ ] wygasniecie sesji podczas akcji.

Instructor:

- [ ] login i odtworzenie sesji;
- [ ] harmonogram i availability;
- [ ] dostep do dozwolonych danych;
- [ ] poprawne 403 dla niedozwolonych operacji.

### Rollback

- kazdy etap zachowuje fasade starego API do konca migracji;
- nie laczymy usuniecia starego API z pierwszym wdrozeniem nowego;
- zmiana klienta HTTP ma feature flag lub mozliwosc szybkiego przywrocenia
  wrappera podczas pierwszego wdrozenia;
- migracje adapterow sa domenowe, wiec mozna wycofac pojedyncza domene;
- OpenAPI jest zmieniane addytywnie przed usuwaniem starych pol;
- brak migracji bazy oznacza, ze rollback nie wymaga operacji na danych.

## Ryzyka i zabezpieczenia

| Ryzyko                             | Skutek                      | Zabezpieczenie                                             |
| ---------------------------------- | --------------------------- | ---------------------------------------------------------- |
| Petla refresh -> 401 -> refresh    | nieskonczone requesty       | `retryUnauthorized: false` dla auth i limit jednego retry  |
| Kilka refreshow naraz              | race condition cookies      | single-flight promise per Nuxt app/request                 |
| Wyciek stanu miedzy SSR requestami | naruszenie prywatnosci      | brak module-level refs/promise, klient per Nuxt app        |
| Rozjazd FE/BE w dwoch repo         | bledy typow lub runtime     | wersjonowany spec artifact i CI drift check                |
| Nadmierna abstrakcja BFF           | ukryta walidacja/RBAC       | helper wybiera adapter, handler zachowuje walidacje        |
| Mega-refactor composable           | trudny review i rollback    | fasady, podzial domenowy, jeden obszar na PR               |
| Zmiana timezone w kalendarzu       | przesuniete terminy         | testy DST, local date i granic tygodnia                    |
| Utrata stanow UI                   | regresje UX                 | inwentaryzacja loading/error/empty/confirm przed podzialem |
| Wyciszenie linta zamiast naprawy   | ukryty dlug                 | zakaz globalnych disable i `--max-warnings=0` po cleanupie |
| Zmiana semantyki Supabase Auth     | utrata sesji/bezpieczenstwa | aktualny changelog/docs i test login/me/refresh/logout     |

## Definition of Done calego refaktoru

Program mozna uznac za zakonczony, gdy:

- [ ] lint FE i BE przechodzi bez ostrzezen;
- [ ] testy FE i BE przechodza;
- [ ] build FE i BE przechodzi w CI;
- [ ] wszystkie requesty FE korzystaja z jednego klienta;
- [ ] refresh jest single-flight i izolowany per request SSR;
- [ ] OpenAPI i generated types maja automatyczny drift check;
- [ ] reczne typy FE nie kopiuja DTO transportowych;
- [ ] wszystkie trasy BFF korzystaja ze wspolnego wykonawcy adaptera;
- [ ] wskazane duze composables zostaly rozbite wedlug odpowiedzialnosci;
- [ ] `VehiclesListPanel` jest kompozycja mniejszych, typowanych komponentow;
- [ ] dokumenty `ARCHITECTURE.md`, `CODEMAP.md`, `COMPOSABLES.md` i
      `API_AND_BFF.md` opisuja stan po refaktorze;
- [ ] stare fasady i kompatybilne wrappery zostaly usuniete albo oznaczone z
      konkretnym terminem usuniecia;
- [ ] smoke test trzech rol zostal wykonany na mock i upstream;
- [ ] nie zmieniono regul biznesowych ani schematu bazy bez osobnego zadania.

## Dziennik decyzji

W trakcie wdrozenia nalezy dopisywac ponizej decyzje, ktore zmieniaja plan.

| Data       | Obszar          | Decyzja                                                                                                        | Powod                                            | Konsekwencje                                                                                         |
| ---------- | --------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| 2026-08-07 | Backend cleanup | Usunieto stary `vitest.config.js`, dodano `.gitattributes` LF i wlaczono `--max-warnings=0` w backendowym lint | Backend lint zostal wyczyszczony z 669 problemow | Nowe ostrzezenia ESLint blokuja `npm run lint`; backend wymaga Node zgodnego z wymaganiami ESLint 10 |
| 2026-08-07 | Backend facades | Publiczne fasady `*.service.ts` eksportuja jawne API domeny zamiast `export *`                                 | Fasada ma stabilizowac granice modulu            | Agregatory schematow Zod zostaja dopuszczalne; wewnetrzne warstwy bez konsumentow sa usuwane         |

## Raport postepu

Po zakonczeniu kazdego PR-a aktualizujemy mini-checkliste oraz dopisujemy:

| Etap | PR/commit | Status  | Wynik testow                                                        | Uwagi                                                                                 |
| ---- | --------- | ------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| 0    | -         | pending | -                                                                   | baseline i testy charakteryzujace                                                     |
| 1    | local     | done    | `npm run lint`, `npm run test`, `npm run build`, `git diff --check` | backend cleanup; usunieto nieuzywane importy, stary Vitest JS config i `jsonwebtoken` |
| 2    | -         | pending | -                                                                   | klient HTTP/session                                                                   |
| 3    | -         | pending | -                                                                   | OpenAPI i typy                                                                        |
| 5    | -         | pending | -                                                                   | adaptery Nitro BFF                                                                    |
| 4A   | -         | pending | -                                                                   | szczegoly kursanta                                                                    |
| 4B   | -         | pending | -                                                                   | edycja wydarzenia                                                                     |
| 4C   | -         | pending | -                                                                   | kalendarze tygodniowe                                                                 |
| 4D   | -         | pending | -                                                                   | vehicles list panel                                                                   |
| 6    | -         | pending | -                                                                   | regresja i dokumentacja                                                               |
