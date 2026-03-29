import React from 'react';

export default function ArticlesTable({ items, setItems }) {
  
  // Ajouter une ligne vide
  const addItem = () => {
    setItems([...items, { id: Date.now(), description: '', quantite: 1, prix: 0 }]);
  };

  // Modifier une ligne
  const updateItem = (id, field, value) => {
    const newItems = items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    );
    setItems(newItems);
  };

  // Supprimer une ligne
  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  return (
    <div style={{ marginTop: '30px', background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
            <th style={{ padding: '10px' }}>Description de la prestation</th>
            <th style={{ padding: '10px', width: '80px' }}>Qté</th>
            <th style={{ padding: '10px', width: '120px' }}>Prix HT (€)</th>
            <th style={{ padding: '10px', width: '100px' }}>Total</th>
            <th style={{ padding: '10px', width: '50px' }}></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
              <td style={{ padding: '5px' }}>
                <input 
                  style={inputStyle} 
                  placeholder="Ex: Pose de carrelage..." 
                  value={item.description}
                  onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                />
              </td>
              <td style={{ padding: '5px' }}>
                <input 
                  type="number" 
                  style={inputStyle} 
                  value={item.quantite}
                  onChange={(e) => updateItem(item.id, 'quantite', parseFloat(e.target.value) || 0)}
                />
              </td>
              <td style={{ padding: '5px' }}>
                <input 
                  type="number" 
                  style={inputStyle} 
                  value={item.prix}
                  onChange={(e) => updateItem(item.id, 'prix', parseFloat(e.target.value) || 0)}
                />
              </td>
              <td style={{ padding: '10px', fontWeight: 'bold' }}>
                {(item.quantite * item.prix).toFixed(2)} €
              </td>
              <td style={{ padding: '5px' }}>
                <button onClick={() => removeItem(item.id)} style={btnDelStyle}>✕</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <button onClick={addItem} style={btnAddStyle}>
        ➕ Ajouter une ligne
      </button>
    </div>
  );
}

// Styles rapides
const inputStyle = { width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' };
const btnAddStyle = { marginTop: '15px', padding: '10px 15px', background: '#3498db', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' };
const btnDelStyle = { background: '#ff7675', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '5px 8px' };