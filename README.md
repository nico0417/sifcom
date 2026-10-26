# SIFCOM — Sistema de Fiscalización en Terreno de Contratos Municipales

## Presentado por
- Nicolás Alejandro Leiva Aguilar
- Ricardo Andrés Pastén Oblitas

### Distribución de responsabilidades

| Integrante | Rol en el equipo | Responsabilidades principales |
|---|---|---|
| **Nicolás Alejandro Leiva Aguilar** | Arquitectura Full-Stack, Base de Datos y Seguridad | Configuración de Ionic + React y enrutador protegido por roles, diseño e implementación de la base de datos relacional (`schema.sql`), construcción del servidor Node.js + Express, autenticación con `bcrypt` y `JWT`, y controles de seguridad OWASP API 2023. |
| **Ricardo Andrés Pastén Oblitas** | Diseño UI/UX, Modelado MER e Integración | Elaboración manual de prototipos web y móvil en Figma, diseño del Modelo Entidad-Relación (MER), implementación de vistas adaptables (`Login`, `Register`, `Home`, `NuevaFiscalizacion`, `Contratos`, `HistorialReportes`, `Trazabilidad`, `Perfil`) y pruebas funcionales. |

---

## Índice
1. [Descripción general del sistema](#descripción-general-del-sistema)
2. [Organización de las ramas del repositorio](#organización-de-las-ramas-del-repositorio)
3. [Justificación del problema](#justificación-del-problema)
4. [Objetivos del proyecto](#objetivos-del-proyecto)
5. [Usuarios objetivo y Roles del sistema](#usuarios-objetivo-quién-usará-la-aplicación)
6. [Proto-personas](#proto-personas)
7. [Requerimientos del sistema](#requerimientos)
8. [Arquitectura de Navegación / UX](#arquitectura-de-navegación)
9. [Bocetos UI/UX (Figma) y Modelo Entidad-Relación (MER)](#bocetos-uiux-y-modelo-de-datos)
10. [Tecnologías y herramientas](#tecnologías-y-herramientas)
11. [Instrucciones rápidas de instalación y ejecución](#instrucciones-de-instalación-y-ejecución)

---

## Descripción general del sistema

**SIFCOM** (Sistema de Fiscalización en Terreno de Contratos Municipales) es una plataforma compuesta por una aplicación **móvil y web adaptable** (desarrollada en **Ionic con React y TypeScript**) conectada a una **API RESTful** (desarrollada en **Node.js, Express y PostgreSQL**), que permite digitalizar, estandarizar y georreferenciar la supervisión en terreno de contratos municipales de servicios externalizados (mantención de áreas verdes, recolección de aseo, alumbrado público y obras de remodelación).

La plataforma centraliza la evidencia levantada por los inspectores municipales (*checklists*, fotografías con coordenadas GPS y observaciones) para que los administradores municipales monitoreen el cumplimiento contractual, visualicen el presupuesto ejecutado junto a las multas por categoría y respalden con evidencia la aplicación de multas o la evaluación de futuras licitaciones.

---

## Organización de las ramas del repositorio

De acuerdo con los lineamientos de la asignatura **Ingeniería Web y Móvil**, el desarrollo del proyecto se estructura en tres ramas dentro de este repositorio público:

| Rama | Propósito y contenido principal |
|---|---|
| **`main`** | Documentación general integrada del proyecto, visión arquitectónica completa, prototipos UI/UX, Modelo Entidad-Relación (MER) e instrucciones globales de puesta en marcha. |
| **`frontend`** | Código fuente completo de la interfaz de usuario en **Ionic + React (TypeScript)** estructurado en `pages`, `components`, `routes`, `services` e `interfaces`, junto con la especificación detallada de requerimientos funcionales, no funcionales y arquitectura UX. |
| **`backend`** | Servidor **API REST en Node.js + Express**, conexión a **PostgreSQL**, archivo reproducible **`schema.sql`** (DDL + PK/FK + datos iniciales), autenticación **JWT + bcrypt**, controles **OWASP API Security 2023 (`API1`, `API2`, `API4`, `API8`, `API9`)** y colección de pruebas para Postman/Insomnia. |

---

## Justificación del problema

A nivel municipal, existe una carencia generalizada para medir la eficiencia y el impacto de la gestión en terreno, lo que impide la toma de decisiones basada en evidencia. Uno de los focos más críticos son los problemas en la supervisión de contratos de servicios externalizados (recolección de basura, mantenimiento de áreas verdes, obras civiles e iluminación pública).

Las municipalidades enfrentan graves dificultades para supervisar y controlar eficazmente la calidad de estos servicios en terreno cuando los registros se llevan en papel o medios informales, lo que deriva en un servicio deficiente entregado a la ciudadanía a pesar de los altos costos financieros invertidos.

En este contexto, **SIFCOM** aborda la necesidad de digitalizar, estandarizar y georreferenciar la recolección de evidencia empírica en terreno, vinculando cada inspección con su contrato, inspector responsable, lista de verificación y multas asociadas.

### Fuentes secundarias de respaldo
1. **Ministerio de Hacienda y Laboratorio de Gobierno (2023):** *Guía Metodológica para medir la Calidad de Servicio y la Experiencia Usuaria en el Estado* (Circular N° 34 / Sistema de Calidad de Servicio). Disponible en: `https://calidaddeservicio.gob.cl/`.
2. **Centro de Transformación Digital (CTD) — Municipalidad de Santo Domingo (2025):** *Desafíos Públicos Locales: Supervisión y control en terreno de contratos municipales externalizados*.

---

## Objetivos del proyecto

### Objetivo general
Desarrollar una plataforma web y móvil que permita digitalizar y centralizar la fiscalización en terreno de contratos municipales, facilitando la trazabilidad de la evidencia y la toma de decisiones basada en datos.

### Objetivos específicos
- Permitir a los inspectores completar listas de verificación (*checklists*) y adjuntar evidencia fotográfica georreferenciada desde su dispositivo móvil o computador.
- Consolidar en un panel administrativo (*dashboard*) el presupuesto de contratos vigentes y las multas acumuladas por categoría.
- Garantizar la trazabilidad de las fiscalizaciones y multas registradas sobre cada contrato.
- Diferenciar el acceso, las vistas y los endpoints disponibles según el rol del usuario autenticado (`INSPECTOR` / `ADMIN`).
- Proteger la información mediante cifrado de contraseñas (`bcrypt`), tokens `JWT` y controles de seguridad API REST.

---

## Usuarios objetivo (Quién usará la aplicación)

### Inspectores en Terreno (`INSPECTOR`)
Son el personal operativo desplegado en la comuna. Requieren interfaces rápidas, intuitivas y adaptadas para su uso en exteriores con controles táctiles amplios (`>= 44x44 CSS px`). Necesitan reducir el tiempo dedicado a redactar informes en papel y agilizar la captura de pruebas (checklist, fotos y GPS).

### Administradores Municipales (`ADMIN`)
Son los encargados de gestionar los contratos vigentes, evaluar a las empresas contratistas y auditar las multas aplicadas. Operan principalmente desde computadores de escritorio en oficinas municipales (y ocasionalmente desde móvil), requiriendo datos consolidados, métricas presupuestarias y alertas claras de incumplimiento.

---

## Proto-personas

> **Nota:** Las siguientes *proto-personas* corresponden a caracterizaciones preliminares basadas en fuentes secundarias (*Guía Metodológica de Calidad de Servicio* y *Desafíos Públicos Locales*) y supuestos razonados de diseño; **no representan resultados de entrevistas a usuarios reales**.

### Proto-persona 1: El Inspector Operativo (`Carlos`, 45 años — Rol: `Inspector`)
- **Características y contexto:** Funcionario municipal que realiza sus rondas en camioneta o a pie. Acostumbra llevar registros en libretas, lo que retrasa su flujo de trabajo.
- **Necesidades y objetivos:** Reportar el estado de un servicio in situ mediante toques rápidos en pantalla, marcar ítems de cumplimiento y adjuntar fotografías con ubicación GPS como prueba respaldada.
- **Puntos de frustración:** Perder anotaciones, lidiar con interfaces móviles complejas al sol, o que los contratistas rechacen las observaciones por falta de pruebas concretas.
- **Funcionalidades que utiliza:** Inicio de sesión, `Nueva Fiscalización`, `Historial de Reportes` propios y `Perfil`.

### Proto-persona 2: La Estratega Administrativa (`Valeria`, 38 años — Rol: `Administrador Municipal`)
- **Características y contexto:** Jefa de unidad técnica municipal en oficina. Debe rendir cuentas sobre el presupuesto invertido en contratos externalizados y respaldar sanciones.
- **Necesidades y objetivos:** Tener una vista panorámica del cumplimiento de las empresas externas, mantener el catastro de contratos vigentes y auditar la trazabilidad de reportes y multas.
- **Puntos de frustración:** Recibir reclamos por servicios no prestados y carecer de información centralizada para verificar si la empresa ejecutó el trabajo.
- **Funcionalidades que utiliza:** `Dashboard de Inicio`, `Contratos` (CRUD), `Historial y Trazabilidad`, `Panel de Administración`, `Nueva Fiscalización` e `Historial de Reportes`.

---

## Requerimientos

### Requerimientos funcionales por rol

| ID | Nombre | Descripción (Producto + Verbo + Necesidad) | Rol |
|---|---|---|---|
| **RF-01** | Registrar contratos municipales | **SIFCOM** registra los contratos municipales vigentes indicando empresa adjudicada, giro o nombre del servicio, presupuesto asignado y fecha de vigencia para mantener actualizado el catastro de servicios supervisados. | Administrador |
| **RF-02** | Actualizar y mantener contratos | **SIFCOM** actualiza la información de los contratos municipales existentes o los elimina del catastro activo para reflejar modificaciones contractuales o términos de vigencia. | Administrador |
| **RF-03** | Visualizar dashboard presupuestario y de multas | **SIFCOM** presenta un panel de control gráfico con la proporción de presupuesto utilizado frente al disponible y el monto de multas acumuladas por categoría para apoyar el monitoreo estratégico municipal. | Administrador |
| **RF-04** | Identificar alertas de incumplimiento por contrato | **SIFCOM** calcula y muestra indicadores visuales de estado (*Sin observaciones*, *Alerta de incumplimiento* o *Multa aplicada*) en cada contrato y reporte para priorizar la revisión de empresas con incumplimientos. | Administrador |
| **RF-05** | Evaluar lista de verificación en terreno | **SIFCOM** registra la evaluación de cada ítem de la lista de verificación (*checklist*) asociada al contrato durante una nueva fiscalización para determinar automáticamente el estado de cumplimiento del servicio. | Inspector / Administrador |
| **RF-06** | Vincular evidencia fotográfica y georreferenciación | **SIFCOM** asocia la ubicación GPS detectada y el archivo de evidencia fotográfica al reporte de fiscalización para respaldar empíricamente la inspección realizada en terreno. | Inspector / Administrador |
| **RF-07** | Registrar observaciones de fiscalización | **SIFCOM** almacena el asunto o lugar inspeccionado junto con las observaciones textuales del inspector para detallar las irregularidades o hallazgos detectados en el servicio. | Inspector / Administrador |
| **RF-08** | Consultar historial de reportes y trazabilidad | **SIFCOM** lista cronológicamente el historial de fiscalizaciones y los registros de trazabilidad con sus multas asociadas según los permisos del usuario para auditar las actuaciones realizadas. | Ambos (Trazabilidad global exclusiva de Administrador) |

### Funcionalidades transversales
- **FT-01:** SIFCOM permite el registro de nuevas cuentas de inspector con validación de datos.
- **FT-02:** SIFCOM permite iniciar y cerrar sesión mediante credenciales verificadas con JWT.
- **FT-03:** SIFCOM restringe las vistas, rutas y operaciones de la API de acuerdo con el rol del usuario autenticado (`INSPECTOR` / `ADMIN`).
- **FT-04:** SIFCOM permite consultar y actualizar los datos del perfil personal del usuario autenticado.

### Requerimientos no funcionales

| ID | Categoría | Descripción y umbral verificable |
|---|---|---|
| **RNF-01** | Arquitectura | El frontend debe construirse en **Ionic React (`@ionic/react` v9)** con separación modular (`pages`, `components`, `routes`, `services`, `interfaces`) y el backend en **Node.js + Express** conectado a **PostgreSQL**. |
| **RNF-02** | Seguridad | Las contraseñas deben cifrarse con **bcrypt (`cost >= 10`)**, exigiendo mínimo **8 caracteres y 1 número**, y la API debe protegerse mediante **JWT (`HS256`, expiración `2h`)**, consultas SQL parametrizadas y controles **OWASP API 2023 (`API1`, `API2`, `API4`, `API8`, `API9`)**. |
| **RNF-03** | Usabilidad y Accesibilidad | Los controles interactivos deben poseer áreas táctiles mínimas de **`44 x 44 CSS px`**, contraste de texto normal **`>= 4.5:1`** y etiquetas visibles con mensajes de error en línea. |
| **RNF-04** | Rendimiento | El tiempo de respuesta de las operaciones de lectura y registro de fiscalizaciones no debe superar los **`5 segundos` (`p95 <= 5000 ms`)** bajo red estable, con un límite de payload JSON de **`100 KB`**. |
| **RNF-05** | Compatibilidad | La interfaz debe adaptarse sin desplazamiento horizontal en resoluciones de **`360 px` (móvil)**, **`768 px` (tablet)** y **`1366 px` (escritorio)** en Chrome, Edge y Firefox. |

---

## Arquitectura de Navegación

```text
Aplicación SIFCOM
│
├── Rutas públicas
│   ├── /login (Inicio de sesión)
│   └── /register (Creación de cuenta)
│
└── Rutas protegidas (/tabs/*)
    │
    ├── Inspector y Administrador
    │   ├── /tabs/home (Dashboard de inicio)
    │   ├── /tabs/nueva-fiscalizacion (Checklist + GPS + Foto + Observaciones)
    │   ├── /tabs/historial-reportes (Listado de reportes)
    │   └── /tabs/perfil (Datos personales y cierre de sesión)
    │
    └── Exclusivo Administrador (RequireAdmin)
        ├── /tabs/contratos (Gestión CRUD de contratos vigentes)
        ├── /tabs/trazabilidad (Auditoría de reportes y multas)
        └── /tabs/admin (Panel de administración)
```

---

## Bocetos UI/UX y Modelo de Datos

### Prototipos Web y Móvil en Figma
- **Enlace público a Figma:** [Figma — Prototipos Web y Móvil SIFCOM](https://www.figma.com/design/MJbonacpaS2avT47w2sBir/Prototipos-web?node-id=14-9&t=zaWmh2SCHCK5laF5-0)

![Prototipos Web y Móvil SIFCOM](./docs/prototipos-web.png)

### Modelo Entidad-Relación (MER) de la Base de Datos

![Modelo Entidad-Relación SIFCOM](./docs/mer-sifcom.png)

---

## Tecnologías y herramientas

| Capa | Tecnologías principales |
|---|---|
| **Frontend (`rama frontend`)** | Ionic React (`@ionic/react` v9), React 19, TypeScript, React Router v6, Axios, Chart.js (`react-chartjs-2`), Vite 8. |
| **Backend (`rama backend`)** | Node.js, Express 5, PostgreSQL (`pg`), JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, `cors`, `dotenv`. |
| **Diseño y Pruebas** | Figma (UI/UX móvil y web), Postman / Insomnia (pruebas funcionales de API REST). |

---

## Instrucciones de instalación y ejecución

### 1. Levantar la Base de Datos y el Backend (`rama backend`)

```bash
git clone https://github.com/nico0417/sifcom.git
cd sifcom
git checkout backend

# (Opcional) Ejecutar el script SQL directamente en PostgreSQL:
psql -U postgres -c "CREATE DATABASE sifcom;"
psql -U postgres -d sifcom -f schema.sql

# Configurar variables de entorno e iniciar la API en http://localhost:4000
cp .env.example .env
npm install
npm run dev
```

### 2. Levantar la Aplicación Web/Móvil (`rama frontend`)

En otra terminal:

```bash
git clone https://github.com/nico0417/sifcom.git sifcom-frontend
cd sifcom-frontend
git checkout frontend

cp .env.example .env
npm install
npm run dev
```

Abrir en el navegador `http://localhost:5173`.

### 3. Credenciales de prueba precargadas

| Rol | Correo | Contraseña |
|---|---|---|
| **Administrador Municipal (`ADMIN`)** | `admin@sifcom.cl` | `Admin1234` |
| **Inspector en Terreno (`INSPECTOR`)** | `inspector@sifcom.cl` | `Inspector1234` |
