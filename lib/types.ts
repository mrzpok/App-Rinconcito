// PMS Core Types
export type UserRole = string;

export interface User {
  id: string;
  email: string;
  name: string;
  password?: string;
  role: UserRole;
  hotelId: string;
  active: boolean;
  createdAt: Date;
}

export type RolePermission = {
  id: string;
  name: string;
  canManageRooms: boolean;
  canManageInventory: boolean;
  canManageHousekeeping: boolean;
  canManageUsers: boolean;
  canViewDashboard: boolean;
  createdAt: Date;
};

export interface Hotel {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  totalRooms: number;
  createdAt: Date;
}

export type RoomStatus = 'available' | 'occupied' | 'maintenance' | 'blocked' | 'cleaning';
export type RoomType = 'single' | 'double' | 'suite' | 'deluxe' | 'presidential';

export interface Room {
  id: string;
  hotelId: string;
  roomNumber: string;
  type: RoomType;
  status: RoomStatus;
  floor: number;
  maxOccupancy: number;
  price: number;
  notes?: string;
  lastCleaned?: Date;
  createdAt: Date;
}

export type ReservationStatus = 'pending' | 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';

export interface Reservation {
  id: string;
  hotelId: string;
  roomId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkInDate: Date;
  checkOutDate: Date;
  status: ReservationStatus;
  totalPrice: number;
  numberOfGuests: number;
  source: 'direct' | 'booking' | 'airbnb' | 'expedia' | 'other';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type HousekeepingTaskStatus = 'pending' | 'in-progress' | 'completed' | 'blocked';

export interface HousekeepingTask {
  id: string;
  hotelId: string;
  roomId: string;
  assignedTo: string;
  status: HousekeepingTaskStatus;
  taskType: 'checkout-cleaning' | 'maintenance' | 'deep-clean' | 'turnover';
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  createdAt: Date;
  completedAt?: Date;
  completedBy?: string;
  photoUrl?: string;
}

export interface HousekeepingCompletion {
  id: string;
  taskId: string;
  roomId: string;
  completedBy: string;
  completedAt: Date;
}

export interface InventoryItem {
  id: string;
  hotelId: string;
  name: string;
  category: 'supplies' | 'amenities' | 'equipment' | 'linens' | string;
  categoryId?: string;
  quantity: number;
  minimumLevel: number;
  unit: string;
  supplier?: string;
  brand?: string;
  serialInternal?: string;
  serial?: string;
  lastRestocked?: Date;
  createdAt: Date;
  location: string;
  locationId?: string;
}

export interface InventoryCategory {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
}

export interface InventoryLocation {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
}

export interface InventoryMovement {
  id: string;
  itemId: string;
  userId: string;
  change: number;
  reason: 'use' | 'add' | 'move' | 'physical-count';
  locationFrom?: string;
  locationTo?: string;
  createdAt: Date;
}

export type ComplianceType = 'tra-mincit' | 'sire' | 'tax' | 'safety' | 'labor';

export interface ComplianceRecord {
  id: string;
  hotelId: string;
  type: ComplianceType;
  status: 'pending' | 'completed' | 'flagged';
  dueDate: Date;
  notes?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface OTAIntegration {
  id: string;
  hotelId: string;
  platform: 'booking' | 'expedia' | 'airbnb';
  status: 'connected' | 'disconnected' | 'error';
  propertyId: string;
  apiKey: string;
  lastSyncDate?: Date;
  errorMessage?: string;
  createdAt: Date;
}

export interface OTAReservation {
  id: string;
  hotelId: string;
  otaId: string; // ID en la plataforma OTA
  platform: 'booking' | 'expedia' | 'airbnb';
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkInDate: Date;
  checkOutDate: Date;
  roomType: string;
  totalPrice: number;
  numberOfGuests: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  otaData: Record<string, any>; // Datos adicionales de la OTA
  importedAt: Date;
  syncedToLocalAt?: Date;
}

export interface SyncLog {
  id: string;
  hotelId: string;
  platform: 'booking' | 'expedia' | 'airbnb';
  type: 'availability' | 'reservation' | 'cancellation' | 'update';
  status: 'success' | 'failed';
  message: string;
  timestamp: Date;
}
