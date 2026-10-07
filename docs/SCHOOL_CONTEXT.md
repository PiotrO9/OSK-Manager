# Kontekst ośrodka w interfejsie

W aplikacji obowiązuje jeden kompaktowy wygląd informacji o ośrodku: ikona budynku,
mała etykieta, nazwa oraz opcjonalne miasto. Adres może pojawić się pod nazwą w tym
samym układzie. W komponencie kontekstu nie ma wyszukiwarki.

## Komponenty

- `SchoolContext` (`app/components/app/ui/SchoolContext.vue`) pokazuje ośrodek.
  Przyjmuje `school`, opcjonalne `label`, `showAddress`, `loading` i `emptyLabel`.
  Nie pobiera danych ani nie zmienia aktywnej szkoły.
- `SchoolContextSelect` (`app/components/app/ui/SchoolContextSelect.vue`) pokazuje
  ten sam układ w kontrolce wyboru. Przyjmuje `schools`, `modelValue`, `id`,
  opcjonalne `label`, `disabled` i `loading`; emituje `update:modelValue` z ID.
  Rodzic obsługuje zapis wyboru, URL i ponowne pobranie danych.

W obu komponentach `school` oznacza ośrodek właściwy dla danego widoku.
Nie należy zakładać, że jest to zawsze domyślny ośrodek użytkownika.

## Etykiety i stany

- Na listach, w harmonogramie, opiniach i formularzu pojazdu używaj etykiety
  „Aktualny ośrodek”.
- Na pulpicie managera przy domyślnym ośrodku używaj „Domyślny ośrodek”.
- Na pulpicie użytkownika przy przypisanej szkole używaj „Twój ośrodek”.
- Długa nazwa jest skracana wizualnie; pełna nazwa pozostaje dostępna przez
  atrybut `title`. Miasto i adres są opcjonalne.
- Przy braku danych pokazuj komunikat o braku ośrodka. Gdy pobieranie danych
  nie powiedzie się, widok nadrzędny pokazuje istniejący `ErrorState` i akcję
  ponowienia; komponent kontekstu nie ukrywa błędu.
- Kontrolka wyboru ma etykietę dostępną dla technologii asystujących i zachowuje
  obsługę klawiatury `UiSelect`.

## Miejsca użycia

Listy kursantów, instruktorów, kursów i pojazdów używają prezentacji przy jednej
szkole oraz selektora, gdy dostępnych jest kilka szkół. Formularz dodawania pojazdu
używa prezentacji z adresem. Pulpity managera i użytkownika używają właściwej
etykiety. Harmonogram managera i filtr opinii korzystają z tego samego selektora.
Przykład interaktywny znajduje się w sekcji „Stany i formularze” na `/design-system`.

## Zasada wdrażania w kolejnych widokach

Przekazuj istniejący obiekt `DrivingSchool` i bieżące ID z logiki strony.
Nie twórz osobnego globalnego stanu szkoły dla samej prezentacji. Wyszukiwanie,
filtrowanie innych danych i pola przypisujące użytkownika do szkoły są osobnymi
kontrolkami widoku. Nowe użycie sprawdź przy jednej i wielu szkołach, przy braku
danych, długiej nazwie, na telefonie, w ciemnym motywie oraz z klawiaturą.
