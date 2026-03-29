import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { SectionsCoordonnees } from './components/SectionsCoordonnees';
import Configuration from './components/Configuration'; // Ton nouveau composant CRUD
import ChatIA from './components/ChatIA';
import Auth from './components/Auth';
import './App.css';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('devis'); // Vues : 'devis', 'historique', 'config'

  // --- 📦 ÉTATS DES DONNÉES ---
  const [provider, setProvider] = useState({ id: null, nom: '', adresse: '', siret: '' });
  const [client, setClient] = useState({ id: null, nom: '', adresse: '' });
  const [items, setItems] = useState([{ id: Date.now(), description: '', quantite: 1, prix: 0 }]);
  const [tvaRate, setTvaRate] = useState(20);
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

  // --- 📥 CHARGEMENT DE L'HISTORIQUE ---
  const fetchHistorique = async () => {
    if (!session?.user) return;
    const { data } = await supabase
      .from('devis')
      .select('*, clients(nom)')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
    if (data) setHistoriqueDevis(data);
  };

  useEffect(() => {
    if (view === 'historique') fetchHistorique();
  }, [view, session]);

  // --- 🛠️ LOGIQUE ARTICLES ---
  const addItem = () => setItems([...items, { id: Date.now(), description: '', quantite: 1, prix: 0 }]);
  const updateItem = (id, field, value) => setItems(items.map(it => it.id === id ? { ...it, [field]: value } : it));
  const removeItem = (id) => items.length > 1 && setItems(items.filter(it => it.id !== id));

  const totalHT = items.reduce((sum, it) => sum + (it.quantite * it.prix), 0);
  const totalTVA = totalHT * (tvaRate / 100);
  const totalTTC = totalHT + totalTVA;

  // --- 💾 SAUVEGARDE DEVIS ---
  const handleSaveDevis = async () => {
    if (!provider.id) return alert("Veuillez sélectionner une entreprise dans l'éditeur");
    if (!client.nom) return alert("Veuillez saisir un nom de client");

    try {
      const { data: newDevis, error: devisError } = await supabase
        .from('devis')
        .insert([{
          user_id: session.user.id,
          entreprise_id: provider.id,
          total_ht: totalHT,
          total_ttc: totalTTC,
          tva_taux: tvaRate
        }])
        .select().single();

      if (devisError) throw devisError;

      const linesToInsert = items.map(it => ({
        devis_id: newDevis.id,
        user_id: session.user.id,
        service: it.description,
        qte: it.quantite,
        pu: it.prix
      }));

      await supabase.from('devis_items').insert(linesToInsert);
      alert("✅ Devis enregistré !");
      setView('historique');
    } catch (error) {
      alert("Erreur: " + error.message);
    }
  };

  if (loading) return <div className="loader-saas">Chargement sécurisé...</div>;
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
          <button className={view === 'historique' ? 'active' : ''} onClick={() => setView('historique')}>📊 Mes Archives</button>
          <button className={view === 'config' ? 'active' : ''} onClick={() => setView('config')}>⚙️ Configuration</button>
        </nav>
        <div className="sidebar-footer">
           <button onClick={() => supabase.auth.signOut()} className="btn-signout">Déconnexion</button>
        </div>
      </aside>

      {/* CONTENU PRINCIPAL */}
      <main className="main-content">
        <header className="content-header no-print">
          <h2>{view === 'devis' ? 'Nouveau Devis' : view === 'historique' ? 'Archives' : 'Paramètres'}</h2>
          <div className="header-actions">
            {view === 'devis' && (
              <>
                <button className="btn-secondary" onClick={() => window.print()}>🖨️ PDF</button>
                <button className="btn-primary" onClick={handleSaveDevis}>💾 Sauvegarder</button>
              </>
            )}
          </div>
        </header>

        <div className="scroll-area">
          {/* VUE 1 : L'ÉDITEUR */}
          {view === 'devis' && (
            <div className="paper-canvas shadow-xl">
              <div className="devis-inner">
                <div className="devis-header-top">
                  <div className="devis-logo-zone"><div className="logo-placeholder-premium">VOTRE LOGO</div></div>
                  <div className="devis-meta-zone text-right">
                    <h1 className="doc-type-title">DEVIS</h1>
                    <p className="doc-meta-text">N° : {new Date().getFullYear()}-001</p>
                  </div>
                </div>

                <SectionsCoordonnees 
                  entreprise={provider} 
                  setEntreprise={setProvider} 
                  client={client} 
                  setClient={setClient}
                  session={session}
                />

                <table className="modern-table devis-table">
                  <thead>
                    <tr><th>DÉSIGNATION</th><th className="text-center">QTÉ</th><th className="text-right">PRIX UNIT. HT</th><th className="text-right">TOTAL HT</th><th className="no-print"></th></tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td><input className="input-clean" value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} placeholder="Prestation..." /></td>
                        <td className="text-center"><input type="number" className="input-clean text-center" value={item.quantite} onChange={(e) => updateItem(item.id, 'quantite', parseFloat(e.target.value) || 0)} /></td>
                        <td className="text-right"><input type="number" className="input-clean text-right" value={item.prix} onChange={(e) => updateItem(item.id, 'prix', parseFloat(e.target.value) || 0)} /></td>
                        <td className="text-right bold-text">{(item.quantite * item.prix).toFixed(2)} €</td>
                        <td className="no-print text-center"><button onClick={() => removeItem(item.id)} className="btn-del">✕</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button onClick={addItem} className="btn-add-line no-print">+ Ajouter une ligne</button>

                <div className="devis-footer-grid">
                  <div className="signature-zone"><p className="sig-title">Bon pour accord</p><div className="sig-box"></div></div>
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
          )}

          {/* VUE 2 : L'HISTORIQUE */}
          {view === 'historique' && (
            <div className="dashboard-view">
              <table className="history-table">
                <thead><tr><th>Date</th><th>Montant TTC</th></tr></thead>
                <tbody>
                  {historiqueDevis.map((d) => (
                    <tr key={d.id}>
                      <td>{new Date(d.created_at).toLocaleDateString()}</td>
                      <td className="text-right">{d.total_ttc?.toFixed(2)} €</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* VUE 3 : LA CONFIGURATION (TON CRUD) */}
          {view === 'config' && <Configuration session={session} />}
        </div>
      </main>

      <div className="ia-floating-bubble no-print"><ChatIA /></div>
    </div>
  );
}

export default App; // L'export par défaut est bien présent ici !