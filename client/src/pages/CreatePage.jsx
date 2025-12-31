import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { surpriseMePrompts } from '../../constants/index.js'
import { Loader } from "./../components/index.js"
import { preview } from './../assets/index.js'
import { downloadImage } from '../utils/downloadImage.js';

const CreatePage = () => {
  const [newPost, setNewPost] = useState({ name:"", prompt:"", imageUrl: preview})
  const [errMsg, setErrMsg] = useState("")
  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const navigate = useNavigate();
  const devURL = import.meta.env.VITE_BACKEND_URL_DEV;
  const prodURL = import.meta.env.VITE_BACKEND_URL_PROD;

  function inchange(e){
    setErrMsg("");
    setNewPost((prev) => ({...prev, [e.target.name]:e.target.value}))
  }
  
  function getSurprisePrompts(currPrompt){
    let randomPrompt = surpriseMePrompts[Math.floor(Math.random()*(surpriseMePrompts.length))]
    if(randomPrompt == currPrompt) randomPrompt = getSurprisePrompts(currPrompt);
    return randomPrompt;
  }

  async function genImg(e){
    e.preventDefault();
    try{
      setErrMsg("")
      setLoading(true);
      let prompt = newPost.prompt;
      let mock = false;
      if(prompt.endsWith("#MOCK#")){ 
        prompt = prompt.slice(0, -6).trim();
        mock = true;
      }
      if(!prompt){
        setErrMsg("Prompt is required!")
        return
      }
      let baseURL = import.meta.env.DEV? devURL : prodURL;
      // console.log("Base URL:", baseURL);
      let response = await axios.post(`${baseURL}/generate`, { prompt, mock}) 
      // console.log("create page 1: ", response.data, " | ", typeof(response.data.b64))
      setNewPost({...newPost, imageUrl: response.data.imageUrl})
    } catch(err){
      console.log(err)
      let msg = err?.response?.data?.message || err.message || "Something went wrong";
      setErrMsg(msg.startsWith("You have reached")? "Free tier limit reached. Please try again next month.": msg)
    } finally{
      setLoading(false);
    }
  }

  async function shareToCom(){
    // console.log("Sharing to community: ", newPost)
    try{
      if(newPost.imageUrl == preview){
        setErrMsg("Can't share ungenerated images")
        return
      }
      // console.log("create page 2: ",newPost)
      setSharing(true)
      let baseURL = import.meta.env.DEV? devURL : prodURL;
      let response = await axios.post(`${baseURL}/posts`, newPost)
      // console.log("Successfully posted!")
      navigate("/");
    } catch(err){
      console.log(err);
      let msg = err?.response?.data?.message || err.message || "Something went wrong";
      setErrMsg(msg)
    } finally{
      setSharing(false);
    }
  }

  function handleSurpise(e){
    e.preventDefault()
    setErrMsg("")
    setNewPost((prev) => ({...prev, prompt: getSurprisePrompts(prev.prompt)}) )
  }

  
  async function downloadImg(e){
    e.preventDefault()
    if(!newPost.imageUrl || newPost.imageUrl===preview){ 
      window.alert("No image to download");
      return;
    }

    await downloadImage(newPost.imageUrl);
  }

  return (
    <section className='flex flex-col gap-4'>
      {sharing && (
        <div className='fixed top-0 bottom-0 left-0 right-0 bg-[#2525258f] z-20'>
          <Loader />
        </div>
      )}
      <div>
        <h1 className='font-semibold text-3xl mb-2'>Create</h1>
        <p className='text-slate-500 text-[15px]'>Describe your dream image, and our Hugging Face models will bring it to life. Share your masterpiece with the community or keep it for yourself.</p>
      </div>

      <form className='flex flex-col gap-4 mt-6 mb-4'>
        <div>
          <label htmlFor="name">Your Name or Title</label> <br />
          <input className='mt-1 border border-slate-300 dark:border-slate-600 dark:focus:border-slate-300 px-2 py-1 w-full' name='name' id='name' type="text" placeholder='Jhon Doe' value={newPost.name} onChange={inchange} />
        </div>

        <div>
          <label htmlFor="prompt">Prompt</label>
          <button onClick={handleSurpise} className='ml-5 bg-yellow-400 text-slate-800 font-serif rounded-md px-1 py-1'>Surprise me!</button> <br />
          <textarea className='mt-3 border bg-transparent border-slate-300 dark:border-slate-600 dark:focus:border-slate-300 px-2 py-1 w-full max-h-52 min-h-9' name='prompt' id='prompt' type="text" placeholder='A painting of a fox in the style of Starry Night' value={newPost.prompt} onChange={inchange} />
        </div>

        <div className='my-4 overflow-hidden relative mx-auto sm:mx-0 w-64 h-auto border-2 border-[#2323234c] dark:border-slate-700 dark:bg-slate-400 rounded-md p-2'>
          {loading && (
            <div className='absolute inset-0 h-full bg-[#2525258f]'>
              <Loader/>
            </div>
          )}
          <img className='w-full' src={newPost.imageUrl} alt="Image preview" />
        </div>

        <div className='w-full sm:w-64 -mb-2'>
          <div className='flex gap-3 sm:gap-5 flex-col sm:flex-row'>
            <button onClick={genImg} className='bg-green-500 w-full font-semibold rounded-md py-[0.4em] px-3 text-white'>Generate</button>
            <button onClick={downloadImg} className='bg-blue-500 w-full font-semibold rounded-md py-[0.4em] px-3 text-white'>Download</button>
          </div>
          {errMsg && <p className='text-center font-medium mt-4 text-md text-red-500'>{errMsg}</p>}
        </div>
      </form>

      <section>
        <p className='text-slate-500 text-[15px]'>** Once you have created the image, You can share it with others in the community **</p>
        <div className='w-full sm:w-64'>
          <button onClick={shareToCom} className='rounded-md w-full bg-purple-500 py-2 px-3 text-white font-semibold mt-3'>Share in Community</button>  
        </div>
      </section>

    </section>
  )
}

export default CreatePage
