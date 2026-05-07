import React, { useState } from 'react';

const LoyaltyModule = () => {
  const [referrals, setReferrals] = useState([
    { name: 'John Doe', status: 'Completed', reward: 'KSh 50' },
    { name: 'Mary W.', status: 'Pending', reward: 'KSh 0' }
  ]);

  return (
    <div style={loyaltyCard}>
      <h3 style={header}>🎁 Rewards & Referrals</h3>
      
      {/* REFERRAL LINK SECTION */}
      <div style={shareBox}>
        <p style={label}>Your Invite Link</p>
        <div style={linkRow}>
          <code style={codeText}>ebenezer.ke/ref/eric_m</code>
          <button style={copyBtn}>Copy</button>
        </div>
        <p style={subText}>Earn KSh 50 for every friend who views a house!</p>
      </div>

      {/* STATS GRID */}
      <div style={statsGrid}>
        <div style={statItem}>
          <span style={statVal}>KSh 250</span>
          <span style={statLab}>Earned</span>
        </div>
        <div style={statItem}>
          <span style={statVal}>3</span>
          <span style={statLab}>Coupons</span>
        </div>
      </div>

      {/* REFERRAL TRACKER */}
      <div style={tracker}>
        <h4 style={subHeader}>Recent Referrals</h4>
        {referrals.map((ref, i) => (
          <div key={i} style={refRow}>
            <span>{ref.name}</span>
            <span style={{color: ref.status === 'Completed' ? '#10b981' : '#f59e0b'}}>
              {ref.status} ({ref.reward})
            </span>
          </div>
        ))}
      </div>

      {/* AGENT SPECIAL FEATURE */}
      <div style={agentBanner}>
        <p>💼 <b>Agency Mode:</b> Bulk upload 50+ houses and get a dedicated account manager.</p>
        <button style={upgradeBtn}>Join as Agency</button>
      </div>
    </div>
  );
};

// --- STYLING ---
const loyaltyCard = { background: '#fff', padding: '25px', borderRadius: '24px', border: '1px solid #e2e8f0' };
const header = { margin: '0 0 20px 0', fontSize: '18px', fontWeight: '800' };
const shareBox = { background: '#f8fafc', padding: '15px', borderRadius: '15px', marginBottom: '20px' };
const label = { fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '5px' };
const linkRow = { display: 'flex', gap: '10px', alignItems: 'center' };
const codeText = { flex: 1, background: '#fff', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' };
const copyBtn = { background: '#1a73e8', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' };
const subText = { fontSize: '11px', color: '#94a3b8', marginTop: '8px' };
const statsGrid = { display: 'flex', gap: '15px', marginBottom: '20px' };
const statItem = { flex: 1, background: '#eff6ff', padding: '15px', borderRadius: '15px', textAlign: 'center' };
const statVal = { display: 'block', fontSize: '18px', fontWeight: '900', color: '#1a73e8' };
const statLab = { fontSize: '10px', color: '#64748b' };
const tracker = { borderTop: '1px solid #f1f5f9', paddingTop: '15px' };
const subHeader = { fontSize: '14px', marginBottom: '10px' };
const refRow = { display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '8px 0', borderBottom: '1px solid #f8fafc' };
const agentBanner = { marginTop: '20px', padding: '15px', background: '#1e293b', color: '#fff', borderRadius: '15px', fontSize: '12px' };
const upgradeBtn = { width: '100%', marginTop: '10px', padding: '10px', background: '#ec4899', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' };

export default LoyaltyModule;