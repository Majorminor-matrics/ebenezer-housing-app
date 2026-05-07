import React, { useState, useEffect } from 'react';

/**
 * WORLD-CLASS PROPERTY HUB & COMMUNITY PLATFORM
 * Designed to link with the Ebenezer Map Engine.
 */
const PropertyHub = ({ currentUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState('chat'); // chat, community, reviews, account
  const [isLandlord, setIsLandlord] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Agent Tom', text: 'Hello! I saw you viewing the 2BR in Tigoni. Want a video tour?', time: '10:05 AM', isMe: false },
    { id: 2, sender: 'Me', text: 'Yes! Does it have a balcony facing the hills?', time: '10:07 AM', isMe: true },
  ]);
  const [newMessage, setNewMessage] = useState('');

  // --- SUB-COMPONENT: iMESSAGE STYLE CHAT ---
  const ChatInterface = () => (
    <div style={chatContainer}>
      <div style={chatHeader}>
        <div style={avatar}>AT</div>
        <div>
          <div style={chatName}>Agent Tom (Ebenezer)</div>
          <div style={statusText}>Active now</div>
        </div>
      </div>
      <div style={messageList}>
        {messages.map((m) => (
          <div key={m.id} style={m.isMe ? myMsgRow : theirMsgRow}>
            <div style={m.isMe ? myBubble : theirBubble}>{m.text}</div>
            <div style={msgTime}>{m.time}</div>
          </div>
        ))}
      </div>
      <div style={inputArea}>
        <input 
          style={iosInput} 
          placeholder="iMessage" 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button style={sendBtn} onClick={() => {
          if(!newMessage) return;
          setMessages([...messages, { id: Date.now(), sender: 'Me', text: newMessage, time: 'Now', isMe: true }]);
          setNewMessage('');
        }}>↑</button>
      </div>
    </div>
  );

  // --- SUB-COMPONENT: COMMUNITY HUB ---
  const CommunityHub = () => (
    <div style={scrollContent}>
      <h2 style={sectionTitle}>Resident Community</h2>
      <p style={subTitle}>Talk to people living in Limuru Town Complexes</p>
      
      <div style={communityCard}>
        <div style={tag}>Live Discussion</div>
        <h4>"Is the water stable at K-Heights apartments?"</h4>
        <div style={userRow}>
          <div style={smallAvatar}>JK</div>
          <span>Jane K: "Yes, we have a borehole backup!"</span>
        </div>
      </div>

      <div style={pollCard}>
        <h4>Best Fiber Provider in Area?</h4>
        <button style={pollOption}>Safaricom Home (65%)</button>
        <button style={pollOption}>Zuku (35%)</button>
      </div>
    </div>
  );

  // --- SUB-COMPONENT: REVIEWS & RATINGS ---
  const ReviewSection = () => (
    <div style={scrollContent}>
      <h2 style={sectionTitle}>Property Reviews</h2>
      <div style={ratingSummary}>
        <div style={bigRating}>4.8</div>
        <div>Based on 124 verified tenants</div>
      </div>

      {[1, 2].map(r => (
        <div key={r} style={reviewCard}>
          <div style={{display:'flex', justifyContent:'space-between'}}>
            <strong>Mukungu E.</strong>
            <span>⭐⭐⭐⭐⭐</span>
          </div>
          <p style={reviewText}>The middleman service was excellent. Found a house in 2 hours near Limuru town. No hidden charges!</p>
          <div style={reviewMeta}>Verified Tenant • Oct 2025</div>
        </div>
      ))}
    </div>
  );

  return (
    <div style={hubWrapper}>
      {/* 1. LEFT NAVIGATION BAR */}
      <nav style={sideNav}>
        <div style={brand}>E.</div>
        <button style={navIcon(activeTab==='chat')} onClick={()=>setActiveTab('chat')}>💬</button>
        <button style={navIcon(activeTab==='community')} onClick={()=>setActiveTab('community')}>👥</button>
        <button style={navIcon(activeTab==='reviews')} onClick={()=>setActiveTab('reviews')}>⭐</button>
        <button style={navIcon(activeTab==='account')} onClick={()=>setActiveTab('account')}>👤</button>
      </nav>

      {/* 2. MAIN CONTENT AREA */}
      <div style={contentArea}>
        {activeTab === 'chat' && <ChatInterface />}
        {activeTab === 'community' && <CommunityHub />}
        {activeTab === 'reviews' && <ReviewSection />}
        {activeTab === 'account' && (
          <div style={scrollContent}>
            <h2 style={sectionTitle}>My Profile</h2>
            <div style={profileCard}>
              <div style={largeAvatar}>EM</div>
              <h3>Eric Mukungu</h3>
              <div style={verifiedBadge}>✓ Verified Tenant</div>
            </div>
            <div style={statsRow}>
              <div style={statBox}><h4>12</h4><span>Viewings</span></div>
              <div style={statBox}><h4>KSh 2.4k</h4><span>Saved</span></div>
            </div>
            <button style={logoutBtn} onClick={onLogout}>Sign Out</button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- WORLD CLASS STYLES (iOS / Modern Web Aesthetic) ---
const hubWrapper = { display: 'flex', height: '100vh', background: '#F2F2F7', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica' };
const sideNav = { width: '80px', background: '#1C1C1E', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '30px 0', gap: '20px' };
const brand = { color: '#0A84FF', fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' };
const navIcon = (active) => ({ background: active ? '#0A84FF' : 'transparent', border: 'none', fontSize: '20px', padding: '12px', borderRadius: '15px', cursor: 'pointer', transition: '0.3s' });

const contentArea = { flex: 1, display: 'flex', justifyContent: 'center', overflow: 'hidden' };
const chatContainer = { width: '100%', maxWidth: '500px', background: '#fff', display: 'flex', flexDirection: 'column', borderRight: '1px solid #D1D1D6' };
const chatHeader = { padding: '20px', borderBottom: '1px solid #D1D1D6', display: 'flex', gap: '15px', alignItems: 'center' };
const avatar = { width: '45px', height: '45px', background: '#E5E5EA', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' };
const chatName = { fontWeight: '600', fontSize: '17px' };
const statusText = { fontSize: '12px', color: '#34C759' };

const messageList = { flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' };
const myMsgRow = { alignSelf: 'flex-end', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', maxWidth: '80%' };
const theirMsgRow = { alignSelf: 'flex-start', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', maxWidth: '80%' };
const myBubble = { background: '#007AFF', color: '#fff', padding: '10px 16px', borderRadius: '20px 20px 4px 20px', fontSize: '15px' };
const theirBubble = { background: '#E5E5EA', color: '#000', padding: '10px 16px', borderRadius: '20px 20px 20px 4px', fontSize: '15px' };
const msgTime = { fontSize: '10px', color: '#8E8E93', marginTop: '4px' };

const inputArea = { padding: '15px 20px', display: 'flex', gap: '10px', alignItems: 'center', background: '#F9F9F9' };
const iosInput = { flex: 1, padding: '10px 18px', borderRadius: '25px', border: '1px solid #C6C6C8', outline: 'none' };
const sendBtn = { width: '35px', height: '35px', borderRadius: '50%', background: '#007AFF', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' };

const scrollContent = { width: '100%', maxWidth: '600px', padding: '40px', overflowY: 'auto' };
const sectionTitle = { fontSize: '34px', fontWeight: '800', marginBottom: '10px' };
const subTitle = { color: '#8E8E93', marginBottom: '30px' };

const communityCard = { background: '#fff', padding: '20px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', marginBottom: '20px' };
const tag = { display: 'inline-block', padding: '4px 8px', background: '#FF3B30', color: '#fff', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold', marginBottom: '10px' };
const userRow = { display: 'flex', gap: '10px', alignItems: 'center', marginTop: '15px', fontSize: '13px' };
const smallAvatar = { width: '24px', height: '24px', background: '#E5E5EA', borderRadius: '50%', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' };

const ratingSummary = { display: 'flex', alignItems: 'center', gap: '20px', background: '#1C1C1E', color: '#fff', padding: '25px', borderRadius: '20px', marginBottom: '30px' };
const bigRating = { fontSize: '48px', fontWeight: 'bold', color: '#FFD60A' };

const reviewCard = { background: '#fff', padding: '20px', borderRadius: '20px', marginBottom: '15px', border: '1px solid #E5E5EA' };
const reviewText = { fontSize: '14px', color: '#3A3A3C', lineHeight: '1.5' };
const reviewMeta = { fontSize: '11px', color: '#8E8E93', marginTop: '10px' };

const profileCard = { textAlign: 'center', background: '#fff', padding: '40px', borderRadius: '30px', marginBottom: '20px' };
const largeAvatar = { width: '100px', height: '100px', background: '#0A84FF', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '32px', fontWeight: 'bold' };
const verifiedBadge = { color: '#0A84FF', fontWeight: 'bold', fontSize: '14px', marginTop: '10px' };

const statsRow = { display: 'flex', gap: '15px', marginBottom: '30px' };
const statBox = { flex: 1, background: '#fff', padding: '20px', borderRadius: '20px', textAlign: 'center' };
const logoutBtn = { width: '100%', padding: '18px', borderRadius: '15px', background: '#FF3B30', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' };
const pollCard = { background: '#fff', padding: '20px', borderRadius: '20px' };
const pollOption = { width: '100%', padding: '12px', textAlign: 'left', borderRadius: '10px', border: '1px solid #E5E5EA', background: '#fff', marginBottom: '8px', cursor: 'pointer' };

export default PropertyHub;