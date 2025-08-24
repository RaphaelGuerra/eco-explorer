import './ActionZone.css'

export default function ActionZone({ onExplore, isScanning, isFocusing, gameTime, weather, onTimeChange, onWeatherChange }) {
  return (
    <div className="action-zone">
      <button
        className="explore-button-primary"
        onClick={onExplore}
        disabled={isScanning || isFocusing}
      >
        <span className="explore-icon">🔍</span>
        <span className="explore-text">
          {isScanning ? 'Scanning...' : isFocusing ? 'Focusing...' : 'EXPLORE'}
        </span>
        {(isScanning || isFocusing) && <span className="loading-spinner" />}
      </button>

      <div className="quick-toggles">
        <button
          className="toggle-button"
          onClick={onTimeChange}
          title="Change time of day"
        >
          {gameTime === 'day' ? '☀️' : '🌙'}
        </button>
        <button
          className="toggle-button"
          onClick={onWeatherChange}
          title="Change weather"
        >
          {weather === 'clear' ? '☀️' : weather === 'rainy' ? '🌧️' : '☁️'}
        </button>
      </div>
    </div>
  )
}
