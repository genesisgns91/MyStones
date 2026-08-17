export default function ControlsPanel({ art, setArt, background, setBackground, mugColor, setMugColor, warning }) {
  const handleArtUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      setArt((a) => ({ ...a, image: img, fileName: file.name }))
    }
    img.src = url
  }

  const handleBgImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setBackground({ type: 'image', image: url })
  }

  return (
    <aside className="panel">
      <h1>Mockup 3D de Caneca</h1>

      <section>
        <h2>Sua arte</h2>
        <label className="file-btn">
          {art.fileName ? `Trocar arquivo (${art.fileName})` : 'Enviar imagem'}
          <input type="file" accept="image/*" onChange={handleArtUpload} hidden />
        </label>

        <div className="grid-2">
          <label>
            Largura (mm)
            <input
              type="number"
              value={art.widthMM}
              min={10}
              max={400}
              onChange={(e) => setArt((a) => ({ ...a, widthMM: Number(e.target.value) }))}
            />
          </label>
          <label>
            Altura (mm)
            <input
              type="number"
              value={art.heightMM}
              min={10}
              max={200}
              onChange={(e) => setArt((a) => ({ ...a, heightMM: Number(e.target.value) }))}
            />
          </label>
        </div>

        <label>
          Deslocamento horizontal ({art.offsetXMM} mm)
          <input
            type="range"
            min={-60}
            max={60}
            value={art.offsetXMM}
            onChange={(e) => setArt((a) => ({ ...a, offsetXMM: Number(e.target.value) }))}
          />
        </label>
        <label>
          Deslocamento vertical ({art.offsetYMM} mm)
          <input
            type="range"
            min={-20}
            max={20}
            value={art.offsetYMM}
            onChange={(e) => setArt((a) => ({ ...a, offsetYMM: Number(e.target.value) }))}
          />
        </label>

        <label>
          Altura real da caneca (calibração, mm)
          <input
            type="number"
            value={art.mugRealHeightMM}
            min={60}
            max={140}
            onChange={(e) => setArt((a) => ({ ...a, mugRealHeightMM: Number(e.target.value) }))}
          />
        </label>
        <p className="hint">
          Ajuste conforme a altura real da parede da sua caneca física. Isso calibra a escala em
          mm usada para largura/altura da arte e deslocamentos.
        </p>

        {warning && <p className="warning">{warning}</p>}
      </section>

      <section>
        <h2>Fundo</h2>
        <div className="row">
          <label>
            <input
              type="radio"
              name="bgtype"
              checked={background.type === 'color'}
              onChange={() => setBackground((b) => ({ ...b, type: 'color' }))}
            />
            Cor sólida
          </label>
          <label>
            <input
              type="radio"
              name="bgtype"
              checked={background.type === 'image'}
              onChange={() => setBackground((b) => ({ ...b, type: 'image' }))}
            />
            Imagem
          </label>
        </div>

        {background.type === 'color' ? (
          <input
            type="color"
            value={background.color}
            onChange={(e) => setBackground((b) => ({ ...b, color: e.target.value }))}
          />
        ) : (
          <label className="file-btn">
            Enviar imagem de fundo
            <input type="file" accept="image/*" onChange={handleBgImageUpload} hidden />
          </label>
        )}
      </section>

      <section>
        <h2>Cor da caneca</h2>
        <input type="color" value={mugColor} onChange={(e) => setMugColor(e.target.value)} />
      </section>
    </aside>
  )
}
