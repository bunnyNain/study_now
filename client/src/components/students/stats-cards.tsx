import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Book, Clock, GraduationCap, TrendingUp } from "lucide-react";
import { authUtils } from "@/lib/auth";

interface StatsData {
  totalStudents: number;
  activeCourses: number;
  pendingApplications: number;
  graduationRate: string;
}

export default function StatsCards() {
  const { data: stats, isLoading } = useQuery<StatsData>({
    queryKey: ['/api/dashboard/stats'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/stats', {
        headers: authUtils.getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
                    <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Students",
      value: stats?.totalStudents || 0,
      change: "+12% from last month",
      icon: Users,
      iconBg: "bg-primary-100",
      iconColor: "text-primary-600",
      changeColor: "text-success-600",
      changeIcon: TrendingUp,
    },
    {
      title: "Active Courses",
      value: stats?.activeCourses || 0,
      change: "+3 new courses",
      icon: Book,
      iconBg: "bg-warning-100",
      iconColor: "text-warning-600",
      changeColor: "text-success-600",
      changeIcon: TrendingUp,
    },
    {
      title: "Pending Applications",
      value: stats?.pendingApplications || 0,
      change: "Review required",
      icon: Clock,
      iconBg: "bg-error-100",
      iconColor: "text-error-600",
      changeColor: "text-warning-600",
      changeIcon: Clock,
    },
    {
      title: "Graduation Rate",
      value: stats?.graduationRate || "0%",
      change: "+2.1% this semester",
      icon: GraduationCap,
      iconBg: "bg-success-100",
      iconColor: "text-success-600",
      changeColor: "text-success-600",
      changeIcon: TrendingUp,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <Card key={index} className="shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-semibold text-gray-900">{stat.value}</p>
                <p className={`text-sm mt-1 flex items-center ${stat.changeColor}`}>
                  <stat.changeIcon size={14} className="mr-1" />
                  {stat.change}
                </p>
              </div>
              <div className={`w-12 h-12 ${stat.iconBg} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`${stat.iconColor} text-xl`} size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
