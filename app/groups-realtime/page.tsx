import { createClient } from '@/utils/supabase/server'
import { RealtimeGroupList } from '@/domains/group/components/realtime-group-list'
import { redirect } from 'next/navigation'

export default async function GroupsRealtimePage() {
  const supabase = await createClient()
  
  // Vérification de l'authentification côté serveur
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Récupération initiale des groupes avec RLS (SSR)
  const { data: initialGroups, error } = await supabase
    .from('groups')
    .select('id, name, code, type, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erreur lors de la récupération des groupes:', error)
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">
          Démonstration Supabase + Realtime
        </h1>
        <p className="text-gray-600">
          Cette page démontre l'utilisation de Supabase avec SSR et Realtime.
          Les données sont récupérées côté serveur avec RLS, puis mises à jour
          en temps réel côté client.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Utilisateur connecté: {user.email}
        </p>
      </div>

      <RealtimeGroupList initialGroups={initialGroups || []} />
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">
          Fonctionnalités démontrées :
        </h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✅ SSR avec @supabase/ssr (données initiales)</li>
          <li>✅ Authentification côté serveur avec getUser()</li>
          <li>✅ RLS (Row Level Security) automatique</li>
          <li>✅ Realtime WebSocket avec filtrage RLS</li>
          <li>✅ Hydratation client sans problème de session</li>
        </ul>
      </div>
    </div>
  )
}

