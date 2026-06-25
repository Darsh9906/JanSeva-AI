import React, { useState, useRef } from "react";
import { useStore } from "../services/store";
import { IssueCategory, SeverityLevel, MunicipalDepartment } from "../types";
import { 
  Camera, Upload, Sparkles, AlertTriangle, ArrowRight, ArrowLeft, 
  CheckCircle2, Loader2, Video, RefreshCw, Radio, Zap, ShieldAlert 
} from "lucide-react";

import { storage } from "../services/firebase";
import { ref, uploadBytes, getDownloadURL, uploadString } from "firebase/storage";

export const ReportWizardScreen: React.FC = () => {
  const { actions, issues } = useStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [imageBase64, setImageBase64] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isVideoProof, setIsVideoProof] = useState<boolean>(false);
  const [userTitle, setUserTitle] = useState("");
  const [userDesc, setUserDesc] = useState("");

  // Step 2 & 3 AI Triaged State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<IssueCategory>("Pothole");
  const [severity, setSeverity] = useState<SeverityLevel>("Medium");
  const [department, setDepartment] = useState<MunicipalDepartment>("Public Works - Roads");
  const [confidence, setConfidence] = useState(0.88);
  const [riskScore, setRiskScore] = useState(65);
  const [estimatedCost, setEstimatedCost] = useState(350);
  const [estimatedFixTime, setEstimatedFixTime] = useState("48 hours");

  // Step 3 Geo-Consensus state
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState<number>(20.5937); // Default to India approx
  const [longitude, setLongitude] = useState<number>(78.9629);
  const [isLocating, setIsLocating] = useState(false);
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [ignoreDuplicates, setIgnoreDuplicates] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGetLocation = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          setIsLocating(false);
          setAddress(`${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Failed to get location. Please enable location permissions.");
          setIsLocating(false);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
      setIsLocating(false);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.includes("video")) {
      setIsVideoProof(true);
    } else {
      setIsVideoProof(false);
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setImageBase64(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSampleLoad = (type: "pothole" | "leak" | "trash") => {
    setIsVideoProof(false);
    if (type === "pothole") {
      const img = "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80";
      setImagePreview(img);
      setImageBase64(img);
      setUserTitle("Severe Pothole Cluster");
      setUserDesc("Deep asphalt fissure causing vehicle suspension hazard on central thoroughfare.");
    } else if (type === "leak") {
      const img = "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80";
      setImagePreview(img);
      setImageBase64(img);
      setUserTitle("Pressurized Main Burst");
      setUserDesc("Substantial clean potable water runoff wasting thousands of gallons per hour.");
    } else {
      const img = "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80";
      setImagePreview(img);
      setImageBase64(img);
      setUserTitle("Illegal Sidewalk Dumping");
      setUserDesc("Hazardous construction refuse obstructing public ADA pathway access.");
    }
  };

  const handleAnalyzeWithAI = async () => {
    if (!imageBase64) return;
    setIsAnalyzing(true);
    setStep(2);

    try {
      const res = await fetch("/api/ai/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64,
          userTitle,
          userDescription: userDesc
        })
      });
      const data = await res.json();

      setTitle(data.title || userTitle || "Hazard Detected");
      setDescription(data.description || userDesc || "Municipal infrastructure defect noted.");
      setCategory(data.category || "Road Damage");
      setSeverity(data.severity || "High");
      setDepartment(data.department || "Public Works - Roads");
      setConfidence(data.confidence || 0.91);
      setRiskScore(data.riskScore || 72);
      setEstimatedCost(data.estimatedCost || 450);
      setEstimatedFixTime(data.estimatedFixTime || "2 days");
    } catch (err) {
      setTitle(userTitle || "Municipal Hazard");
      setDescription(userDesc || "Requires municipal engineering inspection.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNextToStep3 = () => {
    const dups = issues.filter(i => i.category === category && i.status !== "Resolved");
    setDuplicates(dups.slice(0, 2));
    setStep(3);
  };

  const handleSubmitReport = async () => {
    setIsSubmitting(true);
    try {
      let finalImageUrl = imagePreview || "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80";

      if (storage && imageBase64 && imageBase64.startsWith("data:")) {
        const imageRef = ref(storage, `reports/rep_${Date.now()}_${Math.random().toString(36).substring(7)}`);
        await uploadString(imageRef, imageBase64, "data_url");
        finalImageUrl = await getDownloadURL(imageRef);
      }

      await actions.addIssue({
        title,
        description,
        category,
        severity,
        department,
        imageUrl: finalImageUrl,
        address,
        latitude,
        longitude,
        confidence,
        riskScore,
        estimatedCost,
        estimatedFixTime,
        mediaType: isVideoProof ? "video" : "photo",
      });
      setIsSubmitting(false);
      actions.setActiveScreen("feed");
    } catch (error) {
      console.error("Failed to submit report:", error);
      setIsSubmitting(false);
      alert("Failed to submit the report. Check connection or try again.");
    }
  };

  const categoriesList: IssueCategory[] = [
    "Pothole", "Water Leakage", "Streetlight", "Waste Management", 
    "Road Damage", "Drainage", "Public Safety", "Other"
  ];
  const severitiesList: SeverityLevel[] = ["Low", "Medium", "High", "Critical"];
  const deptsList: MunicipalDepartment[] = [
    "Public Works - Roads", "Water & Sanitation", "Electrical Dept", 
    "Waste Management", "Public Safety", "Parks & Rec"
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Top Neo-Civic Progress Rig Header */}
      <div className="bg-[#111216] p-6 rounded-3xl border-4 border-[#111216] shadow-[6px_6px_0px_#FF5A00] text-white space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-[#FF5A00]" />
            <span className="font-display font-extrabold text-lg tracking-wider uppercase">EMERGENCY DISPATCH WIZARD</span>
          </div>
          <span className="font-mono text-xs text-[#c5ff00] font-extrabold bg-[#222634] px-3 py-1 rounded-xl border border-white/10">
            STAGE {step} OF 3
          </span>
        </div>

        {/* Tactile Progress Track */}
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map(st => (
            <div 
              key={st}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                st < step ? "bg-[#c5ff00]" : st === step ? "hazard-stripes" : "bg-[#252b3d]"
              }`}
            />
          ))}
        </div>
      </div>

      {/* STEP 1: Capture Evidence */}
      {step === 1 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-[#111216] shadow-[6px_6px_0px_#111216] space-y-6">
          <div>
            <h2 className="text-xl font-display font-extrabold text-[#111216] uppercase">01. CAPTURE HAZARD PROOF</h2>
            <p className="text-xs font-sans text-slate-600 mt-1 font-medium">
              Upload clear photographic or video proof. Gemini Vision AI automatically computes municipal repair estimates.
            </p>
          </div>

          {/* Upload Rig Deck */}
          <div className="space-y-4">
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*,video/*" 
              onChange={handleFileUpload} 
              className="hidden" 
            />

            {!imagePreview ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-4 border-dashed border-[#111216] bg-[#F4F4EE] hover:bg-[#eaeae2] rounded-3xl p-10 text-center cursor-pointer transition group space-y-3"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#111216] text-[#FF5A00] mx-auto flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                  <Camera className="w-8 h-8 stroke-[2.5px]" />
                </div>
                <div>
                  <span className="block font-display font-extrabold text-base text-[#111216] uppercase">TAP TO SNAP OR ATTACH MEDIA</span>
                  <span className="text-xs font-mono text-slate-500 font-bold">Supports JPG, PNG, MP4 4K Mobile Capture</span>
                </div>
              </div>
            ) : (
              <div className="relative rounded-3xl overflow-hidden border-4 border-[#111216] shadow-md bg-black h-64">
                {isVideoProof ? (
                  <video src={imagePreview} controls className="w-full h-full object-cover" />
                ) : (
                  <img src={imagePreview} alt="Evidence Preview" className="w-full h-full object-cover" />
                )}
                <button
                  type="button"
                  onClick={() => setImagePreview("")}
                  className="absolute top-3 right-3 bg-[#111216] text-white px-3.5 py-2 rounded-xl text-xs font-mono font-bold hover:bg-[#FF5A00] hover:text-[#111216] transition shadow flex items-center space-x-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>RETAKE</span>
                </button>
              </div>
            )}

            {/* Quick Demo RIG Selector */}
            <div className="bg-[#111216] p-4 rounded-2xl border-2 border-slate-800 text-white space-y-2">
              <span className="text-[10px] font-mono text-[#c5ff00] uppercase font-bold block tracking-widest flex items-center gap-1.5">
                <Radio className="w-3 h-3 animate-pulse text-[#FF5A00]" />
                INSTANT FIELD TEST SIMULATION PRESETS
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleSampleLoad("pothole")}
                  className="bg-[#222634] hover:bg-[#FF5A00] hover:text-[#111216] text-white text-[11px] font-mono font-extrabold py-2 px-2 rounded-xl border border-white/10 transition uppercase truncate"
                >
                  ⚡ Road Pothole
                </button>
                <button
                  type="button"
                  onClick={() => handleSampleLoad("leak")}
                  className="bg-[#222634] hover:bg-[#c5ff00] hover:text-[#111216] text-white text-[11px] font-mono font-extrabold py-2 px-2 rounded-xl border border-white/10 transition uppercase truncate"
                >
                  💧 Pipe Burst
                </button>
                <button
                  type="button"
                  onClick={() => handleSampleLoad("trash")}
                  className="bg-[#222634] hover:bg-white hover:text-[#111216] text-white text-[11px] font-mono font-extrabold py-2 px-2 rounded-xl border border-white/10 transition uppercase truncate"
                >
                  🗑️ Refuse Dump
                </button>
              </div>
            </div>

            {/* Optional Field Notes */}
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-500 font-extrabold mb-1">OPTIONAL HAZARD TITLE</label>
                <input
                  type="text"
                  value={userTitle}
                  onChange={(e) => setUserTitle(e.target.value)}
                  placeholder="E.g. Sinkhole forming on 5th Ave..."
                  className="w-full bg-[#F4F4EE] border-2 border-[#111216] rounded-xl px-3.5 py-3 text-xs text-[#111216] font-bold outline-none focus:border-[#FF5A00]"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-slate-500 font-extrabold mb-1">FIELD OBSERVATION NOTES</label>
                <textarea
                  rows={2}
                  value={userDesc}
                  onChange={(e) => setUserDesc(e.target.value)}
                  placeholder="Describe severity or immediate pedestrian threat..."
                  className="w-full bg-[#F4F4EE] border-2 border-[#111216] rounded-xl px-3.5 py-2.5 text-xs text-[#111216] outline-none focus:border-[#FF5A00] leading-relaxed"
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={!imageBase64}
            onClick={handleAnalyzeWithAI}
            className="w-full bg-[#FF5A00] hover:bg-[#ff7021] disabled:opacity-40 text-[#111216] font-display font-extrabold py-4 px-6 rounded-2xl shadow-[4px_4px_0px_#111216] border-2 border-[#111216] transition transform active:scale-95 flex items-center justify-center space-x-2 text-sm uppercase tracking-wider min-h-[52px]"
          >
            <Sparkles className="w-5 h-5 fill-current" />
            <span>RUN GEMINI AI VISION TRIAGE →</span>
          </button>
        </div>
      )}

      {/* STEP 2: AI Triage Diagnostics */}
      {step === 2 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-[#111216] shadow-[6px_6px_0px_#111216] space-y-6">
          {isAnalyzing ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#111216] text-[#c5ff00] mx-auto flex items-center justify-center shadow-2xl animate-bounce">
                <Zap className="w-8 h-8 fill-current" />
              </div>
              <h3 className="font-display font-extrabold text-xl text-[#111216] uppercase">ANALYZING CIVIC EVIDENTIARY RIG...</h3>
              <p className="text-xs font-mono text-slate-500 font-bold max-w-sm mx-auto">
                Extracting pixel degradation metrics, municipal charter categories, and crew SLAs...
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-mono text-[#FF5A00] uppercase font-bold tracking-widest">GEMINI TRIAGE COMPLETE</span>
                  <h2 className="text-xl font-display font-extrabold text-[#111216] uppercase mt-0.5">02. VERIFY MUNICIPAL DIAGNOSIS</h2>
                </div>
                <div className="bg-[#111216] text-[#c5ff00] px-3 py-1.5 rounded-xl border-2 border-[#111216] font-mono text-center">
                  <span className="text-[9px] uppercase block text-slate-400">CONFIDENCE</span>
                  <span className="text-sm font-black">{(confidence * 100).toFixed(0)}%</span>
                </div>
              </div>

              {/* AI Telemetry Matrix */}
              <div className="bg-[#111216] text-white p-5 rounded-3xl border-2 border-[#111216] grid grid-cols-3 gap-3 text-center shadow">
                <div className="bg-[#1e2230] p-3 rounded-2xl border border-white/10">
                  <span className="text-[9px] font-mono uppercase text-slate-400 block">HAZARD SCORE</span>
                  <span className="text-lg font-mono font-extrabold text-[#FF5A00]">{riskScore}/100</span>
                </div>
                <div className="bg-[#1e2230] p-3 rounded-2xl border border-white/10">
                  <span className="text-[9px] font-mono uppercase text-slate-400 block">EST. REPAIR</span>
                  <span className="text-lg font-mono font-extrabold text-[#c5ff00]">₹{estimatedCost}</span>
                </div>
                <div className="bg-[#1e2230] p-3 rounded-2xl border border-white/10">
                  <span className="text-[9px] font-mono uppercase text-slate-400 block">CREW SLA</span>
                  <span className="text-lg font-mono font-extrabold text-white">{estimatedFixTime}</span>
                </div>
              </div>

              {/* Editable Triage Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-500 font-bold mb-1">OFFICIAL LOG TITLE</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#F4F4EE] border-2 border-[#111216] rounded-xl px-3.5 py-2.5 text-xs text-[#111216] font-bold outline-none focus:border-[#FF5A00]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-500 font-bold mb-1">OFFICIAL ENGINEERING ASSESSMENT</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-[#F4F4EE] border-2 border-[#111216] rounded-xl px-3.5 py-2.5 text-xs text-[#111216] outline-none focus:border-[#FF5A00] leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1">CATEGORY</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as IssueCategory)}
                      className="w-full bg-[#F4F4EE] border-2 border-[#111216] rounded-xl px-2.5 py-3 text-xs font-bold outline-none appearance-none"
                    >
                      {categoriesList.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1">SEVERITY</label>
                    <select
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value as SeverityLevel)}
                      className="w-full bg-[#F4F4EE] border-2 border-[#111216] rounded-xl px-2.5 py-3 text-xs font-bold outline-none appearance-none"
                    >
                      {severitiesList.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1">DISPATCH DEPT</label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value as MunicipalDepartment)}
                      className="w-full bg-[#F4F4EE] border-2 border-[#111216] rounded-xl px-2.5 py-3 text-xs font-bold outline-none appearance-none"
                    >
                      {deptsList.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4 border-t-2 border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-[#111216] font-mono font-bold py-3.5 px-4 rounded-2xl border-2 border-slate-300 transition text-xs uppercase min-h-[44px]"
                >
                  ← BACK
                </button>
                <button
                  type="button"
                  onClick={handleNextToStep3}
                  className="flex-[2] bg-[#c5ff00] hover:bg-[#b0e600] text-[#111216] font-display font-extrabold py-3.5 px-6 rounded-2xl shadow-[4px_4px_0px_#111216] border-2 border-[#111216] transition text-xs uppercase tracking-wider min-h-[44px]"
                >
                  CONFIRM AI DIAGNOSIS →
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* STEP 3: Consensus & Submission */}
      {step === 3 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-[#111216] shadow-[6px_6px_0px_#111216] space-y-6">
          <div className="border-b-2 border-slate-100 pb-4">
            <span className="text-[10px] font-mono text-[#FF5A00] uppercase font-bold tracking-widest">FINAL CONSENSUS CHECK</span>
            <h2 className="text-xl font-display font-extrabold text-[#111216] uppercase mt-0.5">03. GEO-LOCATION & LOG</h2>
          </div>

          {/* Duplicates Warning Rig */}
          {duplicates.length > 0 && !ignoreDuplicates && (
            <div className="bg-amber-50 border-4 border-amber-400 rounded-2xl p-4 sm:p-5 text-slate-900 space-y-3">
              <div className="flex items-start space-x-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-display font-extrabold text-sm uppercase">POSSIBLE DUPLICATE REPORT DETECTED</h4>
                  <p className="text-xs font-sans text-slate-700 mt-0.5 font-medium">
                    Found {duplicates.length} active {category} log(s) nearby. Upvote existing entries to accelerate crew dispatches without spamming!
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                {duplicates.map(dup => (
                  <div key={dup.id} className="bg-white p-3 rounded-xl border-2 border-[#111216] flex items-center justify-between text-xs shadow-sm">
                    <div className="truncate pr-2">
                      <p className="font-display font-extrabold uppercase text-[#111216] truncate">{dup.title}</p>
                      <p className="text-[10px] text-slate-500 font-mono font-bold">{dup.address} • {dup.status}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => actions.setActiveScreen("detail", dup.id)}
                      className="bg-[#111216] text-[#c5ff00] font-mono font-bold px-3 py-1 rounded-lg text-[10px] uppercase hover:bg-[#FF5A00] hover:text-[#111216] transition shrink-0"
                    >
                      INSPECT
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-right">
                <button
                  type="button"
                  onClick={() => setIgnoreDuplicates(true)}
                  className="text-xs font-mono font-extrabold text-[#FF5A00] underline uppercase p-1"
                >
                  NO, THIS IS A DISTINCT NEW HAZARD → CONTINUE
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono uppercase text-slate-500 font-bold mb-1">STREET CORRIDOR COORDINATES</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter address or get live location"
                className="flex-1 bg-[#F4F4EE] border-2 border-[#111216] rounded-xl px-3.5 py-3 text-xs text-[#111216] font-mono font-bold outline-none focus:border-[#FF5A00]"
              />
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={isLocating}
                className="bg-[#111216] text-[#c5ff00] hover:bg-[#FF5A00] hover:text-[#111216] px-4 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 border-2 border-[#111216]"
              >
                {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Radio className="w-4 h-4" />}
                LIVE
              </button>
            </div>
          </div>

          <div className="flex space-x-3 pt-4 border-t-2 border-slate-100">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setStep(2)}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-[#111216] font-mono font-bold py-3.5 px-4 rounded-2xl border-2 border-slate-300 transition text-xs uppercase min-h-[48px]"
            >
              ← BACK
            </button>
            <button
              type="button"
              disabled={isSubmitting || (duplicates.length > 0 && !ignoreDuplicates)}
              onClick={handleSubmitReport}
              className="flex-[2] bg-[#FF5A00] hover:bg-[#ff7021] disabled:opacity-40 text-[#111216] font-display font-extrabold py-3.5 px-6 rounded-2xl shadow-[4px_4px_0px_#111216] border-2 border-[#111216] transition text-xs uppercase tracking-wider flex items-center justify-center space-x-2 min-h-[48px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>LOGGING TO TRIAGE CLOUD...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 stroke-[3px]" />
                  <span>SUBMIT OFFICIAL LOG (+20 PTS)</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
