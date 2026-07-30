# ScholarLink (Proyecto)

> **ES**: Aplicación web creada con **React + Vite** para el proyecto **ScholarLink**.
>
> **EN**: Web application built with **React + Vite** for the **ScholarLink** project.

---

## 🇪🇸 Español

### Descripción
**ScholarLink** es una aplicación web (frontend) desarrollada con React y Vite. Este repositorio contiene el código del proyecto y su configuración de desarrollo.

### Características
- Interfaz construida con **React**.
- Empaquetado y servidor de desarrollo con **Vite** (HMR).
- Estilos con **Bootstrap**.
- Linting con **ESLint**.

### Tecnologías
- React
- Vite
- JavaScript (ESM)
- Bootstrap
- ESLint

### Requisitos
- **Node.js** (recomendado: versión compatible con Vite 7; ver `package-lock.json` / motores de Vite)
- npm (incluido con Node)

### Instalación y ejecución
1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Iniciar entorno de desarrollo:
   ```bash
   npm run dev
   ```
3. Compilar para producción:
   ```bash
   npm run build
   ```
4. Previsualizar build local:
   ```bash
   npm run preview
   ```

### Scripts disponibles
- `npm run dev` — Servidor de desarrollo
- `npm run build` — Build de producción
- `npm run preview` — Previsualización del build
- `npm run lint` — Ejecuta ESLint

### Estructura del proyecto (resumen)
- `src/` — Código fuente (componentes, páginas, etc.)
- `public/` — Archivos públicos estáticos (si aplica)
- `index.html` — Entrada principal
- `vite.config.js` — Configuración de Vite

### Variables de entorno
Si el proyecto requiere configuración por entorno, crea un archivo `.env` (no lo subas al repo) y documenta aquí las variables necesarias.

Ejemplo:
```bash
# .env
VITE_API_BASE_URL=http://localhost:3000
```

### Contribución
1. Crea una rama para tu cambio.
2. Realiza commits claros.
3. Abre un Pull Request describiendo el objetivo y evidencias (capturas/logs) si aplica.

---

## 🇺🇸 English

### Description
**ScholarLink** is a web application (frontend) built with React and Vite. This repository contains the project code and its development configuration.

### Features
- UI built with **React**.
- Bundling and dev server powered by **Vite** (HMR).
- Styling with **Bootstrap**.
- Linting with **ESLint**.

### Tech Stack
- React
- Vite
- JavaScript (ESM)
- Bootstrap
- ESLint

### Requirements
- **Node.js** (recommended: a version compatible with Vite 7; see `package-lock.json` / Vite engine requirements)
- npm (bundled with Node)

### Setup & Run
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start development server:
   ```bash
   npm run dev
   ```
3. Build for production:
   ```bash
   npm run build
   ```
4. Preview production build locally:
   ```bash
   npm run preview
   ```

### Available Scripts
- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run preview` — Preview the build
- `npm run lint` — Run ESLint

### Project structure (overview)
- `src/` — Source code (components, pages, etc.)
- `public/` — Static public assets (if any)
- `index.html` — App entry
- `vite.config.js` — Vite configuration

### Environment variables
If the project needs environment-based configuration, create a `.env` file (do not commit it) and document required variables here.

Example:
```bash
# .env
VITE_API_BASE_URL=http://localhost:3000
```

### Contributing
1. Create a branch for your change.
2. Write clear commits.
3. Open a Pull Request describing the goal and evidence (screenshots/logs) when applicable.

---

## License
No license file detected in this repository. If you intend to make the project reusable, add a `LICENSE` file (e.g., MIT) and update this section.