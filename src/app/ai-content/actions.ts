'use server'

import { generateServiceContent, GenerateServiceContentInput } from "@/ai/flows/generate-service-content";
import { z } from "zod";

const GenerateServiceContentFormSchema = z.object({
  keywords: z.string().min(1, 'Keywords are required.'),
  location: z.string().min(1, 'Location is required.'),
  serviceDescription: z.string().min(10, 'Service description must be at least 10 characters.'),
  tone: z.enum(['professional', 'friendly', 'casual', 'humorous']),
  length: z.enum(['short', 'medium', 'long']),
});

export type FormState = {
  message: string;
  fields?: Record<string, string>;
  issues?: string[];
  data?: {
      content: string;
  };
};

export async function onGenerate(prevState: FormState, data: FormData): Promise<FormState> {
    const formData = Object.fromEntries(data);
    const parsed = GenerateServiceContentFormSchema.safeParse(formData);

    if (!parsed.success) {
        const issues = parsed.error.issues.map((issue) => issue.message);
        return {
            message: "Invalid form data",
            issues
        }
    }
    
    try {
        const result = await generateServiceContent(parsed.data as GenerateServiceContentInput);

        if (result.content) {
            return {
                message: "Content generated successfully.",
                data: {
                    content: result.content
                }
            };
        } else {
            return {
                message: "Failed to generate content. Please try again."
            };
        }

    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
        return {
            message: `An unexpected error occurred: ${errorMessage}. Please try again later.`
        };
    }
}
