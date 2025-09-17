import { MarketPrice } from '../types';
import { marketPrices } from '../data/marketData';

/**
 * Simulates fetching market prices for a given mandi ID from an API.
 * @param mandiId The ID of the mandi to fetch prices for.
 * @returns A promise that resolves to an array of MarketPrice objects.
 */
export const fetchMarketPrices = (mandiId: string): Promise<MarketPrice[]> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (marketPrices[mandiId]) {
        resolve(marketPrices[mandiId]);
      } else {
        // Return an empty array for unknown mandis instead of rejecting
        resolve([]);
      }
    }, 1000); // 1 second delay to simulate network latency
  });
};
