import React, { useState } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MOCK_MEMBERS = [
  { id: "uuid-1", name: "John Doe", email: "john@kiet.edu", role: "member", domain: "android" },
  { id: "uuid-2", name: "Jane Smith", email: "jane@kiet.edu", role: "coordinator", domain: "web" },
  { id: "uuid-3", name: "Alice Johnson", email: "alice@kiet.edu", role: "member", domain: "ml" },
  { id: "uuid-4", name: "Admin User", email: "admin@kiet.edu", role: "core_team", domain: null },
];

export default function AdminMembers() {
  const { toast } = useToast();
  const [members, setMembers] = useState(MOCK_MEMBERS);
  const [busy, setBusy] = useState<string | null>(null);

  async function handleRoleChange(userId: string, newRole: string) {
    setBusy(userId);
    try {
      const res = await fetch("/api/admin/set-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionStorage.getItem("admin_token") || "mock-token"}`
        },
        body: JSON.stringify({ userId, role: newRole }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to change role");
      }

      setMembers(members.map(m => m.id === userId ? { ...m, role: newRole } : m));
      toast({ title: "Role updated", description: "Successfully changed role." });
    } catch (err) {
      toast({
        title: "Update failed",
        description: err instanceof Error ? err.message : "Error",
        variant: "destructive",
      });
    } finally {
      setBusy(null);
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Roles & Members</h1>
          <p className="text-sm text-white/50">Manage club members and assign coordinator/core_team privileges.</p>
        </div>

        <Card className="glass-panel border-white/10 bg-white/5">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-white/70">
                <thead className="text-xs text-white/50 uppercase bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Domain</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <tr key={m.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="px-6 py-4 font-semibold text-white">{m.name}</td>
                      <td className="px-6 py-4">{m.email}</td>
                      <td className="px-6 py-4 uppercase">{m.domain || "N/A"}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          m.role === 'core_team' ? 'bg-purple-500/20 text-purple-300' :
                          m.role === 'coordinator' ? 'bg-blue-500/20 text-blue-300' :
                          'bg-white/10 text-white'
                        }`}>
                          {m.role.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          className="bg-white/5 border border-white/20 text-white text-xs rounded p-1"
                          value={m.role}
                          onChange={(e) => handleRoleChange(m.id, e.target.value)}
                          disabled={busy === m.id}
                        >
                          <option value="member">Member</option>
                          <option value="coordinator">Coordinator</option>
                          <option value="core_team">Core Team</option>
                        </select>
                        {busy === m.id && <Loader2 className="inline ml-2 h-4 w-4 animate-spin text-white/50" />}
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
