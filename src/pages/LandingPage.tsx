import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  GraduationCap, Users, IndianRupee, CalendarCheck, BarChart3, Shield,
  BookOpen, Clock, Bell, CheckCircle, ArrowRight, ChevronRight, Star, Zap
} from 'lucide-react';
import { SEO } from "@/components/seo/SEO";

const fadeUp = { hidden: { y: 30, opacity: 0 }, visible: { y: 0, opacity: 1 } };

const features = [
  { icon: Users, title: 'Student Management', desc: 'Enroll, track, and manage students across batches with detailed profiles and history.' },
  { icon: GraduationCap, title: 'Course & Batch Management', desc: 'Create courses, assign teachers, organize batches, and monitor progress in real-time.' },
  { icon: IndianRupee, title: 'Fee Tracking & Receipts', desc: 'Automated fee collection, payment tracking, receipt generation, and overdue alerts.' },
  { icon: CalendarCheck, title: 'Attendance System', desc: 'Digital attendance for students and teachers with daily reports and analytics.' },
  { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Rich dashboards with real-time insights into revenue, attendance, and performance.' },
  { icon: Bell, title: 'Smart Notifications', desc: 'Automated fee reminders, leave alerts, and plan expiry notifications.' },
];

const plans = [
  { name: 'Starter', price: '₹499', period: '/month', students: 10, teachers: 2, features: ['Student Management', 'Attendance', 'Fee Tracking', 'Basic Reports'] },
  { name: 'Growth', price: '₹999', period: '/month', students: 50, teachers: 5, features: ['Everything in Starter', 'Advanced Analytics', 'SMS Reminders', 'Priority Support'], popular: true },
  { name: 'Enterprise', price: '₹1,999', period: '/month', students: 200, teachers: 20, features: ['Everything in Growth', 'Multi-branch', 'Custom Reports', 'Dedicated Support'] },
];

const testimonials = [
  { name: 'Rajesh Kumar', role: 'Owner, Excel Coaching', text: 'InstiFlow transformed how we manage our coaching center. Fee tracking alone saved us 10+ hours per month.' },
  { name: 'Priya Sharma', role: 'Director, Bright Academy', text: 'The attendance and batch management features are incredibly intuitive. Our teachers love it.' },
  { name: 'Amit Patel', role: 'Founder, IQ Classes', text: 'Best investment for our institute. The dashboard gives us instant visibility into everything.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <SEO
        title="InstiFlow - #1 Institute Management Software | Educational ERP"
        description="Transform your institute with InstiFlow's comprehensive management system. Manage students, teachers, fees, attendance & academics with role-based access. Trusted by 500+ institutes. Book demo!"
      />
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">InstiFlow</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Testimonials</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Link to="/register"
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-6">
              <Zap className="w-3.5 h-3.5" /> Trusted by 500+ Institutes
            </span>
          </motion.div>
          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight mb-6">
            Manage Your Institute{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Effortlessly
            </span>
          </motion.h1>
          <motion.p initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            All-in-one platform for coaching centers and institutes to manage students, teachers, fees, attendance, and more — all from one dashboard.
          </motion.p>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-base hover:opacity-90 transition-opacity shadow-lg shadow-primary/20">
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#features"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-foreground font-semibold text-base hover:bg-muted transition-colors">
              See Features <ChevronRight className="w-4 h-4" />
            </a>
          </motion.div>

          {/* Stats row */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {[
              { value: '500+', label: 'Institutes' },
              { value: '25K+', label: 'Students' },
              { value: '2K+', label: 'Teachers' },
              { value: '99.9%', label: 'Uptime' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl sm:text-3xl font-display font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
              Everything You Need to Run Your Institute
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Powerful tools designed specifically for coaching centers and educational institutes.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div key={f.title} initial="hidden" whileInView="visible" viewport={{ once: true }}
                  variants={fadeUp} transition={{ delay: i * 0.08 }}
                  className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300 group">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-foreground mb-2">{f.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
              Get Started in 3 Simple Steps
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Register Your Institute', desc: 'Sign up and set up your institute profile with basic details in under 2 minutes.', icon: Shield },
              { step: '02', title: 'Add Teachers & Students', desc: 'Invite teachers and enroll students into courses and batches effortlessly.', icon: Users },
              { step: '03', title: 'Start Managing', desc: 'Track attendance, manage fees, generate reports — everything from your dashboard.', icon: BarChart3 },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div key={item.step} initial="hidden" whileInView="visible" viewport={{ once: true }}
                  variants={fadeUp} transition={{ delay: i * 0.15 }}
                  className="text-center relative">
                  <div className="w-16 h-16 rounded-2xl stat-gradient-2 mx-auto mb-5 flex items-center justify-center shadow-lg">
                    <Icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <span className="text-xs font-bold text-secondary tracking-widest uppercase">Step {item.step}</span>
                  <h3 className="font-display font-semibold text-lg text-foreground mt-2 mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-muted-foreground text-lg">No hidden fees. Start free, upgrade anytime.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div key={plan.name} initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} transition={{ delay: i * 0.1 }}
                className={`bg-card rounded-2xl border p-6 flex flex-col relative ${plan.popular ? 'border-primary shadow-xl shadow-primary/10 ring-1 ring-primary/20' : 'border-border'
                  }`}>
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                    Most Popular
                  </span>
                )}
                <h3 className="font-display font-bold text-xl text-foreground">{plan.name}</h3>
                <div className="mt-4 mb-2">
                  <span className="text-3xl font-display font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-5">
                  Up to {plan.students} students · {plan.teachers} teachers
                </p>
                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/login"
                  className={`w-full py-2.5 rounded-lg text-sm font-semibold text-center transition-all ${plan.popular
                      ? 'bg-primary text-primary-foreground hover:opacity-90'
                      : 'border border-border text-foreground hover:bg-muted'
                    }`}>
                  Get Started
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
              Loved by Institute Owners
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl border border-border p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-warning text-warning" />)}
                </div>
                <p className="text-foreground text-sm leading-relaxed mb-5">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-foreground text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          className="max-w-3xl mx-auto text-center stat-gradient-1 rounded-3xl p-10 sm:p-14 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="absolute rounded-full border border-primary-foreground/30"
                style={{ width: `${150 + i * 100}px`, height: `${150 + i * 100}px`, bottom: '-20%', right: '-10%', transform: `translate(${i * 10}px, ${i * 10}px)` }} />
            ))}
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-primary-foreground mb-4">
              Ready to Transform Your Institute?
            </h2>
            <p className="text-primary-foreground/70 text-lg mb-8 max-w-lg mx-auto">
              Join hundreds of institutes already using InstiFlow to streamline operations and grow faster.
            </p>
            <Link to="/login"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-accent text-accent-foreground font-semibold text-base hover:opacity-90 transition-opacity shadow-lg">
              Start Your Free Trial <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-foreground">InstiFlow</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Reviews</a>
            <Link to="/admin/login" className="hover:text-foreground transition-colors">Admin</Link>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 InstiFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
