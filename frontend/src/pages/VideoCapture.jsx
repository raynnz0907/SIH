import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Upload, Video as VideoIcon, Activity, CheckCircle2 } from 'lucide-react';
import { cn } from '../utils/cn';

export default function VideoCapture() {
  const [activeTab, setActiveTab] = useState('upload');
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles?.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/*': [] },
    maxFiles: 1
  });

  const handleUpload = () => {
    setIsUploading(true);
    // Mock upload delay
    setTimeout(() => {
      navigate('/analysis/123');
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Movement Assessment</h1>
      <p className="text-gray-400 mb-8">Upload or record a video of your movement for biomechanical analysis.</p>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="flex border-b border-subtle">
            <button 
              className={cn("px-6 py-3 font-medium transition-colors border-b-2", activeTab === 'upload' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-white')}
              onClick={() => setActiveTab('upload')}
            >
              Upload Video
            </button>
            <button 
              className={cn("px-6 py-3 font-medium transition-colors border-b-2", activeTab === 'record' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-white')}
              onClick={() => setActiveTab('record')}
            >
              Record Webcam
            </button>
          </div>

          {activeTab === 'upload' && (
            <div 
              {...getRootProps()} 
              className={cn(
                "border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-surface h-[400px]",
                isDragActive ? "border-primary bg-primary/5" : "border-subtle hover:border-gray-500",
                file ? "border-accent bg-accent/5" : ""
              )}
            >
              <input {...getInputProps()} />
              {file ? (
                <>
                  <CheckCircle2 className="w-16 h-16 text-accent mb-4" />
                  <p className="text-lg font-medium">{file.name}</p>
                  <p className="text-sm text-gray-400 mt-2">Ready to analyze</p>
                </>
              ) : (
                <>
                  <Upload className="w-16 h-16 text-gray-400 mb-4" />
                  <p className="text-lg font-medium">Drag & drop your video here</p>
                  <p className="text-sm text-gray-400 mt-2">MP4, MOV up to 50MB</p>
                </>
              )}
            </div>
          )}

          {activeTab === 'record' && (
            <div className="bg-surface rounded-2xl p-8 flex flex-col items-center justify-center text-center border border-subtle h-[400px]">
              <VideoIcon className="w-16 h-16 text-gray-400 mb-4" />
              <p className="text-lg font-medium mb-4">Webcam access required</p>
              <button className="bg-primary hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                Enable Camera
              </button>
            </div>
          )}

          <div className="flex justify-end">
            <button 
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="bg-primary hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-primary text-white font-bold py-3 px-8 rounded-xl transition-all flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <Activity className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Start Analysis'
              )}
            </button>
          </div>
        </div>

        <div className="bg-surface border border-subtle rounded-2xl p-6 h-fit">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-accent" />
            Instructions
          </h3>
          <ul className="space-y-4 text-sm text-gray-300">
            <li className="flex gap-3">
              <span className="bg-subtle w-6 h-6 rounded-full flex items-center justify-center shrink-0">1</span>
              <span>Ensure good lighting and wear form-fitting athletic clothes.</span>
            </li>
            <li className="flex gap-3">
              <span className="bg-subtle w-6 h-6 rounded-full flex items-center justify-center shrink-0">2</span>
              <span>Position camera at hip height, showing your full body.</span>
            </li>
            <li className="flex gap-3">
              <span className="bg-subtle w-6 h-6 rounded-full flex items-center justify-center shrink-0">3</span>
              <span>Perform 3 reps of bodyweight squats.</span>
            </li>
            <li className="flex gap-3">
              <span className="bg-subtle w-6 h-6 rounded-full flex items-center justify-center shrink-0">4</span>
              <span>Perform 2 maximal vertical jumps.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
