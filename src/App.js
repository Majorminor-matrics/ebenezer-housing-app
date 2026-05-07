import React, { useState, useEffect } from 'react';
import MapDisplay from './MapDisplay';
import PropertyHub from './PropertyHub';
import LandlordDashboard from './LandlordDashboard';
import AIWizard from './AIWizard';
import LoyaltyModule from './LoyaltyModule';

// --- SUB-COMPONENT: AUTHSHIELD ---
const AuthShield = ({ onLogin, setUserRole, userRole, isRegistering, setIsRegistering }) => {
  return (
    <div style={authWrapper}>
      <div style={authCard}>
        <div style={logoMain}>E</div>
        <h2 style={authTitle}>{isRegistering ? 'Create Account' : 'Welcome to Ebenezer'}</h2>
        <p style={authSub}>Housing for all, from KSh 2,000 to Luxury</p>
        
        <form onSubmit={onLogin} style={authForm}>
          <div style={rolePicker}>
            <button type="button" onClick={() => setUserRole('tenant')} style={roleBtn(userRole === 'tenant')}>Tenant</button>
            <button type="button" onClick={() => setUserRole('landlord')} style={roleBtn(userRole === 'landlord')}>Landlord</button>
            <button type="button" onClick={() => setUserRole('agency')} style={roleBtn(userRole === 'agency')}>Agency</button>
          </div>
          <input type="email" placeholder="Email" style={fieldStyle} required />
          <input type="password" placeholder="Password" style={fieldStyle} required />
          <button type="submit" style={loginBtn}>{isRegistering ? 'Sign Up' : 'Login'}</button>
        </form>
        <button style={toggleAuth} onClick={() => setIsRegistering(!isRegistering)}>
          {isRegistering ? 'Have an account? Sign in' : 'Need an account? Register'}
        </button>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
const App = () => {
  // 1. CORE STATE
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('tenant'); 
  const [currentView, setCurrentView] = useState('map'); 
  const [isRegistering, setIsRegistering] = useState(false);

  // LANDLORD WORKFLOW STATES
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPropertyCoords, setNewPropertyCoords] = useState(null);

  // Add this temporarily inside your component to "use" them
console.log("Debug Info:", showAddModal, newPropertyCoords, MAPTILER_KEY);
  
  // 2. GROWTH & LOYALTY STATE
  const [userWallet, setUserWallet] = useState({ 
    credits: 500, 
    referrals: 2, 
    coupons: ['WELCOME50'],
    points: 120 
  });

  // 3. UI OVERLAY STATE
  const [showWizard, setShowWizard] = useState(false);
  const [showLoyalty, setShowLoyalty] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({ amount: 0, reason: '' });

  // --- LOGIC HANDLERS ---
  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoggedIn(true);
    setCurrentView(userRole === 'tenant' ? 'map' : 'studio');
  };

  const triggerPayment = (amount, reason) => {
    setPaymentDetails({ amount, reason });
    setShowPayment(true);
  };

  const useCoupon = (code) => {
    alert(`Coupon ${code} validated. Discount applied to your next viewing!`);
  };

  if (!isLoggedIn) {
    return (
      <AuthShield 
        onLogin={handleLogin} 
        setUserRole={setUserRole} 
        userRole={userRole} 
        isRegistering={isRegistering}
        setIsRegistering={setIsRegistering}
      />
    );
  }

  return (
    <div style={mainLayout}>
      
      {/* GLOBAL NAVIGATION (Floating Glassmorphism) */}
      {/* pointerEvents: 'none' ensures the nav container doesn't block the map underneath */}
      <nav style={{...floatingNav, pointerEvents: 'none'}}>
        <div style={{...navGroup, pointerEvents: 'auto'}}>
          <button onClick={() => setCurrentView('map')} style={navLink(currentView === 'map')}>📍 Explore</button>
          
          {userRole === 'tenant' && (
            <>
              <button onClick={() => setShowWizard(true)} style={aiSparkleBtn}>✨ AI Finder</button>
              <button onClick={() => setShowLoyalty(true)} style={rewardBtn}>🎁 Rewards ({userWallet.credits})</button>
              <button onClick={() => setCurrentView('hub')} style={navLink(currentView === 'hub')}>💬 Hub</button>
            </>
          )}

          {(userRole === 'landlord' || userRole === 'agency') && (
            <button onClick={() => setCurrentView('studio')} style={navLink(currentView === 'studio')}>
              {userRole === 'agency' ? '🏢 Agency Pro' : '📊 Studio'}
            </button>
          )}
        </div>

        <div style={{...navRight, pointerEvents: 'auto'}}>
          <div style={userBadge}>
            <span style={roleTag}>{userRole} Account</span>
            <span style={walletAmt}>KSh {userWallet.credits.toLocaleString()}</span>
          </div>
          <button onClick={() => triggerPayment(200, 'Viewing Fee')} style={payBtnHeader}>Pay Fee</button>
          <button onClick={() => setIsLoggedIn(false)} style={logoutBtn}>Exit</button>
        </div>
      </nav>

      

      {/* VIEW ENGINE (Conditional Layering) */}
      <main style={viewPort}>
        
        {/* MAP VIEW - Always mounted but z-indexed to top when active */}
        <div style={{
          ...viewWrapper(currentView === 'map'),
          zIndex: currentView === 'map' ? 10 : 1,
          pointerEvents: currentView === 'map' ? 'auto' : 'none'
        }}>
          <MapDisplay 
            isAddingMode={isAddingMode} 
            setIsAddingMode={setIsAddingMode} 
            setNewPropertyCoords={setNewPropertyCoords}
            setShowAddModal={setShowAddModal}
          />
        </div>
        
        {/* HUB VIEW */}
        <div style={{
          ...viewWrapper(currentView === 'hub'),
          zIndex: currentView === 'hub' ? 20 : 1,
          pointerEvents: currentView === 'hub' ? 'auto' : 'none'
        }}>
          <PropertyHub />
        </div>

        {/* STUDIO/DASHBOARD VIEW */}
        <div style={{
          ...viewWrapper(currentView === 'studio'),
          zIndex: currentView === 'studio' ? 20 : 1,
          pointerEvents: currentView === 'studio' ? 'auto' : 'none'
        }}>
          <LandlordDashboard 
            mode={userRole} 
            wallet={userWallet} 
            setIsAddingMode={(val) => {
              setIsAddingMode(val);
              if(val) setCurrentView('map'); // Automatically switch to map when adding
            }}
            showAddModal={showAddModal}
            setShowAddModal={setShowAddModal}
            newPropertyCoords={newPropertyCoords}
          />
        </div>
      </main>

      {/* --- OVERLAYS (MODALS) --- */}
      {showWizard && (
        <div style={modalBackdrop}>
          <div style={glassyPortrait}>
            <button style={closeModalX} onClick={() => setShowWizard(false)}>✕</button>
            <AIWizard onComplete={() => setShowWizard(false)} />
          </div>
        </div>
      )}

      {showLoyalty && (
        <div style={modalBackdrop}>
          <div style={glassyPortrait}>
            <button style={closeModalX} onClick={() => setShowLoyalty(false)}>✕</button>
            <LoyaltyModule 
              wallet={userWallet} 
              onUseCoupon={useCoupon} 
              isAgency={userRole === 'agency'}
            />
          </div>
        </div>
      )}

      {showPayment && (
        <div style={modalBackdrop}>
          <div style={mpesaCard}>
            <div style={mpesaBrand}>Lipa na M-PESA</div>
            <p style={{fontSize: '12px', color: '#64748b'}}>{paymentDetails.reason}</p>
            <h2 style={priceBig}>KSh {paymentDetails.amount}</h2>
            <input type="tel" placeholder="07XX XXX XXX" style={fieldStyle} />
            <button onClick={() => setShowPayment(false)} style={mpesaConfirmBtn}>Request STK Push</button>
            <button onClick={() => setShowPayment(false)} style={cancelBtn}>Cancel</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        
        * { box-sizing: border-box; transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        body { margin: 0; font-family: 'Inter', sans-serif; background: #f1f5f9; overflow: hidden; }
      `}</style>
    </div>
  );
};

// --- STYLING OBJECTS ---
const authWrapper = { height: '100vh', width: '100vw', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const authCard = { background: '#fff', padding: '50px 40px', borderRadius: '40px', width: '400px', textAlign: 'center', boxShadow: '0 25px 50px rgba(0,0,0,0.3)' };
const logoMain = { width: '60px', height: '60px', background: '#1a73e8', color: '#fff', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', fontWeight: '900', margin: '0 auto 20px' };
const authTitle = { fontSize: '24px', fontWeight: '800', marginBottom: '8px' };
const authSub = { fontSize: '13px', color: '#64748b', marginBottom: '30px' };
const authForm = { display: 'flex', flexDirection: 'column', gap: '15px' };
const fieldStyle = { padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none', fontSize: '15px' };
const loginBtn = { padding: '16px', borderRadius: '14px', background: '#1a73e8', color: '#fff', border: 'none', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '10px' };
const toggleAuth = { background: 'none', border: 'none', color: '#1a73e8', marginTop: '20px', fontSize: '13px', cursor: 'pointer' };

const rolePicker = { display: 'flex', background: '#f1f5f9', padding: '5px', borderRadius: '12px', marginBottom: '10px' };
const roleBtn = (active) => ({ flex: 1, padding: '10px', border: 'none', borderRadius: '10px', background: active ? '#fff' : 'transparent', color: active ? '#1a73e8' : '#64748b', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' });

const mainLayout = { position: 'relative', height: '100vh', width: '100vw' };
const floatingNav = { position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', width: '94%', zIndex: 1000, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(15px)', padding: '12px 25px', borderRadius: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' };
const navGroup = { display: 'flex', gap: '10px' };
const navLink = (active) => ({ padding: '10px 20px', borderRadius: '15px', border: 'none', background: active ? '#1a73e8' : 'transparent', color: active ? '#fff' : '#1e293b', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' });
const aiSparkleBtn = { padding: '10px 20px', borderRadius: '15px', border: 'none', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' };
const rewardBtn = { padding: '10px 20px', borderRadius: '15px', border: 'none', background: '#fef3c7', color: '#d97706', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' };

const navRight = { display: 'flex', gap: '20px', alignItems: 'center' };
const userBadge = { display: 'flex', flexDirection: 'column', alignItems: 'flex-end' };
const roleTag = { fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', color: '#94a3b8' };
const walletAmt = { fontSize: '14px', fontWeight: 'bold', color: '#10b981' };
const payBtnHeader = { background: '#10b981', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' };
const logoutBtn = { color: '#ef4444', background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' };

const viewPort = { position: 'relative', height: '100%', width: '100%', background: '#000' };
const viewWrapper = (visible) => ({ 
  position: 'absolute', 
  top: 0, 
  left: 0, 
  width: '100%', 
  height: '100%', 
  // Instead of hiding it, we move it behind or in front
  zIndex: visible ? 10 : -1, 
  opacity: visible ? 1 : 0,
  pointerEvents: visible ? 'auto' : 'none',
  transition: 'opacity 0.3s ease-in-out'
});

const modalBackdrop = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', zIndex: 50000, display: 'flex', alignItems: 'center', justifyContent: 'center' };
const glassyPortrait = { width: '380px', height: '85vh', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(30px)', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.3)', position: 'relative', overflowY: 'auto' };
const closeModalX = { position: 'absolute', top: '20px', right: '20px', background: 'rgba(0,0,0,0.1)', border: 'none', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', zIndex: 60000 };

const mpesaCard = { background: '#fff', width: '340px', padding: '40px', borderRadius: '35px', textAlign: 'center' };
const mpesaBrand = { color: '#34c759', fontWeight: '900', fontSize: '14px', marginBottom: '15px', textTransform: 'uppercase' };
const priceBig = { fontSize: '32px', fontWeight: '900', margin: '15px 0', color: '#1e293b' };
const mpesaConfirmBtn = { width: '100%', padding: '16px', borderRadius: '15px', background: '#34c759', color: '#fff', border: 'none', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '20px' };
const cancelBtn = { background: 'none', border: 'none', color: '#94a3b8', marginTop: '15px', cursor: 'pointer', fontSize: '13px' };

export default App;