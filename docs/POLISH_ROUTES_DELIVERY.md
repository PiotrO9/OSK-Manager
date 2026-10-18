# Punkt 11 — polskie adresy podstron

- [x] Implementacja punktu „Przetłumaczenie routingów aplikacji na język polski”.
- [x] Katalog 37 stron; zmieniono 36 adresów, `/` pozostaje bez zmian.
- [x] Wspólne funkcje adresów w menu, linkach, formularzach i obsłudze sesji.
- [x] Zgodność dotychczasowych adresów: aliasy oraz przekierowania 302 bez cache.
- [x] Zachowanie parametrów tras, query i fragmentów podczas normalizacji URL.
- [x] Obsługa powrotu po logowaniu i obu wariantów linków recovery.
- [x] Wspólny generator polskiego callbacku w dwóch procesach resetu w BE.
- [x] Testy jednostkowe i przeglądarkowe oraz aktualizacja dokumentacji.
- [x] Wariant builda `en` do wydania zgodności i docelowy `pl`.

## Zakres commitów

Zmiany wydzielono na bazach FE `58d0f12` i BE `2325592`, a przed publikacją
przeniesiono na aktualne gałęzie: FE `9050ac7` i BE `a54c3cb`.
Z plików współdzielonych z innymi zadaniami wydzielono tylko zmiany tego punktu.
Parametry zapytań i logika domenowa pozostają zgodne z bazą tych commitów.
Nie włączono równoległych zmian kategorii pojazdów, płatności, ustalania ośrodka
ani niezwiązanych zmian logów bezpieczeństwa.

Weryfikacja wydzielonej wersji: 983 testy FE, produkcyjny build i 58 testów UI
przechodzą (w tym 9 testów migracji). Po aktualizacji baz przechodzi 998 testów FE
i 526 testów BE. Testy produkcyjne odnoszą się do wersji przed aktualizacją baz.

Weryfikacja wydzielonej wersji jest opisana w komunikatach commitów oraz lokalnym
raporcie `docs/POLISH_ROUTES_IMPLEMENTATION_PLAN.md` w nadrzędnym katalogu projektu.
Globalny plik pomysłów znajduje się poza repozytoriami FE/BE; ten dokument zawiera
wersjonowane potwierdzenie wykonania wyłącznie punktu 11.

## Kroki wydania

- [x] Użytkownik zatwierdził wysłanie na `master` FE i `main` BE z automatycznym wdrożeniem.
- [ ] Wdrożyć frontend docelowy `OSK_ROUTE_VARIANT=pl`, który obsługuje również stare aliasy.
- [ ] Dodać `/ustaw-haslo` do Redirect URLs Supabase, zachować `/reset-password`
      i sprawdzić szablony wiadomości.
- [ ] Wdrożyć backend generujący polskie linki oraz sprawdzić rzeczywiste
      wiadomości resetu z obu procesów na izolowanym środowisku.
- [ ] Wykonać odbiór po wdrożeniu obu aplikacji.

Wariant `en` pozostaje dostępny do kontrolowanego wycofania kanonicznych adresów.
Szczegóły mechanizmu, testów i konfiguracji: [ROUTING.md](ROUTING.md).
