import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useBatches, useStudents } from '@/hooks/useSupabaseData';
import { useCreateTest } from '@/hooks/useTestsData';
import { Loader2, X, ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const SUBJECT_OPTIONS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English',
  'Hindi', 'Computer Science', 'Social Science', 'History',
  'Geography', 'Economics', 'Accountancy', 'Business Studies',
  'Political Science', 'Sanskrit', 'General Knowledge',
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateTestDialog({ open, onOpenChange }: Props) {
  const { user } = useAuth();
  const { data: batches } = useBatches();
  const { data: students } = useStudents();
  const createTest = useCreateTest();

  const [name, setName] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [customSubject, setCustomSubject] = useState('');
  const [testDate, setTestDate] = useState('');
  const [testTime, setTestTime] = useState('');
  const [totalMarks, setTotalMarks] = useState('100');
  const [selectedBatches, setSelectedBatches] = useState<string[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [subjectPopoverOpen, setSubjectPopoverOpen] = useState(false);

  const filteredStudents = students?.filter((s: any) => selectedBatches.includes(s.batchId)) ?? [];

  useEffect(() => {
    setSelectedStudents(filteredStudents.map((s: any) => s._id));
  }, [selectedBatches.join(','), students]);

  const toggleSubject = (sub: string) => {
    setSelectedSubjects(prev => prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]);
  };

  const addCustomSubject = () => {
    const trimmed = customSubject.trim();
    if (trimmed && !selectedSubjects.includes(trimmed)) {
      setSelectedSubjects(prev => [...prev, trimmed]);
      setCustomSubject('');
    }
  };

  const removeSubject = (sub: string) => {
    setSelectedSubjects(prev => prev.filter(s => s !== sub));
  };

  const toggleBatch = (id: string) => {
    setSelectedBatches(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
  };

  const toggleStudent = (id: string) => {
    setSelectedStudents(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const selectAll = () => setSelectedStudents(filteredStudents.map((s: any) => s._id));
  const deselectAll = () => setSelectedStudents([]);

  const handleSubmit = () => {
    if (!name || !selectedSubjects.length || !testDate || !selectedBatches.length || !selectedStudents.length) return;

    createTest.mutate({
      name,
      subject: selectedSubjects.join(', '),
      testDate,
      testTime: testTime || undefined,
      totalMarks: parseInt(totalMarks),
      batchIds: selectedBatches,
      studentIds: selectedStudents,
    }, {
      onSuccess: () => {
        onOpenChange(false);
        setName(''); setSelectedSubjects([]); setTestDate(''); setTestTime('');
        setTotalMarks('100'); setSelectedBatches([]); setSelectedStudents([]);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Test</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Test Name *</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Mid-Term Exam" />
            </div>
            <div className="space-y-2">
              <Label>Subjects *</Label>
              <Popover open={subjectPopoverOpen} onOpenChange={setSubjectPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between font-normal h-auto min-h-10 py-2">
                    {selectedSubjects.length ? (
                      <div className="flex flex-wrap gap-1 flex-1 text-left">
                        {selectedSubjects.map(sub => (
                          <Badge key={sub} variant="secondary" className="text-xs gap-1">
                            {sub}
                            <X className="w-3 h-3 cursor-pointer" onClick={(e) => { e.stopPropagation(); removeSubject(sub); }} />
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Select subjects...</span>
                    )}
                    <ChevronDown className="w-4 h-4 ml-2 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-2" align="start">
                  <div className="max-h-48 overflow-y-auto space-y-0.5">
                    {SUBJECT_OPTIONS.map(sub => (
                      <label key={sub} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/50 cursor-pointer text-sm">
                        <Checkbox checked={selectedSubjects.includes(sub)} onCheckedChange={() => toggleSubject(sub)} />
                        {sub}
                      </label>
                    ))}
                  </div>
                  <div className="border-t border-border mt-2 pt-2 flex gap-2">
                    <Input
                      value={customSubject}
                      onChange={e => setCustomSubject(e.target.value)}
                      placeholder="Add custom..."
                      className="h-8 text-xs"
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomSubject(); } }}
                    />
                    <Button size="sm" variant="secondary" className="h-8 text-xs" onClick={addCustomSubject} disabled={!customSubject.trim()}>Add</Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input type="date" value={testDate} onChange={e => setTestDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Time</Label>
              <Input type="time" value={testTime} onChange={e => setTestTime(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Total Marks</Label>
              <Input type="number" value={totalMarks} onChange={e => setTotalMarks(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Select Batches *</Label>
            <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-muted/30">
              {batches?.map((b: any) => (
                <Badge key={b._id} variant={selectedBatches.includes(b._id) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => toggleBatch(b._id)}>
                  {b.name}
                </Badge>
              ))}
              {!batches?.length && <p className="text-sm text-muted-foreground">No batches available</p>}
            </div>
          </div>

          {selectedBatches.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Select Students ({selectedStudents.length}/{filteredStudents.length})</Label>
                <div className="space-x-2">
                  <Button type="button" variant="ghost" size="sm" onClick={selectAll}>Select All</Button>
                  <Button type="button" variant="ghost" size="sm" onClick={deselectAll}>Deselect All</Button>
                </div>
              </div>
              <div className="max-h-48 overflow-y-auto border rounded-lg p-2 space-y-1">
                {filteredStudents.map((s: any) => (
                  <label key={s._id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/50 cursor-pointer text-sm">
                    <Checkbox checked={selectedStudents.includes(s._id)} onCheckedChange={() => toggleStudent(s._id)} />
                    <span>{s.firstName} {s.lastName}</span>
                    <Badge variant="secondary" className="ml-auto text-xs">{s.batchId?.name}</Badge>
                  </label>
                ))}
                {!filteredStudents.length && <p className="text-sm text-muted-foreground text-center py-2">No students in selected batches</p>}
              </div>
            </div>
          )}

          <Button onClick={handleSubmit} disabled={createTest.isPending || !name || !selectedSubjects.length || !testDate || !selectedBatches.length || !selectedStudents.length} className="w-full">
            {createTest.isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Creating...</> : 'Create Test'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

