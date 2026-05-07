import React, { useState } from 'react';

const LandlordDashboard = ({ setIsAddingMode, showAddModal, setShowAddModal, newPropertyCoords }) => {
  const [activeMenu, setActiveMenu] = useState('analytics');
  
  // --- FORM STATE FOR NEW LISTINGS ---
  const [propertyData, setPropertyData] = useState({
    title: '',
    price: '',
    type: 'Bedsitter',
    amenities: []
  });

  // --- SUB-COMPONENT: ANALYTICS (YouTube Style) ---
  const AnalyticsView = () => (
    <div style={dashBody}>
      <h2 style={dashTitle}>Channel Analytics <span style={badgeNew}>Live</span></h2>
      <div style={metricGrid}>
        <div style={metricCard}>
          <div style={metricLabel}>Total Views</div>
          <div style={metricValue}>14,202</div>
          <div style={metricChange}>+12% this month</div>
        </div>
        <div style={metricCard}>
          <div style={metricLabel}>Leads Generated</div>
          <div style={metricValue}>89</div>
          <div style={metricChange}>24 converted to viewing</div>
        </div>
        <div style={metricCard}>
          <div style={metricLabel}>Estimated Revenue</div>
          <div style={metricValue}>KSh 420k</div>
          <div style={metricChange}>Stable</div>
        </div>
      </div>

      <div style={chartPlaceholder}>
        <div style={{height: '200px', display:'flex', alignItems:'flex-end', gap:'10px'}}>
            {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
                <div key={i} style={{flex:1, background: '#1a73e8', height: `${h}%`, borderRadius:'4px 4px 0 0'}}></div>
            ))}
        </div>
        <p style={{textAlign:'center', fontSize:'12px', color:'#64748b', marginTop:'10px'}}>Daily Impression Reach (Limuru Region)</p>
      </div>
    </div>
  );

  // --- SUB-COMPONENT: LISTING MANAGER ---
  const ListingManager = () => (
    <div style={dashBody}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h2 style={dashTitle}>My Properties</h2>
        <button 
            style={addBtn} 
            onClick={() => {
                alert("Please click on the location in the Map to set the property pin.");
                setIsAddingMode(true); 
            }}
        >
            + Add New Listing
        </button>
      </div>
      
      <div style={listTable}>
        <div style={tableHeader}>
            <span>Property</span>
            <span>Status</span>
            <span>Reach</span>
            <span>Action</span>
        </div>
        {[
            { name: 'Tigoni Heights 2BR', status: 'Promoted', reach: '5.2k', color: '#10b981' },
            { name: 'Limuru Town Bedsitter', status: 'Active', reach: '1.1k', color: '#3b82f6' }
        ].map((p, i) => (
            <div key={i} style={tableRow}>
                <span style={{fontWeight:'bold'}}>{p.name}</span>
                <span style={{color: p.color, fontSize:'12px', fontWeight:'900'}}>● {p.status}</span>
                <span>{p.reach} views</span>
                <button style={editBtn}>Manage</button>
            </div>
        ))}
      </div>

      {/* --- PROPERTY ENTRY MODAL --- */}
      {showAddModal && (
        <div style={modalOverlay}>
          <div style={formModal}>
            <div style={{display:'flex', justifyContent:'space-between'}}>
                <h3>Listing Details</h3>
                <button onClick={() => setShowAddModal(false)} style={{border:'none', background:'none', cursor:'pointer', fontSize:'20px'}}>✕</button>
            </div>
            
            <p style={{fontSize:'12px', color:'#1a73e8', fontWeight:'bold', marginTop:'10px'}}>
                📍 Captured Location: {newPropertyCoords?.[1].toFixed(5)}, {newPropertyCoords?.[0].toFixed(5)}
            </p>

            <div style={formGrid}>
                <input style={inputStyle} type="text" placeholder="Listing Title (e.g. Blue Sky Apartments)" />
                <select style={inputStyle}>
                    <option>Bedsitter</option>
                    <option>1 Bedroom</option>
                    <option>2 Bedroom</option>
                    <option>Commercial Space</option>
                </select>
                <input style={inputStyle} type="number" placeholder="Rent (KSh per month)" />
                
                <div style={{gridColumn:'1 / -1'}}>
                    <h4 style={{marginBottom:'10px'}}>Amenities</h4>
                    <div style={{display:'flex', gap:'15px', flexWrap:'wrap'}}>
                        {['WiFi', 'Borehole', 'CCTV', 'Instant Shower', 'Parking'].map(a => (
                            <label key={a} style={{fontSize:'13px', display:'flex', alignItems:'center', gap:'5px'}}>
                                <input type="checkbox" /> {a}
                            </label>
                        ))}
                    </div>
                </div>

                <div style={uploadZone}>
                    <p>📸 Click to upload property photos</p>
                    <input type="file" multiple style={{opacity:0, position:'absolute', cursor:'pointer'}} />
                </div>
            </div>

            <button style={submitBtn} onClick={() => {
                alert("Property Saved to Ebenezer Database!");
                setShowAddModal(false);
            }}>Publish Listing</button>
          </div>
        </div>
      )}
    </div>
  );

  // --- SUB-COMPONENT: MONETIZATION & SUBSCRIPTIONS ---
  const SubscriptionStore = () => (
    <div style={dashBody}>
      <h2 style={dashTitle}>Ebenezer Partner Program</h2>
      <p style={subTitle}>Choose how you want to reach potential tenants.</p>
      
      <div style={planGrid}>
        <div style={planCard}>
            <h3>Weekly Spark</h3>
            <div style={priceTag}>KSh 1,500<span>/week</span></div>
            <ul style={planList}>
                <li>Standard Map Pin</li>
                <li>5 High-Res Photos</li>
                <li>WhatsApp Leads</li>
            </ul>
            <button style={planBtn}>Activate</button>
        </div>
        <div style={planCardFeatured}>
            <div style={ribbon}>BEST VALUE</div>
            <h3>Monthly Pro</h3>
            <div style={priceTag}>KSh 4,500<span>/month</span></div>
            <ul style={planList}>
                <li>Gold Map Pin</li>
                <li>Verified Badge</li>
                <li>Featured in Search</li>
                <li>Analytics Access</li>
            </ul>
            <button style={planBtnActive}>Current Plan</button>
        </div>
        <div style={planCard}>
            <h3>Yearly Elite</h3>
            <div style={priceTag}>KSh 40,000<span>/year</span></div>
            <ul style={planList}>
                <li>Enterprise Dashboard</li>
                <li>Unlimited Listings</li>
                <li>Dedicated Agent</li>
                <li>0% Viewing Fees</li>
            </ul>
            <button style={planBtn}>Upgrade</button>
        </div>
      </div>

      <div style={adSection}>
        <h3>Boost a Listing</h3>
        <p>Your property will appear at the top of the list for everyone in Kiambu County.</p>
        <div style={boostOptions}>
            <button style={boostBtn}>🚀 24HR Flash (KSh 200)</button>
            <button style={boostBtn}>🔥 7-Day Hot List (KSh 1,000)</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={dashWrapper}>
      {/* SIDEBAR NAVIGATION */}
      <aside style={sidebar}>
        <div style={logoArea}>
          <div style={logo}>E</div>
          <span>Ebenezer Studio</span>
        </div>
        <nav style={sideNav}>
          <button style={navItem(activeMenu==='analytics')} onClick={()=>setActiveMenu('analytics')}>📊 Dashboard</button>
          <button style={navItem(activeMenu==='listings')} onClick={()=>setActiveMenu('listings')}>🏠 My Listings</button>
          <button style={navItem(activeMenu==='monetize')} onClick={()=>setActiveMenu('monetize')}>💰 Monetization</button>
          <button style={navItem(activeMenu==='messages')} onClick={()=>setActiveMenu('messages')}>💬 Tenant Chats</button>
          <button style={navItem(activeMenu==='settings')} onClick={()=>setActiveMenu('settings')}>⚙️ Studio Settings</button>
        </nav>
        <div style={storageBox}>
            <div style={{display:'flex', justifyContent:'space-between', fontSize:'11px'}}>
                <span>Listing Limit</span>
                <span>80% used</span>
            </div>
            <div style={progressBase}><div style={progressFill}></div></div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main style={{flex:1, overflowY:'auto'}}>
        <header style={topBar}>
            <div style={searchBar}>Search properties, tenants, or bills...</div>
            <div style={topActions}>
                <div style={iconBtn}>🔔</div>
                <div style={profileCircle}>L</div>
            </div>
        </header>

        {activeMenu === 'analytics' && <AnalyticsView />}
        {activeMenu === 'listings' && <ListingManager />}
        {activeMenu === 'monetize' && <SubscriptionStore />}
        {activeMenu === 'messages' && <div style={dashBody}><h2>Messaging System Integrated</h2></div>}
      </main>
    </div>
  );
};

// --- STYLING OBJECTS ---
const dashWrapper = { display: 'flex', height: '100vh', background: '#f9fafb', fontFamily: 'Inter, sans-serif' };
const sidebar = { width: '260px', background: '#fff', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', padding: '20px' };
const logoArea = { display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 'bold', fontSize: '18px', marginBottom: '40px' };
const logo = { width: '32px', height: '32px', background: '#1a73e8', color: '#fff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const sideNav = { flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' };
const navItem = (active) => ({
    padding: '12px 15px', border: 'none', borderRadius: '10px', textAlign: 'left',
    background: active ? '#eff6ff' : 'transparent',
    color: active ? '#1a73e8' : '#4b5563',
    fontWeight: active ? 'bold' : '500', cursor: 'pointer', transition: '0.2s'
});
const storageBox = { marginTop: '20px', background: '#f9fafb', padding: '15px', borderRadius: '12px' };
const progressBase = { height: '6px', background: '#e5e7eb', borderRadius: '10px', marginTop: '8px' };
const progressFill = { width: '80%', height: '100%', background: '#1a73e8', borderRadius: '10px' };

const dashBody = { padding: '40px' };
const dashTitle = { fontSize: '24px', fontWeight: '800', marginBottom: '25px', display:'flex', alignItems:'center', gap:'10px' };
const badgeNew = { background: '#ef4444', color: '#fff', fontSize: '10px', padding: '2px 8px', borderRadius: '10px' };
const metricGrid = { display: 'flex', gap: '20px', marginBottom: '30px' };
const metricCard = { flex: 1, background: '#fff', padding: '25px', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' };
const metricLabel = { fontSize: '13px', color: '#6b7280', marginBottom: '10px' };
const metricValue = { fontSize: '28px', fontWeight: 'bold', color: '#111827' };
const metricChange = { fontSize: '12px', color: '#10b981', marginTop: '5px' };
const chartPlaceholder = { background: '#fff', padding: '30px', borderRadius: '16px', border: '1px solid #e5e7eb' };

const listTable = { background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden' };
const tableHeader = { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '15px 25px', background: '#f9fafb', fontSize: '12px', color: '#6b7280', fontWeight: 'bold' };
const tableRow = { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '20px 25px', borderTop: '1px solid #e5e7eb', alignItems: 'center' };
const addBtn = { padding: '10px 20px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' };
const editBtn = { padding: '6px 12px', background: '#f3f4f6', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' };

const topBar = { height: '70px', background: '#fff', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px' };
const searchBar = { color: '#9ca3af', fontSize: '14px', background: '#f3f4f6', padding: '10px 20px', borderRadius: '10px', width: '400px' };
const topActions = { display: 'flex', alignItems: 'center', gap: '20px' };
const iconBtn = { cursor: 'pointer', fontSize: '20px' };
const profileCircle = { width: '35px', height: '35px', background: '#ec4899', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' };

const planGrid = { display: 'flex', gap: '20px', marginTop: '20px' };
const planCard = { flex: 1, background: '#fff', padding: '30px', borderRadius: '20px', border: '1px solid #e5e7eb', textAlign: 'center' };
const planCardFeatured = { flex: 1, background: '#fff', padding: '30px', borderRadius: '20px', border: '2px solid #1a73e8', textAlign: 'center', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' };
const ribbon = { position: 'absolute', top: '15px', right: '-10px', background: '#1a73e8', color: '#fff', fontSize: '10px', padding: '4px 15px', fontWeight: 'bold', borderRadius: '4px' };
const priceTag = { fontSize: '24px', fontWeight: '900', margin: '20px 0', color: '#111827' };
const planList = { listStyle: 'none', padding: 0, margin: '20px 0', textAlign: 'left', fontSize: '13px', color: '#4b5563', lineHeight: '2' };
const planBtn = { width: '100%', padding: '12px', border: '1px solid #e5e7eb', background: '#fff', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' };
const planBtnActive = { width: '100%', padding: '12px', border: 'none', background: '#1a73e8', color: '#fff', borderRadius: '10px', fontWeight: 'bold' };
const adSection = { marginTop: '40px', padding: '30px', background: '#111827', borderRadius: '20px', color: '#fff' };
const boostOptions = { display: 'flex', gap: '15px', marginTop: '20px' };
const boostBtn = { padding: '12px 20px', borderRadius: '10px', border: '1px solid #374151', background: '#1f2937', color: '#fff', cursor: 'pointer', fontWeight: 'bold' };
const subTitle = { color: '#6b7280', fontSize: '14px', marginBottom: '20px' };

const modalOverlay = { position: 'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 };
const formModal = { background:'#fff', padding:'30px', borderRadius:'20px', width:'500px', maxWidth:'90%', maxHeight:'90vh', overflowY:'auto' };
const formGrid = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px', marginTop:'20px' };
const inputStyle = { padding:'12px', borderRadius:'8px', border:'1px solid #e5e7eb', fontSize:'14px' };
const uploadZone = { gridColumn:'1 / -1', border:'2px dashed #e5e7eb', padding:'30px', textAlign:'center', borderRadius:'12px', cursor:'pointer', color:'#6b7280' };
const submitBtn = { width:'100%', padding:'15px', background:'#1a73e8', color:'#fff', border:'none', borderRadius:'10px', fontWeight:'bold', marginTop:'20px', cursor:'pointer' };

export default LandlordDashboard;