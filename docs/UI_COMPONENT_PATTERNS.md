# OSK Manager UI Component Patterns

Ten dokument opisuje docelowe wzorce komponentow UI dla odświeżania widoków OSK Managera. Nalezy go stosowac razem z `UI_REFRESH_PLAN.md`, ktory prowadzi bieżącą checklistę ekranów.

## Zasada glowna

Widoki nie powinny budowac kazdego ukladu od zera. Redesign ma stopniowo prowadzic do spojnego zestawu komponentow, ktore mozna stosowac w wielu modulach: kursanci, instruktorzy, kursy, harmonogram, pojazdy, platnosci, opinie i konto.

Komponent globalny ma sens, gdy:

- ten sam uklad pojawia sie w co najmniej dwoch widokach;
- komponent porzadkuje zlozony markup;
- komponent utrwala wspolny sposob prezentacji danych;
- komponent pomaga zachowac spojne stany loading, empty i error;
- komponent zmniejsza ryzyko rozjechania UI miedzy widokami.

Nie tworz komponentu globalnego, gdy:

- wzorzec jest unikalny dla jednego widoku;
- abstrakcja ukryje istotna logike domenowa;
- komponent mialby zbyt wiele warunkow i wariantow;
- prosty lokalny markup jest bardziej czytelny;
- komponent powstalby tylko po to, aby "posprzatac" kilka klas CSS.

## Decyzje komponentowe

Przed utworzeniem nowego komponentu odpowiedz:

1. Czy ten wzorzec pojawi sie w wiecej niz jednym widoku?
2. Czy komponent ma jasna odpowiedzialnosc?
3. Czy propsy sa domenowo zrozumiale?
4. Czy komponent obsluguje potrzebne stany: loading, empty, error, disabled?
5. Czy komponent zmniejsza duplikacje bez ukrywania waznej logiki?
6. Czy nazwa komponentu opisuje wzorzec UI, a nie tylko aktualny widok?

Preferuj nazwy opisujace wzorce, np. `PageHeader`, `FilterBar`, `DataTableShell`, `StatusBadge`, `EmptyState`, zamiast nazw powiazanych z jednym ekranem.

## Mapowanie widokow na wzorce

Stosuj ponizsze mapowanie jako punkt startowy. Konkretna implementacja moze sie roznic, ale odstepstwo powinno miec powod.

| Typ widoku                     | Rekomendowane wzorce                                                               |
| ------------------------------ | ---------------------------------------------------------------------------------- |
| Pulpit managera                | `PageHeader`, `SummaryStrip`, `ScheduleLayout`, `EntitySummaryCard`                |
| Lista kursantow                | `PageHeader`, `FilterBar`, `DataTableShell`, `StatusBadge`, `ActionGroup`          |
| Szczegoly kursanta             | `PageHeader`, `DetailLayout`, `EntitySummaryCard`, `DataTableShell`, `StatusBadge` |
| Lista instruktorow             | `PageHeader`, `FilterBar`, `DataTableShell`, `StatusBadge`, `ActionGroup`          |
| Szczegoly instruktora          | `PageHeader`, `DetailLayout`, `EntitySummaryCard`, `ScheduleLayout`, `StatusBadge` |
| Harmonogram managera           | `PageHeader`, `FilterBar`, `ScheduleLayout`, `StatusBadge`, `EmptyState`           |
| Moje lekcje                    | `PageHeader`, `ScheduleLayout`, `StatusBadge`, `EmptyState`                        |
| Rezerwacja lekcji              | `PageHeader`, `FilterBar`, `ScheduleLayout`, `EmptyState`, `LoadingState`          |
| Kursy                          | `PageHeader`, `FilterBar`, `DataTableShell`, `StatusBadge`, `ActionGroup`          |
| Pojazdy                        | `PageHeader`, `DataTableShell`, `EntitySummaryCard`, `StatusBadge`, `ActionGroup`  |
| Platnosci                      | `PageHeader`, `FilterBar`, `SummaryStrip`, `DataTableShell`, `StatusBadge`         |
| Opinie                         | `PageHeader`, `FilterBar`, `DataTableShell`, `StatusBadge`                         |
| Konto                          | `PageHeader`, `DetailLayout`, `FormSection`, `EntitySummaryCard`                   |
| Formularz tworzenia lub edycji | `PageHeader`, `FormSection`, `ActionGroup`, `ErrorState`                           |

## PageHeader

Wspolny naglowek strony powinien obslugiwac:

- tytul widoku;
- krotki opis kontekstu;
- opcjonalne akcje glowne;
- opcjonalne metadane, np. aktywna OSK, tydzien, liczba wynikow.

Stosuj dla widokow typu:

- `Kursanci`;
- `Instruktorzy`;
- `Harmonogram lekcji`;
- `Pojazdy`;
- `Kursy`;
- `Opinie`;
- `Moje lekcje`.

Zasady:

- tytul powinien jasno mowic, gdzie jest uzytkownik;
- opis ma byc krotki i praktyczny;
- akcje glowne powinny byc w prawym obszarze naglowka na desktopie;
- na mobile akcje moga zejsc pod tytul.
- glowna akcja w naglowku powinna korzystac z bazowego `UiButton` jako zrodla stylu; dopuszczalne sa tylko klasy layoutowe typu `h-*`, `w-*`, `px-*` albo responsywne dopasowanie szerokosci. Nie dopisuj lokalnie `rounded-*`, `shadow-*`, `font-*` ani marginesow ikon, bo rozbijaja wspolny wariant primary buttona.

## FilterBar

Wspolny pasek filtrow powinien grupowac kontrolki sluzace do zawwezania danych.

Typowe elementy:

- wybor OSK;
- wybor kursu;
- zakres dat;
- status;
- wyszukiwarka;
- przyciski resetu i zastosowania filtrow.

Zasady:

- filtry powinny byc wizualnie powiazane z tabela/lista, ktorej dotycza;
- nie rozrzucaj filtrow po calej stronie;
- pokazuj aktywne filtry w sposob czytelny;
- na mobile filtry moga byc w zwartej sekcji lub dialogu/sheet.

## DataTableShell

Wspolny kontener tabel danych powinien obslugiwac:

- tytul albo opis tabeli;
- toolbar z filtrami lub akcjami;
- stan loading;
- stan pusty;
- stan bledu;
- paginacje;
- akcje w wierszach.

Stosuj dla:

- listy kursantow;
- listy instruktorow;
- listy kursow;
- listy pojazdow;
- listy opinii;
- platnosci.

Zasady:

- tabele maja byc zwarte, ale czytelne;
- wazne identyfikatory i nazwy powinny byc latwe do skanowania;
- akcje w wierszu powinny miec spojny wyglad;
- statusy powinny uzywac wspolnego komponentu badge;
- kolumny na mobile powinny miec przemyslany fallback, np. lista rekordow zamiast scisnietej tabeli.

## EntitySummaryCard

Karta podsumowania encji powinna prezentowac najwazniejsze informacje o obiekcie.

Przyklady:

- kursant: imie, nazwisko, email, status procesu, aktywne kursy;
- instruktor: imie, nazwisko, kwalifikacje, dostepnosc, ocena;
- pojazd: nazwa, rejestracja, status, domyslnosc;
- OSK: nazwa, miasto, adres, ustawienia.

Zasady:

- karta nie powinna byc dekoracyjna;
- ma pomagac zrozumiec encje w kilka sekund;
- szczegoly drugorzedne powinny byc nizej albo w osobnej sekcji;
- stosuj ikony tylko tam, gdzie pomagaja w skanowaniu.

## SummaryStrip

Pasek metryk powinien pokazywac kilka kluczowych liczb bez dominowania calego widoku.

Przyklady:

- liczba aktywnych kursantow;
- lekcje w tym tygodniu;
- wolne sloty;
- pojazdy dostepne;
- opinie do sprawdzenia;
- zalegle platnosci.

Zasady:

- unikaj duzych, pustych kafelkow;
- metryki powinny byc zwarte;
- kazda metryka musi miec praktyczny sens;
- jezeli metryka nie pomaga w decyzji, nie dodawaj jej.

## StatusBadge

Statusy powinny miec wspolny komponent i wspolne mapowanie wariantow.

Typowe statusy:

- aktywny;
- nieaktywny;
- zaplanowany;
- zakonczony;
- anulowany;
- dostepny;
- niedostepny;
- oplacony;
- zalegly;
- w trakcie.

Zasady:

- nie tworz lokalnych klas statusow w kazdym widoku;
- wariant koloru musi byc konsekwentny w calej aplikacji;
- tekst statusu powinien byc krotki;
- kolor nie moze byc jedynym nosnikiem znaczenia.

## EmptyState

Pusty stan powinien byc pomocny, ale nie przegadany.

Powinien zawierac:

- krotki tytul;
- jednozdaniowy opis;
- opcjonalna akcje, jezeli uzytkownik moze cos zrobic.

Przyklady:

- brak kursantow w wybranej OSK;
- brak lekcji w tygodniu;
- brak pojazdow;
- brak opinii.

Zasady:

- nie stosuj duzych ilustracji jako domyslnego rozwiazania;
- akcja powinna byc konkretna;
- opis powinien wyjasniac stan, a nie funkcje aplikacji.

## LoadingState

Loading powinien byc spojny i stabilny layoutowo.

Preferuj:

- skeletony w ksztalcie docelowego ukladu;
- subtelne komunikaty tekstowe;
- blokowanie tylko tej sekcji, ktora faktycznie sie laduje.

Unikaj:

- przesuwania calego layoutu po zaladowaniu;
- globalnych spinnerow bez kontekstu;
- mieszania kilku stylow loadingu w jednym widoku.

## ErrorState

Bledy powinny byc widoczne blisko miejsca, ktorego dotycza.

Powinny zawierac:

- zrozumialy komunikat;
- opcjonalna akcje ponowienia;
- zachowanie bezpieczne dla danych uzytkownika.

Zasady:

- komunikat powinien mowic, co sie nie udalo;
- nie pokazuj surowych bledow technicznych, jezeli nie sa potrzebne;
- nie chowaj bledu w toastach, jezeli blokuje on prace na widoku.

## FormSection

Formularze powinny byc dzielone na logiczne sekcje.

Przyklady sekcji:

- dane podstawowe;
- dane kontaktowe;
- przypisanie do OSK;
- uprawnienia/kwalifikacje;
- ustawienia dostepnosci;
- dane pojazdu.

Zasady:

- pola powiazane biznesowo powinny byc blisko siebie;
- walidacja powinna byc widoczna przy polu;
- akcje zapisu/anulowania powinny miec stale miejsce;
- formularz w dialogu nie powinien byc zbyt dlugi, jesli lepszy jest osobny widok.

### Pola daty i czasu

W formularzach używaj nowych pickerów opisanych w [`DATE_TIME_PICKERS.md`](./DATE_TIME_PICKERS.md):

- `UiDatePicker` dla pojedynczej daty;
- `UiTimePicker` dla pojedynczej godziny;
- `UiDateTimePicker` dla jednego terminu logicznego;
- `UiDateRangePicker` dla dowolnego zakresu dat;
- `UiWeekPicker` tylko dla pełnego tygodnia w kalendarzach.

Nie dodawaj lokalnych wersji `V2`, natywnych `input[type="date"]` ani `input[type="time"]` w przebudowywanych widokach. Jeżeli formularz trzyma datę i godzinę osobno w modelu, stosuj dwa pola (`UiDatePicker` + `UiTimePicker`). Jeżeli model domenowy ma jeden termin, stosuj `UiDateTimePicker`.

## DetailLayout

Widoki szczegolow encji powinny miec wspolny uklad.

Rekomendowany uklad desktop:

- lewa/glowna kolumna: dane operacyjne, historia, listy, kursy, lekcje;
- prawa kolumna: profil encji, statusy, szybkie akcje, metadane.

Rekomendowany uklad mobile:

- sekcje jedna pod druga;
- najpierw podsumowanie i najwazniejsze akcje;
- potem szczegoly i historia.

Stosuj dla:

- szczegolow kursanta;
- szczegolow instruktora;
- szczegolow pojazdu;
- szczegolow kursu;
- widoku konta.

## ScheduleLayout

Harmonogramy sa kluczowe dla OSK Managera i powinny miec dopracowany wzorzec.

Powinny obslugiwac:

- wybor tygodnia/dnia;
- czytelna os czasu;
- rozroznienie teorii, jazd praktycznych i blokow dostepnosci;
- statusy lekcji;
- szybkie przejscie do edycji;
- dobre zachowanie na mobile.

Zasady:

- kalendarz ma byc narzedziem pracy, nie dekoracja;
- kolory wydarzen musza byc konsekwentne;
- godziny i nazwy osob powinny byc latwe do odczytania;
- puste dni nie powinny tworzyc chaosu wizualnego;
- na mobile rozwaz liste dzienna zamiast scisnietej siatki.

## ActionGroup

Akcje powinny byc grupowane wedlug waznosci.

Przyklady:

- akcja glowna: dodaj kursanta, zaplanuj lekcje, dodaj pojazd;
- akcje drugorzedne: edytuj, podejrzyj, przypisz;
- akcje destrukcyjne: usun, anuluj.

Zasady:

- jedna akcja glowna na obszar jest zwykle wystarczajaca;
- akcje destrukcyjne powinny wymagac potwierdzenia;
- ikony powinny wspierac skanowanie, nie zastepowac niejasnych akcji;
- w tabelach stosuj spojny rozmiar i ulozenie akcji.

## Responsywnosc

Kazdy wzorzec musi miec sensowny wariant mobilny.

Zasady:

- tabele z wieloma kolumnami moga zmieniac sie w liste rekordow;
- filtry moga przejsc do zwijanej sekcji albo sheet;
- akcje glowne powinny pozostac latwo dostepne;
- harmonogram moze miec osobny widok dzienny/listowy na mobile;
- tekst nie moze nachodzic na inne elementy ani wyplywac poza kontrolki.

## Kolejnosc wdrazania komponentow

Rekomendowana kolejnosc:

1. `PageHeader`
2. `StatusBadge`
3. `EmptyState`, `LoadingState`, `ErrorState`
4. `FilterBar`
5. `DataTableShell`
6. `SummaryStrip`
7. `DetailLayout`
8. `ScheduleLayout`
9. `FormSection`
10. `ActionGroup`

Ta kolejnosc pozwala najpierw ustabilizowac najbardziej widoczne i najczesciej powtarzane wzorce.

## Wariant roboczy listy CRM — W07, 2026-09-09

Wdrożony na `/manager/students`, czeka na ocenę użytkownika. Nie zastępuje jeszcze zasad wszystkich list.

- `PageHeader`: tytuł, krótki opis i jeden przycisk główny.
- Jeden panel `bg-card` łączy kontekst OSK, filtr, statystyki, rekordy i paginację. Bez powtórzonego tytułu listy i zagnieżdżonych ramek.
- Kompaktowy filtr kursu z przyciskiem czyszczenia; przy jednej szkole kontekst OSK jest tekstem, przy wielu pozostaje wybór.
- Liczniki są paskiem tekstowym: liczba wyników osobno, statystyki bieżącej strony pod wspólną etykietą. Podczas ładowania lub błędu pokazują kreskę.
- `DataTableShell`: nazwisko jako link profilu, PKK pod nazwiskiem, kontakt, `StatusBadge`, data dodania i jedna lekka akcja przypisania. Cały wiersz nie jest klikalny.
- Tabela i karty przełączają się według szerokości kontenera listy (768 px), uwzględniając sidebar. Karty mają komplet danych i osobne akcje profilu/przypisania, z wysokością przycisków 44 px.
- Zachowane współdzielone stany ładowania, błędu i pustych danych; pusty wynik filtra umożliwia jego usunięcie.
- Obowiązują Satoshi, istniejące tokeny i oba motywy. Wyszukiwarka i szybkie filtry dodane w kolejnej iteracji korzystają z danych backendu; nie dodajemy fikcyjnych statystyk.

Zakres sprawdzenia i dalsze uwagi: `UI_REFRESH_PLAN.md`, sekcja 10.

## Zasady przenoszenia W07 na kolejne widoki list, 2026-09-10

Te zasady opisują to, co z aktualnego `/manager/students` warto traktować jako roboczy wzorzec dla innych list administracyjnych. Nie kopiuj mechanicznie komponentów domenowych kursantów; przenoś układ, hierarchię i sposób rozdzielenia odpowiedzialności.

### Struktura strony

- Route page ma pozostać cienka: pobiera stan z composable, składa sekcje widoku i podpina dialogi. Logika danych, formatowanie wierszy i obsługa akcji nie powinny rosnąć bezpośrednio w `app/pages/...`.
- Górę widoku buduj jako `PageHeader` albo lokalny odpowiednik o tej samej semantyce: tytuł, krótki opis kontekstu i jedna główna akcja. Nie powtarzaj tego samego tytułu w panelu listy.
- Główna lista powinna być jednym spójnym panelem: kontekst, filtry, wyszukiwanie, statystyki, rekordy i paginacja. Unikaj osobnych, zagnieżdżonych kart dla każdego z tych elementów.
- Dialogi tworzenia/przypisania/edycji pozostają przy stronie jako część procesu, ale ich formularze i pola powinny być osobnymi komponentami.

### Filtry i wyszukiwanie

- Filtry powinny działać na realnych danych backendu albo jasno istniejącym stanie frontendu. Nie dodawaj filtra tylko dlatego, że pasuje do makiety.
- Kontekst nadrzędny, np. OSK, kurs, instruktor albo tydzień, powinien być widoczny blisko listy. Jeżeli użytkownik nie ma wyboru, pokaż tekst kontekstu zamiast sztucznego selecta.
- Wyszukiwanie, szybkie filtry i filtry zaawansowane mają resetować stronę paginacji oraz mieć jasne czyszczenie. Pusty wynik filtra powinien proponować usunięcie filtrów, nie tworzenie nowych danych.
- Zaawansowane filtry przenoś przez shell `AppAdvancedFilters`/`AppAdvancedFilterSegments` i adapter domenowy, np. analogiczny do `ManagerStudentsAdvancedFilters`. Adapter ma dostarczać pola, operatory, segmenty i edytor właściwe dla danego modułu.

### Statystyki

- Liczniki mają być pomocnicze i zwarte. Nie powinny spychać tabeli lub kart poniżej pierwszego ekranu.
- Każda metryka musi mówić, czego dotyczy: całego wyniku, aktywnej strony, wybranej OSK, tygodnia albo aktualnego filtra. Jeśli liczysz tylko bieżącą stronę, nazwij to w UI lub copy.
- Podczas ładowania, błędu albo braku wiarygodnego źródła pokaż neutralny brak wartości zamiast wymyślać liczby.
- Metryki z projektu albo propozycji UI bez pokrycia w API zapisuj jako brak/decyzję w `UI_REFRESH_PLAN.md`, nie dorabiaj ich lokalnie z niepełnych danych.

### Rekordy listy

- Desktop: używaj zwartej tabeli lub `DataTableShell`, gdzie główny identyfikator encji jest linkiem do szczegółów. Cały wiersz nie musi być klikalny, jeżeli w wierszu są osobne akcje.
- Mobile: nie ściskaj tabeli. Używaj kart rekordów z tym samym zakresem danych i osobnymi akcjami. Przyciski akcji na telefonie trzymaj w wysokości około 44 px.
- Najważniejsze dane encji pokazuj w pierwszej kolumnie lub pierwszym bloku karty; dane drugorzędne grupuj pod spodem. Avatary/inicjały w listach pokazuj przez `AppListAvatar`, żeby zachować ten sam rozmiar, koło, obramowanie i kolor w widokach kursantów, instruktorów i kolejnych listach. Jeżeli w tabeli pokazujesz osobę, np. instruktora albo kursanta, używaj układu profilu: `AppListAvatar`, nazwa jako główny tekst lub link do profilu oraz krótka rola/opis pod spodem. Nie zastępuj osoby małym badge'em ani samym `text-xs` obok inicjałów. Statusy zawsze przez wspólne badge albo wzorzec kompatybilny ze `StatusBadge`.
- Akcje w rekordzie mają być lekkie i konkretne. Główna akcja widoku należy do nagłówka, a akcje wiersza do rekordu.

### Stany i responsywność

- Zachowaj wszystkie stany: loading, error, empty, brak kontekstu nadrzędnego, pusty wynik filtra, disabled oraz saving w dialogach.
- Stany pokazuj w tym samym panelu, którego dotyczą, aby layout nie skakał i użytkownik wiedział, co dokładnie nie działa.
- Przełączanie tabela/karty powinno reagować na szerokość kontenera listy, nie tylko całego viewportu, bo sidebar zmienia realne miejsce na dane.
- Sprawdzaj desktop, mobile i szerokość pośrednią z sidebarem. Szczególnie: brak poziomego scrolla, nieucięte akcje, długie nazwiska/maile i oba motywy.

### Jak adaptować na następny widok

1. Spisz aktualny cel widoku, dane, akcje, stany i zależności routingu.
2. Wybierz odpowiedni typ: lista, szczegóły, formularz, harmonogram albo redirect.
3. Zastosuj strukturę: nagłówek → jeden panel roboczy → filtry/search/statystyki → rekordy → paginacja/stany → dialogi.
4. Zostaw różnice domenowe w adapterach, composables i komponentach feature, nie w globalnym shellu.
5. Po wdrożeniu zaktualizuj bieżącą checklistę w `UI_REFRESH_PLAN.md` i dopisz decyzje, ograniczenia oraz zakres weryfikacji przy danym widoku.
