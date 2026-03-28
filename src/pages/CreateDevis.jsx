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
    <div className="page-create">
      <div className="card">
        {/* EN-TÊTE POUR L'IMPRESSION PDF */}
        <div className="print-only-title">
          <div className="header-left">
            <h1 className="company-name">{provider.nom || 'VOTRE ENTREPRISE'}</h1>
            <p className="company-address">{provider.adresse}</p>
            <p className="company-siret">SIRET : {provider.siret}</p>
          </div>
          <div className="header-right">
            <h2>DEVIS</h2>
            <p>Date : {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* COMPOSANT COORDONNÉES */}
        <SectionsCoordonnees 
          provider={provider} setProvider={setProvider} savedProviders={savedProviders}
          client={client} setClient={setClient} savedClients={savedClients}
        />
        
        <hr className="separator" />
        
        {/* COMPOSANT TABLEAU ARTICLES */}
        <TableauArticles items={items} setItems={setItems} />

        {/* SECTION TOTAUX ET TVA */}
        <div className="totals">
          <div className="total-row no-print">
            <span>Taux de TVA :</span>
            <select 
              value={tvaTaux} 
              onChange={(e) => setTvaTaux(parseFloat(e.target.value))}
              className="tva-select"
            >
              <option value="20">20% (Standard)</option>
              <option value="10">10% (Rénovation)</option>
              <option value="5.5">5.5% (Énergie)</option>
              <option value="0">0% (Auto-Entrepreneur)</option>
            </select>
          </div>

          <div className="total-row">
            <span>Total HT :</span>
            <strong>{totalHT.toFixed(2)} €</strong>
          </div>
          <div className="total-row">
            <span>TVA ({tvaTaux === 0 ? "Exonération Art. 293B" : `${tvaTaux}%`}) :</span>
            <strong>{montantTVA.toFixed(2)} €</strong>
          </div>
          <div className="total-row main">
            <span>TOTAL TTC :</span>
            <strong>{totalTTC.toFixed(2)} €</strong>
          </div>
        </div>
      </div>

      {/* BOUTONS D'ACTIONS FIXES EN BAS */}
      <div className="actions no-print">
        <button className="btn-save-cloud" onClick={handleSaveFullDevis}>
          ☁️ Enregistrer sur le Cloud
        </button>
        <button className="btn-print" onClick={() => window.print()}>
          🖨️ Imprimer / PDF
        </button>
      </div>
    </div>
  );
}