import { RxAvatar, RxDashboard } from "react-icons/rx";
import { SiAuthelia } from "react-icons/si";
import { Link } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useState } from "react";
import { LogOut, User } from "lucide-react";

const Header = () => {
  const { isAuthenticated, user, logout } = useAppContext();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="mx-auto container flex justify-between py-4 items-center">
      <Link to={"/"}>
        <div className="flex justify-center items-center gap-3">
          <SiAuthelia size={30} />
          <h1 className="font-bold">Auth</h1>
        </div>
      </Link>
      {isAuthenticated ? (
        <DropdownMenu
          open={dropdownOpen}
          onOpenChange={setDropdownOpen}
          modal={false}
        >
          <DropdownMenuTrigger
            asChild
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <RxAvatar size={35} className="cursor-pointer" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56"
            align="start"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <DropdownMenuLabel>
              {user?.username}
              {`(${user?.role})`}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link to={`/${user?.role}-profile`}>
              <DropdownMenuItem>
                <User></User>
                Profile
              </DropdownMenuItem>
            </Link>
            {user?.role === "admin" && (
              <Link to={"/admin"}>
                <DropdownMenuItem>
                  <RxDashboard></RxDashboard>
                  Dashboard
                </DropdownMenuItem>
              </Link>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout()}>
              <LogOut></LogOut>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Link to={"/auth/login"}>
          <Button>Log In </Button>
        </Link>
      )}
    </div>
  );
};

export default Header;
