import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { useDispatch } from 'react-redux';
import { setUser } from '../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';


const SLIDES = [
  {
    id: 1,
    image: '/project1.jpg',
    title: 'Manage Expenses,',
    subtitle: 'Save Money' 
  },
  {
    id: 2,
    image: '/project2.jpg',
    title: 'Capturing Moments,',
    subtitle: 'Creating Memories'
  },
  {
    id: 3,
    image: '/project3.jpg',
    title: 'Capturing Moments,',
    subtitle: 'Creating Memories'
  }
];

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting }, 
    reset 
  } = useForm({
    mode: 'onSubmit'
  });

  const onSubmit = async (data) => {
    setAuthError('');
    const { email, password, firstName, lastName } = data;
    const fullName = `${firstName} ${lastName}`.trim();

    try {
    let userCredential;
    
    if (isLogin) {
      userCredential = await signInWithEmailAndPassword(auth, email, password);
      toast.success(`Welcome back!`);
    } else {
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // 3. Save that combined name to Firebase
      if (fullName) {
        await updateProfile(userCredential.user, { displayName: fullName });
      }
      
      toast.success("Account created successfully!");
      }

      dispatch(setUser({
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: fullName // Use the name we just created
    }));
    
    navigate('/dashboard');

  } catch (err) {
      
      let message = "An error occurred.";
      
      if (err.code === 'auth/invalid-credential') message = "Invalid email or password.";
      if (err.code === 'auth/email-already-in-use') message = "This email is already registered.";
      if (err.code === 'auth/weak-password') message = "Password should be at least 6 characters.";
      if (err.code === 'auth/operation-not-allowed') message = "Email/Password login is not enabled in Firebase Console.";
      if (err.code === 'auth/network-request-failed') message = "Network error. Check your connection.";
      

      if (message === "An error occurred.") {
        message = err.message; 
      }

      setAuthError(message);
      toast.error(message);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      dispatch(setUser({
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName
      }));
      navigate('/dashboard');
    } catch (err) {
      let message = "Google sign-in failed.";
      if (err.code === 'auth/popup-closed-by-user') message = "Sign-in popup was closed.";
      if (err.code === 'auth/cancelled-popup-request') message = "Sign-in was cancelled.";
      setAuthError(message);
    }
  };

  const handleAppleSignIn = async () => {
    setAuthError('Apple sign-in is not configured yet.');
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setAuthError('');
    reset(); 
  };

  return (
    <div className="min-h-screen w-full flex bg-gray-900">
      <div className="hidden lg:flex w-1/2 relative bg-black-900 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-black-600/90 via-black-700/80 to-black-900/90 z-10"></div>
        
        <AnimatePresence mode='wait'>
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
          >
            <img
              src={SLIDES[currentSlide].image}
              className="w-full h-full object-cover opacity-30"
              alt="Background"
              onError={(e) => {e.target.style.display='none'}}
            />
          </motion.div>
        </AnimatePresence>

        <div className="absolute top-8 left-8 z-20">
          <div className="flex items-center gap-2">
            <div className="text-white text-2xl font-bold">Expense Tracker</div>
          </div>
        </div>

        <div className="absolute top-8 right-8 z-20">
          <button className="text-white text-sm flex items-center gap-2 hover:opacity-80 transition">
            Back to website
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="relative z-20 flex flex-col justify-end p-12 h-full">
          <motion.div
            key={SLIDES[currentSlide].title}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-5xl font-light text-white mb-2 leading-tight">
              {SLIDES[currentSlide].title}
            </h2>
            <h2 className="text-5xl font-light text-white mb-12 leading-tight">
              {SLIDES[currentSlide].subtitle}
            </h2>
          </motion.div>

          <div className="flex gap-2">
            {SLIDES.map((slide, index) => (
              <button
                key={slide.id}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentSlide === index ? 'w-12 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-900">
        <div className="w-full max-w-md">
          
          <div className="text-center mb-8">
            <h1 className="text-4xl font-light text-white mb-3">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h1>
            <p className="text-gray-400 text-sm">
              {isLogin ? 'Please enter your details' : (
                <>
                  Already have an account?{' '}
                  <button onClick={toggleAuthMode} type="button" className="text-purple-400 hover:text-purple-300 transition">
                    Log in
                  </button>
                </>
              )}
            </p>
          </div>

          {authError && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }}
              className="p-3 rounded-lg bg-red-500/10 text-red-400 text-sm border border-red-500/20 mb-6"
            >
              {authError}
            </motion.div>
          )}

          <div className="space-y-4">
            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex gap-3"
                >
                  <div className="flex-1">
                    <input
                      {...register("firstName", { 
                        required: !isLogin ? "First name is required" : false 
                      })}
                      type="text"
                      placeholder="First Name"
                      className={`w-full p-3 rounded-lg bg-gray-800 border ${
                        errors.firstName ? 'border-red-500' : 'border-gray-700'
                      } text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition outline-none`}
                    />
                    {errors.firstName && (
                      <p className="text-red-400 text-xs mt-1">{errors.firstName.message}</p>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <input
                      {...register("lastName", { 
                        required: !isLogin ? "Last name is required" : false 
                      })}
                      type="text"
                      placeholder="Last name"
                      className={`w-full p-3 rounded-lg bg-gray-800 border ${
                        errors.lastName ? 'border-red-500' : 'border-gray-700'
                      } text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition outline-none`}
                    />
                    {errors.lastName && (
                      <p className="text-red-400 text-xs mt-1">{errors.lastName.message}</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <input
                {...register("email", { 
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
                type="email"
                placeholder="Email"
                className={`w-full p-3 rounded-lg bg-gray-800 border ${
                  errors.email ? 'border-red-500' : 'border-gray-700'
                } text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition outline-none`}
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="relative">
                <input
                  {...register("password", { 
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters"
                    }
                  })}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className={`w-full p-3 pr-10 rounded-lg bg-gray-800 border ${
                    errors.password ? 'border-red-500' : 'border-gray-700'
                  } text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition outline-none`}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="flex items-start gap-2">
                    <input
                      {...register("agreeTerms", {
                        required: !isLogin ? "You must agree to the Terms & Conditions" : false
                      })}
                      type="checkbox"
                      className={`w-4 h-4 mt-0.5 rounded bg-gray-800 border ${
                        errors.agreeTerms ? 'border-red-500' : 'border-gray-700'
                      } text-purple-600 focus:ring-purple-500 focus:ring-offset-gray-900`}
                    />
                    <label className="text-sm text-gray-400">
                      I agree to the{' '}
                      <a href="#" className="text-purple-400 hover:text-purple-300">
                        Terms & Conditions
                      </a>
                    </label>
                  </div>
                  {errors.agreeTerms && (
                    <p className="text-red-400 text-xs mt-1">{errors.agreeTerms.message}</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              type="button"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-lg transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Processing...' : (isLogin ? 'Sign in' : 'Create account')}
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-gray-900 text-gray-500">Or register with</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={handleGoogleSignIn}
              type="button"
              className="flex-1 border border-gray-700 bg-gray-800 text-white font-medium py-3 rounded-lg hover:bg-gray-750 transition flex items-center justify-center gap-2"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
              Google
            </button>
            
            <button 
              onClick={handleAppleSignIn}
              type="button"
              className="flex-1 border border-gray-700 bg-gray-800 text-white font-medium py-3 rounded-lg hover:bg-gray-750 transition flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              Apple
            </button>
          </div>

          {isLogin && (
            <p className="text-center text-sm text-gray-400 mt-6">
              Don't have an account?{' '}
              <button onClick={toggleAuthMode} type="button" className="text-purple-400 hover:text-purple-300 transition">
                Sign up
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;