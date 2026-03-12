import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

// ===== VALIDATION SCHEMAS =====

const popSchema = z.object({
  name: z.string().min(1),
  city: z.string().min(1),
  state: z.string().length(2),
  address: z.string().optional(),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
  notes: z.string().optional(),
});

const equipamentoSchema = z.object({
  hostname: z.string().min(1),
  type: z.enum(["OLT", "Switch", "Router", "Server", "Firewall", "Radio Link"]),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  popId: z.number().int(),
  ipPrincipal: z.string().optional(),
  status: z.enum(["ACTIVE", "MAINTENANCE", "FAILED", "INACTIVE"]).optional(),
  criticality: z.enum(["P0", "P1", "P2", "P3"]).optional(),
});

const vlanSchema = z.object({
  vlanId: z.number().int().min(1).max(4094),
  name: z.string().min(1),
  type: z.enum(["PPPoE", "Corporativo", "TR-069", "Gerencia", "IPTV", "VoIP", "Backbone"]),
  scope: z.enum(["global", "local"]).optional(),
  notes: z.string().optional(),
});

const interfaceSchema = z.object({
  name: z.string().min(1),
  equipamentoId: z.number().int(),
  type: z.enum(["Ethernet", "Fibra", "GPON", "LAG", "Loopback", "VLAN"]),
  description: z.string().optional(),
  speed: z.string().optional(),
  status: z.enum(["up", "down"]).optional(),
});

const subnetSchema = z.object({
  cidr: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(["CLIENT", "MGMT", "Backbone", "Loopback", "P2P"]),
  gateway: z.string().optional(),
  vrf: z.string().optional(),
});

const circuitSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["PTP_FIBER", "Transit IP", "IX", "Radio", "MPLS", "Layer 2"]),
  provider: z.string().min(1),
  circuitId: z.string().optional(),
  capacity: z.string().optional(),
  sla: z.string().optional(),
  status: z.enum(["Active", "Maintenance", "Inactive", "Failed"]).optional(),
});

const serviceSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["PPPoE", "TR-069", "DHCP", "DNS", "RADIUS", "Zabbix", "Syslog", "NTP", "Grafana"]),
  equipamentoId: z.number().int().optional(),
  vlanId: z.number().int().optional(),
  vrf: z.string().optional(),
  runbookId: z.number().int().optional(),
  notes: z.string().optional(),
});

const monitoringConfigSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["ICMP", "SNMP", "Zabbix"]),
  target: z.string().min(1),
  snmpCommunity: z.string().optional(),
  snmpVersion: z.enum(["1", "2c", "3"]).optional(),
  zabbixHostId: z.string().optional(),
  zabbixApiUrl: z.string().optional(),
  zabbixApiToken: z.string().optional(),
  checkInterval: z.number().int().optional(),
  enabled: z.boolean().optional(),
});

const runbookSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  content: z.string().optional(),
  category: z.string().optional(),
});

const checklistSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  items: z.string().optional(),
  category: z.string().optional(),
});

// ===== ROUTERS =====

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, cookieOptions);
      return { success: true } as const;
    }),
  }),

  // ===== DASHBOARD =====
  dashboard: router({
    stats: protectedProcedure.query(async () => {
      const equipStats = await db.getEquipamentoStats();
      const interfaceCount = await db.getInterfaceStats();
      const pops = await db.getPOPs();
      
      return {
        totalEquipamentos: equipStats.total,
        equipamentosAtivos: equipStats.active,
        equipamentosEmFalha: equipStats.failed,
        totalInterfaces: interfaceCount,
        totalPOPs: pops.length,
      };
    }),
  }),

  // ===== POPs =====
  pops: router({
    list: protectedProcedure.query(() => db.getPOPs()),
    create: protectedProcedure
      .input(popSchema)
      .mutation(async ({ input, ctx }) => {
        const result = await db.createPOP(input);
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "CREATE",
          module: "POPs",
          resourceType: "POP",
          details: JSON.stringify(input),
          ipAddress: ctx.req.headers["x-forwarded-for"] || "unknown",
        });
        return result;
      }),
    update: protectedProcedure
      .input(z.object({ id: z.number().int(), data: popSchema }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.updatePOP(input.id, input.data);
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "UPDATE",
          module: "POPs",
          resourceId: input.id,
          resourceType: "POP",
          details: JSON.stringify(input.data),
          ipAddress: ctx.req.headers["x-forwarded-for"] || "unknown",
        });
        return result;
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.deletePOP(input.id);
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "DELETE",
          module: "POPs",
          resourceId: input.id,
          resourceType: "POP",
          ipAddress: ctx.req.headers["x-forwarded-for"] || "unknown",
        });
        return result;
      }),
  }),

  // ===== EQUIPAMENTOS =====
  equipamentos: router({
    list: protectedProcedure.query(() => db.getEquipamentos()),
    listByPOP: protectedProcedure
      .input(z.object({ popId: z.number().int() }))
      .query(({ input }) => db.getEquipamentosByPOP(input.popId)),
    search: protectedProcedure
      .input(z.object({ query: z.string() }))
      .query(({ input }) => db.searchEquipamentos(input.query)),
    create: protectedProcedure
      .input(equipamentoSchema)
      .mutation(async ({ input, ctx }) => {
        const result = await db.createEquipamento(input);
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "CREATE",
          module: "Equipamentos",
          resourceType: "Equipamento",
          details: JSON.stringify(input),
          ipAddress: ctx.req.headers["x-forwarded-for"] || "unknown",
        });
        return result;
      }),
    update: protectedProcedure
      .input(z.object({ id: z.number().int(), data: equipamentoSchema.partial() }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.updateEquipamento(input.id, input.data);
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "UPDATE",
          module: "Equipamentos",
          resourceId: input.id,
          resourceType: "Equipamento",
          details: JSON.stringify(input.data),
          ipAddress: ctx.req.headers["x-forwarded-for"] || "unknown",
        });
        return result;
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.deleteEquipamento(input.id);
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "DELETE",
          module: "Equipamentos",
          resourceId: input.id,
          resourceType: "Equipamento",
          ipAddress: ctx.req.headers["x-forwarded-for"] || "unknown",
        });
        return result;
      }),
  }),

  // ===== EQUIPMENT CREDENTIALS =====
  credentials: router({
    list: protectedProcedure
      .input(z.object({ equipamentoId: z.number().int() }))
      .query(({ input }) => db.getEquipmentCredentials(input.equipamentoId)),
    create: protectedProcedure
      .input(z.object({ equipamentoId: z.number().int(), username: z.string(), password: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.createEquipmentCredential({
          equipamentoId: input.equipamentoId,
          username: input.username,
          password: input.password, // Should be encrypted in production
        });
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "CREATE",
          module: "Credentials",
          resourceType: "Credential",
          ipAddress: ctx.req.headers["x-forwarded-for"] || "unknown",
        });
        return result;
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.deleteEquipmentCredential(input.id);
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "DELETE",
          module: "Credentials",
          resourceId: input.id,
          resourceType: "Credential",
          ipAddress: ctx.req.headers["x-forwarded-for"] || "unknown",
        });
        return result;
      }),
  }),

  // ===== VLANs =====
  vlans: router({
    list: protectedProcedure.query(() => db.getVLANs()),
    create: protectedProcedure
      .input(vlanSchema)
      .mutation(async ({ input, ctx }) => {
        const result = await db.createVLAN(input);
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "CREATE",
          module: "VLANs",
          resourceType: "VLAN",
          details: JSON.stringify(input),
          ipAddress: ctx.req.headers["x-forwarded-for"] || "unknown",
        });
        return result;
      }),
    update: protectedProcedure
      .input(z.object({ id: z.number().int(), data: vlanSchema.partial() }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.updateVLAN(input.id, input.data);
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "UPDATE",
          module: "VLANs",
          resourceId: input.id,
          resourceType: "VLAN",
          details: JSON.stringify(input.data),
          ipAddress: ctx.req.headers["x-forwarded-for"] || "unknown",
        });
        return result;
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.deleteVLAN(input.id);
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "DELETE",
          module: "VLANs",
          resourceId: input.id,
          resourceType: "VLAN",
          ipAddress: ctx.req.headers["x-forwarded-for"] || "unknown",
        });
        return result;
      }),
  }),

  // ===== INTERFACES =====
  interfaces: router({
    list: protectedProcedure.query(() => db.getInterfaces()),
    listByEquipamento: protectedProcedure
      .input(z.object({ equipamentoId: z.number().int() }))
      .query(({ input }) => db.getInterfacesByEquipamento(input.equipamentoId)),
    create: protectedProcedure
      .input(interfaceSchema)
      .mutation(async ({ input, ctx }) => {
        const result = await db.createInterface(input);
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "CREATE",
          module: "Interfaces",
          resourceType: "Interface",
          details: JSON.stringify(input),
          ipAddress: ctx.req.headers["x-forwarded-for"] || "unknown",
        });
        return result;
      }),
    update: protectedProcedure
      .input(z.object({ id: z.number().int(), data: interfaceSchema.partial() }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.updateInterface(input.id, input.data);
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "UPDATE",
          module: "Interfaces",
          resourceId: input.id,
          resourceType: "Interface",
          details: JSON.stringify(input.data),
          ipAddress: ctx.req.headers["x-forwarded-for"] || "unknown",
        });
        return result;
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.deleteInterface(input.id);
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "DELETE",
          module: "Interfaces",
          resourceId: input.id,
          resourceType: "Interface",
          ipAddress: ctx.req.headers["x-forwarded-for"] || "unknown",
        });
        return result;
      }),
    getLinks: protectedProcedure
      .input(z.object({ interfaceId: z.number().int() }))
      .query(({ input }) => db.getInterfaceLinks(input.interfaceId)),
    createLink: protectedProcedure
      .input(z.object({ interfaceIdA: z.number().int(), interfaceIdB: z.number().int(), vlanId: z.number().int().optional(), bandwidth: z.string().optional(), status: z.enum(["Active", "Inactive", "Maintenance"]).optional() }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.createInterfaceLink(input);
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "CREATE",
          module: "InterfaceLinks",
          resourceType: "InterfaceLink",
          details: JSON.stringify(input),
          ipAddress: ctx.req.headers["x-forwarded-for"] || "unknown",
        });
        return result;
      }),
    deleteLink: protectedProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.deleteInterfaceLink(input.id);
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "DELETE",
          module: "InterfaceLinks",
          resourceId: input.id,
          resourceType: "InterfaceLink",
          ipAddress: ctx.req.headers["x-forwarded-for"] || "unknown",
        });
        return result;
      }),
  }),

  // ===== SUBNETS (IPAM) =====
  subnets: router({
    list: protectedProcedure.query(() => db.getSubnets()),
    create: protectedProcedure
      .input(subnetSchema)
      .mutation(async ({ input, ctx }) => {
        const result = await db.createSubnet(input);
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "CREATE",
          module: "Subnets",
          resourceType: "Subnet",
          details: JSON.stringify(input),
          ipAddress: ctx.req.headers["x-forwarded-for"] || "unknown",
        });
        return result;
      }),
    update: protectedProcedure
      .input(z.object({ id: z.number().int(), data: subnetSchema.partial() }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.updateSubnet(input.id, input.data);
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "UPDATE",
          module: "Subnets",
          resourceId: input.id,
          resourceType: "Subnet",
          details: JSON.stringify(input.data),
          ipAddress: ctx.req.headers["x-forwarded-for"] || "unknown",
        });
        return result;
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.deleteSubnet(input.id);
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "DELETE",
          module: "Subnets",
          resourceId: input.id,
          resourceType: "Subnet",
          ipAddress: ctx.req.headers["x-forwarded-for"] || "unknown",
        });
        return result;
      }),
  }),

  // ===== CIRCUITS =====
  circuits: router({
    list: protectedProcedure.query(() => db.getCircuits()),
    create: protectedProcedure
      .input(circuitSchema)
      .mutation(async ({ input, ctx }) => {
        const result = await db.createCircuit(input);
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "CREATE",
          module: "Circuits",
          resourceType: "Circuit",
          details: JSON.stringify(input),
          ipAddress: ctx.req.headers["x-forwarded-for"] || "unknown",
        });
        return result;
      }),
    update: protectedProcedure
      .input(z.object({ id: z.number().int(), data: circuitSchema.partial() }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.updateCircuit(input.id, input.data);
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "UPDATE",
          module: "Circuits",
          resourceId: input.id,
          resourceType: "Circuit",
          details: JSON.stringify(input.data),
          ipAddress: ctx.req.headers["x-forwarded-for"] || "unknown",
        });
        return result;
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.deleteCircuit(input.id);
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "DELETE",
          module: "Circuits",
          resourceId: input.id,
          resourceType: "Circuit",
          ipAddress: ctx.req.headers["x-forwarded-for"] || "unknown",
        });
        return result;
      }),
  }),

  // ===== SERVICES =====
  services: router({
    list: protectedProcedure.query(() => db.getServices()),
    create: protectedProcedure
      .input(serviceSchema)
      .mutation(async ({ input, ctx }) => {
        const result = await db.createService(input);
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "CREATE",
          module: "Services",
          resourceType: "Service",
          details: JSON.stringify(input),
          ipAddress: ctx.req.headers["x-forwarded-for"] || "unknown",
        });
        return result;
      }),
    update: protectedProcedure
      .input(z.object({ id: z.number().int(), data: serviceSchema.partial() }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.updateService(input.id, input.data);
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "UPDATE",
          module: "Services",
          resourceId: input.id,
          resourceType: "Service",
          details: JSON.stringify(input.data),
          ipAddress: ctx.req.headers["x-forwarded-for"] || "unknown",
        });
        return result;
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.deleteService(input.id);
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "DELETE",
          module: "Services",
          resourceId: input.id,
          resourceType: "Service",
          ipAddress: ctx.req.headers["x-forwarded-for"] || "unknown",
        });
        return result;
      }),
  }),

  // ===== MONITORING =====
  monitoring: router({
    list: protectedProcedure.query(() => db.getMonitoringConfigs()),
    create: protectedProcedure
      .input(monitoringConfigSchema)
      .mutation(async ({ input, ctx }) => {
        const result = await db.createMonitoringConfig(input);
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "CREATE",
          module: "Monitoring",
          resourceType: "MonitoringConfig",
          details: JSON.stringify(input),
          ipAddress: ctx.req.headers["x-forwarded-for"] || "unknown",
        });
        return result;
      }),
    update: protectedProcedure
      .input(z.object({ id: z.number().int(), data: monitoringConfigSchema.partial() }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.updateMonitoringConfig(input.id, input.data);
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "UPDATE",
          module: "Monitoring",
          resourceId: input.id,
          resourceType: "MonitoringConfig",
          details: JSON.stringify(input.data),
          ipAddress: ctx.req.headers["x-forwarded-for"] || "unknown",
        });
        return result;
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.deleteMonitoringConfig(input.id);
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "DELETE",
          module: "Monitoring",
          resourceId: input.id,
          resourceType: "MonitoringConfig",
          ipAddress: ctx.req.headers["x-forwarded-for"] || "unknown",
        });
        return result;
      }),
    getStatus: protectedProcedure
      .input(z.object({ configId: z.number().int() }))
      .query(({ input }) => db.getLatestMonitoringStatus(input.configId)),
    recordStatus: protectedProcedure
      .input(z.object({ configId: z.number().int(), status: z.enum(["UP", "DOWN", "UNKNOWN"]), latency: z.number().optional(), failureCount: z.number().optional(), errorMessage: z.string().optional() }))
      .mutation(async ({ input }) => {
        return db.createMonitoringStatus({
          configId: input.configId,
          status: input.status,
          latency: input.latency,
          failureCount: input.failureCount,
          errorMessage: input.errorMessage,
        });
      }),
  }),

  // ===== RUNBOOKS =====
  runbooks: router({
    list: protectedProcedure.query(() => db.getRunbooks()),
    create: protectedProcedure
      .input(runbookSchema)
      .mutation(async ({ input, ctx }) => {
        const result = await db.createRunbook({ ...input, createdBy: ctx.user.id });
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "CREATE",
          module: "Runbooks",
          resourceType: "Runbook",
          details: JSON.stringify(input),
          ipAddress: ctx.req.headers["x-forwarded-for"] || "unknown",
        });
        return result;
      }),
    update: protectedProcedure
      .input(z.object({ id: z.number().int(), data: runbookSchema.partial() }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.updateRunbook(input.id, input.data);
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "UPDATE",
          module: "Runbooks",
          resourceId: input.id,
          resourceType: "Runbook",
          details: JSON.stringify(input.data),
          ipAddress: ctx.req.headers["x-forwarded-for"] || "unknown",
        });
        return result;
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.deleteRunbook(input.id);
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "DELETE",
          module: "Runbooks",
          resourceId: input.id,
          resourceType: "Runbook",
          ipAddress: ctx.req.headers["x-forwarded-for"] || "unknown",
        });
        return result;
      }),
  }),

  // ===== CHECKLISTS =====
  checklists: router({
    list: protectedProcedure.query(() => db.getChecklists()),
    create: protectedProcedure
      .input(checklistSchema)
      .mutation(async ({ input, ctx }) => {
        const result = await db.createChecklist({ ...input, createdBy: ctx.user.id });
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "CREATE",
          module: "Checklists",
          resourceType: "Checklist",
          details: JSON.stringify(input),
          ipAddress: ctx.req.headers["x-forwarded-for"] || "unknown",
        });
        return result;
      }),
    update: protectedProcedure
      .input(z.object({ id: z.number().int(), data: checklistSchema.partial() }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.updateChecklist(input.id, input.data);
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "UPDATE",
          module: "Checklists",
          resourceId: input.id,
          resourceType: "Checklist",
          details: JSON.stringify(input.data),
          ipAddress: ctx.req.headers["x-forwarded-for"] || "unknown",
        });
        return result;
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.deleteChecklist(input.id);
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "DELETE",
          module: "Checklists",
          resourceId: input.id,
          resourceType: "Checklist",
          ipAddress: ctx.req.headers["x-forwarded-for"] || "unknown",
        });
        return result;
      }),
  }),

  // ===== ADMINISTRATION =====
  admin: router({
    users: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized");
        }
        return db.getAllUsers();
      }),
      updateRole: protectedProcedure
        .input(z.object({ userId: z.number().int(), role: z.string() }))
        .mutation(async ({ input, ctx }) => {
          if (ctx.user.role !== "admin") {
            throw new Error("Unauthorized");
          }
          const result = await db.updateUserRole(input.userId, input.role);
          await db.createAuditLog({
            userId: ctx.user.id,
            action: "UPDATE_ROLE",
            module: "Admin",
            resourceId: input.userId,
            resourceType: "User",
            details: JSON.stringify({ role: input.role }),
            ipAddress: ctx.req.headers["x-forwarded-for"] || "unknown",
          });
          return result;
        }),
    }),
    audit: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized");
        }
        return db.getAuditLogs(200);
      }),
      listByUser: protectedProcedure
        .input(z.object({ userId: z.number().int() }))
        .query(async ({ input, ctx }) => {
          if (ctx.user.role !== "admin") {
            throw new Error("Unauthorized");
          }
          return db.getAuditLogsByUser(input.userId);
        }),
    }),
  }),
});

export type AppRouter = typeof appRouter;
