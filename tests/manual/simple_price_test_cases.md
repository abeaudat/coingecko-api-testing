# 🔍 Manual Test Cases: Simple Price Endpoint

[![Endpoint Status](https://img.shields.io/badge/Endpoint-Active-success)](https://www.coingecko.com/api/documentation)
[![API Version](https://img.shields.io/badge/API%20Version-v3-blue)](https://www.coingecko.com/api/documentation)
[![Test Coverage](https://img.shields.io/badge/Test%20Coverage-100%25-brightgreen)](https://www.coingecko.com/api/documentation)

## 🎯 Overview

| Detail | Value |
|--------|-------|
| **Base URL** | `https://api.coingecko.com/api/v3` |
| **Endpoint** | `/simple/price` |
| **Method** | `GET` |
| **Purpose** | Retrieve current price of cryptocurrencies in various fiat currencies |

## 📝 Test Cases

### 🟢 TC-001: Get Bitcoin Price in USD
<details>
<summary><b>View Test Case Details</b></summary>

**Priority**: `HIGH` | **Type**: `Positive Test`

#### Prerequisites
- ✅ Valid CoinGecko API key
- ✅ API service is operational
- ✅ Bitcoin is available in CoinGecko

#### Test Steps
1. **Request Configuration**
   ```http
   GET /simple/price
   Headers:
     x-cg-demo-api-key: your_api_key_here
   Query Parameters:
     ids: bitcoin
     vs_currencies: usd
   ```

2. **Send Request**
3. **Verify Response**

#### Expected Results
```json
{
  "bitcoin": {
    "usd": "<numeric_value>"
  }
}
```

#### Acceptance Criteria
| Criterion | Expected Value |
|-----------|---------------|
| Status Code | `200 OK` |
| Response Format | `JSON` |
| Price Value | `Positive number` |
| Response Time | `< 2 seconds` |

#### Post-conditions
- 📊 No side effects
- 🔄 Rate limit counters updated
</details>

### 🟢 TC-002: Multiple Coins and Currencies
<details>
<summary><b>View Test Case Details</b></summary>

**Priority**: `MEDIUM` | **Type**: `Positive Test`

#### Test Steps
1. **Request Configuration**
   ```http
   GET /simple/price
   Headers:
     x-cg-demo-api-key: your_api_key_here
   Query Parameters:
     ids: bitcoin,ethereum
     vs_currencies: usd,eur
     include_market_cap: true
     include_24hr_vol: true
     include_24hr_change: true
   ```

2. **Send Request**
3. **Verify Response**

#### Expected Results
```json
{
  "bitcoin": {
    "usd": "<price>",
    "eur": "<price>",
    "usd_market_cap": "<value>",
    "eur_market_cap": "<value>",
    "usd_24h_vol": "<value>",
    "eur_24h_vol": "<value>",
    "usd_24h_change": "<value>",
    "eur_24h_change": "<value>"
  },
  "ethereum": {
    // Similar structure
  }
}
```
</details>

### 🔴 TC-003: Error Handling - Invalid Coin
<details>
<summary><b>View Test Case Details</b></summary>

**Priority**: `MEDIUM` | **Type**: `Negative Test`

#### Test Steps
1. **Request Configuration**
   ```http
   GET /simple/price
   Headers:
     x-cg-demo-api-key: your_api_key_here
   Query Parameters:
     ids: invalid_coin_name
     vs_currencies: usd
   ```

#### Expected Results
| Criterion | Expected Value |
|-----------|---------------|
| Status Code | `400 Bad Request` |
| Error Message | Present |
| Response Time | `< 2 seconds` |
</details>

### 🟡 TC-004: Rate Limiting
<details>
<summary><b>View Test Case Details</b></summary>

**Priority**: `HIGH` | **Type**: `Non-functional Test`

#### Test Steps
1. Send multiple requests in quick succession (5 requests/10 seconds)
2. Monitor response headers
3. Document rate limit thresholds

#### Expected Headers
```http
x-ratelimit-limit: <max_requests>
x-ratelimit-remaining: <remaining_requests>
x-ratelimit-reset: <reset_timestamp>
```

#### Expected Behavior
- ⏱️ Rate limit headers in each response
- 🚫 Status `429` when limit exceeded
- 📝 Clear error message
</details>

### 🔒 TC-005: Authentication
<details>
<summary><b>View Test Case Details</b></summary>

**Priority**: `HIGH` | **Type**: `Security Test`

#### Test Matrix

| Scenario | Expected Status | Expected Result |
|----------|----------------|-----------------|
| No API Key | `401/403` | Error message |
| Invalid Key | `401/403` | Error message |
| Valid Key | `200` | Success response |
</details>

## 📊 Test Data

### Cryptocurrencies
| Coin | ID | Type |
|------|-----|------|
| Bitcoin | `bitcoin` | Primary |
| Ethereum | `ethereum` | Primary |
| Dogecoin | `dogecoin` | Secondary |

### Fiat Currencies
| Currency | Code | Region |
|----------|------|--------|
| US Dollar | `usd` | Americas |
| Euro | `eur` | Europe |
| Japanese Yen | `jpy` | Asia |

## 📈 Validation Rules

### Price Validation
| Metric | Valid Range | Notes |
|--------|-------------|-------|
| BTC Price | `$10,000 - $100,000` | Market dependent |
| Market Cap | `> Price` | Always true |
| 24h Change | `-50% to +50%` | Extreme cases may vary |

### Performance Metrics
| Metric | Target | Critical Threshold |
|--------|--------|-------------------|
| Response Time | `< 2000ms` | `5000ms` |
| Success Rate | `> 99%` | `95%` |
| Error Rate | `< 1%` | `5%` |

## 🔍 Testing Notes

### Rate Limiting Strategy
- ⏰ Document requests before rate limit
- 🔄 Note reset time periods
- ⌛ Implement test delays

### Environmental Considerations
- 🌍 Test across different times
- 📊 Consider market volatility
- 🔧 Monitor API maintenance

---

<div align="center">
<h3>📋 Test Coverage Matrix</h3>

| Test Type | Count | Status |
|-----------|--------|---------|
| Positive | 2 | ✅ |
| Negative | 1 | ✅ |
| Security | 1 | ✅ |
| Performance | 1 | ✅ |

</div> 