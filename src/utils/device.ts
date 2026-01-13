/**
 * Utility to detect if a device is mobile based on its user-agent string.
 */
export function isMobileDevice(userAgent: string): boolean {
    if (!userAgent) return false;

    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    return mobileRegex.test(userAgent);
}
