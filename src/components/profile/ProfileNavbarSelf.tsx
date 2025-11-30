import React, { useState } from 'react'
import { FaRegBookmark, FaBookmark, FaTh } from "react-icons/fa";


const ProfileNavbarSelf = () => {
    const [selected , setSelected] = useState('links');

    return (
    <div className='w-full'>
        <div className='w-full'>
            <div className='flex justify-center items-center gap-50 w-full transition-all duration-300'>
                <button>
                {
                    selected === 'links' ? 
                        <FaTh 
                            size={36} 
                            className='cursor-pointer text-violet-600 border-b-2 border-violet-600 pb-2' 
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
                <button onClick={() => setSelected('savedlinks')}>
                    {selected === 'savedlinks' ? (
                    <FaBookmark
                        size={36}
                        className='text-violet-600 border-b-2 border-violet-600 pb-2'
                    />
                    ) : (
                    <FaRegBookmark
                        size={36}
                        className='text-primary-light/70 dark:text-white/70 pb-2'
                    />
                    )}
                </button>
            </div>
        </div>
    </div>
    )
}

export default ProfileNavbarSelf