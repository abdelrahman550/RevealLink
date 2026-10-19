import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  /** Mobile drawer for the dashboard navigation. */
  navDrawerOpen: boolean;
  /** "Send a message" dialog, reachable from anywhere in the dashboard. */
  composeOpen: boolean;
  /** Previewed attachment in the lightbox. */
  previewSrc: string | null;
}

const initialState: UiState = {
  navDrawerOpen: false,
  composeOpen: false,
  previewSrc: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setNavDrawerOpen(state, action: PayloadAction<boolean>) {
      state.navDrawerOpen = action.payload;
    },
    toggleNavDrawer(state) {
      state.navDrawerOpen = !state.navDrawerOpen;
    },
    setComposeOpen(state, action: PayloadAction<boolean>) {
      state.composeOpen = action.payload;
    },
    openPreview(state, action: PayloadAction<string>) {
      state.previewSrc = action.payload;
    },
    closePreview(state) {
      state.previewSrc = null;
    },
  },
});

export const {
  setNavDrawerOpen,
  toggleNavDrawer,
  setComposeOpen,
  openPreview,
  closePreview,
} = uiSlice.actions;

export const uiReducer = uiSlice.reducer;
