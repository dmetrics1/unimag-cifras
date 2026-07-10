# Publicar en GitHub + GitHub Pages

Guía paso a paso para subir este proyecto y dejarlo publicado como sitio estático.
El repositorio local ya está inicializado, con el autor configurado y el primer
commit hecho en la rama `main`. Solo faltan los pasos remotos (los haces tú con
tus credenciales).

> Autor de los commits (ya configurado, solo para este repo):
> `dm0025900 <dm0025900@gmail.com>`. No hay coautores.

---

## 1. Crear el repositorio en GitHub

Entra a <https://github.com/new> y crea un repositorio **público** llamado
`unimag-cifras` (sin README, sin .gitignore, sin licencia: el repo local ya los
trae). Si ya lo creaste, salta al paso 2.

---

## 2. Conectar el remoto

Desde la carpeta del proyecto:

```bash
git remote add origin https://github.com/dmetrics1/unimag-cifras.git
```

Si ya existe el remoto y quieres reemplazarlo:

```bash
git remote set-url origin https://github.com/dmetrics1/unimag-cifras.git
```

Verifica:

```bash
git remote -v
```

---

## 3. Subir el código (push)

```bash
git push -u origin main
```

Si te pide autenticación, usa tu usuario de GitHub y un **token personal**
(Settings → Developer settings → Personal access tokens) como contraseña.

> Nota: el repositorio usa la rama `main`. Si tu GitHub por defecto usa `master`,
> igual funciona: este comando sube y crea `main` en el remoto.

---

## 4. Activar GitHub Pages

El repositorio incluye un workflow (`.github/workflows/deploy-pages.yml`) que
despliega el sitio automáticamente. En **Settings → Pages → Source**, elige
**GitHub Actions**. Con eso, cada push a `main` publica el sitio.

(Alternativa sin workflow: Source → **Deploy from a branch** → `main` / `/ (root)`.)

Espera 1–2 minutos tras el push. La URL publicada es:

```
https://dmetrics1.github.io/unimag-cifras/
```

Puedes ver el avance del despliegue en la pestaña **Actions** del repo. Al
terminar, ábrela: debe cargar el tablero con la portada, los factores y los datos.

---

## 5. Actualizaciones futuras

Cada vez que cambies algo:

```bash
git add -A
git commit -m "Descripción del cambio"
git push
```

Pages se vuelve a publicar solo en unos segundos.

---

## Notas

- El sitio carga `data/datos_indicadores.json` con `fetch`, por eso ese archivo
  **sí** está versionado. La `Matriz_...xlsx` **no** se sube (queda local).
- El archivo `.nojekyll` en la raíz evita que Pages procese el sitio con Jekyll.
- Todas las rutas son relativas, así que el sitio funciona bajo el subpath
  `usuario.github.io/unimag-cifras/` sin cambios.
