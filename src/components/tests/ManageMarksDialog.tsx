import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useTestStudents, useMarks, useUpsertMarks } from '@/hooks/useTestsData';
import { Loader2, Save } from 'lucide-react';

interface Props {
  testId: string | null;
  onClose: () => void;
}

export default function ManageMarksDialog({ testId, onClose }: Props) {
  const { data: testStudents, isLoading: loadingStudents } = useTestStudents(testId);
  const { data: existingMarks, isLoading: loadingMarks } = useMarks(testId);
  const upsertMarks = useUpsertMarks();

  const [marksMap, setMarksMap] = useState<Record<string, { obtained: string; total: string }>>({});

  // Initialize marks from existing data
  useEffect(() => {
    if (!testStudents) return;
    const map: Record<string, { obtained: string; total: string }> = {};
    testStudents.forEach((ts: any) => {
      const existing = existingMarks?.find((m: any) => m.student_id === ts.student_id);
      map[ts.student_id] = {
        obtained: existing?.marks_obtained?.toString() ?? '',
        total: existing?.total_marks?.toString() ?? '100',
      };
    });
    setMarksMap(map);
  }, [testStudents, existingMarks]);

  const handleSave = () => {
    if (!testId || !testStudents) return;

    const entries = testStudents
      .filter((ts: any) => marksMap[ts.student_id]?.obtained !== '')
      .map((ts: any) => ({
        test_id: testId,
        student_id: ts.student_id,
        batch_id: ts.batch_id,
        marks_obtained: Number(marksMap[ts.student_id]?.obtained ?? 0),
        total_marks: Number(marksMap[ts.student_id]?.total ?? 100),
      }));

    if (entries.length) upsertMarks.mutate(entries);
  };

  const isLoading = loadingStudents || loadingMarks;

  return (
    <Dialog open={!!testId} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Marks</DialogTitle>
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
                  <TableHead>Marks Obtained</TableHead>
                  <TableHead>Total Marks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testStudents.map((ts: any) => (
                  <TableRow key={ts.student_id}>
                    <TableCell className="font-medium">
                      {ts.students?.first_name} {ts.students?.last_name}
                      <span className="text-xs text-muted-foreground ml-2">({ts.students?.student_id})</span>
                    </TableCell>
                    <TableCell><Badge variant="secondary">{ts.batches?.name}</Badge></TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        className="w-24"
                        placeholder="—"
                        value={marksMap[ts.student_id]?.obtained ?? ''}
                        onChange={e => setMarksMap(prev => ({
                          ...prev,
                          [ts.student_id]: { ...prev[ts.student_id], obtained: e.target.value },
                        }))}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        className="w-24"
                        value={marksMap[ts.student_id]?.total ?? '100'}
                        onChange={e => setMarksMap(prev => ({
                          ...prev,
                          [ts.student_id]: { ...prev[ts.student_id], total: e.target.value },
                        }))}
                      />
                    </TableCell>
                  </TableRow>
                ))}
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
