# Calculadora de Costos por Tarjeta

Una aplicación web moderna para calcular, mostrar y registrar el costo real de cobrar con tarjeta versus efectivo, con capacidad de trasladar el costo al cliente mediante un recargo parametrizable.

## ✨ Características

- 🧮 **Calculadora avanzada** que replica y mejora la lógica de Excel
- 💳 **Soporte múltiples tarjetas** (Visa/Mastercard, Naranja, etc.)
- 🏢 **Múltiples empresas/dispositivos** (Nave, Payway, etc.)
- 📊 **Desglose detallado** de comisiones, aranceles, IVA, IIBB
- 💰 **Cálculo de interés por cuotas** con comparativa MIPOL vs Cliente
- 📱 **Diseño responsive** optimizado para mobile
- 🌙 **Dark mode** incluido
- 💾 **Persistencia de datos** con historial de simulaciones
- 🔧 **Parametrización flexible** con versionado por fechas
- 🧪 **Tests comprehensivos** para validar fórmulas

## 🛠 Stack Tecnológico

- **Frontend**: Next.js 15 con App Router, TypeScript, TailwindCSS, shadcn/ui, Radix UI
- **Estado**: Zustand para manejo de estado cliente
- **Validación**: Zod para esquemas y validación
- **Backend**: API Route Handlers de Next.js (Edge Runtime)
- **Base de datos**: Prisma + SQLite (desarrollo) / PostgreSQL (producción)
- **Tests**: Vitest para tests unitarios, Playwright para E2E
- **Calidad**: ESLint + Prettier
- **PWA**: Capacidades offline básicas

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18+
- npm o yarn

### 1. Clonar e instalar dependencias

```bash
git clone <repo-url>
cd calculo-interes
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Editar `.env`:
```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Configurar base de datos

```bash
# Generar el cliente Prisma
npx prisma generate

# Crear y migrar la base de datos
npx prisma migrate dev --name init

# Cargar datos iniciales
npm run db:seed
```

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 📋 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo con Turbopack
npm run build        # Build para producción
npm run start        # Servidor de producción
npm run lint         # Linter ESLint

# Base de datos
npm run db:push      # Push del schema a la DB
npm run db:studio    # Abrir Prisma Studio
npm run db:seed      # Cargar datos iniciales

# Tests
npm run test         # Tests en watch mode
npm run test:run     # Ejecutar tests una vez
npm run test:ui      # Interfaz visual de tests
```

## 🧮 Lógica de Cálculo

La aplicación implementa las siguientes fórmulas (replicando la lógica de Excel):

### Variables Base
- `E` = Monto Efectivo
- `D` = Cantidad de Cuotas  
- `U` = % Recargo al Cliente
- `G` = % Comisión
- `I` = % Arancel
- `K` = % IVA
- `M` = % IIBB

### Fórmulas Principales

1. **Monto con Tarjeta**: `F = E × (1 + U)`
2. **Comisión ($)**: `H = F × G`
3. **Arancel ($)**: `J = F × I`
4. **IIBB ($)**: `N = BaseIIBB × M`
5. **IVA ($)**: `L = BaseIVA × K`
6. **Monto antes IVA**: `P = F - H - J - N`
7. **Monto Neto**: `R = P - L`
8. **Costo Total ($)**: `S = H + J + N [+ L si incluirIVAComoCosto]`
9. **Valor por Cuota**: `F ÷ D`

### Bases de Cálculo Configurables

**Base IVA**:
- `COMISION_ARANCEL`: H + J (por defecto)
- `SOLO_COMISION`: H
- `MONTO_EFECTIVO`: E
- `MONTO_TARJETA`: F

**Base IIBB**:
- `MONTO_TARJETA`: F (por defecto)
- `MONTO_EFECTIVO`: E

## 📊 Modelos de Datos

### EmpresaDispositivo
- Nave, Payway, etc.

### Tarjeta  
- Visa/Mastercard, Naranja, etc.

### Plan
- Configuración específica por empresa/tarjeta
- Porcentajes de comisión, arancel, IVA, IIBB
- Bases de cálculo configurables
- Vigencias con versionado

### InteresPorCuotas
- Interés del taller vs interés real por cantidad de cuotas
- Versionado por fechas de vigencia

### ParametrosGlobales
- IVA por defecto, decimales, configuraciones generales

## 🧪 Testing

La aplicación incluye tests comprehensivos para validar las fórmulas:

```bash
# Ejecutar tests
npm run test:run

# Ver cobertura
npm run test -- --coverage

# Tests específicos
npm run test calculations.test.ts
```

Los tests cubren:
- ✅ Cálculos básicos (todas las fórmulas)
- ✅ Diferentes bases de cálculo (IVA/IIBB)  
- ✅ Interés por cuotas
- ✅ Casos extremos (monto cero, una cuota)
- ✅ Redondeos y formatos
- ✅ Snapshot test para caso complejo

## 📱 Uso de la Aplicación

### Pantalla Principal - Calculadora

1. **Configurar parámetros**:
   - Monto en efectivo
   - % Recargo al cliente (slider)
   - Empresa/Dispositivo
   - Tipo de tarjeta
   - Plan de cuotas

2. **Ver resultados**:
   - Monto con tarjeta y valor por cuota
   - Desglose detallado de costos
   - Monto neto final
   - Información de interés (si aplica)

3. **Acciones disponibles**:
   - Copiar resultados al portapapeles
   - Guardar simulación
   - Compartir (WhatsApp, etc.)

### Datos Iniciales Incluidos

La aplicación viene pre-cargada con:

**Empresas**: Nave, Payway

**Tarjetas**: Visa/Mastercard, Naranja

**Planes de ejemplo**:
- Nave + Visa/Mastercard: 1, 3, 6, 9, 12 cuotas
- Payway + Naranja: Plan Z (11), 1 cuota, 12 cuotas  
- Payway + Visa/Mastercard: 1 cuota, Cuota simple 3 (13), Cuota simple 6 (16)

**Interés por cuotas**: Configuraciones para 1, 3, 6, 9, 11, 12 cuotas

## 🔧 Desarrollo

### Estructura de Archivos

```
src/
├── app/                 # App Router de Next.js
│   ├── api/            # API Routes
│   └── page.tsx        # Página principal
├── components/         # Componentes React
│   ├── ui/            # Componentes de shadcn/ui
│   └── calculadora/   # Componentes específicos
├── lib/               # Utilidades y lógica
│   ├── calculations.ts # Motor de cálculo
│   ├── schemas.ts     # Esquemas Zod
│   ├── store.ts       # Store Zustand
│   └── prisma.ts      # Cliente Prisma
prisma/
├── schema.prisma      # Schema de base de datos
├── seed.ts           # Datos iniciales
└── migrations/       # Migraciones
tests/                # Tests unitarios
```

### Agregar Nuevos Planes

1. Usar Prisma Studio: `npm run db:studio`
2. O vía API: `POST /api/planes`
3. O modificar `prisma/seed.ts` y ejecutar `npm run db:seed`

### Personalizar Cálculos

Modificar `src/lib/calculations.ts` - el `CalculationEngine` es la clase principal que contiene toda la lógica de cálculo.

## 🚀 Despliegue

### Desarrollo Local
```bash
npm run dev
```

### Producción
```bash
npm run build
npm run start
```

### Variables de Entorno para Producción
```env
DATABASE_URL="postgresql://..."  # PostgreSQL en producción
NEXT_PUBLIC_APP_URL="https://tu-dominio.com"
```

## 🤝 Contribuir

1. Fork del repositorio
2. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -am 'Agregar nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si encuentras algún problema o tienes preguntas:

1. Revisar la [documentación](docs/)
2. Buscar en [Issues existentes](../../issues)
3. Crear un nuevo Issue con detalles del problema

---

**¡Desarrollado con ❤️ para simplificar el cálculo de costos por tarjeta!**
