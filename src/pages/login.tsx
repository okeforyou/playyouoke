import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuthStore } from '../features/auth/useAuthStore';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const { user, signInWithGoogle, signIn, signUp, error, isLoading } = useAuthStore();

    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [localError, setLocalError] = useState('');

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            router.push('/');
        }
    }, [user, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError('');

        try {
            if (isLogin) {
                await signIn(email, password);
            } else {
                await signUp(email, password);
            }
        } catch (err: any) {
            setLocalError(err.message || 'Authentication failed');
        }
    };

    const handleGoogleLogin = async () => {
        setLocalError('');
        try {
            await signInWithGoogle();
        } catch (err: any) {
            setLocalError(err.message || 'Google sign-in failed');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-br from-red-50 to-orange-50">
            <Head>
                <title>Login - YouOke</title>
            </Head>

            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg shadow-primary/30">
                    Y
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                    {isLogin ? 'Welcome back' : 'Create an account'}
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                    {isLogin ? 'Sign in to access your playlists' : 'Join YouOke today'}
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-lg sm:px-10 border border-gray-100">

                    {/* Google Login Button */}
                    <div>
                        <button
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                            className="w-full flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50"
                        >
                            {isLoading ? (
                                <span className="loading loading-spinner loading-sm"></span>
                            ) : (
                                <>
                                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                        <path
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            fill="#4285F4"
                                        />
                                        <path
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            fill="#34A853"
                                        />
                                        <path
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            fill="#FBBC05"
                                        />
                                        <path
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            fill="#EA4335"
                                        />
                                    </svg>
                                    Continue with Google
                                </>
                            )}
                        </button>
                    </div>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Or continue with email</span>
                            </div>
                        </div>

                        <form className="space-y-6 mt-6" onSubmit={handleSubmit}>
                            {/* Generic Error */}
                            {(error || localError) && (
                                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                                    <div className="flex">
                                        <div className="ml-3">
                                            <p className="text-sm text-red-700">
                                                {localError || error}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email address
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-lg text-sm font-medium text-white bg-primary hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-all"
                                >
                                    {isLoading ? 'Processing...' : (isLogin ? 'Sign in' : 'Create account')}
                                </button>
                            </div>
                        </form>

                        <div className="mt-6">
                            <div className="relative flex justify-center text-sm">
                                <button
                                    onClick={() => {
                                        setIsLogin(!isLogin);
                                        setLocalError('');
                                    }}
                                    className="font-medium text-primary hover:text-red-500 bg-white px-2 cursor-pointer transition-colors"
                                >
                                    {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center text-sm">
                    <Link href="/" className="text-gray-500 hover:text-gray-900 font-medium">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
