import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppContext } from "@/context/AppContext";
import {
  resetPasswordSchema,
  type ResetPasswordType,
} from "@/schemas/resetPassword";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { SiAuthelia } from "react-icons/si";
import { useNavigate, useSearchParams } from "react-router-dom";
import * as apiClient from "../../api-Client";

const ResetPassword = () => {
  const { showToast } = useAppContext();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordType>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: apiClient.resetPassword,
    onSuccess: () => {
      showToast({ message: "Register Success!", type: "SUCCESS" });
      navigate("/auth/login");
    },
    onError: (error) => {
      showToast({ message: error.message, type: "ERROR" });
    },
  });

  const onSubmit = (formData: ResetPasswordType) => {
    if (!token) {
      showToast({ message: "Invalid or missing reset token", type: "ERROR" });
      return;
    }
    const resetData = {
      ...formData,
      token,
    };
    mutate(resetData);
  };

  return (
    <div className="flex  flex-col items-center gap-4">
      <SiAuthelia className="text-5xl" />
      <h1 className="text-2xl font-bold mb-10">Reset Password</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="w-80  flex flex-col gap-4">
          <div className="mb-1">
            <label htmlFor="password" className="font-medium">
              Your Password
            </label>
            <Input
              type="password"
              className="w-full"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password?.message}</p>
            )}
          </div>
          <div className="mb-1">
            <label htmlFor="confirmPassword" className="font-medium">
              confirm Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              className="w-full"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm">
                {errors.confirmPassword?.message}
              </p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            Submit
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;
