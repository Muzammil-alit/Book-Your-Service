// Component Imports
import CarerLogin from '@/views/auth/CarerLogin'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const CarerLoginPage = async () => {
  // Vars
  const mode = await getServerMode()

  return <CarerLogin mode={mode} />
}

export default CarerLoginPage 