<div align="center">

# <img src="https://api.iconify.design/mdi:school-outline.svg?color=%23028ECC" width="28" valign="middle"> ScholarLink

**Digitalización del sistema de comunicación escolar entre docentes, administrativos, encargados legales y estudiantes**

<img src="https://img.shields.io/badge/-React-383635?style=flat-square&logo=react&logoColor=61DAFB" />
<img src="https://img.shields.io/badge/-Vite-028ECC?style=flat-square&logo=vite&logoColor=white" />
<img src="https://img.shields.io/badge/-Bootstrap-EC5E1E?style=flat-square&logo=bootstrap&logoColor=white" />
<img src="https://img.shields.io/badge/-Prueba%20de%20Concepto-FBBF02?style=flat-square" />

</div>

---

## <img src="https://api.iconify.design/mdi:file-document-outline.svg?color=%23028ECC" width="20" valign="middle"> Descripción

**ScholarLink** es una plataforma que centraliza y formaliza la comunicación escolar: tareas, avisos institucionales, mensajería y reportes disciplinarios, todo en un mismo lugar y con acceso diferenciado por rol. Surge como proyecto de análisis de requerimientos, donde se trabajó bajo la metodología **SCRUM** el levantamiento completo de objetivos, alcance, riesgos y factibilidad del sistema.

Este repositorio contiene la **prueba de concepto**: una aplicación frontend funcional que implementa los flujos definidos durante el análisis, con datos simulados para demostrar el comportamiento real de cada módulo sin depender de un backend.

## <img src="https://api.iconify.design/mdi:target.svg?color=%23EC5E1E" width="20" valign="middle"> Objetivo

Desarrollar una plataforma digital que mejore y formalice la comunicación entre docentes, personal administrativo y encargados legales de los estudiantes, permitiendo un seguimiento claro, eficiente y seguro del desempeño académico, disciplinario e informativo dentro de la institución.

## <img src="https://api.iconify.design/mdi:format-list-checks.svg?color=%23FBBF02" width="20" valign="middle"> Funcionalidades

| Módulo | Descripción |
|---|---|
| **Mensajería** | Comunicación directa entre docentes y encargados, con historial por conversación. |
| **Comunicados** | Avisos institucionales dirigidos a una sección, varias secciones o toda la institución. |
| **Actividades / Calendario** | Programación de tareas y evaluaciones por grupo, visibles automáticamente para encargados y estudiantes. |
| **Gestión de estudiantes y grupos** | Organización de la información académica por estudiante y por sección. |
| **Importación CSV** | Carga masiva de estudiantes y encargados desde un archivo CSV. |
| **Notificaciones** | Avisos automáticos ante nuevos mensajes o comunicados. |
| **Historial** | Seguimiento ordenado de avisos, tareas y observaciones por estudiante. |
| **Usuarios y roles** | Administración de cuentas y permisos por tipo de usuario. |
| **Registro de sesiones** | Trazabilidad de accesos al sistema. |

## <img src="https://api.iconify.design/mdi:account-group-outline.svg?color=%23028ECC" width="20" valign="middle"> Roles del sistema

- **Administrativo** — gestión total: usuarios, comunicados, importación de datos, reportes.
- **Docente** — grupos, actividades, mensajería, comunicados.
- **Encargado legal** — mensajería, comunicados, actividades y seguimiento del estudiante a cargo.
- **Estudiante** — consulta de tareas, comunicados y su propio grupo, sin acceso a mensajes privados.

## <img src="https://api.iconify.design/mdi:compass-outline.svg?color=%23EC5E1E" width="20" valign="middle"> Metodología

El proyecto se desarrolló bajo **SCRUM**, con entregables incrementales organizados por hitos — desde el análisis de requisitos y la definición de alcances hasta la construcción progresiva del prototipo funcional que contiene este repositorio.

## <img src="https://api.iconify.design/mdi:shield-check-outline.svg?color=%23FBBF02" width="20" valign="middle"> Consideraciones legales

El diseño del sistema contempla el cumplimiento de la **Ley N.º 8968** (Ley de Protección de la Persona frente al Tratamiento de sus Datos Personales, Costa Rica), dado que maneja información de menores de edad. Entre las medidas consideradas: autenticación por credenciales únicas, control de acceso por roles, cifrado de datos y confidencialidad de las comunicaciones privadas.

## <img src="https://api.iconify.design/mdi:tools.svg?color=%23028ECC" width="20" valign="middle"> Tecnologías

- **React 19** + **Vite** — interfaz y bundler
- **Bootstrap** — sistema de diseño de la interfaz
- **LocalStorage** — persistencia de sesión y datos en esta versión de prueba de concepto

## <img src="https://api.iconify.design/mdi:folder-outline.svg?color=%23EC5E1E" width="20" valign="middle"> Estructura del proyecto

```
src/
├── components/
│   ├── layout/          # Header, menú lateral
│   ├── panel/            # Panel principal
│   ├── util/              # Lógica de datos: usuarios, mensajes, comunicados,
│   │                       # notificaciones, historial, sesiones, autenticación
│   └── vistas/
│       ├── login/          # Login y selector de perfil
│       ├── usuarios/        # Gestión de usuarios y roles
│       ├── grupos/           # Gestión de grupos
│       ├── estudiantes/       # Gestión de estudiantes
│       ├── mensajes/           # Mensajería
│       ├── comunicaciones/      # Comunicados institucionales
│       ├── actividades/          # Tareas y calendario
│       ├── notificaciones/        # Notificaciones
│       ├── historial/              # Historial de seguimiento
│       ├── importar/                # Importación de datos vía CSV
│       ├── sesiones/                 # Registro de sesiones
│       └── perfil/                    # Perfil de usuario
```

## <img src="https://api.iconify.design/mdi:rocket-launch-outline.svg?color=%23FBBF02" width="20" valign="middle"> Instalación y ejecución

```bash
git clone https://github.com/kevinmirandaa/ScholarLink.git
cd ScholarLink
npm install
npm run dev
```

La app queda disponible en `http://localhost:5173`.

### Credenciales de prueba

En esta versión, cada usuario inicia sesión con su cédula tanto como usuario como contraseña:

| Rol | Cédula / Contraseña |
|---|---|
| Administrativo | 1 |
| Encargado legal | 2 |
| Docente | 3 |
| Estudiante | 4 |

## <img src="https://api.iconify.design/mdi:account-multiple-outline.svg?color=%23028ECC" width="20" valign="middle"> Equipo

Proyecto desarrollado en equipo para el curso Requerimientos de Software.

**Kevin Miranda Méndez**
