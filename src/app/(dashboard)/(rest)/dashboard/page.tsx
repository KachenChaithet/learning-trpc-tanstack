import { EntityContainer } from "@/app/components/entity-components"
import HomeContents from "@/app/components/home-contents"
import { DashboardContainer } from "@/app/features/dashboard/components/dashboard"
import SignOut from "@/components/SignOut"


const DashboardPage = () => {
    return (
        <DashboardContainer>
            <HomeContents/>
        </DashboardContainer>
    )
}
export default DashboardPage

