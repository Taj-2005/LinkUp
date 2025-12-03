import React, { useState } from 'react'
import { FaRegBookmark, FaBookmark, FaTh } from "react-icons/fa";

interface ProfileNavbarSelfProps {
  selected?: string;
  onSelectedChange?: (selected: string) => void;
}

const ProfileNavbarSelf = ({ selected: externalSelected, onSelectedChange }: ProfileNavbarSelfProps) => {
    const [internalSelected, setInternalSelected] = useState('links');
    const selected = externalSelected !== undefined ? externalSelected : internalSelected;

    const handleSelect = (value: string) => {
        if (onSelectedChange) {
            onSelectedChange(value);
        } else {
            setInternalSelected(value);
        }
    };

    return (
    <div className='w-full'>
        <div className='w-full'>
            <div className='flex justify-center items-center gap-8 md:gap-12 w-full transition-all duration-300'>
                <button onClick={() => handleSelect('links')}>
                {
                    selected === 'links' ?
                        <FaTh
                            size={36}
                            className='cursor-pointer text-violet-600 border-b-2 border-violet-600 pb-2'
                        />
                        :
                        <FaTh
                            size={36}
                            className='cursor-pointer text-primary-light/70 dark:text-white/70 pb-2 hover:text-violet-500 transition-colors'
                        />
                }
                </button>
                <button onClick={() => handleSelect('savedlinks')}>
                    {selected === 'savedlinks' ? (
                    <FaBookmark
                        size={36}
                        className='text-violet-600 border-b-2 border-violet-600 pb-2'
                    />
                    ) : (
                    <FaRegBookmark
                        size={36}
                        className='text-primary-light/70 dark:text-white/70 pb-2 hover:text-violet-500 transition-colors'
                    />
                    )}
                </button>
            </div>
        </div>
    </div>
    )
}

export default ProfileNavbarSelf
