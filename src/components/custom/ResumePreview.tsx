
"use client";

import type * as React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ResumePreviewProps {
  markdown: string;
}

// Helper function to escape HTML characters
const escapeHtml = (unsafe: string): string => {
  if (typeof unsafe !== 'string') {
    return '';
  }
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// Helper function to convert simple Markdown (bold, italic) to sanitized HTML
const getSanitizedHtml = (markdownText: string): string => {
  let html = escapeHtml(markdownText); // Escape first

  // Process strong (bold)
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');

  // Process emphasis (italic)
  // Important: Match non-greedy, and ensure it's not part of a word like _this_is_one_
  html = html.replace(/(?<!\w)\*(.*?)\*(?!\w)/g, '<em>$1</em>');
  html = html.replace(/(?<!\w)_(.*?)_(?!\w)/g, '<em>$1</em>');

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
      elements.push(<ul key={`ul-${currentKey++}`} className="list-disc pl-5 my-2 space-y-1 text-sm">{listItems}</ul>);
      listItems = [];
    }
    inList = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('# ')) {
      flushList();
      const content = line.substring(2).trim(); // Trim content for H1
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
        // Treat subsequent single # as H2 for section titles (e.g. if user accidentally types # instead of ##)
        const h2Content = line.substring(2).trim(); // Trim content
        const h2HtmlContent = getSanitizedHtml(h2Content);
        elements.push(<h2 key={currentKey++} className="text-lg font-semibold text-primary uppercase tracking-wide mt-8 mb-3 border-b-2 border-primary pb-1.5" dangerouslySetInnerHTML={{ __html: h2HtmlContent }} />);
      }
    } else if (line.startsWith('## ')) {
      flushList();
      const content = line.substring(3).trim(); // Trim content for H2
      const htmlContent = getSanitizedHtml(content);
      elements.push(<h2 key={currentKey++} className="text-lg font-semibold text-primary uppercase tracking-wide mt-8 mb-3 border-b-2 border-primary pb-1.5" dangerouslySetInnerHTML={{ __html: htmlContent }} />);
    } else if (line.startsWith('### ')) {
      flushList();
      const rawContent = line.substring(4).trim(); // Trim content for H3
      const parts = rawContent.split('|').map(s => s.trim());

      if (parts.length >= 2) { // Typically "Title | Context/Details"
        const titleHtml = getSanitizedHtml(parts[0]);
        const detailsHtml = getSanitizedHtml(parts.slice(1).join(' | '));
        elements.push(
          <div key={currentKey++} className="mt-4 mb-2">
            <span className="block text-md font-semibold text-foreground" dangerouslySetInnerHTML={{ __html: titleHtml }} />
            <span className="block text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: detailsHtml }} />
          </div>
        );
      } else { // Single entry H3
        const htmlContent = getSanitizedHtml(rawContent);
        elements.push(<h3 key={currentKey++} className="text-md font-semibold text-foreground mt-4 mb-2" dangerouslySetInnerHTML={{ __html: htmlContent }} />);
      }
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!inList) inList = true;
      const content = line.substring(2);
      const htmlContent = getSanitizedHtml(content);
      listItems.push(<li key={`li-${currentKey++}-${listItems.length}`} className="text-sm leading-relaxed text-foreground" dangerouslySetInnerHTML={{ __html: htmlContent }} />);
    } else if (line.trim() === '') {
      flushList();
      // Add a spacer div for blank lines, but not multiple consecutive ones without content
      if (elements.length > 0 && elements[elements.length-1].type !== 'div' && (elements[elements.length-1] as React.ReactElement).key?.toString().startsWith('spacer-') === false) {
         elements.push(<div key={`spacer-${currentKey++}`} className="h-2" />);
      }
    } else {
      flushList();
      const htmlContent = getSanitizedHtml(line);
      elements.push(<p key={currentKey++} className="my-2 text-sm text-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: htmlContent }} />);
    }
  }
  flushList(); // Ensure any trailing list items are rendered

  return elements;
};


export function ResumePreview({ markdown }: ResumePreviewProps) {
  const content = parseMarkdown(markdown);

  return (
    <ScrollArea className="h-[calc(100vh-300px)] sm:h-[calc(100vh-250px)] border rounded-md shadow-inner p-6 bg-card">
      <div className="max-w-2xl mx-auto text-foreground">
        {content.length > 0 ? content : <p className="text-muted-foreground">Your resume preview will appear here.</p>}
      </div>
    </ScrollArea>
  );
}

