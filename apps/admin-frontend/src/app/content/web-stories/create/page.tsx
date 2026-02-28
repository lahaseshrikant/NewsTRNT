"use client";

import React, { useState, useRef } from'react';
import { useRouter } from'next/navigation';
import Link from'next/link';
import Image from'next/image';
import adminAuth from'@/lib/auth/admin-auth';
import { API_CONFIG } from'@/config/api';

const API_BASE_URL = API_CONFIG.baseURL;

interface StorySlide {
 id: string;
 type:'image' |'video' |'text';
 background: string;
 content: {
 headline?: string;
 text?: string;
 image?: string;
 video?: string;
 cta?: {
 text: string;
 url: string;
 };
 };
 duration: number;
}

interface StoryData {
 title: string;
 category: string;
 priority:'high' |'normal' |'low';
 status:'draft' |'published';
 coverImage?: string;
 slides: StorySlide[];
}

const CreateWebStory: React.FC = () => {
 const router = useRouter();
 const fileInputRef = useRef<HTMLInputElement>(null);
 
 const [storyData, setStoryData] = useState<StoryData>({
 title:'',
 category:'Technology',
 priority:'normal',
 status:'draft',
 slides: [
 {
 id:'1',
 type:'text',
 background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
 content: {
 headline:'',
 text:'',
 },
 duration: 5000
 }
 ]
 });

 const [activeSlideIndex, setActiveSlideIndex] = useState(0);
 const [previewMode, setPreviewMode] = useState(false);
 const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);

 const backgroundOptions = ['linear-gradient(135deg, #667eea 0%, #764ba2 100%)','linear-gradient(135deg, #f093fb 0%, #f5576c 100%)','linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)','linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)','linear-gradient(135deg, #fa709a 0%, #fee140 100%)','linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)','linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)','linear-gradient(135deg, #ff8a80 0%, #ea80fc 100%)',
 ];

 const addSlide = () => {
 const newSlide: StorySlide = {
 id: Date.now().toString(),
 type:'text',
 background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
 content: {
 headline:'',
 text:'',
 },
 duration: 5000
 };
 
 setStoryData(prev => ({
 ...prev,
 slides: [...prev.slides, newSlide]
 }));
 setActiveSlideIndex(storyData.slides.length);
 };

 const removeSlide = (index: number) => {
 if (storyData.slides.length <= 1) return;
 
 setStoryData(prev => ({
 ...prev,
 slides: prev.slides.filter((_, i) => i !== index)
 }));
 
 if (activeSlideIndex >= storyData.slides.length - 1) {
 setActiveSlideIndex(Math.max(0, activeSlideIndex - 1));
 }
 };

 const updateSlide = (index: number, updates: Partial<StorySlide>) => {
 setStoryData(prev => ({
 ...prev,
 slides: prev.slides.map((slide, i) => 
 i === index ? { ...slide, ...updates } : slide
 )
 }));
 };

 const updateSlideContent = (index: number, contentUpdates: Partial<StorySlide['content']>) => {
 setStoryData(prev => ({
 ...prev,
 slides: prev.slides.map((slide, i) => 
 i === index 
 ? { ...slide, content: { ...slide.content, ...contentUpdates } }
 : slide
 )
 }));
 };

 const handleImageUpload = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
 const file = event.target.files?.[0];
 if (file) {
 // In a real app, you'd upload to a storage service
 const imageUrl = URL.createObjectURL(file);
 updateSlideContent(index, { image: imageUrl });
 updateSlide(index, { type:'image' });
 }
 };

 const [saving, setSaving] = useState(false);

 const saveStory = async (publish = false) => {
 setSaving(true);
 const storyToSave = {
 title: storyData.title,
 slides: storyData.slides,
 category: storyData.category,
 priority: storyData.priority,
 coverImage: storyData.coverImage,
 status: publish ?'published' :'draft',
 publishedAt: publish ? new Date().toISOString() : undefined
 };

 try {
 const res = await fetch(`${API_BASE_URL}/webstories/admin`, {
 method:'POST',
 headers: {'Content-Type':'application/json',
 ...adminAuth.getAuthHeaders()
 },
 body: JSON.stringify(storyToSave)
 });

 if (!res.ok) {
 const err = await res.json().catch(() => ({}));
 throw new Error(err.error ||'Failed to save story');
 }

 router.push('/content/web-stories');
 } catch (error: any) {
 console.error('Failed to save story:', error);
 alert(error.message ||'Failed to save story');
 } finally {
 setSaving(false);
 }
 };

 const activeSlide = storyData.slides[activeSlideIndex];

 if (previewMode) {
 return (
 <div className="fixed inset-0 bg-black">
 {/* Preview Mode */}
 <div className="absolute top-4 right-4 z-50">
 <button
 onClick={() => setPreviewMode(false)}
 className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg"
 >
 Exit Preview
 </button>
 </div>
 
 <div 
 className="w-full h-full flex items-center justify-center text-white relative"
 style={{ background: activeSlide.background }}
 >
 {activeSlide.content.image && (
 <Image
 src={activeSlide.content.image}
 alt=""
 fill
 className="object-cover"
 />
 )}
 
 <div className="absolute inset-0 bg-black/40" />
 
 <div className="relative z-10 text-center p-8 max-w-lg">
 {activeSlide.content.headline && (
 <h1 className="text-2xl font-semibold tracking-tight mb-4">{activeSlide.content.headline}</h1>
 )}
 {activeSlide.content.text && (
 <p className="text-lg leading-relaxed">{activeSlide.content.text}</p>
 )}
 </div>
 
 {/* Slide Navigation */}
 <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
 {storyData.slides.map((_, index) => (
 <button
 key={index}
 onClick={() => setActiveSlideIndex(index)}
 className={`w-3 h-3 rounded-full ${
 index === activeSlideIndex ?'bg-white' :'bg-white/40'
 }`}
 />
 ))}
 </div>
 </div>
 </div>
 );
 }

 return (
 <div className="space-y-6">
 {/* Header */}
 <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-b border-[rgb(var(--border))]">
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-2xl font-semibold tracking-tight text-[rgb(var(--foreground))] mb-2">
 Create Web Story
 </h1>
 <p className="text-sm text-[rgb(var(--muted-foreground))]">
 Build an immersive visual story experience
 </p>
 </div>
 <div className="flex space-x-3">
 <button
 onClick={() => setPreviewMode(true)}
 className="bg-[rgb(var(--muted))]/10 text-[rgb(var(--foreground))] px-6 py-2 rounded-lg font-medium hover:bg-[rgb(var(--muted))]/10/90 transition-colors"
 >
 Preview
 </button>
 <button
 onClick={() => saveStory(false)}
 disabled={saving}
 className="bg-[rgb(var(--muted))]/10 text-[rgb(var(--foreground))] px-6 py-2 rounded-lg font-medium hover:bg-[rgb(var(--muted))]/10/90 transition-colors disabled:opacity-50"
 >
 {saving ?'Saving...' :'Save Draft'}
 </button>
 <button
 onClick={() => saveStory(true)}
 disabled={saving}
 className="bg-[rgb(var(--primary))] text-white px-6 py-2 rounded-lg font-medium hover:bg-[rgb(var(--primary))]/90 transition-colors disabled:opacity-50"
 >
 {saving ?'Publishing...' :'Publish'}
 </button>
 </div>
 </div>
 </div>

 <div>
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
 {/* Story Settings */}
 <div className="lg:col-span-3">
 <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg p-6 sticky top-4">
 <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4">Story Settings</h3>
 
 <div className="space-y-4">
 <div>
 <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">Title</label>
 <input
 type="text"
 value={storyData.title}
 onChange={(e) => setStoryData(prev => ({ ...prev, title: e.target.value }))}
 placeholder="Enter story title..."
 className="w-full px-3 py-2 border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--background))] text-[rgb(var(--foreground))] text-sm"
 />
 </div>
 
 <div>
 <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">Category</label>
 <select
 value={storyData.category}
 onChange={(e) => setStoryData(prev => ({ ...prev, category: e.target.value }))}
 className="w-full px-3 py-2 border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--background))] text-[rgb(var(--foreground))] text-sm"
 >
 <option>Technology</option>
 <option>Business</option>
 <option>Environment</option>
 <option>Sports</option>
 <option>Entertainment</option>
 <option>Science</option>
 <option>Health</option>
 <option>Politics</option>
 </select>
 </div>
 
 <div>
 <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">Priority</label>
 <select
 value={storyData.priority}
 onChange={(e) => setStoryData(prev => ({ ...prev, priority: e.target.value as any }))}
 className="w-full px-3 py-2 border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--background))] text-[rgb(var(--foreground))] text-sm"
 >
 <option value="normal">Normal</option>
 <option value="high">High</option>
 <option value="low">Low</option>
 </select>
 </div>
 
 <div className="pt-4 border-t border-[rgb(var(--border))]">
 <p className="text-sm text-[rgb(var(--muted-foreground))] mb-2">Story Progress</p>
 <div className="text-sm text-[rgb(var(--foreground))]">
 <div>{storyData.slides.length} slides</div>
 <div>~{Math.round(storyData.slides.reduce((sum, slide) => sum + slide.duration, 0) / 1000)}s duration</div>
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Slide Editor */}
 <div className="lg:col-span-6">
 <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg overflow-hidden">
 {/* Slide Preview */}
 <div 
 className="aspect-[9/16] relative flex items-center justify-center text-white"
 style={{ background: activeSlide.background }}
 >
 {activeSlide.content.image && (
 <Image
 src={activeSlide.content.image}
 alt=""
 fill
 className="object-cover"
 />
 )}
 
 <div className="absolute inset-0 bg-black/40" />
 
 <div className="relative z-10 text-center p-6 w-full">
 {activeSlide.content.headline && (
 <h1 className="text-2xl font-bold mb-3">{activeSlide.content.headline}</h1>
 )}
 {activeSlide.content.text && (
 <p className="text-base leading-relaxed">{activeSlide.content.text}</p>
 )}
 {activeSlide.content.cta && (
 <button className="mt-4 bg-[rgb(var(--background))] text-[rgb(var(--foreground))] px-4 py-2 rounded-full text-sm font-medium">
 {activeSlide.content.cta.text}
 </button>
 )}
 </div>
 
 {/* Slide Number */}
 <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
 {activeSlideIndex + 1} / {storyData.slides.length}
 </div>
 </div>
 
 {/* Slide Controls */}
 <div className="p-6 border-t border-[rgb(var(--border))]">
 <div className="space-y-4">
 <div className="flex items-center space-x-2">
 <label className="text-sm font-medium text-[rgb(var(--foreground))]">Type:</label>
 <div className="flex space-x-2">
 <button
 onClick={() => updateSlide(activeSlideIndex, { type:'text' })}
 className={`px-3 py-1 rounded text-sm ${
 activeSlide.type ==='text' 
 ?'bg-[rgb(var(--primary))] text-white' 
 :'bg-[rgb(var(--muted))]/10 text-[rgb(var(--foreground))]'
 }`}
 >
 Text
 </button>
 <button
 onClick={() => updateSlide(activeSlideIndex, { type:'image' })}
 className={`px-3 py-1 rounded text-sm ${
 activeSlide.type ==='image' 
 ?'bg-[rgb(var(--primary))] text-white' 
 :'bg-[rgb(var(--muted))]/10 text-[rgb(var(--foreground))]'
 }`}
 >
 Image
 </button>
 </div>
 </div>
 
 <div>
 <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">Headline</label>
 <input
 type="text"
 value={activeSlide.content.headline ||''}
 onChange={(e) => updateSlideContent(activeSlideIndex, { headline: e.target.value })}
 placeholder="Enter headline..."
 className="w-full px-3 py-2 border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--background))] text-[rgb(var(--foreground))] text-sm"
 />
 </div>
 
 <div>
 <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">Text</label>
 <textarea
 value={activeSlide.content.text ||''}
 onChange={(e) => updateSlideContent(activeSlideIndex, { text: e.target.value })}
 placeholder="Enter story text..."
 rows={3}
 className="w-full px-3 py-2 border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--background))] text-[rgb(var(--foreground))] text-sm resize-none"
 />
 </div>
 
 {activeSlide.type ==='image' && (
 <div>
 <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">Background Image</label>
 <div className="flex space-x-2">
 <input
 ref={fileInputRef}
 type="file"
 accept="image/*"
 onChange={(e) => handleImageUpload(activeSlideIndex, e)}
 className="hidden"
 />
 <button
 onClick={() => fileInputRef.current?.click()}
 className="flex-1 bg-[rgb(var(--muted))]/10 text-[rgb(var(--foreground))] px-3 py-2 rounded-lg text-sm hover:bg-[rgb(var(--muted))]/10/90 transition-colors"
 >
 Upload Image
 </button>
 {activeSlide.content.image && (
 <button
 onClick={() => updateSlideContent(activeSlideIndex, { image:'' })}
 className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-600 transition-colors"
 >
 
 </button>
 )}
 </div>
 </div>
 )}
 
 <div>
 <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">Background</label>
 <div className="grid grid-cols-4 gap-2">
 {backgroundOptions.map((bg, index) => (
 <button
 key={index}
 onClick={() => updateSlide(activeSlideIndex, { background: bg })}
 className={`w-full h-8 rounded border-2 ${
 activeSlide.background === bg ?'border-[rgb(var(--primary))]' :'border-[rgb(var(--border))]'
 }`}
 style={{ background: bg }}
 />
 ))}
 </div>
 </div>
 
 <div>
 <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
 Duration: {activeSlide.duration / 1000}s
 </label>
 <input
 type="range"
 min="3000"
 max="10000"
 step="1000"
 value={activeSlide.duration}
 onChange={(e) => updateSlide(activeSlideIndex, { duration: parseInt(e.target.value) })}
 className="w-full"
 />
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Slide Timeline */}
 <div className="lg:col-span-3">
 <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg p-6">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-lg font-semibold text-[rgb(var(--foreground))]">Slides</h3>
 <button
 onClick={addSlide}
 className="bg-[rgb(var(--primary))] text-white px-3 py-1 rounded text-sm hover:bg-[rgb(var(--primary))]/90 transition-colors"
 >
 Add
 </button>
 </div>
 
 <div className="space-y-2">
 {storyData.slides.map((slide, index) => (
 <div
 key={slide.id}
 onClick={() => setActiveSlideIndex(index)}
 className={`p-3 border rounded-lg cursor-pointer transition-colors ${
 index === activeSlideIndex
 ?'border-[rgb(var(--primary))] bg-[rgb(var(--primary))]/10'
 :'border-[rgb(var(--border))] hover:bg-[rgb(var(--muted))]/5'
 }`}
 >
 <div className="flex items-center justify-between">
 <div className="flex-1">
 <div className="text-sm font-medium text-[rgb(var(--foreground))]">
 Slide {index + 1}
 </div>
 <div className="text-xs text-[rgb(var(--muted-foreground))]">
 {slide.content.headline ||'Untitled'} • {slide.duration / 1000}s
 </div>
 </div>
 {storyData.slides.length > 1 && (
 <button
 onClick={(e) => {
 e.stopPropagation();
 removeSlide(index);
 }}
 className="text-red-500 hover:text-red-700 text-sm ml-2"
 >
 
 </button>
 )}
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
};

export default CreateWebStory;


