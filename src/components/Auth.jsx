import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // Nouvel état
  const [isLogin, setIsLogin] = useState(true);

const handleAuth = async (e) => {
e.preventDefault();
  setLoading(true);

  try {
    if (isLogin) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      console.log("Connecté !", data);
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      
      // Si l'inscription réussit, Supabase renvoie l'utilisateur
      if (data.user) {
        alert("Inscription réussie ! Vous devriez maintenant le voir dans Supabase.");
        console.log("Utilisateur créé :", data.user);
      }
    }
  } catch (error) {
    // TRÈS IMPORTANT : On affiche l'erreur exacte
    console.error("Détails de l'erreur :", error);
    alert(`Erreur : ${error.message} (Code: ${error.status})`);
  } finally {
    setLoading(false);
  }
  };

  

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>🛠️ Devis Pro <span>Cloud</span></h1>
        <p>{isLogin ? "Bon retour !" : "Créez votre compte gratuit"}</p>
        
        <form onSubmit={handleAuth} className="auth-form">
          <input 
            type="email" 
            placeholder="Votre email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="Mot de passe" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          
          {/* CHAMP DE CONFIRMATION (Affiché seulement si Inscription) */}
          {!isLogin && (
            <input 
              type="password" 
              placeholder="Confirmez le mot de passe" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required 
              style={{ borderLeft: password === confirmPassword && password !== '' ? '4px solid var(--success)' : '4px solid var(--danger)' }}
            />
            
          )}
            {!isLogin && (
            <div className="password-requirements no-print">
                <p style={{ color: password.length >= 8 ? 'var(--success)' : 'var(--text-muted)' }}>
                {password.length >= 8 ? '✅' : '○'} 8 caractères minimum
                </p>
                <p style={{ color: /[0-9]/.test(password) ? 'var(--success)' : 'var(--text-muted)' }}>
                {/[0-9]/.test(password) ? '✅' : '○'} Au moins un chiffre
                </p>
                <p style={{ color: /[!@#$%^&*]/.test(password) ? 'var(--success)' : 'var(--text-muted)' }}>
                {/[!@#$%^&*]/.test(password) ? '✅' : '○'} Un caractère spécial (!@#$%^&*)
                </p>
            </div>
            )}

          <button type="submit" disabled={loading} className="btn-auth">
            {loading ? "Traitement..." : (isLogin ? "Se connecter" : "S'inscrire")}
          </button>
        </form>

        <button className="btn-switch-auth" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
        </button>
      </div>
    </div>
  );
}