
// Helper function to extract UUID from the filename
export default function extractUUID(filename: string): string | null {
    const match = filename.match(/_([a-f0-9\-]{36})_/);
    return match ? match[1] : null;
}
