// src/services/pubmed.ts
'use server';

import axios from 'axios';
import { parseStringPromise } from 'xml2js';

const BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/';

export interface PubMedArticle {
  uid: string;
  title: string;
  authors: { name: string }[];
  pubDate: string;
  journal: string;
  abstract: string;
}

// Helper to extract text, especially from structured abstracts
const getAbstractText = (abstractElement: any): string => {
  if (!abstractElement) return 'No abstract available.';
  if (typeof abstractElement === 'string') return abstractElement;
  if (Array.isArray(abstractElement)) {
    return abstractElement
      .map(part => {
        if (typeof part === 'string') return part;
        if (part._ && part.$ && part.$.Label) {
          return `\n${part.$.Label}: ${part._}`;
        }
        return '';
      })
      .join(' ')
      .trim();
  }
  return 'No abstract available.';
};

export async function searchPubMed(query: string, retmax = 10): Promise<Partial<PubMedArticle>[]> {
  // 1. Search for article UIDs
  const searchUrl = `${BASE_URL}esearch.fcgi`;
  const searchResponse = await axios.get(searchUrl, {
    params: {
      db: 'pubmed',
      term: query,
      retmax,
      sort: 'relevance',
    },
  });

  const searchResult = await parseStringPromise(searchResponse.data);
  const idList = searchResult.eSearchResult?.IdList?.[0]?.Id;

  if (!idList || idList.length === 0) {
    return [];
  }

  // 2. Fetch details for the found UIDs
  const fetchUrl = `${BASE_URL}efetch.fcgi`;
  const fetchResponse = await axios.get(fetchUrl, {
    params: {
      db: 'pubmed',
      id: idList.join(','),
      retmode: 'xml',
    },
  });

  const fetchResult = await parseStringPromise(fetchResponse.data);
  const articles = fetchResult.PubmedArticleSet?.PubmedArticle || [];

  // 3. Parse and format the article data
  const formattedArticles = articles.map((article: any) => {
    const articleData = article.MedlineCitation[0].Article[0];
    const journalData = articleData.Journal[0];
    const authorList = articleData.AuthorList?.[0]?.Author || [];
    
    let authors: { name: string }[] = [];
    if (authorList && authorList.length > 0) {
        authors = authorList.map((a: any) => {
            // Handle collective (group) authors
            if (a.CollectiveName) {
                return { name: a.CollectiveName[0] };
            }
            // Handle individual authors
            const lastName = a.LastName?.[0] || '';
            const initials = a.Initials?.[0] || '';
            return { name: `${lastName} ${initials}`.trim() };
        }).filter((author: {name: string}) => author.name);
    }
    
    if (authors.length === 0) {
      authors = [{ name: 'No authors listed' }];
    }

    return {
      uid: article.MedlineCitation[0].PMID[0]._,
      title: articleData.ArticleTitle[0]?._ ?? articleData.ArticleTitle[0] ?? 'No title available',
      authors: authors,
      pubDate: journalData.JournalIssue[0].PubDate[0].Year[0],
      journal: journalData.Title[0],
      abstract: getAbstractText(articleData.Abstract?.[0]?.AbstractText),
    };
  });

  return formattedArticles;
}
