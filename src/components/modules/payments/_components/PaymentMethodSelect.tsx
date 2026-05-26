import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Banknote,
  Smartphone,
  Landmark,
  CreditCard as CreditCardIcon,
  Image as ImageIcon,
  Upload,
} from "lucide-react";
import Image from "next/image";

interface PaymentMethodSelectProps {
  control: any;
  methodValue: string;
  previewImage: string | null;
  setPreviewImage: (url: string | null) => void;
  setValue: (field: any, value: any) => void;
}

export function PaymentMethodSelect({
  control,
  methodValue,
  previewImage,
  setPreviewImage,
  setValue,
}: PaymentMethodSelectProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="method"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Método de Pago</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona un método" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Efectivo">
                  <div className="flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    Efectivo
                  </div>
                </SelectItem>
                <SelectItem value="Yape">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-purple-600" />
                    Yape
                  </div>
                </SelectItem>
                <SelectItem value="Plin">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-blue-500" />
                    Plin
                  </div>
                </SelectItem>
                <SelectItem value="Transferencia">
                  <div className="flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-slate-600" />
                    Transferencia
                  </div>
                </SelectItem>
                <SelectItem value="Tarjeta">
                  <div className="flex items-center gap-2">
                    <CreditCardIcon className="w-4 h-4 text-slate-800" />
                    POS / Tarjeta
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {["Yape", "Plin", "Transferencia"].includes(methodValue) && (
        <div className="space-y-3 p-4 border border-blue-100 bg-blue-50/50 rounded-lg">
          <label className="text-sm font-medium leading-none text-blue-900 flex items-center gap-2">
            <ImageIcon className="w-4 h-4" /> Adjuntar Captura de Pago (Opcional)
          </label>

          <div className="flex items-center justify-center w-full">
            {!previewImage ? (
              <label
                htmlFor="dropzone-file"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-6 h-6 mb-2 text-slate-500" />
                  <p className="mb-1 text-sm text-slate-500">
                    <span className="font-semibold">Haz clic para subir</span> o arrastra
                  </p>
                  <p className="text-xs text-slate-400">PNG, JPG (Max. 5MB)</p>
                </div>
                <input
                  id="dropzone-file"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const objectUrl = URL.createObjectURL(file);
                      setPreviewImage(objectUrl);
                      setValue("referenceImage", file);
                    }
                  }}
                />
              </label>
            ) : (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-slate-200">
                <Image
                  src={previewImage}
                  alt="Voucher preview"
                  fill
                  unoptimized
                  className="object-cover w-full h-full"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPreviewImage(null);
                    setValue("referenceImage", undefined);
                  }}
                  className="absolute top-2 right-2 bg-slate-900/60 text-white rounded-full p-1.5 hover:bg-slate-900/90 text-xs backdrop-blur-md"
                >
                  Cambiar imagen
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
