# Apurada Ribosomica

Juego educativo de traduccion ribosomal hecho con React + Vite.

Este proyecto fue desarrollado para la materia de Bioinformatica en la UNQ, primer cuatrimestre de 2026.

## Prerequisitos

- Node.js 20+
- NPM 9+
- Docker (para ejecutar en contenedor)

## Desarrollo

### Instalación

```bash
npm install
```

### Ejecutar en modo desarrollo

```bash
npm run dev
```

Ingresa en http://localhost:5173/

### Build para producción

```bash
npm run build
```

## Docker

### Construir la imagen

```bash
docker build -t apurada-ribosomica:latest .
```

### Ejecutar el contenedor

```bash
docker run -p 3000:3000 apurada-ribosomica:latest
```

Ingresa en http://localhost:3000/

### Con docker-compose

Si tienes docker-compose, puedes crear un archivo `docker-compose.yml`:

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000
    environment:
      - NODE_ENV=production
```

Y ejecutar:

```bash
docker-compose up
```