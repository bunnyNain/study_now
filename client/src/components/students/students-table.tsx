import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, Plus, ArrowUpDown, Users } from "lucide-react";
import { Student } from "@shared/schema";
import { authUtils } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface StudentsTableProps {
  onAddStudent: () => void;
}

export default function StudentsTable({ onAddStudent }: StudentsTableProps) {
  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pageSize, setPageSize] = useState("10");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: students = [], isLoading } = useQuery<Student[]>({
    queryKey: ['/api/students'],
    queryFn: async () => {
      const response = await fetch('/api/students', {
        headers: authUtils.getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch students');
      return response.json();
    },
  });

  const deleteStudentMutation = useMutation({
    mutationFn: async (studentId: number) => {
      await apiRequest('DELETE', `/api/students/${studentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: "Success",
        description: "Student deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete student",
        variant: "destructive",
      });
    },
  });

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      active: "bg-success-100 text-success-800",
      pending: "bg-warning-100 text-warning-800",
      graduated: "bg-primary-100 text-primary-800",
      suspended: "bg-error-100 text-error-800",
      transferred: "bg-gray-100 text-gray-800",
    };

    return (
      <Badge className={`${statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800'} font-medium`}>
        {status}
      </Badge>
    );
  };

  const formatDate = (date: string | Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      year: 'numeric'
    }).format(new Date(date));
  };

  const filteredStudents = students.filter(student => {
    const courseMatch = courseFilter === "all" || student.course === courseFilter;
    const statusMatch = statusFilter === "all" || student.status === statusFilter;
    return courseMatch && statusMatch;
  });

  // Get unique courses for filter
  const uniqueCourses = Array.from(new Set(students.map(s => s.course)));

  if (isLoading) {
    return (
      <Card className="shadow-sm border border-gray-200">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-6 bg-gray-200 rounded w-48"></div>
              <div className="h-10 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Study Now</h2>
            <p className="text-sm text-gray-500 mt-1">Manage and view all student information</p>
          </div>
          <Button
            onClick={onAddStudent}
            className="bg-primary-600 text-white hover:bg-primary-700 focus:ring-4 focus:ring-primary-200 transition-colors flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Add Student</span>
          </Button>
        </div>
      </div>

      {/* Table Controls */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Courses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {uniqueCourses.map(course => (
                  <SelectItem key={course} value={course}>{course}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="graduated">Graduated</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="transferred">Transferred</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Show:</span>
            <Select value={pageSize} onValueChange={setPageSize}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-600">entries</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {filteredStudents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Users size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
            <p className="text-gray-500 mb-4">
              {students.length === 0 
                ? "Get started by adding your first student"
                : "Try adjusting your filters or search criteria"
              }
            </p>
            <Button onClick={onAddStudent} className="bg-primary-600 hover:bg-primary-700">
              <Plus size={16} className="mr-2" />
              Add Student
            </Button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-medium text-gray-900 text-sm">
                  <div className="flex items-center space-x-2">
                    <span>Student</span>
                    <ArrowUpDown size={14} className="text-gray-400" />
                  </div>
                </th>
                <th className="text-left py-4 px-6 font-medium text-gray-900 text-sm">
                  <div className="flex items-center space-x-2">
                    <span>Course</span>
                    <ArrowUpDown size={14} className="text-gray-400" />
                  </div>
                </th>
                <th className="text-left py-4 px-6 font-medium text-gray-900 text-sm">
                  <div className="flex items-center space-x-2">
                    <span>Status</span>
                    <ArrowUpDown size={14} className="text-gray-400" />
                  </div>
                </th>
                <th className="text-left py-4 px-6 font-medium text-gray-900 text-sm">
                  <div className="flex items-center space-x-2">
                    <span>Enrolled</span>
                    <ArrowUpDown size={14} className="text-gray-400" />
                  </div>
                </th>
                <th className="text-right py-4 px-6 font-medium text-gray-900 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudents.slice(0, parseInt(pageSize)).map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {getInitials(student.firstName, student.lastName)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-900">{student.course}</span>
                  </td>
                  <td className="py-4 px-6">
                    {getStatusBadge(student.status)}
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-900">
                      {formatDate(student.enrollmentDate)}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-primary-600 p-1"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-error-600 p-1"
                        onClick={() => deleteStudentMutation.mutate(student.id)}
                        disabled={deleteStudentMutation.isPending}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {filteredStudents.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing <span className="font-medium">1</span> to{" "}
              <span className="font-medium">{Math.min(parseInt(pageSize), filteredStudents.length)}</span> of{" "}
              <span className="font-medium">{filteredStudents.length}</span> results
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="default" size="sm" className="bg-primary-600 text-white">
                1
              </Button>
              <Button variant="outline" size="sm" disabled={filteredStudents.length <= parseInt(pageSize)}>
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
