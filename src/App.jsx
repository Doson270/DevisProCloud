import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { saveFullDevis } from './services/api';
import Auth from './components/Auth';
import './index.css';

// Composants
import Configuration from './components/Configuration';
import GestionClients from './components/GestionClients';
import Historique from './components/Historique';
import { SectionsCoordonnees } from './components/SectionsCoordonnees';
import ArticlesTable from './components/ArticlesTable';
import ChatIA from './components/ChatIA';

function App() {
  const [session, setSession] = useState(null);
  const [view, setView] = useState('devis');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // ÉTATS DEVIS
  const [provider, setProvider] = useState({ id: null, nom: '', adresse: '', siret: '' });
  const [client, setClient] = useState({ id: null, nom: '', adresse: '' });
  const [items, setItems] = useState([{ id: Date.now(), description: '', quantite: 1, prix: 0 }]);
  const [tvaRate, setTvaRate] = useState(20);

  const totalHT = items.reduce((acc, item) => acc + (item.quantite * item.prix), 0);
  const totalTTC = totalHT * (1 + tvaRate / 100);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  const handleSave = async () => {
    try {
      await saveFullDevis({ session, provider, client, items, totalHT, totalTTC, tvaRate });
      alert("✅ Devis enregistré !");
      setView('historique');
    } catch (err) { alert(err.message); }
  };

  if (!session) return <Auth />;

  return (
    <div className="app-container">
      {/* BOUTON BURGER */}
      <button className="burger-menu" onClick={() => setIsMenuOpen(!isMenuOpen)}>
        {isMenuOpen ? '✕' : '☰'}
      </button>

      {/* SIDEBAR */}
      <nav className={`sidebar ${isMenuOpen ? 'open' : ''}`}>
        <h2>🛠️ ArtisanPro</h2>
        <div className="nav-list">
          <button onClick={() => { setView('devis'); setIsMenuOpen(false); }} className={`nav-btn ${view === 'devis' ? 'active' : ''}`}>➕ Nouveau Devis</button>
          <button onClick={() => { setView('historique'); setIsMenuOpen(false); }} className={`nav-btn ${view === 'historique' ? 'active' : ''}`}>📋 Historique</button>
          <button onClick={() => { setView('clients'); setIsMenuOpen(false); }} className={`nav-btn ${view === 'clients' ? 'active' : ''}`}>👥 Mes Clients</button>
          <button onClick={() => { setView('config'); setIsMenuOpen(false); }} className={`nav-btn ${view === 'config' ? 'active' : ''}`}>⚙️ Paramètres</button>
          <button onClick={() => supabase.auth.signOut()} className="nav-btn" style={{ marginTop: 'auto', color: 'var(--danger)' }}>🚪 Déconnexion</button>
        </div>
      </nav>

      {/* CONTENU */}
      <main className="main-content">
        {view === 'devis' && (
          <div className="devis-view">
            <h1>Nouveau Devis</h1>
            <SectionsCoordonnees entreprise={provider} setEntreprise={setProvider} client={client} setClient={setClient} session={session} />
            
            <div className="section-card">
              <ArticlesTable items={items} setItems={setItems} />
            </div>

            <div className="section-card" style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px', alignItems: 'center' }}>
                <select value={tvaRate} onChange={(e) => setTvaRate(parseFloat(e.target.value))} style={{ width: '40%' }}>
                  <option value="0">0% (Auto-entrepreneur / Exonéré)</option>
                  <option value="5.5">5,5% (Rénovation énergétique)</option>
                  <option value="10">10% (Rénovation / Amélioration)</option>
                  <option value="20">20% (Taux normal / Neuf)</option>
                </select>
                <div>
                  <p>Total HT : {totalHT.toFixed(2)} €</p>
                  <h2 style={{ color: 'var(--accent)' }}>Total TTC : {totalTTC.toFixed(2)} €</h2>
                </div>
              </div>
              <button onClick={handleSave} className="btn-save">💾 Enregistrer le devis</button>
            </div>
          </div>
        )}

        {view === 'historique' && <Historique session={session} />}
        {view === 'clients' && <GestionClients session={session} />}
        {view === 'config' && <Configuration session={session} />}

        <ChatIA />
      </main>
    </div>
  );
}

export default App;