import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Brain, Search, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { ThinkingStep } from '@/lib/legalAdvisorAgent';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ThinkingStepsDisplayProps {
  steps: ThinkingStep[];
  isStreaming?: boolean;
  currentStep?: number;
}

const getStepIcon = (stepName: string) => {
  const name = stepName.toLowerCase();
  if (name.includes('analysis') || name.includes('thinking')) return Brain;
  if (name.includes('research') || name.includes('search')) return Search;
  if (name.includes('complete') || name.includes('final')) return CheckCircle;
  return AlertCircle;
};

const getStepColor = (stepName: string) => {
  const name = stepName.toLowerCase();
  if (name.includes('analysis') || name.includes('thinking')) return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
  if (name.includes('research') || name.includes('search')) return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30';
  if (name.includes('complete') || name.includes('final')) return 'text-green-600 bg-green-100 dark:bg-green-900/30';
  return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30';
};

export const ThinkingStepsDisplay: React.FC<ThinkingStepsDisplayProps> = ({ 
  steps, 
  isStreaming = false, 
  currentStep 
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

  if (!steps || steps.length === 0) {
    return (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-blue-600" />
            AI Thinking Process
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500 dark:text-slate-400 italic">
            {isStreaming ? "Waiting for AI to begin thinking..." : "No thinking steps available."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-blue-600" />
            AI Thinking Process
            <Badge variant="secondary" className="ml-2">
              {steps.length} {steps.length === 1 ? 'step' : 'steps'}
            </Badge>
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={expandAll}>
              Expand All
            </Button>
            <Button variant="outline" size="sm" onClick={collapseAll}>
              Collapse All
            </Button>
          </div>
        </div>
        {isStreaming && (
          <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            Currently processing step {currentStep || steps.length + 1}...
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {steps.map((step, index) => {
          const StepIcon = getStepIcon(step.step_name);
          const isExpanded = expandedSteps.has(step.step_number);
          const isCurrentStep = isStreaming && currentStep === step.step_number;
          const colorClasses = getStepColor(step.step_name);
          
          return (
            <div 
              key={step.step_number} 
              className={`border rounded-lg transition-all duration-300 ${
                isCurrentStep 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 shadow-lg' 
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div 
                className="p-4 cursor-pointer"
                onClick={() => toggleStep(step.step_number)}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${colorClasses}`}>
                    <StepIcon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        Step {step.step_number}: {step.step_name}
                        {isCurrentStep && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                        )}
                      </h3>
                      <div className="flex items-center gap-2">
                        {step.timestamp && (
                          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                            <Clock className="w-3 h-3" />
                            {new Date(step.timestamp).toLocaleTimeString()}
                          </div>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
              
              {isExpanded && (
                <div className="px-4 pb-4">
                  <div className="ml-14 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                      Detailed Reasoning:
                    </h4>
                    <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {step.details || "No detailed information available for this step."}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        
        {isStreaming && (
          <div className="flex items-center justify-center p-6 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                AI is currently thinking...
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};