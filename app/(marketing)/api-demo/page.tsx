"use client";

import { useState } from "react";
import { PageContainer } from "@/shared/components/page-container";
import { PageHeader } from "@/shared/components/page-header";
import { GroupPreview, useApiHealth } from "@/shared/components/group-preview";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Search, Activity, Zap } from "lucide-react";

export default function ApiDemoPage() {
  const [groupCode, setGroupCode] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const { isHealthy, lastCheck } = useApiHealth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (groupCode.trim()) {
      setShowPreview(true);
    }
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Démonstration des HTTP Actions"
        subtitle="Découvrez les capacités de l'API Convex HTTP Actions"
      />

      <div className="space-y-8">
        {/* Statut de l'API */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Statut de l'API
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge 
                  className={
                    isHealthy === null 
                      ? "bg-gray-100 text-gray-800"
                      : isHealthy 
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                  }
                >
                  {isHealthy === null ? "Vérification..." : isHealthy ? "En ligne" : "Hors ligne"}
                </Badge>
                <span className="text-sm text-gray-500">
                  {lastCheck && `Dernière vérification : ${lastCheck.toLocaleTimeString("fr-FR")}`}
                </span>
              </div>
              <div className="text-sm font-mono text-gray-600">
                https://peaceful-chinchilla-149.convex.site
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recherche de groupe */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              API Publique des Groupes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Entrez un code de groupe (ex: ABC123)"
                  value={groupCode}
                  onChange={(e) => setGroupCode(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={!groupCode.trim()}>
                  Rechercher
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Cette API permet de récupérer les informations publiques d'un groupe via son code d'invitation.
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Prévisualisation du groupe */}
        {showPreview && groupCode && (
          <GroupPreview 
            code={groupCode} 
            className="animate-in slide-in-from-bottom-4 duration-300"
          />
        )}

        {/* Documentation des endpoints */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Endpoints disponibles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-sm mb-2">GET /health</h4>
                <p className="text-sm text-gray-600 mb-2">Vérification du statut de l'API</p>
                <div className="bg-gray-50 p-3 rounded-md font-mono text-sm">
                  curl -X GET "https://peaceful-chinchilla-149.convex.site/health"
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2">GET /api/groups/info</h4>
                <p className="text-sm text-gray-600 mb-2">Récupération des informations publiques d'un groupe</p>
                <div className="bg-gray-50 p-3 rounded-md font-mono text-sm">
                  curl -X GET "https://peaceful-chinchilla-149.convex.site/api/groups/info?code=ABC123"
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2">POST /webhooks/external</h4>
                <p className="text-sm text-gray-600 mb-2">Endpoint sécurisé pour les webhooks externes</p>
                <div className="bg-gray-50 p-3 rounded-md font-mono text-sm">
                  curl -X POST "https://peaceful-chinchilla-149.convex.site/webhooks/external" \<br/>
                  &nbsp;&nbsp;-H "Authorization: Bearer YOUR_SECRET" \<br/>
                  &nbsp;&nbsp;-d '{"{"}event": "test"{"}"}'
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informations techniques */}
        <Card>
          <CardHeader>
            <CardTitle>Informations techniques</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-semibold mb-2">Fonctionnalités</h5>
                <ul className="space-y-1 text-gray-600">
                  <li>• Authentification automatique via @convex-dev/auth</li>
                  <li>• Support CORS complet</li>
                  <li>• Gestion d'erreurs robuste</li>
                  <li>• Endpoints publics et sécurisés</li>
                  <li>• Validation des paramètres</li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold mb-2">Cas d'usage</h5>
                <ul className="space-y-1 text-gray-600">
                  <li>• API publique pour le partage</li>
                  <li>• Webhooks de services tiers</li>
                  <li>• Intégrations externes</li>
                  <li>• Upload de fichiers</li>
                  <li>• Monitoring et health checks</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
