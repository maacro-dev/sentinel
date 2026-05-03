
import { useAvailableLocations } from '@/features/mfid/hooks/useAvailableLocations';
import { useLocationHierarchy } from '@/features/mfid/hooks/useLgu';
import { useCallback, useMemo } from 'react';

export function useComparativeLocation(effectiveSeasonId?: number | null) {

  const { location, setProvince, setMunicipality, setBarangay, resetLocation } = useLocationHierarchy();

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

    if (location.province) {
      filtered = filtered.filter(m => m.province === location.province);
    }

    return filtered.map(m => ({ value: m.name, label: m.name }));
  }, [availableLocations, location.province]);

  const barangayOptions = useMemo(() => {
    if (!availableLocations) return [];
    let filtered = availableLocations.barangays;

    if (location.municipality) {
      filtered = filtered.filter(
        b => b.municipality === location.municipality
      );
    }

    return filtered.map(b => ({ value: b.name, label: b.name }));
  }, [availableLocations, location.municipality]);

  const handleProvinceSelect = useCallback((province: string) => {
    setProvince(province);
    setMunicipality('');
    setBarangay('');
  }, []);

  const handleMunicipalitySelect = useCallback((municipality: string) => {
    setMunicipality(municipality);
    setBarangay('');
  }, []);

  const handleLocationChange = useCallback(
    (key: keyof typeof location, value: string) => {
      if (key === 'province') setProvince(value);
      else if (key === 'municipality') setMunicipality(value);
      else if (key === 'barangay') setBarangay(value);
    },
    []
  );

  const level = useMemo(() => {
    if (location.municipality) return 'barangay' as const;
    if (location.province) return 'municipality' as const;
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
