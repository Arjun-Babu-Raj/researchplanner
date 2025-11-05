
'use server';

/**
 * @fileOverview Defines a Genkit flow for conducting a literature review.
 * This flow searches PubMed for relevant articles, uses an AI to summarize them,
 * and generates an introduction for the research plan.
 *
 * - literatureReview - A function that performs the literature review.
 * - LiteratureReviewInput - The input type for the literatureReview function.
 * - LiteratureReviewOutput - The return type for the literatureReview function.
 */

import { getAi } from '@/ai/genkit';
import { searchPubMed } from '@/services/pubmed';
import { z } from 'genkit';

const LiteratureReviewInputSchema = z.object({
  studyTitle: z.string().describe('The title of the study to inform the literature search.'),
});
export type LiteratureReviewInput = z.infer<typeof LiteratureReviewInputSchema>;

const ArticleSummarySchema = z.object({
  title: z.string().describe('The title of the article.'),
  author: z.string().describe('The primary author or authors.'),
  year: z.string().describe('The year of publication.'),
  studyDesign: z.string().describe('The inferred study design (e.g., Randomized Controlled Trial, Cohort Study, Qualitative Study, Review).'),
  citation: z.string().describe('The full Vancouver style citation for the article.'),
  summary: z.string().describe('A concise summary of the article abstract.'),
});

const KeyConceptSchema = z.object({
    concept: z.string().describe("The name of the key concept, theme, or methodology."),
    note: z.string().describe("A short, explanatory note about the concept, with citations in parentheses like (1), (2) corresponding to the article order."),
});

const LiteratureReviewOutputSchema = z.object({
  introduction: z.string().describe('A generated introduction for the research plan based on the literature review.'),
  keyConcepts: z.array(KeyConceptSchema).describe('An array of key concepts, each with an explanatory note and citations. If a novel or complex methodology (like Health Technology Assessment) is central to the study, it should be included here as a concept.'),
  articles: z.array(ArticleSummarySchema).describe('An array of summarized articles.'),
});
export type LiteratureReviewOutput = z.infer<typeof LiteratureReviewOutputSchema>;

export async function literatureReview(input: LiteratureReviewInput & { apiKey: string }): Promise<LiteratureReviewOutput> {
  const ai = getAi(input.apiKey);

  const literatureReviewPrompt = ai.definePrompt({
    name: 'literatureReviewPrompt',
    input: {
      schema: z.object({
        studyTitle: z.string(),
        articlesJSON: z.string(),
      }),
    },
    output: { schema: LiteratureReviewOutputSchema },
    prompt: `You are an expert research assistant. You have been given a study title and data from several relevant articles retrieved from PubMed. Your task is to perform three critical functions:

1.  **Analyze each article**: For each article provided in the JSON data, create a summary object containing: the title, the primary author(s) (list first few if many), the publication year, the inferred study design, a full Vancouver style citation, and a concise summary of the abstract.

2.  **Synthesize Key Concepts**: Identify the major themes, concepts, or methodologies discussed across the provided articles. If the study title itself implies a novel or complex methodology (e.g., "Health Technology Assessment", "Systematic Review", "Grounded Theory"), treat that methodology as a key concept to be explained. For EACH concept or methodology, create a separate object with a "concept" name and a "note". The note should be a short paragraph explaining it, citing the articles that discuss it using numeric citations in parentheses, like (1), (2), etc., corresponding to the article's order in the JSON data.

3.  **Synthesize an Introduction**: Write a comprehensive 'Introduction' section for a research plan based on the provided study title and the literature. This introduction should:
    *   Start with a broad opening statement.
    *   Summarize the key findings from the literature (you can use the key concepts you just generated). Use numeric citations like (1), (2), etc.
    *   Identify a specific gap or unanswered question in the current research.
    *   Conclude with a clear statement of the research question and the primary objective of the current study.

**Proposed Study Title:**
"{{{studyTitle}}}"

**Article Data (from PubMed):**
{{{articlesJSON}}}

Return your final output as a single, valid JSON object with the keys: "introduction", "keyConcepts", and "articles". Do not create a separate "methodologyNote" field.
  `,
  });
  
  const searchStrategyForPubMed = `(${input.studyTitle}) AND (randomized controlled trial[Publication Type] OR systematic review[Publication Type] OR meta-analysis[Publication Type] OR review[Publication Type] OR cohort study[Publication Type])`;

  // 1. Fetch articles from PubMed
  const articles = await searchPubMed(searchStrategyForPubMed);
  if (!articles || articles.length === 0) {
    return {
        introduction: "No relevant articles were found on PubMed for the given study title. Please try rephrasing your title to be more specific or broader, and then generate this section again.",
        keyConcepts: [],
        articles: []
    }
  }

  // 2. Pass the raw article data to the AI for processing
  const { output } = await literatureReviewPrompt({
    studyTitle: input.studyTitle,
    articlesJSON: JSON.stringify(articles),
  });

  if (!output) {
    throw new Error('The AI failed to generate a literature review.');
  }

  return output;
}
