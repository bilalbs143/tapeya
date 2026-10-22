import { LoginFormBody } from '../ui/LoginFormBody';
import { useLoginForm } from '../ui/useLoginForm';

export default function LoginPage() {
  const flow = useLoginForm();
  return <LoginFormBody flow={flow} />;
}
