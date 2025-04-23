"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { FaEnvelope, FaClock, FaUsers, FaTable, FaBell, FaArrowDown } from 'react-icons/fa';
import './home.css';

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
    <main>
      <div className="container py-5">
        {/* Главен банер */}
        <section className="home-banner text-white mb-5">
          <div className="row align-items-center">
            <div className="col-lg-7 mb-4 mb-lg-0">
              <h1 className="display-4 fw-bold mb-3">Какво Ви дава PirinPixel</h1>
              <p className="fs-5 mb-4">
                PirinPixel е услуга от ново поколение, предлагаща Ви възможност за изпращане на имейл и SMS известия за бизнеса Ви. В случаите, когато трябва да изпратите кратки и точни съобщения до клиенти, партньори или служители, тези известия представляват ефективен, рентабилен и сигурен начин за комуникация.
              </p>
              <div className="d-flex flex-wrap gap-2">
                {isLoggedIn ? (
                  <button onClick={() => router.push('/profile')} className="btn btn-light btn-lg px-4">
                    Влезте в профила си
                  </button>
                ) : (
                  <>
                    <button onClick={() => router.push('/login')} className="btn btn-light btn-lg px-4">
                      Вход
                    </button>
                    <button onClick={() => router.push('/signup')} className="btn btn-outline-light btn-lg px-4">
                      Регистрация
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="col-lg-5">
              <div className="text-center">
                <Image 
                  src="/pirin-pixel-yellow.png" 
                  alt="система за изпращане на известия" 
                  className="img-fluid rounded shadow-lg" 
                  width={500} 
                  height={350} 
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Основни опции */}
        <section className="home-section py-5">
          <div className="text-center mb-5">
            <h2 className="fw-bold">Започнете веднага</h2>
            <p className="lead text-muted">Планирайте и управлявайте своите имейл известия ефективно</p>
          </div>
          
          <div className="row g-4">
            <div className="col-md-6">
              <div className="feature-card text-center">
                <div className="feature-icon bg-warning">
                  <FaEnvelope />
                </div>
                <h3 className="h4 mt-4 mb-3">Планирай имейли</h3>
                <p className="text-muted mb-4">
                  Създавайте и планирайте имейли, които да се изпращат на определени дати и часове.
                </p>
                <button 
                  onClick={() => handleRedirect('/profile/new')} 
                  className="btn btn-warning px-4 py-2"
                >
                  Създай нов имейл
                </button>
              </div>
            </div>
            
            <div className="col-md-6">
              <div className="feature-card text-center">
                <div className="feature-icon bg-success">
                  <FaTable />
                </div>
                <h3 className="h4 mt-4 mb-3">Моят профил</h3>
                <p className="text-muted mb-4">
                  Вижте и управлявайте всичките си планирани имейли на едно място от вашият профил.
                </p>
                <button 
                  onClick={() => handleRedirect('/profile')} 
                  className="btn btn-success px-4 py-2"
                >
                  Виж таблото
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Ключови функции */}
        <section className="home-section py-5 bg-light rounded-3 px-3">
          <div className="text-center mb-5">
            <h2 className="fw-bold">Ключови функции</h2>
            <p className="lead text-muted">
              Използвайте нашата надеждна услуга за бизнес известия, за да подобрите комуникацията с Вашите клиенти, както и вътрешните Ви бизнес операции.
            </p>
          </div>
          
          <div className="row g-4">
            <div className="col-lg-4 col-md-6">
              <div className="feature-card h-100">
                <div className="feature-icon bg-primary">
                  <FaBell />
                </div>
                <h4 className="mt-4 mb-3">Изпращайте известия онлайн</h4>
                <p className="text-muted">
                  Изпратете имейл и SMS съобщения онлайн до Вашите клиенти, контакти, екип и др. Добавете Вашите контакти чрез импортиране и управлявайте списъците си онлайн през Вашия акаунт в PirinPixel.
                </p>
              </div>
            </div>
            
            <div className="col-lg-4 col-md-6">
              <div className="feature-card h-100">
                <div className="feature-icon bg-info">
                  <FaClock />
                </div>
                <h4 className="mt-4 mb-3">Изпращане на известия по график</h4>
                <p className="text-muted">
                  PirinPixel предлага автоматизация на известията по график или настъпило събитие. Планирайте Вашите важни напомняния, сигнали или кампании с имейл или SMS, за да бъдат изпратени, когато е необходимо.
                </p>
              </div>
            </div>
            
            <div className="col-lg-4 col-md-6">
              <div className="feature-card h-100">
                <div className="feature-icon bg-danger">
                  <FaUsers />
                </div>
                <h4 className="mt-4 mb-3">Импортиране на списъци с контакти</h4>
                <p className="text-muted">
                  Създайте бързо и удобно Вашия списък с контакти, като качите данни от съществуващ файл Excel (CSV), копирате данните или с ръчно въвеждане в текстовите полета.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
