# 🛡️ A-Wallet (Sovereign Hybrid Wallet)

> **Estado del Proyecto:** Activo / MVP 🟢  
> **Versión:** 1.0.0  

**A-Wallet** es una billetera financiera híbrida y *no-custodial* de criptoactivos, diseñada para administrar saldos y transacciones a través de múltiples redes blockchain (Solana, Bitcoin, BNB) desde una única interfaz maestra. 

---

## 1. 📖 Descripción del proyecto

### ¿Qué es el proyecto?
A-Wallet es una plataforma web completa que simula un ecosistema financiero descentralizado. Provee a los usuarios de una bóveda criptográfica para gestionar sus balances de forma local y segura, apoyándose en un backend robusto para registrar la inmutabilidad de las transacciones.

### ¿Qué problema resuelve?
Simplifica la experiencia de gestionar criptoactivos en redes dispares (Layer 1s). Tradicionalmente, un usuario requiere múltiples aplicaciones o extensiones (Phantom, MetaMask, Electrum) para manejar diferentes monedas. A-Wallet unifica la experiencia en un solo dashboard.

### Propósito
Demostrar un dominio avanzado en arquitectura de software (**Clean Architecture**), seguridad en cliente (*Stateless Auth*) y orquestación con contenedores, creando una plataforma escalable y de grado empresarial.

### Funcionalidades principales
- 🔑 **Creación e importación de llave (Frase semilla / PIN).**
- 💰 **Visualización de Balances Multi-red (SOL, BTC, BNB).**
- 💸 **Transferencias y simulación de envíos con validación estricta de saldo.**
- 📊 **Historial de transacciones inmutable.**
- 🔒 **Módulo avanzado de seguridad (Bloqueo automático, límite de intentos y purgado local).**

### Usuarios del sistema
- **Usuarios finales (Holders):** Personas que desean enviar, recibir y almacenar fondos de forma descentralizada sin depender de un banco central (Custodio).

---

## 2. 🛠️ Tecnologías utilizadas

El ecosistema está construido bajo un enfoque **Full-Stack Híbrido**:

| Capa | Tecnología / Framework | Propósito |
|---|---|---|
| **Frontend** | React / Next.js (TypeScript) | UI, enrutamiento MVC y renderizado. |
| **Estilos** | Tailwind CSS / Lucide Icons | Sistema de diseño atómico y moderno. |
| **Estado Global** | Zustand | Persistencia local y control de sesión (No-custodial). |
| **Backend** | .NET 8 / C# (Web API) | Core de negocio y validación de reglas transaccionales. |
| **Arquitectura** | Clean Architecture | Separación en capas (API, Application, Domain, Infra). |
| **Base de Datos** | SQL Server (T-SQL) | Persistencia relacional de transacciones. |
| **ORM** | Entity Framework Core | Mapeo objeto-relacional y Unit of Work. |
| **Seguridad** | JWT (JSON Web Tokens) + SHA256 | Autenticación stateless y hashing de PIN. |
| **Orquestación**| Docker & Docker Compose | Contenedorización de todo el entorno. |

---

## 3. 🏗️ Arquitectura del proyecto

El backend de A-Wallet respeta estrictamente los principios **SOLID** y el patrón de **Clean Architecture**:

1. **`Wallet.Domain` (Capa Central):** Contiene las entidades puras de negocio (`Usuario`, `Cuenta`, `Transaccion`) y los contratos/interfaces (`IUnitOfWork`, repositorios). No depende de nada.
2. **`Wallet.Application` (Casos de Uso):** Contiene la lógica orquestadora (`AuthService`, `TransactionService`) y los DTOs. Depende únicamente del Dominio.
3. **`Wallet.Infrastructure` (Implementación):** Conecta con el mundo exterior. Contiene el `ApplicationDbContext` (EF Core) y las clases concretas de repositorios. Depende de Application.
4. **`Wallet.API` (Controladores):** Expone los endpoints REST (`AuthController`, `TransactionsController`). Inyecta los servicios y gestiona los middlewares (Autenticación JWT, Swagger).

El Frontend sigue un patrón **MVC del lado del cliente**, aislando vistas (`app/`), componentes reutilizables (`components/`), hooks, y la capa de almacenamiento (`lib/store/`).

---

## 4. 📂 Estructura del proyecto

```text
a-wallet/
├── api/                             # Backend C# (.NET 8)
│   ├── src/
│   │   ├── Wallet.API/              # Controladores REST, Program.cs, config JWT
│   │   ├── Wallet.Application/      # DTOs, Servicios (AuthService, CuentaService)
│   │   ├── Wallet.Domain/           # Entidades (Usuario, Cuenta) e Interfaces
│   │   └── Wallet.Infrastructure/   # DBContext, Repositorios, EF Core
│   └── Dockerfile                   # Receta Docker para compilar y ejecutar la API
├── web/                             # Frontend Next.js (React)
│   ├── src/
│   │   ├── app/                     # Vistas / Rutas de Next.js (Dashboard, Settings, etc.)
│   │   ├── components/              # Componentes UI (Layouts, Modal, Buttons)
│   │   ├── lib/                     # Utilidades, Zustand Stores, Axios API Services
│   │   └── types/                   # Definiciones TS
│   └── package.json                 # Dependencias Node.js
├── script.sql                       # Esquema T-SQL y configuración de la Base de Datos
├── docker-compose.yml               # Orquestación de contenedores (DB, API, Frontend)
└── start.ps1                        # Script Powershell para despliegue automatizado
```

---

## 5. ⚙️ Requisitos previos

Para ejecutar este proyecto de forma local necesitarás:
- **Docker Desktop** (Engine en ejecución).
- **PowerShell** (Windows) o Bash (Linux/Mac) para correr los scripts de inicio.
- Puerto **3000** libre (Para el Frontend Next.js).
- Puerto **8080** libre (Para el Backend .NET).
- Puerto **1433** libre (Para la BD SQL Server interna del docker-compose).

---

## 6. 🚀 Instalación y Despliegue

La forma más sencilla de levantar A-Wallet es utilizar la orquestación automatizada.

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/Gerodron/a-wallet-ap.git
   cd a-wallet-ap
   ```

2. **Despliegue automatizado** (Windows)
   Abre una terminal PowerShell y ejecuta el script de arranque, que compilará el código, levantará SQL Server y expondrá los servicios:
   ```powershell
   .\start.ps1
   ```

3. **Verificación de servicios**
   El script validará automáticamente que los sistemas estén vivos, pero puedes revisarlo manualmente en:
   - 🌐 **Frontend (Web):** [http://localhost:3000](http://localhost:3000)
   - 🔌 **Backend (API):** [http://localhost:8080](http://localhost:8080)
   - 📚 **Documentación (Swagger):** [http://localhost:8080/swagger/index.html](http://localhost:8080/swagger/index.html)

> [!TIP]
> Si deseas detener todos los contenedores y liberar puertos, ejecuta: `docker compose down`.

---

## 7. 🎛️ Configuración

- **Configuración del Backend (`appsettings.json`)**: El backend lee las variables de entorno inyectadas por el `docker-compose.yml`. El *Connection String* hacia SQL Server y el JWT Secret key se configuran automáticamente en tiempo de ejecución.
- **Configuración T-SQL (`script.sql`)**: Este archivo es montado en el contenedor de SQL Server durante el arranque para generar automáticamente las tablas, constraints e índices iniciales sin necesidad de correr Entity Framework `update-database` manual.

---

## 8. 🗄️ Base de datos

El motor utilizado es **Microsoft SQL Server**.
Al levantar con Docker Compose, un contenedor de SQL Server se inicia e importa automáticamente el `script.sql`.

**Tablas Principales:**
- `Usuarios`: Almacena el Hash del PIN local y la identidad del cliente.
- `Cuentas`: Almacena el historial de saldos en las diferentes redes por cada usuario.
- `Transacciones`: Registro inmutable (Append-only) de las operaciones. 
- `LogsSeguridad`: Auditoría de accesos.

---

## 9. 📱 Flujo general del sistema

1. **Usuario interactúa (Front):** El cliente ingresa su PIN en la web. `Zustand` valida localmente su estado.
2. **Cliente HTTP (Axios):** Despacha la solicitud al endpoint `/api/auth/login`.
3. **Controlador y Servicio (Back):** El `AuthController` recibe el request, delega al `AuthService` para hashear el PIN e interactuar con el `UsuarioRepository`.
4. **Respuesta de la BD:** Si las credenciales coinciden, se emite un `JWT`.
5. **Autenticación (Front):** El Frontend guarda el `JWT` en memoria (`Zustand`), bloqueando rutas no autorizadas mediante `CoreLayout.tsx`. A partir de aquí, las llamadas llevan el header `Authorization: Bearer <Token>`.

---

## 10. 📝 Módulo Ajustes (Settings)

Este módulo gestiona preferencias de alta seguridad de la wallet:
- **Autobloqueo Inactividad:** Controla si el temporizador inyecta un candado a la UI tras 15 minutos.
- **Reintentos Fallidos:** Monitorea los errores de PIN consecutivos antes del login. Si superas el límite, ejecuta `localStorage.clear()` purgando tus llaves para evitar un ataque de fuerza bruta.
- **Privacidad UI:** Permite ocultar los balances con `***` visualmente.
- **Eliminar Billetera:** Purgado radical manual (Zona de Peligro).

---

## 11. 🛡️ Seguridad y Buenas Prácticas

- **Criptografía:** El PIN jamás viaja como texto plano internamente en la Base de Datos (Hash `SHA256`).
- **Stateless:** El servidor .NET no guarda estados de sesión. Se valida firma JWT en cada Request (Patrón `[Authorize]`).
- **Arquitectura Limpia:** `UnitOfWork` asegura el control transaccional (ACID) durante el movimiento de dinero para evitar saldos huérfanos si ocurre un error a la mitad de una transferencia.
- **Auditoría:** Fallos masivos de inicio de sesión disparan un `ILogger` Warning a consola para monitorización de amenazas.

---

## 12. 🔧 Solución de Problemas (Troubleshooting)

| Error | Causa Posible | Solución |
|---|---|---|
| *Docker no encuentra el motor* | Docker Desktop no está encendido. | Abre Docker Desktop antes de correr `start.ps1`. |
| *Network Error (Axios)* | Los contenedores back/db aún están inicializando. | Espera 10 segundos adicionales, SQL toma tiempo en crear las tablas la primera vez. |
| *Acceso Denegado al Borrar Wallet* | Superaste el límite de intentos. | Es intencional. La sesión se destruye localmente por seguridad. Crea una nueva wallet. |

---

## 13. 🤝 Contribución

¡Todas las contribuciones son bienvenidas!
1. Realiza un *Fork* del proyecto.
2. Crea una rama para tu feature (`git checkout -b feature/NuevaFuncionalidad`).
3. Realiza commit de tus cambios (`git commit -m 'feat: Agregado NuevaFuncionalidad'`).
4. Sube la rama (`git push origin feature/NuevaFuncionalidad`).
5. Abre un **Pull Request**.

---

## 14. 📜 Licencia

Este proyecto está bajo la Licencia **MIT**. Eres libre de utilizarlo, modificarlo y distribuirlo de manera profesional o educativa.
