import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useSignUp from '../hooks/useSignUp';

export default function SignUpComponent() {
    const { signUp } = useSignUp();
    const [data, setData] = useState({
        Companyname: '',
        GST_No: '',
        PAN_No: '',
        ContactPersonName: '',
        MobileNo: '',
        Password: '',
        City: '',
    });

    const cityOption = ["Surat", "Kolkata", "Bangladesh"];

    const handleSignUp = async (e) => {
        e.preventDefault();
        await signUp(data);
    };

    return (
        <div className='flex justify-center items-center min-h-screen md:bg-gray-100'>
            <form onSubmit={handleSignUp} className="max-w-md mx-auto my-10 p-8 bg-white rounded-lg md:shadow-md">
                <h2 className="text-3xl font-bold mb-8 text-center">Register</h2>

                <input
                    type="text"
                    name="companyName"
                    className="h-12 p-4 mb-4 w-full border rounded-lg"
                    placeholder="Company Name *"
                    value={data.Companyname}
                    onChange={(e) => setData({ ...data, Companyname: e.target.value })}
                    required
                />

                <input
                    type="text"
                    name="gstNo"
                    className="h-12 p-4 mb-4 w-full border rounded-lg"
                    placeholder="GST No. (Optional)"
                    value={data.GST_No}
                    onChange={(e) => setData({ ...data, GST_No: e.target.value })}
                />

                <input
                    type="text"
                    name="panNo"
                    className="h-12 p-4 mb-4 w-full border rounded-lg"
                    placeholder="PAN No. (Optional)"
                    value={data.PAN_No}
                    onChange={(e) => setData({ ...data, PAN_No: e.target.value })}
                />

                <input
                    type="text"
                    name="contactPersonName"
                    className="h-12 p-4 mb-4 w-full border rounded-lg"
                    placeholder="Contact Person Name *"
                    value={data.ContactPersonName}
                    onChange={(e) => setData({ ...data, ContactPersonName: e.target.value })}
                    required
                />

                <div className='flex justify-between'>

                    {/* <input type="text" name='city' value={data.City} onChange={(e) => setData({ ...data, City: e.target.value })} className='h-12 p-4 mb-4 w-[35%] border rounded-lg' placeholder='City *' /> */}
                    <select name='city' value={data.City} id="city" className='h-12 px-4 mb-4 w-full border rounded-lg' onChange={(e) => setData({ ...data, City: e.target.value })} required>
                        <option value="">City *</option>
                        {cityOption.map((i, a) => {
                            return <option value={i}>{i}</option>
                        })}
                    </select>
                </div>

                <input
                    type="text"
                    name="mobileOrCustomerId"
                    className="h-12 p-4 mb-4 w-full border rounded-lg"
                    placeholder="Mobile No. / Customer ID *"
                    value={data.MobileNo}
                    onChange={(e) => setData({ ...data, MobileNo: e.target.value })}
                    required
                />

                <input
                    type="password"
                    name="password"
                    className="h-12 p-4 mb-4 w-full border rounded-lg"
                    placeholder="Password *"
                    value={data.Password}
                    onChange={(e) => setData({ ...data, Password: e.target.value })}
                    required
                />

                <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                >
                    Register
                </button>

                <p className="mt-4 text-center">
                    Already a user? <Link to="/" className="text-blue-500 hover:underline">Sign In</Link>
                </p>
            </form>
        </div>
    );
}
