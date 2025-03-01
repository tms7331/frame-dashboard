import { atom } from 'jotai'

export const walletAddressAtom = atom<string>('')
export const profileImageAtom = atom<string>('/placeholder.png?height=24&width=24')
// vitalik's address as default
export const portfolioUrlAtom = atom<string>('/portfolio/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')