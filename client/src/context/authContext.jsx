import { createContext, useContext, useState } from "react";

export const AuthContext = createContext();

export const useAuthContext = () =>{
    return useContext(AuthContext);
}

export const AuthContextProvider = ({ children }) => {
    // State for keeping track of user's auth status.
    const [isAuth, setIsAuth] = useState(JSON.parse(localStorage.getItem('authUser')) || null);

    return <AuthContext.Provider value={{isAuth,setIsAuth}}>{children}</AuthContext.Provider>
}

