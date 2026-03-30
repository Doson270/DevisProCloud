import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function Dashboard({ session, setView }) {
  const [stats, setStats] = useState({
    caEncaisse: 0,
    caAttente: 0,
    devisEnCours: 0,
    totalClients: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) fetchDashboardData();
  }, [session]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Récupérer les factures
      const { data: factures } = await supabase.from('factures').select('total_ttc, statut').eq('user_id', session.user.id);
      
      // 2. Récupérer les devis (pour compter ceux en attente)
      const { data: devis } = await supabase.from('devis').select('id').eq('user_id', session.user.id).eq('statut', 'En attente');

      // 3. Récupérer le nombre de clients
      const { count: clientCount } = await supabase.from('clients').select('*', { count: 'exact', head: true }).eq('user_id', session.user.id);

      // Calculs
      const encaisse = factures?.filter(f => f.statut === 'Payée').reduce((acc, f) => acc + (f.total_ttc || 0), 0) || 0;
      const attente = factures?.filter(f => f.statut === 'Non payée').reduce((acc, f) => acc + (f.total_ttc || 0), 0) || 0;

      setStats({
        caEncaisse: encaisse,
        caAttente: attente,
        devisEnCours: devis?.length || 0,
        totalClients: clientCount || 0
      });
    } catch (err) {
      console.error("Erreur Dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="section-card">Analyse de vos données...</div>;

  return (
    <div className="dashboard-container">
      <h1>Bonjour 👋</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>Voici l'état actuel de votre activité.</p>

      {/* GRILLE DE KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        
        <div className="section-card" style={{ borderTop: '5px solid #2ecc71' }}>
          <span style={{ fontSize: '2rem' }}>💰</span>
          <h3 style={{ margin: '10px 0', color: '#666' }}>CA Encaissé</h3>
          <h2 style={{ fontSize: '1.8rem', color: '#2ecc71' }}>{stats.caEncaisse.toFixed(2)} €</h2>
        </div>

        <div className="section-card" style={{ borderTop: '5px solid #f1c40f' }}>
          <span style={{ fontSize: '2rem' }}>⏳</span>
          <h3 style={{ margin: '10px 0', color: '#666' }}>À percevoir</h3>
          <h2 style={{ fontSize: '1.8rem', color: '#f39c12' }}>{stats.caAttente.toFixed(2)} €</h2>
        </div>

        <div className="section-card" style={{ borderTop: '5px solid #3498db' }}>
          <span style={{ fontSize: '2rem' }}>📝</span>
          <h3 style={{ margin: '10px 0', color: '#666' }}>Devis en attente</h3>
          <h2 style={{ fontSize: '1.8rem', color: '#3498db' }}>{stats.devisEnCours}</h2>
        </div>

        <div className="section-card" style={{ borderTop: '5px solid #9b59b6' }}>
          <span style={{ fontSize: '2rem' }}>👥</span>
          <h3 style={{ margin: '10px 0', color: '#666' }}>Total Clients</h3>
          <h2 style={{ fontSize: '1.8rem', color: '#9b59b6' }}>{stats.totalClients}</h2>
        </div>

      </div>

      {/* ACTIONS RAPIDES */}
      <div className="section-card">
        <h3>Actions Rapides</h3>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '15px' }}>
          <button onClick={() => setView('devis')} className="btn-save" style={{ padding: '15px 25px' }}>
            ➕ Créer un Devis
          </button>
          <button onClick={() => setView('clients')} className="btn-secondary" style={{ padding: '15px 25px' }}>
            👥 Ajouter un Client
          </button>
          <button onClick={() => setView('factures')} className="btn-secondary" style={{ padding: '15px 25px' }}>
            🧾 Voir les Factures
          </button>
        </div>
      </div>
    </div>
  );
}