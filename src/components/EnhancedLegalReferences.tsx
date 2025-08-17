import React, { useState } from 'react';
import { FileText, ExternalLink, CheckCircle, AlertTriangle, Copy, X, Loader2 } from 'lucide-react';
import { LinkSummary } from '@/lib/legalAdvisorAgent';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface EnhancedLegalReferencesProps {
  references: string[];
  linkSummaries: LinkSummary[];
}

export const EnhancedLegalReferences: React.FC<EnhancedLegalReferencesProps> = ({ 
  references, 
  linkSummaries 
}) => {
  const { toast } = useToast();
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

  const toggleCard = (index: number) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedCards(newExpanded);
  };

  const copyUrl = async (url: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "URL Copied",
        description: "Reference URL has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy URL to clipboard.",
        variant: "destructive"
      });
    }
  };

  if (!references || references.length === 0) {
    return null;
  }

  // Only show successful references, filter out limited access
  const successfulRefs = references.filter(ref => {
    const summary = linkSummaries.find(s => s.url === ref);
    return summary && summary.status === 'success';
  });

  // Don't show the component if no successful references
  if (successfulRefs.length === 0) {
    return null;
  }
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-amber-600" />
            Legal References & Bibliography
          </div>
          <Badge variant="outline" className="text-green-600 border-green-600">
            {successfulRefs.length} source{successfulRefs.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Successful References Only */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Legal Sources & Citations
          </h3>
          <div className="space-y-4">
            {successfulRefs.map((ref, index) => {
              const summary = linkSummaries.find(s => s.url === ref);
              const isExpanded = expandedCards.has(index);
              
              return (
                <div 
                  key={index}
                  className="border border-slate-200 dark:border-slate-700 rounded-lg hover:border-green-300 dark:hover:border-green-600 transition-all duration-300 group"
                >
                  <div 
                    className="p-4 cursor-pointer"
                    onClick={() => toggleCard(index)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors">
                          {summary?.title || 'Legal Resource'}
                        </h4>
                        
                        {summary?.summary && !isExpanded && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                            {summary.summary.substring(0, 150)}...
                          </p>
                        )}
                        
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate max-w-xs">
                            {ref}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => copyUrl(ref, e)}
                          className="transition-opacity"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <a
                          href={ref}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  {isExpanded && summary?.summary && (
                    <div className="px-4 pb-4">
                      <div className="ml-14 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                        <h5 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                          Full Summary:
                        </h5>
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                          {summary.summary}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-slate-600 dark:text-slate-400">
              <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                Legal Disclaimer & Citation Requirements:
              </p>
              <ul className="space-y-1 text-xs">
                <li>• These references are provided for research purposes only and do not constitute legal advice</li>
                <li>• Always verify the current status and applicability of cited laws and regulations</li>
                <li>• Consult with a qualified attorney for specific legal matters</li>
                <li>• Some sources may require institutional access or subscription</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};