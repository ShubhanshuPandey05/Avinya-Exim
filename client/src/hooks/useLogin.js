import { useNavigate } from "react-router-dom"
import { useAuthContext } from "../context/authContext";
import toast from "react-hot-toast";
import { useLoading } from "../context/LoadingContext";
import Cookies from 'js-cookie';

const useLogin = () => {
    const navigator = useNavigate()
    const {setIsAuth} = useAuthContext();
    const { showLoading, hideLoading } = useLoading();

    const login = async (data) => {
        const SERVER_URL = import.meta.env.VITE_SERVERURL;

        const success = handleErrorInputs(data.MobileNo, data.Password);

        if (!success) return; 

        showLoading();

        // let response = await fetch("http://localhost:8000/api/auth/login/",{
        let response = await fetch(`${SERVER_URL}/api/auth/login/`,{
            method: "post",
            headers: {
                "Content-Type": "application/json",
              },
            credentials: 'include',
            body: JSON.stringify(data),
        })
        const result = await response.json()
        if(response.ok){
            localStorage.setItem('authUser', JSON.stringify(result.userData))
            Cookies.set('jwt', result.jwt, { expires: 999, secure: true, sameSite: 'strict' });
            setIsAuth(true)
            navigator("/")
            hideLoading();
            toast.success("Login Success");
        }else{
            hideLoading();
            toast.error(JSON.stringify(result));
        }
        hideLoading()
    }

    return {login};
}
function handleErrorInputs(MobileNo, Password) {
    if (!MobileNo || !Password) {
        toast.error('Please fill all fields');
        return false;
    }
    return true;
}

export default useLogin;