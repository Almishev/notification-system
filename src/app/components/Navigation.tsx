'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useState, useEffect } from 'react';

// Стил за навигацията с градиент
const navStyle = {
    background: 'linear-gradient(135deg, #2b2b2b 0%, #000000 100%);'
};

const Navigation = () => {
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [user, setUser] = useState<{ email: string; username: string; isAdmin: boolean } | null>(null);

    useEffect(() => {
        checkAuth();
        console.log('Current pathname:', pathname); 
    }, [pathname]);

    const checkAuth = async () => {
        try {
            const response = await axios.get('/api/users/me');
            const userData = response.data.data;
            setUser(userData);
            setIsLoggedIn(true);
            setIsAdmin(userData.isAdmin);
        } catch (error) {
            setIsLoggedIn(false);
            setIsAdmin(false);
            setUser(null);
        }
    };

    const isActive = (path: string) => {
        if (path === '/profile' && pathname === '/profile') {
            return true;
        }
        if (path === '/profile/new' && pathname.startsWith('/profile/')) {
            return pathname !== '/profile';
        }
        if (path === '/admin' && pathname.startsWith('/admin')) {
            return true;
        }
        return false;
    };

    const logout = async () => {
        try {
            setLoading(true);
            await axios.get('/api/users/logout');
            toast.success('Logout successful');
            setIsLoggedIn(false);
            setIsAdmin(false);
            setUser(null);
            await router.push('/login');
        } catch (error: any) {
            console.error("Logout failed:", error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark" style={navStyle}>
            <div className="container">
                
                <Link href="/" className="navbar-brand d-flex align-items-center gap-2">
    <Image 
        src="/logo-messages-removebg-preview.png" 
        alt="Logo messages" 
        width={40} 
        height={40} 
        priority
    />
    <span className="text-light fw-bold">ИЗВЕСТИЕ</span>
</Link>

                <button 
                    className="navbar-toggler" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#navbarNav"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto">
                        <li className="nav-item">
                            <Link 
                                href="/" 
                                className={`nav-link ${pathname === '/' ? 'active fw-bold border-bottom border-2 border-light' : ''}`}
                            >
                                Начало
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link 
                                href="/posts" 
                                className={`nav-link ${pathname === '/posts' ? 'active fw-bold border-bottom border-2 border-light' : ''}`}
                            >
                                Блог
                            </Link>
                        </li>
                    </ul>
                    {isLoggedIn ? (
                        <>
                            <ul className="navbar-nav me-auto">
                                {isAdmin && (
                                    <li className="nav-item">
                                        <Link 
                                            href="/admin" 
                                            className={`nav-link ${isActive('/admin') ? 'active fw-bold border-bottom border-2 border-light' : ''}`}
                                        >
                                            Админ панел
                                        </Link>
                                    </li>
                                )}
                                <li className="nav-item">
                                    <Link 
                                        href="/profile" 
                                        className={`nav-link ${isActive('/profile') ? 'active fw-bold border-bottom border-2 border-light' : ''}`}
                                    >
                                        Профил
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link 
                                        href="/profile/new" 
                                        className={`nav-link ${isActive('/profile/new') ? 'active fw-bold border-bottom border-2 border-light' : ''}`}
                                    >
                                        Ново съобщение
                                    </Link>
                                </li>
                            </ul>
                            <div className="d-flex align-items-center">

                               {/*
                                {user && (
                                    <span className="text-light me-3">
                                       Задравей, {isAdmin ? '👑 ' : ''}{user.username}
                                    </span>
                                )}
                                */}
                                <button 
                                    onClick={logout}
                                    disabled={loading}
                                    className="btn btn-outline-light"
                                >
                                    {loading && (
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    )}
                                    {loading ? 'Излизане...' : 'Изход'}
                                </button>
                            </div>
                        </>
                    ) : (
                        <ul className="navbar-nav ms-auto">
                            <li className="nav-item">
                                <Link 
                                    href="/login" 
                                    className={`nav-link ${pathname === '/login' ? 'active' : ''}`}
                                >
                                    Вход
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link 
                                    href="/signup" 
                                    className={`nav-link ${pathname === '/signup' ? 'active' : ''}`}
                                >
                                    Регистрация
                                </Link>
                            </li>
                        </ul>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navigation;