/**
 * Calcula os pontos totais de criação de uma magia baseando-se no elemento, espectro, e nível.
 */
export function calculateTotalPoints(level, element, spectrum, metalRestrictionModifier, waterVariations) {
  let points = 3; // Base (Terra)

  switch (element) {
    case 'Madeira':
      points = 1.5 + (1.5 * level);
      points = Math.ceil(points);
      break;
    case 'Fogo':
      points = 3 + (4 * level);
      break;
    case 'Terra':
      points = 3 + (3 * level);
      break;
    case 'Metal':
      // Modificador de restrição do metal (0 a 4 pontos por nível) 
      const modifier = metalRestrictionModifier || 0;
      points = Math.floor(3 + (5.5 * level)) + (modifier * level);
      break;
    case 'Água':
      const variations = parseInt(waterVariations) || 1;
      // Caso base (1 variação extra / 2 totais -> -1 ponto).
      const variationPenalty = variations > 1 ? (variations - 1) : 0;
      points = (3 + (3 * level)) - variationPenalty;
      break;
    default:
      points = 3 + (3 * level);
  }

  // Espectro Ying dá 1.2x arredondado
  if (spectrum === 'Ying') {
    points = Math.round(points * 1.2);
  }

  return points;
}

/**
 * Calcula os pontos gastos em uma magia na tela de criação
 */
export function calculateSpentPoints(
  executionStepsReduced, // int
  damage, // int
  healing, // int
  tempHpBaseCount, // int
  rangeLineCount, // int
  rangeConeCount, // int
  rangeAreaCount, // int
  effects, // array de objetos { cost: Number }
  manaReduction // int (pm reduzidos)
) {
  let spent = 0;
  
  // Execução
  spent += executionStepsReduced * 1;

  // Dano/Cura/V.Temp
  spent += damage * 1;
  spent += healing * 1;
  spent += Math.ceil(tempHpBaseCount / 2); // 1 pt para cada 2 temp hp

  // Alcance
  spent += rangeLineCount * 1;
  spent += rangeConeCount * 1;
  spent += rangeAreaCount * 1;

  // Efeitos
  effects.forEach(eff => {
    // se precisa diferenciar aliados e inimigos, custo dobra, mas deixaremos isso como custo modificado já vindo no objeto
    spent += eff.cost; 
  });

  // Mana Reduction
  spent += manaReduction * 2; // 2 pontos por PM reduzido

  return spent;
}
