# Czytelne nazwy w kodzie

Stosuj nazwy, które określają rolę wartości w danym kontekście. Nazwa powinna
pomagać przy czytaniu funkcji bez śledzenia deklaracji przez cały plik.

## Zasady

- Dla identyfikatorów podawaj rodzaj encji: `schoolId`, `studentProfileId`,
  `vehicleId`. Gdy wartość jest już przetworzona, zaznacz to: `trimmedSchoolId`.
- Rozróżniaj kolekcję i element: `vehicles` / `vehicle`, `courseParticipants` /
  `courseParticipant`. Dla wyniku wyszukiwania używaj nazwy wskazującej rolę,
  np. `currentVehicleIndex`.
- Nazwy licznika żądań powinny wskazywać mechanizm: `fetchSequence` i lokalne
  `requestSequence`. Podczas zmiany nazwy zachowaj wszystkie porównania
  odrzucające spóźnione odpowiedzi oraz unieważnienie przy odmontowaniu.
- W parserach rozdzielaj dane wejściowe od wyniku, np. `registrationNumberRaw`
  i `registrationNumber`, `dateText` i `parsedDate`.
- Krótkie nazwy o oczywistym znaczeniu w małym zakresie (`id`, indeks `i`,
  `url`, `db`) są dozwolone. Nie rozwijaj ich automatycznie.

## Granice refaktoryzacji

Nie zmieniaj nazwy pola JSON, parametru adresu URL, klucza zwracanego obiektu,
ścieżki, wartości enum, modelu Prisma ani pliku generowanego tylko dlatego, że
nazwa wydaje się krótka. To może być publiczny kontrakt. Zmiana kontraktu wymaga
osobnej decyzji i migracji. W samym kodzie można użyć opisowego aliasu, np.
`const student = courseParticipant.student`, zachowując klucze odpowiedzi.

Zmieniaj nazwy w małych partiach według modułu. Przed edycją sprawdź odwołania
w repozytorium, po edycji uruchom właściwe testy, `npm run typecheck` i
`npm run lint`. Dla zmian w normalizatorach lub parserach sprawdź pełny kształt
odpowiedzi testem kontraktu.

## Inwentaryzacja z 2026-10-07, aktualizacja 2026-10-08

| Moduł                                                         | Przykłady                         | Ryzyko                                 | Stan                                                |
| ------------------------------------------------------------- | --------------------------------- | -------------------------------------- | --------------------------------------------------- |
| Pojazdy: listy, edycja, API, normalizacja, BFF                | `sid`, `seq`, `s`, `o`, `n`       | Średnie: wyścigi żądań i mapowanie API | Poprawiono nazwy lokalne                            |
| Kursy: lista menadżera                                        | `sid`, `seq`                      | Średnie: wyścigi żądań                 | Poprawiono                                          |
| Kursanci: lista menadżera                                     | `sid`, `seq`                      | Średnie: wyścigi żądań i paginacja     | Poprawiono                                          |
| Instruktorzy: lista menadżera                                 | `sid`, `seq`                      | Średnie: wyścigi żądań                 | Poprawiono                                          |
| Harmonogram: pobieranie tygodnia                              | `sid`, `seq`                      | Średnie: anulowanie żądań              | Poprawiono                                          |
| Logowanie: przekierowanie i dane demo                         | `raw`, `landing`, `creds`         | Niskie: lokalne wartości               | Poprawiono                                          |
| Composables kursów, kursantów, instruktorów, lekcji i zdarzeń | `sid`, `seq`, `uid`               | Średnie: wyścigi żądań                 | Poprawiono lokalne identyfikatory i liczniki        |
| Normalizatory danych oraz parsery BFF                         | `o`, `r`, `v`, `n`                | Średnie: serializacja                  | Poprawiono nazwy lokalne; pola odpowiedzi zachowano |
| Widoki i główne mocki                                         | `sid`, `uid`, `seq`, `g`, `r`     | Średnie: reaktywność i fixture testowe | Poprawiono nazwy lokalne                            |
| API, routing i typy generowane                                | nazwy pól odpowiedzi i parametrów | Wysokie: kontrakty zewnętrzne          | Bez automatycznego przemianowania                   |

Skan kodu aplikacyjnego po zmianach nie wykazuje już lokalnych wystąpień
`sid`, `uid`, `iid`, `pid`, `cp` ani `seq` poza testami. Pozostałe krótkie nazwy
w małym zakresie (np. części daty, indeksy i parametry porównania) oceniamy
zgodnie z zasadą wyjątków powyżej, bez masowego przemianowywania.

Nie wprowadzamy globalnej reguły ESLint `id-length`: zgłaszałaby także poprawne
`id`, `db`, indeksy pętli i pola kontraktów. Niniejszy dokument oraz przegląd
zmian są na tym etapie dokładniejsze. Jeśli w przyszłości pojawi się reguła
statyczna, ogranicz ją do konkretnych wzorców i najpierw sprawdź liczbę
fałszywych alarmów.
