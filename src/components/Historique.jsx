import React, { useState, useEffect } from 'react';
import { 
  fetchHistoriqueDevis, 
  fetchDevisDetails, 
  deleteDevis, 
  updateDevisStatus,
  convertDevisToFacture,
  saveSignature // Assure-toi de l'ajouter dans ton api.js
} from '../services/api'; 
import DocumentDevis from './DocumentPDF';
import SignatureModal from './SignatureModal'; // Import du modal de signature

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
      display: 'inline-block',
      marginTop: '5px'
    }}>
      {statut || 'Brouillon'}
    </span>
  );
};

export default function Historique({ session }) {
  const [devisList, setDevisList] = useState([]);
  const [selectedDevis, setSelectedDevis] = useState(null);
  const [loading, setLoading] = useState(true);

  // États pour la signature
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDevisId, setCurrentDevisId] = useState(null);

  useEffect(() => {
    if (session?.user?.id) {
      loadHistorique();
    }
  }, [session]);

  const loadHistorique = () => {
    setLoading(true);
    fetchHistoriqueDevis(session.user.id)
      .then(setDevisList)
      .catch(err => console.error("Erreur historique:", err))
      .finally(() => setLoading(false));
  };

  // --- LOGIQUE DE SIGNATURE ---
  const handleOpenSignature = (id) => {
    setCurrentDevisId(id);
    setIsModalOpen(true);
  };

  const handleConfirmSignature = async (imageData) => {
    try {
      setLoading(true);
      await saveSignature(currentDevisId, imageData);
      alert("🖋️ Devis signé et accepté !");
      setIsModalOpen(false);
      loadHistorique(); 
    } catch (err) {
      alert("Erreur lors de la signature : " + err.message);
      setLoading(false);
    }
  };

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

  const handleStatusChange = async (id, nextStatus) => {
    try {
      await updateDevisStatus(id, nextStatus);
      setDevisList(prev => prev.map(d => d.id === id ? { ...d, statut: nextStatus } : d));
    } catch (err) {
      alert("Erreur lors du changement de statut");
    }
  };

  const handleConvertToFacture = async (devisId) => {
    if (window.confirm("Voulez-vous transformer ce devis en facture ?")) {
      try {
        setLoading(true);
        await convertDevisToFacture(devisId, session.user.id);
        alert("✅ Facture générée avec succès !");
        loadHistorique();
      } catch (err) {
        alert("Erreur : " + err.message);
        setLoading(false);
      }
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

  if (loading) return <div className="section-card">Traitement en cours...</div>;

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
                <th style={{ padding: '12px' }}>Date</th>
                <th>Client</th>
                <th>Montant TTC</th>
                <th style={{ textAlign: 'center' }}>Statut</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {devisList.map((d) => (
                <tr key={d.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{new Date(d.created_at).toLocaleDateString()}</td>
                  <td>{d.clients?.nom || 'N/A'}</td>
                  <td><strong>{d.total_ttc?.toFixed(2)} €</strong></td>
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
                    <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                      <button onClick={() => handlePreparePrint(d.id)} className="btn-save" title="Imprimer PDF">
                        🖨️
                      </button>

                      {/* NOUVEAU : BOUTON SIGNER (si pas encore accepté/signé) */}
                      {!d.signature_url && d.statut !== 'Accepté' && (
                        <button 
                          onClick={() => handleOpenSignature(d.id)} 
                          className="btn-save" 
                          style={{ backgroundColor: '#f39c12' }}
                          title="Signer électroniquement"
                        >
                          ✍️
                        </button>
                      )}
                      
                      {/* BOUTON FACTURER (si accepté) */}
                      {d.statut === 'Accepté' && (
                        <button 
                          onClick={() => handleConvertToFacture(d.id)} 
                          className="btn-secondary" 
                          style={{ backgroundColor: '#27ae60', color: 'white' }}
                          title="Convertir en facture"
                        >
                          🧾
                        </button>
                      )}

                      <button onClick={() => handleDelete(d.id)} className="btn-danger" title="Supprimer">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL DE SIGNATURE */}
      {isModalOpen && (
        <SignatureModal 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleConfirmSignature} 
        />
      )}
    </div>
  );
}