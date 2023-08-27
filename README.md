## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

**Database Migrations: Development**

```
# 1 - npm run migration:dev -- {npx prisma migrate dev --name}
# 2 - npx prisma generate

```

**Database Migrations: Production**

```
# 3 - change DB_URL in .env

# 4 - npx prisma migrate resolve --applied "<migration file name>" --preview-feature

# 5 - npx prisma db push
```

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

**Always USE local-ssl-proxy package**

```bash
$  npm i -g local-ssl-proxy
```

**_For Backend_**

```
    local-ssl-proxy -s 5001 -t 5002
```

**_For Frontend_**

```
    local-ssl-proxy -s 3000 -t 3001
```
