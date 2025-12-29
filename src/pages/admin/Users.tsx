import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Ban, Trash2, Search, UserCheck, UserX, Clock3, Eye, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  name: string;
  email: string;
  status: "active" | "blocked" | "pending";
}

export const dummyUsers: User[] = [
  { id: 1, name: "John Doe", email: "john.doe@example.com", status: "active" },
  { id: 2, name: "Jane Smith", email: "jane.smith@example.com", status: "active" },
  { id: 3, name: "Robert Johnson", email: "robert.j@example.com", status: "blocked" },
  { id: 4, name: "Emily Davis", email: "emily.davis@example.com", status: "active" },
  { id: 5, name: "Michael Wilson", email: "m.wilson@example.com", status: "active" },
  { id: 6, name: "Sarah Brown", email: "sarah.b@example.com", status: "blocked" },
  { id: 7, name: "David Miller", email: "david.m@example.com", status: "active" },
  { id: 8, name: "Lisa Taylor", email: "lisa.t@example.com", status: "pending" },
];

const Users = () => {
  const [users, setUsers] = useState<User[]>(dummyUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const { toast } = useToast();
  const navigate = useNavigate();

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleBlockClick = (user: User) => {
    setSelectedUser(user);
    setBlockDialogOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const confirmBlock = () => {
    if (!selectedUser) return;

    const newStatus = selectedUser.status === "blocked" ? "active" : "blocked";
    setUsers(
      users.map((user) =>
        user.id === selectedUser.id ? { ...user, status: newStatus } : user
      )
    );

    toast({
      title: newStatus === "blocked" ? "User Blocked" : "User Unblocked",
      description: `${selectedUser.name} has been ${newStatus === "blocked" ? "blocked" : "unblocked"} successfully.`,
    });

    setSelectedUser(null);
  };

  const confirmDelete = () => {
    if (!selectedUser) return;
    
    setUsers(users.filter((user) => user.id !== selectedUser.id));
    
    toast({
      title: "User Deleted",
      description: `${selectedUser.name} has been deleted successfully.`,
      variant: "destructive",
    });
    
    setSelectedUser(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Block Confirmation Dialog */}
      <ConfirmDialog
        open={blockDialogOpen}
        onOpenChange={setBlockDialogOpen}
        title={selectedUser?.status === "blocked" ? "Unblock User?" : "Block User?"}
        description={
          selectedUser?.status === "blocked"
            ? `Are you sure you want to unblock ${selectedUser?.name}? They will regain access to the application.`
            : `Are you sure you want to block ${selectedUser?.name}? They will no longer be able to access the application.`
        }
        confirmLabel={selectedUser?.status === "blocked" ? "Unblock" : "Block"}
        onConfirm={confirmBlock}
        variant={selectedUser?.status === "blocked" ? "default" : "destructive"}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete User?"
        description={`Are you sure you want to delete ${selectedUser?.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        variant="destructive"
      />

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
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
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
              {paginatedUsers.map((user) => (
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
                          : user.status === "blocked"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {user.status === "active" && <UserCheck className="w-3 h-3" />}
                      {user.status === "blocked" && <UserX className="w-3 h-3" />}
                      {user.status === "pending" && <Clock3 className="w-3 h-3" />}
                      {user.status === "active"
                        ? "Active"
                        : user.status === "blocked"
                          ? "Blocked"
                          : "Pending Approval"}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          navigate(`/admin/users/${user.id}`, { state: { user } })
                        }
                        className="text-muted-foreground hover:text-foreground hover:bg-muted"
                        title="View profile"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleBlockClick(user)}
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
                        onClick={() => handleDeleteClick(user)}
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

        {filteredUsers.length > 0 && (
          <div className="border-t border-border px-6 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-muted/30">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Items per page</span>
              <div className="relative">
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="appearance-none bg-background border border-border rounded-md px-3 py-1 pr-8 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
                >
                  {[5, 10, 20].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
              <span className="hidden sm:inline">•</span>
              <span>
                Showing {startIndex + 1}-
                {Math.min(startIndex + itemsPerPage, filteredUsers.length)} of{" "}
                {filteredUsers.length}
              </span>
            </div>

            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="sr-only">Previous page</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                  <span className="sr-only">Next page</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
          <p className="text-2xl font-bold text-amber-600">
            {users.filter((u) => u.status === "pending").length}
          </p>
          <p className="text-sm text-muted-foreground">Pending Approval</p>
        </div>
        <div className="admin-card p-4 text-center">
          <p className="text-2xl font-bold text-info">
            {users.length > 0 
              ? Math.round((users.filter((u) => u.status === "active").length / users.length) * 100)
              : 0}%
          </p>
          <p className="text-sm text-muted-foreground">Active Rate</p>
        </div>
      </div>
    </div>
  );
};

export default Users;
