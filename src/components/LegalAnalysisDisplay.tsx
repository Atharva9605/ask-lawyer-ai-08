import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Scale, 
  FileText, 
  CheckCircle, 
  Clock,
  ChevronDown,
  ChevronRight,
  Copy,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LegalAnalysisDisplayProps {
  content: string;
  isStreaming: boolean;
  isComplete: boolean;
}

interface AnalysisSection {
  type: 'thinking' | 'part';
  title: string;
  content: string;
  partNumber?: number;
}

export const LegalAnalysisDisplay: React.FC<LegalAnalysisDisplayProps> = ({
  content,
  isStreaming,
  isComplete
}) => {
  const { toast } = useToast();
  const [sections, setSections] = useState<AnalysisSection[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
  const [currentThinking, setCurrentThinking] = useState('');

  // Parse the streaming content into sections
  useEffect(() => {
    if (!content) {
      setSections([]);
      setCurrentThinking('');
      return;
    }

    const lines = content.split('\n');
    const newSections: AnalysisSection[] = [];
    let currentSection: AnalysisSection | null = null;
    let thinkingBuffer = '';

    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      // Check if this is a part header (Part 1:, Part 2:, etc.)
      const partMatch = trimmedLine.match(/^Part (\d+):\s*(.+)/i);
      
      if (partMatch) {
        // Save any accumulated thinking content
        if (thinkingBuffer.trim()) {
          newSections.push({
            type: 'thinking',
            title: 'AI Legal Reasoning',
            content: thinkingBuffer.trim()
          });
          thinkingBuffer = '';
        }

        // Save previous section if it exists
        if (currentSection) {
          newSections.push(currentSection);
        }

        // Start new part section
        currentSection = {
          type: 'part',
          title: partMatch[2],
          content: '',
          partNumber: parseInt(partMatch[1])
        };
      } else if (currentSection) {
        // Add content to current section
        if (trimmedLine) {
          currentSection.content += line + '\n';
        }
      } else {
        // This is thinking content before any parts
        thinkingBuffer += line + '\n';
      }
    });

    // Handle final section
    if (currentSection) {
      newSections.push(currentSection);
    }

    // Set current thinking for streaming display
    if (isStreaming && thinkingBuffer.trim()) {
      setCurrentThinking(thinkingBuffer.trim());
    } else if (!isStreaming) {
      setCurrentThinking('');
    }

    setSections(newSections);
    
    // Auto-expand all sections when complete
    if (isComplete) {
      setExpandedSections(new Set(Array.from({ length: newSections.length }, (_, i) => i)));
    }
  }, [content, isComplete, isStreaming]);

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  const expandAll = () => {
    setExpandedSections(new Set(Array.from({ length: sections.length }, (_, i) => i)));
  };

  const collapseAll = () => {
    setExpandedSections(new Set());
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied to Clipboard",
        description: "Legal analysis has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard.",
        variant: "destructive"
      });
    }
  };

  const getPartIcon = (partNumber?: number) => {
    if (!partNumber) return <Scale className="w-4 h-4" />;
    
    const icons = [
      FileText, // Part 1
      Scale,    // Part 2
      Eye,      // Part 3
      Brain,    // Part 4+
    ];
    
    const IconComponent = icons[Math.min(partNumber - 1, icons.length - 1)];
    return <IconComponent className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Scale className="w-6 h-6 text-amber-600" />
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Legal Case Analysis
            </h3>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Badge variant={isComplete ? "default" : isStreaming ? "secondary" : "outline"}>
                {isComplete ? "Complete" : isStreaming ? "Analyzing..." : "Ready"}
              </Badge>
              {sections.length > 0 && (
                <span>{sections.filter(s => s.type === 'part').length} parts analyzed</span>
              )}
            </div>
          </div>
        </div>

        {sections.length > 0 && (
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={expandedSections.size === sections.length ? collapseAll : expandAll}
            >
              {expandedSections.size === sections.length ? "Collapse All" : "Expand All"}
            </Button>
            <Button variant="outline" size="sm" onClick={copyToClipboard}>
              <Copy className="w-4 h-4 mr-2" />
              Copy Analysis
            </Button>
          </div>
        )}
      </div>

      {/* Current thinking display (only when streaming) */}
      {isStreaming && currentThinking && (
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <Brain className="w-5 h-5 text-blue-600 animate-pulse" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                AI Legal Reasoning
              </h4>
              <div className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                <pre className="whitespace-pre-wrap font-sans">{currentThinking}</pre>
                <div className="flex items-center gap-2 mt-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-blue-600">AI is analyzing...</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Analysis sections */}
      {sections.map((section, index) => (
        <Card key={index} className="overflow-hidden">
          <div 
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            onClick={() => toggleSection(index)}
          >
            <div className="flex items-center gap-3">
              {section.type === 'thinking' ? (
                <Brain className="w-5 h-5 text-blue-600" />
              ) : (
                getPartIcon(section.partNumber)
              )}
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                  {section.type === 'part' && section.partNumber && (
                    <span className="text-amber-600 mr-2">Part {section.partNumber}:</span>
                  )}
                  {section.title}
                </h4>
                {section.type === 'thinking' && (
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    AI's step-by-step legal reasoning process
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {section.type === 'part' && (
                <Badge variant="outline" className="text-xs">
                  Part {section.partNumber}
                </Badge>
              )}
              {expandedSections.has(index) ? (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-500" />
              )}
            </div>
          </div>

          {expandedSections.has(index) && (
            <div className="px-4 pb-4 border-t border-slate-200 dark:border-slate-700">
              <div className="pt-4">
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                    {section.content.trim()}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </Card>
      ))}

      {/* Streaming indicator */}
      {isStreaming && sections.length === 0 && !currentThinking && (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Brain className="w-12 h-12 text-amber-600 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full animate-ping"></div>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Initializing Legal Analysis
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                AI is connecting and preparing to analyze your case...
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Completion indicator */}
      {isComplete && sections.length > 0 && (
        <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <h4 className="font-semibold text-green-900 dark:text-green-100">
                Analysis Complete
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                The AI has completed a comprehensive analysis of your legal case with {sections.filter(s => s.type === 'part').length} detailed parts.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};