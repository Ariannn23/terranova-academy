import { BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StudentAvatar } from "@/components/shared/StudentAvatar";
import { EnrollmentData } from "../types";

export function EnrollmentHeroCard({ enrollment }: { enrollment: EnrollmentData }) {
  const { student, section } = enrollment;

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <div className="h-32 bg-emerald-700 w-full" />
      <CardContent className="px-6 pb-6 pt-0 relative">
        <div className="flex flex-col md:flex-row gap-6 items-start relative z-10">
          <div className="-mt-10">
            <StudentAvatar
              name={`${student.firstName} ${student.lastName}`}
              imageUrl={student.photoUrl || undefined}
              size="xl"
              className="border-4 border-white shadow-sm ring-1 ring-slate-100 bg-white"
            />
          </div>
          <div className="flex-1 space-y-1.5 md:pt-4">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              {student.firstName} {student.lastName}
            </h2>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-600">
              {student.code && (
                <>
                  <span>
                    <strong>Cód:</strong>{" "}
                    <span className="text-emerald-700 font-medium">
                      {student.code}
                    </span>
                  </span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                </>
              )}
              <span>
                <strong>DNI:</strong> {student.dni}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="flex items-center gap-1 font-medium text-emerald-700">
                <BookOpen className="h-4 w-4" />
                {section.gradeLevel.name} &quot;{section.name}&quot;
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span>{section.gradeLevel.level}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
