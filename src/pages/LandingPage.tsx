import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  GraduationCap, Users, IndianRupee, CalendarCheck, BarChart3, Shield,
  BookOpen, Clock, Bell, CheckCircle, ArrowRight, ChevronRight, Star, Zap,
  Sparkles, Building2, Award, TrendingUp, Play, Menu, X
} from 'lucide-react';
import { SEO } from "@/components/seo/SEO";
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { Loader2 } from 'lucide-react';

/* ── Animation Variants ── */
const fadeUp = { hidden: { y: 40, opacity: 0 }, visible: { y: 0, opacity: 1 } };
const fadeIn = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
const scaleUp = { hidden: { scale: 0.8, opacity: 0 }, visible: { scale: 1, opacity: 1 } };
const slideLeft = { hidden: { x: 60, opacity: 0 }, visible: { x: 0, opacity: 1 } };
const slideRight = { hidden: { x: -60, opacity: 0 }, visible: { x: 0, opacity: 1 } };

/* ── Animated Counter Hook ── */
function useCounter(end: number, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!startOnView || !inView) return;
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, inView, startOnView]);

  return { count, ref };
}

/* ── Floating Particles ── */
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 6 + 2,
            height: Math.random() * 6 + 2,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `hsl(${Math.random() > 0.5 ? '175 60%' : '222 60%'} ${40 + Math.random() * 20}% / ${0.15 + Math.random() * 0.2})`,
          }}
          animate={{
            y: [0, -30 - Math.random() * 40, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 4 + Math.random() * 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 3,
          }}
        />
      ))}
    </div>
  );
}

/* ── Typing Text Effect ── */
function TypingText({ words, className }: { words: string[]; className?: string }) {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={wordIndex}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        transition={{ duration: 0.4 }}
        className={className}
      >
        {words[wordIndex]}
      </motion.span>
    </AnimatePresence>
  );
}

/* ── Data ── */
const features = [
  { icon: Users, title: 'Student Management', desc: 'Enroll, track, and manage students across batches with detailed profiles and history.', color: 'from-blue-500/10 to-blue-600/5' },
  { icon: GraduationCap, title: 'Course & Batch Management', desc: 'Create courses, assign teachers, organize batches, and monitor progress in real-time.', color: 'from-teal-500/10 to-teal-600/5' },
  { icon: IndianRupee, title: 'Fee Tracking & Receipts', desc: 'Automated fee collection, payment tracking, receipt generation, and overdue alerts.', color: 'from-amber-500/10 to-amber-600/5' },
  { icon: CalendarCheck, title: 'Attendance System', desc: 'Digital attendance for students and teachers with daily reports and analytics.', color: 'from-green-500/10 to-green-600/5' },
  { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Rich dashboards with real-time insights into revenue, attendance, and performance.', color: 'from-purple-500/10 to-purple-600/5' },
  { icon: Bell, title: 'Smart Notifications', desc: 'Automated fee reminders, leave alerts, and plan expiry notifications.', color: 'from-rose-500/10 to-rose-600/5' },
];

// Plans are now fetched dynamically

const testimonials = [
  { name: 'Rajesh Kumar', role: 'Owner, Excel Coaching', text: 'InstiFlow transformed how we manage our coaching center. Fee tracking alone saved us 10+ hours per month.', avatar: 'R' },
  { name: 'Priya Sharma', role: 'Director, Bright Academy', text: 'The attendance and batch management features are incredibly intuitive. Our teachers love it.', avatar: 'P' },
  { name: 'Amit Patel', role: 'Founder, IQ Classes', text: 'Best investment for our institute. The dashboard gives us instant visibility into everything.', avatar: 'A' },
];

const steps = [
  { step: '01', title: 'Register Your Institute', desc: 'Sign up and set up your institute profile with basic details in under 2 minutes.', icon: Shield },
  { step: '02', title: 'Add Teachers & Students', desc: 'Invite teachers and enroll students into courses and batches effortlessly.', icon: Users },
  { step: '03', title: 'Start Managing', desc: 'Track attendance, manage fees, generate reports — everything from your dashboard.', icon: BarChart3 },
];

const heroWords = ['Effortlessly', 'Smartly', 'Seamlessly', 'Powerfully'];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -80]);

  // Fetch plans
  const { data: plans = [], isLoading: loadingPlans } = useQuery({
    queryKey: ['public_plans'],
    queryFn: async () => {
      const data = await api.get('/plans?landing=true');
      return data;
    }
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0.3]);

  // Animated counters
  const counter1 = useCounter(500, 2000);
  const counter2 = useCounter(25000, 2500);
  const counter3 = useCounter(2000, 2000);

  // Auto-cycle features
  useEffect(() => {
    const timer = setInterval(() => setActiveFeature((p) => (p + 1) % features.length), 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <SEO
        title="InstiFlow - #1 Institute Management Software | Educational ERP"
        description="Transform your institute with InstiFlow's comprehensive management system. Manage students, teachers, fees, attendance & academics with role-based access. Trusted by 500+ institutes. Book demo!"
      />

      {/* ─── Navbar ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.1 }}
              className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20"
            >
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </motion.div>
            <span className="font-display font-bold text-xl text-foreground">InstiFlow</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            {['Features', 'How It Works', 'Pricing', 'Testimonials'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                className="relative hover:text-foreground transition-colors group">
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary rounded-full group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Link to="/register"
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-sm font-medium hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-0.5">
              Get Started Free
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-foreground">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl overflow-hidden">
              <div className="px-4 py-4 space-y-3">
                {['Features', 'How It Works', 'Pricing', 'Testimonials'].map((item) => (
                  <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm font-medium text-muted-foreground hover:text-foreground py-2">{item}</a>
                ))}
                <div className="pt-3 border-t border-border/40 flex gap-3">
                  <Link to="/login" className="flex-1 py-2.5 text-center rounded-lg border border-border text-sm font-medium">Sign In</Link>
                  <Link to="/register" className="flex-1 py-2.5 text-center rounded-lg bg-primary text-primary-foreground text-sm font-medium">Get Started</Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ─── Hero ─── */}
      <section ref={heroRef} className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 relative min-h-[90vh] flex items-center">
        <FloatingParticles />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[100px]" />
          <div className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-secondary/8 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accent/5 rounded-full blur-[80px]" />
        </div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="max-w-5xl mx-auto text-center relative z-10 w-full">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.6 }}>
            <motion.span
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-secondary/15 to-primary/10 text-secondary text-sm font-medium mb-6 border border-secondary/20 cursor-default"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Trusted by 500+ Institutes Across India</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.span>
          </motion.div>

          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-display font-bold text-foreground leading-[1.1] mb-6">
            Manage Your Institute{' '}
            <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent inline-block min-w-[200px]">
              <TypingText words={heroWords} />
            </span>
          </motion.h1>

          <motion.p initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            All-in-one platform for coaching centers and institutes to manage students, teachers, fees, attendance, and more — all from one powerful dashboard.
          </motion.p>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold text-base shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-shadow">
                Start Free Trial <ArrowRight className="w-4 h-4" />
              </motion.div>
            </Link>
            <a href="#features">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-border bg-card/60 backdrop-blur-sm text-foreground font-semibold text-base hover:bg-card hover:border-primary/30 transition-all">
                <Play className="w-4 h-4 text-primary" /> See How It Works
              </motion.div>
            </a>
          </motion.div>

          {/* Animated Stats */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {[
              { counter: counter1, suffix: '+', label: 'Institutes', icon: Building2 },
              { counter: counter2, suffix: '+', label: 'Students Managed', icon: Users },
              { counter: counter3, suffix: '+', label: 'Teachers', icon: GraduationCap },
              { counter: { count: 99, ref: useRef(null) }, suffix: '.9%', label: 'Uptime', icon: TrendingUp },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <motion.div key={stat.label} whileHover={{ y: -4, scale: 1.02 }}
                  className="text-center p-4 rounded-2xl bg-card/60 backdrop-blur-sm border border-border/50 hover:border-primary/20 hover:shadow-lg transition-all duration-300 cursor-default">
                  <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
                  <p className="text-2xl sm:text-3xl font-display font-bold text-foreground">
                    <span ref={stat.counter.ref}>
                      {stat.label === 'Students Managed' ? `${Math.floor(stat.counter.count / 1000)}K` : stat.counter.count}
                    </span>{stat.suffix}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </section>

      {/* ─── Interactive Features ─── */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="text-center mb-16">
            <span className="text-sm font-semibold text-secondary tracking-widest uppercase mb-3 block">Features</span>
            <h2 className="text-3xl sm:text-5xl font-display font-bold text-foreground mb-4">
              Everything You Need to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Run Your Institute</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Powerful tools designed specifically for coaching centers and educational institutes.
            </p>
          </motion.div>

          {/* Feature Tabs + Detail View */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            {/* Tab list */}
            <div className="lg:col-span-2 space-y-2">
              {features.map((f, i) => {
                const Icon = f.icon;
                const isActive = activeFeature === i;
                return (
                  <motion.button
                    key={f.title}
                    onClick={() => setActiveFeature(i)}
                    initial="hidden" whileInView="visible" viewport={{ once: true }}
                    variants={slideRight} transition={{ delay: i * 0.06 }}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-300 flex items-start gap-3 group ${isActive
                        ? 'bg-card border-primary/30 shadow-lg shadow-primary/5'
                        : 'bg-card/50 border-border/50 hover:bg-card hover:border-border hover:shadow-md'
                      }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary group-hover:bg-primary/20'
                      }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className={`font-semibold text-sm transition-colors ${isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>{f.title}</h3>
                      {isActive && (
                        <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                          className="text-xs text-muted-foreground mt-1 leading-relaxed">{f.desc}</motion.p>
                      )}
                    </div>
                    {isActive && (
                      <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 4 }}
                        className="absolute bottom-0 left-0 h-0.5 bg-primary rounded-full" />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Feature detail card */}
            <div className="lg:col-span-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature}
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.98 }}
                  transition={{ duration: 0.35 }}
                  className={`h-full min-h-[340px] rounded-2xl border border-border p-8 bg-gradient-to-br ${features[activeFeature].color} backdrop-blur-sm relative overflow-hidden`}
                >
                  <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
                  <div className="relative z-10">
                    {(() => {
                      const Icon = features[activeFeature].icon;
                      return (
                        <>
                          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                            <Icon className="w-8 h-8 text-primary" />
                          </div>
                          <h3 className="text-2xl font-display font-bold text-foreground mb-3">{features[activeFeature].title}</h3>
                          <p className="text-muted-foreground leading-relaxed mb-6">{features[activeFeature].desc}</p>
                          <div className="grid grid-cols-2 gap-3">
                            {['Real-time Updates', 'Role-based Access', 'Automated Reports', 'Mobile Friendly'].map((tag) => (
                              <div key={tag} className="flex items-center gap-2 text-sm text-foreground/80">
                                <CheckCircle className="w-4 h-4 text-secondary flex-shrink-0" />
                                {tag}
                              </div>
                            ))}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="text-center mb-16">
            <span className="text-sm font-semibold text-secondary tracking-widest uppercase mb-3 block">How It Works</span>
            <h2 className="text-3xl sm:text-5xl font-display font-bold text-foreground mb-4">
              Get Started in <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-accent">3 Simple Steps</span>
            </h2>
          </motion.div>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-[52px] left-[16.5%] right-[16.5%] h-0.5 bg-gradient-to-r from-primary/20 via-secondary/40 to-primary/20" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div key={item.step} initial="hidden" whileInView="visible" viewport={{ once: true }}
                    variants={fadeUp} transition={{ delay: i * 0.2 }}
                    className="text-center relative group">
                    <motion.div whileHover={{ y: -6, scale: 1.05 }} transition={{ type: 'spring', stiffness: 300 }}
                      className="cursor-default">
                      <div className="w-[104px] h-[104px] rounded-full stat-gradient-2 mx-auto mb-6 flex items-center justify-center shadow-xl group-hover:shadow-2xl group-hover:shadow-secondary/20 transition-shadow duration-300 relative">
                        <Icon className="w-8 h-8 text-primary-foreground" />
                        <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-card border-2 border-secondary flex items-center justify-center text-xs font-bold text-secondary shadow-md">
                          {item.step}
                        </div>
                      </div>
                      <h3 className="font-display font-bold text-lg text-foreground mt-2 mb-2">{item.title}</h3>
                      <p className="text-muted-foreground text-sm max-w-[240px] mx-auto">{item.desc}</p>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="text-center mb-16">
            <span className="text-sm font-semibold text-secondary tracking-widest uppercase mb-3 block">Pricing</span>
            <h2 className="text-3xl sm:text-5xl font-display font-bold text-foreground mb-4">
              Simple, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Transparent</span> Pricing
            </h2>
            <p className="text-muted-foreground text-lg">No hidden fees. Start free, upgrade anytime.</p>
          </motion.div>

          {loadingPlans ? (
            <div className="flex justify-center items-center h-48 w-full"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
          ) : (
            <div className={`grid grid-cols-1 md:grid-cols-${Math.min(plans.length, 3)} gap-6 max-w-5xl mx-auto`}>
              {plans.map((plan: any, i: number) => (
                <motion.div key={plan._id || plan.name} initial="hidden" whileInView="visible" viewport={{ once: true }}
                  variants={fadeUp} transition={{ delay: i * 0.12 }}>
                  <motion.div
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className={`bg-card rounded-2xl border p-6 flex flex-col relative h-full ${plan.popular
                        ? 'border-primary shadow-2xl shadow-primary/15 ring-1 ring-primary/20'
                        : 'border-border hover:border-primary/20 hover:shadow-xl'
                      } transition-all duration-300`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground text-xs font-semibold shadow-lg">
                        🔥 Most Popular
                      </span>
                    )}
                    <h3 className="font-display font-bold text-xl text-foreground">{plan.name}</h3>
                    <div className="mt-4 mb-2">
                      <span className="text-4xl font-display font-bold text-foreground">{plan.price === 0 ? 'Free' : `₹${plan.price}`}</span>
                      <span className="text-muted-foreground text-sm">/month</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-5">
                      Up to {plan.maxStudents} students · {plan.maxTeachers} teachers
                    </p>
                    <ul className="space-y-2.5 flex-1 mb-6">
                      {plan.features?.map((f: string) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                          <CheckCircle className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Link to="/register"
                      className={`w-full py-3 rounded-xl text-sm font-semibold text-center transition-all duration-300 block ${plan.popular
                        ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:shadow-lg hover:shadow-primary/20'
                        : 'border border-border text-foreground hover:bg-muted hover:border-primary/20'
                      }`}>
                    Get Started
                  </Link>
                </motion.div>
              </motion.div>
            ))}
          </div>
          )}
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="text-center mb-16">
            <span className="text-sm font-semibold text-secondary tracking-widest uppercase mb-3 block">Testimonials</span>
            <h2 className="text-3xl sm:text-5xl font-display font-bold text-foreground mb-4">
              Loved by <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-accent">Institute Owners</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} transition={{ delay: i * 0.12 }}>
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="bg-card rounded-2xl border border-border p-6 h-full hover:border-primary/20 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <motion.div key={j} initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }} transition={{ delay: i * 0.1 + j * 0.05 }}>
                        <Star className="w-4 h-4 fill-warning text-warning" />
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-foreground text-sm leading-relaxed mb-5 italic">"{t.text}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold text-sm">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleUp}
          className="max-w-4xl mx-auto text-center relative overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-secondary" />
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <motion.div key={i}
                animate={{ rotate: 360 }}
                transition={{ duration: 20 + i * 5, repeat: Infinity, ease: 'linear' }}
                className="absolute rounded-full border border-primary-foreground/10"
                style={{
                  width: `${200 + i * 120}px`, height: `${200 + i * 120}px`,
                  bottom: '-30%', right: '-15%',
                  transform: `translate(${i * 15}px, ${i * 15}px)`,
                }}
              />
            ))}
          </div>

          <div className="relative z-10 p-12 sm:p-16">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="w-16 h-16 rounded-2xl bg-primary-foreground/15 flex items-center justify-center mx-auto mb-6"
            >
              <Award className="w-8 h-8 text-primary-foreground" />
            </motion.div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-primary-foreground mb-4">
              Ready to Transform Your Institute?
            </h2>
            <p className="text-primary-foreground/75 text-lg mb-10 max-w-lg mx-auto">
              Join hundreds of institutes already using InstiFlow to streamline operations and grow faster.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-accent text-accent-foreground font-semibold text-base shadow-xl hover:shadow-2xl transition-shadow">
                  Start Your Free Trial <ArrowRight className="w-4 h-4" />
                </motion.div>
              </Link>
              <a href="#features">
                <motion.div whileHover={{ scale: 1.05 }}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-primary-foreground/30 text-primary-foreground font-semibold text-base hover:bg-primary-foreground/10 transition-colors">
                  Learn More
                </motion.div>
              </a>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-display font-bold text-xl text-foreground">InstiFlow</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                The #1 institute management platform in India. Streamline your operations and focus on what matters — education.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm mb-3">Product</h4>
              <div className="space-y-2">
                {['Features', 'Pricing', 'Testimonials'].map((item) => (
                  <a key={item} href={`#${item.toLowerCase()}`} className="block text-sm text-muted-foreground hover:text-foreground transition-colors">{item}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm mb-3">Account</h4>
              <div className="space-y-2">
                <Link to="/login" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Sign In</Link>
                <Link to="/register" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Register</Link>
                <Link to="/admin/login" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Admin</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">© 2026 InstiFlow by AimTech. All rights reserved.</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Privacy Policy</span>
              <span>·</span>
              <span>Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
