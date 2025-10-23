import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppContext } from "@/context/AppContext";
import { loginSchema, type LoginFormType } from "@/schemas/logIn";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { SiAuthelia } from "react-icons/si";
import { Link, useNavigate } from "react-router-dom";
import * as apiClient from "../../api-Client";

const Login = () => {
  const navigate = useNavigate();
  const { showToast } = useAppContext();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormType>({
    resolver: zodResolver(loginSchema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: apiClient.login,
    onSuccess: async (data) => {
      localStorage.setItem("otpExpiry", data.otpExpiry);
      showToast({
        message: "Verification OTP has been sent to your Email!",
        type: "SUCCESS",
      });
      navigate("/auth/verify-otp");
    },
    onError: (error) => {
      showToast({ message: error.message, type: "ERROR" });
    },
  });

  const onSubmit = (formData: LoginFormType) => {
    mutate(formData);
  };

  return (
    <div className="flex  flex-col items-center gap-4 min-h-[90vh] container mx-auto">
      <SiAuthelia className="text-5xl" />
      <h1 className="text-2xl font-bold mb-10">Login</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="w-80  flex flex-col gap-4">
          <div className="mb-1">
            <label htmlFor="email" className="font-medium">
              Email / Username
            </label>
            <Input
              type="text"
              placeholder="Email or Username"
              className="w-full"
              {...register("identifier")}
            />
            {errors.identifier && (
              <p className="text-red-500 text-sm">
                {errors.identifier?.message}
              </p>
            )}
          </div>
          <div>
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="font-medium">
                Password
              </label>
              <Link
                to={"/auth/forget-password"}
                className="text-sm hover:underline"
              >
                Forgot your password?
              </Link>
            </div>
            <Input
              type="password"
              className="w-full"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password?.message}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" />
            <label htmlFor="remember">Remember me</label>
          </div>
          <Button
            type="submit"
            disabled={isPending}
            className={`w-full cursor-pointer bg-white text-black hover:bg-blue-200 ${
              isPending ? "disabled:bg-slate-600" : ""
            }`}
          >
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

export default Login;
