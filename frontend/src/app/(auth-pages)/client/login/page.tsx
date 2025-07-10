// Component Imports
import ClientLogin from '@/views/auth/ClientLogin'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const ClientLoginPage = async () => {
  // Vars
  const mode = await getServerMode()

  return <ClientLogin mode={mode} />
}

export default ClientLoginPage 