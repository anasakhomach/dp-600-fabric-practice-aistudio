import React, { useState, useEffect } from 'react';
import { fetchQuestions } from './services/api';
import { Question, UserProgress } from './types';
import { saveProgress, loadProgress, clearProgress } from './services/storage';
import QuestionCard from './components/QuestionCard';
import CaseStudyPanel from './components/CaseStudyPanel';
import LandingPage from './components/LandingPage';
import { RotateCcw, Award, ChevronLeft, ChevronRight, Loader2, Filter, Layers, Shuffle, Bookmark, Menu, X } from 'lucide-react';

const App: React.FC = () => {
  // Navigation State
  const [hasStarted, setHasStarted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // App Data State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, UserProgress>>({});
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set());
  const [activeCaseStudy, setActiveCaseStudy] = useState<'Contoso' | 'Litware' | null>(null);
  const [showResults, setShowResults] = useState(false);
  
  // Filters
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<string>('All');
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  const [isShuffled, setIsShuffled] = useState<boolean>(true);
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState<boolean>(false);

  // Initialize: Load Questions + Progress
  useEffect(() => {
    const initApp = async () => {
      try {
        setIsLoading(true);
        let fetchedQuestions = await fetchQuestions({ 
          shuffle: isShuffled,
          caseStudy: selectedCaseStudy,
          domain: selectedDomain
        }); 

        // Load saved state
        const saved = loadProgress();
        let loadedBookmarks = new Set<number>();

        if (saved) {
          if (saved.answers) setAnswers(saved.answers);
          if (saved.bookmarkedQuestionIds) {
            loadedBookmarks = new Set(saved.bookmarkedQuestionIds);
            setBookmarkedIds(loadedBookmarks);
          }
        }

        // Apply local bookmark filter if enabled
        if (showBookmarkedOnly) {
          fetchedQuestions = fetchedQuestions.filter(q => loadedBookmarks.has(q.id));
        }

        setQuestions(fetchedQuestions);
        
        // Always start at 0 (Question 1) unless resume logic moves us
        setCurrentQuestionIndex(0);

        // Resume logic (only if not filtering by bookmarks specifically, or handle gracefully)
        if (saved && saved.answers && !showBookmarkedOnly) {
          const answeredIds = Object.keys(saved.answers).map(Number);
          const validQuestionIds = fetchedQuestions.map(q => q.id);
          const allAnswered = validQuestionIds.length > 0 && validQuestionIds.every(id => answeredIds.includes(id));
          
          if (allAnswered) {
            setShowResults(true);
          } else {
            // Find the first unanswered question in the CURRENT shuffled order
            const nextIdx = fetchedQuestions.findIndex(q => !answeredIds.includes(q.id));
            if (nextIdx !== -1) {
              setCurrentQuestionIndex(nextIdx);
            }
          }
        }
      } catch (err) {
        setError("Failed to load question database. Please ensure questions.json exists.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (hasStarted) {
      initApp();
    }
  }, [hasStarted, selectedCaseStudy, selectedDomain, isShuffled, showBookmarkedOnly]);

  // Derived score
  const currentViewScore = questions.reduce((acc, q) => {
    const ans = answers[q.id];
    return ans?.isCorrect ? acc + 10 : acc;
  }, 0);

  // Save on updates
  useEffect(() => {
    if (hasStarted && !isLoading && (questions.length > 0 || bookmarkedIds.size > 0)) {
      saveProgress({
        currentQuestionIndex,
        answers,
        score: currentViewScore,
        isReviewMode: showResults,
        bookmarkedQuestionIds: Array.from(bookmarkedIds)
      });
    }
  }, [answers, currentViewScore, currentQuestionIndex, showResults, isLoading, questions.length, hasStarted, bookmarkedIds]);

  const handleAnswer = (questionId: number, selectedOptionIds: string[], isCorrect: boolean) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        questionId,
        selectedOptionIds,
        isCorrect,
        timestamp: Date.now()
      }
    }));
  };

  const handleBookmarkToggle = (questionId: number) => {
    setBookmarkedIds(prev => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset your progress? This cannot be undone.")) {
      clearProgress();
      setAnswers({});
      setBookmarkedIds(new Set());
      setCurrentQuestionIndex(0);
      setShowResults(false);
      setActiveCaseStudy(null);
      // Also reset filter if active to avoid empty state confusion
      setShowBookmarkedOnly(false);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Render Landing Page if not started
  if (!hasStarted) {
    return <LandingPage onStart={() => setHasStarted(true)} />;
  }

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 text-fabric-900">
        <Loader2 size={48} className="animate-spin mb-4 text-fabric-600" />
        <h2 className="text-xl font-semibold">Preparing Environment...</h2>
        <p className="text-slate-500 mt-2">Loading database and schemas</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-100 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
            <RotateCcw size={32} />
          </div>
          <div className="text-red-500 font-bold text-xl mb-2">Connection Error</div>
          <p className="text-slate-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
          >
            Reload Application
          </button>
        </div>
      </div>
    );
  }

  // Safe check if questions are empty
  if (questions.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
            {showBookmarkedOnly ? <Bookmark size={32} fill="currentColor" /> : <Filter size={32} />}
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            {showBookmarkedOnly ? "No Bookmarks Yet" : "No Questions Found"}
          </h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            {showBookmarkedOnly 
              ? "You haven't bookmarked any questions yet. Go back to the full list and tap the 'Bookmark' button on any question to save it here for later review." 
              : "No questions match your current filters. Try adjusting your selection."}
          </p>
          <button 
            onClick={() => {
              if (showBookmarkedOnly) setShowBookmarkedOnly(false);
              else {
                setSelectedCaseStudy('All');
                setSelectedDomain('All');
                setIsShuffled(false);
              }
            }}
            className="px-8 py-3 bg-fabric-600 text-white rounded-xl hover:bg-fabric-700 transition-all shadow-lg shadow-fabric-200 font-medium"
          >
            {showBookmarkedOnly ? "Show All Questions" : "Clear All Filters"}
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const maxPossibleScore = questions.length * 10;
  const percentageScore = maxPossibleScore > 0 ? Math.round((currentViewScore / maxPossibleScore) * 100) : 0;

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans text-slate-900 selection:bg-fabric-100 selection:text-fabric-900">
      
      {/* Enhanced Navbar */}
      <nav className="flex-shrink-0 bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 flex items-center justify-between px-4 md:px-8 z-20 sticky top-0">
        <div className="flex items-center gap-3">
          <button onClick={() => setHasStarted(false)} className="w-10 h-10 bg-gradient-to-br from-fabric-500 to-fabric-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-fabric-200 hover:scale-105 transition-transform">
            DP
          </button>
          <div className="hidden md:block">
            <h1 className="text-lg font-bold text-slate-800 leading-tight">
              Fabric Master
            </h1>
            <span className="text-xs text-slate-500 font-medium">Exam Prep</span>
          </div>
        </div>
        
        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3 overflow-x-auto no-scrollbar py-2">
          
          {/* Enhanced Filters */}
          <div className="flex items-center gap-3 bg-slate-100/50 p-1 rounded-xl border border-slate-200">
            <div className="relative group px-2">
              <Filter size={16} className="text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select 
                value={selectedCaseStudy}
                onChange={(e) => { setShowResults(false); setSelectedCaseStudy(e.target.value); }}
                className="bg-transparent pl-7 pr-2 py-1 text-sm font-medium text-slate-600 focus:outline-none cursor-pointer hover:text-fabric-600 appearance-none"
              >
                <option value="All">All Cases</option>
                <option value="Contoso">Contoso</option>
                <option value="Litware">Litware</option>
              </select>
            </div>
            
            <div className="w-px h-4 bg-slate-300"></div>

            <div className="relative group px-2">
              <Layers size={16} className="text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select 
                value={selectedDomain}
                onChange={(e) => { setShowResults(false); setSelectedDomain(e.target.value); }}
                className="bg-transparent pl-7 pr-2 py-1 text-sm font-medium text-slate-600 focus:outline-none cursor-pointer hover:text-fabric-600 appearance-none"
              >
                <option value="All">All Domains</option>
                <option value="Maintain">Maintain</option>
                <option value="Prepare">Prepare</option>
                <option value="Model">Model</option>
                <option value="Analyze">Analyze</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => { setShowResults(false); setIsShuffled(!isShuffled); }}
            className={`p-2 rounded-lg transition-all ${
              isShuffled 
                ? 'bg-fabric-100 text-fabric-600 ring-1 ring-fabric-200 shadow-inner' 
                : 'text-slate-400 hover:text-fabric-600 hover:bg-slate-100'
            }`}
            title="Shuffle Questions"
          >
            <Shuffle size={20} />
          </button>

          <button
            onClick={() => { setShowResults(false); setShowBookmarkedOnly(!showBookmarkedOnly); }}
            className={`p-2 rounded-lg transition-all ${
              showBookmarkedOnly
                ? 'bg-yellow-100 text-yellow-600 ring-1 ring-yellow-200 shadow-inner' 
                : 'text-slate-400 hover:text-yellow-600 hover:bg-yellow-50'
            }`}
            title={showBookmarkedOnly ? "Show All Questions" : "Filter Bookmarked Only"}
          >
            <Bookmark size={20} fill={showBookmarkedOnly ? "currentColor" : "none"} />
          </button>

          <div className="h-6 w-px bg-slate-200 mx-1"></div>

          <button 
            onClick={handleReset}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Reset Progress"
          >
            <RotateCcw size={20} />
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="absolute top-16 left-0 w-full bg-white border-b border-slate-200 shadow-xl z-30 md:hidden flex flex-col p-4 gap-4 animate-in slide-in-from-top-2 fade-in duration-200">
              
              {/* Filters */}
              <div className="grid grid-cols-1 gap-4">
                  {/* Case Study */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-3">
                      <Filter size={18} className="text-slate-400" />
                      <div className="flex-1">
                          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Case Study</label>
                          <select 
                              value={selectedCaseStudy}
                              onChange={(e) => { setShowResults(false); setSelectedCaseStudy(e.target.value); setIsMenuOpen(false); }}
                              className="w-full bg-transparent font-medium text-slate-700 focus:outline-none"
                          >
                              <option value="All">All Cases</option>
                              <option value="Contoso">Contoso</option>
                              <option value="Litware">Litware</option>
                          </select>
                      </div>
                  </div>

                  {/* Domain */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-3">
                      <Layers size={18} className="text-slate-400" />
                      <div className="flex-1">
                          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Domain</label>
                          <select 
                              value={selectedDomain}
                              onChange={(e) => { setShowResults(false); setSelectedDomain(e.target.value); setIsMenuOpen(false); }}
                              className="w-full bg-transparent font-medium text-slate-700 focus:outline-none"
                          >
                              <option value="All">All Domains</option>
                              <option value="Maintain">Maintain</option>
                              <option value="Prepare">Prepare</option>
                              <option value="Model">Model</option>
                              <option value="Analyze">Analyze</option>
                          </select>
                      </div>
                  </div>
              </div>

              {/* Toggles Row */}
              <div className="grid grid-cols-3 gap-3">
                  <button
                      onClick={() => { setShowResults(false); setIsShuffled(!isShuffled); }}
                      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                      isShuffled 
                          ? 'bg-fabric-50 border-fabric-200 text-fabric-600' 
                          : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                  >
                      <Shuffle size={20} />
                      <span className="text-xs font-bold">Shuffle</span>
                  </button>

                  <button
                      onClick={() => { setShowResults(false); setShowBookmarkedOnly(!showBookmarkedOnly); setIsMenuOpen(false); }}
                      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                      showBookmarkedOnly
                          ? 'bg-yellow-50 border-yellow-200 text-yellow-600' 
                          : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                  >
                      <Bookmark size={20} fill={showBookmarkedOnly ? "currentColor" : "none"} />
                      <span className="text-xs font-bold">Saved</span>
                  </button>

                  <button 
                      onClick={() => { handleReset(); setIsMenuOpen(false); }}
                      className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all"
                  >
                      <RotateCcw size={20} />
                      <span className="text-xs font-bold">Reset</span>
                  </button>
              </div>
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {!showResults ? (
            <>
              {/* Question Card with embedded progress info */}
              <div className="flex-1 relative animate-fade-in">
                <QuestionCard
                  question={currentQuestion}
                  existingAnswer={answers[currentQuestion.id]}
                  isBookmarked={bookmarkedIds.has(currentQuestion.id)}
                  questionIndex={currentQuestionIndex}
                  totalQuestions={questions.length}
                  score={currentViewScore}
                  onBookmarkToggle={() => handleBookmarkToggle(currentQuestion.id)}
                  onAnswer={handleAnswer}
                  onShowCaseStudy={() => currentQuestion.caseStudyRef && setActiveCaseStudy(currentQuestion.caseStudyRef)}
                  onNext={handleNext}
                />
              </div>

              {/* Bottom Nav */}
              <div className="flex-shrink-0 bg-white border-t border-slate-200 p-4 md:px-8 flex justify-center items-center safe-area-bottom">
                <div className="max-w-4xl w-full flex justify-between items-center">
                  <button 
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all
                      ${currentQuestionIndex === 0 
                        ? 'text-slate-300 cursor-not-allowed' 
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:scale-95'}
                    `}
                  >
                    <ChevronLeft size={18} /> Previous
                  </button>

                  <div className="text-xs font-mono text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                     ID: {currentQuestion.id}
                  </div>

                  <button 
                    onClick={handleNext}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm
                      ${currentQuestionIndex === questions.length - 1 && !answers[currentQuestion.id]
                        ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                        : 'bg-slate-900 text-white hover:bg-black hover:shadow-md active:scale-95'}
                    `}
                  >
                    Next <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-lg w-full text-center border border-slate-100 animate-scale-in">
                <div className="w-24 h-24 bg-gradient-to-tr from-green-400 to-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-green-200">
                  <Award size={48} strokeWidth={2.5} />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-3">Practice Complete!</h2>
                <p className="text-slate-500 mb-10 text-lg">
                  You have answered all {questions.length} questions in this set.
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-10">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <div className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Total Score</div>
                    <div className="text-3xl font-bold text-fabric-600">{currentViewScore}</div>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <div className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Accuracy</div>
                    <div className={`text-3xl font-bold ${percentageScore >= 70 ? 'text-green-600' : 'text-orange-500'}`}>
                      {percentageScore}%
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setShowResults(false)}
                  className="w-full py-4 bg-fabric-600 text-white rounded-2xl font-bold text-lg hover:bg-fabric-700 transition-all shadow-lg shadow-fabric-200 hover:-translate-y-1"
                >
                  Review Answers
                </button>
              </div>
            </div>
          )}
        </main>

        <CaseStudyPanel 
          caseStudy={activeCaseStudy || 'Contoso'} 
          isOpen={!!activeCaseStudy} 
          onClose={() => setActiveCaseStudy(null)} 
        />
      </div>
    </div>
  );
};

export default App;