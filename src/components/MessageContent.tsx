import React from 'react';
import { Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface MessageContentProps {
  content: string;
  className?: string;
}

export const MessageContent: React.FC<MessageContentProps> = ({ content, className = '' }) => {
  const { toast } = useToast();

  // Enhanced URL detection regex
  const urlRegex = /(https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&=]*))/g;
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  const phoneRegex = /(\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})/g;

  // Copy content to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied to clipboard",
        description: "Message content has been copied.",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  // Format content with rich text support
  const formatContent = (text: string) => {
    // Split by double line breaks for paragraphs
    const paragraphs = text.split(/\n\s*\n/);

    return paragraphs.map((paragraph, pIndex) => {
      if (!paragraph.trim()) return null;

      // Check if it's a list item
      const isListItem = /^[\d+\-\*]\s/.test(paragraph.trim());
      const isNumberedList = /^\d+\.\s/.test(paragraph.trim());
      const isBulletList = /^[\-\*]\s/.test(paragraph.trim());

      // Process inline formatting
      let processedContent = paragraph;

      // Handle code blocks (```code```)
      processedContent = processedContent.replace(/```([\s\S]*?)```/g, (match, code) => {
        return `<code class="legal-code-block">${code.trim()}</code>`;
      });

      // Handle inline code (`code`)
      processedContent = processedContent.replace(/`([^`]+)`/g, '<code class="legal-inline-code">$1</code>');

      // Handle bold text (**text** or __text__)
      processedContent = processedContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      processedContent = processedContent.replace(/__(.*?)__/g, '<strong>$1</strong>');

      // Handle italic text (*text* or _text_)
      processedContent = processedContent.replace(/\*(.*?)\*/g, '<em>$1</em>');
      processedContent = processedContent.replace(/_(.*?)_/g, '<em>$1</em>');

      // Handle URLs
      processedContent = processedContent.replace(urlRegex, (url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="legal-link">${url} <span class="legal-external-icon">↗</span></a>`;
      });

      // Handle email addresses
      processedContent = processedContent.replace(emailRegex, (email) => {
        return `<a href="mailto:${email}" class="legal-link">${email}</a>`;
      });

      // Handle phone numbers
      processedContent = processedContent.replace(phoneRegex, (phone) => {
        const cleanPhone = phone.replace(/\D/g, '');
        return `<a href="tel:${cleanPhone}" class="legal-link">${phone}</a>`;
      });

      // Handle headings (### Heading)
      const headingMatch = processedContent.match(/^(#{1,3})\s(.+)/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const headingText = headingMatch[2];
        const headingClass = level === 1 ? 'legal-heading text-xl font-bold' : 
                            level === 2 ? 'legal-subheading text-lg font-semibold' : 
                            'text-base font-medium';
        return (
          <div key={pIndex} className={`${headingClass} mb-3 mt-4 first:mt-0`}>
            <div dangerouslySetInnerHTML={{ __html: headingText }} />
          </div>
        );
      }

      // Render list items
      if (isListItem) {
        const listContent = processedContent.replace(/^[\d+\-\*]\s/, '');
        const ListComponent = isNumberedList ? 'ol' : 'ul';
        const listClass = isNumberedList ? 'legal-numbered-list' : 'legal-bullet-list';
        
        return (
          <ListComponent key={pIndex} className={listClass}>
            <li dangerouslySetInnerHTML={{ __html: listContent }} />
          </ListComponent>
        );
      }

      // Regular paragraph
      return (
        <div key={pIndex} className="legal-paragraph mb-3 last:mb-0">
          <div dangerouslySetInnerHTML={{ __html: processedContent }} />
        </div>
      );
    }).filter(Boolean);
  };

  return (
    <div className={`legal-message-content ${className}`}>
      <div className="legal-formatted-text">
        {formatContent(content)}
      </div>
      
      {/* Copy button */}
      <div className="flex justify-end mt-3 pt-2 border-t border-border/50">
        <Button
          variant="ghost"
          size="sm"
          onClick={copyToClipboard}
          className="text-xs h-6 px-2 opacity-100 transition-opacity"
        >
          <Copy className="h-3 w-3 mr-1" />
          Copy
        </Button>
      </div>
    </div>
  );
};

export default MessageContent;