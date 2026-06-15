import React from "react";
import { useLocation } from "wouter";
import { useQuizContext } from "@/lib/quiz-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Result() {
  const [, setLocation] = useLocation();
  const { email, eligibility, clear } = useQuizContext();

  if (!email || !eligibility || !eligibility.result) {
    return (
      <div className="text-center text-white/60">
        <p>No result available.</p>
        <Button onClick={() => setLocation("/")} variant="ghost" className="mt-4">
          Go back
        </Button>
      </div>
    );
  }

  const { result, applicantName, passingScore } = eligibility;
  const isPass = result.passed;
  const percent = Math.round((result.score / result.total) * 100) || 0;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md"
    >
      <Card className="glass-panel border-white/10 bg-white/5 shadow-2xl overflow-hidden relative">
        <div className={`absolute top-0 left-0 w-full h-1.5 ${isPass ? 'bg-green-500' : 'bg-red-500'}`} />
        
        <CardHeader className="space-y-4 pb-6 text-center pt-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center border-4 ${
              isPass ? "bg-green-500/20 border-green-500/50 text-green-400" : "bg-red-500/20 border-red-500/50 text-red-400"
            }`}
          >
            {isPass ? <CheckCircle2 className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
          </motion.div>
          <CardTitle className="text-3xl font-display text-white">
            {isPass ? "Congratulations!" : "Keep Learning"}
          </CardTitle>
          <p className="text-white/70 text-lg">
            {applicantName ? `${applicantName}, y` : "Y"}ou have completed the quiz.
          </p>
        </CardHeader>

        <CardContent className="space-y-8">
          <div className="glass-panel bg-black/20 p-6 rounded-2xl flex flex-col items-center justify-center border border-white/5">
            <span className="text-sm font-mono text-white/50 uppercase tracking-wider mb-2">Your Score</span>
            <div className="flex items-baseline gap-2">
              <span className={`text-6xl font-display font-bold ${isPass ? 'text-green-400' : 'text-red-400'}`}>
                {result.score}
              </span>
              <span className="text-2xl text-white/40">/ {result.total}</span>
            </div>
            <div className="mt-4 w-full max-w-[200px] h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className={`h-full ${isPass ? 'bg-green-500' : 'bg-red-500'}`} 
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="text-xs text-white/40 mt-3">Passing score: {passingScore}</span>
          </div>

          <div className="text-center text-white/80 leading-relaxed">
            {isPass ? (
              <p>You have cleared Round 1. Stay tuned to your email for details regarding Round 2 of the recruitment process!</p>
            ) : (
              <p>Unfortunately, you did not meet the threshold this time. We appreciate your effort and encourage you to try again next time!</p>
            )}
          </div>

          <Button 
            onClick={() => {
              clear();
              setLocation("/");
            }} 
            variant="ghost"
            className="w-full text-white/60 hover:text-white hover:bg-white/10"
          >
            Return to Start <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
