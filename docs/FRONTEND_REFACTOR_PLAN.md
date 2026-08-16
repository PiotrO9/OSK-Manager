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
- [ ] Etap 2: domknac jedna warstwe transportu po stronie aplikacji
- [ ] Etap 3: uproscic sesje, autoryzacje i middleware rol
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
- [ ] Usunac martwe lub dublujace API dopiero po migracji konsumentow.
- [ ] Przeniesc wywolanie BFF z `ManagerStudentNotes.vue` do composable domenowego.
- [ ] Zastapic `unknown` typami odpowiedzi tam, gdzie kontrakt jest znany.
- [ ] Ujednolicic obsluge odpowiedzi `{ success: true }` bez `data`.
- [ ] Ujednolicic upload `FormData` bez recznego `Content-Type`.
- [ ] Potwierdzic pojedynczy retry po 401 i single-flight refresh.
- [ ] Potwierdzic, ze refresh nie moze rekurencyjnie wywolac samego siebie.
- [ ] Zachowac `useRequestFetch` w SSR dla wewnetrznych wywolan Nuxt.
- [ ] Ograniczyc surowy `$fetch` do centralnego transportu i testow.
- [ ] Zaktualizowac `docs/API_AND_BFF.md` po ustabilizowaniu API.

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
| `externalFetch`        | `app/composables/core/useApi.ts`                                     | jawne zewnetrzne URL-e HTTP; obecnie brak konsumentow poza definicja                            |
| `useBffApi` / `useApi` | `app/composables/core/useApi.ts`                                     | kompatybilny reaktywny wrapper; obecnie brak konsumentow poza definicja i komentarzem           |
| `resolveBffEndpoint`   | `app/utils/api/bffEndpoint.ts`                                       | kompatybilny helper endpointu uzywany przez plugin `$bff`                                       |
| surowy `$fetch`        | `app/composables/core/useApi.ts`, `app/plugins/bff-client.ts`, testy | dopuszczony w centralnym transporcie i testach                                                  |

#### Konsumenci domenowi

| Mechanizm                 | Obserwacja                                                                                                                 | Decyzja na dalszy etap                                                                 |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `requestBffData`          | dominujacy mechanizm w composables domenowych: kursy, pojazdy, kursanci, szkoly, lekcje, eventy, platnosci, konto, manager | zostaje standardem dla odpowiedzi z `data`; kolejne migracje maja ograniczac `unknown` |
| `bffFetch`                | uzywany punktowo dla `DELETE`/kopert bez `data` w eventach i szczegolach instruktora                                       | zostaje, ale walidacja `{ success: true }` powinna miec jeden helper                   |
| `$bff`                    | uzywany bezposrednio w `useAuthSession`, bo sesja kontroluje reczny refresh, skip retry i aktualizacje `useState`          | zostaje w Etapie 3; nie migrowac na `requestBffData` bez osobnej zmiany sesji          |
| `useApi`                  | eksport kompatybilnosciowy bez aktywnych konsumentow domenowych                                                            | kandydat do usuniecia dopiero po potwierdzeniu auto-importow i dokumentacji            |
| `useBffApi`               | eksport reaktywny bez aktywnych konsumentow domenowych poza wrapperami                                                     | zostawic do czasu decyzji, czy jest potrzebny jako publiczny wzorzec                   |
| `externalFetch`           | brak aktywnych konsumentow domenowych                                                                                      | kandydat do usuniecia albo zostawienia tylko dla jawnie zewnetrznych integracji        |
| `useRequestFetch`         | wystepuje w pluginie `$bff`, co zachowuje cookies i kontekst SSR dla wewnetrznych wywolan BFF                              | zachowac                                                                               |
| `ManagerStudentNotes.vue` | komponent sam wywoluje `requestBffData` i normalizuje odpowiedz PATCH                                                      | pierwszy kandydat do przeniesienia requestu do `useStudentsApi`                        |

### Kontrakt uzycia transportu

Data: 2026-08-16.

| API                     | Kiedy uzywac                                                                                      | Kiedy nie uzywac                                                                       |
| ----------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `requestBffData<T>`     | domyslnie w composables domenowych dla endpointow BFF zwracajacych `{ success: true, data }`      | dla odpowiedzi bez `data`, recznej kontroli refreshu albo zewnetrznych URL-i           |
| `bffFetch<T>`           | dla pelnej koperty BFF, szczegolnie `{ success: true }` bez `data` i nietypowych statusow         | jako zwyklego zamiennika `requestBffData` przy endpointach z `data`                    |
| `$bff` / `useBffClient` | tylko gdy kod potrzebuje niskopoziomowej kontroli klienta, np. sesja i reczny `retryUnauthorized` | w komponentach UI i zwyklych composables domenowych                                    |
| `useBffApi`             | tylko jesli potrzebny jest reaktywny wrapper z `execute`, `data`, `error`, `isLoading`            | dla nowych prostych operacji domenowych, gdzie latwiej utrzymac jawne `async function` |
| `useApi` / `useApiLazy` | tymczasowa kompatybilnosc ze starszym wzorcem API                                                 | w nowym kodzie; nie rozszerzac uzyc                                                    |
| `externalFetch`         | wylacznie dla jawnie zewnetrznych absolutnych URL-i HTTP poza BFF                                 | dla wewnetrznych `/api/**`                                                             |
| surowy `$fetch`         | centralny transport, plugin `$bff`, testy                                                         | kod domenowy, komponenty, strony                                                       |
| `useRequestFetch`       | plugin `$bff` po stronie SSR, zeby zachowac cookies i kontekst requestu                           | bezposrednio w domenach aplikacji, dopoki nie ma udokumentowanego wyjatku              |
| `resolveBffEndpoint`    | infrastruktura pluginu `$bff` i kompatybilnosc                                                    | kod domenowy; endpoint ma przechodzic przez `requestBffData`, `bffFetch` albo `$bff`   |

Wniosek migracyjny:

- Standard domenowy: `requestBffData` + typowany `normalize`.
- Wyjatek domenowy: `bffFetch` tylko dla success-only albo pelnej koperty.
- Wyjatek infrastrukturalny: `$bff` w sesji do czasu Etapu 3.
- Kandydaci do redukcji: `useApi`, `useApiLazy`, `useBffApi`, `externalFetch`.
- Pierwsza migracja kodu: przeniesienie PATCH notatki kursanta z komponentu
  do `useStudentsApi`.

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

- [ ] Zapisac testy obecnego login/refresh/logout przed podzialem.
- [ ] Wyodrebnic czyste funkcje normalizacji roli.
- [ ] Wprowadzic jedno typowane zrodlo regul dostepu.
- [ ] Ujednolicic `manager`, `instructor`, `student` i warianty laczone.
- [ ] Zachowac `ADMIN` jako jawnie udokumentowany wariant uprawnien menedzera.
- [ ] Oddzielic dane demo od produkcyjnego przeplywu sesji.
- [ ] Rozdzielic transport sesji od reaktywnego stanu sesji.
- [ ] Zachowac stan przez `useState`, aby nie wyciekal pomiedzy requestami SSR.
- [ ] Dodac test macierzy rola -> dozwolona trasa.
- [ ] Dodac test powrotu na pierwotna trase po logowaniu.
- [ ] Dodac test zachowania przy 401, 403 i niedostepnym backendzie.

### Kryterium zakonczenia

Kazda regula dostepu ma jedno zrodlo prawdy, a publiczne API `useAuthSession` pozostaje male i opisane.

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

### Todo

- [x] Zapisac decyzje o publicznym API executora BFF po migracji pilotazowej.
- [ ] Zapisac docelowy podzial klienta BFF po zakonczeniu etapu 2.
- [ ] Zapisac jedno zrodlo regul rol po zakonczeniu etapu 3.
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
