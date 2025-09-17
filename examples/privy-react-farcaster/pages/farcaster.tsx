import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import {
	useLogout,
	usePrivy,
	useExperimentalFarcasterSigner,
	FarcasterWithMetadata,
} from '@privy-io/react-auth'
import Head from 'next/head'
import useSWRMutation from 'swr/mutation'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import {
	ExternalEd25519Signer,
	HubRestAPIClient,
} from '@standard-crypto/farcaster-js'
import axios from 'axios'

export default function FarcasterPage() {
	const router = useRouter()

	const [castInput, setCastInput] = useState('')

	const { user } = usePrivy()

	const {
		getFarcasterSignerPublicKey,
		signFarcasterMessage,
		requestFarcasterSignerFromWarpcast,
	} = useExperimentalFarcasterSigner()

	const privySigner = new ExternalEd25519Signer(
		signFarcasterMessage,
		getFarcasterSignerPublicKey
	)
	const hubClient = new HubRestAPIClient({
		hubUrl: 'https://hub-api.neynar.com',
		axiosInstance: axios.create({
			headers: { api_key: 'NEYNAR_PRIVY_DEMO' },
		}),
	})

	const { logout } = useLogout({
		onSuccess: () => {
			console.log('🫥 ✅ logOut onSuccess')
			router.push('/')
		},
	})

	const farcasterAccount = user?.linkedAccounts.find(
		(a) => a.type === 'farcaster'
	) as FarcasterWithMetadata
	const signerPublicKey = farcasterAccount?.signerPublicKey

	const getUserCasts = async (
		url: string
	): Promise<{
		result: any
		next: string
	}> => {
		return (await (
			await fetch(url, {
				headers: {
					api_key: 'NEYNAR_PRIVY_DEMO',
					accept: 'application/json',
				},
			})
		).json()) as {
			result: any
			next: string
		}
	}

	const { data, isMutating, trigger } = useSWRMutation<{
		result: any
		next: string
	}>(
		farcasterAccount
			? `https://api.neynar.com/v1/farcaster/casts?fid=${farcasterAccount.fid}&viewerFid=3&limit=25`
			: undefined,
		getUserCasts
	)

	useEffect(() => {
		if (farcasterAccount) setTimeout(() => trigger(), 2000)
	}, [!!farcasterAccount])

	const formattedCasts = data?.result.casts.map((cast: any) => {
		return (
			<div className='mt-4 rounded-md border bg-slate-100 p-4' key={cast.hash}>
				<p className='my-2 text-sm text-gray-600'>Hash: {cast.hash}</p>
				<p className='my-2 text-sm text-gray-600'>Text: {cast.text}</p>
				<p className='my-2 text-sm text-gray-600'>
					Likes: {cast.reactions.count}
				</p>
				<p className='my-2 text-sm text-gray-600'>
					Recasts: {cast.recasts.count}
				</p>
				<button
					className='rounded-md bg-violet-600 px-4 py-2 text-sm text-white hover:bg-violet-700'
					onClick={async () => {
						const { hash } = await hubClient.removeCast(
							cast.hash,
							farcasterAccount.fid!,
							privySigner
						)
						toast(`Removed cast. Message hash: ${hash}`)
						setTimeout(() => trigger(), 2000)
					}}
				>
					Remove Cast
				</button>
				<button
					className='ml-4 rounded-md bg-violet-600 px-4 py-2 text-sm text-white hover:bg-violet-700'
					onClick={async () => {
						const { hash } = await hubClient.submitReaction(
							{
								type: 'like',
								target: {
									hash: cast.hash,
									fid: cast.author.fid,
								},
							},
							farcasterAccount.fid!,
							privySigner
						)
						toast(`Liked cast. Message hash: ${hash}`)
						setTimeout(() => trigger(), 2000)
					}}
				>
					Like
				</button>
				<button
					className='ml-4 rounded-md bg-violet-600 px-4 py-2 text-sm text-white hover:bg-violet-700'
					onClick={async () => {
						const { hash } = await hubClient.submitReaction(
							{
								type: 'recast',
								target: {
									hash: cast.hash,
									fid: cast.author.fid,
								},
							},
							farcasterAccount.fid!,
							privySigner
						)
						toast(`Recasted cast. Message hash: ${hash}`)
						setTimeout(() => trigger(), 2000)
					}}
				>
					Recast
				</button>
			</div>
		)
	})

	return (
		<>
			<Head>
				<title>Privy Farcaster Demo</title>
			</Head>

			<main className='flex min-h-screen flex-col bg-privy-light-blue px-4 py-6 sm:px-20 sm:py-10'>
				<ToastContainer />
				<div className='flex flex-row justify-between'>
					<h1 className='text-2xl font-semibold'>Farcaster Demo</h1>
					<div className='flex flex-row gap-4'>
						<button
							onClick={logout}
							className='rounded-md bg-violet-200 px-4 py-2 text-sm text-violet-700 hover:text-violet-900'
						>
							Logout
						</button>
					</div>
				</div>
				<p className='mb-2 mt-6 text-sm font-bold uppercase text-gray-600'>
					Farcaster User
				</p>
				<div className='rounded-md border bg-slate-100 p-4'>
					<p className='my-2 text-sm text-gray-600'>
						Display Name: {farcasterAccount?.displayName}
					</p>
					<p className='my-2 text-sm text-gray-600'>
						Username: {farcasterAccount?.username}
					</p>
					<p className='my-2 text-sm text-gray-600'>
						Farcaster Signer: {signerPublicKey ?? 'NONE'}
					</p>
				</div>
				<div className='flex flex-wrap gap-4'>
					{!signerPublicKey && (
						<button
							className='mt-4 rounded-md bg-violet-600 px-4 py-2 text-sm text-white hover:bg-violet-700'
							onClick={requestFarcasterSignerFromWarpcast}
							disabled={!!signerPublicKey}
						>
							Request Farcaster Signer from Warpcast
						</button>
					)}
				</div>
				<p className='mb-2 mt-6 text-sm font-bold uppercase text-gray-600'>
					Submit a cast
				</p>
				<div className='flex flex-wrap gap-4'>
					<input
						placeholder='My cast text!'
						className='w-full rounded-md'
						type='text'
						value={castInput}
						onChange={(e) => setCastInput(e.target.value)}
					></input>
					<button
						className='rounded-md bg-violet-600 px-4 py-2 text-sm text-white hover:bg-violet-700'
						onClick={async () => {
							const { hash } = await hubClient.submitCast(
								{
									text: castInput,
								},
								farcasterAccount.fid!,
								privySigner
							)
							setCastInput('')
							toast(`Submitted cast. Message hash: ${hash}`)
							setTimeout(() => trigger(), 2000)
						}}
						disabled={!castInput}
					>
						Submit
					</button>
				</div>
				<p className='mb-2 mt-6 text-sm font-bold uppercase text-gray-600'>
					My Casts
				</p>
				<div className='gap-4'>{!isMutating && formattedCasts}</div>
				<p className='mb-2 mt-6 text-sm font-bold uppercase text-gray-600'>
					Follow Privy
				</p>
				<div className='flex flex-wrap gap-4'>
					<button
						className='rounded-md bg-violet-600 px-4 py-2 text-sm text-white hover:bg-violet-700'
						onClick={async () => {
							const { hash } = await hubClient.followUser(
								188926,
								farcasterAccount.fid!,
								privySigner
							)
							toast(`Followed user. Message hash: ${hash}`)
							setTimeout(() => trigger(), 2000)
						}}
					>
						Follow
					</button>
					<button
						className='rounded-md bg-violet-600 px-4 py-2 text-sm text-white hover:bg-violet-700'
						onClick={async () => {
							const { hash } = await hubClient.unfollowUser(
								188926,
								farcasterAccount.fid!,
								privySigner
							)
							toast(`Unfollowed user. Message hash: ${hash}`)
							setTimeout(() => trigger(), 2000)
						}}
					>
						Unfollow
					</button>
				</div>
			</main>
		</>
	)
}
