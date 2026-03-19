# Contributing to AgentAudit

## Setup

```bash
# Clone the repo
git clone https://github.com/dhanush-adi/AgentAudit.git
cd AgentAudit

# Install dependencies (requires pnpm)
pnpm install

# Copy environment variables
cp .env.example .env
# Fill in your .env values
```

## Project Structure

```
AgentAudit/
├── packages/
│   ├── middleware/    # Core npm package ("agentaudit")
│   ├── contracts/    # Solidity smart contracts (Hardhat)
│   └── demo-agent/   # Example Express API
├── Frontend/         # Next.js dashboard
├── .github/          # CI/CD workflows
└── turbo.json        # Turborepo config
```

## Commands

| Command | Description |
|---|---|
| `pnpm dev` | Start all packages in dev mode |
| `pnpm build` | Build all packages |
| `pnpm test` | Run all tests |
| `pnpm lint` | Lint all source files |
| `pnpm format` | Format all files with Prettier |
| `pnpm typecheck` | Run TypeScript type checking |

## Making Changes

1. Create a branch: `git checkout -b feat/your-feature`
2. Make your changes
3. Run `pnpm lint && pnpm typecheck && pnpm test`
4. Commit with a conventional message: `git commit -m 'feat: description'`
5. Push and open a PR

## Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation changes
- `refactor:` — Code refactoring
- `test:` — Adding or updating tests
- `chore:` — Maintenance tasks

## Smart Contracts

```bash
cd packages/contracts
npx hardhat compile
npx hardhat test
```

## Middleware

```bash
cd packages/middleware
pnpm build
pnpm test
```
