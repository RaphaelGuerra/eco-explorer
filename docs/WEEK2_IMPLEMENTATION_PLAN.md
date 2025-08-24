# Week 2 Implementation Plan - Enhanced Conservation & Berry System

## 🎯 Week 2 Mission Statement
Transform the passive conservation system into an engaging mini-game hub where players earn tokens through skill-based challenges and spend them on Discovery Berries that enhance their exploration experience.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────┐
│         Main Game Loop                  │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────┐    ┌──────────────┐  │
│  │  Exploration │───▶│   Discovery  │  │
│  │   (Scanning) │    │   (Species)  │  │
│  └──────────────┘    └──────────────┘  │
│         ▲                    │         │
│         │                    ▼         │
│  ┌──────────────┐    ┌──────────────┐  │
│  │ Berry Store  │◀───│    Tokens    │  │
│  │  (Enhance)   │    │   (Reward)   │  │
│  └──────────────┘    └──────────────┘  │
│         ▲                    ▲         │
│         │                    │         │
│  ┌──────────────────────────────────┐  │
│  │     Conservation Mini-Games       │  │
│  │  (Earn Tokens Through Skill)     │  │
│  └──────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

## 📅 Day-by-Day Implementation Schedule

### Day 1 (Monday) - Mini-Game Framework

#### Morning (4 hours)
**Task**: Create core mini-game engine and state management

```javascript
// src/components/minigames/MiniGameEngine.jsx
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './MiniGameEngine.css'

export default function MiniGameEngine({
  gameType,
  onComplete,
  onCancel,
  difficulty = 1
}) {
  const [gameState, setGameState] = useState('ready') // ready, playing, complete
  const [score, setScore] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(30)
  const [gameData, setGameData] = useState(null)
  
  // Game-specific components
  const games = {
    cleanup_rush: CleanupRush,
    flow_control: FlowControl,
    seed_scatter: SeedScatter,
    quick_build: QuickBuild,
    path_finder: PathFinder
  }
  
  const GameComponent = games[gameType]
  
  const startGame = () => {
    setGameState('playing')
    setScore(0)
    setTimeRemaining(getTimeLimit(gameType, difficulty))
  }
  
  const endGame = useCallback(() => {
    setGameState('complete')
    const tokens = calculateTokens(score, gameType, difficulty)
    onComplete({ score, tokens, gameType })
  }, [score, gameType, difficulty, onComplete])
  
  useEffect(() => {
    if (gameState === 'playing' && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timeRemaining === 0) {
      endGame()
    }
  }, [timeRemaining, gameState, endGame])
  
  return (
    <motion.div 
      className="minigame-container"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <div className="minigame-header">
        <div className="minigame-timer">
          <span className="timer-icon">⏱️</span>
          <span className="timer-value">{timeRemaining}s</span>
        </div>
        <div className="minigame-score">
          <span className="score-label">Score:</span>
          <motion.span 
            className="score-value"
            key={score}
            initial={{ scale: 1.5 }}
            animate={{ scale: 1 }}
          >
            {score}
          </motion.span>
        </div>
        <button className="minigame-cancel" onClick={onCancel}>✕</button>
      </div>
      
      <div className="minigame-play-area">
        {gameState === 'ready' && (
          <div className="minigame-ready">
            <h3>{getGameTitle(gameType)}</h3>
            <p>{getGameInstructions(gameType)}</p>
            <button className="start-button" onClick={startGame}>
              Start Game
            </button>
          </div>
        )}
        
        {gameState === 'playing' && GameComponent && (
          <GameComponent
            score={score}
            setScore={setScore}
            difficulty={difficulty}
            gameData={gameData}
            setGameData={setGameData}
          />
        )}
        
        {gameState === 'complete' && (
          <div className="minigame-complete">
            <h3>Complete!</h3>
            <div className="final-score">Score: {score}</div>
            <div className="tokens-earned">
              +{calculateTokens(score, gameType, difficulty)} 🪙
            </div>
            <button className="done-button" onClick={() => onComplete()}>
              Collect Rewards
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Helper functions
function getTimeLimit(gameType, difficulty) {
  const baseTimes = {
    cleanup_rush: 30,
    flow_control: 45,
    seed_scatter: 30,
    quick_build: 35,
    path_finder: 25
  }
  return baseTimes[gameType] - (difficulty - 1) * 5
}

function calculateTokens(score, gameType, difficulty) {
  const baseTokens = Math.floor(score / 10)
  const difficultyBonus = difficulty * 2
  const perfectBonus = score > 100 ? 5 : 0
  return Math.min(baseTokens + difficultyBonus + perfectBonus, 20)
}

function getGameTitle(gameType) {
  const titles = {
    cleanup_rush: '🗑️ Cleanup Rush',
    flow_control: '💧 Flow Control',
    seed_scatter: '🌱 Seed Scatter',
    quick_build: '🏗️ Quick Build',
    path_finder: '🗺️ Path Finder'
  }
  return titles[gameType]
}

function getGameInstructions(gameType) {
  const instructions = {
    cleanup_rush: 'Click on litter to clean it up! Be quick!',
    flow_control: 'Connect pipes to bring water to habitats',
    seed_scatter: 'Throw seeds into the highlighted zones',
    quick_build: 'Drag materials to build a shelter',
    path_finder: 'Draw the shortest safe path'
  }
  return instructions[gameType]
}
```

#### Afternoon (4 hours)
**Task**: Implement Cleanup Rush mini-game

```javascript
// src/components/minigames/CleanupRush.jsx
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './CleanupRush.css'

export default function CleanupRush({ score, setScore, difficulty }) {
  const [litter, setLitter] = useState([])
  const [combo, setCombo] = useState(0)
  const [lastCleanup, setLastCleanup] = useState(Date.now())
  
  // Spawn litter items
  useEffect(() => {
    const spawnRate = 1000 - (difficulty * 200) // Faster spawning at higher difficulty
    const interval = setInterval(() => {
      const newLitter = {
        id: `litter-${Date.now()}-${Math.random()}`,
        x: Math.random() * 80 + 10, // 10-90% of container width
        y: Math.random() * 80 + 10, // 10-90% of container height
        type: ['bottle', 'can', 'bag', 'paper'][Math.floor(Math.random() * 4)],
        points: Math.floor(Math.random() * 3) + 1,
        lifetime: 3000 - (difficulty * 500) // Shorter lifetime at higher difficulty
      }
      
      setLitter(prev => [...prev, newLitter])
      
      // Remove old litter
      setTimeout(() => {
        setLitter(prev => prev.filter(l => l.id !== newLitter.id))
      }, newLitter.lifetime)
    }, spawnRate)
    
    return () => clearInterval(interval)
  }, [difficulty])
  
  const handleCleanup = useCallback((litterId, points) => {
    const now = Date.now()
    const timeSinceLastCleanup = now - lastCleanup
    
    // Combo system
    let newCombo = combo
    if (timeSinceLastCleanup < 1000) {
      newCombo = Math.min(combo + 1, 10)
    } else {
      newCombo = 0
    }
    
    const totalPoints = points * (1 + newCombo * 0.1)
    setScore(prev => prev + Math.floor(totalPoints))
    setCombo(newCombo)
    setLastCleanup(now)
    
    // Remove the litter
    setLitter(prev => prev.filter(l => l.id !== litterId))
    
    // Visual feedback
    createParticleEffect(event.clientX, event.clientY)
  }, [combo, lastCleanup, setScore])
  
  const getLitterEmoji = (type) => {
    const emojis = {
      bottle: '🍾',
      can: '🥫',
      bag: '🛍️',
      paper: '📄'
    }
    return emojis[type]
  }
  
  return (
    <div className="cleanup-rush-container">
      {combo > 0 && (
        <div className="combo-indicator">
          Combo x{combo}!
        </div>
      )}
      
      <AnimatePresence>
        {litter.map(item => (
          <motion.div
            key={item.id}
            className="litter-item"
            initial={{ scale: 0, rotate: 0 }}
            animate={{ 
              scale: 1, 
              rotate: Math.random() * 360,
              x: `${item.x}%`,
              y: `${item.y}%`
            }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.8 }}
            onClick={() => handleCleanup(item.id, item.points)}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              cursor: 'pointer'
            }}
          >
            <span className="litter-emoji">{getLitterEmoji(item.type)}</span>
            <span className="litter-points">+{item.points}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

function createParticleEffect(x, y) {
  // Create particle effect at click position
  const particle = document.createElement('div')
  particle.className = 'cleanup-particle'
  particle.style.left = `${x}px`
  particle.style.top = `${y}px`
  particle.textContent = '✨'
  document.body.appendChild(particle)
  
  setTimeout(() => {
    particle.remove()
  }, 1000)
}
```

### Day 2 (Tuesday) - More Mini-Games

#### Morning (4 hours)
**Tasks**: Implement Flow Control and Seed Scatter mini-games

```javascript
// src/components/minigames/FlowControl.jsx
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import './FlowControl.css'

export default function FlowControl({ score, setScore, difficulty }) {
  const [grid, setGrid] = useState([])
  const [waterFlow, setWaterFlow] = useState([])
  const [moves, setMoves] = useState(0)
  const [targetHabitats, setTargetHabitats] = useState([])
  
  useEffect(() => {
    // Initialize puzzle grid
    const size = 6 + difficulty
    const newGrid = Array(size).fill(null).map(() => 
      Array(size).fill(null).map(() => ({
        type: 'empty',
        rotation: 0,
        connected: false
      }))
    )
    
    // Place source, habitats, and pipes
    // ... puzzle generation logic
    
    setGrid(newGrid)
  }, [difficulty])
  
  const rotatePipe = (row, col) => {
    const newGrid = [...grid]
    newGrid[row][col].rotation = (newGrid[row][col].rotation + 90) % 360
    setGrid(newGrid)
    setMoves(moves + 1)
    checkConnections()
  }
  
  const checkConnections = () => {
    // Path finding algorithm to check water flow
    // Award points for each connected habitat
  }
  
  return (
    <div className="flow-control-container">
      <div className="moves-counter">Moves: {moves}</div>
      <div className="pipe-grid">
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="pipe-row">
            {row.map((cell, colIndex) => (
              <motion.div
                key={`${rowIndex}-${colIndex}`}
                className={`pipe-cell ${cell.type} ${cell.connected ? 'connected' : ''}`}
                onClick={() => rotatePipe(rowIndex, colIndex)}
                animate={{ rotate: cell.rotation }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {getPipeSymbol(cell.type, cell.rotation)}
              </motion.div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
```

#### Afternoon (4 hours)
**Tasks**: Implement Quick Build and Path Finder mini-games

### Day 3 (Wednesday) - Berry System

#### Morning (4 hours)
**Task**: Create Berry Store and Inventory System

```javascript
// src/components/BerryStore.jsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './BerryStore.css'

const BERRY_TYPES = {
  attraction: {
    id: 'attraction',
    name: 'Attraction Berry',
    icon: '🫐',
    color: '#3B82F6',
    cost: 10,
    description: 'Guarantees finding a creature on next scan',
    effect: 'guaranteed_encounter'
  },
  rarity: {
    id: 'rarity',
    name: 'Rarity Berry',
    icon: '🍇',
    color: '#8B5CF6',
    cost: 25,
    description: 'Next encounter guaranteed to be Rare or better',
    effect: 'rare_guarantee'
  },
  radiant: {
    id: 'radiant',
    name: 'Radiant Berry',
    icon: '✨',
    color: '#F59E0B',
    cost: 50,
    description: '50% chance for Radiant encounter',
    effect: 'radiant_boost'
  },
  type: {
    id: 'type',
    name: 'Type Berry',
    icon: '🍓',
    color: '#EF4444',
    cost: 15,
    description: 'Choose the type of creature to find',
    effect: 'type_selection'
  },
  discovery: {
    id: 'discovery',
    name: 'Discovery Berry',
    icon: '🌟',
    color: '#10B981',
    cost: 30,
    description: 'Guarantees a new species not in your Eco-Log',
    effect: 'new_species'
  }
}

export default function BerryStore({ 
  tokens, 
  inventory, 
  onPurchase, 
  onUse,
  isStoreOpen,
  onClose 
}) {
  const [selectedBerry, setSelectedBerry] = useState(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const maxInventory = 3
  
  const handlePurchase = (berryType) => {
    if (tokens >= BERRY_TYPES[berryType].cost && inventory.length < maxInventory) {
      setSelectedBerry(berryType)
      setShowConfirmation(true)
    }
  }
  
  const confirmPurchase = () => {
    onPurchase(selectedBerry)
    setShowConfirmation(false)
    setSelectedBerry(null)
  }
  
  return (
    <AnimatePresence>
      {isStoreOpen && (
        <motion.div 
          className="berry-store-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div 
            className="berry-store-container"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="berry-store-header">
              <h2>🫐 Berry Shop</h2>
              <div className="token-display">
                <span className="token-icon">🪙</span>
                <span className="token-amount">{tokens}</span>
              </div>
              <button className="close-button" onClick={onClose}>✕</button>
            </div>
            
            <div className="berry-inventory">
              <h3>Your Berries ({inventory.length}/{maxInventory})</h3>
              <div className="inventory-slots">
                {[...Array(maxInventory)].map((_, index) => (
                  <div key={index} className="inventory-slot">
                    {inventory[index] ? (
                      <motion.div 
                        className="berry-item"
                        whileHover={{ scale: 1.1 }}
                        onClick={() => onUse(inventory[index])}
                      >
                        {BERRY_TYPES[inventory[index].type].icon}
                      </motion.div>
                    ) : (
                      <div className="empty-slot">Empty</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="berry-catalog">
              {Object.values(BERRY_TYPES).map(berry => (
                <motion.div
                  key={berry.id}
                  className="berry-card"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ borderColor: berry.color }}
                >
                  <div className="berry-icon" style={{ backgroundColor: berry.color }}>
                    {berry.icon}
                  </div>
                  <div className="berry-info">
                    <h4>{berry.name}</h4>
                    <p>{berry.description}</p>
                  </div>
                  <button
                    className="berry-price"
                    onClick={() => handlePurchase(berry.id)}
                    disabled={tokens < berry.cost || inventory.length >= maxInventory}
                  >
                    {berry.cost} 🪙
                  </button>
                </motion.div>
              ))}
            </div>
            
            {showConfirmation && (
              <div className="confirmation-modal">
                <p>Purchase {BERRY_TYPES[selectedBerry].name} for {BERRY_TYPES[selectedBerry].cost} tokens?</p>
                <button onClick={confirmPurchase}>Confirm</button>
                <button onClick={() => setShowConfirmation(false)}>Cancel</button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

#### Afternoon (4 hours)
**Task**: Integrate Berry effects with discovery system

```javascript
// src/hooks/useBerryEffects.js
import { useState, useCallback } from 'react'

export function useBerryEffects() {
  const [activeBerry, setActiveBerry] = useState(null)
  const [berryInventory, setBerryInventory] = useState([])
  
  const activateBerry = useCallback((berry) => {
    setActiveBerry(berry)
    setBerryInventory(prev => prev.filter(b => b.id !== berry.id))
  }, [])
  
  const applyBerryEffect = useCallback((encounterData) => {
    if (!activeBerry) return encounterData
    
    let modifiedEncounter = { ...encounterData }
    
    switch (activeBerry.effect) {
      case 'guaranteed_encounter':
        if (!encounterData.species) {
          // Force an encounter
          modifiedEncounter = forceRandomEncounter()
        }
        break
        
      case 'rare_guarantee':
        if (modifiedEncounter.species && modifiedEncounter.species.rarity === 'common') {
          modifiedEncounter.species = upgradeToRare(modifiedEncounter.species)
        }
        break
        
      case 'radiant_boost':
        if (Math.random() < 0.5) {
          modifiedEncounter.isRadiant = true
        }
        break
        
      case 'type_selection':
        // Filter to selected type
        if (modifiedEncounter.species) {
          modifiedEncounter.species = findSpeciesOfType(activeBerry.selectedType)
        }
        break
        
      case 'new_species':
        // Guarantee undiscovered species
        modifiedEncounter.species = findUndiscoveredSpecies()
        break
    }
    
    // Clear the active berry after use
    setActiveBerry(null)
    
    return modifiedEncounter
  }, [activeBerry])
  
  const purchaseBerry = useCallback((berryType, tokens) => {
    if (berryInventory.length >= 3) {
      return { success: false, message: 'Inventory full!' }
    }
    
    const berryCost = getBerryC ost(berryType)
    if (tokens < berryCost) {
      return { success: false, message: 'Not enough tokens!' }
    }
    
    const newBerry = {
      id: `berry-${Date.now()}`,
      type: berryType,
      effect: getBerryEffect(berryType)
    }
    
    setBerryInventory(prev => [...prev, newBerry])
    return { success: true, tokensSpent: berryCost }
  }, [berryInventory])
  
  return {
    activeBerry,
    berryInventory,
    activateBerry,
    applyBerryEffect,
    purchaseBerry
  }
}
```

### Day 4 (Thursday) - Integration & Polish

#### Morning (4 hours)
**Tasks**: 
- Integrate mini-games with conservation hub
- Connect token economy
- Add animations and feedback

#### Afternoon (4 hours)
**Tasks**:
- Mobile responsiveness testing
- Performance optimization
- Bug fixes

### Day 5 (Friday) - Testing & Refinement

#### Morning (4 hours)
**Tasks**:
- Complete integration testing
- Balance token economy
- Fix objective counting

#### Afternoon (4 hours)
**Tasks**:
- Polish animations
- Add tutorials
- Final testing

## 📊 Token Economy Design

### Earning Tokens

| Source | Tokens | Frequency |
|--------|--------|-----------|
| Mini-game (perfect) | 15-20 | Per game |
| Mini-game (good) | 8-12 | Per game |
| Mini-game (okay) | 3-7 | Per game |
| Daily login | 5 | Once/day |
| Objective complete | 10-20 | Per objective |
| Rare discovery | 5 | Per discovery |
| Radiant discovery | 10 | Per discovery |
| Streak bonus (7 days) | 25 | Weekly |

### Spending Tokens

| Item | Cost | Value Proposition |
|------|------|------------------|
| Attraction Berry | 10 | Removes scan frustration |
| Type Berry | 15 | Complete objectives faster |
| Rarity Berry | 25 | Exciting guaranteed rare |
| Discovery Berry | 30 | Completionist helper |
| Radiant Berry | 50 | Premium experience |

### Daily Token Flow
- **Casual Player**: 30-40 tokens/day (3-4 mini-games)
- **Regular Player**: 60-80 tokens/day (6-8 mini-games + objectives)
- **Dedicated Player**: 100+ tokens/day (all activities)

This allows:
- Casual: 1-2 basic berries daily
- Regular: 1 premium berry every 2 days
- Dedicated: Multiple berries daily

## 🎮 Mini-Game Difficulty Scaling

### Difficulty Levels
1. **Easy** (Default)
   - Longer time limits
   - Fewer obstacles
   - Lower score requirements
   - 1x token multiplier

2. **Medium** (Unlocked at 10 games played)
   - Standard time limits
   - Moderate challenge
   - 1.5x token multiplier

3. **Hard** (Unlocked at 25 games played)
   - Shorter time limits
   - More obstacles
   - 2x token multiplier

### Progression System
- Track high scores per game
- Unlock new visual themes
- Achievement badges for milestones
- Weekly challenges with bonus rewards

## 📱 Mobile Optimization

### Touch Controls
- Large touch targets (minimum 44x44px)
- Swipe gestures for Path Finder
- Drag and drop for Quick Build
- Tap for Cleanup Rush
- Touch and hold for Flow Control rotation

### Performance
- Limit particles on mobile
- Reduce animation complexity
- Lazy load mini-game assets
- Use CSS transforms over JavaScript animations

### Responsive Design
```css
/* Mobile-first approach */
.minigame-container {
  width: 100%;
  height: 100vh;
  max-width: 600px;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .minigame-container {
    height: 80vh;
    border-radius: 12px;
  }
}
```

## 🧪 Testing Plan

### Unit Tests
- Token calculation accuracy
- Berry effect application
- Mini-game scoring logic
- Inventory management

### Integration Tests
- Mini-game to token flow
- Berry purchase and usage
- Conservation buff application
- Objective tracking

### User Testing
- 5-minute first-time user test
- Mobile usability testing
- Token economy balance testing
- Fun factor assessment

## 🚀 Deployment Strategy

### Staged Rollout
1. **Internal Testing** (Day 5, afternoon)
2. **Beta Group** (10% users, Weekend)
3. **Soft Launch** (50% users, Monday Week 3)
4. **Full Launch** (100% users, Wednesday Week 3)

### Feature Flags
```javascript
const features = {
  miniGames: process.env.REACT_APP_MINI_GAMES === 'true',
  berrySystem: process.env.REACT_APP_BERRY_SYSTEM === 'true',
  enhancedTokens: process.env.REACT_APP_ENHANCED_TOKENS === 'true'
}
```

### Rollback Plan
- Keep old conservation system code
- Feature flag to instantly revert
- Monitor key metrics for 48 hours
- Rollback threshold: >20% drop in engagement

## 📈 Success Metrics

### Primary KPIs
- **Conservation Task Engagement**: Target 40% (up from <10%)
- **Average Session Length**: Target +50%
- **Token Earn Rate**: 50-80 tokens/day average
- **Berry Usage Rate**: 1+ berry/day for 30% of players

### Secondary KPIs
- Mini-game completion rate: >80%
- Berry purchase conversion: >25%
- Mobile performance: <3s load time
- Bug report rate: <1%

### Long-term Goals (Month 1)
- D7 retention: +20%
- Daily active users: +35%
- Average sessions/day: 2.5
- Social shares: +100%

## 🎨 Visual Polish

### Animations
- Particle effects for successful actions
- Screen shake for big scores
- Smooth transitions between states
- Celebration animations for achievements

### Sound Effects
- Unique sound per mini-game
- Positive reinforcement audio
- Berry activation sound
- Token earning jingle

### UI Enhancements
- Gradient backgrounds
- Glassmorphism for overlays
- Micro-interactions on all buttons
- Progress bars with animations

## 🔧 Technical Debt Addressed

### Code Organization
```
src/
├── components/
│   ├── minigames/
│   │   ├── MiniGameEngine.jsx
│   │   ├── CleanupRush.jsx
│   │   ├── FlowControl.jsx
│   │   ├── SeedScatter.jsx
│   │   ├── QuickBuild.jsx
│   │   └── PathFinder.jsx
│   ├── berries/
│   │   ├── BerryStore.jsx
│   │   ├── BerryInventory.jsx
│   │   └── BerryEffects.jsx
│   └── conservation/
│       ├── ConservationHub.jsx
│       ├── TokenDisplay.jsx
│       └── TaskSelector.jsx
├── hooks/
│   ├── useBerryEffects.js
│   ├── useTokenEconomy.js
│   └── useMiniGames.js
└── stores/
    └── gameStore.js
```

### State Management
- Centralized Zustand store
- Persistent token/berry storage
- Optimistic UI updates
- Offline capability

## 🎯 Risk Mitigation

### Technical Risks
- **Performance on low-end devices**: Pre-optimize, test early
- **Token economy imbalance**: Daily monitoring, quick adjustments
- **Mini-game bugs**: Comprehensive testing, graceful failures

### User Experience Risks
- **Learning curve**: In-game tutorials, tooltips
- **Berry confusion**: Clear UI, effects preview
- **Mini-game fatigue**: Variety, optional gameplay

### Business Risks
- **Development delays**: Prioritized feature list, MVP first
- **Negative feedback**: Quick response, community management
- **Server costs**: Client-side processing, efficient APIs

## 📝 Week 2 Deliverables Checklist

### Must Have ✅
- [ ] All 5 mini-games functional
- [ ] Berry store with purchase flow
- [ ] Token earning and spending
- [ ] Berry inventory system
- [ ] Berry effects on discovery
- [ ] Mobile responsive design
- [ ] Basic animations
- [ ] Bug-free experience

### Should Have 🎯
- [ ] Mini-game tutorials
- [ ] High score tracking
- [ ] Achievement system
- [ ] Sound effects
- [ ] Particle effects
- [ ] Daily challenges
- [ ] Difficulty scaling

### Nice to Have ✨
- [ ] Leaderboards
- [ ] Social sharing
- [ ] Custom themes
- [ ] Seasonal events
- [ ] Berry combinations
- [ ] Bonus rounds
- [ ] Multiplayer modes

## 🏁 Conclusion

Week 2 transforms Eco-Explorer from a passive discovery game into an active, engaging experience where player skill directly impacts progression. The mini-game system provides immediate fun while the berry system adds strategic depth.

By the end of Week 2, players will have:
1. **Agency**: Control over their discovery experience through berries
2. **Skill Expression**: Mastery of mini-games for better rewards
3. **Clear Progression**: Visible token earning and spending
4. **Meaningful Choices**: When to play, what to buy, when to use berries
5. **Satisfying Loop**: Play → Earn → Enhance → Discover → Repeat

This creates a sustainable, engaging game loop that addresses all the issues identified in Week 1 while setting up the foundation for future features like seasonal events, multiplayer challenges, and deeper progression systems.

---

*Implementation Plan Created: Current Date*
*Target Completion: End of Week 2*
*Success Criteria: 40% conservation engagement, 50% longer sessions*