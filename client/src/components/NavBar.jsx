import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom';
import { logo } from './../assets/index.js'
import { LightMode, DarkModeOutlined } from '@mui/icons-material';

const NavBar = () => {
  const [mode, setMode] = useState(true) // light - true
  const location = useLocation()
  const [isHome, setIsHome] = useState((location.pathname == "/")?true:false)

  useEffect(() => {
    if(!mode)
      document.documentElement.classList.add("dark")
    else
      document.documentElement.classList.remove("dark")
  }, [mode])

  useEffect(() => {
    setIsHome((location.pathname == "/")?true:false)
  },[location])


  return (
    <>
    <header className='bg-slate-200 dark:bg-slate-900 flex justify-between items-center p-2 sm:px-6 py-4 shadow-md dark:shadow-slate-500 fixed right-0 left-0 z-10'>

      <a href='https://huggingface.co/' target='_blank'rel="noopener noreferrer"><div className='h-fit w-28 dark:bg-white mx-1 overflow-hidden rounded-sm'>
        <img className='h-full w-full' src={logo} alt="OpenAI Logo" />
      </div>
      </a>

      <div className='flex gap-8 items-center'>
        <button onClick={() => setMode((prev) => !prev)} className='bg-slate-300 dark:bg-slate-700 rounded-full py-[5px] px-[5px] '>
          {mode?<LightMode/>:<DarkModeOutlined/>}
        </button>
        <Link to={isHome?"/Create":"/"}>
          <button className='bg-purple-400 rounded-lg px-2 py-1 text-white font-semibold'>{isHome?"+ Create":"Home"}</button>
        </Link>
      </div>

    </header>
    </>
  )
}

export default NavBar