import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

// Initialize viem client
const client = createPublicClient({
    chain: mainnet,
    transport: http(),
});

/**
 * Resolves an ENS name to an Ethereum address.
 * @param ensNameOrAddress - The input string (ENS name or Ethereum address)
 * @returns The Ethereum address if it is an ENS name, otherwise returns the input.
 */
export async function resolveENS(ensNameOrAddress: string): Promise<string> {
    // Check if input looks like an ENS name
    if (ensNameOrAddress.endsWith('.eth')) {
        try {
            const address = await client.getEnsAddress({ name: ensNameOrAddress });
            return address || ensNameOrAddress; // Return resolved address or original input
        } catch (error) {
            console.error('Error resolving ENS:', error);
            return ensNameOrAddress; // Return input if resolution fails
        }
    }
    return ensNameOrAddress; // Return original if not ENS
}
