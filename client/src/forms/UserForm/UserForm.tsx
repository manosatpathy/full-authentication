import { Input } from "@/components/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@radix-ui/react-label";
import { useState } from "react";

const UserForm = () => {
  const [isPassword, setIsPassword] = useState(false);

  return (
    <Card className="w-full mx-auto rounded-2xl shadow-2xl border-none bg-gradient-to-br from-white via-gray-50 to-blue-100 px-0">
      <CardHeader className="flex flex-row justify-between items-center px-8 py-6 border-b border-blue-100">
        <CardTitle className="text-2xl font-bold text-gray-900">
          User Profile
        </CardTitle>
        <CardAction>
          <Button
            type="button"
            variant={isPassword ? "secondary" : "default"}
            className="transition px-4 py-2 font-medium rounded-lg bg-blue-500 hover:bg-blue-600 text-white shadow"
            onClick={() => setIsPassword(!isPassword)}
          >
            {isPassword ? "Back to Profile" : "Change Password"}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="px-8 pt-8 pb-4">
        <form>
          <div className="flex flex-col gap-7 mb-8">
            {!isPassword ? (
              <>
                <div className="grid gap-2">
                  <Label
                    htmlFor="username"
                    className="font-semibold text-gray-700"
                  >
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    autoComplete="username"
                    placeholder="Enter your username"
                    required
                    className="rounded-lg border border-blue-200 focus:border-blue-400 shadow-sm focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>
                <div className="grid gap-2">
                  <Label
                    htmlFor="email"
                    className="font-semibold text-gray-700"
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@email.com"
                    required
                    className="rounded-lg border border-blue-200 focus:border-blue-400 shadow-sm focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="grid gap-2">
                  <Label
                    htmlFor="password"
                    className="font-semibold text-gray-700"
                  >
                    New Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="New password"
                    required
                    autoComplete="new-password"
                    className="rounded-lg border border-blue-200 focus:border-blue-400 shadow-sm focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>
                <div className="grid gap-2">
                  <Label
                    htmlFor="repeatPassword"
                    className="font-semibold text-gray-700"
                  >
                    Repeat Password
                  </Label>
                  <Input
                    id="repeatPassword"
                    type="password"
                    placeholder="Repeat new password"
                    required
                    autoComplete="new-password"
                    className="rounded-lg border border-blue-200 focus:border-blue-400 shadow-sm focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>
              </>
            )}
          </div>
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition"
          >
            Submit
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default UserForm;
