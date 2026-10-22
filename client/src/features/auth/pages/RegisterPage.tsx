import { RegisterFormBody } from '../ui/RegisterFormBody';
import { useRegisterForm } from '../ui/useRegisterForm';

export default function RegisterPage() {
  const flow = useRegisterForm();
  return <RegisterFormBody flow={flow} />;
}
