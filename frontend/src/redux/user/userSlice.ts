import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define el estado inicial
interface UserState {
  name?: string;
  lastName?: string;
  email?: string;
  token: string;
}

const initialState: UserState = {
  name: "",
  lastName: "",
  email: "",
  token: "",
};

// Define el slice y el reductor
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState>) => {
      console.log(`
        action.payload: ${JSON.stringify(action.payload)}
        action.payload.name: ${JSON.stringify(action.payload.name)}
      `);
      state.name = action.payload.name;
      state.lastName = action.payload.lastName;
      state.email = action.payload.email;
      state.token = action.payload.token;
    },
    logout: (state) => {
      state.name = "";
      state.lastName = "";
      state.email = "";
      state.token = "";
    },
  },
});

export const { setUser, logout } = userSlice.actions;

export default userSlice.reducer;
