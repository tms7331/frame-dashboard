import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);


export interface Report {
    id?: number;      // Auto-generated ID
    address: string;
    summary: string;
    report: string;
}

export interface UserPrompt {
    id?: number;
    username: string;
    prompt: string;
}

export interface LeaderboardEntry {
    id?: number;
    category: string;
    wallet_address: string;
    username: string;
    score: number;
    comment?: string;
}


export async function getAllLeaderboardEntries() {
    const { data, error } = await supabase
        .from('leaderboard')
        .select('*');

    if (error) {
        throw error;
    }
    return data;
}

export async function getTopEntryForEachCategory() {
    const { data, error } = await supabase
        .rpc('get_top_entries');

    if (error) {
        throw error;
    }
    return data;
}


export async function getAllNews() {
    const { data, error } = await supabase
        .from('news')
        .select('*');

    if (error) {
        throw error;
    }
    return data;
}

export async function writeNewsEntry(tag: string, content: string) {
    const { data, error } = await supabase
        .from('news')
        .insert([{ tag, content }]);

    if (error) {
        throw error;
    }
    return data;
}

export async function getPortfolioEntryByWallet(walletAddress: string) {
    const { data, error } = await supabase
        .from('portfolio')
        .select('*')
        .eq('wallet_address', walletAddress);

    if (error) {
        throw error;
    }
    return data;
}

export async function writePortfolioEntry(walletAddress: string, content: string) {
    const { data, error } = await supabase
        .from('portfolio')
        .insert([{ wallet_address: walletAddress, content }]);

    if (error) {
        throw error;
    }
    return data;
}


export async function upsertLeaderboardEntry(entry: LeaderboardEntry) {
    const { data, error } = await supabase
        .from('leaderboard')
        .upsert(entry, { onConflict: 'username,category' });

    if (error) {
        throw error;
    }
    return data;
}


export async function getUserPrompt(username: string): Promise<UserPrompt | null> {
    const { data, error } = await supabase
        .from('user_prompts')
        .select('*')
        .eq('username', username)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
}

export async function upsertUserPrompt(username: string, prompt: string): Promise<UserPrompt> {
    const { data, error } = await supabase
        .from('user_prompts')
        .upsert({ username, prompt }, { onConflict: 'username' })
        .single();

    if (error) {
        throw error;
    }

    return data;
}


// To fill out DB
export async function dumpDummyLeaderboardEntries() {
    const entries: LeaderboardEntry[] = [
        // Broke entries
        { category: 'broke', wallet_address: '0xBroke1', username: 'user1', score: 100, comment: 'Broke - just starting out' },
        { category: 'broke', wallet_address: '0xBroke2', username: 'user2', score: 150, comment: 'Broke but learning' },
        { category: 'broke', wallet_address: '0xBroke3', username: 'user3', score: 200, comment: 'Broke and budgeting' },

        // Degen entries
        { category: 'degen', wallet_address: '0xDegen1', username: 'user4', score: 300, comment: 'Degen - high risk, high reward' },
        { category: 'degen', wallet_address: '0xDegen2', username: 'user5', score: 350, comment: 'Degen, no regrets' },
        { category: 'degen', wallet_address: '0xDegen3', username: 'user6', score: 400, comment: 'Degen, on a roll' },

        // Bluechip entries
        { category: 'bluechip', wallet_address: '0xBluechip1', username: 'user7', score: 500, comment: 'Bluechip, steady growth' },
        { category: 'bluechip', wallet_address: '0xBluechip2', username: 'user8', score: 550, comment: 'Bluechip, reliable' },
        { category: 'bluechip', wallet_address: '0xBluechip3', username: 'user9', score: 600, comment: 'Bluechip, long-term vision' },

        // Additional entries to make a dozen
        { category: 'broke', wallet_address: '0xBroke4', username: 'user10', score: 120, comment: 'Broke, but optimistic' },
        { category: 'degen', wallet_address: '0xDegen4', username: 'user11', score: 420, comment: 'Degen, playing smart' },
        { category: 'bluechip', wallet_address: '0xBluechip4', username: 'user12', score: 620, comment: 'Bluechip, consistent performer' },
    ];

    const { data, error } = await supabase
        .from('leaderboard')
        .insert(entries);

    if (error) {
        throw error;
    }
    return data;
}

export async function getReport(address: string): Promise<Report | null> {
    // using lowercase to avoid weird issues
    const addr = address.toLowerCase();
    const { data, error } = await supabase
        .from('report')
        .select('*')
        .eq('address', addr)
        .maybeSingle();

    if (error) {
        throw error;
    }
    return data;
}

export async function upsertReport(address: string, summary: string, reportText: string): Promise<Report> {
    // using lowercase to avoid weird issues
    const addr = address.toLowerCase();
    const { data, error } = await supabase
        .from('report')
        .upsert({ address: addr, summary, report: reportText }, { onConflict: 'address' })
        .single();

    if (error) {
        throw error;
    }
    return data;
}