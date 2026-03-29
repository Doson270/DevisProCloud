import React, { useState, useEffect } from 'react';
import { fetchHistoriqueDevis, fetchDevisDetails } from '../services/api';
import DocumentDevis from './DocumentDevis';

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

  // 2. Préparer et lancer l'impression
  const handlePreparePrint = async (id) => {
    try {
      const data = await fetchDevisDetails(id);
      if (!data) return alert("Impossible de récupérer les détails du devis.");
      
      setSelectedDevis(data);

      // On laisse un court instant à React pour afficher le devis seul à l'écran
      setTimeout(() => {
        window.print();
      }, 800);
    } catch (err) {
      console.error("Erreur lors de la préparation:", err);
      alert("Erreur technique lors de l'impression.");
    }
  };

  if (loading) return <div>Chargement de l'historique...</div>;

  // --- VUE D'IMPRESSION (S'affiche uniquement quand un devis est sélectionné) ---
  if (selectedDevis) {
    return (
      <div className="print-mode-container">
        {/* Bouton visible uniquement à l'écran pour revenir en arrière */}
        <div className="no-print"
        >
          <button 
            onClick={() => setSelectedDevis(null)}>
            ⬅️ Quitter l'aperçu / Retour
          </button>
          <span>
            (Si la fenêtre d'impression ne s'est pas ouverte, utilisez Ctrl + P)
          </span>
        </div>

        {/* ZONE D'IMPRESSION CIBLÉE PAR LE CSS */}
        <div id="print-area">
          <DocumentDevis devis={selectedDevis} />
        </div>
      </div>
    );
  }

  // --- VUE TABLEAU (Interface normale) ---
  return (
    <div className="historique-container">
      <h2>📋 Historique des Devis</h2>
      
      {devisList.length === 0 ? (
        <div>
          <p>Vous n'avez pas encore créé de devis.</p>
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Entreprise</th>
              <th>Client</th>
              <th>Montant TTC</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {devisList.map((d) => (
              <tr key={d.id}>
                <td>{new Date(d.created_at).toLocaleDateString()}</td>
                <td>{d.entreprises?.nom || 'N/A'}</td>
                <td>{d.clients?.nom || 'N/A'}</td>
                <td><strong>{d.total_ttc?.toFixed(2)} €</strong></td>
                <td>
                  <button 
                    onClick={() => handlePreparePrint(d.id)}>
                    🖨️ Imprimer / PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
