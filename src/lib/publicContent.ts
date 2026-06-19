import {
  Shield,
  Sparkles,
  Database,
  BellRing,
  LayoutDashboard,
  FileCheck2,
  Upload,
  ScanSearch,
  BadgeCheck,
  type LucideIcon,
} from "lucide-react";

export type PublicFeature = {
  icon: LucideIcon;
  title: string;
  desc: string;
  href?: string;
};

export const publicFeatures: PublicFeature[] = [
  { icon: Shield, title: "Trusted Verification", desc: "Validate every upload with a clear chain of proof and audit-ready history.", href: "/features" },
  { icon: Sparkles, title: "Professional Experience", desc: "A polished interface built for legal, finance, and operations teams.", href: "/about" },
  { icon: Database, title: "Secure Records", desc: "Keep verification data organized, accessible, and easy to review.", href: "/features" },
  { icon: BellRing, title: "Live Activity", desc: "Track document actions, status changes, and review events in one place.", href: "/features" },
  { icon: LayoutDashboard, title: "Dashboard", desc: "Review verification analytics, activity, and quick actions from one focused workspace.", href: "/dashboard" },
  { icon: FileCheck2, title: "Audit Confidence", desc: "Present verification results with clear status, timestamps, and ownership context.", href: "/audit-confidence" },
];

export const publicSteps = [
  { icon: Upload, title: "Upload Securely", desc: "Add contracts, certificates, or compliance files in seconds." },
  { icon: ScanSearch, title: "Run Verification", desc: "Review file integrity and verification status from a single workflow." },
  { icon: Database, title: "Store The Record", desc: "Keep the proof trail ready for internal teams and external reviewers." },
  { icon: BadgeCheck, title: "Share With Confidence", desc: "Present a clear trusted result whenever the document is requested." },
];

export const publicStats = [
  { label: "Verified", value: "128", delta: "+18% this month" },
  { label: "Pending review", value: "32", delta: "8 priority checks" },
  { label: "Flagged items", value: "17", delta: "Needs attention" },
  { label: "Teams onboarded", value: "24", delta: "Across legal and ops" },
];

export const publicActivity = [
  { title: "Document verified", detail: "Sales agreement", time: "2 min ago" },
  { title: "Upload completed", detail: "Lease amendment", time: "15 min ago" },
  { title: "Review requested", detail: "Vendor contract", time: "34 min ago" },
  { title: "Audit trail updated", detail: "Board resolution", time: "1 hr ago" },
];

export const dashboardMetrics = [
  { label: "Verified", value: "2,481", note: "+12.4%", tone: "text-success" },
  { label: "Pending", value: "142", note: "Steady", tone: "text-warning" },
  { label: "Tampered", value: "12", note: "-4.2%", tone: "text-danger" },
  { label: "Fraud Alerts", value: "04", note: "New: 2", tone: "text-primary" },
];

export const dashboardHighlights = [
  "Multi-device dashboard layouts for desktop, tablet, and mobile review.",
  "High-signal cards for verification status, pending actions, and fraud alerts.",
  "Operational panels built for document teams that need quick scanning and fast decisions.",
];

export const auditHighlights = [
  "Status-led evidence views with timestamps, hashes, and reviewer-friendly summaries.",
  "Clear tables and activity logs that make compliance review easier to present.",
  "Confidence-ready records for legal teams, auditors, and operational stakeholders.",
];

export const footerColumns = {
  product: [
    { label: "Home", href: "/" },
    { label: "Features", href: "/features" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Audit Confidence", href: "/audit-confidence" },
  ],
  resources: [
    { label: "How It Works", href: "/features" },
    { label: "About DocDNA", href: "/about" },
    { label: "Verification Flow", href: "/upload" },
    { label: "Activity Timeline", href: "/history" },
  ],
  company: [
    { label: "Create Account", href: "/sign-up" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Settings", href: "/settings" },
  ],
};
