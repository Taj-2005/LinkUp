import React, { useState } from 'react'
import { FaRegBookmark, FaBookmark, FaTh } from "react-icons/fa";

interface NavbarProps {
    user: string;
}

const ProfileNavbar = ({user} : NavbarProps) => {
    const [selected , setSelected] = useState('links');

    return (
    <div className='w-full'>
        <div className='w-full'>
            <div className='flex justify-center items-center gap-50 w-full'>
                <button>
                {
                    selected === 'links' ? 
                        <FaTh 
                            size={36} 
                            className='cursor-pointer text-primary-light dark:text-white border-b-2 border-amber-50 pb-2' 
                            onClick={() => setSelected('links')} 
                        /> 
                        : 
                        <FaTh 
                            size={36} 
                            className='cursor-pointer text-primary-light/70 dark:text-white/70 pb-2' 
                            onClick={() => setSelected('links')} 
                        />
                }
                </button>
                {user === 'tajuddinshaik_6' && (
                <button onClick={() => setSelected('savedlinks')}>
                    {selected === 'savedlinks' ? (
                    <FaBookmark
                        size={36}
                        className='text-primary-light dark:text-white border-b-2 border-amber-50 pb-2'
                    />
                    ) : (
                    <FaRegBookmark
                        size={36}
                        className='text-primary-light/70 dark:text-white/70 pb-2'
                    />
                    )}
                </button>
                )}
            </div>
        </div>
    </div>
    )
}

export default ProfileNavbar