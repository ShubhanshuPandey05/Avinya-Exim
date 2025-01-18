import toast from "react-hot-toast";
import { useAuthContext } from "../context/authContext";
import { useNavigate } from "react-router-dom";

const useLogOut = () => {
  const navigate = useNavigate();
  const { setIsAuth } = useAuthContext();

  const logOut = async () => {
    localStorage.removeItem('authUser');
    setIsAuth(false);
    toast.success("LogOut Successfully");
    navigate('/login');
  };

  return { logOut };
};

export default useLogOut;
