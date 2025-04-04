import { createContext, useState } from "react";

export const AuthContext = createContext(null); // ✅ Ensure the context is created properly

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  return (
    <AuthContext.Provider value={{ user, setUser }}> {/* ✅ Provide context correctly */}
      {children}
    </AuthContext.Provider>
  );
};
