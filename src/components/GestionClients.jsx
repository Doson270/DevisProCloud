import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { deleteClient as deleteClientAPI } from '../services/api'; // On renomme l'import pour éviter les conflits

export default function GestionClients({ session }) {
  const [clients, setClients] = useState([]);
  const [entreprises, setEntreprises] = useState([]);
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [adresse, setAdresse] = useState('');
  const [entrepriseId, setEntrepriseId] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: entData } = await supabase
        .from('entreprises')
        .select('id, nom')
        .eq('user_id', session.user.id);
      setEntreprises(entData || []);

      const { data: cliData } = await supabase
        .from('clients')
        .select('*, entreprises(nom)')
        .eq('user_id', session.user.id);
      setClients(cliData || []);
    } catch (err) {
      console.error("Erreur de chargement:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) fetchData();
  }, [session]);

  const addClient = async (e) => {
    e.preventDefault();
    if (!entrepriseId) return alert("Veuillez sélectionner une entreprise !");

    const { error } = await supabase
      .from('clients')
      .insert([{ 
        nom, 
        email, 
        adresse, 
        user_id: session.user.id,
        entreprise_id: entrepriseId 
      }]);

    if (!error) {
      setNom(''); setEmail(''); setAdresse(''); setEntrepriseId('');
      fetchData();
    } else {
      alert("Erreur : " + error.message);
    }
  };

  // --- LOGIQUE DE SUPPRESSION CORRIGÉE ---
  const handleDelete = async (id) => {
    if (window.confirm("⚠️ Supprimer ce client ? Cela ne supprimera pas ses devis déjà créés.")) {
      try {
        await deleteClientAPI(id); // On utilise la fonction API renommée
        // Mise à jour de l'état "clients" (le seul qu'on garde)
        setClients(prev => prev.filter(c => c.id !== id));
      } catch (err) {
        alert("Erreur lors de la suppression : " + err.message);
      }
    }
  };

  if (loading && entreprises.length === 0) return <div className="section-card">Chargement...</div>;

  return (
    <div className="gestion-clients-container">
      <h1>👥 Gestion des Clients</h1>

      <div className="section-card">
        <h3>Nouveau Client</h3>
        <form onSubmit={addClient} style={{ marginTop: '15px' }}>
          <div className="input-group">
            <label>Nom du client</label>
            <input placeholder="Ex: Jean Dupont" value={nom} onChange={e => setNom(e.target.value)} required />
          </div>

          <div className="input-group">
            <label>Entreprise rattachée</label>
            <select value={entrepriseId} onChange={e => setEntrepriseId(e.target.value)} required>
              <option value="">-- Choisir une entreprise --</option>
              {entreprises.map(ent => (
                <option key={ent.id} value={ent.id}>{ent.nom}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label>Email</label>
            <input type="email" placeholder="client@mail.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <div className="input-group">
            <label>Adresse</label>
            <textarea placeholder="Adresse complète" value={adresse} onChange={e => setAdresse(e.target.value)} />
          </div>

          <button type="submit" className="btn-save">Ajouter le client</button>
        </form>
      </div>

      <div className="section-card table-container">
        <table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Entreprise</th>
              <th>Email</th>
              <th>Adresse</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center' }}>Aucun client enregistré.</td></tr>
            ) : (
              clients.map(c => (
                <tr key={c.id}>
                  <td data-label="Nom"><strong>{c.nom}</strong></td>
                  <td data-label="Entreprise">
                    <span className="badge-entreprise">{c.entreprises?.nom || 'Non rattaché'}</span>
                  </td>
                  <td data-label="Email">{c.email || '-'}</td>
                  <td data-label="Adresse">{c.adresse || '-'}</td>
                  <td data-label="Actions" style={{ textAlign: 'center' }}>
                    <button onClick={() => handleDelete(c.id)} className="btn-danger">
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}