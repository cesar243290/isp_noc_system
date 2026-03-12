# ISP NOC System - TODO

## Database Schema & Backend Setup
- [x] Create complete database schema (Equipamentos, POPs, VLANs, Interfaces, etc)
- [x] Create database migrations
- [x] Implement database query helpers
- [x] Create tRPC routers for all modules

## Authentication & Security
- [x] Implement login page with username/email and password
- [x] Implement session management with 24h validity
- [x] Implement role-based access control (ADMIN, NOC, VIEWER)
- [x] Implement logout functionality
- [x] Implement auth context and protected routes

## Dashboard
- [x] Create dashboard page with metrics
- [x] Display total equipamentos, ativos, interfaces, POPs, falhas
- [x] Add informational cards

## Gestão de Equipamentos
- [x] Create equipamentos page with grid layout
- [x] Implement search by hostname/modelo
- [x] Implement filters (POP, tipo, status)
- [x] Implement CRUD operations
- [x] Implement credential management
- [x] Add criticality levels (P0-P3)

## POPs (Pontos de Presença)
- [x] Create POPs management page
- [x] Implement CRUD operations
- [x] Add location fields (cidade, estado, endereço)
- [x] Add contact information

## VLANs
- [ ] Create VLANs management page (placeholder ready)
- [ ] Implement VLAN types (PPPoE, Corporativo, TR-069, etc)
- [ ] Implement CRUD operations
- [ ] Add VLAN ID validation (1-4094)

## Interfaces de Rede
- [ ] Create interfaces management page (placeholder ready)
- [ ] Implement interface types (Ethernet, Fibra, GPON, LAG, Loopback, VLAN)
- [ ] Implement CRUD operations
- [ ] Implement interface linking/enlaces
- [ ] Add bandwidth and status tracking

## IPAM (Gestão de Sub-redes)
- [ ] Create IPAM page (placeholder ready)
- [ ] Implement subnet types (CLIENT, MGMT, Backbone, Loopback, P2P)
- [ ] Implement CIDR management
- [ ] Implement CRUD operations
- [ ] Add VRF support

## Circuitos & Enlaces
- [ ] Create circuits management page (placeholder ready)
- [ ] Implement circuit types (PTP_FIBER, Transit IP, IX, Radio, MPLS, Layer 2)
- [ ] Implement CRUD operations
- [ ] Add SLA tracking
- [ ] Add provider/operadora management

## Serviços
- [ ] Create services management page (placeholder ready)
- [ ] Implement service types (PPPoE, TR-069, DHCP, DNS, RADIUS, Zabbix, Syslog, NTP, Grafana)
- [ ] Implement CRUD operations
- [ ] Add runbook linking

## Monitoramento
- [ ] Create monitoring configuration page (placeholder ready)
- [ ] Implement ICMP (Ping) monitoring
- [ ] Implement SNMP monitoring
- [ ] Implement Zabbix integration
- [ ] Add manual test functionality
- [ ] Add real-time status updates (30s interval)
- [ ] Add latency measurement
- [ ] Add failure counter
- [ ] Display UP/DOWN/UNKNOWN status

## Runbooks
- [ ] Create runbooks documentation page (placeholder ready)
- [ ] Implement CRUD operations
- [ ] Add procedure documentation

## Checklists
- [ ] Create checklists page (placeholder ready)
- [ ] Implement CRUD operations
- [ ] Add checklist templates

## Administration
- [ ] Create user management page (admin only, placeholder ready)
- [ ] Implement user creation/editing
- [ ] Implement role assignment
- [ ] Implement user activation/deactivation
- [ ] Create audit log page (placeholder ready)
- [ ] Implement operation logging
- [ ] Add rastreability tracking

## Global Components & UI
- [x] Create responsive layout with sidebar
- [x] Implement dark/light theme toggle
- [x] Create professional login page
- [x] Add success/error notifications
- [x] Implement responsive design

## Deployment & Documentation
- [x] Create deployment scripts for Ubuntu Server
- [x] Create MySQL/MariaDB setup script
- [x] Create environment configuration guide
- [x] Create deployment documentation (DEPLOYMENT_UBUNTU.md)
- [x] Create quick start guide (QUICK_START.md)
- [x] Fix all errors and warnings
- [x] Test production build
- [x] Run and pass all tests
