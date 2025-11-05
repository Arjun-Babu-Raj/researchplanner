
import {genkit, type GenkitOptions} from 'genkit';
import {googleAI, type GoogleAIPluginParams} from '@genkit-ai/googleai';

// Store the default configuration.
const defaultConfig: GenkitOptions = {
    plugins: [googleAI({ apiKey: process.env.GOOGLE_API_KEY })],
    model: 'googleai/gemini-2.0-flash',
};

// Initialize the default AI instance.
export const ai = genkit(defaultConfig);

/**
 * Gets a Genkit instance configured with the provided API key.
 * This is used to dynamically create a new Genkit instance for each user request
 * that provides their own API key.
 *
 * @param {string} apiKey - The user-provided Google AI API key.
 * @returns {any} A configured Genkit instance.
 */
export function getAi(apiKey: string) {
  const userConfig: GenkitOptions = {
    plugins: [googleAI({ apiKey })],
    model: 'googleai/gemini-2.0-flash',
  };
  return genkit(userConfig);
}
