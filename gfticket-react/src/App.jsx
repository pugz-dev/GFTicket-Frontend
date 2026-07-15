import { useState } from 'react'
import { BrowserRouter, Routes, Route, Link, Outlet, Navigate } from "react-router-dom";
import { EventList } from './components/event-list/EventList';
import { PageNotFound } from './components/page-not-found/PageNotFound'; 
import './App.css'
import { EventForm } from './components/event-form-component/EventFormComponent';

function Layout(){
  return(
    <>
    <div><h1>GFTICKET - ADMIN PANEL</h1></div>
    <nav>
      <Link to="/eventos" className="btn btn-link">
        List
      </Link>
      <Link to="/eventos/add" className="btn btn-link" style={{ marginLeft: "10px" }}>
        Add
      </Link>
    </nav>
    <br />
      <Outlet />
    </>
  );
}

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
         <Route index element={<Navigate to="/eventos" replace />} />

          <Route path="eventos" element={<EventList />} />
          <Route path="eventos/add" element={<EventForm />} />
          {/*
          <Route path="eventos/:id" element={<EventDetail />} />
          
          <Route path="eventos/edit/:id" element={<EventEdit />} /> 
           */}
        </Route>
        <Route path="*" element={<PageNotFound />}></Route>
      </Routes>
    </BrowserRouter>
    </>
    
  )
}

export default App
