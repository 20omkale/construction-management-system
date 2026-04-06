// src/modules/auth/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { sendOtpAPI } from '../services/auth.service';
import { useAuth } from '../../../app/providers/AuthProvider'; 

const Login = () => {
    const navigate = useNavigate();
    const { login, loginWithOTP } = useAuth(); 
    
    const [loginMethod, setLoginMethod] = useState('password'); 
    const [showPassword, setShowPassword] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isOtpSent, setIsOtpSent] = useState(false);
    
    // Hardcoded credentials removed for production
    const [identifier, setIdentifier] = useState(''); 
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        setError('');
        setSuccessMessage('');

        if (!identifier.trim()) {
            setError("Phone number or Email is required");
            return;
        }

        setIsSubmitting(true);

        try {
            if (loginMethod === 'password') {
                if (!password) {
                    setError("Password is required");
                    setIsSubmitting(false);
                    return;
                }
                
                const result = await login(identifier, password);
                
                if (result.success) {
                    const storedUserStr = localStorage.getItem('user');
                    let storedRole = null;
                    if (storedUserStr) {
                        try { storedRole = JSON.parse(storedUserStr).userType; } catch(e){}
                    }

                    const userRole = result.user?.userType || result.data?.user?.userType || result.userType || storedRole;
                    
                    switch (userRole) {
                        case 'SUPER_ADMIN':
                            navigate('/superadmin/dashboard');
                            break;
                        case 'COMPANY_ADMIN':
                        case 'ADMIN':
                            navigate('/admin/dashboard');
                            break;
                        case 'EMPLOYEE':
                            navigate('/projects');
                            break;
                        default:
                            navigate('/projects');
                    }
                } else {
                    setError(result.message || "Invalid credentials");
                }
            } else {
                if (!isOtpSent) {
                    const result = await sendOtpAPI(identifier);
                    if (result.success) {
                        setSuccessMessage(result.message || 'OTP sent successfully!');
                        setIsOtpSent(true);
                    } else {
                        setError(result.message || "Failed to send OTP.");
                    }
                } else {
                    if (!otp.trim()) {
                        setError("Please enter the 6-digit OTP");
                        setIsSubmitting(false);
                        return;
                    }
                    
                    const result = await loginWithOTP(identifier, otp);
                    if (result.success) {
                        const storedUserStr = localStorage.getItem('user');
                        let storedRole = null;
                        if (storedUserStr) {
                            try { storedRole = JSON.parse(storedUserStr).userType; } catch(e){}
                        }

                        const userRole = result.user?.userType || result.data?.user?.userType || result.userType || storedRole;
                        
                        switch (userRole) {
                            case 'SUPER_ADMIN':
                                navigate('/superadmin/dashboard');
                                break;
                            case 'COMPANY_ADMIN':
                            case 'ADMIN':
                                navigate('/admin/dashboard');
                                break;
                            case 'EMPLOYEE':
                                navigate('/projects');
                                break;
                            default:
                                navigate('/projects');
                        }
                    } else {
                        setError(result.message || "Incorrect OTP! Please try again.");
                    }
                }
            }
        } catch (err) {
            setError(err.message || "Network Error. Is the backend running?");
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleMethod = () => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setTimeout(() => {
            setLoginMethod(prev => prev === 'password' ? 'otp' : 'password');
            setError('');
            setSuccessMessage('');
            setOtp('');
            setIsOtpSent(false);
            setShowPassword(false);
            setTimeout(() => setIsTransitioning(false), 50);
        }, 200);
    };

    return (
        <div className="relative flex w-full h-screen overflow-hidden bg-white md:bg-transparent select-none font-sans">
            <div 
                className="absolute inset-0 hidden md:block bg-center bg-cover bg-no-repeat transition-opacity duration-1000"
                style={{ 
                    backgroundImage: "url('/login-bg.jpg')", 
                    backgroundColor: '#0B192C' 
                }}
            ></div>
            <div className="absolute inset-0 hidden md:block bg-black/40"></div>

            <div className="relative z-10 flex w-full h-full">
                <div className="hidden md:flex flex-col justify-end flex-1 p-12 lg:p-20 pb-16 lg:pb-32">
                    <h1 className="text-white text-[42px] lg:text-[52px] font-bold leading-[1.2] drop-shadow-lg tracking-tight">
                        Manage Sites.<br />
                        Track Progress.<br />
                        Finish Strong.
                    </h1>
                </div>

                <div className="flex items-center justify-center w-full md:w-auto md:pr-12 lg:pr-24">
                    <div className="flex flex-col w-full h-full md:h-auto md:w-[440px] lg:w-[480px] bg-white px-8 sm:px-14 py-12 md:py-16 md:rounded-[2.5rem] md:shadow-2xl overflow-y-auto">
                        
                        <div className="flex items-center gap-3 mb-10">
                            <div className="w-9 h-11 bg-[#0066CC] flex items-end justify-center pb-1.5 relative overflow-hidden rounded-sm">
                                <div className="absolute bottom-0 left-1 w-1.5 h-6 bg-white opacity-80"></div>
                                <div className="absolute bottom-0 left-3.5 w-2 h-9 bg-white"></div>
                                <div className="absolute bottom-0 right-1 w-1.5 h-4 bg-white opacity-60"></div>
                                <div className="absolute top-1 left-0 w-full h-1 bg-white opacity-90"></div>
                            </div>
                            <span className="text-[28px] font-bold text-[#0066CC] tracking-tight">SampleWeb</span>
                        </div>

                        <div className="mb-8">
                            <h2 className="text-[26px] font-bold text-gray-900 tracking-tight mb-1">Welcome back!</h2>
                            <p className="text-[14px] font-medium text-gray-400">Please sign in here</p>
                        </div>

                        <form onSubmit={handleSubmit} noValidate className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[13px] font-medium text-gray-900">Phone Number/ Email</label>
                                <input 
                                    type="text"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    placeholder="Enter phone number/Email"
                                    className={`w-full px-4 py-3 rounded-xl border text-[14px] focus:outline-none transition-all ${error && !identifier ? 'border-red-500 focus:border-red-500' : 'border-[#8AB4F8] focus:border-[#0066CC]'}`}
                                />
                            </div>

                            <div className={`transition-all duration-300 transform ${isTransitioning ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'}`}>
                                {loginMethod === 'password' ? (
                                    <div className="space-y-1.5">
                                        <label className="text-[13px] font-medium text-gray-900">Password</label>
                                        <div className={`relative flex items-center border rounded-xl transition-all ${error && error.includes('Password') ? 'border-red-500 focus-within:border-red-500' : 'border-[#8AB4F8] focus-within:border-[#0066CC]'}`}>
                                            <input 
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Enter password"
                                                className="w-full px-4 py-3 text-[14px] rounded-xl focus:outline-none bg-transparent"
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => setShowPassword(!showPassword)} 
                                                className="absolute right-4 text-[#8AB4F8] hover:text-[#0066CC] cursor-pointer transition-colors"
                                            >
                                                {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-1.5 min-h-[75px]">
                                        {isOtpSent ? (
                                            <>
                                                <label className="text-[13px] font-medium text-gray-900">Enter OTP</label>
                                                <input 
                                                    type="text"
                                                    value={otp}
                                                    onChange={(e) => setOtp(e.target.value)}
                                                    placeholder="Enter 6-digit OTP"
                                                    className="w-full px-4 py-3 rounded-xl border border-[#8AB4F8] focus:border-[#0066CC] text-[14px] focus:outline-none transition-all"
                                                    autoFocus
                                                />
                                            </>
                                        ) : (
                                            <div className="pt-2 text-center">
                                                <p className="text-[13px] font-medium text-gray-500">
                                                    An OTP will be sent to your device.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="pt-3">
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className={`w-full py-3.5 text-white text-[15px] font-medium rounded-xl transition-all shadow-sm active:scale-[0.99] 
                                        ${isSubmitting ? 'bg-[#0066CC]/70 cursor-not-allowed' : 'bg-[#0066CC] hover:bg-[#0052a3] cursor-pointer hover:shadow-md'}`}
                                >
                                    {isSubmitting ? 'Processing...' : (loginMethod === 'password' ? 'Login' : (isOtpSent ? 'Verify & Login' : 'Send OTP'))}
                                </button>
                            </div>

                            <div className="min-h-[24px] flex items-center justify-center pt-1">
                                {error && <p className="text-[12px] font-bold text-center text-red-600">{error}</p>}
                                {successMessage && <p className="text-[12px] font-bold text-center text-emerald-600">{successMessage}</p>}
                            </div>
                            
                            <div className="text-center pt-1">
                                <button 
                                    type="button" 
                                    onClick={toggleMethod}
                                    className="text-[13px] font-medium text-[#0066CC] hover:underline cursor-pointer"
                                >
                                    {loginMethod === 'password' ? 'Log in with OTP' : 'Log in with password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;