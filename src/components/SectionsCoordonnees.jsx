import React, { useState, useEffect } from 'react'; // Import indispensable
import { supabase } from '../supabaseClient';

export function SectionsCoordonnees({ entreprise, setEntreprise, client, setClient, session }) {
  const [list, setList] = useState([]);

  useEffect(() => {
    const load = async () => {
      if (!session?.user?.id) return;
      const { data } = await supabase
        .from('entreprises')
        .select('*')
        .eq('user_id', session.user.id)
        .order('nom');
      setList(data || []);
    };
    load();
  }, [session]);

  return (
    <div className="sections-coords">
      <div className="coords-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* COLONNE GAUCHE : SÉLECTION SOCIÉTÉ */}
        <div className="coord-box">
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Ma Société :</label>
          <select 
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            value={entreprise?.id || ''} 
            onChange={(e) => {
              const selected = list.find(ent => ent.id == e.target.value);
              setEntreprise(selected || { id: null, nom: '', adresse: '', siret: '' });
            }}
          >
            <option value="">-- Choisir une société --</option>
            {list.map(ent => (
              <option key={ent.id} value={ent.id}>{ent.nom}</option>
            ))}
          </select>
          
          {/* Petit résumé des infos sous le select */}
          {entreprise?.nom && (
            <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#555' }}>
              <p style={{ margin: 0 }}><strong>{entreprise.nom}</strong></p>
              <p style={{ margin: 0 }}>{entreprise.adresse}</p>
              <p style={{ margin: 0 }}>SIRET: {entreprise.siret}</p>
            </div>
          )}
        </div>

        {/* COLONNE DROITE : CLIENT */}
        <div className="coord-box">
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Client :</label>
          <input 
            placeholder="Nom du client" 
            value={client?.nom || ''} 
            onChange={e => setClient({ ...client, nom: e.target.value })} 
            style={{ width: '100%', marginBottom: '10px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <input 
            placeholder="Adresse client" 
            value={client?.adresse || ''} 
            onChange={e => setClient({ ...client, adresse: e.target.value })} 
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

      </div>
    </div>
  );
}