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

#### Prerequisites
- ✅ Valid CoinGecko API key
- ✅ Clean rate limit state (no recent requests)
- ✅ Test automation script for concurrent requests

#### Test Steps
1. **Initial State Check**
   ```http
   GET /simple/price?ids=bitcoin&vs_currencies=usd
   ```
   - Record response time and status

2. **Rapid Request Sequence**
   - Send 5 requests within 10 seconds interval
   - Record response times and status codes
   - Continue until rate limit is reached

3. **Post-Limit Behavior**
   - Attempt one more request after limit reached
   - Wait for cooldown period (typically 1-2 minutes)
   - Verify service restoration

4. **Monitor Responses**
   - Track response status codes
   - Monitor response times
   - Check error messages when rate limited

#### Expected Results

**Success Scenario (Within Limits)**
```http
Status: 200 OK
Body: { "bitcoin": { "usd": <value> } }
```

**Rate Limit Exceeded**
```http
Status: 429 Too Many Requests
Body: {
  "error": "Too Many Requests"
}
```

#### Test Data Matrix

| Test Scenario | Request Interval | Expected Outcome |
|---------------|------------------|------------------|
| Normal Usage | 1 req/2s | All successful |
| Boundary Test | 5 req/10s | All successful |
| Limit Test | 10 req/10s | Some rejected |
| Burst Test | 20 req/1s | Most rejected |

#### Validation Points
1. 📊 Requests are throttled appropriately
2. 🕒 Service becomes available after cooldown
3. 📈 Response times remain stable
4. 🚫 429 responses are returned when limit exceeded
5. ♻️ Service resumes after cooldown period

#### Post-conditions
- 🔄 Wait for rate limit cooldown before other tests
- 📝 Document actual rate limits encountered
- 🔍 Compare behavior across API tiers

</details>

### 🔒 TC-005: Authentication
<details>
<summary><b>View Test Case Details</b></summary>

**Priority**: `HIGH` | **Type**: `Security Test`

#### Prerequisites
- ✅ Valid API key for testing
- ✅ Invalid/expired API key for negative testing
- ✅ Test environment configuration

#### Test Steps

1. **No Authentication**
   ```http
   GET /simple/price
   Query Parameters:
     ids: bitcoin
     vs_currencies: usd
   ```
   
2. **Invalid Authentication**
   ```http
   GET /simple/price
   Headers:
     x-cg-demo-api-key: invalid_key_here
   Query Parameters:
     ids: bitcoin
     vs_currencies: usd
   ```
   
3. **Expired Authentication**
   ```http
   GET /simple/price
   Headers:
     x-cg-demo-api-key: expired_key_here
   Query Parameters:
     ids: bitcoin
     vs_currencies: usd
   ```
   
4. **Valid Authentication**
   ```http
   GET /simple/price
   Headers:
     x-cg-demo-api-key: valid_key_here
   Query Parameters:
     ids: bitcoin
     vs_currencies: usd
   ```

#### Test Matrix

| Scenario | API Key | Expected Status | Expected Response |
|----------|---------|-----------------|-------------------|
| No Key | None | `403 Forbidden` | Error: Authentication required |
| Invalid Key | Random string | `403 Forbidden` | Error: Invalid API key |
| Expired Key | Expired key | `401 Unauthorized` | Error: Expired API key |
| Malformed Key | Malformed string | `400 Bad Request` | Error: Invalid API key format |
| Valid Key | Active key | `200 OK` | Success response |

#### Security Validation Points
1. 🔐 Headers are properly validated
2. 🚫 Error messages don't expose system details
3. 📝 Failed attempts are logged
4. 🔑 Key format is validated
5. ⏱️ Response times consistent across scenarios

#### Additional Security Checks

**Header Injection Test**
```http
GET /simple/price
Headers:
  x-cg-demo-api-key: valid_key_here\n
  malicious-header: injection-attempt
```

**Key Format Tests**
- Test with various string lengths
- Test with special characters
- Test with SQL injection patterns
- Test with XSS patterns

#### Response Validation

**Valid Authentication**
```json
{
  "bitcoin": {
    "usd": "<price>"
  }
}
```

**Invalid Authentication**
```json
{
  "error": "Unauthorized",
  "status": 401,
  "message": "<specific_error_message>"
}
```

#### Post-conditions
- 🔒 Verify no session persistence
- 📊 Check rate limit impact
- 🔍 Verify audit log entries
- ♻️ Clean up any test keys

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
| Thai Baht | `thb` | Asia |

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