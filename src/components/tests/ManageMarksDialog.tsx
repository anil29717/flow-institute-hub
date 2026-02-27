import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useTestStudents, useMarks, useUpsertMarks, useTests } from '@/hooks/useTestsData';
import { Loader2, Save } from 'lucide-react';

interface Props {
  testId: string | null;
  onClose: () => void;
}

export default function ManageMarksDialog({ testId, onClose }: Props) {
  const { data: tests } = useTests();
  const { data: testStudents, isLoading: loadingStudents } = useTestStudents(testId);
  const { data: existingMarks, isLoading: loadingMarks } = useMarks(testId);
  const upsertMarks = useUpsertMarks();

  const test = tests?.find((t: any) => t.id === testId);
  const subjects: string[] = test?.subject ? test.subject.split(', ').map((s: string) => s.trim()).filter(Boolean) : [];

  // key: `${student_id}__${subject}`
  const [marksMap, setMarksMap] = useState<Record<string, { obtained: string; total: string }>>({});

  useEffect(() => {
    if (!testStudents || !subjects.length) return;
    const map: Record<string, { obtained: string; total: string }> = {};
    testStudents.forEach((ts: any) => {
      subjects.forEach(sub => {
        const key = `${ts.student_id}__${sub}`;
        const existing = existingMarks?.find((m: any) => m.student_id === ts.student_id && m.subject === sub);
        map[key] = {
          obtained: existing?.marks_obtained?.toString() ?? '',
          total: existing?.total_marks?.toString() ?? '100',
        };
      });
    });
    setMarksMap(map);
  }, [testStudents, existingMarks, test?.subject]);

  const handleSave = () => {
    if (!testId || !testStudents) return;

    const entries: any[] = [];
    testStudents.forEach((ts: any) => {
      subjects.forEach(sub => {
        const key = `${ts.student_id}__${sub}`;
        const val = marksMap[key];
        if (val?.obtained !== '' && val?.obtained !== undefined) {
          entries.push({
            test_id: testId,
            student_id: ts.student_id,
            batch_id: ts.batch_id,
            subject: sub,
            marks_obtained: Number(val.obtained),
            total_marks: Number(val.total || 100),
          });
        }
      });
    });

    if (entries.length) upsertMarks.mutate(entries);
  };

  const isLoading = loadingStudents || loadingMarks;

  return (
    <Dialog open={!!testId} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Marks{test ? ` — ${test.name}` : ''}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : !testStudents?.length ? (
          <p className="text-center text-muted-foreground py-8">No students assigned to this test</p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Marks Obtained</TableHead>
                  <TableHead>Total Marks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testStudents.map((ts: any) =>
                  subjects.map((sub, si) => {
                    const key = `${ts.student_id}__${sub}`;
                    return (
                      <TableRow key={key}>
                        {si === 0 ? (
                          <>
                            <TableCell rowSpan={subjects.length} className="font-medium align-top">
                              {ts.students?.first_name} {ts.students?.last_name}
                              <span className="text-xs text-muted-foreground ml-1">({ts.students?.student_id})</span>
                            </TableCell>
                            <TableCell rowSpan={subjects.length} className="align-top">
                              <Badge variant="secondary">{ts.batches?.name}</Badge>
                            </TableCell>
                          </>
                        ) : null}
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{sub}</Badge>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            className="w-24"
                            placeholder="—"
                            value={marksMap[key]?.obtained ?? ''}
                            onChange={e => setMarksMap(prev => ({
                              ...prev,
                              [key]: { ...prev[key], obtained: e.target.value },
                            }))}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            className="w-24"
                            value={marksMap[key]?.total ?? '100'}
                            onChange={e => setMarksMap(prev => ({
                              ...prev,
                              [key]: { ...prev[key], total: e.target.value },
                            }))}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>

            <Button onClick={handleSave} disabled={upsertMarks.isPending} className="w-full mt-4">
              {upsertMarks.isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving...</> : <><Save className="w-4 h-4 mr-2" />Save Marks</>}
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
