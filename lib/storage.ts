// localStorage-based content storage for generated content

export interface GeneratedContent {
  id: string;
  url: string;
  caption: string;
  platform: string;
  timestamp: number;
  eventType?: string;
  model?: string;
  brandName?: string;
  aspectRatio?: string;
  status?: 'pending' | 'posted' | 'failed';
}

const STORAGE_KEY = 'moment-machine-content';

// Generate a unique ID
function generateId(): string {
  return `mm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Get all stored content
export function getStoredContent(): GeneratedContent[] {
  if (typeof window === 'undefined') {
    return [];
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const content = JSON.parse(stored);
    // Sort by timestamp, newest first
    return content.sort((a: GeneratedContent, b: GeneratedContent) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
}

// Save a single piece of content
export function saveContent(content: Omit<GeneratedContent, 'id' | 'timestamp'>): GeneratedContent {
  const newContent: GeneratedContent = {
    ...content,
    id: generateId(),
    timestamp: Date.now(),
  };
  
  const existing = getStoredContent();
  existing.unshift(newContent); // Add to beginning
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    // If storage is full, try removing old items
    if (existing.length > 100) {
      const trimmed = existing.slice(0, 100);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    }
  }
  
  return newContent;
}

// Save multiple pieces of content at once
export function saveContentBatch(contents: Omit<GeneratedContent, 'id' | 'timestamp'>[]): GeneratedContent[] {
  const timestamp = Date.now();
  const newContents: GeneratedContent[] = contents.map((content, index) => ({
    ...content,
    id: generateId() + `-${index}`,
    timestamp: timestamp - index, // Slight offset so they sort correctly
  }));
  
  const existing = getStoredContent();
  const combined = [...newContents, ...existing];
  
  try {
    // Keep only last 500 items to prevent localStorage overflow
    const trimmed = combined.slice(0, 500);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Error saving batch to localStorage:', error);
  }
  
  return newContents;
}

// Delete a single piece of content
export function deleteContent(id: string): boolean {
  const existing = getStoredContent();
  const filtered = existing.filter(c => c.id !== id);
  
  if (filtered.length === existing.length) {
    return false; // Nothing was deleted
  }
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting from localStorage:', error);
    return false;
  }
}

// Update content status
export function updateContentStatus(id: string, status: GeneratedContent['status']): boolean {
  const existing = getStoredContent();
  const index = existing.findIndex(c => c.id === id);
  
  if (index === -1) {
    return false;
  }
  
  existing[index].status = status;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    return true;
  } catch (error) {
    console.error('Error updating localStorage:', error);
    return false;
  }
}

// Clear all stored content
export function clearAllContent(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}

// Get content count
export function getContentCount(): number {
  return getStoredContent().length;
}

// Get content by event type
export function getContentByEventType(eventType: string): GeneratedContent[] {
  return getStoredContent().filter(c => c.eventType === eventType);
}

// Get content by platform
export function getContentByPlatform(platform: string): GeneratedContent[] {
  return getStoredContent().filter(c => c.platform === platform);
}

// Export content as JSON for download
export function exportContent(): string {
  const content = getStoredContent();
  return JSON.stringify(content, null, 2);
}

// Import content from JSON
export function importContent(jsonString: string): boolean {
  try {
    const content = JSON.parse(jsonString);
    if (!Array.isArray(content)) {
      throw new Error('Invalid content format');
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
    return true;
  } catch (error) {
    console.error('Error importing content:', error);
    return false;
  }
}

// Check storage usage
export function getStorageStats(): { count: number; sizeKB: number; percentUsed: number } {
  const content = getStoredContent();
  const stored = localStorage.getItem(STORAGE_KEY) || '';
  const sizeBytes = new Blob([stored]).size;
  const sizeKB = Math.round(sizeBytes / 1024);
  
  // localStorage is typically 5-10MB
  const maxSizeKB = 5000;
  const percentUsed = Math.round((sizeKB / maxSizeKB) * 100);
  
  return {
    count: content.length,
    sizeKB,
    percentUsed
  };
}
