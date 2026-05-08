import React, { useState, useEffect } from 'react';
import { rtdb, storage } from './firebase'; 
import { ref as dbRef, push, set, onValue } from "firebase/database";
import { ref as sRef, uploadBytes, getDownloadURL } from "firebase/storage";

const LandlordDashboard = ({ setIsAddingMode, showAddModal, setShowAddModal, newPropertyCoords }) => {
  const [activeMenu, setActiveMenu] = useState('analytics');
  const [isUploading, setIsUploading] = useState(false);
  const [dbHouses, setDbHouses] = useState([]);
  
  // --- FORM STATE ---
  const [propertyData, setPropertyData] = useState({
    title: '',
    price: '',
    type: 'Bedsitter',
    amenities: []
  });
  const [selectedFiles, setSelectedFiles] = useState([]);

  // --- FETCH REAL DATA FOR ANALYTICS & LISTINGS ---
  useEffect(() => {
    const propertiesRef = dbRef(rtdb, 'properties');
    const unsubscribe = onValue(propertiesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setDbHouses(list);
      }
    });
    return () => unsubscribe();
  }, []);

  // Calculate live metrics
  const totalViews = dbHouses.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const totalRevenue = dbHouses.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);

  // --- HANDLERS ---
  const handleCheckbox = (amenity) => {
    setPropertyData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity) 
        ? prev.amenities.filter(a => a !== amenity) 
        : [...prev.amenities, amenity]
    }));
  };

  const handlePublish = async () => {
    if (!newPropertyCoords) return alert("Please pin a location on the map first!");
    if (!propertyData.title || !propertyData.price) return alert("Please fill in title and price.");

    setIsUploading(true);
    try {
      const imageUrls = [];
      for (const file of selectedFiles) {
        const storageRef = sRef(storage, `properties/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);
        imageUrls.push(url);
      }

      const newPropertyRef = push(dbRef(rtdb, 'properties'));
      await set(newPropertyRef, {
        ...propertyData,
        price: Number(propertyData.price),
        coords: newPropertyCoords,
        images: imageUrls,
        landlord: "Eric Mukungu", 
        timestamp: Date.now(),
        color: "#1a73e8",
        views: Math.floor(Math.random() * 10), // Starting views
        status: 'Active'
      });

      alert("Property Published Successfully!");
      setShowAddModal(false);
      setPropertyData({ title: '', price: '', type: 'Bedsitter', amenities: [] });
      setSelectedFiles([]);
      setIsAddingMode(false);
    } catch (error) {
      console.error(error);
      alert("Error: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  // --- SUB-COMPONENTS ---
  const AnalyticsView = () => (
    <div style={dashBody}>
      <h2 style={dashTitle}>Channel Analytics <span style={badgeNew}>Live</span></h2>
      <div style={metricGrid}>
        <div style={metricCard}>
          <div style={metricLabel}>Total Map Impressions</div>
          <div style={metricValue}>{totalViews.toLocaleString()}</div>
          <div style={metricChange}>+Live from DB</div>
        </div>
        <div style={metricCard}>
          <div style={metricLabel}>Active Listings</div>
          <div style={metricValue}>{dbHouses.length}</div>
          <div style={metricChange}>Tracking in Limuru</div>
        </div>
        <div style={metricCard}>
          <div style={metricLabel}>Total Portfolio Value</div>
          <div style={metricValue}>KSh {(totalRevenue/1000).toFixed(1)}k</div>
          <div style={metricChange}>Monthly Potential</div>
        </div>
      </div>

      <div style={chartPlaceholder}>
        <div style={{height: '200px', display:'flex', alignItems:'flex-end', gap:'10px'}}>
            {/* Dynamic Graph based on prices */}
            {dbHouses.slice(-7).map((h, i) => (
                <div key={i} style={{flex:1, background: '#1a73e8', height: `${(h.price/50000)*100}%`, borderRadius:'4px 4px 0 0', transition:'0.5s'}}></div>
            ))}
        </div>
        <p style={{textAlign:'center', fontSize:'12px', color:'#64748b', marginTop:'10px'}}>Property Value Distribution (Last 7 Listings)</p>
      </div>
    </div>
  );

  const ListingManager = () => (
    <div style={dashBody}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h2 style={dashTitle}>My Properties</h2>
        <button style={addBtn} onClick={() => { setIsAddingMode(true); alert("Click the Map location now."); }}>
            + Add New Listing
        </button>
      </div>
      
      <div style={listTable}>
        <div style={tableHeader}>
            <span>Property</span>
            <span>Type</span>
            <span>Price</span>
            <span>Views</span>
        </div>
        {dbHouses.map((p, i) => (
            <div key={i} style={tableRow}>
                <span style={{fontWeight:'bold'}}>{p.title || 'Unnamed'}</span>
                <span>{p.type}</span>
                <span style={{color: '#10b981', fontWeight:'900'}}>KSh {p.price}</span>
                <span>{p.views || 0}</span>
            </div>
        ))}
      </div>

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
                <input style={inputStyle} type="text" placeholder="Title" value={propertyData.title} onChange={e => setPropertyData({...propertyData, title: e.target.value})} />
                <select style={inputStyle} value={propertyData.type} onChange={e => setPropertyData({...propertyData, type: e.target.value})}>
                    <option>Bedsitter</option><option>1 Bedroom</option><option>2 Bedroom</option>
                </select>
                <input style={inputStyle} type="number" placeholder="Rent (KSh)" value={propertyData.price} onChange={e => setPropertyData({...propertyData, price: e.target.value})} />
                
                <div style={{gridColumn:'1 / -1'}}>
                    <div style={{display:'flex', gap:'10px', flexWrap:'wrap'}}>
                        {['WiFi', 'Parking', 'CCTV'].map(a => (
                            <label key={a} style={{fontSize:'13px'}}><input type="checkbox" onChange={() => handleCheckbox(a)} /> {a}</label>
                        ))}
                    </div>
                </div>

                <div style={uploadZone} onClick={() => document.getElementById('fileInput').click()}>
                    <p>📸 {selectedFiles.length > 0 ? `${selectedFiles.length} Selected` : 'Upload Photos'}</p>
                    <input id="fileInput" type="file" multiple style={{display:'none'}} onChange={e => setSelectedFiles(Array.from(e.target.files))} />
                </div>
            </div>
            <button style={submitBtn} onClick={handlePublish} disabled={isUploading}>
                {isUploading ? "Uploading to Ebenezer..." : "Publish Listing"}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div style={dashWrapper}>
      <aside style={sidebar}>
        <div style={logoArea}><div style={logo}>E</div><span>Ebenezer Studio</span></div>
        <nav style={sideNav}>
          <button style={navItem(activeMenu==='analytics')} onClick={()=>setActiveMenu('analytics')}>📊 Dashboard</button>
          <button style={navItem(activeMenu==='listings')} onClick={()=>setActiveMenu('listings')}>🏠 My Listings</button>
        </nav>
      </aside>

      <main style={{flex:1, overflowY:'auto'}}>
        <header style={topBar}>
            <div style={searchBar}>Admin: {dbHouses.length} Properties Online</div>
            <div style={profileCircle}>E</div>
        </header>
        {activeMenu === 'analytics' ? <AnalyticsView /> : <ListingManager />}
      </main>
    </div>
  );
};

// --- STYLING (Restored & Fixed) ---
const dashWrapper = { display: 'flex', height: '100vh', background: '#f9fafb', fontFamily: 'sans-serif' };
const sidebar = { width: '240px', background: '#fff', borderRight: '1px solid #e5e7eb', padding: '20px', display:'flex', flexDirection:'column' };
const logoArea = { display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 'bold', marginBottom: '40px' };
const logo = { width: '32px', height: '32px', background: '#1a73e8', color: '#fff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const sideNav = { display: 'flex', flexDirection: 'column', gap: '5px' };
const navItem = (active) => ({ padding: '12px', border: 'none', borderRadius: '10px', textAlign: 'left', background: active ? '#eff6ff' : 'transparent', color: active ? '#1a73e8' : '#4b5563', cursor: 'pointer' });
const dashBody = { padding: '30px' };
const dashTitle = { fontSize: '22px', fontWeight: '800', marginBottom: '20px' };
const badgeNew = { background: '#ef4444', color: '#fff', fontSize: '10px', padding: '2px 8px', borderRadius: '10px', marginLeft: '10px' };
const metricGrid = { display: 'flex', gap: '20px', marginBottom: '30px' };
const metricCard = { flex: 1, background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' };
const metricLabel = { fontSize: '12px', color: '#6b7280' };
const metricValue = { fontSize: '24px', fontWeight: 'bold', margin: '10px 0' };
const metricChange = { fontSize: '11px', color: '#10b981' };
const chartPlaceholder = { background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' };
const listTable = { background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb' };
const tableHeader = { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '15px', background: '#f9fafb', fontSize: '12px', fontWeight: 'bold' };
const tableRow = { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '15px', borderTop: '1px solid #e5e7eb', fontSize: '14px' };
const addBtn = { padding: '10px 20px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const topBar = { height: '60px', background: '#fff', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px' };
const searchBar = { color: '#9ca3af', fontSize: '13px' };
const profileCircle = { width: '32px', height: '32px', background: '#ec4899', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 };
const formModal = { background: '#fff', padding: '25px', borderRadius: '15px', width: '450px' };
const formGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '15px' };
const inputStyle = { padding: '10px', borderRadius: '6px', border: '1px solid #ddd' };
const uploadZone = { gridColumn: '1 / -1', border: '2px dashed #ddd', padding: '20px', textAlign: 'center', cursor: 'pointer' };
const submitBtn = { width: '100%', padding: '12px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '8px', marginTop: '15px', fontWeight: 'bold' };

export default LandlordDashboard;