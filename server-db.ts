import { MongoClient, Db } from 'mongodb';

export interface DbStatus {
  connected: boolean;
  state: 'connected' | 'connecting' | 'error' | 'disconnected';
  database: string;
  cluster: string;
  uriMasked: string;
  collections: { name: string; count: number }[];
  lastError: string | null;
  clientIp?: string;
  requiresNetworkAccess?: boolean;
}

const DEFAULT_URI = 'mongodb+srv://shreyakurhatti_db_user:ddwrUzuRmmd7pAlr@cluster0.qjfl17z.mongodb.net/plastisense?retryWrites=true&w=majority&appName=Cluster0';

function normalizeMongoUri(raw?: string): string {
  if (typeof raw === 'string' && (raw.startsWith('mongodb://') || raw.startsWith('mongodb+srv://'))) {
    return raw.trim();
  }
  return DEFAULT_URI;
}

function maskMongoUri(uri: string): string {
  try {
    return uri.replace(/:([^:@]+)@/, ':••••••••@');
  } catch {
    return 'mongodb+srv://••••••••@cluster0.qjfl17z.mongodb.net';
  }
}

export class MongoManager {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private state: 'connected' | 'connecting' | 'error' | 'disconnected' = 'disconnected';
  private lastError: string | null = null;
  private uri: string;
  private clientIp: string = '';
  private fallbackScans: any[] = [];

  constructor(uri?: string) {
    this.uri = normalizeMongoUri(uri || process.env.MONGODB_URI);
  }

  public getStatus(): DbStatus {
    const errLower = (this.lastError || '').toLowerCase();
    const isNetworkAccessError =
      !!this.lastError &&
      (errLower.includes('ssl alert') ||
        errLower.includes('network access') ||
        errLower.includes('tlsv1 alert') ||
        errLower.includes('mongoserverselectionerror') ||
        errLower.includes('etimedout') ||
        errLower.includes('econnrefused') ||
        errLower.includes('whitelist'));

    return {
      connected: this.state === 'connected',
      state: this.state,
      database: 'plastisense',
      cluster: 'cluster0.qjfl17z.mongodb.net',
      uriMasked: maskMongoUri(this.uri),
      collections: [],
      lastError: this.lastError,
      clientIp: this.clientIp,
      requiresNetworkAccess: isNetworkAccessError,
    };
  }

  public setFallbackScans(scans: any[]) {
    this.fallbackScans = scans;
  }

  public async setUri(newUri: string, initialPoints: any[], initialActivities: any[], initialScans: any[]) {
    this.uri = normalizeMongoUri(newUri);
    return this.init(initialPoints, initialActivities, initialScans);
  }

  public async init(initialPoints: any[], initialActivities: any[], initialScans: any[] = []) {
    this.state = 'connecting';
    this.lastError = null;

    if (initialScans && initialScans.length > 0 && this.fallbackScans.length === 0) {
      this.fallbackScans = initialScans;
    }

    // Fetch container external IP for user network whitelist guidance
    try {
      const ipRes = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(3000) });
      const ipData = (await ipRes.json()) as { ip?: string };
      if (ipData?.ip) this.clientIp = ipData.ip;
    } catch {
      // ignore
    }

    try {
      if (this.client) {
        try {
          await this.client.close();
        } catch {}
      }

      this.client = new MongoClient(this.uri, {
        serverSelectionTimeoutMS: 6000,
        connectTimeoutMS: 6000,
        tls: true,
      });

      await this.client.connect();
      this.db = this.client.db('plastisense');
      this.state = 'connected';
      this.lastError = null;
      console.log('✅ Connected to MongoDB Atlas cluster0.qjfl17z.mongodb.net (database: plastisense)');

      // Seed initial data if collections are empty or missing
      await this.seedInitialData(initialPoints, initialActivities, initialScans);
    } catch (err: any) {
      this.state = 'error';
      const msg = err.message || 'Failed to connect to MongoDB Atlas';

      if (msg.includes('SSL alert number 80') || msg.includes('tlsv1 alert internal error')) {
        this.lastError = `MongoDB Atlas rejected connection (SSL Alert 80). In MongoDB Atlas -> Network Access, add IP 0.0.0.0/0 (or ${this.clientIp || 'your IP'}) to allow incoming traffic.`;
      } else {
        this.lastError = msg;
      }

      console.warn('⚠️ MongoDB Atlas connection notice:', this.lastError);

      // Periodically attempt reconnect in background
      setTimeout(() => this.reconnect(initialPoints, initialActivities, initialScans), 30000);
    }
  }

  public async reconnect(initialPoints: any[], initialActivities: any[], initialScans: any[] = []) {
    if (this.state === 'connected') return;
    console.log('🔄 Retrying connection to MongoDB Atlas...');
    await this.init(initialPoints, initialActivities, initialScans);
  }

  private async seedInitialData(initialPoints: any[], initialActivities: any[], initialScans: any[]) {
    if (!this.db) return;
    try {
      const cpCol = this.db.collection('collectionPoints');
      const cpCount = await cpCol.countDocuments();
      if (cpCount === 0 && initialPoints.length > 0) {
        await cpCol.insertMany(initialPoints);
        console.log(`🌱 Seeded ${initialPoints.length} collection points into MongoDB`);
      }

      const actCol = this.db.collection('recyclingActivities');
      const actCount = await actCol.countDocuments();
      if (actCount === 0 && initialActivities.length > 0) {
        await actCol.insertMany(initialActivities);
        console.log(`🌱 Seeded ${initialActivities.length} activities into MongoDB`);
      }

      const scanCol = this.db.collection('scans');
      const scanCount = await scanCol.countDocuments();
      if (scanCount === 0 && initialScans.length > 0) {
        await scanCol.insertMany(initialScans);
        console.log(`🌱 Seeded ${initialScans.length} scans into MongoDB`);
      }

      // Ensure indexes
      await cpCol.createIndex({ id: 1 }, { unique: true });
      await actCol.createIndex({ id: 1 }, { unique: true });
      await scanCol.createIndex({ id: 1 }, { unique: true });
    } catch (e: any) {
      console.warn('MongoDB seeding note:', e.message);
    }
  }

  public getDb(): Db | null {
    return this.db;
  }

  // --- COLLECTION POINTS ---
  public async getCollectionPoints(fallback: any[]): Promise<any[]> {
    if (!this.db || this.state !== 'connected') return fallback;
    try {
      const points = await this.db.collection('collectionPoints').find({}).toArray();
      if (points.length > 0) {
        return points.map(({ _id, ...rest }) => rest);
      }
      return fallback;
    } catch (e) {
      console.warn('MongoDB getCollectionPoints fallback:', e);
      return fallback;
    }
  }

  public async saveCollectionPoint(point: any): Promise<boolean> {
    if (!this.db || this.state !== 'connected') return false;
    try {
      await this.db.collection('collectionPoints').updateOne(
        { id: point.id },
        { $set: point },
        { upsert: true }
      );
      return true;
    } catch (e) {
      console.warn('MongoDB saveCollectionPoint error:', e);
      return false;
    }
  }

  public async updateCollectionPointFill(id: string, fillLevelPercent: number, status?: string): Promise<boolean> {
    if (!this.db || this.state !== 'connected') return false;
    try {
      const updateData: any = { fillLevelPercent };
      if (status) updateData.status = status;
      await this.db.collection('collectionPoints').updateOne({ id }, { $set: updateData });
      return true;
    } catch (e) {
      console.warn('MongoDB updateCollectionPointFill error:', e);
      return false;
    }
  }

  // --- RECYCLING ACTIVITIES ---
  public async getActivities(fallback: any[]): Promise<any[]> {
    if (!this.db || this.state !== 'connected') return fallback;
    try {
      const acts = await this.db.collection('recyclingActivities').find({}).sort({ createdAt: -1 }).limit(100).toArray();
      if (acts.length > 0) {
        return acts.map(({ _id, ...rest }) => rest);
      }
      return fallback;
    } catch (e) {
      return fallback;
    }
  }

  public async saveActivity(activity: any): Promise<boolean> {
    if (!this.db || this.state !== 'connected') return false;
    try {
      await this.db.collection('recyclingActivities').insertOne(activity);
      return true;
    } catch (e) {
      console.warn('MongoDB saveActivity error:', e);
      return false;
    }
  }

  // --- SCANS ---
  public async saveScan(scan: any): Promise<boolean> {
    this.fallbackScans.unshift(scan);
    if (!this.db || this.state !== 'connected') return true;
    try {
      await this.db.collection('scans').updateOne(
        { id: scan.id },
        { $set: scan },
        { upsert: true }
      );
      return true;
    } catch (e) {
      console.warn('MongoDB saveScan error:', e);
      return false;
    }
  }

  public async getScans(): Promise<any[]> {
    if (!this.db || this.state !== 'connected') return this.fallbackScans;
    try {
      const scans = await this.db.collection('scans').find({}).sort({ timestamp: -1 }).limit(100).toArray();
      if (scans.length > 0) {
        return scans.map(({ _id, ...rest }) => rest);
      }
      return this.fallbackScans;
    } catch (e) {
      return this.fallbackScans;
    }
  }

  public async getStats(): Promise<DbStatus> {
    const status = this.getStatus();
    if (this.db && this.state === 'connected') {
      try {
        const collections = await this.db.listCollections().toArray();
        const details = await Promise.all(
          collections.map(async (c) => {
            const count = await this.db!.collection(c.name).countDocuments();
            return { name: c.name, count };
          })
        );
        status.collections = details;
      } catch {
        // ignore
      }
    } else {
      status.collections = [
        { name: 'collectionPoints (local cache)', count: 5 },
        { name: 'recyclingActivities (local cache)', count: 1 },
        { name: 'scans (local cache)', count: this.fallbackScans.length },
      ];
    }
    return status;
  }
}

