# Wyrównanie rozmiarów kontrolek formularzy

- [x] Implementacja wspólnej geometrii pól i migracja konsumentów — 2026-11-01.

Inputy, selecty i pickery korzystają ze wspólnego `controlSize`:

| Wariant   | Poniżej 640px | Od 640px |
| --------- | ------------- | -------- |
| `default` | 44px          | 40px     |
| `touch`   | 44px          | 44px     |
| `compact` | 44px          | 36px     |
| `sm`      | 32px          | 32px     |

Usunięto konflikt warunkowych wysokości selectów z lokalnymi klasami. Migracja
obejmuje formularze, toolbary, filtry zaawansowane, operacyjne kontrolki list,
przypisanie instruktora, daty płatności oraz odpowiadające im przyciski zapisu.
Panele daty, czasu, zakresu i tygodnia mieszczą się także w viewport 320px.

Zachowano większy kontekst OSK, geometrię logowania, pola wieloliniowe,
uploady, selektory wewnętrzne kalendarza i wyświetlacz zegara. Modele danych,
uprawnienia, kontrakty API i domyślne rozmiary przycisków akcji pozostają bez zmian.

Standard: [COMPONENTS.md](COMPONENTS.md#rozmiary-pól-formularzy),
[DATE_TIME_PICKERS.md](DATE_TIME_PICKERS.md#rozmiary-i-szerokości).
Przykłady wszystkich wariantów znajdują się na `/system-projektowy`.

## Weryfikacja

Pierwotna weryfikacja katalogu roboczego: 1060 testów jednostkowych i 3
oczekiwane niepowodzenia, 87 testów UI na lokalnym produkcyjnym buildzie
z adapterem mock, typecheck, lint, formatowanie i build.
Końcowy skan obejmował 430 plików Vue i 175 deklaracji w 66 plikach.

Przed commitem sprawdzono osobno wyłącznie 48 plików tej zmiany na bazie
aktualnego `HEAD`, bez siedmiu wcześniejszych zmian roboczych. Zaliczone:
1056 testów jednostkowych i 3 oczekiwane niepowodzenia (193 pliki testowe),
14/14 testów UI wymiarów i płatności na produkcyjnym buildzie z adapterem mock,
typecheck, lint, formatowanie i build. Różnica liczby testów jednostkowych wynika
z wyłączenia wcześniejszych zmian auth i telemetrii.

Publikacja nie stanowi potwierdzenia odbioru na środowisku docelowym.

## Osobna blokada odbioru

Istniejący routing `/menedzer/kursy/:id/edytuj` pokazuje szczegóły zamiast
formularza edycji: rodzic `app/pages/manager/courses/[id].vue` nie renderuje
`NuxtPage` dla dziecka `[id]/edit.vue`. Pliki routingu nie należą do tej zmiany.
Współdzielone pola zostały zmigrowane, a odbiór samego ekranu edycji należy
powtórzyć po osobnej naprawie routingu.
