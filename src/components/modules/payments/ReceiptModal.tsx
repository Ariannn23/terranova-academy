"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Printer, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ReceiptModalData = {
  id?: string;
  transactionId?: string;
  paidAt?: Date | string | null;
  amount?: number | null;
  method?: string | null;
  balance?: number | null;
  concept?: {
    name?: string | null;
  } | null;
  enrollment?: {
    student?: {
      firstName?: string | null;
      lastName?: string | null;
      dni?: string | null;
    } | null;
    section?: {
      gradeLevel?: {
        name?: string | null;
        level?: string | null;
      } | null;
    } | null;
  } | null;
};

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  receipt?: ReceiptModalData | null;
  onReturn?: () => void;
  successTitle?: string;
}

export function ReceiptModal({
  isOpen,
  onClose,
  receipt,
  onReturn,
  successTitle = "Detalle del Recibo",
}: ReceiptModalProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md print-exact border-t-8 border-t-blue-600">
        <DialogHeader className="print-hidden">
          <DialogTitle className="text-emerald-600 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6" /> {successTitle}
          </DialogTitle>
          <DialogDescription>
            Documento de pago válido para control interno.
          </DialogDescription>
        </DialogHeader>

        {receipt && (
          <div className="p-6 bg-white border border-slate-200 rounded-lg shadow-sm font-mono space-y-4 my-4 print:my-0 print:border-none print:shadow-none">
            <div className="text-center border-b border-dashed pb-4">
              <h2 className="text-xl font-bold text-slate-800 tracking-wider uppercase">
                TerraNova Academy
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Recibo Electrónico N°{" "}
                {(receipt.transactionId || receipt.id || "")
                  .slice(-6)
                  .toUpperCase()}
              </p>
              <p className="text-xs text-slate-500">
                {format(
                  new Date(receipt.paidAt || new Date()),
                  "dd/MM/yyyy HH:mm",
                  {
                    locale: es,
                  },
                )}
              </p>
            </div>

            <div className="space-y-2 text-sm pt-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Alumno:</span>
                <span className="font-bold text-right uppercase line-clamp-1">
                  {receipt.enrollment?.student?.firstName}{" "}
                  {receipt.enrollment?.student?.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">DNI:</span>
                <span className="font-medium">
                  {receipt.enrollment?.student?.dni}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Grado:</span>
                <span className="font-medium text-right uppercase">
                  {receipt.enrollment?.section?.gradeLevel?.name} -{" "}
                  {receipt.enrollment?.section?.gradeLevel?.level}
                </span>
              </div>
            </div>

            <div className="border-y border-dashed py-4 space-y-2 text-sm">
              <div className="flex justify-between py-1">
                <span className="text-slate-800 font-semibold">
                  {receipt.concept?.name}
                </span>
                <span className="font-medium">
                  S/ {receipt.amount?.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between py-1 text-slate-500">
                <span>Método de Pago</span>
                <span className="uppercase">{receipt.method}</span>
              </div>
              {typeof receipt.balance === "number" && (
                <div className="flex justify-between py-1 text-slate-500">
                  <span>Saldo pendiente</span>
                  <span>S/ {receipt.balance.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-2 text-lg">
              <span className="font-bold text-slate-800 uppercase tracking-widest">
                Total
              </span>
              <span className="font-bold text-slate-900">
                S/ {receipt.amount?.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        <DialogFooter className="print-hidden flex sm:justify-center gap-2 mt-4">
          <Button variant="outline" onClick={() => onClose(false)}>
            Cerrar
          </Button>
          <Button
            onClick={handlePrint}
            className="bg-slate-900 hover:bg-slate-800 gap-2"
          >
            <Printer className="w-4 h-4" />
            Imprimir Recibo
          </Button>
          {onReturn && (
            <Button
              variant="ghost"
              className="text-slate-500"
              onClick={() => {
                onClose(false);
                onReturn();
              }}
            >
              Volver
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
