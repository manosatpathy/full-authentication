import Box from "@mui/material/Box";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useQuery } from "@tanstack/react-query";
import * as apiClient from "../api-Client";
import { useMemo } from "react";
import { CheckIcon, X } from "lucide-react";

export default function Dashboard() {
  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: apiClient.getAllUsers,
  });
  console.log(users);

  const columns = useMemo(() => {
    if (!users || users.length === 0) return [];

    const firstRow = users[0];
    return Object.keys(firstRow).map((key) => {
      const baseColumn = {
        field: key === "_id" ? "id" : key,
        headerName:
          key === "_id" ? "ID" : key.charAt(0).toUpperCase() + key.slice(1),
        width: 110,
        editable: key === "role",
      };

      if (key === "email_verified") {
        return {
          ...baseColumn,
          field: "verified",
          headerName: "Verified",
          renderCell: (params) => {
            console.log(params);
            return params.value ? (
              <CheckIcon size={16} color="green" />
            ) : (
              <X size={16} color="red" />
            );
          },
        };
      }

      return baseColumn;
    });
  }, [users]);

  const rows = useMemo(() => {
    if (!users || users.length === 0) return [];

    return users.map((user, index) => ({
      id: index + 1,
      username: user.username,
      email: user.email,
      verified: user.email_verified,
      role: user.role,
    }));
  }, [users]);

  return (
    <Box sx={{ height: "100%", width: "100%" }}>
      <DataGrid
        rows={rows || []}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 5,
            },
          },
        }}
        pageSizeOptions={[5]}
        checkboxSelection
        disableRowSelectionOnClick
      />
    </Box>
  );
}
