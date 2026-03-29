import { supabase } from '../supabaseClient';

export const saveFullDevis = async ({ session, provider, client, items, totalHT, totalTTC, tvaRate }) => {
  if (!session?.user?.id) throw new Error("Utilisateur non connecté");
  if (!provider?.id) throw new Error("Aucune entreprise sélectionnée");
  if (!client?.nom) throw new Error("Nom du client manquant");

  // 1. Création du Client
  const { data: newClient, error: clientErr } = await supabase
    .from('clients')
    .insert([{ 
      nom: client.nom, 
      adresse: client.adresse, 
      user_id: session.user.id 
    }])
    .select().single();

  if (clientErr) throw clientErr;

  // 2. Création du Devis
  const { data: newDevis, error: devisErr } = await supabase
    .from('devis')
    .insert([{
      user_id: session.user.id,
      entreprise_id: provider.id,
      client_id: newClient.id,
      total_ht: totalHT,
      total_ttc: totalTTC,
      tva_taux: tvaRate
    }])
    .select().single();

  if (devisErr) throw devisErr;

  // 3. Création des lignes (Articles)
  const lines = items.map(it => ({
    devis_id: newDevis.id,
    user_id: session.user.id,
    service: it.description,
    qte: it.quantite,
    pu: it.prix
  }));

  const { error: linesErr } = await supabase.from('devis_items').insert(lines);
  if (linesErr) throw linesErr;

  return { success: true, devisId: newDevis.id };
};