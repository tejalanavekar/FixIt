// builds the  layout which is two columns, side bar on the left and main query writing for LLM on the right

import Sidebar from '../layout/Sidebar'

//props to basically define the structure of the layout and  pass on the content  to children (Home Page)
interface AppLayoutProps {
  children: React.ReactNode
}

// So going by design, the children  is home pagee or any page on right, can reuse this code 
export default function AppLayout({ children }: AppLayoutProps) {
    return (
        <div className="flex h-screen bg-[#0f0f0f] overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
            {children}
        </main>
        </div>
    )
}

//flex -h screen -> full height and flexx row  , flex -1 -> takes all space after the sidebar, oveerflow-y-auto -> right content to flow independently

