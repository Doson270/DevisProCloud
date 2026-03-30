import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { saveFullDevis } from './services/api';
import Auth from './components/Auth';
import './index.css';

// Composants
import Configuration from './components/Configuration';
import GestionClients from './components/GestionClients';
import Historique from './components/Historique';
import Factures from './components/HistoriqueFactures'; // Assure-toi que le nom du fichier est exact
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

  // CALCULS
  const totalHT = items.reduce((acc, item) => acc + (item.quantite * item.prix), 0);
  const totalTTC = totalHT * (1 + tvaRate / 100);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  const handleSave = async () => {
    if (!client.id) return alert("Veuillez sélectionner ou créer un client avant d'enregistrer.");
    
    try {
      await saveFullDevis({ session, provider, client, items, totalHT, totalTTC, tvaRate });
      alert("✅ Devis enregistré !");
      setView('historique'); // Redirection automatique vers l'historique
    } catch (err) { 
      alert("Erreur lors de l'enregistrement : " + err.message); 
    }
  };

  if (!session) return <Auth />;

  return (
    <div className="app-container">
      {/* BOUTON BURGER (Mobile) */}
      <button className="burger-menu" onClick={() => setIsMenuOpen(!isMenuOpen)}>
        {isMenuOpen ? '✕' : '☰'}
      </button>

      {/* SIDEBAR NAVIGATION */}
      <nav className={`sidebar ${isMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>🛠️ ArtisanPro</h2>
        </div>
        <div className="nav-list">
          <button 
            onClick={() => { setView('devis'); setIsMenuOpen(false); }} 
            className={`nav-btn ${view === 'devis' ? 'active' : ''}`}
          >
            ➕ Nouveau Devis
          </button>
          
          <button 
            onClick={() => { setView('historique'); setIsMenuOpen(false); }} 
            className={`nav-btn ${view === 'historique' ? 'active' : ''}`}
          >
            📋 Historique Devis
          </button>

          <button 
            onClick={() => { setView('factures'); setIsMenuOpen(false); }} 
            className={`nav-btn ${view === 'factures' ? 'active' : ''}`}
          >
            🧾 Mes Factures
          </button>

          <button 
            onClick={() => { setView('clients'); setIsMenuOpen(false); }} 
            className={`nav-btn ${view === 'clients' ? 'active' : ''}`}
          >
            👥 Mes Clients
          </button>

          <button 
            onClick={() => { setView('config'); setIsMenuOpen(false); }} 
            className={`nav-btn ${view === 'config' ? 'active' : ''}`}
          >
            ⚙️ Paramètres
          </button>

          <button 
            onClick={() => supabase.auth.signOut()} 
            className="nav-btn logout-btn" 
            style={{ marginTop: 'auto', color: '#e74c3c', fontWeight: 'bold' }}
          >
            Déconnexion
          </button>
        </div>
      </nav>

      {/* ZONE DE CONTENU PRINCIPAL */}
      <main className="main-content">
        
        {/* VUE : CRÉATION DE DEVIS */}
        {view === 'devis' && (
          <div className="devis-view">
            <h1>Nouveau Devis</h1>
            
            <SectionsCoordonnees 
              entreprise={provider} 
              setEntreprise={setProvider} 
              client={client} 
              setClient={setClient} 
              session={session} 
            />
            
            <div className="section-card">
              <ArticlesTable items={items} setItems={setItems} />
            </div>

            <div className="section-card" style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
                
                {/* Sélecteur de TVA */}
                <div style={{ flex: '1', minWidth: '200px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#666' }}>Taux de TVA applicable :</label>
                  <select 
                    value={tvaRate} 
                    onChange={(e) => setTvaRate(parseFloat(e.target.value))} 
                    className="status-select" 
                    style={{ width: '100%', maxWidth: '300px' }}
                  >
                    <option value="0">0% (Auto-entrepreneur / Franchise TVA)</option>
                    <option value="5.5">5,5% (Rénovation énergétique)</option>
                    <option value="10">10% (Rénovation / Amélioration)</option>
                    <option value="20">20% (Taux normal)</option>
                  </select>
                </div>

                {/* Résumé des totaux */}
                <div style={{ textAlign: 'right', minWidth: '200px' }}>
                  <p style={{ margin: '5px 0', color: '#666' }}>Total HT : <strong>{totalHT.toFixed(2)} €</strong></p>
                  <p style={{ margin: '5px 0', color: '#666' }}>Montant TVA : <strong>{(totalTTC - totalHT).toFixed(2)} €</strong></p>
                  <h2 style={{ color: 'var(--accent)', margin: '10px 0 0 0', fontSize: '1.8rem' }}>
                    Total TTC : {totalTTC.toFixed(2)} €
                  </h2>
                </div>
              </div>

              <div style={{ marginTop: '30px', textAlign: 'right' }}>
                <button onClick={handleSave} className="btn-save" style={{ padding: '12px 30px', fontSize: '1rem' }}>
                  💾 Enregistrer et Finaliser le Devis
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VUES ALTERNATIVES */}
        {view === 'historique' && <Historique session={session} />}
        
        {view === 'factures' && <Factures session={session} />}
        
        {view === 'clients' && <GestionClients session={session} />}
        
        {view === 'config' && <Configuration session={session} />}

        {/* L'IA reste accessible partout */}
        <ChatIA />
      </main>
    </div>
  );
}

export default App;