# Marketing Agent - Server

Backend serwera do analizy marketingowej stron internetowych.

## Architektura

- **Express** - serwer HTTP
- **Prisma** - ORM dla SQLite
- **OpenAI** - generowanie strategii marketingowych
- **Playwright** - scraping stron

## Uruchomienie

```bash
# Zainstaluj zależności
npm install

# Skonfiguruj bazę danych
npm run db:push

# Uruchom serwer
npm run dev
```

Serwer nasłuchuje domyślnie na porcie **3001**.

## Endpointy API

### `GET /health`
Sprawdzenie stanu serwera.

**Odpowiedź:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-21T10:00:00.000Z"
}
```

### `POST /api/project/analyze`
Uruchomienie analizy marketingowej dla podanej domeny.

**Body:**
```json
{
  "domain": "https://example.com"
}
```

**Odpowiedź (sukces):**
```json
{
  "success": true,
  "message": "Analiza zakończona pomyślnie",
  "projectId": 1
}
```

**Odpowiedź (błąd):**
```json
{
  "error": "Błąd serwera",
  "message": "Szczegóły błędu..."
}
```

## Zmienne środowiskowe

Stwórz plik `.env` w katalogu `apps/server`:

```env
# OpenAI API Key (wymagany)
OPENAI_API_KEY=sk-...

# Port serwera (opcjonalny, domyślnie 3001)
PORT=3001

# Database URL (Prisma)
DATABASE_URL="file:./prisma/dev.db"
```

## Przepływ danych

1. Frontend wysyła POST `/api/project/analyze` z `domain`
2. Serwer uruchamia `runOrchestrator(domain)`
3. Orkiestrator:
   - Normalizuje URL (dodaje protokół jeśli brak)
   - Sprawdza czy projekt istnieje w bazie
   - Jeśli nie ma - scrapuje stronę
   - Wysyła dane do OpenAI
   - Zapisuje wyniki (audit, strategy, roadmap) w bazie
4. Serwer zwraca odpowiedź z `projectId`
5. Frontend odświeża stronę, ładując dane z bazy
