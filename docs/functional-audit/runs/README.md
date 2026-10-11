# Przebiegi audytu

**Scalenie 2026-10-11:** do tego katalogu przeniesiono brakujące przebiegi
z kopii dokumentacji w głównym katalogu workspace. Użytkownik zakwestionował
część wcześniejszych oznaczeń ręcznego zaliczenia i wskazał wprost, że
`COM-13` nie był wtedy wykonany. Historycznych plików nie nadpisano; aktualny
stan oraz informację `do potwierdzenia` podaje [checklista](../checklist.md).
Po sprawdzeniu pełnych kroków zapisz nowy przebieg.

Użytkownik [potwierdził 2026-10-11](2026-10-11-reconfirmed-manual-results.md)
wcześniejsze wyniki `COM-01`–`COM-08` i `STU-05`.
Użytkownik [potwierdził także późniejsze wykonanie `COM-13`](2026-10-11-com-13-confirmation.md).
Użytkownik [potwierdził cztery pozostałe wyniki](2026-10-11-reconfirmed-mgr-stu-ins-stu.md):
`MGR-STU-01`, `INS-03`, `STU-03` i `STU-16`.

Każdy przebieg ma osobny plik `YYYY-MM-DD-nazwa-przebiegu.md` utworzony ze wzoru
poniżej. Nie nadpisuj wcześniejszych wyników po poprawce; utwórz nowy przebieg.
Scenariusze pozostają w `../scenarios/`, zbiorczy postęp w `../checklist.md`,
a problemy w `../findings.md`. Test ręczny jest wymagany dla każdego scenariusza;
automat jest dodatkowy i opcjonalny. Historycznych przebiegów nie przepisuj na
nowy format ani nie uznawaj ich wyników automatycznych za ręczne.

## Wzór pliku przebiegu

```md
# Przebieg: YYYY-MM-DD — nazwa

- Data i osoba wykonująca:
- Wersja FE (commit):
- Wersja BE (commit):
- Środowisko / URL:
- Zestaw danych i jego wersja:
- Zakres: ścieżka podstawowa / pełny audyt / ponowny test / wskazane ID
- Konfiguracja istotna dla testu, bez sekretów:

| Scenariusz | Ręcznie (wymagane) | Automatycznie (opcjonalne) | Dowód / F-ID | Uwagi i powód braku automatu |
| ---------- | ------------------ | -------------------------- | ------------ | ---------------------------- |
| COM-...    | niewykonany        | —                          | —            | —                            |

## Podsumowanie

- Ręcznie zaliczonych / niezaliczonych / zablokowanych / niewykonanych:
- Automatycznie zaliczonych / niezaliczonych / bez wyniku / bez próby:
- Decyzja o odbiorze i uzasadnienie:
- Scenariusze wymagające powtórzenia:
```

Wyniki ręczne: `zaliczony`, `niezaliczony`, `zablokowany`, `niewykonany`.
`Zablokowany` oznacza brak możliwości wykonania testu, np. brak danych,
niedostępne środowisko lub nierozstrzygniętą regułę. Błąd aplikacji ujawniony
w wykonanych krokach oznacza wynik `niezaliczony` i wpis w `findings.md`.
Wyniki automatyczne: `zaliczony`, `niezaliczony`, `nie udało się`, `pominięty`
albo `—` (bez próby). `Nie udało się` oznacza, że automat nie dostarczył
wiarygodnego wyniku, np. przez błąd środowiska; `pominięty` oznacza świadomą
rezygnację z automatyzacji. Przy obu wpisz konkretny powód w uwagach. Błąd
aplikacji wykryty przez poprawnie działający automat oznacz `niezaliczony`.
Nie przenoś wyniku automatycznego do ręcznego. Po zakończeniu przebiegu
zaktualizuj odpowiednie wiersze w `../checklist.md` i odsyłaj z nich do przebiegu.
Zrzuty i logi przechowuj bez haseł, tokenów i danych osobowych; w tabeli podawaj
odnośniki do bezpiecznych dowodów.
