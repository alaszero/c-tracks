import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface KPICardProps {
  label: string;
  value: string;
  sublabel: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

export function KPICard({ label, value, sublabel, icon: Icon, color, bgColor }: KPICardProps) {
  return (
    <Card className="hover:border-neutral-600 transition-colors">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold text-foreground mt-1 font-mono">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{sublabel}</p>
          </div>
          <div className={`p-2.5 rounded-lg ${bgColor}`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
