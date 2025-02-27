import axios from 'axios';
import { config, testData } from './config';

const api = axios.create({
    baseURL: config.baseUrl,
    timeout: 5000,
    headers: {
        'x-cg-demo-api-key': config.apiKey
    }
});

// Helper function to handle rate limiting
const makeRequest = async (request: () => Promise<any>, retries = 3, delay = 2000) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await request();
        } catch (error: any) {
            if (error.response?.status === 429 && i < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            throw error;
        }
    }
};

describe('CoinGecko API Tests', () => {
    describe('Simple Price Endpoint', () => {
        const endpoint = config.endpoints.simplePrice;

        test('should return valid price data for Bitcoin', async () => {
            const response = await makeRequest(() => 
                api.get(`${endpoint}?ids=${testData.validCoin}&vs_currencies=${testData.validCurrency}`)
            );
            expect(response.status).toBe(200);
            expect(response.data[testData.validCoin]).toBeDefined();
            expect(typeof response.data[testData.validCoin][testData.validCurrency]).toBe('number');
        });

        test('should handle invalid coin ID', async () => {
            try {
                await makeRequest(() =>
                    api.get(`${endpoint}?ids=${testData.invalidCoin}&vs_currencies=${testData.validCurrency}`)
                );
            } catch (error: any) {
                expect(error.response.status).toBe(400);
            }
        });

        test('should handle invalid currency', async () => {
            try {
                await makeRequest(() =>
                    api.get(`${endpoint}?ids=${testData.validCoin}&vs_currencies=${testData.invalidCurrency}`)
                );
            } catch (error: any) {
                expect(error.response.status).toBe(400);
            }
        });
    });

    describe('Coin Markets Endpoint', () => {
        const endpoint = config.endpoints.coinMarkets;

        test('should return market data with valid parameters', async () => {
            const response = await makeRequest(() =>
                api.get(`${endpoint}?vs_currency=${testData.validCurrency}&ids=${testData.validCoin}`)
            );
            expect(response.status).toBe(200);
            expect(Array.isArray(response.data)).toBe(true);
            expect(response.data[0]).toHaveProperty('current_price');
            expect(response.data[0]).toHaveProperty('market_cap');
        });

        test('should handle invalid currency', async () => {
            try {
                await makeRequest(() =>
                    api.get(`${endpoint}?vs_currency=${testData.invalidCurrency}`)
                );
            } catch (error: any) {
                expect(error.response.status).toBe(400);
            }
        });
    });

    describe('Coin List Endpoint', () => {
        const endpoint = config.endpoints.coinList;

        test('should return list of all coins', async () => {
            const response = await makeRequest(() => api.get(endpoint));
            expect(response.status).toBe(200);
            expect(Array.isArray(response.data)).toBe(true);
            expect(response.data.length).toBeGreaterThan(0);
            expect(response.data[0]).toHaveProperty('id');
            expect(response.data[0]).toHaveProperty('symbol');
            expect(response.data[0]).toHaveProperty('name');
        });
    });
}); 