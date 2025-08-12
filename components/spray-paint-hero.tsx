'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Creepster } from 'next/font/google'

/* Graffiti/street art font with better readability and style */
const graffitiFont = Creepster({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
})

/* ------------------------------------------------------------------ */
/*  particle helpers / types                                          */
/* ------------------------------------------------------------------ */
type Part = { x:number; y:number; vx:number; vy:number; r:number; life:number; max:number; c:string }
type Drop = { x:number; y:number; vx:number; vy:number; r:number; life:number; max:number; g:number; c:string }

const COLORS = [
  { p:'#39ff14', s:'#00ff00' },
  { p:'#ff1493', s:'#ff69b4' },
  { p:'#00ffff', s:'#0080ff' },
  { p:'#ff4500', s:'#ff6b35' },
]

/* ------------------------------------------------------------------ */
/*  custom hook that owns canvas & animation                          */
/* ------------------------------------------------------------------ */
function useSprayCanvas(ref:React.RefObject<HTMLCanvasElement | null>, run:boolean) {
  const parts = useRef<Part[]>([])
  const drips = useRef<Drop[]>([])
  const raf   = useRef<number | null>(null)
  const ctxRef= useRef<CanvasRenderingContext2D | null>(null)
  const running= useRef(false)
  const MAX_PARTS = 450  // hard cap to avoid runaway memory on slower devices
  const rnd = (a:number,b:number)=>Math.random()*(b-a)+a

  const startLoop = useCallback(()=>{
    if(running.current || !ctxRef.current) return
    running.current = true
    const cvs = ref.current!
    const ctx = ctxRef.current
    const step=()=>{
      // physics update (mutate in place & filter dead)
      parts.current = parts.current.filter(p=>{
        p.x+=p.vx; p.y+=p.vy; p.vx*=0.985; p.vy = p.vy*0.985 + 0.05; p.life--; return p.life>0
      })
      drips.current = drips.current.filter(d=>{
        d.x+=d.vx; d.y+=d.vy; d.vy+=d.g; d.vx*=0.99; d.life--; return d.life>0
      })

      if(parts.current.length===0 && drips.current.length===0){
        // nothing left to draw; pause loop until next burst
        running.current=false
        raf.current=null
        return
      }

      ctx!.clearRect(0,0,cvs.width,cvs.height)
      ctx!.globalCompositeOperation='screen'

      for(const d of drips.current){
        const a=d.life/d.max; if(a<0.12) continue
        ctx!.globalAlpha=a*0.75; ctx!.fillStyle=d.c
        ctx!.beginPath(); ctx!.ellipse(d.x,d.y,d.r,d.r*1.4,0,0,Math.PI*2); ctx!.fill()
      }
      for(const p of parts.current){
        const a=p.life/p.max; if(a<0.12) continue
        ctx!.globalAlpha=a
        const g=ctx!.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*1.4)
        g.addColorStop(0,p.c); g.addColorStop(1,'transparent')
        ctx!.fillStyle=g
        ctx!.beginPath(); ctx!.arc(p.x,p.y,p.r,0,Math.PI*2); ctx!.fill()
      }
      ctx!.globalCompositeOperation='source-over'
      raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
  },[ref])

  const burst = useCallback((x:number,y:number)=>{
    // Skip if animation disabled
    if(!run) return
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    if(reduce) return
    // Respect particle cap (trim oldest first)
    if(parts.current.length > MAX_PARTS) parts.current.splice(0, parts.current.length - MAX_PARTS)
    if(drips.current.length > MAX_PARTS) drips.current.splice(0, drips.current.length - MAX_PARTS)

    const pCount = 14
    const dCount = 4
    for(let i=0;i<pCount;i++){
      const col=COLORS[Math.floor(Math.random()*COLORS.length)]
      const life = rnd(22,38)
      parts.current.push({x:x+rnd(-15,15),y:y+rnd(-15,15),vx:rnd(-3,3),vy:rnd(-3,3),r:rnd(1,3.4),life,max:life,c:Math.random()>.5?col.p:col.s})
    }
    for(let i=0;i<dCount;i++){
      const col=COLORS[Math.floor(Math.random()*COLORS.length)]
      const life=rnd(50,90)
      drips.current.push({x:x+rnd(-18,18),y:y+rnd(-10,10),vx:rnd(-1,1),vy:rnd(1,3),r:rnd(2,5),life,max:life,g:rnd(.08,.22),c:col.p})
    }
    startLoop()
  },[run,startLoop])

  useEffect(()=>{
    const cvs=ref.current
    if(!cvs) return
    const ctx=cvs.getContext('2d') as CanvasRenderingContext2D | null
    if(!ctx) return
    ctxRef.current = ctx

    // Hi-DPI sizing (avoid cumulative scaling)
    const setSize=()=>{
      const rect = cvs.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      // Reset transform to avoid compounding scale
      ctx.setTransform(1,0,0,1,0,0)
      const needResize = cvs.width !== Math.floor(rect.width*dpr) || cvs.height !== Math.floor(rect.height*dpr)
      if(needResize){
        cvs.width = Math.floor(rect.width * dpr)
        cvs.height= Math.floor(rect.height * dpr)
      }
      ctx.scale(dpr,dpr)
    }
    setSize(); addEventListener('resize',setSize,{passive:true})
    return ()=>{ removeEventListener('resize',setSize); if(raf.current) cancelAnimationFrame(raf.current) }
  },[ref])

  // If run toggles on and we have particles, restart loop
  useEffect(()=>{ if(run && (parts.current.length||drips.current.length)) startLoop(); },[run,startLoop])

  return burst
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */
const TITLE = 'SLAPRUSH'
const SUB   = 'Premium Print-On-Demand'

export default function SprayPaintHero() {
  // Use a broader ref type; the hook internally guards for null.
  const cvs = useRef<HTMLCanvasElement | null>(null)
  const [visible,setVisible]=useState(false)
  const [idx,setIdx] = useState(0)
  const [can,setCan] = useState({x:50,y:50})

  const burst = useSprayCanvas(cvs,visible)

  /* IntersectionObserver to pause animation off-screen */
  useEffect(()=>{
    const io=new IntersectionObserver(([e])=>setVisible(e.isIntersecting),{threshold:.25})
    cvs.current&&io.observe(cvs.current);return()=>io.disconnect()
  },[])

  /* letter reveal */
  useEffect(()=>{
    if(!visible) return
    // Use a single RAF-driven scheduler to reduce setInterval wakeups on older CPUs
    let start:number|null=null
    let lastIndex = idx
    let frame:number
    const perLetter = 200 // ms between letters
    const runFrame=(ts:number)=>{
      if(start==null) start=ts
      const elapsed = ts - start
      const target = Math.min(TITLE.length, Math.floor(elapsed / perLetter))
      while(lastIndex < target){
        const rect = cvs.current!.getBoundingClientRect()
        const x = rect.width*0.3 + lastIndex*(rect.width*0.4/TITLE.length)
        const y = rect.height*0.35
        burst(x,y)
        setCan({x:15+lastIndex*10,y:40+Math.sin(lastIndex*0.8)*8})
        lastIndex++
      }
      if(lastIndex !== idx) setIdx(lastIndex)
      if(lastIndex < TITLE.length){ frame=requestAnimationFrame(runFrame) }
    }
    frame=requestAnimationFrame(runFrame)
    return ()=>cancelAnimationFrame(frame)
  // deliberately omit idx from deps to avoid restart mid animation
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[visible,burst])

  /* ---------------------------------------------------------------- */
  return (
    <section role="banner" aria-label="SlapRush hero"
      className="relative py-24 md:py-32 lg:py-40 bg-slate-900 text-white overflow-hidden min-h-[90vh]">
      {/* Enhanced keyframes for better animations */}
      <style>{`
        @keyframes gridShift{0%{background-position:0 0}100%{background-position:80px 80px}}
        @keyframes sprayPulse{0%,100%{opacity:.6}50%{opacity:.1}}
        @keyframes paintDrip{0%{transform:translateY(-100px) scale(0.8)}100%{transform:translateY(100vh) scale(1.2)}}
        @keyframes floatSlow{0%,100%{transform:translateY(0px) rotate(0deg)}50%{transform:translateY(-15px) rotate(2deg)}}
        @keyframes shimmerMove{0%{transform:translateX(-100%) skewX(-15deg)}100%{transform:translateX(200%) skewX(-15deg)}}
        @keyframes pulseGlow{0%,100%{opacity:0.3; transform:scale(1)}50%{opacity:0.8; transform:scale(1.1)}}
      `}</style>

      {/* canvas for spray particles */}
      <canvas ref={cvs} className="absolute inset-0 w-full h-full pointer-events-none z-10"/>

      {/* extra ambience layers */}
      <div className="absolute inset-0 pointer-events-none z-20" aria-hidden>
        {/* Test element to verify visibility */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-red-500 opacity-80 rounded-full"></div>
        <div className="absolute top-10 right-10 w-16 h-16 bg-green-500 opacity-70"></div>
        <div className="absolute bottom-10 left-10 w-12 h-12 bg-blue-500 opacity-90 rounded-full"></div>
        
        {/* Large visible background elements for immediate visibility */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 border-4 border-blue-400/70 rotate-45"
             style={{animation: 'floatSlow 10s ease-in-out infinite'}}></div>
        <div className="absolute bottom-1/4 right-1/4 w-28 h-28 border-4 border-purple-400/60 rounded-full"
             style={{animation: 'floatSlow 12s ease-in-out infinite', animationDelay: '3s'}}></div>
        
        {/* animated dual-colour grid with enhanced movement */}
        <div className="absolute inset-0 opacity-30"
             style={{backgroundImage:`linear-gradient(#3b82f6 1px,transparent 1px),
                                      linear-gradient(90deg,#1e40af 1px,transparent 1px)`,
                     backgroundSize:'60px 60px',animation:'gridShift 25s linear infinite'}}/>
        
        {/* diagonal lines pattern */}
        <div className="absolute inset-0 opacity-20"
             style={{backgroundImage:`repeating-linear-gradient(45deg, #3b82f6 0px, transparent 2px, transparent 40px, #1e40af 42px)`,
                     animation:'floatSlow 8s ease-in-out infinite'}}/>
        
        {/* animated paint drips */}
        <div className="absolute top-0 left-1/4 w-1 h-8 bg-gradient-to-b from-green-400 to-transparent opacity-60"
             style={{animation: 'paintDrip 12s linear infinite'}}/>
        <div className="absolute top-0 left-3/4 w-1 h-6 bg-gradient-to-b from-pink-500 to-transparent opacity-50"
             style={{animation: 'paintDrip 15s linear infinite', animationDelay: '3s'}}/>
        <div className="absolute top-0 left-1/2 w-1 h-10 bg-gradient-to-b from-cyan-400 to-transparent opacity-40"
             style={{animation: 'paintDrip 18s linear infinite', animationDelay: '6s'}}/>
        
        {/* floating product icons and shapes */}
        {/* T-shirt icons */}
        <div className="absolute top-20 left-10 opacity-70"
             style={{animation: 'floatSlow 6s ease-in-out infinite'}}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
            <path d="M7 6V4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"/>
            <path d="M7 6H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3"/>
          </svg>
        </div>
        
        {/* Coffee mug */}
        <div className="absolute top-40 right-20 opacity-80"
             style={{animation: 'floatSlow 8s ease-in-out infinite', animationDelay: '2s'}}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
            <path d="M17 8h1a4 4 0 1 1 0 8h-1"/>
            <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/>
            <line x1="6" x2="6" y1="2" y2="4"/>
            <line x1="10" x2="10" y1="2" y2="4"/>
            <line x1="14" x2="14" y1="2" y2="4"/>
          </svg>
        </div>
        
        {/* Magnet/badge icon */}
        <div className="absolute bottom-32 left-1/3 opacity-60"
             style={{animation: 'floatSlow 7s ease-in-out infinite', animationDelay: '4s'}}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="6"/>
            <circle cx="12" cy="12" r="2"/>
          </svg>
        </div>
        
        {/* Additional product silhouettes */}
        {/* Phone case */}
        <div className="absolute top-60 left-1/4 opacity-40"
             style={{animation: 'floatSlow 9s ease-in-out infinite', animationDelay: '1s'}}>
          <svg width="30" height="45" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
            <rect width="16" height="20" x="4" y="2" rx="2" ry="2"/>
            <line x1="12" x2="12.01" y1="18" y2="18"/>
          </svg>
        </div>
        
        {/* Sticker/label */}
        <div className="absolute top-1/3 right-1/4 opacity-35"
             style={{animation: 'floatSlow 5s ease-in-out infinite', animationDelay: '3s'}}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
            <path d="M12 16v6"/>
            <path d="M8 19h8"/>
          </svg>
        </div>
        
        {/* Tote bag */}
        <div className="absolute bottom-20 right-10 opacity-45"
             style={{animation: 'floatSlow 7s ease-in-out infinite', animationDelay: '5s'}}>
          <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2">
            <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1ZM10 6a2 2 0 0 1 4 0v1h-4V6Z"/>
          </svg>
        </div>
        
        {/* Poster/print */}
        <div className="absolute top-1/2 left-12 opacity-30"
             style={{animation: 'floatSlow 6s ease-in-out infinite', animationDelay: '2.5s'}}>
          <svg width="36" height="45" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
            <circle cx="9" cy="9" r="2"/>
            <path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
          </svg>
        </div>
        
        {/* Cap/hat */}
        <div className="absolute bottom-40 left-2/3 opacity-40"
             style={{animation: 'floatSlow 8s ease-in-out infinite', animationDelay: '6s'}}>
          <svg width="48" height="36" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
            <path d="M8 12h8"/>
            <path d="M8 16h8"/>
          </svg>
        </div>
        
        {/* enhanced color blobs with glow animation */}
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]"
             style={{animation: 'pulseGlow 10s ease-in-out infinite'}}/>
        <div className="absolute -bottom-24 right-10 w-80 h-80 bg-indigo-600/25 rounded-full blur-[120px]"
             style={{animation: 'pulseGlow 12s ease-in-out infinite', animationDelay: '3s'}}/>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-purple-600/15 rounded-full blur-[100px]"
             style={{animation: 'pulseGlow 8s ease-in-out infinite', animationDelay: '6s'}}/>
        
        {/* printing process elements */}
        {/* Ink droplets scattered around */}
        <div className="absolute top-32 right-1/3 w-4 h-4 bg-blue-400/80 rounded-full"
             style={{animation: 'floatSlow 4s ease-in-out infinite'}}/>
        <div className="absolute top-80 left-1/5 w-3 h-3 bg-purple-400/70 rounded-full"
             style={{animation: 'floatSlow 5s ease-in-out infinite', animationDelay: '1s'}}/>
        <div className="absolute bottom-60 right-1/5 w-5 h-5 bg-indigo-400/60 rounded-full"
             style={{animation: 'floatSlow 6s ease-in-out infinite', animationDelay: '3s'}}/>
        <div className="absolute top-48 left-3/4 w-3 h-3 bg-cyan-400/60 rounded-full"
             style={{animation: 'floatSlow 7s ease-in-out infinite', animationDelay: '2s'}}/>
        <div className="absolute bottom-80 left-1/6 w-4 h-4 bg-pink-400/50 rounded-full"
             style={{animation: 'floatSlow 8s ease-in-out infinite', animationDelay: '4s'}}/>
        
        {/* Large decorative shapes */}
        <div className="absolute top-16 right-1/6 w-16 h-16 border-2 border-blue-400/40 rotate-45"
             style={{animation: 'floatSlow 10s ease-in-out infinite'}}/>
        <div className="absolute bottom-16 left-1/12 w-20 h-20 border-2 border-purple-400/30 rounded-full"
             style={{animation: 'floatSlow 12s ease-in-out infinite', animationDelay: '3s'}}/>
        <div className="absolute top-2/3 right-1/12 w-12 h-12 border-2 border-indigo-400/50"
             style={{animation: 'floatSlow 9s ease-in-out infinite', animationDelay: '6s'}}/>
        
        {/* Design elements - lines and shapes */}
        <div className="absolute top-1/4 left-1/6 w-24 h-1 bg-gradient-to-r from-blue-400/50 to-transparent rotate-12"
             style={{animation: 'floatSlow 7s ease-in-out infinite', animationDelay: '2s'}}/>
        <div className="absolute bottom-1/3 right-1/6 w-20 h-1 bg-gradient-to-r from-purple-400/40 to-transparent -rotate-12"
             style={{animation: 'floatSlow 8s ease-in-out infinite', animationDelay: '4s'}}/>
        <div className="absolute top-1/2 left-3/4 w-16 h-1 bg-gradient-to-r from-cyan-400/60 to-transparent rotate-45"
             style={{animation: 'floatSlow 6s ease-in-out infinite', animationDelay: '1s'}}/>
        
        {/* Typography/design tools silhouettes */}
        <div className="absolute top-3/4 left-1/5 opacity-25"
             style={{animation: 'floatSlow 9s ease-in-out infinite', animationDelay: '1.5s'}}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" x2="8" y1="13" y2="13"/>
            <line x1="16" x2="8" y1="17" y2="17"/>
            <polyline points="10,9 9,9 8,9"/>
          </svg>
        </div>
        
        {/* Brush/pen tool */}
        <div className="absolute top-1/6 right-1/3 opacity-30"
             style={{animation: 'floatSlow 6s ease-in-out infinite', animationDelay: '7s'}}>
          <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2">
            <path d="M15.24 6.37C15.65 6.6 16.04 6.88 16.38 7.22L18.1 5.5C18.84 4.76 18.84 3.59 18.1 2.85C17.36 2.11 16.19 2.11 15.45 2.85L13.73 4.57C14.07 4.91 14.35 5.3 14.58 5.71L15.24 6.37Z"/>
            <path d="M12.29 7.71L7.15 2.57C6.41 1.83 5.24 1.83 4.5 2.57S3.76 4.34 4.5 5.08L9.64 10.22"/>
            <path d="M16.85 8.64L11.71 13.78C11.25 14.24 10.47 14.24 10.01 13.78L9.64 13.41"/>
          </svg>
        </div>
        
        {/* shimmer effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -inset-x-full top-1/4 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"
               style={{animation: 'shimmerMove 8s ease-in-out infinite'}}/>
          <div className="absolute -inset-x-full top-3/4 h-px bg-gradient-to-r from-transparent via-purple-400/40 to-transparent"
               style={{animation: 'shimmerMove 10s ease-in-out infinite', animationDelay: '2s'}}/>
        </div>
        
        {/* Print patterns and textures */}
        {/* Halftone dots pattern */}
        <div className="absolute top-1/3 left-1/12 opacity-20"
             style={{animation: 'floatSlow 10s ease-in-out infinite'}}>
          <div className="grid grid-cols-4 gap-2">
            <div className="w-2 h-2 bg-blue-400/80 rounded-full"></div>
            <div className="w-1 h-1 bg-blue-400/60 rounded-full"></div>
            <div className="w-3 h-3 bg-blue-400/70 rounded-full"></div>
            <div className="w-2 h-2 bg-blue-400/50 rounded-full"></div>
            <div className="w-1 h-1 bg-blue-400/70 rounded-full"></div>
            <div className="w-2 h-2 bg-blue-400/80 rounded-full"></div>
            <div className="w-2 h-2 bg-blue-400/60 rounded-full"></div>
            <div className="w-3 h-3 bg-blue-400/50 rounded-full"></div>
          </div>
        </div>
        
        {/* Printer/production symbols */}
        <div className="absolute bottom-1/4 left-1/12 opacity-30"
             style={{animation: 'floatSlow 7s ease-in-out infinite', animationDelay: '3s'}}>
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
            <polyline points="6,9 6,2 18,2 18,9"/>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
            <rect width="12" height="8" x="6" y="14"/>
          </svg>
        </div>
        
        {/* Color swatches */}
        <div className="absolute top-20 right-1/12 opacity-40"
             style={{animation: 'floatSlow 6s ease-in-out infinite', animationDelay: '4s'}}>
          <div className="flex space-x-2">
            <div className="w-4 h-8 bg-blue-400/90 rounded-sm"></div>
            <div className="w-4 h-8 bg-purple-400/90 rounded-sm"></div>
            <div className="w-4 h-8 bg-indigo-400/90 rounded-sm"></div>
          </div>
        </div>
        
        {/* Screen printing squeegee */}
        <div className="absolute bottom-1/3 right-1/12 opacity-25"
             style={{animation: 'floatSlow 8s ease-in-out infinite', animationDelay: '6s'}}>
          <div className="w-12 h-2 bg-gradient-to-r from-purple-400/80 to-blue-400/60 rounded-full rotate-45"></div>
        </div>
        
        {/* Additional scattered elements */}
        {/* More product shapes */}
        <div className="absolute top-1/5 left-2/3 opacity-35"
             style={{animation: 'floatSlow 11s ease-in-out infinite', animationDelay: '8s'}}>
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
            <rect width="20" height="14" x="2" y="3" rx="2" ry="2"/>
            <line x1="8" x2="16" y1="21" y2="21"/>
            <line x1="12" x2="12" y1="17" y2="21"/>
          </svg>
        </div>
        
        {/* Vinyl/sticker roll */}
        <div className="absolute top-3/5 right-1/6 opacity-30"
             style={{animation: 'floatSlow 13s ease-in-out infinite', animationDelay: '5s'}}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="6"/>
            <circle cx="12" cy="12" r="2"/>
          </svg>
        </div>
        
        {/* Print texture lines */}
        <div className="absolute top-1/6 left-1/4 w-32 h-0.5 bg-gradient-to-r from-transparent via-blue-400/60 to-transparent rotate-6"
             style={{animation: 'floatSlow 14s ease-in-out infinite', animationDelay: '7s'}}/>
        <div className="absolute bottom-1/5 right-1/3 w-28 h-0.5 bg-gradient-to-r from-transparent via-purple-400/50 to-transparent -rotate-12"
             style={{animation: 'floatSlow 16s ease-in-out infinite', animationDelay: '9s'}}/>
        <div className="absolute top-2/5 left-1/8 w-24 h-0.5 bg-gradient-to-r from-transparent via-indigo-400/70 to-transparent rotate-25"
             style={{animation: 'floatSlow 12s ease-in-out infinite', animationDelay: '3s'}}/>
        
        {/* subtle noise overlay */}
        <div className="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGP4+A8AAusB9YgyMhUAAAAASUVORK5CYII=')] opacity-[0.03]" />
      </div>

      {/* animated spray can */}
      <div className="absolute hidden sm:block z-20 transition-all duration-700"
           style={{left:`${can.x}%`,top:`${can.y}%`,transform:'translate(-50%,-50%)'}} aria-hidden>
        <svg width="64" height="140" viewBox="0 0 32 70" className="rotate-[20deg]">
          {/* body */}
          <defs>
            <linearGradient id="can-body" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#d1d5db"/>
              <stop offset="50%" stopColor="#9ca3af"/>
              <stop offset="100%" stopColor="#4b5563"/>
            </linearGradient>
            <linearGradient id="labelGrad" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#39ff14"/>
              <stop offset="50%" stopColor="#00ffff"/>
              <stop offset="100%" stopColor="#ff1493"/>
            </linearGradient>
          </defs>
          <rect x="6" y="10" width="20" height="45" rx="4" fill="url(#can-body)" />
          {/* label */}
          <rect x="8" y="28" width="16" height="11" rx="2" fill="url(#labelGrad)" />
          {/* text placeholder */}
          <text x="16" y="36" fontSize="4" textAnchor="middle" fontWeight="bold" fill="#000">SLAP</text>
          {/* cap */}
          <rect x="10" y="4" width="12" height="9" rx="2" fill="#991b1b" />
          {/* nozzle */}
          <circle cx="16" cy="2.5" r="2.5" fill="#111" />
          <circle cx="16" cy="2.5" r="0.8" fill="#fff" />
          {/* little spray puff */}
          <path d="M20 10 Q32 8 29 15" fill="none" stroke="#39ff14" strokeWidth="2" strokeLinecap="round"
                className="origin-left animate-[sprayPulse_1s_ease-in-out_infinite]" />
        </svg>
      </div>

      {/* headline & copy */}
      <div className="relative z-30 container mx-auto px-4 text-center">
        <h1
          className={`${graffitiFont.className} text-7xl sm:text-8xl md:text-9xl lg:text-[12rem] xl:text-[14rem] font-black mb-8 leading-none`}
        >
          {TITLE.split('').map((L,i)=>(
            <span key={i}
              className={`inline-block transition-transform duration-700
                         ${i<idx?'translate-y-0 opacity-100':'translate-y-12 opacity-0'}`}
              style={{
                transitionDelay:`${i*80}ms`,
                background:i%2
                  ?'linear-gradient(135deg,#ff1493,#ff69b4)'
                  :'linear-gradient(135deg,#39ff14,#00ff00)',
                WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
              }}
            >{L}</span>
          ))}
        </h1>

        <div className={`mb-12 transition-opacity duration-700 ${idx>=TITLE.length?'opacity-100':'opacity-0'}`}>
          <p className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4"
             style={{background:'linear-gradient(90deg,#39ff14,#ff1493,#00ffff)',
                     WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
            {SUB}
          </p>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            Transform your creativity into stunning custom products with our premium print-on-demand platform
          </p>
        </div>

        {/* CTA buttons */}
        <div className={`flex flex-col sm:flex-row gap-6 justify-center mb-16 transition-opacity duration-700 delay-200
                         ${idx>=TITLE.length?'opacity-100':'opacity-0'}`}>
          <Button size="lg"
            className="relative bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-black font-bold
                       px-8 sm:px-12 py-4 rounded-2xl shadow-xl shadow-green-500/25
                       hover:shadow-green-500/40 hover:brightness-110 transition">
            <span className="flex items-center">Start Creating <ArrowRight className="ml-2" /></span>
            <span className="absolute inset-0 opacity-0 hover:opacity-20 bg-white/20 transition-opacity"/>
          </Button>

          <Button size="lg" variant="outline"
            className="relative border-2 border-pink-400 text-pink-400 font-bold
                       px-8 sm:px-12 py-4 rounded-2xl shadow-xl shadow-pink-500/25
                       hover:bg-pink-400 hover:text-black hover:shadow-pink-500/40 transition">
            Browse Products
            <span className="absolute inset-0 opacity-0 hover:opacity-10 bg-pink-400/30 transition-opacity"/>
          </Button>
        </div>

        {/* feature grid */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto
                         transition-opacity duration-700 delay-500 ${idx>=TITLE.length?'opacity-100':'opacity-0'}`}>
          {[
            {t:'Custom Design Tools',c:'blue',d:'Professional design tools and templates to create unique artwork that reflects your brand'},
            {t:'Premium Quality',c:'indigo',d:'Industry-leading materials and state-of-the-art printing technology for exceptional results'},
            {t:'Global Fulfilment',c:'purple',d:'Worldwide production network with fast turnaround and reliable delivery tracking'},
          ].map(({t,c,d},i)=>(
            <div key={i}
              className={`group p-8 rounded-3xl backdrop-blur-lg
                          bg-white/5 border border-${c}-400/20 hover:border-${c}-400/40
                          shadow-lg hover:shadow-2xl transition`}>
              <div className={`w-14 h-14 mb-6 rounded-2xl flex items-center justify-center
                               bg-gradient-to-br from-${c}-400 to-${c}-600
                               shadow-${c}-500/30 group-hover:scale-110 transition`} >
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87
                           1.18 6.88L12 17.77l-6.18 3.25
                           L7 14.14 2 9.27l6.91-1.01z"/>
                </svg>
              </div>
              <h3 className={`font-bold text-xl mb-4 text-${c}-400 group-hover:text-${c}-300 transition-colors`}>{t}</h3>
              <p className="text-gray-300 group-hover:text-gray-200 transition-colors">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
