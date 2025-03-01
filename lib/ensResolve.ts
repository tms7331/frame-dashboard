import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

const client = createPublicClient({
    chain: mainnet,
    transport: http(),
});

export async function resolveENS(ensNameOrAddress: string): Promise<string> {
    // Check if input looks like an ENS name
    if (ensNameOrAddress.endsWith('.eth')) {
        try {
            const address = await client.getEnsAddress({ name: ensNameOrAddress });
            return address || ensNameOrAddress; // Return resolved address or original input
        } catch (error) {
            console.error('Error resolving ENS:', error);
            return ensNameOrAddress;
        }
    }
    return ensNameOrAddress;
}
