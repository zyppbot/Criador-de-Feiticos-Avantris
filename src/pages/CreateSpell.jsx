import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useSpells } from '../context/SpellContext';
import { calculateTotalPoints, calculateSpentPoints } from '../utils/spellLogic';
import { evaluateCustomEffect, generateSpellDescription } from '../utils/ai';
import { AlertCircle, Wand2, Plus, Sparkles, CheckCircle, X } from 'lucide-react';

const EXECUTION_STEPS = ['Ação completa', 'Ação primária', 'Ação secundária', 'Ação de movimento', 'Reação', 'Ação livre', 'Passiva'];
const DEFAULT_SPELL = {
  id: '',
  name: '',
  level: 1,
  spectrum: 'Ying',
  element: 'Terra',
  metalRestrictionModifier: 0,
  waterVariations: 1,
  executionStepsReduced: 0,
  damage: 0,
  healing: 0,
  tempHpBaseCount: 0,
  rangeLineCount: 0,
  rangeConeCount: 0,
  rangeAreaCount: 0,
  effects: [],
  manaReduction: 0,
  aiDescription: ''
};

export default function CreateSpell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { saveSpell, customEffects, addCustomEffect, apiKey } = useSpells();

  const [step, setStep] = useState(1);
  const [spell, setSpell] = useState({ ...DEFAULT_SPELL });
  
  // AI States
  const [customEffectPrompt, setCustomEffectPrompt] = useState('');
  const [evaluatingEffect, setEvaluatingEffect] = useState(false);
  const [effectResult, setEffectResult] = useState(null);
  const [generatingDesc, setGeneratingDesc] = useState(false);
  const [errorObj, setErrorObj] = useState('');

  // Derived states
  const isEvolution = location.state?.evolve === true;
  
  useEffect(() => {
    if (location.state?.editSpell) {
      if (isEvolution) {
        setSpell({
          ...location.state.editSpell,
          level: location.state.editSpell.level + 1
        });
      } else {
        setSpell(location.state.editSpell);
      }
    }
  }, [location.state, isEvolution]);

  const totalPoints = calculateTotalPoints(spell.level, spell.element, spell.spectrum, spell.metalRestrictionModifier, spell.waterVariations);
  const spentPoints = calculateSpentPoints(
    spell.executionStepsReduced, spell.damage, spell.healing, spell.tempHpBaseCount,
    spell.rangeLineCount, spell.rangeConeCount, spell.rangeAreaCount, spell.effects, spell.manaReduction
  );
  const pointsLeft = totalPoints - spentPoints;
  const finalManaCost = Math.max(0, spell.level - spell.manaReduction);

  // Handlers
  const handleUpdate = (field, value) => {
    setSpell(prev => ({ ...prev, [field]: value }));
  };

  const handleEvaluateCustomEffect = async () => {
    if (!apiKey) {
      setErrorObj("Você precisa configurar sua API Key do Gemini no menu superior!");
      return;
    }
    setErrorObj('');
    setEvaluatingEffect(true);
    try {
      const res = await evaluateCustomEffect(customEffectPrompt, apiKey);
      setEffectResult(res);
    } catch (err) {
      setErrorObj(err.message);
    } finally {
      setEvaluatingEffect(false);
    }
  };

  const handleAddCustomEffectResult = () => {
    if (effectResult) {
      const effectData = { ...effectResult, id: uuidv4(), isCustom: true };
      addCustomEffect(effectData); // Salva globalmente
      handleUpdate('effects', [...spell.effects, effectData]); // Adiciona na magia
      setCustomEffectPrompt('');
      setEffectResult(null);
    }
  };

  const handleGenerateFinal = async () => {
    if (!apiKey) {
      setErrorObj("Você precisa configurar sua API Key do Gemini para gerar a descrição final!");
      return;
    }
    setErrorObj('');
    setGeneratingDesc(true);
    try {
      const rangeDesc = `Linha: ${spell.rangeLineCount * 3}m | Cone: ${spell.rangeConeCount * 2}m | Área: ${spell.rangeAreaCount * 1}m`;
      const desc = await generateSpellDescription({ ...spell, finalManaCost, rangeDesc, execution: EXECUTION_STEPS[spell.executionStepsReduced] }, apiKey);
      
      const newSpell = {
        ...spell,
        id: spell.id || uuidv4(),
        finalManaCost,
        rangeDesc,
        execution: EXECUTION_STEPS[spell.executionStepsReduced],
        aiDescription: desc
      };
      saveSpell(newSpell);
      navigate('/spell/' + newSpell.id);
    } catch (err) {
      setErrorObj(err.message);
    } finally {
      setGeneratingDesc(false);
    }
  };

  return (
    <div className="animate-fade">
      <div className="progress-bar-container">
        {[1, 2, 3, 4].map(s => (
          <div key={s} className={`progress-step ${step >= s ? 'progress-step-active' : ''}`}></div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="title">{isEvolution ? 'Evoluir Magia' : 'Criar Nova Magia'}</h1>
      </div>

      {errorObj && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '1rem', borderRadius: '8px', color: '#ef4444', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <AlertCircle size={20} />
          <span>{errorObj}</span>
        </div>
      )}

      {(step > 1 && step < 4) && (
        <div className="points-display">
          <span className="points-text">Pontos Disponíveis:</span>
          <span className={`points-number ${pointsLeft < 0 ? 'negative' : ''}`}>{pointsLeft} / {totalPoints}</span>
        </div>
      )}

      {/* STEP 1: BASE */}
      {step === 1 && (
        <div className="glass-container animate-fade">
          <h2 style={{ marginBottom: '1.5rem', fontFamily: 'Outfit' }}>1. Conceito Base</h2>
          <div className="form-group">
            <label className="form-label">Nome da Magia</label>
            <input type="text" className="form-control" value={spell.name} onChange={e => handleUpdate('name', e.target.value)} placeholder="Ex: Prisma Fraturado..." />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Espectro</label>
              <select className="form-control" value={spell.spectrum} onChange={e => handleUpdate('spectrum', e.target.value)}>
                <option value="Ying">Ying (Passividade / Utilidade / Cura)</option>
                <option value="Yang">Yang (Agressividade / Combate / Dano)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Elemento</label>
              <select className="form-control" value={spell.element} onChange={e => handleUpdate('element', e.target.value)}>
                <option value="Madeira">Madeira (Crescimento/Cumulativo)</option>
                <option value="Fogo">Fogo (Criatividade/Subversão)</option>
                <option value="Terra">Terra (Estabilidade/Conceito Base)</option>
                <option value="Metal">Metal (Poder com Restrições)</option>
                <option value="Água">Água (Versatilidade/Variações)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Nível da Magia</label>
              <input type="number" min="1" max="20" className="form-control" value={spell.level} onChange={e => handleUpdate('level', parseInt(e.target.value) || 1)} disabled={isEvolution} />
            </div>
          </div>

          {spell.element === 'Metal' && (
            <div className="form-group" style={{ background: 'rgba(255,107,107,0.1)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255,107,107,0.3)' }}>
              <label className="form-label">Poder da Restrição Metálica (Narrador decide: 1 a 4 pontos por nível)</label>
              <input type="number" min="0" max="4" className="form-control" value={spell.metalRestrictionModifier} onChange={e => handleUpdate('metalRestrictionModifier', parseInt(e.target.value) || 0)} />
              <label className="form-label" style={{ marginTop: '1rem' }}>Descreva a restrição:</label>
              <input type="text" className="form-control" value={spell.metalRestriction || ''} onChange={e => handleUpdate('metalRestriction', e.target.value)} placeholder="Ex: Não pode mentir..." />
            </div>
          )}
          
          {spell.element === 'Água' && (
            <div className="form-group" style={{ background: 'rgba(96,165,250,0.1)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(96,165,250,0.3)' }}>
              <label className="form-label">Número total de Variações de Uso</label>
              <input type="number" min="2" max="10" className="form-control" value={spell.waterVariations} onChange={e => handleUpdate('waterVariations', parseInt(e.target.value) || 2)} />
              <p style={{ fontSize: '0.85rem', color: '#60a5fa', marginTop: '0.5rem' }}>Cada variação conta como uma versão separada da magia. A cada variação extra, -1 ponto total.</p>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
            <button className="btn btn-primary" onClick={() => setStep(2)} disabled={!spell.name}>Próximo <Plus size={18} /></button>
          </div>
        </div>
      )}

      {/* STEP 2: MODIFIERS */}
      {step === 2 && (
        <div className="glass-container animate-fade">
          <h2 style={{ marginBottom: '1.5rem', fontFamily: 'Outfit' }}>2. Modificadores Numéricos</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Molde a estrutura base da magia.</p>
          
          <div className="modifier-card">
            <div className="modifier-info">
              <h4>Tempo de Execução ({EXECUTION_STEPS[spell.executionStepsReduced]})</h4>
              <p>Reduzir execução (1 pt/passo)</p>
            </div>
            <div className="controls-group">
              <button className="btn btn-outline" onClick={() => handleUpdate('executionStepsReduced', Math.max(0, spell.executionStepsReduced - 1))}>-</button>
              <span className="value">{spell.executionStepsReduced}</span>
              <button className="btn btn-outline" onClick={() => handleUpdate('executionStepsReduced', Math.min(6, spell.executionStepsReduced + 1))}>+</button>
            </div>
          </div>

          <div className="modifier-card">
            <div className="modifier-info">
              <h4>Dano Direto</h4>
              <p>1 pt = +1 Dano</p>
            </div>
            <div className="controls-group">
              <button className="btn btn-outline" onClick={() => handleUpdate('damage', Math.max(0, spell.damage - 1))}>-</button>
              <span className="value">{spell.damage}</span>
              <button className="btn btn-outline" onClick={() => handleUpdate('damage', spell.damage + 1)}>+</button>
            </div>
          </div>

          <div className="modifier-card">
            <div className="modifier-info">
              <h4>Cura</h4>
              <p>1 pt = +1 de Cura</p>
            </div>
            <div className="controls-group">
              <button className="btn btn-outline" onClick={() => handleUpdate('healing', Math.max(0, spell.healing - 1))}>-</button>
              <span className="value">{spell.healing}</span>
              <button className="btn btn-outline" onClick={() => handleUpdate('healing', spell.healing + 1)}>+</button>
            </div>
          </div>

          <div className="modifier-card">
            <div className="modifier-info">
              <h4>Aumentar Alcance</h4>
              <p>1 pt = +3m Linha | +2m Cone | +1m Área</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding:'0.5rem', borderRadius:'8px' }}>
                <span style={{ fontSize: '0.8rem', color:'var(--text-muted)' }}>Linha</span>
                <button style={{ padding: '0 0.5rem', border:'none', background:'transparent', color:'var(--text-main)', cursor:'pointer' }} onClick={() => handleUpdate('rangeLineCount', Math.max(0, spell.rangeLineCount - 1))}>-</button>
                <span className="value" style={{ fontSize:'1rem' }}>{spell.rangeLineCount}</span>
                <button style={{ padding: '0 0.5rem', border:'none', background:'transparent', color:'var(--text-main)', cursor:'pointer' }} onClick={() => handleUpdate('rangeLineCount', spell.rangeLineCount + 1)}>+</button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding:'0.5rem', borderRadius:'8px' }}>
                <span style={{ fontSize: '0.8rem', color:'var(--text-muted)' }}>Cone</span>
                <button style={{ padding: '0 0.5rem', border:'none', background:'transparent', color:'var(--text-main)', cursor:'pointer' }} onClick={() => handleUpdate('rangeConeCount', Math.max(0, spell.rangeConeCount - 1))}>-</button>
                <span className="value" style={{ fontSize:'1rem' }}>{spell.rangeConeCount}</span>
                <button style={{ padding: '0 0.5rem', border:'none', background:'transparent', color:'var(--text-main)', cursor:'pointer' }} onClick={() => handleUpdate('rangeConeCount', spell.rangeConeCount + 1)}>+</button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding:'0.5rem', borderRadius:'8px' }}>
                <span style={{ fontSize: '0.8rem', color:'var(--text-muted)' }}>Área</span>
                <button style={{ padding: '0 0.5rem', border:'none', background:'transparent', color:'var(--text-main)', cursor:'pointer' }} onClick={() => handleUpdate('rangeAreaCount', Math.max(0, spell.rangeAreaCount - 1))}>-</button>
                <span className="value" style={{ fontSize:'1rem' }}>{spell.rangeAreaCount}</span>
                <button style={{ padding: '0 0.5rem', border:'none', background:'transparent', color:'var(--text-main)', cursor:'pointer' }} onClick={() => handleUpdate('rangeAreaCount', spell.rangeAreaCount + 1)}>+</button>
              </div>
            </div>
          </div>

          <div className="modifier-card">
            <div className="modifier-info">
              <h4>Redução de Custo de PM ({finalManaCost} PM)</h4>
              <p>2 pts = -1 PM de custo base ({spell.level})</p>
            </div>
            <div className="controls-group">
              <button className="btn btn-outline" onClick={() => handleUpdate('manaReduction', Math.max(0, spell.manaReduction - 1))}>-</button>
              <span className="value">{spell.manaReduction}</span>
              <button className="btn btn-outline" onClick={() => handleUpdate('manaReduction', Math.min(spell.level, spell.manaReduction + 1))}>+</button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
            <button className="btn btn-outline" onClick={() => setStep(1)}>Voltar</button>
            <button className="btn btn-primary" onClick={() => setStep(3)}>Próximo <Plus size={18} /></button>
          </div>
        </div>
      )}

      {/* STEP 3: EFFECTS */}
      {step === 3 && (
        <div className="glass-container animate-fade">
          <h2 style={{ marginBottom: '1.5rem', fontFamily: 'Outfit' }}>3. Efeitos Acoplados</h2>
          
          <div style={{ marginBottom: '2rem', padding: '1rem', border: '1px dashed var(--border-glass)', borderRadius: '8px' }}>
            <h4 style={{ marginBottom: '0.5rem', color: 'var(--accent-secondary)' }}>Efeitos Ativos:</h4>
            {spell.effects.length === 0 ? <span style={{ color: 'var(--text-muted)' }}>Nenhum efeito selecionado.</span> : (
              <div style={{ display: 'flex', flexWrap:'wrap', gap: '0.5rem' }}>
                {spell.effects.map((e, idx) => (
                  <span key={idx} className="badge" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
                    {e.name} ({e.cost} pt)
                    <X size={14} style={{ cursor: 'pointer', color: '#ef4444' }} onClick={() => handleUpdate('effects', spell.effects.filter((_, i) => i !== idx))} />
                  </span>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '2rem' }}>
            {/* Lista custom efeitos IA */}
            <div>
              <h3 style={{ marginBottom: '1rem' }}><Sparkles size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.5rem', color: '#f59e0b' }} /> Criar Efeito Único (IA)</h3>
              <textarea 
                className="form-control" 
                rows="4" 
                placeholder="Descreva o efeito e suas condições..."
                value={customEffectPrompt}
                onChange={e => setCustomEffectPrompt(e.target.value)}
              />
              <button className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }} onClick={handleEvaluateCustomEffect} disabled={evaluatingEffect || !customEffectPrompt}>
                {evaluatingEffect ? 'Avaliando Custo...' : 'Avaliar Efeito com IA'}
              </button>

              {effectResult && (
                <div style={{ marginTop: '1rem', background: 'rgba(74, 222, 128, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid #4ade80' }}>
                  <h4 style={{ color: '#4ade80' }}>{effectResult.name} (Custo: {effectResult.cost} pts)</h4>
                  <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>{effectResult.feedback}</p>
                  <button className="btn btn-outline" style={{ marginTop: '1rem', borderColor: '#4ade80', color: '#4ade80' }} onClick={handleAddCustomEffectResult}>
                    <CheckCircle size={16} /> Acoplar este Efeito
                  </button>
                </div>
              )}

              {customEffects.length > 0 && (
                <div style={{ marginTop: '2.5rem' }}>
                  <h4 style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Sua Biblioteca Personalizada</h4>
                  <div style={{ display: 'grid', gap: '0.5rem' }}>
                    {customEffects.map(ce => (
                      <button key={ce.id} className="btn btn-outline" style={{ justifyContent: 'space-between' }} onClick={() => handleUpdate('effects', [...spell.effects, ce])}>
                        <span>{ce.name}</span>
                        <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>{ce.cost} pt</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Listas manuais (Exemplo resumido) */}
            <div>
              <h3 style={{ marginBottom: '1rem' }}>Efeitos Comuns</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '500px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                <button className="btn btn-outline" style={{ justifyContent:'space-between' }} onClick={() => handleUpdate('effects', [...spell.effects, {cost: 1, name: 'Empurrar 3m'}])}><span>Empurrar 3m</span><span>1 pt</span></button>
                <button className="btn btn-outline" style={{ justifyContent:'space-between' }} onClick={() => handleUpdate('effects', [...spell.effects, {cost: 1, name: '-1 Teste'}])}><span>-1 Teste</span><span>1 pt</span></button>
                <button className="btn btn-outline" style={{ justifyContent:'space-between' }} onClick={() => handleUpdate('effects', [...spell.effects, {cost: 2, name: 'Envenenar'}])}><span>Envenenar</span><span>2 pt</span></button>
                <button className="btn btn-outline" style={{ justifyContent:'space-between' }} onClick={() => handleUpdate('effects', [...spell.effects, {cost: 2, name: 'Queimar'}])}><span>Queimar</span><span>2 pt</span></button>
                <button className="btn btn-outline" style={{ justifyContent:'space-between' }} onClick={() => handleUpdate('effects', [...spell.effects, {cost: 3, name: 'Atordoar / Paralisar'}])}><span>Atordoar / Paralisar</span><span>3 pt</span></button>
                <button className="btn btn-outline" style={{ justifyContent:'space-between' }} onClick={() => handleUpdate('effects', [...spell.effects, {cost: 4, name: '-1 PM Maximo'}])}><span>-1 PM Maximo</span><span>4 pt</span></button>
                <button className="btn btn-outline" style={{ justifyContent:'space-between' }} onClick={() => handleUpdate('effects', [...spell.effects, {cost: 5, name: 'Desmembrar / Controle Mental'}])}><span>Desmembrar / Controle</span><span>5 pt</span></button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
            <button className="btn btn-outline" onClick={() => setStep(2)}>Voltar</button>
            <button className="btn btn-primary" onClick={() => setStep(4)} disabled={pointsLeft < 0}>Próximo (Gerar Magia) <Wand2 size={18} /></button>
          </div>
        </div>
      )}

      {/* STEP 4: GENERATE AND FINALIZE */}
      {step === 4 && (
        <div className="glass-container animate-fade" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <Wand2 size={48} color="var(--accent-primary)" style={{ margin: '0 auto 1.5rem auto' }} />
          <h2 style={{ marginBottom: '1rem', fontFamily: 'Outfit' }}>Equilíbrio Arcano: {pointsLeft} pontos restantes</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem auto' }}>
            Sua magia "{spell.name}" está com as especificações prontas. Ao continuar, a I.A irá gerar a descrição narrativa e mecânica completa e oficializar a criação.
          </p>
          
          <div style={{ background: 'var(--bg-primary)', display: 'inline-block', textAlign: 'left', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-glass)', marginBottom: '2rem' }}>
            <p><strong>Custo PM:</strong> {finalManaCost}</p>
            <p><strong>Dano / Cura:</strong> {spell.damage} / {spell.healing}</p>
            <p><strong>Efeitos:</strong> {spell.effects.length > 0 ? spell.effects.map(e => e.name).join(', ') : 'Nenhum'}</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button className="btn btn-outline" onClick={() => setStep(3)} disabled={generatingDesc}>Voltar as Edições</button>
            <button className="btn btn-primary" onClick={handleGenerateFinal} disabled={generatingDesc}>
              {generatingDesc ? 'Forjando Magia...' : 'Gerar Magia Final com IA'} <Sparkles size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
