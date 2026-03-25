import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSpells } from '../context/SpellContext';
import { ArrowLeft, Download, ArrowUpCircle } from 'lucide-react';

export default function SpellDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { savedSpells, saveSpell } = useSpells();
  const spell = savedSpells.find(s => s.id === id);

  if (!spell) {
    return (
      <div className="glass-container" style={{ textAlign: 'center' }}>
        <h2>Magia não encontrada</h2>
        <button className="btn btn-outline" style={{ marginTop: '1rem' }} onClick={() => navigate('/')}>
          Voltar para Home
        </button>
      </div>
    );
  }

  const handleEvolve = () => {
    // Evoluir magia: aumenta o nível em 1 e volta para a tela de edição (para o usuário redistribuir pontos)
    // No entanto a regra diz "evoluir adquirir novos pontos para colocar".
    // Isso requer uma UI de edição. Vamos navegar para criar passando um state para simbolizar "editar".
    navigate('/create', { state: { editSpell: spell, evolve: true } });
  };

  const downloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(spell, null, 2));
    const dt = document.createElement('a');
    dt.setAttribute("href", dataStr);
    dt.setAttribute("download", spell.name.replace(/\s+/g, '_') + ".json");
    dt.click();
  };

  const downloadTxt = () => {
    let content = `# ${spell.name}\n\n`;
    content += `Nível: ${spell.level}\nElemento: ${spell.element}\nEspectro: ${spell.spectrum}\nCusto: ${spell.finalManaCost} PM\n\n`;
    content += `**Descrição e Regra**\n${spell.aiDescription}\n`;
    const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(content);
    const dt = document.createElement('a');
    dt.setAttribute("href", dataStr);
    dt.setAttribute("download", spell.name.replace(/\s+/g, '_') + ".md");
    dt.click();
  };

  return (
    <div className="animate-fade">
      <button className="btn btn-outline" style={{ marginBottom: '2rem' }} onClick={() => navigate('/')}>
        <ArrowLeft size={18} /> Voltar
      </button>

      <div className="glass-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="title" style={{ fontSize: '3rem' }}>{spell.name}</h1>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <span className={`badge badge-${spell.spectrum.toLowerCase()}`}>{spell.spectrum}</span>
              <span className={`badge badge-${spell.element.toLowerCase().replace('á', 'a')}`}>{spell.element}</span>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.05)' }}>Nível {spell.level}</span>
              <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa' }}>{spell.finalManaCost} PM</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary" onClick={handleEvolve}>
              <ArrowUpCircle size={20} /> Evoluir Magia (+1 Nív)
            </button>
            <button className="btn btn-outline" onClick={downloadTxt}>
              <Download size={20} /> TXT
            </button>
          </div>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ fontFamily: 'Outfit', fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--accent-secondary)' }}>Descrição & Regras</h3>
          <div style={{ 
            background: 'rgba(0,0,0,0.3)', 
            padding: '1.5rem', 
            borderRadius: '8px',
            whiteSpace: 'pre-wrap',
            fontFamily: 'Inter',
            lineHeight: '1.6'
          }} dangerouslySetInnerHTML={{ __html: spell.aiDescription.replace(/\\n/g, '<br/>') }}>
          </div>
        </div>

      </div>
    </div>
  );
}
