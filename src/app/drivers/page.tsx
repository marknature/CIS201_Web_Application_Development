"use client";
import { useFFIMSStore } from "@/store/ffims";
import { SectionHeading, ShiftBadge, TeamBadge, Card } from "@/components/ui";
import { Phone, Award, Clock } from "lucide-react";

const SKILL_COLORS: Record<string, string> = {
  "bus":        "bg-[#E6F1FB] text-[#0C447C]",
  "van":        "bg-[#E1F5EE] text-[#085041]",
  "hgv":        "bg-[#FAEEDA] text-[#633806]",
  "long-route": "bg-[#E6F1FB] text-[#0C447C]",
  "night-duty": "bg-[#F1EFE8] text-[#444441]",
  "light-duty": "bg-[#E1F5EE] text-[#085041]",
  "events":     "bg-[#EEEDFE] text-[#3C3489]",
  "specialist": "bg-[#FAEEDA] text-[#633806]",
  "garden":     "bg-[#EAF3DE] text-[#27500A]",
  "brush-cut":  "bg-[#FAECE7] text-[#712B13]",
};

export default function DriversPage() {
  const { drivers, roster } = useFFIMSStore();
  const todayIdx = 3;

  return (
    <div>
      <SectionHeading title="Drivers" subtitle="Skill profiles, license classes, and current availability" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {drivers.map((driver) => {
          const todayShift = roster.roster[driver.id]?.[todayIdx];
          const weeklyHrs = (roster.roster[driver.id] ?? []).reduce((acc, s) => {
            if (s.type === "duty" || s.type === "standby") return acc + 8;
            if (s.type === "ot") return acc + 4;
            return acc;
          }, 0);

          return (
            <Card key={driver.id} className="flex flex-col gap-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E1F5EE] text-sm font-medium text-[#0F6E56]">
                    {driver.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {driver.name}
                      <TeamBadge team={driver.team} />
                    </p>
                    <p className="text-xs text-gray-400">{driver.licenseClass}</p>
                  </div>
                </div>
                {todayShift && <ShiftBadge type={todayShift.type} />}
              </div>

              {/* Skill tags */}
              <div className="flex flex-wrap gap-1.5">
                {driver.skillTags.map((tag) => (
                  <span
                    key={tag}
                    className={`inline-block rounded px-2 py-0.5 text-[10px] font-medium ${SKILL_COLORS[tag] ?? "bg-gray-100 text-gray-600"}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 border-t border-gray-100 pt-3">
                <div className="text-center">
                  <p className="text-[10px] text-gray-400">Week hrs</p>
                  <p className={`text-sm font-medium ${weeklyHrs >= 45 ? "text-[#A32D2D]" : weeklyHrs >= 42 ? "text-[#BA7517]" : "text-gray-800"}`}>
                    {weeklyHrs}h
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-gray-400">Seniority</p>
                  <p className="text-sm font-medium text-gray-800">{driver.seniorityYears}y</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-gray-400">Recent OT</p>
                  <p className="text-sm font-medium text-gray-800">{driver.recentOtHours}h</p>
                </div>
              </div>

              {/* Contact */}
              <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                <Phone className="h-3 w-3" />
                {driver.phone}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
