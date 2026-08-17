import { useState } from 'react'
import MugScene from './components/MugScene.jsx'
import ControlsPanel from './components/ControlsPanel.jsx'

export default function App() {
  const [art, setArt] = useState({
    image: null,
    fileName: null,
    widthMM: 210,
    heightMM: 92,
    offsetXMM: 0,
    offsetYMM: 0,
    mugRealHeightMM: 95,
  })

  const [background, setBackground] = useState({
    type: 'color',
    color: '#e7e2da',
    image: null,
  })

  const [mugColor, setMugColor] = useState('#ffffff')
  const [warning, setWarning] = useState(null)

  return (
    <div className="app">
      <ControlsPanel
        art={art}
        setArt={setArt}
        background={background}
        setBackground={setBackground}
        mugColor={mugColor}
        setMugColor={setMugColor}
        warning={warning}
      />
      <main className="viewport">
        <MugScene
          art={{ ...art, onWarning: setWarning }}
          background={background}
          mugColor={mugColor}
          onMeasured={() => {}}
        />
      </main>
    </div>
  )
}
