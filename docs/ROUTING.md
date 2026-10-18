# Adresy stron aplikacji

Główne adresy są polskie. Dotychczasowe angielskie adresy pozostają obsługiwane.
Definicje znajdują się w `shared/routing/routeDefinitions.ts`, a funkcje do linków
w `shared/routing/appPaths.ts`. Przykłady: `appPaths.login()`,
`appPaths.managerCourse(courseId)`, `appPaths.vehicleEdit(vehicleId)`.
Identyfikatory przekazuje się w postaci niezakodowanej; funkcje kodują je raz.

## Dodawanie strony

1. Dodaj stronę w `app/pages` i zachowaj odpowiednie middleware/layout.
2. Dodaj do katalogu stabilny klucz, plik strony oraz wzorce EN i PL z tymi samymi
   nazwami parametrów. Dodaj odpowiednią funkcję do `appPaths.ts`.
3. Używaj funkcji adresu w menu, formularzach i przekierowaniach. Query przekazuj
   oddzielnie jako `{ path: appPaths.managerCourse(id), query: { schoolId } }`.
4. Uruchom test katalogu i testy migracji. Test pokrycia wykrywa nieujęte pliki stron.

`build/localizePages.ts` zmienia ścieżki istniejących rekordów Nuxt przez
`pages:extend`, zachowując ich nazwy i metadane. Odpowiednik drugiego języka jest
aliasem. Etykiety, ikony i nagłówki pozostają w `app/`.

## Przekierowania i sesja

`server/middleware/canonicalPageUrl.ts` przekierowuje GET/HEAD starych adresów
przed renderowaniem SSR, z HTTP 302 i `Cache-Control: private, no-store`.
`app/middleware/00.canonical-routes.global.ts` wykonuje normalizację przy
nawigacji w przeglądarce przed middleware sesji. Mapowane są tylko znane strony;
API/BFF, zasoby i nieznane ścieżki nie są tłumaczone.

Query i zwykłe fragmenty są zachowane. Cookie `auth_return_to` ze starym adresem
jest normalizowane po sprawdzeniu bezpieczeństwa. Logowanie i jego polski alias
nie mogą być celem powrotu. Role i uprawnienia pozostają przypisane do stron.

## Odzyskiwanie hasła

`/reset-password` i `/ustaw-haslo` wskazują jeden komponent ze stałym kluczem
`password-recovery`. Ta strona jest pomijana przez oba middleware normalizacji.
Po zamontowaniu odczytuje tokeny z fragmentu, następnie usuwa fragment i zmienia
adres przez `router.replace`. Stały klucz zachowuje formularz i tokeny w pamięci.

Backend używa wspólnego `passwordResetRedirect()` w procesie użytkownika
i menedżera. Przed wydaniem BE trzeba dodać `/ustaw-haslo` do dozwolonych Redirect
URLs w Supabase i zachować `/reset-password`. Trzeba również sprawdzić szablon
wiadomości. Konfiguracja usługi nie jest częścią lokalnego kodu aplikacji.

## Dwa wydania i wycofanie

`OSK_ROUTE_VARIANT` jest wejściem **builda**, domyślnie `pl`. Ta sama wartość jest
wbudowana w drzewo routera, Vite i Nitro. Zmiana środowiska uruchomionej aplikacji
nie przełącza gotowego builda.

- Wydanie A: build z `OSK_ROUTE_VARIANT=en`; oba warianty działają, główny jest EN.
- Wydanie B: build z `OSK_ROUTE_VARIANT=pl`; główny jest PL.
- Docker przyjmuje `--build-arg OSK_ROUTE_VARIANT=en` lub `pl`.

Kolejność wydania: frontend A → dozwolone callbacki Supabase → backend generujący
polski link resetu → frontend B. Zachować obraz A do wycofania. Nie wracać do obrazu
sprzed obsługi obu adresów, ponieważ użytkownicy mogą już mieć polskie linki.

## Weryfikacja

- `npm run test -- shared/routing build/localizePages app/middleware/canonical-routes`
- `npm run test:e2e:ui -- polish-routing.spec.ts` — wszystkie pary routera, SSR,
  role, powrót po logowaniu, query/hash i formularz recovery z syntetycznymi tokenami.
- `npm run test:e2e:ui -- route-compatibility.spec.ts` — zgodność wariantu w Nitro,
  SSR i przeglądarce. Dla wydania A ustaw `E2E_ROUTE_VARIANT=en`.
- Testy produkcyjne: najpierw `npm run build` dla wybranego wariantu, następnie
  `E2E_USE_PREVIEW_SERVER=true` i właściwa komenda E2E.
- Wymagane są również typecheck, lint, pełne testy jednostkowe/UI i odbiór upstream
  na wydzielonym środowisku zgodnie z `E2E_TESTING.md`.

Stan wykonania punktu i kroki wydania: [POLISH_ROUTES_DELIVERY.md](POLISH_ROUTES_DELIVERY.md).
Pełna mapa adresów: `shared/routing/routeDefinitions.ts`.
