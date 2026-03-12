import { eq, and, like, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  pops,
  equipamentos,
  equipmentCredentials,
  vlans,
  interfaces,
  interfaceLinks,
  subnets,
  circuits,
  services,
  monitoringConfigs,
  monitoringStatus,
  runbooks,
  checklists,
  auditLog,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ===== USER OPERATIONS =====

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users);
}

export async function updateUserRole(userId: number, role: string) {
  const db = await getDb();
  if (!db) return null;
  return db.update(users).set({ role: role as any }).where(eq(users.id, userId));
}

// ===== POP OPERATIONS =====

export async function getPOPs() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pops).orderBy(desc(pops.createdAt));
}

export async function createPOP(data: any) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(pops).values(data);
  return result;
}

export async function updatePOP(id: number, data: any) {
  const db = await getDb();
  if (!db) return null;
  return db.update(pops).set(data).where(eq(pops.id, id));
}

export async function deletePOP(id: number) {
  const db = await getDb();
  if (!db) return null;
  return db.delete(pops).where(eq(pops.id, id));
}

// ===== EQUIPAMENTO OPERATIONS =====

export async function getEquipamentos() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(equipamentos).orderBy(desc(equipamentos.createdAt));
}

export async function getEquipamentosByPOP(popId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(equipamentos).where(eq(equipamentos.popId, popId));
}

export async function searchEquipamentos(query: string) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(equipamentos)
    .where(
      or(
        like(equipamentos.hostname, `%${query}%`),
        like(equipamentos.model, `%${query}%`)
      )
    );
}

export async function createEquipamento(data: any) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(equipamentos).values(data);
}

export async function updateEquipamento(id: number, data: any) {
  const db = await getDb();
  if (!db) return null;
  return db.update(equipamentos).set(data).where(eq(equipamentos.id, id));
}

export async function deleteEquipamento(id: number) {
  const db = await getDb();
  if (!db) return null;
  return db.delete(equipamentos).where(eq(equipamentos.id, id));
}

export async function getEquipamentoStats() {
  const db = await getDb();
  if (!db) return { total: 0, active: 0, failed: 0 };
  
  const all = await db.select().from(equipamentos);
  const active = await db
    .select()
    .from(equipamentos)
    .where(eq(equipamentos.status, "ACTIVE"));
  const failed = await db
    .select()
    .from(equipamentos)
    .where(eq(equipamentos.status, "FAILED"));

  return {
    total: all.length,
    active: active.length,
    failed: failed.length,
  };
}

// ===== EQUIPMENT CREDENTIALS =====

export async function getEquipmentCredentials(equipamentoId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(equipmentCredentials)
    .where(eq(equipmentCredentials.equipamentoId, equipamentoId));
}

export async function createEquipmentCredential(data: any) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(equipmentCredentials).values(data);
}

export async function deleteEquipmentCredential(id: number) {
  const db = await getDb();
  if (!db) return null;
  return db.delete(equipmentCredentials).where(eq(equipmentCredentials.id, id));
}

// ===== VLAN OPERATIONS =====

export async function getVLANs() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(vlans).orderBy(desc(vlans.createdAt));
}

export async function createVLAN(data: any) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(vlans).values(data);
}

export async function updateVLAN(id: number, data: any) {
  const db = await getDb();
  if (!db) return null;
  return db.update(vlans).set(data).where(eq(vlans.id, id));
}

export async function deleteVLAN(id: number) {
  const db = await getDb();
  if (!db) return null;
  return db.delete(vlans).where(eq(vlans.id, id));
}

// ===== INTERFACE OPERATIONS =====

export async function getInterfaces() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(interfaces).orderBy(desc(interfaces.createdAt));
}

export async function getInterfacesByEquipamento(equipamentoId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(interfaces)
    .where(eq(interfaces.equipamentoId, equipamentoId));
}

export async function createInterface(data: any) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(interfaces).values(data);
}

export async function updateInterface(id: number, data: any) {
  const db = await getDb();
  if (!db) return null;
  return db.update(interfaces).set(data).where(eq(interfaces.id, id));
}

export async function deleteInterface(id: number) {
  const db = await getDb();
  if (!db) return null;
  return db.delete(interfaces).where(eq(interfaces.id, id));
}

export async function getInterfaceStats() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select().from(interfaces);
  return result.length;
}

// ===== INTERFACE LINKS =====

export async function getInterfaceLinks(interfaceId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(interfaceLinks)
    .where(
      or(
        eq(interfaceLinks.interfaceIdA, interfaceId),
        eq(interfaceLinks.interfaceIdB, interfaceId)
      )
    );
}

export async function createInterfaceLink(data: any) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(interfaceLinks).values(data);
}

export async function deleteInterfaceLink(id: number) {
  const db = await getDb();
  if (!db) return null;
  return db.delete(interfaceLinks).where(eq(interfaceLinks.id, id));
}

// ===== SUBNET OPERATIONS =====

export async function getSubnets() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(subnets).orderBy(desc(subnets.createdAt));
}

export async function createSubnet(data: any) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(subnets).values(data);
}

export async function updateSubnet(id: number, data: any) {
  const db = await getDb();
  if (!db) return null;
  return db.update(subnets).set(data).where(eq(subnets.id, id));
}

export async function deleteSubnet(id: number) {
  const db = await getDb();
  if (!db) return null;
  return db.delete(subnets).where(eq(subnets.id, id));
}

// ===== CIRCUIT OPERATIONS =====

export async function getCircuits() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(circuits).orderBy(desc(circuits.createdAt));
}

export async function createCircuit(data: any) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(circuits).values(data);
}

export async function updateCircuit(id: number, data: any) {
  const db = await getDb();
  if (!db) return null;
  return db.update(circuits).set(data).where(eq(circuits.id, id));
}

export async function deleteCircuit(id: number) {
  const db = await getDb();
  if (!db) return null;
  return db.delete(circuits).where(eq(circuits.id, id));
}

// ===== SERVICE OPERATIONS =====

export async function getServices() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(services).orderBy(desc(services.createdAt));
}

export async function createService(data: any) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(services).values(data);
}

export async function updateService(id: number, data: any) {
  const db = await getDb();
  if (!db) return null;
  return db.update(services).set(data).where(eq(services.id, id));
}

export async function deleteService(id: number) {
  const db = await getDb();
  if (!db) return null;
  return db.delete(services).where(eq(services.id, id));
}

// ===== MONITORING OPERATIONS =====

export async function getMonitoringConfigs() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(monitoringConfigs).orderBy(desc(monitoringConfigs.createdAt));
}

export async function createMonitoringConfig(data: any) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(monitoringConfigs).values(data);
}

export async function updateMonitoringConfig(id: number, data: any) {
  const db = await getDb();
  if (!db) return null;
  return db.update(monitoringConfigs).set(data).where(eq(monitoringConfigs.id, id));
}

export async function deleteMonitoringConfig(id: number) {
  const db = await getDb();
  if (!db) return null;
  return db.delete(monitoringConfigs).where(eq(monitoringConfigs.id, id));
}

export async function getLatestMonitoringStatus(configId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(monitoringStatus)
    .where(eq(monitoringStatus.configId, configId))
    .orderBy(desc(monitoringStatus.checkedAt))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createMonitoringStatus(data: any) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(monitoringStatus).values(data);
}

// ===== RUNBOOK OPERATIONS =====

export async function getRunbooks() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(runbooks).orderBy(desc(runbooks.createdAt));
}

export async function createRunbook(data: any) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(runbooks).values(data);
}

export async function updateRunbook(id: number, data: any) {
  const db = await getDb();
  if (!db) return null;
  return db.update(runbooks).set(data).where(eq(runbooks.id, id));
}

export async function deleteRunbook(id: number) {
  const db = await getDb();
  if (!db) return null;
  return db.delete(runbooks).where(eq(runbooks.id, id));
}

// ===== CHECKLIST OPERATIONS =====

export async function getChecklists() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(checklists).orderBy(desc(checklists.createdAt));
}

export async function createChecklist(data: any) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(checklists).values(data);
}

export async function updateChecklist(id: number, data: any) {
  const db = await getDb();
  if (!db) return null;
  return db.update(checklists).set(data).where(eq(checklists.id, id));
}

export async function deleteChecklist(id: number) {
  const db = await getDb();
  if (!db) return null;
  return db.delete(checklists).where(eq(checklists.id, id));
}

// ===== AUDIT LOG OPERATIONS =====

export async function createAuditLog(data: any) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(auditLog).values(data);
}

export async function getAuditLogs(limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(auditLog)
    .orderBy(desc(auditLog.createdAt))
    .limit(limit);
}

export async function getAuditLogsByUser(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(auditLog)
    .where(eq(auditLog.userId, userId))
    .orderBy(desc(auditLog.createdAt))
    .limit(limit);
}

// Helper function for OR queries
function or(...conditions: any[]) {
  return conditions.reduce((acc, cond) => {
    if (!acc) return cond;
    return { ...acc, ...cond };
  });
}
