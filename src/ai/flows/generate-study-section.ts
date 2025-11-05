
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating initial drafts of study plan sections.
 *
 * - generateStudySection - A function that generates a study plan section.
 * - GenerateStudySectionInput - The input type for the generateStudysection function.
 * - GenerateStudySectionOutput - The return type for the generateStudySection function.
 */

import { getAi } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateStudySectionInputSchema = z.object({
  studyTitle: z.string().describe('The title of the study.'),
  sectionType: z
    .enum(['Objectives', 'Methodology', 'SampleSize', 'DataCollection', 'Analysis'])
    .describe('The type of study plan section to generate.'),
  introduction: z.string().optional().describe('The content of the Introduction section, providing context from the literature review.'),
  objectives: z.string().optional().describe('The content of the study objectives section. Required for generating Methodology and Analysis sections.'),
  methodology: z.string().optional().describe('The content of the study methodology section. Required for generating the Data Collection and Analysis sections.'),
});
export type GenerateStudySectionInput = z.infer<typeof GenerateStudySectionInputSchema>;

const GenerateStudySectionOutputSchema = z.object({
  sectionContent: z.string().describe('The generated content for the study plan section.'),
});
export type GenerateStudySectionOutput = z.infer<typeof GenerateStudySectionOutputSchema>;

export async function generateStudySection(input: GenerateStudySectionInput & { apiKey: string }): Promise<GenerateStudySectionOutput> {
  const ai = getAi(input.apiKey);

  const prompt = ai.definePrompt({
    name: 'generateStudySectionPrompt',
    input: {schema: GenerateStudySectionInputSchema},
    output: {schema: GenerateStudySectionOutputSchema},
    prompt: `You are an AI research assistant. Your task is to generate an initial draft for a specific section of a research study plan.

The title of the study is: "{{{studyTitle}}}"
The section you need to generate is: "{{{sectionType}}}"

{{#if introduction}}
Use the following introduction, which is based on a literature review, as the primary context for the draft you are about to create. Ensure your output aligns with the background and rationale presented here.
**Introduction / Literature Review Context:**
{{{introduction}}}
{{/if}}


Follow these instructions carefully based on the section type:

If the section type is "Objectives":
1.  Start with a concise, overarching primary objective that captures the main goal of the study.
2.  Follow this with a numbered list of 3 to 5 specific, secondary objectives that break down the primary goal.
3.  Each secondary objective must be a single, clear sentence starting with an action verb (e.g., "To determine...", "To assess...", "To explore...").
4.  The output must be clean, containing only the primary objective and the numbered list of secondary objectives. Do not add any extra explanations, descriptions, or justifications for the objectives.

If the section type is "Methodology":
Based on the study title and objectives provided below, generate a detailed and comprehensive draft for the study methodology.
1.  Start with a paragraph justifying the choice of the primary study design (e.g., Randomized Controlled Trial, Systematic Review, Cost-Effectiveness Analysis).
2.  Then, create a numbered list of the core methodological components as subheadings (e.g., "1. **Study Design:**", "2. **Participants:**", "3. **Intervention:**").
3.  Under each subheading, provide a detailed paragraph explaining that part of the methodology. For a study involving a systematic review, subheadings might include 'Search Strategy', 'Inclusion and Exclusion Criteria', and 'Data Extraction and Analysis'. For a clinical trial, they might be 'Participant Recruitment', 'Randomization', and 'Blinding'.

**Study Title:**
{{{studyTitle}}}

**Study Objectives:**
{{{objectives}}}

If the section type is "Analysis":
Based on the study objectives and methodology provided below, create a markdown table that explicitly maps each research objective to the specific statistical test(s) or qualitative analysis approach that will be used to address it. This ensures all objectives are addressed and the tests are appropriate for the study design.
The table should have two columns: "Research Objective" and "Statistical Test(s) / Analysis Approach".
List each objective in the first column and the corresponding test(s) or approach in the second.

**Study Objectives:**
{{{objectives}}}

**Methodology:**
{{{methodology}}}


If the section type is "SampleSize":
Based on the methodology described below, generate a detailed and comprehensive draft for the sample size section.
1.  Structure the content logically with clear subheadings (e.g., "**Power Analysis**," "**Assumptions**," "**Calculated Sample Size**," "**Justification**").
2.  The content should be well-structured, informative, and directly relevant to the study design.
3.  Focus on providing a solid foundation that the user can then refine and expand upon.
4.  At the end of the generated content, add the following note: "\\n\\n**Note:** This is a template statement. You must perform a formal power analysis using software (e.g., G*Power, R) and replace the placeholder values with your actual calculated sample size and specific parameters."

**Methodology:**
{{{methodology}}}


If the section type is "DataCollection":
Based on the study title and the methodology described below, generate a detailed and comprehensive draft for the data collection plan.
1.  Structure the plan with numbered subheadings corresponding to the different types of data to be collected (e.g., "1. **Demographic Data:**", "2. **Clinical Variables:**", "3. **Outcome Measures:**").
2.  For each subheading, describe the specific instruments, tools, or methods that will be used. Be as specific as possible (e.g., "Demographic data will be collected using a self-administered questionnaire," "Blood pressure will be measured using a validated oscillometric device").

**Study Title:**
{{{studyTitle}}}

**Methodology:**
{{{methodology}}}
`,
  });

  const { output } = await prompt(input);
  return output!;
}
