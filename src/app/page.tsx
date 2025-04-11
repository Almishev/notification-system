"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axios.get('/api/users/me');
        setIsLoggedIn(true);
      } catch {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

  const handleRedirect = (path: string) => {
    if (isLoggedIn) {
      router.push(path);
    } else {
      router.push('/login');
    }
  };

  return (
    <main className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 text-center">
          <h1 className="display-4 mb-4">Добре дошли в системата за имейл напомняния</h1>
          <p className="lead mb-4">
            Планирайте и управлявайте своите имейл известия ефективно
          </p>
          
          <div className="row g-4 py-4">
            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-body">
                  <h3 className="card-title">Планирай имейли</h3>
                  <p className="card-text">
                    Създавайте и планирайте имейли, които да се изпращат на определени дати и часове.
                  </p>
                  <button onClick={() => handleRedirect('/profile/new')} className="btn btn-dark">
                    Създай нов имейл
                  </button>
                </div>
              </div>
            </div>
            
            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-body">
                  <h3 className="card-title">Моят профил</h3>
                  <p className="card-text">
                    Вижте и управлявайте всичките си планирани имейли на едно място от вашият профил.
                  </p>
                  <button onClick={() => handleRedirect('/profile')} className="btn btn-dark">
                    Виж таблото
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-muted">
              Не сте влезли? <a href="/login" className="text-decoration-none">Вход</a> или <a href="/signup" className="text-decoration-none">Регистрация</a>, за да започнете.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
