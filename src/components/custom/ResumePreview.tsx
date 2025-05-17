
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
  let isFirstH1 = true; // To identify the first H1 as the name

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(<ul key={`ul-${currentKey++}`} className="list-disc pl-6 my-2 space-y-1 text-sm text-foreground">{listItems}</ul>);
      listItems = [];
    }
    inList = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let processedLineHtml = line;

    // Bold and Italic (simple regex, might not cover all cases)
    processedLineHtml = processedLineHtml
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.*?)__/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/_(.*?)_/g, '<em>$1</em>');
    
    // Escape HTML to prevent XSS, but allow strong/em
    const escapeHtml = (unsafe: string) => {
        return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    };
    
    // Re-apply strong and em after escaping
    processedLineHtml = escapeHtml(line)
      .replace(/&lt;strong&gt;(.*?)&lt;\/strong&gt;/g, '<strong>$1</strong>')
      .replace(/&lt;em&gt;(.*?)&lt;\/em&gt;/g, '<em>$1</em>');


    if (line.startsWith('# ')) {
      flushList();
      if (isFirstH1) {
        elements.push(<h1 key={currentKey++} className="text-3xl font-bold text-primary text-center mb-1" dangerouslySetInnerHTML={{ __html: processedLineHtml.substring(2) }} />);
        isFirstH1 = false;
        // Check for contact info on the next line
        if (i + 1 < lines.length && (lines[i+1].includes('|') || lines[i+1].includes('@') || lines[i+1].match(/\(\d{3}\)/) )) {
          const contactLine = lines[i+1];
          let escapedContactLine = escapeHtml(contactLine)
            .replace(/&lt;strong&gt;(.*?)&lt;\/strong&gt;/g, '<strong>$1</strong>')
            .replace(/&lt;em&gt;(.*?)&lt;\/em&gt;/g, '<em>$1</em>');
          elements.push(<p key={`contact-${currentKey++}`} className="text-sm text-muted-foreground text-center mb-6" dangerouslySetInnerHTML={{ __html: escapedContactLine }} />);
          i++; // Increment i to skip processing contact line in the next iteration
        }
      } else {
        // Subsequent H1s, treat as large section titles (though uncommon in resumes)
        elements.push(<h1 key={currentKey++} className="text-2xl font-bold text-primary mt-6 mb-3 border-b border-border pb-1" dangerouslySetInnerHTML={{ __html: processedLineHtml.substring(2) }} />);
      }
    } else if (line.startsWith('## ')) {
      flushList();
      elements.push(<h2 key={currentKey++} className="text-xl font-semibold text-primary mt-6 mb-2 border-b border-border pb-1" dangerouslySetInnerHTML={{ __html: processedLineHtml.substring(3) }} />);
    } else if (line.startsWith('### ')) {
      flushList();
      elements.push(<h3 key={currentKey++} className="text-lg font-medium text-foreground mt-4 mb-1" dangerouslySetInnerHTML={{ __html: processedLineHtml.substring(4) }} />);
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!inList) inList = true;
      listItems.push(<li key={`li-${currentKey++}-${listItems.length}`} className="text-sm" dangerouslySetInnerHTML={{ __html: processedLineHtml.substring(2) }} />);
    } else if (line.trim() === '') {
      flushList();
      // Represent paragraph breaks, but avoid excessive empty divs if not needed.
      // For Markdown, consecutive newlines create a paragraph break. A single div for spacing might be enough.
      if (elements.length > 0 && elements[elements.length-1].type !== 'div') {
         elements.push(<div key={`spacer-${currentKey++}`} className="h-2" />);
      }
    } else {
      flushList();
      // Heuristic: if it's the line after H1 and we didn't catch it as contact, it's just a paragraph.
      // This was handled by the H1 block already.
      elements.push(<p key={currentKey++} className="my-1.5 text-sm text-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: processedLineHtml }} />);
    }
  }
  flushList(); // Ensure any pending list is flushed

  return elements;
};


export function ResumePreview({ markdown }: ResumePreviewProps) {
  const content = parseMarkdown(markdown);

  return (
    <ScrollArea className="h-[calc(100vh-300px)] sm:h-[calc(100vh-250px)] border rounded-md shadow-sm p-6 bg-card">
      <div className="max-w-none text-foreground">
        {content.length > 0 ? content : <p className="text-muted-foreground">Your resume preview will appear here.</p>}
      </div>
    </ScrollArea>
  );
}
