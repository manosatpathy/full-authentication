import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SiAuthelia } from "react-icons/si";
import { useMutation } from "@tanstack/react-query";
import * as apiClient from "../../api-Client";
import { useState } from "react";
import { useAppContext } from "@/context/AppContext";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const { showToast } = useAppContext();
  const navigate = useNavigate();

  const { mutate, isPending } = useMutation({
    mutationFn: apiClient.sendForgetPasswordLink,
    onSuccess: () => {
      showToast({
        message: "Password reset link sent to your email.",
        type: "SUCCESS",
      });
      navigate("/");
    },
    onError: (error) => {
      showToast({ message: error.message, type: "ERROR" });
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      mutate(email);
    }
  };
  return (
    <div className="flex  flex-col items-center gap-4">
      <SiAuthelia className="text-5xl" />
      <h1 className="text-2xl font-bold mb-10">Forget Password</h1>
      <form onSubmit={onSubmit}>
        <div className="w-80  flex flex-col gap-4">
          <div className="mb-1">
            <label htmlFor="email" className="font-medium">
              Your Email
            </label>
            <Input
              type="email"
              name="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              className="w-full"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            Submit
          </Button>
        </div>
      </form>
      <div className="text-center pt-5">
        <span>
          Don't have an account ?{" "}
          <Link to="/auth/register" className="underline">
            Sign up
          </Link>
        </span>
      </div>
    </div>
  );
};

export default ForgetPassword;
