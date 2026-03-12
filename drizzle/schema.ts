import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  longtext,
  datetime,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "noc", "viewer"]).default("viewer").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * POPs (Pontos de Presença) - Network locations/sites
 */
export const pops = mysqlTable("pops", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 2 }).notNull(),
  address: text("address"),
  contactName: varchar("contactName", { length: 255 }),
  contactPhone: varchar("contactPhone", { length: 20 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type POP = typeof pops.$inferSelect;
export type InsertPOP = typeof pops.$inferInsert;

/**
 * Equipamentos - Network equipment
 */
export const equipamentos = mysqlTable("equipamentos", {
  id: int("id").autoincrement().primaryKey(),
  hostname: varchar("hostname", { length: 255 }).notNull().unique(),
  type: mysqlEnum("type", ["OLT", "Switch", "Router", "Server", "Firewall", "Radio Link"]).notNull(),
  manufacturer: varchar("manufacturer", { length: 100 }),
  model: varchar("model", { length: 100 }),
  serialNumber: varchar("serialNumber", { length: 100 }),
  popId: int("popId").notNull(),
  ipPrincipal: varchar("ipPrincipal", { length: 45 }),
  status: mysqlEnum("status", ["ACTIVE", "MAINTENANCE", "FAILED", "INACTIVE"]).default("ACTIVE").notNull(),
  criticality: mysqlEnum("criticality", ["P0", "P1", "P2", "P3"]).default("P3").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Equipamento = typeof equipamentos.$inferSelect;
export type InsertEquipamento = typeof equipamentos.$inferInsert;

/**
 * Equipment Credentials
 */
export const equipmentCredentials = mysqlTable("equipment_credentials", {
  id: int("id").autoincrement().primaryKey(),
  equipamentoId: int("equipamentoId").notNull(),
  username: varchar("username", { length: 255 }).notNull(),
  password: text("password").notNull(), // Should be encrypted in production
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EquipmentCredential = typeof equipmentCredentials.$inferSelect;
export type InsertEquipmentCredential = typeof equipmentCredentials.$inferInsert;

/**
 * VLANs - Virtual LANs
 */
export const vlans = mysqlTable("vlans", {
  id: int("id").autoincrement().primaryKey(),
  vlanId: int("vlanId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["PPPoE", "Corporativo", "TR-069", "Gerencia", "IPTV", "VoIP", "Backbone"]).notNull(),
  scope: mysqlEnum("scope", ["global", "local"]).default("global").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type VLAN = typeof vlans.$inferSelect;
export type InsertVLAN = typeof vlans.$inferInsert;

/**
 * Network Interfaces
 */
export const interfaces = mysqlTable("interfaces", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  equipamentoId: int("equipamentoId").notNull(),
  type: mysqlEnum("type", ["Ethernet", "Fibra", "GPON", "LAG", "Loopback", "VLAN"]).notNull(),
  description: text("description"),
  speed: varchar("speed", { length: 50 }),
  status: mysqlEnum("status", ["up", "down"]).default("down").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Interface = typeof interfaces.$inferSelect;
export type InsertInterface = typeof interfaces.$inferInsert;

/**
 * Interface Links/Enlaces
 */
export const interfaceLinks = mysqlTable("interface_links", {
  id: int("id").autoincrement().primaryKey(),
  interfaceIdA: int("interfaceIdA").notNull(),
  interfaceIdB: int("interfaceIdB").notNull(),
  vlanId: int("vlanId"),
  bandwidth: varchar("bandwidth", { length: 50 }),
  status: mysqlEnum("status", ["Active", "Inactive", "Maintenance"]).default("Active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InterfaceLink = typeof interfaceLinks.$inferSelect;
export type InsertInterfaceLink = typeof interfaceLinks.$inferInsert;

/**
 * IPAM - IP Address Management / Subnets
 */
export const subnets = mysqlTable("subnets", {
  id: int("id").autoincrement().primaryKey(),
  cidr: varchar("cidr", { length: 50 }).notNull().unique(),
  description: text("description"),
  type: mysqlEnum("type", ["CLIENT", "MGMT", "Backbone", "Loopback", "P2P"]).notNull(),
  gateway: varchar("gateway", { length: 45 }),
  vrf: varchar("vrf", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subnet = typeof subnets.$inferSelect;
export type InsertSubnet = typeof subnets.$inferInsert;

/**
 * Circuits - Operadora circuits and links
 */
export const circuits = mysqlTable("circuits", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["PTP_FIBER", "Transit IP", "IX", "Radio", "MPLS", "Layer 2"]).notNull(),
  provider: varchar("provider", { length: 255 }).notNull(),
  circuitId: varchar("circuitId", { length: 100 }),
  capacity: varchar("capacity", { length: 50 }),
  sla: varchar("sla", { length: 50 }),
  status: mysqlEnum("status", ["Active", "Maintenance", "Inactive", "Failed"]).default("Active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Circuit = typeof circuits.$inferSelect;
export type InsertCircuit = typeof circuits.$inferInsert;

/**
 * Services
 */
export const services = mysqlTable("services", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["PPPoE", "TR-069", "DHCP", "DNS", "RADIUS", "Zabbix", "Syslog", "NTP", "Grafana"]).notNull(),
  equipamentoId: int("equipamentoId"),
  vlanId: int("vlanId"),
  vrf: varchar("vrf", { length: 100 }),
  runbookId: int("runbookId"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Service = typeof services.$inferSelect;
export type InsertService = typeof services.$inferInsert;

/**
 * Monitoring Configurations
 */
export const monitoringConfigs = mysqlTable("monitoring_configs", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["ICMP", "SNMP", "Zabbix"]).notNull(),
  target: varchar("target", { length: 255 }).notNull(),
  snmpCommunity: varchar("snmpCommunity", { length: 255 }),
  snmpVersion: mysqlEnum("snmpVersion", ["1", "2c", "3"]),
  zabbixHostId: varchar("zabbixHostId", { length: 100 }),
  zabbixApiUrl: varchar("zabbixApiUrl", { length: 255 }),
  zabbixApiToken: text("zabbixApiToken"),
  checkInterval: int("checkInterval").default(300).notNull(),
  enabled: boolean("enabled").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MonitoringConfig = typeof monitoringConfigs.$inferSelect;
export type InsertMonitoringConfig = typeof monitoringConfigs.$inferInsert;

/**
 * Monitoring Status History
 */
export const monitoringStatus = mysqlTable("monitoring_status", {
  id: int("id").autoincrement().primaryKey(),
  configId: int("configId").notNull(),
  status: mysqlEnum("status", ["UP", "DOWN", "UNKNOWN"]).notNull(),
  latency: decimal("latency", { precision: 10, scale: 2 }),
  failureCount: int("failureCount").default(0).notNull(),
  errorMessage: text("errorMessage"),
  checkedAt: timestamp("checkedAt").defaultNow().notNull(),
});

export type MonitoringStatusRecord = typeof monitoringStatus.$inferSelect;
export type InsertMonitoringStatusRecord = typeof monitoringStatus.$inferInsert;

/**
 * Runbooks - Operational procedures
 */
export const runbooks = mysqlTable("runbooks", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  content: longtext("content"),
  category: varchar("category", { length: 100 }),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Runbook = typeof runbooks.$inferSelect;
export type InsertRunbook = typeof runbooks.$inferInsert;

/**
 * Checklists - Operational checklists
 */
export const checklists = mysqlTable("checklists", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  items: longtext("items"), // JSON array of checklist items
  category: varchar("category", { length: 100 }),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Checklist = typeof checklists.$inferSelect;
export type InsertChecklist = typeof checklists.$inferInsert;

/**
 * Audit Log - Track all operations
 */
export const auditLog = mysqlTable("audit_log", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  module: varchar("module", { length: 100 }).notNull(),
  resourceId: int("resourceId"),
  resourceType: varchar("resourceType", { length: 100 }),
  details: longtext("details"), // JSON with change details
  ipAddress: varchar("ipAddress", { length: 45 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLogEntry = typeof auditLog.$inferSelect;
export type InsertAuditLogEntry = typeof auditLog.$inferInsert;
