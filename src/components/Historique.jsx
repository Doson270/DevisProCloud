import React, { useState, useEffect } from 'react';
import { fetchHistoriqueDevis, fetchDevisDetails } from '../services/api';
import DocumentDevis from './DocumentDevis';
import { deleteDevis } from '../services/api';


export default function Historique({ session }) {
  const [devisList, setDevisList] = useState([]);
  const [selectedDevis, setSelectedDevis] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Charger la liste des devis au montage
  useEffect(() => {
    if (session?.user?.id) {
      fetchHistoriqueDevis(session.user.id)
        .then(setDevisList)
        .catch(err => console.error("Erreur historique:", err))
        .finally(() => setLoading(false));
    }
  }, [session]);

  // --- LOGIQUE DE SUPPRESSION ---
  const handleDelete = async (id) => {
    if (window.confirm("⚠️ Êtes-vous sûr de vouloir supprimer ce devis ? Cette action est irréversible.")) {
      try {
        await deleteDevis(id);
        // On met à jour l'affichage localement sans recharger
        setDevisList(prev => prev.filter(d => d.id !== id));
      } catch (err) {
        alert("Erreur lors de la suppression : " + err.message);
      }
    }
  };

  // 2. Préparer et lancer l'impression
  const handlePreparePrint = async (id) => {
    try {
      const data = await fetchDevisDetails(id);
      if (!data) return alert("Impossible de récupérer les détails du devis.");
      
      setSelectedDevis(data);

      // Temps de rendu pour React avant le trigger d'impression
      setTimeout(() => {
        window.print();
      }, 800);
    } catch (err) {
      console.error("Erreur lors de la préparation:", err);
      alert("Erreur technique lors de l'impression.");
    }
  };

  if (loading) return <div className="section-card">Chargement de l'historique...</div>;

  // --- VUE D'IMPRESSION ---
  if (selectedDevis) {
    return (
      <div className="print-mode-container">
        <div className="no-print section-card" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button className="btn-secondary" onClick={() => setSelectedDevis(null)}>
            ⬅️ Retour à l'historique
          </button>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
            Astuce : Si l'impression ne s'ouvre pas, faites <strong>Ctrl + P</strong>
          </p>
        </div>

        <div id="print-area">
          <DocumentDevis devis={selectedDevis} />
        </div>
      </div>
    );
  }

  // --- VUE TABLEAU (Interface normale) ---
  return (
    <div className="historique-container">
      <h1>📋 Historique des Devis</h1>
      
      {devisList.length === 0 ? (
        <div className="section-card">
          <p>Vous n'avez pas encore créé de devis.</p>
        </div>
      ) : (
        <div className="section-card table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Société</th>
                <th>Client</th>
                <th>Montant TTC</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {devisList.map((d) => (
                <tr key={d.id}>
                  <td data-label="Date">
                    {new Date(d.created_at).toLocaleDateString()}
                  </td>
                  <td data-label="Société">
                    {d.entreprises?.nom || 'N/A'}
                  </td>
                  <td data-label="Client">
                    {d.clients?.nom || 'N/A'}
                  </td>
                  <td data-label="Montant">
                    <strong>{d.total_ttc?.toFixed(2)} €</strong>
                  </td>
                  <td data-label="Action" style={{ textAlign: 'center' }}>
                    <button 
                      onClick={() => handlePreparePrint(d.id)}
                      className="btn-save"
                      style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                    >
                      🖨️ Imprimer / PDF
                    </button>
                    {/* BOUTON SUPPRIMER */}
                    <button onClick={() => handleDelete(d.id)} className="btn-danger" style={{ padding: '6px 12px' }}>
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