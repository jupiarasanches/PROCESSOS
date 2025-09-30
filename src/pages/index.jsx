import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Processes from "./Processes";

import Technicians from "./Technicians";

import DataAdmin from "./DataAdmin";

import Financial from "./Financial";

import Agenda from "./Agenda";

import Welcome from "./Welcome";

import Research from "./Research";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Processes: Processes,
    
    Technicians: Technicians,
    
    DataAdmin: DataAdmin,
    
    Financial: Financial,
    
    Agenda: Agenda,
    
    Welcome: Welcome,
    
    Research: Research,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Processes" element={<Processes />} />
                
                <Route path="/Technicians" element={<Technicians />} />
                
                <Route path="/DataAdmin" element={<DataAdmin />} />
                
                <Route path="/Financial" element={<Financial />} />
                
                <Route path="/Agenda" element={<Agenda />} />
                
                <Route path="/Welcome" element={<Welcome />} />
                
                <Route path="/Research" element={<Research />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}