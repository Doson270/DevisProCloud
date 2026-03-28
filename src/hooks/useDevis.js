import { useState, useMemo, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export function useDevis() {
  // --- ÉTATS DES DONNÉES ---
  const [savedProviders, setSavedProviders] = useState([]);
  const [savedClients, setSavedClients] = useState([]);
  
  // --- ÉTATS DU FORMULAIRE ---
  const [provider, setProvider] = useState({ id: null, nom: '', adresse: '', siret: '', email: '' });
  const [client, setClient] = useState({ id: null, nom: '', adresse: '', email: '' });
  const [tvaTaux, setTvaTaux] = useState(20);
  const [items, setItems] = useState([{ id: Date.now(), service: '', qte: 1, pu: 0 }]);

  // --- CHARGEMENT INITIAL ---
  useEffect(() => {
    fetchProviders();
  }, []);

  useEffect(() => {
    if (provider.id) fetchClients(provider.id);
    else setSavedClients([]);
  }, [provider.id]);

  const fetchProviders = async () => {
    const { data } = await supabase.from('entreprises').select('*');
    if (data) setSavedProviders(data);
  };

  const fetchClients = async (pid) => {
    const { data } = await supabase.from('clients').select('*').eq('entreprise_id', pid);
    if (data) setSavedClients(data);
  };

  // --- CALCULS ---
  const totalHT = useMemo(() => {
    return items.reduce((acc, curr) => acc + (Number(curr.qte) * Number(curr.pu)), 0);
  }, [items]);

  const montantTVA = useMemo(() => (totalHT * tvaTaux) / 100, [totalHT, tvaTaux]);
  const totalTTC = totalHT + montantTVA;

  // --- ACTIONS ---
  const loadFullDevis = (data) => {
    setProvider(data.entreprises || { id: null, nom: '', adresse: '', siret: '', email: '' });
    setClient(data.clients || { id: null, nom: '', adresse: '', email: '' });
    setTvaTaux(data.tva_taux || 20);
    setItems(data.devis_items.map(i => ({
      id: Math.random(),
      service: i.service,
      qte: i.qte,
      pu: i.pu
    })));
  };

  const handleSaveFullDevis = async () => {
    if (!provider.id || !client.id) return alert("Sélectionnez une entreprise et un client !");

    const { data: devisData, error: devisError } = await supabase
      .from('devis')
      .insert([{
        numero: `DEV-${Date.now().toString().slice(-4)}`,
        entreprise_id: provider.id,
        client_id: client.id,
        total_ht: totalHT,
        tva_taux: tvaTaux,
        total_ttc: totalTTC
      }])
      .select();

    if (devisError) return alert(devisError.message);

    const lines = items.map(l => ({
      devis_id: devisData[0].id,
      service: l.service,
      qte: l.qte,
      pu: l.pu
    }));

    const { error: itemsError } = await supabase.from('devis_items').insert(lines);
    if (!itemsError) alert("✅ Devis enregistré !");
    return !itemsError;
  };

  return {
    provider, setProvider, savedProviders,
    client, setClient, savedClients,
    items, setItems,
    tvaTaux, setTvaTaux,
    totalHT, montantTVA, totalTTC,
    loadFullDevis, handleSaveFullDevis
  };
}