"use client";


import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Mocking a JWT Auth login
        setTimeout(() => {
            localStorage.setItem("geowealth_token", "mock_jwt_token_123");
            router.push('/dashboard');
        }, 1000);
    }

    return (
        <div className="min-h-[calc(100vh-73px)] flex items-center justify-center p-6 relative overflow-hidden bg-background">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
            
            <div 
                className="w-full max-w-md p-8 rounded-2xl glass border border-white/10 shadow-2xl relative z-10 animate-in zoom-in-95 duration-500"
            >
                <div className="text-center mb-8">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-black font-bold mx-auto mb-4 text-xl">W</div>
                    <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
                    <p className="text-sm text-muted-foreground mt-1">Authenticate to access the intelligence dashboard.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="text-xs text-muted-foreground mb-1 block">Institutional Email</label>
                        <input id="email" name="email" type="email" required placeholder="analyst@agency.gov" className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-primary transition-colors" />
                    </div>
                    <div>
                        <label htmlFor="password" className="text-xs text-muted-foreground mb-1 block">Password</label>
                        <input id="password" name="password" type="password" required placeholder="••••••••" className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-primary transition-colors" />
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-primary text-black font-bold py-3 rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-70 flex justify-center items-center"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                        ) : 'Sign In Engine'}
                    </button>
                </form>
            </div>
        </div>
    );
}
