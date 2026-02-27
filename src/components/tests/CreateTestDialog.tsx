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
import { Loader2 } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateTestDialog({ open, onOpenChange }: Props) {
  const { user, session } = useAuth();
  const { data: batches } = useBatches();
  const { data: students } = useStudents();
  const createTest = useCreateTest();

  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [testDate, setTestDate] = useState('');
  const [testTime, setTestTime] = useState('');
  const [selectedBatches, setSelectedBatches] = useState<string[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  // Filter students by selected batches
  const filteredStudents = students?.filter((s: any) => selectedBatches.includes(s.batch_id)) ?? [];

  // When batches change, auto-select all students from those batches
  useEffect(() => {
    setSelectedStudents(filteredStudents.map((s: any) => s.id));
  }, [selectedBatches.join(','), students]);

  const toggleBatch = (id: string) => {
    setSelectedBatches(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
  };

  const toggleStudent = (id: string) => {
    setSelectedStudents(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const selectAll = () => setSelectedStudents(filteredStudents.map((s: any) => s.id));
  const deselectAll = () => setSelectedStudents([]);

  const handleSubmit = () => {
    if (!name || !subject || !testDate || !selectedBatches.length || !selectedStudents.length) return;

    const studentEntries = selectedStudents.map(sid => {
      const student = students?.find((s: any) => s.id === sid);
      return { student_id: sid, batch_id: student?.batch_id ?? selectedBatches[0] };
    });

    createTest.mutate({
      test: {
        name,
        subject,
        test_date: testDate,
        test_time: testTime || undefined,
        institute_id: user?.instituteId ?? undefined,
        created_by: session?.user?.id ?? '',
      },
      batchIds: selectedBatches,
      studentIds: studentEntries,
    }, {
      onSuccess: () => {
        onOpenChange(false);
        setName(''); setSubject(''); setTestDate(''); setTestTime('');
        setSelectedBatches([]); setSelectedStudents([]);
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
              <Label>Subject *</Label>
              <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Mathematics" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input type="date" value={testDate} onChange={e => setTestDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Time</Label>
              <Input type="time" value={testTime} onChange={e => setTestTime(e.target.value)} />
            </div>
          </div>

          {/* Batch selection */}
          <div className="space-y-2">
            <Label>Select Batches *</Label>
            <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-muted/30">
              {batches?.map((b: any) => (
                <Badge
                  key={b.id}
                  variant={selectedBatches.includes(b.id) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleBatch(b.id)}
                >
                  {b.name}
                </Badge>
              ))}
              {!batches?.length && <p className="text-sm text-muted-foreground">No batches available</p>}
            </div>
          </div>

          {/* Student selection */}
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
                  <label key={s.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/50 cursor-pointer text-sm">
                    <Checkbox
                      checked={selectedStudents.includes(s.id)}
                      onCheckedChange={() => toggleStudent(s.id)}
                    />
                    <span>{s.first_name} {s.last_name}</span>
                    <Badge variant="secondary" className="ml-auto text-xs">{s.batches?.name}</Badge>
                  </label>
                ))}
                {!filteredStudents.length && <p className="text-sm text-muted-foreground text-center py-2">No students in selected batches</p>}
              </div>
            </div>
          )}

          <Button onClick={handleSubmit} disabled={createTest.isPending || !name || !subject || !testDate || !selectedBatches.length || !selectedStudents.length} className="w-full">
            {createTest.isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Creating...</> : 'Create Test'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
