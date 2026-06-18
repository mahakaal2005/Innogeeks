import React, { useState } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MOCK_APPLICANTS = [
  { id: "app-1", name: "Bob Student", email: "bob@kiet.edu", domain: "web", payment_status: "cash_pending", status: "registered" },
  { id: "app-2", name: "Alice Hacker", email: "alice@kiet.edu", domain: "android", payment_status: "approved", status: "registered" },
  { id: "app-3", name: "Charlie Dev", email: "charlie@kiet.edu", domain: "ml", payment_status: "approved", status: "round1_qualified" },
];

export default function AdminRecruitment() {
  const { toast } = useToast();
  const [windowOpen, setWindowOpen] = useState(true);
  const [applicants, setApplicants] = useState(MOCK_APPLICANTS);
  const [busy, setBusy] = useState<string | null>(null);

  async function toggleWindow() {
    setBusy("window");
    try {
      const action = windowOpen ? "close" : "open";
      const res = await fetch("/api/recruitment/window", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionStorage.getItem("admin_token") || "mock-token"}`
        },
        body: JSON.stringify({ action, academicYear: "2024-25" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to toggle window");
      
      setWindowOpen(data.isOpen);
      toast({ title: "Success", description: `Recruitment window is now ${data.isOpen ? 'OPEN' : 'CLOSED'}` });
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed", variant: "destructive" });
    } finally {
      setBusy(null);
    }
  }

  async function approveCash(appId: string) {
    setBusy(`cash-${appId}`);
    try {
      const res = await fetch("/api/recruitment/approve-cash", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionStorage.getItem("admin_token") || "mock-token"}`
        },
        body: JSON.stringify({ applicationId: appId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to approve cash");
      
      setApplicants(applicants.map(a => a.id === appId ? { ...a, payment_status: "approved" } : a));
      toast({ title: "Success", description: "Payment approved." });
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed", variant: "destructive" });
    } finally {
      setBusy(null);
    }
  }

  async function shortlistCandidate(appId: string) {
    setApplicants(applicants.map(a => a.id === appId ? { ...a, status: "round1_qualified" } : a));
    toast({ title: "Shortlisted", description: "Candidate moved to Round 1." });
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Recruitment Hub</h1>
            <p className="text-sm text-white/50">Manage applications, verify payments, and shortlist candidates.</p>
          </div>
          <Card className="glass-panel border-white/10 bg-white/5 p-4 flex items-center gap-4">
            <div>
              <div className="text-sm font-semibold text-white">Window Status</div>
              <div className={`text-xs font-bold ${windowOpen ? 'text-green-400' : 'text-red-400'}`}>
                {windowOpen ? "● OPEN" : "● CLOSED"}
              </div>
            </div>
            <Button
              onClick={toggleWindow}
              disabled={busy === "window"}
              variant="outline"
              className={`border-white/20 ${windowOpen ? 'hover:bg-red-500/20 text-red-300' : 'hover:bg-green-500/20 text-green-300'}`}
            >
              {busy === "window" ? <Loader2 className="h-4 w-4 animate-spin" /> : (windowOpen ? "Close Window" : "Open Window")}
            </Button>
          </Card>
        </div>

        <Card className="glass-panel border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-lg text-white">Applicants</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-white/70">
                <thead className="text-xs text-white/50 uppercase bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Domain</th>
                    <th className="px-6 py-4">Payment</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applicants.map((a) => (
                    <tr key={a.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">{a.name}</div>
                        <div className="text-xs text-white/40">{a.email}</div>
                      </td>
                      <td className="px-6 py-4 uppercase font-bold text-blue-300">{a.domain}</td>
                      <td className="px-6 py-4">
                        {a.payment_status === "approved" ? (
                          <span className="flex items-center gap-1 text-green-400"><CheckCircle className="w-4 h-4" /> Paid</span>
                        ) : (
                          <span className="flex items-center gap-1 text-yellow-400"><XCircle className="w-4 h-4" /> Pending</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded text-xs bg-white/10 text-white font-semibold">
                          {a.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {a.payment_status !== "approved" && (
                          <Button 
                            size="sm" variant="outline" className="text-xs border-green-500/50 text-green-300 hover:bg-green-500/20"
                            onClick={() => approveCash(a.id)}
                            disabled={busy === `cash-${a.id}`}
                          >
                            Verify Cash
                          </Button>
                        )}
                        {a.payment_status === "approved" && a.status === "registered" && (
                          <Button 
                            size="sm" className="text-xs bg-purple-600 hover:bg-purple-500 text-white"
                            onClick={() => shortlistCandidate(a.id)}
                          >
                            Shortlist (Round 1)
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
