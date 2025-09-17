import { Mandi, MarketPrice } from '../types';

export const mandis: Mandi[] = [
  {
    id: 'mandi_kolkata',
    name: { en: 'Kolkata Mandi', hi: 'कोलकाता मंडी', bn: 'কলকাতা মান্ডি', sat: 'Kolkata Mandi', nag: 'Kolkata Mandi', kho: 'Kolkata Mandi' },
    district: { en: 'Kolkata', hi: 'कोलकाता', bn: 'কলকাতা', sat: 'Kolkata', nag: 'Kolkata', kho: 'Kolkata' },
  },
  {
    id: 'mandi_patna',
    name: { en: 'Patna Mandi', hi: 'पटना मंडी', bn: 'পাটনা মান্ডি', sat: 'Patna Mandi', nag: 'Patna Mandi', kho: 'Patna Mandi' },
    district: { en: 'Patna', hi: 'पटना', bn: 'পাটনা', sat: 'Patna', nag: 'Patna', kho: 'Patna' },
  },
  {
    id: 'mandi_lucknow',
    name: { en: 'Lucknow Mandi', hi: 'लखनऊ मंडी', bn: 'লখনউ মান্ডি', sat: 'Lucknow Mandi', nag: 'Lucknow Mandi', kho: 'Lucknow Mandi' },
    district: { en: 'Lucknow', hi: 'लखनऊ', bn: 'লখনউ', sat: 'Lucknow', nag: 'Lucknow', kho: 'Lucknow' },
  },
];

const generatePriceHistory = (basePrice: number, days = 30) => {
  const history: { date: string; price: number }[] = [];
  let currentPrice = basePrice;
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    history.push({
      date: date.toISOString().split('T')[0],
      price: Math.round(currentPrice),
    });
    // Fluctuate price for the next day
    const fluctuation = (Math.random() - 0.45) * (basePrice * 0.05); // +/- 5% fluctuation
    currentPrice += fluctuation;
    if (currentPrice < basePrice * 0.8) currentPrice = basePrice * 0.8; // Prevent prices from dropping too low
    if (currentPrice > basePrice * 1.2) currentPrice = basePrice * 1.2; // Prevent prices from going too high
  }
  return history;
};

const calculatePriceChanges = (priceHistory?: { date: string; price: number }[]) => {
    if (!priceHistory || priceHistory.length < 8) {
        return { day: 0, week: 0 };
    }
    const todayPrice = priceHistory[priceHistory.length - 1].price;
    const yesterdayPrice = priceHistory[priceHistory.length - 2].price;
    const weekAgoPrice = priceHistory[priceHistory.length - 8].price;

    const dayChange = ((todayPrice - yesterdayPrice) / yesterdayPrice) * 100;
    const weekChange = ((todayPrice - weekAgoPrice) / weekAgoPrice) * 100;

    return {
        day: parseFloat(dayChange.toFixed(1)),
        week: parseFloat(weekChange.toFixed(1)),
    };
};

// FIX: Explicitly type the raw data arrays to prevent TypeScript from widening the `trend` property to `string`.
const kolkataPricesRaw: Array<Omit<MarketPrice, 'priceChange'>> = [
    {
      cropId: 'paddy_k',
      cropName: { en: 'Paddy', hi: 'धान', bn: 'ধান', sat: 'Paddy', nag: 'Paddy', kho: 'Paddy' },
      price: 2050,
      trend: 'up',
      aiForecast: { en: 'Expected to rise by 5% next week', hi: 'अगले हफ्ते 5% बढ़ने की उम्मीद है', bn: 'আগামী সপ্তাহে ৫% বাড়ার সম্ভাবনা', sat: 'Expected to rise by 5% next week', nag: 'Expected to rise by 5% next week', kho: 'Expected to rise by 5% next week' },
      priceHistory: generatePriceHistory(2000),
      marketArrivals: 45,
      marketSentiment: 'Strong',
    },
    {
      cropId: 'jute_k',
      cropName: { en: 'Jute', hi: 'जूट', bn: 'পাট', sat: 'Jute', nag: 'Jute', kho: 'Jute' },
      price: 5500,
      trend: 'stable',
      aiForecast: { en: 'Prices likely to remain stable', hi: 'कीमतें स्थिर रहने की संभावना है', bn: 'দাম স্থিতিশীল থাকার সম্ভাবনা', sat: 'Prices likely to remain stable', nag: 'Prices likely to remain stable', kho: 'Prices likely to remain stable' },
      priceHistory: generatePriceHistory(5500),
      marketArrivals: 20,
      marketSentiment: 'Stable',
    },
    {
      cropId: 'potato_k',
      cropName: { en: 'Potato', hi: 'आलू', bn: 'আলু', sat: 'Potato', nag: 'Potato', kho: 'Potato' },
      price: 1800,
      trend: 'down',
      aiForecast: { en: 'May drop further due to high supply', hi: 'अधिक आपूर्ति के कारण और गिर सकता है', bn: 'উচ্চ সরবরাহের কারণে আরও কমতে পারে', sat: 'May drop further due to high supply', nag: 'May drop further due to high supply', kho: 'May drop further due to high supply' },
      priceHistory: generatePriceHistory(1950),
      marketArrivals: 75,
      marketSentiment: 'Weak',
    },
];

// FIX: Explicitly type the raw data arrays to prevent TypeScript from widening the `trend` property to `string`.
const patnaPricesRaw: Array<Omit<MarketPrice, 'priceChange'>> = [
    {
      cropId: 'wheat_p',
      cropName: { en: 'Wheat', hi: 'गेहूं', bn: 'গম', sat: 'Wheat', nag: 'Wheat', kho: 'Wheat' },
      price: 2200,
      trend: 'up',
      aiForecast: { en: 'Strong demand, prices may increase', hi: 'मजबूत मांग, कीमतें बढ़ सकती हैं', bn: 'শক্তিশালী চাহিদা, দাম বাড়তে পারে', sat: 'Strong demand, prices may increase', nag: 'Strong demand, prices may increase', kho: 'Strong demand, prices may increase' },
      priceHistory: generatePriceHistory(2100),
      marketArrivals: 60,
      marketSentiment: 'Strong',
    },
    {
      cropId: 'maize_p',
      cropName: { en: 'Maize', hi: 'मक्का', bn: 'ভুট্টা', sat: 'Maize', nag: 'Maize', kho: 'Maize' },
      price: 1900,
      trend: 'stable',
      aiForecast: { en: 'Stable demand from poultry sector', hi: 'पोल्ट्री क्षेत्र से स्थिर मांग', bn: 'পোল্ট্রি খাত থেকে স্থিতিশীল চাহিদা', sat: 'Stable demand from poultry sector', nag: 'Stable demand from poultry sector', kho: 'Stable demand from poultry sector' },
      priceHistory: generatePriceHistory(1900),
      marketArrivals: 40,
      marketSentiment: 'Stable',
    },
    {
      cropId: 'lentil_p',
      cropName: { en: 'Lentil (Masoor)', hi: 'मसूर', bn: 'মসুর ডাল', sat: 'Lentil (Masoor)', nag: 'Lentil (Masoor)', kho: 'Lentil (Masoor)' },
      price: 6500,
      trend: 'up',
      aiForecast: { en: 'Prices are bullish this season', hi: 'इस सीजन में कीमतें तेज हैं', bn: 'এই মৌসুমে দাম বাড়তির দিকে', sat: 'Prices are bullish this season', nag: 'Prices are bullish this season', kho: 'Prices are bullish this season' },
      priceHistory: generatePriceHistory(6200),
      marketArrivals: 15,
      marketSentiment: 'Strong',
    },
];

// FIX: Explicitly type the raw data arrays to prevent TypeScript from widening the `trend` property to `string`.
const lucknowPricesRaw: Array<Omit<MarketPrice, 'priceChange'>> = [
    {
      cropId: 'sugarcane_l',
      cropName: { en: 'Sugarcane', hi: 'गन्ना', bn: 'আখ', sat: 'Sugarcane', nag: 'Sugarcane', kho: 'Sugarcane' },
      price: 350,
      trend: 'stable',
      aiForecast: { en: 'Government SAP is holding the price', hi: 'सरकार का SAP मूल्य को बनाए हुए है', bn: 'সরকারের এসএপি দাম ধরে রেখেছে', sat: 'Government SAP is holding the price', nag: 'Government SAP is holding the price', kho: 'Government SAP is holding the price' },
      priceHistory: generatePriceHistory(350),
      marketArrivals: 150,
      marketSentiment: 'Stable',
    },
    {
      cropId: 'mustard_l',
      cropName: { en: 'Mustard', hi: 'सरसों', bn: 'সরিষা', sat: 'Mustard', nag: 'Mustard', kho: 'Mustard' },
      price: 5800,
      trend: 'up',
      aiForecast: { en: 'Oil demand is high, good outlook', hi: 'तेल की मांग अधिक है, अच्छा दृष्टिकोण', bn: 'তেলের চাহিদা বেশি, ভালো সম্ভাবনা', sat: 'Oil demand is high, good outlook', nag: 'Oil demand is high, good outlook', kho: 'Oil demand is high, good outlook' },
      priceHistory: generatePriceHistory(5650),
      marketArrivals: 30,
      marketSentiment: 'Strong',
    },
    {
      cropId: 'tomato_l',
      cropName: { en: 'Tomato', hi: 'टमाटर', bn: 'টমেটো', sat: 'Tomato', nag: 'Tomato', kho: 'Tomato' },
      price: 1500,
      trend: 'down',
      aiForecast: { en: 'New harvest arriving, prices may soften', hi: 'नई फसल आ रही है, कीमतें नरम हो सकती हैं', bn: 'নতুন ফসল আসছে, দাম কমতে পারে', sat: 'New harvest arriving, prices may soften', nag: 'New harvest arriving, prices may soften', kho: 'New harvest arriving, prices may soften' },
      priceHistory: generatePriceHistory(1800),
      marketArrivals: 80,
      marketSentiment: 'Weak',
    },
];

export const marketPrices: Record<string, MarketPrice[]> = {
  'mandi_kolkata': kolkataPricesRaw.map(p => ({ ...p, priceChange: calculatePriceChanges(p.priceHistory) })),
  'mandi_patna': patnaPricesRaw.map(p => ({ ...p, priceChange: calculatePriceChanges(p.priceHistory) })),
  'mandi_lucknow': lucknowPricesRaw.map(p => ({ ...p, priceChange: calculatePriceChanges(p.priceHistory) })),
};