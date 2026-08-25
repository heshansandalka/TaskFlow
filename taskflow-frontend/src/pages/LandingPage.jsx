import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-ink-900 text-mist-100">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b-0 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient shadow-glow-brand">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-body text-xl font-bold tracking-tight text-white">TaskFlow</span>
          </div>

          <div className="flex items-center gap-4">
            {user && !loading ? (
              <Link to="/dashboard" className="btn-primary py-2 text-sm">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-ghost py-2 text-sm hover:text-white">
                  Login
                </Link>
                <Link to="/register" className="btn-primary py-2 text-sm shadow-none">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 pt-16 text-center">
        <div className="relative mx-auto max-w-4xl">
          {/* Subtle background glow effect */}
          <div className="absolute left-1/2 top-1/2 -z-10 h-64 w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/20 blur-[100px]" />

          <h1 className="font-body text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
            The project management tool you won’t{" "}
            <span className="bg-gradient-to-r from-brand-400 to-accent-violet bg-clip-text text-transparent">
              outgrow
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-mist-100/70 sm:text-xl">
            Plan, track, and manage any project in one flexible workspace. Tasks, docs, timelines, and AI that already understands your work, all built in from day one.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {user && !loading ? (
              <button
                onClick={() => navigate("/dashboard")}
                className="btn-primary px-8 py-4 text-lg"
              >
                Go to Dashboard <span aria-hidden="true">→</span>
              </button>
            ) : (
              <button
                onClick={() => navigate("/register")}
                className="btn-primary px-8 py-4 text-lg shadow-[0_0_40px_rgba(99,102,241,0.4)]"
              >
                Get Started. It's FREE <span aria-hidden="true">→</span>
              </button>
            )}
          </div>
          
          <div className="mt-8 flex items-center justify-center gap-2 text-sm font-medium text-mist-100/50">
             Free Forever. No Credit Card.
          </div>
        </div>
      </main>
      
      {/* Footer minimal */}
      <footer className="py-6 text-center text-sm text-mist-100/30">
        &copy; {new Date().getFullYear()} TaskFlow. All rights reserved.
      </footer>
    </div>
  );
}
