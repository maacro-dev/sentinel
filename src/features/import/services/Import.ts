import { getSupabase } from '@/core/supabase';
import { Form } from '@/features/forms/schemas/forms';
import { ImportRow } from '../hooks/useImport';

export class Import {

  static async create(form: Form, data: ImportRow[]) {
    const supabase = await this._client;

    const { data: result, error } = await supabase.functions.invoke("import", {
      body: { form, data },
    });

    if (error) {
      throw error;
    }

    return result;
  }

  private static get _client() {
    return getSupabase();
  }

  private constructor() { }
}
