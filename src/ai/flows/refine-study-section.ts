
'use server';
/**
 * @fileOverview AI agent for refining study plan sections based on user feedback.
 *
 * - refineStudySection - A function that refines a section of a study plan using AI.
 * - RefineStudySectionInput - The input type for the refineStudySection function.
 * - RefineStudySectionOutput - The return type for the refineStudySection function.
 */

import { getAi } from '@/ai/genkit';
import {z} from 'genkit';

const RefineStudySectionInputSchema = z.object({
  sectionTitle: z.string().describe('The title of the section to refine (e.g., Objectives, Sample Size, Data Collection, Analysis).'),
  existingContent: z.string().describe('The existing content of the study plan section.'),
  userFeedback: z.string().describe('The user feedback on the existing content, providing specific areas for improvement.'),
});
export type RefineStudySectionInput = z.infer<typeof RefineStudySectionInputSchema>;

const RefineStudySectionOutputSchema = z.object({
  refinedContent: z.string().describe('The refined content of the study plan section, incorporating user feedback.'),
});
export type RefineStudySectionOutput = z.infer<typeof RefineStudySectionOutputSchema>;

export async function refineStudySection(input: RefineStudySectionInput & { apiKey: string }): Promise<RefineStudySectionOutput> {
  const ai = getAi(input.apiKey);
  
  const refineStudySectionPrompt = ai.definePrompt({
    name: 'refineStudySectionPrompt',
    input: {schema: RefineStudySectionInputSchema},
    output: {schema: RefineStudySectionOutputSchema},
    prompt: `You are an AI research assistant helping to refine sections of a study plan based on user feedback.

  The user is working on the "{{sectionTitle}}" section of their study plan. The current content of the section is:
  {{existingContent}}

  The user has provided the following feedback:
  {{userFeedback}}

  Based on the existing content and the user's feedback, revise the section to incorporate the feedback and improve the quality, clarity, and accuracy of the content. Return ONLY the revised section content.
  `,
  });

  const {output} = await refineStudySectionPrompt(input);
  return output!;
}
