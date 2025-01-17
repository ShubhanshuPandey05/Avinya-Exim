import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useLogin from '../hooks/useLogin';

export default function LoginComponent() {
    const { login } = useLogin();
    const [data, setData] = useState({
        MobileNo: '',
        Password: ''
    });

    const handleSignIn = async (e) => {
        e.preventDefault();
        await login(data);
    };

    return (
        <div className='flex justify-center items-center min-h-screen md:bg-gray-100'>
            <form onSubmit={handleSignIn} className="max-w-md mx-auto my-10 p-8 bg-white rounded-lg md:shadow-md">
                <h2 className="text-3xl font-bold mb-8 text-center">Login</h2>

                <input
                    type="text"
                    name="mobileNo"
                    className="h-12 p-4 mb-4 w-full border rounded-lg"
                    placeholder="Mobile No."
                    value={data.MobileNo}
                    onChange={(e) => setData({ ...data, MobileNo: e.target.value })}
                    required
                />

                <input
                    type="password"
                    name="password"
                    className="h-12 p-4 mb-6 w-full border rounded-lg"
                    placeholder="Password"
                    value={data.Password}
                    onChange={(e) => setData({ ...data, Password: e.target.value })}
                    required
                />

                <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                >
                    Sign In
                </button>

                <p className="mt-4 text-center">
                    Not a User? <Link to="/SignUp" className="text-blue-500 hover:underline">Sign Up</Link>
                </p>
            </form>
        </div>
    );
}
