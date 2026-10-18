# Getting Started

Krótka ścieżka uruchomienia frontendu OSK Manager lokalnie.

## Requirements

- Node.js zgodny z wersją używaną przez projekt
- npm
- Backend OSK Manager lub tryb mock BFF

## Install

```bash
npm install
```

## Environment

Skopiuj `.env.example` do `.env` i ustaw wartości dla lokalnego środowiska:

```bash
NUXT_API_UPSTREAM=http://localhost:4000
NUXT_BFF_ADAPTER=
NUXT_PUBLIC_API_BASE=http://localhost:4000
NUXT_PUBLIC_SITE_URL=
```

`NUXT_PUBLIC_SITE_URL` może pozostać puste lokalnie. W build/deploy ustaw realny publiczny adres HTTPS aplikacji.

## Development

```bash
npm run dev
```

Domyślnie aplikacja działa pod [http://localhost:3000](http://localhost:3000).

## Production Build

```bash
$env:NUXT_PUBLIC_SITE_URL = "https://twoj-publiczny-adres.example"
npm run build
```

Bez `NUXT_PUBLIC_SITE_URL` moduły SEO mogą ostrzegać o niepełnej konfiguracji site URL.

## Main Routes

| Route                    | Description                     |
| ------------------------ | ------------------------------- |
| `/`                      | Pulpit aplikacji                |
| `/logowanie`             | Logowanie                       |
| `/pojazdy`               | Pojazdy                         |
| `/menedzer/osrodki`      | Zarządzanie OSK                 |
| `/menedzer/instruktorzy` | Instruktorzy                    |
| `/menedzer/kursy`        | Kursy                           |
| `/menedzer/harmonogram`  | Harmonogram OSK                 |
| `/moje-kursy`            | Kursy zalogowanego kursanta     |
| `/moje-lekcje`           | Lekcje zalogowanego kursanta    |
| `/moje-oplaty`           | Płatności zalogowanego kursanta |
