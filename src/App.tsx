import { NavLink, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage.tsx';
import CartPage from './features/cart/CartPage.tsx';
import { cn } from './lib/cn.ts';
import { questions } from './questions.ts';

function App() {
  return (
    <div className="min-h-screen bg-linear-to-b from-white to-surface">
      <header className="sticky top-0 z-20 border-b border-border bg-white/90 backdrop-blur">
        <div className="mx-auto grid max-w-7xl items-center gap-x-6 gap-y-3 px-6 py-4 lg:grid-cols-[1fr_auto_1fr]">
          <NavLink
            to="/"
            className="justify-self-start text-lg font-bold tracking-tight whitespace-nowrap text-ink"
          >
            FE Interview Prep
          </NavLink>
          <nav aria-label="Questions" className="flex flex-wrap justify-center gap-1">
            {questions.map((question) => (
              <NavLink
                key={question.path}
                to={question.path}
                className={({ isActive }) =>
                  cn(
                    'rounded-full px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-ink',
                    isActive && 'bg-accent/10 text-accent hover:bg-accent/10 hover:text-accent',
                  )
                }
              >
                {question.title}
              </NavLink>
            ))}
          </nav>
          <div aria-hidden="true" className="hidden lg:block" />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10 sm:py-12">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="*" element={<p>Page not found.</p>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
