import React, { useState, useEffect } from 'react';
// On utilise bien le nouveau nom de la fonction filtrée
import { fetchEntreprises, fetchClientsByEntreprise } from '../services/api';

export function SectionsCoordonnees({ entreprise, setEntreprise, client, setClient, session }) {
  const [listeSocietes, setListeSocietes] = useState([]);
  const [listeClients, setListeClients] = useState([]);

  // 1. Charger la liste de MES sociétés au montage du composant
  useEffect(() => {
    if (session?.user?.id) {
      fetchEntreprises(session.user.id)
        .then(setListeSocietes)
        .catch(err => console.error("Erreur chargement sociétés:", err));
    }
  }, [session]);

  // 2. Charger les clients UNIQUEMENT quand l'entreprise sélectionnée change
  useEffect(() => {
    if (entreprise?.id) {
      fetchClientsByEntreprise(entreprise.id)
        .then(setListeClients)
        .catch(err => console.error("Erreur chargement clients:", err));
    } else {
      setListeClients([]); // On vide la liste si aucune société n'est sélectionnée
    }
  }, [entreprise?.id]);

  return (
    <div className="sections-coords">
      
      {/* --- BLOC GAUCHE : ÉMETTEUR (MA SOCIÉTÉ) --- */}
      <div className="coord-box">
        <label>🏢 Ma Société (Émetteur) :</label>
        <select
          value={entreprise?.id || ''} 
          onChange={(e) => {
            const selected = listeSocietes.find(ent => ent.id == e.target.value);
            // On met à jour la société et on reset le client pour éviter les erreurs de rattachement
            setEntreprise(selected || { id: null, nom: '', adresse: '', siret: '' });
            setClient({ id: null, nom: '', adresse: '' }); 
          }}
        >
          <option value="">-- Choisir ma société --</option>
          {listeSocietes.map(ent => (
            <option key={ent.id} value={ent.id}>{ent.nom}</option>
          ))}
        </select>
        
        {entreprise?.nom && (
          <div>
            <p><strong>{entreprise.nom}</strong></p>
            <p>{entreprise.adresse}</p>
            <p>SIRET : {entreprise.siret || 'N/A'}</p>
          </div>
        )}
      </div>

      {/* --- BLOC DROIT : DESTINATAIRE (CLIENT) --- */}
      <div className="coord-box">
        <label>👤 Client Destinataire :</label>
        <select 
          disabled={!entreprise?.id} // Désactivé tant qu'on n'a pas de société
          value={client?.id || ''} 
          onChange={(e) => {
            const selected = listeClients.find(c => c.id == e.target.value);
            setClient(selected || { id: null, nom: '', adresse: '' });
          }}
        >
          <option value="">
            {entreprise?.id ? "-- Sélectionner un client --" : "👈 Choisissez d'abord une société"}
          </option>
          {listeClients.map(c => (
            <option key={c.id} value={c.id}>{c.nom}</option>
          ))}
        </select>

        {/* Champs de saisie manuelle / Modification */}
        <div>
          <input 
            placeholder="Nom du client" 
            value={client?.nom || ''} 
            onChange={e => setClient({ ...client, nom: e.target.value })} 
          />
          <textarea 
            placeholder="Adresse complète du client" 
            value={client?.adresse || ''} 
            onChange={e => setClient({ ...client, adresse: e.target.value })} 
          />
        </div>
      </div>

    </div>
  );
}
