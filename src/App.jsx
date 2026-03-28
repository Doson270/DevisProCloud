import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useDevis } from './hooks/useDevis';
import { useNotify } from './hooks/useNotify';
import { Toast } from './components/Toast';
import CreateDevis from './pages/CreateDevis';
import HistoryPage from './pages/HistoryPage';
import Auth from './components/Auth';
import './App.css';

function App() {
  // --- ÉTATS D'AUTHENTIFICATION ---
  const [session, setSession] = useState(null);

  // --- ÉTATS DE NAVIGATION ---
  const [view, setView] = useState('create'); // 'create' ou 'history'
  
  // --- HOOKS PERSONNALISÉS ---
  const devisTools = useDevis();
  const { notification, notify } = useNotify();

  // --- GESTION DE LA SESSION SUPABASE ---
  useEffect(() => {
    // 1. Vérifie s'il y a déjà une session active au lancement
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // 2. Écoute les changements (quand l'utilisateur se connecte ou se déconnecte)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Nettoyage de l'écouteur
    return () => subscription.unsubscribe();
  }, []);

  // --- ACTIONS ---

  const handleSelectDevis = (data) => {
    devisTools.loadFullDevis(data);
    setView('create');
    notify("Devis chargé avec succès !");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onSave = async () => {
    const success = await devisTools.handleSaveFullDevis();
    if (success) {
      notify("✅ Devis enregistré sur le cloud");
      setView('history');
    } else {
      notify("❌ Erreur lors de l'enregistrement", "error");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Pas besoin de notify ici car on va être redirigé vers l'écran de connexion
  };

  // --- RENDU CONDITIONNEL : SI NON CONNECTÉ ---
  if (!session) {
    return <Auth />; // On affiche uniquement la page de connexion
  }

  // --- RENDU PRINCIPAL : SI CONNECTÉ ---
  return (
    <div className="container">
      {/* NOTIFICATIONS (TOASTS) */}
      <Toast message={notification?.message} type={notification?.type} />

      {/* HEADER AVEC NAVIGATION MODERNE */}
      <header className="main-header no-print">
        <div className="header-content">
          <div className="brand-section">
            <h1>🛠️ Devis Pro <span>Cloud</span></h1>
            {/* Petit badge pour montrer qui est connecté */}
            <span className="user-email small">Connecté : {session.user.email}</span>
          </div>
          
          <div className="header-actions-main">
            <nav className="tabs">
              <button 
                className={view === 'create' ? 'active' : ''} 
                onClick={() => setView('create')}
              >
                ✍️ Nouveau / Édition
              </button>
              <button 
                className={view === 'history' ? 'active' : ''} 
                onClick={() => setView('history')}
              >
                📂 Historique
              </button>
            </nav>
            <button onClick={handleLogout} className="btn-logout" title="Se déconnecter">
              🚪 Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* CONTENU PRINCIPAL (PAGES) */}
      <main className="content">
        {view === 'create' ? (
          <CreateDevis 
            tools={{ 
              ...devisTools, 
              handleSaveFullDevis: onSave 
            }} 
          />
        ) : (
          <HistoryPage 
            onSelect={handleSelectDevis} 
            notify={notify} 
          />
        )}
      </main>

      {/* PIED DE PAGE DISCRET */}
      <footer className="no-print footer-app">
        <p>© 2026 — Votre Gestionnaire de Devis Connecté</p>
      </footer>
    </div>
  );
}

export default App;