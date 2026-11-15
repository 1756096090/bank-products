# Devsu Angular Technical Assessment

Financial Products Management System built with Angular 22, TypeScript, Clean Architecture, SOLID principles and Jest.

## Installation

Requires Node.js 22.22.3+ (22.x) or 24.15.0+ (24.x), and npm.

```bash
npm ci
```

## Run

Start the backend at `http://localhost:3002`, then run:

```bash
npm start
```

Open `http://localhost:4200`. The development proxy forwards `/bp` requests to the backend.

To use sample data, set `useMocks: true` in `src/environments/environment.development.ts`.

## Architecture

- `features/products/domain`: product model and repository contract.
- `features/products/data`: HTTP and mock repository implementations.
- `features/products/presentation`: product page and UI logic.
- `shared/components`: reusable table, avatar and header.
- `core/http`: HTTP logging interceptor with automatic request IDs.

Dependency injection selects the repository implementation, keeping the page independent of the data source.

## Tests

```bash
npm test -- --run-in-band --watch=false
npm test -- --run-in-band --watch=false --coverage
```

## Build

```bash
npm run build
```

Output: `dist/bank-products`.

## Pending

Search, editing and deletion are pending implementation.
