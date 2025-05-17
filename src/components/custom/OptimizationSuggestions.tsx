"use client";

import type * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';

interface OptimizationSuggestionsProps {
  suggestions: string | null;
  isLoading: boolean;
}

export function OptimizationSuggestions({ suggestions, isLoading }: OptimizationSuggestionsProps) {
  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary" />
            Generating Suggestions...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">AI is analyzing your resume and the job description. Please wait.</p>
        </CardContent>
      </Card>
    );
  }

  if (!suggestions) {
    return (
      <Card className="shadow-md border-dashed">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Enter your resume and a job description, then click "Optimize with AI" to see suggestions.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg text-primary">AI Optimization Suggestions</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px] w-full pr-4">
          <pre className="whitespace-pre-wrap text-sm text-foreground bg-muted/50 p-3 rounded-md">{suggestions}</pre>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
