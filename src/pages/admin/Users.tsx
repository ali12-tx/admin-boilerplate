import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Ban,
  Trash2,
  Search,
  UserCheck,
  UserX,
  Clock3,
  Eye,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import Pagination from "@/components/shared/Pagination";
import { useToast } from "@/hooks/use-toast";
import { api, ApiClientError } from "@/config/client";
import { API_ENDPOINTS } from "@/config/config";
import type {
  NormalizedUser,
  NormalizedUserStatus,
  RemoteUser,
  UsersApiResponse,
  ToggleAdminBlockResponse,
} from "@/types/users";

export type User = NormalizedUser;

const getUserStatus = ({
  hasAdminBlocked,
  isDeleted,
  isVerified,
}: {
  hasAdminBlocked?: boolean;
  isDeleted?: boolean;
  isVerified?: boolean;
}): NormalizedUserStatus => {
  if (hasAdminBlocked || isDeleted) return "blocked";
  if (isVerified) return "active";
  return "pending";
};

const normalizeUser = (user: RemoteUser): NormalizedUser => {
  const hasAdminBlocked = Boolean(user.user.hasAdminBlocked);
  const isDeleted = Boolean(user.user.isDeleted);
  const isVerified = Boolean(user.user.isVerified);
  const status = getUserStatus({
    hasAdminBlocked,
    isDeleted,
    isVerified,
  });

  const email = user.user.email?.trim();
  const name =
    user.fullName?.trim() ||
    user.username?.trim() ||
    (email ? email.split("@")[0] : undefined) ||
    "Unknown User";

  return {
    id: user.user._id,
    name,
    email: email || "N/A",
    username: user.username,
    avatar: user.profilePicture,
    bio: user.bio,
    role: user.user.role,
    isMuted: user.isMuted,
    isFollowing: user.isFollowing,
    followersCount: user.followers?.length ?? 0,
    followingCount: user.following?.length ?? 0,
    isVerified: Boolean(user.user.isVerified),
    isProfileCompleted: Boolean(user.user.isProfileCompleted),
    hasAdminBlocked,
    isDeleted,
    status,
  };
};

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isBlockUpdating, setIsBlockUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchUsers = useCallback(
    async (page: number, limit: number) => {
      setIsLoading(true);
      setError(null);
      const endpoint = `${API_ENDPOINTS.USER.GET_ALL}?page=${page}&limit=${limit}`;

      console.groupCollapsed("👥 Fetch users");
      console.log("Request", { page, limit, endpoint });
      try {
        const response = await api.get<UsersApiResponse>(endpoint);
        const normalizedUsers = response.items.map((user) => normalizeUser(user));

        setUsers(normalizedUsers);
        setTotalItems(response.total ?? normalizedUsers.length);
        setCurrentPage((prev) =>
          response.page && response.page !== prev ? response.page : prev
        );
        setItemsPerPage((prev) =>
          response.limit && response.limit !== prev ? response.limit : prev
        );

        console.log("Response", {
          page: response.page,
          limit: response.limit,
          total: response.total,
          count: normalizedUsers.length,
          success: response.success,
        });
      } catch (err) {
        const message =
          err instanceof ApiClientError
            ? err.message
            : "Unable to fetch users. Please try again.";
        setError(message);
        console.error("Fetch users failed", { page, limit, error: err });
        toast({
          variant: "destructive",
          title: "Failed to load users",
          description: message,
        });
      } finally {
        setIsLoading(false);
        console.groupEnd();
      }
    },
    [toast]
  );

  useEffect(() => {
    fetchUsers(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage, fetchUsers]);

  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      (user.username?.toLowerCase() ?? "").includes(query)
    );
  });

  const effectiveTotal = searchQuery
    ? filteredUsers.length
    : totalItems || filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(effectiveTotal / itemsPerPage));
  const paginatedUsers = filteredUsers;

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

  const confirmBlock = async () => {
    if (!selectedUser || isBlockUpdating) return;

    const userId = selectedUser.id;
    const userName = selectedUser.name;
    setIsBlockUpdating(true);

    try {
      const response = await api.patch<ToggleAdminBlockResponse>(
        API_ENDPOINTS.USER.ADMIN_BLOCK_USER(userId)
      );

      const hasAdminBlocked =
        response?.hasAdminBlocked ?? !selectedUser.hasAdminBlocked;

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId
            ? {
                ...user,
                hasAdminBlocked,
                status: getUserStatus({
                  hasAdminBlocked,
                  isDeleted: user.isDeleted,
                  isVerified: user.isVerified,
                }),
              }
            : user
        )
      );

      toast({
        title: hasAdminBlocked ? "User blocked" : "User unblocked",
        description:
          response?.message ??
          `${userName} has been ${hasAdminBlocked ? "blocked" : "unblocked"}.`,
      });
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : "Unable to update user status. Please try again.";
      console.error("Block/unblock user failed", { userId, error: err });
      toast({
        variant: "destructive",
        title: "Failed to update user",
        description: message,
      });
    } finally {
      setIsBlockUpdating(false);
      setSelectedUser(null);
    }
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
            ? `Allow ${selectedUser?.name} to regain access to their account?`
            : `Are you sure you want to block ${selectedUser?.name}? They will be prevented from accessing the app.`
        }
        confirmLabel={selectedUser?.status === "blocked" ? "Unblock" : "Block"}
        onConfirm={confirmBlock}
        variant={selectedUser?.status === "blocked" ? "default" : "destructive"}
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
        {isLoading ? (
          <div className="py-12 flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading users...</span>
          </div>
        ) : (
          <>
            {error && (
              <div className="border-b border-border bg-destructive/5 px-6 py-3 text-sm text-destructive flex items-center justify-between gap-3">
                <span>{error}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setCurrentPage(1);
                  }}
                >
                  Retry
                </Button>
              </div>
            )}
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
                        <span className="text-sm text-muted-foreground">
                          {user.email}
                        </span>
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
                          {user.status === "active" && (
                            <UserCheck className="w-3 h-3" />
                          )}
                          {user.status === "blocked" && (
                            <UserX className="w-3 h-3" />
                          )}
                          {user.status === "pending" && (
                            <Clock3 className="w-3 h-3" />
                          )}
                          {user.status === "active"
                            ? "Active"
                            : user.status === "blocked"
                            ? "Blocked"
                            : "Pending"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              navigate(`/admin/users/${user.id}`, {
                                state: { user },
                              })
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
                            title={
                              user.status === "active"
                                ? "Block user"
                                : "Unblock user"
                            }
                          >
                            <Ban className="w-4 h-4" />
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
              <Pagination
                page={currentPage}
                pageSize={itemsPerPage}
                total={effectiveTotal}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                  setItemsPerPage(size);
                  setCurrentPage(1);
                }}
              />
            )}
          </>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="admin-card p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{totalItems}</p>
          <p className="text-sm text-muted-foreground">Total Users</p>
        </div>
        <div className="admin-card p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{users.length}</p>
          <p className="text-sm text-muted-foreground">Users on this page</p>
        </div>
        <div className="admin-card p-4 text-center">
          <p className="text-2xl font-bold text-destructive">
            {users.filter((u) => u.status === "blocked").length}
          </p>
          <p className="text-sm text-muted-foreground">Blocked</p>
        </div>
        <div className="admin-card p-4 text-center">
          <p className="text-2xl font-bold text-success">
            {users.filter((u) => u.status === "active").length}
          </p>
          <p className="text-sm text-muted-foreground">Verified</p>
        </div>
      </div>
    </div>
  );
};

export default Users;
