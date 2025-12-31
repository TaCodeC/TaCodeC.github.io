# Graphics Programmer Portfolio

Portfolio profesional creado con Astro, React, ThreeJS y Tailwind CSS.

## 🚀 Stack Tecnológico

- **Astro** - Framework web moderno
- **React** - Componentes interactivos
- **ThreeJS** - Gráficos 3D y WebGL
- **@react-three/fiber** - React renderer para Three.js
- **@react-three/drei** - Componentes helper para R3F
- **Tailwind CSS** - Framework de estilos
- **TypeScript** - Tipado estático
- **GLSL** - Shaders personalizados

## 🛠️ Comandos

| Comando                   | Acción                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Instala dependencias                             |
| `npm run dev`             | Inicia servidor de desarrollo en `localhost:4321`|
| `npm run build`           | Construye el sitio para producción en `./dist/`  |
| `npm run preview`         | Vista previa de la build antes de desplegar      |
| `npm run astro ...`       | Ejecuta comandos CLI de Astro                    |
| `npm run check`           | Verifica tipos de TypeScript                     |

## 📁 Estructura del Proyecto

```
/
├── public/               # Archivos estáticos
│   └── CNAME            # Configuración de dominio
├── src/
│   ├── components/
│   │   ├── three/       # Componentes 3D
│   │   │   ├── Scene3D.tsx
│   │   │   └── ShaderMaterial.tsx
│   │   └── ui/          # Componentes UI
│   ├── layouts/         # Layouts de página
│   │   └── BaseLayout.astro
│   ├── pages/           # Páginas del sitio
│   │   └── index.astro
│   ├── shaders/         # Shaders GLSL
│   │   ├── example.vert
│   │   └── example.frag
│   ├── assets/          # Modelos, texturas, imágenes
│   └── styles/          # Estilos globales
│       └── global.css
└── package.json
```

## 🎨 Características

- ✅ Diseño moderno con tema oscuro
- ✅ Escena 3D interactiva con ThreeJS
- ✅ Shaders personalizados GLSL
- ✅ Soporte completo para TypeScript
- ✅ Componentes React con Three.js
- ✅ Estilos con Tailwind CSS
- ✅ Efectos glassmorphism
- ✅ Optimizado para rendimiento

## 🚀 Despliegue en GitHub Pages

1. Construye el proyecto: `npm run build`
2. El contenido en `dist/` estará listo para desplegar
3. GitHub Pages publicará automáticamente en `fernandocortes.dev`

## 📝 Próximos Pasos

1. Agrega tus proyectos en la sección de proyectos
2. Personaliza los shaders con tus efectos
3. Importa modelos 3D en formato GLTF/GLB
4. Crea páginas adicionales para cada proyecto
5. Agrega animaciones y transiciones
