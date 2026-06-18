import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { QuizProvider } from "@/lib/quiz-context";
import { AdminAuthProvider } from "@/lib/admin-auth";
import { Layout } from "@/components/layout";
import Landing from "@/pages/landing";
import Quiz from "@/pages/quiz";
import Result from "@/pages/result";
import AdminClubInfo from "@/pages/admin-club-info";
import ApplyPage from "@/pages/apply";
import PaymentPage from "@/pages/payment";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminRecruitment from "@/pages/admin-recruitment";
import AdminMembers from "@/pages/admin-members";
import { AdminEvents, AdminBroadcasts } from "@/pages/admin-placeholders";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/quiz" component={Quiz} />
        <Route path="/result" component={Result} />
        <Route path="/apply" component={ApplyPage} />
        <Route path="/payment" component={PaymentPage} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/recruitment" component={AdminRecruitment} />
        <Route path="/admin/members" component={AdminMembers} />
        <Route path="/admin/events" component={AdminEvents} />
        <Route path="/admin/broadcasts" component={AdminBroadcasts} />
        <Route path="/admin/club-info" component={AdminClubInfo} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AdminAuthProvider>
          <QuizProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
          </QuizProvider>
        </AdminAuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
