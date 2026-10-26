# SIFCOM — Sistema de Fiscalización en Terreno de Contratos Municipales

## Presentado por
- Nicolás Alejandro Leiva Aguilar
- Ricardo Andrés Pastén Oblitas

### Distribución de responsabilidades

| Integrante | Rol en el equipo | Responsabilidades principales |
|---|---|---|
| **Nicolás Alejandro Leiva Aguilar** | Arquitectura Full-Stack y Seguridad | Configuración del proyecto en Ionic + React, arquitectura de rutas protegidas por rol (`IonReactRouter`), integración con API REST (`axios` e interceptores JWT), modelo de base de datos relacional y seguridad. |
| **Ricardo Andrés Pastén Oblitas** | Diseño UI/UX, Vistas e Integración | Diseño manual de prototipos web y móvil en Figma, construcción de vistas adaptables (`AppShell`, formularios de autenticación, fiscalización, contratos, historial y trazabilidad) y pruebas funcionales. |

---

## Índice
1. [Descripción general del sistema](#descripción-general-del-sistema)
2. [Justificación del problema](#justificación-del-problema)
3. [Objetivos del proyecto](#objetivos-del-proyecto)
4. [Usuarios objetivo](#usuarios-objetivo-quién-usará-la-aplicación)
5. [Roles del sistema](#roles-del-sistema)
6. [Proto-personas](#proto-personas)
7. [Requerimientos](#requerimientos)
    - [Requerimientos funcionales por rol](#requerimientos-funcionales-por-rol)
    - [Funcionalidades transversales](#funcionalidades-transversales)
    - [Requerimientos no funcionales](#requerimientos-no-funcionales)
8. [Arquitectura de Navegación / UX](#arquitectura-de-navegación)
    - [Rutas principales y secundarias](#1-rutas-principales-y-secundarias)
    - [Relaciones jerárquicas entre vistas](#2-relaciones-jerárquicas-entre-vistas)
    - [Diferenciación de acceso por roles](#3-diferenciación-de-acceso-según-roles)
    - [Flujos de tareas](#4-flujos-de-tareas)
    - [Puntos críticos de interacción](#5-puntos-críticos-de-interacción)
    - [Justificación técnica](#6-justificación-técnica)
9. [Bocetos UI/UX y Formularios](#bocetos-uiux)
10. [Tecnologías y estructura del proyecto](#tecnologías-y-herramientas)
11. [Instrucciones de instalación y ejecución](#instrucciones-de-instalación-y-ejecución)

---

## Descripción general del sistema

**SIFCOM** (Sistema de Fiscalización en Terreno de Contratos Municipales) es una aplicación web y móvil desarrollada con **Ionic y React** (TypeScript) conectada a una API REST en **Node.js, Express y PostgreSQL**, que permite digitalizar, estandarizar y georreferenciar la supervisión en terreno de contratos municipales de servicios externalizados (mantención de áreas verdes, recolección de residuos domiciliarios, alumbrado público y obras civiles).

La aplicación centraliza la evidencia levantada por los inspectores municipales (listas de verificación o *checklists*, fotografías con coordenadas GPS y observaciones) para que los administradores municipales monitoreen el cumplimiento contractual, visualicen el presupuesto ejecutado junto a las multas por categoría y respalden con trazabilidad la aplicación de sanciones o la evaluación de futuras licitaciones.

---

## Justificación del problema

A nivel municipal, existe una carencia estructural para medir en terreno la calidad y el cumplimiento efectivo de los contratos de servicios externalizados, lo que dificulta la toma de decisiones basada en evidencia. Cuando las inspecciones se registran en papel, mensajería informal o planillas aisladas, se pierde la trazabilidad entre el contrato vigente, los criterios exigidos en las bases técnicas y la evidencia fotográfica capturada en el lugar.

Esta falta de control operativo impide respaldar oportunamente la aplicación de multas ante incumplimientos reiterados y deriva en una deficiente calidad de servicio entregada a la ciudadanía a pesar de los altos recursos municipales comprometidos.

En este contexto, **SIFCOM** aborda la necesidad de vincular cada fiscalización en terreno con un contrato municipal, un funcionario responsable, una lista de verificación estandarizada y su evidencia georreferenciada, consolidando los reportes para su auditoría administrativa tanto desde dispositivos móviles como desde computadores de escritorio.

### Fuentes secundarias utilizadas

1. **Ministerio de Hacienda y Laboratorio de Gobierno (2023):** *Guía Metodológica para medir la Calidad de Servicio y la Experiencia Usuaria en el Estado* (Circular N° 34 / Sistema de Calidad de Servicio). Fundamenta la necesidad de estandarizar instrumentos de medición y consolidar indicadores trazables para evaluar servicios públicos. Disponible en: `https://calidaddeservicio.gob.cl/` (Documento de referencia incluido en el contexto del proyecto: `034GuiaMetodologica-Sistema.pdf`).
2. **Centro de Transformación Digital (CTD) — Municipalidad de Santo Domingo (2025):** *Catálogo de Desafíos Públicos Locales: Supervisión y control en terreno de contratos municipales externalizados*. Identifica la dificultad operativa de los inspectores municipales para levantar evidencia georreferenciada y de las unidades técnicas para cursar multas respaldadas (Documento de referencia: `Desafíos Públicos Locales - CTD STO DGO.pdf`).

---

## Objetivos del proyecto

### Objetivo general
Desarrollar una plataforma web y móvil en Ionic con React integrada a una API REST que permita digitalizar y centralizar la fiscalización en terreno de contratos municipales, asegurando el control de acceso por roles y la trazabilidad de la evidencia.

### Objetivos específicos
- Registrar fiscalizaciones en terreno asociadas a contratos municipales vigentes y a inspectores autenticados.
- Evaluar listas de verificación (*checklists*) vinculando fotografías, coordenadas de georreferenciación (GPS) y observaciones in situ.
- Consolidar en un panel administrativo (*dashboard*) la ejecución presupuestaria de contratos y las multas acumuladas por categoría.
- Garantizar la trazabilidad histórica de los reportes y sanciones aplicadas sobre cada contrato.
- Diferenciar las vistas, rutas y operaciones disponibles según el rol del usuario autenticado (`Inspector` / `Administrador Municipal`).

---

## Usuarios objetivo (Quién usará la aplicación)

La plataforma está dirigida a dos perfiles institucionales dentro de la municipalidad:

### 1. Inspectores Municipales en Terreno (Inspectores Técnicos de Obras y Servicios - ITO)
- **Características y contexto:** Funcionarios operativos que recorren plazas, calles y obras comunales, utilizando teléfonos móviles al aire libre bajo condiciones variables de luminosidad y conectividad.
- **Nivel estimado de experiencia tecnológica:** Intermedio; utilizan habitualmente aplicaciones móviles y cámara fotográfica, pero requieren formularios directos con baja carga cognitiva.
- **Necesidades de accesibilidad y seguridad:** Controles táctiles amplios (mínimo `44x44 CSS px`), alto contraste tipográfico (`>= 4.5:1`), etiquetas visibles en todos los campos y sesión autenticada individualmente.

### 2. Administradores Municipales (Jefaturas de SECPLA / Aseo y Ornato / Dirección de Control)
- **Características y contexto:** Encargados de administrar los contratos vigentes, configurar criterios de fiscalización y auditar el historial de reportes y multas desde computadores de escritorio en oficinas municipales (con acceso eventual desde dispositivos móviles).
- **Nivel estimado de experiencia tecnológica:** Medio-alto en sistemas de gestión administrativa, tableros de indicadores y revisión documental.
- **Necesidades de accesibilidad, seguridad y privacidad:** Navegación estructurada por menú lateral, diferenciación clara de estados mediante color y texto acompañante, y control estricto de permisos para impedir modificaciones no autorizadas sobre contratos y sanciones.

---

## Roles del Sistema

- **Inspector (`INSPECTOR`)**: Usuario encargado de acudir a los puntos de la comuna, completar formularios de nueva fiscalización (checklist, GPS, fotografía y observaciones) y consultar el historial de reportes y su perfil personal.
- **Administrador Municipal (`ADMIN`)**: Usuario con acceso global encargado de gestionar el catastro de contratos municipales, configurar checklists, auditar la trazabilidad de reportes y multas, y monitorear el panel de control administrativo.

---

## Proto-personas

> **Nota metodológica (Separación entre evidencia y supuestos):** Las siguientes *proto-personas* corresponden a perfiles hipotéticos construidos a partir de las fuentes secundarias citadas (*Guía Metodológica de Calidad de Servicio* y *Desafíos Públicos Locales CTD Santo Domingo*). **No representan resultados de entrevistas con usuarios reales.** Las edades, nombres, rutinas y frustraciones puntuales constituyen **supuestos razonados de diseño** para orientar la arquitectura de información y la interfaz.

### Proto-persona 1: El Inspector Operativo

- **Nombre ficticio:** Carlos
- **Tipo de usuario o rol:** Inspector en Terreno (`INSPECTOR`)
- **Características generales:** Funcionario municipal de 45 años. Realiza rondas diarias en vehículo municipal o a pie supervisando mantención de áreas verdes y aseo. Acostumbra anotar hallazgos en libretas de papel y tomar fotos sueltas en su teléfono, lo que retrasa la elaboración posterior del informe.
- **Necesidades principales:** Registrar una fiscalización directamente en el lugar mediante toques rápidos en pantalla, seleccionando el contrato fiscalizado y marcando los ítems de cumplimiento sin redactar informes extensos.
- **Objetivos de uso:** Validar el estado de los servicios asignados, adjuntar evidencia fotográfica georreferenciada y dejar enviado el reporte antes de pasar al siguiente punto de la comuna.
- **Dificultades o puntos de frustración:** Perder anotaciones en papel, enfrentar interfaces móviles recargadas o con botones pequeños al sol, y que las empresas contratistas cuestionen las observaciones por falta de fecha o ubicación clara.
- **Funcionalidades de la aplicación que utilizaría:** Inicio de sesión, resumen de inicio, formulario de **Nueva Fiscalización** (selección de contrato, checklist, GPS, foto y observaciones), **Historial de Reportes** y **Perfil de usuario**.
- **Dispositivo y contexto probable de acceso:** Smartphone corporativo Android en exteriores (y ocasionalmente computador en oficina).

---

### Proto-persona 2: La Estratega Administrativa

- **Nombre ficticio:** Valeria
- **Tipo de usuario o rol:** Administrador Municipal (`ADMIN`)
- **Características generales:** Jefa de unidad técnica municipal de 38 años. Debe controlar el presupuesto ejecutado en contratos externalizados, verificar el cumplimiento de las empresas adjudicadas y respaldar administrativamente la aplicación de multas.
- **Necesidades principales:** Contar con una vista panorámica del presupuesto de contratos vigentes, las alertas de incumplimiento registradas y el historial trazable de cada inspección y sanción.
- **Objetivos de uso:** Mantener actualizado el listado de contratos municipales, revisar el nivel de alertas acumuladas por empresa y auditar los reportes emitidos por los inspectores.
- **Dificultades o puntos de frustración:** Recibir reclamos por servicios deficientes y carecer de un repositorio centralizado donde cruzar el contrato, el reporte del inspector y las multas cursadas.
- **Funcionalidades de la aplicación que utilizaría:** **Dashboard de Inicio** (gráficos de presupuesto y multas por categoría), **Gestión de Contratos** (crear, editar, eliminar y revisar alertas), **Historial y Trazabilidad**, **Panel de Administración**, **Nueva Fiscalización** e **Historial de Reportes**.
- **Dispositivo y contexto probable de acceso:** Computador de escritorio en oficina municipal (navegadores Chrome, Edge o Firefox) y consulta desde teléfono móvil.

---

## Requerimientos

### Requerimientos funcionales por rol

> Cada requerimiento funcional está expresado bajo la estructura **Producto + Verbo + Necesidad**, declarando una única función verificable del dominio (fuera de inicio de sesión y registro).

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

Estas funcionalidades dan soporte a la seguridad y gestión de cuentas del sistema, sin contabilizarse dentro de los ocho requerimientos funcionales principales del dominio:

- **FT-01 (Registro de cuenta):** SIFCOM permite registrar nuevas cuentas de inspector solicitando nombre completo, comuna, correo electrónico confirmado y contraseña con validación de seguridad.
- **FT-02 (Autenticación de sesión):** SIFCOM permite iniciar y cerrar sesión mediante credenciales validadas contra el servidor, emitiendo un token JWT firmado.
- **FT-03 (Autorización por roles):** SIFCOM restringe las rutas de navegación, opciones de menú y operaciones de la API de acuerdo con el rol del usuario autenticado (`INSPECTOR` o `ADMIN`).
- **FT-04 (Gestión de perfil):** SIFCOM permite al usuario autenticado consultar su rol asignado (en modo solo lectura) y actualizar sus datos de contacto y contraseña.

### Requerimientos no funcionales

| ID | Categoría | Descripción y umbral verificable |
|---|---|---|
| **RNF-01** | Arquitectura y Modularidad | El frontend debe construirse sobre **Ionic React (`@ionic/react` v9)** y **TypeScript**, estructurando el código en al menos **5 módulos separados** (`pages`, `components`, `routes`, `services`, `interfaces`) y utilizando componentes propios de Ionic (`IonPage`, `IonHeader`, `IonContent`, `IonMenu`, `IonTabs`, `IonInput`, `IonSelect`, `IonCheckbox`, `IonButton`). |
| **RNF-02** | Seguridad | Las contraseñas de usuario deben exigir una longitud mínima de **8 caracteres y al menos 1 dígito numérico**, almacenarse cifradas con **bcrypt (`cost >= 10`)**, y las rutas protegidas de la API deben exigir un **token JWT vigente (expiración `<= 2 horas`)** validando permisos por rol y propiedad del recurso. |
| **RNF-03** | Usabilidad y Accesibilidad | Los controles interactivos y botones de navegación móvil deben poseer un área táctil mínima de **`44 x 44 CSS px`**, mantener una relación de contraste de texto normal **`>= 4.5:1`** (WCAG 2.1 AA) y presentar etiquetas (`<label>`) visibles junto a mensajes de validación explícitos en cada campo. |
| **RNF-04** | Rendimiento | El tiempo de respuesta y sincronización de una solicitud de lectura o creación de fiscalización entre el frontend y la API REST no debe superar los **`5 segundos` (`p95 <= 5000 ms`)** bajo conexión local o red estable, con un límite de carga útil JSON de **`100 KB`** por petición. |
| **RNF-05** | Compatibilidad y Diseño Adaptable | La interfaz debe adaptarse de forma responsiva entre dispositivos móviles y computadores de escritorio sin generar desplazamiento horizontal en anchos de ventana de **`360 px` (móvil)**, **`768 px` (tablet)** y **`1366 px` (escritorio)** en los navegadores Chrome, Edge y Firefox vigentes. |
| **RNF-06** | Disponibilidad y Persistencia | La aplicación debe conservar la sesión activa en almacenamiento local del navegador (`localStorage`) y manejar los estados de carga y error de red sin bloquear la interfaz ante interrupciones de conexión con el servidor. |

---

## Arquitectura de Navegación

### 1. Rutas principales y secundarias

**Rutas públicas**

| Ruta | Vista | Descripción |
|---|---|---|
| `/login` | `Login.tsx` | Inicio de sesión mediante correo y contraseña con validación de entrada. |
| `/register` | `Register.tsx` | Formulario de creación de cuenta con validación de campos, comuna y contraseña. |

**Rutas protegidas comunes (Inspector y Administrador)**

| Ruta | Vista | Descripción |
|---|---|---|
| `/tabs/home` | `Home.tsx` | Panel principal con gráficos de presupuesto de contratos y multas por categoría. |
| `/tabs/nueva-fiscalizacion` | `NuevaFiscalizacion.tsx` | Formulario de fiscalización en terreno (contrato, rubro, GPS, checklist, foto y observaciones). |
| `/tabs/historial-reportes` | `HistorialReportes.tsx` | Listado de fiscalizaciones registradas con indicador visual de estado. |
| `/tabs/perfil` | `Perfil.tsx` | Consulta de permisos actuales, edición de datos personales y cierre de sesión. |

**Rutas protegidas exclusivas de Administrador (`RequireAdmin`)**

| Ruta | Vista | Descripción |
|---|---|---|
| `/tabs/contratos` | `Contratos.tsx` | Listado y formulario CRUD de contratos municipales vigentes y conteo de alertas. |
| `/tabs/trazabilidad` | `Trazabilidad.tsx` | Historial de auditoría y trazabilidad de reportes y multas aplicadas. |
| `/tabs/admin` | `AdminPanel.tsx` | Panel de administración con accesos rápidos a gestión de usuarios, checklists, contratos y multas. |

### 2. Relaciones jerárquicas entre vistas

```text
Aplicación (IonApp + AuthProvider + IonReactRouter)
│
├── Rutas públicas
│   ├── /login (Inicio de sesión)
│   └── /register (Crear cuenta)
│
└── Rutas protegidas (/tabs/* -> MainTabs + AppShell)
    │
    ├── Vistas compartidas (Inspector y Administrador)
    │   ├── /tabs/home (Dashboard de inicio)
    │   ├── /tabs/nueva-fiscalizacion (Checklist + GPS + Evidencia)
    │   ├── /tabs/historial-reportes (Listado de reportes emitidos)
    │   └── /tabs/perfil (Datos del usuario y cierre de sesión)
    │
    └── Vistas exclusivas de Administrador (Guardia RequireAdmin)
        ├── /tabs/contratos (Gestión CRUD de contratos y alertas)
        ├── /tabs/trazabilidad (Auditoría de reportes y multas)
        └── /tabs/admin (Panel de administración)
```

### 3. Diferenciación de acceso según roles

| Funcionalidad / Vista | Inspector (`INSPECTOR`) | Administrador (`ADMIN`) |
|---|:---:|:---:|
| Iniciar sesión y editar perfil propio (`/tabs/perfil`) | ✓ | ✓ |
| Visualizar panel de inicio (`/tabs/home`) | ✓ | ✓ |
| Registrar nueva fiscalización con checklist y GPS (`/tabs/nueva-fiscalizacion`) | ✓ | ✓ |
| Consultar historial de reportes propios (`/tabs/historial-reportes`) | ✓ | ✓ (Global + Edición/Borrado) |
| Crear, editar y eliminar contratos (`/tabs/contratos`) | — | ✓ |
| Consultar trazabilidad global y multas (`/tabs/trazabilidad`) | — | ✓ |
| Acceder al panel de administración (`/tabs/admin`) | — | ✓ |

- **Protección en el Enrutador y en la Interfaz:** El componente `MainTabs` verifica la existencia de sesión activa (redirigiendo a `/login` si no existe), filtra dinámicamente las pestañas e ítems de menú mediante `navForRole(user.rol)`, y envuelve las rutas administrativas en el componente guardia `<RequireAdmin>`, el cual redirige automáticamente a `/tabs/home` si un usuario con rol `inspector` intenta ingresar manualmente por URL.

### 4. Flujos de tareas

**Task Flow 1: Ejecución de Fiscalización en Terreno (Inspector)**

```text
Inicio de sesión (/login)
          ↓
Validar credenciales y recibir JWT
          ↓
Ingresar a Nueva Fiscalización (/tabs/nueva-fiscalizacion)
          ↓
Seleccionar Contrato vigente e ingresar Asunto / Lugar
          ↓
Verificar ubicación GPS detectada
          ↓
Marcar ítems del Checklist (IonCheckbox)
          ↓
Adjuntar evidencia fotográfica e ingresar Observaciones
          ↓
Enviar Fiscalización (POST /api/fiscalizaciones)
          ↓
Redirección y visualización en Historial de Reportes (/tabs/historial-reportes)
```

**Task Flow 2: Gestión de Contratos y Auditoría de Trazabilidad (Administrador)**

```text
Inicio de sesión (/login)
          ↓
Revisar indicadores en Dashboard (/tabs/home)
          ↓
Abrir sección Contratos (/tabs/contratos)
          ↓
Crear o actualizar Contrato (Empresa, Giro, Presupuesto, Vigencia)
          ↓
Verificar conteo de alertas asociadas al contrato
          ↓
Ir a Historial y Trazabilidad (/tabs/trazabilidad)
          ↓
Auditar reportes emitidos y multas aplicadas por contrato
```

### 5. Puntos críticos de interacción

1. **Validación de formularios de autenticación y registro:** Los campos obligatorios, el formato de correo, la coincidencia de confirmación y la política de contraseña (mínimo 8 caracteres y un número) se validan antes de enviar la solicitud, mostrando bordes de alerta y mensajes claros bajo cada campo (evitando envíos vacíos o ambiguos).
2. **Protección contra escalación de rol en el registro:** El formulario de registro no permite que un usuario se auto-asigne permisos de `Administrador`, garantizando que toda cuenta nueva se registre bajo el rol operativo de `Inspector`.
3. **Captura de ubicación y evidencia en terreno:** El formulario de fiscalización informa explícitamente las coordenadas GPS detectadas y permite adjuntar fotografías y observaciones antes de confirmar el envío al servidor.
4. **Coherencia entre dispositivos (Móvil vs. Escritorio):** En pantallas móviles (`< 768px`) la navegación principal se presenta en una barra inferior (`IonTabBar`) de fácil alcance con el pulgar; en pantallas de escritorio (`>= 768px`), `AppShell` activa el encabezado superior institucional con botón de menú desplegable (`IonMenu`) y oculta la barra inferior, manteniendo exactamente las mismas rutas y permisos.

### 6. Justificación técnica

- **Usabilidad:** El uso de `AppShell` junto con componentes de `@ionic/react` proporciona controles consistentes, etiquetas visibles y áreas táctiles de `44px` a `48px` de altura mínima, facilitando la operación en terreno.
- **Eficiencia de interacción:** La evaluación de una fiscalización concentra en una sola vista (`NuevaFiscalizacion.tsx`) la selección del contrato, el checklist, la georreferenciación, la fotografía y las observaciones, reduciendo la cantidad de pasos para reportar un hallazgo.
- **Claridad estructural:** El código del frontend está organizado modularmente en `src/pages`, `src/components`, `src/routes`, `src/services`, `src/interfaces`, `src/context` y `src/theme`, separando la presentación visual del consumo de la API REST.
- **Escalabilidad:** La centralización de las rutas en `src/routes/AppRoutes.tsx`, la configuración declarativa del menú en `src/nav.ts` y los interceptores HTTP en `src/services/api.ts` permiten incorporar nuevas vistas o endpoints sin duplicar lógica de autenticación ni estilos.

---

## Bocetos UI/UX

El diseño visual y el prototipo interactivo fueron construidos manualmente en **Figma**, contemplando explícitamente las versiones **móvil y web**, así como los estados de validación de error en los formularios de inicio de sesión y registro:

- **Enlace público al prototipo en Figma:** [Figma — Prototipos Web y Móvil SIFCOM](https://www.figma.com/design/MJbonacpaS2avT47w2sBir/Prototipos-web?node-id=14-9&t=zaWmh2SCHCK5laF5-0)

### Vista general de pantallas prototipadas (Móvil y Web)

![Prototipos Web y Móvil de SIFCOM](./docs/prototipos-web.png)

### Diseño y justificación de los formularios de Registro e Inicio de Sesión

| Campo | Formulario | Carácter | Formato y validación aplicada | Justificación en el dominio |
|---|---|---|---|---|
| **Nombre completo** | Registro / Perfil | Obligatorio (`*`) | Texto no vacío (`min 2` caracteres). | Identifica al inspector o funcionario responsable en el acta y trazabilidad de cada fiscalización. |
| **Comuna** | Registro / Perfil | Obligatorio (`*`) | Selección desde catálogo oficial de comunas (`IonSelect`). | Asocia al funcionario con el territorio municipal donde realiza la supervisión. |
| **Correo electrónico** | Login / Registro | Obligatorio (`*`) | Formato estándar `usuario@dominio.cl` + confirmación de igualdad en registro. | Credencial única de autenticación e identificación institucional de la cuenta. |
| **Contraseña** | Login / Registro | Obligatorio (`*`) | Mínimo **8 caracteres** incluyendo al menos **1 número** + confirmación en registro. | Cumple condiciones de seguridad de acceso antes de aplicar hash `bcrypt` en el backend. |

---

## Tecnologías y herramientas

### Frontend

| Tecnología | Versión | Propósito en el proyecto |
|---|---|---|
| **React** | `19.0.0` | Construcción declarativa de la interfaz mediante componentes funcionales y Hooks (`useState`, `useEffect`, `useContext`). |
| **`@ionic/react` / `@ionic/react-router`** | `^9.0.0` | Componentes UI adaptables (`IonPage`, `IonContent`, `IonTabs`, `IonMenu`, `IonInput`, `IonSelect`, `IonCheckbox`, `IonButton`) e integración de rutas. |
| **React Router DOM** | `^6.30.0` | Gestión de rutas públicas, rutas protegidas y redirecciones según rol (`RequireAdmin`). |
| **TypeScript** | `~5.9.0` | Tipado estático de interfaces de dominio (`Contrato`, `Fiscalizacion`, `Multa`, `AuthUser`) y props. |
| **Axios** | `^1.20.0` | Cliente HTTP con interceptores para envío automático de token JWT (`Authorization: Bearer`) y manejo de errores. |
| **Chart.js / `react-chartjs-2`** | `^4.5.1` | Renderizado de gráficos en el panel de control (`Home.tsx`). |
| **Vite** | `^8.0.0` | Servidor de desarrollo con HMR y empaquetador de producción. |

### Estructura modular del código (`rama frontend`)

```text
sifcom/
├── docs/
│   └── prototipos-web.png       # Captura completa de los mockups móvil y web en Figma
├── public/                      # Iconos y logotipo institucional de SIFCOM
├── src/
│   ├── components/
│   │   └── AppShell.tsx         # Contenedor adaptable (Header Web + IonMenu / Vista Móvil)
│   ├── context/
│   │   └── AuthContext.tsx      # Estado global de sesión de usuario y rol
│   ├── data/
│   │   └── mock.ts              # Catálogo de comunas e ítems base de respaldo
│   ├── interfaces/
│   │   └── sifcom.ts            # Definición de interfaces TypeScript del dominio
│   ├── pages/
│   │   ├── Login.tsx            # Vista de inicio de sesión con validaciones visuales
│   │   ├── Register.tsx         # Vista de registro de usuario con validaciones
│   │   ├── Home.tsx             # Dashboard de presupuesto y multas por categoría
│   │   ├── NuevaFiscalizacion.tsx # Formulario de checklist, GPS, foto y observaciones
│   │   ├── HistorialReportes.tsx  # Historial de fiscalizaciones enviadas
│   │   ├── Contratos.tsx        # Gestión CRUD de contratos municipales (Admin)
│   │   ├── Trazabilidad.tsx     # Historial de auditoría y multas (Admin)
│   │   ├── AdminPanel.tsx       # Panel de administración (Admin)
│   │   └── Perfil.tsx           # Edición de datos personales y cierre de sesión
│   ├── routes/
│   │   └── AppRoutes.tsx        # Definición de rutas públicas, privadas y RequireAdmin
│   ├── services/
│   │   └── api.ts               # Configuración Axios, interceptores JWT y llamadas REST
│   ├── theme/
│   │   ├── auth.css             # Estilos de Login y Registro (móvil y split-screen web)
│   │   ├── Inicio.css           # Estilos de gráficos del Dashboard
│   │   └── sifcom.css           # Estilos del layout principal, tarjetas y formularios
│   ├── utils/
│   │   └── format.ts            # Formateadores de moneda (CLP), fechas y estados
│   ├── App.tsx                  # Componente raíz IonApp
│   ├── nav.ts                   # Configuración de ítems de navegación según rol
│   └── main.tsx                 # Punto de entrada de React
├── .env.example                 # Ejemplo de variable de entorno VITE_API_URL
├── index.html
├── ionic.config.json
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Instrucciones de instalación y ejecución

### 1. Requisitos previos
- **Node.js:** versión `20.19.0` o superior, o `22.12.0` o superior (requerido por Vite 8).
- **npm:** versión `10.x` o superior.
- *(Para funcionalidad completa con persistencia en base de datos)* Tener en ejecución el servidor de la rama **`backend`** en `http://localhost:4000`.

### 2. Clonar el repositorio y cambiar a la rama `frontend`

```bash
git clone https://github.com/nico0417/sifcom.git
cd sifcom
git checkout frontend
```

### 3. Configurar variables de entorno e instalar dependencias

```bash
cp .env.example .env
npm install
```

*(Por defecto, `.env.example` apunta a `VITE_API_URL=http://localhost:4000/api`).*

### 4. Ejecutar el servidor de desarrollo

```bash
npm run dev
```

La aplicación se abrirá en `http://localhost:5173`.

### 5. Cuentas de prueba (precargadas en la base de datos del Backend)

| Rol | Correo electrónico | Contraseña | Acceso |
|---|---|---|---|
| **Administrador Municipal** | `admin@sifcom.cl` | `Admin1234` | Acceso completo (`Home`, `Nueva Fiscalización`, `Historial`, `Contratos`, `Trazabilidad`, `Panel Admin`, `Perfil`). |
| **Inspector en Terreno** | `inspector@sifcom.cl` | `Inspector1234` | Acceso operativo (`Home`, `Nueva Fiscalización`, `Historial de Reportes`, `Perfil`). |

### 6. Compilar para producción

```bash
npm run build
npm run preview
```
