import React, { useEffect, useRef, useState, useMemo } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
// Importing your existing configuration
import { rtdb, storage } from './firebase'; 
import { ref, push, onValue } from "firebase/database";

/**
 * --- FEATURE 1: EXPANDED PROPERTY DATABASE ---
 * Metadata for: Crime rates, Landlord responsiveness, and Utility status.
 */
const initialHouses = [
  { id: 1, type: "Bedsitter", price: 7500, coords: [36.6333, -1.1167], color: "#3498db", location: "Limuru Town", amenities: ["WiFi", "Water", "CCTV"], rating: 4.8, safety: 95, landlord: "Prompt", power: "Stable", views: 245, featured: true },
  { id: 2, type: "1 Bedroom", price: 13000, coords: [36.6350, -1.1180], color: "#2ecc71", location: "Karanja", amenities: ["Parking", "Hot Shower"], rating: 4.5, safety: 88, landlord: "Fair", power: "Tokens", views: 112, featured: false },
  { id: 3, type: "Studio", price: 10500, coords: [36.6310, -1.1150], color: "#f1c40f", location: "Ngarariga", amenities: ["Modern Kitchen"], rating: 4.2, safety: 82, landlord: "Strict", power: "Postpay", views: 88, featured: false },
  { id: 4, type: "3+ Bedroom", price: 42000, coords: [36.6380, -1.1190], color: "#e67e22", location: "Tigoni", amenities: ["Garden", "DSQ", "Borehole"], rating: 4.9, safety: 98, landlord: "Elite", power: "Backup Gen", views: 430, featured: true },
  { id: 5, type: "2 Bedroom", price: 25000, coords: [36.6450, -1.1210], color: "#9b59b6", location: "Banana", amenities: ["Balcony", "Lift"], rating: 4.6, safety: 85, landlord: "Standard", power: "Stable", views: 95, featured: false }
];

const MapDisplay = () => {
  // --- REFS ---
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);
  const streetViewRef = useRef(null);

  // --- STATE: NAVIGATION & UI ---
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [isMobileListOpen, setIsMobileListOpen] = useState(false);
  const [mapStyle, setMapStyle] = useState('streets-v2');

  // --- STATE: COMPREHENSIVE FEATURES ---
  const [favorites, setFavorites] = useState([]);
  const [compareList, setCompareList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [budgetRange, setBudgetRange] = useState(50000);
  const [showLoanCalc, setShowLoanCalc] = useState(false);
  const [bookingStep, setBookingStep] = useState(0); 
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [isNightMode, setIsNightMode] = useState(false);
  const [notification, setNotification] = useState("");
  
  // --- LANDLORD & AGENCY MODULE STATE ---
  const [isAddingMode, setIsAddingMode] = useState(false); 
  const [showAddModal, setShowAddModal] = useState(false); 
  const [newPropertyCoords, setNewPropertyCoords] = useState(null); 
  const [showCompareMatrix, setShowCompareMatrix] = useState(false);

  // --- NEW: PERSISTENCE & ROLE STATE ---
  const [houses, setHouses] = useState(initialHouses);
  const [isAgent, setIsAgent] = useState(false); // Toggle for Landlord/Agent view
  const [newHouseData, setNewHouseData] = useState({ type: '', price: '', location: '' });

  // --- LOAN CALCULATOR STATE ---
  const [loanAmount, setLoanAmount] = useState("");
  const [loanInterest, setLoanInterest] = useState("12");
  const [loanTerm, setLoanTerm] = useState("12");
  const [calculatedRepayment, setCalculatedRepayment] = useState(null);

  const MAPTILER_KEY = 'R1KejqU0v4QEV6TMUUYQ';

  // --- HELPER: SHOW NOTIFICATION ---
  const notify = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3000);
  };

  // --- REALTIME SYNC: FETCH FROM FIREBASE ---
  useEffect(() => {
    const propertiesRef = ref(rtdb, 'properties');
    onValue(propertiesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const cloudHouses = Object.keys(data).map(key => ({
          id: key,
          ...data[key],
          color: data[key].color || "#1a73e8" // Default brand color if missing
        }));
        // Merge initial static list with live database items
        setHouses([...initialHouses, ...cloudHouses]);
      }
    });
  }, []);

  // --- FEATURE: SAVE NEW PROPERTY TO FIREBASE ---
  const handleAddProperty = async () => {
    if (!newHouseData.type || !newHouseData.price || !newPropertyCoords) {
      notify("Please fill all details and pin the map.");
      return;
    }

    const propertyPayload = {
      ...newHouseData,
      price: parseInt(newHouseData.price),
      coords: newPropertyCoords,
      amenities: ["Water", "Electricity"], // Default starters
      rating: 5.0,
      safety: 90,
      landlord: "Verified",
      power: "Stable",
      views: 0,
      featured: false,
      color: "#e63946" // New listings get a distinct red color
    };

    try {
      await push(ref(rtdb, 'properties'), propertyPayload);
      notify("Property successfully listed live!");
      setShowAddModal(false);
      setNewHouseData({ type: '', price: '', location: '' });
    } catch (error) {
      notify("Error connecting to database.");
    }
  };

  // --- FEATURE 2: FAVORITES SYSTEM ---
  const toggleFavorite = (id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    notify(favorites.includes(id) ? "Removed from Favorites" : "Added to Favorites!");
  };

  // --- FEATURE 3: PROPERTY COMPARISON ---
  const toggleCompare = (id) => {
    if (compareList.length >= 3 && !compareList.includes(id)) {
      notify("Max 3 houses for comparison");
      return;
    }
    setCompareList(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // --- CALCULATOR LOGIC ---
  const handleCalculateLoan = () => {
    const principal = parseFloat(loanAmount);
    const interestRate = parseFloat(loanInterest) / 100 / 12;
    const payments = parseInt(loanTerm);

    if (isNaN(principal) || principal <= 0) {
      notify("Please enter a valid amount");
      return;
    }

    const x = Math.pow(1 + interestRate, payments);
    const monthly = (principal * x * interestRate) / (x - 1);
    
    if (isFinite(monthly)) {
      setCalculatedRepayment(monthly.toFixed(2));
    } else {
      setCalculatedRepayment((principal / payments).toFixed(2));
    }
  };

  // --- FEATURE 4: FLY-TO ANIMATION ---
 const panTo = (coords) => {
  if (!map.current) return; 

  // 1. Google Maps requires a LatLng object, not an array.
  // We map your [lng, lat] array to { lat, lng }
  const target = { 
    lat: coords[1], 
    lng: coords[0] 
  };

  // 2. Use panTo for smooth movement
  map.current.panTo(target);

  // 3. Set the zoom level separately (Google doesn't combine these like MapLibre)
  map.current.setZoom(17);
};

  // --- MAP CORE ENGINE ---
 // --- GOOGLE MAPS CORE ENGINE ---
 useEffect(() => {
  if (!map.current && mapContainer.current) {
    // 1. Initialize Map
    map.current = new window.google.maps.Map(mapContainer.current, {
      center: { lat: -1.1167, lng: 36.6333 },
      zoom: 14,
      mapId: "EBENEZER_MAP_ID", 
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
    });

    // --- THE "CLICK AWAY" FIX ---
    // This detects clicks on the empty map area and clears the selection
    map.current.addListener("click", (e) => {
      // If clicking a shop/POI name, don't show Google's default card
      if (e.placeId) e.stop(); 
      
      // Close the house details and hide the mobile list
      setSelectedHouse(null);
      if (window.innerWidth < 768) setIsMobileListOpen(false);
    });
  }

  const loadGoogleMarkers = async () => {
    const { AdvancedMarkerElement, PinElement } = await window.google.maps.importLibrary("marker");

    if (markersRef.current) {
      markersRef.current.forEach(m => m.map = null);
      markersRef.current = [];
    }

    houses
      .filter(h => {
        const matchesFilter = activeFilter === 'All' || h.type === activeFilter;
        const matchesBudget = h.price <= budgetRange;
        const matchesSearch = h.location.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesBudget && matchesSearch;
      })
      .forEach(h => {
        const pin = new PinElement({
          background: h.color,
          borderColor: "#FFFFFF",
          glyphColor: "#FFFFFF",
          scale: 1.1,
        });

        const marker = new AdvancedMarkerElement({
          map: map.current,
          position: { lat: h.coords[1], lng: h.coords[0] },
          title: h.type,
          content: pin.element,
        });

        // 2. Updated Click Event with "Shielding"
        marker.addListener("click", (e) => {
          // IMPORTANT: This prevents the map from thinking you clicked the "side"
          if (e.domEvent) e.domEvent.stopPropagation();
          
          setSelectedHouse(h);
          panTo(h.coords);
          
          // Open details on mobile automatically when marker is tapped
          if (window.innerWidth < 768) setIsMobileListOpen(false); 
        });

        markersRef.current.push(marker);
      });
  };

  if (map.current) {
    loadGoogleMarkers();
  }
}, [activeFilter, budgetRange, searchQuery, houses]);
  // --- STREET VIEW ENGINE ---
  useEffect(() => {
    let timer = setTimeout(() => {
      if (selectedHouse && streetViewRef.current && window.google) {
        const streetViewService = new window.google.maps.StreetViewService();
        const houseCoords = { lat: selectedHouse.coords[1], lng: selectedHouse.coords[0] };

        streetViewService.getPanorama({ 
          location: houseCoords, 
          radius: 100, 
          source: window.google.maps.StreetViewSource.OUTDOOR
        }, (data, status) => {
          if (!streetViewRef.current) return;
          if (status === "OK" && data) {
            streetViewRef.current.style.display = 'block';
            streetViewRef.current.innerHTML = '';
            new window.google.maps.StreetViewPanorama(streetViewRef.current, {
              position: data.location.latLng,
              pov: { heading: 165, pitch: 0 },
              zoom: 1,
              addressControl: false,
              fullscreenControl: false,
              zoomControl: false,
              linksControl: true,
              enableCloseButton: true
            });
          } else {
            streetViewRef.current.style.display = 'flex';
            streetViewRef.current.style.alignItems = 'center';
            streetViewRef.current.style.justifyContent = 'center';
            streetViewRef.current.style.flexDirection = 'column';
            streetViewRef.current.style.background = '#1a1a1a';
            streetViewRef.current.innerHTML = `
              <div style="text-align: center; color: #a0aec0; padding: 20px; font-family: sans-serif;">
                <div style="font-size: 40px; margin-bottom: 10px;">📍</div>
                <p style="margin: 0; font-weight: bold; color: white;">360° View Unavailable</p>
                <p style="font-size: 12px; margin-top: 8px;">Google hasn't mapped this road yet.</p>
                <button id="fallback-sat-btn" style="margin-top:15px; padding:8px 16px; border-radius:8px; border:none; background:#1a73e8; color:white; cursor:pointer; font-weight: 600;">Check Satellite View</button>
              </div>
            `;
            const btn = document.getElementById('fallback-sat-btn');
            if (btn) { btn.onclick = () => { setMapStyle('satellite'); setSelectedHouse(null); }; }
          }
        });
      }
    }, 150);

    if (map.current && isAddingMode) {
      const handleMapClick = (e) => {
        const { lng, lat } = e.lngLat;
        setNewPropertyCoords([lng, lat]);
        setShowAddModal(true); 
        setIsAddingMode(false); 
      };
      map.current.on('click', handleMapClick);
      return () => {
        clearTimeout(timer);
        if (map.current) map.current.off('click', handleMapClick);
      };
    }
    return () => clearTimeout(timer);
  }, [selectedHouse, isAddingMode]);


  return (
    <div style={{ ...rootStyle, filter: isNightMode ? 'invert(0.9) hue-rotate(180deg)' : 'none' }}>
      
      {/* 5. TOP NAV BAR */}
      <header style={navStyle}>
        <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
            <div style={logoCircle}>E</div>
            <div>
                <h1 style={brandName}>Ebenezer Agency</h1>
                <div style={onlineStatus}><span style={dot}>●</span> Agent Online</div>
            </div>
        </div>

        <div style={desktopNav}>
            {/* AGENT TOGGLE (Admin Only Secret) */}
            <button onClick={() => setIsAgent(!isAgent)} style={{...toolBtn, background: isAgent ? '#1e293b' : '#fff', color: isAgent ? '#fff' : '#1e293b'}}>
                {isAgent ? '🛠️ Admin Mode' : '👤 Tenant Mode'}
            </button>
            <button onClick={() => setIsNightMode(!isNightMode)} style={toolBtn}>
                {isNightMode ? '☀️ Day Mode' : '🌙 Dark Mode'}
            </button>
            <button onClick={() => setShowLoanCalc(true)} style={toolBtn}>🧮 Calculator</button>
            
            {/* Landlord Visibility Logic */}
            {isAgent && (
              <button onClick={() => { setIsAddingMode(true); notify("Click anywhere on the map to pin property!"); }} style={{...toolBtn, border: '1px solid #1a73e8', color: '#1a73e8'}}>
                🏢 Register Property
              </button>
            )}
        </div>
      </header>

      {notification && <div style={toastStyle}>{notification}</div>}

      <main style={mainBody}>
        
        {/* 7. LEFT SIDEBAR */}
        <aside style={sidebarStyle(isMobileListOpen)}>
          <div style={{padding:'20px'}}>
            <div style={searchWrapper}>
                <input 
                    style={searchInput} 
                    placeholder="Search Limuru, Tigoni..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* 8. BUDGET SLIDER */}
            <div style={budgetBox}>
                <label style={labelStyle}>Max Rent: KSh {budgetRange.toLocaleString()}</label>
                <input type="range" min="5000" max="50000" step="500" value={budgetRange} onChange={(e)=>setBudgetRange(e.target.value)} style={{width:'100%'}}/>
            </div>

            <div style={tabContainer}>
                {['All', 'Bedsitter', '1 Bedroom', '2 Bedroom', '3+ Bedroom'].map(t => (
                    <button key={t} onClick={() => setActiveFilter(t)} style={tabStyle(activeFilter === t)}>{t}</button>
                ))}
            </div>

            {/* 9. LISTINGS LOOP */}
            <div style={listGrid}>
              {houses
                .filter(h => (activeFilter === 'All' || h.type === activeFilter) && h.price <= budgetRange && (h.location.toLowerCase().includes(searchQuery.toLowerCase()) || h.type.toLowerCase().includes(searchQuery.toLowerCase())))
                .map(h => (
                  <div 
                    key={h.id} 
                    onClick={() => { setSelectedHouse(h); panTo(h.coords); }} 
                    style={cardStyle(selectedHouse?.id === h.id, h.color)}
                  >
                    {h.featured && <span style={featuredTag}>RECOMMENDED</span>}
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={propertyTitle}>{h.type}</span>
                      <button onClick={(e) => { e.stopPropagation(); toggleFavorite(h.id); }} style={heartBtn}>
                        {favorites.includes(h.id) ? '❤️' : '🤍'}
                      </button>
                    </div>

                    <div style={priceText}>KSh {h.price.toLocaleString()}</div>
                    
                    <div style={metaRow}>
                      <span>📍 {h.location}</span>
                      <span>🛡️ {h.safety}% Safety</span>
                    </div>

                    <div style={statGrid}>
                      <div style={miniStat}>👁️ {h.views} views</div>
                      <div style={miniStat}>⚡ {h.power}</div>
                      <div style={miniStat}>⭐ {h.rating}</div>
                    </div>

                    <button onClick={(e) => { e.stopPropagation(); toggleCompare(h.id); }} style={compareBtn(compareList.includes(h.id))}>
                      {compareList.includes(h.id) ? '✓ Comparing' : '+ Compare'}
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </aside>

        {/* 10. MAP OVERLAY CONTROLS */}
        {/* 10. MAP OVERLAY CONTROLS */}
<div style={mapTypeToggle}>
    <button 
      onClick={() => {
        setMapStyle('streets-v2');
        if (map.current) map.current.setMapTypeId(window.google.maps.MapTypeId.ROADMAP);
      }} 
      style={toggleItem(mapStyle==='streets-v2')}
    >
      Streets
    </button>
    
    <button 
      onClick={() => {
        setMapStyle('satellite');
        if (map.current) map.current.setMapTypeId(window.google.maps.MapTypeId.SATELLITE);
      }} 
      style={toggleItem(mapStyle==='satellite')}
    >
      Satellite
    </button>

    <button onClick={() => setShowHeatmap(!showHeatmap)} style={toggleItem(showHeatmap)}>🔥 Demand</button>
</div>

        {/* 11. CENTRAL MAP ENGINE */}
        <div ref={mapContainer} style={{ flex: 1, background: '#e5e5e5' }} />

        {/* 12. HOUSE VIEW MODAL */}
        {selectedHouse && (
          <div style={modalOverlay}>
            <div style={houseModal}>
              <button style={closeModal} onClick={() => setSelectedHouse(null)}>✕</button>
              
              <div style={modalSplit}>
                <div style={modalGallery}>
                  <div style={{ position: 'relative', width: '100%', marginBottom: '15px' }}>
                    <div ref={streetViewRef} style={{ width: '100%',top: '50px', height: '400px', borderRadius: '20px', background: '#1a1a1a', overflow: 'hidden', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)' }} />
                    <div style={{ position: 'absolute', top: '400px', left: '15px', background: 'rgba(0,0,0,0.75)', color: 'white', padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', backdropFilter: 'blur(4px)', pointerEvents: 'none', zIndex: 10 }}>
                      📸 360° Neighborhood View
                    </div>
                  </div>
                  <div style={amenityGrid}>
                    {selectedHouse.amenities.map(a => (
                      <span key={a} style={badge}>{a}</span>
                    ))}
                  </div>
                </div>

                <div style={modalDetails}>
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
    <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '900', letterSpacing: '-0.5px' }}>
      {selectedHouse.type}
    </h2>
    <div style={{ display: 'flex', gap: '8px' }}>
       <span style={{ fontSize: '20px', cursor: 'pointer' }}>🔗</span>
       <span style={{ fontSize: '20px', cursor: 'pointer' }}>🔖</span>
    </div>
  </div>

  <div style={storySection}>
    <div style={avatarCircle}>E</div>
    <div>
      <p style={handleName}>ebenezer_agency • <span style={{color: '#1a73e8', fontWeight: '600', cursor: 'pointer'}}>Follow</span></p>
      <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Verified Real Estate Agent</p>
    </div>
  </div>

  <div style={captionBox}>
    <p style={{ margin: 0 }}>
      <strong>ebenezer_agency</strong> Looking for a cozy home in {selectedHouse.location}? 
      This {selectedHouse.type} features {selectedHouse.amenities.join(", ")}. 
      DM for viewing! 🏠✨ #LimuruRealEstate #EbenezerHomes
    </p>
  </div>

  <div style={calcSummary}>
    <div style={calcRow}><span>Rent</span><strong>KSh {selectedHouse.price.toLocaleString()}</strong></div>
    <div style={calcRow}><span>Deposit</span><strong>KSh {selectedHouse.price.toLocaleString()}</strong></div>
  </div>

  {/* INSTAGRAM-STYLE ACTION BAR */}
  {/* INSTAGRAM-STYLE ACTION BAR */}
<div style={instagramActionBar}>
  <button 
    onClick={() => window.open(`https://wa.me/254700000000?text=I saw the ${selectedHouse.type} in ${selectedHouse.location} on your app!`, '_blank')} 
    style={dmBtn}
  >
    Send Message
  </button>
  
  <button 
    style={shareBtn} 
    onClick={() => {
      notify("Booking request sent!"); // Your existing notification
      setSelectedHouse(null);         // Closes the modal
    }}
  >
    Book Tour
  </button>
</div>
</div>
                  <div style={calcSummary}>
                    <div style={calcRow}><span>Monthly Rent:</span><span>KSh {selectedHouse.price.toLocaleString()}</span></div>
                    <div style={calcRow}><span>Viewing Fee:</span><span>KSh 200</span></div>
                    <div style={calcRow}><span>Refundable Deposit:</span><span>KSh {selectedHouse.price.toLocaleString()}</span></div>
                    <div style={calcTotal}><span>Total Move-in:</span><span>KSh {(selectedHouse.price * 2 + 200).toLocaleString()}</span></div>
                  </div>

                  
                </div>
              </div>
            </div>
    
        )}

        {/* 14. LOAN ESTIMATOR MODAL */}
        {showLoanCalc && (
          <div style={loanModal}>
            <h3>Rental Loan Estimator</h3>
            <p style={{fontSize:'12px', color:'#64748b', margin:'-5px 0 15px 0'}}>Calculate payments for your lease deposit</p>
            <div style={{margin:'15px 0', display:'flex', flexDirection:'column', gap:'10px'}}>
                <input type="number" placeholder="Deposit Amount (KSh)" value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} style={calcInput} />
                <select value={loanInterest} onChange={(e) => setLoanInterest(e.target.value)} style={calcInput}>
                  <option value="10">10% Annual Interest</option>
                  <option value="12">12% Annual Interest</option>
                  <option value="15">15% Annual Interest</option>
                </select>
                <select value={loanTerm} onChange={(e) => setLoanTerm(e.target.value)} style={calcInput}>
                  <option value="3">3 Months Term</option>
                  <option value="6">6 Months Term</option>
                  <option value="12">12 Months (1 Year)</option>
                </select>
                <button style={fullBtn} onClick={handleCalculateLoan}>Calculate Repayment</button>
            </div>
            {calculatedRepayment && (
              <div style={{background:'#f0fdf4', padding:'12px', borderRadius:'10px', marginBottom:'15px'}}>
                <div style={{fontSize:'11px', color:'#166534', fontWeight:'bold'}}>ESTIMATED MONTHLY REPAYMENT</div>
                <div style={{fontSize:'20px', fontWeight:'900', color:'#15803d'}}>KSh {parseFloat(calculatedRepayment).toLocaleString()}</div>
              </div>
            )}
            <button onClick={() => { setShowLoanCalc(false); setCalculatedRepayment(null); }} style={closeBtnSmall}>Cancel</button>
          </div>
        )}

        {/* 15. COMPARISON TOOLBAR */}
        {compareList.length > 0 && (
          <div style={compareBar}>
            <div style={{fontSize:'13px', fontWeight:'bold'}}>Comparing ({compareList.length}/3)</div>
            <div style={{display:'flex', gap:'10px'}}>
              {compareList.map(id => {
                const found = houses.find(h => h.id === id);
                return (
                  <div key={id} style={compareChip}>
                    {found ? found.type : "Property"} 
                    <span onClick={() => toggleCompare(id)} style={{marginLeft:'8px', cursor:'pointer', color:'#ef4444'}}>×</span>
                  </div>
                );
              })}
            </div>
            <button style={viewCompareBtn} onClick={() => setShowCompareMatrix(true)}>View Matrix</button>
          </div>
        )}

        {/* 15B. COMPARISON MATRIX MODAL */}
        {showCompareMatrix && (
          <div style={modalOverlay}>
            <div style={{ ...houseModal, maxWidth: '800px', padding: '30px' }}>
              <button style={closeModal} onClick={() => setShowCompareMatrix(false)}>✕</button>
              <h2 style={{marginBottom:'20px'}}>Property Comparison Matrix</h2>
              <table style={{width:'100%', borderCollapse:'collapse', textAlign:'left'}}>
                <thead>
                  <tr style={{borderBottom:'2px solid #e2e8f0'}}>
                    <th style={{padding:'10px'}}>Feature</th>
                    {compareList.map(id => <th key={id} style={{padding:'10px'}}>{houses.find(x => x.id === id)?.type}</th>)}
                  </tr>
                </thead>
                <tbody>
                  <tr style={{borderBottom:'1px solid #e2e8f0'}}>
                    <td style={{padding:'10px', fontWeight:'bold'}}>Rent</td>
                    {compareList.map(id => <td key={id} style={{padding:'10px'}}>KSh {houses.find(x => x.id === id)?.price.toLocaleString()}</td>)}
                  </tr>
                  <tr style={{borderBottom:'1px solid #e2e8f0'}}>
                    <td style={{padding:'10px', fontWeight:'bold'}}>Location</td>
                    {compareList.map(id => <td key={id} style={{padding:'10px'}}>{houses.find(x => x.id === id)?.location}</td>)}
                  </tr>
                  <tr style={{borderBottom:'1px solid #e2e8f0'}}>
                    <td style={{padding:'10px', fontWeight:'bold'}}>Safety</td>
                    {compareList.map(id => <td key={id} style={{padding:'10px'}}>{houses.find(x => x.id === id)?.safety}%</td>)}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ADD PROPERTY MODAL (AGENT ONLY) */}
        {showAddModal && isAgent && (
          <div style={modalOverlay}>
            <div style={{...houseModal, maxWidth:'450px', padding:'30px'}}>
              <button style={closeModal} onClick={() => setShowAddModal(false)}>✕</button>
              <h3>Register New Ebenezer Property</h3>
              <p style={{fontSize:'12px', color:'#64748b', margin:'-5px 0 15px 0'}}>Coordinates captured: {newPropertyCoords ? `${newPropertyCoords[0].toFixed(4)}, ${newPropertyCoords[1].toFixed(4)}` : ''}</p>
              <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
                <input style={calcInput} placeholder="Property Type (e.g., 2 Bedroom)" value={newHouseData.type} onChange={(e) => setNewHouseData({...newHouseData, type: e.target.value})} />
                <input style={calcInput} placeholder="Monthly Rent (KSh)" type="number" value={newHouseData.price} onChange={(e) => setNewHouseData({...newHouseData, price: e.target.value})} />
                <input style={calcInput} placeholder="Location Area (e.g., Limuru)" value={newHouseData.location} onChange={(e) => setNewHouseData({...newHouseData, location: e.target.value})} />
                <button style={fullBtn} onClick={handleAddProperty}>Submit Verification</button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* 16. MOBILE LIST TOGGLE */}
      <button onClick={() => setIsMobileListOpen(!isMobileListOpen)} style={mobileTrigger}>
        {isMobileListOpen ? '🗺️ Close List' : '📋 Show Listings'}
      </button>

      <style>{`
        body { margin: 0; overflow: hidden; background: #f0f2f5; font-family: 'Inter', sans-serif; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #cbd5e0; border-radius: 10px; }
        .custom-marker { transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .custom-marker:hover { transform: scale(1.25) translateY(-2px); z-index: 10000; }
        
        /* Classy Elegant Mobile Enhancements */
        @media (max-width: 768px) {
            header { padding: 10px !important; }
            aside { 
                width: 100% !important; 
                background: rgba(255, 255, 255, 0.9) !important;
                backdrop-filter: blur(20px);
                border-radius: 40px 40px 0 0 !important;
                box-shadow: 0 -20px 40px rgba(0,0,0,0.1) !important;
            }
            .mobile-trigger {
                background: linear-gradient(135deg, #1a73e8 0%, #1e293b 100%) !important;
                box-shadow: 0 10px 40px rgba(26,115,232,0.4) !important;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .house-modal { 
                width: 95% !important; 
                height: 90% !important; 
                border-radius: 40px !important; 
                overflow-y: auto !important; 
            }
            .modal-split { flex-direction: column !important; }
            .modal-gallery { padding: 20px !important; min-width: 100% !important; }
            .modal-details { padding: 20px !important; min-width: 100% !important; }
        }
      `}</style>
    </div>
  );
};

// --- STYLING OBJECTS ---
const rootStyle = { display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'Inter, sans-serif' };
const navStyle = { padding: '12px 24px', background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 200 };
const brandName = { margin: 0, fontSize: '1.2rem', fontWeight: '900', color: '#1a202c' };
const onlineStatus = { fontSize: '10px', color: '#48bb78', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' };
const dot = { fontSize: '14px' };
const logoCircle = { width: '35px', height: '35px', background: '#1a73e8', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' };
const desktopNav = { display: 'flex', gap: '10px' };
const toolBtn = { padding: '8px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: '600' };

const mainBody = { flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' };
const sidebarStyle = (isOpen) => ({
  width: '400px', background: '#f8fafc', borderRight: '1px solid #e2e8f0', zIndex: 150, overflowY: 'auto', transition: '0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  position: window.innerWidth < 768 ? 'absolute' : 'relative', height: '100%',
  transform: window.innerWidth < 768 && !isOpen ? 'translateX(-100%)' : 'translateX(0)',
  bottom: 0
});

const searchWrapper = { marginBottom: '20px' };
const searchInput = { width: '100%', padding: '12px 16px', borderRadius: '14px', border: '1px solid #e2e8f0', outline: 'none', background: '#fff', fontSize: '14px' };
const budgetBox = { marginBottom: '20px', padding: '15px', background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0' };
const labelStyle = { fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '8px' };

const tabContainer = { display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '15px' };
const tabStyle = (active) => ({ padding: '8px 16px', borderRadius: '25px', border: 'none', background: active ? '#1a73e8' : '#fff', color: active ? '#fff' : '#64748b', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' });

const listGrid = { display: 'flex', flexDirection: 'column', gap: '15px' };
const cardStyle = (active, color) => ({
  padding: '20px', borderRadius: '18px', background: '#fff', cursor: 'pointer', border: active ? `2px solid ${color}` : '1px solid #e2e8f0',
  boxShadow: active ? '0 10px 25px rgba(0,0,0,0.08)' : '0 4px 6px rgba(0,0,0,0.02)', transition: '0.3s', position: 'relative'
});

const featuredTag = { position: 'absolute', top: '-10px', left: '20px', background: '#f59e0b', color: '#fff', fontSize: '9px', fontWeight: '900', padding: '3px 10px', borderRadius: '20px' };
const propertyTitle = { fontSize: '15px', fontWeight: '800', color: '#1e293b' };
const priceText = { fontSize: '1.4rem', fontWeight: '900', color: '#1a73e8', margin: '8px 0' };
const metaRow = { display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', marginBottom: '12px' };
const statGrid = { display: 'flex', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' };
const miniStat = { fontSize: '10px', fontWeight: 'bold', color: '#94a3b8', background: '#f8fafc', padding: '4px 8px', borderRadius: '6px' };
const heartBtn = { background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' };
const compareBtn = (active) => ({ width: '100%', marginTop: '12px', padding: '8px', borderRadius: '10px', border: active ? '1px solid #1a73e8' : '1px solid #e2e8f0', background: active ? '#eff6ff' : '#fff', color: active ? '#1a73e8' : '#64748b', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' });

const mapTypeToggle = { position: 'absolute', top: '20px', left: '420px', display: 'flex', background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', zIndex: 100 };
const toggleItem = (active) => ({ padding: '10px 18px', border: 'none', background: active ? '#1e293b' : '#fff', color: active ? '#fff' : '#64748b', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' });

const modalOverlay = { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' };

const houseModal = { width: '100%', maxWidth: '900px', background: '#fff', borderRadius: '30px', position: 'relative', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' };
const closeModal = { position: 'absolute', top: '20px', right: '20px', border: 'none', background: '#f1f5f9', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', zIndex: 1010 };
const modalSplit = { display: 'flex', flexWrap: 'wrap', minHeight: '500px' };
const modalGallery = { flex: 1, minWidth: '350px', background: '#f1f5f9', padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' };
const amenityGrid = { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '20px' };
const badge = { padding: '6px 14px', background: '#fff', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold', color: '#1e293b', border: '1px solid #e2e8f0' };

const modalDetails = { flex: 1, minWidth: '350px', padding: '40px' };
const middlemanNotice = { color: '#1a73e8', fontWeight: 'bold', fontSize: '12px', margin: '5px 0 20px 0' };
const trustBar = { display: 'flex', gap: '15px', marginBottom: '25px' };
const trustItem = { fontSize: '12px', color: '#059669', fontWeight: 'bold', padding: '5px 12px', background: '#ecfdf5', borderRadius: '8px' };
const calcSummary = { background: '#f8fafc', padding: '20px', borderRadius: '18px', marginBottom: '25px' };
const calcRow = { display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b', marginBottom: '8px' };
const calcTotal = { display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '900', color: '#1e293b', borderTop: '1px solid #e2e8f0', paddingTop: '10px' };
const actionBlock = { display: 'flex', gap: '12px' };
const waBtn = { flex: 1, padding: '16px', background: '#25D366', color: '#fff', border: 'none', borderRadius: '14px', fontWeight: 'bold', cursor: 'pointer' };
const bookBtn = { flex: 1, padding: '16px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: '14px', fontWeight: 'bold', cursor: 'pointer' };

const toastStyle = { position: 'absolute', top: '80px', left: '50%', transform: 'translateX(-50%)', background: '#1e293b', color: '#fff', padding: '10px 25px', borderRadius: '30px', fontSize: '12px', fontWeight: 'bold', zIndex: 500, boxShadow: '0 10px 25px rgba(0,0,0,0.2)' };
const mobileTrigger = { position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)', padding: '15px 30px', background: '#1a73e8', color: '#fff', borderRadius: '40px', border: 'none', fontWeight: 'bold', zIndex: 1000, boxShadow: '0 10px 30px rgba(26,115,232,0.4)', display: window.innerWidth < 768 ? 'block' : 'none' };
const closeIcon = {flex: 1, padding: '16px', background: '#25D366', color: '#fff', border: 'none', borderRadius: '14px', fontWeight: 'bold', cursor: 'pointer'}
const loanModal = { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '320px', background: '#fff', padding: '30px', borderRadius: '24px', boxShadow: '0 25px 70px rgba(0,0,0,0.3)', zIndex: 2000, textAlign: 'center' };
const calcInput = { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '10px', outline: 'none' };
const fullBtn = { width: '100%', padding: '12px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' };
const closeBtnSmall = { background: 'none', border: 'none', color: '#64748b', fontSize: '12px', cursor: 'pointer', marginTop: '10px' };

const compareBar = { position: 'absolute', bottom: '20px', right: '20px', left: '420px', background: '#fff', padding: '12px 25px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', zIndex: 500 };
const compareChip = { background: '#f1f5f9', padding: '6px 12px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center' };
const viewCompareBtn = { background: '#1e293b', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold', cursor:'pointer' };

const storySection = { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' };
const avatarCircle = { 
    width: '42px', height: '42px', 
    background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', 
    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', 
    color: '#fff', fontWeight: 'bold', border: '2px solid #fff', boxShadow: '0 0 0 2px #e1306c' 
};
const handleName = { margin: 0, fontSize: '14px', fontWeight: '700', color: '#1e293b' };
const captionBox = { fontSize: '13px', lineHeight: '1.5', color: '#1e293b', marginBottom: '20px', padding: '0 5px' };

const instagramActionBar = { display: 'flex', gap: '8px', marginTop: '10px' };
const dmBtn = { 
    flex: 2, padding: '12px', background: '#0095f6', color: '#fff', 
    border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' 
};
const shareBtn = { 
    flex: 1, padding: '12px', background: '#efefef', color: '#000', 
    border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' 
};


export default MapDisplay;