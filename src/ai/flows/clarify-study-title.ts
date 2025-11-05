
// src/ai/flows/clarify-study-title.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for clarifying a study title using AI.
 *
 * - clarifyStudyTitle - A function that takes a study title and returns clarifying questions from the AI.
 * - ClarifyStudyTitleInput - The input type for the clarifyStudyTitle function.
 * - ClarifyStudyTitleOutput - The return type for the clarifyStudyTitle function.
 */

import { getAi } from '@/ai/genkit';
import {z} from 'genkit';

const ClarifyStudyTitleInputSchema = z.object({
  studyTitle: z.string().describe('The title of the study to be clarified.'),
});
export type ClarifyStudyTitleInput = z.infer<typeof ClarifyStudyTitleInputSchema>;

const ClarifyStudyTitleOutputSchema = z.object({
  clarifyingQuestions: z
    .string()
    .describe('Questions from the AI to clarify the study title.'),
});
export type ClarifyStudyTitleOutput = z.infer<typeof ClarifyStudyTitleOutputSchema>;

export async function clarifyStudyTitle(input: ClarifyStudyTitleInput & { apiKey: string }): Promise<ClarifyStudyTitleOutput> {
  const ai = getAi(input.apiKey);

  const clarifyStudyTitlePrompt = ai.definePrompt({
    name: 'clarifyStudyTitlePrompt',
    input: {schema: ClarifyStudyTitleInputSchema},
    output: {schema: ClarifyStudyTitleOutputSchema},
    prompt: `You are an AI assistant helping researchers clarify their study titles. Ask a few clarifying questions to ensure the study title is well-defined. Return your response as a string. Study Title: {{{studyTitle}}}`,
  });

  const {output} = await clarifyStudyTitlePrompt(input);
  return output!;
}
