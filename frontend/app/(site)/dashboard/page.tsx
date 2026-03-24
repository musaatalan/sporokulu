import type { Metadata } from "next";
import { LayoutDashboard } from "lucide-react";

import { DashboardAnnouncementBoard } from "@/components/dashboard/dashboard-announcement-board";
import { DashboardAthleteOfWeek } from "@/components/dashboard/dashboard-athlete-of-week";
import { DashboardFinanceSummary } from "@/components/dashboard/dashboard-finance-summary";
import { PanelPageHeader } from "@/components/layout/panel-page-header";
import { QuickAttendanceSection } from "@/components/sporcu/quick-attendance-section";
import { SporcuDashboardClient } from "@/components/sporcu/sporcu-dashboard-client";
import { DashboardAttendanceStats } from "@/components/sporcu/dashboard-attendance-stats";

export const metadata: Metadata = {
  title: "Yönetim paneli | Geleceğin Yıldızları",
  description: "Sporcular, yoklama ve finans özeti",
};

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <PanelPageHeader
        eyebrow="Yönetim paneli"
        title="Kulüp özeti"
        description="Duyurular, haftanın sporcusu, yoklama ve finans verileri tek ekranda. Aşağıda performans radarlarıyla sporcu kartlarınız yer alır."
        icon={LayoutDashboard}
      />

      <DashboardAnnouncementBoard />

      <div className="mb-8 grid gap-5 lg:grid-cols-3 lg:items-start">
        <DashboardAthleteOfWeek />
        <DashboardAttendanceStats />
        <DashboardFinanceSummary />
      </div>

      <QuickAttendanceSection />

      <div className="mt-4">
        <SporcuDashboardClient />
      </div>
    </div>
  );
}
