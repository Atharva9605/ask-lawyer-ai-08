import React from 'react';
import { FileText, ExternalLink, CheckCircle, AlertTriangle } from 'lucide-react';
import { LinkSummary } from '@/lib/legalAdvisorAgent';

interface LegalReferencesProps {
  references: string[];
  linkSummaries: LinkSummary[];
}

export const LegalReferences: React.FC<LegalReferencesProps> = ({ references, linkSummaries }) => {
  // Filter out failed references - only show successful ones
  const successfulReferences = references.filter((ref, index) => {
    const summary = linkSummaries.find(s => s.url === ref);
    return summary && summary.status === 'success';
  });

  if (successfulReferences.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <FileText className="w-6 h-6 text-amber-600" />
          Legal References
        </h3>
        <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 px-3 py-1 rounded-full text-sm font-medium">
          {successfulReferences.length} {successfulReferences.length === 1 ? 'source' : 'sources'}
        </span>
      </div>

      <div className="space-y-4">
        {successfulReferences.map((ref, index) => {
          const summary = linkSummaries.find(s => s.url === ref);
          return (
            <a
              key={index}
              href={ref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-600 transition-all duration-300 group hover:shadow-md"
            >
              <div className="flex-shrink-0 mt-1">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors line-clamp-2">
                  {summary?.title || 'Legal Resource'}
                </h4>
                
                {summary?.summary && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-3">
                    {summary.summary}
                  </p>
                )}
                
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
                    {ref}
                  </span>
                </div>
              </div>

              <div className="flex-shrink-0 mt-1">
                <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors" />
              </div>
            </a>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
        <p className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <span>
            <strong className="text-slate-900 dark:text-slate-100">Legal Disclaimer:</strong> These references are provided for informational purposes only and do not constitute legal advice. Always consult with a qualified attorney for legal matters.
          </span>
        </p>
      </div>
    </div>
  );
};