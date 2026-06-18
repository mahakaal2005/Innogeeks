import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function PaymentPage() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [appId, setAppId] = useState<string | null>(null);

  useEffect(() => {
    const id = sessionStorage.getItem("applicationId");
    if (!id) {
      toast({
        title: "Session Expired",
        description: "Please register first.",
        variant: "destructive",
      });
      setLocation("/apply");
    } else {
      setAppId(id);
    }
  }, [setLocation, toast]);

  if (!appId) return null;

  return (
    <div className="w-full max-w-lg mx-auto py-12">
      <Card className="glass-panel border-white/10 bg-white/5 shadow-2xl">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-display text-white">Complete Registration</CardTitle>
          <CardDescription className="text-white/60">
            Scan the QR code below to pay the recruitment fee of ₹100.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <div className="w-48 h-48 bg-white rounded-xl p-2 flex items-center justify-center">
            {/* Placeholder for UPI QR Code */}
            <div className="text-black/50 font-bold text-center">
              [UPI QR CODE]
            </div>
          </div>
          
          <div className="text-center space-y-2 text-sm text-white/70">
            <p>Scan with Google Pay, PhonePe, or Paytm.</p>
            <p>Once paid, your application will be manually verified by a coordinator within 24 hours.</p>
          </div>

          <Button
            onClick={() => {
              toast({ title: "Recorded", description: "Your payment will be verified shortly." });
              sessionStorage.clear();
              setLocation("/");
            }}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-400 hover:to-purple-500 mt-4"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            I have made the payment
          </Button>

          <button
            onClick={() => {
              sessionStorage.clear();
              setLocation("/");
            }}
            className="text-xs text-white/40 hover:text-white"
          >
            Pay later / Pay by cash to coordinator
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
