import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SearchStudentResult } from "@/lib/actions/payment.actions";

interface PaymentSearchInputProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  isSearching: boolean;
  searchResults: SearchStudentResult[];
  onSelectStudent: (student: SearchStudentResult) => void;
  selectedStudent: SearchStudentResult | null;
}

export function PaymentSearchInput({
  searchTerm,
  setSearchTerm,
  isSearching,
  searchResults,
  onSelectStudent,
  selectedStudent,
}: PaymentSearchInputProps) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
        <Input
          placeholder="DNI, Código o Nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />

        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
            {searchResults.map((student) => (
              <div
                key={student.id}
                className="p-3 hover:bg-slate-50 cursor-pointer border-b last:border-0"
                onClick={() => onSelectStudent(student)}
              >
                <div className="font-medium text-sm text-slate-800">
                  {student.firstName} {student.lastName}
                </div>
                <div className="text-xs text-slate-500 flex gap-2">
                  <span className="font-mono">{student.dni}</span>
                  {student.code && <span>• {student.code}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
        {isSearching && (
          <div className="text-xs text-slate-500 mt-2 text-center">
            Buscando...
          </div>
        )}
      </div>

      {selectedStudent && (
        <div className="p-4 bg-slate-50 border rounded-lg flex gap-3 items-center">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">
            {selectedStudent.firstName[0]}
            {selectedStudent.lastName[0]}
          </div>
          <div>
            <h4 className="font-semibold text-sm text-slate-900 line-clamp-1">
              {selectedStudent.firstName} {selectedStudent.lastName}
            </h4>
            <p className="text-xs text-slate-500">
              DNI: {selectedStudent.dni}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
