import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Network, Lock, Mail } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);

  const handleManuLogin = () => {
    setIsLoading(true);
    window.location.href = getLoginUrl();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Login container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <Network className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">ISP NOC</h1>
              <p className="text-sm text-slate-400">System</p>
            </div>
          </div>
          <p className="text-slate-400 text-sm mt-2">
            Sistema de Gestão de Rede para Provedores de Internet
          </p>
        </div>

        {/* Login card */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader className="space-y-2 pb-6">
            <CardTitle className="text-2xl text-white">Bem-vindo</CardTitle>
            <CardDescription className="text-slate-400">
              Faça login para acessar o painel de controle
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* OAuth Login */}
            <div className="space-y-3">
              <Button
                onClick={handleManuLogin}
                disabled={isLoading}
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Fazer Login com Manus
                  </>
                )}
              </Button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-800/50 text-slate-400">Informações</span>
              </div>
            </div>

            {/* Info section */}
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <Mail className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-slate-300">
                    Use suas credenciais Manus para fazer login
                  </p>
                  <p className="text-slate-500 text-xs mt-1">
                    Você será redirecionado para o portal de autenticação
                  </p>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-2 pt-4 border-t border-slate-700">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Funcionalidades
              </p>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  Gestão de equipamentos de rede
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  Monitoramento em tempo real
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  Auditoria completa de operações
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  Controle de acesso por roles
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-slate-500">
          <p>ISP NOC System v1.0.0</p>
          <p className="mt-2">
            © 2026 - Sistema de Gestão de Rede para Provedores
          </p>
        </div>
      </div>

      {/* Status indicator */}
      <div className="fixed bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-xs text-slate-400 backdrop-blur-sm">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        Sistema Online
      </div>
    </div>
  );
}
