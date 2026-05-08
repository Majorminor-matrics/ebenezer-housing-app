import React, { useState, useEffect } from 'react';
import MapDisplay from './MapDisplay';
import PropertyHub from './PropertyHub';
import LandlordDashboard from './LandlordDashboard';
import AIWizard from './AIWizard';
import LoyaltyModule from './LoyaltyModule';

const MAPTILER_KEY = "GOOGLE_MAPS_ACTIVE"; 

// --- AUTH SHIELD (Full Restoration) ---
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

const App = () => {
  // State Management
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('tenant'); 
  const [currentView, setCurrentView] = useState('map'); 
  const [isRegistering, setIsRegistering] = useState(false);
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPropertyCoords, setNewPropertyCoords] = useState(null);

  // Growth & Loyalty Data
  const [userWallet, setUserWallet] = useState({ 
    credits: 500, referrals: 2, coupons: ['WELCOME50'], points: 120 
  });

  // UI Overlays
  const [showWizard, setShowWizard] = useState(false);
  const [showLoyalty, setShowLoyalty] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({ amount: 0, reason: '' });

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

  // --- MAP CLICK HANDLER ---
  const handleMapClick = (coords) => {
    if (isAddingMode) {
      setNewPropertyCoords(coords);
      setIsAddingMode(false);
      setShowAddModal(true);
      setCurrentView('studio'); // Return to studio to finish the form
    }
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
      
      {/* SELECTION GUIDANCE OVERLAY */}
      {isAddingMode && (
        <div style={selectionOverlay}>
           <div style={selectionBadge}>
             📍 Tap the map to set property location
             <button onClick={() => setIsAddingMode(false)} style={cancelSelectionBtn}>Cancel</button>
           </div>
        </div>
      )}

      <nav style={floatingNavContainer}>
        {/* Left Control Group */}
        <div style={navIsland}>
          <button onClick={() => setCurrentView('map')} style={navLink(currentView === 'map')}>📍 Explore</button>
          {userRole === 'tenant' && (
            <>
              <button onClick={() => setShowWizard(true)} style={aiSparkleBtn}>✨ AI Finder</button>
              <button onClick={() => setShowLoyalty(true)} style={rewardBtn}>🎁 Rewards</button>
              <button onClick={() => setCurrentView('hub')} style={navLink(currentView === 'hub')}>💬 Hub</button>
            </>
          )}
          {(userRole === 'landlord' || userRole === 'agency') && (
            <button onClick={() => setCurrentView('studio')} style={navLink(currentView === 'studio')}>
              {userRole === 'agency' ? '🏢 Agency Pro' : '📊 Studio'}
            </button>
          )}
        </div>

        {/* Right Status Group */}
        <div style={navIsland}>
          <div style={userBadge}>
            <span style={roleTag}>{userRole}</span>
            <span style={walletAmt}>KSh {userWallet.credits}</span>
          </div>
          <button onClick={() => triggerPayment(200, 'Viewing Fee')} style={payBtnHeader}>Pay Fee</button>
          <button onClick={() => setIsLoggedIn(false)} style={logoutBtn}>Exit</button>
        </div>
      </nav>

      <main style={viewPort}>
        <div style={{
          ...viewWrapper, 
          visibility: currentView === 'map' ? 'visible' : 'hidden',
          zIndex: currentView === 'map' ? 1 : -1,
          height: '100vh',
          width: '100vw'
        }}>
          <MapDisplay 
            isAddingMode={isAddingMode} 
            setIsAddingMode={setIsAddingMode} 
            setNewPropertyCoords={handleMapClick} // Bridge to the click handler
            setShowAddModal={setShowAddModal}
          />
        </div>
        
        {/* HUB VIEW */}
        {currentView === 'hub' && (
          <div style={{...viewWrapper, zIndex: 10, background: '#f8fafc'}}>
            <PropertyHub />
          </div>
        )}

        {/* STUDIO VIEW */}
        {currentView === 'studio' && (
          <div style={{...viewWrapper, zIndex: 10, background: '#f8fafc'}}>
            <LandlordDashboard 
              mode={userRole} 
              wallet={userWallet} 
              setIsAddingMode={(val) => {
                setIsAddingMode(val);
                if(val) setCurrentView('map');
              }}
              showAddModal={showAddModal}
              setShowAddModal={setShowAddModal}
              newPropertyCoords={newPropertyCoords}
            />
          </div>
        )}
      </main>

      {/* --- OVERLAYS & MODALS --- */}

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
            <LoyaltyModule wallet={userWallet} onUseCoupon={useCoupon} />
          </div>
        </div>
      )}

      {showPayment && (
        <div style={modalBackdrop}>
          <div style={mpesaCard}>
            <div style={mpesaBrand}>M-PESA SAFARICOM</div>
            <h3 style={{margin:0}}>Payment Portal</h3>
            <p style={{fontSize: '12px', color: '#64748b'}}>{paymentDetails.reason}</p>
            <div style={priceBig}>KSh {paymentDetails.amount}</div>
            <input type="text" placeholder="Enter Phone Number" style={fieldStyle} />
            <button style={mpesaConfirmBtn} onClick={() => setShowPayment(false)}>Request STK Push</button>
            <button style={cancelBtn} onClick={() => setShowPayment(false)}>Cancel</button>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap');
        * { box-sizing: border-box; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        body { margin: 0; font-family: 'Inter', sans-serif; background: #000; overflow: hidden; }
        .gm-style-mtc { top: 100px !important; }
        .gm-svpc { top: 150px !important; }
      `}</style>
    </div>
  );
};

// --- STYLING ---

const mainLayout = { position: 'relative', height: '100vh', width: '100vw', background: '#000' };
const viewPort = { position: 'relative', height: '100%', width: '100%' };

const floatingNavContainer = {
  position: 'absolute',
  top: '10px',
  left: '400px',
  right: '40px',
  display: 'flex',
  justifyContent: 'space-between',
  padding: '0 20px',
  zIndex: 2000,
  pointerEvents: 'none'
};

const navIsland = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  background: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(20px) saturate(180%)',
  padding: '8px',
  borderRadius: '20px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
  border: '1px solid rgba(255,255,255,0.3)',
  pointerEvents: 'auto'
};

const viewWrapper = { 
  position: 'absolute', 
  top: 0, left: 0, 
  width: '100%', height: '100%' 
};

// Selection Mode Styles
const selectionOverlay = {
  position: 'absolute',
  top: '100px',
  left: '0',
  right: '0',
  display: 'flex',
  justifyContent: 'center',
  zIndex: 3000,
  pointerEvents: 'none'
};

const selectionBadge = {
  background: '#1a73e8',
  color: '#fff',
  padding: '12px 24px',
  borderRadius: '50px',
  fontWeight: 'bold',
  boxShadow: '0 10px 25px rgba(26, 115, 232, 0.4)',
  display: 'flex',
  alignItems: 'center',
  gap: '15px',
  pointerEvents: 'auto'
};

const cancelSelectionBtn = {
  background: 'rgba(255,255,255,0.2)',
  border: 'none',
  color: '#fff',
  padding: '5px 12px',
  borderRadius: '10px',
  cursor: 'pointer',
  fontSize: '11px',
  fontWeight: 'bold'
};

// Auth Styles
const authWrapper = { height: '100vh', width: '100vw', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const authCard = { background: '#fff', padding: '50px 40px', borderRadius: '40px', width: '400px', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' };
const logoMain = { width: '60px', height: '60px', background: '#1a73e8', color: '#fff', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', fontWeight: '900', margin: '0 auto 20px' };
const authTitle = { fontSize: '24px', fontWeight: '800', marginBottom: '8px' };
const authSub = { fontSize: '13px', color: '#64748b', marginBottom: '30px' };
const authForm = { display: 'flex', flexDirection: 'column', gap: '15px' };
const fieldStyle = { padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none', fontSize: '15px', width: '100%' };
const loginBtn = { padding: '16px', borderRadius: '14px', background: '#1a73e8', color: '#fff', border: 'none', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '10px' };
const toggleAuth = { background: 'none', border: 'none', color: '#1a73e8', marginTop: '20px', fontSize: '13px', cursor: 'pointer' };
const rolePicker = { display: 'flex', background: '#f1f5f9', padding: '5px', borderRadius: '12px', marginBottom: '10px' };
const roleBtn = (active) => ({ flex: 1, padding: '10px', border: 'none', borderRadius: '10px', background: active ? '#fff' : 'transparent', color: active ? '#1a73e8' : '#64748b', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' });

// Nav Elements
const navLink = (active) => ({ 
  padding: '10px 18px', borderRadius: '14px', border: 'none', 
  background: active ? '#1a73e8' : 'transparent', 
  color: active ? '#fff' : '#1e293b', 
  fontWeight: '700', cursor: 'pointer', fontSize: '13px' 
});
const aiSparkleBtn = { 
  padding: '10px 18px', borderRadius: '14px', border: 'none', 
  background: 'linear-gradient(135deg, #6366f1, #a855f7)', 
  color: '#fff', fontWeight: '700', cursor: 'pointer', fontSize: '13px' 
};
const rewardBtn = { 
  padding: '10px 18px', borderRadius: '14px', border: 'none', 
  background: '#fef3c7', color: '#d97706', fontWeight: '700', cursor: 'pointer', fontSize: '13px' 
};
const userBadge = { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '0 10px' };
const roleTag = { fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.5px' };
const walletAmt = { fontSize: '13px', fontWeight: '800', color: '#10b981' };
const payBtnHeader = { background: '#10b981', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontSize: '12px' };
const logoutBtn = { color: '#ef4444', background: 'none', border: 'none', fontWeight: '800', cursor: 'pointer', fontSize: '12px' };

// Overlays
const modalBackdrop = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center' };
const glassyPortrait = { width: '400px', height: '80vh', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', borderRadius: '35px', border: '1px solid rgba(255,255,255,0.4)', position: 'relative', overflowY: 'auto', boxShadow: '0 30px 60px rgba(0,0,0,0.2)' };
const closeModalX = { position: 'absolute', top: '20px', right: '20px', background: 'rgba(0,0,0,0.05)', border: 'none', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', zIndex: 10000 };
const mpesaCard = { background: '#fff', width: '350px', padding: '40px', borderRadius: '35px', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' };
const mpesaBrand = { color: '#34c759', fontWeight: '900', fontSize: '12px', marginBottom: '10px', letterSpacing: '1px' };
const priceBig = { fontSize: '36px', fontWeight: '900', margin: '20px 0', color: '#1e293b' };
const mpesaConfirmBtn = { width: '100%', padding: '18px', borderRadius: '16px', background: '#34c759', color: '#fff', border: 'none', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '10px' };
const cancelBtn = { background: 'none', border: 'none', color: '#94a3b8', marginTop: '15px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' };

export default App;