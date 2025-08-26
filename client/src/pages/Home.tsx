import { useAppContext } from "@/context/AppContext";

const Home = () => {
  const { isAuthenticated, user } = useAppContext();

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1 flex-col justify-center items-center px-4 py-20 text-white">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-center">
          Secure Fullstack Auth <br />{" "}
          <span className="text-blue-200">JWT & Session Roles Demo</span>
        </h1>
        <p className="text-lg sm:text-xl max-w-xl mb-8 text-center">
          Experience modern, robust authentication in a production-ready stack.
          <br />
          <span className="text-blue-100">
            JWT, Session Auth, Role-based Access—all showcased with a simple UI.
          </span>
        </p>
        {isAuthenticated ? (
          <h2 className="text-2xl font-semibold">
            Welcome back, {user?.username}! 👋
          </h2>
        ) : (
          <div className="flex gap-4">
            <a
              href="/auth/login"
              className="px-6 py-2 rounded bg-white text-blue-700 font-semibold shadow hover:bg-blue-50 transition"
            >
              Login
            </a>
            <a
              href="/auth/register"
              className="px-6 py-2 rounded bg-blue-800 font-semibold shadow hover:bg-blue-900 transition"
            >
              Sign Up
            </a>
          </div>
        )}
      </div>

      <section className="flex flex-col items-center py-12">
        <h2 className="font-bold text-2xl mb-4 text-blue-200">Features</h2>
        <ul className="flex flex-wrap justify-center gap-6 text-slate-200">
          <li>🔑 JWT Authentication</li>
          <li>🟠 Session-based Auth</li>
          <li>🛡️ Role-based Access Control</li>
          <li>🎯 Admin Dashboard</li>
        </ul>
      </section>

      <footer className="py-4 text-center text-gray-300 text-sm border-t mt-auto">
        © {new Date().getFullYear()} Mano Satpathy - Fullstack Authentication.
      </footer>
    </div>
  );
};

export default Home;
