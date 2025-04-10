import Link from 'next/link'

export default function Home() {
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
                  <Link href="/profile/new" className="btn btn-dark">
                    Създай нов имейл
                  </Link>
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
                  <Link href="/profile" className="btn btn-dark">
                    Виж таблото
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-muted">
              Не сте влезли? <Link href="/login" className="text-decoration-none">Вход</Link> или <Link href="/signup" className="text-decoration-none">Регистрация</Link>, за да започнете.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
