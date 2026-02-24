import { cn } from "@/lib/cn";

interface StatusBadgeProps {
  status: "SUCCESS" | "FAILED" | "PENDING";
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        status === "SUCCESS" && "bg-green-50 text-green-700",
        status === "FAILED" && "bg-red-50 text-red-700",
        status === "PENDING" && "bg-yellow-50 text-yellow-700",
        className
      )}
    >
      {status === "SUCCESS" ? "Published" : status === "FAILED" ? "Failed" : "Pending"}
    </span>
  );
}
