# Fernando Cortes - Technical Artist Portfolio

Astro, Tailwind CSS v4 y Three.js para un portafolio estatico listo para GitHub Pages.

## Scripts

```sh
npm install
npm run dev
npm run build
npm run preview
```

## GitHub Pages

El despliegue vive en `.github/workflows/deploy.yml` y usa la accion oficial de Astro. En GitHub, configura Pages con **GitHub Actions** como source.

Este repo usa el patron `TaCodeC.github.io`, asi que no necesita `base` en `astro.config.mjs`. Si se mantiene el dominio personalizado, `public/CNAME` publica `fernandocortes.dev`.
