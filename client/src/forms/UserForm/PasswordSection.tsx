import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ToastMessage } from "@/context/AppContext";
import {
  updatePasswordSchema,
  type UpdatePasswordType,
} from "@/schemas/updatePassword";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@radix-ui/react-label";
import { useMutation } from "@tanstack/react-query";
import { CheckIcon, Edit2, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as apiClient from "../../api-Client";

type PasswordSectionProps = {
  showToast: (toastMessage: ToastMessage) => void;
};

const PasswordSection = ({ showToast }: PasswordSectionProps) => {
  const [editingPassword, setEditingPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdatePasswordType>({
    resolver: zodResolver(updatePasswordSchema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: apiClient.updatePassword,
    onSuccess: async () => {
      showToast({ message: "password updated", type: "SUCCESS" });
      setEditingPassword(false);
    },
    onError: (error) => {
      showToast({ message: error.message, type: "ERROR" });
    },
  });

  const onSubmit = (data: UpdatePasswordType) => {
    mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="font-semibold text-gray-700">Password</Label>
          {!editingPassword ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditingPassword(true)}
              className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <Edit2 size={14} />
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingPassword(false)}
                className="flex items-center gap-1 text-gray-600 border-gray-200 hover:bg-gray-50"
              >
                <X size={14} />
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isPending}
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <CheckIcon size={14} />
              </Button>
            </div>
          )}
        </div>

        {!editingPassword ? (
          <Input
            type="password"
            value="••••••••"
            disabled
            className="rounded-lg border border-gray-200 bg-gray-50 cursor-not-allowed"
          />
        ) : (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-600 mb-2 block">
                Current Password
              </Label>
              <Input
                type="password"
                placeholder="Enter current password"
                className="rounded-lg border border-blue-200 focus:border-blue-400 shadow-sm focus:ring-2 focus:ring-blue-100 transition"
                {...register("currentPassword")}
              />
              {errors.currentPassword && (
                <p className="text-sm text-red-500">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600 mb-2 block">
                New Password
              </Label>
              <Input
                type="password"
                placeholder="Enter new password"
                className="rounded-lg border border-blue-200 focus:border-blue-400 shadow-sm focus:ring-2 focus:ring-blue-100 transition"
                {...register("newPassword")}
              />
              {errors.newPassword && (
                <p className="text-sm text-red-500">
                  {errors.newPassword.message}
                </p>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600 mb-2 block">
                Confirm New Password
              </Label>
              <Input
                type="password"
                placeholder="Confirm new password"
                className="rounded-lg border border-blue-200 focus:border-blue-400 shadow-sm focus:ring-2 focus:ring-blue-100 transition"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </form>
  );
};

export default PasswordSection;
