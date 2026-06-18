import React from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function AdminEvents() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Events & Sessions</h1>
          <p className="text-sm text-white/50">Schedule club events and track attendance.</p>
        </div>
        <Card className="glass-panel border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-lg text-white">Coming Soon</CardTitle>
          </CardHeader>
          <CardContent className="text-white/70">
            Event creation and attendance tracking will be implemented in the next phase.
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

export function AdminBroadcasts() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Broadcast Center</h1>
          <p className="text-sm text-white/50">Send announcements to all members or specific domains.</p>
        </div>
        <Card className="glass-panel border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-lg text-white">Coming Soon</CardTitle>
          </CardHeader>
          <CardContent className="text-white/70">
            Push notifications and email broadcasts will be implemented in the next phase.
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
