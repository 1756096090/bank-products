# Productos financieros

Aplicación Angular 22 con listado, búsqueda, paginación, registro, edición y eliminación de productos.

Interfaz responsive adaptable a móviles, tablets y escritorio.

## Instalación y ejecución

Requiere Node.js 22.22.3+ (22.x) o 24.15.0+ (24.x), npm y Git.

```bash
npm ci
npm start
```

Abre `http://localhost:4200`.

- **Sin backend (por defecto):** `src/environments/environment.development.ts` usa `useMocks: true`. Los cambios se guardan en memoria y se pierden al recargar.
- **Con backend:** usa `useMocks: false` e inicia la API externa en `http://localhost:3002`. El proxy de `proxy.conf.json` redirige `/bp` a esa dirección.

Reinicia `npm start` después de cambiar la configuración. Las fuentes e íconos requieren conexión a Google Fonts.

## Pruebas y compilación

```bash
npm run test:coverage
npm run build
```

Las pruebas usan Jest y no requieren backend. La cobertura mínima es 70 % en líneas, sentencias, ramas y funciones; los reportes quedan en `coverage/`. Husky comprueba formato, pruebas y cobertura antes de cada commit.

La compilación usa `src/environments/environment.ts` para configurar la API o los mocks. Los archivos generados quedan en `dist/bank-products/browser`.

Para usar la API con `npm run build`, el backend debe permitir CORS desde el origen del frontend; el proxy solo funciona con `npm start`.

## Arquitectura

- `features/products/domain`: modelos, errores y contrato del repositorio.
- `features/products/application`: servicio de productos.
- `features/products/data`: repositorios HTTP y mock, DTOs y conversores.
- `features/products/presentation`: páginas y validaciones.
- `shared`: componentes, formularios y pipes reutilizables.
- `core/http`: interceptor de logs e identificadores de petición.
- `styles`: mixins y breakpoints; colores en `src/styles.scss`.

Las páginas usan el servicio de productos; la inyección de dependencias selecciona el repositorio HTTP o mock.

## Convenciones

- **Commits:** Conventional Commits, por ejemplo `feat(products): add product` o `fix(table): correct pagination`.
- **Estilos:** SCSS con BEM (`bloque__elemento--modificador`).
- **Formato:** Prettier; usa `npm run format` para aplicar y `npm run format:check` para verificar.
- **Pruebas:** archivos `*.spec.ts` junto al código que prueban.
