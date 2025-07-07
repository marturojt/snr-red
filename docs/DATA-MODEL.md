# SNR.red - Modelo de Datos Completo

**Versión:** 1.0  
**Fecha:** 7 de Enero, 2025  
**Estado:** Implementado + Extensiones Futuras

---

## 📊 Resumen del Modelo de Datos

El modelo de datos de SNR.red está diseñado para soportar:
- **Usuarios anónimos y registrados** con diferentes niveles de servicio
- **URLs con políticas de expiración** diferenciadas por tipo de usuario
- **Sistema de analytics** detallado para tracking y reportes
- **Administración completa** con logs de auditoría
- **Pagos y suscripciones** (futuro)
- **Moderación de contenido** (futuro)

---

## 🗄️ Esquemas de Base de Datos

### 1. Colección `users` (Implementado)

```typescript
interface IUser {
  _id: ObjectId;                    // MongoDB ID único
  email: string;                    // Email único - índice único
  password: string;                 // Hash bcrypt
  name: string;                     // Nombre completo del usuario
  plan: 'free' | 'premium';         // Tipo de plan
  isActive: boolean;                // Soft delete flag
  isAdmin: boolean;                 // Permisos de administrador
  
  // Timestamps
  createdAt: Date;                  // Fecha de registro
  updatedAt: Date;                  // Última actualización
  lastLoginAt?: Date;               // Último login
  
  // Suscripción (futuro - Stripe)
  subscription?: {
    status: 'active' | 'cancelled' | 'expired' | 'past_due';
    startDate: Date;
    endDate?: Date;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    paymentMethodId?: string;
  };
  
  // Configuración de usuario
  preferences?: {
    theme: 'light' | 'dark' | 'system';
    notifications: {
      email: boolean;
      push: boolean;
      weekly_reports: boolean;
    };
    analytics: {
      detailed_tracking: boolean;
      export_format: 'csv' | 'pdf' | 'json';
    };
  };
  
  // Límites por plan
  limits: {
    urls_per_month: number;         // Free: 50, Premium: unlimited
    custom_domains: number;         // Free: 0, Premium: 5
    api_requests_per_day: number;   // Free: 100, Premium: 10000
  };
}
```

#### Índices de `users`:
```javascript
// Índices únicos
db.users.createIndex({ email: 1 }, { unique: true });

// Índices de consulta
db.users.createIndex({ plan: 1, isActive: 1 });
db.users.createIndex({ isAdmin: 1 });
db.users.createIndex({ createdAt: -1 });
db.users.createIndex({ "subscription.status": 1 });
```

### 2. Colección `urls` (Implementado)

```typescript
interface IUrl {
  _id: ObjectId;                    // MongoDB ID único
  originalUrl: string;              // URL original completa
  shortCode: string;                // Código corto - índice único
  clicks: number;                   // Contador de clics
  
  // Propietario
  userId?: string;                  // Browser ID para anónimos
  registeredUserId?: ObjectId;      // ID de usuario registrado
  userType: 'anonymous' | 'free' | 'premium';
  
  // Estado
  isActive: boolean;                // Soft delete flag
  isBlocked: boolean;               // Bloqueado por moderación
  
  // Fechas y expiración
  createdAt: Date;                  // Fecha de creación
  updatedAt: Date;                  // Última actualización
  expiresAt?: Date;                 // Expiración manual
  autoExpiresAt?: Date;             // Expiración automática por tipo
  lastAccessedAt?: Date;            // Último acceso para cleanup
  
  // Metadatos
  title?: string;                   // Título personalizado
  description?: string;             // Descripción
  tags?: string[];                  // Tags para organización
  
  // QR Code
  qrCodePath?: string;              // Path al archivo QR
  qrCodeSettings?: {
    size: number;
    backgroundColor: string;
    foregroundColor: string;
    logo?: string;
  };
  
  // Configuración avanzada
  settings?: {
    password?: string;              // Protección por contraseña
    clickLimit?: number;            // Límite de clics
    geoRestrictions?: {
      allowedCountries?: string[];
      blockedCountries?: string[];
    };
    deviceRestrictions?: {
      allowedDevices?: ('desktop' | 'mobile' | 'tablet')[];
    };
    scheduleRestrictions?: {
      startDate?: Date;
      endDate?: Date;
      allowedHours?: {
        start: number;  // 0-23
        end: number;    // 0-23
      };
    };
  };
  
  // Branding (Premium)
  branding?: {
    customDomain?: string;          // Dominio personalizado
    favicon?: string;               // Favicon personalizado
    splashPage?: {
      enabled: boolean;
      template: string;
      content: string;
    };
  };
}
```

#### Índices de `urls`:
```javascript
// Índices únicos
db.urls.createIndex({ shortCode: 1 }, { unique: true });

// Índices de consulta frecuente
db.urls.createIndex({ registeredUserId: 1, isActive: 1 });
db.urls.createIndex({ userType: 1, isActive: 1 });
db.urls.createIndex({ autoExpiresAt: 1 });
db.urls.createIndex({ lastAccessedAt: 1 });
db.urls.createIndex({ createdAt: -1 });
db.urls.createIndex({ clicks: -1 });

// Índices compuestos
db.urls.createIndex({ registeredUserId: 1, createdAt: -1 });
db.urls.createIndex({ userType: 1, autoExpiresAt: 1 });
```

### 3. Colección `analytics` (Implementado)

```typescript
interface IAnalytics {
  _id: ObjectId;
  urlId: ObjectId;                  // Referencia a la URL
  
  // Información del clic
  timestamp: Date;                  // Momento exacto del clic
  ipAddress: string;                // IP del visitante (hasheada)
  userAgent: string;                // User agent del navegador
  
  // Geolocalización
  location?: {
    country: string;
    countryCode: string;
    region?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };
  
  // Información del dispositivo
  device?: {
    type: 'desktop' | 'mobile' | 'tablet';
    os: string;
    browser: string;
    version: string;
  };
  
  // Referrer
  referrer?: {
    domain: string;
    url?: string;
    source: 'direct' | 'social' | 'search' | 'email' | 'ads' | 'other';
  };
  
  // Información adicional
  metadata?: {
    campaignId?: string;            // Para tracking de campañas
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    customParameters?: Record<string, string>;
  };
}
```

#### Índices de `analytics`:
```javascript
db.analytics.createIndex({ urlId: 1, timestamp: -1 });
db.analytics.createIndex({ timestamp: -1 });
db.analytics.createIndex({ "location.country": 1 });
db.analytics.createIndex({ "device.type": 1 });
db.analytics.createIndex({ "referrer.source": 1 });
```

### 4. Colección `audit_logs` (Futuro - Fase 5)

```typescript
interface IAuditLog {
  _id: ObjectId;
  
  // Actores
  userId?: ObjectId;                // Usuario que realizó la acción
  adminId?: ObjectId;               // Admin que realizó la acción
  
  // Acción
  action: string;                   // Tipo de acción (CREATE, UPDATE, DELETE)
  resource: string;                 // Recurso afectado (user, url, etc.)
  resourceId: string;               // ID del recurso
  
  // Cambios
  oldValues?: Record<string, any>;  // Valores anteriores
  newValues?: Record<string, any>;  // Valores nuevos
  
  // Contexto
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  
  // Metadatos
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'auth' | 'data' | 'admin' | 'security';
  description?: string;
}
```

### 5. Colección `payments` (Futuro - Fase 4)

```typescript
interface IPayment {
  _id: ObjectId;
  userId: ObjectId;                 // Usuario que realizó el pago
  
  // Stripe
  stripePaymentIntentId: string;
  stripeCustomerId: string;
  
  // Detalles del pago
  amount: number;                   // En centavos
  currency: string;                 // USD, EUR, etc.
  status: 'pending' | 'success' | 'failed' | 'refunded';
  
  // Suscripción
  subscriptionId?: ObjectId;
  planType: 'premium_monthly' | 'premium_yearly';
  
  // Fechas
  createdAt: Date;
  processedAt?: Date;
  
  // Metadatos
  metadata?: {
    upgradeFrom?: string;
    promoCode?: string;
    refundReason?: string;
  };
}
```

### 6. Colección `subscriptions` (Futuro - Fase 4)

```typescript
interface ISubscription {
  _id: ObjectId;
  userId: ObjectId;
  
  // Stripe
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  
  // Detalles de la suscripción
  plan: 'premium_monthly' | 'premium_yearly';
  status: 'active' | 'cancelled' | 'expired' | 'past_due';
  
  // Fechas
  startDate: Date;
  endDate?: Date;
  nextBillingDate?: Date;
  cancelledAt?: Date;
  
  // Configuración
  autoRenew: boolean;
  gracePeriodUntil?: Date;
  
  // Historial
  priceHistory: {
    price: number;
    currency: string;
    effectiveDate: Date;
  }[];
}
```

### 7. Colección `moderation` (Futuro - Fase 5)

```typescript
interface IModeration {
  _id: ObjectId;
  urlId: ObjectId;
  
  // Estado
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  reason?: string;
  
  // Automatización
  autoModeration?: {
    riskScore: number;              // 0-100
    flags: string[];                // Lista de flags automáticos
    confidence: number;             // 0-1
  };
  
  // Revisión manual
  manualReview?: {
    reviewerId: ObjectId;
    reviewedAt: Date;
    notes?: string;
    decision: 'approve' | 'reject' | 'flag';
  };
  
  // Fechas
  createdAt: Date;
  updatedAt: Date;
}
```

### 8. Colección `api_keys` (Futuro - Fase 7)

```typescript
interface IApiKey {
  _id: ObjectId;
  userId: ObjectId;
  
  // Clave
  keyId: string;                    // ID público de la clave
  hashedKey: string;                // Hash de la clave secreta
  
  // Configuración
  name: string;                     // Nombre descriptivo
  permissions: string[];            // Permisos (read, write, admin)
  
  // Límites
  rateLimit: {
    requestsPerMinute: number;
    requestsPerDay: number;
    requestsPerMonth: number;
  };
  
  // Estado
  isActive: boolean;
  
  // Fechas
  createdAt: Date;
  expiresAt?: Date;
  lastUsedAt?: Date;
  
  // Estadísticas
  usage: {
    totalRequests: number;
    lastMonthRequests: number;
    quotaExceededCount: number;
  };
}
```

---

## 🔗 Relaciones entre Colecciones

### Diagrama de Relaciones
```
users (1) ←→ (N) urls
  ↓
  └── (1) ←→ (N) subscriptions
      └── (1) ←→ (N) payments

urls (1) ←→ (N) analytics
  ↓
  └── (1) ←→ (1) moderation

users (1) ←→ (N) api_keys
users (1) ←→ (N) audit_logs (como usuario)
users (1) ←→ (N) audit_logs (como admin)
```

### Integridad Referencial
```javascript
// Validaciones a nivel de aplicación
- urls.registeredUserId debe existir en users._id
- analytics.urlId debe existir en urls._id
- payments.userId debe existir en users._id
- subscriptions.userId debe existir en users._id
- moderation.urlId debe existir en urls._id
- api_keys.userId debe existir en users._id
```

---

## 📊 Políticas de Datos

### 1. Retención de Datos
```yaml
analytics:
  retention: 730 days  # 2 años
  aggregation: 
    - daily_summaries: 90 days
    - monthly_summaries: 730 days
    - yearly_summaries: indefinite

audit_logs:
  retention: 2555 days  # 7 años (compliance)
  critical_events: indefinite

urls:
  anonymous: 30 days
  free_users: 90 days + 30 days inactivity
  premium_users: 365 days inactivity
```

### 2. Políticas de Privacidad
```yaml
personal_data:
  ip_addresses: hashed_with_salt
  user_agents: stored_as_is
  location: aggregated_city_level
  
anonymization:
  deleted_users: 
    - keep_aggregated_stats
    - remove_personal_identifiers
    - anonymize_analytics_data
```

### 3. Límites por Tipo de Usuario
```yaml
anonymous:
  urls_per_day: 10
  urls_total: 50
  clicks_tracking: basic
  retention: 30_days

free:
  urls_per_month: 100
  custom_codes: 10
  analytics_retention: 90_days
  api_requests_per_day: 100
  qr_codes: unlimited

premium:
  urls_per_month: unlimited
  custom_domains: 5
  analytics_retention: 730_days
  api_requests_per_day: 10000
  password_protection: true
  branding: true
  advanced_analytics: true
```

---

## 🔧 Configuración de Base de Datos

### Configuración de MongoDB
```yaml
# Configuración de desarrollo
development:
  uri: mongodb://localhost:27017/snr-red
  options:
    maxPoolSize: 10
    minPoolSize: 5
    maxIdleTimeMS: 30000
    serverSelectionTimeoutMS: 5000

# Configuración de producción
production:
  uri: mongodb://username:password@localhost:27017/snr-red-prod?authSource=admin
  options:
    maxPoolSize: 50
    minPoolSize: 10
    maxIdleTimeMS: 30000
    serverSelectionTimeoutMS: 5000
    ssl: true
    retryWrites: true
```

### Estrategia de Backup
```yaml
backup_strategy:
  frequency: daily
  retention: 30_days
  incremental: true
  
restore_strategy:
  rpo: 24_hours  # Recovery Point Objective
  rto: 4_hours   # Recovery Time Objective
```

---

## 🚀 Optimizaciones de Performance

### 1. Índices Compuestos Estratégicos
```javascript
// Para consultas del admin panel
db.urls.createIndex({ 
  "registeredUserId": 1, 
  "isActive": 1, 
  "createdAt": -1 
});

// Para cleanup automático
db.urls.createIndex({ 
  "autoExpiresAt": 1, 
  "isActive": 1 
});

// Para analytics
db.analytics.createIndex({ 
  "urlId": 1, 
  "timestamp": -1 
});
```

### 2. Agregaciones Comunes
```javascript
// Top URLs por clicks
db.urls.aggregate([
  { $match: { isActive: true } },
  { $sort: { clicks: -1 } },
  { $limit: 10 }
]);

// Stats de usuario
db.urls.aggregate([
  { $match: { registeredUserId: ObjectId("...") } },
  { $group: {
    _id: null,
    totalUrls: { $sum: 1 },
    totalClicks: { $sum: "$clicks" }
  }}
]);
```

### 3. Caché Strategy (Futuro)
```yaml
redis_cache:
  url_redirects: 
    ttl: 3600  # 1 hora
    pattern: "url:{shortCode}"
  
  user_limits:
    ttl: 1800  # 30 minutos
    pattern: "limits:{userId}"
  
  analytics_summary:
    ttl: 300   # 5 minutos
    pattern: "stats:{urlId}:{date}"
```

---

## 📈 Métricas y Monitoring

### KPIs de Base de Datos
```yaml
performance_metrics:
  - query_response_time: <100ms (p95)
  - connection_pool_utilization: <80%
  - index_hit_ratio: >95%
  - disk_utilization: <70%

business_metrics:
  - urls_created_per_day
  - clicks_per_day
  - user_registrations_per_day
  - conversion_rate_free_to_premium
```

### Alertas Automáticas
```yaml
database_alerts:
  - slow_queries: >1000ms
  - high_cpu: >80%
  - disk_space: >85%
  - connection_pool: >90%

application_alerts:
  - url_creation_failures: >5%
  - authentication_failures: >10%
  - payment_failures: >2%
```

---

## 🔄 Versionado y Migraciones

### Estrategia de Migraciones
```typescript
// Ejemplo de migración
interface Migration {
  version: string;
  description: string;
  up: () => Promise<void>;
  down: () => Promise<void>;
}

// Migración 1.1.0 - Agregar campo isAdmin
const migration_1_1_0: Migration = {
  version: "1.1.0",
  description: "Add isAdmin field to users",
  up: async () => {
    await db.users.updateMany(
      { isAdmin: { $exists: false } },
      { $set: { isAdmin: false } }
    );
  },
  down: async () => {
    await db.users.updateMany(
      {},
      { $unset: { isAdmin: "" } }
    );
  }
};
```

### Historial de Versiones
```yaml
v1.0.0:
  - Initial schema
  - Basic user and url models
  - Analytics tracking

v1.1.0:
  - Added isAdmin field
  - Enhanced url expiration logic
  - Audit logs preparation

v1.2.0: # Futuro
  - Stripe integration
  - Payment and subscription models
  - Enhanced user preferences

v1.3.0: # Futuro
  - Moderation system
  - Content filtering
  - Advanced analytics
```

---

## 🧪 Datos de Prueba

### Seed Data para Desarrollo
```typescript
// Usuarios de prueba
const seedUsers = [
  {
    email: "admin@snr.red",
    name: "Admin User",
    plan: "premium",
    isAdmin: true
  },
  {
    email: "user@example.com",
    name: "Regular User",
    plan: "free",
    isAdmin: false
  }
];

// URLs de prueba
const seedUrls = [
  {
    originalUrl: "https://example.com",
    shortCode: "test123",
    userType: "free",
    clicks: 42
  }
];
```

### Datos de Performance Testing
```yaml
load_test_data:
  users: 10000
  urls_per_user: 50
  analytics_events: 500000
  
stress_test_scenarios:
  - concurrent_url_creation: 1000_rps
  - concurrent_redirects: 5000_rps
  - bulk_analytics_ingestion: 10000_rps
```

---

**Estado del documento:** ✅ Completo  
**Próxima actualización:** Al implementar Fase 4 (Pagos)  
**Versión:** 1.0-complete-data-model
