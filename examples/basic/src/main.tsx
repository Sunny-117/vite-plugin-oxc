import React from 'react'
import ReactDOM from 'react-dom/client'

interface Props {
  name: string
  count?: number
}

const App: React.FC<Props> = ({ name, count = 0 }) => {
  const [counter, setCounter] = React.useState(count)

  return (
    <div>
      <h1>Hello {name}!</h1>
      <p>Count: {counter}</p>
      <button onClick={() => setCounter(c => c + 1)}>
        Increment
      </button>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(<App name="Vite + Oxc" />)
