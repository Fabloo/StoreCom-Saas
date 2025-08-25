'use server';

/**
 * @fileOverview AI-powered service content generation for microsites.
 *
 * - generateServiceContent - A function that generates service content using AI.
 * - GenerateServiceContentInput - The input type for the generateServiceContent function.
 * - GenerateServiceContentOutput - The return type for the generateServiceContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateServiceContentInputSchema = z.object({
  keywords: z.string().describe('Comma separated keywords to focus the content on.'),
  location: z.string().describe('The location for which the service is offered.'),
  serviceDescription: z.string().describe('A brief description of the service offered.'),
  tone: z
    .enum(['professional', 'friendly', 'casual', 'humorous'])
    .default('friendly')
    .describe('The tone of the generated content.'),
  length: z
    .enum(['short', 'medium', 'long'])
    .default('medium')
    .describe('The desired length of the generated content.'),
});
export type GenerateServiceContentInput = z.infer<typeof GenerateServiceContentInputSchema>;

const GenerateServiceContentOutputSchema = z.object({
  content: z.string().describe('The generated service content.'),
});
export type GenerateServiceContentOutput = z.infer<typeof GenerateServiceContentOutputSchema>;

export async function generateServiceContent(input: GenerateServiceContentInput): Promise<GenerateServiceContentOutput> {
  return generateServiceContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateServiceContentPrompt',
  input: {schema: GenerateServiceContentInputSchema},
  output: {schema: GenerateServiceContentOutputSchema},
  prompt: `You are an AI content generator specializing in creating engaging and SEO-optimized service content for local businesses.

  Based on the following inputs, generate service content for a microsite:

  Keywords: {{{keywords}}}
  Location: {{{location}}}
  Service Description: {{{serviceDescription}}}
  Tone: {{{tone}}}
  Length: {{{length}}}

  Instructions:
  - Write in a tone that is appropriate for the service and location.
  - Optimize the content for local SEO using the provided keywords.
  - Ensure the content is engaging and informative for potential customers.
  - The length of the content should match the requested length (short, medium, or long).
  `,
});

const generateServiceContentFlow = ai.defineFlow(
  {
    name: 'generateServiceContentFlow',
    inputSchema: GenerateServiceContentInputSchema,
    outputSchema: GenerateServiceContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
