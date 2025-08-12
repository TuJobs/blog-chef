"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  AnonymousUser,
  createAnonymousUser,
  saveAnonymousUser,
  getAnonymousUser,
} from "@/lib/anonymousAuth";

interface AnonymousUserContextType {
  user: AnonymousUser | null;
  isLoading: boolean;
  regenerateNickname: () => void;
  updateNickname: (nickname: string) => void;
}

const AnonymousUserContext = createContext<
  AnonymousUserContextType | undefined
>(undefined);

interface AnonymousUserProviderProps {
  children: ReactNode;
}

export function AnonymousUserProvider({
  children,
}: AnonymousUserProviderProps) {
  const [user, setUser] = useState<AnonymousUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initializeUser() {
      // Kiểm tra xem đã có user trong localStorage chưa
      let existingUser = getAnonymousUser();

      if (!existingUser) {
        // Tạo user mới
        existingUser = createAnonymousUser();
        saveAnonymousUser(existingUser);
      }

      setUser(existingUser);
      setIsLoading(false);

      // Tùy chọn: Sync với database khi có (không bắt buộc)
      try {
        const response = await fetch("/api/anonymous", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId: existingUser.id,
            nickname: existingUser.nickname,
            avatar: existingUser.avatar,
          }),
        });
        // Không cần xử lý response, chỉ sync nếu thành công
      } catch (error) {
        // Bỏ qua lỗi database, vẫn hoạt động với localStorage
        console.log("Database sync failed, using localStorage only");
      }
    }

    initializeUser();
  }, []);

  const regenerateNickname = () => {
    if (user) {
      const newUser = createAnonymousUser(user.sessionId);
      setUser(newUser);
      saveAnonymousUser(newUser);

      // Tùy chọn: Sync với database (không cần chờ)
      fetch("/api/anonymous", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: user.id,
          nickname: newUser.nickname,
          avatar: newUser.avatar,
        }),
      }).catch(() => {
        // Bỏ qua lỗi database
      });
    }
  };
  const updateNickname = (nickname: string) => {
    if (user) {
      const updatedUser = { ...user, nickname };
      setUser(updatedUser);
      saveAnonymousUser(updatedUser);
    }
  };

  const value = {
    user,
    isLoading,
    regenerateNickname,
    updateNickname,
  };

  return (
    <AnonymousUserContext.Provider value={value}>
      {children}
    </AnonymousUserContext.Provider>
  );
}

export function useAnonymousUser() {
  const context = useContext(AnonymousUserContext);
  if (context === undefined) {
    throw new Error(
      "useAnonymousUser must be used within an AnonymousUserProvider"
    );
  }
  return context;
}
