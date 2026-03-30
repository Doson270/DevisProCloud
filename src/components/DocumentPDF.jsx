import React from 'react';

export default function DocumentPDF({ devis }) {
  // 1. Sécurité si pas de données
  if (!devis) return <div style={{ padding: '20px' }}>Chargement du document...</div>;

  // 2. Détection automatique du type (Facture ou Devis)
  const isFacture = !!devis.numero_facture; 
  const colorTheme = isFacture ? '#000000' : '#2c3e50'; // Vert pour facture, Bleu sombre pour devis

  // 3. Gestion de l'ID d'affichage
  const displayId = isFacture 
    ? devis.numero_facture 
    : (devis.id ? String(devis.id).toUpperCase().slice(0, 8) : 'TEMP');

  // On harmonise les items car les noms de colonnes peuvent varier entre les tables
  const items = devis.devis_items || devis.facture_items || [];

  return (
    <div style={{ padding: '40px', color: '#000', backgroundColor: '#fff', minHeight: '29.7cm', fontFamily: 'Arial, sans-serif' }}>
      
      {/* HEADER : LOGO & INFOS ENTREPRISE (Gauche) / NUMÉRO (Droite) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
        
        {/* BLOC GAUCHE : Logo et Coordonnées */}
        <div>
          {devis.entreprises?.logo_url ? (
            <img 
              src={devis.entreprises.logo_url} 
              alt="Logo" 
              style={{ 
                maxWidth: '200px', 
                maxHeight: '120px', 
                objectFit: 'contain', 
                marginBottom: '15px',
                display: 'block'
              }} 
            />
          ) : (
            <h1 style={{ margin: '0 0 15px 0', fontSize: '2rem', color: colorTheme }}>
              {devis.entreprises?.nom || 'Ma Société'}
            </h1>
          )}

          <div style={{ fontSize: '0.95rem', color: '#555', lineHeight: '1.4' }}>
            {devis.entreprises?.logo_url && (
              <strong style={{ display: 'block', color: '#2c3e50' }}>{devis.entreprises?.nom}</strong>
            )}
            <p style={{ margin: '2px 0', whiteSpace: 'pre-line' }}>{devis.entreprises?.adresse || 'Adresse non renseignée'}</p>
            <p style={{ margin: '2px 0' }}>SIRET : {devis.entreprises?.siret || 'N/A'}</p>
          </div>
        </div>

        {/* BLOC DROITE : Titre, Numéro et Date */}
        <div style={{ textAlign: 'right' }}>
          <h2 style={{ margin: 0, fontSize: '2.5rem', color: colorTheme, letterSpacing: '2px' }}>
            {isFacture ? 'FACTURE' : 'DEVIS'}
          </h2>
          <p style={{ fontSize: '1.1rem', marginTop: '10px', color: '#555' }}>
            N° {displayId}
          </p>
          <p style={{ color: '#777' }}>
            Date : {devis.created_at ? new Date(devis.created_at).toLocaleDateString() : 'Non définie'}
          </p>
          {isFacture && devis.date_echeance && (
            <p style={{ color: '#e74c3c', fontWeight: 'bold', marginTop: '5px' }}>
              Échéance : {new Date(devis.date_echeance).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: `2px solid ${colorTheme}`, opacity: 0.2, marginBottom: '40px' }} />

      {/* CLIENT */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
        <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', width: '350px', backgroundColor: '#fafafa' }}>
          <p style={{ margin: 0, fontWeight: 'bold', color: '#7f8c8d', fontSize: '0.85rem', marginBottom: '10px', textTransform: 'uppercase' }}>
            {isFacture ? 'Client :' : 'Facturé à :'}
          </p>
          <h4 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', color: '#2c3e50' }}>
            {devis.clients?.nom || 'Client inconnu'}
          </h4>
          <p style={{ margin: 0, whiteSpace: 'pre-line', color: '#555', lineHeight: '1.4' }}>
            {devis.clients?.adresse || 'Adresse client non renseignée'}
          </p>
        </div>
      </div>

      {/* TABLEAU DES ARTICLES */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
        <thead>
          <tr style={{ borderBottom: `2px solid ${colorTheme}`, backgroundColor: '#f8f9fa' }}>
            <th style={{ textAlign: 'left', padding: '12px', color: colorTheme }}>Description</th>
            <th style={{ textAlign: 'center', padding: '12px', width: '60px', color: colorTheme }}>Qté</th>
            <th style={{ textAlign: 'right', padding: '12px', width: '100px', color: colorTheme }}>P.U. HT</th>
            <th style={{ textAlign: 'right', padding: '12px', width: '120px', color: colorTheme }}>Total HT</th>
          </tr>
        </thead>
        <tbody>
          {items.length > 0 ? (
            items.map((item, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px', color: '#333' }}>{item.description || item.service}</td>
                <td style={{ padding: '12px', textAlign: 'center', color: '#333' }}>{item.qte || item.quantite || 1}</td>
                <td style={{ padding: '12px', textAlign: 'right', color: '#333' }}>
                  {(item.pu || item.prix || 0).toFixed(2)} €
                </td>
                <td style={{ padding: '12px', textAlign: 'right', fontWeight: '500', color: '#2c3e50' }}>
                  {((item.qte || item.quantite || 1) * (item.pu || item.prix || 0)).toFixed(2)} €
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#999' }}>Aucun article trouvé</td></tr>
          )}
        </tbody>
      </table>

      {/* TOTAUX */}
      <div style={{ marginLeft: 'auto', width: '300px' }}>
        <div style={totalRowStyle}>
          <span style={{ color: '#555' }}>Total HT :</span>
          <span style={{ color: '#333' }}>{(devis.total_ht || 0).toFixed(2)} €</span>
        </div>
        <div style={totalRowStyle}>
          <span style={{ color: '#555' }}>TVA ({devis.tva_taux || 0}%) :</span>
          <span style={{ color: '#333' }}>{((devis.total_ttc || 0) - (devis.total_ht || 0)).toFixed(2)} €</span>
        </div>
        <div style={{ ...totalRowStyle, fontWeight: 'bold', fontSize: '1.4rem', color: colorTheme, borderTop: `2px solid ${colorTheme}`, marginTop: '10px', paddingTop: '10px' }}>
          <span>TOTAL TTC :</span>
          <span>{(devis.total_ttc || 0).toFixed(2)} €</span>
        </div>
      </div>

      {/* FOOTER PDF */}
      <div style={{ marginTop: '100px', fontSize: '0.85rem', color: '#7f8c8d', textAlign: 'center', borderTop: '1px solid #ecf0f1', paddingTop: '20px' }}>
        {isFacture ? (
          <p style={{ margin: '0 0 5px 0' }}>Merci pour votre confiance. Règlement attendu avant l'échéance indiquée.</p>
        ) : (
          <p style={{ margin: '0 0 5px 0' }}>Devis valable 30 jours. Merci pour votre confiance !</p>
        )}
        <p style={{ margin: 0, fontSize: '0.75rem' }}>Entreprise dispensée d'immatriculation au registre du commerce et des sociétés (RCS) et au répertoire des métiers (RM) - TVA non applicable, art. 293 B du CGI.</p>
      </div>
    </div>
  );
}

const totalRowStyle = { display: 'flex', justifyContent: 'space-between', padding: '6px 0' };