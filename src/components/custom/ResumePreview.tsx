"use client";

import type * as React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ResumePreviewProps {
  markdown: string;
}

// Basic Markdown Parser
const parseMarkdown = (markdown: string): React.ReactNode[] => {
  if (!markdown) return [];

  const lines = markdown.split('\n');
  const elements: React.ReactNode[] = [];
  let currentKey = 0;
  let inList = false;
  let listItems: React.ReactNode[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(<ul key={`ul-${currentKey++}`} className="list-disc pl-5 my-2 space-y-1 text-sm">{listItems}</ul>);
      listItems = [];
    }
    inList = false;
  };

  for (const line of lines) {
    let processedLine: React.ReactNode = line;

    // Bold and Italic (simple regex, might not cover all cases)
    processedLine = (processedLine as string)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.*?)__/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/_(.*?)_/g, '<em>$1</em>');

    if (line.startsWith('### ')) {
      flushList();
      elements.push(<h3 key={currentKey++} className="text-lg font-semibold mt-3 mb-1 text-foreground" dangerouslySetInnerHTML={{ __html: processedLine.substring(4) }} />);
    } else if (line.startsWith('## ')) {
      flushList();
      elements.push(<h2 key={currentKey++} className="text-xl font-bold mt-4 mb-2 text-primary" dangerouslySetInnerHTML={{ __html: processedLine.substring(3) }} />);
    } else if (line.startsWith('# ')) {
      flushList();
      elements.push(<h1 key={currentKey++} className="text-2xl font-bold mt-2 mb-3 text-primary" dangerouslySetInnerHTML={{ __html: processedLine.substring(2) }} />);
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!inList) inList = true;
      listItems.push(<li key={`li-${currentKey++}-${listItems.length}`} dangerouslySetInnerHTML={{ __html: processedLine.substring(2) }} />);
    } else if (line.trim() === '') {
      flushList();
      elements.push(<div key={currentKey++} className="h-2" />); // Represents a paragraph break
    } else {
      flushList();
      elements.push(<p key={currentKey++} className="my-1 text-sm text-foreground" dangerouslySetInnerHTML={{ __html: processedLine }} />);
    }
  }
  flushList(); // Ensure any pending list is flushed

  return elements;
};


export function ResumePreview({ markdown }: ResumePreviewProps) {
  const content = parseMarkdown(markdown);

  return (
    <ScrollArea className="h-[calc(100vh-300px)] sm:h-[calc(100vh-250px)] border rounded-md shadow-sm p-6 bg-card">
      <div className="prose prose-sm max-w-none text-foreground">
        {content.length > 0 ? content : <p className="text-muted-foreground">Your resume preview will appear here.</p>}
      </div>
    </ScrollArea>
  );
}
