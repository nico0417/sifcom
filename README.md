# SIFCOM — Sistema de Fiscalización en Terreno de Contratos Municipales

## Presentado por
- Nicolás Alejandro Leiva Aguilar
- Ricardo Andres Pasten Oblitas

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
9. [Bocetos UI/UX](#bocetos-uiux)
10. [Tecnologías y herramientas](#tecnologías-y-herramientas)

---

## Descripción general del sistema

**SIFCOM** (Sistema de Fiscalización de Contratos Municipales) es una plataforma compuesta por una aplicación **móvil** (para inspectores municipales) y una aplicación **web** (para administradores municipales) que permite digitalizar, estandarizar y georreferenciar la supervisión en terreno de contratos de servicios externalizados (recolección de basura, mantenimiento de áreas verdes, obras, entre otros).

La aplicación centraliza en tiempo real la evidencia recogida por los inspectores (checklists, fotografías georreferenciadas y observaciones) para que los administradores municipales puedan monitorear el cumplimiento contractual, generar alertas ante incumplimientos y respaldar con evidencia la aplicación de multas o la evaluación de futuras licitaciones.

---

## Justificación del problema

A nivel municipal, existe una carencia generalizada para medir la eficiencia y el impacto de la gestión, lo que impide la toma de decisiones basada en evidencia. Uno de los focos más críticos son los problemas en la gestión de contratos de servicios externalizados (ej. recolección de basura, mantenimiento de áreas verdes, obras).

Las municipalidades enfrentan graves dificultades para supervisar y controlar eficazmente la calidad de estos servicios en terreno, lo que deriva en un mal servicio entregado a la ciudadanía a pesar de los altos costos financieros invertidos.

En este contexto, el problema abordado por el proyecto corresponde a la necesidad de digitalizar, estandarizar y georreferenciar la recolección de evidencia empírica en terreno, consolidando esta información en tiempo real para facilitar la aplicación de multas justificadas o mejoras en las licitaciones. El desarrollo de una plataforma web (para administración) y móvil (para inspectores) permitirá centralizar la gestión y garantizar la transparencia del cumplimiento de los contratos.

> Fuentes: Guía Metodológica de Calidad de Servicio del Ministerio de Hacienda; documentación sobre Desafíos Públicos Locales.

---

## Objetivos del proyecto

### Objetivo general
Desarrollar una plataforma web y móvil que permita digitalizar y centralizar la fiscalización en terreno de contratos municipales, facilitando la trazabilidad de la evidencia y la toma de decisiones basada en datos.

### Objetivos específicos
- Permitir a los inspectores completar checklists de fiscalización y capturar evidencia fotográfica georreferenciada directamente desde el dispositivo móvil.
- Consolidar en un panel administrativo el nivel de cumplimiento de los contratos vigentes, con alertas automáticas ante incumplimientos.
- Garantizar la trazabilidad de las fiscalizaciones realizadas, permitiendo su consulta por fecha, contrato o inspector.
- Diferenciar el acceso y las funcionalidades disponibles según el rol del usuario autenticado (inspector / administrador).
- Reducir el tiempo y la dependencia de registros en papel durante el proceso de fiscalización en terreno.

---

## Usuarios objetivo (Quién usará la aplicación)

La aplicación considera dos grupos principales de usuarios: **Inspectores en Terreno** y **Administradores Municipales**.

### Inspectores en Terreno
Son el personal operativo desplegado en la comuna. Requieren interfaces rápidas, intuitivas y adaptadas para su uso en exteriores, a menudo bajo condiciones de luz solar intensa o **conectividad intermitente**. Necesitan reducir el tiempo que dedican a redactar informes en papel y agilizar la captura de pruebas (fotos y GPS).

### Administradores Municipales
Son los encargados de gestionar los presupuestos y evaluar a las empresas contratistas. Operan desde oficinas gubernamentales utilizando computadores de escritorio. Necesitan visualizar datos consolidados, métricas de cumplimiento y recibir alertas tempranas sobre servicios deficientes para tomar decisiones estratégicas.

---

## Roles del Sistema

- **Inspector en Terreno**: usuario móvil encargado de acudir a los puntos de la comuna, completar checklists y levantar evidencia fotográfica.
- **Administrador Municipal**: usuario web encargado de crear pautas, asignar fiscalizaciones y monitorear el desempeño global de los contratos.

---

## Proto-personas

> Nota: las siguientes proto-personas corresponden a caracterizaciones preliminares basadas en fuentes secundarias (Guía Metodológica de Calidad de Servicio del Ministerio de Hacienda y Desafíos Públicos Locales) y **no representan resultados de entrevistas a usuarios reales**.

### Proto-persona 1: El Inspector Operativo

**Nombre ficticio:** Carlos
**Tipo de usuario o rol:** Inspector en Terreno

**Características generales:** funcionario de 45 años. Realiza sus rondas en camioneta o a pie. Acostumbra llevar registros en libretas, lo que retrasa su flujo de trabajo.

**Necesidades principales:** reportar el estado de un servicio in situ mediante toques rápidos en la pantalla, sin escribir textos largos.

**Objetivos de uso:** validar el estado de los servicios, tomar fotografías como prueba irrefutable y terminar su ruta eficientemente.

**Dificultades o puntos de frustración:** perder anotaciones, lidiar con interfaces móviles complejas al sol, o que los contratistas rechacen las multas por falta de pruebas concretas.

**Dispositivo y contexto:** smartphone corporativo de gama media, uso al aire libre.

---

### Proto-persona 2: La Estratega Administrativa

**Nombre ficticio:** Valeria
**Tipo de usuario o rol:** Administrador Municipal

**Características generales:** jefa de Departamento de 38 años. Debe rendir cuentas sobre el presupuesto invertido en licitaciones y responder a los reclamos ciudadanos.

**Necesidades principales:** tener una vista panorámica y en tiempo real del cumplimiento de las empresas externas.

**Objetivos de uso:** configurar checklists, monitorear el rendimiento mediante dashboards y justificar la aplicación de sanciones con evidencia clara.

**Dificultades o puntos de frustración:** recibir reclamos por servicios no prestados y carecer de información centralizada para verificar si la empresa realmente ejecutó el trabajo.

**Dispositivo y contexto:** computador de escritorio en oficina municipal.

---

## Requerimientos

### Requerimientos funcionales por rol

| ID | Requerimiento funcional | Rol |
|---|---|---|
| **RF-01** | El sistema debe permitir crear listas de verificación (checklists) dinámicas y asignarlas a contratos específicos. | Administrador |
| **RF-02** | El sistema debe proveer un panel de control (dashboard) que consolide el nivel de cumplimiento global y el estado de los contratos. | Administrador |
| **RF-03** | El sistema debe generar alertas visuales automáticas cuando una fiscalización obtenga un porcentaje de cumplimiento inferior al umbral definido. | Administrador |
| **RF-04** | El sistema debe permitir completar las pautas asignadas marcando el estado de cumplimiento de cada ítem desde la aplicación móvil. | Inspector |
| **RF-05** | El sistema debe permitir capturar fotografías georreferenciadas (GPS) y anexarlas automáticamente a un ítem fiscalizado. | Inspector |
| **RF-06** | El sistema debe permitir ingresar comentarios u observaciones breves in situ para detallar irregularidades encontradas. | Inspector |
| **RF-07** | El sistema debe permitir consultar el historial y trazabilidad de inspecciones filtrando por fecha, contrato o inspector. | Ambos |

### Funcionalidades transversales

Estas funcionalidades son necesarias para el funcionamiento general de la aplicación, pero no forman parte de los siete requerimientos funcionales principales del dominio.

- **FT-01:** el sistema deberá permitir el registro de usuarios.
- **FT-02:** el sistema deberá permitir iniciar sesión mediante credenciales.
- **FT-03:** el sistema deberá restringir las funcionalidades de acuerdo con el rol del usuario autenticado.

### Requerimientos no funcionales

| ID | Categoría | Descripción |
|---|---|---|
| **RNF-01** | Arquitectura | El frontend debe usar componentes nativos de Ionic y el despliegue general (frontend, backend, BD) debe orquestarse con Docker y Docker-compose. |
| **RNF-02** | Seguridad | Las contraseñas deben cifrarse con bcrypt y la API debe protegerse mediante autenticación JWT y prevención de SQL Injection. |
| **RNF-03** | Usabilidad | La interfaz móvil del inspector debe poseer áreas táctiles amplias para facilitar su uso a una sola mano en exteriores. |
| **RNF-04** | Rendimiento | El tiempo de sincronización de una fiscalización desde el dispositivo a la base de datos no debe superar los 5 segundos bajo conectividad estable. |
| **RNF-05** | Disponibilidad | La aplicación móvil debe permitir capturar checklists y fotografías **sin conexión a internet**, almacenando la información localmente y sincronizándola automáticamente con el servidor en cuanto se recupere la conectividad, sin pérdida de evidencia. |

---

## Arquitectura de Navegación

### 1. Rutas principales y secundarias

**Rutas públicas**

| Ruta | Descripción |
|---|---|
| `/login` | Inicio de sesión. |
| `/registro` | Creación de cuentas. |

**Rutas protegidas (Inspector)**

| Ruta | Descripción |
|---|---|
| `/inspector/inicio` | Resumen de pautas asignadas para el día. |
| `/inspector/pautas` | Listado completo de pautas pendientes. |
| `/inspector/pautas/:id` | Formulario de checklist y captura de fotos. |
| `/inspector/historial` | Fiscalizaciones completadas por el usuario. |

**Rutas protegidas (Administrador)**

| Ruta | Descripción |
|---|---|
| `/admin/inicio` | Dashboard de métricas y alertas. |
| `/admin/contratos` | Gestión de empresas y contratos vigentes. |
| `/admin/pautas` | Creación y asignación de checklists. |
| `/admin/historial` | Auditoría global de todas las fiscalizaciones. |

### 2. Relaciones jerárquicas entre vistas

```text
Aplicación
│
├── Rutas públicas
│   ├── Login
│   └── Registro
│
└── Rutas protegidas
    │
    ├── Inspector
    │   ├── Inicio (pautas del día)
    │   ├── Pautas pendientes
    │   │   └── Detalle de pauta (checklist + fotos GPS)
    │   └── Historial
    │
    └── Administrador
        ├── Inicio (dashboard de alertas)
        ├── Contratos
        ├── Pautas (creación y asignación)
        └── Historial (auditoría global)
```

### 3. Diferenciación de acceso según roles

| Funcionalidad | Inspector | Administrador |
|---|:---:|:---:|
| Ver pautas asignadas | ✓ | — |
| Completar checklist | ✓ | — |
| Capturar foto georreferenciada | ✓ | — |
| Agregar observaciones | ✓ | — |
| Ver historial propio | ✓ | — |
| Crear/editar contratos | — | ✓ |
| Crear/asignar pautas | — | ✓ |
| Ver dashboard de cumplimiento | — | ✓ |
| Auditar historial global | — | ✓ |

**Inspector:** solo tiene acceso a visualizar las pautas que se le han asignado, completarlas, adjuntar fotos y ver su propio historial. No puede crear contratos ni modificar pautas maestras.

**Administrador:** tiene acceso global para gestionar contratos, crear checklists, ver dashboards y auditar a todos los inspectores. No llena pautas en terreno.

### 4. Flujos de tareas

**Task Flow 1: Ejecución de Fiscalización en Terreno (Inspector)**

```text
Inicio de sesión
      ↓
Ver pautas del día
      ↓
Seleccionar pauta pendiente
      ↓
Marcar ítems (Cumple / No Cumple)
      ↓
¿Hay irregularidad?
      ↓
     Sí
      ↓
Capturar foto con GPS
      ↓
Agregar nota breve
      ↓
Enviar fiscalización
      ↓
Ver confirmación de sincronización
```

**Task Flow 2: Monitoreo y Creación de Pautas (Administrador)**

```text
Inicio de sesión
      ↓
Revisar dashboard de alertas
      ↓
Ir a gestión de pautas
      ↓
Crear nueva pauta dinámica
      ↓
Asignar pauta a un contrato / inspector
      ↓
Guardar
      ↓
Pauta disponible para el dispositivo móvil
```

### 5. Puntos críticos de interacción

1. **Captura fotográfica y GPS:** se distinguen dos fallas posibles, cada una con una respuesta distinta:
   - **Permisos denegados o desactivados** (cámara/ubicación): la interfaz debe notificar claramente al inspector y redirigirlo a la configuración del dispositivo/app para reactivarlos, ya que sin ellos no es posible capturar evidencia.
   - **GPS sin señal o precisión insuficiente** (ej. interior de un recinto, zona con mala cobertura): el sistema no debe bloquear la captura de la foto. Debe permitir tomarla y marcarla como *"pendiente de georreferenciación"*, reintentando obtener las coordenadas en segundo plano y completándolas automáticamente en cuanto haya señal (aprovechando la misma lógica de sincronización diferida de RNF-05). El inspector debe ver un aviso indicando que la ubicación quedó pendiente, para que no asuma que la evidencia ya es válida.
2. **Sincronización de datos:** enviar los datos del checklist con imágenes puede fallar si la conexión a internet es inestable en terreno. Se debe proveer retroalimentación visual (spinners/loaders) clara, además de la persistencia local definida en RNF-05.
3. **Dashboard administrativo:** la sobrecarga visual al mostrar múltiples contratos puede ser un problema. Se requiere un diseño limpio y el uso de gráficos resumidos antes del desglose en tablas.

### 6. Justificación técnica

- **Usabilidad:** la navegación móvil del inspector se basa en Tabs, priorizando accesos directos a las tareas más frecuentes (pautas del día, captura de evidencia) con áreas táctiles amplias, coherente con RNF-03.
- **Eficiencia de interacción:** el flujo de fiscalización evita pasos innecesarios entre marcar un ítem y capturar evidencia, reduciendo el tiempo que el inspector permanece expuesto en terreno.
- **Claridad estructural:** la separación de rutas mediante `react-router` (y `@ionic/react-router`) garantiza que la navegación móvil (Tabs, rol Inspector) y la navegación web (Sidebar, rol Administrador) ofrezcan la mejor experiencia según el dispositivo, evitando que funcionalidades administrativas se filtren hacia la app del inspector.
- **Escalabilidad:** al limitar el acceso por rol desde el enrutador (en vez de ocultar solo visualmente componentes), la arquitectura permite agregar nuevos roles o funcionalidades (ej. un rol de supervisor) sin reestructurar la navegación existente.

---

## Bocetos UI/UX

[Figma - Prototipo de UI/UX](https://www.figma.com/design/yoc5pehmU9PGZSjwTFNxPU/Proyecto---Web-Movil?node-id=0-1&p=f&t=B8jeTx6zWYywgnmk-0)

---

## Tecnologías y herramientas

### Frontend
| Tecnología | Propósito |
|---|---|
| React | Librería base para la construcción de componentes. |
| `@ionic/react` | Componentes UI nativos optimizados para móvil y web (`IonPage`, `IonContent`, `IonTabs`, etc.). |
| `react-router-dom` / `@ionic/react-router` | Gestión de rutas públicas, protegidas y redirecciones obligatorias. |
| Tailwind CSS | Estilización modular sin afectar el scope global. |
| Axios / Fetch | Consumo de la API REST. |

### Despliegue
- Docker y docker-compose (RNF-01), para orquestar frontend, backend y base de datos.
