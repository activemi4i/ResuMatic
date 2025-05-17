
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
  html = html.replace(/(?<!\w)\*(.*?)\*(?!\w)/g, '<em>$1</em>');
  html = html.replace(/(?<!\w)_(.*?)_(?!\w)/g, '<em>$1</em>');

  return html;
};


interface ResumeHeaderData {
  name: string;
  title: string;
  location: string;
}

interface SectionData {
  id: string;
  title: string;
  contentLines: string[];
  column: 'left' | 'right';
}

const leftColumnTitles = ["SUMMARY", "MAJOR PROJECTS", "EXPERIENCE", "EDUCATION"];
const rightColumnTitles = ["CONTACT", "CORE COMPETENCIES", "SKILLS", "AWARDS & CERTIFICATIONS", "MEMBERSHIPS", "LANGUAGES"];

const parseResumeMarkdown = (markdown: string): { header: ResumeHeaderData; sections: SectionData[] } => {
  const lines = markdown.split('\n');
  const header: ResumeHeaderData = { name: '', title: '', location: '' };
  const sections: SectionData[] = [];
  let currentSection: SectionData | null = null;
  let lineIndex = 0;

  // Parse Header
  if (lines.length > 0 && lines[lineIndex].startsWith('# ')) {
    header.name = lines[lineIndex].substring(2).trim();
    lineIndex++;
  }
  if (lines.length > lineIndex && !lines[lineIndex].startsWith('## ')) {
    header.title = lines[lineIndex].trim();
    lineIndex++;
  }
  if (lines.length > lineIndex && !lines[lineIndex].startsWith('## ')) {
    header.location = lines[lineIndex].trim();
    lineIndex++;
  }


  for (; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    if (line.startsWith('## ')) {
      if (currentSection) {
        sections.push(currentSection);
      }
      const title = line.substring(3).trim().toUpperCase();
      const column = leftColumnTitles.includes(title) ? 'left' : (rightColumnTitles.includes(title) ? 'right' : 'left');
      currentSection = { id: title.toLowerCase().replace(/\s+/g, '-'), title, contentLines: [], column };
    } else if (currentSection && line.trim() !== '') {
      currentSection.contentLines.push(line);
    } else if (currentSection && line.trim() === '' && currentSection.contentLines.length > 0 && currentSection.contentLines[currentSection.contentLines.length -1].trim() !== '') {
      // Allow one blank line within a section for paragraph breaks if needed, by pushing an empty string.
      currentSection.contentLines.push('');
    }
  }

  if (currentSection) {
    sections.push(currentSection);
  }
  return { header, sections };
};

const RenderSectionContent: React.FC<{ section: SectionData }> = ({ section }) => {
  const elements: React.ReactNode[] = [];
  let keyCounter = 0;
  let listItems: React.ReactNode[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(<ul key={`${section.id}-ul-${keyCounter++}`} className="list-disc pl-5 space-y-1 text-sm mt-1 mb-2">{listItems}</ul>);
      listItems = [];
    }
  };

  section.contentLines.forEach(line => {
    if (line.startsWith('### ')) {
      flushList();
      const rawContent = line.substring(4).trim();
      const parts = rawContent.split('|').map(s => s.trim());
      const titleHtml = getSanitizedHtml(parts[0]);
      const detailsHtml = parts.length > 1 ? getSanitizedHtml(parts.slice(1).join(' | ')) : '';

      elements.push(
        <div key={`${section.id}-h3-${keyCounter++}`} className="mt-3 mb-0.5">
          <h3 className="text-md font-semibold text-foreground" dangerouslySetInnerHTML={{ __html: titleHtml }} />
          {detailsHtml && <p className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: detailsHtml }} />}
        </div>
      );
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      const content = getSanitizedHtml(line.substring(2));
      listItems.push(<li key={`${section.id}-li-${keyCounter++}-${listItems.length}`} className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: content }} />);
    } else if (section.title === "SKILLS" && line.includes(':')) {
      flushList();
      const [category, skillsString] = line.split(/:(.*)/s);
      const categoryHtml = getSanitizedHtml(category.trim());
      const skillsHtml = getSanitizedHtml(skillsString.trim());
      elements.push(
        <p key={`${section.id}-skill-${keyCounter++}`} className="text-sm my-1">
          <strong dangerouslySetInnerHTML={{__html: categoryHtml}}>:</strong>
          <span className="text-muted-foreground" dangerouslySetInnerHTML={{__html: ` ${skillsHtml}`}}></span>
        </p>
      );
    } else if (section.title === "CONTACT") {
        flushList();
        const contentHtml = getSanitizedHtml(line);
        elements.push(<p key={`${section.id}-contact-${keyCounter++}`} className="text-sm text-muted-foreground my-0.5" dangerouslySetInnerHTML={{ __html: contentHtml }} />);
    } else if (line.trim() === '') {
      // Handles deliberate paragraph breaks within a section.
      flushList();
       if (elements.length > 0 && elements[elements.length-1].type !== 'div' && (elements[elements.length-1] as React.ReactElement).key?.toString().startsWith('spacer-') === false) {
         elements.push(<div key={`spacer-${keyCounter++}`} className="h-1" />); // smaller spacer for paragraphs
      }
    }
     else {
      flushList();
      const contentHtml = getSanitizedHtml(line);
      elements.push(<p key={`${section.id}-p-${keyCounter++}`} className="text-sm my-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: contentHtml }} />);
    }
  });

  flushList(); // Final flush for any trailing list

  return (
    <div className="mb-4">
      <h2 className="text-sm font-semibold text-primary uppercase tracking-wider border-b-2 border-primary pb-1 mb-2">
        {section.title}
      </h2>
      {elements}
    </div>
  );
};


export function ResumePreview({ markdown }: ResumePreviewProps) {
  const { header, sections } = parseResumeMarkdown(markdown);

  const leftSections = sections.filter(s => s.column === 'left');
  const rightSections = sections.filter(s => s.column === 'right');

  return (
    <ScrollArea className="h-[calc(100vh-300px)] sm:h-[calc(100vh-250px)] border rounded-md shadow-inner bg-card">
      <div className="max-w-4xl mx-auto p-6 md:p-8 text-foreground font-sans">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          {header.name && <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-1" dangerouslySetInnerHTML={{ __html: getSanitizedHtml(header.name) }} />}
          {header.title && <p className="text-md md:text-lg text-muted-foreground" dangerouslySetInnerHTML={{ __html: getSanitizedHtml(header.title) }} />}
          {header.location && <p className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: getSanitizedHtml(header.location) }} />}
        </div>

        {/* Main Content - Two Columns */}
        <div className="flex flex-col md:flex-row md:gap-x-8 lg:gap-x-12">
          {/* Left Column */}
          <div className="w-full md:w-[65%] space-y-3">
            {leftSections.map(section => (
              <RenderSectionContent key={section.id} section={section} />
            ))}
          </div>

          {/* Right Column */}
          <div className="w-full md:w-[35%] space-y-3 mt-6 md:mt-0">
            {rightSections.map(section => (
              <RenderSectionContent key={section.id} section={section} />
            ))}
          </div>
        </div>
        {(!leftSections.length && !rightSections.length && !header.name) && <p className="text-muted-foreground text-center">Your resume preview will appear here. Start typing in the editor.</p>}
      </div>
    </ScrollArea>
  );
}
