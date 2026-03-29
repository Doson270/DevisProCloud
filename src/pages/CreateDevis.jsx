import React from 'react';
import { SectionsCoordonnees } from '../components/SectionsCoordonnees';
import { TableauArticles } from '../components/TableauArticles';

export default function CreateDevis({ tools }) {
  const { 
    provider, setProvider, savedProviders,
    client, setClient, savedClients,
    items, setItems,
    tvaTaux, setTvaTaux,
    totalHT, montantTVA, totalTTC,
    handleSaveFullDevis 
  } = tools;

  return (
    <div className="page-create-container">
      {/* HEADER DE LA PAGE (Visible sur écran uniquement) */}
      <div className="page-header no-print">
        <div className="header-content">
          <h1>Nouveau Devis</h1>
          <p>Créez et personnalisez votre document professionnel</p>
        </div>
      </div>

      {/* ZONE DU DOCUMENT (Simule une feuille A4) */}
      <div className="document-paper shadow-2xl">
        
        {/* EN-TÊTE PROFESSIONNEL */}
        <div className="doc-header">
          <div className="company-brand">
            <h2 className="company-name-display">{provider.nom || 'NOM DE VOTRE ENTREPRISE'}</h2>
            <div className="company-details-grid">
              <span>{provider.adresse}</span>
              <span>SIRET : {provider.siret}</span>
            </div>
          </div>
          
          <div className="doc-type-badge">
            <span className="badge-title">DEVIS</span>
            <span className="badge-date">Date : {new Date().toLocaleDateString()}</span>
          </div>
        </div>

        <div className="doc-divider"></div>

        {/* SECTION COORDONNÉES (Layout amélioré via CSS) */}
        <div className="sections-container">
          <SectionsCoordonnees 
            provider={provider} setProvider={setProvider} savedProviders={savedProviders}
            client={client} setClient={setClient} savedClients={savedClients}
          />
        </div>
        
        <div className="doc-divider"></div>
        
        {/* TABLEAU DES ARTICLES */}
        <div className="table-wrapper">
          <TableauArticles items={items} setItems={setItems} />
        </div>

        {/* SECTION FINANCIÈRE */}
        <div className="financial-footer">
          <div className="notes-section">
            <p className="legal-mention">
              {tvaTaux === 0 ? "TVA non applicable, art. 293 B du CGI" : "Prix exprimés en Euros (€)"}
            </p>
          </div>

          <div className="totals-card">
            <div className="total-row no-print tva-picker">
              <label>Taux de TVA :</label>
              <select 
                value={tvaTaux} 
                onChange={(e) => setTvaTaux(parseFloat(e.target.value))}
                className="modern-select"
              >
                <option value="20">20% (Standard)</option>
                <option value="10">10% (Rénovation)</option>
                <option value="5.5">5.5% (Énergie)</option>
                <option value="0">0% (Auto-Entrepreneur)</option>
              </select>
            </div>

            <div className="totals-list">
              <div className="row">
                <span>Total HT</span>
                <span>{totalHT.toFixed(2)} €</span>
              </div>
              <div className="row">
                <span>TVA ({tvaTaux}%)</span>
                <span>{montantTVA.toFixed(2)} €</span>
              </div>
              <div className="row grand-total">
                <span>TOTAL TTC</span>
                <span>{totalTTC.toFixed(2)} €</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BARRE D'ACTIONS FLOTTANTE (Bas de page) */}
      <div className="floating-actions no-print">
        <div className="actions-wrapper">
          <button className="btn-secondary" onClick={() => window.print()}>
            <span className="icon">🖨️</span> Aperçu PDF
          </button>
          <button className="btn-primary" onClick={handleSaveFullDevis}>
            <span className="icon">☁️</span> Enregistrer le devis
          </button>
        </div>
      </div>
    </div>
  );
}