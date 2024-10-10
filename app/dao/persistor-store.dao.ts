export class PersistoreStore {
  private drafts: Map<string, string> = new Map();
  private clearOnClient: boolean = false;
  private static instance: PersistoreStore | null = null;

  static getInstance() {
    if (this.instance) return this.instance;
    return new PersistoreStore();
  }

  setItem(key: string, value: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        typeof window !== undefined && !!window && window.localStorage;
      } catch (err) {
        this.drafts.set(key, value);
        resolve();
      }
      try {
        if (this.clearOnClient) {
          localStorage.clear();
          this.clearOnClient = false;
        }
        for (let [key, value] of this.drafts.entries()) {
          localStorage.setItem(key, value);
        }
        this.drafts.clear();
        localStorage.setItem(key, value);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  getItem(key: string) {
    try {
      typeof window !== undefined && !!window && window.localStorage;
    } catch (err) {
      return Promise.resolve(this.drafts.get(key));
    }
    if (this.clearOnClient) {
      localStorage.clear();
      this.clearOnClient = false;
      return Promise.resolve(null);
    }
    return Promise.resolve(localStorage.getItem(key));
  }

  removeItem(key: string) {
    try {
      typeof window !== undefined && !!window && window.localStorage;
    } catch (err) {
      this.drafts.delete(key);
      return;
    }
    if (this.clearOnClient) {
      localStorage.clear();
      this.clearOnClient = false;
      return;
    }
    localStorage.removeItem(key);
  }

  clear() {
    try {
      typeof window !== undefined && !!window && window.localStorage;
    } catch (err) {
      this.drafts.clear();
      this.clearOnClient = true;
      return;
    }
    localStorage.clear();
  }
}
