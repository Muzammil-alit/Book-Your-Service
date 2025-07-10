
// Type Imports
import type { ChildrenType } from '@core/types'
import type { Locale } from '@configs/i18n'

// Layout Imports
import LayoutWrapper from '@layouts/LayoutWrapper'
import VerticalLayout from '@layouts/VerticalLayout'
import HorizontalLayout from '@layouts/HorizontalLayout'

// Component Imports
import Providers from '@components/Providers'
import Navigation from '@components/layout/vertical/Navigation'
import Navbar from '@components/layout/vertical/Navbar'
// import Customizer from '@core/components/customizer'
// import ScrollToTop from '@core/components/scroll-to-top'
// import AuthGuard from '@/hocs/AuthGuard'


// Config Imports
import { i18n } from '@configs/i18n'

// Util Imports
import { getMode, getSystemMode } from '@core/utils/serverHelpers'

const Layout = async (props: ChildrenType & { params: Promise<{ lang: Locale }> }) => {
  const params = await props.params

  const { children } = props

  // Vars
  const direction = i18n.langDirection[params.lang]
  const mode = await getMode()
  const systemMode = await getSystemMode()

  return (
    <Providers direction={direction}>
      {/* <AuthGuard> */}
        <LayoutWrapper
          systemMode={systemMode}
          verticalLayout={
            <VerticalLayout
              navigation={<Navigation  mode={mode} />}
              navbar={<Navbar />}
            // footer={<VerticalFooter />}
            >
              {children}
            </VerticalLayout>
          }
          horizontalLayout={
            <HorizontalLayout>
              {children}
            </HorizontalLayout>
          }
        />
    </Providers>
  )
}

export default Layout
