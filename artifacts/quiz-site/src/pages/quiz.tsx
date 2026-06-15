import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useGetQuiz, useSubmitQuiz, getGetQuizQueryKey } from "@workspace/api-client-react";
import { useQuizContext } from "@/lib/quiz-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, AlertCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Quiz() {
  const [, setLocation] = useLocation();
  const { email, eligibility, setEligibility } = useQuizContext();
  const { toast } = useToast();
  
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  
  const submitQuiz = useSubmitQuiz();
  const submitFnRef = useRef(submitQuiz.mutateAsync);
  submitFnRef.current = submitQuiz.mutateAsync;
  const submittedRef = useRef(false);

  // Redirect if no eligibility
  useEffect(() => {
    if (!email || !eligibility || !eligibility.quizId) {
      setLocation("/");
    }
  }, [email, eligibility, setLocation]);

  const quizId = eligibility?.quizId;
  const { data: quizResponse, isLoading, isError, error } = useGetQuiz(quizId || "", {
    query: {
      enabled: !!quizId,
      queryKey: getGetQuizQueryKey(quizId || ""),
    }
  });

  // Timer logic
  useEffect(() => {
    if (quizResponse?.quiz.time_limit_seconds && timeLeft === null) {
      setTimeLeft(quizResponse.quiz.time_limit_seconds);
    }
  }, [quizResponse, timeLeft]);

  useEffect(() => {
    if (timeLeft === null) return;
    
    if (timeLeft <= 0) {
      handleAutoSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Prevent leaving
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const handleAutoSubmit = async () => {
    if (!email || !eligibility) return;
    if (submittedRef.current) return;
    submittedRef.current = true;

    try {
      const result = await submitFnRef.current({
        quizId: eligibility.quizId,
        data: {
          email,
          applicationId: eligibility.applicationId,
          answers,
        }
      });
      
      setEligibility({
        ...eligibility,
        alreadySubmitted: true,
        result: {
          score: result.score,
          total: result.total,
          passed: result.passed
        }
      });
      setLocation("/result");
    } catch (err: any) {
      submittedRef.current = false;
      toast({
        title: "Auto-submit failed",
        description: err?.data?.error || "Could not submit your answers.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async () => {
    if (!email || !eligibility) return;
    if (submittedRef.current) return;
    
    const questions = quizResponse?.questions || [];
    if (Object.keys(answers).length < questions.length) {
      const confirm = window.confirm("You have unanswered questions. Are you sure you want to submit?");
      if (!confirm) return;
    }

    submittedRef.current = true;
    try {
      const result = await submitQuiz.mutateAsync({
        quizId: eligibility.quizId,
        data: {
          email,
          applicationId: eligibility.applicationId,
          answers,
        }
      });
      
      setEligibility({
        ...eligibility,
        alreadySubmitted: true,
        result: {
          score: result.score,
          total: result.total,
          passed: result.passed
        }
      });
      setLocation("/result");
    } catch (err: any) {
      submittedRef.current = false;
      toast({
        title: "Submission failed",
        description: err?.data?.error || "Could not submit your answers. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleOptionSelect = (questionId: string, optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  if (!email || !eligibility) return null;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-white/60 font-mono">Loading questions...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive" className="glass-panel max-w-md bg-red-500/10 text-red-200 border-red-500/30">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load quiz. {(error as any)?.data?.error || "Please try refreshing the page."}
        </AlertDescription>
      </Alert>
    );
  }

  const questions = quizResponse?.questions || [];
  const answeredCount = Object.keys(answers).length;
  const progressPercent = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeLeft !== null && timeLeft <= 60; // less than 1 minute

  return (
    <div className="w-full max-w-3xl flex flex-col h-[calc(100dvh-120px)]">
      {/* Header Sticky Area */}
      <div className="sticky top-0 z-20 glass-panel mb-8 p-4 md:p-6 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between bg-white/5 border-white/10 shadow-lg">
        <div className="flex-1 w-full">
          <h2 className="text-xl font-display font-semibold text-white truncate">
            {quizResponse?.quiz.title}
          </h2>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex-1 max-w-xs">
              <div className="flex justify-between text-xs mb-1 font-mono text-white/60">
                <span>Progress</span>
                <span>{answeredCount} / {questions.length}</span>
              </div>
              <Progress value={progressPercent} className="h-1.5 bg-white/10" />
            </div>
          </div>
        </div>

        {timeLeft !== null && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xl font-bold border transition-colors ${
            isLowTime 
              ? "bg-red-500/20 border-red-500/50 text-red-400 animate-pulse" 
              : "bg-white/5 border-white/10 text-white"
          }`}>
            <Clock className="w-5 h-5" />
            {formatTime(timeLeft)}
          </div>
        )}
      </div>

      {/* Questions Scroll Area */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8 pb-32">
        {questions.map((q, idx) => (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-panel p-6 rounded-2xl bg-white/5 border-white/10"
          >
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-mono text-sm text-white/80 border border-white/10">
                {idx + 1}
              </div>
              <div className="flex-1">
                <p className="text-lg text-white mb-6 font-medium leading-relaxed">
                  {q.question_text}
                </p>
                <div className="space-y-3">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = answers[q.id] === optIdx;
                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleOptionSelect(q.id, optIdx)}
                        className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center gap-3 ${
                          isSelected
                            ? "bg-primary/20 border-primary text-white"
                            : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20"
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border flex-shrink-0 flex items-center justify-center transition-colors ${
                          isSelected ? "border-primary bg-primary" : "border-white/30"
                        }`}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <span className="flex-1">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer Submit Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-[#0a0a1a] via-[#0a0a1a]/80 to-transparent z-20 flex justify-center">
        <Button 
          onClick={handleSubmit}
          disabled={submitQuiz.isPending}
          className="w-full max-w-md h-14 text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white shadow-xl shadow-blue-500/20"
        >
          {submitQuiz.isPending ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            `Submit Quiz (${answeredCount}/${questions.length} answered)`
          )}
        </Button>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
