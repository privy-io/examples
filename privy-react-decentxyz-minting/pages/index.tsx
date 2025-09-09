import type { NextPage } from 'next';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import Image from 'next/image';
import MintButton from "../components/MintButton";
import Link from 'next/link';
import Typeform from '../components/Typeform';
import { DecentSDK, edition } from "@decent.xyz/sdk";
import { ethers } from "ethers";

const Home: NextPage = () => {
  const RPC = "https://ethereum-goerli-rpc.allthatnode.com"; //for testing on Ethereum goerli; do not need for mainnet - other chains have different RPC endpoints you'll have to input here if contract is not on Ethereum mainnet

  const CHAINID = 1; //change to 5 to test on goerli
  
  {/* make sure to update for your contract address; if you created your contract through the HQ, you can grab its address off the Success or Admin page */}
  const ANTHOLOGY = '0x5eB804cf3f0c6f97e99631961A53bCad2bbA4851';
  {/* can be deleted if only using 1 contract */}
  const RUFFDRAFT = '0x59aa1D3BB2C6ea9f09A16296718B62D3A4Df0782';
  const MADUKES = '0xF3C6B02F3b5482CDed898C82e08D1fa4Cf0f2D43';

  const [anthologyMints, setAnthologyMints] = useState(0);
  const [ruffdraftMints, setRuffdraftMints] = useState(0);
  const [madukesMints, setMadukesMints] = useState(0);
  
  // required to display the mint counts you'll see below
  const updateContractInfo = async () => {
    const provider = ethers.getDefaultProvider(); //add RPC as parameter for goerli
    const sdk = new DecentSDK(CHAINID, provider);
    const anthology = await edition.getContract(sdk, ANTHOLOGY);
    const ruffdraft = await edition.getContract(sdk, RUFFDRAFT);
    const madukes = await edition.getContract(sdk, MADUKES);

    setAnthologyMints(parseInt(await anthology.totalSupply()))
    setRuffdraftMints(parseInt(await ruffdraft.totalSupply()));
    setMadukesMints(parseInt(await madukes.totalSupply()));
  }

  useEffect(() => {
    updateContractInfo();
  }, [])
  

  return (
    <div className={`${styles.container} background`}>
      {/* set metadata; reminder to also clear out the Burble images from public/images */}
      <Head>
        <title>Mint J Dilla Anthology</title>
        <meta
          name="description"
          content='Custom mint site by decent.xyz for fans to mint NFTs from the J Dilla collection.'
        />
        <link rel="icon" href="/images/burble-icon.png" />
      </Head>

      <main className={`${styles.main} lg:mx-20 sm:mx-10 xs:mx-2`}>
        {/* make sure to update the images, contract information & most importantly (!) mint button props in the section below */}
        {/* in most cases, you will likely only have 1 contract that needs minting so just use the first container and delete the next two */}
        <div className='mt-12 lg:mx-20 mx-10'>
          <h1 className={`${styles.title} font-medium`}>
            The Official J Dilla Legacy Collection
          </h1>
          <div className={`${styles.description} text-center font-[300]`}>
            {`The J Dilla Legacy Collection is a web3 digital collection that creates a new way to experience the musical impact of J Dilla. It includes some of the most iconic artwork made by renowned artist Desiree Kelly, exclusive physical collectors items, and interactive music collectibles that cannot be found anywhere else. All of this will lead to an ultimate music Block Party experience in the metaverse. The collection is designed to give fans a glimpse into the life and work of one of hip-hop's most influential artists curated through the eyes of the person who knew him best - his mother, Ma Dukes.`}
          </div>
        </div>

        <div className='flex flex-wrap lg:justify-between gap-8 justify-center mt-10'>
          <div className='text-center space-y-4 bg-white bg-opacity-10 rounded-md py-4 px-12'>
            <p className='tracking-widest text-2xl font-[600]'>J Dilla Anthology</p>
            <div className='relative w-64 h-64 drop-shadow-md'>
              <Image src="/images/crosswords.png" object-fit="contain" fill alt={'crosswords'} />
            </div>
            <MintButton chainId={CHAINID} contractAddress={ANTHOLOGY} price={'.05'} />
            <div className='space-y-2 w-64'>
              <p>Price: 0.05 ETH</p>
              <p>Minted: {anthologyMints}/3,333</p> 
              <p>1x Sneaker Contest Entry</p>
            </div>
          </div>
          {/* can be deleted if only using 1 contract */}
          <div className='text-center space-y-4 bg-white bg-opacity-10 rounded-md py-4 px-12'>
            <p className='tracking-widest text-2xl font-[600]'>Ruff Draft</p>
            <div className='relative w-64 h-64 drop-shadow-md'>
              <Image src="/images/dilla-picture.jpg" object-fit="contain" fill alt={'crosswords'} />
            </div>
            <MintButton chainId={CHAINID} contractAddress={RUFFDRAFT} price={'0.2'} />
            <div className='space-y-2 w-64'>
              <p>Price: 0.2 ETH</p>
              <p>Minted: {ruffdraftMints}/639</p> 
              <p>4x Sneaker Contest Entry</p>
              <p>Shipped poster included and authenticated on chain via QR Code</p>
            </div>
          </div>
          {/* can be deleted if only using 1 contract */}
          <div className='text-center space-y-4 bg-white bg-opacity-10 rounded-md py-4 px-12'>
            <p className='tracking-widest text-2xl font-[600]'>Ma Dukes Says</p>
            <div className='relative w-64 h-64 drop-shadow-md'>
              <Image src="/images/animation.gif" object-fit="contain" fill alt={'crosswords'} />
            </div>
            <MintButton chainId={CHAINID} contractAddress={MADUKES} price={'0.3'} />
            <div className='space-y-2 w-64'>
              <p>Price: 0.3 ETH</p>
              <p>Minted: {madukesMints}/444</p> 
              <p>6x Sneaker Contest Entry</p>
              <p>Shipped poster included and authenticated on chain via QR Code</p>
              <p>Hidden audio message recorded by Ma Dukes</p>
            </div>
          </div>
        </div>

        {/* can probably delete; not a bad idea to use typeform to collect email addresses / additional info from collectors though */}
        <div className='h-full w-full lg:mt-12 mt-8 flex justify-center'>
          <Typeform />
        </div>
      </main>

      {/* would appreciate the footer s/o but do what you will 🤝 */}
      <footer className='py-8 border-t border-white text-white justify-center flex items-center'>
       <p className='pr-2 tracking-widest text-sm font-[400]'>Powered by </p>
       <Link href="http://decent.xyz/" className='pt-1'>
          <Image src='/images/decent.png' height={12} width={85} alt='Decent 💪' />
        </Link>
      </footer>
    </div>
  );
};

export default Home;
