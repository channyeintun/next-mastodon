import { cookies } from 'next/headers';
import SidebarNavigation from '@/components/molecules/SidebarNavigation';

export default async function SidebarSlot() {
    const cookieStore = await cookies();
    const instanceURL = cookieStore.get('instanceURL')?.value ?? null;
    const accessToken = cookieStore.get('accessToken')?.value ?? null;

    const isAuthenticated = !!accessToken;

    return (
        <SidebarNavigation
            isAuthenticated={isAuthenticated}
            instanceURL={instanceURL}
        />
    );
}
