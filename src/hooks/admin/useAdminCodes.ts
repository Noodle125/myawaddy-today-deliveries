import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CashbackCode } from '@/types/admin';

export const useAdminCodes = () => {
  const [codes, setCodes] = useState<CashbackCode[]>([]);

  const fetchCodes = useCallback(async () => {
    try {
      const codesResult = await supabase
        .from('cashback_codes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (codesResult.error) throw codesResult.error;
      if (codesResult.data) {
        setCodes(codesResult.data);
      }
    } catch (error) {
      console.error('Error fetching admin codes:', error);
    }
  }, []);

  return { codes, fetchCodes };
};