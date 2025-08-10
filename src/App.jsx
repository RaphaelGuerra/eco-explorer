import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import './App.css';
import { useTranslation } from './hooks/useTranslation';
import LanguageSwitcher from './components/LanguageSwitcher';

// ===================== DATA STRUCTURES & GAME CONSTANTS =====================
const MAX_RESEARCH_LEVEL = 2;
const XP_PER_LEVEL = 100;
const XP_PER_ENCOUNTER = 25;
const SCAN_DURATION = 3000;
const FOCUS_TIMEOUT = 7000;
const BASE_ENCOUNTER_CHANCE = 0.80;
const BASE_RADIANT_CHANCE = 0.05;
const RARITY_WEIGHTS = { common: 10, uncommon: 5, rare: 1 };
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
    ], encounterRules: { time: ['day', 'night'], weather: ['clear'] }, masteryPerk: { id: 'predator-instinct', name: 'Predator Instinct', description: 'Increases encounter rate with rare species.' } },
    
    { id: 'mico_leao_dourado', name: 'Mico-leão-dourado', emoji: '🦁', rarity: 'rare', habitat: 'sky', quizPool: [
        { question: 'Onde vive o mico-leão-dourado?', correctAnswer: 'Mata Atlântica', wrongAnswers: ['Amazônia', 'Cerrado', 'Caatinga'] },
        { question: 'Qual é a cor característica do mico-leão-dourado?', correctAnswer: 'Dourado', wrongAnswers: ['Prateado', 'Marrom', 'Preto'] },
        { question: 'O mico-leão-dourado é...', correctAnswer: 'Endêmico do Brasil', wrongAnswers: ['Encontrado em toda América', 'Originário da África', 'Espécie invasora'] },
        { question: 'Qual é a dieta do mico-leão-dourado?', correctAnswer: 'Frutas e insetos', wrongAnswers: ['Apenas folhas', 'Apenas carne', 'Apenas sementes'] },
        { question: 'Como o mico-leão-dourado se comunica?', correctAnswer: 'Vocalizações', wrongAnswers: ['Gestos', 'Mudanças de cor', 'Telepatia'] },
        { question: 'Qual é o status de conservação do mico-leão-dourado?', correctAnswer: 'Em perigo', wrongAnswers: ['Extinto', 'Seguro', 'Vulnerável'] },
        { question: 'O mico-leão-dourado vive em...', correctAnswer: 'Grupos familiares', wrongAnswers: ['Isolamento', 'Grandes bandos', 'Casais'] },
        { question: 'Qual é a principal ameaça ao mico-leão-dourado?', correctAnswer: 'Fragmentação florestal', wrongAnswers: ['Caça', 'Poluição', 'Mudanças climáticas'] }
    ], encounterRules: { time: ['day'], weather: ['clear'] }, masteryPerk: { id: 'canopy-vision', name: 'Canopy Vision', description: 'Increases chance of finding tree-dwelling species.' } },
    
    { id: 'tucano_toco', name: 'Tucano-toco', emoji: '🦜', rarity: 'common', habitat: 'sky', quizPool: [
        { question: 'Qual é a característica mais marcante do tucano?', correctAnswer: 'Bico colorido', wrongAnswers: ['Asas grandes', 'Pernas longas', 'Olhos grandes'] },
        { question: 'O que o tucano come?', correctAnswer: 'Frutas e insetos', wrongAnswers: ['Apenas carne', 'Apenas sementes', 'Apenas néctar'] },
        { question: 'Como o tucano usa seu bico?', correctAnswer: 'Para regular temperatura', wrongAnswers: ['Apenas para comer', 'Para voar', 'Para nadar'] },
        { question: 'O tucano é um pássaro...', correctAnswer: 'Arborícola', wrongAnswers: ['Aquático', 'Terrestre', 'Subterrâneo'] },
        { question: 'Qual é o som característico do tucano?', correctAnswer: 'Croak grave', wrongAnswers: ['Canto melodioso', 'Silêncio', 'Assobio'] },
        { question: 'O tucano constrói ninhos em...', correctAnswer: 'Ocos de árvores', wrongAnswers: ['No chão', 'Em arbustos', 'Em rochas'] },
        { question: 'Quantos ovos o tucano geralmente põe?', correctAnswer: '2-4 ovos', wrongAnswers: ['1 ovo', '6-8 ovos', '10-12 ovos'] },
        { question: 'O tucano é importante para...', correctAnswer: 'Dispersão de sementes', wrongAnswers: ['Polinização', 'Controle de pragas', 'Limpeza do solo'] }
    ], encounterRules: { time: ['day'], weather: ['clear'] }, masteryPerk: { id: 'fruit-finder', name: 'Fruit Finder', description: 'Increases chance of finding fruit-eating species.' } },
    
    { id: 'capivara', name: 'Capivara', emoji: '🐹', rarity: 'common', habitat: 'ground', quizPool: [
        { question: 'Qual é o maior roedor do mundo?', correctAnswer: 'Capivara', wrongAnswers: ['Castor', 'Porco-espinho', 'Rato'] },
        { question: 'Onde a capivara gosta de viver?', correctAnswer: 'Próximo à água', wrongAnswers: ['No deserto', 'Nas montanhas', 'No oceano'] },
        { question: 'A capivara é um animal...', correctAnswer: 'Semi-aquático', wrongAnswers: ['Terrestre', 'Voador', 'Subterrâneo'] },
        { question: 'Como a capivara se refresca?', correctAnswer: 'Nadando', wrongAnswers: ['Suando', 'Respirando rápido', 'Tremendo'] },
        { question: 'Qual é a dieta da capivara?', correctAnswer: 'Plantas aquáticas', wrongAnswers: ['Carne', 'Insetos', 'Sementes'] },
        { question: 'A capivara vive em...', correctAnswer: 'Grupos familiares', wrongAnswers: ['Isolamento', 'Grandes bandos', 'Casais'] },
        { question: 'Qual é o predador natural da capivara?', correctAnswer: 'Onça-pintada', wrongAnswers: ['Águia', 'Cobra', 'Peixe'] },
        { question: 'A capivara é conhecida por ser...', correctAnswer: 'Muito social', wrongAnswers: ['Agressiva', 'Timida', 'Solitary'] }
    ], encounterRules: { time: ['day'], weather: ['clear', 'rainy'] }, masteryPerk: { id: 'water-sense', name: 'Water Sense', description: 'Increases chance of finding water-dependent species.' } },
    
    { id: 'sagui', name: 'Sagui', emoji: '🐒', rarity: 'uncommon', habitat: 'sky', quizPool: [
        { question: 'O sagui é um tipo de...', correctAnswer: 'Primata', wrongAnswers: ['Roedor', 'Ave', 'Réptil'] },
        { question: 'Qual é o tamanho do sagui?', correctAnswer: 'Muito pequeno', wrongAnswers: ['Grande', 'Médio', 'Enorme'] },
        { question: 'O sagui se alimenta principalmente de...', correctAnswer: 'Goma de árvores', wrongAnswers: ['Carne', 'Folhas', 'Sementes'] },
        { question: 'Como o sagui se move?', correctAnswer: 'Saltando entre galhos', wrongAnswers: ['Correndo no chão', 'Nadando', 'Voando'] },
        { question: 'O sagui vive em...', correctAnswer: 'Grupos pequenos', wrongAnswers: ['Isolamento', 'Grandes bandos', 'Casais'] },
        { question: 'Qual é a característica do sagui?', correctAnswer: 'Garras afiadas', wrongAnswers: ['Asas', 'Escamas', 'Chifres'] },
        { question: 'O sagui é encontrado em...', correctAnswer: 'Mata Atlântica', wrongAnswers: ['Deserto', 'Tundra', 'Oceano'] },
        { question: 'O sagui é importante para...', correctAnswer: 'Polinização', wrongAnswers: ['Controle de pragas', 'Dispersão de sementes', 'Limpeza do solo'] }
    ], encounterRules: { time: ['day'], weather: ['clear'] }, masteryPerk: { id: 'tree-climber', name: 'Tree Climber', description: 'Increases chance of finding arboreal species.' } },
    
    { id: 'beija_flor', name: 'Beija-flor', emoji: '🐦', rarity: 'uncommon', habitat: 'sky', quizPool: [
        { question: 'Como o beija-flor voa?', correctAnswer: 'Bate as asas muito rápido', wrongAnswers: ['Planando', 'Com vento', 'Com motor'] },
        { question: 'O que o beija-flor come?', correctAnswer: 'Néctar das flores', wrongAnswers: ['Sementes', 'Insetos', 'Carne'] },
        { question: 'O beija-flor pode voar...', correctAnswer: 'Para trás', wrongAnswers: ['Apenas para frente', 'Apenas para cima', 'Apenas para baixo'] },
        { question: 'Qual é a velocidade do batimento das asas do beija-flor?', correctAnswer: '80 vezes por segundo', wrongAnswers: ['20 vezes por segundo', '120 vezes por segundo', '40 vezes por segundo'] },
        { question: 'O beija-flor é importante para...', correctAnswer: 'Polinização', wrongAnswers: ['Controle de pragas', 'Dispersão de sementes', 'Limpeza do solo'] },
        { question: 'O beija-flor constrói ninhos com...', correctAnswer: 'Teias de aranha', wrongAnswers: ['Gravetos', 'Barro', 'Pedras'] },
        { question: 'Quantos ovos o beija-flor põe?', correctAnswer: '1-2 ovos', wrongAnswers: ['3-4 ovos', '5-6 ovos', '7-8 ovos'] },
        { question: 'O beija-flor é encontrado em...', correctAnswer: 'Américas', wrongAnswers: ['Europa', 'Ásia', 'África'] }
    ], encounterRules: { time: ['day'], weather: ['clear'] }, masteryPerk: { id: 'nectar-seeker', name: 'Nectar Seeker', description: 'Increases chance of finding flower-dependent species.' } }
];

// ===================== COMPONENTS =====================
const selectByRarity = (speciesPool) => {
    if (speciesPool.length === 0) return null;
    const totalWeight = speciesPool.reduce((sum, s) => sum + (RARITY_WEIGHTS[s.rarity] || 1), 0);
    let random = Math.random() * totalWeight;
    for (const s of speciesPool) {
        const weight = RARITY_WEIGHTS[s.rarity] || 1;
        if (random < weight) return s;
        random -= weight;
    }
    return speciesPool[speciesPool.length - 1];
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
                        <div key={species.id} className={`card ${isDiscovered ? 'discovered' : 'undiscovered'}`}>
                            <div className="emoji">{isDiscovered ? species.emoji : '❓'}</div>
                            <h3>{isDiscovered ? speciesName : tNested('gameUI.undiscovered')}</h3>
                            {isDiscovered ? (
                                <>
                                    <p>{tNested('gameUI.level')}: {entry.researchLevel} / {MAX_RESEARCH_LEVEL}</p>
                                    <p>{tNested('gameUI.rarity')}: {tNested(`rarity.${species.rarity}`)}</p>
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
const EncounterModal = ({ encounter, isRadiant, onLog, onRelease }) => {
    const { tNested } = useTranslation();
    const speciesName = tNested(`species.${encounter.id}.name`) || encounter.name;
    const radiantPrefix = isRadiant ? `${tNested('gameUI.radiant')} ` : '';
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="emoji" style={{ filter: isRadiant ? 'drop-shadow(0 0 1rem #fde047)' : 'none' }}>{encounter.emoji}</div>
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
const QuizModal = ({ species, onResult }) => {
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
                <div className="emoji">{species.emoji}</div>
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
const ARStarfield = ({ numStars, isVisible }) => { const stars = useMemo(() => Array.from({ length: numStars }).map((_, i) => { const size = Math.random() * 2 + 1; const style = { width: `${size}px`, height: `${size}px`, top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 5}s`, }; return <div key={i} className="star" style={style}></div>; }), [numStars]); return <div className="ar-starfield" style={{ opacity: isVisible ? 1 : 0 }}>{stars}</div>; };
const Constellation = ({ constellation }) => { if (!constellation) return null; return ( <div className="constellation" style={{ top: `${constellation.y}px`, left: `${constellation.x}px` }}> <div className="constellation-emoji">{constellation.species.emoji}</div> </div> ); };
const HotspotVisualizer = ({ hotspot }) => { if (!hotspot) return null; const style = { top: `${hotspot.y - HOTSPOT_RADIUS}px`, left: `${hotspot.x - HOTSPOT_RADIUS}px`, width: `${HOTSPOT_RADIUS * 2}px`, height: `${HOTSPOT_RADIUS * 2}px`, }; return <div className="hotspot-visualizer" style={style}></div>; };
const WeatherOverlay = ({ weather }) => { if (weather !== 'rainy') return null; return <div className="visual-overlay rain-effect visible"></div>; };
const LightingOverlay = ({ time }) => { return <div className={`visual-overlay ${time === 'day' ? 'god-rays' : 'moon-glow'} visible`}></div>; };

// ===================== MAIN APP =====================
export default function App() {
    const { t, tNested } = useTranslation();
    const [currentScreen, setCurrentScreen] = useState('explore');
    const [playerState, setPlayerState] = useState({ gameTime: 'day', weather: 'clear', unlockedPerks: [] });
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
    const scannerWindowRef = useRef(null);

    useEffect(() => {
        const gameLoop = setInterval(() => {
            setPlayerState(p => ({ ...p, gameTime: p.gameTime === 'day' ? 'night' : 'day', weather: Math.random() > 0.7 ? 'rainy' : 'clear' }));
        }, 30000);
        return () => clearInterval(gameLoop);
    }, []);

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
    };

    const handleAnalyzeBiome = useCallback(() => {
        if (isScanning || isFocusing || !scannerWindowRef.current) return;
        setIsScanning(true);
        setLastEncounterMessage(null);
        setConstellation(null);
        setTimeout(() => {
            setIsScanning(false);
            const { unlockedPerks, gameTime, weather } = playerState;
            const hasBiolightAttractor = unlockedPerks.includes('biolight-attractor');
            let encounterChance = BASE_ENCOUNTER_CHANCE;
            if (gameTime === 'night' && hasBiolightAttractor) encounterChance += 0.1;
            if (Math.random() > encounterChance) {
                setHotspot(null);
                setIsFocusing(true);
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
            if (speciesPool.length === 0) { setHotspot(null); setIsFocusing(true); return; }
            const encounteredSpecies = selectByRarity(speciesPool);
            if (!encounteredSpecies) { setHotspot(null); setIsFocusing(true); return; }
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
            }
            setIsFocusing(true);
        }, SCAN_DURATION);
    }, [isScanning, isFocusing, playerState]);

    useEffect(() => {
        if (!isFocusing) return;
        const handleMouseMove = (e) => {
            if (!hotspot || !scannerWindowRef.current) return;
            const rect = scannerWindowRef.current.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const distance = Math.sqrt(Math.pow(mouseX - hotspot.x, 2) + Math.pow(mouseY - hotspot.y, 2));
            if (distance < HOTSPOT_RADIUS) {
                setConstellation({ x: hotspot.x, y: hotspot.y, species: hotspot.species });
                setActiveEncounter(hotspot.species);
                const hasKeenEye = playerState.unlockedPerks.includes('keen-eye');
                const radiantChance = hasKeenEye ? BASE_RADIANT_CHANCE * 1.5 : BASE_RADIANT_CHANCE;
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
    }, [isFocusing, hotspot, playerState.unlockedPerks, tNested]);

    const handleGameResult = (wasSuccessful) => {
        setResultMessage("");
        if (wasSuccessful) {
            const xpGain = isRadiantEncounter ? XP_PER_ENCOUNTER * 5 : XP_PER_ENCOUNTER;
            grantXp(activeEncounter.id, xpGain);
            if (!resultMessage.includes("Mastery!")) {
                const speciesName = tNested(`species.${activeEncounter.id}.name`) || activeEncounter.name;
                setResultMessage(`${tNested('gameUI.success')} ${speciesName} ${tNested('gameUI.hasBeenLogged')}`);
                setModalState({ encounter: false, quiz: false, result: true });
            }
        } else {
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
                            </div>
                            <p className="exploration-text">{t('discoveringText')}</p>
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
                            <div className="button-group">
                                <button className="explore-button" onClick={handleAnalyzeBiome} disabled={isScanning || isFocusing}>
                                    {isScanning ? tNested('gameUI.scanningBiome') : isFocusing ? tNested('gameUI.focusing') : t('exploreButton')}
                                </button>
                            </div>
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
                {activeEncounter && modalState.quiz && ( <QuizModal species={activeEncounter} onResult={handleGameResult} /> )}
                {modalState.result && ( <ResultModal message={resultMessage} onClose={closeAllModals} /> )}
            </div>
        </>
    );
}
