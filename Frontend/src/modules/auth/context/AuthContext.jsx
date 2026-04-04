import { createContext, useContext, useState } from "react";
import { loginAPI } from "../services/auth.service";
import { setTokens } from "../../admin/services/authStorage";


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

 
const login = async (identifier, password) => {
  try {
    const data = await loginAPI(identifier, password);

    console.log("🔥 FULL LOGIN DATA:", data);

    const accessToken = data?.data?.tokens?.accessToken;
    const refreshToken = data?.data?.tokens?.refreshToken;

    console.log("🔥 EXTRACTED ACCESS TOKEN:", accessToken);

    if (!accessToken) {
      throw new Error("Token not received from backend");
    }

    // ✅ Store using unified system
    setTokens({
      accessToken,
      refreshToken,
    });

    console.log("🔥 SAVED TOKEN:", localStorage.getItem("accessToken"));

    setUser(data?.data?.user || null);

    return { success: true };
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return { success: false, message: err.message };
  }
};

  const logout = () => {
    localStorage.removeItem("accessToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};