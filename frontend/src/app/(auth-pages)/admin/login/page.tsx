// Component Imports
import AdminLogin from '@/views/auth/AdminLogin'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const AdminLoginPage = async () => {
  // Vars
  const mode = await getServerMode()

  return <AdminLogin mode={mode} />
}

export default AdminLoginPage 