import { useState } from "react";
import { Ban, Trash2, Search, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface User {
  id: number;
  name: string;
  email: string;
  status: "active" | "blocked";
}

const dummyUsers: User[] = [
  { id: 1, name: "John Doe", email: "john.doe@example.com", status: "active" },
  { id: 2, name: "Jane Smith", email: "jane.smith@example.com", status: "active" },
  { id: 3, name: "Robert Johnson", email: "robert.j@example.com", status: "blocked" },
  { id: 4, name: "Emily Davis", email: "emily.davis@example.com", status: "active" },
  { id: 5, name: "Michael Wilson", email: "m.wilson@example.com", status: "active" },
  { id: 6, name: "Sarah Brown", email: "sarah.b@example.com", status: "blocked" },
  { id: 7, name: "David Miller", email: "david.m@example.com", status: "active" },
  { id: 8, name: "Lisa Taylor", email: "lisa.t@example.com", status: "active" },
];

const Users = () => {
  const [users, setUsers] = useState<User[]>(dummyUsers);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBlock = (userId: number) => {
    setUsers(
      users.map((user) =>
        user.id === userId
          ? { ...user, status: user.status === "active" ? "blocked" : "active" }
          : user
      )
    );
  };

  const handleDelete = (userId: number) => {
    setUsers(users.filter((user) => user.id !== userId));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Users</h2>
          <p className="text-muted-foreground">Manage your application users</p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-input rounded-lg text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">
                  Name
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">
                  Email
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">
                  Status
                </th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-medium text-primary">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {user.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-muted-foreground">{user.email}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.status === "active"
                          ? "bg-success/10 text-success"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {user.status === "active" ? (
                        <UserCheck className="w-3 h-3" />
                      ) : (
                        <UserX className="w-3 h-3" />
                      )}
                      {user.status === "active" ? "Active" : "Blocked"}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleBlock(user.id)}
                        className={`hover:bg-muted ${
                          user.status === "blocked"
                            ? "text-success hover:text-success"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                        title={user.status === "active" ? "Block user" : "Unblock user"}
                      >
                        <Ban className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(user.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        title="Delete user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No users found</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="admin-card p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{users.length}</p>
          <p className="text-sm text-muted-foreground">Total Users</p>
        </div>
        <div className="admin-card p-4 text-center">
          <p className="text-2xl font-bold text-success">
            {users.filter((u) => u.status === "active").length}
          </p>
          <p className="text-sm text-muted-foreground">Active</p>
        </div>
        <div className="admin-card p-4 text-center">
          <p className="text-2xl font-bold text-destructive">
            {users.filter((u) => u.status === "blocked").length}
          </p>
          <p className="text-sm text-muted-foreground">Blocked</p>
        </div>
        <div className="admin-card p-4 text-center">
          <p className="text-2xl font-bold text-info">92%</p>
          <p className="text-sm text-muted-foreground">Active Rate</p>
        </div>
      </div>
    </div>
  );
};

export default Users;
