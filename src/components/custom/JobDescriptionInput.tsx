"use client";

import type * as React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function JobDescriptionInput({ value, onChange }: JobDescriptionInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="job-description" className="text-base font-medium">
        Paste Job Description
      </Label>
      <Textarea
        id="job-description"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste the job description here to get AI-powered optimization suggestions..."
        className="min-h-[150px] rounded-md shadow-sm p-3 text-sm"
        aria-label="Job Description Input"
      />
    </div>
  );
}
