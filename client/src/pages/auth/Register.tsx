import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SiAuthelia } from "react-icons/si";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import PasswordStrength from "@/components/PasswordStrength";
import { useMutation } from "@tanstack/react-query";
import {
  registrationSchema,
  type RegistrationType,
} from "@/schemas/registration";
import * as apiClient from "../../api-Client";
import { useAppContext } from "@/context/AppContext";

const Register = () => {
  const navigate = useNavigate();
  const { showToast } = useAppContext();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegistrationType>({
    resolver: zodResolver(registrationSchema),
  });

  const password = watch("password");

  const { mutate, isPending } = useMutation({
    mutationFn: apiClient.register,
    onSuccess: () => {
      showToast({ message: "Register Success!", type: "SUCCESS" });
      navigate("/auth/login");
    },
    onError: (error) => {
      showToast({ message: error.message, type: "ERROR" });
    },
  });

  const onSubmit = (formData: RegistrationType) => {
    mutate(formData);
  };

  return (
    <div className="flex  flex-col items-center gap-4">
      <SiAuthelia className="text-5xl" />
      <h1 className="text-2xl font-bold mb-10">Register</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="w-80  flex flex-col gap-4">
          <div className="mb-1">
            <label htmlFor="username" className="font-medium">
              Username
            </label>
            <Input
              type="username"
              placeholder=""
              className="w-full "
              {...register("username")}
            />
            {errors.username && (
              <p className="text-red-500 text-sm">{errors.username?.message}</p>
            )}
          </div>
          <div className="mb-1">
            <label htmlFor="email" className="font-medium">
              Email
            </label>
            <Input
              type="email"
              placeholder="example@gmail.com"
              className="w-full"
              {...register("email")}
            />
            <p className="text-red-500 text-sm">{errors.email?.message}</p>
          </div>
          <div>
            <label htmlFor="password" className="font-medium">
              Password
            </label>
            <Input
              type="password"
              className="w-full"
              {...register("password")}
            />
            <p className="text-red-500 text-sm">{errors.password?.message}</p>
          </div>
          <div>
            <label htmlFor="confirmPassword" className="font-medium">
              Confirm Password
            </label>
            <Input
              type="password"
              className="w-full"
              {...register("confirmPassword")}
            />
            <p className="text-red-500 text-sm">
              {errors.confirmPassword?.message}
            </p>
          </div>
          <PasswordStrength password={password} />
          <Button
            type="submit"
            disabled={isPending}
            className={`w-full cursor-pointer bg-white text-black hover:bg-blue-200 ${
              isPending ? "disabled:bg-slate-950" : ""
            }`}
          >
            Submit
          </Button>
        </div>
      </form>
      <div className="text-center pt-5">
        <span>
          Already have an account ?{"  "}
          <Link to="/auth/login" className="underline">
            Sign in
          </Link>
        </span>
      </div>
    </div>
  );
};

export default Register;
