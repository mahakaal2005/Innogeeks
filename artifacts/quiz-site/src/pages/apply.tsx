import React, { useState } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const DOMAINS = [
  { id: "android", label: "Android Development" },
  { id: "web", label: "Web Development" },
  { id: "ml", label: "Machine Learning" },
  { id: "iot", label: "Internet of Things (IoT)" },
  { id: "arvr", label: "AR/VR" },
];

export default function ApplyPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [domain, setDomain] = useState("web");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);

    try {
      const res = await fetch("/api/recruitment/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, rollNumber, domain }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      toast({
        title: "Registration successful!",
        description: "Redirecting to payment...",
      });
      
      // Store application ID in memory/session for the payment page to use
      sessionStorage.setItem("applicationId", data.applicationId);
      sessionStorage.setItem("applicantEmail", email);
      setLocation("/payment");
    } catch (err) {
      toast({
        title: "Registration Error",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto py-12">
      <Card className="glass-panel border-white/10 bg-white/5 shadow-2xl">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-display text-white">Join the Club</CardTitle>
          <CardDescription className="text-white/60">
            Fill out your details to apply for the current recruitment drive.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-white/70">Full Name</Label>
              <Input
                required
                minLength={2}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="bg-white/5 border-white/20 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-white/70">KIET Email Address</Label>
              <Input
                required
                type="email"
                pattern=".*@kiet\.edu$"
                title="Must be a valid @kiet.edu email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john.doe@kiet.edu"
                className="bg-white/5 border-white/20 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white/70">Roll Number / Student ID</Label>
              <Input
                required
                minLength={5}
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="230001012"
                className="bg-white/5 border-white/20 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white/70">Domain Preference</Label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full h-10 px-3 py-2 rounded-md bg-white/5 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {DOMAINS.map(d => (
                  <option key={d.id} value={d.id} className="bg-slate-900 text-white">
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            <Button
              type="submit"
              disabled={busy}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-400 hover:to-purple-500 mt-4"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Proceed to Payment"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
