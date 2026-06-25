export type UserRole = "anonymous" | "citizen" | "officer" | "admin";

export type IssueCategory = 
  | "Pothole"
  | "Water Leakage"
  | "Streetlight"
  | "Waste Management"
  | "Road Damage"
  | "Drainage"
  | "Public Safety"
  | "Other";

export type IssueStatus = 
  | "Reported"
  | "Verified"
  | "Assigned"
  | "In Progress"
  | "Resolved";

export type SeverityLevel = "Low" | "Medium" | "High" | "Critical";

export type VerificationState = "Verified" | "Likely Verified" | "Needs Review";

export type MunicipalDepartment = 
  | "Public Works - Roads"
  | "Water & Sanitation"
  | "Electrical Dept"
  | "Waste Management"
  | "Public Safety"
  | "Parks & Rec";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  heroPoints: number;
  role: UserRole;
  department?: MunicipalDepartment;
  reportsCount: number;
  resolvedCount: number;
  badges: string[];
  createdAt: string;
}

export interface TimelineEntry {
  status: IssueStatus;
  at: string;
  note: string;
  by: string;
}

export interface Verification {
  id: string;
  issueId: string;
  userId: string;
  userName: string;
  voteType: "confirm" | "upvote" | "reject";
  createdAt: string;
}

export interface Comment {
  id: string;
  issueId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  message: string;
  createdAt: string;
}

export interface Reward {
  id: string;
  userId: string;
  badge: string;
  points: number;
  reason: string;
  createdAt: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  severity: SeverityLevel;
  status: IssueStatus;
  department: MunicipalDepartment;
  confidence: number;
  riskScore: number;
  estimatedCost: number;
  estimatedFixTime: string;
  latitude: number;
  longitude: number;
  address: string;
  imageUrl: string;
  mediaType: "photo" | "video";
  verificationStatus: VerificationState;
  confirmCount: number;
  upvoteCount: number;
  rejectCount: number;
  commentCount: number;
  createdBy: string;
  createdByName: string;
  assignedTo?: string;
  assignedOfficerName?: string;
  resolutionNote?: string;
  resolvedBy?: string;
  timeline: TimelineEntry[];
  createdAt: string;
  updatedAt: string;
}

export type DeviceViewMode = "mobile-native" | "desktop-web";

export type ActiveScreen = 
  | "landing"
  | "report"
  | "feed"
  | "detail"
  | "map"
  | "dashboard"
  | "leaderboard"
  | "operations";
