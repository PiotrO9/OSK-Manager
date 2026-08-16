# Plan refaktoru frontendu

## Status dokumentu

- Repozytorium: `FE/OSK-Manager-FE`
- Stos: Nuxt 4, Vue 3, TypeScript, Nitro, Vitest, Tailwind CSS, shadcn-vue
- Aktualny branch roboczy: `refactor/03-bff-adapters`
- Cel: poprawa architektury i testowalnosci bez zmiany zachowania aplikacji
- Poza zakresem: redesign UI, nowe funkcje biznesowe i zmiany kontraktow backendu
- Sposob pracy: jeden branch roboczy, male commity, bez Pull Requestow
- Weryfikacja: testy i lint bez automatycznego buildu; `npm run build` tylko na wyrazne polecenie

## Tryb pracy na tym refaktorze

- Pracujemy na branchu `refactor/03-bff-adapters` do czasu zakonczenia calego planu albo jawnej decyzji o zmianie.
- Nie otwieramy Pull Requestow.
- Jeden wykonywalny punkt checklisty oznacza jeden commit.
- Commit zawiera implementacje, potrzebne testy oraz odznaczenie odpowiedniego checkboxa w tym pliku.
- Checkboxy zbiorcze, kryteria zakonczenia i Definition of Done nie wymuszaja pustych commitow; odznaczamy je razem z ostatnim powiazanym zadaniem.
- Po kazdym zweryfikowanym commicie wypychamy branch na `origin`.
- Po zakonczeniu jednego punktu od razu przechodzimy do kolejnego.
- Male blockery rozwiazujemy pragmatycznie w ramach aktualnego punktu, priorytetyzujac tempo i ciaglosc pracy.
- Powazny blocker zapisujemy w sekcji "Problemy odroczone", pomijamy tymczasowo punkt, kontynuujemy kolejne zadania i wracamy do blockerow na koncu.
- Raport koncowy musi wymieniac nierozwiazane blockery, wykonane proby i decyzje potrzebne do ich domkniecia.
- Subagenci moga pomagac w analizie, weryfikacji i rozdzielnych zakresach pracy, ale glowny watek odpowiada za integracje, finalna weryfikacje, commit i push.

## Glowna lista postepu

Ta lista jest indeksem calego procesu. Szczegolowe checklisty znajduja sie w kolejnych sekcjach.

- [ ] Etap 0: zapisac baseline i zasady refaktoru
- [x] Etap 1: ujednolicic wybor adaptera BFF `mock/upstream`
- [x] Etap 2: domknac jedna warstwe transportu po stronie aplikacji
- [x] Etap 3: uproscic sesje, autoryzacje i middleware rol
- [ ] Etap 4: podzielic najwieksze composables na mniejsze odpowiedzialnosci
- [ ] Etap 5: odchudzic duze strony i komponenty Vue
- [ ] Etap 6: uporzadkowac typy, walidacje i normalizacje danych
- [ ] Etap 7: rozbudowac siatke testow regresyjnych
- [ ] Etap 8: ujednolicic strukture katalogow i dokumentacje
- [ ] Etap 9: wykonac koncowy audyt i zamknac refaktor
- [ ] Prowadzic kontrole przekrojowe przez wszystkie etapy
- [ ] Aktualizowac dziennik decyzji i liste problemow odroczonych

## Dlaczego te miejsca sa priorytetem

Stan z chwili utworzenia planu pokazuje kilka konkretnych obszarow ryzyka:

| Obszar              | Obserwacja                                                            | Ryzyko                                                            |
| ------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Nitro BFF           | dziesiatki handlerow osobno wybieraja `resolveUpstreamBase` albo mock | rozjazd autoryzacji, statusow HTTP i kopert odpowiedzi            |
| Composables         | kilka plikow ma ponad 500 linii                                       | ukryte zaleznosci, trudne testy, wiele powodow do zmiany          |
| Komponenty i strony | wiele SFC ma 400-530 linii                                            | mieszanie orkiestracji, prezentacji i obslugi formularzy          |
| Sesja               | `useAuthSession.ts` ma okolo 559 linii                                | duzy zasieg regresji przy zmianach logowania i odswiezania tokenu |
| Typy                | domenowe typy i wygenerowane OpenAPI istnieja rownolegle              | mozliwy dryf kontraktow i nadmiar `unknown`                       |
| Testy               | 12 plikow testowych: 8 w `app`, 4 w `server`                          | za mala ochrona najwazniejszych przeplywow                        |
| Middleware rol      | osobne pliki powtarzaja normalizacje i sprawdzanie rol                | niespojna obsluga `MANAGER`, `ADMIN`, `INSTRUCTOR`, `STUDENT`     |

Najwieksze pliki nie sa automatycznie bledne. Sa jedynie sygnalem do sprawdzenia liczby odpowiedzialnosci. Podzial wykonujemy tylko wtedy, gdy granica ma jasny kontrakt i daje sie pokryc testem.

## Zasady prowadzenia refaktoru

- Nie zmieniamy zachowania i struktury odpowiedzi API w tym samym commicie co refaktor.
- Przed migracja domeny dodajemy lub aktualizujemy test regresyjny jej obecnego zachowania.
- Strony Nuxt maja pozostac cienkimi powierzchniami kompozycji.
- Stan zrodlowy przechowujemy raz, a wartosci pochodne liczymy przez `computed`.
- `watch` sluzy do efektow ubocznych, nie do utrzymywania stanu pochodnego.
- Komponenty przyjmuja dane przez typowane propsy i zwracaja zdarzenia przez typowane emits.
- Composables odpowiadaja za stan, orkiestracje i efekty; czyste transformacje trafiaja do `utils`.
- Wewnetrzne wywolania `/api/**` przechodza przez wspolnego klienta BFF.
- Kod Nitro zachowuje rozdzial: handler HTTP, adapter domenowy, transport upstream, mock.
- Nie tworzymy ogolnych `index.ts` dla kodu domenowego tylko w celu skrocenia importow. Barrel files pozostaja glownie w wygenerowanym shadcn-vue, gdzie sa czescia wzorca biblioteki UI.
- Jeden commit powinien opisywac jedna migracje lub jedna warstwe fundamentu.
- Po kazdym commicie uruchamiamy testy celowane i lint dla zmienionego zakresu; przed pushem pelny zestaw kontroli.

## Kontrole przekrojowe

Te punkty obowiazuja podczas kazdego etapu. Nie stanowia osobnej migracji i nie powinny rozszerzac zakresu aktualnego brancha bez uzasadnienia.

### Martwy kod

- [x] Po migracji sprawdzic konsumentow starych eksportow przez `rg`.
- [x] Usuwac nieuzywane composables, komponenty, typy i wrappery dopiero po przepieciu wszystkich konsumentow.
- [ ] Nie pozostawiac tymczasowych adapterow bez zadania i terminu ich usuniecia.
- [ ] Nie usuwac kodu tylko dlatego, ze nie jest znaleziony przez prosty import; sprawdzic auto-importy Nuxt i dynamiczne uzycia komponentow.

### Zaleznosci i kierunek importow

- [ ] Sprawdzac, czy po zmianie nie powstaly importy cykliczne.
- [ ] Utrzymac kierunek: page/component -> composable -> API lub util/type.
- [ ] Nie pozwalac, aby `utils` importowaly composables, komponenty lub stan Nuxt.
- [ ] Nie pozwalac, aby typy domenowe zalezaly od komponentow.
- [ ] Ograniczac importy pomiedzy domenami do jawnych, stabilnych kontraktow.
- [ ] Przy wykryciu cyklu przeniesc wspolny kontrakt nizej, zamiast maskowac problem barrel file.

### Race conditions i anulowanie pracy

- [ ] Dla wyszukiwania, filtrow i zmiany zakresu dat sprawdzic kolejnosc odpowiedzi asynchronicznych.
- [ ] Anulowac nieaktualne requesty przez `AbortController`, gdy transport to obsluguje.
- [ ] Gdy anulowanie nie jest dostepne, ignorowac wynik starszego requestu przez identyfikator wykonania.
- [ ] Czyscic asynchroniczne efekty watcherow przy zmianie zaleznosci i unmount.
- [ ] Testowac scenariusz, w ktorym starsza odpowiedz przychodzi po nowszej.
- [ ] Blokowac podwojny submit tylko tam, gdzie operacja nie jest bezpiecznie idempotentna.

### Dostepnosc po podziale komponentow

- [ ] Zachowac etykiety formularzy, opisy i powiazania `aria-*`.
- [ ] Zachowac obsluge klawiatury i widoczny focus.
- [ ] Po zamknieciu dialogu przywracac focus do elementu wywolujacego.
- [ ] Komunikaty bledow i loading udostepniac technologiom asystujacym.
- [ ] Nie zmieniac kolejnosci fokusu przez sam podzial DOM na komponenty.
- [ ] Sprawdzic dialogi, selecty, tabele mobilne i akcje ikonowe.

### Bezpieczenstwo frontendu i BFF

- [ ] Nie logowac access tokenu, refresh tokenu, cookies ani pelnych danych logowania.
- [ ] Utrzymac tokeny sesji w cookies `httpOnly` i nie przenosic ich do stanu klienta.
- [ ] Przekazywac do upstreamu tylko wymagane naglowki i cookies.
- [ ] Walidowac parametry route, query i body na granicy handlera.
- [ ] Nie zwracac do klienta technicznych danych bledu lub sekretow konfiguracji.
- [ ] Potwierdzic czyszczenie cookies po nieudanym odswiezeniu sesji i odpowiedzi 401.
- [ ] Nie przechowywac danych uzytkownika w stanie modulowym wspoldzielonym miedzy requestami SSR.
- [ ] Sprawdzic, czy tryb mock wymaga odpowiedniej roli tak samo jawnie jak odpowiadajacy mu przeplyw produkcyjny.

### Wydajnosc po ustabilizowaniu zachowania

- [ ] Nie wykonywac optymalizacji wydajnosciowej w tym samym kroku co zmiana architektury.
- [ ] Po migracji sprawdzic liczbe requestow podczas wejscia na strone i typowych akcji.
- [ ] Sprawdzic watchery wywolujace zduplikowane requesty lub kosztowne transformacje.
- [ ] Przeniesc filtrowanie i sortowanie list do stabilnych `computed`.
- [ ] Rozwazac wirtualizacje dopiero po potwierdzeniu problemu na duzej liscie.
- [ ] Lazy-load stosowac dla ciezkich i rzadko uzywanych widokow, nie domyslnie dla kazdego komponentu.

### Budzet i kontrola zakresu

- [ ] Jeden branch obejmuje jedna warstwe fundamentu albo jedna domene.
- [ ] Jeden commit ma jedna odpowiedzialnosc i moze zostac niezaleznie przejrzany.
- [ ] Nie dodawac nowych funkcji biznesowych do commitu refaktorujacego.
- [ ] Problem spoza zakresu zapisac w liscie odroczonej zamiast naprawiac przy okazji.
- [ ] Gdy zmiana przekracza pierwotny zakres brancha, zatrzymac prace i zaktualizowac plan.
- [ ] Preferowac migracje pionowe jednego przeplywu nad jednoczesna przebudowa wszystkich domen.

## Etap 0: baseline i zabezpieczenia

Cel: miec punkt odniesienia, dzieki ktoremu wiadomo, czy refaktor nie zmienil zachowania.

### Todo

- [ ] Potwierdzic czysty working tree przed pierwsza zmiana kodu.
- [x] Uruchomic i zapisac wynik `npm run test`.
- [x] Uruchomic i zapisac wynik `npm run lint`.
- [x] Nie uruchamiac buildu jako czesci standardowej petli testowej.
- [x] Spisac krytyczne scenariusze smoke testow.
- [ ] Potwierdzic tryb `mock` oraz `upstream` dla BFF.
- [x] Ustalic zasade nazw branchy: `refactor/<numer>-<obszar>`.
- [ ] Nie laczyc refaktoru z dokumentami `UI_REDESIGN_*`.

### Wynik baseline

Data: 2026-08-16.

- `npm run test`: pass, 12 plikow testowych, 70 testow.
- `npm run lint`: pierwsze uruchomienie wykrylo zastane roznice Prettiera w 6 plikach; po formatowaniu wskazanych plikow lint przechodzi.
- `npm run build`: nieuruchamiany zgodnie z ustalonym trybem pracy.
- Zakres naprawy baseline: tylko formatowanie, bez zmian zachowania.

### Krytyczne scenariusze smoke

- logowanie, odswiezenie sesji i wylogowanie;
- wejscie na trase chroniona dla kazdej roli;
- lista i szczegoly instruktora;
- lista, szczegoly, edycja i upload zdjecia pojazdu;
- lista zdarzen i edycja zdarzenia;
- rezerwacja, edycja i anulowanie lekcji;
- lista kursantow oraz szczegoly z platnosciami;
- harmonogram menedzera;
- zachowanie SSR po bezposrednim odswiezeniu chronionej strony.

### Kryterium zakonczenia

Baseline przechodzi lokalnie albo kazde zastane odstepstwo jest jawnie zapisane przed rozpoczeciem zmian.

## Etap 1: wspolny wykonawca adapterow BFF

Branch: `refactor/03-bff-adapters`.

Cel: usunac powtarzany wybor `mock/upstream` z handlerow Nitro, zachowujac rozne wymagania autoryzacyjne obu trybow.

### Docelowy podzial odpowiedzialnosci

| Warstwa                                    | Odpowiedzialnosc                                                  |
| ------------------------------------------ | ----------------------------------------------------------------- |
| `server/api/**`                            | odczyt parametrow, body i ustawienie odpowiedzi HTTP              |
| wspolny executor adaptera                  | wybor `mock/upstream` i przekazanie kontekstu                     |
| `server/utils/<domain>/*Bff.ts`            | operacje domenowe dla upstreamu lub mocka                         |
| `server/utils/upstream/upstreamRequest.ts` | transport HTTP, tokeny, cookies, parsowanie koperty i bledy sieci |
| `server/utils/validation/**`               | reuzywalna walidacja wejscia HTTP                                 |

### Todo fundamentu

- [x] Zinwentaryzowac handlery korzystajace z `resolveUpstreamBase`.
- [x] Podzielic handlery na: GET, mutacje, uploady, auth i przypadki specjalne.
- [x] Zaprojektowac typowany executor przyjmujacy callback `upstream` i `mock`.
- [x] Nie ukrywac walidacji requestu w executorze.
- [x] Pozostawic mozliwosc innej autoryzacji dla mocka i upstreamu.
- [x] Zachowac obecne statusy HTTP, komunikaty bledow i format kopert.
- [x] Dodac testy wyboru trybu jawnego i fallbacku.
- [x] Dodac test bledu `upstream` bez URL.
- [x] Dodac test, ze callback nieaktywnego adaptera nie jest wykonywany.

### Inwentarz `resolveUpstreamBase`

Data: 2026-08-16.

Polecenie: `rg -l "resolveUpstreamBase" server/api`.

Wynik: 70 handlerow Nitro w `server/api/**` wybiera adapter lokalnie.

| Metoda | Liczba |
| ------ | -----: |
| GET    |     32 |
| POST   |     16 |
| PATCH  |     15 |
| DELETE |      6 |
| PUT    |      2 |

#### GET

- `server/api/auth/me.get.ts`
- `server/api/course-types.get.ts`
- `server/api/courses.get.ts`
- `server/api/courses/[id].get.ts`
- `server/api/driving-schools.get.ts`
- `server/api/driving-schools/[id]/availability/slots.get.ts`
- `server/api/driving-schools/[id]/schedule.get.ts`
- `server/api/driving-schools/default.get.ts`
- `server/api/events/[eventId]/eligible-students.get.ts`
- `server/api/events/[eventId]/index.get.ts`
- `server/api/events/[eventId]/students.get.ts`
- `server/api/instructors.get.ts`
- `server/api/instructors/[id].get.ts`
- `server/api/instructors/[id]/availability/slots.get.ts`
- `server/api/instructors/[id]/availability/weekly.get.ts`
- `server/api/instructors/[id]/ratings.get.ts`
- `server/api/lessons/[id].get.ts`
- `server/api/lessons/[lessonId]/rating.get.ts`
- `server/api/manager/attention-items.get.ts`
- `server/api/me/courses.get.ts`
- `server/api/me/payments.get.ts`
- `server/api/ratings.get.ts`
- `server/api/ratings/me.get.ts`
- `server/api/schedule/index.get.ts`
- `server/api/schedule/me.get.ts`
- `server/api/students.get.ts`
- `server/api/students/[userId]/events.get.ts`
- `server/api/students/[userId]/index.get.ts`
- `server/api/students/[userId]/payments.get.ts`
- `server/api/students/[userId]/process-status.get.ts`
- `server/api/vehicles.get.ts`
- `server/api/vehicles/[id].get.ts`

#### POST

- `server/api/auth/login.post.ts`
- `server/api/auth/logout.post.ts`
- `server/api/auth/profile/avatar.post.ts`
- `server/api/auth/refresh.post.ts`
- `server/api/auth/register.post.ts`
- `server/api/courses.post.ts`
- `server/api/driving-schools.post.ts`
- `server/api/events/[eventId]/students.post.ts`
- `server/api/events/index.post.ts`
- `server/api/lessons.post.ts`
- `server/api/lessons/[lessonId]/rating.post.ts`
- `server/api/lessons/me.post.ts`
- `server/api/students/[userId]/courses.post.ts`
- `server/api/students/[userId]/payments.post.ts`
- `server/api/vehicles.post.ts`
- `server/api/vehicles/[id]/photo.post.ts`

#### PATCH

- `server/api/auth/profile/index.patch.ts`
- `server/api/courses/[id].patch.ts`
- `server/api/driving-schools/[id].patch.ts`
- `server/api/driving-schools/[id]/default-vehicle.patch.ts`
- `server/api/driving-schools/[id]/set-default.patch.ts`
- `server/api/events/[eventId]/index.patch.ts`
- `server/api/instructors/[id].patch.ts`
- `server/api/lessons/[id].patch.ts`
- `server/api/lessons/[lessonId]/cancel.patch.ts`
- `server/api/students/[userId]/index.patch.ts`
- `server/api/students/[userId]/payments/[paymentId].patch.ts`
- `server/api/students/[userId]/payments/[paymentId]/mark-paid.patch.ts`
- `server/api/students/[userId]/payments/[paymentId]/mark-unpaid.patch.ts`
- `server/api/vehicles/[id].patch.ts`
- `server/api/vehicles/[id]/status.patch.ts`

#### DELETE

- `server/api/driving-schools/[id].delete.ts`
- `server/api/events/[eventId]/index.delete.ts`
- `server/api/events/[eventId]/students/[studentUserId].delete.ts`
- `server/api/instructors/[id].delete.ts`
- `server/api/instructors/[id]/availability/weekly/[day].delete.ts`
- `server/api/vehicles/[id].delete.ts`

#### PUT

- `server/api/events/[eventId]/students.put.ts`
- `server/api/instructors/[id]/availability/weekly/[day].put.ts`

### Podzial migracyjny handlerow

Data: 2026-08-16.

Ten podzial ustala kolejnosc migracji. Kategorie sa rozlaczne w planie
wdrozenia, mimo ze technicznie np. upload jest tez mutacja `POST`.

#### 1. Proste GET bez body

Pierwsza fala po pilocie. Priorytet maja handlery bez uploadu, bez sesyjnych
cookies ustawianych recznie i bez zlozonych statusow odpowiedzi.

- `server/api/ratings/me.get.ts`
- `server/api/ratings.get.ts`
- `server/api/course-types.get.ts`
- `server/api/driving-schools.get.ts`
- `server/api/driving-schools/default.get.ts`
- `server/api/courses.get.ts`
- `server/api/courses/[id].get.ts`
- `server/api/vehicles.get.ts`
- `server/api/vehicles/[id].get.ts`
- `server/api/instructors.get.ts`
- `server/api/instructors/[id].get.ts`
- `server/api/instructors/[id]/ratings.get.ts`
- `server/api/manager/attention-items.get.ts`
- `server/api/me/courses.get.ts`
- `server/api/me/payments.get.ts`
- `server/api/schedule/index.get.ts`
- `server/api/schedule/me.get.ts`
- `server/api/students.get.ts`
- `server/api/students/[userId]/index.get.ts`
- `server/api/students/[userId]/process-status.get.ts`
- `server/api/students/[userId]/payments.get.ts`
- `server/api/students/[userId]/events.get.ts`

#### 2. Mutacje bez uploadu i bez auth

Druga fala. Handler zostaje odpowiedzialny za `params`, `query`, `body`,
walidacje i status odpowiedzi; executor ma tylko wybrac aktywny adapter.

- `server/api/courses.post.ts`
- `server/api/courses/[id].patch.ts`
- `server/api/driving-schools.post.ts`
- `server/api/driving-schools/[id].patch.ts`
- `server/api/driving-schools/[id].delete.ts`
- `server/api/driving-schools/[id]/default-vehicle.patch.ts`
- `server/api/driving-schools/[id]/set-default.patch.ts`
- `server/api/instructors/[id].patch.ts`
- `server/api/instructors/[id].delete.ts`
- `server/api/lessons.post.ts`
- `server/api/lessons/[id].patch.ts`
- `server/api/lessons/[lessonId]/cancel.patch.ts`
- `server/api/lessons/[lessonId]/rating.post.ts`
- `server/api/lessons/me.post.ts`
- `server/api/students/[userId]/courses.post.ts`
- `server/api/students/[userId]/index.patch.ts`
- `server/api/students/[userId]/payments.post.ts`
- `server/api/students/[userId]/payments/[paymentId].patch.ts`
- `server/api/students/[userId]/payments/[paymentId]/mark-paid.patch.ts`
- `server/api/students/[userId]/payments/[paymentId]/mark-unpaid.patch.ts`
- `server/api/vehicles.post.ts`
- `server/api/vehicles/[id].patch.ts`
- `server/api/vehicles/[id].delete.ts`
- `server/api/vehicles/[id]/status.patch.ts`

#### 3. Uploady `FormData`

Osobna fala, bo nie wolno popsuc przekazywania multipart body ani recznie
ustawiac `Content-Type`.

- `server/api/auth/profile/avatar.post.ts`
- `server/api/vehicles/[id]/photo.post.ts`

#### 4. Auth, profil i sesja

Ostatnia fala. Te handlery ustawiaja albo czyszcza cookies, zaleza od tokenow
i maja najwieksze ryzyko regresji logowania.

- `server/api/auth/login.post.ts`
- `server/api/auth/logout.post.ts`
- `server/api/auth/me.get.ts`
- `server/api/auth/profile/index.patch.ts`
- `server/api/auth/refresh.post.ts`
- `server/api/auth/register.post.ts`

#### 5. Przypadki specjalne domenowe

Migracja po prostych GET i zwyklych mutacjach, bo te endpointy lacza zakresy
dat, sloty, wiele identyfikatorow, zapis list albo rozbudowane mapowanie
odpowiedzi.

- `server/api/driving-schools/[id]/availability/slots.get.ts`
- `server/api/driving-schools/[id]/schedule.get.ts`
- `server/api/events/index.post.ts`
- `server/api/events/[eventId]/eligible-students.get.ts`
- `server/api/events/[eventId]/index.get.ts`
- `server/api/events/[eventId]/index.patch.ts`
- `server/api/events/[eventId]/index.delete.ts`
- `server/api/events/[eventId]/students.get.ts`
- `server/api/events/[eventId]/students.post.ts`
- `server/api/events/[eventId]/students.put.ts`
- `server/api/events/[eventId]/students/[studentUserId].delete.ts`
- `server/api/instructors/[id]/availability/slots.get.ts`
- `server/api/instructors/[id]/availability/weekly.get.ts`
- `server/api/instructors/[id]/availability/weekly/[day].put.ts`
- `server/api/instructors/[id]/availability/weekly/[day].delete.ts`
- `server/api/lessons/[id].get.ts`
- `server/api/lessons/[lessonId]/rating.get.ts`

### Kontrakt executora BFF

Plik: `server/utils/bff/bffAdapterExecutor.ts`.

Publiczne API:

- `executeBffAdapter<T>(event, { upstream, mock }): Promise<T>`
- `upstream(context)` dostaje `event`, `mode: 'upstream'` i `upstreamBase`.
- `mock(context)` dostaje `event` i `mode: 'mock'`.

Granice odpowiedzialnosci:

- executor wybiera aktywny adapter przez `resolveBffAdapter(event)`;
- executor wykonuje tylko callback aktywnego adaptera;
- executor nie czyta route params, query ani body;
- executor nie ustawia statusow HTTP;
- executor nie parsuje kopert odpowiedzi;
- executor nie wymusza wspolnej autoryzacji dla mocka i upstreamu.

#### Zasada walidacji wejscia

Walidacja pozostaje w handlerze albo w jawnie wywolanym helperze domenowym
przed `executeBffAdapter`.

Dozwolone w handlerze przed executorem:

- `getRouterParam`, `getQuery`, `readBody`, `readMultipartFormData`;
- walidacja UUID, dat, zakresow liczbowych i wymaganych pol;
- ustawienie `setResponseStatus`;
- zbudowanie payloadu przekazywanego do obu adapterow.

Niedozwolone w executorze:

- odczyt parametrow route;
- odczyt query;
- odczyt body;
- normalizacja DTO domenowych;
- mapowanie bledow walidacji requestu.

#### Zasada autoryzacji adapterow

Executor nie wykonuje `requireManagerFromCookie`,
`requireInstructorFromCookie`, `requireStudentFromCookie` ani innych kontroli
roli.

Powod:

- upstream przechodzi przez `upstreamRequest`, ktory wymaga tokenu dostepu,
  chyba ze wywolanie jawnie ustawi `auth: false`;
- mock musi zachowac dotychczasowe role per endpoint, np. `ratings/me` wymaga
  instruktora, a `driving-schools/default` wymaga managera;
- auth i refresh maja wlasna polityke cookies i nie moga odziedziczyc
  domyslnej autoryzacji mutacji domenowych.

Wzorzec migracji:

```ts
return executeBffAdapter(event, {
    upstream: ({ upstreamBase }) => bffUpstreamDomain(event, upstreamBase),
    mock: async () => {
        await requireExpectedRoleFromCookie(event);

        return bffMockDomain();
    },
});
```

#### Zasada kontraktu HTTP

Executor nie jest warstwa mapowania odpowiedzi. Migracja handlera na
`executeBffAdapter` musi zachowac:

- publiczny URL i metode HTTP;
- statusy ustawiane przez `setResponseStatus`;
- tresc `statusMessage` i `message` w `createError`;
- strukture koperty, np. `{ success: true, data }` albo `{ success: true }`;
- strategie cookies i czyszczenia sesji;
- kolejnosc walidacji wzgledem wyboru adaptera.

Jezeli handler ma inne statusy dla mocka i upstreamu, roznica zostaje w
callbackach adapterow albo w handlerze. Executor nie moze domyslnie
normalizowac statusow ani komunikatow.

### Migracja pilotazowa

- [x] Wybrac prosty endpoint GET, np. ratings albo vehicles.
- [x] Zapisac test zachowania przed migracja.
- [x] Przepisac endpoint na executor.
- [x] Porownac odpowiedz w `mock` i `upstream` z zachowaniem sprzed zmiany.
- [x] Dopiero po pilocie zaakceptowac publiczne API helpera.

Wybrany endpoint pilotazowy: `server/api/ratings/me.get.ts`.

Powod wyboru:

- prosty GET bez route params, query i body;
- upstream zwraca `bffUpstreamOwnLessonRatingsList(event, upstreamBase)`;
- mock wymaga `requireInstructorFromCookie(event)` i zwraca
  `bffMockOwnLessonRatingsList()`;
- endpoint dobrze sprawdza, czy executor zostawia osobna autoryzacje mocka.

Wynik porownania po migracji:

- tryb `upstream`: handler nadal zwraca wynik
  `bffUpstreamOwnLessonRatingsList(event, upstreamBase)` i nie wywoluje
  `requireInstructorFromCookie`;
- tryb `mock`: handler nadal wywoluje `requireInstructorFromCookie(event)`
  przed `bffMockOwnLessonRatingsList()`;
- potwierdzone testem `server/api/ratings/me.get.test.ts`;
- po migracji pelne `npm run test` przechodzi: 14 plikow testowych, 78 testow.

### Kolejnosc migracji domen

- [x] ratings i proste endpointy `me`;
- [x] vehicles bez uploadu;
- [x] courses;
- [x] instructors bez availability;
- [x] driving schools;
- [x] students i payments;
- [x] schedule;
- [x] lessons;
- [x] events;
- [x] availability i slots;
- [x] uploady `FormData`;
- [x] auth i profile jako ostatnie przypadki specjalne.

Pierwsza fala migracji domenowej przepieta na `executeBffAdapter`:

- `server/api/ratings/me.get.ts`;
- `server/api/ratings.get.ts`;
- `server/api/instructors/[id]/ratings.get.ts`;
- `server/api/manager/attention-items.get.ts`;
- `server/api/lessons/[lessonId]/rating.get.ts`;
- `server/api/lessons/[lessonId]/rating.post.ts`;
- `server/api/me/courses.get.ts`;
- `server/api/me/payments.get.ts`;
- `server/api/schedule/me.get.ts`.

Fala `vehicles` bez uploadu przepieta na `executeBffAdapter`:

- `server/api/vehicles.get.ts`;
- `server/api/vehicles.post.ts`;
- `server/api/vehicles/[id].get.ts`;
- `server/api/vehicles/[id].patch.ts`;
- `server/api/vehicles/[id].delete.ts`;
- `server/api/vehicles/[id]/status.patch.ts`.

Poza zakresem tej fali zostaje `server/api/vehicles/[id]/photo.post.ts`,
bo jest uploadem `FormData`.

Fala `courses` przepieta na `executeBffAdapter`:

- `server/api/course-types.get.ts`;
- `server/api/courses.get.ts`;
- `server/api/courses.post.ts`;
- `server/api/courses/[id].get.ts`;
- `server/api/courses/[id].patch.ts`.

Fala `instructors` bez availability przepieta na `executeBffAdapter`:

- `server/api/instructors.get.ts`;
- `server/api/instructors/[id].get.ts`;
- `server/api/instructors/[id].patch.ts`;
- `server/api/instructors/[id].delete.ts`.

Poza zakresem tej fali zostaja endpointy
`server/api/instructors/[id]/availability/**`.

Fala `driving schools` bez schedule i availability przepieta na
`executeBffAdapter`:

- `server/api/driving-schools.get.ts`;
- `server/api/driving-schools.post.ts`;
- `server/api/driving-schools/default.get.ts`;
- `server/api/driving-schools/[id].patch.ts`;
- `server/api/driving-schools/[id].delete.ts`;
- `server/api/driving-schools/[id]/default-vehicle.patch.ts`;
- `server/api/driving-schools/[id]/set-default.patch.ts`.

Poza zakresem tej fali zostaja:

- `server/api/driving-schools/[id]/schedule.get.ts`;
- `server/api/driving-schools/[id]/availability/slots.get.ts`.

Fala `students i payments` przepieta na `executeBffAdapter`:

- `server/api/students.get.ts`;
- `server/api/students/[userId]/index.get.ts`;
- `server/api/students/[userId]/index.patch.ts`;
- `server/api/students/[userId]/process-status.get.ts`;
- `server/api/students/[userId]/events.get.ts`;
- `server/api/students/[userId]/courses.post.ts`;
- `server/api/students/[userId]/payments.get.ts`;
- `server/api/students/[userId]/payments.post.ts`;
- `server/api/students/[userId]/payments/[paymentId].patch.ts`;
- `server/api/students/[userId]/payments/[paymentId]/mark-paid.patch.ts`;
- `server/api/students/[userId]/payments/[paymentId]/mark-unpaid.patch.ts`.

Fala `schedule` przepieta na `executeBffAdapter`:

- `server/api/schedule/index.get.ts`;
- `server/api/schedule/me.get.ts`;
- `server/api/driving-schools/[id]/schedule.get.ts`.

Fala `lessons` przepieta na `executeBffAdapter`:

- `server/api/lessons.post.ts`;
- `server/api/lessons/me.post.ts`;
- `server/api/lessons/[id].get.ts`;
- `server/api/lessons/[id].patch.ts`;
- `server/api/lessons/[lessonId]/cancel.patch.ts`;
- `server/api/lessons/[lessonId]/rating.get.ts`;
- `server/api/lessons/[lessonId]/rating.post.ts`.

Fala `events` przepieta na `executeBffAdapter`:

- `server/api/events/index.post.ts`;
- `server/api/events/[eventId]/index.get.ts`;
- `server/api/events/[eventId]/index.patch.ts`;
- `server/api/events/[eventId]/index.delete.ts`;
- `server/api/events/[eventId]/eligible-students.get.ts`;
- `server/api/events/[eventId]/students.get.ts`;
- `server/api/events/[eventId]/students.post.ts`;
- `server/api/events/[eventId]/students.put.ts`;
- `server/api/events/[eventId]/students/[studentUserId].delete.ts`.

Fala `availability i slots` przepieta na `executeBffAdapter`:

- `server/api/instructors/[id]/availability/weekly.get.ts`;
- `server/api/instructors/[id]/availability/slots.get.ts`;
- `server/api/instructors/[id]/availability/weekly/[day].put.ts`;
- `server/api/instructors/[id]/availability/weekly/[day].delete.ts`;
- `server/api/driving-schools/[id]/availability/slots.get.ts`.

Fala uploadow `FormData` przepieta na `executeBffAdapter`:

- `server/api/vehicles/[id]/photo.post.ts`;
- `server/api/auth/profile/avatar.post.ts`.

Domkniecie migracji BFF:

- `server/api/manager/attention-items.get.ts` zostal przepiety po audycie
  koncowym Etapu 1;
- stary eksport `resolveUpstreamBase` zostal usuniety po potwierdzeniu braku
  konsumentow w kodzie.

Zasada zachowana: `readMultipartFormData` zostaje w handlerze, a Blob dla
upstreamu powstaje dopiero w callbacku `upstream`.

Fala `auth i profile` przepieta na `executeBffAdapter`:

- `server/api/auth/login.post.ts`;
- `server/api/auth/logout.post.ts`;
- `server/api/auth/me.get.ts`;
- `server/api/auth/register.post.ts`;
- `server/api/auth/refresh.post.ts`;
- `server/api/auth/profile/index.patch.ts`;
- `server/api/auth/profile/avatar.post.ts`.

### Sugerowane commity

1. `refactor: add typed BFF adapter executor`
2. `refactor: migrate simple BFF read handlers`
3. `refactor: migrate BFF mutation handlers`
4. `refactor: migrate BFF special-case handlers`
5. `test: cover BFF adapter routing`
6. `docs: document BFF adapter execution`

### Kryterium zakonczenia

- [x] Handlery nie implementuja lokalnie wyboru adaptera poza udokumentowanymi wyjatkami.
- [x] Testy obejmuja oba tryby i przypadki bledne konfiguracji.
- [x] Nie zmienily sie publiczne URL-e, koperty, statusy ani polityka cookies.

### Wynik Etapu 1

Data: 2026-08-16.

- Wszystkie handlery Nitro z lokalnym wyborem `mock/upstream` zostaly przepiete
  na `executeBffAdapter`.
- Stary helper wyboru upstreamu zostal usuniety z kodu po audycie
  konsumentow.
- Dokumenty kontekstowe opisujace BFF zostaly zaktualizowane do nowego
  executora.
- Weryfikacja koncowa Etapu 1: `npm run test`, `npm run lint`,
  `npx prettier --check` dla zmienionych dokumentow oraz `git diff --check`.

## Etap 2: jedna warstwa transportu po stronie aplikacji

Cel: wszystkie domenowe wywolania BFF maja jeden przewidywalny mechanizm obslugi sesji, 401, bledow i kopert.

### Todo

- [x] Zinwentaryzowac `requestBffData`, `bffFetch`, `useApi`, `useBffApi` i `externalFetch`.
- [x] Spisac przypadki, w ktorych kazda funkcja jest potrzebna.
- [x] Usunac martwe lub dublujace API dopiero po migracji konsumentow.
- [x] Przeniesc wywolanie BFF z `ManagerStudentNotes.vue` do composable domenowego.
- [x] Zastapic `unknown` typami odpowiedzi tam, gdzie kontrakt jest znany.
- [x] Ujednolicic obsluge odpowiedzi `{ success: true }` bez `data`.
- [x] Ujednolicic upload `FormData` bez recznego `Content-Type`.
- [x] Potwierdzic pojedynczy retry po 401 i single-flight refresh.
- [x] Potwierdzic, ze refresh nie moze rekurencyjnie wywolac samego siebie.
- [x] Zachowac `useRequestFetch` w SSR dla wewnetrznych wywolan Nuxt.
- [x] Ograniczyc surowy `$fetch` do centralnego transportu i testow.
- [x] Zaktualizowac `docs/API_AND_BFF.md` po ustabilizowaniu API.

### Inwentarz transportu aplikacji

Data: 2026-08-16.

Polecenie bazowe:
`rg -n -e 'requestBffData' -e 'bffFetch' -e '\$bff' -e 'useApi' -e 'useBffApi' -e 'externalFetch' -e 'useRequestFetch' -e '\$fetch' app server --glob '*.ts' --glob '*.vue'`.

#### Warstwa centralna

| Symbol                 | Plik                                                                 | Rola                                                                                            |
| ---------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `createBffClient`      | `app/utils/api/bffClient.ts`                                         | niskopoziomowy klient BFF: credentials, koperty, retry po 401, single-flight refresh, FormData  |
| `$bff`                 | `app/plugins/bff-client.ts`                                          | providowany klient Nuxt; na SSR uzywa `useRequestFetch`, na kliencie `$fetch`                   |
| `useBffClient`         | `app/composables/core/useBffClient.ts`                               | dostep do `$bff` dla kodu wymagajacego niskiego poziomu lub kontroli retry                      |
| `requestBffData`       | `app/composables/core/useApi.ts`                                     | standard dla endpointow z koperta `{ success: true, data }`; unwrap, fallbackMessage, normalize |
| `bffFetch`             | `app/composables/core/useApi.ts`                                     | standard dla pelnej koperty, szczegolnie `{ success: true }` bez `data`                         |
| `externalFetch`        | `app/composables/core/useApi.ts`                                     | jawne zewnetrzne URL-e HTTP; brak konsumentow; usuniety po audycie                              |
| `useBffApi` / `useApi` | `app/composables/core/useApi.ts`                                     | kompatybilny reaktywny wrapper; brak konsumentow; usuniety po audycie                           |
| `resolveBffEndpoint`   | `app/utils/api/bffEndpoint.ts`                                       | kompatybilny helper endpointu uzywany przez plugin `$bff`                                       |
| surowy `$fetch`        | `app/composables/core/useApi.ts`, `app/plugins/bff-client.ts`, testy | dopuszczony w centralnym transporcie i testach                                                  |

#### Konsumenci domenowi

| Mechanizm                 | Obserwacja                                                                                                                 | Decyzja na dalszy etap                                                                 |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `requestBffData`          | dominujacy mechanizm w composables domenowych: kursy, pojazdy, kursanci, szkoly, lekcje, eventy, platnosci, konto, manager | zostaje standardem dla odpowiedzi z `data`; kolejne migracje maja ograniczac `unknown` |
| `bffFetch`                | uzywany punktowo dla `DELETE`/kopert bez `data` w eventach i szczegolach instruktora                                       | zostaje, ale walidacja `{ success: true }` powinna miec jeden helper                   |
| `$bff`                    | uzywany bezposrednio w `useAuthSession`, bo sesja kontroluje reczny refresh, skip retry i aktualizacje `useState`          | zostaje w Etapie 3; nie migrowac na `requestBffData` bez osobnej zmiany sesji          |
| `useApi`                  | eksport kompatybilnosciowy bez aktywnych konsumentow domenowych                                                            | usuniety po potwierdzeniu braku uzyc                                                   |
| `useBffApi`               | eksport reaktywny bez aktywnych konsumentow domenowych poza wrapperami                                                     | usuniety po potwierdzeniu braku uzyc                                                   |
| `externalFetch`           | brak aktywnych konsumentow domenowych                                                                                      | usuniety po potwierdzeniu braku uzyc                                                   |
| `useRequestFetch`         | wystepuje w pluginie `$bff`, co zachowuje cookies i kontekst SSR dla wewnetrznych wywolan BFF                              | zachowac                                                                               |
| `ManagerStudentNotes.vue` | komponent sam wywoluje `requestBffData` i normalizuje odpowiedz PATCH                                                      | pierwszy kandydat do przeniesienia requestu do `useStudentsApi`                        |

### Kontrakt uzycia transportu

Data: 2026-08-16.

| API                     | Kiedy uzywac                                                                                      | Kiedy nie uzywac                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `requestBffData<T>`     | domyslnie w composables domenowych dla endpointow BFF zwracajacych `{ success: true, data }`      | dla odpowiedzi bez `data`, recznej kontroli refreshu albo zewnetrznych URL-i         |
| `bffFetch<T>`           | dla pelnej koperty BFF, szczegolnie `{ success: true }` bez `data` i nietypowych statusow         | jako zwyklego zamiennika `requestBffData` przy endpointach z `data`                  |
| `$bff` / `useBffClient` | tylko gdy kod potrzebuje niskopoziomowej kontroli klienta, np. sesja i reczny `retryUnauthorized` | w komponentach UI i zwyklych composables domenowych                                  |
| `useBffApi`             | brak aktywnych uzyc przed czyszczeniem                                                            | usuniety, bo dublowal obecny styl domenowych `async function`                        |
| `useApi` / `useApiLazy` | brak aktywnych uzyc przed czyszczeniem                                                            | usuniete jako stary kompatybilny wrapper                                             |
| `externalFetch`         | brak aktywnych uzyc przed czyszczeniem                                                            | usuniety; nowe zewnetrzne integracje wymagaja osobnego, jawnego helpera              |
| surowy `$fetch`         | centralny transport, plugin `$bff`, testy                                                         | kod domenowy, komponenty, strony                                                     |
| `useRequestFetch`       | plugin `$bff` po stronie SSR, zeby zachowac cookies i kontekst requestu                           | bezposrednio w domenach aplikacji, dopoki nie ma udokumentowanego wyjatku            |
| `resolveBffEndpoint`    | infrastruktura pluginu `$bff` i kompatybilnosc                                                    | kod domenowy; endpoint ma przechodzic przez `requestBffData`, `bffFetch` albo `$bff` |

Wniosek migracyjny:

- Standard domenowy: `requestBffData` + typowany `normalize`.
- Wyjatek domenowy: `bffFetch` tylko dla success-only albo pelnej koperty.
- Wyjatek infrastrukturalny: `$bff` w sesji do czasu Etapu 3.
- Usuniete duplikaty bez konsumentow: `useApi`, `useApiLazy`, `useBffApi`,
  `useExternalApi`, `externalFetch`.
- Pierwsza migracja kodu: przeniesienie PATCH notatki kursanta z komponentu
  do `useStudentsApi`.

### Wynik success-only

Data: 2026-08-16.

- Dodano `requestBffSuccess(method, path, { fallbackMessage, ...options })` dla
  endpointow BFF zwracajacych `{ success: true }` bez pola `data`.
- `requestBffSuccess` uzywa wspolnego klienta BFF, waliduje pelna koperte przez
  `assertBooleanSuccessEnvelope` i mapuje bledy tak samo jak `requestBffData`.
- Przepieto success-only DELETE w eventach, usuwaniu instruktora oraz usuwaniu
  dnia dostepnosci instruktora.

### Wynik FormData

Data: 2026-08-16.

- Potwierdzono dwa produkcyjne uploady `FormData`: zdjecie pojazdu i avatar
  profilu.
- Oba uploady przechodza przez `requestBffData` i nie ustawiaja recznie
  `Content-Type`.
- Testy centralnego transportu potwierdzaja, ze `FormData` nie dostaje
  `Content-Type: application/json`, dzieki czemu przegladarka moze dopisac
  multipart boundary.

### Wynik retry 401

Data: 2026-08-16.

- `createBffClient` ma test, ze po 401 wykonuje jeden refresh i ponawia
  oryginalny request.
- `createBffClient` ma test, ze rownolegle odpowiedzi 401 wspoldziela jeden
  request refreshu (`single-flight`).
- Weryfikacja punktu: `npx vitest run app/utils/api/bffClient.test.ts`.

### Wynik braku rekurencji refreshu

Data: 2026-08-16.

- `createBffClient` ma test, ze request do sciezki refreshu z 401 nie wykonuje
  kolejnego refreshu.
- Warunek zabezpieczajacy jest w centralnym transporcie: `path === refreshPath`
  blokuje probe ponowienia przez refresh.
- Weryfikacja punktu: `npx vitest run app/utils/api/bffClient.test.ts`.

### Wynik SSR BFF

Data: 2026-08-16.

- Plugin `$bff` nadal wybiera `useRequestFetch()` po stronie serwera i `$fetch`
  po stronie klienta.
- Audyt `rg -n "useRequestFetch|\$fetch|resolveBffEndpoint|createBffClient" app`
  potwierdzil, ze `useRequestFetch` nie jest rozproszone po domenach aplikacji.
- Wewnetrzne wywolania BFF zachowuja kontekst SSR i cookies przez centralny
  plugin.

### Wynik surowego `$fetch`

Data: 2026-08-16.

- Audyt `rg -n "useRequestFetch|\$fetch|resolveBffEndpoint|createBffClient" app`
  potwierdzil, ze surowy `$fetch` w `app` wystepuje tylko w centralnym
  transporcie, pluginie `$bff` i testach.
- Domenowe composables, komponenty i strony maja uzywac `requestBffData`,
  `requestBffSuccess`, `bffFetch` albo jawnego `$bff` tylko w uzasadnionym
  wyjatku infrastrukturalnym.

### Wynik ograniczenia `unknown`

Data: 2026-08-16.

- Mutacje void/success-only dla OSK i pojazdow zostaly przepiete z
  `requestBffData<unknown>` na `requestBffSuccess`.
- Pozostale `requestBffData<unknown>` w composables sa na granicach, gdzie kod
  celowo traktuje payload jako nieufny i przepuszcza go przez lokalny
  normalizator albo ignoruje payload rejestracji.
- Nie zamieniano `unknown` na pozornie mocniejsze typy tam, gdzie nie ma jeszcze
  runtime walidacji lub wygenerowany kontrakt nie jest lokalnie uzywany.

### Wynik czyszczenia API transportu

Data: 2026-08-16.

- Usunieto nieuzywane eksporty `useApi`, `useApiLazy`, `useBffApi`,
  `useExternalApi` i `externalFetch` z `app/composables/core/useApi.ts`.
- Zostawiono aktywne API transportu: `requestBffData`, `requestBffSuccess`,
  `bffFetch` oraz niskopoziomowy `$bff` przez `useBffClient`.
- Dokumentacja `docs/API_AND_BFF.md`, `docs/COMPOSABLES.md` i komentarz
  `resolveBffEndpoint` zostaly zaktualizowane, aby nie wskazywaly usunietych
  wrapperow.

### Wynik Etapu 2

Data: 2026-08-16.

- Domenowe wywolania BFF korzystaja z jednego zestawu helperow:
  `requestBffData`, `requestBffSuccess`, `bffFetch` oraz `$bff` tylko dla
  niskopoziomowych wyjatkow.
- Request z `ManagerStudentNotes.vue` zostal przeniesiony do `useStudentsApi`.
- Success-only, FormData, retry 401, single-flight refresh, SSR request fetch i
  granice surowego `$fetch` zostaly potwierdzone testami lub audytem `rg`.
- Martwe wrappery transportu zostaly usuniete po potwierdzeniu braku
  konsumentow.
- Weryfikacja koncowa Etapu 2: `npm run test` i `npm run lint`.

### Kryterium zakonczenia

Kod domenowy nie wybiera sam transportu ani nie implementuje ponownie retry, unwrapowania koperty lub mapowania bledow.

## Etap 3: sesja, role i middleware

Cel: zmniejszyc zasieg zmian w `useAuthSession.ts` i usunac rozbieznosci kontroli rol.

### Proponowane granice

- stan sesji i wartosci pochodne;
- operacje login/register/logout;
- sprawdzanie i odswiezanie sesji;
- normalizacja roli i wspolne reguly dostepu;
- przekierowania po utracie sesji;
- dane demonstracyjne logowania.

### Todo

- [x] Zapisac testy obecnego login/refresh/logout przed podzialem.
- [x] Wyodrebnic czyste funkcje normalizacji roli.
- [x] Wprowadzic jedno typowane zrodlo regul dostepu.
- [x] Ujednolicic `manager`, `instructor`, `student` i warianty laczone.
- [x] Zachowac `ADMIN` jako jawnie udokumentowany wariant uprawnien menedzera.
- [x] Oddzielic dane demo od produkcyjnego przeplywu sesji.
- [x] Rozdzielic transport sesji od reaktywnego stanu sesji.
- [x] Zachowac stan przez `useState`, aby nie wyciekal pomiedzy requestami SSR.
- [x] Dodac test macierzy rola -> dozwolona trasa.
- [x] Dodac test powrotu na pierwotna trase po logowaniu.
- [x] Dodac test zachowania przy 401, 403 i niedostepnym backendzie.

### Kryterium zakonczenia

Kazda regula dostepu ma jedno zrodlo prawdy, a publiczne API `useAuthSession` pozostaje male i opisane.

### Wynik testow sesji przed podzialem

Data: 2026-08-16.

- Dodano testy `useAuthSession` dla logowania, refreshu access tokenu,
  nieudanego refreshu i logoutu.
- Test logowania chroni obecne zachowanie: po `POST /api/auth/login` composable
  probuje uzupelnic sesje przez `GET /api/auth/me` i zapisuje wynik w
  `useState`.
- Test logoutu chroni czyszczenie stanu sesji po wywolaniu BFF logout.

### Wynik normalizacji roli

Data: 2026-08-16.

- Dodano czysty helper `normalizeAuthRole(raw): AuthRole | null`.
- Helper normalizuje whitespace i wielkosc liter oraz odrzuca role spoza
  jawnego zbioru `ADMIN`, `MANAGER`, `INSTRUCTOR`, `STUDENT`, `DEMO`.
- Dodano testy normalizacji i sprawdzenia konkretnej roli.

### Wynik zrodla regul dostepu

Data: 2026-08-16.

- Rozszerzono `authRole.ts` o typowane grupy dostepu:
  `MANAGER_ACCESS_ROLES`, `MANAGER_OR_INSTRUCTOR_ACCESS_ROLES` oraz
  `STUDENT_OR_INSTRUCTOR_ACCESS_ROLES`.
- Dodano `canAccessRole`, `hasManagerAccess`,
  `hasManagerOrInstructorAccess` i `hasStudentOrInstructorAccess`.
- Testy potwierdzaja, ze `ADMIN` ma uprawnienia menedzera.

### Wynik middleware rol

Data: 2026-08-16.

- Middleware `manager`, `instructor`, `student`, `manager-or-instructor` i
  `student-or-instructor` korzystaja z jednego helpera rol.
- `manager.ts` nie sprawdza juz surowej roli bez normalizacji.

### Wynik roli `ADMIN`

Data: 2026-08-16.

- `ADMIN` jest jawnie czescia `MANAGER_ACCESS_ROLES`.
- `ADMIN` jest rowniez jawnie czescia `MANAGER_OR_INSTRUCTOR_ACCESS_ROLES`.
- Test `authRole.test.ts` potwierdza, ze `ADMIN` ma dostep menedzerski.

### Wynik sesji demo

Data: 2026-08-16.

- Tworzenie sesji demo zostalo przeniesione do czystego helpera
  `createDemoAuthSession`.
- `useAuthSession.loginDemo` zachowuje publiczne API, ale nie trzyma juz danych
  demo inline w produkcyjnym composable.
- Dodano testy dla poprawnej sesji demo i pustej nazwy.

### Wynik transportu sesji

Data: 2026-08-16.

- Wywolania BFF `/api/auth/login`, `/api/auth/me`, `/api/auth/refresh`,
  `/api/auth/profile` i `/api/auth/logout` zostaly przeniesione do
  `authSessionApi.ts`.
- `useAuthSession` pozostaje wlascicielem `useState`, computed oraz decyzji
  kiedy czyscic lub uzupelniac sesje.
- Dodano testy kontraktu transportu auth oraz zachowano testy publicznych flow
  `useAuthSession`.

### Wynik stanu sesji

Data: 2026-08-16.

- `useAuthSession` nadal trzyma dane profilu w `useState('auth_session')`.
- Dodano test, ze wiele wywolan `useAuthSession()` wspoldzieli ten sam stan
  sesji zamiast tworzyc lokalny `ref`.

### Wynik macierzy rol

Data: 2026-08-16.

- Dodano test macierzy roli dla wariantow tras: `manager`, `instructor`,
  `student`, `manager-or-instructor` oraz `student-or-instructor`.
- Macierz dokumentuje, ze `DEMO` nie ma dostepu do chronionych tras rol.

### Wynik powrotu po logowaniu

Data: 2026-08-16.

- Dodano test kontraktu `useAuthReturnTo`: bezpieczna sciezka powrotu zapisuje
  sie w cookie, jest konsumowana jednokrotnie po logowaniu i potem znika.
- Dodano test odrzucania zewnetrznych oraz protokolowo wzglednych redirectow,
  lacznie z czyszczeniem potencjalnie zmodyfikowanej wartosci cookie.

### Wynik bledow auth

Data: 2026-08-16.

- Dodano test mapowania `401` przy logowaniu na komunikat o nieprawidlowych
  danych logowania.
- Dodano test `403` przy sprawdzaniu sesji: sesja jest czyszczona, a refresh
  nie jest wykonywany.
- Dodano test bledu sieciowego bez statusu HTTP jako niedostepnego backendu.

### Wynik Etapu 3

Data: 2026-08-16.

- Reguly rol zostaly przeniesione do jednego typowanego helpera
  `authRole.ts`, a middleware korzystaja z niego zamiast sprawdzac role inline.
- Transport sesji zostal oddzielony od reaktywnego stanu sesji przez
  `authSessionApi.ts`.
- Dane sesji demo zostaly wyjete z produkcyjnego przeplywu sesji.
- Testy chronia login, refresh, logout, wspoldzielony stan sesji, macierz rol,
  return path po logowaniu oraz bledy `401`, `403` i brak backendu.
- Weryfikacja koncowa Etapu 3: `npm run test` i `npm run lint`.

## Etap 4: podzial duzych composables

Cel: rozdzielic orkiestracje stron, formularze, dane referencyjne i akcje zapisu bez mnozenia przypadkowych helperow.

### Kolejnosc wedlug ryzyka i rozmiaru

| Priorytet | Plik                                  | Kierunek podzialu                                           |
| --------- | ------------------------------------- | ----------------------------------------------------------- |
| P0        | `useManagerEventEditForm.ts`          | stan formularza, walidacja, mapowanie payloadu, dirty state |
| P0        | `useAuthSession.ts`                   | zgodnie z etapem 3                                          |
| P0        | `useManagerStudentDetailsPage.ts`     | loading danych, edycja profilu, kursy, platnosci            |
| P0        | `useEventsDayPage.ts`                 | query dnia, pobieranie, filtrowanie, akcje zdarzen          |
| P1        | `useManagerSchoolScheduleCalendar.ts` | zakres dat, transformacja osi, selection, loading           |
| P1        | `useManagerInstructorDetailsPage.ts`  | dane profilu, akcje, usuwanie, zdarzenia                    |
| P1        | `useManagerInstructorSchedulePage.ts` | kontekst instruktora, tydzien, dane harmonogramu            |
| P1        | `useManagerEventEditActions.ts`       | zapis, usuwanie, komunikaty, nawigacja                      |
| P2        | `useManagerStudentsPage.ts`           | query/filter, pobieranie, paginacja, akcje                  |
| P2        | `useAccountPage.ts`                   | formularze profilu, avatar, walidacja                       |
| P2        | `useManagerCourseDetailPage.ts`       | dane kursu, powiazania, mutacje                             |
| P2        | `useMyLessonsPage.ts`                 | pobieranie, filtry, ratings, anulowanie                     |

### Checklist dla kazdego composable

- [ ] Nazwac wszystkie odpowiedzialnosci obecnego pliku.
- [ ] Zapisac jego publiczne API i liste konsumentow.
- [ ] Dodac test najwazniejszego zachowania przed podzialem.
- [ ] Wyciagnac czyste mapowania do `utils/<domain>`.
- [ ] Wyciagnac niezalezny stan lub efekt do malego composable domenowego.
- [ ] Nie duplikowac stanu pomiedzy nowymi composables.
- [ ] Zwracac readonly state, gdy mutacja ma isc przez jawne akcje.
- [ ] Uzyc obiektu opcji przy wielu opcjonalnych argumentach.
- [ ] Zachowac dotychczasowy kontrakt wrappera na czas migracji.
- [ ] Przepiac konsumentow.
- [ ] Usunac wrapper dopiero po braku odwolujacych sie konsumentow.
- [ ] Uruchomic test domeny i lint.

### Pilot Etapu 4: `useManagerEventEditForm.ts`

Zakres pilota: pierwszy P0 composable z tabeli, bez zmiany publicznego API
kontenera `ManagerEventEditContainer.vue`.

#### Todo pilota

- [x] Nazwac wszystkie odpowiedzialnosci obecnego pliku.
- [x] Zapisac jego publiczne API i liste konsumentow.
- [x] Dodac test najwazniejszego zachowania przed podzialem.
- [x] Wyciagnac czyste mapowania do `utils/<domain>`.
- [x] Wyciagnac niezalezny stan lub efekt do malego composable domenowego.
- [x] Nie duplikowac stanu pomiedzy nowymi composables.
- [x] Zwracac readonly state, gdy mutacja ma isc przez jawne akcje.
- [x] Uzyc obiektu opcji przy wielu opcjonalnych argumentach.
- [x] Zachowac dotychczasowy kontrakt wrappera na czas migracji.
- [x] Przepiac konsumentow.
- [x] Usunac wrapper dopiero po braku odwolujacych sie konsumentow.
- [x] Uruchomic test domeny i lint.

#### Odpowiedzialnosci obecnego pliku

| Obszar                        | Obecna odpowiedzialnosc                                                              | Uwagi do podzialu                                                                        |
| ----------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| Stan formularza               | Trzyma refy typu wydarzenia, startu, konca, instruktora, pojazdu, pojemnosci i bledu | Powinien zostac cienkim wrapperem publicznego kontraktu albo malym composable formularza |
| Pola daty i czasu             | Synchronizuje `datetime-local` z rozbitymi polami daty, godziny i minuty             | Kandydat na osobny helper/composable wyboru czasu                                        |
| Ograniczenia okien czasowych  | Wylicza dozwolone godziny/minuty i zakres kalendarza na podstawie `freeWindows`      | Logika zalezy od `eventEditFreeWindowsPicker`, ale orkiestracja jest nadal w formularzu  |
| Korekta niepoprawnego konca   | Watcher pilnuje, aby koniec byl po starcie i sugeruje domyslny koniec                | Stanowy efekt do wydzielenia razem z polami czasu                                        |
| Prefill z wydarzenia          | Mapuje `InstructorEvent` do pol formularza i czysci blad                             | Czyste mapowanie powinno isc do utility albo malego mappera domenowego                   |
| Parsowanie pojemnosci         | Normalizuje `capacity` z inputu do liczby, `null` albo `false` dla bledu             | Czysta funkcja do `utils/events`                                                         |
| Snapshot i dirty state        | Porownuje baseline wydarzenia z aktualnym stanem formularza                          | Czyste snapshoty sa dobrym pierwszym testem regresyjnym                                  |
| Walidacja slotu po zmianach   | Informuje akcje zapisu, czy start, koniec albo instruktor wymagaja walidacji slotu   | Moze zostac przy snapshotach, bo korzysta z tej samej granicy danych                     |
| Handlery eventow input/select | Czytaja `Event.target`, aktualizuja refy i commituja lokalny datetime                | To warstwa adaptera UI; nie powinna mieszac sie z czystymi mapperami                     |

#### Publiczne API i konsumenci

Wejscie `useManagerEventEditForm`:

- `loadedEvent: Ref<InstructorEvent | null>` - zrodlo baseline i prefillu.
- `freeWindows: Ref<FreeWindow[]>` - zrodlo ograniczen wyboru daty i czasu.
- `freeWindowsUnavailable: Ref<boolean>` - przelacznik wylaczajacy ograniczenia
  pickera, gdy sloty nie sa dostepne.

Zwracane API:

| Grupa                   | Pola/funkcje                                                                                                                                                                                                            | Konsumenci                                                                                                          |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Stan formularza         | `formType`, `formStartLocal`, `formEndLocal`, `formStartDate`, `formStartHour`, `formStartMinute`, `formEndDate`, `formEndHour`, `formEndMinute`, `formVehicleId`, `formInstructorId`, `formCapacityInput`, `formError` | `ManagerEventEditContainer.vue`, a przez niego `useManagerEventParticipants` i `useManagerEventEditActions`         |
| Opcje czasu             | `fullHourOptions`, `fullMinuteOptions`, `startHourOptionsResolved`, `startMinuteOptionsResolved`, `endHourOptionsResolved`, `endMinuteOptionsResolved`, `pickerMinDate`, `pickerMaxDate`                                | Template `ManagerEventEditContainer.vue`                                                                            |
| Snapshoty i dirty state | `currentSnapshot`, `baselineSnapshot`, `isFormFieldsDirty`, `needsTimeOrInstructorSlotValidation`                                                                                                                       | `useManagerEventEditActions` przez kontener                                                                         |
| Data formularza         | `currentFormDate`                                                                                                                                                                                                       | `useManagerEventSlots` przez kontener                                                                               |
| Helpery domenowe        | `applyPrefill`, `parseCapacity`, `localDatetimeToIso`                                                                                                                                                                   | `useManagerEventEditData`, `useManagerEventParticipants`, `useManagerEventEditActions`, template wyboru uczestnikow |
| Handlery input/select   | `handleStartDateChange`, `handleStartHourChange`, `handleStartMinuteChange`, `handleEndDateChange`, `handleEndHourChange`, `handleEndMinuteChange`                                                                      | Template `ManagerEventEditContainer.vue`                                                                            |
| Flaga ograniczen czasu  | `pickerConstraintsActive`                                                                                                                                                                                               | Obecnie tylko kontrakt zwracany; brak bezposredniego uzycia znalezionego przez `rg`                                 |

Bezposredni konsument znaleziony przez `rg`: `app/components/manager/events/ManagerEventEditContainer.vue`.
Pozostale composables korzystaja z danych formularza posrednio przez ten kontener.

#### Test regresyjny przed podzialem

- Dodano test `useManagerEventEditForm`, ktory blokuje kontrakt snapshotow:
  `applyPrefill(event)` ustawia formularz jako niedirty wzgledem
  `baselineSnapshot`, a zmiana instruktora wlacza dirty state i wymaga ponownej
  walidacji slotu.
- Test nie sprawdza konkretnej lokalnej godziny, dzieki czemu nie zalezy od
  strefy czasowej srodowiska testowego.

#### Wynik wydzielenia czystych mapowan

- Dodano `app/utils/events/managerEventEditForm.ts` dla czystych helperow:
  parsowania capacity, budowania snapshotow, dirty state i decyzji o walidacji
  slotu.
- `useManagerEventEditForm` zachowuje dotychczasowe publiczne API, ale deleguje
  czyste mapowania do utility domenowego.
- Dodano testy utility dla capacity, zgodnosci baseline/current oraz zmiany
  instruktora wymagajacej walidacji slotu.

#### Wynik wydzielenia pickera czasu

- Dodano `useManagerEventEditTimePicker` dla stanu rozbitych pol czasu,
  ograniczen `freeWindows`, opcji godzin/minut, handlerow input/select oraz
  efektu korygujacego koniec wydarzenia.
- `useManagerEventEditForm` zachowuje publiczne pola czasu, ale deleguje ich
  stan i efekty do nowego composable.
- Dodano testy hydratacji rozbitych pol czasu oraz automatycznego przesuniecia
  konca, gdy nie jest pozniej niz start.

#### Wynik kontroli granic stanu

- `useManagerEventEditForm` nie kopiuje stanu czasu; przekazuje te same refy
  `formStartLocal` i `formEndLocal` do `useManagerEventEditTimePicker`.
- Publiczne pola formularza pozostaja mutowalnymi refami, bo obecny kontrakt
  kontenera i `v-model` zakladaja bezposrednia edycje stanu formularza. Nowe
  pola pochodne pozostaja `computed`, a mutacje czasu przechodza przez jawne
  handlery.
- `useManagerEventEditForm` i `useManagerEventEditTimePicker` przyjmuja jeden
  obiekt wejscia zamiast listy opcjonalnych argumentow.
- Wrapper `useManagerEventEditForm` zachowuje dotychczasowe nazwy zwracanych pol
  i funkcji, dzieki czemu `ManagerEventEditContainer.vue` nie wymagal migracji w
  tym kroku.

#### Wynik zamkniecia pilota

- Bezposredni konsument `ManagerEventEditContainer.vue` pozostaje podpiety do
  `useManagerEventEditForm`, bo wrapper jest docelowa fasada dla formularza
  edycji eventu.
- `useManagerEventEditTimePicker` jest szczegolem wewnetrznym wrappera, wiec nie
  przepinano kontenera na nizszy poziom abstrakcji.
- Wrapper nie zostal usuniety, bo nadal jest publicznym kontraktem dla
  kontenera i uklada razem stan formularza, helpery snapshotow oraz picker
  czasu.
- Weryfikacja pilota: `npx vitest run app/composables/events/useManagerEventEditForm.test.ts app/composables/events/useManagerEventEditTimePicker.test.ts app/utils/events/managerEventEditForm.test.ts`
  oraz `npm run lint`.

### Pilot Etapu 4: `useAuthSession.ts`

Zakres pilota: domkniecie podzialu rozpoczetego w Etapie 3 bez zmiany
publicznego API `useAuthSession`.

#### Todo pilota

- [x] Nazwac wszystkie odpowiedzialnosci obecnego pliku.
- [x] Zapisac jego publiczne API i liste konsumentow.
- [x] Dodac test najwazniejszego zachowania przed podzialem.
- [x] Wyciagnac czyste mapowania do `utils/<domain>`.
- [x] Wyciagnac niezalezny stan lub efekt do malego composable domenowego.
- [x] Nie duplikowac stanu pomiedzy nowymi composables.
- [x] Zwracac readonly state, gdy mutacja ma isc przez jawne akcje.
- [x] Uzyc obiektu opcji przy wielu opcjonalnych argumentach.
- [x] Zachowac dotychczasowy kontrakt wrappera na czas migracji.
- [x] Przepiac konsumentow.
- [x] Usunac wrapper dopiero po braku odwolujacych sie konsumentow.
- [x] Uruchomic test domeny i lint.

#### Odpowiedzialnosci obecnego pliku

| Obszar                 | Obecna odpowiedzialnosc                                                                        | Uwagi do podzialu                                                                       |
| ---------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Publiczny stan sesji   | Trzyma `session`, `isAuthenticated` i `isCheckingSession` przez Nuxt `useState`/`computed`     | To powinno zostac w wrapperze, bo jest granica reaktywnego stanu aplikacji              |
| Operacje sesji         | Udostepnia `login`, `logout`, `checkSession`, `refreshAccessToken`, `refreshProfileFromServer` | Orkiestracja moze zostac w wrapperze, ale transport jest juz w `authSessionApi.ts`      |
| Demo login             | Udostepnia `loginDemo`                                                                         | Dane demo sa juz w `demoAuthSession.ts`; wrapper tylko zapisuje wynik do sesji          |
| Normalizacja usera     | Mapuje `BackendUserResponse` na payload sesji i `AuthSession`                                  | Czyste mapowanie powinno trafic do utility z testami                                    |
| Driving schools        | Filtruje i normalizuje liste OSK z backendu                                                    | Czysta funkcja pomocnicza do mappera sesji                                              |
| Payload profilu        | Buduje body PATCH profilu z opcjonalnych pol                                                   | Czysta funkcja do wydzielenia i testow invalid/empty/null                               |
| Mapowanie bledow HTTP  | Czyta `statusCode`, message/statusMessage i mapuje bledy login/profile/session                 | Kandydat na utility, ale dopiero po ustabilizowaniu mapperow, zeby nie mieszac zakresow |
| Polityka refreshu      | Decyduje, kiedy pominac refresh (`403`, `404`) oraz kiedy wyczyscic sesje                      | Zostaje przy orkiestracji sesji, chyba ze powtorzy sie poza wrapperem                   |
| Reaktywna izolacja SSR | Korzysta z `useState('auth_session')`, a nie ze stanu modulowego                               | Nie wydzielac do zwyklego utility; to Nuxt composable boundary                          |

#### Publiczne API i konsumenci

Zwracane API:

| Pole/funkcja               | Odpowiedzialnosc publiczna                                                       | Glowne grupy konsumentow                                                       |
| -------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `session`                  | Reaktywny profil zalogowanego uzytkownika bez tokenow                            | strony, middleware rol, sidebar/header, composables domenowe                   |
| `isAuthenticated`          | Flaga obecnosci sesji z `userId`                                                 | `AppHeader.vue`, `login.vue`                                                   |
| `isCheckingSession`        | Flaga trwajacego sprawdzania sesji                                               | Obecnie publiczny kontrakt, brak bezposredniego uzycia znalezionego przez `rg` |
| `login`                    | Logowanie przez BFF i ustawienie sesji                                           | `pages/login.vue`                                                              |
| `loginDemo`                | Lokalna sesja demonstracyjna                                                     | testy oraz potencjalne flow demo                                               |
| `logout`                   | Logout przez BFF i czyszczenie sesji                                             | `useLogout.ts`                                                                 |
| `refreshAccessToken`       | Jawny refresh access tokenu przez BFF                                            | testy i wewnetrzne flow sesji                                                  |
| `refreshProfileFromServer` | Pobranie aktualnego profilu z retry refreshu                                     | `useAccountPage.ts`                                                            |
| `patchProfile`             | PATCH profilu i aktualizacja sesji                                               | `useAccountPage.ts`                                                            |
| `checkSession`             | Sprawdzenie sesji dla middleware auth, z czyszczeniem stanu przy niewaznej sesji | `middleware/auth.global.ts`                                                    |

Bezposredni konsumenci znalezieni przez `rg`:

- strony: `app/pages/index.vue`, `app/pages/login.vue`,
  `app/pages/my-courses.vue`, `app/pages/manager/schedule/index.vue`;
- middleware: `app/middleware/auth.global.ts`, `app/middleware/manager.ts`,
  `app/middleware/manager-or-instructor.ts`, `app/middleware/instructor.ts`,
  `app/middleware/student.ts`, `app/middleware/student-or-instructor.ts`;
- composables: `app/composables/auth/useLogout.ts`,
  `app/composables/account/useAccountPage.ts`,
  `app/composables/vehicles/useVehiclesListPage.ts`,
  `app/composables/events/useEventsDayPage.ts`,
  `app/composables/lessons/useMyLessonsPage.ts`,
  `app/composables/lessons/useManagerLessonEditPage.ts`;
- komponenty: `app/components/app/AppHeader.vue`,
  `app/components/app/AppShellSidebar.vue`;
- testy: `app/composables/auth/useAuthSession.test.ts`.

#### Test regresyjny przed podzialem

- Dodano test `patchProfile`, ktory blokuje kontrakt normalizacji opcjonalnych
  pol profilu: trim imienia/nazwiska/opisu, puste `phone` jako `null` i
  aktualizacja `session` po odpowiedzi BFF.
- Test chroni najwazniejszy czysty fragment do wydzielenia: builder payloadu
  PATCH profilu oraz mapper odpowiedzi usera do sesji.

#### Wynik wydzielenia czystych mapowan

- Dodano `app/utils/auth/authSessionMapper.ts` dla typow sesji, mappera
  `BackendUserResponse -> AuthSession` oraz buildera payloadu PATCH profilu.
- `useAuthSession` re-exportuje publiczne typy, zeby nie zmieniac importow
  konsumentow.
- Dodano testy utility dla normalizacji danych uzytkownika, OSK, wartosci
  opcjonalnych oraz payloadu profilu.

#### Wynik kontroli granic stanu

- Nie wydzielono `useState('auth_session')` do osobnego utility, bo stan sesji
  jest granica Nuxt/SSR i powinien pozostac w composable.
- Nie powstala druga kopia stanu sesji; nowe `authSessionMapper.ts` zwraca
  tylko czyste obiekty, a `useAuthSession` nadal jako jedyny zapisuje
  `session.value`.
- `session` pozostaje mutowalnym refem w publicznym API, bo istniejacy
  kontrakt i testy opieraja sie na bezposrednim ustawianiu sesji. Flagi
  pochodne pozostaja `computed`, a mutacje produkcyjne przechodza przez jawne
  akcje `login`, `logout`, `patchProfile` i `checkSession`.
- Publiczny wrapper `useAuthSession` zachowal dotychczasowe nazwy zwracanych pol
  i funkcji oraz re-export typow.

#### Wynik zamkniecia pilota

- Konsumenci pozostaja podpieci do `useAuthSession`, bo to stabilna publiczna
  fasada sesji dla stron, middleware i composables domenowych.
- `authSessionApi.ts`, `authSessionMapper.ts`, `demoAuthSession.ts` i
  `authRole.ts` sa szczegolami wewnetrznymi domeny auth; nie przepinano
  konsumentow na nizsze warstwy.
- Wrapper nie zostal usuniety, bo nadal koordynuje stan Nuxt, retry refresh,
  czyszczenie sesji i publiczne akcje sesji.
- Weryfikacja pilota: `npx vitest run app/composables/auth/useAuthSession.test.ts app/utils/auth/authSessionApi.test.ts app/utils/auth/authSessionMapper.test.ts app/utils/auth/authRole.test.ts app/utils/auth/demoAuthSession.test.ts app/composables/auth/useAuthReturnTo.test.ts`
  oraz `npm run lint`.

### Pilot Etapu 4: `useManagerStudentDetailsPage.ts`

Zakres pilota: `app/composables/students/useManagerStudentDetailsPage.ts` jako
fasada strony `app/pages/manager/students/[userId].vue`, bez zmiany
publicznego API strony.

#### Todo pilota

- [x] Nazwac wszystkie odpowiedzialnosci obecnego pliku.
- [x] Zapisac jego publiczne API i liste konsumentow.
- [x] Dodac test najwazniejszego zachowania przed podzialem.
- [x] Wyciagnac czyste mapowania do `utils/<domain>`.
- [x] Wyciagnac niezalezny stan lub efekt do malego composable domenowego.
- [x] Nie duplikowac stanu pomiedzy nowymi composables.
- [x] Zwracac readonly state, gdy mutacja ma isc przez jawne akcje.
- [x] Uzyc obiektu opcji przy wielu opcjonalnych argumentach.
- [x] Zachowac dotychczasowy kontrakt wrappera na czas migracji.
- [x] Przepiac konsumentow.
- [x] Usunac wrapper dopiero po braku odwolujacych sie konsumentow.
- [x] Uruchomic test domeny i lint.

#### Dodatkowy podzial pilota

- [x] Wyciagnac status procesu do `useManagerStudentProcessStatus`.
- [x] Wyciagnac platnosci do `useManagerStudentPayments`.
- [x] Wyciagnac terminarz tygodniowy do `useManagerStudentSchedule`.
- [x] Odchudzic fasade `useManagerStudentDetailsPage` do route/profile/meta +
      kompozycji mniejszych composables.

#### Odpowiedzialnosci obecnego pliku

| Obszar                          | Obecna odpowiedzialnosc                                                                | Uwagi do podzialu                                                              |
| ------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Route context                   | Parsuje `userId` z params i `schoolId` z query                                         | Kandydat na maly helper/composable kontekstu strony                            |
| Load profilu kursanta           | Pobiera profil przez BFF, normalizuje i obsluguje `400/404`                            | Orkiestracja page-state, z czystym helperem dla route user id                  |
| Status procesu                  | Laduje `fetchProcessStatus`, trzyma loading/error i liczy kroki                        | Kandydat na `useManagerStudentProcessStatus`                                   |
| Platnosci                       | Laduje summary/listy oraz akcje create/update/mark paid/unpaid                         | Kandydat na `useManagerStudentPayments`                                        |
| Terminarz tygodniowy            | Trzyma zakres tygodnia, pobiera schedule i obsluguje prev/next week                    | Kandydat na `useManagerStudentSchedule`                                        |
| View-model profilu i overview   | Wylicza display name, initials, subtitle, labelki overview i link powrotu              | Czyste computed/helpery do wydzielenia po teście regresyjnym                   |
| Watchery i kolejnosc odpowiedzi | Reaguje na route/school/week i chroni przed out-of-order response licznikami sekwencji | Zachowac ostroznie; testowac guardy i brak requestow przy niepelnym kontekście |
| Page meta                       | Ustawia tytul strony na podstawie nazwy kursanta                                       | Moze zostac w fasadzie strony                                                  |

#### Publiczne API i konsumenci

Bezposredni runtime consumer: `app/pages/manager/students/[userId].vue`.
`getRouteUserIdString(rawId)` jest eksportowany, ale `rg` pokazuje tylko uzycia
lokalne w tym samym pliku.

Zwracane API:

| Grupa              | Pola/funkcje                                                                                                                                                                   | Konsumenci w stronie                                                                  |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| Stan profilu       | `student`, `isLoading`, `errorMessage`, `schoolId`                                                                                                                             | loading/error state, profile card, notes, courses                                     |
| Status procesu     | `processStatusSteps`, `processStatusLoading`, `processStatusError`, `processOverviewLabel`                                                                                     | `ManagerStudentProcessStatus`, `ManagerStudentOverviewCard`                           |
| Platnosci          | `payments`, `paymentsSummary`, `paymentsLoading`, `paymentsError`, `paymentsSaving`, `paymentsActionError`, `paymentsOverviewLabel`, akcje create/update/mark paid/mark unpaid | `ManagerStudentPaymentsSection`, `ManagerStudentOverviewCard`                         |
| Terminarz          | `scheduleWeekStart`, `scheduleItems`, `scheduleLoading`, `scheduleError`, `studentScheduleRange`, `scheduleOverviewLabel`, `handlePrevScheduleWeek`, `handleNextScheduleWeek`  | `ManagerStudentScheduleSection`, `ManagerStudentOverviewCard`                         |
| View-model profilu | `studentDisplayName`, `studentInitials`, `studentSubtitle`, `backToListHref`, `notesOverviewLabel`                                                                             | `PageHeader`, `ManagerStudentProfileCard`, `ManagerStudentOverviewCard`, link powrotu |
| Akcje lokalne      | `handleStudentNotesUpdate`                                                                                                                                                     | `ManagerStudentNotes`                                                                 |

#### Test regresyjny przed podzialem

- Dodano test `useManagerStudentDetailsPage`, ktory blokuje guard braku
  `schoolId`: composable ustawia czytelny blad, nie wlacza loadingu i nie
  wywoluje requestow profilu, procesu, platnosci ani terminarza.
- Test chroni bezpieczna granice przed podzialem loadow na mniejsze composables.

#### Wynik wydzielenia czystych mapowan

- Dodano `app/utils/students/studentDetailsPage.ts` dla parsowania route user id
  oraz view-model labeli profilu, notatek, procesu, platnosci i terminarza.
- `useManagerStudentDetailsPage` zachowuje eksport `getRouteUserIdString`, ale
  deleguje go do utility domenowego.
- Dodano testy utility dla route user id, display name, inicjalow, subtitle oraz
  overview labeli.

#### Wynik wydzielenia statusu procesu

- Dodano `useManagerStudentProcessStatus` dla stanu procesu kursanta, loadingu,
  bledu, labela overview oraz sekwencji chroniacej przed starszymi
  odpowiedziami.
- `useManagerStudentDetailsPage` zachowuje publiczne pola procesu, ale deleguje
  ich stan i load do nowego composable.
- Dodano testy braku requestu przy niepelnym kontekście oraz poprawnego labela
  `completed/total`.

#### Wynik wydzielenia platnosci

- Dodano `useManagerStudentPayments` dla listy platnosci, summary, loadingu,
  bledu, saving/action error, labela overview oraz mutacji create/update/mark
  paid/mark unpaid.
- `useManagerStudentDetailsPage` zachowuje publiczne pola i akcje platnosci,
  ale deleguje ich stan oraz requesty do nowego composable.
- Dodano testy braku requestu przy niepelnym kontekście oraz poprawnego labela
  liczby platnosci po udanym ladowaniu.

#### Wynik wydzielenia terminarza

- Dodano `useManagerStudentSchedule` dla zakresu tygodnia, listy lekcji,
  loadingu, bledu, labela overview, requestu schedule oraz akcji prev/next week.
- `useManagerStudentDetailsPage` zachowuje publiczne pola terminarza, ale
  deleguje ich stan i requesty do nowego composable.
- Dodano testy braku requestu bez studenta/szkoly oraz poprawnego requestu dla
  aktualnego zakresu tygodnia.

#### Wynik zamkniecia pilota

- `useManagerStudentDetailsPage` zostal odchudzony do route contextu, loadu
  profilu kursanta, page meta, aktualizacji notatek oraz kompozycji mniejszych
  composables.
- Stan procesu, platnosci i terminarza nie jest duplikowany w fasadzie; kazdy
  obszar ma jednego wlasciciela stanu.
- Publiczne refy pozostaja mutowalne tam, gdzie obecna strona i komponenty
  oczekuja takiego kontraktu; mutacje domenowe przechodza przez jawne akcje.
- Bezposredni konsument `app/pages/manager/students/[userId].vue` pozostaje
  podpiety do fasady `useManagerStudentDetailsPage`.
- Wrapper nie zostal usuniety, bo nadal jest publicznym kontraktem strony.
- Weryfikacja pilota: testy domeny student details, pelne `npm run test` oraz
  `npm run lint`.

### Pilot Etapu 4: `useEventsDayPage.ts`

Zakres pilota: `app/composables/events/useEventsDayPage.ts` jako fasada strony
dziennego widoku wydarzen, bez zmiany publicznego API `app/pages/events/index.vue`.

#### Todo pilota

- [x] Nazwac wszystkie odpowiedzialnosci obecnego pliku.
- [x] Zapisac jego publiczne API i liste konsumentow.
- [x] Dodac test najwazniejszego zachowania przed podzialem.
- [x] Wyciagnac czyste mapowania do `utils/<domain>`.
- [x] Wyciagnac niezalezny stan lub efekt do malego composable domenowego.
- [x] Nie duplikowac stanu pomiedzy nowymi composables.
- [x] Zwracac readonly state, gdy mutacja ma isc przez jawne akcje.
- [x] Uzyc obiektu opcji przy wielu opcjonalnych argumentach.
- [x] Zachowac dotychczasowy kontrakt wrappera na czas migracji.
- [x] Przepiac konsumentow.
- [x] Usunac wrapper dopiero po braku odwolujacych sie konsumentow.
- [x] Uruchomic test domeny i lint.

#### Odpowiedzialnosci obecnego pliku

| Obszar                        | Obecna odpowiedzialnosc                                                                 | Uwagi do podzialu                                         |
| ----------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Kontekst sesji i roli         | Wylicza `isManager` i `schoolId` z `useAuthSession`                                     | Moze zostac w fasadzie albo malym helperze roli/szkoly    |
| Load wydarzen dnia            | Dla managera pobiera schedule OSK i instruktorow, dla instruktora pobiera `my schedule` | Kandydat na `useEventsDayLoader` z ochrona `loadSeq`      |
| Stan daty i kalendarza        | Trzyma `selectedDate`, `calendarSelected`, open state i akcje prev/next/today           | Kandydat na maly composable daty dnia                     |
| Filtry i liczniki             | Trzyma status filter, filtered/sorted events, planned/attention/participant counts      | Czyste mapowania do utility                               |
| Tryb widoku i viewport        | Trzyma `viewMode`, `isCompactViewport`, resize listener i `effectiveViewMode`           | Kandydat na osobny efekt viewportu                        |
| Grid managera                 | Buduje kolumny instruktorow, zakres godzin, CSS grid columns i rows                     | Czysty builder + test regresyjny gridu                    |
| Aktualizacja statusu lokalnie | Podmienia status jednego eventu w `events` po akcji dziecka                             | Moze zostac w stanie eventow lub utility immutable update |
| Helpery prezentacyjne         | Eksportuje labelki statusow, godziny, typy eventow, uczestnikow i primary/meta text     | Czyste helpery powinny trafic do `utils/events`           |

#### Publiczne API i konsumenci

Bezposredni runtime consumer composable: `app/pages/events/index.vue`.
`app/components/events/EventsDaySchedulePanel.vue` importuje helpery
prezentacyjne z tego samego pliku.

Zwracane API:

| Grupa              | Pola/funkcje                                                                                                                                                               | Konsumenci                              |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| Stan i load        | `events`, `errorMessage`, `isLoading`, `isSchoolLoading`, `isInstructorsLoading`, `loadEvents`                                                                             | `app/pages/events/index.vue`            |
| Data i kalendarz   | `selectedDate`, `selectedDateLabel`, `calendarSelected`, `isCalendarOpen`, `handlePrevDay`, `handleNextDay`, `handleTodayClick`, `handleCalendarUpdate`                    | toolbar strony                          |
| Filtry i statusy   | `selectedStatus`, `filteredEvents`, `sortedFilteredEvents`, `visibleEventsLabel`, `plannedEvents`, `attentionEvents`, `participantTotal`, `handleStatusFilterOptionSelect` | toolbar, summary, list/grid             |
| Role i tryb widoku | `isManager`, `pageDescription`, `viewMode`, `isCompactViewport`, `effectiveViewMode`                                                                                       | page layout i przelacznik widoku        |
| Grid managera      | `managerScheduleColumns`, `managerScheduleGridColumns`, `managerScheduleRows`                                                                                              | `EventsDaySchedulePanel.vue` przez page |
| Akcje lokalne      | `handleStatusChanged`                                                                                                                                                      | aktualizacja po zmianie statusu eventu  |

Eksporty helperow prezentacyjnych uzywane poza composable:

- `statusFilterLabel`, `statusFilterLabelForOption`;
- `eventIsoToHm`, `displayParticipantCount`, `displayEventPrimary`,
  `displayEventMeta`, `eventTypeBadgeClasses`, `eventTypeLabel`.

#### Test regresyjny przed podzialem

- Dodano test `useEventsDayPage`, ktory blokuje kontrakt managera dla
  dziennego widoku: pobranie schedule OSK i instruktorow, odfiltrowanie wpisow
  innych niz `instructor_event` oraz przypisanie eventu do kolumny i wiersza
  grida wedlug instruktora i godziny startu.
- Test celowo nie dotyka builda ani UI; stabilizuje granice przed wydzieleniem
  helperow prezentacyjnych, buildera grida i loadera dnia.

#### Czyste mapowania

- Przeniesiono helpery prezentacyjne dnia wydarzen do
  `app/utils/events/eventsDayPage.ts`: status filter labels, formatowanie czasu,
  licznik uczestnikow, primary/meta text oraz badge/type label.
- `useEventsDayPage.ts` zostawia re-export dotychczasowych nazw, zeby nie
  zmieniac jeszcze kontraktu `EventsDaySchedulePanel.vue`; przepiecie
  konsumentow zostaje na osobny checkbox.
- Dodano test `eventsDayPage.test.ts`, ktory pokrywa mapowanie statusow,
  format tekstu eventu oraz fallbacki dla liczby uczestnikow i nieznanego typu.

#### Niezalezny stan daty

- Wydzielono `useEventsDayDateSelection` z odpowiedzialnoscia za
  `selectedDate`, `calendarSelected`, `isCalendarOpen`, label dnia oraz akcje
  poprzedni/nastepny/dzisiaj/wybor z kalendarza.
- `useEventsDayPage.ts` nadal zwraca te same pola i akcje, ale nie zawiera juz
  szczegolow manipulacji data.
- Dodano test `useEventsDayDateSelection.test.ts` dla przechodzenia miedzy
  dniami, powrotu do dzisiaj i zamykania popovera po wyborze daty.

#### Brak duplikacji stanu

- Zweryfikowano, ze `selectedDate`, `calendarSelected`, `isCalendarOpen` i
  `selectedDateLabel` sa zdefiniowane tylko w `useEventsDayDateSelection`.
- `useEventsDayPage.ts` przechowuje referencje z tego composable i uzywa ich w
  loaderze oraz zwracanym API bez tworzenia drugiego, synchronizowanego stanu.

#### Readonly state

- `useEventsDayDateSelection` zwraca `selectedDate` jako readonly ref, bo zmiana
  daty ma isc przez jawne akcje `handlePrevDay`, `handleNextDay`,
  `handleTodayClick` i `handleCalendarUpdate`.
- `isCalendarOpen` zostaje writable, poniewaz `app/pages/events/index.vue`
  uzywa go jako `v-model:open` dla popovera; zamrozenie tego pola byloby
  zmiana kontraktu UI.
- Test `useEventsDayPage` przestal zapisywac do `selectedDate.value` i ustawia
  date przez `handleCalendarUpdate`.

#### Obiekt opcji

- `useEventsDayDateSelection` przyjmuje pojedynczy obiekt
  `EventsDayDateSelectionOptions` zamiast pozycyjnych argumentow opcjonalnych.
- Opcje `initialDate` i `now` sa uzywane w testach do stabilizacji dat bez
  mockowania globalnego czasu.

#### Kontrakt wrappera w czasie migracji

- `useEventsDayPage.ts` nadal eksportuje dotychczasowe helpery prezentacyjne z
  tych samych nazw, mimo ze implementacja mieszka juz w
  `app/utils/events/eventsDayPage.ts`.
- `EventsDaySchedulePanel.vue` i `app/pages/events/index.vue` nie wymagaly
  jeszcze zmian importow ani propsow, dzieki czemu migracja pozostaje
  kompatybilna.

#### Przepiecie konsumentow

- `EventsDaySchedulePanel.vue` importuje helpery prezentacyjne i typ filtra
  statusu bezposrednio z `app/utils/events/eventsDayPage.ts`.
- Z `useEventsDayPage.ts` panel nadal importuje tylko typy powiazane z
  kontraktem fasady strony: `EventsDayViewMode`, `InstructorScheduleColumn` i
  `InstructorScheduleRow`.

#### Usuniecie re-exportow wrappera

- Po przepieciu `EventsDaySchedulePanel.vue` sprawdzono `rg`, ze helpery
  prezentacyjne i `EventsDayStatusFilterOption` nie sa juz importowane z
  `useEventsDayPage.ts`.
- Usunieto re-exporty helperow z `useEventsDayPage.ts`; publicznym zrodlem dla
  tych funkcji jest teraz `app/utils/events/eventsDayPage.ts`.

#### Weryfikacja pilota

- Uruchomiono testy domeny:
  `npx vitest run app/composables/events/useEventsDayPage.test.ts app/composables/events/useEventsDayDateSelection.test.ts app/utils/events/eventsDayPage.test.ts`.
- Uruchomiono `npm run lint`.
- Build celowo pominiety zgodnie z ustaleniem procesu.

### Kryterium zakonczenia

Kazdy composable ma jedna opisywalna odpowiedzialnosc, a stan pochodny nie jest synchronizowany watcherami, jezeli moze byc `computed`.

## Etap 5: odchudzenie stron i komponentow Vue

Cel: strony skladaja funkcje, komponenty prezentacyjne maja jawne kontrakty, a niezalezne sekcje UI sa testowalne osobno.

### Najwazniejsze kandydaty

| Priorytet | Plik                                  | Proponowany podzial                                              |
| --------- | ------------------------------------- | ---------------------------------------------------------------- |
| P0        | `pages/vehicles/[id]/edit.vue`        | route container, formularz, upload zdjecia, actions/status       |
| P0        | `VehiclesListPanel.vue`               | desktop table, mobile list, manager controls, delete dialog      |
| P0        | `ManagerEventStudentPickerDialog.vue` | dialog shell, filtry, lista wyboru, summary/actions              |
| P0        | `CourseCreateForm.vue`                | sekcje formularza, walidacja, submit actions                     |
| P1        | `ManagerCoursesListPanel.vue`         | toolbar/filter, desktop rows, mobile items, empty/loading states |
| P1        | `pages/login.vue`                     | presentation, form, demo login controls                          |
| P1        | `NavTree.vue`                         | model nawigacji, grupa, element, wariant mobilny                 |
| P1        | `ManagerTheoryEventCreateDialog.vue`  | pola czasu, uczestnicy, walidacja, akcje                         |
| P1        | `VehicleDetailsContent.vue`           | summary, status, dates, manager actions                          |
| P1        | `ManagerInstructorDetailsContent.vue` | header/profile, schedule context, action area                    |
| P2        | `pages/my-courses.vue`                | route container i sekcje domenowe                                |
| P2        | `ManagerInstructorFormDialog.vue`     | pola konta, pola instruktora, walidacja, actions                 |

### Mapa odpowiedzialnosci dla nowych komponentow

Przed podzialem kazdego SFC nalezy dopisac krotka mape:

| Element                | Jedna odpowiedzialnosc            | Wejscie               | Wyjscie              |
| ---------------------- | --------------------------------- | --------------------- | -------------------- |
| route/container        | pobiera composable i sklada widok | route/query           | props do dzieci      |
| feature container      | koordynuje stan jednego feature   | dane domenowe         | akcje i statusy      |
| presentational section | renderuje jedna sekcje            | typowane props        | typowane emits       |
| form                   | zarzadza kontraktem formularza    | model/defaults/errors | submit/cancel/update |
| list/item              | renderuje kolekcje lub rekord     | elementy              | select/edit/delete   |

### Checklist dla kazdego SFC

- [ ] Policzyc niezalezne sekcje UI i odpowiedzialnosci skryptu.
- [ ] Zdefiniowac mape komponentow przed edycja.
- [ ] Pozostawic strone jako route meta + composable + kompozycje widoku.
- [ ] Uzyc `<script setup lang="ts">`.
- [ ] Uporzadkowac sekcje jako script, template, style.
- [ ] Typowac props i emits.
- [ ] Nie mutowac propsow w dziecku.
- [ ] Uzyc `v-model` tylko dla prawdziwego kontraktu dwukierunkowego.
- [ ] Przeniesc filtrowanie i sortowanie z template do `computed`.
- [ ] Zachowac stabilne `key` dla list.
- [ ] Sprawdzic desktop i mobile bez zmiany wizualnej.
- [ ] Dodac test komponentu lub logiki composable dla nowej granicy.

### Pilot Etapu 5: `pages/vehicles/[id]/edit.vue`

Zakres pilota: odchudzic strone edycji pojazdu bez zmiany flow zapisu,
uploadu zdjecia ani publicznego kontraktu `VehicleForm`.

#### Todo pilota

- [x] Policzyc niezalezne sekcje UI i odpowiedzialnosci skryptu.
- [x] Zdefiniowac mape komponentow przed edycja.
- [x] Pozostawic strone jako route meta + composable + kompozycje widoku.
- [x] Uzyc `<script setup lang="ts">`.
- [x] Uporzadkowac sekcje jako script, template, style.
- [x] Typowac props i emits.
- [x] Nie mutowac propsow w dziecku.
- [x] Uzyc `v-model` tylko dla prawdziwego kontraktu dwukierunkowego.
- [x] Przeniesc filtrowanie i sortowanie z template do `computed`.
- [x] Zachowac stabilne `key` dla list.
- [x] Sprawdzic desktop i mobile bez zmiany wizualnej.
- [x] Dodac test komponentu lub logiki composable dla nowej granicy.

#### Sekcje UI

| Sekcja                  | Odpowiedzialnosc                                                    |
| ----------------------- | ------------------------------------------------------------------- |
| Page header             | tytul, meta pojazdu, akcje anuluj/zapisz                            |
| Invalid route state     | komunikat dla braku `schoolId` albo `vehicleId`                     |
| List load error         | blad pobrania listy pojazdow z retry                                |
| Initial loading/empty   | stan bootloadingu i brak pojazdu po liscie/detailu                  |
| Vehicle form shell      | `VehicleForm` z akcja submit i footerem formularza                  |
| Photo upload subsection | podglad zdjecia, wybor pliku, tooltip wymagan i blad uploadu/detalu |

#### Odpowiedzialnosci skryptu

| Obszar                  | Obecna odpowiedzialnosc                                                       | Uwagi do podzialu                                                       |
| ----------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Route context           | Parsuje `schoolId` z query i `vehicleId` z params                             | Kandydat na helper/composable wspolny z create/detail                   |
| API orchestration       | Uzywa `useVehiclesApi` do listy, detalu, update i uploadu zdjecia             | Kandydat na `useVehicleEditPage`                                        |
| Lista pojazdow          | Laduje liste dla OSK, aby znalezc podstawowy model formularza                 | Moze zostac w composable strony                                         |
| Detail pojazdu          | Laduje szczegoly i `photoUrl` niezaleznie od listy                            | Wydzielic razem ze stanem bledu/loadingu detailu                        |
| View-model naglowka     | Liczy `vehicleTitle`, `headerMeta`, route powrotu i busy state                | Czyste computed w composable albo utility view-model                    |
| Photo preview lifecycle | Trzyma input ref, plik, object URL, revoke na zmiane route i unmount          | Kandydat na `useVehiclePhotoUploadState`                                |
| Submit flow             | Waliduje rozmiar pliku, wykonuje update, opcjonalnie upload photo i nawigacje | Kandydat na akcje w `useVehicleEditPage` z testem bledu za duzego pliku |
| Error states            | Rozdziela `loadError`, `detailLoadError`, `apiError`, `photoUploadError`      | Zachowac jawne komunikaty, nie laczyc bledow w jeden string             |

#### Mapa komponentow przed edycja

| Element                        | Docelowa odpowiedzialnosc                                          | Wejscie                                  | Wyjscie                        |
| ------------------------------ | ------------------------------------------------------------------ | ---------------------------------------- | ------------------------------ |
| `pages/vehicles/[id]/edit.vue` | route meta, wywolanie `useVehicleEditPage`, kompozycja widoku      | route/query                              | props do sekcji i akcje submit |
| `useVehicleEditPage`           | load list/detail, submit update/upload, view-model i bledy strony  | `route`, `useVehiclesApi`, `navigateTo`  | stan strony i akcje            |
| `VehicleEditPhotoSection.vue`  | podglad zdjecia, wybor pliku, tooltip wymagan, blad detail/uploadu | photo src, file name, loading/error/busy | `file-change` albo input ref   |
| `VehicleForm`                  | pola formularza i walidacja danych pojazdu                         | initial vehicle, saving, api error       | `submit(payload)`              |
| `ActionGroup` footer           | akcje anuluj/zapisz w stopce formularza                            | route powrotu, busy state, form id       | submit przez `form` attribute  |

Pierwszy implementacyjny krok: wydzielic `useVehicleEditPage`, zeby strona
przestala laczyc route meta, orkiestracje API, stan uploadu i template. Po tym
kroku najbezpieczniejsza sekcja UI do wydzielenia to
`VehicleEditPhotoSection.vue`, bo nie wymaga zmiany kontraktu `VehicleForm`.

#### Route meta + composable + widok

- Wydzielono `useVehicleEditPage` dla route contextu, loadu listy i detailu,
  submitu update/upload, stanu zdjecia, view-modelu naglowka oraz komunikatow
  bledow.
- `pages/vehicles/[id]/edit.vue` zostaje przy `definePageMeta`, `usePageMeta`,
  wywolaniu composable i skladaniu obecnego widoku bez zmiany kontraktu
  `VehicleForm`.
- Staly identyfikator formularza przeniesiono do `VEHICLE_EDIT_FORM_ID`, a
  strona uzywa zwroconego `formId`.

#### Script Setup

- `pages/vehicles/[id]/edit.vue` pozostaje w `<script setup lang="ts">`.
- Nowy `useVehicleEditPage` przejmuje logike strony bez wprowadzania Options
  API ani dodatkowego wrappera komponentu.

#### Kolejnosc Sekcji SFC

- `pages/vehicles/[id]/edit.vue` ma uporzadkowany ksztalt SFC: najpierw
  `<script setup lang="ts">`, potem `<template>`.
- Plik nie ma lokalnego `<style>`, wiec nie dodawano pustej sekcji tylko po to,
  zeby wypelnic schemat.

#### Props I Emits

- Dodano `VehicleEditPhotoSection.vue` z typowanymi propsami dla stanu podgladu
  zdjecia, loadingu, bledow i nazwy pojazdu.
- Komponent emituje typowane `fileChange(event: Event)`, a
  `useVehicleEditPage` przechowuje referencje do inputa pochodzaca z eventu
  tylko po to, aby po uploadzie lub zmianie route wyczyscic natywny input.

#### Brak Mutacji Propsow

- `VehicleEditPhotoSection.vue` nie mutuje zadnego propsa; zmiana pliku idzie
  przez emit `fileChange`.
- Wlascicielem stanu pliku, object URL, nazwy pliku i bledow pozostaje
  `useVehicleEditPage`.

#### V-model

- W pilocie `pages/vehicles/[id]/edit.vue` oraz
  `VehicleEditPhotoSection.vue` nie ma `v-model` ani `defineModel`.
- Wybór pliku jest jednokierunkowy: rodzic przekazuje stan podgladu i bledow,
  a dziecko emituje `fileChange`.

#### Computed Zamiast Logiki W Template

- `pages/vehicles/[id]/edit.vue` i `VehicleEditPhotoSection.vue` nie zawieraja
  filtrowania ani sortowania w template.
- Stan pochodny strony, taki jak `initialVehicle`, `vehicleTitle`,
  `headerMeta`, `previewPhotoSrc`, `pendingPhotoFileName`, `isSaveBusy` i route
  powrotu, jest liczony w `useVehicleEditPage` przez `computed`.

#### Stabilne Key

- Pilot `pages/vehicles/[id]/edit.vue` nie zawiera `v-for`, wiec refaktor nie
  wprowadzil ani nie zmienil kluczy list.
- Nowy `VehicleEditPhotoSection.vue` renderuje pojedyncza sekcje bez kolekcji.

#### Desktop I Mobile

- Sprawdzono kodowo, ze `VehicleEditPhotoSection.vue` zachowuje dotychczasowe
  klasy layoutu sekcji zdjecia, w tym responsywny grid
  `md:grid-cols-[minmax(0,18rem)_minmax(0,24rem)]`, `md:items-start`,
  `md:max-w-sm` oraz mobile fallback przez `grid gap-4`.
- Nie uruchamiano builda ani dev-serverowego smoke testu w tym commicie; zgodnie
  z procesem weryfikacja pozostala na poziomie refaktoru bez zmiany markup/classes.

#### Test Nowej Granicy

- Dodano `useVehicleEditPage.test.ts`, ktory chroni guard braku kontekstu route:
  bez `schoolId` i `vehicleId` composable nie wywoluje requestow listy,
  szczegolow, update, uploadu zdjecia ani nawigacji po submit.
- Test pokrywa nowa granice logiki strony bez dodawania testow SFC mount.

### Pilot Etapu 5: `VehiclesListPanel.vue`

Zakres pilota: odchudzic panel listy pojazdow bez zmiany publicznego API
`app/pages/vehicles/index.vue`. Realna sciezka komponentu to
`app/components/app/VehiclesListPanel.vue`; przeniesienie do
`components/vehicles` zostaje osobnym krokiem, zeby nie mieszac move file z
podzialem odpowiedzialnosci.

#### Todo pilota

- [x] Policzyc niezalezne sekcje UI i odpowiedzialnosci skryptu.
- [x] Zdefiniowac mape komponentow przed edycja.
- [ ] Pozostawic strone jako route meta + composable + kompozycje widoku.
- [ ] Uzyc `<script setup lang="ts">`.
- [ ] Uporzadkowac sekcje jako script, template, style.
- [ ] Typowac props i emits.
- [ ] Nie mutowac propsow w dziecku.
- [ ] Uzyc `v-model` tylko dla prawdziwego kontraktu dwukierunkowego.
- [ ] Przeniesc filtrowanie i sortowanie z template do `computed`.
- [ ] Zachowac stabilne `key` dla list.
- [ ] Sprawdzic desktop i mobile bez zmiany wizualnej.
- [ ] Dodac test komponentu lub logiki composable dla nowej granicy.

#### Sekcje UI

| Sekcja                    | Odpowiedzialnosc                                                |
| ------------------------- | --------------------------------------------------------------- |
| Page header               | tytul, opis, akcja aktualnej floty i link dodania pojazdu       |
| Summary strip             | metryki floty z `useVehiclesListPanelSummary`                   |
| Filter bar                | label wynikow, status badge i taby `simple/manager`             |
| Error/loading/empty state | komunikaty listy, loading shell, empty state i blad usuwania    |
| Desktop table             | wiersze pojazdow, statusy, terminy i akcje managera             |
| Mobile cards              | mobilna prezentacja pojazdow, akcje i kontrola statusu managera |
| Manager status grid       | desktopowa szybka kontrola dostepnosci pojazdow                 |
| Delete dialog             | potwierdzenie usuniecia i status akcji delete                   |

#### Publiczne API I Konsumenci

- Props: `isManager`, `activePanel`, `resolvedSchoolId`, `loadError`,
  `deleteActionError`, `isListLoading`, `vehicles`, `isDeleteLoading`,
  `isSetDefaultLoading`, `vehiclePendingDelete`, `statusUpdatingVehicleId`.
- Emity: `tabSelect`, `tabKeydown`, `requestDelete`, `deleteDialogOpen`,
  `cancelDelete`, `confirmDelete`, `setDefault`, `statusChange`.
- Jedyny runtime consumer: `app/pages/vehicles/index.vue`, przez auto-import
  Nuxt.
- Powiazana logika pochodna jest juz czesciowo w
  `useVehiclesListPanelSummary`.

#### Odpowiedzialnosci Skryptu

| Obszar              | Obecna odpowiedzialnosc                                      | Uwagi do podzialu                                            |
| ------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| Publiczny kontrakt  | Szeroki zestaw props/emits dla strony `vehicles/index.vue`   | Zachowac w wrapperze panelu podczas pierwszych ekstrakcji    |
| Summary/view-model  | Deleguje liczniki i labelki do `useVehiclesListPanelSummary` | Nie mieszac z refaktorem UI, chyba ze dodawany jest test     |
| Taby managera       | Renderuje i emituje `tabSelect`/`tabKeydown`                 | Kandydat na maly komponent toolbar actions                   |
| Desktop table       | Renderuje tabele, statusy, terminy i akcje                   | Kandydat na `VehiclesListDesktopTable`                       |
| Mobile cards        | Renderuje karty mobilne i akcje managera                     | Kandydat na `VehiclesListMobileCards`                        |
| Manager status grid | Renderuje szybka zmiane statusow dla wszystkich pojazdow     | Najmniejszy bezpieczny pierwszy krok implementacyjny         |
| Delete dialog       | Spina open state przez `vehiclePendingDelete !== null`       | Zostawic na pozniej, bo dotyka akcji delete i error handling |

#### Mapa Komponentow Przed Edycja

| Element                        | Docelowa odpowiedzialnosc                                | Wejscie                               | Wyjscie                   |
| ------------------------------ | -------------------------------------------------------- | ------------------------------------- | ------------------------- |
| `VehiclesListPanel.vue`        | publiczna fasada panelu i kompozycja sekcji              | props ze strony                       | emity do strony           |
| `VehicleManagerStatusGrid.vue` | desktopowa szybka kontrola statusow pojazdow             | `vehicles`, `statusUpdatingVehicleId` | `statusChange`            |
| `VehiclesListDesktopTable.vue` | tabela desktop z akcjami i statusem                      | vehicles, manager flags, route ctx    | akcje row-level           |
| `VehiclesListMobileCards.vue`  | karty mobilne z akcjami i kontrola statusu managera      | vehicles, manager flags, route ctx    | akcje card-level          |
| `VehiclesListModeTabs.vue`     | taby `Lista` / `Status` dla managera                     | active panel                          | `tabSelect`, `tabKeydown` |
| `VehicleDeleteDialog`          | potwierdzenie usuniecia; zostaje istniejacym komponentem | pending vehicle, loading              | close/cancel/confirm      |

Pierwszy implementacyjny krok: wydzielic tylko
`VehicleManagerStatusGrid.vue`, bo izoluje jedna sekcje UI, zachowuje kontrakt
`VehiclesListPanel.vue` i nie dotyka powtarzajacych sie akcji desktop/mobile.

### Kryterium zakonczenia

Strony nie zawieraja pelnej implementacji feature, a duzy komponent nie laczy jednoczesnie orkiestracji danych i kilku niezaleznych sekcji prezentacji.

## Etap 6: typy, walidacja i normalizacja

Cel: zmniejszyc liczbe miejsc, w ktorych dane API sa recznie zgadywane albo rzutowane.

### Todo

- [ ] Zinwentaryzowac `unknown`, szerokie `Record<string, unknown>` i lokalne DTO.
- [ ] Oznaczyc typy jako: API DTO, model domenowy, model formularza albo view model.
- [ ] Nie importowac bezposrednio ogromnego `generated/api.ts` do kazdego komponentu.
- [ ] Zbudowac waskie aliasy typow przy granicach domen, gdy OpenAPI jest zrodlem prawdy.
- [ ] Usunac reczne duplikaty dopiero po potwierdzeniu zgodnosci z OpenAPI.
- [ ] Ujednolicic normalizatory odpowiedzi i ich testy.
- [ ] Przeniesc parsery request body z handlerow Nitro do testowalnych modulow domenowych.
- [ ] Uzyc Zod tam, gdzie walidacja runtime chroni zewnetrzna granice.
- [ ] Nie walidowac ponownie wewnetrznych, juz typowanych danych bez potrzeby.
- [ ] Ujednolicic komunikaty walidacji i mapowanie bledow pol formularza.
- [ ] Dodac testy invalid, missing, null, empty i unexpected shape.

### Kryterium zakonczenia

Kazda zewnetrzna granica ma jawny typ i, gdy to potrzebne, walidacje runtime; komponenty nie parsuja surowych kopert API.

## Etap 7: siatka testow regresyjnych

Cel: podnosic pokrycie wedlug ryzyka, a nie wedlug samej liczby linii.

### Piramida testow

| Poziom         | Co testujemy                               | Narzedzie                                           |
| -------------- | ------------------------------------------ | --------------------------------------------------- |
| czyste funkcje | mapowania, daty, filtry, role, payloady    | Vitest                                              |
| transport      | retry 401, cookies, koperty, bledy HTTP    | Vitest z mockiem fetch                              |
| composables    | stan, akcje, race conditions, reset bledow | Vitest/Nuxt test utils, jesli potrzebne             |
| handlery Nitro | walidacja, auth, wybor adaptera, statusy   | Vitest                                              |
| smoke UI       | krytyczne sciezki uzytkownika              | Playwright jako osobny etap, jezeli zostanie dodany |

### Todo

- [ ] Dodac testy executora BFF przed masowa migracja.
- [ ] Pokryc auth: login, refresh single-flight, logout, auth failure.
- [ ] Pokryc macierz middleware rol.
- [ ] Pokryc event edit form i payload.
- [ ] Pokryc student details: profil, kursy i platnosci.
- [ ] Pokryc schedule: zakres tygodnia i mapowanie wydarzen.
- [ ] Pokryc vehicle edit i status availability.
- [ ] Pokryc parsery body i query Nitro.
- [ ] Dodawac test regresyjny dla kazdego znalezionego bledu.
- [ ] Nie uzalezniac testow jednostkowych od sieci ani zegara systemowego.
- [ ] Ustalac staly czas i UUID w testach.
- [ ] Po kazdym etapie uruchomic pelne `npm run test`.

### Kryterium zakonczenia

Kazdy krytyczny przeplyw ma co najmniej jedna automatyczna ochrone, a nowe helpery infrastrukturalne maja testy wszystkich galezi decyzyjnych.

## Etap 8: struktura katalogow i dokumentacja

Cel: po migracji kod ma byc latwy do odnalezienia bez polegania na globalnych auto-importach.

### Docelowe zasady katalogow

- `app/pages`: routing i kompozycja strony;
- `app/components/<domain>`: UI konkretnej domeny;
- `app/components/app/ui`: wspolne wzorce produktowe;
- `app/components/shadcn`: kod biblioteki UI i jej barrel files;
- `app/composables/<domain>`: reaktywny stan i orkiestracja domeny;
- `app/utils/<domain>`: czyste funkcje;
- `app/types/<domain>`: modele i kontrakty domenowe;
- `server/api`: cienkie handlery HTTP;
- `server/utils/<domain>`: adaptery domenowe;
- `server/utils/upstream`: wspolny transport do backendu.

### Todo

- [ ] Przeniesc domenowe komponenty pojazdow z `components/app` do `components/vehicles`.
- [ ] Sprawdzic niespojny podzial `components/app`, `manager`, `student`, `account`, `events`.
- [ ] Zachowac jawne importy dla waznych zaleznosci domenowych.
- [ ] Nie dodawac nowych barrel files w domenach.
- [ ] Zweryfikowac, czy szerokie `imports.dirs` nie maskuje kolizji nazw.
- [ ] Zaktualizowac `docs/CODEMAP.md`.
- [ ] Zaktualizowac `docs/ARCHITECTURE.md`.
- [ ] Zaktualizowac `docs/COMPONENTS.md` i `docs/COMPOSABLES.md`.
- [ ] Zaktualizowac `docs/API_AND_BFF.md`.
- [ ] Dodac link do tego planu w `docs/README.md` na czas realizacji.
- [ ] Po zakonczeniu oznaczyc plan jako wykonany albo usunac go zgodnie z przyjetym procesem.

### Kryterium zakonczenia

Nowa osoba potrafi przejsc od route do komponentu, composable, typu i endpointu BFF bez przeszukiwania calego repozytorium.

## Etap 9: koncowy audyt

### Todo

- [ ] Potwierdzic brak nieplanowanych zmian wizualnych.
- [ ] Potwierdzic brak zmian publicznych kontraktow API.
- [ ] Uruchomic `npm run test`.
- [ ] Uruchomic `npm run lint`.
- [ ] Nie uruchamiac buildu bez wyraznego polecenia.
- [ ] Wykonac smoke testy w trybie mock.
- [ ] Wykonac smoke testy w trybie upstream.
- [ ] Sprawdzic SSR i brak hydration warnings.
- [ ] Sprawdzic stan working tree.
- [ ] Zaktualizowac dokumentacje architektury.
- [ ] Porownac metryki koncowe z baseline.
- [ ] Zmergowac feature branch lokalnie do `master` po akceptacji.
- [ ] Usunac zakonczony branch lokalnie i z remote po potwierdzeniu merge.

### Metryki efektu

Metryki maja pokazac kierunek zmiany, a nie wymuszac sztuczne limity linii.

- [ ] Policzyc handlery nadal wybierajace lokalnie `mock/upstream`.
- [ ] Policzyc miejsca uzywajace surowego `$fetch` poza centralnym transportem i testami.
- [ ] Zapisac rozmiar dziesieciu najwiekszych composables przed i po refaktorze.
- [ ] Zapisac rozmiar dziesieciu najwiekszych stron i komponentow przed i po refaktorze.
- [ ] Policzyc pliki testowe oraz krytyczne przeplywy posiadajace ochrone regresyjna.
- [ ] Policzyc pozostale wystapienia `unknown` na zewnetrznych granicach API.
- [ ] Policzyc stare wrappery i eksporty pozostawione tylko dla kompatybilnosci.
- [ ] Porownac liczbe requestow dla wybranych krytycznych widokow.
- [ ] Opisac zmiany jakosciowe, ktorych nie da sie uczciwie wyrazic liczba.

## Dziennik decyzji

Aktualizujemy go, gdy wybieramy rozwiazanie majace wplyw na wiecej niz jeden plik lub domene.

| Data       | Etap   | Decyzja                                                                                       | Powod                                                                                                                   | Konsekwencje                                                                                                            |
| ---------- | ------ | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 2026-08-16 | etap 1 | Akceptujemy `executeBffAdapter<T>(event, { upstream, mock })` jako publiczne API migracji BFF | Pilot `server/api/ratings/me.get.ts` zachowal osobna autoryzacje mocka, przekazanie `upstreamBase` i koperty odpowiedzi | Kolejne handlery moga migrowac na executor; walidacja, statusy HTTP, cookies i mapowanie bledow zostaja poza executorem |
| 2026-08-16 | etap 3 | Reguly dostepu rol trzymamy w `app/utils/auth/authRole.ts`                                    | Middleware, strony i composables musza uzywac tej samej normalizacji roli oraz tych samych grup dostepu                 | Nowe warianty dostepu dodajemy jako typowane helpery z testem macierzy; nie sprawdzamy surowych stringow roli inline    |

### Todo

- [x] Zapisac decyzje o publicznym API executora BFF po migracji pilotazowej.
- [ ] Zapisac docelowy podzial klienta BFF po zakonczeniu etapu 2.
- [x] Zapisac jedno zrodlo regul rol po zakonczeniu etapu 3.
- [ ] Zapisac przyjete granice komponentow i composables, jezeli stana sie wzorcem dla kolejnych domen.
- [ ] Przy zmianie decyzji nie usuwac starego wpisu; oznaczyc go jako zastapiony i wskazac nowy.

## Problemy odroczone

Ta sekcja chroni aktualny branch przed niekontrolowanym rozszerzaniem zakresu.

| ID      | Znaleziono w | Problem     | Ryzyko          | Proponowany etap lub branch | Status |
| ------- | ------------ | ----------- | --------------- | --------------------------- | ------ |
| REF-001 | etap/plik    | krotki opis | low/medium/high | miejsce dalszej pracy       | open   |

### Todo

- [ ] Dopisywac problem, gdy jest wazny, ale nie blokuje aktualnego etapu.
- [ ] Nie naprawiac problemu odroczonego w biezacym commicie bez zmiany zakresu.
- [ ] Przed rozpoczeciem nowego brancha przejrzec otwarte problemy.
- [ ] Po rozwiazaniu wpisac commit i oznaczyc rekord jako `done`.
- [ ] Usuwac wpis tylko wtedy, gdy okazal sie nieaktualny, z podaniem powodu.

## Kolejnosc branchy

Planowana kolejnosc moze zostac skorygowana po wynikach testow, ale nie nalezy prowadzic kilku duzych migracji jednoczesnie.

1. `refactor/03-bff-adapters` - etap 1
2. `refactor/04-auth-and-roles` - etapy 2-3 w zakresie sesji
3. `refactor/05-event-composables` - pierwszy pilot podzialu composables
4. `refactor/06-student-composables` - dane kursanta i platnosci
5. `refactor/07-schedule-composables` - kalendarze i harmonogram
6. `refactor/08-vehicle-components` - pierwszy pilot podzialu SFC
7. `refactor/09-feature-components` - pozostale komponenty P0/P1
8. `refactor/10-contracts-and-tests` - domkniecie typow i brakujacych testow
9. `refactor/11-frontend-structure` - ruchy katalogow i dokumentacja

## Szablon realizacji pojedynczego zadania

Skopiuj te punkty do opisu pracy nad kazdym kolejnym elementem:

- [ ] Okreslone obecne zachowanie i konsumenci.
- [ ] Zapisany test regresyjny lub powod, dla ktorego nie jest potrzebny.
- [ ] Zdefiniowana nowa granica odpowiedzialnosci.
- [ ] Wykonana najmniejsza mozliwa migracja.
- [ ] Brak zmiany publicznego kontraktu.
- [ ] Testy celowane przechodza.
- [ ] Lint przechodzi.
- [ ] Build nie byl uruchamiany w petli testowej; ewentualna kontrola buildu wymaga osobnego polecenia.
- [ ] Dokumentacja zostala zaktualizowana, jesli zmienila sie architektura.
- [ ] Commit ma jedna odpowiedzialnosc i czytelny opis.
- [ ] Branch zostal wypchniety dopiero po pelnej weryfikacji.

## Definition of Done calego refaktoru

- [ ] Nie ma powtarzanego mechanizmu wyboru adaptera BFF w handlerach.
- [ ] Wewnetrzne wywolania API korzystaja ze wspolnego klienta BFF.
- [ ] Sesja i role maja jedno zrodlo prawdy.
- [ ] Najwieksze composables P0/P1 zostaly podzielone wedlug odpowiedzialnosci.
- [ ] Najwieksze SFC P0/P1 zostaly podzielone na jawne komponenty.
- [ ] Strony Nuxt sa cienkimi powierzchniami kompozycji.
- [ ] Granice API maja typy i potrzebna walidacje runtime.
- [ ] Krytyczne przeplywy maja testy regresyjne.
- [ ] Nie pozostaly nieuzasadnione cykle zaleznosci ani martwe warstwy kompatybilnosci.
- [ ] Krytyczne przeplywy asynchroniczne sa odporne na nieaktualne odpowiedzi.
- [ ] Refaktor zachowal dostepnosc klawiatury, focus i komunikaty bledow.
- [ ] BFF nie ujawnia tokenow, cookies ani technicznych szczegolow bledow.
- [ ] Testy i lint przechodza.
- [ ] Metryki koncowe zostaly porownane z baseline i opisane.
- [ ] Dokumentacja odpowiada faktycznej strukturze kodu.
- [ ] Nie wprowadzono nowych funkcji ani nieplanowanych zmian UI.
