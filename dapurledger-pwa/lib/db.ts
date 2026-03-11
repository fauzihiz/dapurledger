import Dexie, { type EntityTable } from 'dexie';

export interface Ingredient {
  id?: number;
  name: string;
  brand: string;
  unit: 'gram' | 'ml' | 'pcs';
  currentStock: number;
  minStock: number;
  averagePricePerUnit: number; // calculated from purchases
}

export interface IngredientPurchase {
  id?: number;
  ingredientId: number;
  purchaseDate: Date;
  brand: string;
  unitSize: string; // e.g., "1kg"
  quantityPurchased: number; // numeric value of units purchased (e.g., 2 if buying two 1kg packs)
  totalWeight: number; // quantity * numeric(unitSize) in base units (grams/ml/pcs)
  unitPrice: number;
  totalPrice: number;
  pricePerBaseUnit: number; // total_price / totalWeight
}

export interface Product {
  id?: number;
  name: string;
  description: string;
  currentStock: number; // For finished goods
  distributorPrice: number;
  resellerPrice: number;
  customerPrice: number;
}

export interface RecipeItem {
  id?: number;
  productId: number;
  ingredientId: number;
  estimatedQty: number; // in base unit (gram/ml/pcs)
}

export interface Batch {
  id?: number;
  batchDate: Date;
  productId: number;
  totalPiecesProduced: number;
  totalIngredientCost: number;
  hpp: number;
  ingredients: {
    ingredientId: number;
    weightBefore: number;
    weightAfter: number;
    qtyUsed: number;
    cost: number;
  }[];
}

export interface SalesRecord {
  id?: number;
  date: Date;
  productId: number;
  quantity: number;
  priceEach: number;
  totalRevenue: number;
  type: 'distributor' | 'reseller' | 'customer';
  estimatedProfit: number;
}

export interface InternalConsumption {
  id?: number;
  date: Date;
  productId: number;
  quantity: number;
  note: string;
}

export interface Cashflow {
  id?: number;
  date: Date;
  type: 'in' | 'out';
  amount: number;
  category: 'sale' | 'purchase' | 'expense' | 'other';
  note: string;
}

const db = new Dexie('DapurLedgerDB') as Dexie & {
  ingredients: EntityTable<Ingredient, 'id'>;
  purchases: EntityTable<IngredientPurchase, 'id'>;
  products: EntityTable<Product, 'id'>;
  recipes: EntityTable<RecipeItem, 'id'>;
  batches: EntityTable<Batch, 'id'>;
  sales: EntityTable<SalesRecord, 'id'>;
  consumption: EntityTable<InternalConsumption, 'id'>;
  cashflow: EntityTable<Cashflow, 'id'>;
};

db.version(1).stores({
  ingredients: '++id, name, brand',
  purchases: '++id, ingredientId, purchaseDate',
  products: '++id, name',
  recipes: '++id, productId, ingredientId',
  batches: '++id, batchDate, productId',
  sales: '++id, date, productId, type',
  consumption: '++id, date, productId',
  cashflow: '++id, date, type, category',
});

export { db };
