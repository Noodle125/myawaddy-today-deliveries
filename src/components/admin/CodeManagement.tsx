import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface CashbackCode {
  id: string;
  code: string;
  type: string;
  is_used: boolean;
  created_at: string;
}

interface CodeManagementProps {
  codes: CashbackCode[];
  onGenerateCodes: (type: string, count: number) => void;
}

export const CodeManagement = ({ codes, onGenerateCodes }: CodeManagementProps) => {
  const [newCodeType, setNewCodeType] = useState('');
  const [newCodeCount, setNewCodeCount] = useState(1);

  const handleGenerateCodes = () => {
    onGenerateCodes(newCodeType, newCodeCount);
    setNewCodeType('');
    setNewCodeCount(1);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Generate Cashback Codes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Code Type</Label>
              <Input
                placeholder="e.g., CASHBACK, REWARD"
                value={newCodeType}
                onChange={(e) => setNewCodeType(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Count</Label>
              <Input
                type="number"
                min="1"
                max="100"
                value={newCodeCount}
                onChange={(e) => setNewCodeCount(parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button onClick={handleGenerateCodes} className="w-full">
                Generate Codes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Codes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {codes.map((code) => (
              <div key={code.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={code.is_used ? "secondary" : "default"}>
                    {code.type}
                  </Badge>
                  {code.is_used && <Badge variant="outline">Used</Badge>}
                </div>
                <p className="font-mono text-sm">{code.code}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(code.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};