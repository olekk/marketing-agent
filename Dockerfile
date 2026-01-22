FROM mcr.microsoft.com/playwright:v1.57.0-jammy

WORKDIR /app

# 1. Kopiujemy pliki konfiguracyjne z głównego katalogu
COPY package.json package-lock.json tsconfig.json ./

# 2. Kopiujemy package.json serwera, zachowując strukturę katalogów
COPY apps/server/package.json apps/server/package.json

# 3. Instalujemy wszystkie zależności (dla całego monorepo - najbezpieczniej)
RUN npm install

# 4. Instalujemy przeglądarkę dla Playwrighta
RUN npx playwright install chromium

# 5. WAŻNE: Kopiujemy folder PRISMA (bez tego nie zadziała baza Postgres)
COPY apps/server/prisma apps/server/prisma

# 6. Generujemy klienta Prisma (żeby TypeScript wiedział jak gadać z bazą)
# Musimy wejść do katalogu serwera, żeby prisma znalazła schema.prisma
RUN cd apps/server && npx prisma generate

# 7. Kopiujemy kod źródłowy serwera
COPY apps/server/src apps/server/src

EXPOSE 3001

# 8. Start:
# a) Wchodzimy do folderu serwera
# b) Wypychamy zmiany do bazy danych (db push) - to utworzy tabele w Postgresie na Railway
# c) Uruchamiamy serwer
CMD ["sh", "-c", "cd apps/server && npx prisma db push && npx ts-node src/server.ts"]