import { Logo } from "./logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "~/store";
import { logout } from "~/reducers/auth.reducer";
import { Link, useNavigate } from "@remix-run/react";
import { gqlRequest } from "~/utils/api";
import { LogOut, Trash2 } from "lucide-react";
import { NotificationBell } from "./notification-bell";
import { toast } from "sonner";

export const FilesHeader: React.FC = () => {
  const { user, isInitialized } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // 1. Call server-side logout to clear/invalidate tokens
      await gqlRequest(`
        mutation Logout {
          logout
        }
      `);
    } catch (err) {
      toast.error("Failed to logout from server");
      // console.error("Server-side logout failed:", err);
    } finally {
      // 2. Clear local state and redirect regardless of server success
      dispatch(logout());
      navigate("/auth");
    }
  };

  const handleDeleteAccount = () => {
    // Placeholder for now
    toast.info("Delete account functionality coming soon.");
  };

  return (
    <header className="files-header flex items-center content-start w-full h-32 md:h-20 px-4 bg-gradient-to-b from-bg from-80% backdrop-blur-sm fixed z-[99]">
      <div className="relative flex-row justify-start pr-4 md:w-1/4 h-3/4">
        <div className="flex items-center justify-start h-[95%] p-3 rounded-2xl drop-shadow-sm bg-canvas w-max min-w-20">
          <DropdownMenu>
            <DropdownMenuTrigger className="ring-none border-none outline-none focus:outline-none">
              <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity">
                {isInitialized ? (
                  <>
                    <img
                      src={user?.avatarUrl || "/images/emoji_student_1.png"}
                      alt="the profile picture of the current user on the files page"
                      className="w-10 h-10 drop-shadow-md rounded-full object-cover"
                    />
                    <p className="m-4 hidden md:block">
                      {user?.username || (user?.email?.split("@")[0]) || "User"}
                    </p>
                  </>
                ) : (
                  <div className="flex items-center animate-pulse gap-4 px-2">
                    <div className="w-10 h-10 bg-outline1/20 rounded-full" />
                    <div className="w-20 h-4 bg-outline1/20 rounded hidden md:block" />
                  </div>
                )}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 mt-2 ml-[-5%]">
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="flex items-center gap-2 cursor-pointer hover:bg-black/5 focus:bg-black/5"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleDeleteAccount}
                className="flex items-center gap-2 cursor-pointer text-red-600 hover:bg-red-50 focus:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Account</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex flex-col items-center justify-center w-10 h-full ml-4 border-l border-outline1/50 pl-4">
            <NotificationBell />
          </div>
        </div>
        <span className="h-[60%] md:h-[80%] w-[3px] bg-outline1 y-centered-absolute right-0 rounded"></span>
      </div>
      <div
        className="flex items-center justify-between flex-1 h-full pl-4"
        style={{ "--logo-box-here": "3rem" } as any}
      >
        <h2>All Projects</h2>
        <Link to="/">
          <Logo />
        </Link>
      </div>
    </header>
  );
};

