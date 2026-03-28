import React from 'react';

export function TableauArticles({ items, setItems }) {
  
  const handleItemChange = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        // Conversion en nombre pour les calculs, texte pour le service
        const val = (field === 'qte' || field === 'pu') ? parseFloat(value) || 0 : value;
        return { ...item, [field]: val };
      }
      return item;
    }));
  };

  const addLine = () => setItems([...items, { id: Date.now(), service: '', qte: 1, pu: 0 }]);
  const deleteLine = (id) => items.length > 1 && setItems(items.filter(i => i.id !== id));

  return (
    <div className="items-section">
      <table className="devis-table">
        <thead>
          <tr>
            <th>Désignation des travaux</th>
            <th className="w-100">Qté</th>
            <th className="w-150">PU HT</th>
            <th className="w-100 text-right">Total HT</th>
            <th className="w-50 no-print"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                <input 
                  value={item.service} 
                  onChange={e => handleItemChange(item.id, 'service', e.target.value)} 
                  placeholder="Ex: Pose de carrelage..."
                />
              </td>
              <td>
                <input 
                  type="number" 
                  value={item.qte} 
                  onChange={e => handleItemChange(item.id, 'qte', e.target.value)} 
                />
              </td>
              <td>
                <input 
                  type="number" 
                  value={item.pu} 
                  onChange={e => handleItemChange(item.id, 'pu', e.target.value)} 
                />
              </td>
              <td className="text-right">
                {(Number(item.qte) * Number(item.pu)).toFixed(2)} €
              </td>
              <td className="no-print">
                <button className="btn-delete" onClick={() => deleteLine(item.id)}>×</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="btn-add no-print" onClick={addLine}>+ Ajouter une prestation</button>
    </div>
  );
}