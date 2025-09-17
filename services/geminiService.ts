import { GoogleGenAI, Type, Chat } from "@google/genai";
import { SoilData, CropRecommendation, Scheme, Language, MultilingualString, LocationSoilData, User, CropDiseaseDiagnosis, MarketPrice } from '../types';

/**
 * Converts a File object to a GoogleGenAI.Part object.
 * @param file The file to convert.
 * @returns A promise that resolves to a Part object.
 */
async function fileToGenerativePart(file: File) {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
}

/**
 * Gets crop recommendations and inferred soil data for a given geographical location in a single call.
 * This is optimized for speed by combining two API calls into one and disabling thinking.
 * @param latitude The latitude of the location.
 * @param longitude The longitude of the location.
 * @param ecoMode Whether to prioritize water-efficient crops.
 * @param landSize The size of the land in acres.
 * @returns A promise that resolves to an object containing recommendations and soil data.
 */
export const getCropRecommendationsForLocation = async (
  latitude: number, 
  longitude: number, 
  ecoMode: boolean,
  landSize: number,
): Promise<{ recommendations: CropRecommendation[]; soilData: LocationSoilData }> => {
  console.log(`Fetching combined soil data and crop recommendations for location: ${latitude}, ${longitude}`);
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    You are an expert agronomist AI for farmers in India. A farmer has provided their geographical coordinates and needs a complete farm plan, fast.
    Perform the following two tasks in sequence and return a single, combined JSON object.

    TASK 1: INFER SOIL DATA
    - For the coordinates latitude=${latitude} and longitude=${longitude}, provide a realistic estimation of typical soil conditions.
    - The soil data must include: locationName (string, e.g., "Nagpur, Maharashtra"), ph (number), nitrogen (number, in kg/ha), phosphorus (number, in kg/ha), potassium (number, in kg/ha), and moisture (number, percentage).

    TASK 2: GENERATE CROP RECOMMENDATIONS
    - Using the soil data you just inferred, and considering a farm size of ${landSize} acres, recommend the top 3 most suitable and profitable crops.
    ${ecoMode ? '- PRIORITY: Eco Mode is enabled. Prioritize water-efficient crops.' : ''}
    - For EACH of the 3 recommended crops, provide a complete, detailed analysis as per the provided schema.

    The final output MUST be a single JSON object with two top-level keys:
    1. "inferredSoilData": An object containing the soil data from TASK 1.
    2. "recommendations": An array of the 3 detailed crop recommendation objects from TASK 2.

    Adhere strictly to the JSON schema. Do not add any other text or explanations outside of the JSON object.
  `;
  
  const locationSoilDataSchema = {
    type: Type.OBJECT,
    properties: {
      locationName: { type: Type.STRING },
      ph: { type: Type.NUMBER },
      nitrogen: { type: Type.INTEGER },
      phosphorus: { type: Type.INTEGER },
      potassium: { type: Type.INTEGER },
      moisture: { type: Type.INTEGER },
    },
    required: ['locationName', 'ph', 'nitrogen', 'phosphorus', 'potassium', 'moisture'],
  };

  const cropRecommendationsSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        cropName: { type: Type.STRING },
        suitability: { type: Type.INTEGER },
        confidenceScore: { type: Type.INTEGER },
        expectedProfitPerAcre: { type: Type.INTEGER },
        riskProfile: {
          type: Type.OBJECT,
          properties: {
            pestRisk: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
            waterDemand: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
            marketVolatility: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
            inputCost: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
          },
          required: ['pestRisk', 'waterDemand', 'marketVolatility', 'inputCost'],
        },
        reason: { type: Type.STRING },
        fertilizerPlan: { type: Type.STRING },
        irrigationSchedule: { type: Type.STRING },
        waterManagement: { type: Type.STRING },
        marketInsights: { type: Type.STRING },
        cropRotationTip: { type: Type.STRING },
        idealSoilConditions: {
            type: Type.OBJECT,
            properties: {
                ph: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                nitrogen: { type: Type.ARRAY, items: { type: Type.INTEGER } },
                phosphorus: { type: Type.ARRAY, items: { type: Type.INTEGER } },
                potassium: { type: Type.ARRAY, items: { type: Type.INTEGER } },
            },
            required: ['ph', 'nitrogen', 'phosphorus', 'potassium']
        },
        expectedYieldPerAcre: { type: Type.ARRAY, items: { type: Type.INTEGER } },
        estimatedWaterUsage: { type: Type.INTEGER },
        sustainabilityScore: { type: Type.INTEGER },
        carbonSequestrationPotential: { type: Type.NUMBER },
        cropCalendar: {
            type: Type.OBJECT,
            properties: {
                sowingWindow: { type: Type.STRING },
                fertilizerApplication: { type: Type.STRING },
                irrigationMilestones: { type: Type.STRING },
                pestScouting: { type: Type.STRING },
                harvestWindow: { type: Type.STRING },
            },
            required: ['sowingWindow', 'fertilizerApplication', 'irrigationMilestones', 'pestScouting', 'harvestWindow']
        },
        pestAlerts: { type: Type.ARRAY, items: { type: Type.STRING } },
        averageYieldInRegion: { type: Type.STRING },
      },
      required: [
        'cropName', 'suitability', 'confidenceScore', 'expectedProfitPerAcre', 'riskProfile',
        'reason', 'fertilizerPlan', 'irrigationSchedule', 'waterManagement', 'marketInsights', 'cropRotationTip',
        'idealSoilConditions', 'expectedYieldPerAcre', 'estimatedWaterUsage', 'sustainabilityScore', 'carbonSequestrationPotential',
        'cropCalendar', 'pestAlerts', 'averageYieldInRegion'
      ],
    },
  };

  const combinedSchema = {
    type: Type.OBJECT,
    properties: {
      inferredSoilData: locationSoilDataSchema,
      recommendations: cropRecommendationsSchema,
    },
    required: ['inferredSoilData', 'recommendations']
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: combinedSchema,
        thinkingConfig: { thinkingBudget: 0 } // Disable thinking for lower latency
      },
    });
    const result = JSON.parse(response.text);
    return {
      recommendations: result.recommendations as CropRecommendation[],
      soilData: result.inferredSoilData as LocationSoilData,
    };
  } catch (error) {
    console.error("Error fetching combined data from Gemini:", error);
    throw new Error("Failed to get a farm plan for the location.");
  }
};


/**
 * Calls the Gemini API to get crop recommendations based on manually entered soil data.
 * @param soilData - The soil data provided by the user, may include an image.
 * @param ecoMode - Whether to prioritize water-efficient crops.
 * @returns A promise that resolves to an array of CropRecommendation objects.
 */
export const getCropRecommendations = async (soilData: SoilData, ecoMode: boolean): Promise<CropRecommendation[]> => {
  console.log('Fetching crop recommendations for:', soilData, 'Eco Mode:', ecoMode);

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const basePrompt = `
    You are an expert agronomist providing a comprehensive farm plan for a farmer in India. 
    Analyze the provided farm and soil data to recommend the top 3 most suitable and profitable crops.
    
    FARM DATA:
    - pH: ${soilData.ph}
    - Nitrogen: ${soilData.nitrogen} kg/ha
    - Phosphorus: ${soilData.phosphorus} kg/ha
    - Potassium: ${soilData.potassium} kg/ha
    - Soil Moisture: ${soilData.moisture}%
    - Land Size: ${soilData.landSize} acres
    ${ecoMode ? '- PRIORITY: Eco Mode enabled. Prioritize water-efficient crops.' : ''}
    
    For EACH of the 3 recommended crops, you MUST provide a complete JSON object with the following detailed fields:
    1.  cropName: The name of the crop (e.g., "Wheat", "Soybean").
    2.  suitability: A score from 0-100 indicating how suitable the crop is.
    3.  confidenceScore: Your confidence in this recommendation (0-100).
    4.  expectedProfitPerAcre: An estimated profit in Indian Rupees (INR) per acre.
    5.  riskProfile: An object with keys "pestRisk", "waterDemand", "marketVolatility", "inputCost". Each key's value must be one of: "Low", "Medium", or "High".
    6.  reason: A brief, simple reason for the recommendation.
    7.  fertilizerPlan: A simple N-P-K dosage recommendation (e.g., "120-60-60 kg/ha").
    8.  irrigationSchedule: A basic watering suggestion (e.g., "Weekly deep watering, critical during flowering").
    9.  waterManagement: A detailed tip on efficient water use for this crop.
    10. marketInsights: A brief analysis of market trends for this crop.
    11. cropRotationTip: A suggestion for what to plant next season.
    12. idealSoilConditions: An object with ideal ranges for this crop. Example: { "ph": [6.0, 7.5], "nitrogen": [120, 150], "phosphorus": [40, 60], "potassium": [150, 200] }.
    13. expectedYieldPerAcre: A tuple [min, max] for expected yield in quintals per acre.
    14. estimatedWaterUsage: Estimated total water requirement in mm for the entire season.
    15. sustainabilityScore: A score from 0-100 based on water use, input costs, and soil health potential.
    16. carbonSequestrationPotential: Estimated carbon sequestration in tons of CO2e per acre per year (a float value).
    17. cropCalendar: An object with string values for: "sowingWindow", "fertilizerApplication", "irrigationMilestones", "pestScouting", "harvestWindow".
    18. pestAlerts: An array of 1-2 strings listing common pests or diseases for this crop in India.
    19. averageYieldInRegion: A string representing a realistic average yield for this crop in a typical Indian region (e.g., "4.5 - 5.0 tons/acre").
  `;
  
  let prompt = basePrompt;
  let contents: any;

  if (soilData.image) {
    prompt = `Analyze the provided soil image and combine it with the following data. ${basePrompt}`;
    const imagePart = await fileToGenerativePart(soilData.image);
    const textPart = { text: prompt };
    contents = { parts: [textPart, imagePart] };
  } else {
    contents = prompt;
  }

  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        cropName: { type: Type.STRING },
        suitability: { type: Type.INTEGER },
        confidenceScore: { type: Type.INTEGER },
        expectedProfitPerAcre: { type: Type.INTEGER },
        riskProfile: {
          type: Type.OBJECT,
          properties: {
            pestRisk: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
            waterDemand: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
            marketVolatility: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
            inputCost: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
          },
          required: ['pestRisk', 'waterDemand', 'marketVolatility', 'inputCost'],
        },
        reason: { type: Type.STRING },
        fertilizerPlan: { type: Type.STRING },
        irrigationSchedule: { type: Type.STRING },
        waterManagement: { type: Type.STRING },
        marketInsights: { type: Type.STRING },
        cropRotationTip: { type: Type.STRING },
        idealSoilConditions: {
            type: Type.OBJECT,
            properties: {
                ph: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                nitrogen: { type: Type.ARRAY, items: { type: Type.INTEGER } },
                phosphorus: { type: Type.ARRAY, items: { type: Type.INTEGER } },
                potassium: { type: Type.ARRAY, items: { type: Type.INTEGER } },
            },
            required: ['ph', 'nitrogen', 'phosphorus', 'potassium']
        },
        expectedYieldPerAcre: { type: Type.ARRAY, items: { type: Type.INTEGER } },
        estimatedWaterUsage: { type: Type.INTEGER },
        sustainabilityScore: { type: Type.INTEGER },
        carbonSequestrationPotential: { type: Type.NUMBER },
        cropCalendar: {
            type: Type.OBJECT,
            properties: {
                sowingWindow: { type: Type.STRING },
                fertilizerApplication: { type: Type.STRING },
                irrigationMilestones: { type: Type.STRING },
                pestScouting: { type: Type.STRING },
                harvestWindow: { type: Type.STRING },
            },
            required: ['sowingWindow', 'fertilizerApplication', 'irrigationMilestones', 'pestScouting', 'harvestWindow']
        },
        pestAlerts: { type: Type.ARRAY, items: { type: Type.STRING } },
        averageYieldInRegion: { type: Type.STRING },
      },
      required: [
        'cropName', 'suitability', 'confidenceScore', 'expectedProfitPerAcre', 'riskProfile',
        'reason', 'fertilizerPlan', 'irrigationSchedule', 'waterManagement', 'marketInsights', 'cropRotationTip',
        'idealSoilConditions', 'expectedYieldPerAcre', 'estimatedWaterUsage', 'sustainabilityScore', 'carbonSequestrationPotential',
        'cropCalendar', 'pestAlerts', 'averageYieldInRegion'
      ],
    },
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });
    const result = JSON.parse(response.text);
    return result as CropRecommendation[];
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
};

/**
 * Analyzes an image of a crop leaf to detect diseases.
 * @param imageFile The image file of the crop leaf.
 * @returns A promise that resolves to a CropDiseaseDiagnosis object.
 */
export const detectCropDisease = async (imageFile: File): Promise<CropDiseaseDiagnosis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    You are a plant pathologist and agricultural expert. Analyze the provided image of a plant leaf. 
    Identify if there is any disease present. If a disease is found, provide its name, your confidence level, a brief description, and recommended actions. If the plant appears healthy, state that.
    
    Return ONLY a single JSON object matching the defined schema. For a healthy plant, set diseaseName to "Healthy".
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      diseaseName: { type: Type.STRING, description: 'The common name of the disease, or "Healthy" if no disease is detected.' },
      confidenceScore: { type: Type.INTEGER, description: 'Your confidence in the diagnosis, from 0 to 100.' },
      description: { type: Type.STRING, description: 'A brief description of the disease or the plant\'s healthy state.' },
      recommendedActions: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'A list of actionable steps for treatment or prevention. Provide at least 2-3 recommendations.'
      },
    },
    required: ['diseaseName', 'confidenceScore', 'description', 'recommendedActions'],
  };

  try {
    const imagePart = await fileToGenerativePart(imageFile);
    const textPart = { text: prompt };
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: [textPart, imagePart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const result = JSON.parse(response.text);
    return result as CropDiseaseDiagnosis;
  } catch (error) {
    console.error("Error calling Gemini for disease detection:", error);
    throw new Error("Failed to analyze image with AI.");
  }
};


const getMultilingualText = (field: MultilingualString | MultilingualString[], lang: Language) => {
    if (Array.isArray(field)) {
        return field.map(item => item[lang] || item.en).join(', ');
    }
    return field[lang] || field.en;
};

/**
 * Starts a new chat session with the Gemini API for a specific scheme.
 * @param scheme The government scheme to discuss.
 * @param lang The language for the conversation.
 * @returns A Chat instance.
 */
export const startSchemeChat = (scheme: Scheme, lang: Language): Chat => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const languageMap: Record<Language, string> = {
      en: 'English',
      hi: 'Hindi',
      bn: 'Bengali',
      sat: 'Santali',
      nag: 'Nagpuri',
      kho: 'Khortha',
    };

    const schemeContext = `
      Scheme Name: ${getMultilingualText(scheme.title, lang)}
      Summary: ${getMultilingualText(scheme.summary, lang)}
      Benefits: ${getMultilingualText(scheme.benefits, lang)}
      Eligibility: ${getMultilingualText(scheme.eligibility, lang)}
      Required Documents: ${getMultilingualText(scheme.documents, lang)}
    `;

    const systemInstruction = `You are "AgriGrow Assistant," a helpful AI for Indian farmers. 
      Your role is to answer questions about a specific government scheme based ONLY on the context provided.
      The current conversation is about the following scheme:
      ${schemeContext}
      
      Guidelines:
      1.  **Language**: Respond exclusively in ${languageMap[lang]}. Do not switch languages.
      2.  **Scope**: Answer only based on the scheme details provided above. If the user asks about something else (another scheme, general advice, etc.), politely state that you can only answer questions about the "${getMultilingualText(scheme.title, lang)}" scheme.
      3.  **Simplicity**: Use simple, easy-to-understand language suitable for farmers. Avoid jargon.
      4.  **Tone**: Be friendly, patient, and supportive.
      5.  **Structure**: Use bullet points or numbered lists for clarity when explaining steps or requirements.
    `;

    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: systemInstruction,
        },
    });
};

/**
 * Checks scheme eligibility using the Gemini API.
 * @param userProfile The user's profile data.
 * @param allSchemes A list of all available schemes.
 * @param lang The language for the response.
 * @returns A promise that resolves to an array of recommended scheme IDs and reasons.
 */
export const checkSchemeEligibility = async (
    userProfile: Partial<User>,
    allSchemes: Scheme[],
    lang: Language
): Promise<{ schemeId: string; reason: string }[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const languageMap: Record<Language, string> = {
        en: 'English',
        hi: 'Hindi',
        bn: 'Bengali',
        sat: 'Santali',
        nag: 'Nagpuri',
        kho: 'Khortha',
    };

    // Simplify schemes for the prompt to reduce token count
    const schemesForPrompt = allSchemes.map(s => ({
        id: s.id,
        title: s.title[lang] || s.title.en,
        eligibility: s.eligibility[lang] || s.eligibility.en,
        state: s.state,
        cropType: s.cropType,
    }));

    const prompt = `
        You are an expert on Indian government agricultural schemes. I will provide you with a farmer's profile and a list of available schemes. Your task is to analyze the farmer's profile against the eligibility criteria of each scheme.
        - Farmer Profile: ${JSON.stringify(userProfile)}
        - Available Schemes: ${JSON.stringify(schemesForPrompt)}

        Carefully evaluate the profile against each scheme's 'eligibility' and 'state' fields. Return a JSON array of objects for schemes the farmer is LIKELY eligible for. Each object should contain:
        1. "schemeId": The 'id' of the eligible scheme.
        2. "reason": A brief, one-sentence explanation in ${languageMap[lang]} of why the farmer is a good match for this scheme (e.g., "Because you are a farmer in West Bengal.").

        Only return schemes where there is a strong match. If the profile is empty or no schemes match, return an empty array. Respond ONLY with the JSON array.
    `;

    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                schemeId: { type: Type.STRING },
                reason: { type: Type.STRING },
            },
            required: ['schemeId', 'reason'],
        },
    };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });
        const result = JSON.parse(response.text);
        return result as { schemeId: string; reason: string }[];
    } catch (error) {
        console.error("Error calling Gemini for eligibility check:", error);
        throw new Error("Failed to check scheme eligibility with AI.");
    }
};

/**
 * Starts a new general-purpose chat session with the Gemini API.
 * @param lang The language for the conversation.
 * @returns A Chat instance.
 */
export const startGeneralChat = (lang: Language): Chat => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const languageMap: Record<Language, string> = {
      en: 'English',
      hi: 'Hindi',
      bn: 'Bengali',
      sat: 'Santali',
      nag: 'Nagpuri',
      kho: 'Khortha',
    };

    const systemInstruction = `You are "AgriGrow Assistant," an expert AI agronomist for Indian farmers. Your primary goal is to provide comprehensive, actionable advice on a wide range of farming topics.

      Core Expertise:
      - Crop Management: Provide advice on planting, irrigation, pest control, and harvesting for various crops common in India.
      - Soil Health: Answer questions about soil types, fertilizers, and improving soil quality.
      - Government Schemes: Explain details of schemes like PM-Kisan, PMFBY, and KCC.
      - Market Prices: Discuss market trends and factors affecting crop prices.
      - General Farming Queries: Answer any other questions related to agriculture in the Indian context.

      App Integration:
      While you are a general expert, you should also be aware of the app's features. When a user's query can be best answered by using a specific feature, gently guide them.
      - For "What crop should I grow?", suggest using the 'Crop Recommendation' tool for personalized advice.
      - For specific scheme details, mention they can find more information in the 'Government Schemes' section.

      Guidelines:
      1.  **Language**: Respond exclusively in ${languageMap[lang]}.
      2.  **Clarity**: Use simple, clear language. Use bullet points for lists.
      3.  **Tone**: Be encouraging, supportive, and respectful.
      4.  **Scope**: Stick to agriculture-related topics. Politely decline to answer unrelated questions.
    `;

    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: systemInstruction,
        },
    });
};

/**
 * Gets AI-powered advice on the optimal time to sell crops.
 * @param favoriteCrops An array of the user's favorite crops with their market data.
 * @param lang The language for the response.
 * @returns A promise that resolves to a string containing the selling advice.
 */
export const getOptimalSellWindowAdvice = async (favoriteCrops: MarketPrice[], lang: Language): Promise<string> => {
    if (favoriteCrops.length === 0) {
        return "Please add some crops to your favorites to get selling advice.";
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

     const languageMap: Record<Language, string> = {
        en: 'English',
        hi: 'Hindi',
        bn: 'Bengali',
        sat: 'Santali',
        nag: 'Nagpuri',
        kho: 'Khortha',
    };

    const cropsInfo = favoriteCrops.map(crop => (
        `- Crop: ${getMultilingualText(crop.cropName, lang)}\n` +
        `- Current Price: ₹${crop.price}/quintal\n` +
        `- Recent Trend: ${crop.trend}\n` +
        `- AI Forecast: ${getMultilingualText(crop.aiForecast, lang)}\n` +
        `- Market Sentiment: ${crop.marketSentiment}\n` +
        `- Daily Arrivals: ${crop.marketArrivals} tonnes`
    )).join('\n');

    const prompt = `
        You are an expert agricultural market analyst for Indian farmers. Based on the following data for a farmer's favorite crops, provide a concise, actionable advisory on the optimal time to sell.

        Market Data:
        ${cropsInfo}

        Your task:
        1. Analyze the combined data for all crops.
        2. Provide a summary of the current market situation.
        3. For each crop, give a clear recommendation: "SELL NOW", "HOLD", or "CONSIDER SELLING SOON".
        4. Justify each recommendation in one simple sentence.
        5. The entire response should be in ${languageMap[lang]} and formatted in clear, easy-to-read markdown (e.g., use bullet points).
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini for selling advice:", error);
        throw new Error("Failed to get selling advice from AI.");
    }
};