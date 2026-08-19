import {
  ClipboardCheck,
  Download,
  Layers,
  MapPin,
  ScrollText,
  Shield,
  User,
  UserCog,
  Wallet,
} from "lucide-react";
import type { PatternNavSection } from "@/lib/patterns/types";

export const settingsNavSections: PatternNavSection[] = [
  {
    title: "Personal",
    items: [
      { id: "profile", label: "Profile", icon: User },
      { id: "preferences", label: "Preferences", icon: Layers },
    ],
  },
  {
    title: "Staff",
    items: [
      { id: "trainers", label: "Trainers", icon: UserCog },
      { id: "admins", label: "Admins", icon: Shield },
    ],
  },
  {
    title: "Database",
    items: [
      { id: "prerequisites", label: "Prerequisites", icon: ClipboardCheck },
      { id: "locations", label: "Location", icon: MapPin },
    ],
  },
];

export const settingsTechnicalNavSection: PatternNavSection = {
  title: "Technical",
  items: [
    { id: "logs", label: "Logs", icon: ScrollText },
    { id: "payouts", label: "Payouts", icon: Wallet },
    { id: "download-invoices", label: "Download invoices", icon: Download },
  ],
};
