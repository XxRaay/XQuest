import net from 'net';

export class DiscordRpcClient {
  private socket: net.Socket | null = null;
  private isConnected = false;
  private clientId: string | null = null;

  connect(clientId: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.disconnect();
      this.clientId = clientId;

      // Try pipes from 0 to 9
      const tryPipe = (pipeNum: number) => {
        if (pipeNum > 9) {
          this.isConnected = false;
          resolve(false);
          return;
        }

        const pipePath = `\\\\.\\pipe\\discord-ipc-${pipeNum}`;
        const sock = net.createConnection(pipePath, () => {
          this.socket = sock;
          this.isConnected = true;
          this.sendHandshake(clientId);
          resolve(true);
        });

        sock.on('error', () => {
          sock.destroy();
          tryPipe(pipeNum + 1);
        });

        sock.on('close', () => {
          this.isConnected = false;
        });
      };

      tryPipe(0);
    });
  }

  private sendHandshake(clientId: string): void {
    if (!this.socket || !this.isConnected) return;
    const payload = JSON.stringify({ v: 1, client_id: clientId });
    this.send(0, payload);
  }

  setActivity(params: {
    pid: number;
    state?: string;
    details?: string;
    startTimestamp?: number;
    largeImageKey?: string;
    largeImageText?: string;
  }): void {
    if (!this.socket || !this.isConnected) return;

    const activity: Record<string, unknown> = {};
    if (params.state) activity.state = params.state;
    if (params.details) activity.details = params.details;
    if (params.startTimestamp) {
      activity.timestamps = { start: Math.floor(params.startTimestamp / 1000) };
    }
    if (params.largeImageKey) {
      activity.assets = {
        large_image: params.largeImageKey,
        large_text: params.largeImageText || 'XQuest Orb Emulator',
      };
    }

    const payload = JSON.stringify({
      cmd: 'SET_ACTIVITY',
      args: {
        pid: params.pid,
        activity,
      },
      nonce: `${Date.now()}-${Math.random()}`,
    });

    this.send(1, payload);
  }

  clearActivity(pid: number): void {
    if (!this.socket || !this.isConnected) return;
    const payload = JSON.stringify({
      cmd: 'SET_ACTIVITY',
      args: { pid, activity: null },
      nonce: `${Date.now()}`,
    });
    this.send(1, payload);
  }

  private send(opcode: number, jsonPayload: string): void {
    if (!this.socket) return;
    const payloadBuffer = Buffer.from(jsonPayload, 'utf8');
    const headerBuffer = Buffer.alloc(8);
    headerBuffer.writeInt32LE(opcode, 0);
    headerBuffer.writeInt32LE(payloadBuffer.length, 4);

    try {
      this.socket.write(Buffer.concat([headerBuffer, payloadBuffer]));
    } catch (err) {
      console.error('[Discord RPC] Write error:', err);
    }
  }

  disconnect(): void {
    if (this.socket) {
      try {
        this.socket.destroy();
      } catch {}
      this.socket = null;
    }
    this.isConnected = false;
  }

  get connected(): boolean {
    return this.isConnected;
  }
}

export const discordRpc = new DiscordRpcClient();
