import { apiFetch } from "../api";

const API_URL = "http://localhost:3000";

interface ProfileProps {
    userData: any;
    onRefresh: () => void;
    onLogout: () => void;
}

export default function Profile({ userData, onRefresh, onLogout }: ProfileProps) {
  
  const handleUnlink = async () => {
    if (!confirm("Отключить уведомления в Telegram?")) return;
    const res = await apiFetch("/auth/unlink-telegram", { method: "POST" });
    if (res.ok) onRefresh();
  };

  if (!userData) return <div className="wrapper">Загрузка профиля...</div>;

  const botName = "PricePulseNotifierBot";
  const link = `https://t.me/${botName}?start=${userData.id}`;
  
  const avatarSrc = userData.telegramAvatar 
    ? (userData.telegramAvatar.startsWith('http') 
        ? userData.telegramAvatar 
        : `${API_URL}${userData.telegramAvatar}`)
    : null;

  return (
    <div className="wrapper">
      <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '15px' }}>
        
        {/* Аватарка */}
        {avatarSrc ? (
          <img 
            src={avatarSrc} 
            alt="Avatar" 
            style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--primary)' }}
            onError={(e) => console.error("Image failed")} 
          />
        ) : (
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
                👤
            </div>
        )}

        <div className="profile-info">
            <h2 style={{fontSize: '1.2rem', margin: 0}}>{userData.email}</h2>
            {userData.telegramName && <p style={{color: 'var(--primary)', fontWeight: 500}}>@{userData.telegramName}</p>}
        </div>
        
        <div style={{ width: '100%', height: '1px', background: '#e5e7eb', margin: '10px 0' }} />

        {/* Статус Telegram */}
        {userData.telegramId ? (
          <div style={{ width: '100%' }}>
            <div style={{ background: '#ecfdf5', color: '#065f46', padding: '10px', borderRadius: '12px', marginBottom: '15px' }}>
                ✅ Уведомления включены
            </div>
            <button className="btn" style={{ background: '#fee2e2', color: '#ef4444', width: '100%' }} onClick={handleUnlink}>
                Отвязать Telegram
            </button>
          </div>
        ) : (
          <div style={{ width: '100%' }}>
            <p style={{marginBottom: '10px', color: '#6b7280'}}>Подключи Telegram, чтобы получать уведомления о скидках</p>
            <a href={link} target="_blank" className="btn" style={{ textDecoration: 'none', width: '100%' }}>
                Привязать Telegram
            </a>
          </div>
        )}
        
        <button 
            onClick={onLogout} 
            style={{ background: 'transparent', border: 'none', color: '#9ca3af', marginTop: '20px', textDecoration: 'underline', cursor: 'pointer' }}
        >
            Выйти из аккаунта
        </button>
      </div>
    </div>
  );
}