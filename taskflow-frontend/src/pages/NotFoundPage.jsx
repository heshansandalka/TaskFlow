import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-aurora bg-fixed text-center">
      <p className="font-display text-6xl font-bold text-brand-400/40">404</p>
      <h1 className="font-display text-xl font-semibold">This page drifted off the board</h1>
      <Link to="/" className="btn-primary mt-2">
        Back to your boards
      </Link>
    </div>
  );
}
