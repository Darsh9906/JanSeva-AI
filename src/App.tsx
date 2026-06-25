/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useStore } from "./services/store";
import { startFirebaseSync } from "./services/firebaseSync";
import { Header } from "./components/Header";
import { MobileFrame } from "./components/MobileFrame";
import { FloatingAssistant } from "./components/FloatingAssistant";
import { AuthModal } from "./components/AuthModal";
import { StaffUnlockModal } from "./components/StaffUnlockModal";

import { LandingScreen } from "./screens/LandingScreen";
import { FeedScreen } from "./screens/FeedScreen";
import { ReportWizardScreen } from "./screens/ReportWizardScreen";
import { DetailScreen } from "./screens/DetailScreen";
import { MapScreen } from "./screens/MapScreen";
import { DashboardScreen } from "./screens/DashboardScreen";
import { LeaderboardScreen } from "./screens/LeaderboardScreen";
import { OperationsScreen } from "./screens/OperationsScreen";

export default function App() {
  const { activeScreen } = useStore();
  const [authOpen, setAuthOpen] = useState(false);
  const [staffOpen, setStaffOpen] = useState(false);

  useEffect(() => {
    startFirebaseSync();
  }, []);

  const renderActiveScreen = () => {
    switch (activeScreen) {
      case "landing":
        return <LandingScreen />;
      case "feed":
        return <FeedScreen />;
      case "report":
        return <ReportWizardScreen />;
      case "detail":
        return <DetailScreen />;
      case "map":
        return <MapScreen />;
      case "dashboard":
        return <DashboardScreen />;
      case "leaderboard":
        return <LeaderboardScreen />;
      case "operations":
        return <OperationsScreen />;
      default:
        return <LandingScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0f12] text-[#f1f5f9] flex flex-col font-sans antialiased selection:bg-[#FF5A00] selection:text-[#0c0d10]">
      <Header 
        onOpenAuth={() => setAuthOpen(true)} 
        onOpenStaffUnlock={() => setStaffOpen(true)} 
      />

      <main className="flex-1 overflow-hidden flex justify-center">
        <MobileFrame>
          {renderActiveScreen()}
          <FloatingAssistant />
        </MobileFrame>
      </main>

      <AuthModal 
        isOpen={authOpen} 
        onClose={() => setAuthOpen(false)} 
      />
      <StaffUnlockModal 
        isOpen={staffOpen} 
        onClose={() => setStaffOpen(false)} 
      />
    </div>
  );
}

