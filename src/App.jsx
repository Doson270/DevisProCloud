import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { SectionsCoordonnees } from './components/SectionsCoordonnees';
import ChatIA from './components/ChatIA';
import Auth from './components/Auth';
import './App.css';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('devis');

  // --- 📦 ÉTATS DES DONNÉES (MODÈLE) ---
  const [provider, setProvider] = useState({ id: null, nom: '', adresse: '', siret: '' });
  const [client, setClient] = useState({ id: null, nom: '', adresse: '' });
  const [items, setItems] = useState([{ id: Date.now(), description: '', quantite: 1, prix: 0 }]);
  const [tvaRate, setTvaRate] = useState(20);

  // --- 📁 ÉTATS DES LISTES (SÉCURISÉES PAR USER_ID) ---
  const [savedProviders, setSavedProviders] = useState([]);
  const [savedClients, setSavedClients] = useState([]);
  const [historiqueDevis, setHistoriqueDevis] = useState([]);

  // --- 🔐 GESTION AUTHENTIFICATION ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // --- 📥 CHARGEMENT DES DONNÉES SÉCURISÉ (BACKEND-STYLE) ---
  const fetchData = async () => {
    if (!session || !session.user) return;

    // 1. Récupérer les Entreprises de l'utilisateur connecté uniquement
    const { data: entData, error: entErr } = await supabase
      .from('entreprises')
      .select('*')
      .eq('user_id', session.user.id) // <--- SÉCURITÉ USER
      .order('nom');
    
    if (!entErr) setSavedProviders(entData || []);

    // 2. Récupérer les Clients filtrés par l'entreprise choisie ET l'user
    if (provider && provider.id) {
      const { data: cliData, error: cliErr } = await supabase
        .from('clients')
        .select('*')
        .eq('entreprise_id', provider.id) // <--- FILTRE ENTREPRISE
        .eq('user_id', session.user.id)   // <--- DOUBLE SÉCURITÉ USER
        .order('nom');
      
      if (!cliErr) setSavedClients(cliData || []);
    } else {
      setSavedClients([]); // On vide si aucune entreprise n'est sélectionnée
    }

    // 3. Récupérer l'Historique de l'utilisateur
    const { data: histData } = await supabase
      .from('devis')
      .select('*, clients(nom)')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
    
    if (histData) setHistoriqueDevis(histData);
  };

  // Déclencheur de mise à jour des données
  useEffect(() => {
    fetchData();
  }, [session, view, provider.id]); // Re-filtre les clients dès que l'entreprise change

  // --- 🛠️ LOGIQUE CRUD ARTICLES ---
  const addItem = () => setItems([...items, { id: Date.now(), description: '', quantite: 1, prix: 0 }]);
  const updateItem = (id, field, value) => setItems(items.map(it => it.id === id ? { ...it, [field]: value } : it));
  const removeItem = (id) => items.length > 1 && setItems(items.filter(it => it.id !== id));

  // --- 🧮 CALCULS ---
  const totalHT = items.reduce((sum, it) => sum + (it.quantite * it.prix), 0);
  const totalTVA = totalHT * (tvaRate / 100);
  const totalTTC = totalHT + totalTVA;

  // --- 💾 SAUVEGARDE ENTREPRISE ---
  const handleSaveEntreprise = async () => {
    if (!provider.nom) return alert("Veuillez saisir un nom d'entreprise");
    
    const { error } = await supabase.from('entreprises').upsert([{ 
      id: provider.id || undefined, 
      nom: provider.nom, 
      adresse: provider.adresse, 
      siret: provider.siret,
      user_id: session.user.id // Liaison forcée à l'utilisateur
    }]);

    if (error) {
      alert("Erreur: " + error.message);
    } else {
      alert("✅ Configuration entreprise enregistrée !");
      fetchData();
    }
  };

  if (loading) return <div className="loader-saas">Chargement de votre espace sécurisé...</div>;
  if (!session) return <Auth />;

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}
      <aside className="sidebar no-print">
        <div className="sidebar-brand">
          <div className="brand-logo">AP</div>
          <span className="brand-name">Artisan<span>Pro</span></span>
        </div>
        <nav className="sidebar-nav">
          <button className={view === 'devis' ? 'active' : ''} onClick={() => setView('devis')}>📝 Éditeur de Devis</button>
          <button className={view === 'historique' ? 'active' : ''} onClick={() => setView('historique')}>📊 Tableau de Bord</button>
        </nav>
        <div className="sidebar-footer">
           <div className="user-badge">
             <div className="avatar">{session.user.email[0].toUpperCase()}</div>
             <p className="user-name">{session.user.email.split('@')[0]}</p>
           </div>
           <button onClick={() => supabase.auth.signOut()} className="btn-signout">Déconnexion</button>
        </div>
      </aside>

      {/* CONTENU PRINCIPAL */}
      <main className="main-content">
        <header className="content-header no-print">
          <div className="header-title">
            <h2>{view === 'devis' ? 'Nouveau Devis' : 'Mes Archives'}</h2>
            <p>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>
          <div className="header-actions">
            {/* Bouton Quitter visible uniquement sur mobile via le CSS */}
            <button className="btn-logout-mobile" onClick={() => supabase.auth.signOut()}>
              Quitter
            </button>
            
            <button className="btn-secondary" onClick={() => window.print()}>🖨️ PDF</button>
            <button className="btn-primary" onClick={() => alert("Enregistrement du devis en cours...")}>💾 Sauvegarder</button>
          </div>
        </header>

        <div className="scroll-area">
          {view === 'devis' ? (
            /* --- PAPIER A4 --- */
            <div className="paper-canvas shadow-xl">
              <div className="devis-inner">
                <div className="devis-header-top">
                  <div className="devis-logo-zone">
                     <div className="logo-placeholder-premium">VOTRE LOGO</div>
                  </div>
                  <div className="devis-meta-zone text-right">
                    <h1 className="doc-type-title">DEVIS</h1>
                    <p className="doc-meta-text">N° : {new Date().getFullYear()}-001</p>
                  </div>
                </div>

                <div className="coords-wrapper">
                   <SectionsCoordonnees 
                      provider={provider} setProvider={setProvider} 
                      client={client} setClient={setClient} 
                      savedProviders={savedProviders} 
                      savedClients={savedClients} 
                    />
                    <div className="no-print" style={{marginTop: '15px'}}>
                      <button className="btn-save-mini" onClick={handleSaveEntreprise}>💾 Sauver mon profil entreprise</button>
                    </div>
                </div>

                <table className="modern-table devis-table">
                  <thead>
                    <tr>
                      <th>DÉSIGNATION</th>
                      <th className="text-center">QTÉ</th>
                      <th className="text-right">PRIX UNIT. HT</th>
                      <th className="text-right">TOTAL HT</th>
                      <th className="no-print"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td><input className="input-clean" value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} placeholder="Taille de haie, Peinture..." /></td>
                        <td className="text-center"><input type="number" className="input-clean text-center" value={item.quantite} onChange={(e) => updateItem(item.id, 'quantite', parseFloat(e.target.value) || 0)} /></td>
                        <td className="text-right"><input type="number" className="input-clean text-right" value={item.prix} onChange={(e) => updateItem(item.id, 'prix', parseFloat(e.target.value) || 0)} /></td>
                        <td className="text-right bold-text">{(item.quantite * item.prix).toFixed(2)} €</td>
                        <td className="no-print text-center"><button onClick={() => removeItem(item.id)} className="btn-del">✕</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <button onClick={addItem} className="btn-add-line no-print">+ Ajouter un article</button>

                <div className="devis-footer-grid">
                  <div className="signature-zone">
                    <p className="sig-title">Bon pour accord</p>
                    <div className="sig-box"></div>
                  </div>
                  <div className="totals-zone">
                    <div className="t-row"><span>Total HT</span> <span>{totalHT.toFixed(2)} €</span></div>
                    <div className="t-row">
                      <span>TVA ({tvaRate}%)</span>
                      <select className="no-print mini-select" value={tvaRate} onChange={(e) => setTvaRate(parseInt(e.target.value))}>
                        <option value="0">0%</option><option value="10">10%</option><option value="20">20%</option>
                      </select>
                      <span>{totalTVA.toFixed(2)} €</span>
                    </div>
                    <div className="t-row ttc-row"><span>TOTAL TTC</span> <span>{totalTTC.toFixed(2)} €</span></div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* --- HISTORIQUE --- */
            <div className="dashboard-view">
              <h2 className="section-title">Tableau de Bord</h2>
              <div className="history-card-list shadow-sm">
                <table className="history-table">
                  <thead>
                    <tr><th>Date</th><th>Client</th><th className="text-right">Montant TTC</th></tr>
                  </thead>
                  <tbody>
                    {historiqueDevis.length > 0 ? historiqueDevis.map((d) => (
                      <tr key={d.id}>
                        <td>{new Date(d.created_at).toLocaleDateString()}</td>
                        <td className="bold-text">{d.clients?.nom || 'Client Externe'}</td>
                        <td className="text-right bold-text">{d.total_ttc?.toFixed(2)} €</td>
                      </tr>
                    )) : (
                      <tr><td colSpan="3" className="text-center" style={{padding: '3rem'}}>Aucun document dans vos archives.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* IA BUBBLE */}
      <div className="ia-floating-bubble no-print">
        <ChatIA />
      </div>
    </div>
  );
}

export default App;