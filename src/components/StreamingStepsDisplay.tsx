import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ChevronDown, 
  ChevronUp, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Brain,
  Search,
  FileCheck,
  FileText,
  Loader2
} from 'lucide-react';
import { AnalysisStep } from '@/lib/streamingApi';

interface StreamingStepsDisplayProps {
  steps: AnalysisStep[];
  currentStep?: number;
  totalSteps?: number;
  isStreaming?: boolean;
}

const getStepIcon = (stepName: string, status: AnalysisStep['status']) => {
  const iconClass = "w-5 h-5";
  
  if (status === 'failed') {
    return <AlertTriangle className={`${iconClass} text-red-500`} />;
  }
  
  if (status === 'in_progress') {
    return <Loader2 className={`${iconClass} text-blue-500 animate-spin`} />;
  }
  
  if (status === 'completed') {
    return <CheckCircle className={`${iconClass} text-green-500`} />;
  }
  
  // Default icon based on step name
  if (stepName.includes('🧠') || stepName.toLowerCase().includes('initial') || stepName.toLowerCase().includes('analysis')) {
    return <Brain className={`${iconClass} text-slate-400`} />;
  }
  
  if (stepName.includes('🔎') || stepName.toLowerCase().includes('research') || stepName.toLowerCase().includes('query')) {
    return <Search className={`${iconClass} text-slate-400`} />;
  }
  
  if (stepName.includes('✅') || stepName.toLowerCase().includes('review') || stepName.toLowerCase().includes('synthesis')) {
    return <FileCheck className={`${iconClass} text-slate-400`} />;
  }
  
  if (stepName.includes('📝') || stepName.toLowerCase().includes('final') || stepName.toLowerCase().includes('opinion')) {
    return <FileText className={`${iconClass} text-slate-400`} />;
  }
  
  return <Clock className={`${iconClass} text-slate-400`} />;
};

const getStepColor = (status: AnalysisStep['status']) => {
  switch (status) {
    case 'completed':
      return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20';
    case 'in_progress':
      return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20';
    case 'failed':
      return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
    default:
      return 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50';
  }
};

export const StreamingStepsDisplay: React.FC<StreamingStepsDisplayProps> = ({
  steps,
  currentStep,
  totalSteps,
  isStreaming = false
}) => {
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());

  const toggleStep = (stepNumber: number) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepNumber)) {
      newExpanded.delete(stepNumber);
    } else {
      newExpanded.add(stepNumber);
    }
    setExpandedSteps(newExpanded);
  };

  const expandAll = () => {
    setExpandedSteps(new Set(steps.map(step => step.step_number)));
  };

  const collapseAll = () => {
    setExpandedSteps(new Set());
  };

  const progressPercentage = totalSteps ? Math.round((steps.filter(s => s.status === 'completed').length / totalSteps) * 100) : 0;

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            Analysis Progress
            {isStreaming && (
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin ml-2" />
            )}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={expandAll} disabled={steps.length === 0}>
              Expand All
            </Button>
            <Button variant="ghost" size="sm" onClick={collapseAll} disabled={steps.length === 0}>
              Collapse All
            </Button>
          </div>
        </div>
        
        {/* Progress Bar */}
        {totalSteps && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">
                Step {currentStep || steps.length} of {totalSteps}
              </span>
              <span className="text-slate-600 dark:text-slate-400">
                {progressPercentage}% Complete
              </span>
            </div>
            <Progress value={progressPercentage} className="w-full" />
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {steps.length === 0 && isStreaming && (
          <div className="flex items-center justify-center py-8 text-slate-500 dark:text-slate-400">
            <div className="text-center">
              <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" />
              <p>Initializing analysis...</p>
            </div>
          </div>
        )}

        {steps.map((step) => {
          const isExpanded = expandedSteps.has(step.step_number);
          const isCurrentStep = currentStep === step.step_number;
          
          return (
            <Collapsible
              key={step.step_number}
              open={isExpanded}
              onOpenChange={() => toggleStep(step.step_number)}
            >
              <div
                className={`
                  rounded-lg border p-4 transition-all duration-200
                  ${getStepColor(step.status)}
                  ${isCurrentStep ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
                `}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-0 h-auto hover:bg-transparent"
                  >
                    <div className="flex items-center gap-3">
                      {getStepIcon(step.step_name, step.status)}
                      <div className="text-left">
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {step.step_name}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {step.description}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {step.status === 'in_progress' && (
                        <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded-full">
                          Processing...
                        </span>
                      )}
                      {step.details && (
                        <>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          )}
                        </>
                      )}
                    </div>
                  </Button>
                </CollapsibleTrigger>
                
                {step.details && (
                  <CollapsibleContent className="mt-4">
                    <div className="pl-8 pr-4">
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                          <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
                            Step Details
                          </h4>
                          <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                            {step.details}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3 text-xs text-slate-500 dark:text-slate-400">
                        <span>Completed at {new Date(step.timestamp).toLocaleTimeString()}</span>
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Step {step.step_number}
                        </span>
                      </div>
                    </div>
                  </CollapsibleContent>
                )}
              </div>
            </Collapsible>
          );
        })}

        {/* Loading indicator for next step */}
        {isStreaming && steps.length > 0 && (
          <div className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
            <div>
              <div className="font-medium text-slate-900 dark:text-slate-100">
                Preparing next step...
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                AI is processing the analysis
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};