# Instalk Server

Backend server for **Instalk** — a realtime chat application. Built with Node.js, TypeScript, Express, and MongoDB, with Socket.io powering realtime messaging.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Language | TypeScript |
| Framework | Express v5 |
| Database | MongoDB (Mongoose) |
| Realtime | Socket.io *(coming soon)* |
| Logging | Winston + winston-mongodb |
| Security | Helmet, CORS, Rate Limiting |



---

## Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB instance (local or Atlas)

### Installation

```bash
npm install
```

### Environment Variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env.development
```

| Variable | Description |
|---|---|
| `ENV` | `development` or `production` |
| `PORT` | Port the server listens on (default: `3000`) |
| `SERVER_URL` | Full base URL of the server |
| `DATABASE_URL` | MongoDB connection string |

### Running the Server

**Development** (with hot reload):

```bash
npm run dev
```

**Production** (compile then start):

```bash
npm run build
npm start
```



---

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server with nodemon |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled production build |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues |
| `npm run format:check` | Check formatting with Prettier |
| `npm run format:fix` | Auto-fix formatting |

---

## Code Quality

This project enforces consistent code style via:

- **ESLint** — TypeScript linting
- **Prettier** — code formatting
- **Husky** — pre-commit hooks (runs lint-staged)
- **Commitlint** — enforces [Conventional Commits](https://www.conventionalcommits.org/)

Commit message format:

```
type(scope): subject

# Examples
feat(auth): add JWT authentication
fix(chat): resolve message ordering bug
chore: update dependencies
```

---

## License

ISC
