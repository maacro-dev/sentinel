// @ts-nocheck

import { useCallback } from 'react';
import { saveAs } from 'file-saver';

export const useExportCSV = (data: any[], filename: string) => {
  return useCallback(() => {
    if (!data.length) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, filename);
  }, [data, filename]);
};
