export function DevisTable({ items, onUpdateItem, onDeleteLine, onAddLine }) {
  return (
    <>
      <table className="devis-table">
        <thead>
          <tr>
            <th>Désignation</th>
            <th className="w-100">Qté</th>
            <th className="w-150">PU HT</th>
            <th className="w-100">Total HT</th>
            <th className="no-print"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td><input value={item.service} onChange={e => onUpdateItem(item.id, 'service', e.target.value)} /></td>
              <td><input type="number" value={item.qte} onChange={e => onUpdateItem(item.id, 'qte', e.target.value)} /></td>
              <td><input type="number" value={item.pu} onChange={e => onUpdateItem(item.id, 'pu', e.target.value)} /></td>
              <td className="text-right">{(item.qte * item.pu).toFixed(2)} €</td>
              <td className="no-print"><button onClick={() => onDeleteLine(item.id)}>×</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="btn-add no-print" onClick={onAddLine}>+ Ajouter une ligne</button>
    </>
  );
}