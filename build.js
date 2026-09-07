// Constrói o ficheiro de distribuição self-contained.
//
// Lê `app/template.html` + os ficheiros CSS/JS/dados e produz, na raiz,
// `Ficha técnica do produto.html` com TUDO embutido (<style> + <script>).
// Resultado: um único ficheiro que abre em file:// sem internet e sem a
// pasta app/ ao lado — pode ser enviado sozinho por email.
const fs = require('fs');
const path = require('path');

const appDir = __dirname;
const root = path.join(appDir, '..');
const OUT = path.join(root, 'Ficha técnica do produto.html');

const readRoot = rel => fs.readFileSync(path.join(root, rel), 'utf8');

let html = fs.readFileSync(path.join(appDir, 'template.html'), 'utf8');

// CSS → <style> (função no replacement para não interpretar '$' do conteúdo)
html = html.replace(
  /<link rel="stylesheet" href="app\/css\/styles\.css">/,
  () => `<style>\n${readRoot('app/css/styles.css')}\n</style>`
);

// Cada <script src="..."> → <script> com o conteúdo embutido
html = html.replace(
  /<script src="([^"]+)"><\/script>/g,
  (_match, src) => `<script>\n${readRoot(src)}\n</script>`
);

fs.writeFileSync(OUT, html, 'utf8');
console.log(`build ok → ${OUT}`);
