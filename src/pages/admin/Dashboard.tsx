import { Users, FileText, Eye, TrendingUp } from "lucide-react";

const stats = [
  { icon: Users, label: "Total Users", value: "1,234", change: "+12%", color: "bg-primary/10 text-primary" },
  { icon: FileText, label: "Active Pages", value: "5", change: "+2", color: "bg-success/10 text-success" },
  { icon: Eye, label: "Page Views", value: "45.2K", change: "+18%", color: "bg-info/10 text-info" },
  { icon: TrendingUp, label: "Engagement", value: "89%", change: "+5%", color: "bg-accent text-accent-foreground" },
];

const recentActivity = [
  { user: "John Doe", action: "Updated Privacy Policy", time: "2 hours ago" },
  { user: "Jane Smith", action: "Added new user", time: "4 hours ago" },
  { user: "Admin", action: "Modified Terms & Conditions", time: "1 day ago" },
  { user: "Admin", action: "Updated About page", time: "2 days ago" },
];

const Dashboard = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="admin-card p-6 hover:shadow-md transition-shadow"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                <p className="text-sm text-success mt-2">{stat.change}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="admin-card">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
        </div>
        <div className="divide-y divide-border">
          {recentActivity.map((activity, index) => (
            <div
              key={index}
              className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {activity.user.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{activity.user}</p>
                  <p className="text-sm text-muted-foreground">{activity.action}</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="admin-card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 rounded-xl bg-primary/5 hover:bg-primary/10 border border-primary/20 text-primary font-medium transition-all text-sm">
            Add New User
          </button>
          <button className="p-4 rounded-xl bg-success/5 hover:bg-success/10 border border-success/20 text-success font-medium transition-all text-sm">
            Update Content
          </button>
          <button className="p-4 rounded-xl bg-info/5 hover:bg-info/10 border border-info/20 text-info font-medium transition-all text-sm">
            View Reports
          </button>
          <button className="p-4 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground font-medium transition-all text-sm">
            Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
