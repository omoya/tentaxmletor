import type { ConversionResult } from "@shared/schema";

export interface IStorage {
  storeConversionResult(result: ConversionResult): Promise<string>;
  getConversionResult(id: string): Promise<ConversionResult | undefined>;
}

export class MemStorage implements IStorage {
  private conversions: Map<string, ConversionResult>;

  constructor() {
    this.conversions = new Map();
  }

  async storeConversionResult(result: ConversionResult): Promise<string> {
    const id = Math.random().toString(36).substring(7);
    this.conversions.set(id, result);
    return id;
  }

  async getConversionResult(id: string): Promise<ConversionResult | undefined> {
    return this.conversions.get(id);
  }
}

export const storage = new MemStorage();
