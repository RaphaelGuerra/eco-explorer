import { useState } from 'react'
import ConfettiBurst from './ConfettiBurst'
import ActionZone from './ActionZone'
import ConservationHub from './ConservationHub'
import sfx from '../utils/sfx'

export default function Week1Test() {
  const [gameTime, setGameTime] = useState('day')
  const [weather, setWeather] = useState('clear')
  const [showConfetti, setShowConfetti] = useState(false)
  const [activeTasks, setActiveTasks] = useState([])
  const [conservationTokens, setConservationTokens] = useState(25)
  const [ecosystemHealth, setEcosystemHealth] = useState(75)

  const handleExplore = () => {
    sfx.play('scan_start')
  }

  const handleTimeChange = () => {
    const newTime = gameTime === 'day' ? 'night' : 'day'
    setGameTime(newTime)
    if (newTime === 'day') {
      sfx.startAmbient('forest_day')
    } else {
      sfx.startAmbient('forest_night')
    }
  }

  const handleWeatherChange = () => {
    const newWeather = weather === 'clear' ? 'rainy' : 'clear'
    setWeather(newWeather)
    if (newWeather === 'rainy') {
      sfx.startAmbient('rain')
    }
  }

  const handleTestConfetti = () => {
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 3000)
  }

  const handleStartTask = (task) => {
    sfx.play('task_complete')
    setConservationTokens(prev => prev + task.reward.tokens)
  }

  const testSounds = () => {
    sfx.play('discover_common')
    setTimeout(() => sfx.play('discover_rare'), 1000)
    setTimeout(() => sfx.play('discover_radiant'), 2000)
    setTimeout(() => sfx.play('task_complete'), 3000)
  }

  const availableTasks = [
    {
      id: 'remove_litter',
      name: 'Remove Litter',
      icon: '🗑️',
      reward: { tokens: 5 },
      duration: 30
    },
    {
      id: 'plant_native',
      name: 'Plant Native',
      icon: '🌱',
      reward: { tokens: 8 },
      duration: 45
    }
  ]

  return (
    <div style={{ padding: '20px', background: '#f5f5f5', minHeight: '100vh' }}>
      <h1>Week 1 Critical Fixes Test</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div>
          <h2>Confetti Effect Test</h2>
          <button onClick={handleTestConfetti}>Test Confetti Burst</button>
          <button onClick={() => setShowConfetti(true)}>High Intensity Confetti</button>
          {showConfetti && <ConfettiBurst trigger={showConfetti} intensity="high" />}
        </div>

        <div>
          <h2>Sound System Test</h2>
          <button onClick={testSounds}>Test Discovery Sounds</button>
          <button onClick={() => sfx.play('scan_start')}>Scan Start</button>
          <button onClick={() => sfx.play('focus_found')}>Focus Found</button>
          <button onClick={() => sfx.toggle()}>Toggle Sound</button>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Action Zone Component</h2>
        <ActionZone
          onExplore={handleExplore}
          isScanning={false}
          isFocusing={false}
          gameTime={gameTime}
          weather={weather}
          onTimeChange={handleTimeChange}
          onWeatherChange={handleWeatherChange}
        />
      </div>

      <div>
        <h2>Conservation Hub Component</h2>
        <ConservationHub
          activeTasks={activeTasks}
          availableTasks={availableTasks}
          tokens={conservationTokens}
          ecosystemHealth={ecosystemHealth}
          onStartTask={handleStartTask}
        />
      </div>

      <div style={{ marginTop: '20px', padding: '10px', background: 'white', borderRadius: '8px' }}>
        <h3>Current State:</h3>
        <p>Game Time: {gameTime}</p>
        <p>Weather: {weather}</p>
        <p>Conservation Tokens: {conservationTokens}</p>
        <p>Ecosystem Health: {ecosystemHealth}%</p>
        <p>Sound System: {sfx.enabled ? 'Enabled' : 'Disabled'}</p>
      </div>
    </div>
  )
}
