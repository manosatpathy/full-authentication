import {
  DataGrid,
  type GridColDef,
  type GridRenderCellParams,
  type GridRowModel,
} from "@mui/x-data-grid";
import { useMemo } from "react";
import { Box, Select, MenuItem } from "@mui/material";
import { CheckIcon, X } from "lucide-react";
import type { User } from "./Dashboard";

type Props = {
  users: User[];
  currentUserId?: string;
  isLoading: boolean;
  processRowUpdate: (
    newRow: GridRowModel,
    oldRow: GridRowModel
  ) => Promise<GridRowModel>;
};

const UserTable = ({
  users,
  currentUserId,
  isLoading,
  processRowUpdate,
}: Props) => {
  const columns: GridColDef[] = useMemo(() => {
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
          renderCell: (params: GridRenderCellParams) => (
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
          ),
        };
      }

      if (key === "role") {
        return {
          ...baseColumn,
          type: "singleSelect",
          valueOptions: ["user", "admin"],
          renderCell: (params: GridRenderCellParams) => (
            <Select
              value={params.value}
              size="small"
              disabled
              sx={{ fontSize: "0.9rem", width: "100%" }}
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          ),
        };
      }

      return baseColumn;
    });
  }, [users]);

  const rows = useMemo(() => {
    if (!users || users.length === 0) return [];
    return users
      .filter((user) => user._id !== currentUserId)
      .map((user) => ({
        id: user._id,
        username: user.username,
        email: user.email,
        verified: user.email_verified,
        role: user.role,
      }));
  }, [users, currentUserId]);

  if (isLoading) {
    return (
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
    );
  }

  return (
    <DataGrid
      className="w-full"
      rows={rows || []}
      columns={columns}
      processRowUpdate={processRowUpdate}
      initialState={{
        pagination: {
          paginationModel: { pageSize: 8 },
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
        "& .MuiDataGrid-cell:focus": { outline: "none" },
        "& .MuiDataGrid-columnHeaders": {
          background: "linear-gradient(90deg, #e0eaff 60%, #f7fafc 100%)",
          borderRadius: "12px 12px 0 0",
          fontWeight: 700,
          letterSpacing: "1.2px",
          fontSize: "1rem",
        },
        "& .MuiDataGrid-row": {
          background: "white",
          "&:nth-of-type(odd)": { background: "#f1f5f9" },
          "&:hover": {
            backgroundColor: "#dbeafe !important",
            transition: "background 0.2s",
          },
        },
        "& .MuiCheckbox-root": { color: "#3b82f6 !important" },
        "& .MuiDataGrid-footerContainer": { borderTop: "none" },
        fontFamily: "Inter, ui-sans-serif, system-ui",
      }}
    />
  );
};
export default UserTable;
