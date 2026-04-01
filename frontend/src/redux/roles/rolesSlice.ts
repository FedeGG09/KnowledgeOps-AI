import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Role {
  id: number;
  name: string;
  description: string;
}
type RolesState = Role[];

const initialState: RolesState = [];

const rolesSlice = createSlice({
  name: "roles",
  initialState,
  reducers: {
    setRoles: (state, action: PayloadAction<RolesState>) => {
      state.length = 0;
      state.push(...action.payload);
    },
  },
});

export const { setRoles } = rolesSlice.actions;

export default rolesSlice.reducer;
