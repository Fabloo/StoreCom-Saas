import { SidebarInset } from "@/components/ui/sidebar"
import { Header } from "./header"

export function MainContent({ children }: { children: React.ReactNode }) {
    return (
        <SidebarInset>
            <Header />
            <main className="flex-1 p-4 sm:p-6 bg-background">
                {children}
            </main>
        </SidebarInset>
    )
}
