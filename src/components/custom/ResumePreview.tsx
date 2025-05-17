
"use client";

import type * as React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ResumePreviewProps {
  markdown: string;
}

// Helper function to escape HTML characters
const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// Helper function to convert simple Markdown (bold, italic) to sanitized HTML
const getSanitizedHtml = (markdownText: string): string => {
  let html = markdownText;

  // Process strong (bold) first
  html = html.replace(/\*\*(.*?)\*\*/g, (_match, content) => `<strong>${escapeHtml(content)}</strong>`);
  html = html.replace(/__(.*?)__/g, (_match, content) => `<strong>${escapeHtml(content)}</strong>`);

  // Process emphasis (italic)
  html = html.replace(/\*(.*?)\*/g, (_match, content) => `<em>${escapeHtml(content)}</em>`);
  // Using a simple version for underscore italics; assumes it's not mixed with internal underscores in variable names.
  html = html.replace(/_(.*?)_/g, (_match, content) => `<em>${escapeHtml(content)}</em>`);

  return html;
};

// Basic Markdown Parser
const parseMarkdown = (markdown: string): React.ReactNode[] => {
  if (!markdown) return [];

  const lines = markdown.split('\n');
  const elements: React.ReactNode[] = [];
  let currentKey = 0;
  let inList = false;
  let listItems: React.ReactNode[] = [];
  let isFirstH1 = true; 

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(<ul key={`ul-${currentKey++}`} className="list-disc pl-6 my-3 space-y-1.5 text-sm text-foreground">{listItems}</ul>);
      listItems = [];
    }
    inList = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('# ')) {
      flushList();
      const content = line.substring(2);
      const htmlContent = getSanitizedHtml(content);
      if (isFirstH1) {
        elements.push(<h1 key={currentKey++} className="text-3xl font-bold text-primary text-center mb-1" dangerouslySetInnerHTML={{ __html: htmlContent }} />);
        isFirstH1 = false;
        // Check for contact info on the next line (heuristic)
        if (i + 1 < lines.length && (lines[i+1].includes('|') || lines[i+1].includes('@') || lines[i+1].match(/\(\d{3}\)/) )) {
          const contactLineRaw = lines[i+1];
          const contactHtml = getSanitizedHtml(contactLineRaw);
          elements.push(<p key={`contact-${currentKey++}`} className="text-xs text-muted-foreground text-center mb-6" dangerouslySetInnerHTML={{ __html: contactHtml }} />);
          i++; 
        }
      } else {
        elements.push(<h1 key={currentKey++} className="text-2xl font-bold text-primary mt-6 mb-3 border-b border-border pb-1" dangerouslySetInnerHTML={{ __html: htmlContent }} />);
      }
    } else if (line.startsWith('## ')) {
      flushList();
      const content = line.substring(3);
      const htmlContent = getSanitizedHtml(content);
      elements.push(<h2 key={currentKey++} className="text-xl font-semibold text-primary mt-5 mb-2.5 border-b border-border pb-1.5" dangerouslySetInnerHTML={{ __html: htmlContent }} />);
    } else if (line.startsWith('### ')) {
      flushList();
      const content = line.substring(4);
      const htmlContent = getSanitizedHtml(content);
      elements.push(<h3 key={currentKey++} className="text-base font-medium text-foreground mt-3 mb-1" dangerouslySetInnerHTML={{ __html: htmlContent }} />);
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!inList) inList = true;
      const content = line.substring(2);
      const htmlContent = getSanitizedHtml(content);
      listItems.push(<li key={`li-${currentKey++}-${listItems.length}`} className="text-sm leading-relaxed pb-0.5" dangerouslySetInnerHTML={{ __html: htmlContent }} />);
    } else if (line.trim() === '') {
      flushList();
      if (elements.length > 0 && elements[elements.length-1].type !== 'div') {
         elements.push(<div key={`spacer-${currentKey++}`} className="h-1" />); // Reduced spacer
      }
    } else {
      flushList();
      const htmlContent = getSanitizedHtml(line);
      elements.push(<p key={currentKey++} className="my-1 text-sm text-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: htmlContent }} />);
    }
  }
  flushList(); 

  return elements;
};


export function ResumePreview({ markdown }: ResumePreviewProps) {
  const content = parseMarkdown(markdown);

  return (
    <ScrollArea className="h-[calc(100vh-300px)] sm:h-[calc(100vh-250px)] border rounded-md shadow-inner p-6 bg-card">
      <div className="max-w-2xl mx-auto text-foreground prose-sm prose-p:my-1 prose-li:my-0.5">
        {content.length > 0 ? content : <p className="text-muted-foreground">Your resume preview will appear here.</p>}
      </div>
    </ScrollArea>
  );
}

