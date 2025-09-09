import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid'
import { usePrivy } from '@privy-io/react-auth';

const LoginButton = () => {
    const { ready, authenticated, user, login, logout } = usePrivy();

    const truncateEmail = (email: string) => {
        return email.length < 24 ? email : email.substring(0, 20) + '...';
    }

    const truncateWallet = (address: string) => {
        return address.substring(0, 16) + '...' + address.substring(address.length - 4);
    }
    
    if (!ready) {
        return null;
    }

    return (
        <>
            {authenticated ?
            <Menu as="div" className="relative inline-block text-left">
                <div>
                    <Menu.Button className="flex items-center text-white hover:text-gray-300 active:text-gray-400">
                    <span className="sr-only">Open options</span>
                    <EllipsisVerticalIcon className="h-6 w-6" aria-hidden="true" />
                    </Menu.Button>
                </div>
                <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                >
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-violet-700 shadow-lg ring-1 ring-violet-700 ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                        {user?.email && 
                            <Menu.Item>
                                <p className='block px-4 py-2 text-violet-200 text-sm'>
                                    {truncateEmail(user?.email?.address as string)}
                                </p>
                            </Menu.Item>
                        }
                        {user?.wallet && 
                            <Menu.Item>
                                <p className='block px-4 py-2 text-violet-200 text-sm'>
                                    {truncateWallet(user?.wallet?.address as string)}
                                </p>
                            </Menu.Item>
                        }
                        <Menu.Item>
                            <p
                                className='block px-4 py-2 text-violet-200 text-sm hover:text-white active:text-white font-[500]'
                                onClick={logout}
                            >
                                Logout
                            </p>
                        </Menu.Item>
                    </div>
                    </Menu.Items>
                </Transition>
            </Menu> :
            <button
                onClick={login}
                className='bg-violet-700 text-white hover:bg-white hover:text-violet-700 px-5 py-1 rounded-full font-[500]'
            >
                Login
            </button>
        }
        </>
    )
}

export default LoginButton;
