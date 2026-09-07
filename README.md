Standard Work — Ficha técnica do produto (Sourcetextile)
Aplicação web para gerar descrições standard de peças (Confeção, Embalagem, Corte) a partir dos campos definidos no Excel. Gera o texto em duas vistas — Texto simples (à prova de ERP) e Texto formatado (negritos/listas, por defeito). O cabeçalho (Nome, Referência, Versão…) serve só para identificar e guardar a ficha — não entra no texto gerado.
Distribuição — um único ficheiro portável
`Ficha técnica do produto.html` (na raiz) é um ficheiro self-contained: tem o CSS,
o JavaScript e os dados todos embutidos. Abre em qualquer computador em `file://`, sem
internet e sem instalação, e pode ser enviado sozinho (por email, por exemplo) — não
precisa da pasta `app/` ao lado. É o único ficheiro que se entrega às gestoras.
Este ficheiro é gerado por `app/build.js` a partir das fontes em `app/` — não editar à mão.
Estrutura (fontes)
`app/template.html` — esqueleto HTML (fonte; o `build.js` embute aqui o CSS/JS/dados)
`app/css/styles.css` — estilos
`app/js/app.js` — render do formulário e interação
`app/js/generator.js` — geração do texto por zona (texto simples)
`app/js/sketches.js` — SVG line-art dos 14 tipos de peça
`app/js/storage.js` — rascunho, fichas guardadas e último tipo em localStorage
`app/data/campos.js` — dados gerados a partir do Excel (não editar à mão)
`app/tools/excel-to-campos.py` — conversão Excel → `data/campos.js`
`app/build.js` — inline de tudo → `Ficha técnica do produto.html` (raiz)
`app/server.js` — servidor estático usado apenas pelos testes
`app/tests/` — suites Playwright (ver `app/tests/README.md`)
Editar / reconstruir
```powershell
cd app
node build.js     # regenera "Ficha técnica do produto.html" self-contained
```
Fluxo: editar as fontes em `app/` → `node build.js` → abrir o HTML da raiz. Os testes
reconstroem automaticamente antes de correr.
Como usar
Abrir `Ficha técnica do produto.html` num browser.
Na aba Nova ficha, selecionar o tipo de peça na grelha.
(Opcional) Abrir o cabeçalho e preencher o Nome da ficha (é por ele que a ficha é guardada), referência, cliente, etc.
Preencher os campos relevantes por zona (Confeção/Embalagem/Corte — recolhíveis). Tudo é guardado automaticamente à medida que se escreve; ao recarregar, o tipo de peça e todos os campos são restaurados.
Carregar em Gerar descrição e copiar cada zona. Clicar num campo no texto gerado salta para esse campo no formulário.
Guardar ficha grava um instantâneo consultável na aba Fichas guardadas.
Atualizar os dados do Excel
```powershell
cd app
py tools/excel-to-campos.py
node build.js       # embutir os novos dados no ficheiro de distribuição
```
Regenera `data/campos.js` a partir de `Campos Ficha Tecnica de Desenvolvimento.xlsx`.
Correções ortográficas a texto do Excel vivem em `LABEL_FIXES` (`app/js/generator.js`).
Campos transversais acrescentados fora do Excel (todos os tipos exceto T-shirt,
zona Confeção), definidos em `excel-to-campos.py` com guarda anti-duplicados:
Botões — campo repetível ("+ Adicionar botão") com sub-campos tipados
(Localização, Qtd, Tipo de casa, Tamanho); formato de saída em `generator.js` (`fmtBotao`).
Outros acabamentos — campo variável.
O script lê o Excel mas nunca o grava — as validações/dropdowns do Excel ficam intactas.
Testes
```powershell
cd app
npm install                        # uma vez
npx playwright install chromium    # uma vez
npx playwright test                # corre as suites (reconstrói o HTML antes)
```
Detalhes em `app/tests/README.md`. Depois de alterar CSS ou sketches, correr a suite
visual e ver as screenshots em `app/tests/screenshots/`.
