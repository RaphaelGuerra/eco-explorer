import './ConservationHub.css'

export default function ConservationHub({
  activeTasks,
  availableTasks,
  tokens,
  ecosystemHealth,
  onStartTask
}) {
  return (
    <div className="conservation-hub">
      <div className="hub-header">
        <h3>Conservation Hub</h3>
        <div className="hub-stats">
          <span className="token-display">
            <span className="token-icon">🪙</span>
            <span className="token-count">{tokens}</span>
          </span>
          <span className="health-display">
            <span className="health-icon">🌍</span>
            <span className="health-bar">
              <span
                className="health-fill"
                style={{ width: `${ecosystemHealth}%` }}
              />
            </span>
          </span>
        </div>
      </div>

      <div className="tasks-grid">
        {activeTasks.map(task => (
          <div key={task.id} className="task-card active">
            <div className="task-icon">{task.icon}</div>
            <div className="task-name">{task.name}</div>
            <div className="task-progress">
              <div
                className="progress-fill"
                style={{
                  width: `${(1 - task.remainingTime / task.duration) * 100}%`
                }}
              />
            </div>
            <div className="task-time">{task.remainingTime}s</div>
          </div>
        ))}

        {availableTasks.slice(0, 3 - activeTasks.length).map(task => (
          <div
            key={task.id}
            className="task-card available"
            onClick={() => onStartTask(task)}
          >
            <div className="task-icon">{task.icon}</div>
            <div className="task-name">{task.name}</div>
            <div className="task-reward">+{task.reward.tokens} 🪙</div>
            <button className="start-task-btn">Start</button>
          </div>
        ))}
      </div>
    </div>
  )
}
