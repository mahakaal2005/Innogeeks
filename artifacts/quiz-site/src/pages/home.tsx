import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useValidateQuizEmail } from "@workspace/api-client-react";
import { useQuizContext } from "@/lib/quiz-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const formSchema = z.object({
  email: z.string().email("Invalid email address").regex(/@kiet\.edu$/, "Must be a KIET email address (@kiet.edu)"),
});

export default function Home() {
  const [, setLocation] = useLocation();
  const { setEmail, setEligibility } = useQuizContext();
  const { toast } = useToast();
  
  const validateEmail = useValidateQuizEmail();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const result = await validateEmail.mutateAsync({
        data: { email: values.email }
      });
      
      setEmail(values.email);
      setEligibility(result);

      if (result.alreadySubmitted) {
        setLocation("/result");
      } else if (result.canTake) {
        setLocation("/quiz");
      } else {
        toast({
          title: "Cannot take quiz",
          description: "You are not eligible to take this quiz at this time.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Validation Failed",
        description: err?.data?.error || "Could not validate email. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <Card className="glass-panel border-white/10 bg-white/5 shadow-2xl">
        <CardHeader className="space-y-2 pb-6 text-center">
          <CardTitle className="text-3xl font-display">Recruitment Quiz</CardTitle>
          <CardDescription className="text-white/60">
            Enter your KIET college email to begin the Round 1 quiz.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/80 uppercase tracking-wider text-xs">College Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="firstname.lastname@kiet.edu" 
                        {...field} 
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/30 h-12 focus-visible:ring-primary focus-visible:border-primary transition-all"
                        disabled={validateEmail.isPending}
                        data-testid="input-email"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white border-0 shadow-lg"
                disabled={validateEmail.isPending}
                data-testid="button-submit-email"
              >
                {validateEmail.isPending ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <>Start Quiz <ArrowRight className="ml-2 h-5 w-5" /></>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
