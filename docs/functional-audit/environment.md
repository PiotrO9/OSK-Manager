# Lokalne środowisko audytu

Przebieg z 2026-10-08 używa katalogu `../../tools/audit-local-stack/` jako osobnego
projektu Supabase CLI. Skrypty odmawiają pracy, jeśli DB i API nie wskazują
`127.0.0.1` lub `localhost` na portach `54322` i `54321`. Nie używają pliku
`BE/.env` wskazującego współdzielony projekt DEV.

## Uruchomienie na tym komputerze

Wymagane są Docker, Node.js 24.11+ i zależności zainstalowane w `BE` oraz
`FE/OSK-Manager-FE`. Z katalogu głównego repozytorium FE uruchom kolejno:

```powershell
npx --yes supabase start --workdir tools/audit-local-stack --exclude realtime,imgproxy,postgres-meta,studio,edge-runtime,logflare,vector,supavisor
volta run --node 24.21.0 node tools/audit-local-stack/bootstrap.mjs
volta run --node 24.21.0 npm run build --prefix ../../BE
```

`bootstrap.mjs` stosuje migracje Prisma tylko do zweryfikowanej lokalnej bazy.
Następnie można wykonać pojedynczy przebieg. Każdy skrypt odtwarza wskazany
zestaw w lokalnej bazie aplikacji, więc uruchamiaj je **pojedynczo**:

```powershell
volta run --node 24.21.0 node tools/audit-local-stack/run-smoke.mjs
volta run --node 24.21.0 node tools/audit-local-stack/run-audit.mjs manager-only manager-osk-audit.spec.ts
volta run --node 24.21.0 node tools/audit-local-stack/run-audit.mjs booking-ready booking-audit.spec.ts
volta run --node 24.21.0 node tools/audit-local-stack/run-audit.mjs payment-ready payment-audit.spec.ts
volta run --node 24.21.0 node tools/audit-local-stack/run-audit.mjs school-operational role-access-audit.spec.ts
volta run --node 24.21.0 node tools/audit-local-stack/run-audit.mjs school-operational login-validation-audit.spec.ts
```

Przed podsumowaniem zapisz wynik każdego uruchomienia w nowym pliku `runs/`.
Skrypty pobierają klucze lokalne z `supabase status`, przekazują je procesom
testowym bez wypisywania i kończą pracę własnego backendu. Nie kopiuj logu
startowego Supabase ani danych logowania do repozytorium.

Po pracy zatrzymaj wyłącznie ten projekt:

```powershell
npx --yes supabase stop --workdir tools/audit-local-stack
```

Warianty `clear` i pozostałe presety można sprawdzić przez
`tools/audit-local-stack/validate.mjs`; skrypt zastępuje dane aplikacji wielokrotnie
i jest przeznaczony tylko dla tego lokalnego projektu.
