
import { KVList, KVItem } from '@/core/components/KeyValue';
import { Sanitizer } from '@/core/utils/sanitizer';
import { formKeyMappings } from '../mappings';

export const FertilizerApplicationsList = ({ applications }: { applications: any[] }) => {
  if (!applications || applications.length === 0) return null;

  return (
    <div className="space-y-4 mt-4">
      <h3 className="text-xs font-medium">Fertilizer Applications</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {applications.map((app, idx) => (
          <div key={idx} className="border rounded-lg p-4 space-y-2 bg-muted/5">
            <KVList className='gap-2.5' itemsPerColumn={2} containerClassName='gap-4'>
              {Object.entries(app).map(([key, value]) => (
                <KVItem
                  variant='stacked'
                  key={key}
                  pair={{
                    key: Sanitizer.key(key, formKeyMappings),
                    value: Sanitizer.value(value)
                  }}
                />
              ))}
            </KVList>
          </div>
        ))}
      </div>
    </div>
  );
};
