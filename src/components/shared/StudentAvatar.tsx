import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface StudentAvatarProps {
  name: string;
  imageUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function StudentAvatar({
  name,
  imageUrl,
  size = "md",
  className = "",
}: StudentAvatarProps) {
  // Extraer las iniciales de "Juan Perez" -> "JP"
  const getInitials = (n: string) => {
    const parts = n.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(name);

  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-base",
    xl: "h-24 w-24 text-2xl",
  };

  return (
    <Avatar
      className={`${sizeClasses[size]} border-2 border-white shadow-sm ring-1 ring-slate-100 ${className}`}
    >
      {imageUrl && (
        <AvatarImage src={imageUrl} alt={name} className="object-cover" />
      )}
      <AvatarFallback className="bg-emerald-50 text-emerald-700 font-semibold delay-100">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
