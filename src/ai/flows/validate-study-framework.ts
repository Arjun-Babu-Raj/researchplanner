
'use server';

/**
 * @fileOverview This file defines a Genkit flow for validating a section of a study plan against a specified research framework.
 *
 * - validateStudyFramework - A function that takes a study plan section and a framework, and returns a critique of the section based on the framework.
 * - ValidateStudyFrameworkInput - The input type for the validateStudyFramework function.
 * - ValidateStudyFrameworkOutput - The return type for the validateStudyFramework function.
 */

import { getAi } from '@/ai/genkit';
import { z } from 'genkit';

const ValidateStudyFrameworkInputSchema = z.object({
  planSection: z.string().describe('The text of the study plan section to validate.'),
  frameworkName: z.string().describe('The name of the research framework to use for validation (e.g., SMART, CONSORT, Braun & Clarke).'),
  frameworkPrinciples: z.string().describe('The principles of the research framework to use for validation.'),
});
export type ValidateStudyFrameworkInput = z.infer<typeof ValidateStudyFrameworkInputSchema>;

const ValidateStudyFrameworkOutputSchema = z.object({
  critique: z.string().describe('A critique of the study plan section based on the specified framework, identifying strengths and weaknesses.'),
  suggestions: z.string().describe('Actionable suggestions for improving the study plan section based on the framework.'),
});
export type ValidateStudyFrameworkOutput = z.infer<typeof ValidateStudyFrameworkOutputSchema>;

export async function validateStudyFramework(input: ValidateStudyFrameworkInput & { apiKey: string }): Promise<ValidateStudyFrameworkOutput> {
  const ai = getAi(input.apiKey);

  const validateStudyFrameworkPrompt = ai.definePrompt({
    name: 'validateStudyFrameworkPrompt',
    input: {schema: ValidateStudyFrameworkInputSchema},
    output: {schema: ValidateStudyFrameworkOutputSchema},
    prompt: `You are an expert research methodologist.

You will receive a section of a study plan and the principles of a research framework. Your task is to critique the study plan section based on the framework's principles. Identify strengths, but focus primarily on weaknesses, gaps, or areas that lack clarity according to the framework's guidelines.

Study Plan Section:
{{planSection}}

Framework Name: {{frameworkName}}
Framework Principles:
{{frameworkPrinciples}}

Critique:
Suggestion:
`,
  });
  
  const {output} = await validateStudyFrameworkPrompt(input);
  return output!;
}
