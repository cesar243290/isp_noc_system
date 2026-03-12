import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Trash2, Edit2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function POPs() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    state: "",
    address: "",
    contactName: "",
    contactPhone: "",
    notes: "",
  });

  const utils = trpc.useUtils();
  const { data: pops, isLoading } = trpc.pops.list.useQuery();
  const createMutation = trpc.pops.create.useMutation({
    onSuccess: () => {
      utils.pops.list.invalidate();
      utils.dashboard.stats.invalidate();
      toast.success("POP criado com sucesso!");
      setIsDialogOpen(false);
      resetForm();
    },
  });
  const updateMutation = trpc.pops.update.useMutation({
    onSuccess: () => {
      utils.pops.list.invalidate();
      toast.success("POP atualizado com sucesso!");
      setIsDialogOpen(false);
      resetForm();
    },
  });
  const deleteMutation = trpc.pops.delete.useMutation({
    onSuccess: () => {
      utils.pops.list.invalidate();
      utils.dashboard.stats.invalidate();
      toast.success("POP deletado com sucesso!");
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      city: "",
      state: "",
      address: "",
      contactName: "",
      contactPhone: "",
      notes: "",
    });
    setEditingId(null);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.city || !formData.state) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData as any);
    }
  };

  const handleEdit = (pop: any) => {
    setFormData({
      name: pop.name,
      city: pop.city,
      state: pop.state,
      address: pop.address || "",
      contactName: pop.contactName || "",
      contactPhone: pop.contactPhone || "",
      notes: pop.notes || "",
    });
    setEditingId(pop.id);
    setIsDialogOpen(true);
  };

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
          <h1 className="text-3xl font-bold">POPs</h1>
          <p className="text-muted-foreground">Gestão de Pontos de Presença</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Novo POP
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar POP" : "Novo POP"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome *</label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="ex: POP São Paulo"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Cidade *</label>
                <Input
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  placeholder="ex: São Paulo"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Estado (UF) *</label>
                <Input
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value.toUpperCase() })
                  }
                  placeholder="ex: SP"
                  maxLength={2}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Endereço</label>
                <Input
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="ex: Av. Paulista, 1000"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Contato</label>
                <Input
                  value={formData.contactName}
                  onChange={(e) =>
                    setFormData({ ...formData, contactName: e.target.value })
                  }
                  placeholder="Nome do contato"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Telefone</label>
                <Input
                  value={formData.contactPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, contactPhone: e.target.value })
                  }
                  placeholder="ex: (11) 9999-9999"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Observações</label>
                <Input
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Observações adicionais"
                />
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

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pops?.map((pop) => (
          <Card key={pop.id}>
            <CardHeader>
              <CardTitle className="text-lg">{pop.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {pop.city}, {pop.state}
              </p>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {pop.address && (
                <div>
                  <span className="text-muted-foreground">Endereço:</span> {pop.address}
                </div>
              )}
              {pop.contactName && (
                <div>
                  <span className="text-muted-foreground">Contato:</span> {pop.contactName}
                </div>
              )}
              {pop.contactPhone && (
                <div>
                  <span className="text-muted-foreground">Telefone:</span> {pop.contactPhone}
                </div>
              )}
              {pop.notes && (
                <div>
                  <span className="text-muted-foreground">Notas:</span> {pop.notes}
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(pop)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    if (confirm("Tem certeza que deseja deletar?")) {
                      deleteMutation.mutate({ id: pop.id });
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

      {pops?.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            Nenhum POP cadastrado
          </CardContent>
        </Card>
      )}
    </div>
  );
}
