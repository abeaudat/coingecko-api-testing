import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

// Custom metrics
const errorRate = new Rate('errors');
const successRate = new Rate('success_rate');
const waitTime = new Trend('wait_time');
const requestDuration = new Trend('request_duration');
const rateLimitRemaining = new Trend('rate_limit_remaining');

// Test configuration for CoinGecko Demo API (30 calls/minute)
export const options = {
    // Stages for different test scenarios
    stages: [
        // Warm-up (3 VUs = ~15 requests/minute with 2s sleep)
        { duration: '1m', target: 3 },  // Ramp up to 3 users
        { duration: '2m', target: 3 },  // Stay at 3 users

        // Load test (5 VUs = ~25 requests/minute with 2s sleep)
        { duration: '1m', target: 5 },  // Ramp up to 5 users
        { duration: '2m', target: 5 },  // Stay at 5 users

        // Stress test (7 VUs = ~35 requests/minute with 2s sleep)
        { duration: '1m', target: 7 },  // Ramp up to 7 users
        { duration: '2m', target: 7 },  // Stay at 7 users

        // Cool down
        { duration: '1m', target: 0 },  // Scale down to 0 users
    ],
    thresholds: {
        // Success rate should be above 95%
        'success_rate': ['rate>0.95'],
        // Error rate should be below 5%
        'errors': ['rate<0.05'],
        // 90% of requests should be below 2000ms
        'request_duration': ['p(90) < 2000'],
        // 95% of requests should be below 5000ms
        'request_duration': ['p(95) < 5000'],
        // Average wait time should be below 3000ms
        'wait_time': ['avg < 3000'],
        // HTTP errors should be less than 5%
        'http_req_failed': ['rate<0.05'],
    },
};

// Test setup - runs once per VU
export function setup() {
    const baseUrl = __ENV.COINGECKO_API_URL || 'https://api.coingecko.com/api/v3';
    const apiKey = __ENV.COINGECKO_API_KEY;
    
    return {
        baseUrl,
        apiKey,
        params: {
            vs_currency: 'usd',
            order: 'market_cap_desc',
            per_page: 5,  // Reduced to minimize response size
            page: 1,
            sparkline: false
        }
    };
}

// Main test function
export default function(data) {
    const headers = {
        'x-cg-demo-api-key': data.apiKey,
        'Content-Type': 'application/json'
    };

    // Construct URL with query parameters
    const queryString = Object.entries(data.params)
        .map(([key, value]) => `${key}=${value}`)
        .join('&');
    const url = `${data.baseUrl}/coins/markets?${queryString}`;

    // Send request and measure response
    const startTime = new Date();
    const response = http.get(url, { headers });
    const endTime = new Date();

    // Record metrics
    waitTime.add(endTime - startTime);
    requestDuration.add(response.timings.duration);
    
    // Track rate limit remaining if available
    const remainingCalls = response.headers['x-ratelimit-remaining'];
    if (remainingCalls) {
        rateLimitRemaining.add(parseInt(remainingCalls));
    }

    // Check response
    const success = check(response, {
        'status is 200': (r) => r.status === 200,
        'response body has data': (r) => r.json().length > 0,
        'response time OK': (r) => r.timings.duration < 2000,
        'correct content type': (r) => r.headers['Content-Type'].includes('application/json'),
        'not rate limited': (r) => r.status !== 429,
    });

    // Record success/failure
    successRate.add(success);
    errorRate.add(!success);

    // Log detailed information for failed requests
    if (!success) {
        console.log(`
            Failed Request:
            URL: ${url}
            Status: ${response.status}
            Response Time: ${response.timings.duration}ms
            Rate Limit Remaining: ${remainingCalls || 'N/A'}
            Error: ${response.body}
        `);
    }

    // Sleep for 2 seconds to respect rate limit
    // With 5 VUs, this gives us ~25 requests per minute (within the 30/minute limit)
    sleep(2);
}

// Test teardown - runs at the end
export function handleSummary(data) {
    return {
        "summary.html": htmlReport(data),
        stdout: textSummary(data, { indent: " ", enableColors: true }),
    };
}

// Helper function for text summary
function textSummary(data, options) {
    const { metrics, root_group } = data;
    const { iterations, vus, http_reqs } = metrics;
    
    return `
    Performance Test Summary (CoinGecko Demo API)
    ===========================================
    
    Rate Limit: 30 calls/minute
    
    Scenarios:
    - Warm-up: 3 VUs (~15 req/min) for 3m
    - Load Test: 5 VUs (~25 req/min) for 3m
    - Stress Test: 7 VUs (~35 req/min) for 3m
    
    Results:
    - Total Iterations: ${iterations.values.count}
    - Total Requests: ${http_reqs.values.count}
    - Max VUs: ${vus.values.max}
    
    Response Time:
    - Average: ${requestDuration.values.avg.toFixed(2)}ms
    - P90: ${requestDuration.values.p(90).toFixed(2)}ms
    - P95: ${requestDuration.values.p(95).toFixed(2)}ms
    
    Success Rate: ${(successRate.values.rate * 100).toFixed(2)}%
    Error Rate: ${(errorRate.values.rate * 100).toFixed(2)}%
    
    Rate Limit Stats:
    - Min Remaining: ${rateLimitRemaining.values.min || 'N/A'}
    - Avg Remaining: ${rateLimitRemaining.values.avg?.toFixed(2) || 'N/A'}
    `;
} 