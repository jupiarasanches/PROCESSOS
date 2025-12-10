import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Processes from "./Processes";

import Technicians from "./Technicians";

import DataAdmin from "./DataAdmin";

import Agenda from "./Agenda";

import Welcome from "./Welcome";

import Instances from "./Instances";

import Reports from "./Reports";

import AuditLog from "./AuditLog";

import AcceptInvite from "./AcceptInvite";
import Bootstrap from "./Bootstrap";
import SimcarManagement from "./SimcarManagement";

import Login from "./Login";

import ProtectedRoute from "@/components/ProtectedRoute";

import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Processes: Processes,
    
    Technicians: Technicians,
    
    DataAdmin: DataAdmin,
    
    Agenda: Agenda,
    
    Welcome: Welcome,
    
    Instances: Instances,
    
    Reports: Reports,
    
    AuditLog: AuditLog,
    
    SimcarManagement: SimcarManagement,

    Login: Login,
    
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
    
    // Verificar se está na página de login, aceitar convite ou bootstrap
    const isPublicRoute = ['/login', '/accept-invite', '/bootstrap'].includes(location.pathname);
    
    if (isPublicRoute) {
        return (
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/accept-invite" element={<AcceptInvite />} />
                <Route path="/bootstrap" element={<Bootstrap />} />
            </Routes>
        );
    }
    
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            <Route path="/Dashboard" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <Dashboard />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/Processes" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <Processes />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/Technicians" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <Technicians />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/DataAdmin" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <DataAdmin />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/Agenda" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <Agenda />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/Welcome" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <Welcome />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/Instances" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <Instances />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/Reports" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <Reports />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/AuditLog" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <AuditLog />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/SimcarManagement" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <SimcarManagement />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}
