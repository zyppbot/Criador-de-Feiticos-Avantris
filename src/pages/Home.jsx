import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSpells } from '../context/SpellContext';
import { Plus, Trash2, ArrowUpCircle } from 'lucide-react';

function Home() {
  const { savedSpells, deleteSpell } = useSpells();
  const navigate = useNavigate();

  return (
    <div className="animate-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="title">Gaveta de Magias</h1>
          <p className="subtitle">Gerencie suas magias criadas no Avantris RPG</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/create')}>
          <Plus size={20} /> Nova Magia
        </button>
      </div>

      {savedSpells.length === 0 ? (
        <div className="glass-container" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>Você ainda não possui magias salvas.</h3>
          <button className="btn btn-outline" onClick={() => navigate('/create')}>
            Comece a criar agora
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {savedSpells.map(spell => (
            <div key={spell.id} className="spell-card">
              <div className="spell-header">
                <h3 style={{ fontSize: '1.3rem', fontFamily: 'Outfit' }}>{spell.name}</h3>
                <span className={`badge badge-${spell.spectrum.toLowerCase()}`}>{spell.spectrum}</span>
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span className={`badge badge-${spell.element.toLowerCase().replace('á', 'a')}`}>{spell.element}</span>
                <span className="badge" style={{ background: 'rgba(255,255,255,0.05)' }}>Nível {spell.level}</span>
                <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa' }}>{spell.finalManaCost} PM</span>
              </div>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', flex: 1 }}>
                Dano: {spell.damage} | Cura: {spell.healing} | Exec: {spell.execution}
              </p>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => navigate('/spell/' + spell.id)}>
                  Ver Detalhes
                </button>
                <button className="btn btn-danger" onClick={() => deleteSpell(spell.id)} title="Excluir">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
