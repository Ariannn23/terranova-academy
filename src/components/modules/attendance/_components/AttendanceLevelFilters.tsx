import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AttendanceLevelFiltersProps {
  levels: any[];
  currentLevel: any;
  grades: any[];
  currentGrade: any;
  sections: any[];
  selectedLevelIndex: number | null;
  selectedGradeIndex: number | null;
  selectedSectionId: string;
  selectedDate: string;
  setSelectedLevelIndex: (v: number) => void;
  setSelectedGradeIndex: (v: number) => void;
  setSelectedSectionId: (v: string) => void;
  setSelectedDate: (v: string) => void;
}

export function AttendanceLevelFilters({
  levels,
  currentLevel,
  grades,
  currentGrade,
  sections,
  selectedLevelIndex,
  selectedGradeIndex,
  selectedSectionId,
  selectedDate,
  setSelectedLevelIndex,
  setSelectedGradeIndex,
  setSelectedSectionId,
  setSelectedDate,
}: AttendanceLevelFiltersProps) {
  return (
    <Card>
      <CardHeader className="pb-3 border-b border-slate-100">
        <CardTitle className="text-lg font-semibold flex flex-col md:flex-row md:items-center justify-between gap-4">
          Selección de Aula
          <div className="flex items-center gap-2">
            <Label className="text-slate-500 font-medium whitespace-nowrap">
              Fecha de Clase:
            </Label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-40 font-medium"
            />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Nivel</Label>
            <Select
              value={selectedLevelIndex !== null ? selectedLevelIndex.toString() : ""}
              onValueChange={(val) => setSelectedLevelIndex(Number(val))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione Nivel" />
              </SelectTrigger>
              <SelectContent>
                {levels.map((level: any, i: number) => (
                  <SelectItem key={i} value={i.toString()}>
                    {level.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Grado</Label>
            <Select
              value={selectedGradeIndex !== null ? selectedGradeIndex.toString() : ""}
              onValueChange={(val) => setSelectedGradeIndex(Number(val))}
              disabled={!currentLevel}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione Grado" />
              </SelectTrigger>
              <SelectContent>
                {grades.map((grade: any, i: number) => (
                  <SelectItem key={grade.id} value={i.toString()}>
                    {grade.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Sección</Label>
            <Select
              value={selectedSectionId}
              onValueChange={setSelectedSectionId}
              disabled={!currentGrade || sections.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione Sección" />
              </SelectTrigger>
              <SelectContent>
                {sections.map((sec: any) => (
                  <SelectItem key={sec.id} value={sec.id}>
                    {sec.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
