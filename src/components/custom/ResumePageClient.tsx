
"use client";

import type * as React from 'react';
import { useState, useEffect } from 'react';
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
Engineer | Tech Lead | 11+ Building Scalable Apps & SDKs
Canada Resident

## Summary
A highly motivated and results-oriented Senior Software Engineer with over 11 years of experience in designing, developing, and deploying scalable mobile and web applications. Proven ability to lead engineering teams, drive technical architecture, and deliver high-quality software products. Expertise in React Native, iOS (Swift, Objective-C), Android (Kotlin, Java), and full-stack development. Strong advocate for best practices, code quality, and agile methodologies.

## Major Projects

### Myav App (UK) | Some Company | Jan 2022 - Present
- Led development of a cross-platform app for insurance services using React Native.
- Integrated Apple Pay and Google Pay for seamless premium payments.
- Improved app performance by 25% through targeted optimizations.

### Pawo App (Singapore) | Another Company | May 2020 - Dec 2021
- Developed a native iOS fitness tracking application using Swift and Combine.
- Architected real-time data synchronization with a backend powered by Firebase.
- Achieved a 4.5-star rating on the App Store through user-centric design and features.

## Experience

### Senior Software Engineer | Innovatech Solutions | 2021 - Present
- Led a team of 5 engineers in developing a new SaaS platform, resulting in a 20% increase in user engagement.
- Architected and implemented microservices using Node.js, TypeScript, and Docker.
- Optimized application performance, reducing P95 latency by 30%.
- Mentored junior engineers, fostering a culture of growth and collaboration.

### Software Engineer | Tech Solutions Ltd. | 2019 - 2021
- Developed responsive user interfaces with React, Redux, and Tailwind CSS.
- Contributed to CI/CD pipeline setup using Jenkins and GitLab CI.
- Collaborated with product managers and designers to translate requirements into technical specifications.

## Education

### M.S. in Computer Science | Stanford University | 2017 - 2019
- Specialization: Artificial Intelligence
- Thesis: "Advanced Machine Learning Techniques for Mobile Platforms"

### B.S. in Software Engineering | MIT | 2013 - 2017
- Graduated with Honors, Capstone Project on Cross-Platform Development

## Contact
johndoe@email.com
(555) 123-4567
linkedin.com/in/johndoe
github.com/johndoe
Canada

## Core Competencies
- Mobile Development (iOS, Android, React Native)
- Full-Stack Web Development (React, Node.js)
- Software Architecture & Design Patterns
- Agile Methodologies & Scrum
- Team Leadership & Mentoring
- CI/CD & DevOps Practices
- Cloud Platforms (AWS, Firebase)
- UI/UX Design Principles
- Test-Driven Development (TDD)
- Version Control (Git)

## Skills
Languages: Swift, Objective-C, Kotlin, Java, TypeScript, JavaScript, Python
Frameworks: React Native, React, Node.js, Express.js, SwiftUI, UIKit, Jetpack Compose
Databases: PostgreSQL, MongoDB, Firebase Firestore, Realm
Tools: Xcode, Android Studio, VS Code, Docker, Jenkins, Git, Jira
Platforms: iOS, Android, Web, AWS, Google Cloud

## Awards & Certifications
### Apple Design Award Nominee | Apple | 2023
- For outstanding UI/UX in the Myav App.
### Certified Scrum Master (CSM) | Scrum Alliance | 2020

## Memberships
- IEEE Computer Society
- ACM (Association for Computing Machinery)

## Languages
English: Native Proficiency
French: Basic Proficiency
`;

export function ResumePageClient() {
  const [resumeMarkdown, setResumeMarkdown] = useState<string>(defaultResumeMarkdown);
  const [jobDescription, setJobDescription] = useState<string>('');
  const [optimizationSuggestions, setOptimizationSuggestions] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentYear, setCurrentYear] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);


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
          &copy; {currentYear !== null ? currentYear : '...'} ResuMatic. All rights reserved.
        </div>
      </footer>
    </>
  );
}
