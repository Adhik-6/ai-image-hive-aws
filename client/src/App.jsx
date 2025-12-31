import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CreatePage, HomePage, PageNotFound } from './pages/index.js'
import { NavBar } from './components/index.js'

function App() {
  

  return (
    <>
    <BrowserRouter>
      <NavBar/>
      <main className='px-5 pt-24 pb-10 sm:px-12 min-h-screen'>
        <Routes>
          <Route path={"/"} element={<HomePage/>}/>
          <Route path={"/create"} element={<CreatePage/>}/>
          <Route path={"*"} element={<PageNotFound/>}/>
        </Routes>
      </main>
    </BrowserRouter>
    </>
  )
}

export default App
