import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as apiClient from "@/api-Client";
import { useAppContext } from "@/context/AppContext";
import { Box } from "@mui/material";
import UserTable from "./UserTable";
import type { GridRowModel } from "@mui/x-data-grid";

export type User = {
  _id: string;
  username: string;
  email: string;
  email_verified: boolean;
  role: string;
};

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { showToast, user: currentUser } = useAppContext();

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: apiClient.getAllUsers,
  });

  const updateUserMutation = useMutation({
    mutationFn: apiClient.updateUserRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      showToast({ message: "User role changed!", type: "SUCCESS" });
    },
    onError: () => {
      showToast({ message: "Error updating user role", type: "ERROR" });
    },
  });

  const processRowUpdate = async (
    newRow: GridRowModel,
    oldRow: GridRowModel
  ) => {
    if (newRow.role !== oldRow.role) {
      try {
        await updateUserMutation.mutateAsync({
          userId: newRow.id,
          role: newRow.role,
        });
      } catch (err) {
        console.error("Error updating user role:", err);
        return oldRow;
      }
    }
    return newRow;
  };

  return (
    <Box sx={{ width: "100%", minHeight: "580px", py: 4 }}>
      <Box
        sx={{
          width: "100%",
          borderRadius: 4,
          boxShadow: 6,
          background:
            "linear-gradient(135deg, #fff 30%, #f4f7fe 70%, #dbeafe 100%)",
          p: 3,
        }}
      >
        <UserTable
          users={users || []}
          currentUserId={currentUser?._id}
          isLoading={isLoading}
          processRowUpdate={processRowUpdate}
        />
      </Box>
    </Box>
  );
}
