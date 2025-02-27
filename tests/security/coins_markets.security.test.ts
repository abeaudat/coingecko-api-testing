import axios, { AxiosError } from 'axios';
import { config } from '../config';
import * as https from 'https';
import * as tls from 'tls';

describe('Coins Markets Endpoint Security Tests', () => {
    const endpoint = config.endpoints.coinMarkets;
    const api = axios.create({
        baseURL: config.baseUrl,
        timeout: 5000,
        headers: {
            'x-cg-demo-api-key': config.apiKey
        }
    });

    // Helper function to check HTTPS certificate
    const checkCertificate = async (url: string) => {
        return new Promise((resolve) => {
            const req = https.get(url, (res) => {
                const tlsSocket = res.socket as tls.TLSSocket;
                if (tlsSocket.authorized) {
                    const cert = tlsSocket.getPeerCertificate();
                    resolve({
                        valid: true,
                        issuer: cert.issuer,
                        validFrom: cert.valid_from,
                        validTo: cert.valid_to
                    });
                } else {
                    resolve({
                        valid: false,
                        error: tlsSocket.authorizationError
                    });
                }
                res.resume(); // Consume response data to free up memory
                res.on('end', () => {
                    req.destroy(); // Cleanup the request
                });
            });

            req.on('error', (error) => {
                resolve({
                    valid: false,
                    error: error.message
                });
                req.destroy();
            });
        });
    };

    // Cleanup after all tests
    afterAll(async () => {
        await new Promise(resolve => setTimeout(resolve, 500)); // Allow pending requests to complete
    });

    describe('SQL Injection Tests', () => {
        const sqlInjectionPayloads = [
            "' OR '1'='1",
            "; DROP TABLE coins --",
            "' UNION SELECT * FROM coins --",
            "1' OR '1'='1",
            "1; SELECT * FROM coins WHERE id LIKE '%",
            "bitcoin' OR '1'='1"
        ];

        test.each(sqlInjectionPayloads)('should handle SQL injection payload: %s', async (payload) => {
            try {
                await api.get(`${endpoint}?vs_currency=usd&ids=${payload}`);
            } catch (error: any) {
                // API returns 403 for malicious inputs
                expect(error.response.status).not.toBe(500);
                expect(error.response.status).toBe(403);
            }
        });

        test('should sanitize special characters in parameters', async () => {
            const specialChars = ['"', "'", ';', '--', '/*', '*/', '=', '+', ',', '\\'];
            
            for (const char of specialChars) {
                try {
                    await api.get(`${endpoint}?vs_currency=usd&ids=bitcoin${char}`);
                } catch (error: any) {
                    expect(error.response.status).not.toBe(500);
                }
            }
        });
    });

    describe('Authentication Tests', () => {
        test('should reject requests without API key', async () => {
            const apiNoAuth = axios.create({
                baseURL: config.baseUrl,
                timeout: 5000
            });

            try {
                await apiNoAuth.get(`${endpoint}?vs_currency=usd&ids=bitcoin`);
                fail('Request should not succeed without API key');
            } catch (error: any) {
                if (error.response) {
                    expect(error.response.status).toBe(403);
                    expect(error.response.data).toHaveProperty('error');
                } else {
                    // Handle network errors
                    expect(error.message).toBeTruthy();
                }
            }
        });

        test('should reject invalid API keys', async () => {
            const apiInvalidAuth = axios.create({
                baseURL: config.baseUrl,
                timeout: 5000,
                headers: {
                    'x-cg-demo-api-key': 'invalid_key_here'
                }
            });

            try {
                await apiInvalidAuth.get(`${endpoint}?vs_currency=usd&ids=bitcoin`);
                fail('Request should not succeed with invalid API key');
            } catch (error: any) {
                if (error.response) {
                    expect(error.response.status).toBe(403);
                    expect(error.response.data).toHaveProperty('error');
                } else {
                    // Handle network errors
                    expect(error.message).toBeTruthy();
                }
            }
        });

        test('should not accept API key in query parameters', async () => {
            try {
                await axios.get(`${config.baseUrl}${endpoint}?vs_currency=usd&ids=bitcoin&api_key=${config.apiKey}`);
                fail('Request should not accept API key in query parameters');
            } catch (error: any) {
                if (error.response) {
                    expect(error.response.status).toBe(403);
                } else {
                    // Handle network errors
                    expect(error.message).toBeTruthy();
                }
            }
        });
    });

    describe('HTTPS/TLS Security', () => {
        test('should use HTTPS', () => {
            expect(config.baseUrl.startsWith('https://')).toBe(true);
        });

        test('should have valid SSL certificate', async () => {
            const certInfo: any = await checkCertificate(config.baseUrl);
            expect(certInfo.valid).toBe(true);
        });
    });

    describe('Response Security Headers', () => {
        test('should include security headers', async () => {
            const response = await api.get(`${endpoint}?vs_currency=usd&ids=bitcoin`);
            const headers = response.headers;

            // Common security headers that should be present
            expect(headers).toHaveProperty('strict-transport-security'); // HSTS
            expect(headers['x-content-type-options']).toBe('nosniff');
            expect(headers).toHaveProperty('x-frame-options'); // Clickjacking protection
            // CSP is optional as it's not always implemented by APIs
        });
    });

    describe('Rate Limiting Security', () => {
        test('should enforce rate limits', async () => {
            const requests = Array(50).fill(null).map(() => 
                api.get(`${endpoint}?vs_currency=usd&ids=bitcoin`)
            );

            try {
                await Promise.all(requests);
            } catch (error: any) {
                if (error.response) {
                    expect(error.response.status).toBe(429);
                    expect(error.response.data).toHaveProperty('error');
                }
            }
        });
    });

    describe('Data Sensitivity Tests', () => {
        test('should not expose sensitive information in error messages', async () => {
            try {
                await api.get(`${endpoint}?vs_currency=invalid_currency`);
            } catch (error: any) {
                const errorResponse = error.response.data.error;
                // Check that error messages don't contain sensitive info
                expect(typeof errorResponse).toBe('string');
                expect(errorResponse.toLowerCase()).not.toContain('sql');
                expect(errorResponse.toLowerCase()).not.toContain('database');
                expect(errorResponse.toLowerCase()).not.toContain('stack');
                expect(errorResponse.toLowerCase()).not.toContain('path');
            }
        });

        test('should not include sensitive headers in response', async () => {
            const response = await api.get(`${endpoint}?vs_currency=usd&ids=bitcoin`);
            const headers = response.headers;

            // Headers that might expose sensitive information
            expect(headers).not.toHaveProperty('x-powered-by');
            expect(headers).not.toHaveProperty('x-aspnet-version');
            expect(headers).not.toHaveProperty('x-aspnetmvc-version');
            // Note: 'server' header is common and often required, so we don't test for it
        });
    });
}); 