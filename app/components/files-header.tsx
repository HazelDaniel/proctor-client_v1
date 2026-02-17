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
import { useNavigate } from "@remix-run/react";
import { gqlRequest } from "~/utils/api.client";
import { LogOut, Trash2 } from "lucide-react";

export const FilesHeader: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
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
      console.error("Server-side logout failed:", err);
    } finally {
      // 2. Clear local state and redirect regardless of server success
      dispatch(logout());
      navigate("/auth");
    }
  };

  const handleDeleteAccount = () => {
    // Placeholder for now
    alert("Delete account functionality coming soon.");
  };

  return (
    <header className="files-header flex items-center content-start w-full h-32 md:h-20 px-4 bg-gradient-to-b from-bg from-80% backdrop-blur-sm fixed z-10">
      <div className="relative flex-row justify-start pr-4 md:w-1/4 h-3/4">
        <div className="flex items-center justify-start h-[95%] p-3 rounded-2xl drop-shadow-sm bg-canvas w-max min-w-20">
          <DropdownMenu>
            <DropdownMenuTrigger className="ring-none border-none outline-none focus:outline-none">
              <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity">
                <img
                  src={user?.avatarUrl || "/images/emoji_student_1.png"}
                  alt="the profile picture of the current user on the files page"
                  className="w-10 h-10 drop-shadow-md"
                />
                <p className="m-4 hidden md:block">
                  {user?.username || (user?.email?.split("@")[0]) || "User"}
                </p>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 mt-2">
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
            <DropdownMenu>
              <DropdownMenuTrigger className="ring-none border-none *:outline-none *:focus:outline-none">
                <span className="w-[80%] h-8 flex justify-center items-center cursor-pointer hover:rotate-[-15deg] origin-top duration-150 ease-linear my-auto">
                  <svg className="w-8 h-8">
                    <use xlinkHref="#bell"></use>
                  </svg>
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Notification</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="hover:bg-black/50 hover:text-white focus:bg-black/50 focus:text-white">
                  a notification on your last project
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-black/50 hover:text-white focus:bg-black/50 focus:text-white">
                  another notification on your last project
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-black/50 hover:text-white focus:bg-black/50 focus:text-white">
                  a third notification on your last project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <span className="h-[60%] md:h-[80%] w-[3px] bg-outline1 y-centered-absolute right-0 rounded"></span>
      </div>
      <div
        className="flex items-center justify-between flex-1 h-full pl-4"
        style={{ "--logo-box-here": "3rem" } as any}
      >
        <h2>All Projects</h2>
        <Logo />
      </div>
    </header>
  );
};

