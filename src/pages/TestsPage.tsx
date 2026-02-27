import { useState } from 'react';
import { useTests, useDeleteTest } from '@/hooks/useTestsData';
import { useBatches } from '@/hooks/useSupabaseData';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, ClipboardEdit, Loader2 } from 'lucide-react';
import CreateTestDialog from '@/components/tests/CreateTestDialog';
import ManageMarksDialog from '@/components/tests/ManageMarksDialog';
import { format } from 'date-fns';

export default function TestsPage() {
  const { user } = useAuth();
  const { data: tests, isLoading } = useTests();
  const deleteTest = useDeleteTest();
  const [createOpen, setCreateOpen] = useState(false);
  const [marksTestId, setMarksTestId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tests & Exams</h1>
          <p className="text-muted-foreground text-sm">Create tests and manage marks</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4 mr-2" />Create Test</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>All Tests</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : !tests?.length ? (
            <p className="text-center text-muted-foreground py-8">No tests created yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Batches</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tests.map((test: any) => (
                  <TableRow key={test.id}>
                    <TableCell className="font-medium">{test.name}</TableCell>
                    <TableCell>{test.subject}</TableCell>
                    <TableCell>{format(new Date(test.test_date), 'dd MMM yyyy')}{test.test_time ? ` • ${test.test_time.slice(0,5)}` : ''}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {test.test_batches?.map((tb: any) => (
                          <Badge key={tb.batch_id} variant="secondary" className="text-xs">{tb.batches?.name}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{test.test_students?.length ?? 0}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button size="sm" variant="outline" onClick={() => setMarksTestId(test.id)}>
                        <ClipboardEdit className="w-4 h-4 mr-1" />Marks
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteTest.mutate(test.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CreateTestDialog open={createOpen} onOpenChange={setCreateOpen} />
      <ManageMarksDialog testId={marksTestId} onClose={() => setMarksTestId(null)} />
    </div>
  );
}
