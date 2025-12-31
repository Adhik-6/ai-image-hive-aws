import { download } from '../assets/index.js'
import { downloadImage } from "./../utils/downloadImage.js"

const Card = ({data}) => {

  const handleDownloadImg = async () => await downloadImage(data.imageUrl);

  return (
    <div className='card_cont min-h-42.5
     min-w-42.5 border border-slate-800 overflow-hidden rounded-lg relative'>
      <img className='w-full h-full' src={data.imageUrl} />
      <article className='hover_bg absolute bottom-[-200%] left-1 right-1 rounded-lg p-2 bg-slate-800 text-white'>
        <div>
          <p className='text-[12px]'>{data.prompt}</p>
        </div>
        <div className='flex mt-2 items-center justify-between'>
          <div className='flex items-center'>
            <div className='inline text-xs bg-emerald-700 p-[2px_6px] mr-1.5 rounded-full'>{data.name.charAt(0)}</div>
            <p className='inline text-[15px]'>{data.name}</p>
          </div>
          <button onClick={handleDownloadImg} className='h-7 inline bg-slate-100 rounded-full'>
            <img className='w-full h-full' src={download} alt="Download" />
          </button>
        </div>
      </article>
    </div>
  )
}

export default Card