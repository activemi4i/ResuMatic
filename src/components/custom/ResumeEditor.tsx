"use client";

import type * as React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ResumeEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function ResumeEditor({ value, onChange }: ResumeEditorProps) {
  return (
    <div className="flex flex-col space-y-2 h-full">
      <Label htmlFor="resume-editor" className="text-sm font-medium">
        Edit Your Resume (Markdown)
      </Label>
      <Textarea
        id="resume-editor"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Start typing your resume in Markdown..."
        className="flex-grow resize-none rounded-md shadow-sm p-4 text-sm leading-relaxed min-h-[calc(100vh-300px)] sm:min-h-[calc(100vh-250px)]"
        aria-label="Resume Markdown Editor"
      />
    </div>
  );
}
