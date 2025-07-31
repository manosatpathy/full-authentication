import { Card, CardContent } from "@/components/ui/card";

import { RxAvatar } from "react-icons/rx";
import { useAppContext } from "@/context/AppContext";
import { Link } from "react-router-dom";

const UserCard = () => {
  const { user } = useAppContext();

  return (
    <Card className="w-full max-w-sm rounded-2xl shadow-xl border-none bg-gradient-to-br from-white via-gray-50 to-blue-100">
      <CardContent className="flex flex-col justify-center items-center gap-10 p-8">
        <div className="flex flex-col gap-3 justify-center items-center">
          <div className="rounded-full bg-gradient-to-tr from-blue-400 via-blue-300 to-purple-300 p-2 shadow-lg mb-2">
            <RxAvatar size={70} className="text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 tracking-wide">
            {user?.username}
          </h3>
          <h4 className="text-sm font-medium text-blue-600 uppercase tracking-widest">
            {user?.role}
          </h4>
        </div>
        <div className="flex flex-col justify-center items-center w-full gap-1">
          <p className="text-gray-600">{user?.email}</p>
          {user?.email_verified ? (
            <p className="text-green-600 font-semibold text-xs bg-green-50 px-2 py-1 rounded-full mt-1">
              Verified
            </p>
          ) : (
            <Link to={`/auth/verify-otp?userId=${user?._id}`}>
              <p className="text-red-600 font-semibold text-xs bg-red-50 px-2 py-1 rounded-full mt-1 hover:bg-red-100 transition cursor-pointer">
                Verify now
              </p>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserCard;
