'use server';

import { getAi } from '@/ai/genkit';
import { z } from 'genkit';

const ScholarlyArticleSchema = z.object({
  title: z.string().describe('The title of the article.'),
  authors: z.string().describe('The primary author(s) of the article.'),
  year: z.string().describe('The year of publication.'),
  journal: z.string().describe('The journal or publication venue.'),
  abstract: z.string().describe('The article abstract or summary.'),
  url: z.string().optional().describe('URL to the article if available.')
});

export type ScholarlyArticle = z.infer<typeof ScholarlyArticleSchema>;

const ScholarlySearchResultSchema = z.object({
  articles: z.array(ScholarlyArticleSchema)
});

/**
 * Uses Gemini to search for and extract information about peer-reviewed articles
 * related to the given query, focusing on recent and relevant scholarly publications.
 */
export async function searchScholarlyArticles(
  query: string,
  apiKey: string,
  maxResults = 5
): Promise<ScholarlyArticle[]> {
  const ai = getAi(apiKey);

  const scholarlySearchPrompt = ai.definePrompt({
    name: 'scholarlySearchPrompt',
    input: {
      schema: z.object({
        query: z.string(),
        maxResults: z.number()
      })
    },
    output: { schema: ScholarlySearchResultSchema },
    prompt: `You are an expert academic researcher with access to a vast database of peer-reviewed articles. Your task is to identify and extract information about relevant peer-reviewed articles for the given research query.

Focus on:
- Recent articles (preferably within the last 5-10 years unless seminal older works are crucial)
- Peer-reviewed journals only
- Articles directly relevant to the query
- Articles from reputable academic publishers and institutions
- A mix of study types (empirical studies, systematic reviews, etc.)

For the query: "{{{query}}}"

Return exactly {{{maxResults}}} most relevant articles. For each article, provide:
- Complete and accurate title
- Author(s) (primary authors if many)
- Publication year
- Journal name
- A substantive abstract or summary
- URL if you are confident about its accuracy (optional)

Format the results as a JSON object with an "articles" array containing the article objects.

Important:
- Ensure all returned articles are real, peer-reviewed publications
- Include complete citations that can be verified
- Focus on articles that provide significant empirical or theoretical contributions
- If exact details are uncertain, omit them rather than guess

Return your response as a single JSON object with the "articles" array.`
  });

  try {
    const { output } = await scholarlySearchPrompt({
      query,
      maxResults
    });

    if (!output?.articles) {
      throw new Error('Failed to retrieve scholarly articles');
    }

    return output.articles;
  } catch (error) {
    console.error('Error in scholarly search:', error);
    return [];
  }
}