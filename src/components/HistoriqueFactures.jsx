import React, { useState, useEffect } from 'react';
import { fetchHistoriqueFactures, updateFactureStatus } from '../services/api';
import DocumentPDF from './DocumentPDF'; 

export default function HistoriqueFactures({ session }) {
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFacture, setSelectedFacture] = useState(null);
  const [filterDate, setFilterDate] = useState("");

  useEffect(() => {
    if (session?.user?.id) {
      fetchHistoriqueFactures(session.user.id)
        .then(setFactures)
        .catch(err => console.error("Erreur:", err))
        .finally(() => setLoading(false));
    }
  }, [session]);

  const filteredFactures = factures.filter(f => {
    if (!filterDate) return true;
    return f.created_at.substring(0, 7) === filterDate;
  });

  // --- NOUVEAU : CALCUL DES STATS ET TVA ---
  const stats = filteredFactures.reduce((acc, f) => {
    const totalTTC = f.total_ttc || 0;
    const taux = f.tva_taux || 0; // On récupère le taux de la facture
    const montantHT = totalTTC / (1 + taux / 100);
    const montantTVA = totalTTC - montantHT;

    if (f.statut === 'Payée') acc.encaisse += totalTTC;
    if (f.statut === 'Non payée') acc.enAttente += totalTTC;

    // Calcul par taux de TVA
    if (taux > 0) {
      if (!acc.detailsTVA[taux]) acc.detailsTVA[taux] = 0;
      acc.detailsTVA[taux] += montantTVA;
    }

    return acc;
  }, { encaisse: 0, enAttente: 0, detailsTVA: {} });

  const exportToCSV = () => {
    if (filteredFactures.length === 0) return alert("Aucune donnée");
    const headers = ["Numéro;Client;Date;TVA %;Montant TTC;Statut"];
    const rows = filteredFactures.map(f => `${f.numero_facture};${f.clients?.nom || 'N/A'};${new Date(f.created_at).toLocaleDateString()};${f.tva_taux}%;${f.total_ttc?.toFixed(2)};${f.statut}`);
    const csvContent = "\uFEFF" + headers.concat(rows).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", `Factures_${filterDate || 'Toutes'}.csv`);
    link.click();
  };

  const handleStatusChange = async (id, nextStatus) => {
    try {
      await updateFactureStatus(id, nextStatus);
      setFactures(prev => prev.map(f => f.id === id ? { ...f, statut: nextStatus } : f));
    } catch (err) { alert("Erreur de statut"); }
  };

  const handlePrint = (facture) => {
    setSelectedFacture(facture);
    setTimeout(() => { window.print(); }, 1000); 
  };

  if (loading) return <div className="section-card">Chargement...</div>;

  if (selectedFacture) {
    return (
      <div className="print-mode-container">
        <div className="no-print section-card" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
          <button className="btn-secondary" onClick={() => setSelectedFacture(null)}>⬅️ Retour</button>
          <strong>Impression : {selectedFacture.numero_facture}</strong>
        </div>
        <div id="print-area"><DocumentPDF devis={selectedFacture} /></div>
      </div>
    );
  }

  return (
    <div className="historique-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '10px' }}>
        <h1>🧾 Mes Factures</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input type="month" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="status-select" />
          <button onClick={exportToCSV} className="btn-save" style={{ backgroundColor: '#34495e' }}>📥 Export Excel</button>
        </div>
      </div>

      {/* --- BANDEAU STATS PRINCIPALES --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        <div className="section-card" style={{ borderLeft: '5px solid #2ecc71' }}>
          <p style={{ margin: 0, color: '#666' }}>CA Encaissé (TTC)</p>
          <h2 style={{ color: '#2ecc71' }}>{stats.encaisse.toFixed(2)} €</h2>
        </div>
        
        {/* --- NOUVEAU : RÉCAPITULATIF TVA --- */}
        <div className="section-card" style={{ borderLeft: '5px solid #9b59b6' }}>
          <p style={{ margin: '0 0 10px 0', color: '#666', fontWeight: 'bold' }}>Récapitulatif TVA Collectée</p>
          {Object.keys(stats.detailsTVA).length > 0 ? (
            Object.entries(stats.detailsTVA).map(([taux, montant]) => (
              <div key={taux} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '5px' }}>
                <span>Taux {taux}% :</span>
                <strong>{montant.toFixed(2)} €</strong>
              </div>
            ))
          ) : (
            <span style={{ fontSize: '0.8rem', color: 'gray' }}>Aucune TVA collectée sur cette période</span>
          )}
        </div>
      </div>

      {/* --- TABLEAU --- */}
      <div className="section-card table-container">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left' }}>
              <th>N°</th>
              <th>Client</th>
              <th>TVA</th>
              <th>Total TTC</th>
              <th>Statut</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredFactures.map((f) => (
              <tr key={f.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{f.numero_facture}</td>
                <td>{f.clients?.nom}</td>
                <td>{f.tva_taux}%</td>
                <td><strong>{f.total_ttc?.toFixed(2)} €</strong></td>
                <td>
                  <select 
                    value={f.statut} 
                    onChange={(e) => handleStatusChange(f.id, e.target.value)}
                    className="status-select"
                    style={{ borderLeft: `4px solid ${f.statut === 'Payée' ? '#2ecc71' : f.statut === 'Annulée' ? '#f10f0f' : '#f1c40f'}` }}
                  >
                    <option value="Non payée">Non payée</option>
                    <option value="Payée">Payée</option>
                    <option value="Annulée">Annulée</option>
                  </select>
                </td>
                <td><button onClick={() => handlePrint(f)} className="btn-save" style={{ backgroundColor: '#27ae60' }}>🖨️</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}