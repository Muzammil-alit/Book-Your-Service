// Component Imports
import ClientRegister from '@/views/auth/ClientRegister'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const ClientRegisterPage = async () => {
  // Vars
  const mode = await getServerMode()

  return <ClientRegister mode={mode} />
}

export default ClientRegisterPage 