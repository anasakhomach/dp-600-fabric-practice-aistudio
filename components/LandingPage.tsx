import React from 'react';
import { Award, BookOpen, BrainCircuit, ChevronRight, Layout, Database, Terminal } from 'lucide-react';

interface Props {
  onStart: () => void;
}

const LandingPage: React.FC<Props> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-fabric-100 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-60"></div>
      </div>

      <div className="max-w-4xl w-full z-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-blue-100 rounded-full shadow-sm mb-8 animate-fade-in-up">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-sm font-medium text-slate-600">Updated for latest DP-600 Specs</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 tracking-tight leading-tight">
          Master Microsoft <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-fabric-600 to-blue-600">Fabric Analytics</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          The ultimate interactive preparation tool for the DP-600 certification. 
          Practice real-world scenarios, master case studies, and validate your skills.
        </p>

        <button 
          onClick={onStart}
          className="group relative inline-flex items-center gap-3 px-8 py-4 bg-fabric-600 text-white rounded-2xl text-lg font-semibold shadow-lg shadow-blue-500/30 hover:bg-fabric-500 hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300"
        >
          Start Practicing
          <ChevronRight className="group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left">
          <div className="p-6 bg-white/60 backdrop-blur-md border border-white/20 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4">
              <BookOpen size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Deep Case Studies</h3>
            <p className="text-slate-600 text-sm">Dive into Contoso and Litware scenarios mirroring the actual exam format.</p>
          </div>

          <div className="p-6 bg-white/60 backdrop-blur-md border border-white/20 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 mb-4">
              <BrainCircuit size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Smart Explanations</h3>
            <p className="text-slate-600 text-sm">Detailed breakdowns of why answers are correct, backed by official documentation.</p>
          </div>

          <div className="p-6 bg-white/60 backdrop-blur-md border border-white/20 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-4">
              <Layout size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Full Coverage</h3>
            <p className="text-slate-600 text-sm">Covers Lakehouses, Warehouses, Pipelines, Semantic Models, and Security.</p>
          </div>
        </div>

        {/* Footer Tech Stack visual */}
        <div className="mt-12 flex justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
           <div className="flex items-center gap-2 text-sm font-semibold text-slate-400">
              <Database size={16} /> Data Engineering
           </div>
           <div className="flex items-center gap-2 text-sm font-semibold text-slate-400">
              <Terminal size={16} /> Spark & SQL
           </div>
           <div className="flex items-center gap-2 text-sm font-semibold text-slate-400">
              <Award size={16} /> Certification
           </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;