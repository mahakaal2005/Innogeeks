import React, { createContext, useContext, useState, ReactNode } from "react";
import type { QuizEligibility } from "@workspace/api-client-react";

interface QuizState {
  email: string | null;
  eligibility: QuizEligibility | null;
  setEmail: (email: string) => void;
  setEligibility: (eligibility: QuizEligibility | null) => void;
  clear: () => void;
}

const QuizContext = createContext<QuizState | undefined>(undefined);

export function QuizProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);
  const [eligibility, setEligibility] = useState<QuizEligibility | null>(null);

  const clear = () => {
    setEmail(null);
    setEligibility(null);
  };

  return (
    <QuizContext.Provider value={{ email, eligibility, setEmail, setEligibility, clear }}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuizContext() {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error("useQuizContext must be used within a QuizProvider");
  }
  return context;
}
