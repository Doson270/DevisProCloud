import React from 'react';

export default function DocumentDevis({ devis }) {
  // 1. Sécurité si pas de données
  if (!devis) return <div style={{ padding: '20px' }}>Chargement du document...</div>;

  // 2. Sécurité pour l'ID (on force en String pour éviter le crash du .slice)
  const displayId = devis.id 
    ? String(devis.id).toUpperCase() 
    : 'TEMP';

  return (
    <div style={{ padding: '40px', color: '#000', backgroundColor: '#fff', minHeight: '29.7cm', fontFamily: 'Arial, sans-serif' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2.5rem', color: '#2c3e50' }}>DEVIS</h1>
          <p style={{ fontSize: '1.1rem', marginTop: '5px' }}>
            N° {displayId}
          </p>
          <p>Date : {devis.created_at ? new Date(devis.created_at).toLocaleDateString() : 'Non définie'}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h3 style={{ margin: 0 }}>{devis.entreprises?.nom || 'Ma Société'}</h3>
          <p style={{ whiteSpace: 'pre-line' }}>{devis.entreprises?.adresse || 'Adresse non renseignée'}</p>
          <p>SIRET : {devis.entreprises?.siret || 'N/A'}</p>
        </div>
      </div>

      {/* CLIENT */}
      <div style={{ marginBottom: '40px', padding: '20px', border: '1px solid #eee', borderRadius: '8px', width: 'fit-content', minWidth: '300px' }}>
        <p style={{ margin: 0, fontWeight: 'bold', color: '#7f8c8d', fontSize: '0.9rem', marginBottom: '10px' }}>DESTINATAIRE :</p>
        <h4 style={{ margin: '0 0 5px 0', fontSize: '1.2rem' }}>{devis.clients?.nom || 'Client inconnu'}</h4>
        <p style={{ margin: 0, whiteSpace: 'pre-line' }}>{devis.clients?.adresse || 'Adresse client non renseignée'}</p>
      </div>

      {/* TABLEAU DES ARTICLES */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #2c3e50' }}>
            <th style={{ textAlign: 'left', padding: '12px' }}>Description</th>
            <th style={{ textAlign: 'center', padding: '12px', width: '60px' }}>Qté</th>
            <th style={{ textAlign: 'right', padding: '12px', width: '100px' }}>P.U. HT</th>
            <th style={{ textAlign: 'right', padding: '12px', width: '120px' }}>Total HT</th>
          </tr>
        </thead>
        <tbody>
          {/* Vérification si devis_items existe et est un tableau */}
          {Array.isArray(devis.devis_items) && devis.devis_items.length > 0 ? (
            devis.devis_items.map((item, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>{item.service || item.description}</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>{item.qte || item.quantite || 1}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  {(item.pu || item.prix || 0).toFixed(2)} €
                </td>
                <td style={{ padding: '12px', textAlign: 'right', fontWeight: '500' }}>
                  {((item.qte || item.quantite || 1) * (item.pu || item.prix || 0)).toFixed(2)} €
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center' }}>Aucun article trouvé</td></tr>
          )}
        </tbody>
      </table>

      {/* TOTAUX */}
      <div style={{ marginLeft: 'auto', width: '300px' }}>
        <div style={totalRowStyle}>
          <span>Total HT :</span>
          <span>{(devis.total_ht || 0).toFixed(2)} €</span>
        </div>
        <div style={totalRowStyle}>
          <span>TVA ({devis.tva_taux || 0}%) :</span>
          <span>{((devis.total_ttc || 0) - (devis.total_ht || 0)).toFixed(2)} €</span>
        </div>
        <div style={{ ...totalRowStyle, fontWeight: 'bold', fontSize: '1.4rem', color: '#2c3e50', borderTop: '2px solid #2c3e50', marginTop: '10px', paddingTop: '10px' }}>
          <span>TOTAL TTC :</span>
          <span>{(devis.total_ttc || 0).toFixed(2)} €</span>
        </div>
      </div>

      {/* FOOTER PDF */}
      <div style={{ marginTop: '100px', fontSize: '0.8rem', color: '#95a5a6', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '20px' }}>
        <p>Devis valable 30 jours. Merci pour votre confiance !</p>
      </div>
    </div>
  );
}

const totalRowStyle = { display: 'flex', justifyContent: 'space-between', padding: '5px 0' };