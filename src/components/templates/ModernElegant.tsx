import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { 
  Music, 
  Quote as QuoteIcon, 
  X, 
  ChevronDown, 
  Calendar, 
  MapPin, 
  Clock,
  Heart,
  Copy,
  Check,
  Play,
  ExternalLink,
  Instagram
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Customer, Project } from '../../types';
import { cn } from '../../lib/utils';
import { APP_LOGO } from '../../constants';

gsap.registerPlugin(ScrollTrigger);

interface ModernElegantProps {
  customer: Customer;
  projectData: Project['data'];
  isPreview?: boolean;
  onElementClick?: (id: string) => void;
  onElementMove?: (id: string, x: number, y: number) => void;
  activeElementId?: string;
}

const EditableElement = ({ 
  id, 
  children, 
  projectData, 
  isPreview, 
  onElementClick, 
  onElementMove,
  activeElementId,
  className
}: {
  id: string;
  children: React.ReactNode;
  projectData: Project['data'];
  isPreview?: boolean;
  onElementClick?: (id: string) => void;
  onElementMove?: (id: string, x: number, y: number) => void;
  activeElementId?: string;
  className?: string;
}) => {
  const style = projectData.elementStyles?.[id] || { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 };
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  if (!isPreview) {
    return (
      <div className={className}>
        <div style={{ 
          transform: `translate(${style.x || 0}px, ${style.y || 0}px) scale(${style.scale || 1}) rotate(${style.rotation || 0}deg)`,
          opacity: style.opacity !== undefined ? style.opacity : 1
        }}>
          {children}
        </div>
      </div>
    );
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeElementId !== id) return;
    e.stopPropagation();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - (style.x || 0),
      y: e.clientY - (style.y || 0)
    });

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (onElementMove) {
        onElementMove(id, moveEvent.clientX - dragStart.x, moveEvent.clientY - dragStart.y);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div 
      onClick={(e) => {
        e.stopPropagation();
        if (onElementClick) onElementClick(id);
      }}
      onMouseDown={handleMouseDown}
      className={cn(
        "relative cursor-pointer transition-all duration-200 rounded-lg group/editable",
        isPreview && "hover:ring-1 hover:ring-blue-500/30",
        activeElementId === id && "ring-2 ring-blue-500 bg-blue-500/10 z-50",
        isDragging && "cursor-grabbing",
        className
      )}
    >
      <div style={{ 
        transform: `translate(${style.x || 0}px, ${style.y || 0}px) scale(${style.scale || 1}) rotate(${style.rotation || 0}deg)`,
        transformOrigin: 'center center',
        opacity: style.opacity !== undefined ? style.opacity : 1,
        pointerEvents: isDragging ? 'none' : 'auto'
      }}>
        {children}
      </div>
      {activeElementId === id && isPreview && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[8px] px-2 py-0.5 rounded whitespace-nowrap font-bold uppercase tracking-tighter shadow-lg">
          Tarik atau Gunakan Arrow Keys
        </div>
      )}
    </div>
  );
};

const Countdown = ({ targetDate }: { targetDate: string }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const target = new Date(targetDate).getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const dist = target - now;
      if (dist < 0) {
        clearInterval(interval);
        return;
      }
      setTimeLeft({
        days: Math.floor(dist / 86400000),
        hours: Math.floor((dist % 86400000) / 3600000),
        mins: Math.floor((dist % 3600000) / 60000),
        secs: Math.floor((dist % 60000) / 1000),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="flex justify-center gap-8 font-sans">
      {[
        { val: timeLeft.days, label: 'Hari' },
        { val: timeLeft.hours, label: 'Jam' },
        { val: timeLeft.mins, label: 'Menit' },
        { val: timeLeft.secs, label: 'Detik' },
      ].map((item, idx) => (
        <div key={idx} className="flex flex-col items-center">
          <span className="font-serif text-4xl font-light text-white tracking-widest mb-2">
            {item.val.toString().padStart(2, '0')}
          </span>
          <span className="text-[9px] uppercase text-[#bfa67a] font-medium tracking-[0.4em]">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default function ModernElegant({ customer, projectData, isPreview = false, onElementClick, onElementMove, activeElementId }: ModernElegantProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const mainContentRef = useRef<HTMLElement>(null);
  const parallaxTopRef = useRef<HTMLImageElement>(null);
  const parallaxBottomRef = useRef<HTMLImageElement>(null);
  
  const [isOpened, setIsOpened] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isGiftOpen, setIsGiftOpen] = useState(false);
  const [rsvpStatus, setRsvpStatus] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [wishName, setWishName] = useState('');
  const [wishMessage, setWishMessage] = useState('');
  const [wishes, setWishes] = useState(projectData.wishes || []);

  const handleWishSubmit = () => {
    if (!wishName.trim() || !wishMessage.trim()) return;
    const newWish = {
      id: crypto.randomUUID(),
      name: wishName,
      message: wishMessage,
      attendance: (rsvpStatus as 'attend' | 'not_attend') || 'attend',
      createdAt: Date.now()
    };
    setWishes([newWish, ...wishes]);
    setWishName('');
    setWishMessage('');
  };

  useEffect(() => {
    if (!scrollContainerRef.current || !mainContentRef.current || !isOpened) return;

    const lenis = new Lenis({
      wrapper: scrollContainerRef.current,
      content: mainContentRef.current,
      duration: 1.6,
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    const ctx = gsap.context(() => {
      // Opening Reveal (Staggered)
      gsap.fromTo(".opening-reveal", 
        { y: 60, opacity: 0 }, 
        { y: 0, opacity: 1, stagger: 0.15, duration: 1.2, ease: "power3.out", delay: 0.5 }
      );

      // Looping floating animation for opening text
      if (projectData.loopAnimations) {
        gsap.to(".opening-reveal", {
          y: -10,
          duration: 3,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: 2 // Start after reveal
        });
      }

      // Quote Reveal (Scale Fade-in)
      gsap.fromTo(".quote-reveal", 
        { opacity: 0, scale: 0.9 }, 
        { 
          opacity: 1, 
          scale: 1, 
          duration: 1.5, 
          ease: "power2.out",
          scrollTrigger: { 
            trigger: "#quote", 
            start: "top 70%",
            scroller: scrollContainerRef.current,
            toggleActions: "play reverse play reverse"
          } 
        }
      );

      // Looping floating animation for quote
      if (projectData.loopAnimations) {
        gsap.to(".quote-reveal", {
          y: -15,
          duration: 4,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: 1.5
        });
      }

      // Split Parallax Backgrounds
      if (parallaxTopRef.current && parallaxBottomRef.current) {
        gsap.to(parallaxTopRef.current, {
          yPercent: 20,
          ease: "none",
          scrollTrigger: {
            trigger: "#couple-profile",
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            scroller: scrollContainerRef.current,
          }
        });
        gsap.to(parallaxBottomRef.current, {
          yPercent: -20,
          ease: "none",
          scrollTrigger: {
            trigger: "#couple-profile",
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            scroller: scrollContainerRef.current,
          }
        });
      }

      // Groom & Bride Horizontal Slide-in
      gsap.fromTo(".groom-card",
        { x: -100, opacity: 0 },
        { x: 0, opacity: 1, duration: 1.2, ease: "power3.out", scrollTrigger: { trigger: ".groom-card", start: "top 85%", scroller: scrollContainerRef.current, toggleActions: "play reverse play reverse" } }
      );
      gsap.fromTo(".bride-card",
        { x: 100, opacity: 0 },
        { x: 0, opacity: 1, duration: 1.2, ease: "power3.out", scrollTrigger: { trigger: ".bride-card", start: "top 85%", scroller: scrollContainerRef.current, toggleActions: "play reverse play reverse" } }
      );

      // Reveal Groups (Slide-up with Opacity)
      gsap.utils.toArray<HTMLElement>('.reveal-group').forEach(elem => {
        gsap.fromTo(elem, 
          { y: 50, opacity: 0 }, 
          { 
            y: 0, opacity: 1, duration: 1.2, ease: "power3.out",
            scrollTrigger: { 
              trigger: elem, 
              start: "top 85%",
              scroller: scrollContainerRef.current,
              toggleActions: "play reverse play reverse"
            } 
          }
        );

        // Looping floating animation
        if (projectData.loopAnimations) {
          gsap.to(elem, {
            y: -8,
            duration: 3 + Math.random() * 2, // Randomize duration slightly
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            delay: 1.5
          });
        }
      });

      // Vertical Staircase Gallery
      const gPin = document.querySelector('.gallery-pin-container');
      const gWrapper = document.querySelector('.gallery-staircase-wrapper');
      const itemsCount = Math.min(5, projectData.preweddingAssets?.length || 0);
      
      if (gPin && gWrapper && itemsCount > 1) {
        const amount = (itemsCount - 1) * window.innerWidth * 0.8;
        
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: gPin,
            start: "top top",
            end: `+=${itemsCount * 100}%`,
            pin: true,
            scrub: 1,
            scroller: scrollContainerRef.current,
          }
        });

        // Horizontal movement
        tl.to(gWrapper, { x: -amount, ease: "none" }, 0);

        // Vertical Parallax for Staircase illusion
        gsap.utils.toArray<HTMLElement>('.gallery-staircase-item').forEach((item, i) => {
          const direction = i % 2 === 0 ? 1 : -1;
          const speed = 150 + (i * 30);
          tl.to(item, { y: direction * speed, ease: "none" }, 0);
        });
      }
      // Footer Fade-in
      gsap.fromTo(".footer-reveal",
        { opacity: 0 },
        { opacity: 1, duration: 1.5, ease: "power2.out", scrollTrigger: { trigger: ".footer-reveal", start: "top 90%", scroller: scrollContainerRef.current, toggleActions: "play reverse play reverse" } }
      );
    }, mainContentRef);

    return () => {
      lenis.destroy();
      ctx.revert();
    };
  }, [isOpened]);

  const activeMusicUrl = projectData.musicUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

  const handleOpen = () => {
    setIsOpened(true);
    if (activeMusicUrl && audioRef.current) {
      audioRef.current.play().catch(err => console.log("Audio autoplay prevented:", err));
      setIsMusicPlaying(true);
    }
  };

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsMusicPlaying(!isMusicPlaying);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const groomName = customer.groomNickname || customer.groomName.split(' ')[0];
  const brideName = customer.brideNickname || customer.brideName.split(' ')[0];

  const images = projectData.preweddingAssets?.filter(a => a.type === 'image') || [];
  const defaultImg = 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1000&auto=format&fit=crop';
  const getImg = (idx: number) => images.length > 0 ? images[idx % images.length].url : defaultImg;

  // 11 Photos Logic
  const coverImg = projectData.coverPhoto?.url || getImg(0);
  const openingImg = projectData.openingPhoto?.url || getImg(1);
  const quoteImg = projectData.quotePhoto?.url || getImg(2);
  const parallaxTopImg = projectData.parallaxTopPhoto?.url || getImg(3);
  const parallaxBottomImg = projectData.parallaxBottomPhoto?.url || getImg(4);
  const groomImg = projectData.groomPhoto?.url || getImg(5);
  const brideImg = projectData.bridePhoto?.url || getImg(6);
  const videoThumbImg = projectData.videoThumbnail?.url || getImg(7);
  const galleryPhotos = images.length >= 3 ? images.slice(0, 3) : [getImg(8), getImg(9), getImg(10)];
  
  const preweddingVideo = projectData.preweddingAssets?.find(a => a.type === 'video');

  const titleStyle = { fontSize: `${projectData.titleFontSize || 72}px` };
  const bodyStyle = { fontSize: `${projectData.bodyFontSize || 11}px` };
  const textShadowClass = "drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]";

  return (
    <div className="w-full h-full bg-black text-[#f5f0eb] font-montserrat font-extralight selection:bg-[#bfa67a] selection:text-white overflow-hidden relative">
      
      {activeMusicUrl && (
        <audio ref={audioRef} loop autoPlay={isMusicPlaying}>
          <source src={activeMusicUrl} type="audio/mpeg" />
        </audio>
      )}

      {/* Floating Music Control */}
      <AnimatePresence>
        {isOpened && activeMusicUrl && (
          <motion.button 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={toggleMusic}
            className="absolute bottom-8 right-8 z-[60] w-12 h-12 rounded-full flex items-center justify-center border border-[#bfa67a]/20 shadow-2xl bg-black/40 backdrop-blur-md"
          >
            <Music className={cn("w-5 h-5 text-[#bfa67a]", isMusicPlaying && "animate-spin-slow")} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Cover Screen */}
      <AnimatePresence>
        {!isOpened && (
          <motion.section 
            exit={{ yPercent: -100, transition: { duration: 1.4, ease: [0.22, 1, 0.36, 1] } }}
            className="absolute inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-black"
          >
            <div className="absolute inset-0 z-0">
              <img 
                src={coverImg} 
                className="w-full h-full object-cover brightness-[0.65] scale-105" 
                alt="Cover" 
                style={{
                  transform: `scale(${projectData.assetScale || 1.05}) translate(${projectData.assetOffsetX || 0}px, ${projectData.assetOffsetY || 0}px)`
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            </div>
            <div className={`relative z-10 text-center px-6 flex flex-col items-center justify-between h-full py-32 ${textShadowClass}`}>
              <div className="space-y-8 flex flex-col items-center">
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 1.2 }}>
                  <p className="uppercase tracking-[0.8em] text-[10px] font-medium text-[#bfa67a]">The Wedding Of</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1, duration: 1.4 }}>
                  <h1 className="font-serif leading-[1.1] text-white font-light italic" style={titleStyle}>
                    {groomName}<br/><span className="text-4xl not-italic text-[#bfa67a] font-serif">&</span><br/>{brideName}
                  </h1>
                </motion.div>
              </div>
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 1.2 }} className="space-y-10 flex flex-col items-center mb-10">
                <div className="text-center space-y-3">
                  <p className="uppercase tracking-[0.5em] text-[8px] text-white/80">Beloved Guest</p>
                  <h2 className="font-serif text-3xl text-[#bfa67a] italic font-light">Nama Tamu</h2>
                </div>
                <button 
                  onClick={handleOpen}
                  className="px-14 py-4 rounded-full border border-[#bfa67a]/50 text-[#bfa67a] font-bold tracking-[0.4em] text-[9px] uppercase shadow-2xl backdrop-blur-md bg-black/20 transition-all hover:bg-[#bfa67a] hover:text-black active:scale-95"
                >
                  Buka Undangan
                </button>
              </motion.div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Scroll Container */}
      <div ref={scrollContainerRef} className={cn("w-full h-full overflow-y-auto scrollbar-hide bg-black", !isOpened && "hidden")}>
        <main ref={mainContentRef} className="relative min-h-full">
          
          {/* Opening Section */}
          <section className="relative min-h-[80vh] flex items-center justify-center px-8 py-20 overflow-hidden">
            <div className="absolute inset-0 z-0">
              <img src={openingImg} className="w-full h-full object-cover brightness-[0.45]" alt="Opening BG" />
            </div>
            <div className={`relative z-10 w-full flex flex-col items-center justify-center ${textShadowClass}`}>
              <div className="text-center reveal-group">
                <EditableElement id="opening-subtitle" projectData={projectData} isPreview={isPreview} onElementClick={onElementClick} onElementMove={onElementMove} activeElementId={activeElementId}>
                  <h2 className="reveal-group flex flex-col items-center">
                    <span className="font-script text-6xl text-[#bfa67a] -mb-4">The Wedding Of</span>
                    <span className="font-serif text-[10px] text-white uppercase tracking-[0.8em] font-medium">Celebrating Love</span>
                  </h2>
                </EditableElement>
              </div>
              <div className="w-full max-w-[320px] h-[220px] relative flex flex-col justify-between">
                <EditableElement id="opening-groom" className="opening-reveal self-start text-left" projectData={projectData} isPreview={isPreview} onElementClick={onElementClick} onElementMove={onElementMove} activeElementId={activeElementId}>
                  <p className="font-serif text-white leading-none font-light italic" style={titleStyle}>{groomName}</p>
                </EditableElement>
                <EditableElement id="opening-ampersand" className="opening-reveal absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" projectData={projectData} isPreview={isPreview} onElementClick={onElementClick} onElementMove={onElementMove} activeElementId={activeElementId}>
                  <span className="font-serif text-6xl italic text-[#bfa67a] font-light">&</span>
                </EditableElement>
                <EditableElement id="opening-bride" className="opening-reveal self-end text-right" projectData={projectData} isPreview={isPreview} onElementClick={onElementClick} onElementMove={onElementMove} activeElementId={activeElementId}>
                  <p className="font-serif text-white leading-none font-light italic" style={titleStyle}>{brideName}</p>
                </EditableElement>
              </div>
              <div className="w-16 h-[0.5px] bg-[#bfa67a]/60 mx-auto opening-reveal mt-10 mb-6" />
              <EditableElement id="opening-footer" projectData={projectData} isPreview={isPreview} onElementClick={onElementClick} onElementMove={onElementMove} activeElementId={activeElementId}>
                <p className="text-[11px] text-white font-medium leading-relaxed opening-reveal text-center uppercase tracking-[0.4em]">Celebrating Love & New Beginnings</p>
              </EditableElement>
            </div>
          </section>

          {/* Quote Section */}
          <section id="quote" className="relative min-h-[80vh] flex items-center justify-center py-24 px-10 overflow-hidden">
            <div className="absolute inset-0 z-0">
              <img src={quoteImg} className="w-full h-full object-cover brightness-[0.4]" alt="Quote BG" />
            </div>
            <div className={`relative z-10 text-center quote-reveal max-w-sm mx-auto ${textShadowClass}`}>
              <EditableElement id="quote-icon" projectData={projectData} isPreview={isPreview} onElementClick={onElementClick} onElementMove={onElementMove} activeElementId={activeElementId}>
                <QuoteIcon className="w-10 h-10 mx-auto text-[#bfa67a] opacity-80 mb-12" />
              </EditableElement>
              <div className="space-y-10">
                <EditableElement id="quote-text" projectData={projectData} isPreview={isPreview} onElementClick={onElementClick} onElementMove={onElementMove} activeElementId={activeElementId}>
                  <div className="space-y-4">
                    <p className="font-serif leading-relaxed text-white italic font-light tracking-widest" style={{ fontSize: `${(projectData.bodyFontSize || 11) * 2.5}px` }}>
                      "{customer.quote || 'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu isteri-isteri dari jenismu sendiri...'}"
                    </p>
                  </div>
                </EditableElement>
                <div className="flex flex-col items-center gap-4">
                  <div className="w-10 h-[0.5px] bg-[#bfa67a]/80" />
                  <EditableElement id="quote-ref" projectData={projectData} isPreview={isPreview} onElementClick={onElementClick} onElementMove={onElementMove} activeElementId={activeElementId}>
                    <p className="text-[10px] uppercase tracking-[0.8em] text-[#bfa67a] font-bold font-montserrat">Ar-Rum: 21</p>
                  </EditableElement>
                </div>
              </div>
            </div>
          </section>

          {/* Couple Profile (Split Parallax) */}
          <section id="couple-profile" className="relative min-h-[150vh] flex flex-col">
            <div className="absolute inset-0 z-0 overflow-hidden flex flex-col">
              <div className="w-full h-1/2 relative overflow-hidden">
                <img ref={parallaxTopRef} src={parallaxTopImg} className="absolute top-[-20%] w-full h-[140%] object-cover brightness-[0.4]" alt="Parallax Top" />
              </div>
              <div className="w-full h-1/2 relative overflow-hidden">
                <img ref={parallaxBottomRef} src={parallaxBottomImg} className="absolute bottom-[-20%] w-full h-[140%] object-cover brightness-[0.4]" alt="Parallax Bottom" />
              </div>
            </div>
            <div className={`relative z-10 w-full flex flex-col items-center justify-center min-h-screen gap-20 py-24 ${textShadowClass}`}>
              <div className="text-center reveal-group">
                <EditableElement id="couple-section-title" projectData={projectData} isPreview={isPreview} onElementClick={onElementClick} onElementMove={onElementMove} activeElementId={activeElementId}>
                  <h2 className="font-script text-6xl mb-2 text-[#bfa67a]">Groom & Bride</h2>
                </EditableElement>
                <div className="w-16 h-[0.5px] bg-[#bfa67a]/50 mx-auto mt-4" />
              </div>
              
              {/* Groom */}
              <div className="groom-card flex flex-col items-center text-center gap-8 p-6">
                <EditableElement id="groom-photo" projectData={projectData} isPreview={isPreview} onElementClick={onElementClick} onElementMove={onElementMove} activeElementId={activeElementId}>
                  <div className="w-48 h-48 rounded-full overflow-hidden border-2 border-[#bfa67a]/40 shadow-[0_0_30px_rgba(0,0,0,0.5)] relative">
                    <img src={groomImg} className="w-full h-full object-cover" alt="Groom" />
                  </div>
                </EditableElement>
                <div className="space-y-2 flex flex-col items-center">
                  {customer.groomInstagram ? (
                    <div className="flex flex-col items-center gap-4">
                      <a href={`https://instagram.com/${customer.groomInstagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="group flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <EditableElement id="groom-name" projectData={projectData} isPreview={isPreview} onElementClick={onElementClick} onElementMove={onElementMove} activeElementId={activeElementId}>
                          <h3 className="font-serif text-4xl text-white italic font-light tracking-wide group-hover:text-[#bfa67a] transition-colors">{customer.groomName}</h3>
                        </EditableElement>
                      </a>
                      <a 
                        href={`https://instagram.com/${customer.groomInstagram.replace('@', '')}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#bfa67a]/30 bg-black/20 backdrop-blur-sm text-[#bfa67a] text-[10px] font-bold uppercase tracking-widest hover:bg-[#bfa67a] hover:text-black transition-all"
                      >
                        <Instagram size={14} /> {customer.groomInstagram.startsWith('@') ? customer.groomInstagram : `@${customer.groomInstagram}`}
                      </a>
                    </div>
                  ) : (
                    <EditableElement id="groom-name" projectData={projectData} isPreview={isPreview} onElementClick={onElementClick} onElementMove={onElementMove} activeElementId={activeElementId}>
                      <h3 className="font-serif text-4xl text-white mb-2 italic font-light tracking-wide">{customer.groomName}</h3>
                    </EditableElement>
                  )}
                  <EditableElement id="groom-parents" projectData={projectData} isPreview={isPreview} onElementClick={onElementClick} onElementMove={onElementMove} activeElementId={activeElementId}>
                    <p className="uppercase tracking-[0.3em] font-medium leading-loose text-white/90 mt-2" style={{ fontSize: `${(projectData.bodyFontSize || 11) - 1}px` }}>
                      Putra dari {customer.groomParents}
                    </p>
                  </EditableElement>
                </div>
              </div>

              <EditableElement id="couple-ampersand" projectData={projectData} isPreview={isPreview} onElementClick={onElementClick} onElementMove={onElementMove} activeElementId={activeElementId}>
                <div className="flex justify-center text-[#bfa67a] font-serif text-6xl opacity-80 reveal-group italic font-light">&</div>
              </EditableElement>

              {/* Bride */}
              <div className="bride-card flex flex-col items-center text-center gap-8 p-6">
                <EditableElement id="bride-photo" projectData={projectData} isPreview={isPreview} onElementClick={onElementClick} onElementMove={onElementMove} activeElementId={activeElementId}>
                  <div className="w-48 h-48 rounded-full overflow-hidden border-2 border-[#bfa67a]/40 shadow-[0_0_30px_rgba(0,0,0,0.5)] relative">
                    <img src={brideImg} className="w-full h-full object-cover" alt="Bride" />
                  </div>
                </EditableElement>
                <div className="space-y-2 flex flex-col items-center">
                  {customer.brideInstagram ? (
                    <div className="flex flex-col items-center gap-4">
                      <a href={`https://instagram.com/${customer.brideInstagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="group flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <EditableElement id="bride-name" projectData={projectData} isPreview={isPreview} onElementClick={onElementClick} onElementMove={onElementMove} activeElementId={activeElementId}>
                          <h3 className="font-serif text-4xl text-white italic font-light tracking-wide group-hover:text-[#bfa67a] transition-colors">{customer.brideName}</h3>
                        </EditableElement>
                      </a>
                      <a 
                        href={`https://instagram.com/${customer.brideInstagram.replace('@', '')}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#bfa67a]/30 bg-black/20 backdrop-blur-sm text-[#bfa67a] text-[10px] font-bold uppercase tracking-widest hover:bg-[#bfa67a] hover:text-black transition-all"
                      >
                        <Instagram size={14} /> {customer.brideInstagram.startsWith('@') ? customer.brideInstagram : `@${customer.brideInstagram}`}
                      </a>
                    </div>
                  ) : (
                    <EditableElement id="bride-name" projectData={projectData} isPreview={isPreview} onElementClick={onElementClick} onElementMove={onElementMove} activeElementId={activeElementId}>
                      <h3 className="font-serif text-4xl text-white mb-2 italic font-light tracking-wide">{customer.brideName}</h3>
                    </EditableElement>
                  )}
                  <EditableElement id="bride-parents" projectData={projectData} isPreview={isPreview} onElementClick={onElementClick} onElementMove={onElementMove} activeElementId={activeElementId}>
                    <p className="uppercase tracking-[0.3em] font-medium leading-loose text-white/90 mt-2" style={{ fontSize: `${(projectData.bodyFontSize || 11) - 1}px` }}>
                      Putri dari {customer.brideParents}
                    </p>
                  </EditableElement>
                </div>
              </div>

              {/* Journey of Love */}
              {customer.journeyOfLove && (
                <div className="w-full max-w-lg mx-auto px-6 text-center space-y-8 reveal-group mt-12">
                  <EditableElement id="journey-title" projectData={projectData} isPreview={isPreview} onElementClick={onElementClick} onElementMove={onElementMove} activeElementId={activeElementId}>
                    <h2 className="font-accent text-5xl text-[#bfa67a]">Journey of Love</h2>
                  </EditableElement>
                  <EditableElement id="journey-content" projectData={projectData} isPreview={isPreview} onElementClick={onElementClick} onElementMove={onElementMove} activeElementId={activeElementId}>
                    <p className="text-white/80 font-light leading-relaxed italic text-lg" style={bodyStyle}>
                      "{customer.journeyOfLove}"
                    </p>
                  </EditableElement>
                  <div className="w-12 h-[0.5px] bg-[#bfa67a]/30 mx-auto" />
                </div>
              )}
            </div>
          </section>

          {/* Event Details */}
          <section className="py-24 px-6 relative overflow-hidden">
            <div className="absolute inset-0 z-0">
              <img src={projectData.preweddingAssets?.[1]?.url || openingImg} className="w-full h-full object-cover brightness-[0.2]" alt="Event BG" />
            </div>
            <div className={`relative z-10 w-full text-center space-y-16 ${textShadowClass}`}>
              <EditableElement id="event-title" projectData={projectData} isPreview={isPreview} onElementClick={onElementClick} onElementMove={onElementMove} activeElementId={activeElementId}>
                <h2 className="reveal-group flex flex-col items-center">
                  <span className="font-script text-7xl text-[#bfa67a] -mb-6">Wedding</span>
                  <span className="font-serif text-3xl text-white uppercase tracking-[0.4em] font-light">Event</span>
                </h2>
              </EditableElement>
              <div className="space-y-20 max-w-sm mx-auto">
                {/* Akad */}
                <div className="reveal-group space-y-6">
                <EditableElement id="event-akad-title" projectData={projectData} isPreview={isPreview} onElementClick={onElementClick} onElementMove={onElementMove} activeElementId={activeElementId}>
                  <h3 className="reveal-group flex flex-col items-center">
                    <span className="font-accent text-5xl text-[#bfa67a] -mb-4">Akad Nikah</span>
                    <span className="font-serif text-sm text-white uppercase tracking-[0.3em] font-light">The Ceremony</span>
                  </h3>
                </EditableElement>
                  <div className="py-6 border-y border-white/10 w-full">
                    <EditableElement id="event-akad-date" projectData={projectData} isPreview={isPreview} onElementClick={onElementClick} onElementMove={onElementMove} activeElementId={activeElementId}>
                      <p className="font-medium text-white/90 uppercase tracking-[0.4em] mb-2" style={bodyStyle}>{customer.eventDate}</p>
                    </EditableElement>
                    <EditableElement id="event-akad-time" projectData={projectData} isPreview={isPreview} onElementClick={onElementClick} onElementMove={onElementMove} activeElementId={activeElementId}>
                      <p className="text-[#bfa67a] font-bold uppercase tracking-[0.5em]" style={{ fontSize: `${(projectData.bodyFontSize || 11) - 1}px` }}>Pukul {customer.matrimonyTime}</p>
                    </EditableElement>
                  </div>
                  <EditableElement id="event-akad-loc" projectData={projectData} isPreview={isPreview} onElementClick={onElementClick} onElementMove={onElementMove} activeElementId={activeElementId}>
                    <p className="font-extralight text-white/80 uppercase tracking-[0.3em] leading-relaxed" style={bodyStyle}>{customer.locationName}</p>
                  </EditableElement>
                </div>

                {/* Resepsi */}
                {customer.receptionTime && (
                  <div className="reveal-group space-y-6">
                    <EditableElement id="event-resepsi-title" projectData={projectData} isPreview={isPreview} onElementClick={onElementClick} onElementMove={onElementMove} activeElementId={activeElementId}>
                      <h3 className="reveal-group flex flex-col items-center">
                        <span className="font-accent text-5xl text-[#bfa67a] -mb-4">Resepsi</span>
                        <span className="font-serif text-sm text-white uppercase tracking-[0.3em] font-light">The Celebration</span>
                      </h3>
                    </EditableElement>
                    <div className="py-6 border-y border-white/10 w-full">
                      <EditableElement id="event-resepsi-date" projectData={projectData} isPreview={isPreview} onElementClick={onElementClick} onElementMove={onElementMove} activeElementId={activeElementId}>
                        <p className="font-medium text-white/90 uppercase tracking-[0.4em] mb-2" style={bodyStyle}>{customer.eventDate}</p>
                      </EditableElement>
                      <EditableElement id="event-resepsi-time" projectData={projectData} isPreview={isPreview} onElementClick={onElementClick} onElementMove={onElementMove} activeElementId={activeElementId}>
                        <p className="text-[#bfa67a] font-bold uppercase tracking-[0.5em]" style={{ fontSize: `${(projectData.bodyFontSize || 11) - 1}px` }}>Pukul {customer.receptionTime}</p>
                      </EditableElement>
                    </div>
                    <div className="space-y-8">
                      <EditableElement id="event-resepsi-loc" projectData={projectData} isPreview={isPreview} onElementClick={onElementClick} onElementMove={onElementMove} activeElementId={activeElementId}>
                        <p className="font-extralight text-white/90 uppercase tracking-[0.3em]" style={bodyStyle}>{customer.locationAddress}</p>
                      </EditableElement>
                      
                      {/* Clickable Google Maps */}
                      <div className="space-y-4">
                        <a 
                          href={customer.mapsUrl || `https://maps.google.com/?q=${encodeURIComponent(customer.locationAddress)}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="block w-full h-48 rounded-2xl overflow-hidden border border-white/10 opacity-90 hover:opacity-100 transition-opacity relative group"
                        >
                          <iframe 
                            src={`https://www.google.com/maps/embed/v1/place?key=${(import.meta as any).env.VITE_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(customer.locationAddress)}`}
                            width="100%" height="100%" style={{ border: 0, pointerEvents: 'none' }} allowFullScreen loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-full text-white text-xs font-bold tracking-widest uppercase flex items-center gap-2">
                              <MapPin size={14} /> Buka di Maps
                            </div>
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Countdown */}
            <div className="mt-24 w-full flex flex-col items-center reveal-group relative z-10">
              <Countdown targetDate={customer.eventDate} />
            </div>
          </section>

          {/* Gallery & Video */}
          <section className="relative pb-0 overflow-hidden border-t border-white/10">
            <div className="absolute inset-0 z-0">
              <img src={projectData.preweddingAssets?.[0]?.url || coverImg} className="w-full h-full object-cover brightness-[0.2]" alt="Gallery BG" />
            </div>
            
            <div className={`relative z-10 py-20 px-6 w-full text-center flex flex-col items-center ${textShadowClass}`}>
                <EditableElement id="gallery-title" projectData={projectData} isPreview={isPreview} onElementClick={onElementClick} onElementMove={onElementMove} activeElementId={activeElementId}>
                  <h2 className="reveal-group flex flex-col items-center">
                    <span className="font-script text-7xl text-[#bfa67a] -mb-6">Our Memory</span>
                    <span className="font-serif text-2xl text-white uppercase tracking-[0.4em] font-light">The Gallery</span>
                  </h2>
                </EditableElement>
              <EditableElement id="gallery-subtitle" projectData={projectData} isPreview={isPreview} onElementClick={onElementClick} onElementMove={onElementMove} activeElementId={activeElementId}>
                <p className="text-[11px] text-white/80 uppercase tracking-[0.5em] mb-16 reveal-group font-medium">Captured Memories</p>
              </EditableElement>
              
              {/* Clickable Video Thumbnail */}
              <EditableElement id="gallery-video-thumb" projectData={projectData} isPreview={isPreview} onElementClick={onElementClick} onElementMove={onElementMove} activeElementId={activeElementId}>
                <div 
                  onClick={() => setShowVideo(true)}
                  className="relative w-full max-w-sm mx-auto aspect-[4/5] rounded-[20px] overflow-hidden cursor-pointer group border border-white/10 reveal-group shadow-2xl"
                >
                  <img src={videoThumbImg} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="Video cover" />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-700" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full border border-[#bfa67a]/80 bg-black/40 backdrop-blur-md flex items-center justify-center text-[#bfa67a] group-hover:bg-[#bfa67a] group-hover:text-black transition-all duration-500">
                      <Play size={36} fill="currentColor" className="ml-1" />
                    </div>
                  </div>
                </div>
              </EditableElement>
            </div>

            {/* Vertical Staircase Gallery */}
            <div className="gallery-pin-container relative z-10 h-screen w-full overflow-hidden mt-10">
              <div className="gallery-staircase-wrapper absolute top-0 left-0 h-full flex items-center px-[10vw]">
                {galleryPhotos.slice(0, 5).map((photo, idx) => (
                  <div 
                    key={idx}
                    className="gallery-staircase-item shrink-0 w-[280px] aspect-[9/16] border border-white/10 shadow-2xl mx-[10vw] relative"
                  >
                    <img src={photo.url || photo} className="w-full h-full object-cover" alt={`Gallery ${idx}`} />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Video Modal */}
          <AnimatePresence>
            {showVideo && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[115] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-6"
              >
                <button onClick={() => setShowVideo(false)} className="absolute top-10 right-8 text-white/50 hover:text-white transition-colors">
                  <X size={32} />
                </button>
                <div className="w-full max-w-4xl aspect-video rounded-[20px] overflow-hidden shadow-2xl border border-[#bfa67a]/20">
                  {preweddingVideo ? (
                    <video src={preweddingVideo.url} className="w-full h-full object-cover" controls autoPlay />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-white/50 font-serif italic">
                      Video belum tersedia
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* RSVP & Wishes */}
          <section className="relative pt-20 border-t border-white/10 pb-24 overflow-hidden">
            <div className="absolute inset-0 z-0">
              <img src={projectData.preweddingAssets?.[2]?.url || openingImg} className="w-full h-full object-cover brightness-[0.2]" alt="RSVP BG" />
            </div>
            <div className={`relative z-10 max-w-md mx-auto px-8 space-y-24 text-center ${textShadowClass}`}>
              {/* RSVP */}
              <div className="reveal-group">
                <EditableElement id="rsvp-title" projectData={projectData} isPreview={isPreview} onElementClick={onElementClick} onElementMove={onElementMove} activeElementId={activeElementId}>
                  <h2 className="font-serif text-6xl mb-10 text-[#bfa67a] font-light italic tracking-tight">RSVP</h2>
                </EditableElement>
                <div className="space-y-8">
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setRsvpStatus('attend')}
                      className={cn(
                        "flex-1 py-4 rounded-full border border-white/20 font-medium tracking-[0.4em] uppercase transition-all",
                        rsvpStatus === 'attend' ? "bg-[#bfa67a]/20 border-[#bfa67a] text-[#bfa67a]" : "text-white/60"
                      )}
                      style={{ fontSize: `${(projectData.bodyFontSize || 11) - 2}px` }}
                    >
                      HADIR
                    </button>
                    <button 
                      onClick={() => setRsvpStatus('not_attend')}
                      className={cn(
                        "flex-1 py-4 rounded-full border border-white/20 font-medium tracking-[0.4em] uppercase transition-all",
                        rsvpStatus === 'not_attend' ? "bg-red-900/40 border-red-500 text-red-400" : "text-white/60"
                      )}
                      style={{ fontSize: `${(projectData.bodyFontSize || 11) - 2}px` }}
                    >
                      MAAF
                    </button>
                  </div>
                  <button 
                    onClick={handleWishSubmit}
                    className="w-full bg-[#bfa67a] text-black font-bold rounded-full py-5 uppercase tracking-[0.6em] shadow-2xl hover:brightness-110 active:scale-[0.98] transition-all"
                    style={{ fontSize: `${(projectData.bodyFontSize || 11) - 3}px` }}
                  >
                    Submit Confirmation
                  </button>
                </div>
              </div>

              {/* Wishes */}
              <div className="reveal-group">
                <EditableElement id="wishes-title" projectData={projectData} isPreview={isPreview} onElementClick={onElementClick} onElementMove={onElementMove} activeElementId={activeElementId}>
                  <h2 className="font-serif text-6xl mb-10 text-[#bfa67a] font-light italic tracking-tight">Wishes</h2>
                </EditableElement>
                <div className="space-y-6 text-left">
                  <div className="space-y-4">
                    <input 
                      type="text" 
                      placeholder="Nama Anda" 
                      value={wishName}
                      onChange={(e) => setWishName(e.target.value)}
                      className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-6 py-4 text-white placeholder:text-white/50 focus:outline-none focus:border-[#bfa67a] transition-colors"
                      style={{ fontSize: `${(projectData.bodyFontSize || 11)}px` }}
                    />
                    <textarea 
                      placeholder="Berikan ucapan & doa restu..." 
                      value={wishMessage}
                      onChange={(e) => setWishMessage(e.target.value)}
                      className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-6 py-4 text-white placeholder:text-white/50 focus:outline-none focus:border-[#bfa67a] transition-colors min-h-[120px]"
                      style={{ fontSize: `${(projectData.bodyFontSize || 11)}px` }}
                    />
                  </div>
                  
                  <div className="max-h-[400px] overflow-y-auto space-y-4 pr-2 scrollbar-hide">
                    {wishes.map((wish) => (
                      <div key={wish.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-serif text-xl text-[#bfa67a] italic">{wish.name}</h4>
                          <span className="text-[9px] uppercase tracking-[0.2em] text-white/80 bg-white/10 px-3 py-1 rounded-full">
                            {wish.attendance === 'attend' ? 'Hadir' : 'Tidak Hadir'}
                          </span>
                        </div>
                        <p className="text-white/90 leading-relaxed font-extralight" style={{ fontSize: `${(projectData.bodyFontSize || 11)}px` }}>
                          {wish.message}
                        </p>
                      </div>
                    ))}
                    {wishes.length === 0 && (
                      <div className="text-center py-8 text-white/60 italic font-serif text-lg">
                        Belum ada ucapan. Jadilah yang pertama memberikan doa restu.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Wedding Gift */}
              <div className="reveal-group">
                <EditableElement id="gift-title" projectData={projectData} isPreview={isPreview} onElementClick={onElementClick} activeElementId={activeElementId}>
                  <h2 className="font-serif text-6xl mb-6 text-[#bfa67a] font-light italic">Wedding Gift</h2>
                </EditableElement>
                <button 
                  onClick={() => setIsGiftOpen(!isGiftOpen)}
                  className="w-full py-6 text-[#bfa67a] flex items-center justify-between px-4 border-b border-[#bfa67a]/30 transition-transform active:scale-95"
                >
                  <span className="font-medium uppercase tracking-[0.6em]" style={{ fontSize: `${(projectData.bodyFontSize || 11) - 2}px` }}>Kirim Hadiah</span>
                  <ChevronDown className={cn("w-4 h-4 transition-transform duration-700 opacity-80", isGiftOpen && "rotate-180")} />
                </button>
                <AnimatePresence>
                  {isGiftOpen && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="py-10 px-4 flex flex-col items-center">
                        {customer.bankAccounts?.map((bank, idx) => (
                          <div key={idx} className="mb-10 space-y-4 w-full">
                            <p className="uppercase tracking-[0.8em] text-white/80 font-medium" style={{ fontSize: `${(projectData.bodyFontSize || 11) - 1}px` }}>{bank.bankName}</p>
                            <p className="text-3xl tracking-[0.4em] text-white font-serif font-light">{bank.accountNumber}</p>
                            <p className="uppercase tracking-[0.6em] font-medium text-[#bfa67a]" style={{ fontSize: `${(projectData.bodyFontSize || 11) - 2}px` }}>a.n {bank.accountHolder}</p>
                            <button 
                              onClick={() => copyToClipboard(bank.accountNumber)}
                              className="mt-4 px-10 py-4 rounded-full border border-[#bfa67a]/50 text-[#bfa67a] font-bold uppercase tracking-[0.5em] active:scale-95 transition-all hover:bg-[#bfa67a]/20 flex items-center gap-2 mx-auto"
                              style={{ fontSize: `${(projectData.bodyFontSize || 11) - 3}px` }}
                            >
                              {copied ? <Check size={12} /> : <Copy size={12} />}
                              {copied ? 'Tersalin' : 'Salin Rekening'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="reveal-group pt-24 pb-16">
                <EditableElement id="thank-you-title" projectData={projectData} isPreview={isPreview} onElementClick={onElementClick} activeElementId={activeElementId}>
                  <h2 className="font-serif text-[6.5rem] text-[#bfa67a] leading-tight font-light italic tracking-tighter">Thank You</h2>
                </EditableElement>
                <EditableElement id="thank-you-names" projectData={projectData} isPreview={isPreview} onElementClick={onElementClick} activeElementId={activeElementId}>
                  <h3 className="font-serif text-[2.5rem] text-white/80 mt-6 font-light tracking-widest uppercase">{groomName} & {brideName}</h3>
                </EditableElement>
              </div>
            </div>

            {/* Footer Creator Info */}
            <div className="w-full py-8 text-center border-t border-white/10 bg-black flex flex-col items-center justify-center gap-4 relative z-10 footer-reveal">
              <img src={APP_LOGO} alt="Everafter Studio" className="w-12 h-auto opacity-80" referrerPolicy="no-referrer" />
              <p className="text-[8px] uppercase tracking-[0.5em] text-white/40">
                Digital Invitation by <span className="font-serif italic text-[#bfa67a] tracking-widest text-[10px] ml-1">Everafter Studio</span>
              </p>
              
              <div className="flex items-center justify-center gap-4">
                <a href="https://wa.me/6281234567890" target="_blank" rel="noreferrer" className="text-white/40 hover:text-[#bfa67a] transition-colors">
                  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                </a>
                <a href="https://instagram.com/everafterstudio" target="_blank" rel="noreferrer" className="text-white/40 hover:text-[#bfa67a] transition-colors">
                  <Instagram size={14} />
                </a>
                <a href="https://tiktok.com/@everafterstudio" target="_blank" rel="noreferrer" className="text-white/40 hover:text-[#bfa67a] transition-colors">
                  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path><path d="M15 8a4 4 0 1 0 0-8c0 2.5 2 4.5 4.5 4.5V9c-2.5 0-4.5-2-4.5-2z"></path></svg>
                </a>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
