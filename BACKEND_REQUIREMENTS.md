# Backend Requirements — Huevito (Fondas)

Documento de referencia para el equipo de backend. Describe los endpoints, contratos y reglas de autenticación que el frontend (React + Firebase Auth) espera consumir.

- **Proyecto Firebase:** `etribe-huevito-dev`
- **Proveedor de identidad:** Google (Firebase Authentication)
- **Patrón:** Firebase es la fuente de verdad de identidad. El backend es **stateless** respecto a sesiones: valida el ID Token de Firebase en cada request y no emite tokens propios.

---

## 1. Autenticación

### 1.1 Header en todas las peticiones autenticadas

```
Authorization: Bearer <Firebase ID Token>
Content-Type: application/json
```

### 1.2 Validación en el backend

Usar **Firebase Admin SDK** con el `projectId = etribe-huevito-dev`:

```ts
import { getAuth } from "firebase-admin/auth";
const decoded = await getAuth().verifyIdToken(idToken);
// decoded.uid, decoded.email, decoded.email_verified, decoded.name, decoded.picture
```

- Si el token es inválido o expirado → responder **`401 Unauthorized`**.
- El frontend, al recibir 401, hace `getIdToken(true)` (force refresh) y reintenta una vez. Si vuelve a fallar, cierra la sesión local.
- No leer el `uid` del body; siempre derivarlo del token.

### 1.3 CORS

Permitir los orígenes:

- `http://localhost:8080` (Vite dev)
- `https://id-preview--b1264158-f421-438f-8059-9bd9c54131f3.lovable.app` (preview Lovable)
- Dominio(s) de producción cuando se publique

Headers permitidos: `Authorization`, `Content-Type`.
Métodos: `GET`, `POST`, `PATCH`, `OPTIONS`.

---

## 2. Endpoints

Base URL: **`<por definir — pasarla al frontend>`**.

Todos los endpoints listados requieren el header `Authorization: Bearer <idToken>`.

---

### 2.1 `POST /auth/register`

Se llama al terminar el formulario de registro de la fonda (después de Google Sign-In).
Debe ser **idempotente**: si el `firebase_uid` ya existe, hacer update y devolver `200`.

**Request body:**

```json
{
  "responsable": "María López",
  "fonda": "Cocina de la abuela",
  "telefono": "55 1234 5678",
  "direccion": "Calle X #123, Col. Y, CDMX"
}
```

| Campo         | Tipo   | Requerido | Notas                                  |
| ------------- | ------ | --------- | -------------------------------------- |
| `responsable` | string | sí        | 2–80 chars                             |
| `fonda`       | string | sí        | 2–80 chars                             |
| `telefono`    | string | no        | hasta 20 chars, puede llegar como `""` |
| `direccion`   | string | sí        | 4–160 chars                            |

**Lógica del backend:**

1. Verificar idToken → obtener `uid`, `email`.
2. `UPSERT` en tabla `clientes` por `firebase_uid`.
3. Devolver el cliente completo.

**Response `200`/`201`:**

```json
{
  "cliente": {
    "id": "uuid",
    "firebase_uid": "abc123",
    "email": "fondita@gmail.com",
    "responsable": "María López",
    "fonda": "Cocina de la abuela",
    "telefono": "55 1234 5678",
    "direccion": "Calle X #123",
    "created_at": "2026-06-23T12:00:00Z",
    "updated_at": "2026-06-23T12:00:00Z"
  }
}
```

**Errores:**

- `400` validación de campos.
- `401` token inválido/expirado.

---

### 2.2 `GET /auth/me`

Se llama al cargar la app si Firebase ya tiene sesión, para saber si el usuario ya completó el registro de la fonda.

**Response `200`:** mismo shape que `POST /auth/register` (`{ "cliente": { ... } }`).

**Response `404`:** Firebase autenticado pero sin perfil → el frontend mostrará el formulario de registro.

**Errores:** `401` token inválido.

---

### 2.3 `POST /platillos/rating`

Guarda una calificación de un platillo adaptado. Reemplaza el flujo actual de calificación local.

**Request body:**

```json
{
  "session_id": "20260623_153045_a1b2",
  "platillo_nombre": "Mole poblano",
  "platillo_nombre_en": "Mole poblano",
  "rating": 5,
  "comentario": "Le encantó al cliente",
  "flags": { "spicy": true, "vegetarian": false }
}
```

| Campo                | Tipo   | Requerido | Notas                                        |
| -------------------- | ------ | --------- | -------------------------------------------- |
| `session_id`         | string | sí        | Mismo `session_id` que usa el chat actual    |
| `platillo_nombre`    | string | sí        | Nombre en español                            |
| `platillo_nombre_en` | string | no        | Nombre en inglés (si aplica)                 |
| `rating`             | int    | sí        | 1–5                                          |
| `comentario`         | string | no        | hasta 500 chars                              |
| `flags`              | object | no        | flags del platillo (spicy, vegetarian, etc.) |

**Lógica:** asociar la fila al `cliente_id` derivado del `firebase_uid` del token.

**Response `200`:**

```json
{ "ok": true, "id": "uuid-de-la-calificacion" }
```

**Errores:** `400`, `401`, `404` (cliente no registrado todavía).

---

### 2.4 `GET /clientes/me/platillos`

Historial de platillos calificados por el cliente autenticado.

**Query params (opcionales):**

- `limit` (int, default `20`, máx `100`)
- `cursor` (string, paginación)

**Response `200`:**

```json
{
  "platillos": [
    {
      "id": "uuid",
      "session_id": "20260623_153045_a1b2",
      "nombre": "Mole poblano",
      "nombre_en": "Mole poblano",
      "rating": 5,
      "comentario": "Le encantó",
      "flags": { "spicy": true },
      "created_at": "2026-06-23T12:30:00Z"
    }
  ],
  "next_cursor": null
}
```

**Errores:** `401`, `404` (cliente sin perfil).

---

## 3. Esquema de base de datos sugerido

```sql
-- Clientes (fondas registradas)
CREATE TABLE clientes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid  TEXT UNIQUE NOT NULL,
  email         TEXT NOT NULL,
  responsable   TEXT NOT NULL,
  fonda         TEXT NOT NULL,
  telefono      TEXT,
  direccion     TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_clientes_firebase_uid ON clientes(firebase_uid);

-- Platillos calificados (historial)
CREATE TABLE platillos_calificados (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id     UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  session_id      TEXT NOT NULL,
  nombre          TEXT NOT NULL,
  nombre_en       TEXT,
  rating          SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comentario      TEXT,
  flags           JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_platillos_cliente ON platillos_calificados(cliente_id, created_at DESC);
CREATE INDEX idx_platillos_session ON platillos_calificados(session_id);
```

---

## 4. Convenciones de respuesta de error

Formato uniforme sugerido:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "El campo 'fonda' es requerido",
    "details": { "field": "fonda" }
  }
}
```

| HTTP | Cuándo                                              |
| ---- | --------------------------------------------------- |
| 400  | Body inválido / falta campo requerido               |
| 401  | Token Firebase inválido, expirado o ausente         |
| 403  | Token válido pero sin permisos para el recurso      |
| 404  | Recurso no encontrado (cliente sin perfil, etc.)    |
| 409  | Conflicto (solo si NO se opta por upsert idempotente) |
| 500  | Error interno                                       |

---

## 5. Checklist para entregar al frontend

Cuando el backend esté listo, el equipo de frontend necesita:

- [ ] **URL base** del backend (ej. `https://api-huevito-dev.example.com`)
- [ ] Confirmación de que **CORS** permite los orígenes de la sección 1.3
- [ ] Confirmación de que `POST /auth/register` es **idempotente**
- [ ] Confirmación / ajuste de **nombres de campos** (snake_case vs camelCase) si difieren
- [ ] Credenciales/instrucciones para el ambiente de **QA** y **producción** (si hay URLs distintas)

---

## 6. Configuración Firebase (referencia)

```js
const firebaseConfig = {
  apiKey: "AIzaSyA5XIzV3dFnh6ofcXCyL2vQ4AO2GkvGi9g",
  authDomain: "etribe-huevito-dev.firebaseapp.com",
  projectId: "etribe-huevito-dev",
  storageBucket: "etribe-huevito-dev.firebasestorage.app",
  messagingSenderId: "637897427353",
  appId: "1:637897427353:web:72a4c603b4dabd0aabeb08"
};
```

El backend debe usar las **credenciales de cuenta de servicio** del mismo proyecto (`etribe-huevito-dev`) para inicializar el Firebase Admin SDK. Descargar el JSON desde:
**Firebase Console → Configuración del proyecto → Cuentas de servicio → Generar nueva clave privada**.
