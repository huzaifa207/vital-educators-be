# Description

This project is a [Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

### 1. Update Database URL

Before proceeding, update the `DATABASE_URL` in your `.env` file to match your local database configuration.

### 2. Database Migrations: Development

Run the following commands to apply migrations in development:

```bash
# Run migration for all
npm run migration:dev --all {npx prisma migrate dev --all}

# Or run migration for a specific name
npm run migration:dev --name {npx prisma migrate dev --name}
```

Generate Prisma client:

```bash
npx prisma generate
```

### 3. Install Dependencies

Install the required dependencies for the project:

```bash
npm install
```

## Running the App Locally

### 1. Start the App in Development Mode

Run the following command to start the app in development mode:

```bash
npm run start:dev
```

The app will be accessible at [http://localhost:5002](http://localhost:5002).

### 2. Set Up Proxy

To set up the local SSL proxy for secure communication, install `local-ssl-proxy`:

```bash
npm i -g local-ssl-proxy
```

Then, create the proxy for your backend:

```bash
local-ssl-proxy -s 5001 -t 5002
```

This will proxy the backend to [https://localhost:5001](https://localhost:5001).

Always use this link to communicate with backend

## Node Version

Ensure you're using **Node v22** for the project to run smooth
