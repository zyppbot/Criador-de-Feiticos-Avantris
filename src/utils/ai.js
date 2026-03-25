import { calculateTotalPoints, calculateSpentPoints } from './spellLogic';

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

export async function evaluateCustomEffect(effectDescription, apiKey) {
  const prompt = [
    'Você é o mestre especialista em balanceamento do sistema "Avantris RPG" (um sistema inspirado em Tormenta20/DnD com roda elemental chinesa).',
    'O usuário deseja criar o seguinte efeito mágico personalizado para uma magia:',
    '"' + effectDescription + '"',
    'Seu trabalho é analisar esse efeito em relação às categorias oficiais:',
    '- Efeitos Leves (Custo 1): empurrar 3m, puxar 3m, restringir movimento, -1 em testes, náusea leve (enjoo), derrubar um item.',
    '- Efeitos Intermediários (Custo 2): envenenar, queimar, congelar, derreter, -2 em testes, dano contínuo.',
    '- Efeitos Pesados (Custo 3): atordoar, paralisar, remover ação, -3 em testes, encantar, feitiço poderoso, impedir uso de ficha por 1 turno.',
    '- Efeitos Poderosos (Custo 4): remover 1 VP máximo, remover 1 PM máximo, absorver dano, petrificar, roubar itens vestidos, remover condições pesadas.',
    '- Efeitos Extremos (Custo 5-6): desmembrar, trauma permanente, bloquear magia permanentemente, dano massivo (decair), controle mental total, desfazer limite/véu da realidade.',
    'Determine um custo justo para esse efeito (entre 1 e 6).',
    'Retorne a resposta EXCLUSIVAMENTE em formato JSON (sem blocos markdown) com as propriedades "cost" (Número inteiro), "name" (String curta resumindo o efeito) e "feedback" (String avaliando brevemente o efeito em pt-br). Se o efeito for idêntico a um já existente, aponte isso no "feedback" e dê o nome original. Não escreva mais nada além do JSON válido.'
  ].join('\n');

  const response = await fetch(GEMINI_URL + '?key=' + apiKey, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  if (!response.ok) {
    throw new Error('Falha ao comunicar com a API do Gemini. Verifique sua chave.');
  }

  const data = await response.json();
  try {
    const textResponse = data.candidates[0].content.parts[0].text;
    const jsonStr = textResponse.replace(/^```json/, '').replace(/```$/, '').trim();
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error(err, data);
    throw new Error('Falha ao extrair as informações da IA.');
  }
}

export async function generateSpellDescription(spellData, apiKey) {
  const metalRest = spellData.metalRestriction ? "- Restrição de Metal: " + spellData.metalRestriction : '';
  const effectsStr = spellData.effects.map(e => e.name).join(', ');
  
  const prompt = [
    'Você é um escritor de cenários de RPG de mesa e mestre narrador escrevendo o livro de regras para o "Avantris RPG".',
    'Aja como um game designer escrevendo o "flavor text" e a descrição mecânica de uma magia incrível.',
    'A magia recém-criada tem as seguintes características:',
    '- Nome: ' + spellData.name,
    '- Elemento: ' + spellData.element,
    '- Espectro: ' + spellData.spectrum,
    '- Nível Original: ' + spellData.level,
    '- Custo PM Final: ' + spellData.finalManaCost,
    '- Tempo de Execução Escolhido: ' + spellData.execution,
    '- Alcance Baseado em incrementos: ' + spellData.rangeDesc,
    '- Dano: ' + spellData.damage + ' | Cura: ' + spellData.healing + ' | Vida T.: ' + spellData.tempHp,
    '- Efeitos Acoplados: ' + effectsStr,
    metalRest,
    'Escreva uma descrição completa seguindo os moldes de magias completas de livros clássicos (como D&D/Tormenta 20).',
    'A descrição deve ser épica, dramática e explicar detalhadamente como a magia funciona na ficção, e então detalhar a regra mecânica do feitiço baseada nos atributos listados acima. A formatação deve usar Markdown (títulos, negritos, etc). Seja claro e criativo. Descreva-a totalmente em PT-BR. Sua resposta NÂO DEVE estar dentro de blocos de código tipo json. Retorne O PURO MARKDOWN DA DESCRIÇÃO'
  ].join('\n');

  const response = await fetch(GEMINI_URL + '?key=' + apiKey, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  if (!response.ok) {
    throw new Error('Falha ao comunicar com a API do Gemini. Verifique sua chave.');
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}
