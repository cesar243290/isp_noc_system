import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Trash2, Edit2, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function Equipamentos() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    hostname: "",
    type: "",
    manufacturer: "",
    model: "",
    serialNumber: "",
    popId: "",
    ipPrincipal: "",
    status: "ACTIVE",
    criticality: "P3",
  });

  const utils = trpc.useUtils();
  const { data: equipamentos, isLoading } = trpc.equipamentos.list.useQuery();
  const { data: pops } = trpc.pops.list.useQuery();
  const createMutation = trpc.equipamentos.create.useMutation({
    onSuccess: () => {
      utils.equipamentos.list.invalidate();
      utils.dashboard.stats.invalidate();
      toast.success("Equipamento criado com sucesso!");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });
  const updateMutation = trpc.equipamentos.update.useMutation({
    onSuccess: () => {
      utils.equipamentos.list.invalidate();
      utils.dashboard.stats.invalidate();
      toast.success("Equipamento atualizado com sucesso!");
      setIsDialogOpen(false);
      resetForm();
    },
  });
  const deleteMutation = trpc.equipamentos.delete.useMutation({
    onSuccess: () => {
      utils.equipamentos.list.invalidate();
      utils.dashboard.stats.invalidate();
      toast.success("Equipamento deletado com sucesso!");
    },
  });

  const resetForm = () => {
    setFormData({
      hostname: "",
      type: "",
      manufacturer: "",
      model: "",
      serialNumber: "",
      popId: "",
      ipPrincipal: "",
      status: "ACTIVE",
      criticality: "P3",
    });
    setEditingId(null);
  };

  const handleSubmit = () => {
    if (!formData.hostname || !formData.type || !formData.popId) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    const data: any = {
      hostname: formData.hostname,
      type: formData.type,
      manufacturer: formData.manufacturer,
      model: formData.model,
      serialNumber: formData.serialNumber,
      popId: parseInt(formData.popId),
      ipPrincipal: formData.ipPrincipal,
      status: formData.status,
      criticality: formData.criticality,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (equip: any) => {
    setFormData({
      hostname: equip.hostname,
      type: equip.type,
      manufacturer: equip.manufacturer || "",
      model: equip.model || "",
      serialNumber: equip.serialNumber || "",
      popId: equip.popId.toString(),
      ipPrincipal: equip.ipPrincipal || "",
      status: equip.status,
      criticality: equip.criticality,
    });
    setEditingId(equip.id);
    setIsDialogOpen(true);
  };

  const filteredEquipamentos = equipamentos?.filter((e) => {
    const matchesSearch =
      e.hostname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.model && e.model.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = !filterType || e.type === filterType;
    const matchesStatus = !filterStatus || e.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  }) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Equipamentos</h1>
          <p className="text-muted-foreground">Gestão de equipamentos de rede</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Equipamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Editar Equipamento" : "Novo Equipamento"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Hostname *</label>
                <Input
                  value={formData.hostname}
                  onChange={(e) =>
                    setFormData({ ...formData, hostname: e.target.value })
                  }
                  placeholder="ex: olt-01"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tipo *</label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OLT">OLT</SelectItem>
                    <SelectItem value="Switch">Switch</SelectItem>
                    <SelectItem value="Router">Router</SelectItem>
                    <SelectItem value="Server">Server</SelectItem>
                    <SelectItem value="Firewall">Firewall</SelectItem>
                    <SelectItem value="Radio Link">Radio Link</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">POP *</label>
                <Select value={formData.popId} onValueChange={(value) => setFormData({ ...formData, popId: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pops?.map((pop) => (
                      <SelectItem key={pop.id} value={pop.id.toString()}>
                        {pop.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Fabricante</label>
                <Input
                  value={formData.manufacturer}
                  onChange={(e) =>
                    setFormData({ ...formData, manufacturer: e.target.value })
                  }
                  placeholder="ex: Huawei"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Modelo</label>
                <Input
                  value={formData.model}
                  onChange={(e) =>
                    setFormData({ ...formData, model: e.target.value })
                  }
                  placeholder="ex: MA5800-X7"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Serial Number</label>
                <Input
                  value={formData.serialNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, serialNumber: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">IP Principal</label>
                <Input
                  value={formData.ipPrincipal}
                  onChange={(e) =>
                    setFormData({ ...formData, ipPrincipal: e.target.value })
                  }
                  placeholder="ex: 192.168.1.1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Ativo</SelectItem>
                    <SelectItem value="MAINTENANCE">Manutenção</SelectItem>
                    <SelectItem value="FAILED">Falha</SelectItem>
                    <SelectItem value="INACTIVE">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Criticidade</label>
                <Select value={formData.criticality} onValueChange={(value) => setFormData({ ...formData, criticality: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="P0">P0 - Crítico</SelectItem>
                    <SelectItem value="P1">P1 - Alto</SelectItem>
                    <SelectItem value="P2">P2 - Médio</SelectItem>
                    <SelectItem value="P3">P3 - Baixo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="w-full"
              >
                {editingId ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por hostname ou modelo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os tipos</SelectItem>
                <SelectItem value="OLT">OLT</SelectItem>
                <SelectItem value="Switch">Switch</SelectItem>
                <SelectItem value="Router">Router</SelectItem>
                <SelectItem value="Server">Server</SelectItem>
                <SelectItem value="Firewall">Firewall</SelectItem>
                <SelectItem value="Radio Link">Radio Link</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os status</SelectItem>
                <SelectItem value="ACTIVE">Ativo</SelectItem>
                <SelectItem value="MAINTENANCE">Manutenção</SelectItem>
                <SelectItem value="FAILED">Falha</SelectItem>
                <SelectItem value="INACTIVE">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEquipamentos.map((equip) => (
          <Card key={equip.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{equip.hostname}</CardTitle>
                  <p className="text-sm text-muted-foreground">{equip.type}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  equip.status === "ACTIVE"
                    ? "bg-green-100 text-green-800"
                    : equip.status === "FAILED"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}>
                  {equip.status}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Modelo:</span> {equip.model || "-"}
              </div>
              <div>
                <span className="text-muted-foreground">IP:</span> {equip.ipPrincipal || "-"}
              </div>
              <div>
                <span className="text-muted-foreground">Criticidade:</span> {equip.criticality}
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(equip)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    if (confirm("Tem certeza que deseja deletar?")) {
                      deleteMutation.mutate({ id: equip.id });
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEquipamentos.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            Nenhum equipamento encontrado
          </CardContent>
        </Card>
      )}
    </div>
  );
}
