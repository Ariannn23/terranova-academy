import { UseFormReturn } from "react-hook-form";
import { TeacherSchemaType } from "@/lib/validations/teacher.schema";

export interface TeacherFormStatus {
  state: "idle" | "loading" | "success" | "error";
  message?: string;
  isUpdate: boolean;
}

export interface TeacherFormHandlers {
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removePhoto: (e: React.MouseEvent) => void;
}
