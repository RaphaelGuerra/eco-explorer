import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import './App.css';
import { useTranslation } from './hooks/useTranslation';
import LanguageSwitcher from './components/LanguageSwitcher';
import HintChip from './components/HintChip';
import ObjectiveRibbon from './components/ObjectiveRibbon';
import ConfettiBurst from './components/ConfettiBurst';
import sfx from './utils/sfx';
import PhotoMiniGame from './components/PhotoMiniGame';

// ===================== DATA STRUCTURES & GAME CONSTANTS =====================
const MAX_RESEARCH_LEVEL = 2;
const XP_PER_LEVEL = 100;
const XP_PER_ENCOUNTER = 25;
const SCAN_DURATION = 3000;
const FOCUS_TIMEOUT = 7000;
const BASE_ENCOUNTER_CHANCE = 0.80;
const BASE_RADIANT_CHANCE = 0.05;
const RARITY_WEIGHTS = { common: 10, uncommon: 5, rare: 1 };
const RARE_PITY_STEP = 0.25;
const RARE_PITY_MAX = 2.0; // up to +200% weight for rare
const RADIANT_PITY_STEP = 0.01; // +1% per non-radiant encounter
const RADIANT_PITY_MAX = 0.15; // cap +15%
const HOTSPOT_RADIUS = 75;
const IMAGE_ASSETS = {
    day: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2560&auto=format&fit=crop',
    night: 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?q=80&w=2670&auto=format&fit=crop',
};
const speciesData = [
    { id: 'onca_pintada', name: 'Onça-pintada', emoji: '🐆', rarity: 'rare', habitat: 'ground', quizPool: [
        { question: 'Qual é o maior felino das Américas?', correctAnswer: 'Onça-pintada', wrongAnswers: ['Leão', 'Tigre', 'Puma'] },
        { question: 'Como a onça-pintada caça suas presas?', correctAnswer: 'Mordida no crânio', wrongAnswers: ['Estrangulamento', 'Perseguição longa', 'Armadilhas'] },
        { question: 'Qual é o habitat preferido da onça-pintada?', correctAnswer: 'Floresta densa', wrongAnswers: ['Deserto', 'Pradaria', 'Montanha'] },
        { question: 'A onça-pintada é um animal...', correctAnswer: 'Solitary', wrongAnswers: ['Social', 'Migratório', 'Aquático'] },
        { question: 'Qual é a principal ameaça à onça-pintada?', correctAnswer: 'Perda de habitat', wrongAnswers: ['Caça excessiva', 'Doenças', 'Mudanças climáticas'] },
        { question: 'Como a onça-pintada marca seu território?', correctAnswer: 'Arranhando árvores', wrongAnswers: ['Construindo ninhos', 'Fazendo sons', 'Plantando árvores'] },
        { question: 'Qual é a velocidade máxima da onça-pintada?', correctAnswer: '80 km/h', wrongAnswers: ['120 km/h', '60 km/h', '100 km/h'] },
        { question: 'A onça-pintada é considerada...', correctAnswer: 'Espécie bandeira', wrongAnswers: ['Espécie invasora', 'Espécie comum', 'Espécie doméstica'] }
    ], encounterRules: { time: ['day', 'night'], weather: ['clear'] }, masteryPerk: { id: 'predator-instinct', name: 'Predator Instinct', description: 'Increases encounter rate with rare species.' }, relationships: { prey: ['capivara', 'paca'], predator_of: true }, behaviors: { hunting: { emoji: '🎯', description: 'Silently stalking prey', xp_bonus: 2.5, time_restricted: true }, resting: { emoji: '😴', description: 'Lying in wait', xp_bonus: 1.0 }, feeding: { emoji: '🍃', description: 'Enjoying a recent catch', xp_bonus: 1.5 } } },
    
    { id: 'mico_leao_dourado', name: 'Mico-leão-dourado', emoji: '🦁', rarity: 'rare', habitat: 'sky', quizPool: [
        { question: 'Onde vive o mico-leão-dourado?', correctAnswer: 'Mata Atlântica', wrongAnswers: ['Amazônia', 'Cerrado', 'Caatinga'] },
        { question: 'Qual é a cor característica do mico-leão-dourado?', correctAnswer: 'Dourado', wrongAnswers: ['Prateado', 'Marrom', 'Preto'] },
        { question: 'O mico-leão-dourado é...', correctAnswer: 'Endêmico do Brasil', wrongAnswers: ['Encontrado em toda América', 'Originário da África', 'Espécie invasora'] },
        { question: 'Qual é a dieta do mico-leão-dourado?', correctAnswer: 'Frutas e insetos', wrongAnswers: ['Apenas folhas', 'Apenas carne', 'Apenas sementes'] },
        { question: 'Como o mico-leão-dourado se comunica?', correctAnswer: 'Vocalizações', wrongAnswers: ['Gestos', 'Mudanças de cor', 'Telepatia'] },
        { question: 'Qual é o status de conservação do mico-leão-dourado?', correctAnswer: 'Em perigo', wrongAnswers: ['Extinto', 'Seguro', 'Vulnerável'] },
        { question: 'O mico-leão-dourado vive em...', correctAnswer: 'Grupos familiares', wrongAnswers: ['Isolamento', 'Grandes bandos', 'Casais'] },
        { question: 'Qual é a principal ameaça ao mico-leão-dourado?', correctAnswer: 'Fragmentação florestal', wrongAnswers: ['Caça', 'Poluição', 'Mudanças climáticas'] }
    ], encounterRules: { time: ['day'], weather: ['clear'] }, masteryPerk: { id: 'canopy-vision', name: 'Canopy Vision', description: 'Increases chance of finding tree-dwelling species.' }, relationships: { pollinates: ['beija_flor'], social: true }, behaviors: { foraging: { emoji: '🌰', description: 'Searching for food', xp_bonus: 1.2 }, grooming: { emoji: '🧽', description: 'Cleaning each other', xp_bonus: 1.0 }, playing: { emoji: '🎮', description: 'Juvenile play', xp_bonus: 2.0, time_restricted: false } } },
    
    { id: 'tucano_toco', name: 'Tucano-toco', emoji: '🦜', rarity: 'common', habitat: 'sky', quizPool: [
        { question: 'Qual é a característica mais marcante do tucano?', correctAnswer: 'Bico colorido', wrongAnswers: ['Asas grandes', 'Pernas longas', 'Olhos grandes'] },
        { question: 'O que o tucano come?', correctAnswer: 'Frutas e insetos', wrongAnswers: ['Apenas carne', 'Apenas sementes', 'Apenas néctar'] },
        { question: 'Como o tucano usa seu bico?', correctAnswer: 'Para regular temperatura', wrongAnswers: ['Apenas para comer', 'Para voar', 'Para nadar'] },
        { question: 'O tucano é um pássaro...', correctAnswer: 'Arborícola', wrongAnswers: ['Aquático', 'Terrestre', 'Subterrâneo'] },
        { question: 'Qual é o som característico do tucano?', correctAnswer: 'Croak grave', wrongAnswers: ['Canto melodioso', 'Silêncio', 'Assobio'] },
        { question: 'O tucano constrói ninhos em...', correctAnswer: 'Ocos de árvores', wrongAnswers: ['No chão', 'Em arbustos', 'Em rochas'] },
        { question: 'Quantos ovos o tucano geralmente põe?', correctAnswer: '2-4 ovos', wrongAnswers: ['1 ovo', '6-8 ovos', '10-12 ovos'] },
        { question: 'O tucano é importante para...', correctAnswer: 'Dispersão de sementes', wrongAnswers: ['Polinização', 'Controle de pragas', 'Limpeza do solo'] }
    ], encounterRules: { time: ['day'], weather: ['clear'] }, masteryPerk: { id: 'fruit-finder', name: 'Fruit Finder', description: 'Increases chance of finding fruit-eating species.' }, relationships: { seed_disperser: true, tree_dependent: true } },
    
    { id: 'capivara', name: 'Capivara', emoji: '🐹', rarity: 'common', habitat: 'ground', quizPool: [
        { question: 'Qual é o maior roedor do mundo?', correctAnswer: 'Capivara', wrongAnswers: ['Castor', 'Porco-espinho', 'Rato'] },
        { question: 'Onde a capivara gosta de viver?', correctAnswer: 'Próximo à água', wrongAnswers: ['No deserto', 'Nas montanhas', 'No oceano'] },
        { question: 'A capivara é um animal...', correctAnswer: 'Semi-aquático', wrongAnswers: ['Terrestre', 'Voador', 'Subterrâneo'] },
        { question: 'Como a capivara se refresca?', correctAnswer: 'Nadando', wrongAnswers: ['Suando', 'Respirando rápido', 'Tremendo'] },
        { question: 'Qual é a dieta da capivara?', correctAnswer: 'Plantas aquáticas', wrongAnswers: ['Carne', 'Insetos', 'Sementes'] },
        { question: 'A capivara vive em...', correctAnswer: 'Grupos familiares', wrongAnswers: ['Isolamento', 'Grandes bandos', 'Casais'] },
        { question: 'Qual é o predador natural da capivara?', correctAnswer: 'Onça-pintada', wrongAnswers: ['Águia', 'Cobra', 'Peixe'] },
        { question: 'A capivara é conhecida por ser...', correctAnswer: 'Muito social', wrongAnswers: ['Agressiva', 'Timida', 'Solitary'] }
    ], encounterRules: { time: ['day'], weather: ['clear', 'rainy'] }, masteryPerk: { id: 'water-sense', name: 'Water Sense', description: 'Increases chance of finding water-dependent species.' }, relationships: { prey_of: ['onca_pintada'], social: true, water_dependent: true }, behaviors: { grazing: { emoji: '🌱', description: 'Peacefully eating grass', xp_bonus: 1.0 }, bathing: { emoji: '🛁', description: 'Splashing in water', xp_bonus: 1.5, weather_restricted: 'rainy' }, resting: { emoji: '😴', description: 'Lounging in groups', xp_bonus: 1.2 } } },
    
    { id: 'sagui', name: 'Sagui', emoji: '🐒', rarity: 'uncommon', habitat: 'sky', quizPool: [
        { question: 'O sagui é um tipo de...', correctAnswer: 'Primata', wrongAnswers: ['Roedor', 'Ave', 'Réptil'] },
        { question: 'Qual é o tamanho do sagui?', correctAnswer: 'Muito pequeno', wrongAnswers: ['Grande', 'Médio', 'Enorme'] },
        { question: 'O sagui se alimenta principalmente de...', correctAnswer: 'Goma de árvores', wrongAnswers: ['Carne', 'Folhas', 'Sementes'] },
        { question: 'Como o sagui se move?', correctAnswer: 'Saltando entre galhos', wrongAnswers: ['Correndo no chão', 'Nadando', 'Voando'] },
        { question: 'O sagui vive em...', correctAnswer: 'Grupos pequenos', wrongAnswers: ['Isolamento', 'Grandes bandos', 'Casais'] },
        { question: 'Qual é a característica do sagui?', correctAnswer: 'Garras afiadas', wrongAnswers: ['Asas', 'Escamas', 'Chifres'] },
        { question: 'O sagui é encontrado em...', correctAnswer: 'Mata Atlântica', wrongAnswers: ['Deserto', 'Tundra', 'Oceano'] },
        { question: 'O sagui é importante para...', correctAnswer: 'Polinização', wrongAnswers: ['Controle de pragas', 'Dispersão de sementes', 'Limpeza do solo'] }
    ], encounterRules: { time: ['day'], weather: ['clear'] }, masteryPerk: { id: 'tree-climber', name: 'Tree Climber', description: 'Increases chance of finding arboreal species.' }, relationships: { pollinates: true, tree_dependent: true, social: true } },
    
    { id: 'beija_flor', name: 'Beija-flor', emoji: '🐦', rarity: 'uncommon', habitat: 'sky', quizPool: [
        { question: 'Como o beija-flor voa?', correctAnswer: 'Bate as asas muito rápido', wrongAnswers: ['Planando', 'Com vento', 'Com motor'] },
        { question: 'O que o beija-flor come?', correctAnswer: 'Néctar das flores', wrongAnswers: ['Sementes', 'Insetos', 'Carne'] },
        { question: 'O beija-flor pode voar...', correctAnswer: 'Para trás', wrongAnswers: ['Apenas para frente', 'Apenas para cima', 'Apenas para baixo'] },
        { question: 'Qual é a velocidade do batimento das asas do beija-flor?', correctAnswer: '80 vezes por segundo', wrongAnswers: ['20 vezes por segundo', '120 vezes por segundo', '40 vezes por segundo'] },
        { question: 'O beija-flor é importante para...', correctAnswer: 'Polinização', wrongAnswers: ['Controle de pragas', 'Dispersão de sementes', 'Limpeza do solo'] },
        { question: 'O beija-flor constrói ninhos com...', correctAnswer: 'Teias de aranha', wrongAnswers: ['Gravetos', 'Barro', 'Pedras'] },
        { question: 'Quantos ovos o beija-flor põe?', correctAnswer: '1-2 ovos', wrongAnswers: ['3-4 ovos', '5-6 ovos', '7-8 ovos'] },
        { question: 'O beija-flor é encontrado em...', correctAnswer: 'Américas', wrongAnswers: ['Europa', 'Ásia', 'África'] }
    ], encounterRules: { time: ['day'], weather: ['clear'] }, masteryPerk: { id: 'nectar-seeker', name: 'Nectar Seeker', description: 'Increases chance of finding flower-dependent species.' }, relationships: { pollinates: true, flower_dependent: true, territorial: true }, behaviors: { feeding: { emoji: '🌸', description: 'Hovering at flowers', xp_bonus: 1.8, time_restricted: true }, hovering: { emoji: '💫', description: 'Hovering in place', xp_bonus: 2.0 }, territorial: { emoji: '⚔️', description: 'Chasing intruders', xp_bonus: 2.5 } } }
];

// ===================== COMPONENTS =====================
const selectByRarity = (speciesPool, rareMultiplier = 1, chainBonus = null) => {
    if (speciesPool.length === 0) return null;

    // Apply discovery chain bonuses
    const adjustedPool = speciesPool.map(species => {
        let bonus = 1;
        if (chainBonus && chainBonus.speciesId === species.id) {
            bonus = chainBonus.multiplier;
        }
        return { ...species, selectionWeight: (RARITY_WEIGHTS[species.rarity] || 1) * (species.rarity === 'rare' ? rareMultiplier : 1) * bonus };
    });

    const totalWeight = adjustedPool.reduce((sum, s) => sum + s.selectionWeight, 0);
    let random = Math.random() * totalWeight;

    for (const species of adjustedPool) {
        if (random < species.selectionWeight) return species;
        random -= species.selectionWeight;
    }
    return adjustedPool[adjustedPool.length - 1];
};

const getDiscoveryChainBonus = (recentDiscoveries, allSpecies) => {
    if (recentDiscoveries.length === 0) return null;

    const latestDiscovery = recentDiscoveries[recentDiscoveries.length - 1];
    const discoveredSpecies = allSpecies.find(s => s.id === latestDiscovery);

    if (!discoveredSpecies || !discoveredSpecies.relationships) return null;

    // Predator-prey chain: after discovering prey, increase predator chance
    if (discoveredSpecies.relationships.prey_of) {
        const predators = discoveredSpecies.relationships.prey_of;
        const randomPredator = predators[Math.floor(Math.random() * predators.length)];
        return {
            speciesId: randomPredator,
            multiplier: 2.5,
            hint: `Fresh tracks suggest a predator is nearby...`
        };
    }

    // Pollination chain: after discovering pollinators, increase flower-dependent species
    if (discoveredSpecies.relationships.pollination_trigger) {
        const flowerSpecies = allSpecies.filter(s =>
            s.relationships && s.relationships.flower_dependent
        );
        if (flowerSpecies.length > 0) {
            const randomFlowerSpecies = flowerSpecies[Math.floor(Math.random() * flowerSpecies.length)];
            return {
                speciesId: randomFlowerSpecies.id,
                multiplier: 2.0,
                hint: `These flowers attract certain pollinators...`
            };
        }
    }

    // Social species chain: after discovering social species, increase similar species
    if (discoveredSpecies.relationships.social) {
        const socialSpecies = allSpecies.filter(s =>
            s.relationships && s.relationships.social && s.id !== discoveredSpecies.id
        );
        if (socialSpecies.length > 0) {
            const randomSocialSpecies = socialSpecies[Math.floor(Math.random() * socialSpecies.length)];
            return {
                speciesId: randomSocialSpecies.id,
                multiplier: 1.8,
                hint: `Other social creatures may be nearby...`
            };
        }
    }

    return null;
};

const selectBehavior = (species, gameTime, weather) => {
    if (!species.behaviors) return null;

    const availableBehaviors = Object.entries(species.behaviors).filter(([, behaviorData]) => {
        // Check time restrictions
        if (behaviorData.time_restricted && gameTime === 'night') return false;
        if (behaviorData.weather_restricted && behaviorData.weather_restricted !== weather) return false;
        return true;
    });

    if (availableBehaviors.length === 0) return null;

    // Weight behaviors based on XP bonus and context
    const weightedBehaviors = availableBehaviors.map(([behaviorKey, behaviorData]) => ({
        key: behaviorKey,
        data: behaviorData,
        weight: behaviorData.xp_bonus * 10 // Higher XP bonus = higher chance
    }));

    const totalWeight = weightedBehaviors.reduce((sum, b) => sum + b.weight, 0);
    let random = Math.random() * totalWeight;

    for (const behavior of weightedBehaviors) {
        if (random < behavior.weight) {
            return { key: behavior.key, ...behavior.data };
        }
        random -= behavior.weight;
    }

    return { key: availableBehaviors[0][0], ...availableBehaviors[0][1] };
};

const conservationTasks = {
    remove_litter: {
        id: 'remove_litter',
        name: 'Remove Litter',
        description: 'Clean up human waste from the habitat',
        icon: '🗑️',
        duration: 300, // 5 minutes
        effect: 'increases_encounter_rate',
        value: 0.1, // +10% encounter rate
        requirements: { weather: ['clear', 'rainy'] },
        reward: { tokens: 5, message: 'Habitat cleaned! +5 conservation tokens' }
    },
    fill_water: {
        id: 'fill_water',
        name: 'Refill Water Source',
        description: 'Restore a dried water source for wildlife',
        icon: '💧',
        duration: 600, // 10 minutes
        effect: 'water_species_bonus',
        value: 2.0, // 2x water-dependent species
        requirements: { weather: ['clear'], time: ['day'] },
        reward: { tokens: 8, message: 'Water source restored! +8 conservation tokens' }
    },
    plant_native: {
        id: 'plant_native',
        name: 'Plant Native Trees',
        description: 'Plant native fruit trees to support local wildlife',
        icon: '🌱',
        duration: 900, // 15 minutes
        effect: 'herbivore_bonus',
        value: 1.5, // 1.5x herbivore encounters
        requirements: { weather: ['clear'], time: ['day'] },
        reward: { tokens: 12, message: 'Trees planted! +12 conservation tokens' }
    },
    create_shelter: {
        id: 'create_shelter',
        name: 'Build Wildlife Shelter',
        description: 'Create shelter for small animals',
        icon: '🏠',
        duration: 450, // 7.5 minutes
        effect: 'small_species_bonus',
        value: 1.8, // 1.8x small species encounters
        requirements: { weather: ['clear', 'rainy'] },
        reward: { tokens: 7, message: 'Shelter built! +7 conservation tokens' }
    },
    mark_trail: {
        id: 'mark_trail',
        name: 'Mark Educational Trail',
        description: 'Create signs to educate visitors about wildlife',
        icon: '🚶',
        duration: 240, // 4 minutes
        effect: 'rare_species_bonus',
        value: 1.3, // 1.3x rare species encounters
        requirements: { time: ['day'] },
        reward: { tokens: 6, message: 'Educational trail marked! +6 conservation tokens' }
    }
};

const getAvailableConservationTasks = (gameTime, weather, activeTasks) => {
    return Object.values(conservationTasks).filter(task => {
        // Check if task is already active
        const isActive = activeTasks.some(t => t.id === task.id);
        if (isActive) return false;

        // Check requirements
        if (task.requirements.time && !task.requirements.time.includes(gameTime)) return false;
        if (task.requirements.weather && !task.requirements.weather.includes(weather)) return false;

        return true;
    });
};

const applyConservationEffect = (task, setPlayerState) => {
    setPlayerState(prevState => {
        const newBuffs = { ...prevState.conservationBuffs };

        switch (task.effect) {
            case 'increases_encounter_rate':
                newBuffs.encounterRate = (newBuffs.encounterRate || 1) + task.value;
                break;
            case 'water_species_bonus':
                newBuffs.waterSpecies = (newBuffs.waterSpecies || 1) * task.value;
                break;
            case 'herbivore_bonus':
                newBuffs.herbivoreSpecies = (newBuffs.herbivoreSpecies || 1) * task.value;
                break;
            case 'small_species_bonus':
                newBuffs.smallSpecies = (newBuffs.smallSpecies || 1) * task.value;
                break;
            case 'rare_species_bonus':
                newBuffs.rareSpecies = (newBuffs.rareSpecies || 1) * task.value;
                break;
        }

        return {
            ...prevState,
            conservationBuffs: newBuffs
        };
    });
};

const removeConservationEffect = (task, setPlayerState) => {
    setPlayerState(prevState => {
        const newBuffs = { ...prevState.conservationBuffs };

        switch (task.effect) {
            case 'increases_encounter_rate':
                newBuffs.encounterRate = Math.max(1, (newBuffs.encounterRate || 1) - task.value);
                break;
            case 'water_species_bonus':
                newBuffs.waterSpecies = (newBuffs.waterSpecies || 1) / task.value;
                break;
            case 'herbivore_bonus':
                newBuffs.herbivoreSpecies = (newBuffs.herbivoreSpecies || 1) / task.value;
                break;
            case 'small_species_bonus':
                newBuffs.smallSpecies = (newBuffs.smallSpecies || 1) / task.value;
                break;
            case 'rare_species_bonus':
                newBuffs.rareSpecies = (newBuffs.rareSpecies || 1) / task.value;
                break;
        }

        return {
            ...prevState,
            conservationBuffs: newBuffs
        };
    });
};

const smartHints = {
    noEncounters: {
        threshold: 3,
        hints: [
            { level: 1, text: "Try scanning at different times of day", urgent: false },
            { level: 2, text: "Different weather conditions attract different species", urgent: false },
            { level: 3, text: "Some species are very rare - try conservation tasks to improve your chances", urgent: true }
        ]
    },
    struggling: {
        threshold: 2,
        hints: [
            { level: 1, text: "Take your time to observe the species carefully", urgent: false },
            { level: 2, text: "Check the Eco-Dex for patterns and best conditions", urgent: false },
            { level: 3, text: "Each animal has unique traits - focus on what makes them special", urgent: true }
        ]
    },
    inactive: {
        threshold: 60, // seconds
        hints: [
            { level: 1, text: "New species are waiting to be discovered", urgent: false },
            { level: 2, text: "Try completing a conservation task to help the ecosystem", urgent: false },
            { level: 3, text: "Check your objectives for daily goals and rewards", urgent: true }
        ]
    },
    optimalTime: {
        hints: [
            { level: 1, text: "This is a great time for sky species - look up!", urgent: false },
            { level: 2, text: "Ground animals are most active now", urgent: false },
            { level: 3, text: "Nocturnal species become more active at night", urgent: false }
        ]
    }
};

const getSmartHint = (hintState, gameTime, weather, recentDiscoveries) => {
    const now = Date.now();
    const timeSinceActivity = (now - hintState.lastActivity) / 1000;

    // Check for inactivity
    if (timeSinceActivity > smartHints.inactive.threshold) {
        const hint = smartHints.inactive.hints[Math.min(hintState.hintLevel, smartHints.inactive.hints.length - 1)];
        return { ...hint, type: 'inactive' };
    }

    // Check for failed scans
    if (hintState.failedScans >= smartHints.noEncounters.threshold) {
        const hint = smartHints.noEncounters.hints[Math.min(hintState.hintLevel, smartHints.noEncounters.hints.length - 1)];
        return { ...hint, type: 'noEncounters' };
    }

    // Check for failed quizzes
    if (hintState.failedQuizzes >= smartHints.struggling.threshold) {
        const hint = smartHints.struggling.hints[Math.min(hintState.hintLevel, smartHints.struggling.hints.length - 1)];
        return { ...hint, type: 'struggling' };
    }

    // Provide time-specific hints
    if (recentDiscoveries.length === 0) {
        const timeHints = smartHints.optimalTime.hints;
        let hintIndex = 0;

        if (gameTime === 'night') hintIndex = 2;
        else if (gameTime === 'day') hintIndex = 1;

        const hint = timeHints[hintIndex];
        return { ...hint, type: 'optimalTime' };
    }

    return null;
};

const updateActivity = (setSmartHintState, action) => {
    setSmartHintState(prevState => {
        const now = Date.now();
        let newState = {
            ...prevState,
            lastActivity: now
        };

        switch (action) {
            case 'scan':
                newState.failedScans = 0;
                break;
            case 'success':
                newState.failedQuizzes = 0;
                newState.hintLevel = Math.max(0, prevState.hintLevel - 1);
                break;
            case 'failure':
                newState.failedQuizzes = prevState.failedQuizzes + 1;
                break;
            case 'noEncounter':
                newState.failedScans = prevState.failedScans + 1;
                break;
        }

        return newState;
    });
};

const EcoLogComponent = ({ ecoLog, onBack }) => {
    const { tNested } = useTranslation();
    return (
        <div className="screen-container">
            <h1>{tNested('screens.ecoLog.title')}</h1>
            <p style={{ textAlign: 'center', color: 'var(--light-text)', maxWidth: '600px', marginBottom: '2rem' }}>
                {tNested('screens.ecoLog.description')}
            </p>
            <div className="screen-grid">
                {speciesData.map(species => {
                    const entry = ecoLog[species.id];
                    const isDiscovered = !!entry;
                    const speciesName = tNested(`species.${species.id}.name`) || species.name;
                    return (
                        <div key={species.id} className={`card ${isDiscovered ? 'discovered' : 'undiscovered'}`} data-speciesid={species.id}>
                            <div className="emoji">{isDiscovered ? species.emoji : '❓'}</div>
                            <h3>{isDiscovered ? speciesName : tNested('gameUI.undiscovered')}</h3>
                            {isDiscovered ? (
                                <>
                                    <p>{tNested('gameUI.level')}: {entry.researchLevel} / {MAX_RESEARCH_LEVEL}</p>
                                    <p>{tNested('gameUI.rarity')}: {tNested(`rarity.${species.rarity}`)}</p>
                                    <p>{tNested('gameUI.time')}: {species.encounterRules.time.map(t => tNested(`gameUI.timeValues.${t}`)).join(', ')}</p>
                                    <p>{tNested('gameUI.weather')}: {species.encounterRules.weather.map(w => tNested(`gameUI.weatherValues.${w}`)).join(', ')}</p>
                                    <p style={{ fontStyle: 'italic' }}>{tNested(`species.${species.id}.funFact`)}</p>
                                    <ShareCardButton speciesId={species.id} label={tNested('share.card')} />
                                    <div className="xp-bar-container" title={`XP: ${entry.researchXp} / ${XP_PER_LEVEL}`}>
                                        <div className="xp-bar-fill" style={{ width: `${(entry.researchXp / XP_PER_LEVEL) * 100}%` }}></div>
                                    </div>
                                </>
                            ) : (
                                <p>{tNested('gameUI.keepExploring')}</p>
                            )}
                        </div>
                    );
                })}
            </div>
            <button className="secondary-button" onClick={onBack} style={{ marginTop: '2rem' }}>{tNested('gameUI.back')}</button>
        </div>
    );
};

function ShareCardButton({ speciesId, label }) {
    const handleShare = async () => {
        const card = document.querySelector(`.card[data-speciesid="${speciesId}"]`);
        if (!card) return;
        const { captureElementToPng, downloadDataUrl } = await import('./utils/cardShare.js');
        const dataUrl = await captureElementToPng(card);
        downloadDataUrl(`eco-${speciesId}.png`, dataUrl);
    };
    return (
        <button className="secondary-button" onClick={handleShare} style={{ marginTop: '0.5rem' }}>{label}</button>
    );
}
const PerksScreen = ({ unlockedPerks, onBack }) => {
    const { tNested } = useTranslation();
    return (
        <div className="screen-container">
            <h1>{tNested('screens.perks.title')}</h1>
            <p style={{ textAlign: 'center', color: 'var(--light-text)', maxWidth: '600px', marginBottom: '2rem' }}>
                {tNested('screens.perks.description')}
            </p>
            <div className="screen-grid">
                {speciesData.map(species => {
                    const perk = species.masteryPerk;
                    const isUnlocked = unlockedPerks.includes(perk.id);
                    const perkName = tNested(`perks.${perk.id}.name`) || perk.name;
                    const perkDescription = tNested(`perks.${perk.id}.description`) || perk.description;
                    const speciesName = tNested(`species.${species.id}.name`) || species.name;
                    return (
                        <div key={perk.id} className={`card ${isUnlocked ? 'unlocked' : 'locked'}`}>
                            <div className="emoji">{isUnlocked ? species.emoji : '🔒'}</div>
                            <h3>{perkName}</h3>
                            <p className="description">{perkDescription}</p>
                            {!isUnlocked && <p>{tNested('gameUI.masterToUnlock')} {speciesName} {tNested('gameUI.to unlock')}</p>}
                        </div>
                    );
                })}
            </div>
            <button className="secondary-button" onClick={onBack} style={{ marginTop: '2rem' }}>{tNested('gameUI.back')}</button>
        </div>
    );
};
const ResultModal = ({ message, onClose }) => {
    const { tNested } = useTranslation();
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>{message}</h2>
                <button className="explore-button" onClick={onClose} style={{marginTop: '1rem'}}>{tNested('gameUI.ok')}</button>
            </div>
        </div>
    );
};
const EncounterModal = ({ encounter, isRadiant, onLog, onRelease, behavior }) => {
    const { tNested } = useTranslation();
    const speciesName = tNested(`species.${encounter.id}.name`) || encounter.name;
    const radiantPrefix = isRadiant ? `${tNested('gameUI.radiant')} ` : '';

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="encounter-header">
                    <div className="emoji" style={{ filter: isRadiant ? 'drop-shadow(0 0 1rem #fde047)' : 'none' }}>
                        {encounter.emoji}
                    </div>
                    {behavior && (
                        <div className="behavior-indicator">
                            <span className="behavior-emoji">{behavior.emoji}</span>
                            <span className="behavior-text">{behavior.description}</span>
                            {behavior.xp_bonus > 1 && (
                                <span className="xp-bonus">+{Math.round((behavior.xp_bonus - 1) * 100)}% XP</span>
                            )}
                        </div>
                    )}
                </div>
                <h2>A {radiantPrefix}{speciesName} {tNested('gameUI.appeared')}</h2>
                <p>{tNested('gameUI.whatWillYouDo')}</p>
                <div className="button-group">
                    <button className="explore-button" onClick={onLog}>{tNested('gameUI.logIt')}</button>
                    <button className="danger-button" onClick={onRelease}>{tNested('gameUI.letItGo')}</button>
                </div>
            </div>
        </div>
    );
};
const QuizModal = ({ species, onResult, behavior }) => {
    const { tNested } = useTranslation();
    const quizItem = useMemo(() => {
        // Get translated quiz pool for this species
        const translatedQuizPool = tNested(`quizzes.${species.id}`) || species.quizPool;
        return translatedQuizPool[Math.floor(Math.random() * translatedQuizPool.length)];
    }, [species, tNested]);
    
    const shuffledAnswers = useMemo(() => {
        const answers = [quizItem.correctAnswer, ...quizItem.wrongAnswers];
        return answers.sort(() => Math.random() - 0.5);
    }, [quizItem]);
    
    const handleAnswerClick = (answer) => {
        const isCorrect = answer === quizItem.correctAnswer;
        onResult(isCorrect);
    };
    
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="quiz-header">
                <div className="emoji">{species.emoji}</div>
                    {behavior && (
                        <div className="behavior-indicator">
                            <span className="behavior-emoji">{behavior.emoji}</span>
                            <span className="behavior-text">{behavior.description}</span>
                            {behavior.xp_bonus > 1 && (
                                <span className="xp-bonus">+{Math.round((behavior.xp_bonus - 1) * 100)}% XP</span>
                            )}
                        </div>
                    )}
                </div>
                <h2>{quizItem.question}</h2>
                <div className="quiz-options">
                    {shuffledAnswers.map(answer => (
                        <button 
                            key={answer} 
                            className="quiz-option-btn" 
                            onClick={() => handleAnswerClick(answer)}
                        >
                            {answer}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
const ConservationTasks = ({ gameTime, weather, activeTasks, conservationTokens, onStartTask }) => {
    const availableTasks = getAvailableConservationTasks(gameTime, weather, activeTasks);

    // Only show if there are active tasks or at least 2 available tasks
    if (availableTasks.length === 0 && activeTasks.length === 0) return null;
    if (availableTasks.length < 2 && activeTasks.length === 0) return null;

    return (
        <div className="conservation-panel">
            <div className="conservation-header">
                <span className="conservation-icon">🌍</span>
                <span className="conservation-title">Conservation Tasks</span>
                <span className="conservation-tokens">🪙 {conservationTokens}</span>
            </div>

            {/* Active Tasks */}
            {activeTasks.length > 0 && (
                <div className="active-tasks">
                    <h4>Active Tasks:</h4>
                    {activeTasks.map(task => {
                        const remainingTime = Math.max(0, Math.ceil((task.endTime - Date.now()) / 1000));
                        const progress = ((task.duration - remainingTime) / task.duration) * 100;

                        return (
                            <div key={task.id} className="task-item active">
                                <div className="task-info">
                                    <span className="task-icon">{task.icon}</span>
                                    <div className="task-details">
                                        <span className="task-name">{task.name}</span>
                                        <span className="task-timer">{Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, '0')}</span>
                                    </div>
                                </div>
                                <div className="task-progress">
                                    <div
                                        className="task-progress-fill"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Available Tasks */}
            {availableTasks.length > 0 && (
                <div className="available-tasks">
                    <h4>Available Tasks:</h4>
                    {availableTasks.map(task => (
                        <div key={task.id} className="task-item available">
                            <div className="task-info">
                                <span className="task-icon">{task.icon}</span>
                                <div className="task-details">
                                    <span className="task-name">{task.name}</span>
                                    <span className="task-description">{task.description}</span>
                                    <span className="task-reward">+{task.reward.tokens} tokens</span>
                                </div>
                            </div>
                            <button
                                className="task-start-btn"
                                onClick={() => onStartTask(task)}
                            >
                                Start ({Math.floor(task.duration / 60)}m)
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const AchievementCelebration = ({ achievement, onClose }) => {
    if (!achievement) return null;

    return (
        <div className="achievement-celebration-overlay" onClick={onClose}>
            <div className="achievement-celebration-modal" onClick={(e) => e.stopPropagation()}>
                <div className="celebration-header">
                    <div className="achievement-icon-large">{achievement.icon}</div>
                    <h2 className="achievement-title">{achievement.title}</h2>
                    <p className="achievement-subtitle">{achievement.subtitle}</p>
                </div>

                <div className="celebration-content">
                    <p className="achievement-description">{achievement.description}</p>
                </div>

                <div className="celebration-particles">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <div
                            key={i}
                            className="celebration-particle"
                            style={{
                                left: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 2}s`,
                                animationDuration: `${2 + Math.random() * 3}s`
                            }}
                        />
                    ))}
                </div>

                <button className="celebration-close-btn" onClick={onClose}>
                    🎉 Awesome!
                </button>
            </div>
        </div>
    );
};

const ARStarfield = ({ numStars, isVisible }) => { const stars = useMemo(() => Array.from({ length: numStars }).map((_, i) => { const size = Math.random() * 2 + 1; const style = { width: `${size}px`, height: `${size}px`, top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 5}s`, }; return <div key={i} className="star" style={style}></div>; }), [numStars]); return <div className="ar-starfield" style={{ opacity: isVisible ? 1 : 0 }}>{stars}</div>; };
const Constellation = ({ constellation }) => { if (!constellation) return null; return ( <div className="constellation" style={{ top: `${constellation.y}px`, left: `${constellation.x}px` }}> <div className="constellation-emoji">{constellation.species.emoji}</div> </div> ); };
const HotspotVisualizer = ({ hotspot }) => { if (!hotspot) return null; const style = { top: `${hotspot.y - HOTSPOT_RADIUS}px`, left: `${hotspot.x - HOTSPOT_RADIUS}px`, width: `${HOTSPOT_RADIUS * 2}px`, height: `${HOTSPOT_RADIUS * 2}px`, }; return <div className="hotspot-visualizer" style={style}></div>; };
const WeatherOverlay = ({ weather }) => { if (weather !== 'rainy') return null; return <div className="visual-overlay rain-effect visible"></div>; };
const LightingOverlay = ({ time }) => { return <div className={`visual-overlay ${time === 'day' ? 'god-rays' : 'moon-glow'} visible`}></div>; };

// ===================== MAIN APP =====================
export default function App() {
    const { t, tNested } = useTranslation();
    const [currentScreen, setCurrentScreen] = useState('explore');
    const [playerState, setPlayerState] = useState({
        gameTime: 'day',
        weather: 'clear',
        unlockedPerks: [],
        pityRare: 0,
        pityRadiant: 0,
        streakDays: 1,
        lastLoginDate: null,
        conservationBuffs: {
            encounterRate: 1,
            waterSpecies: 1,
            herbivoreSpecies: 1,
            smallSpecies: 1,
            rareSpecies: 1
        }
    });
    const [ecoLog, setEcoLog] = useState({});
    const [modalState, setModalState] = useState({ encounter: false, quiz: false, result: false });
    const [activeEncounter, setActiveEncounter] = useState(null);
    const [isRadiantEncounter, setIsRadiantEncounter] = useState(false);
    const [lastEncounterMessage, setLastEncounterMessage] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [isFocusing, setIsFocusing] = useState(false);
    const [hotspot, setHotspot] = useState(null);
    const [constellation, setConstellation] = useState(null);
    const [resultMessage, setResultMessage] = useState("");
    const [scanStage, setScanStage] = useState('');
    const [scanProgress, setScanProgress] = useState(0);
    const [recentDiscoveries, setRecentDiscoveries] = useState([]);
    const [discoveryChain, setDiscoveryChain] = useState(null);
    const [currentBehavior, setCurrentBehavior] = useState(null);
    const [activeConservationTasks, setActiveConservationTasks] = useState([]);
    const [conservationTokens, setConservationTokens] = useState(0);
    const [smartHintState, setSmartHintState] = useState({
        failedScans: 0,
        failedQuizzes: 0,
        lastActivity: Date.now(),
        hintLevel: 0,
        currentHint: null
    });
    const [achievementState, setAchievementState] = useState({
        unlockedAchievements: [],
        showCelebration: false,
        currentAchievement: null
    });
    const scannerWindowRef = useRef(null);

    useEffect(() => {
        // Daily streak initialization
        try {
            const today = new Date().toDateString();
            const saved = localStorage.getItem('ee-last-login');
            if (!saved) {
                localStorage.setItem('ee-last-login', today);
                setPlayerState(p => ({ ...p, streakDays: 1, lastLoginDate: today }));
            } else if (saved !== today) {
                const prev = new Date(saved);
                const diffDays = Math.round((new Date(today) - prev) / (1000*60*60*24));
                const nextStreak = diffDays === 1 ? (playerState.streakDays || 0) + 1 : 1;
                localStorage.setItem('ee-last-login', today);
                setPlayerState(p => ({ ...p, streakDays: nextStreak, lastLoginDate: today }));
            }
        } catch {
            // ignore storage errors
        }

        const gameLoop = setInterval(() => {
            setPlayerState(p => ({ ...p, gameTime: p.gameTime === 'day' ? 'night' : 'day', weather: Math.random() > 0.7 ? 'rainy' : 'clear' }));
        }, 30000);
        return () => clearInterval(gameLoop);
    }, [playerState.streakDays]);

    // Smart hints system - check for hints every 10 seconds
    useEffect(() => {
        const hintInterval = setInterval(() => {
            const smartHint = getSmartHint(smartHintState, playerState.gameTime, playerState.weather, recentDiscoveries);

            if (smartHint) {
                setSmartHintState(prevState => ({
                    ...prevState,
                    currentHint: smartHint,
                    hintLevel: Math.min(prevState.hintLevel + (smartHint.urgent ? 1 : 0), 2)
                }));
            } else {
                setSmartHintState(prevState => ({
                    ...prevState,
                    currentHint: null
                }));
            }
        }, 10000); // Check every 10 seconds

        return () => clearInterval(hintInterval);
    }, [smartHintState, playerState.gameTime, playerState.weather, recentDiscoveries]);

    const grantXp = useCallback((speciesId, amount) => {
        setEcoLog(prevLog => {
            const species = speciesData.find(s => s.id === speciesId);
            if (!species) return prevLog;
            const currentEntry = prevLog[speciesId] || { researchLevel: 0, researchXp: 0 };
            if (currentEntry.researchLevel >= MAX_RESEARCH_LEVEL) return prevLog;
            let newLevel = currentEntry.researchLevel === 0 ? 1 : currentEntry.researchLevel;
            let newXp = currentEntry.researchXp + amount;
            while (newXp >= XP_PER_LEVEL && newLevel < MAX_RESEARCH_LEVEL) { newXp -= XP_PER_LEVEL; newLevel++; }
            if (newLevel >= MAX_RESEARCH_LEVEL) {
                newXp = XP_PER_LEVEL;
                const perkId = species.masteryPerk.id;
                if (!playerState.unlockedPerks.includes(perkId)) {
                    setTimeout(() => {
                        const perkName = tNested(`perks.${species.masteryPerk.id}.name`) || species.masteryPerk.name;
                        setResultMessage(`${tNested('gameUI.mastery')} ${tNested('gameUI.youLearned')} '${perkName}'.`);
                        setModalState(s => ({ ...s, result: true }));
                        setPlayerState(p => ({...p, unlockedPerks: [...p.unlockedPerks, perkId]}));
                    }, 500);
                }
            }
            return { ...prevLog, [speciesId]: { researchLevel: newLevel, researchXp: newXp } };
        });
    }, [playerState.unlockedPerks, tNested]);

    const closeAllModals = () => {
    setModalState({ encounter: false, quiz: false, result: false });
    setActiveEncounter(null);
    setIsRadiantEncounter(false);
    setConstellation(null);
    setCurrentBehavior(null);
};

    const achievements = useMemo(() => ({
        firstRare: {
            id: 'firstRare',
            title: 'Rare Discovery!',
            subtitle: 'Your first rare species discovery',
            description: 'You\'ve discovered your first rare species! These elusive creatures are special finds.',
            icon: '⭐',
            effect: 'confetti',
            sound: 'achievement',
            trigger: (ecoLog) => {
                const rareDiscoveries = Object.values(ecoLog).filter(entry =>
                    speciesData.find(s => s.id === Object.keys(ecoLog).find(k => ecoLog[k] === entry))?.rarity === 'rare'
                );
                return rareDiscoveries.length === 1 && rareDiscoveries[0].researchLevel >= 1;
            }
        },
        fiveSpecies: {
            id: 'fiveSpecies',
            title: 'Growing Collection',
            subtitle: 'Discovered 5 different species',
            description: 'Your field journal is growing! You\'ve documented 5 unique species.',
            icon: '📖',
            effect: 'book_burst',
            sound: 'achievement',
            trigger: (ecoLog) => Object.keys(ecoLog).length >= 5
        },
        perfectStreak: {
            id: 'perfectStreak',
            title: 'Dedicated Researcher',
            subtitle: '7-day exploration streak achieved',
            description: 'Amazing dedication! You\'ve explored for 7 days straight.',
            icon: '🔥',
            effect: 'golden_burst',
            sound: 'achievement',
            trigger: (ecoLog, playerState) => (playerState.streakDays || 0) >= 7
        },
        conservationHero: {
            id: 'conservationHero',
            title: 'Habitat Hero',
            subtitle: 'Completed 10 conservation tasks',
            description: 'You\'re making a real difference! 10 conservation tasks completed.',
            icon: '🌍',
            effect: 'nature_flourish',
            sound: 'achievement',
            trigger: (ecoLog, playerState, conservationTokens) => conservationTokens >= 100
        },
        masterObserver: {
            id: 'masterObserver',
            title: 'Master Observer',
            subtitle: 'Mastered your first species',
            description: 'True expertise! You\'ve mastered the complete study of a species.',
            icon: '🎓',
            effect: 'wisdom_burst',
            sound: 'achievement',
            trigger: (ecoLog) => Object.values(ecoLog).some(entry => entry.researchLevel >= 2)
        },
        chainReaction: {
            id: 'chainReaction',
            title: 'Discovery Chain',
            subtitle: 'Triggered a discovery chain reaction',
            description: 'Your discoveries are interconnected! You found a related species.',
            icon: '🔗',
            effect: 'chain_burst',
            sound: 'achievement',
            trigger: (ecoLog, playerState, conservationTokens, discoveryChain) => discoveryChain !== null
        },
        nightExplorer: {
            id: 'nightExplorer',
            title: 'Night Explorer',
            subtitle: 'Discovered your first nocturnal species',
            description: 'The night holds mysteries! You\'ve discovered a nocturnal species.',
            icon: '🌙',
            effect: 'moon_burst',
            sound: 'achievement',
            trigger: (ecoLog) => {
                // Check if any discovered species is primarily active at night
                return Object.keys(ecoLog).some(speciesId => {
                    const species = speciesData.find(s => s.id === speciesId);
                    return species && species.encounterRules.time.includes('night');
                });
            }
        }
    }), []);



const startConservationTask = (task) => {
    const taskWithTimer = {
        ...task,
        startTime: Date.now(),
        endTime: Date.now() + (task.duration * 1000)
    };

    setActiveConservationTasks(prev => [...prev, taskWithTimer]);
    applyConservationEffect(task, setPlayerState);

    // Set up timer to complete the task
    setTimeout(() => {
        completeConservationTask(task);
    }, task.duration * 1000);
};

const completeConservationTask = (task) => {
    // Remove from active tasks
    setActiveConservationTasks(prev => prev.filter(t => t.id !== task.id));

    // Remove conservation effect
    removeConservationEffect(task, setPlayerState);

    // Award tokens and show message
    setConservationTokens(prev => prev + task.reward.tokens);
    setResultMessage(task.reward.message);
    setModalState({ encounter: false, quiz: false, result: true });
};

    const discoveryStages = useMemo(() => [
        { stage: 'detecting', message: 'Bio-signature detected...', duration: 800, progress: 25 },
        { stage: 'analyzing', message: 'Analyzing patterns...', duration: 1000, progress: 50 },
        { stage: 'processing', message: 'Processing environmental data...', duration: 800, progress: 75 },
        { stage: 'identifying', message: 'Species identification in progress...', duration: 400, progress: 90 }
    ], []);

    const handleAnalyzeBiome = useCallback(() => {
        if (isScanning || isFocusing || !scannerWindowRef.current) return;
        sfx.play('scan');
        setIsScanning(true);

        // Track scanning activity for smart hints
        updateActivity(setSmartHintState, 'scan');
        setLastEncounterMessage(null);
        setConstellation(null);
        setScanStage('initializing');
        setScanProgress(0);

        let currentDelay = 0;
        discoveryStages.forEach((stage) => {
            setTimeout(() => {
                setScanStage(stage.stage);
                setScanProgress(stage.progress);
                setLastEncounterMessage(stage.message);
                sfx.play('scan_pulse');
            }, currentDelay);
            currentDelay += stage.duration;
        });

        setTimeout(() => {
            setIsScanning(false);
            setScanStage('');
            setScanProgress(0);
            const { unlockedPerks, gameTime, weather } = playerState;
            const hasBiolightAttractor = unlockedPerks.includes('biolight-attractor');
            let encounterChance = BASE_ENCOUNTER_CHANCE;
            if ((playerState.streakDays || 0) >= 3) {
                encounterChance += 0.05; // +5% bonus for streak
            }
            if (gameTime === 'night' && hasBiolightAttractor) encounterChance += 0.1;
            if (Math.random() > encounterChance) {
                setHotspot(null);
                setIsFocusing(false);
                setLastEncounterMessage(tNested('gameUI.noBioSignatures'));
                updateActivity(setSmartHintState, 'noEncounter');
                return;
            }
            const hasNightVision = unlockedPerks.includes('night-vision');
            const hasRainResistance = unlockedPerks.includes('rain-resistance');
            const speciesPool = speciesData.filter(s => {
                const timeMatch = s.encounterRules.time.includes(gameTime);
                const weatherMatch = s.encounterRules.weather.includes(weather);
                const nightVisionBonus = hasNightVision && gameTime === 'night' && s.encounterRules.time.includes('day');
                const rainResistBonus = hasRainResistance && weather === 'rainy' && s.encounterRules.weather.includes('clear');
                return timeMatch || weatherMatch || nightVisionBonus || rainResistBonus;
            });
            if (speciesPool.length === 0) {
                setHotspot(null);
                setIsFocusing(false);
                setLastEncounterMessage(tNested('gameUI.noBioSignatures'));
                return;
            }
            const rareMultiplier = 1 + Math.min(playerState.pityRare * RARE_PITY_STEP, RARE_PITY_MAX);
            const chainBonus = getDiscoveryChainBonus(recentDiscoveries, speciesData);
            const encounteredSpecies = selectByRarity(speciesPool, rareMultiplier, chainBonus);

            // Select behavioral state for this encounter
            const behavior = selectBehavior(encounteredSpecies, playerState.gameTime, playerState.weather);
            setCurrentBehavior(behavior);

            // Update discovery chain state
            if (chainBonus) {
                setDiscoveryChain(chainBonus);
            }
            if (!encounteredSpecies) {
                setHotspot(null);
                setIsFocusing(false);
                setLastEncounterMessage(tNested('gameUI.noBioSignatures'));
                return;
            }
            const rect = scannerWindowRef.current?.getBoundingClientRect();
            if (rect) {
                const habitat = encounteredSpecies.habitat;
                let y;
                if (habitat === 'sky') {
                    y = Math.random() * (rect.height * 0.6);
                } else {
                    y = (rect.height * 0.6) + (Math.random() * (rect.height * 0.4));
                }
                setHotspot({
                    x: Math.random() * (rect.width - (HOTSPOT_RADIUS * 2)) + HOTSPOT_RADIUS,
                    y: y,
                    species: encounteredSpecies,
                });
                setIsFocusing(true);
                setLastEncounterMessage(tNested('gameUI.speciesLocated'));
            } else {
                setIsFocusing(false);
                setLastEncounterMessage(tNested('gameUI.noBioSignatures'));
            }
        }, SCAN_DURATION);
    }, [isScanning, isFocusing, playerState, tNested, discoveryStages, recentDiscoveries]);

    useEffect(() => {
        if (!isFocusing) return;
        const handleMouseMove = (e) => {
            if (!hotspot || !scannerWindowRef.current) return;
            const rect = scannerWindowRef.current.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const distance = Math.sqrt(Math.pow(mouseX - hotspot.x, 2) + Math.pow(mouseY - hotspot.y, 2));
            if (distance < HOTSPOT_RADIUS) {
                sfx.play('focus');
                setConstellation({ x: hotspot.x, y: hotspot.y, species: hotspot.species });
                setActiveEncounter(hotspot.species);
                const hasKeenEye = playerState.unlockedPerks.includes('keen-eye');
                const pityBonus = Math.min(playerState.pityRadiant * RADIANT_PITY_STEP, RADIANT_PITY_MAX);
                const radiantChance = (hasKeenEye ? BASE_RADIANT_CHANCE * 1.5 : BASE_RADIANT_CHANCE) + pityBonus;
                setIsRadiantEncounter(Math.random() < radiantChance);
                setIsFocusing(false);
                setHotspot(null);
                setTimeout(() => {
                    setModalState(s => ({...s, quiz: true}));
                }, 1200);
            }
        };
        const focusTimeout = setTimeout(() => {
            if (isFocusing) {
                setIsFocusing(false);
                setHotspot(null);
                setLastEncounterMessage(tNested('gameUI.noBioSignatures'));
            }
        }, FOCUS_TIMEOUT);
        const currentScannerWindow = scannerWindowRef.current;
        currentScannerWindow?.addEventListener('mousemove', handleMouseMove);
        return () => {
            currentScannerWindow?.removeEventListener('mousemove', handleMouseMove);
            clearTimeout(focusTimeout);
        };
    }, [isFocusing, hotspot, playerState.unlockedPerks, playerState.pityRadiant, tNested]);

    const handleGameResult = (wasSuccessful) => {
        setResultMessage("");
        if (wasSuccessful) {
            // Track successful quiz for smart hints
            updateActivity(setSmartHintState, 'success');
            let xpGain = isRadiantEncounter ? XP_PER_ENCOUNTER * 5 : XP_PER_ENCOUNTER;

            // Apply behavioral XP bonus
            if (currentBehavior) {
                xpGain *= currentBehavior.xp_bonus;
            }

            grantXp(activeEncounter.id, xpGain);
            sfx.play('success');

            // Check for achievements after successful discovery
            const newAchievements = [];

            Object.values(achievements).forEach(achievement => {
                if (!achievementState.unlockedAchievements.includes(achievement.id)) {
                    if (achievement.trigger(ecoLog, playerState, conservationTokens, discoveryChain)) {
                        newAchievements.push(achievement);
                    }
                }
            });

            if (newAchievements.length > 0) {
                const achievement = newAchievements[0];
                setAchievementState(prevState => ({
                    ...prevState,
                    unlockedAchievements: [...prevState.unlockedAchievements, achievement.id],
                    showCelebration: true,
                    currentAchievement: achievement
                }));

                // Auto-hide celebration after 5 seconds
                setTimeout(() => {
                    setAchievementState(prevState => ({
                        ...prevState,
                        showCelebration: false,
                        currentAchievement: null
                    }));
                }, 5000);
            }

            // Update recent discoveries for chain system
            setRecentDiscoveries(prev => {
                const newDiscoveries = [activeEncounter.id, ...prev.slice(0, 4)]; // Keep last 5 discoveries
                return newDiscoveries;
            });

            // Check if this completes a discovery chain
            if (discoveryChain && discoveryChain.speciesId === activeEncounter.id) {
                setTimeout(() => {
                    setResultMessage(`🔗 Discovery Chain! You found the ${tNested(`species.${activeEncounter.id}.name`) || activeEncounter.name}!`);
                    setModalState(s => ({ ...s, result: true }));
                }, 500);
                setDiscoveryChain(null);
            }

            // Reset pity on success; increment rare pity if common/uncommon
            setPlayerState(p => ({
                ...p,
                pityRare: activeEncounter.rarity === 'rare' ? 0 : p.pityRare + 1,
                pityRadiant: isRadiantEncounter ? 0 : p.pityRadiant + 1,
            }));
            if (!resultMessage.includes("Mastery!") && !resultMessage.includes("Discovery Chain")) {
                const speciesName = tNested(`species.${activeEncounter.id}.name`) || activeEncounter.name;
                setResultMessage(`${tNested('gameUI.success')} ${speciesName} ${tNested('gameUI.hasBeenLogged')}`);
                setModalState({ encounter: false, quiz: false, result: true });
            }
        } else {
            // Track failed quiz for smart hints
            updateActivity(setSmartHintState, 'failure');

            // On failure, increase pity for both rare and radiant slightly
            setPlayerState(p => ({
                ...p,
                pityRare: p.pityRare + 1,
                pityRadiant: p.pityRadiant + 1,
            }));
            const speciesName = tNested(`species.${activeEncounter.id}.name`) || activeEncounter.name;
            setResultMessage(`${tNested('gameUI.ohNo')} ${speciesName} ${tNested('gameUI.fled')}`);
            setModalState({ encounter: false, quiz: false, result: true });
        }
    };

    return (
        <>
            <div className="app-container">
                <div className="header">
                    <div className="header-left">
                        <div className="logo-section">
                            <div className="logo-icon">🌿</div>
                            <div className="logo-text">
                                <h1>{t('appTitle')}</h1>
                                <h2>{t('subtitle')}</h2>
                            </div>
                        </div>
                    </div>
                    <div className="header-right">
                        <div className="status-indicators">
                            <div className="status-item">
                                <span className="status-icon">🌍</span>
                            <span className="status-text">{tNested('status.location')}</span>
                            </div>
                            <div className="status-item">
                                <span className="status-icon">🔬</span>
                            <span className="status-text">{tNested('status.researchActive')}</span>
                            </div>
                            <div className="status-item">
                                <span className="status-icon">🔥</span>
                                <span className="status-text">{tNested('status.streak')}: {(playerState.streakDays||1)} {tNested('status.days')}</span>
                            </div>
                        </div>
                        <LanguageSwitcher />
                    </div>
                </div>
                <div className={`bio-scanner-window ${isFocusing ? 'focus-active' : ''}`} ref={scannerWindowRef}>
                    <div className={`image-layer ${playerState.gameTime === 'day' ? 'animated-background' : ''}`} style={{ backgroundImage: `url(${IMAGE_ASSETS.day})`, opacity: playerState.gameTime === 'day' ? 1 : 0 }}></div>
                    <div className={`image-layer ${playerState.gameTime === 'night' ? 'animated-background' : ''}`} style={{ backgroundImage: `url(${IMAGE_ASSETS.night})`, opacity: playerState.gameTime === 'night' ? 1 : 0 }}></div>
                    <WeatherOverlay weather={playerState.weather} />
                    <LightingOverlay time={playerState.gameTime} />
                    <div className="bio-scanner-overlay"></div>
                    <ARStarfield numStars={150} isVisible={isFocusing || !!constellation} />
                    <Constellation constellation={constellation} />
                    <HotspotVisualizer hotspot={hotspot} />
                    {isScanning && (
                        <div className="exploration-animation visible">
                            <div className="radar">
                                <div className="radar-grid"></div>
                                <div className="radar-sweep"></div>
                                {scanStage && (
                                    <div className={`scan-stage-indicator ${scanStage}`}>
                                        <div className="stage-pulse"></div>
                                        <div className="stage-icon">
                                            {scanStage === 'detecting' && '🔍'}
                                            {scanStage === 'analyzing' && '⚡'}
                                            {scanStage === 'processing' && '🧠'}
                                            {scanStage === 'identifying' && '🎯'}
                            </div>
                                    </div>
                                )}
                            </div>
                            <div className="scan-progress-bar">
                                <div
                                    className="scan-progress-fill"
                                    style={{ width: `${scanProgress}%` }}
                                ></div>
                            </div>
                            <p className="exploration-text">
                                {scanStage ? lastEncounterMessage : t('discoveringText')}
                            </p>
                        </div>
                    )}
                    <div className="game-status">
                        <p>{tNested('gameUI.time')}: {tNested(`gameUI.timeValues.${playerState.gameTime}`)}</p>
                        <p>{tNested('gameUI.weather')}: {tNested(`gameUI.weatherValues.${playerState.weather}`)}</p>
                    </div>
                </div>
                <div className="control-panel">
                    {currentScreen === 'explore' ? (
                        <>
                            <HintChip
                              gameTime={playerState.gameTime}
                              weather={playerState.weather}
                              pityRare={playerState.pityRare}
                              pityRadiant={playerState.pityRadiant}
                              lastEncounterMessage={lastEncounterMessage}
                              discoveryChain={discoveryChain}
                              smartHint={smartHintState.currentHint}
                            />
                            <ConservationTasks
                                gameTime={playerState.gameTime}
                                weather={playerState.weather}
                                activeTasks={activeConservationTasks}
                                conservationTokens={conservationTokens}
                                onStartTask={startConservationTask}
                            />
                            <div className="button-group">
                                <button className="explore-button" onClick={handleAnalyzeBiome} disabled={isScanning || isFocusing}>
                                    {isScanning ? tNested('gameUI.scanningBiome') : isFocusing ? tNested('gameUI.focusing') : t('exploreButton')}
                                </button>
                            </div>
                            <ObjectiveRibbon ecoLog={ecoLog} playerState={playerState} />
                            <div className="button-group">
                                <button className="secondary-button" onClick={() => setCurrentScreen('ecoLog')}>{tNested('gameUI.viewEcoLog')}</button>
                                <button className="secondary-button" onClick={() => setCurrentScreen('perks')}>{tNested('gameUI.viewPerks')}</button>
                            </div>
                            {lastEncounterMessage && <p style={{ color: 'var(--light-text)', marginTop: '1rem' }}>{lastEncounterMessage}</p>}
                        </>
                    ) : ( <div/> )}
                </div>
                {currentScreen === 'ecoLog' && <EcoLogComponent ecoLog={ecoLog} onBack={() => setCurrentScreen('explore')} />}
                {currentScreen === 'perks' && <PerksScreen unlockedPerks={playerState.unlockedPerks} onBack={() => setCurrentScreen('explore')} />}
                {activeEncounter && modalState.quiz && (
                  Math.random() < 0.5
                    ? <PhotoMiniGame species={activeEncounter} onResult={handleGameResult} />
                    : <QuizModal species={activeEncounter} onResult={handleGameResult} behavior={currentBehavior} />
                )}
                {modalState.result && (
                  <>
                    <ConfettiBurst trigger={/Success|Mastery/.test(resultMessage)} />
                    <ResultModal message={resultMessage} onClose={closeAllModals} />
                  </>
                )}
                {achievementState.showCelebration && (
                  <AchievementCelebration
                    achievement={achievementState.currentAchievement}
                    onClose={() => setAchievementState(prev => ({ ...prev, showCelebration: false }))}
                  />
                )}
            </div>
        </>
    );
}
