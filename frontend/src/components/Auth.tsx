import { useState } from 'react';

export const Auth = ({ onLogin }: { onLogin: (token: string) => void }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = isRegister ? '/auth/register' : '/auth/login';
    try {
        const res = await fetch(`http://localhost:3000/api${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (res.ok) {
            if (isRegister) { alert('Success!'); setIsRegister(false); } 
            else { onLogin(data.token); }
        } else { alert(data.error); }
    } catch { alert('Network error'); }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '400px' }}>
        <h1 style={{ marginBottom: '20px', color: 'var(--c-grey-900)' }}>Price Pulse</h1>
        <h3 style={{ marginBottom: '30px', color: 'var(--c-purple-500)' }}>{isRegister ? 'Create Account' : 'Welcome Back'}</h3>
        <form onSubmit={handleSubmit}>
          <input className="big-input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input className="big-input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button className="primary-btn" type="submit">{isRegister ? 'Sign Up' : 'Log In'}</button>
        </form>
        <button onClick={() => setIsRegister(!isRegister)} style={{ marginTop: '20px', color: 'var(--c-grey-700)' }}>
          {isRegister ? 'Have an account? Login' : 'No account? Register'}
        </button>
      </div>
    </div>
  );
};