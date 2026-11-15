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
- `core/http`: HTTP interceptor with structured logs and the Correlation ID pattern. Each request generates a UUID, sent as `X-Request-ID` and shared by its request, response and error logs.
- `styles`: shared SCSS breakpoints and mixins. Colors are defined in `src/styles.scss`.

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

## Conventions

SCSS classes follow BEM: `block__element--modifier`, for example `input-field__control--invalid`.

Use Conventional Commits, for example: `feat(products): add registration form` or `fix(table): correct mobile menu`.

Prettier formats the code. Husky runs it through lint-staged before each commit, formats staged files and blocks the commit if formatting fails.

```bash
npm run format
npm run format:check
```

## Pending

Editing and deletion are pending implementation.
