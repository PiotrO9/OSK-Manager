# OSK Manager UI Component Patterns

Ten dokument opisuje docelowe wzorce komponentow UI dla redesignu OSK Managera. Nalezy go stosowac razem z `UI_REDESIGN_GUIDELINES.md`.

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

| Typ widoku | Rekomendowane wzorce |
| --- | --- |
| Pulpit managera | `PageHeader`, `SummaryStrip`, `ScheduleLayout`, `EntitySummaryCard` |
| Lista kursantow | `PageHeader`, `FilterBar`, `DataTableShell`, `StatusBadge`, `ActionGroup` |
| Szczegoly kursanta | `PageHeader`, `DetailLayout`, `EntitySummaryCard`, `DataTableShell`, `StatusBadge` |
| Lista instruktorow | `PageHeader`, `FilterBar`, `DataTableShell`, `StatusBadge`, `ActionGroup` |
| Szczegoly instruktora | `PageHeader`, `DetailLayout`, `EntitySummaryCard`, `ScheduleLayout`, `StatusBadge` |
| Harmonogram managera | `PageHeader`, `FilterBar`, `ScheduleLayout`, `StatusBadge`, `EmptyState` |
| Moje lekcje | `PageHeader`, `ScheduleLayout`, `StatusBadge`, `EmptyState` |
| Rezerwacja lekcji | `PageHeader`, `FilterBar`, `ScheduleLayout`, `EmptyState`, `LoadingState` |
| Kursy | `PageHeader`, `FilterBar`, `DataTableShell`, `StatusBadge`, `ActionGroup` |
| Pojazdy | `PageHeader`, `DataTableShell`, `EntitySummaryCard`, `StatusBadge`, `ActionGroup` |
| Platnosci | `PageHeader`, `FilterBar`, `SummaryStrip`, `DataTableShell`, `StatusBadge` |
| Opinie | `PageHeader`, `FilterBar`, `DataTableShell`, `StatusBadge` |
| Konto | `PageHeader`, `DetailLayout`, `FormSection`, `EntitySummaryCard` |
| Formularz tworzenia lub edycji | `PageHeader`, `FormSection`, `ActionGroup`, `ErrorState` |

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
