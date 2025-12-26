import { apiFetch } from "../api";

export default function Profile({ userData, onRefresh, onLogout }: any) {
  if (!userData) return <div style={{padding: '20px'}}>Loading...</div>;

  const handleUnlink = async () => {
    if(confirm("Отвязать?")) {
        await apiFetch("/auth/unlink-telegram", { method: "POST" });
        onRefresh();
    }
  };

  const avatarSrc = userData?.telegramAvatar 
    ? (userData.telegramAvatar.startsWith('http') 
        ? userData.telegramAvatar 
        : `http://localhost:3000${userData.telegramAvatar}`)
    : null;

  const botLink = `https://t.me/PricePulseNotifierBot?start=${userData.id}`;

  return (
    <div className="section-body" style={{paddingTop: '20px'}}>
        <div className="profile-card-modern">
            {avatarSrc ? <img src={avatarSrc} className="avatar-large" /> : <div className="avatar-large" style={{background: '#fff'}} />}
            <h2>{userData.email}</h2>
            {userData.telegramName && <p style={{opacity: 0.8}}>@{userData.telegramName}</p>}
        </div>

        <div style={{marginTop: '30px'}}>
            <h3 className="section-title">Settings</h3>
            
            <div style={{background: 'white', padding: '20px', borderRadius: '15px', marginTop: '10px', boxShadow: '0 5px 15px rgba(150, 132, 254, 0.1)'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
                    <span>Telegram Status</span>
                    <span style={{color: userData.telegramId ? '#10b981' : '#f59e0b', fontWeight: 600}}>
                        {userData.telegramId ? "Active" : "Not Linked"}
                    </span>
                </div>
                
                {userData.telegramId ? (
                    <button 
                        style={{width: '100%', padding: '12px', background: '#ffe4e6', color: '#be123c', borderRadius: '12px', fontWeight: 600}}
                        onClick={handleUnlink}
                    >
                        Unlink Telegram
                    </button>
                ) : (
                    <a 
                        href={botLink} target="_blank"
                        style={{display: 'block', textAlign: 'center', width: '100%', padding: '12px', background: '#dbeafe', color: '#1e40af', borderRadius: '12px', textDecoration: 'none', fontWeight: 600}}
                    >
                        Connect Bot
                    </a>
                )}
            </div>

            <button 
                className="product-btn"
                onClick={onLogout}
                style={{width: '100%', marginTop: '20px', padding: '15px', color: '#6b7280', textDecoration: 'underline'}}
            >
                Log Out
            </button>
        </div>
    </div>
  );
}