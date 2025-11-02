import { connect, StringCodec } from "nats";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

class NatsWrapper {
  _client = null;
  _js = null;
  _jsm = null;
  _connected = false;
  _sc = StringCodec();

  async connect(serviceName) {
    // If already connected, return the existing client
    if (this._client) return this._client;

    this._client = await connect({
      servers: env.NATS_URL,
      name: serviceName,
      reconnect: true,
      maxReconnectAttempts: -1, // infinite retries
      reconnectTimeWait: 2000, // 2 seconds
    });

    this._connected = true;

    this._js = this._client.jetstream();
    this._jsm = await this._client.jetstreamManager();

    logger.info("[NATS] Connected:", this._client.getServer());

    this._client
      .closed()
      .then(() => logger.warn("[NATS] Connection closed"))
      .catch((err) => logger.error("[NATS] Connection error", err));

    return this._client;
  }

  /*
   * Helper methods
   */

  // Getter to access the NATS client
  get client() {
    if (!this._client) throw new Error("[NATS] Client not connected!");
    return this._client;
  }

  // Getter to access JetStream
  get js() {
    if (!this._js) throw new Error("JetStream not initialized!");
    return this._js;
  }

  // Getter to access JetStreamManager
  get jsm() {
    if (!this._jsm) throw new Error("JetStreamManager not initialized!");
    return this._jsm;
  }

  // stringify -> encode -> buffer
  encode(data) {
    return this._sc.encode(JSON.stringify(data));
  }

  // decode -> JSON.parse -> object
  decode(buf) {
    return JSON.parse(this._sc.decode(buf));
  }

  // Publish data to a subject
  async publish(subject, data) {
    await this.js.publish(subject, this.encode(data));
    logger.info(`NATS publish ${subject}`, data);
  }

  // Subscribe to a JetStream subject with a durable consumer
  async subscribeJetStream({ stream, consumer, filter, deliver }) {
    // ensure consumer exists
    try {
      await this.jsm.consumers.info(stream, consumer);
    } catch {
      logger.info(`[NATS] Creating durable consumer: ${consumer}`);
      await this.jsm.consumers.add(stream, {
        durable_name: consumer,
        filter_subject: filter,
        deliver_subject: deliver,
        ack_policy: "explicit",
      });
    }

    const sub = this.client.subscribe(deliver);

    logger.info(`[NATS] Listening ${filter} | consumer=${consumer}`);

    (async () => {
      for await (const msg of sub) {
        const data = natsWrapper.decode(msg.data);
        logger.info("[SSO RECEIVED] user.created", data);
        msg.respond(); // ack
      }
    })();

    // return sub;
  }

  // Simple subscribe to a subject (without JetStream)
  subscribe(subject, handler) {
    const sub = this.client.subscribe(subject);
    (async () => {
      for await (const msg of sub) {
        const data = this.decode(msg.data);
        handler(data, msg);
      }
    })();
    logger.info(`[NATS] Subscribed ${subject}`);
  }
}

export const natsWrapper = new NatsWrapper();
