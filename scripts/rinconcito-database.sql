-- ==========================================
-- RINCONCITO PMS - SCHEMA DE BASE DE DATOS
-- ==========================================
-- Para importar en phpMyAdmin:
-- 1. Abre phpMyAdmin
-- 2. Selecciona la BD: stock_workflow
-- 3. Importa este archivo

SET FOREIGN_KEY_CHECKS=0;

-- ==========================================
-- TABLA: HOTELES
-- ==========================================
CREATE TABLE IF NOT EXISTS hotels (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID del hotel',
  name VARCHAR(255) NOT NULL COMMENT 'Nombre del hotel',
  address TEXT NOT NULL COMMENT 'Dirección completa',
  city VARCHAR(100) NOT NULL COMMENT 'Ciudad',
  country VARCHAR(100) NOT NULL DEFAULT 'Colombia' COMMENT 'País',
  phone VARCHAR(20) COMMENT 'Teléfono principal',
  email VARCHAR(255) COMMENT 'Email del hotel',
  total_rooms INT NOT NULL DEFAULT 0 COMMENT 'Total de habitaciones',
  currency VARCHAR(3) DEFAULT 'COP' COMMENT 'Moneda (COP, USD, etc)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_city (city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Información principal de hoteles';

-- ==========================================
-- TABLA: USUARIOS
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID del usuario',
  email VARCHAR(255) NOT NULL UNIQUE COMMENT 'Email único del usuario',
  name VARCHAR(255) NOT NULL COMMENT 'Nombre completo',
  role VARCHAR(50) NOT NULL COMMENT 'Rol: admin, manager, staff, housekeeping, front_desk',
  hotel_id VARCHAR(36) NOT NULL COMMENT 'Referencia al hotel',
  password_hash VARCHAR(255) NOT NULL COMMENT 'Hash de contraseña (bcrypt)',
  active BOOLEAN DEFAULT true COMMENT 'Usuario activo/inactivo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
  INDEX idx_email (email),
  INDEX idx_hotel_id (hotel_id),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Usuarios del sistema PMS';

-- ==========================================
-- TABLA: HABITACIONES
-- ==========================================
CREATE TABLE IF NOT EXISTS rooms (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID de la habitación',
  hotel_id VARCHAR(36) NOT NULL COMMENT 'Referencia al hotel',
  room_number VARCHAR(50) NOT NULL COMMENT 'Número/código de habitación',
  type VARCHAR(50) NOT NULL COMMENT 'Tipo: single, double, suite, deluxe, presidential',
  status VARCHAR(50) DEFAULT 'available' COMMENT 'Estado: available, occupied, maintenance, blocked, cleaning',
  floor INT NOT NULL COMMENT 'Número de piso',
  max_occupancy INT NOT NULL COMMENT 'Máximo de huéspedes',
  price DECIMAL(10, 2) NOT NULL COMMENT 'Precio por noche (COP o USD)',
  notes LONGTEXT COMMENT 'Notas adicionales',
  last_cleaned TIMESTAMP NULL COMMENT 'Última vez limpiada',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
  UNIQUE KEY unique_room_per_hotel (hotel_id, room_number),
  INDEX idx_hotel_id (hotel_id),
  INDEX idx_status (status),
  INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Inventario de habitaciones';

-- ==========================================
-- TABLA: RESERVAS
-- ==========================================
CREATE TABLE IF NOT EXISTS reservations (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID de la reserva',
  hotel_id VARCHAR(36) NOT NULL COMMENT 'Referencia al hotel',
  room_id VARCHAR(36) NOT NULL COMMENT 'Referencia a la habitación',
  guest_name VARCHAR(255) NOT NULL COMMENT 'Nombre del huésped',
  guest_email VARCHAR(255) COMMENT 'Email del huésped',
  guest_phone VARCHAR(20) COMMENT 'Teléfono del huésped',
  check_in_date DATE NOT NULL COMMENT 'Fecha de entrada',
  check_out_date DATE NOT NULL COMMENT 'Fecha de salida',
  status VARCHAR(50) DEFAULT 'pending' COMMENT 'Estado: pending, confirmed, checked-in, checked-out, cancelled',
  total_price DECIMAL(10, 2) NOT NULL COMMENT 'Precio total de la estadía',
  number_of_guests INT NOT NULL COMMENT 'Cantidad de huéspedes',
  source VARCHAR(50) DEFAULT 'direct' COMMENT 'Fuente: direct, booking, airbnb, expedia, other',
  notes LONGTEXT COMMENT 'Notas de la reserva',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  INDEX idx_hotel_id (hotel_id),
  INDEX idx_room_id (room_id),
  INDEX idx_check_in (check_in_date),
  INDEX idx_check_out (check_out_date),
  INDEX idx_status (status),
  INDEX idx_source (source),
  INDEX idx_guest_email (guest_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Reservas de huéspedes';

-- ==========================================
-- TABLA: TAREAS DE LIMPIEZA
-- ==========================================
CREATE TABLE IF NOT EXISTS housekeeping_tasks (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID de la tarea',
  hotel_id VARCHAR(36) NOT NULL COMMENT 'Referencia al hotel',
  room_id VARCHAR(36) NOT NULL COMMENT 'Referencia a la habitación',
  assigned_to VARCHAR(36) COMMENT 'Usuario asignado (UUID)',
  status VARCHAR(50) DEFAULT 'pending' COMMENT 'Estado: pending, in-progress, completed, blocked',
  task_type VARCHAR(100) NOT NULL COMMENT 'Tipo: checkout-cleaning, maintenance, deep-clean, turnover',
  priority VARCHAR(50) DEFAULT 'medium' COMMENT 'Prioridad: low, medium, high',
  notes LONGTEXT COMMENT 'Notas de la tarea',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL COMMENT 'Fecha de finalización',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  INDEX idx_hotel_id (hotel_id),
  INDEX idx_room_id (room_id),
  INDEX idx_assigned_to (assigned_to),
  INDEX idx_status (status),
  INDEX idx_priority (priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tareas de housekeeping';

-- ==========================================
-- TABLA: INVENTARIO
-- ==========================================
CREATE TABLE IF NOT EXISTS inventory (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID del item',
  hotel_id VARCHAR(36) NOT NULL COMMENT 'Referencia al hotel',
  name VARCHAR(255) NOT NULL COMMENT 'Nombre del producto',
  category VARCHAR(100) NOT NULL COMMENT 'Categoría: supplies, amenities, equipment, linens',
  quantity INT NOT NULL DEFAULT 0 COMMENT 'Cantidad disponible',
  minimum_level INT NOT NULL COMMENT 'Nivel mínimo antes de alerta',
  unit VARCHAR(50) NOT NULL COMMENT 'Unidad (unidades, cajas, kg, etc)',
  supplier VARCHAR(255) COMMENT 'Proveedor',
  last_restocked TIMESTAMP NULL COMMENT 'Última reposición',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
  INDEX idx_hotel_id (hotel_id),
  INDEX idx_category (category),
  INDEX idx_quantity (quantity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Inventario de suministros';

-- ==========================================
-- TABLA: REGISTROS DE CUMPLIMIENTO
-- ==========================================
CREATE TABLE IF NOT EXISTS compliance_records (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID del registro',
  hotel_id VARCHAR(36) NOT NULL COMMENT 'Referencia al hotel',
  type VARCHAR(100) NOT NULL COMMENT 'Tipo: tra-mincit, sire, tax, safety, labor',
  status VARCHAR(50) DEFAULT 'pending' COMMENT 'Estado: pending, completed, flagged',
  due_date DATE NOT NULL COMMENT 'Fecha de vencimiento',
  notes LONGTEXT COMMENT 'Notas',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL COMMENT 'Fecha de completación',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
  INDEX idx_hotel_id (hotel_id),
  INDEX idx_type (type),
  INDEX idx_status (status),
  INDEX idx_due_date (due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Cumplimiento normativo';

-- ==========================================
-- TABLA: INTEGRACIONES OTA
-- ==========================================
CREATE TABLE IF NOT EXISTS ota_integrations (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID de la integración',
  hotel_id VARCHAR(36) NOT NULL COMMENT 'Referencia al hotel',
  platform VARCHAR(100) NOT NULL COMMENT 'Plataforma: booking, expedia, airbnb',
  status VARCHAR(50) DEFAULT 'disconnected' COMMENT 'Estado: connected, disconnected, error',
  property_id VARCHAR(255) COMMENT 'ID de la propiedad en la OTA',
  api_key VARCHAR(255) COMMENT 'API key o credencial',
  ical_url VARCHAR(255) COMMENT 'URL iCal para Airbnb',
  last_sync TIMESTAMP NULL COMMENT 'Última sincronización',
  error_message LONGTEXT COMMENT 'Mensaje de error si existe',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
  UNIQUE KEY unique_ota_per_hotel (hotel_id, platform),
  INDEX idx_hotel_id (hotel_id),
  INDEX idx_platform (platform)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Configuración de integraciones OTA';

-- ==========================================
-- TABLA: RESERVAS OTA
-- ==========================================
CREATE TABLE IF NOT EXISTS ota_reservations (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID de la reserva OTA',
  hotel_id VARCHAR(36) NOT NULL COMMENT 'Referencia al hotel',
  ota_id VARCHAR(255) NOT NULL COMMENT 'ID de la reserva en la OTA',
  platform VARCHAR(100) NOT NULL COMMENT 'Plataforma: booking, expedia, airbnb',
  guest_name VARCHAR(255) NOT NULL COMMENT 'Nombre del huésped',
  guest_email VARCHAR(255) COMMENT 'Email del huésped',
  guest_phone VARCHAR(20) COMMENT 'Teléfono del huésped',
  check_in_date DATE NOT NULL COMMENT 'Fecha de entrada',
  check_out_date DATE NOT NULL COMMENT 'Fecha de salida',
  room_type VARCHAR(100) COMMENT 'Tipo de habitación solicitada',
  total_price DECIMAL(10, 2) NOT NULL COMMENT 'Precio total',
  number_of_guests INT NOT NULL COMMENT 'Cantidad de huéspedes',
  status VARCHAR(50) DEFAULT 'pending' COMMENT 'Estado: confirmed, pending, cancelled',
  ota_data LONGTEXT COMMENT 'Datos JSON adicionales de la OTA',
  local_reservation_id VARCHAR(36) COMMENT 'Referencia a reserva local si existe',
  imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  synced_to_local_at TIMESTAMP NULL COMMENT 'Cuándo se sincronizó a reserva local',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
  UNIQUE KEY unique_ota_reservation (platform, ota_id),
  INDEX idx_hotel_id (hotel_id),
  INDEX idx_platform (platform),
  INDEX idx_check_in (check_in_date),
  INDEX idx_check_out (check_out_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Reservas importadas desde OTAs';

-- ==========================================
-- TABLA: LOGS DE SINCRONIZACIÓN
-- ==========================================
CREATE TABLE IF NOT EXISTS sync_logs (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID del log',
  hotel_id VARCHAR(36) NOT NULL COMMENT 'Referencia al hotel',
  platform VARCHAR(100) NOT NULL COMMENT 'Plataforma: booking, expedia, airbnb',
  type VARCHAR(100) NOT NULL COMMENT 'Tipo: availability, reservation, cancellation, update',
  status VARCHAR(50) NOT NULL COMMENT 'Estado: success, failed',
  message LONGTEXT NOT NULL COMMENT 'Mensaje del log',
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
  INDEX idx_hotel_id (hotel_id),
  INDEX idx_platform (platform),
  INDEX idx_timestamp (timestamp),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Registro de sincronizaciones OTA';

-- ==========================================
-- DATOS INICIALES
-- ==========================================

-- Insertar hotel de ejemplo (Rinconcito)
INSERT IGNORE INTO hotels (id, name, address, city, country, phone, email, total_rooms, currency)
VALUES (
  'hotel-rinconcito-001',
  'El Rinconcito',
  'Calle Principal, Tierra Bomba',
  'Cartagena',
  'Colombia',
  '3142187504',
  'info@rinconcito.co',
  12,
  'COP'
);

-- Insertar usuario admin de ejemplo
INSERT IGNORE INTO users (id, email, name, role, hotel_id, password_hash, active)
VALUES (
  'user-admin-001',
  'admin@rinconcito.co',
  'Administrador',
  'admin',
  'hotel-rinconcito-001',
  '$2b$12$PLACEHOLDER_HASH_BCRYPT', -- Cambiar con contraseña real
  true
);

SET FOREIGN_KEY_CHECKS=1;

-- ==========================================
-- FIN DEL SCRIPT
-- ==========================================
