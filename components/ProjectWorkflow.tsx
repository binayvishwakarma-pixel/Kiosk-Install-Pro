import React, { useState } from 'react';
import { Project, Store, ProjectStatus, CapturedImage, User, GeoLocation } from '../types';
import { MOCK_DISTRICTS, MOCK_STORES, REQUIRED_COUNTS } from '../constants';
import { saveProject } from '../services/storageService';
import { generateProjectPPT } from '../services/pptService';
import { CameraCapture } from './CameraCapture';
import { ChevronRight, Check, MapPin, FileText, Upload } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface ProjectWorkflowProps {
  user: User;
  onComplete: () => void;
}

// Simple UUID generator fallback
const generateId = () => Math.random().toString(36).substr(2, 9);

export const ProjectWorkflow: React.FC<ProjectWorkflowProps> = ({ user, onComplete }) => {
  const [step, setStep] = useState(1);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState('');
  
  // State for Images
  const [beforeImages, setBeforeImages] = useState<CapturedImage[]>([]);
  const [afterImages, setAfterImages] = useState<CapturedImage[]>([]);
  const [receivingImages, setReceivingImages] = useState<CapturedImage[]>([]);

  const selectedStore = MOCK_STORES.find(s => s.id === selectedStoreId);

  const handleCapture = (
    type: 'BEFORE' | 'AFTER' | 'RECEIVING',
    dataUrl: string, 
    location: GeoLocation, 
    timestamp: string
  ) => {
    const newImage: CapturedImage = {
      id: generateId(),
      dataUrl,
      location,
      timestamp,
      type
    };

    if (type === 'BEFORE') {
      setBeforeImages(prev => [...prev, newImage]);
    } else if (type === 'AFTER') {
      setAfterImages(prev => [...prev, newImage]);
    } else {
      setReceivingImages(prev => [...prev, newImage]);
    }
  };

  const canProceed = () => {
    if (step === 1) return !!selectedStore;
    if (step === 2) return beforeImages.length >= REQUIRED_COUNTS.BEFORE;
    if (step === 3) return afterImages.length >= REQUIRED_COUNTS.AFTER;
    if (step === 4) return receivingImages.length >= REQUIRED_COUNTS.RECEIVING;
    return true;
  };

  const handleNext = () => {
    if (canProceed()) setStep(prev => prev + 1);
  };

  const finishProject = () => {
    if (!selectedStore) return;

    const newProject: Project = {
      id: generateId(),
      storeId: selectedStore.id,
      userId: user.id,
      status: ProjectStatus.COMPLETED,
      startedAt: new Date().toISOString(), // In reality, this should be tracked from start
      completedAt: new Date().toISOString(),
      images: {
        before: beforeImages,
        after: afterImages,
        receiving: receivingImages
      }
    };

    saveProject(newProject);
    
    // Auto Generate PPT
    generateProjectPPT(newProject, selectedStore);
    
    alert("Project saved and PPT downloaded successfully!");
    onComplete();
  };

  const renderStep1_SiteSelection = () => (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-xl font-bold text-gray-800">1. Select Site</h2>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">District</label>
        <select 
          className="w-full p-3 border border-gray-300 rounded-lg bg-white"
          value={selectedDistrict}
          onChange={(e) => { setSelectedDistrict(e.target.value); setSelectedStoreId(''); }}
        >
          <option value="">Select District</option>
          {MOCK_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Store Number</label>
        <select 
          className="w-full p-3 border border-gray-300 rounded-lg bg-white"
          value={selectedStoreId}
          disabled={!selectedDistrict}
          onChange={(e) => setSelectedStoreId(e.target.value)}
        >
          <option value="">Select Store</option>
          {MOCK_STORES.filter(s => s.district === selectedDistrict).map(s => (
            <option key={s.id} value={s.id}>{s.storeNumber} - {s.storeName}</option>
          ))}
        </select>
      </div>

      {selectedStore && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mt-4">
          <h3 className="font-semibold text-blue-900">{selectedStore.storeName}</h3>
          <p className="text-blue-700 text-sm flex items-center gap-1 mt-1">
            <MapPin size={16} /> {selectedStore.address}
          </p>
        </div>
      )}
    </div>
  );

  const renderCaptureStep = (
    title: string, 
    currentImages: CapturedImage[], 
    required: number, 
    type: 'BEFORE' | 'AFTER' | 'RECEIVING',
    description: string
  ) => (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-xl font-bold text-gray-800">{title}</h2>
           <p className="text-sm text-gray-500">{description}</p>
        </div>
        <span className={`font-mono font-bold ${currentImages.length >= required ? 'text-green-600' : 'text-orange-600'}`}>
            {currentImages.length}/{required}
        </span>
      </div>

      {currentImages.length < required ? (
        <CameraCapture 
            label={`Capture ${type} Image (${currentImages.length + 1}/${required})`}
            onCapture={(data, loc, time) => handleCapture(type, data, loc, time)}
        />
      ) : (
        <div className="p-6 bg-green-50 text-green-800 rounded-lg text-center border border-green-200">
            <CheckCircleIcon className="w-12 h-12 mx-auto mb-2 text-green-600" />
            <p className="font-semibold">All required images captured!</p>
            <p className="text-sm">Proceed to next step.</p>
        </div>
      )}

      {/* Preview Grid */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        {currentImages.map((img) => (
            <div key={img.id} className="relative aspect-square bg-gray-200 rounded overflow-hidden border border-gray-300">
                <img src={img.dataUrl} alt="captured" className="w-full h-full object-cover" />
                <div className="absolute bottom-0 w-full bg-black/50 text-white text-[10px] p-1 truncate">
                    {img.timestamp.split(',')[1]}
                </div>
            </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto pb-20">
      {/* Stepper Header */}
      <div className="flex justify-between mb-8 px-2">
         {[1, 2, 3, 4, 5].map(s => (
             <div key={s} className={`w-1/5 h-2 rounded-full mx-1 transition-all ${s <= step ? 'bg-blue-600' : 'bg-gray-200'}`} />
         ))}
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[60vh]">
        {step === 1 && renderStep1_SiteSelection()}
        {step === 2 && renderCaptureStep("2. Before Installation", beforeImages, REQUIRED_COUNTS.BEFORE, 'BEFORE', "Capture initial site condition (6 images)")}
        {step === 3 && renderCaptureStep("3. After Execution", afterImages, REQUIRED_COUNTS.AFTER, 'AFTER', "Capture completed work (9 images)")}
        {step === 4 && renderCaptureStep("4. Documents", receivingImages, REQUIRED_COUNTS.RECEIVING, 'RECEIVING', "Capture Handover Docs (2 images)")}
        
        {step === 5 && (
            <div className="text-center py-10 animate-fadeIn">
                <FileText className="w-20 h-20 text-blue-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900">Ready to Submit</h2>
                <p className="text-gray-600 mt-2 mb-8">
                    Site: {selectedStore?.storeName}<br/>
                    Total Images: {beforeImages.length + afterImages.length + receivingImages.length}
                </p>
                <button 
                    onClick={finishProject}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-4 px-10 rounded-full shadow-lg flex items-center gap-3 mx-auto"
                >
                    <Upload size={24} /> Generate Report & Finish
                </button>
            </div>
        )}
      </div>

      {/* Persistent Footer Action */}
      {step < 5 && (
          <div className="fixed bottom-0 left-0 w-full bg-white border-t p-4 z-50">
             <button
                disabled={!canProceed()}
                onClick={handleNext}
                className={`w-full max-w-2xl mx-auto flex justify-center items-center gap-2 py-3 rounded-xl font-bold text-lg transition-all
                    ${canProceed() ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-400'}`}
             >
                {step === 4 ? 'Review' : 'Next'} <ChevronRight />
             </button>
          </div>
      )}
    </div>
  );
};

const CheckCircleIcon = ({ className }: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
);