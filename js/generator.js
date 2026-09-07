// Gera os textos standard por zona. Duas vistas: texto simples e texto formatado.
// O cabeçalho (Nome/Referência/Versão/…) NÃO entra no texto gerado.
//
// Regra de escrita (texto simples):
//   - Campo Fixo com opção:   "CAMPO: opção"   e a "outra indicação" numa linha
//                             indentada por baixo.
//   - Campo Fixo em branco:   "CAMPO"          (sem ':').
//   - Campo Variável:         "CAMPO:"         e o texto numa linha indentada por baixo.
//
// Contrato de estado (definido em app.js):
//   - campo Fixo:      { selected: [..opções.. | BLANK_OPTION], extra: 'texto livre (\n)' }
//   - campo Variável:  'texto (\n)'
//   - campo repetível: [ { <subCampoId>: 'valor', ... }, ... ]  (formato por row.formato)
const Generator = (() => {
  const ZONES = ['Confeção', 'Embalagem', 'Corte'];
  const EMPTY_ZONE_TEXT = 'Sem indicações específicas.';
  const BLANK_OPTION = '__BLANK__';
  const SUB_INDENT = '      '; // 6 espaços — subcategorias
  const EXTRA_STEP = '    ';   // +4 espaços — "outra indicação" por baixo do campo

  const LABEL_FIXES = new Map([
    ['Cinto amovivel', 'Cinto amovível'],
    ['Possivel escolher 2 ou mais opções', 'Possível escolher 2 ou mais opções']
  ]);

  function fixLabel(text) {
    return LABEL_FIXES.get(text) || text;
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function rstrip(text) {
    return typeof text === 'string' ? text.replace(/\s+$/, '') : '';
  }

  // Constrói o "field" de uma linha (ou null se vazio).
  function fieldFromRow(row, state) {
    if (row.tipo === 'Fixo') {
      const selected = state && Array.isArray(state.selected) ? state.selected : [];
      const options = selected.filter(v => v !== BLANK_OPTION);
      const blank = selected.includes(BLANK_OPTION);
      const extra = state && typeof state.extra === 'string' ? rstrip(state.extra) : '';
      if (!options.length && !blank && !extra.trim()) return null;
      let optionsStr = options.join(', ');
      // Medida associada a uma opção (ex.: Pinça "Pespontada" → "pesponto a X mm").
      if (row.medida && state && typeof state.medida === 'string') {
        const med = state.medida.trim();
        if (med && options.includes(row.medida.opcao)) {
          const phrase = row.medida.frase.replace('{v}', med);
          optionsStr = options.map(o => (o === row.medida.opcao ? `${o}, ${phrase}` : o)).join(', ');
        }
      }
      return { kind: 'fixo', options: optionsStr, extra, blank };
    }
    if (row.tipo === 'Numérico') {
      const v = rstrip(state).trim();
      if (!v) return null;
      return { kind: 'num', value: row.unidade ? `${v} ${row.unidade}` : v };
    }
    const text = rstrip(state);
    if (!text.trim()) return null;
    return { kind: 'var', text };
  }

  // Qtd → "1 botão" / "3 botões"; plural automático. Texto não numérico → "X botões".
  function qtyPhrase(raw, singular, plural) {
    const t = (raw || '').trim();
    if (!t) return '';
    const n = Number(t);
    if (Number.isInteger(n) && String(n) === t) return `${n} ${n === 1 ? singular : plural}`;
    return `${t} ${plural}`;
  }

  // --- Formatadores de campos repetíveis (uma linha por instância) ----------
  function fmtBolso(inst) {
    const qtd = (inst.quantidade || '').trim();
    const tipo = (inst.tipo || '').trim();
    const loc = (inst.localizacao || '').trim();
    const outras = (inst.outras || '').replace(/\s+/g, ' ').trim();
    if (!qtd && !tipo && !loc && !outras) return '';
    return [qtyPhrase(qtd, 'bolso', 'bolsos'), tipo, loc, outras].filter(Boolean).join(' - ');
  }

  function fmtBotao(inst) {
    const sel = (inst.localizacao || '').trim();
    const loc = sel.toLowerCase() === 'outros' ? (inst.localizacao__outros || '').trim() : sel;
    const qtd = (inst.quantidade || '').trim();
    const casa = (inst.tipoCasa || '').trim();
    const tam = (inst.tamanho || '').trim();
    if (!loc && !qtd && !casa && !tam) return '';
    const phrase = qtyPhrase(qtd, 'botão', 'botões');
    let line = '';
    if (loc) line += loc;
    if (phrase) line += (line ? ', ' : '') + phrase;
    if (casa) line += ` com casa na ${casa.toLowerCase()}`;
    if (tam) line += ` (tam. ${tam})`;
    return line;
  }

  const REPEAT_FORMATS = {
    bolsos: { format: fmtBolso, header: c => c.toUpperCase(), colon: false, indent: SUB_INDENT },
    botoes: { format: fmtBotao, header: c => c, colon: true, indent: '  ' }
  };

  function repeatSpec(formato) {
    return REPEAT_FORMATS[formato] || REPEAT_FORMATS.bolsos;
  }

  // O cabeçalho (Nome, Referência, etc.) NÃO entra no texto gerado — serve só
  // para guardar/identificar a ficha.
  function buildModel(rows, formState) {
    const zones = { 'Confeção': [], 'Embalagem': [], 'Corte': [] };

    ZONES.forEach(zona => {
      const zoneRows = rows.filter(r => r.zona === zona);
      const camposOrder = [];
      const porCampo = {};
      zoneRows.forEach(r => {
        if (!porCampo[r.campo]) {
          porCampo[r.campo] = [];
          camposOrder.push(r.campo);
        }
        porCampo[r.campo].push(r);
      });

      camposOrder.forEach(campo => {
        const campoRows = porCampo[campo];
        const repeatRow = campoRows.find(r => r.repetivel);

        if (repeatRow) {
          const state = Array.isArray(formState[repeatRow.key]) ? formState[repeatRow.key] : [];
          const formato = repeatRow.formato || 'bolsos';
          const lines = state.map(repeatSpec(formato).format).filter(Boolean);
          if (lines.length) {
            zones[zona].push({ kind: 'repeat', campo: fixLabel(campo), key: repeatRow.key, formato, lines });
          }
          return;
        }

        const entries = campoRows
          .map(r => ({ key: r.key, label: fixLabel(r.subcategoria || ''), field: fieldFromRow(r, formState[r.key]) }))
          .filter(e => e.field);
        if (!entries.length) return;

        if (campoRows.length === 1 && !campoRows[0].subcategoria) {
          zones[zona].push({ kind: 'simple', campo: fixLabel(campo), key: entries[0].key, field: entries[0].field });
        } else {
          const main = entries.find(e => !e.label);
          zones[zona].push({
            kind: 'group',
            campo: fixLabel(campo),
            key: campoRows[0].key,
            main: main ? main.field : null,
            entries: entries.filter(e => e.label)
          });
        }
      });
    });

    return { zones };
  }

  // --- Texto simples --------------------------------------------------------
  // Tokens: {kind:'header'|'field'|'line'|'empty'}. field.mode: 'value'|'colon'|'nocolon'.
  function pushFieldTokens(tokens, indent, key, label, field) {
    const extraIndent = indent + EXTRA_STEP;
    if (field.kind === 'num') {
      tokens.push({ kind: 'field', indent, key, label, mode: 'value', value: field.value });
      return;
    }
    if (field.kind === 'fixo') {
      if (field.options) {
        tokens.push({ kind: 'field', indent, key, label, mode: 'value', value: field.options });
      } else if (field.blank && !field.extra.trim()) {
        tokens.push({ kind: 'field', indent, key, label, mode: 'nocolon' });
      } else {
        tokens.push({ kind: 'field', indent, key, label, mode: 'colon' });
      }
      if (field.extra.trim()) {
        field.extra.split('\n').forEach(l => tokens.push({ kind: 'line', indent: extraIndent, text: l }));
      }
    } else {
      tokens.push({ kind: 'field', indent, key, label, mode: 'colon' });
      field.text.split('\n').forEach(l => tokens.push({ kind: 'line', indent: extraIndent, text: l }));
    }
  }

  function zoneTokens(model, zone) {
    const tokens = [];
    const blocks = model.zones[zone] || [];
    if (!blocks.length) {
      tokens.push({ kind: 'empty', text: EMPTY_ZONE_TEXT });
      return tokens;
    }

    blocks.forEach(block => {
      if (block.kind === 'simple') {
        pushFieldTokens(tokens, '', block.key, block.campo.toUpperCase(), block.field);
      } else if (block.kind === 'group') {
        if (block.main) {
          pushFieldTokens(tokens, '', block.key, block.campo.toUpperCase(), block.main);
        } else {
          tokens.push({ kind: 'field', indent: '', key: block.key, label: block.campo.toUpperCase(), mode: 'nocolon' });
        }
        block.entries.forEach(entry => pushFieldTokens(tokens, SUB_INDENT, entry.key, entry.label, entry.field));
      } else if (block.kind === 'repeat') {
        const spec = repeatSpec(block.formato);
        tokens.push({ kind: 'field', indent: '', key: block.key, label: spec.header(block.campo), mode: spec.colon ? 'colon' : 'nocolon' });
        block.lines.forEach(l => tokens.push({ kind: 'line', indent: spec.indent, text: l }));
      }
    });

    return tokens;
  }

  function headText(label, mode, value) {
    if (mode === 'value') return `${label}: ${value}`;
    if (mode === 'colon') return `${label}:`;
    return label; // nocolon
  }

  function plainZone(model, zone) {
    return zoneTokens(model, zone).map(tk => {
      if (tk.kind === 'field') return `${tk.indent}${headText(tk.label, tk.mode, tk.value)}`;
      if (tk.kind === 'line') return `${tk.indent}${tk.text}`;
      return tk.text;
    }).join('\n').trim();
  }

  function plainZoneHtml(model, zone) {
    return zoneTokens(model, zone).map(tk => {
      if (tk.kind === 'field') {
        const label = `<span class="jump" data-key="${tk.key}">${escapeHtml(tk.label)}</span>`;
        return `${tk.indent}${headText(label, tk.mode, escapeHtml(tk.value))}`;
      }
      if (tk.kind === 'line') return `${tk.indent}${escapeHtml(tk.text)}`;
      return escapeHtml(tk.text);
    }).join('\n');
  }

  // --- Texto formatado (rich) ----------------------------------------------
  function richField(labelHtml, field) {
    const br = labelHtml ? '<br>' : '';
    if (field.kind === 'num') {
      return labelHtml ? `<strong>${labelHtml}:</strong> ${escapeHtml(field.value)}` : escapeHtml(field.value);
    }
    if (field.kind === 'fixo') {
      if (field.options) {
        let s = labelHtml ? `<strong>${labelHtml}:</strong> ${escapeHtml(field.options)}` : escapeHtml(field.options);
        if (field.extra.trim()) s += `<br>${escapeHtml(field.extra).replace(/\n/g, '<br>')}`;
        return s;
      }
      if (field.blank && !field.extra.trim()) {
        return labelHtml ? `<strong>${labelHtml}</strong>` : '';
      }
      let s = labelHtml ? `<strong>${labelHtml}:</strong>` : '';
      if (field.extra.trim()) s += `${br}${escapeHtml(field.extra).replace(/\n/g, '<br>')}`;
      return s;
    }
    let s = labelHtml ? `<strong>${labelHtml}:</strong>` : '';
    s += `${br}${escapeHtml(field.text).replace(/\n/g, '<br>')}`;
    return s;
  }

  function richZone(model, zone) {
    const parts = [];
    const jump = (key, text) => `<span class="jump" data-key="${key}">${escapeHtml(text)}</span>`;

    const blocks = model.zones[zone] || [];
    if (!blocks.length) {
      parts.push(`<p>${EMPTY_ZONE_TEXT}</p>`);
    } else {
      blocks.forEach(block => {
        if (block.kind === 'simple') {
          parts.push(`<p>${richField(jump(block.key, block.campo), block.field)}</p>`);
        } else if (block.kind === 'group') {
          parts.push(`<h3>${jump(block.key, block.campo)}</h3>`);
          const items = [];
          if (block.main) {
            const inner = richField('', block.main);
            if (inner) items.push(`<li>${inner}</li>`);
          }
          block.entries.forEach(entry => items.push(`<li>${richField(jump(entry.key, entry.label), entry.field)}</li>`));
          if (items.length) parts.push(`<ul>${items.join('')}</ul>`);
        } else if (block.kind === 'repeat') {
          parts.push(`<h3>${jump(block.key, block.campo)}</h3>`);
          if (block.lines.length) {
            parts.push('<ul>' + block.lines.map(l => `<li>${escapeHtml(l)}</li>`).join('') + '</ul>');
          }
        }
      });
    }

    return parts.join('\n');
  }

  function richToPlain(html) {
    return html
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/<\/(p|h3|li|ul|ol)>/g, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  return { ZONES, BLANK_OPTION, buildModel, plainZone, plainZoneHtml, richZone, richToPlain, fixLabel };
})();

