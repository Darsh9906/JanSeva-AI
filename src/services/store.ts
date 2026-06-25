import { useState, useEffect } from "react";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import { 
  User, Issue, Comment, Verification, DeviceViewMode, ActiveScreen, 
  UserRole, MunicipalDepartment, IssueStatus, IssueCategory, SeverityLevel 
} from "../types";

const STORAGE_KEY = "civicpulse_store_v2";

interface StoreState {
  currentUser: User | null;
  viewMode: DeviceViewMode;
  activeScreen: ActiveScreen;
  selectedIssueId: string | null;
  issues: Issue[];
  users: User[];
  comments: Comment[];
  verifications: Verification[];
  searchQuery: string;
  filterCategory: string;
  filterStatus: string;
  isInitialized: boolean;
}

class StoreManager {
  private state: StoreState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = this.loadFromStorage() || {
      currentUser: null,
      viewMode: "mobile-native",
      activeScreen: "landing",
      selectedIssueId: null,
      issues: [],
      users: [],
      comments: [],
      verifications: [],
      searchQuery: "",
      filterCategory: "All",
      filterStatus: "All",
      isInitialized: false
    };
  }

  private loadFromStorage(): StoreState | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Keep UI state but not user data (that comes from Firebase)
        return {
          ...parsed,
          currentUser: null,
          issues: [],
          users: [],
          comments: [],
          verifications: []
        };
      }
    } catch (e) {
      console.warn("Storage load error:", e);
    }
    return null;
  }

  private saveToStorage() {
    try {
      // Only persist non-sensitive UI state
      const uiState = {
        viewMode: this.state.viewMode,
        activeScreen: this.state.activeScreen,
        searchQuery: this.state.searchQuery,
        filterCategory: this.state.filterCategory,
        filterStatus: this.state.filterStatus
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(uiState));
    } catch (e) {
      console.warn("Storage save error:", e);
    }
  }

  private notify() {
    this.saveToStorage();
    this.listeners.forEach(l => l());
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public getState() {
    return this.state;
  }

  public setState(partial: Partial<StoreState>) {
    this.state = { ...this.state, ...partial };
    this.notify();
  }

  // --- Actions ---

  public setViewMode = (viewMode: DeviceViewMode) => {
    this.state = { ...this.state, viewMode };
    this.notify();
  };

  public setActiveScreen = (activeScreen: ActiveScreen, selectedIssueId?: string) => {
    this.state = { 
      ...this.state, 
      activeScreen, 
      selectedIssueId: selectedIssueId !== undefined ? selectedIssueId : this.state.selectedIssueId 
    };
    this.notify();
  };

  public setCurrentUser = (currentUser: User | null) => {
    this.state = { ...this.state, currentUser };
    this.notify();
  };

  public switchRole = (role: UserRole, department?: MunicipalDepartment) => {
    if (role === "anonymous") {
      this.state = { ...this.state, currentUser: null };
    } else {
      // This is for demo mode - in production roles come from Firebase
      console.warn('Role switching should be done through Firebase Auth. This is demo mode.');
    }
    this.notify();
  };

  public setSearchQuery = (searchQuery: string) => {
    this.state = { ...this.state, searchQuery };
    this.notify();
  };

  public setFilterCategory = (filterCategory: string) => {
    this.state = { ...this.state, filterCategory };
    this.notify();
  };

  public setFilterStatus = (filterStatus: string) => {
    this.state = { ...this.state, filterStatus };
    this.notify();
  };

  public checkDuplicates(category: string, lat: number, lng: number): Issue[] {
    return this.state.issues.filter(iss => {
      if (iss.category !== category && category !== "All") return false;
      if (iss.status === "Resolved") return false;
      const dist = Math.sqrt(Math.pow(iss.latitude - lat, 2) + Math.pow(iss.longitude - lng, 2));
      return dist < 0.005; // Roughly 500 meters
    });
  }

  public addIssue = async (reportData: {
    title: string;
    description: string;
    category: IssueCategory;
    severity: SeverityLevel;
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
  }): Promise<Issue> => {
    const user = this.state.currentUser || {
      id: "anon_guest",
      name: "Anonymous Citizen",
      email: "anon@civic.org",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
      heroPoints: 0,
      role: "anonymous",
      reportsCount: 0,
      resolvedCount: 0,
      badges: [],
      createdAt: new Date().toISOString()
    };

    const newIssue: Issue = {
      ...reportData,
      id: `iss_${Date.now()}`,
      status: "Reported",
      verificationStatus: "Needs Review",
      confirmCount: 1,
      upvoteCount: 1,
      rejectCount: 0,
      commentCount: 0,
      createdBy: user.id,
      createdByName: user.name,
      timeline: [
        {
          status: "Reported",
          at: new Date().toISOString(),
          note: `Reported via JanSeva.AI mobile wizard with AI confidence ${(reportData.confidence * 100).toFixed(0)}%.`,
          by: user.name
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Update user stats
    if (this.state.currentUser) {
      const updatedUser = {
        ...this.state.currentUser,
        heroPoints: this.state.currentUser.heroPoints + 20,
        reportsCount: this.state.currentUser.reportsCount + 1
      };
      this.state.currentUser = updatedUser;
      this.state.users = this.state.users.map(u => u.id === updatedUser.id ? updatedUser : u);
    }

    if (db) {
      setDoc(doc(db, "issues", newIssue.id), newIssue).catch(console.error);
      if (this.state.currentUser) {
        updateDoc(doc(db, "users", this.state.currentUser.id), {
          heroPoints: this.state.currentUser.heroPoints,
          reportsCount: this.state.currentUser.reportsCount
        }).catch(console.error);
      }
    }

    this.state.issues = [newIssue, ...this.state.issues];
    this.notify();
    return newIssue;
  };

  public voteIssue = (issueId: string, voteType: "confirm" | "upvote" | "reject") => {
    if (!this.state.currentUser) return { error: "Authentication required to verify issues" };
    
    const existingVote = this.state.verifications.find(v => v.issueId === issueId && v.userId === this.state.currentUser!.id);
    if (existingVote) return { error: "You have already cast your verification vote on this issue." };

    const newVote: Verification = {
      id: `ver_${Date.now()}`,
      issueId,
      userId: this.state.currentUser.id,
      userName: this.state.currentUser.name,
      voteType,
      createdAt: new Date().toISOString()
    };

    this.state.verifications = [...this.state.verifications, newVote];

    if (db) {
      setDoc(doc(db, "verifications", newVote.id || `ver_${Date.now()}`), newVote).catch(console.error);
    }

    // Update issue count
    this.state.issues = this.state.issues.map(iss => {
      if (iss.id !== issueId) return iss;
      let confirmCount = iss.confirmCount + (voteType === "confirm" ? 1 : 0);
      let upvoteCount = iss.upvoteCount + (voteType === "upvote" ? 1 : 0);
      let rejectCount = iss.rejectCount + (voteType === "reject" ? 1 : 0);
      
      let verificationStatus = iss.verificationStatus;
      if (confirmCount >= 5) verificationStatus = "Verified";
      else if (confirmCount >= 2 || upvoteCount >= 4) verificationStatus = "Likely Verified";

      return {
        ...iss,
        confirmCount,
        upvoteCount,
        rejectCount,
        verificationStatus
      };
    });

    if (db) {
      const iss = this.state.issues.find(i => i.id === issueId);
      if (iss) updateDoc(doc(db, "issues", issueId), {
        confirmCount: iss.confirmCount,
        upvoteCount: iss.upvoteCount,
        rejectCount: iss.rejectCount,
        verificationStatus: iss.verificationStatus
      }).catch(console.error);
    }

    // Award hero points
    const updatedUser = {
      ...this.state.currentUser,
      heroPoints: this.state.currentUser.heroPoints + 5
    };
    this.state.currentUser = updatedUser;
    this.state.users = this.state.users.map(u => u.id === updatedUser.id ? updatedUser : u);

    this.notify();
    return { success: true };
  };

  public addComment = (issueId: string, message: string) => {
    if (!this.state.currentUser) return { error: "Must sign in to comment" };
    if (!message.trim()) return { error: "Comment cannot be empty" };

    const newComment: Comment = {
      id: `com_${Date.now()}`,
      issueId,
      userId: this.state.currentUser.id,
      userName: this.state.currentUser.name,
      userAvatar: this.state.currentUser.avatar,
      message: message.trim(),
      createdAt: new Date().toISOString()
    };

    this.state.comments = [...this.state.comments, newComment];
    this.state.issues = this.state.issues.map(iss => iss.id === issueId ? { ...iss, commentCount: iss.commentCount + 1 } : iss);

    if (db) {
      setDoc(doc(db, "comments", newComment.id), newComment).catch(console.error);
      const iss = this.state.issues.find(i => i.id === issueId);
      if (iss) updateDoc(doc(db, "issues", issueId), { commentCount: iss.commentCount }).catch(console.error);
    }

    // Award points
    const updatedUser = {
      ...this.state.currentUser,
      heroPoints: this.state.currentUser.heroPoints + 3
    };
    this.state.currentUser = updatedUser;
    this.state.users = this.state.users.map(u => u.id === updatedUser.id ? updatedUser : u);

    this.notify();
    return { success: true };
  };

  public advanceStatus = (issueId: string, newStatus: IssueStatus, note: string) => {
    const user = this.state.currentUser;
    if (!user || (user.role !== "officer" && user.role !== "admin")) {
      return { error: "Only authorized municipal officials can update issue statuses." };
    }

    this.state.issues = this.state.issues.map(iss => {
      if (iss.id !== issueId) return iss;
      const newEntry = {
        status: newStatus,
        at: new Date().toISOString(),
        note: note || `Status advanced to ${newStatus}.`,
        by: user.name
      };
      return {
        ...iss,
        status: newStatus,
        assignedTo: newStatus === "Assigned" || newStatus === "In Progress" ? user.id : iss.assignedTo,
        assignedOfficerName: newStatus === "Assigned" || newStatus === "In Progress" ? user.name : iss.assignedOfficerName,
        timeline: [...iss.timeline, newEntry],
        updatedAt: new Date().toISOString()
      };
    });

    if (db) {
      const iss = this.state.issues.find(i => i.id === issueId);
      if (iss) updateDoc(doc(db, "issues", issueId), {
        status: iss.status,
        assignedTo: iss.assignedTo,
        assignedOfficerName: iss.assignedOfficerName,
        timeline: iss.timeline,
        updatedAt: iss.updatedAt
      }).catch(console.error);
    }

    this.notify();
    return { success: true };
  };

  public resolveIssue = (issueId: string, resolutionNote: string) => {
    const user = this.state.currentUser;
    if (!user || (user.role !== "officer" && user.role !== "admin")) {
      return { error: "Only authorized municipal officials can resolve issues." };
    }

    this.state.issues = this.state.issues.map(iss => {
      if (iss.id !== issueId) return iss;
      const newEntry = {
        status: "Resolved" as IssueStatus,
        at: new Date().toISOString(),
        note: resolutionNote || "Issue resolved and inspected by municipal staff.",
        by: user.name
      };
      return {
        ...iss,
        status: "Resolved" as IssueStatus,
        resolutionNote,
        resolvedBy: user.name,
        timeline: [...iss.timeline, newEntry],
        updatedAt: new Date().toISOString()
      };
    });

    if (db) {
      const iss = this.state.issues.find(i => i.id === issueId);
      if (iss) updateDoc(doc(db, "issues", issueId), {
        status: iss.status,
        resolutionNote: iss.resolutionNote,
        resolvedBy: iss.resolvedBy,
        timeline: iss.timeline,
        updatedAt: iss.updatedAt
      }).catch(console.error);
    }

    // Update officer resolved count
    const updatedUser = {
      ...user,
      heroPoints: user.heroPoints + 50,
      resolvedCount: user.resolvedCount + 1
    };
    this.state.currentUser = updatedUser;
    this.state.users = this.state.users.map(u => u.id === updatedUser.id ? updatedUser : u);

    this.notify();
    return { success: true };
  };

  public resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEY);
    this.state = {
      currentUser: null,
      viewMode: "mobile-native",
      activeScreen: "landing",
      selectedIssueId: null,
      issues: [],
      users: [],
      comments: [],
      verifications: [],
      searchQuery: "",
      filterCategory: "All",
      filterStatus: "All"
    };
    this.notify();
  };
}

export const store = new StoreManager();

export function useStore() {
  const [state, setState] = useState(store.getState());
  useEffect(() => store.subscribe(() => setState(store.getState())), []);
  return { ...state, actions: store };
}
