
'use server';

import {
  generateStudySection,
  type GenerateStudySectionInput,
} from '@/ai/flows/generate-study-section';
import {
  refineStudySection,
  type RefineStudySectionInput,
} from '@/ai/flows/refine-study-section';
import {
  validateStudyFramework,
  type ValidateStudyFrameworkInput,
} from '@/ai/flows/validate-study-framework';
import { 
  clarifyStudyTitle,
  type ClarifyStudyTitleInput
} from '@/ai/flows/clarify-study-title';
import { 
  literatureReview,
  type LiteratureReviewInput
} from '@/ai/flows/literature-review';

// Define a common input type that includes the API key
type ActionInputWithApiKey = {
  apiKey: string;
};

export async function generateSectionAction(input: GenerateStudySectionInput & ActionInputWithApiKey) {
  try {
    const result = await generateStudySection(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: `Failed to generate section: ${errorMessage}` };
  }
}

export async function refineSectionAction(input: RefineStudySectionInput & ActionInputWithApiKey) {
  try {
    const result = await refineStudySection(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: `Failed to refine section: ${errorMessage}` };
  }
}

export async function validateFrameworkAction(
  input: ValidateStudyFrameworkInput & ActionInputWithApiKey
) {
  try {
    const result = await validateStudyFramework(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: `Failed to validate framework: ${errorMessage}` };
  }
}

export async function clarifyTitleAction(input: ClarifyStudyTitleInput & ActionInputWithApiKey) {
    try {
        const result = await clarifyStudyTitle(input);
        return { success: true, data: result };
    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, error: `Failed to clarify title: ${errorMessage}` };
    }
}

export async function literatureReviewAction(input: LiteratureReviewInput & ActionInputWithApiKey) {
  try {
    const result = await literatureReview(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: `Failed to conduct literature review: ${errorMessage}` };
  }
}
