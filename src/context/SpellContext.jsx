import React, { createContext, useContext, useState, useEffect } from 'react';

const SpellContext = createContext();

export function SpellProvider({ children }) {
  const [savedSpells, setSavedSpells] = useState(() => {
    const local = localStorage.getItem('avantris_spells');
    return local ? JSON.parse(local) : [];
  });

  const [customEffects, setCustomEffects] = useState(() => {
    const local = localStorage.getItem('avantris_custom_effects');
    return local ? JSON.parse(local) : [];
  });

  const [apiKey, setApiKey] = useState(() => {
    return import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('gemini_api_key') || '';
  });

  useEffect(() => {
    localStorage.setItem('avantris_spells', JSON.stringify(savedSpells));
  }, [savedSpells]);

  useEffect(() => {
    localStorage.setItem('avantris_custom_effects', JSON.stringify(customEffects));
  }, [customEffects]);

  useEffect(() => {
    localStorage.setItem('gemini_api_key', apiKey);
  }, [apiKey]);

  const saveSpell = (spell) => {
    setSavedSpells(prev => {
      const idx = prev.findIndex(s => s.id === spell.id);
      if (idx !== -1) {
        const newSpells = [...prev];
        newSpells[idx] = spell;
        return newSpells;
      }
      return [...prev, spell];
    });
  };

  const deleteSpell = (id) => {
    setSavedSpells(prev => prev.filter(spell => spell.id !== id));
  };

  const addCustomEffect = (effect) => {
    setCustomEffects(prev => [...prev, effect]);
  };

  return (
    <SpellContext.Provider value={{
      savedSpells, saveSpell, deleteSpell,
      customEffects, addCustomEffect,
      apiKey, setApiKey
    }}>
      {children}
    </SpellContext.Provider>
  );
}

export function useSpells() {
  return useContext(SpellContext);
}
