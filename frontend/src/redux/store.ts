import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import rolesSlice from "./roles/rolesSlice";
import userSlice from "./user/userSlice";
import { Action } from "redux";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user"], // Only persist the state of the "user" slice
};

const rootReducer = (state: any | undefined, action: Action) => ({
  roles: rolesSlice(state?.roles, action),
  user: userSlice(state?.user, action),
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
