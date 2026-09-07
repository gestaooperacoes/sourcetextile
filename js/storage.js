const Storage = {
  prefix: 'sourcetextile-ficha-tecnica:',

  // Cliente Supabase opcional — só definido no build hospedado, depois do
  // login (ver app/js/auth.js). Sem ele, tudo cai no localStorage local,
  // exatamente como no ficheiro portátil.
  _client: null,
  _table: null,

  init(client, table) {
    this._client = client;
    this._table = table;
  },

  _key(type) {
    return `${this.prefix}${type}`;
  },

  _headerKey(type) {
    return `${this._key(type)}:header`;
  },

  load(type) {
    try {
      const raw = localStorage.getItem(this._key(type));
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.warn('Não foi possível ler o rascunho:', error);
      return null;
    }
  },

  save(type, payload) {
    try {
      localStorage.setItem(this._key(type), JSON.stringify(payload));
    } catch (error) {
      console.warn('Não foi possível gravar o rascunho:', error);
    }
  },

  loadHeader(type) {
    try {
      const raw = localStorage.getItem(this._headerKey(type));
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.warn('Não foi possível ler o cabeçalho:', error);
      return null;
    }
  },

  saveHeader(type, payload) {
    try {
      localStorage.setItem(this._headerKey(type), JSON.stringify(payload));
    } catch (error) {
      console.warn('Não foi possível gravar o cabeçalho:', error);
    }
  },

  clear(type) {
    localStorage.removeItem(this._key(type));
    localStorage.removeItem(this._headerKey(type));
  },

  // Fichas guardadas — partilhadas entre todas as gestoras quando há um
  // cliente Supabase (build hospedado); sem cliente, cai no localStorage
  // local (build portátil), com o mesmo comportamento de sempre.
  _savedKey() {
    return `${this.prefix}fichas-guardadas`;
  },

  _loadSavedLocal() {
    try {
      const raw = localStorage.getItem(this._savedKey());
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (error) {
      console.warn('Não foi possível ler as fichas guardadas:', error);
      return [];
    }
  },

  _saveSavedLocalList(list) {
    try {
      localStorage.setItem(this._savedKey(), JSON.stringify(list));
    } catch (error) {
      console.warn('Não foi possível gravar as fichas guardadas:', error);
    }
  },

  _upsertSavedLocal(entry) {
    const list = this._loadSavedLocal();
    const existing = list.findIndex(item => item.name === entry.name && item.type === entry.type);
    if (existing >= 0) {
      entry.id = list[existing].id;
      list[existing] = entry;
    } else {
      entry.id = entry.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      list.unshift(entry);
    }
    this._saveSavedLocalList(list);
  },

  _deleteSavedLocal(id) {
    this._saveSavedLocalList(this._loadSavedLocal().filter(it => it.id !== id));
  },

  async loadSaved() {
    if (!this._client) return this._loadSavedLocal();
    const { data, error } = await this._client
      .from(this._table)
      .select('id, nome, tipo_peca, header, form, saved_at')
      .order('saved_at', { ascending: false });
    if (error) {
      console.warn('Não foi possível carregar as fichas guardadas:', error);
      return [];
    }
    return data.map(row => ({
      id: row.id,
      name: row.nome,
      type: row.tipo_peca,
      savedAt: row.saved_at,
      header: row.header,
      form: row.form
    }));
  },

  async upsertSaved(entry) {
    if (!this._client) return this._upsertSavedLocal(entry);
    const { error } = await this._client
      .from(this._table)
      .upsert(
        { nome: entry.name, tipo_peca: entry.type, header: entry.header, form: entry.form },
        { onConflict: 'nome,tipo_peca' }
      );
    if (error) console.warn('Não foi possível guardar a ficha:', error);
  },

  async deleteSaved(id) {
    if (!this._client) return this._deleteSavedLocal(id);
    const { error } = await this._client.from(this._table).delete().eq('id', id);
    if (error) console.warn('Não foi possível apagar a ficha:', error);
  },

  // Último tipo aberto — para restaurar o formulário no reload
  _lastTypeKey() {
    return `${this.prefix}ultimo-tipo`;
  },

  loadLastType() {
    try {
      return localStorage.getItem(this._lastTypeKey()) || null;
    } catch (error) {
      return null;
    }
  },

  saveLastType(type) {
    try {
      if (type) localStorage.setItem(this._lastTypeKey(), type);
      else localStorage.removeItem(this._lastTypeKey());
    } catch (error) {
      console.warn('Não foi possível gravar o último tipo:', error);
    }
  }
};

