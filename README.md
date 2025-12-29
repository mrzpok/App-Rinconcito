# Internal PMS app

Aplicación de gestión para El Rinconcito, lista para ejecutarse en tu propio servidor sin dependencias de Vercel ni v0.app.

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

### Cómo instalarlo en tu propio servidor (PM2 + Next.js)

Si quieres alojar el sitio por tu cuenta (por ejemplo en un servidor Linux con acceso SSH), sigue estos pasos rápidos:

1) **Prepara el servidor**
   - Instala Node.js 20+ y `pnpm` (o `npm` si prefieres). En Ubuntu, por ejemplo:
     ```bash
     curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
     sudo apt-get install -y nodejs
     corepack enable && corepack prepare pnpm@latest --activate
     ```
   - SQLite viene preconfigurado con la librería `better-sqlite3`, no necesitas banderas experimentales.
   - Crea la carpeta de la app, por ejemplo `/home/staff.rinconcito.co/public_html`, y un subdirectorio `logs` si usarás PM2.

2) **Obtén el código**
   - Opción rápida: clona el repo directamente en el servidor:
     ```bash
     git clone <tu-url-git> /home/staff.rinconcito.co/public_html
     cd /home/staff.rinconcito.co/public_html
     ```
   - Opción alternativa: desarrolla localmente y sube los archivos con `rsync` o SFTP manteniendo la misma estructura.

3) **Configura variables y dependencias**
   - Copia cualquier archivo `.env.example` a `.env` y ajusta las variables (por ejemplo, la ruta a la base SQLite si decides moverla).
   - Instala dependencias y genera el build de producción:
     ```bash
     pnpm install
     pnpm run build
     ```

4) **Arranca en producción con PM2**
   - El repositorio incluye `ecosystem.config.js` con una configuración lista para Next.js. Desde la raíz del proyecto ejecuta:
     ```bash
     pnpm dlx pm2 start ecosystem.config.js
     pnpm dlx pm2 save
     ```
   - Los logs se escribirán en `/home/staff.rinconcito.co/public_html/logs/`. Puedes verlos con:
     ```bash
     pnpm dlx pm2 logs rinconcito
     ```

5) **Actualiza despliegues**
   - Para nuevas versiones: `git pull`, luego `pnpm install` (si cambian dependencias) y `pnpm run build`. Reinicia con:
     ```bash
     pnpm dlx pm2 restart rinconcito
     ```

6) **Si prefieres sin PM2**
   - Puedes lanzar el servidor directamente en el puerto que definas:
     ```bash
     pnpm install
     pnpm run build
     pnpm start -- -p 3002
     ```
  - Usa un servicio del sistema (systemd) o un proxy inverso como Nginx para exponer el puerto públicamente.

## Accesos y roles

- **Super administrador:** `admin@rinconcito.co` / `PAssword2@!!7` (accede a `/admin` y controla todo el panel).
- **Colaborador:** `colaborador@rinconcito.co` / `colaborador` (ve sus tareas y puede registrar movimientos de inventario en su ubicación).
- **Housekeeper:** `housekeeper@rinconcito.co` / `housekeeper` (puede crear, mover y reabastecer inventario además de actualizar tareas de limpieza).

Cada finalización de tarea solicita URL de foto como evidencia y los movimientos de inventario quedan registrados con la ubicación de origen y destino.
