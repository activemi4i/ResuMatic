// src/ai/flows/optimize-resume.ts
'use server';
/**
 * @fileOverview This file defines a Genkit flow for optimizing a resume based on a job description.
 *
 * - optimizeResume - A function that takes a job description and resume content as input and returns suggestions for improvement.
 * - OptimizeResumeInput - The input type for the optimizeResume function.
 * - OptimizeResumeOutput - The return type for the optimizeResume function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeResumeInputSchema = z.object({
  jobDescription: z.string().describe('The job description to optimize the resume for.'),
  resumeContent: z.string().describe('The content of the resume to be optimized.'),
});
export type OptimizeResumeInput = z.infer<typeof OptimizeResumeInputSchema>;

const OptimizeResumeOutputSchema = z.object({
  suggestions: z
    .string()
    .describe('Suggestions for improving the resume content to better match the job description.'),
});
export type OptimizeResumeOutput = z.infer<typeof OptimizeResumeOutputSchema>;

export async function optimizeResume(input: OptimizeResumeInput): Promise<OptimizeResumeOutput> {
  return optimizeResumeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeResumePrompt',
  input: {schema: OptimizeResumeInputSchema},
  output: {schema: OptimizeResumeOutputSchema},
  prompt: `You are an expert resume optimizer. Given a job description and resume content, provide suggestions for improving the resume content to better match the job description.

Job Description: {{{jobDescription}}}

Resume Content: {{{resumeContent}}}

Suggestions:`,
});

const optimizeResumeFlow = ai.defineFlow(
  {
    name: 'optimizeResumeFlow',
    inputSchema: OptimizeResumeInputSchema,
    outputSchema: OptimizeResumeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
