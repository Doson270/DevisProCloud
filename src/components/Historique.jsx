import React, { useState, useEffect } from 'react';
import { fetchHistoriqueDevis, fetchDevisDetails, deleteDevis, updateDevisStatus } from '../services/api'; // Assure-toi d'ajouter updateDevisStatus dans ton api.js
import DocumentDevis from './DocumentDevis';

// --- COMPOSANT BADGE INTERNE ---
const StatusBadge = ({ statut }) => {
  const styles = {
    'Brouillon': { bg: '#eee', color: '#666' },
    'Envoyé': { bg: '#e3f2fd', color: '#1976d2' },
    'Accepté': { bg: '#e8f5e9', color: '#2e7d32' },
    'Refusé': { bg: '#ffebee', color: '#c62828' }
  };
  const currentStyle = styles[statut] || styles['Brouillon'];
  return (
    <span style={{
      padding: '4px 10px',
      borderRadius: '12px',
      fontSize: '0.75rem',
      fontWeight: 'bold',
      backgroundColor: currentStyle.bg,
      color: currentStyle.color,
      textTransform: 'uppercase',
      display: 'inline-block'
    }}>
      {statut || 'Brouillon'}
    </span>
  );
};

export default function Historique({ session }) {
  const [devisList, setDevisList] = useState([]);
  const [selectedDevis, setSelectedDevis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchHistoriqueDevis(session.user.id)
        .then(setDevisList)
        .catch(err => console.error("Erreur historique:", err))
        .finally(() => setLoading(false));
    }
  }, [session]);

  const handleDelete = async (id) => {
    if (window.confirm("⚠️ Êtes-vous sûr de vouloir supprimer ce devis ?")) {
      try {
        await deleteDevis(id);
        setDevisList(prev => prev.filter(d => d.id !== id));
      } catch (err) {
        alert("Erreur lors de la suppression : " + err.message);
      }
    }
  };

  // --- NOUVELLE FONCTION : CHANGER LE STATUT ---
  const handleStatusChange = async (id, nextStatus) => {
    try {
      await updateDevisStatus(id, nextStatus);
      // Mise à jour locale de la liste
      setDevisList(prev => prev.map(d => d.id === id ? { ...d, statut: nextStatus } : d));
    } catch (err) {
      alert("Erreur lors du changement de statut");
    }
  };

  const handlePreparePrint = async (id) => {
    try {
      const data = await fetchDevisDetails(id);
      if (!data) return alert("Impossible de récupérer les détails.");
      setSelectedDevis(data);
      setTimeout(() => { window.print(); }, 800);
    } catch (err) {
      alert("Erreur technique lors de l'impression.");
    }
  };

  if (loading) return <div className="section-card">Chargement de l'historique...</div>;

  if (selectedDevis) {
    return (
      <div className="print-mode-container">
        <div className="no-print section-card" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button className="btn-secondary" onClick={() => setSelectedDevis(null)}>⬅️ Retour</button>
          <p style={{ fontSize: '0.8rem', color: 'gray' }}>Impression : Ctrl + P</p>
        </div>
        <div id="print-area"><DocumentDevis devis={selectedDevis} /></div>
      </div>
    );
  }

  return (
    <div className="historique-container">
      <h1>📋 Historique des Devis</h1>
      
      {devisList.length === 0 ? (
        <div className="section-card"><p>Aucun devis créé.</p></div>
      ) : (
        <div className="section-card table-container">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Client</th>
                <th>Montant TTC</th>
                <th style={{ textAlign: 'center' }}>Statut</th> {/* Nouvelle colonne */}
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {devisList.map((d) => (
                <tr key={d.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td>{new Date(d.created_at).toLocaleDateString()}</td>
                  <td>{d.clients?.nom || 'N/A'}</td>
                  <td><strong>{d.total_ttc?.toFixed(2)} €</strong></td>
                  {/* COLONNE STATUT AVEC MENU DÉROULANT STYLISÉ */}
                  <td style={{ textAlign: 'center' }}>
                    <select 
                      value={d.statut || 'Brouillon'} 
                      onChange={(e) => handleStatusChange(d.id, e.target.value)}
                      className="status-select"
                      style={{ 
                        borderLeft: `4px solid ${
                          d.statut === 'Accepté' ? '#2e7d32' : 
                          d.statut === 'Envoyé' ? '#1976d2' : 
                          d.statut === 'Refusé' ? '#c62828' : '#666'
                        }` 
                      }}
                    >
                      <option value="Brouillon">Brouillon</option>
                      <option value="Envoyé">Envoyé</option>
                      <option value="Accepté">Accepté</option>
                      <option value="Refusé">Refusé</option>
                    </select>
                    <br />
                    <StatusBadge statut={d.statut} />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button onClick={() => handlePreparePrint(d.id)} className="btn-save" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                      🖨️ PDF
                    </button>
                    <button onClick={() => handleDelete(d.id)} className="btn-danger" style={{ padding: '6px 12px', marginLeft: '5px' }}>
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}