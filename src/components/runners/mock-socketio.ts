/**
 * mock-socketio.ts — clon de socket.io/socket.io-client para el runner.
 *
 * Implementa la superficie usada en kidotag10 para socket.io:
 *   - io() / createServer() → MockIoServer
 *   - server.on("connection", fn)
 *   - socket.emit(event, ...args)
 *   - socket.on(event, fn)
 *   - socket.broadcast.emit(event, ...args)
 *   - socket.join(room), socket.to(room).emit(...)
 *   - server.emit(event, ...args) — broadcast a todos
 *
 * Para tests: usa createTestPair() para obtener (serverSocket, clientSocket) conectados.
 */

type Listener = (...args: unknown[]) => void;

class MockEventEmitter {
  _listeners: Map<string, Listener[]> = new Map();

  on(event: string, fn: Listener): this {
    if (!this._listeners.has(event)) this._listeners.set(event, []);
    this._listeners.get(event)!.push(fn);
    return this;
  }

  off(event: string, fn: Listener): this {
    const list = this._listeners.get(event);
    if (list)
      this._listeners.set(
        event,
        list.filter((l) => l !== fn),
      );
    return this;
  }

  emit(event: string, ...args: unknown[]): boolean {
    const list = this._listeners.get(event);
    if (!list || list.length === 0) return false;
    list.forEach((fn) => fn(...args));
    return true;
  }

  removeAllListeners(event?: string): this {
    if (event) this._listeners.delete(event);
    else this._listeners.clear();
    return this;
  }
}

export class MockSocket extends MockEventEmitter {
  id: string;
  _rooms: Set<string>;
  _server: MockIoServer;
  _connected = true;
  handshake = { auth: {}, headers: {} };
  data: Record<string, unknown> = {};

  constructor(id: string, server: MockIoServer) {
    super();
    this.id = id;
    this._server = server;
    this._rooms = new Set([id]);
  }

  join(room: string): void {
    this._rooms.add(room);
    if (!this._server._rooms.has(room))
      this._server._rooms.set(room, new Set());
    this._server._rooms.get(room)!.add(this.id);
  }

  leave(room: string): void {
    this._rooms.delete(room);
    this._server._rooms.get(room)?.delete(this.id);
  }

  get broadcast(): {
    emit: (event: string, ...args: unknown[]) => void;
    to: (room: string) => { emit: (event: string, ...args: unknown[]) => void };
  } {
    return {
      emit: (event: string, ...args: unknown[]) => {
        this._server._sockets.forEach((s) => {
          if (s.id !== this.id) s.emit(event, ...args);
        });
      },
      to: (room: string) => ({
        emit: (event: string, ...args: unknown[]) => {
          this._server._rooms.get(room)?.forEach((id) => {
            if (id !== this.id)
              this._server._sockets.get(id)?.emit(event, ...args);
          });
        },
      }),
    };
  }

  to(room: string): { emit: (event: string, ...args: unknown[]) => void } {
    return {
      emit: (event: string, ...args: unknown[]) => {
        this._server._rooms.get(room)?.forEach((id) => {
          this._server._sockets.get(id)?.emit(event, ...args);
        });
      },
    };
  }

  disconnect(): void {
    this._connected = false;
    this.emit("disconnect", "client namespace disconnect");
    this._server._sockets.delete(this.id);
  }
}

export class MockIoServer extends MockEventEmitter {
  _sockets: Map<string, MockSocket> = new Map();
  _rooms: Map<string, Set<string>> = new Map();
  _idCounter = 0;

  use(_fn: (socket: MockSocket, next: () => void) => void): this {
    // middleware — no-op en el mock (para simplificar)
    return this;
  }

  emit(event: string, ...args: unknown[]): boolean {
    this._sockets.forEach((s) => s.emit(event, ...args));
    return true;
  }

  to(room: string): { emit: (event: string, ...args: unknown[]) => void } {
    return {
      emit: (event: string, ...args: unknown[]) => {
        this._rooms.get(room)?.forEach((id) => {
          this._sockets.get(id)?.emit(event, ...args);
        });
      },
    };
  }

  /** Crea un socket conectado y dispara "connection" en el servidor. */
  _connect(): MockSocket {
    const id = `socket_${++this._idCounter}`;
    const socket = new MockSocket(id, this);
    this._sockets.set(id, socket);
    this.emit("connection", socket);
    return socket;
  }

  attach(_httpServer: unknown): this {
    return this;
  }
}

/**
 * Crea un par (serverSocket, clientSocket) donde:
 * - Los eventos emitidos desde clientSocket llegan al serverSocket
 * - Los eventos emitidos desde serverSocket (o desde el server) llegan al clientSocket
 *
 * Útil en tests para simular comunicación sin WebSockets reales.
 */
export function createTestPair(server: MockIoServer): {
  serverSocket: MockSocket;
  clientSocket: MockSocket;
} {
  const serverSocket = server._connect();
  // clientSocket es un emisor separado — cuando el server emite a serverSocket,
  // el clientSocket recibe; y viceversa.
  const clientSocket = new MockSocket(serverSocket.id + "_client", server);

  // Puente bidireccional
  const originalServerEmit = serverSocket.emit.bind(serverSocket);
  serverSocket.emit = (event: string, ...args: unknown[]): boolean => {
    originalServerEmit(event, ...args);
    clientSocket.emit(event, ...args);
    return true;
  };

  const originalClientEmit = clientSocket.emit.bind(clientSocket);
  clientSocket.emit = (event: string, ...args: unknown[]): boolean => {
    originalClientEmit(event, ...args);
    serverSocket.emit(event, ...args);
    return true;
  };

  return { serverSocket, clientSocket };
}

// ─── Módulo socket.io ────────────────────────────────────────────────────────

const socketIo = {
  Server: MockIoServer,
  createTestPair,
};

// Para `const { Server } = require("socket.io")`
// y para `const io = new Server(httpServer)`
export type MockSocketIo = typeof socketIo;
export const mockSocketIoModule = socketIo;
export default socketIo;
