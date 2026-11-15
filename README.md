# Prueba técnica Angular para Devsu

Sistema de gestión de productos financieros desarrollado con Angular 22, TypeScript, arquitectura limpia, principios SOLID y Jest.

## Instalación

Requiere Node.js 22.22.3 o superior dentro de 22.x, o 24.15.0 o superior dentro de 24.x, y npm.

```bash
npm ci
```

## Ejecución

Inicia el backend en `http://localhost:3002` y ejecuta:

```bash
npm start
```

Abre `http://localhost:4200`. El proxy de desarrollo redirige las peticiones `/bp` al backend.

Para usar datos de prueba, configura `useMocks: true` en `src/environments/environment.development.ts`.

## Arquitectura

- `features/products/domain`: modelo en camelCase, errores de dominio y contrato del repositorio.
- `features/products/application`: ProductService, servicio que usan las páginas y los validadores.
- `features/products/data`: repositorios HTTP y mock, DTOs de la API y conversores de productos y errores.
- `features/products/presentation`: páginas y lógica de interfaz.
- `shared/components`: tabla, avatar, encabezado y campos reutilizables.
- `shared/forms`: integración con ControlValueAccessor y mensajes de validación compartidos.
- `core/http`: interceptor con logs estructurados y el patrón Correlation ID. Cada petición genera un UUID que se envía en `X-Request-ID` y relaciona los logs de petición, respuesta y error.
- `styles`: breakpoints y mixins de SCSS compartidos. Los colores están en `src/styles.scss`.

Las páginas usan ProductService. La inyección de dependencias selecciona el repositorio; los detalles HTTP y los campos snake_case de la API quedan en la capa de datos.

## Pruebas

Jest calcula la cobertura por defecto y exige un mínimo del 70% en sentencias, ramas, funciones y líneas. La ejecución falla si alguna métrica queda por debajo del mínimo.

```bash
npm test -- --run-in-band --watch=false
npm test -- --run-in-band --watch=false --coverage
```

## Compilación

```bash
npm run build
```

Los archivos generados quedan en `dist/bank-products`.

## Convenciones

Las clases SCSS siguen BEM: `bloque__elemento--modificador`, por ejemplo `input-field__control--invalid`.

Los mensajes de commit siguen Conventional Commits, por ejemplo `feat(products): add registration form` o `fix(table): correct mobile menu`.

Prettier aplica el formato del código. Antes de cada commit, Husky ejecuta Prettier mediante lint-staged sobre los archivos preparados y bloquea el commit si el formato falla.

```bash
npm run format
npm run format:check
```

## Pendientes

Implementar la eliminación de productos.
