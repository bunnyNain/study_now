import { useState } from "react";
import TopBar from "@/components/layout/top-bar";
import Sidebar from "@/components/layout/sidebar";
import StudentsTable from "@/components/students/students-table";
import AddStudentModal from "@/components/students/add-student-modal";

export default function StudentsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleAddStudent = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="lg:ml-64">
        <TopBar onToggleSidebar={toggleSidebar} onAddStudent={handleAddStudent} />
        
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Students</h1>
            <p className="text-gray-600 mt-1">Manage student records and information</p>
          </div>

          <StudentsTable onAddStudent={handleAddStudent} />
        </main>
      </div>

      <AddStudentModal 
        isOpen={isAddModalOpen} 
        onClose={handleCloseModal} 
      />
    </div>
  );
}