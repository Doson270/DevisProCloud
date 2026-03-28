import React from 'react';
import { supabase } from '../supabaseClient';

export function SectionsCoordonnees({ 
  provider, setProvider, savedProviders, 
  client, setClient, savedClients, notify 
}) {

  // --- CRUD ENTREPRISE (ÉMETTEUR) ---

  const handleNewProvider = () => {
    setProvider({ id: null, nom: '', adresse: '', siret: '', email: '' });
    notify("Prêt pour une nouvelle fiche entreprise");
  };

  const handleSaveProvider = async () => {
    if (!provider.nom) return notify("Le nom de l'entreprise est obligatoire", "error");

    try {
      if (provider.id) {
        const { error } = await supabase
          .from('entreprises')
          .update({ nom: provider.nom, adresse: provider.adresse, siret: provider.siret })
          .eq('id', provider.id);
        if (error) throw error;
        notify("Infos entreprise mises à jour !");
      } else {
        const { data, error } = await supabase
          .from('entreprises')
          .insert([{ nom: provider.nom, adresse: provider.adresse, siret: provider.siret }])
          .select();
        if (error) throw error;
        setProvider(data[0]);
        notify("Nouvelle entreprise enregistrée !");
      }
    } catch (err) {
      notify("Erreur lors de la sauvegarde entreprise", "error");
    }
  };

  const handleDeleteProvider = async () => {
    if (!provider.id) return;
    if (!window.confirm(`Supprimer définitivement l'entreprise ${provider.nom} ?`)) return;

    try {
      const { error } = await supabase.from('entreprises').delete().eq('id', provider.id);
      if (error) throw error;
      notify("🗑️ Entreprise supprimée");
      handleNewProvider();
    } catch (err) {
      notify("Impossible de supprimer : elle est liée à des devis existants", "error");
    }
  };

  // --- CRUD CLIENT (DESTINATAIRE) ---

  const handleNewClient = () => setClient({ id: null, nom: '', adresse: '' });

  const handleSaveClient = async () => {
    if (!client.nom) return notify("Donnez un nom au client !", "error");
    if (!provider?.id) return notify("ERREUR : Enregistrez d'abord votre Entreprise (à gauche) !", "error");

    try {
      const payload = { 
        nom: client.nom, 
        adresse: client.adresse, 
        entreprise_id: provider.id 
      };

      let result;
      if (client.id) {
        result = await supabase.from('clients').update(payload).eq('id', client.id).select();
      } else {
        result = await supabase.from('clients').insert([payload]).select();
      }

      if (result.error) throw result.error;
      setClient(result.data[0]);
      notify("✅ Client prêt et enregistré !");
    } catch (err) {
      notify(`Échec : ${err.message}`, "error");
    }
  };

  const handleDeleteClient = async () => {
    if (!client.id) return;
    if (!window.confirm(`Supprimer le client ${client.nom} ?`)) return;

    try {
      const { error } = await supabase.from('clients').delete().eq('id', client.id);
      if (error) throw error;
      notify("🗑️ Client supprimé");
      handleNewClient();
    } catch (err) {
      notify("Impossible : ce client a des devis archivés.", "error");
    }
  };

  return (
    <div className="coords-grid">
      
      {/* SECTION ENTREPRISE */}
      <div className="coord-box provider-box">
        <div className="box-header no-print">
          <label>Émetteur (Votre Entreprise)</label>
          <div className="header-actions">
            <select 
              onChange={(e) => setProvider(savedProviders.find(p => p.nom === e.target.value) || {})} 
              value={provider.nom || ""}
            >
              <option value="" disabled>Choisir une entreprise...</option>
              {savedProviders.map(p => <option key={p.id} value={p.nom}>{p.nom}</option>)}
            </select>
            <button onClick={handleNewProvider} className="btn-icon add">➕</button>
            {provider.id && <button onClick={handleDeleteProvider} className="btn-icon delete">🗑️</button>}
          </div>
        </div>

        <input 
          placeholder="Nom de votre entreprise" 
          value={provider.nom || ''} 
          onChange={e => setProvider({...provider, nom: e.target.value})} 
          className="bold" 
        />
        <textarea 
          placeholder="Adresse du siège social" 
          value={provider.adresse || ''} 
          onChange={e => setProvider({...provider, adresse: e.target.value})} 
        />
        <input 
          placeholder="SIRET" 
          value={provider.siret || ''} 
          onChange={e => setProvider({...provider, siret: e.target.value})} 
          className="small" 
        />
        <button onClick={handleSaveProvider} className="btn-save-client no-print">
          {provider.id ? "💾 Mettre à jour l'entreprise" : "☁️ Enregistrer l'entreprise"}
        </button>
      </div>

      {/* SECTION CLIENT */}
      <div className="coord-box client-box">
        <div className="box-header no-print">
          <label>Destinataire (Client)</label>
          <div className="header-actions">
            <select 
              onChange={(e) => setClient(savedClients.find(c => c.nom === e.target.value) || {})} 
              value={client.nom || ""}
            >
              <option value="" disabled>Choisir un client...</option>
              {savedClients.map(c => <option key={c.id} value={c.nom}>{c.nom}</option>)}
            </select>
            <button onClick={handleNewClient} className="btn-icon add">➕</button>
            {client.id && <button onClick={handleDeleteClient} className="btn-icon delete">🗑️</button>}
          </div>
        </div>

        <input 
          placeholder="Nom du client" 
          value={client.nom || ''} 
          onChange={e => setClient({...client, nom: e.target.value})} 
          className="bold" 
        />
        <textarea 
          placeholder="Adresse du client" 
          value={client.adresse || ''} 
          onChange={e => setClient({...client, adresse: e.target.value})} 
        />
        
        {/* CORRECTION ICI : Ajout du onClick={handleSaveClient} */}
        <button onClick={handleSaveClient} className="btn-save-client no-print">
          {client.id ? "💾 Mettre à jour le client" : "☁️ Enregistrer le client"}
        </button>
      </div>
    </div>
  );
}