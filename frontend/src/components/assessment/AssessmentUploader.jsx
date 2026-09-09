import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAthleteStore } from '../../store/athleteStore';
import { videoAPI, formatErrorMessage } from '../../api/client';
import {
  UploadIcon,
  VideoIcon,
  ZapIcon,
  AlertTriangleIcon,
  CheckIcon,
  CloseIcon,
} from '../common/Icons';

const VALID_EXTENSIONS = ['mp4', 'mov', 'avi', 'webm', 'mkv'];

export default function AssessmentUploader({
  sportKey,
  primaryRole,
  subRole,
  activeProtocolId,
  activeProtocolName,
  uploadLabel,
  analyzeButtonLabel,
}) {
  const navigate = useNavigate();
  const setAssessment = useAthleteStore((state) => state.setAssessment);
  const setBottlenecks = useAthleteStore((state) => state.setBottlenecks);

  const [selectedFile, setSelectedFile] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);
  const [stage, setStage] = useState('idle'); // 'idle' | 'uploading' | 'quality_gate' | 'analyzing' | 'preparing'
  const [errorMsg, setErrorMsg] = useState(null);

  const chooseInputRef = useRef(null);
  const recordInputRef = useRef(null);
  const pollTimerRef = useRef(null);
  const timeoutTimerRef = useRef(null);

  // Clean up timers & preview URLs on unmount
  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    };
  }, [videoPreviewUrl]);

  const handleFile = (file) => {
    setErrorMsg(null);
    if (!file) return;

    const ext = (file.name || 'video.mp4').split('.').pop().toLowerCase();
    if (!VALID_EXTENSIONS.includes(ext)) {
      setErrorMsg(`Unsupported format (${ext.toUpperCase()}). Please upload MP4, MOV, AVI, or WebM.`);
      return;
    }

    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setVideoPreviewUrl(url);
  };

  const handleStartAnalysis = async () => {
    if (!selectedFile) {
      setErrorMsg('Please select or record a video first.');
      return;
    }

    setErrorMsg(null);
    setStage('uploading');

    try {
      const formData = new FormData();
      formData.append('video', selectedFile);
      formData.append('sport', sportKey || 'cricket');
      formData.append('role', primaryRole || 'athlete');
      if (subRole) {
        formData.append('sub_role', subRole);
      }
      formData.append('protocol', activeProtocolId);

      const uploadRes = await videoAPI.coach(formData);
      const jobId = uploadRes?.job_id;

      if (!jobId) {
        throw new Error('No job ID returned from assessment server.');
      }

      // Visual progress progression while waiting for computer-vision pipeline
      setStage('quality_gate');
      const stageTimer1 = setTimeout(() => setStage('analyzing'), 2500);
      const stageTimer2 = setTimeout(() => setStage('preparing'), 6000);

      // Start polling backend job status
      pollTimerRef.current = setInterval(async () => {
        try {
          const statusRes = await videoAPI.getStatus(jobId);
          if (statusRes.status === 'completed') {
            clearInterval(pollTimerRef.current);
            clearTimeout(timeoutTimerRef.current);
            clearTimeout(stageTimer1);
            clearTimeout(stageTimer2);

            setAssessment(statusRes);
            if (statusRes.bottlenecks) setBottlenecks(statusRes.bottlenecks);
            navigate(`/analysis/${jobId}`, { state: { result: statusRes } });
          } else if (statusRes.status === 'failed') {
            clearInterval(pollTimerRef.current);
            clearTimeout(timeoutTimerRef.current);
            clearTimeout(stageTimer1);
            clearTimeout(stageTimer2);
            setStage('idle');
            setErrorMsg(
              statusRes.message ||
                'Movement analysis could not detect required keypoints. Please ensure full body is in frame.'
            );
          }
        } catch (err) {
          // Keep polling until timeout
        }
      }, 1500);

      // Timeout guard after 50 seconds
      timeoutTimerRef.current = setTimeout(() => {
        clearInterval(pollTimerRef.current);
        clearTimeout(stageTimer1);
        clearTimeout(stageTimer2);
        if (stage !== 'idle') {
          setStage('idle');
          setErrorMsg('Analysis timed out. Please verify local vision processing service.');
        }
      }, 50000);
    } catch (err) {
      setStage('idle');
      setErrorMsg(
        formatErrorMessage(
          err,
          'Failed to upload video for assessment. Check server connection.'
        )
      );
    }
  };

  const getStageLabel = () => {
    switch (stage) {
      case 'uploading':
        return 'Uploading video recording...';
      case 'quality_gate':
        return 'Checking video clarity and athlete framing...';
      case 'analyzing':
        return 'Analyzing movement kinematics and joint angles...';
      case 'preparing':
        return 'Preparing coaching feedback and benchmark comparisons...';
      default:
        return 'Processing...';
    }
  };

  const isBusy = stage !== 'idle';

  return (
    <div id="recording-uploader" className="space-y-4">
      {/* Hidden native inputs */}
      <input
        type="file"
        ref={chooseInputRef}
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        accept="video/mp4,video/mov,video/avi,video/webm,video/mkv"
        className="hidden"
      />
      <input
        type="file"
        ref={recordInputRef}
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        accept="video/*"
        capture="environment"
        className="hidden"
      />

      {/* Error alert */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3">
          <AlertTriangleIcon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold font-tech uppercase tracking-wide block">
              Notice
            </span>
            <span className="font-sans leading-relaxed">{errorMsg}</span>
          </div>
        </div>
      )}

      {/* Mobile Camera Viewfinder / Video Preview Card */}
      <div className="sportify-card p-4 border border-white/15 relative overflow-hidden bg-gradient-to-b from-[#0F111A] to-[#07080C] shadow-2xl">
        {/* Viewfinder Target Reticles */}
        <div className="viewfinder-corner-tl" />
        <div className="viewfinder-corner-tr" />
        <div className="viewfinder-corner-bl" />
        <div className="viewfinder-corner-br" />

        {videoPreviewUrl ? (
          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.08]">
              <div className="flex items-center gap-2 text-xs font-bold font-tech text-white uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Recording Ready</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setVideoPreviewUrl(null);
                }}
                disabled={isBusy}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors active-press"
              >
                <CloseIcon className="w-3.5 h-3.5" />
                <span>Retake</span>
              </button>
            </div>

            <div className="rounded-xl overflow-hidden border border-white/20 bg-black shadow-inner relative">
              <video
                src={videoPreviewUrl}
                controls
                playsInline
                className="w-full max-h-[220px] object-contain mx-auto"
              />
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 px-1">
              <span className="truncate max-w-[180px]">{selectedFile?.name || 'Movement recording'}</span>
              <span>{(selectedFile?.size / (1024 * 1024)).toFixed(1)} MB</span>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center space-y-2.5 relative z-10">
            {/* Viewfinder Telemetry Header */}
            <div className="flex items-center justify-center gap-2 text-[9px] font-mono text-slate-400 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Vision Tracking Ready</span>
            </div>

            <div className="w-11 h-11 rounded-xl bg-white/[0.05] border border-white/20 flex items-center justify-center mx-auto text-white shadow-[0_4px_16px_rgba(0,0,0,0.6)]">
              <VideoIcon className="w-5 h-5 text-white" />
            </div>

            <div className="max-w-xs mx-auto">
              <h3 className="text-xs font-bold text-white font-heading tracking-tight">
                {uploadLabel || `Record or Choose ${activeProtocolName || 'Assessment'} Video`}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5 font-sans leading-relaxed">
                Full-body framing • High contrast • 30–60 FPS
              </p>
            </div>

            {/* Mobile Dual Action Buttons */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => recordInputRef.current?.click()}
                disabled={isBusy}
                className="flex-1 h-11 btn-primary text-[11px] px-2 flex items-center justify-center gap-1.5 uppercase tracking-wider active-press shadow-[0_4px_16px_rgba(255,255,255,0.15)]"
              >
                <VideoIcon className="w-3.5 h-3.5 shrink-0" />
                <span>Record</span>
              </button>

              <button
                type="button"
                onClick={() => chooseInputRef.current?.click()}
                disabled={isBusy}
                className="flex-1 h-11 btn-secondary text-[11px] px-2 flex items-center justify-center gap-1.5 active-press"
              >
                <UploadIcon className="w-3.5 h-3.5 shrink-0" />
                <span>Upload</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Processing State & Submit Button */}
      {isBusy ? (
        <div className="p-6 rounded-xl bg-white/[0.04] border border-white/20 text-center space-y-3">
          <div className="w-7 h-7 rounded-full border-2 border-white border-t-transparent animate-spin mx-auto" />
          <p className="text-sm font-bold font-tech text-white">
            {getStageLabel()}
          </p>
          <p className="text-[11px] text-slate-400 font-sans">
            Please keep this tab open while movement analysis completes.
          </p>
        </div>
      ) : (
        selectedFile && (
          <button
            type="button"
            onClick={handleStartAnalysis}
            className="btn-primary w-full py-3.5 text-xs tracking-widest flex items-center justify-center gap-2 uppercase"
          >
            <ZapIcon className="w-4 h-4 text-slate-950" />
            <span>{analyzeButtonLabel || `Analyze ${activeProtocolName || 'Movement'}`}</span>
          </button>
        )
      )}
    </div>
  );
}
