# AdonisJS v6 API Boilerplate

A minimal, production-ready AdonisJS v6 API boilerplate with TypeScript support, Docker integration, CI/CD workflows, and development tools.

## Features

- 🚀 **AdonisJS v6**: Modern, full-featured Node.js framework
- 📝 **TypeScript**: Strong typing for better development experience
- 🐳 **Docker**: Containerized setup for consistent development and deployment
- 🐬 **MySQL**: Database integration
- 🧪 **Testing**: Ready-to-use testing setup with Japa
- 🔄 **CI/CD**: GitHub Actions workflows for code quality and testing
- 📋 **Task Runner**: Simple commands via Taskfile
- 💄 **Code Quality**: ESLint, Prettier, and TypeScript checks
- 🔗 **JIRA Integration**: Automatic PR description update with JIRA ticket IDs

## Setup

### Prerequisites

- Docker and Docker Compose
- Node.js 22+
- [Task](https://taskfile.dev/) (optional but recommended)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/adonis-api-boilerplate.git
   cd adonis-api-boilerplate
   ```

2. Copy the environment file:

   ```bash
   cp .env.example .env
   ```

3. Generate an app key:

   ```bash
   node ace generate:key
   ```

   Then add it to your .env file

4. Build the development environment:

   ```bash
   task build
   # or without Task
   docker compose build
   ```

5. Start the development environment:

   ```bash
   task start
   # or without Task
   docker compose up -d
   ```

6. Run migrations:

   ```bash
   task db:migrate
   # or without Task
   docker compose exec app node ace migration:run
   ```

7. Access the API at http://localhost:3333

## Development Commands

The project includes a Taskfile with common commands:

| Command             | Description                         |
| ------------------- | ----------------------------------- |
| `task build`        | Build the services                  |
| `task start`        | Start the services                  |
| `task stop`         | Stop the services                   |
| `task restart`      | Restart all services                |
| `task rebuild`      | Stop, rebuild, and restart services |
| `task logs`         | View application logs               |
| `task shell`        | Open a shell in the app container   |
| `task db:migrate`   | Run database migrations             |
| `task db:rollback`  | Rollback migrations                 |
| `task db:migration` | Create a new migration              |
| `task db:seed`      | Run database seeders                |
| `task test`         | Run tests                           |
| `task lint`         | Run linting                         |
| `task format`       | Format code                         |

## What to Customize

When using this boilerplate for a new project, make sure to update:

### 1. API Information

Update the API information in controllers:

- `app/controllers/system/root_controller.ts`: Change the name, description, and documentation link
- `app/controllers/system/api_info_controller.ts`: Update the API version details
- `app/controllers/system/health_check_controller.ts`: Customize health check response if needed

### 2. GitHub Workflows

- Update the `.github/workflows/ci.yml` file to match your testing needs
- Customize the JIRA integration in `.github/workflows/pr-jira-adapter.yml` to match your JIRA project

### 3. PR Template

Customize the pull request template in `.github/pull_request_template.md` to match your project's needs and JIRA project.

### 4. Docker Configuration

- Update `Dockerfile` if you need additional dependencies
- Adjust `docker-compose.yml` to add/remove services as needed

### 5. Environment Variables

- Update `.env.example` with any additional environment variables
- Make sure to generate a new `APP_KEY` for your project

### 6. Package Information

Update the `package.json` file:

- Change the name and version
- Add/update dependencies as needed
- Update scripts if necessary

## Project Structure

```
├── app/                  # Application code
│   ├── controllers/      # HTTP controllers
│   ├── esceptions/       # HTTP exceptions
│   ├── middleware/       # HTTP middleware
│   ├── services/         # Services
│   ├── validators/       # Vine validators
│   └── models/           # Database models
├── bin/                  # Entry scripts
├── config/               # Configuration files
├── start/                # Application bootstrap files
│   ├── kernel.ts         # HTTP kernel
│   └── routes.ts         # Route definitions
├── tests/                # Test files
├── .env.example          # Environment variables example
├── docker-compose.yml    # Docker Compose configuration
└── Taskfile.yml          # Task runner commands
```

## CI/CD

The project includes GitHub Actions workflows:

- **Code Quality**: Runs linting, formatting checks, and TypeScript verification
- **Tests**: Runs the test suite in a Docker environment
- **PR-JIRA Adapter**: Automatically updates PR descriptions with JIRA ticket IDs based on branch names
