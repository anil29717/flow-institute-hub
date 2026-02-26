import { motion } from 'framer-motion';
import { mockCourses } from '@/data/mockData';
import { Plus, Users, Clock, IndianRupee } from 'lucide-react';

export default function CoursesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Courses</h1>
          <p className="text-muted-foreground">Manage course offerings</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Add Course
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {mockCourses.map((course, i) => (
          <motion.div
            key={course.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.08 }}
            className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-display font-semibold text-foreground">{course.name}</h3>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                course.isActive ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
              }`}>
                {course.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{course.description}</p>
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <p className="text-sm font-semibold text-foreground">{course.studentsEnrolled}</p>
                <p className="text-xs text-muted-foreground">Students</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <p className="text-sm font-semibold text-foreground">{course.durationWeeks}w</p>
                <p className="text-xs text-muted-foreground">Duration</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <IndianRupee className="w-3.5 h-3.5" />
                </div>
                <p className="text-sm font-semibold text-foreground">₹{(course.totalFee / 1000).toFixed(0)}k</p>
                <p className="text-xs text-muted-foreground">Fee</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
