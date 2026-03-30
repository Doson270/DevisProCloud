import { supabase } from '../supabaseClient';

// --- LOGIQUE SAUVEGARDE DEVIS ---
export const saveFullDevis = async ({ session, provider, client, items, totalHT, totalTTC, tvaRate }) => {
  if (!session?.user?.id) throw new Error("Utilisateur non connecté");
  if (!provider?.id) throw new Error("Aucune entreprise sélectionnée");

  let finalClientId = client.id;

  // 1. GESTION DU CLIENT : Si le client n'a pas d'ID, on le crée. Sinon, on utilise l'existant.
  if (!finalClientId) {
    const { data: newClient, error: clientErr } = await supabase
      .from('clients')
      .insert([{ 
        nom: client.nom, 
        adresse: client.adresse, 
        user_id: session.user.id 
      }])
      .select().single();

    if (clientErr) throw clientErr;
    finalClientId = newClient.id; // On récupère l'ID du nouveau client créé
  }

  // 2. Créer le devis (on utilise finalClientId)
  const { data: newDevis, error: devisErr } = await supabase
    .from('devis')
    .insert([{
      user_id: session.user.id,
      entreprise_id: provider.id,
      client_id: finalClientId, // <--- C'est soit l'ancien, soit le nouveau !
      total_ht: totalHT,
      total_ttc: totalTTC,
      tva_taux: tvaRate
    }])
    .select().single();

  if (devisErr) throw devisErr;

  // 3. Créer les articles
  const lines = items.map(it => ({
    devis_id: newDevis.id,
    user_id: session.user.id,
    service: it.description,
    qte: it.quantite,
    pu: it.prix
  }));

  const { error: linesErr } = await supabase.from('devis_items').insert(lines);
  if (linesErr) throw linesErr;

  return { success: true };
};

// --- LOGIQUE ENTREPRISES ---
export const fetchEntreprises = async (userId) => {
  const { data, error } = await supabase
    .from('entreprises')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};



export const deleteEntreprise = async (id) => {
  const { error } = await supabase.from('entreprises').delete().eq('id', id);
  if (error) throw error;
  return true;
};

export const upsertEntreprise = async (entreprise, userId) => {
  // On crée une copie de l'objet pour ne pas modifier l'original
  const payload = { 
    nom: entreprise.nom,
    adresse: entreprise.adresse,
    siret: entreprise.siret,
    user_id: userId 
  };

  // On n'ajoute l'ID au payload QUE s'il existe déjà (cas d'une mise à jour)
  if (entreprise.id) {
    payload.id = entreprise.id;
  }

  const { data, error } = await supabase
    .from('entreprises')
    .upsert(payload)
    .select();

  if (error) {
    console.error("Erreur Supabase détaillée:", error);
    throw error;
  }
  return data[0];
};
// --- LOGIQUE CLIENTS ---
// --- LOGIQUE CLIENTS FILTRÉS PAR ENTREPRISE ---

export const fetchClientsByEntreprise = async (entrepriseId) => {
  if (!entrepriseId) return [];
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('entreprise_id', entrepriseId) // On filtre par la société sélectionnée
    .order('nom', { ascending: true });
    
  if (error) throw error;
  return data || [];
};

export const upsertClient = async (client, userId, entrepriseId) => {
  // On s'assure que le client est lié à l'entreprise ET à l'utilisateur
  const payload = { 
    ...client, 
    user_id: userId, 
    entreprise_id: entrepriseId 
  };
  
  const { data, error } = await supabase
    .from('clients')
    .upsert(payload)
    .select();
    
  if (error) throw error;
  return data;
};

export const deleteClient = async (id) => {
  const { error } = await supabase.from('clients').delete().eq('id', id);
  if (error) throw error;
  return true;
};

// --- LOGIQUE HISTORIQUE ---

export const fetchHistoriqueDevis = async (userId) => {
  const { data, error } = await supabase
    .from('devis')
    .select(`
      id,
      created_at,
      total_ht,
      total_ttc,
      clients ( nom ),
      entreprises ( nom )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};
// Dans api.js, ajoute cette fonction :
export const fetchDevisDetails = async (devisId) => {
  const { data, error } = await supabase
    .from('devis')
    .select(`
      *,
      clients (*),
      entreprises (*),
      devis_items (*)
    `)
    .eq('id', devisId)
    .single();

  if (error) throw error;
  return data;
};

export const deleteDevis = async (id) => {
  const { error } = await supabase
    .from('devis')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};