import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import logoPng from '../assets/favicon.png';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    if (e.target.name in formData.address) {
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [e.target.name]: e.target.value
        }
      });
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await register(formData);

    if (result.success) {
      toast.success("Registration successful Done");
      navigate('/dashboard');

    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (

    <>
      <div className="bg-[#ecf0f5] ">
        <div className="flex min-h-[100vh] flex-col justify-center py-8 sm:px-6 lg:px-8">
          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="px-2 py-8 bg-white shadow-lg sm:rounded-lg sm:px-10">
              <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <img src={logoPng} alt="Your Company"
                  className="w-auto h-10 mx-auto" />
                <h2 className="mb-4 font-bold tracking-tight text-center text-gray-900 text-2xl/9">Create your account</h2>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                {error && (
                  <div className="px-4 py-3 text-red-700 bg-red-100 border border-red-400 rounded">
                    {error}
                  </div>
                )}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Username</label>
                  <div className="mt-1">
                    <input type="text" name='name' id='name' placeholder='Your Username' required
                      value={formData.name} onChange={handleChange}
                      className='block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm' />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                  <div className="mt-1">
                    <input type="email" name='email' id='email' placeholder='Email address' required
                      value={formData.email} onChange={handleChange}
                      className='block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm' />
                  </div>
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                  <div className="mt-1">
                    <input type="password" name='password' id='password' placeholder='Password' required
                      value={formData.password} onChange={handleChange}
                      className='block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm' />
                  </div>
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                  <div className="mt-1">
                    <input type="tel" name='phone' id='phone' placeholder='Your Phone' required
                      value={formData.phone} onChange={handleChange}
                      className='block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm' />
                  </div>
                </div>
                <div>
                  <label htmlFor="street" className="block text-sm font-medium text-gray-700">Address</label>
                  <div className="mt-1">
                    <input type="text" name='street' id='street' placeholder='Your street Address' required
                      value={formData.address.street} onChange={handleChange}
                      className='block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm' />
                  </div>
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                  <div className="mt-1">
                    <input type="text" name='city' id='city' placeholder='Your city' required
                      value={formData.address.city} onChange={handleChange}
                      className='block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm' />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
                    <div className="mt-1">
                      <input type="text" name='state' id='state' placeholder='Your state' required
                        value={formData.address.state} onChange={handleChange}
                        className='block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm' />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">ZipCode</label>
                    <div className="mt-1">
                      <input type="text" name='zipCode' id='zipCode' placeholder='ZipCode' required
                        value={formData.address.zipCode} onChange={handleChange}
                        className='block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm' />
                    </div>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md group hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {loading ? 'Creating Account...' : 'Sign up'}
                  </button>
                </div>
              </form>
              <div className="m-auto mt-6 w-fit md:mt-8">
                <span className="m-auto"> Already have an account?
                  <Link className="font-semibold text-indigo-600" to="/login"> Sign in</Link>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gray-50 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-center text-gray-900">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="px-4 py-3 text-red-700 bg-red-100 border border-red-400 rounded">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <input
              name="name"
              type="text"
              required
              className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Full Name"
              value={formData.name} onChange={handleChange}
            />
            <input
              name="email"
              type="email"
              required
              className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Email address"
              value={formData.email} onChange={handleChange}
            />
            <input
              name="password"
              type="password"
              required
              className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Password"
              value={formData.password}  onChange={handleChange}
            />
            <input
              name="phone"
              type="tel"
              required
              className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Phone Number"
              value={formData.phone} onChange={handleChange}
            />
            <input
              name="street"
              type="text"
              className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Street Address"
              value={formData.address.street} onChange={handleChange}
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                name="city"
                type="text"
                className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="City"
                value={formData.address.city} onChange={handleChange}
              />
              <input
                name="state"
                type="text"
                className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="State"
                value={formData.address.state} onChange={handleChange}
              />
            </div>
            <input
              name="zipCode"
              type="text"
              className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="ZIP Code"
              value={formData.address.zipCode} onChange={handleChange}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md group hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Sign up'}
            </button>
          </div>

          <div className="text-center">
            <Link to="/login" className="text-indigo-600 hover:text-indigo-500">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div> */}
    </>
  );
}

export default Register;