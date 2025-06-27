import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";
import StatsCards from "@/components/students/stats-cards";
import StudentsTable from "@/components/students/students-table";
import AddStudentModal from "@/components/students/add-student-modal";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:ml-64">
        <TopBar 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onAddStudent={() => setIsAddModalOpen(true)}
        />
        
        <main className="p-6">
          <StatsCards />
          <StudentsTable onAddStudent={() => setIsAddModalOpen(true)} />
        </main>
      </div>

      <AddStudentModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
