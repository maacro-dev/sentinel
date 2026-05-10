
import { useAvailableLocations } from '@/features/mfid/hooks/useAvailableLocations';
import { useLocationHierarchy } from '@/features/mfid/hooks/useLgu';
import { useCallback, useMemo } from 'react';

export function useComparativeLocation(effectiveSeasonId?: number | null) {

  const { location, setProvinces, setMunicipalities, setBarangays, resetLocation } = useLocationHierarchy();

  const { data: availableLocations, isLoading } = useAvailableLocations(effectiveSeasonId);

  const provinceOptions = useMemo(
    () =>
      availableLocations?.provinces.map(name => ({
        value: name,
        label: name,
      })) ?? [],
    [availableLocations]
  );

  const municipalityOptions = useMemo(() => {
    if (!availableLocations) return [];
    let filtered = availableLocations.municipalities;
    if (location.provinces.length > 0) {
      filtered = filtered.filter(m => location.provinces.includes(m.province));
    }
    return filtered.map(m => ({ value: m.name, label: m.name }));
  }, [availableLocations, location.provinces]);

  const barangayOptions = useMemo(() => {
    if (!availableLocations) return [];
    let filtered = availableLocations.barangays;
    if (location.municipalities.length > 0) {
      filtered = filtered.filter(b => location.municipalities.includes(b.municipality));
    }
    return filtered.map(b => ({ value: b.name, label: b.name }));
  }, [availableLocations, location.municipalities]);

  const handleProvinceSelect = useCallback((province: string) => {
    setProvinces([province]);
    setMunicipalities([]);
    setBarangays([]);
  }, []);

  const handleMunicipalitySelect = useCallback((municipality: string) => {
    setMunicipalities([municipality]);
    setBarangays([]);
  }, []);
  const handleLocationChange = useCallback(
    (key: keyof typeof location, value: string[]) => {
      if (key === 'provinces') setProvinces(value);
      else if (key === 'municipalities') setMunicipalities(value);
      else if (key === 'barangays') setBarangays(value);
    },
    []
  );

  const level = useMemo(() => {
    if (location.municipalities.length > 0) return 'barangay' as const;
    if (location.provinces.length > 0) return 'municipality' as const;
    return 'province' as const;
  }, [location]);

  return {
    location,
    resetLocation,
    isLoading,

    provinceOptions,
    municipalityOptions,
    barangayOptions,

    handleProvinceSelect,
    handleMunicipalitySelect,
    handleLocationChange,

    level,
  };
}
