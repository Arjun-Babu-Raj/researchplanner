import { config } from 'dotenv';
config();

import '@/ai/flows/generate-study-section.ts';
import '@/ai/flows/clarify-study-title.ts';
import '@/ai/flows/validate-study-framework.ts';
import '@/ai/flows/refine-study-section.ts';
import '@/ai/flows/literature-review.ts';
