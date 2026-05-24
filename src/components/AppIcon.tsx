import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import {
  AlertTriangle,
  BookOpen,
  Brain,
  Check,
  CheckCircle2,
  Circle,
  CircleX,
  Cpu,
  FlaskConical,
  Flame,
  FolderOpen,
  Gauge,
  GraduationCap,
  Info,
  KeyRound,
  Lightbulb,
  Link2,
  Palette,
  Rocket,
  School,
  Search,
  Settings,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";

const ICON_MAP: Record<string, ComponentType<LucideProps>> = {
  "ℹ️": Info,
  "💡": Lightbulb,
  "⚠️": AlertTriangle,
  "🚨": AlertTriangle,
  "🔍": Search,
  "🏫": School,
  "📘": BookOpen,
  "🎓": GraduationCap,
  "⚙️": Settings,
  "🍃": Sparkles,
  "🔐": KeyRound,
  "📖": BookOpen,
  "⚡": Zap,
  "⚛️": Cpu,
  "🚀": Rocket,
  "🔗": Link2,
  "🎨": Palette,
  "🧠": Brain,
  "🏆": Trophy,
  "✅": CheckCircle2,
  "❌": CircleX,
  "✓": Check,
  "○": Circle,
  "🔥": Flame,
  trophy: Trophy,
  success: CheckCircle2,
  error: CircleX,
  warning: AlertTriangle,
  tip: Lightbulb,
  search: Search,
  streak: Flame,
  spark: Zap,
  module: FolderOpen,
  quiz: FlaskConical,
  school: School,
  nav: Gauge,
};

const ICON_COLOR_MAP: Record<string, string> = {
  info: "var(--color-info)",
  tip: "var(--color-tip)",
  warning: "var(--color-warning)",
  error: "var(--color-danger)",
  success: "var(--color-success)",
  search: "var(--color-accent)",
  trophy: "#ca8a04",
  streak: "#ea580c",
  spark: "#2563eb",
  school: "#0369a1",
  module: "var(--color-accent)",
  quiz: "#7c3aed",
  nav: "#334155",
};

interface AppIconProps {
  token?: string;
  size?: number;
  className?: string;
}

export function AppIcon({ token, size = 16, className }: AppIconProps) {
  const Icon = (token && ICON_MAP[token]) || FolderOpen;
  const color = token ? ICON_COLOR_MAP[token] : undefined;
  return (
    <Icon
      size={size}
      className={className}
      aria-hidden="true"
      style={color ? { color } : undefined}
    />
  );
}
