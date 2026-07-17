import { useState } from 'react'
import { BrowserRouter, Routes, Route, Link, Outlet, Navigate } from "react-router-dom";
import { EventList } from './components/event-list/EventList';
import { PageNotFound } from './components/page-not-found/PageNotFound'; 
import './App.css'
import { EventForm } from './components/event-form-component/EventFormComponent';
import { EventDetail } from './components/event-detail-component/EventDetailComponent';

function Layout(){
  return(
    <>
    <header className="admin-header">
      <h1>GFTICKET - ADMIN PANEL</h1>
      <nav className="admin-nav">
        <Link to="/eventos" className="btn btn-link">
          List
        </Link>
        <Link to="/eventos/add" className="btn btn-link">
          Add
        </Link>
      </nav>
    </header>
    <main className="admin-main">
      <Outlet />
    </main>
    </>
  );
}

function App() {

  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
         <Route index element={<Navigate to="/eventos" replace />} />

          <Route path="eventos" element={<EventList />} />
          <Route path="eventos/add" element={<EventForm />} />
          <Route path="eventos/:id" element={<EventDetail />} />
          {/*
          <Route path="eventos/edit/:id" element={<EventEdit />} />
          <Route path="eventos/delete/:id" element={<EventDelete />} /> 
           */}
        </Route>
        <Route path="*" element={<PageNotFound />}></Route>
      </Routes>
    </BrowserRouter>
    </>
    
  )
}

export default App
