import React from 'react';
import { Button } from '@/components/ui/button';
import { Scale, ArrowRight, Shield, Brain, FileText, CheckCircle, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Scale className="w-8 h-8 text-amber-600" />
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Legal Advisor AI Agent</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">Professional AI-powered legal analysis</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Scale className="w-20 h-20 text-amber-600" />
              <Sparkles className="w-6 h-6 text-amber-400 absolute -top-2 -right-2 animate-pulse" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            Legal Advisor
            <span className="block text-amber-600">AI Agent</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-8 max-w-3xl mx-auto">
            Get comprehensive legal analysis powered by advanced AI. 
            <span className="block mt-2">Professional-grade insights with step-by-step reasoning.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link to="/analyze">
              <Button size="lg" className="text-lg px-8 py-4 h-auto">
                Start Legal Analysis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex justify-center mb-4">
                <Brain className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
                AI-Powered Analysis
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Advanced artificial intelligence analyzes your legal case with step-by-step reasoning and comprehensive research.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex justify-center mb-4">
                <FileText className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
                Professional Reports
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Get detailed legal analysis reports formatted like professional legal documents with proper citations and references.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex justify-center mb-4">
                <Shield className="w-12 h-12 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
                Reliable & Accurate
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Built with legal expertise and powered by cutting-edge AI to provide reliable and accurate legal insights.
              </p>
            </div>
          </div>

          {/* How it Works */}
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-12">
              How It Works
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">1</span>
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Describe Your Case</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Provide details about your legal situation, including facts, parties, and questions
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-amber-600 dark:text-amber-400 font-bold text-lg">2</span>
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">AI Analysis</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Our AI conducts initial analysis and thorough research with transparent reasoning
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 dark:text-green-400 font-bold text-lg">3</span>
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Professional Report</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Receive a comprehensive legal analysis formatted as a professional document
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Legal References</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Get relevant legal sources and references to support the analysis
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Get Professional Legal Analysis?
            </h2>
            <p className="text-lg mb-6 text-blue-100">
              Start your legal case analysis now with our AI-powered platform
            </p>
            <Link to="/analyze">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-4 h-auto bg-white text-slate-900 hover:bg-slate-100">
                Start Legal Analysis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="text-sm text-amber-600 dark:text-amber-400 font-semibold mb-2">
              ⚖️ AI-Generated Analysis Disclaimer
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              This tool provides AI-generated legal analysis for informational purposes only. 
              Always consult with a qualified lawyer for professional legal advice.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500">
              &copy; 2025 Legal Advisor AI Agent. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;