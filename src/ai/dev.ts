import { config } from 'dotenv';
config();

import '@/ai/flows/improve-seo-metadata.ts';
import '@/ai/flows/generate-service-content.ts';
import '@/ai/flows/suggest-seo-fixes.ts';
import '@/ai/flows/analyze-review-sentiment.ts';
import '@/ai/flows/generate-review-reply.ts';
