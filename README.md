# 🚀 CoinGecko API Testing Suite

[![Tests](https://img.shields.io/badge/Tests-Passing-success)](https://github.com/abeaudat/coingecko-api-testing)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.x-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-%5E5.0.0-blue)](https://www.typescriptlang.org/)
[![Jest](https://img.shields.io/badge/Jest-%5E29.5.0-red)](https://jestjs.io/)


> A comprehensive testing suite for the CoinGecko API, featuring functional tests, security tests, performance tests, and Postman collections. Built with TypeScript and modern testing practices.

<div align="center">
  <img src="https://cdn.freelogovectors.net/wp-content/uploads/2021/12/coingecko_logo-freelogovectors.net_.png" alt="CoinGecko API" width="600"/>
</div>

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🧪 **Functional Testing** | Jest-based tests for API endpoints |
| ⚡ **Performance Testing** | K6 load tests for API performance analysis |
| 🔄 **Integration Testing** | Postman collection for manual and automated testing |
| 🛡️ **Rate Limiting** | Automatic retry mechanism for rate-limited requests |
| 🌍 **Environment Management** | Configurable test environments via .env files |
| 🔄 **CI/CD** | GitHub Actions workflow for automated testing |
| 📊 **Reports** | HTML and JSON reports for both Jest and Postman tests |

## 🎯 Tested Endpoints

| Endpoint | Description |
|----------|-------------|
| `/simple/price` | Get cryptocurrency prices |
| `/coins/markets` | Get market data for coins |
| `/coins/list` | Get list of supported coins |

## 📋 Prerequisites

- 📦 Node.js (v18 or higher)
- 📦 npm (v8 or higher)
- 🚄 k6 (for performance testing)
- 🔄 Git (for version control)

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/username/coingecko-api-testing.git
   cd coingecko-api-testing
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your API key
   ```

## 🧪 Test Suites

### 1️⃣ API Tests
```bash
npm test                # Run all tests
```

### 2️⃣ Security Tests
```bash
npm run test:security
```

### 3️⃣ Performance Tests
```bash
npm run performance         # Basic tests
npm run performance:report  # With reports
npm run performance:safe   # Safe mode (3 VUs)
npm run performance:limit  # Limit test (5 VUs)
```

### 4️⃣ Postman Tests
```bash
npm run postman:dev      # Development
npm run postman:staging  # Staging
npm run postman:prod     # Production
```

### 5️⃣ Run All
```bash
npm run test:all
```

## 🌍 Environment Configurations

| Environment | Delay | Retries | Use Case |
|-------------|-------|----------|----------|
| Development | 1s | 3 | Local testing |
| Staging | 2s | 5 | Pre-production |
| Production | 3s | 3 | Live testing |

## 📊 Test Reports

### Jest Reports
```
📁 reports/
├── 📊 jest/
│   ├── test-report.html
│   └── test-report.json
└── 📊 postman/
    ├── dev-report.html
    ├── staging-report.html
    └── prod-report.html
```

## 🔄 CI/CD Integration

Our GitHub Actions workflow provides:

- ✅ Automated testing on push/PR
- 📊 Test report generation
- 📦 Artifact storage
- 💬 PR comments with results

## ⚙️ Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `COINGECKO_API_KEY` | API Authentication | ✅ |
| `COINGECKO_API_URL` | API Base URL | ✅ |

## 💡 Best Practices

1. 🛡️ **Rate Limiting**
   - Configurable delays
   - Automatic retries
   - Tier-based limits

2. 🔒 **Security**
   - Secure key storage
   - Environment isolation
   - Authentication handling

3. 🌐 **Cross-Environment**
   - Environment-specific configs
   - Isolated test runs
   - Configurable parameters

## 🔧 Troubleshooting

<details>
<summary>📈 Rate Limit Issues</summary>

- Increase request delays
- Implement exponential backoff
- Check API tier limits
</details>

<details>
<summary>🔑 Authentication Problems</summary>

- Verify API key in .env
- Check key permissions
- Validate GitHub secrets
</details>

<details>
<summary>⚡ Performance Issues</summary>

- Verify k6 installation
- Adjust virtual users
- Monitor system resources
</details>

<details>
<summary>🔄 GitHub Actions</summary>

- Check repository secrets
- Review workflow logs
- Verify package-lock.json
</details>

##