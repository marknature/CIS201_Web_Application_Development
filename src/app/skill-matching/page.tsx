"use client";
import { useState } from "react";
import { useFFIMSStore } from "@/store/ffims";
import { SectionHeading, Card } from "@/components/ui";
import { matchDriversToTask, ALL_SKILLS } from "@/lib/skillMatch";
import { Cpu, CheckCircle, XCircle } from "lucide-react";
import { clsx } from "clsx";

const SKILL_COLORS: Record<string, string> = {
  "bus":        "bg-[#E6F1FB] text-[#0C447C] border-[#85B7EB]",
  "van":        "bg-[#E1F5EE] text-[#085041] border-[#5DCAA5]",
  "hgv":        "bg-[#FAEEDA] text-[#633806] border-[#EF9F27]",
  "long-route": "bg-[#E6F1FB] text-[#0C447C] border-[#85B7EB]",
  "night-duty": "bg-[#F1EFE8] text-[#444441] border-[#B4B2A9]",
  "light-duty": "bg-[#E1F5EE] text-[#085041] border-[#5DCAA5]",
  "events":     "bg-[#EEEDFE] text-[#3C3489] border-[#AFA9EC]",
  "specialist": "bg-[#FAEEDA] text-[#633806] border-[#EF9F27]",
  "garden":     "bg-[#EAF3DE] text-[#27500A] border-[#97C459]",
  "brush-cut":  "bg-[#FAECE7] text-[#712B13] border-[#F0997B]",
};

export default function SkillMatchingPage() {
  const { drivers } = useFFIMSStore();
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(skill: string) {
    setSelected((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  }

  const results = selected.length > 0 ? matchDriversToTask(selected, drivers) : [];

  function scoreColor(score: number) {
    if (score >= 0.8) return "text-[#0F6E56]";
    if (score >= 0.5) return "text-[#BA7517]";
    return "text-[#A32D2D]";
  }

  function scoreBarColor(score: number) {
    if (score >= 0.8) return "bg-[#1D9E75]";
    if (score >= 0.5) return "bg-[#EF9F27]";
    return "bg-[#E24B4A]";
  }

  return (
    <div>
      <SectionHeading
        title="Skill Matching"
        subtitle="AI-powered cosine similarity — select required skills to rank drivers"
      />

      {/* Skill selector */}
      <Card className="mb-4">
        <div className="mb-3 flex items-center gap-2">
          <Cpu className="h-4 w-4 text-[#1D9E75]" />
          <h2 className="text-sm font-medium text-gray-900">Required skills for this task / zone</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {ALL_SKILLS.map((skill) => {
            const active = selected.includes(skill);
            return (
              <button
                key={skill}
                onClick={() => toggle(skill)}
                className={clsx(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-all",
                  active
                    ? (SKILL_COLORS[skill] ?? "bg-gray-200 text-gray-800 border-gray-300") + " border"
                    : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                )}
              >
                {active ? "✓ " : ""}{skill}
              </button>
            );
          })}
        </div>
        {selected.length === 0 && (
          <p className="mt-3 text-xs text-gray-400">Select one or more skills above to rank drivers.</p>
        )}
        {selected.length > 0 && (
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-gray-500">{selected.length} skill{selected.length > 1 ? "s" : ""} selected</p>
            <button
              onClick={() => setSelected([])}
              className="text-xs text-gray-400 hover:text-gray-600 underline"
            >
              Clear all
            </button>
          </div>
        )}
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-medium text-gray-700">Match results — ranked by cosine similarity</h2>
          <div className="space-y-2">
            {results.map((r, i) => {
              const driver = drivers.find((d) => d.id === r.driverId);
              return (
                <Card key={r.driverId} className={clsx("flex flex-col gap-2", i === 0 && "border-[#5DCAA5] border-2")}>
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      {i === 0 && (
                        <span className="rounded bg-[#E1F5EE] px-1.5 py-0.5 text-[10px] font-semibold text-[#0F6E56]">
                          Best match
                        </span>
                      )}
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E1F5EE] text-xs font-medium text-[#0F6E56]">
                        {r.driverName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{r.driverName}</p>
                        {driver && (
                          <p className="text-[10px] text-gray-400">
                            Team {driver.team} · {driver.licenseClass} · {driver.seniorityYears}y seniority
                          </p>
                        )}
                      </div>
                    </div>
                    <p className={clsx("text-lg font-medium tabular-nums", scoreColor(r.score))}>
                      {Math.round(r.score * 100)}%
                    </p>
                  </div>

                  {/* Score bar */}
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={clsx("h-full rounded-full transition-all", scoreBarColor(r.score))}
                      style={{ width: `${Math.round(r.score * 100)}%` }}
                    />
                  </div>

                  {/* Matched / missing skills */}
                  <div className="flex flex-wrap gap-3 text-xs">
                    {r.matchedSkills.length > 0 && (
                      <div className="flex items-center gap-1.5 text-[#0F6E56]">
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span className="text-gray-500">Has:</span>
                        {r.matchedSkills.map((s) => (
                          <span key={s} className="rounded bg-[#E1F5EE] px-1.5 py-0.5 text-[10px] font-medium text-[#085041]">{s}</span>
                        ))}
                      </div>
                    )}
                    {r.missingSkills.length > 0 && (
                      <div className="flex items-center gap-1.5 text-[#A32D2D]">
                        <XCircle className="h-3.5 w-3.5" />
                        <span className="text-gray-500">Missing:</span>
                        {r.missingSkills.map((s) => (
                          <span key={s} className="rounded bg-[#FCEBEB] px-1.5 py-0.5 text-[10px] font-medium text-[#791F1F]">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {selected.length > 0 && results.length === 0 && (
        <p className="text-sm text-gray-400">No drivers matched. Try selecting different skills.</p>
      )}
    </div>
  );
}
