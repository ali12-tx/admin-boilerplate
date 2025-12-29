import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  BadgeCheck,
  Ban,
  ChevronLeft,
  FileText,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { dummyUsers } from "./Users";

type UserStatus = "active" | "blocked" | "pending";

interface Document {
  id: number;
  name: string;
  type: string;
  status: "verified" | "pending" | "rejected";
  url?: string;
}

const mockDocuments: Document[] = [
  {
    id: 1,
    name: "Government ID",
    type: "Identity",
    status: "verified",
    url: "#",
  },
  {
    id: 2,
    name: "Proof of Address",
    type: "Address",
    status: "pending",
    url: "#",
  },
  {
    id: 3,
    name: "Selfie Verification",
    type: "Identity",
    status: "pending",
    url: "#",
  },
];

const UserProfile = () => {
  const { state } = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const user = useMemo(() => {
    if (state?.user) return state.user;
    const numericId = Number(id);
    return dummyUsers.find((u) => u.id === numericId);
  }, [state, id]);

  const [status, setStatus] = useState<UserStatus>(user?.status ?? "pending");
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);

  if (!user) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
          <h2 className="text-2xl font-bold text-foreground">User not found</h2>
        </div>
        <p className="text-muted-foreground">
          We could not locate this user. Please return to the users list.
        </p>
        <Button onClick={() => navigate("/admin/users")}>Go to Users</Button>
      </div>
    );
  }

  const handleApprove = () => {
    setStatus("active");
    setDocuments((docs) =>
      docs.map((doc) =>
        doc.status === "pending" ? { ...doc, status: "verified" } : doc
      )
    );
    toast({
      title: "User Approved",
      description: `${user.name} can now access the application.`,
    });
  };

  const handleBlock = () => {
    setStatus("blocked");
    toast({
      title: "User Blocked",
      description: `${user.name} has been blocked and cannot log in.`,
      variant: "destructive",
    });
  };

  const renderStatusPill = (value: UserStatus) => {
    if (value === "active")
      return (
        <span className="px-3 py-1 rounded-full bg-success/10 text-success text-sm font-medium">
          Active
        </span>
      );
    if (value === "blocked")
      return (
        <span className="px-3 py-1 rounded-full bg-destructive/10 text-destructive text-sm font-medium">
          Blocked
        </span>
      );
    return (
      <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-sm font-medium">
        Pending
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="p-0 h-auto"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
          <div>
            <p className="text-sm text-muted-foreground">User Profile</p>
            <h2 className="text-2xl font-bold text-foreground">{user.name}</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {status !== "blocked" && (
            <Button
              variant="outline"
              onClick={handleBlock}
              className="gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Ban className="w-4 h-4" /> Block
            </Button>
          )}
          {status !== "active" && (
            <Button onClick={handleApprove} className="gap-1">
              <BadgeCheck className="w-4 h-4" /> Approve
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="admin-card p-6 space-y-4 lg:col-span-2">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-semibold">
              {user.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground">
                {user.name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" /> {user.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" /> +1 (555) 123-4567
              </div>
            </div>
            <div className="ml-auto">{renderStatusPill(status)}</div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-muted/40 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Last Login</p>
              <p className="text-lg font-semibold text-foreground">
                Today, 09:24 AM
              </p>
            </div>
            <div className="bg-muted/40 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Sign-up Method</p>
              <p className="text-lg font-semibold text-foreground">
                Email + Password
              </p>
            </div>
          </div>
        </div>

        <div className="admin-card p-6 space-y-3">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <User className="w-4 h-4" /> Account Status
          </h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Current Status</span>
              {renderStatusPill(status)}
            </div>
            <div className="flex items-center justify-between">
              <span>Verification</span>
              <span className="px-2 py-1 rounded bg-muted text-xs">
                Email verified
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>2FA</span>
              <span className="px-2 py-1 rounded bg-muted text-xs">
                Not enabled
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <FileText className="w-4 h-4" /> Submitted Documents
          </h3>
          <span className="text-sm text-muted-foreground">
            {documents.filter((doc) => doc.status === "verified").length} of{" "}
            {documents.length} verified
          </span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="border border-border rounded-lg p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {doc.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{doc.type}</p>
                </div>
                <span
                  className={
                    doc.status === "verified"
                      ? "px-2 py-1 rounded-full bg-success/10 text-success text-xs"
                      : doc.status === "rejected"
                      ? "px-2 py-1 rounded-full bg-destructive/10 text-destructive text-xs"
                      : "px-2 py-1 rounded-full bg-amber-50 text-amber-700 text-xs"
                  }
                >
                  {doc.status === "verified"
                    ? "Verified"
                    : doc.status === "pending"
                    ? "Pending"
                    : "Rejected"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <a className="text-primary hover:underline" href={doc.url}>
                  View file
                </a>
                {doc.status === "pending" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 text-success hover:text-success"
                    onClick={() =>
                      setDocuments((docs) =>
                        docs.map((d) =>
                          d.id === doc.id ? { ...d, status: "verified" } : d
                        )
                      )
                    }
                  >
                    Mark verified
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
