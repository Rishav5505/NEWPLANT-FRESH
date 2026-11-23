import { ShieldAlert } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Button, EmptyState } from "../../components/ui";
import Admin from "./Admin";

export default function AdminRoute() {
  const { user, isAdmin, openAuth } = useAuth();

  if (!user || !isAdmin) {
    return (
      <div className="container-x py-24">
        <EmptyState
          icon={ShieldAlert}
          title="Admins only"
          text={user ? "Your account doesn't have admin access." : "Sign in with an admin account to open the dashboard."}
          action={user ? <Button to="/">Back to shop</Button> : <Button onClick={() => openAuth("login")}>Sign in</Button>}
        />
      </div>
    );
  }
  return <Admin />;
}
