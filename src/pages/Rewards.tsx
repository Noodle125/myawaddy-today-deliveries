import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Gift, Star, Trophy, Code, Check, X } from 'lucide-react';

interface UserReward {
  id: string;
  reward_type: string;
  codes_collected: number;
  codes_required: number;
  is_redeemed: boolean;
  redeemed_at: string | null;
  created_at: string;
}

interface CashbackCode {
  id: string;
  code: string;
  type: string;
  is_used: boolean;
  used_at: string | null;
  used_by: string | null;
  created_at: string;
}

const Rewards = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userRewards, setUserRewards] = useState<UserReward[]>([]);
  const [availableCodes, setAvailableCodes] = useState<CashbackCode[]>([]);
  const [usedCodes, setUsedCodes] = useState<CashbackCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [codeInput, setCodeInput] = useState('');
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    if (user) {
      fetchRewardsData();
    }
  }, [user]);

  const fetchRewardsData = async () => {
    try {
      // Fetch user rewards
      const { data: rewardsData } = await supabase
        .from('user_rewards')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (rewardsData) {
        setUserRewards(rewardsData);
      }

      // Fetch available cashback codes
      const { data: availableCodesData } = await supabase
        .from('cashback_codes')
        .select('*')
        .eq('is_used', false)
        .order('created_at', { ascending: false });

      if (availableCodesData) {
        setAvailableCodes(availableCodesData);
      }

      // Fetch used codes by current user
      const { data: usedCodesData } = await supabase
        .from('cashback_codes')
        .select('*')
        .eq('used_by', user?.id)
        .order('used_at', { ascending: false });

      if (usedCodesData) {
        setUsedCodes(usedCodesData);
      }
    } catch (error) {
      console.error('Error fetching rewards data:', error);
    } finally {
      setLoading(false);
    }
  };

  const redeemCode = async () => {
    // Enhanced input validation and sanitization
    const sanitizedCode = codeInput?.trim().toUpperCase();
    
    if (!sanitizedCode || sanitizedCode.length === 0) {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid code.",
        variant: "destructive",
      });
      return;
    }

    // Basic format validation
    if (sanitizedCode.length < 3 || sanitizedCode.length > 50) {
      toast({
        title: "Invalid Code",
        description: "Invalid code format.",
        variant: "destructive",
      });
      return;
    }

    // Rate limiting check - prevent rapid redemption attempts
    const now = Date.now();
    const lastRedemption = localStorage.getItem('lastRedemptionAttempt');
    if (lastRedemption && now - parseInt(lastRedemption) < 3000) {
      toast({
        title: "Error",
        description: "Please wait before trying another code.",
        variant: "destructive",
      });
      return;
    }
    localStorage.setItem('lastRedemptionAttempt', now.toString());

    setRedeeming(true);
    try {
      // Check if code exists and is unused
      const { data: codeData, error: codeError } = await supabase
        .from('cashback_codes')
        .select('*')
        .eq('code', sanitizedCode)
        .eq('is_used', false)
        .maybeSingle();

      if (codeError) throw codeError;

      if (!codeData) {
        toast({
          title: "Invalid Code",
          description: "Code not found or already used.",
          variant: "destructive",
        });
        return;
      }

      // Mark code as used
      const { error: updateError } = await supabase
        .from('cashback_codes')
        .update({
          is_used: true,
          used_by: user?.id,
          used_at: new Date().toISOString(),
        })
        .eq('id', codeData.id);

      if (updateError) throw updateError;

      // Update or create user reward
      const existingReward = userRewards.find(r => r.reward_type === codeData.type);
      
      if (existingReward && !existingReward.is_redeemed) {
        const newCodesCollected = existingReward.codes_collected + 1;
        const isComplete = newCodesCollected >= existingReward.codes_required;

        const { error: rewardError } = await supabase
          .from('user_rewards')
          .update({
            codes_collected: newCodesCollected,
            is_redeemed: isComplete,
            redeemed_at: isComplete ? new Date().toISOString() : null,
          })
          .eq('id', existingReward.id);

        if (rewardError) throw rewardError;
      } else {
        // Create new reward if none exists for this type
        const { error: createError } = await supabase
          .from('user_rewards')
          .insert({
            user_id: user?.id,
            reward_type: codeData.type,
            codes_collected: 1,
            codes_required: 5, // Default requirement
          });

        if (createError) throw createError;
      }

      toast({
        title: "Code Redeemed!",
        description: `Successfully redeemed ${codeData.type} code.`,
      });

      setCodeInput('');
      fetchRewardsData();
    } catch (error) {
      console.error('Error redeeming code:', error);
      toast({
        title: "Redemption Failed",
        description: "Failed to redeem code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRedeeming(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-muted-foreground">Please log in to view your rewards.</p>
      </div>
    );
  }

  const activeRewards = userRewards.filter(r => !r.is_redeemed);
  const completedRewards = userRewards.filter(r => r.is_redeemed);

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Gift className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Rewards</h1>
      </div>

      <Tabs defaultValue="progress" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Progress
          </TabsTrigger>
          <TabsTrigger value="redeem" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Redeem Code
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Completed
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Rewards Progress</CardTitle>
            </CardHeader>
            <CardContent>
              {activeRewards.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No active rewards. Start collecting codes!</p>
              ) : (
                <div className="space-y-6">
                  {activeRewards.map((reward) => {
                    const progress = (reward.codes_collected / reward.codes_required) * 100;
                    return (
                      <div key={reward.id} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{reward.reward_type}</h3>
                          <Badge variant="outline">
                            {reward.codes_collected}/{reward.codes_required}
                          </Badge>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <p className="text-sm text-muted-foreground">
                          {reward.codes_required - reward.codes_collected} more codes needed
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="redeem" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Redeem Cashback Code</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter your code here..."
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && redeemCode()}
                />
                <Button onClick={redeemCode} disabled={redeeming}>
                  {redeeming ? 'Redeeming...' : 'Redeem'}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Enter a valid cashback code to add progress to your rewards.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Available Codes ({availableCodes.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {availableCodes.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No codes available at the moment.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableCodes.slice(0, 6).map((code) => (
                    <div key={code.id} className="p-4 border rounded-lg text-center">
                      <Badge variant="secondary" className="mb-2">
                        {code.type}
                      </Badge>
                      <p className="font-mono text-sm">{code.code}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed Rewards</CardTitle>
            </CardHeader>
            <CardContent>
              {completedRewards.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No completed rewards yet.</p>
              ) : (
                <div className="space-y-4">
                  {completedRewards.map((reward) => (
                    <div key={reward.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Trophy className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{reward.reward_type}</p>
                          <p className="text-sm text-muted-foreground">
                            Completed on {new Date(reward.redeemed_at!).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge>
                        <Check className="h-3 w-3 mr-1" />
                        Complete
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Code Usage History</CardTitle>
            </CardHeader>
            <CardContent>
              {usedCodes.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No codes used yet.</p>
              ) : (
                <div className="space-y-4">
                  {usedCodes.map((code) => (
                    <div key={code.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-mono text-sm">{code.code}</p>
                        <p className="text-sm text-muted-foreground">
                          Used on {new Date(code.used_at!).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{code.type}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Rewards;