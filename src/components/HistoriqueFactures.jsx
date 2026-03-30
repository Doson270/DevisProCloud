import React, { useState, useEffect } from 'react';
import { fetchHistoriqueFactures, updateFactureStatus } from '../services/api';
import DocumentPDF from './DocumentPDF'; 

export default function HistoriqueFactures({ session }) {
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFacture, setSelectedFacture] = useState(null); // <--- ÉTAT AJOUTÉ

  useEffect(() => {
    if (session?.user?.id) {
      fetchHistoriqueFactures(session.user.id)
        .then(setFactures)
        .finally(() => setLoading(false));
    }
  }, [session]);

  const handleStatusChange = async (id, nextStatus) => {
    try {
      await updateFactureStatus(id, nextStatus);
      setFactures(prev => prev.map(f => f.id === id ? { ...f, statut: nextStatus } : f));
    } catch (err) {
      alert("Erreur lors du changement de statut");
    }
  };

  const handlePrint = (facture) => {
    console.log("Facture sélectionnée pour impression :", facture);
    setSelectedFacture(facture); // On active l'affichage du document
    
    // On laisse le temps au composant de se monter avant de lancer la fenêtre d'impression
    setTimeout(() => {
      window.print();
    }, 1000); 
  };

  if (loading) return <div className="section-card">Chargement des factures...</div>;

  // --- MODE IMPRESSION (Affiché uniquement quand on clique sur PDF) ---
  if (selectedFacture) {
    return (
      <div className="print-mode-container">
        <div className="no-print section-card" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button className="btn-secondary" onClick={() => setSelectedFacture(null)}>⬅️ Retour</button>
          <p style={{ fontSize: '0.8rem', color: 'gray' }}>Impression : Ctrl + P</p>
        </div>
        <div id="print-area">
          <DocumentPDF devis={selectedFacture} /> 
        </div>
      </div>
    );
  }

  // --- VUE TABLEAU ---
  return (
    <div className="historique-container">
      <h1>🧾 Mes Factures</h1>
      <div className="section-card table-container">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>N° Facture</th>
              <th>Client</th>
              <th>Échéance</th>
              <th>Total TTC</th>
              <th>Statut</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {factures.map((f) => (
              <tr key={f.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{f.numero_facture}</td>
                <td style={{ padding: '12px' }}>{f.clients?.nom}</td>
                <td style={{ padding: '12px' }}>
                  {f.date_echeance ? new Date(f.date_echeance).toLocaleDateString() : 'N/A'}
                </td>
                <td style={{ padding: '12px' }}><strong>{f.total_ttc?.toFixed(2)} €</strong></td>
                <td style={{ padding: '12px' }}>
                  <select 
                    value={f.statut} 
                    onChange={(e) => handleStatusChange(f.id, e.target.value)}
                    className="status-select"
                    style={{ 
                        borderLeft: `4px solid ${f.statut === 'Payée' ? '#2ecc71' : '#f1c40f'}`,
                        padding: '4px 8px'
                    }}
                  >
                    <option value="Non payée">Non payée</option>
                    <option value="Payée">Payée</option>
                    <option value="Annulée">Annulée</option>
                  </select>
                </td>
                <td style={{ padding: '12px' }}>
                   <button 
                     onClick={() => handlePrint(f)} // <--- APPEL DE LA FONCTION ICI
                     className="btn-save" 
                     style={{ backgroundColor: '#27ae60' }}
                   >
                     🖨️ PDF
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}