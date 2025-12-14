import React, { useState, useEffect } from 'react';
import { Project, Store, ProjectStatus } from '../types';
import { getProjects, saveProject } from '../services/storageService';
import { MOCK_STORES } from '../constants';
import { generateProjectPPT } from '../services/pptService';
import { auditInstallationImages } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Download, Eye, Map, Search, Sparkles } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  useEffect(() => {
    // Load data
    const data = getProjects();
    setProjects(data);
  }, []);

  const getStoreDetails = (storeId: string) => MOCK_STORES.find(s => s.id === storeId);

  const stats = {
    total: projects.length,
    completed: projects.filter(p => p.status === ProjectStatus.COMPLETED).length,
    pending: projects.filter(p => p.status === ProjectStatus.PENDING).length
  };

  const chartData = [
    { name: 'Completed', value: stats.completed },
    { name: 'Pending', value: stats.pending },
  ];

  const filteredProjects = projects.filter(p => {
    const store = getStoreDetails(p.storeId);
    const searchStr = `${store?.storeName} ${store?.district}`.toLowerCase();
    return searchStr.includes(filter.toLowerCase());
  });

  const handleDownloadPPT = (project: Project) => {
    const store = getStoreDetails(project.storeId);
    if (store) generateProjectPPT(project, store);
  };

  const handleGeminiAudit = async (project: Project) => {
    setIsAuditing(true);
    const result = await auditInstallationImages(project.images.after);
    
    // Save the audit result to the project
    const updatedProject = { ...project, geminiAudit: result };
    saveProject(updatedProject);
    
    // Update local state
    setProjects(prev => prev.map(p => p.id === project.id ? updatedProject : p));
    if (selectedProject?.id === project.id) {
        setSelectedProject(updatedProject);
    }
    
    setIsAuditing(false);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm font-medium">Total Sites</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm font-medium">Completed</h3>
            <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm font-medium">Pending</h3>
            <p className="text-3xl font-bold text-orange-500">{stats.pending}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-64">
        <h3 className="text-lg font-bold mb-4">Project Status Overview</h3>
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={40} />
            </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center flex-wrap gap-4">
            <h2 className="text-xl font-bold">Site Management</h2>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search site or district..." 
                    className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-600 text-sm">
                    <tr>
                        <th className="p-4">Store</th>
                        <th className="p-4">District</th>
                        <th className="p-4">Date</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Actions</th>
                    </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-100">
                    {filteredProjects.map(p => {
                        const store = getStoreDetails(p.storeId);
                        return (
                            <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 font-medium">{store?.storeName} <span className="text-gray-400">#{store?.storeNumber}</span></td>
                                <td className="p-4">{store?.district}</td>
                                <td className="p-4">{new Date(p.startedAt).toLocaleDateString()}</td>
                                <td className="p-4">
                                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                        {p.status}
                                    </span>
                                </td>
                                <td className="p-4 flex gap-2">
                                    <button onClick={() => setSelectedProject(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="View Details">
                                        <Eye size={18} />
                                    </button>
                                    <button onClick={() => handleDownloadPPT(p)} className="p-2 text-gray-600 hover:bg-gray-100 rounded" title="Download PPT">
                                        <Download size={18} />
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
      </div>

      {selectedProject && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
            <div className="w-full max-w-2xl bg-white h-full overflow-y-auto p-6 shadow-2xl animate-slideInRight">
                <div className="flex justify-between items-start mb-6">
                    <h2 className="text-2xl font-bold">Project Details</h2>
                    <button onClick={() => setSelectedProject(null)} className="text-gray-500 hover:text-black text-xl">&times;</button>
                </div>

                <div className="mb-8">
                     <h3 className="font-bold text-gray-700 mb-2">Gemini AI Audit</h3>
                     {!selectedProject.geminiAudit ? (
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <p className="text-sm text-gray-600 mb-3">Use AI to analyze the "After" images for quality control.</p>
                            <button 
                                onClick={() => handleGeminiAudit(selectedProject)}
                                disabled={isAuditing}
                                className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                            >
                                <Sparkles size={16} />
                                {isAuditing ? 'Analyzing...' : 'Run Audit'}
                            </button>
                        </div>
                     ) : (
                         <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                            <div className="flex items-center gap-2 text-purple-800 font-bold mb-2">
                                <Sparkles size={16} /> AI Report
                            </div>
                            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{selectedProject.geminiAudit}</p>
                         </div>
                     )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {selectedProject.images.after.map(img => (
                        <div key={img.id} className="relative aspect-video bg-black rounded overflow-hidden">
                             <img src={img.dataUrl} className="w-full h-full object-contain" alt="evidence" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};