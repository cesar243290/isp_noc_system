CREATE TABLE `audit_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`action` varchar(100) NOT NULL,
	`module` varchar(100) NOT NULL,
	`resourceId` int,
	`resourceType` varchar(100),
	`details` longtext,
	`ipAddress` varchar(45),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `checklists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`items` longtext,
	`category` varchar(100),
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `checklists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `circuits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('PTP_FIBER','Transit IP','IX','Radio','MPLS','Layer 2') NOT NULL,
	`provider` varchar(255) NOT NULL,
	`circuitId` varchar(100),
	`capacity` varchar(50),
	`sla` varchar(50),
	`status` enum('Active','Maintenance','Inactive','Failed') NOT NULL DEFAULT 'Active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `circuits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `equipamentos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`hostname` varchar(255) NOT NULL,
	`type` enum('OLT','Switch','Router','Server','Firewall','Radio Link') NOT NULL,
	`manufacturer` varchar(100),
	`model` varchar(100),
	`serialNumber` varchar(100),
	`popId` int NOT NULL,
	`ipPrincipal` varchar(45),
	`status` enum('ACTIVE','MAINTENANCE','FAILED','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
	`criticality` enum('P0','P1','P2','P3') NOT NULL DEFAULT 'P3',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `equipamentos_id` PRIMARY KEY(`id`),
	CONSTRAINT `equipamentos_hostname_unique` UNIQUE(`hostname`)
);
--> statement-breakpoint
CREATE TABLE `equipment_credentials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`equipamentoId` int NOT NULL,
	`username` varchar(255) NOT NULL,
	`password` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `equipment_credentials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `interface_links` (
	`id` int AUTO_INCREMENT NOT NULL,
	`interfaceIdA` int NOT NULL,
	`interfaceIdB` int NOT NULL,
	`vlanId` int,
	`bandwidth` varchar(50),
	`status` enum('Active','Inactive','Maintenance') NOT NULL DEFAULT 'Active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `interface_links_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `interfaces` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`equipamentoId` int NOT NULL,
	`type` enum('Ethernet','Fibra','GPON','LAG','Loopback','VLAN') NOT NULL,
	`description` text,
	`speed` varchar(50),
	`status` enum('up','down') NOT NULL DEFAULT 'down',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `interfaces_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `monitoring_configs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('ICMP','SNMP','Zabbix') NOT NULL,
	`target` varchar(255) NOT NULL,
	`snmpCommunity` varchar(255),
	`snmpVersion` enum('1','2c','3'),
	`zabbixHostId` varchar(100),
	`zabbixApiUrl` varchar(255),
	`zabbixApiToken` text,
	`checkInterval` int NOT NULL DEFAULT 300,
	`enabled` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `monitoring_configs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `monitoring_status` (
	`id` int AUTO_INCREMENT NOT NULL,
	`configId` int NOT NULL,
	`status` enum('UP','DOWN','UNKNOWN') NOT NULL,
	`latency` decimal(10,2),
	`failureCount` int NOT NULL DEFAULT 0,
	`errorMessage` text,
	`checkedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `monitoring_status_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pops` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`city` varchar(100) NOT NULL,
	`state` varchar(2) NOT NULL,
	`address` text,
	`contactName` varchar(255),
	`contactPhone` varchar(20),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pops_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `runbooks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`content` longtext,
	`category` varchar(100),
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `runbooks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('PPPoE','TR-069','DHCP','DNS','RADIUS','Zabbix','Syslog','NTP','Grafana') NOT NULL,
	`equipamentoId` int,
	`vlanId` int,
	`vrf` varchar(100),
	`runbookId` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `services_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subnets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cidr` varchar(50) NOT NULL,
	`description` text,
	`type` enum('CLIENT','MGMT','Backbone','Loopback','P2P') NOT NULL,
	`gateway` varchar(45),
	`vrf` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subnets_id` PRIMARY KEY(`id`),
	CONSTRAINT `subnets_cidr_unique` UNIQUE(`cidr`)
);
--> statement-breakpoint
CREATE TABLE `vlans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vlanId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('PPPoE','Corporativo','TR-069','Gerencia','IPTV','VoIP','Backbone') NOT NULL,
	`scope` enum('global','local') NOT NULL DEFAULT 'global',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vlans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','noc','viewer') NOT NULL DEFAULT 'viewer';