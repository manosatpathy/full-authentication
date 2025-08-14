import { useDebounce } from "@/hooks/useDebounce";
import { usernameSchema, type UsernameType } from "@/schemas/username";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import * as apiClient from "../../api-Client";
import { Label } from "@radix-ui/react-label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, CheckIcon, Edit2, X } from "lucide-react";
import type { ToastMessage, User } from "@/context/AppContext";

type UsernameSectionProps = {
  user: User | null;
  showToast: (toastMessage: ToastMessage) => void;
};

const UsernameSection = ({ user, showToast }: UsernameSectionProps) => {
  const [editingUsername, setEditingUsername] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<UsernameType>({
    resolver: zodResolver(usernameSchema),
    defaultValues: {
      username: user?.username || "",
    },
    mode: "onChange",
  });

  const newUsername = watch("username");
  const debouncedUsername = useDebounce(newUsername, 500);

  const handleCancelUsername = () => {
    reset({ username: user?.username });
    setEditingUsername(false);
  };

  const shouldCheckAvailability = useMemo(() => {
    return (
      debouncedUsername &&
      debouncedUsername !== user?.username &&
      debouncedUsername.length >= 3
    );
  }, [debouncedUsername, user?.username]);

  const { data: availabilityData, isLoading: checkingAvailability } = useQuery({
    queryKey: ["check-username", debouncedUsername],
    queryFn: () =>
      debouncedUsername && apiClient.checkUsername(debouncedUsername),
    enabled: !!shouldCheckAvailability,
    staleTime: 30000,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: apiClient.updateUsername,
    onSuccess: async () => {
      showToast({ message: "username updated", type: "SUCCESS" });
      setEditingUsername(false);
      await queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (error) => {
      showToast({ message: error.message, type: "ERROR" });
    },
  });

  const onSubmit = (data: UsernameType) => {
    mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="font-semibold text-gray-700">Username</Label>
          {!editingUsername ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditingUsername(true)}
              className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50 cursor-pointer"
            >
              <Edit2 size={14} />
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancelUsername}
                className="flex items-center gap-1 text-gray-600 border-gray-200 hover:bg-gray-50 cursor-pointer"
              >
                <X size={14} />
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={
                  !availabilityData?.available ||
                  availabilityData?.isSame ||
                  isPending
                }
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
              >
                <CheckIcon size={14} />
              </Button>
            </div>
          )}
        </div>

        <Input
          type="text"
          disabled={!editingUsername}
          className="rounded-lg border border-blue-200 focus:border-blue-400 shadow-sm focus:ring-2 focus:ring-blue-100 transition"
          {...register("username")}
        />

        {errors.username && (
          <p className="text-sm text-red-500">{errors.username.message}</p>
        )}

        {editingUsername && !errors.username && (
          <div className="space-y-1">
            {checkingAvailability && (
              <p className="text-sm text-blue-500">Checking availability...</p>
            )}
            {!checkingAvailability && availabilityData?.available === true && (
              <p className="text-sm text-green-500 flex items-center gap-1">
                <Check size={14} />
                Username is available
              </p>
            )}
            {!checkingAvailability && availabilityData?.available === false && (
              <p className="text-sm text-red-500">Username isn't available</p>
            )}
          </div>
        )}
      </div>
    </form>
  );
};

export default UsernameSection;
