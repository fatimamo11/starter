export class Stack<T> {
  private items: T[] = [];
  push(element: T): void { this.items.push(element); }
  pop(): T | undefined { return this.items.pop(); }
  peek(): T | undefined { return this.items[this.items.length - 1]; }
  isEmpty(): boolean { return this.items.length === 0; }
  size(): number { return this.items.length; }
}

export class Queue<T> {
  private items: T[] = [];
  enqueue(element: T): void { this.items.push(element); }
  dequeue(): T | undefined { return this.items.shift(); }
  peek(): T | undefined { return this.items[0]; }
  isEmpty(): boolean { return this.items.length === 0; }
  size(): number { return this.items.length; }
  toArray(): T[] { return [...this.items]; }
}

export class HashTable<T extends { id: string | number }> {
  private table: { [key: string]: T } = {};
  
  constructor(items?: T[]) {
    if (items) {
      items.forEach(item => this.put(item.id, item));
    }
  }

  put(key: string | number, value: T): void { this.table[key.toString()] = value; }
  get(id: string | number): T | undefined { return this.table[id.toString()]; }
  has(id: string | number): boolean { return !!this.table[id.toString()]; }
  getAll(): T[] { return Object.values(this.table); }
}

export class HashSet {
  private set: { [key: string]: boolean } = {};
  
  constructor(initialIds?: string[]) {
    if (initialIds) {
      initialIds.forEach(id => this.add(id));
    }
  }

  add(id: string | number): void { this.set[id.toString()] = true; }
  remove(id: string | number): void { delete this.set[id.toString()]; }
  has(id: string | number): boolean { return !!this.set[id.toString()]; }
  toArray(): string[] { return Object.keys(this.set); }
}

export interface Post {
  id: string;
  author: string;
  avatar?: string;
  content: string;
  category: 'announcement' | 'event' | 'community' | 'resource';
  createdAt?: string;
  timestamp?: string;
  likes: number;
  liked?: boolean;
  isLiked?: boolean;
}

export interface Opportunity {
  id: string;
  title: string;
  company: string;
  type: string;
  workMode?: string;
  location?: string;
  description?: string;
  skills?: string[];
  applied?: boolean;
}