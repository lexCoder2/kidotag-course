/**
 * mock-mongoose.ts — clon en memoria de Mongoose para el runner NodeApi.
 *
 * Implementa la superficie usada en kidotag10/api/src/models/*.js:
 *   - new Schema(definition, options)  con required/unique/default/type/ref/trim/lowercase/enum
 *   - schema.pre("save", fn)
 *   - mongoose.model(name, schema)
 *   - Model: create, findOne, find, findById, findByIdAndUpdate, findByIdAndDelete,
 *     updateOne, deleteOne, countDocuments
 *   - populate(), lean(), exec(), then() para compat con cadenas de promesas
 *   - Generación de IDs como "<ModelName>_N"
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyDoc = Record<string, any>;

let _idCounter = 0;
function nextId(modelName: string): string {
  return `${modelName}_${++_idCounter}`;
}

// Almacén global en memoria: modelName → Map<id, doc>
const _store: Map<string, Map<string, AnyDoc>> = new Map();
// Registro de modelos: modelName → MockModel
const _models: Map<string, MockModel> = new Map();

function getStore(name: string): Map<string, AnyDoc> {
  if (!_store.has(name)) _store.set(name, new Map());
  return _store.get(name)!;
}

/**
 * Resetea todo el almacén (útil entre tests para aislamiento).
 */
export function resetStore(): void {
  _store.clear();
  _idCounter = 0;
}

// ─── Schema ─────────────────────────────────────────────────────────────────

export class MockSchema {
  _definition: AnyDoc;
  _options: AnyDoc;
  _preHooks: {
    hook: string;
    fn: (this: AnyDoc, next: () => void) => Promise<void> | void;
  }[] = [];
  _virtuals: Map<string, AnyDoc> = new Map();

  constructor(definition: AnyDoc = {}, options: AnyDoc = {}) {
    this._definition = definition;
    this._options = options;
  }

  pre(
    hook: string,
    fn: (this: AnyDoc, next: () => void) => Promise<void> | void,
  ): this {
    this._preHooks.push({ hook, fn });
    return this;
  }

  virtual(name: string): { get: (fn: () => unknown) => void } {
    const v: AnyDoc = {};
    this._virtuals.set(name, v);
    return {
      get: (fn) => {
        v.get = fn;
      },
    };
  }

  /** Aplica defaults y restricciones básicas a un documento nuevo. */
  _applyDefaults(data: AnyDoc): AnyDoc {
    const out: AnyDoc = { ...data };
    for (const [field, def] of Object.entries(this._definition)) {
      const fieldDef =
        typeof def === "object" && def !== null && !Array.isArray(def)
          ? def
          : { type: def };
      if (out[field] === undefined && fieldDef.default !== undefined) {
        out[field] =
          typeof fieldDef.default === "function"
            ? fieldDef.default()
            : fieldDef.default;
      }
      if (fieldDef.lowercase && typeof out[field] === "string") {
        out[field] = out[field].toLowerCase();
      }
      if (fieldDef.trim && typeof out[field] === "string") {
        out[field] = out[field].trim();
      }
    }
    if (this._options.timestamps) {
      const now = new Date();
      if (!out.createdAt) out.createdAt = now;
      out.updatedAt = now;
    }
    return out;
  }

  /** Valida un documento según la definición del schema. */
  _validate(data: AnyDoc): void {
    for (const [field, def] of Object.entries(this._definition)) {
      const fieldDef =
        typeof def === "object" && def !== null && !Array.isArray(def)
          ? def
          : { type: def };
      if (
        fieldDef.required &&
        (data[field] === undefined ||
          data[field] === null ||
          data[field] === "")
      ) {
        throw new MockValidationError(
          field,
          "Path `" + field + "` is required.",
        );
      }
      if (
        fieldDef.enum &&
        data[field] !== undefined &&
        !fieldDef.enum.includes(data[field])
      ) {
        throw new MockValidationError(
          field,
          `\`${data[field]}\` is not a valid enum value for path \`${field}\`.`,
        );
      }
    }
  }
}

export class MockValidationError extends Error {
  errors: Record<string, { message: string }>;
  constructor(field: string, message: string) {
    super(`Validation failed: ${field}: ${message}`);
    this.name = "ValidationError";
    this.errors = { [field]: { message } };
  }
}

// ─── Modelo ──────────────────────────────────────────────────────────────────

class MockDocument {
  _id: string;
  _schema: MockSchema;
  _modelName: string;
  _data: AnyDoc;
  _isNew: boolean;

  constructor(
    data: AnyDoc,
    schema: MockSchema,
    modelName: string,
    isNew = true,
  ) {
    this._schema = schema;
    this._modelName = modelName;
    this._isNew = isNew;
    const prepared = schema._applyDefaults(data);
    if (!prepared._id) prepared._id = nextId(modelName);
    this._id = prepared._id as string;
    this._data = prepared;
    // Expone campos directamente en el documento
    Object.assign(this, prepared);
  }

  isModified(field: string): boolean {
    // Heurística simple: siempre true para el campo indicado en un doc nuevo
    return this._isNew ? true : field in this._data;
  }

  async save(): Promise<this> {
    this._schema._validate(this._data);

    // Correr pre("save") hooks
    for (const { hook, fn } of this._schema._preHooks) {
      if (hook === "save") {
        await new Promise<void>((resolve, reject) => {
          try {
            const result = fn.call(this, resolve);
            if (result instanceof Promise) result.then(resolve).catch(reject);
          } catch (e) {
            reject(e);
          }
        });
        // Sync back mutated fields from `this` to `_data`
        Object.assign(this._data, this);
      }
    }

    if (this._options?.timestamps) this._data.updatedAt = new Date();

    const store = getStore(this._modelName);
    store.set(this._id, { ...this._data });
    this._isNew = false;
    return this;
  }

  // Acceso a _options del schema
  get _options() {
    return this._schema._options;
  }

  toObject(): AnyDoc {
    return { ...this._data };
  }
  toJSON(): AnyDoc {
    return this.toObject();
  }
}

function matchesQuery(doc: AnyDoc, query: AnyDoc): boolean {
  for (const [key, val] of Object.entries(query)) {
    if (key.startsWith("$")) continue; // ignorar operadores avanzados por ahora
    if (doc[key] !== val) return false;
  }
  return true;
}

export class MockModel {
  _name: string;
  _schema: MockSchema;

  constructor(name: string, schema: MockSchema) {
    this._name = name;
    this._schema = schema;
  }

  _newDoc(data: AnyDoc, isNew = true): MockDocument {
    return new MockDocument(data, this._schema, this._name, isNew);
  }

  _wrapDoc(raw: AnyDoc): MockDocument {
    return this._newDoc(raw, false);
  }

  // new Model(data) via proxy (see exports)
  __call__(data: AnyDoc): MockDocument {
    return this._newDoc(data);
  }

  async create(
    data: AnyDoc | AnyDoc[],
  ): Promise<MockDocument | MockDocument[]> {
    if (Array.isArray(data)) {
      return Promise.all(data.map((d) => this._newDoc(d).save()));
    }
    return this._newDoc(data).save();
  }

  findOne(query: AnyDoc = {}): MockQuery<MockDocument | null> {
    const store = getStore(this._name);
    const found =
      [...store.values()].find((d) => matchesQuery(d, query)) ?? null;
    return new MockQuery(found ? this._wrapDoc(found) : null);
  }

  find(query: AnyDoc = {}): MockQuery<MockDocument[]> {
    const store = getStore(this._name);
    const found = [...store.values()]
      .filter((d) => matchesQuery(d, query))
      .map((d) => this._wrapDoc(d));
    return new MockQuery(found);
  }

  findById(id: string): MockQuery<MockDocument | null> {
    const store = getStore(this._name);
    const raw = store.get(id) ?? null;
    return new MockQuery(raw ? this._wrapDoc(raw) : null);
  }

  async findByIdAndUpdate(
    id: string,
    update: AnyDoc,
    opts: AnyDoc = {},
  ): Promise<MockDocument | null> {
    const store = getStore(this._name);
    const raw = store.get(id);
    if (!raw) return null;
    const delta = update.$set ?? update;
    const updated = { ...raw, ...delta };
    if (this._schema._options?.timestamps) updated.updatedAt = new Date();
    store.set(id, updated);
    return opts.new ? this._wrapDoc(updated) : this._wrapDoc(raw);
  }

  async findByIdAndDelete(id: string): Promise<MockDocument | null> {
    const store = getStore(this._name);
    const raw = store.get(id);
    if (!raw) return null;
    store.delete(id);
    return this._wrapDoc(raw);
  }

  async updateOne(
    filter: AnyDoc,
    update: AnyDoc,
  ): Promise<{ modifiedCount: number }> {
    const store = getStore(this._name);
    const entry = [...store.entries()].find(([, d]) => matchesQuery(d, filter));
    if (!entry) return { modifiedCount: 0 };
    const [key, raw] = entry;
    const delta = update.$set ?? update;
    store.set(key, { ...raw, ...delta });
    return { modifiedCount: 1 };
  }

  async deleteOne(filter: AnyDoc): Promise<{ deletedCount: number }> {
    const store = getStore(this._name);
    const key = [...store.entries()].find(([, d]) =>
      matchesQuery(d, filter),
    )?.[0];
    if (!key) return { deletedCount: 0 };
    store.delete(key);
    return { deletedCount: 1 };
  }

  async countDocuments(filter: AnyDoc = {}): Promise<number> {
    const store = getStore(this._name);
    return [...store.values()].filter((d) => matchesQuery(d, filter)).length;
  }
}

class MockQuery<T> {
  _result: T;
  _lean = false;

  constructor(result: T) {
    this._result = result;
  }

  lean(): this {
    this._lean = true;
    return this;
  }

  populate(_field: string): this {
    // Resolución básica de refs por ObjectId string
    const resolve = (doc: AnyDoc): AnyDoc => {
      const out: AnyDoc = { ...doc };
      for (const [field, val] of Object.entries(out)) {
        if (typeof val === "string" && val.includes("_")) {
          // Busca en todos los stores
          for (const [_name, store] of _store.entries()) {
            const ref = store.get(val);
            if (ref) {
              out[field] = ref;
              break;
            }
          }
        }
      }
      return out;
    };

    if (Array.isArray(this._result)) {
      this._result = (this._result as AnyDoc[]).map(resolve) as T;
    } else if (this._result && typeof this._result === "object") {
      this._result = resolve(this._result as AnyDoc) as T;
    }
    return this;
  }

  sort(_by: AnyDoc): this {
    return this;
  }
  limit(_n: number): this {
    return this;
  }
  skip(_n: number): this {
    return this;
  }
  select(_fields: string): this {
    return this;
  }

  exec(): Promise<T> {
    return Promise.resolve(this._result);
  }
  then<R>(resolve: (v: T) => R, reject?: (e: unknown) => R): Promise<R> {
    return this.exec().then(resolve, reject);
  }
}

// ─── Módulo mongoose ─────────────────────────────────────────────────────────

const mongoose = {
  Schema: MockSchema,

  model(name: string, schema?: MockSchema): MockModel {
    if (_models.has(name)) return _models.get(name)!;
    if (!schema) throw new Error(`Modelo "${name}" no registrado`);
    // Crea un constructor-proxy que permite `new Model(data)`
    const instance = new MockModel(name, schema);
    // Retornar una función que actúa como constructor y tiene los métodos estáticos
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ModelFn: any = function (data: AnyDoc) {
      return instance._newDoc(data);
    };
    // Copiar métodos estáticos
    Object.assign(ModelFn, {
      create: (d: AnyDoc | AnyDoc[]) => instance.create(d),
      findOne: (q?: AnyDoc) => instance.findOne(q ?? {}),
      find: (q?: AnyDoc) => instance.find(q ?? {}),
      findById: (id: string) => instance.findById(id),
      findByIdAndUpdate: (id: string, u: AnyDoc, o?: AnyDoc) =>
        instance.findByIdAndUpdate(id, u, o),
      findByIdAndDelete: (id: string) => instance.findByIdAndDelete(id),
      updateOne: (f: AnyDoc, u: AnyDoc) => instance.updateOne(f, u),
      deleteOne: (f: AnyDoc) => instance.deleteOne(f),
      countDocuments: (f?: AnyDoc) => instance.countDocuments(f),
      _instance: instance,
    });
    _models.set(name, ModelFn as unknown as MockModel);
    return ModelFn as unknown as MockModel;
  },

  connect: (_uri: string): Promise<typeof mongoose> =>
    Promise.resolve(mongoose),
  disconnect: (): Promise<void> => Promise.resolve(),

  connection: {
    on: (_event: string, _fn: () => void) => {},
    once: (_event: string, _fn: () => void) => {},
  },

  Types: {
    ObjectId: class ObjectId {
      _id: string;
      constructor(id?: string) {
        this._id = id ?? nextId("ObjectId");
      }
      toString() {
        return this._id;
      }
      static isValid(v: unknown) {
        return typeof v === "string" && v.length > 0;
      }
    },
  },

  resetStore,
};

export type MockMongoose = typeof mongoose;
export const mockMongooseModule = mongoose;
export default mongoose;
