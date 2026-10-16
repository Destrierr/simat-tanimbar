import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAppStore = create(
  persist(
    (set, get) => ({
      // Simpan USER
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),

      // Simpan ROLE
      role: null,
      setRole: (role) => set({ role }),
      clearRole: () => set({ role: null }),

      // Simpan THEME
      theme: "light",
      toggleTheme: () => {
        const newTheme = get().theme === "dark" ? "light" : "dark";
        document.documentElement.classList.toggle("dark", newTheme === "dark");
        set({ theme: newTheme });
      },
      setTheme: (theme) => {
        document.documentElement.classList.toggle("dark", theme === "dark");
        set({ theme });
      },

      // Simpan CHAT SESSION
      chatSessionId: null,
      setChatSession: (id) => set({ chatSessionId: id }),
      resetChatSession: () => set({ chatSessionId: null }),

      // CLEAR ALL (logout)
      clearAll: () => {
        set({
          user: null,
          role: null,
          chatSessionId: null,
        });
      },
    }),

    {
      name: "app-storage",
      partialize: (state) => ({
        theme: state.theme,
        role: state.role,
        chatSessionId: state.chatSessionId,
      }),
    },
  ),
);

export default useAppStore;
