# Contributing to emotion-detector-js

Thank you for your interest in contributing! This document provides guidelines and steps for contributing.

## Code of Conduct

Please be respectful and constructive in all interactions. We're all here to learn and build something useful together.

## How Can I Contribute?

### 🐛 Reporting Bugs

Before creating a bug report, please check existing issues to avoid duplicates.

**When reporting a bug, include:**
- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior vs actual behavior
- Code samples if applicable
- Environment details:
  - Node.js version (`node --version`)
  - Package version
  - Operating system
  - Browser (if applicable)

### 💡 Suggesting Features

Feature requests are welcome! Please include:
- Clear description of the feature
- Why this feature would be useful
- Possible implementation approach (optional)

### 🔧 Pull Requests

1. **Fork & Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/emotion-detector-js.git
   cd emotion-detector-js
   npm install
   ```

2. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature
   # or
   git checkout -b fix/your-bugfix
   ```

3. **Make Changes**
   - Write clean, readable TypeScript code
   - Add JSDoc comments for public APIs
   - Ensure compatibility with Node.js and browsers
   - Keep zero dependencies policy

4. **Build & Test**
   ```bash
   npm run build
   ```

5. **Commit**
   ```bash
   git commit -m "feat: add amazing feature"
   ```
   
   Use [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` New features
   - `fix:` Bug fixes
   - `docs:` Documentation
   - `refactor:` Code refactoring
   - `test:` Tests
   - `chore:` Maintenance

6. **Push & Create PR**
   ```bash
   git push origin feature/your-feature
   ```
   Then open a Pull Request on GitHub.

## Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Project Structure
```
src/
├── index.ts      # Main exports
├── client.ts     # EmotionAnalyzer class
├── errors.ts     # Custom error classes
└── types.ts      # TypeScript interfaces
```

### Build Commands
```bash
npm run build       # Build all (ESM, CJS, types)
npm run build:esm   # Build ES Modules only
npm run build:cjs   # Build CommonJS only
npm run build:types # Build type declarations only
npm run clean       # Clean dist folder
```

## Style Guide

- Use TypeScript strict mode
- Prefer `const` over `let`
- Use meaningful variable/function names
- Add JSDoc comments for exported functions/classes
- Keep functions small and focused
- Handle errors appropriately with custom error classes

## Questions?

Feel free to open an issue for any questions about contributing!
