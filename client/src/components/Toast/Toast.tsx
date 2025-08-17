import { Toast } from 'radix-ui';
import { useToast } from '@src/contexts/useToast';
import { CheckCircledIcon, ExclamationTriangleIcon, InfoCircledIcon } from '@radix-ui/react-icons';
import './toast.css';

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { toast, hideToast } = useToast();

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircledIcon />;
      case 'error':
        return <ExclamationTriangleIcon />;
      case 'info':
      default:
        return <InfoCircledIcon />;
    }
  };

  return (
    <Toast.Provider swipeDirection="right">
      {children}
      <Toast.Root
        className="ToastRoot"
        open={toast.open}
        onOpenChange={open => !open && hideToast()}
        duration={5000}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {getIcon()}
          <div>
            <Toast.Title className="ToastTitle">{toast.title}</Toast.Title>
            <Toast.Description className="ToastDescription">{toast.description}</Toast.Description>
          </div>
        </div>
      </Toast.Root>
      <Toast.Viewport className="ToastViewport" />
    </Toast.Provider>
  );
}
