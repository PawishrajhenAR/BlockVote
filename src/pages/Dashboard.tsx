
import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Header } from "@/components/layout/Header";
import AdminDashboard from "@/components/admin/AdminDashboard";
import VoterDashboard from "@/components/voter/VoterDashboard";

const Dashboard = () => {
  const { user, isAdmin, isVoter } = useAuth();

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        {isAdmin && <AdminDashboard />}
        {isVoter && <VoterDashboard />}
      </main>
    </div>
  );
};

export default Dashboard;
