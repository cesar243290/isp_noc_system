import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Loader2, AlertTriangle, CheckCircle, Zap, Radio } from "lucide-react";

export default function Dashboard() {
  const { data: stats, isLoading } = trpc.dashboard.stats.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  const statCards = [
    {
      title: "Total de Equipamentos",
      value: stats?.totalEquipamentos || 0,
      icon: Zap,
      color: "bg-blue-500",
    },
    {
      title: "Equipamentos Ativos",
      value: stats?.equipamentosAtivos || 0,
      icon: CheckCircle,
      color: "bg-green-500",
    },
    {
      title: "Equipamentos em Falha",
      value: stats?.equipamentosEmFalha || 0,
      icon: AlertTriangle,
      color: "bg-red-500",
    },
    {
      title: "Total de Interfaces",
      value: stats?.totalInterfaces || 0,
      icon: Radio,
      color: "bg-purple-500",
    },
    {
      title: "Total de POPs",
      value: stats?.totalPOPs || 0,
      icon: Radio,
      color: "bg-orange-500",
    },
  ];

  const chartData = [
    { name: "Ativos", value: stats?.equipamentosAtivos || 0 },
    { name: "Falha", value: stats?.equipamentosEmFalha || 0 },
    { name: "Manutenção", value: (stats?.totalEquipamentos || 0) - (stats?.equipamentosAtivos || 0) - (stats?.equipamentosEmFalha || 0) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Bem-vindo ao ISP NOC System</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color} text-white rounded-full p-1`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Status dos Equipamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações do Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Funcionalidades Principais</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Gestão completa de equipamentos de rede</li>
                <li>✓ Documentação de topologia e interfaces</li>
                <li>✓ Gerenciamento de VLANs e sub-redes (IPAM)</li>
                <li>✓ Controle de circuitos com operadoras</li>
                <li>✓ Monitoramento ativo (ICMP, SNMP, Zabbix)</li>
                <li>✓ Runbooks e checklists operacionais</li>
                <li>✓ Auditoria completa de operações</li>
                <li>✓ Controle de acesso baseado em roles</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 border rounded-lg hover:bg-accent transition-colors text-center">
              <div className="font-semibold">Novo Equipamento</div>
              <div className="text-sm text-muted-foreground">Adicionar equipamento</div>
            </button>
            <button className="p-4 border rounded-lg hover:bg-accent transition-colors text-center">
              <div className="font-semibold">Novo POP</div>
              <div className="text-sm text-muted-foreground">Adicionar ponto de presença</div>
            </button>
            <button className="p-4 border rounded-lg hover:bg-accent transition-colors text-center">
              <div className="font-semibold">Nova VLAN</div>
              <div className="text-sm text-muted-foreground">Criar VLAN</div>
            </button>
            <button className="p-4 border rounded-lg hover:bg-accent transition-colors text-center">
              <div className="font-semibold">Novo Circuito</div>
              <div className="text-sm text-muted-foreground">Registrar circuito</div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
