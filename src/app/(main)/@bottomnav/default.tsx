import { cookies } from 'next/headers';
import BottomNavigation from '@/components/molecules/BottomNavigation';

export default async function BottomNavSlot() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value ?? null;

    const isAuthenticated = !!accessToken;

    return (
        <BottomNavigation
            isAuthenticated={isAuthenticated}
        />
    );
}
