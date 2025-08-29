import UsernameSection from "@/forms/UserForm/UsernameSection";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "@radix-ui/react-label";
import { Input } from "./ui/input";
import { useAppContext } from "@/context/AppContext";
import PasswordSection from "@/forms/UserForm/PasswordSection";

const AccountDetails = () => {
  const { user, showToast } = useAppContext();

  return (
    <Card className="w-full h-full mx-auto min-h-[510px] border-none rounded-2xl shadow-2xl bg-gradient-to-br from-white via-gray-50 to-blue-100 px-0">
      <CardHeader className="flex flex-row justify-between items-center px-8 py-6 border-b border-blue-100">
        <CardTitle className="text-2xl font-bold text-gray-900">
          Account Details
        </CardTitle>
      </CardHeader>
      <CardContent className="px-8 py-8 space-y-8">
        <UsernameSection user={user} showToast={showToast} />
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="font-semibold text-gray-700">Email</Label>
          </div>
          <Input
            type="email"
            value={user?.email}
            disabled
            className="rounded-lg border border-gray-200 bg-gray-50 cursor-not-allowed"
          />
        </div>
        <PasswordSection showToast={showToast} />
      </CardContent>
    </Card>
  );
};

export default AccountDetails;
