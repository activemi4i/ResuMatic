"use client";

import type * as React from 'react';
import { useState } from 'react';
import { optimizeResume } from '@/ai/flows/optimize-resume.ts';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { AppHeader } from './Header';
import { ResumeEditor } from './ResumeEditor';
import { ResumePreview } from './ResumePreview';
import { JobDescriptionInput } from './JobDescriptionInput';
import { OptimizationSuggestions } from './OptimizationSuggestions';
import { Wand2, Loader2 } from 'lucide-react';

const defaultResumeMarkdown = `
# John Doe
john.doe@email.com | (555) 123-4567 | linkedin.com/in/johndoe

## Summary
A highly motivated software engineer with 5 years of experience in web development, specializing in React and Node.js. Proven ability to design, develop, and deploy scalable applications.

## Experience

### Senior Software Engineer | Innovatech Solutions | 2021 - Present
- Led a team of 5 engineers in developing a new SaaS platform, resulting in a 20% increase in user engagement.
- Architected and implemented microservices using Node.js, TypeScript, and Docker.
- Optimized application performance, reducing P95 latency by 30%.

### Software Engineer | Tech Solutions Ltd. | 2019 - 2021
- Developed responsive user interfaces with React, Redux, and Tailwind CSS.
- Contributed to CI/CD pipeline setup using Jenkins and GitLab CI.
- Collaborated with product managers and designers to translate requirements into technical specifications.

## Education

### M.S. in Computer Science | Stanford University | 2017 - 2019
- Specialization: Artificial Intelligence

### B.S. in Software Engineering | MIT | 2013 - 2017
- Graduated with Honors

## Skills

- **Programming Languages:** JavaScript, TypeScript, Python, Java
- **Frameworks/Libraries:** React, Node.js, Express.js, Next.js, Redux, Zustand
- **Databases:** PostgreSQL, MongoDB, Redis
- **Tools & Platforms:** Docker, Kubernetes, AWS (EC2, S3, Lambda), Git, Jenkins
- **Methodologies:** Agile, Scrum, TDD

## Projects

### Personal Portfolio Website
- Developed a responsive personal portfolio using Next.js and deployed on Vercel.
- Showcases projects and skills with a clean, modern design.

### E-commerce Platform (Side Project)
- Built a full-stack e-commerce application with user authentication, product listings, and payment integration.
`;

export function ResumePageClient() {
  const [resumeMarkdown, setResumeMarkdown] = useState<string>(defaultResumeMarkdown);
  const [jobDescription, setJobDescription] = useState<string>('');
  const [optimizationSuggestions, setOptimizationSuggestions] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const handleOptimizeResume = async () => {
    if (!jobDescription.trim()) {
      toast({
        title: 'Job Description Missing',
        description: 'Please paste a job description to optimize your resume.',
        variant: 'destructive',
      });
      return;
    }
    if (!resumeMarkdown.trim()) {
      toast({
        title: 'Resume Content Missing',
        description: 'Please enter your resume content.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setOptimizationSuggestions(null); 
    try {
      const result = await optimizeResume({
        jobDescription: jobDescription,
        resumeContent: resumeMarkdown,
      });
      setOptimizationSuggestions(result.suggestions);
      toast({
        title: 'Optimization Complete!',
        description: 'AI suggestions have been generated.',
      });
    } catch (error) {
      console.error('Error optimizing resume:', error);
      toast({
        title: 'Optimization Failed',
        description: 'An error occurred while generating suggestions. Please try again.',
        variant: 'destructive',
      });
      setOptimizationSuggestions('Failed to load suggestions. Please check the console for errors and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AppHeader />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column: Editor/Preview */}
          <div className="lg:w-1/2 flex flex-col space-y-6">
            <Tabs defaultValue="editor" className="w-full">
              <TabsList className="grid w-full grid-cols-2 shadow-sm">
                <TabsTrigger value="editor">Editor</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="editor" className="mt-4">
                <ResumeEditor value={resumeMarkdown} onChange={setResumeMarkdown} />
              </TabsContent>
              <TabsContent value="preview" className="mt-4">
                <ResumePreview markdown={resumeMarkdown} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column: Job Description & AI Optimization */}
          <div className="lg:w-1/2 flex flex-col space-y-6">
            <JobDescriptionInput value={jobDescription} onChange={setJobDescription} />
            <Button
              onClick={handleOptimizeResume}
              disabled={isLoading}
              className="w-full py-3 text-base rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              aria-label="Optimize Resume with AI"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-5 w-5" />
              )}
              Optimize with AI
            </Button>
            <OptimizationSuggestions suggestions={optimizationSuggestions} isLoading={isLoading} />
          </div>
        </div>
      </main>
      <footer className="py-4 border-t bg-card">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} ResuMatic. All rights reserved.
        </div>
      </footer>
    </>
  );
}
