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

        // Проверяем, что сервер вернул JSON, а не HTML-ошибку
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await res.json();
        if (res.ok) {
            if (isRegister) {
            alert('Регистрация успешна!');
            setIsRegister(false);
            } else {
            onLogin(data.token);
            }
        } else {
            alert(data.error || 'Ошибка входа');
        }
        } else {
        const textError = await res.text();
        console.error("Сервер вернул не JSON:", textError);
        alert('Критическая ошибка сервера. Посмотрите логи бэкенда.');
        }
    } catch (error) {
        console.error("Ошибка сети при регистрации:", error);
    }
  };

  return (
    <div className="wrapper auth-container">
      <div className="auth-card">
        <h1>{isRegister ? 'Создать аккаунт' : 'С возвращением!'}</h1>
        <form onSubmit={handleSubmit}>
          <input className="input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input className="input" type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} required />
          <button className="btn" type="submit">{isRegister ? 'Зарегистрироваться' : 'Войти'}</button>
        </form>
        <button className="auth-toggle-btn" onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
        </button>
      </div>
    </div>
  );
};  