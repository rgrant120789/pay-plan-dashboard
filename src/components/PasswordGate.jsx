import { useState } from 'react';

const CORRECT_PASSWORD = 'A1door123!';
const STORAGE_KEY = 'ppd_auth';

export default function PasswordGate({ children }) {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(STORAGE_KEY) === '1');
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  if (authed) return children;

  function handleSubmit(e) {
    e.preventDefault();
    if (input === CORRECT_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, '1');
      setAuthed(true);
    } else {
      setError(true);
      setInput('');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a1929' }}>
      <div className="rounded-2xl border p-10 w-full max-w-sm text-center" style={{ borderColor: 'rgba(141,198,63,0.25)', background: 'rgba(255,255,255,0.03)' }}>
        <p className="text-xs font-black tracking-widest uppercase mb-1" style={{ color: '#8dc63f' }}>Pay Plan Dashboard</p>
        <h1 className="text-2xl font-black text-white mb-6">Enter Password</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(false); }}
            placeholder="Password"
            autoFocus
            className="w-full rounded-lg px-4 py-3 text-white text-sm focus:outline-none"
            style={{ background: '#0d2b4e', border: `1px solid ${error ? '#f87171' : 'rgba(141,198,63,0.3)'}` }}
          />
          {error && <p className="text-xs text-red-400">Incorrect password. Try again.</p>}
          <button
            type="submit"
            className="w-full rounded-lg px-4 py-3 text-sm font-black tracking-widest uppercase"
            style={{ background: '#8dc63f', color: '#0a1929' }}
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}
