// builds the  layout which is two columns, side bar on the left and main query writing for LLM on the right
import Sidebar from '../layout/Sidebar'
import { useThemeStore } from '../../store/themeStore'
import { useSidebarStore } from '../../store/sideBarStore'
import MiniSidebar from './MiniSidebar'

//props to basically define the structure of the layout and  pass on the content  to children (Home Page)
interface AppLayoutProps {
  children: React.ReactNode
}

// So going by design, the children  is home pagee or any page on right, can reuse this code 
export default function AppLayout({ children }: AppLayoutProps) {
    const { isDark } = useThemeStore()
    const { isSidebarOpen } = useSidebarStore()
    return (
        <div className={`flex h-screen overflow-hidden ${
    isDark ? 'bg-[#0f0f0f]' : 'bg-gray-50'
  }`}>
     {isSidebarOpen ? <Sidebar /> : <MiniSidebar />}
        <main className="flex-1 overflow-y-auto">
            {children}
        </main>
        </div>
    )
}

//flex -h screen -> full height and flexx row  , flex -1 -> takes all space after the sidebar, oveerflow-y-auto -> right content to flow independently

