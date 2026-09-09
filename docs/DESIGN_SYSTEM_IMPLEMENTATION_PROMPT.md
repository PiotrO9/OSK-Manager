# Prompt do przyszlej implementacji design systemu

Status: do uruchomienia po zatwierdzeniu. Utworzenie tego dokumentu nie jest zgoda na implementacje.

---

Przebuduj design system OSK Manager zgodnie z `docs/DESIGN_SYSTEM_REBUILD_PLAN.md`. Pracuj w repozytorium `FE/OSK-Manager-FE`. Przeczytaj caly plan oraz aktualne zasady w `docs/UI_COMPONENT_PATTERNS.md`, `docs/UI_REDESIGN_IMPLEMENTATION_PLAN.md` i specyfikacje dotykanych widokow. Plan jest mapa zakresu, a aktualny kod i typy domenowe sa zrodlem prawdy o funkcjonalnosci.

## Cel

Zbuduj dzialajacy `/design-system` dopasowany do CRM dla szkoly jazdy. To ma byc zestaw rzeczywistych, ponownie uzywalnych komponentow oraz interaktywnych przykladow na danych testowych, nie statyczne makiety i nie katalog dekoracyjnych kart.

Uzyj wybranego lokalnego Satoshi i zaakceptowanej palety Cobalt + Graphite + Orange z `/palette-test`. Nie dodawaj wyboru fontu ani nowej palety. Zachowaj jasny i ciemny motyw oraz subtelne zaakceptowane statusy.

## Najpierw audyt

1. Sprawdz git status i zachowaj cudze oraz niezalezne zmiany.
2. Potwierdz istnienie i kontrakty komponentow wymienionych w planie. Oznacz: uzyc bez zmian, rozszerzyc kompatybilnie, wydzielic prezentacje, nowy element.
3. Sprawdz `nuxt.config.ts`, globalne tokeny, `useDarkMode`, portale i polityke autoryzacji tras.
4. Pokaz krotka kolejnosc prac. Nie zaczynaj od przepisywania calej aplikacji ani reinstalacji komponentow shadcn.

## Co zrealizowac

- Nawigacja po sekcjach Fundamenty, Akcje, Formularze, Dane, Harmonogram, Komunikaty, Wzorce ekranow. Wybor w `?section=...`; responsywny layout wedlug planu.
- Wspolne tokeny Satoshi, kolorow i light/dark, typografii oraz standard/compact. Najpierw opt-in dla design systemu i palety. Obsluz portale oraz SSR; nie wprowadzaj drugiego konkurencyjnego systemu motywu.
- Rzeczywiste warianty i stany komponentow z tabel w planie. Nie myl wygladu przycisku ze stanem loading lub disabled.
- Cztery kompletne przyklady: lista kursantow, profil kursanta, rezerwacja jazdy i platnosci. Uzyj istniejacych komponentow domenowych i lokalnych fixture zgodnych z typami.
- Filtry, paginacja, wybor, walidacja, dialogi i reset przykladow maja dzialac. Nie podlaczaj demonstracji do domenowego odczytu/zapisu API; zachowaj standardowe sprawdzenie sesji middleware.
- Harmonogram ma pokazywac czytelne male bloki bez polegania na 9-10 px tekstach. Pelne dane pozostaja dostepne w szczegole i przez klawiature.
- Aktualne dokumenty komponentow i zasad doprowadz do zgodnosci z wykonanym zakresem.

## Reuse i architektura

Zachowaj Nuxt/Vue Composition API z `<script setup lang="ts">`, istniejace shadcn-vue/Reka UI, Tailwind i Lucide. Plik strony pozostaje miejscem skladania sekcji. Logika domenowa nie trafia do komponentow bazowych.

Ponownie wykorzystaj PageHeader, FilterBar, DataTableShell, StatusBadge, SummaryStrip, FormSection, ActionGroup i istniejace stany. Rozwijaj Section\* zamiast tworzyc ich drugie kopie. Osadzaj aktualne prymitywy UiButton/UiInput/UiSelect/UiDialog i pozostale z planu. Nie zastepuj ich surowym HTML tylko po to, aby uzyskac podobny wyglad.

Przy komponentach z I/O wykorzystaj ich prezentacyjne dzieci lub wydziel czysta warstwe uzywana w obu miejscach. Nie montuj ManagerLessonBookingDialog z prawdziwym API jako przykladu. Nie dodawaj uniwersalnego demo-mode do calej aplikacji.

Zachowuj kompatybilnosc obecnych propsow/eventow/slotow. Nie buduj abstrakcji bez realnego powtorzenia. Brakujace prymitywy wyboru z wyszukiwaniem oprzyj na istniejacych wzorcach i Reka; nie implementuj od zera zarzadzania focusem.

## Ograniczenia

- Nie zmieniaj backendu, routingu biznesowego, middleware, uprawnien ani modeli statusow.
- Nie wdrazaj nowego wygladu na wszystkich ekranach CRM w tym zadaniu. Pozniejsza migracja jest osobnym etapem.
- Nie usuwaj funkcjonalnosci ani danych, aby dopasowac ekran do mockupu.
- Nie traktuj przykladow przyszlych filtrow czy akcji zbiorczych jako zgody na dodanie ich do produkcyjnych procesow.
- Nie dodawaj fikcyjnych danych do rzeczywistych stron; fixture tylko w design systemie/testach.
- Nie tworz sekcji jako kart wewnatrz kart, hero, marketingowych opisow ani dekoracyjnych gradientow. Tekst UI po polsku, opisujacy zadanie i dane.
- Nie uruchamiaj frontendu na porcie 3001: to backend. Uzyj istniejacego serwera na 3000; gdy nie dziala, sprawdz zajetosc portow przed uruchomieniem. Nie zatrzymuj obcych serwerow.
- Bez commita, pushu i deployu bez osobnego polecenia.

## Kolejnosc i akceptacja

Realizuj etapy 0-6 z planu, konczac kazdy dzialajacym fragmentem. Nie generuj najpierw pustego drzewa wszystkich planowanych plikow.

Przed zakonczeniem wykonaj checklisty z sekcji 10 planu: lint, typecheck, testy, build, przegladarka desktop/tablet/mobile, oba motywy, portale, focus, dlugie teksty, kontrast i brak domenowych requestow. Sprawdz, ze Satoshi naprawde sie laduje. Dodaj testy zgodne z ryzykiem zmian wspolnych komponentow; nie deklaruj sukcesu bez wynikow.

Jesli brakuje bezpiecznej sesji testowej, nie omijaj auth. Zweryfikuj pozostala czesc i opisz konkretne blokady testow. Oddziel zastane problemy od wprowadzonych regresji.

Na koniec przedstaw: wykonane sekcje, wykorzystane/rozszerzone komponenty, nowe pliki, wyniki weryfikacji, pozostale ograniczenia i adres uruchomionego design systemu. Zatrzymaj sie przed globalna migracja ekranow CRM.
