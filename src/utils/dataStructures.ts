/**
 * ClimaIQ Real-World Data Structures Implementation
 * 
 * 1. Queue<T> (FIFO - First-In, First-Out):
 *    Used for processing asynchronous weather anomaly events, alert notifications,
 *    and telemetry sensor updates in strict sequential order.
 * 
 * 2. Stack<T> (LIFO - Last-In, First-Out):
 *    Used for navigation history tracking, deep view routing, modal layering,
 *    and state undo/back-navigation.
 */

// ==========================================
// 1. GENERIC FIFO QUEUE DATA STRUCTURE
// ==========================================

export class Queue<T> {
  private items: T[];
  private maxSize: number;

  constructor(initialItems: T[] = [], maxSize: number = 100) {
    this.items = [...initialItems];
    this.maxSize = maxSize;
  }

  /**
   * Add an item to the back of the queue (FIFO)
   */
  public enqueue(item: T): void {
    if (this.items.length >= this.maxSize) {
      // Evict oldest item if queue exceeds capacity
      this.items.shift();
    }
    this.items.push(item);
  }

  /**
   * Remove and return the front item from the queue
   */
  public dequeue(): T | undefined {
    return this.items.shift();
  }

  /**
   * View the front item without removing it
   */
  public peek(): T | undefined {
    return this.items[0];
  }

  /**
   * Check if queue is empty
   */
  public isEmpty(): boolean {
    return this.items.length === 0;
  }

  /**
   * Get total number of items currently in the queue
   */
  public size(): number {
    return this.items.length;
  }

  /**
   * Return a shallow copy of items as an array
   */
  public toArray(): T[] {
    return [...this.items];
  }

  /**
   * Remove all items from the queue
   */
  public clear(): void {
    this.items = [];
  }

  /**
   * Filter in-place
   */
  public removeWhere(predicate: (item: T) => boolean): void {
    this.items = this.items.filter((item) => !predicate(item));
  }
}

// ==========================================
// 2. GENERIC LIFO STACK DATA STRUCTURE
// ==========================================

export class Stack<T> {
  private items: T[];
  private maxSize: number;

  constructor(initialItems: T[] = [], maxSize: number = 50) {
    this.items = [...initialItems];
    this.maxSize = maxSize;
  }

  /**
   * Push an item onto the top of the stack (LIFO)
   */
  public push(item: T): void {
    if (this.items.length >= this.maxSize) {
      // Remove oldest base item if max depth exceeded
      this.items.shift();
    }
    this.items.push(item);
  }

  /**
   * Pop and return the top item from the stack
   */
  public pop(): T | undefined {
    return this.items.pop();
  }

  /**
   * View top item without removing it
   */
  public peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  /**
   * View item at depth relative to top (0 = top, 1 = one below top)
   */
  public peekDepth(depth: number): T | undefined {
    const index = this.items.length - 1 - depth;
    if (index >= 0 && index < this.items.length) {
      return this.items[index];
    }
    return undefined;
  }

  /**
   * Check if stack is empty
   */
  public isEmpty(): boolean {
    return this.items.length === 0;
  }

  /**
   * Get total number of items on the stack
   */
  public size(): number {
    return this.items.length;
  }

  /**
   * Return items as array from bottom to top
   */
  public toArray(): T[] {
    return [...this.items];
  }

  /**
   * Return items as array from top to bottom (most recent first)
   */
  public toRecentArray(): T[] {
    return [...this.items].reverse();
  }

  /**
   * Clear stack
   */
  public clear(): void {
    this.items = [];
  }
}

// ==========================================
// 3. SPECIALIZED NAVIGATION HISTORY STACK
// ==========================================

export interface NavigationState {
  tab: 'home' | 'insights' | 'travel' | 'ai' | 'settings';
  label: string;
  activePersona?: string;
  openedModal?: 'location' | 'persona' | 'alerts' | 'sharing' | 'environmental' | null;
  environmentalMetric?: string | null;
  timestamp: number;
}

export class NavigationHistoryStack {
  private stack: Stack<NavigationState>;

  constructor(initialState?: NavigationState) {
    const base: NavigationState = initialState || {
      tab: 'home',
      label: 'Home',
      timestamp: Date.now(),
    };
    this.stack = new Stack<NavigationState>([base], 40);
  }

  public navigateTo(newState: NavigationState): void {
    const current = this.stack.peek();
    // Prevent duplicate adjacent entries
    if (
      current &&
      current.tab === newState.tab &&
      current.openedModal === newState.openedModal &&
      current.environmentalMetric === newState.environmentalMetric
    ) {
      return;
    }
    this.stack.push(newState);
  }

  public goBack(): NavigationState | undefined {
    if (this.stack.size() <= 1) {
      return undefined; // At root of navigation
    }
    this.stack.pop(); // Remove current state
    return this.stack.peek(); // Return previous state
  }

  public canGoBack(): boolean {
    return this.stack.size() > 1;
  }

  public current(): NavigationState | undefined {
    return this.stack.peek();
  }

  public previous(): NavigationState | undefined {
    return this.stack.peekDepth(1);
  }

  public getHistory(): NavigationState[] {
    return this.stack.toRecentArray();
  }

  public size(): number {
    return this.stack.size();
  }

  public clear(): void {
    const root: NavigationState = {
      tab: 'home',
      label: 'Home',
      timestamp: Date.now(),
    };
    this.stack = new Stack<NavigationState>([root], 40);
  }
}

// ==========================================
// 4. SPECIALIZED WEATHER ALERT EVENT QUEUE
// ==========================================

export interface AlertEvent {
  id: string;
  type: 'incoming_alert' | 'telemetry_anomaly' | 'safety_advisory' | 'threshold_breach';
  title: string;
  category: string;
  severity: 'info' | 'moderate' | 'severe' | 'caution';
  message: string;
  timestamp: number;
  processed: boolean;
}

export class AlertEventQueue {
  private queue: Queue<AlertEvent>;
  private processedHistory: AlertEvent[] = [];

  constructor() {
    this.queue = new Queue<AlertEvent>([], 50);
  }

  public enqueueEvent(event: Omit<AlertEvent, 'timestamp' | 'processed'>): void {
    const fullEvent: AlertEvent = {
      ...event,
      timestamp: Date.now(),
      processed: false,
    };
    this.queue.enqueue(fullEvent);
  }

  public processNextEvent(): AlertEvent | undefined {
    const event = this.queue.dequeue();
    if (event) {
      event.processed = true;
      this.processedHistory.unshift(event);
      if (this.processedHistory.length > 30) {
        this.processedHistory.pop();
      }
    }
    return event;
  }

  public peekNext(): AlertEvent | undefined {
    return this.queue.peek();
  }

  public getPendingEvents(): AlertEvent[] {
    return this.queue.toArray();
  }

  public getPendingCount(): number {
    return this.queue.size();
  }

  public getProcessedHistory(): AlertEvent[] {
    return [...this.processedHistory];
  }

  public clear(): void {
    this.queue.clear();
    this.processedHistory = [];
  }
}
