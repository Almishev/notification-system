import Link from 'next/link'

export default function Home() {
  return (
    <main className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 text-center">
          <h1 className="display-4 mb-4">Welcome to Email Reminder System</h1>
          <p className="lead mb-4">
            Schedule and manage your email notifications efficiently
          </p>
          
          <div className="row g-4 py-4">
            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-body">
                  <h3 className="card-title">Schedule Emails</h3>
                  <p className="card-text">
                    Create and schedule emails to be sent at specific dates and times.
                  </p>
                  <Link href="/profile/new" className="btn btn-primary">
                    Create New Email
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-body">
                  <h3 className="card-title">Manage Schedule</h3>
                  <p className="card-text">
                    View and manage your scheduled emails in one place.
                  </p>
                  <Link href="/profile" className="btn btn-primary">
                    View Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-muted">
              Not logged in? <Link href="/login" className="text-decoration-none">Login</Link> or <Link href="/signup" className="text-decoration-none">Sign up</Link> to get started.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
