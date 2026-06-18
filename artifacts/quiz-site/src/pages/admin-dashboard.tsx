import React from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function AdminDashboard() {
  const stats = [
    { label: "Android", value: 34, color: "bg-green-500" },
    { label: "Web", value: 42, color: "bg-blue-500" },
    { label: "ML", value: 28, color: "bg-purple-500" },
    { label: "IoT", value: 15, color: "bg-orange-500" },
    { label: "AR/VR", value: 12, color: "bg-pink-500" },
  ];
  const total = stats.reduce((acc, curr) => acc + curr.value, 0);

  const upcomingEvents = [
    { title: "Android Dev Summit", attendees: 45, date: "Oct 24" },
    { title: "Hackathon 2025", attendees: 112, date: "Nov 12" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-white/50">Welcome to the Club Innogeeks core management panel.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="glass-panel border-white/10 bg-white/5 md:col-span-1 flex flex-col items-center justify-center p-6">
            <div className="text-5xl font-bold text-purple-400">{total}</div>
            <div className="text-sm text-white/50 mt-2">Total Active Members</div>
          </Card>

          <Card className="glass-panel border-white/10 bg-white/5 md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-white/70 tracking-wider">DOMAIN BREAKDOWN</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.map((s, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-16 text-xs font-semibold text-white">{s.label}</div>
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full ${s.color} rounded-full`} style={{ width: `${(s.value / total) * 100}%` }} />
                  </div>
                  <div className="w-8 text-right text-xs text-white/50">{s.value}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="glass-panel border-white/10 bg-white/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-white/70 tracking-wider">UPCOMING EVENTS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingEvents.map((ev, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-lg border border-white/5 bg-white/5">
                  <div>
                    <div className="text-sm font-semibold text-white">{ev.title}</div>
                    <div className="text-xs text-white/40">{ev.date}</div>
                  </div>
                  <div className="text-xs text-white/60 bg-white/5 px-2 py-1 rounded-md">
                    {ev.attendees} RSVPs
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="glass-panel border-white/10 bg-white/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-white/70 tracking-wider">ALERTS & TASKS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-yellow-200 bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">
                14 cash payments pending verification
              </div>
              <div className="text-sm text-blue-200 bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
                Recruitment window is currently OPEN
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
