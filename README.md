# Warhammer Marketplace

Pełnostackowa aplikacja marketplace dla figurek Warhammer z systemem wymiany przedmiotów.

## Architektura

- **Backend**: Node.js + TypeScript + Express + Drizzle ORM + Turso (SQLite)
- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS + Zustand + React Query + shadcn/ui
- **Baza danych**: Turso (LibSQL) - rozproszona baza danych SQLite

## Funkcjonalności

### Backend API
- ✅ CRUD operacje na wymianach (trades)
- ✅ System propozycji z akceptacją/odrzuceniem
- ✅ Walidacja z Zod
- ✅ Logowanie z Pino
- ✅ Obsługa transakcji z blokowaniem przedmiotów

### Frontend
- ✅ 3-kolumnowy layout responsywny (basket | filtry | inventory/proposals)
- ✅ Koszyk z maksymalnie 12 przedmiotami
- ✅ Zaawansowane filtry z kolorami i kategoriami
- ✅ Grid przedmiotów z wyszukiwaniem i sortowaniem
- ✅ Modal szczegółów propozycji
- ✅ Paski statusu z odliczaniem czasu
- ✅ Ciemny motyw domyślny

## Instalacja i uruchomienie

### 1. Przygotowanie środowiska

```bash
# Sklonuj projekt
git clone <repository-url>
cd minitrade

# Zainstaluj zależności root (Drizzle tools)
pnpm install
```

### 2. Konfiguracja bazy danych

1. **Utwórz konto Turso**: [turso.tech](https://turso.tech)
2. **Utwórz bazę danych** i skopiuj URL oraz token
3. **Skopiuj konfigurację środowiska**:
   ```bash
   cp .env.example .env
   ```
4. **Wypełnij zmienne w `.env`**:
   ```env
   TURSO_DATABASE_URL=libsql://your-database-url.turso.io
   TURSO_AUTH_TOKEN=your-database-auth-token
   ```

### 3. Inicjalizacja bazy danych

```bash
# Wypchnij schemat bazy danych
cd backend
pnpm install
pnpm run db:push
```

### 4. Uruchomienie aplikacji

#### Backend (Terminal 1)
```bash
cd backend
pnpm install
pnpm run dev
```
Backend będzie dostępny na: http://localhost:3001

#### Frontend (Terminal 2)
```bash
cd frontend
pnpm install
pnpm run dev
```
Frontend będzie dostępny na: http://localhost:5173

### 5. Testowanie

Otwórz przeglądarkę i przejdź do:
- **Strona główna**: http://localhost:5173
- **Przykład wymiany**: http://localhost:5173/trade/1
- **API Health Check**: http://localhost:3001/health

## Struktura projektu

```
minitrade/
├── backend/                 # Serwer API
│   ├── src/
│   │   └── index.ts        # Główny plik serwera
│   ├── db/schema/          # Schematy Drizzle ORM
│   │   ├── trades.ts       # Tabele wymian i propozycji
│   │   ├── users.ts        # Użytkownicy
│   │   └── items.ts        # Przedmioty
│   ├── routes/
│   │   └── trades.ts       # API endpointy
│   └── package.json
├── frontend/               # Aplikacja React
│   ├── src/
│   │   ├── components/
│   │   │   └── trade/      # Komponenty wymiany
│   │   ├── lib/api/        # React Query hooks
│   │   └── state/          # Zustand store
│   ├── components/ui/      # shadcn/ui komponenty
│   └── package.json
├── .env.example           # Przykład konfiguracji
└── drizzle.config.ts      # Konfiguracja Drizzle
```

## API Endpoints

### Wymiany (Trades)
- `GET /api/v1/trades` - Lista wymian z filtrami
- `POST /api/v1/trades` - Utwórz nową wymianę
- `GET /api/v1/trades/:id` - Szczegóły wymiany
- `PATCH /api/v1/trades/:id/cancel` - Anuluj wymianę

### Propozycje (Proposals)
- `POST /api/v1/trades/:id/proposals` - Utwórz propozycję
- `GET /api/v1/trades/:id/proposals` - Lista propozycji
- `GET /api/v1/proposals/:id` - Szczegóły propozycji
- `POST /api/v1/proposals/:id/accept` - Akceptuj propozycję
- `POST /api/v1/proposals/:id/decline` - Odrzuć propozycję
- `PATCH /api/v1/proposals/:id/withdraw` - Wycofaj propozycję

## Technologie

### Backend
- **Express.js** - Framework webowy
- **Drizzle ORM** - Type-safe ORM dla SQLite
- **Turso** - Rozproszona baza danych SQLite
- **Zod** - Walidacja schematów
- **Pino** - Logowanie strukturalne
- **TypeScript** - Statyczne typowanie

### Frontend
- **React 18** - Biblioteka UI
- **Vite** - Szybki bundler i dev server
- **TypeScript** - Statyczne typowanie
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Komponenty UI oparte na Radix UI
- **Zustand** - Lekkie zarządzanie stanem
- **React Query** - Serwer state management i caching
- **React Router** - Routing po stronie klienta
- **Lucide React** - Ikony

## Rozwój

### Dodawanie nowych funkcjonalności

1. **Backend API**: Dodaj endpoint w `backend/routes/`
2. **Frontend Hooks**: Dodaj hook w `frontend/lib/api/`
3. **Komponenty**: Dodaj komponent w `frontend/components/`
4. **Stan**: Zaktualizuj store w `frontend/state/`

### Testowanie

```bash
# Lintowanie
cd backend && pnpm run lint
cd frontend && pnpm run lint

# Type checking
cd backend && pnpm run build
cd frontend && pnpm run build
```

## Produkcja

1. **Build backend**:
   ```bash
   cd backend
   pnpm run build
   pnpm start
   ```

2. **Build frontend**:
   ```bash
   cd frontend
   pnpm run build
   # Serwuj z serwera statycznego lub integruj z backendem
   ```

## Troubleshooting

### Problemy z bazą danych
- Sprawdź czy URL i token są poprawne w `.env`
- Upewnij się, że baza danych istnieje w Turso
- Sprawdź logi serwera dla błędów połączenia

### Problemy z frontendem
- Sprawdź czy backend jest uruchomiony na porcie 3001
- Sprawdź konfigurację proxy w `vite.config.ts`
- Sprawdź logi przeglądarki dla błędów CORS

### Problemy z zależnościami
```bash
# Wyczyść cache i zainstaluj ponownie
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## Architektura kodu

### Backend
- **Routes**: Express router z walidacją Zod
- **Database**: Drizzle ORM z transakcjami
- **Logging**: Pino z kolorowaniem w development
- **Error handling**: Strukturalne błędy z odpowiednimi kodami HTTP

### Frontend
- **State Management**: Zustand dla lokalnego stanu
- **Server State**: React Query dla API calls
- **UI Components**: shadcn/ui oparte na Radix UI
- **Styling**: Tailwind CSS z dark mode
- **TypeScript**: Ścisłe typowanie przez cały kod

## Licencja

MIT
