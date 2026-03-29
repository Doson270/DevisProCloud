import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function GestionClients({ session }) {
  const [clients, setClients] = useState([]);
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState(''); // Nouveau champ
  const [adresse, setAdresse] = useState(''); // Nouveau champ

  const fetchClients = async () => {
    const { data } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', session.user.id);
    if (data) setClients(data);
  };

  useEffect(() => { fetchClients(); }, [session]);

  const addClient = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from('clients')
      .insert([{ 
        nom, 
        email, 
        adresse, 
        user_id: session.user.id 
      }]);

    if (!error) {
      setNom(''); setEmail(''); setAdresse('');
      fetchClients();
    } else {
      alert("Erreur : " + error.message);
    }
  };

  return (
    <div className="section-card">
      <h2>👥 Gestion des Clients</h2>
      <form onSubmit={addClient}>
        <input placeholder="Nom du client" value={nom} onChange={e => setNom(e.target.value)} required />
        <input type="email" placeholder="Email du client" value={email} onChange={e => setEmail(e.target.value)} />
        <textarea placeholder="Adresse complète" value={adresse} onChange={e => setAdresse(e.target.value)} />
        <button type="submit" className="btn-save">Ajouter le client</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th>Adresse</th>
          </tr>
        </thead>
        <tbody>
          {clients.map(c => (
            <tr key={c.id}>
              <td>{c.nom}</td>
              <td>{c.email}</td>
              <td>{c.adresse}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}