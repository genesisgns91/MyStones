# Mockup 3D de Caneca

Projeto React (Vite) com Three.js / @react-three/fiber para gerar mockups 3D de caneca
com upload de arte, ajuste de tamanho/posição e fundo customizável.

## Como usar no StackBlitz (versão gratuita)

1. Em stackblitz.com, clique em **"New Project" → "React"** (isso cria um template padrão).
2. Apague os arquivos do template gerado (pasta `src/` e `package.json`) e cole os arquivos
   deste projeto no lugar, mantendo a mesma estrutura de pastas:
   ```
   package.json
   vite.config.js
   index.html
   src/main.jsx
   src/App.jsx
   src/index.css
   src/components/MugScene.jsx
   src/components/ControlsPanel.jsx
   src/hooks/useDecalTexture.js
   public/model.obj   <-- o modelo 3D anexado
   ```
3. O StackBlitz vai instalar as dependências (`three`, `@react-three/fiber`, `@react-three/drei`)
   automaticamente a partir do `package.json`.
4. Rode `npm run dev` (ou deixe o StackBlitz rodar automaticamente).

## Como funciona o mapeamento da arte na caneca

O modelo `model.obj` já vem com um objeto separado chamado **"decal"**, cujo UV cobre toda a
volta da caneca (`u: 0 a 1`) e a altura da parede de cima a baixo (`v: 0 a 1`). A costura do UV
(`u = 0 / u = 1`) fica exatamente atrás da alça — por isso a arte enviada é desenhada centralizada
na textura, deixando as bordas esquerda/direita transparentes, o que automaticamente resulta em
uma faixa em branco atrás da alça e a arte não "se conecta" nas pontas.

- **Largura/Altura (mm)**: tamanho real da arte impressa na caneca (padrão 210 x 92 mm).
- **Deslocamento horizontal/vertical**: reposiciona a arte dentro da área disponível.
- **Altura real da caneca (calibração)**: como o modelo 3D não tem uma unidade real definida,
  esse campo informa ao app a altura real (em mm) da parede da caneca física, e todo o resto
  (circunferência, proporção da arte) é recalculado a partir disso automaticamente.
- O topo, o fundo e a alça usam materiais cerâmicos próprios e nunca recebem a arte, pois são
  objetos separados no modelo (`inside`, `bottom`, `handle`, `other`, `print`).

## Fundo

- **Cor sólida**: escolha qualquer cor via seletor de cor.
- **Imagem**: envie uma imagem para usar como fundo da cena.

## Iluminação e renderização

- Ambiente HDRI (`Environment preset="apartment"`) para reflexos realistas de cerâmica.
- Luz direcional principal com sombras suaves + luz de preenchimento.
- Sombra de contato (`ContactShadows`) sob a caneca.
- Tone mapping ACES Filmic + material `MeshPhysicalMaterial` com clearcoat para o acabamento
  brilhante típico de cerâmica.
- `OrbitControls` para girar/aproximar a caneca livremente.
