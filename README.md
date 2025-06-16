# Atlas – Sleeved API Service

Atlas is the main API service for the Sleeved platform. It handles core business logic, data modeling, and serves as a gateway between the mobile app, authentication service (`warden`), and external/internal microservices such as `iris`.

---

## 📦 Overview

| Information      | Description                                                         |
| ---------------- | ------------------------------------------------------------------- |
| **Service Name** | Atlas                                                               |
| **Repository**   | https://github.com/Sleeved-Project/atlas                            |
| **Framework**    | [AdonisJS v6](https://adonisjs.com)                                 |
| **Language**     | TypeScript                                                          |
| **ORM**          | [Lucid ORM](https://docs.adonisjs.com/guides/database/introduction) |
| **Database**     | SQL (MySQL, configured via Lucid)                                   |
| **API Layer**    | RESTful (JSON responses, stateless endpoints)                       |
| **Status**       | 🟡 In progress                                                      |

---

## 🎯 Responsibilities

- Serve card metadata and user-specific data (portfolio, saved cards, etc.)
- Estimate card values (directly or via internal logic + pricing DB)
- Handle business rules and coordinate logic between `folio`, `warden`, and `iris`
- Expose endpoints for search, filters, collection management, etc.

---

## 🧱 Tech Stack

- **AdonisJS v6** (Node.js framework)
- **TypeScript**
- **Lucid ORM**
- **MySQL / PostgreSQL**
- **Docker & Docker Compose**
- **GitHub Actions** (CI/CD)
- **Japa** (testing framework)
- **ESLint + Prettier**

---

## 🔗 Microservice Dependencies

| Microservice | Purpose                               | Type     |
| ------------ | ------------------------------------- | -------- |
| **Warden**   | JWT authentication & token validation | Internal |
| **Iris**     | Image recognition and hash lookup     | Internal |
| **Looter**   | Scraping + price ingestion            | Internal |

---

## 🚀 Getting Started

### Prerequisites

- Node.js `>= 22`
- Docker & Docker Compose
- Taskfile (optional): [https://taskfile.dev](https://taskfile.dev)
- Git LFS

### Git LFS

Large data files are send on github with Git LFS. Git Large File Storage (LFS) replaces large files such as audio samples, videos, datasets, and graphics with text pointers inside Git, while storing the file contents on a remote server like GitHub.com or GitHub Enterprise.

If you want push large file data run **before push**

```bash
git lfs push --all origin
```

### Import database

The sleeved_db dump file is accessible here

🔗 Download databse dump

- [sleeved_db_v5.sql](https://drive.google.com/file/d/17u2341VBun9Xw0L8S6N3ScwGbSXi5fid/view?usp=drive_link)

💡 Copy-past and rename this dump into `sleeved_db_dump.sql` in the root folder of your atlas project. The dataset wil be mount with the docker configuration build.

‼️ Dont send the `sleeved_db_dump.sql` on github without reason like feature database alterations.

---

### Setup Instructions

Complete setup (build containers, start services, run migrations) :

```bash
# Clone repository
git clone https://github.com/Sleeved-Project/atlas.git
cd atlas

# Copy environment file
cp .env.example .env

# Generate application key
node ace generate:key

# Setup application envrionnement
task setup
```

Individual steps for setup:

```bash
task: network:create # Create network
task: build # Build containers
task: start # Start containers
```

## Access the API

🔗 Default URL: http://localhost:8082

[Collection postman](https://sleeved.atlassian.net/wiki/x/CQBcAQ)

📂 Project Structure

```bash
├── app/
│   ├── controllers/     # HTTP request handlers
│   ├── exceptions/      # Exception handlers
│   ├── mappers/         # Mapper used in api
│   ├── models/          # Lucid ORM models
│   ├── services/        # Business logic layers
│   ├── middleware/      # Request lifecycle hooks
│   ├── types/           # Type used in api
│   └── validators/      # Input validation
├── config/              # App config (database, app, etc.)
├── start/               # Routes and kernel boot files
├── storage/             # Directories for file storage
├── tests/               # Unit and integration tests
├── database/            # Migrations and seeders
├── .env.example         # Example environment config
├── docker-compose.yml   # Container setup
└── Taskfile.yml         # Task runner shortcuts
```

### Testing

Run all tests (via Docker):

```bash
task test
```

Or locally (with Node installed):

```bash
node ace test
```

### Useful Dev Commands

With Taskfile (if installed):

```bash
task network:create # Create network
task start # Start services
task stop # Stop containers
task rebuild # Full rebuild
task db:migrate # Run migrations
task test # Run tests
```

### Authentication Flow

- Atlas expects JWTs issued by Warden for all protected endpoints.
- JWTs must be included via Authorization: Bearer <token>
- Token verification is performed by Warden (remote call or middleware depending on config)

### Notes

- All API routes are prefixed with /api/v1
- Use .env to configure database, ports, and external service URLs
- Follow AdonisJS conventions for services, routing, and error handling
