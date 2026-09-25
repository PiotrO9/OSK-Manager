# Walidacja dostępności terminarza

Dokument opisuje frontendową integrację formularzy z mechanizmem dostępności
terminarza. Źródłem prawdy dla reguł biznesowych pozostaje backend. Frontend
wykorzystuje podgląd dostępności do poprawy UX, ale nie zastępuje nim walidacji
wykonywanej podczas zapisu.

## Zakres

Mechanizm jest używany w następujących przepływach:

| Intent             | Przepływ                                                         |
| ------------------ | ---------------------------------------------------------------- |
| `event_create`     | Dodawanie bloku instruktora i tworzenie wydarzenia teoretycznego |
| `event_edit`       | Edycja wydarzenia instruktora                                    |
| `lesson_create`    | Rezerwacja lekcji przez managera                                 |
| `lesson_edit`      | Edycja istniejącej lekcji                                        |
| `lesson_self_book` | Samodzielna rezerwacja lekcji przez kursanta                     |

Zmiana uczestników wydarzenia teoretycznego ma osobny preflight:
`POST /api/events/:eventId/students/availability-check`.

## Dlaczego są dwa endpointy

### `POST /api/schedule/availability-options`

Endpoint pobiera możliwe warianty dla wybranego dnia i zasobów. Zwraca:

- dozwolone godziny rozpoczęcia,
- dozwolone godziny zakończenia dla każdego początku,
- krok minutowy pickera,
- minimalny i maksymalny czas trwania,
- opcjonalną listę pojazdów mających co najmniej jeden dostępny termin.

Opcje służą do ograniczenia interfejsu. Niedostępne godziny są blokowane, a
pojazdy bez wolnego terminu pozostają widoczne, lecz nie można ich wybrać.

Endpoint obsługuje `event_create`, `event_edit` i `lesson_edit`. Rezerwacje
lekcji korzystają z wcześniej wybranego slotu i wykonują dokładny preflight.

### `POST /api/schedule/availability-check`

Endpoint sprawdza jeden kompletny kandydat: datę, początek, koniec i wymagane
zasoby. Odpowiedź zawiera `available`, listę `issues` oraz politykę długości.

W formularzach korzystających z `availability-options` automatyczny check jest
wyłączony przez `auto: false`. Dokładny check jest wykonywany przed zapisem,
dzięki czemu każda zmiana pola nie powoduje dwóch równoległych requestów.

Operacja zapisu na backendzie ponownie sprawdza reguły. Wynik preflightu może
się zdezaktualizować, jeżeli inny użytkownik zajmie termin.

## Przepływ danych

```text
formularz Vue
  -> useScheduleAvailabilityOptions / useScheduleAvailabilityCheck
  -> Nuxt BFF /api/schedule/*
  -> backend /schedule/*
  -> wspólne reguły domenowe
```

Warstwa BFF:

- waliduje podstawowy kształt body,
- przekazuje sesję i autoryzację do backendu,
- normalizuje odpowiedź do formatu używanego przez composables,
- nie implementuje reguł dostępności.

## Composables

### `useDebouncedAbortableRequest`

Wspólna warstwa obsługi zapytań asynchronicznych:

- opóźnia automatyczne zapytanie o skonfigurowany debounce,
- anuluje poprzedni request przez `AbortController`,
- ignoruje spóźnione odpowiedzi starszych requestów,
- czyści request przy zniszczeniu scope,
- udostępnia stany `idle`, `loading`, `success` i `error`.

### `useScheduleAvailabilityOptions`

Automatycznie reaguje na kompletny `candidate`. Domyślny debounce wynosi 150
ms. Zwrócone opcje powinny być jedynym zdalnym źródłem ograniczeń pickera.

### `useScheduleAvailabilityCheck`

Mapuje wynik requestu na stany `idle`, `checking`, `available`, `unavailable`
i `error`. Domyślny debounce wynosi 250 ms. `recheck()` pozwala wykonać
sprawdzenie bezpośrednio przed zapisem.

Pozytywny wynik nie wymaga komunikatu tekstowego. Interfejs powinien pokazywać
loader podczas sprawdzania oraz komunikaty wyłącznie dla problemów lub błędów.

## Zachowanie formularza

1. Formularz buduje jawny `intent`; znaczenie pól nie jest zgadywane po ich
   nazwach.
2. Zmiana daty, instruktora, pojazdu, kursu lub typu odświeża zależne opcje.
3. Gdy dzień nie ma dostępnych godzin, pola początku i końca są czyszczone.
4. Gdy nowy dzień ma dostępne godziny, formularz wybiera najwcześniejszy
   poprawny przedział.
5. Godzina zakończenia zależy od początku i polityki długości szkoły.
6. Pojazd nieuwzględniony w `availableVehicleIds` jest wyszarzony.
7. Przycisk zapisu jest blokowany podczas ładowania oraz przy znanym konflikcie.
8. Bezpośrednio przed zapisem wykonywany jest `recheck()`, jeżeli formularz
   korzysta z dokładnego preflightu.
9. Błąd zapisu zachowuje dane formularza, aby użytkownik mógł poprawić konflikt.

## Czas

Użytkownik wybiera polską datę i godzinę. Kontrakt dostępności przesyła:

```text
date: YYYY-MM-DD
startTime: HH:mm
endTime: HH:mm
```

Strefa aplikacji jest stała: `Europe/Warsaw`. Helper
`app/utils/date/polishScheduleTime.ts` odpowiada za konwersję pomiędzy lokalnym
czasem formularza i ISO wymaganym przez starsze kontrakty zapisu. Nie należy
budować dat przez dopisywanie `Z` ani używać niejawnej strefy przeglądarki.

## Dodawanie kolejnego formularza

1. Dodaj jawny intent do typów `ScheduleAvailabilityRequest` lub
   `ScheduleAvailabilityOptionsRequest`.
2. Zbuduj computed `candidate`, które zwraca `null`, dopóki nie ma wymaganych
   danych.
3. Użyj `useScheduleAvailabilityOptions`, jeżeli picker ma blokować niemożliwe
   wybory.
4. Użyj `useScheduleAvailabilityCheck` do dokładnego preflightu.
5. Przy połączeniu obu composables ustaw `auto: false` dla checku i uruchamiaj
   `recheck()` przed zapisem.
6. Zmapuj kody `issues` na konkretne pola, nie na jeden ogólny alert.
7. Zachowaj serwerową walidację w operacji zapisu.
8. Dodaj testy zmiany zależnych pól, anulowania requestów i konfliktu przy
   zapisie.

## Testy

Najważniejsze testy znajdują się przy composables formularzy oraz w:

- `app/composables/schedule/useScheduleAvailabilityCheck.test.ts`,
- `app/composables/schedule/useScheduleAvailabilityOptions.test.ts`,
- `server/utils/schedule/scheduleAvailabilityBff.test.ts`,
- `server/utils/schedule/parseScheduleAvailabilityCheck.test.ts`,
- `server/utils/schedule/parseScheduleAvailabilityOptions.test.ts`.

Pełna weryfikacja frontendu:

```bash
npm run test
npm run typecheck
npm run build
```
