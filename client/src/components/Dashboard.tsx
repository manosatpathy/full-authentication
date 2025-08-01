import Box from "@mui/material/Box";
import { DataGrid, type GridRenderCellParams } from "@mui/x-data-grid";
import { useQuery } from "@tanstack/react-query";
import * as apiClient from "../api-Client";
import { useMemo } from "react";
import { CheckIcon, X } from "lucide-react";

type User = {
  _id: string;
  username: string;
  email: string;
  email_verified: boolean;
  role: string;
};

export default function Dashboard() {
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: apiClient.getAllUsers,
  });

  const columns = useMemo(() => {
    if (!users || users.length === 0) return [];

    const firstRow = users[0];
    return Object.keys(firstRow).map((key) => {
      const baseColumn = {
        field: key === "_id" ? "id" : key,
        headerName:
          key === "_id" ? "ID" : key.charAt(0).toUpperCase() + key.slice(1),
        width: 200,
        editable: key === "role",
      };

      if (key === "email_verified") {
        return {
          ...baseColumn,
          field: "verified",
          headerName: "Verified",
          renderCell: (params: GridRenderCellParams) => {
            return (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  width: "100%",
                }}
              >
                {params.value ? (
                  <span className="flex items-center justify-center p-1 rounded-full bg-green-100">
                    <CheckIcon size={18} color="#22c55e" />
                  </span>
                ) : (
                  <span className="flex items-center justify-center p-1 rounded-full bg-red-100">
                    <X size={18} color="#ef4444" />
                  </span>
                )}
              </Box>
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
    <Box
      sx={{
        width: "100%",
        minHeight: "580px",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        py: 4,
      }}
    >
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
        {isLoading ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "420px",
              width: "100%",
            }}
          >
            <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-blue-400 border-opacity-80"></div>
          </Box>
        ) : (
          <DataGrid
            className="w-full"
            rows={rows || []}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 8,
                },
              },
            }}
            pageSizeOptions={[5]}
            checkboxSelection
            disableRowSelectionOnClick
            sx={{
              background: "transparent",
              borderRadius: 3,
              border: "none",
              minHeight: "400px",
              "& .MuiDataGrid-cell:focus": {
                outline: "none",
              },
              "& .MuiDataGrid-columnHeaders": {
                background: "linear-gradient(90deg, #e0eaff 60%, #f7fafc 100%)",
                borderRadius: "12px 12px 0 0",
                fontWeight: 700,
                letterSpacing: "1.2px",
                fontSize: "1rem",
              },
              "& .MuiDataGrid-row": {
                background: "white",
                "&:nth-of-type(odd)": {
                  background: "#f1f5f9",
                },
                "&:hover": {
                  backgroundColor: "#dbeafe !important",
                  transition: "background 0.2s",
                },
              },
              "& .MuiCheckbox-root": {
                color: "#3b82f6 !important",
              },
              "& .MuiDataGrid-footerContainer": {
                borderTop: "none",
              },
              fontFamily: "Inter, ui-sans-serif, system-ui",
            }}
          />
        )}
      </Box>
    </Box>
  );
}
