import { Form } from "../schemas/forms";
import { getFormLabel } from "../utils";

export const useFormLabel = (form: Form) => {
  return getFormLabel(form);
}
