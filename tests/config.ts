import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
    baseUrl: 'https://api.coingecko.com/api/v3',
    apiKey: process.env.COINGECKO_API_KEY || '',
    endpoints: {
        coinMarkets: '/coins/markets',
        simplePrice: '/simple/price',
        ping: '/ping',
        coinList: '/coins/list'
    },
    timeouts: {
        default: 5000,
        long: 10000
    },
    testData: {
        coins: ['bitcoin', 'ethereum'],
        currencies: ['usd', 'eur']
    }
};

export const testData = {
    validCoin: 'bitcoin',
    invalidCoin: 'invalid_coin_id',
    validCurrency: 'usd',
    invalidCurrency: 'invalid_currency'
}; 